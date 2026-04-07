const Project = require("../models/Project");
const crypto = require("crypto");
const axios = require("axios");

/* ===============================
   GITHUB HELPERS
================================= */
const ghHeaders = () => ({
  Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
  Accept: "application/vnd.github+json",
});

const parseRepoUrl = (repoUrl) => {
  const match = repoUrl.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)$/);
  if (!match) throw new Error("Invalid GitHub URL format");
  return { owner: match[1], repo: match[2] };
};

const gh = (owner, repo, path = "") =>
  axios.get(`https://api.github.com/repos/${owner}/${repo}${path}`, {
    headers: ghHeaders(),
  });

const validateGitHubRepo = async (repoUrl) => {
  const { owner, repo } = parseRepoUrl(repoUrl);
  try {
    await gh(owner, repo);
  } catch {
    throw new Error("GitHub repository not found");
  }
};

/* ===============================
   CREATE PROJECT
================================= */
exports.createProjectService = async (userId, data) => {
  const { name, repoUrl, environment } = data;

  const existing = await Project.findOne({ userId, repoUrl });
  if (existing) {
    throw new Error("Project with this repository already exists");
  }

  await validateGitHubRepo(repoUrl);

  const project = await Project.create({
    userId,
    name,
    repoUrl,
    environment,
    status: "created",
    deploymentLogs: [],
  });

  return project;
};

/* ===============================
   CHECK REAL DEPLOYMENT STATUS
   (Called on page load + after deploy)
================================= */
exports.checkDeploymentStatus = async (userId, projectId) => {
  const project = await Project.findOne({ _id: projectId, userId });
  if (!project) throw new Error("Project not found");

  const { owner, repo } = parseRepoUrl(project.repoUrl);
  const logs = [];
  let finalStatus = "created";
  let deployUrl = null;

  try {
    // ── 1. Repo info ──
    const repoRes = await gh(owner, repo);
    const repoData = repoRes.data;
    logs.push(
      `📦 Repository: ${repoData.full_name}`,
      `   ├─ Language: ${repoData.language || "Unknown"}`,
      `   ├─ Default branch: ${repoData.default_branch}`,
      `   └─ Last push: ${new Date(repoData.pushed_at).toLocaleString()}`
    );

    // ── 2. Check GitHub Deployments API (Vercel, Netlify, custom) ──
    logs.push(`\n🔍 Checking deployments...`);
    try {
      const deploymentsRes = await gh(owner, repo, "/deployments?per_page=5");
      const deployments = deploymentsRes.data;

      if (deployments.length > 0) {
        logs.push(`   Found ${deployments.length} deployment(s)`);

        // Check the latest deployment's status
        const latest = deployments[0];
        try {
          const statusRes = await gh(
            owner,
            repo,
            `/deployments/${latest.id}/statuses?per_page=1`
          );
          const statuses = statusRes.data;

          if (statuses.length > 0) {
            const latestStatus = statuses[0];
            const env = latest.environment || "unknown";
            logs.push(
              `   Latest deployment (${env}):`,
              `   ├─ Status: ${latestStatus.state}`,
              `   ├─ Created: ${new Date(latestStatus.created_at).toLocaleString()}`,
              `   └─ URL: ${latestStatus.target_url || latestStatus.environment_url || "N/A"}`
            );

            if (latestStatus.target_url || latestStatus.environment_url) {
              deployUrl = latestStatus.target_url || latestStatus.environment_url;
            }

            if (latestStatus.state === "success" || latestStatus.state === "active") {
              finalStatus = "deployed";
            } else if (latestStatus.state === "in_progress" || latestStatus.state === "queued" || latestStatus.state === "pending") {
              finalStatus = "deploying";
            } else if (latestStatus.state === "failure" || latestStatus.state === "error") {
              finalStatus = "failed";
            }
          }
        } catch {
          logs.push(`   ⚠️  Could not fetch deployment statuses`);
        }
      } else {
        logs.push(`   No deployments found via Deployments API`);
      }
    } catch {
      logs.push(`   No deployment data available`);
    }

    // ── 3. Check GitHub Pages ──
    if (finalStatus === "created") {
      logs.push(`\n🌐 Checking GitHub Pages...`);
      try {
        const pagesRes = await gh(owner, repo, "/pages");
        const pages = pagesRes.data;
        if (pages.status === "built") {
          finalStatus = "deployed";
          deployUrl = pages.html_url;
          logs.push(
            `   ✅ GitHub Pages is live!`,
            `   └─ URL: ${pages.html_url}`
          );
        } else if (pages.status === "building") {
          finalStatus = "building";
          logs.push(`   ⏳ GitHub Pages is building...`);
        } else {
          logs.push(`   ⚠️  GitHub Pages status: ${pages.status}`);
        }
      } catch {
        logs.push(`   GitHub Pages not enabled`);
      }
    }

    // ── 4. Check GitHub Actions (latest workflow run) ──
    logs.push(`\n⚙️  Checking CI/CD (GitHub Actions)...`);
    try {
      const actionsRes = await gh(owner, repo, "/actions/runs?per_page=3");
      const runs = actionsRes.data.workflow_runs;

      if (runs && runs.length > 0) {
        const latest = runs[0];
        logs.push(
          `   Latest workflow: "${latest.name}"`,
          `   ├─ Status: ${latest.status}`,
          `   ├─ Conclusion: ${latest.conclusion || "running"}`,
          `   └─ Triggered: ${new Date(latest.created_at).toLocaleString()}`
        );

        // If we still haven't found a deployment, check if actions deploy
        if (finalStatus === "created" && latest.conclusion === "success") {
          // Check if this workflow name suggests deployment
          const deployKeywords = ["deploy", "release", "publish", "cd"];
          const isDeployWorkflow = deployKeywords.some((k) =>
            latest.name.toLowerCase().includes(k)
          );
          if (isDeployWorkflow) {
            finalStatus = "deployed";
            logs.push(`   ✅ Deploy workflow completed successfully`);
          }
        }

        if (latest.conclusion === "failure") {
          logs.push(`   ❌ Latest CI run failed`);
          if (finalStatus === "created") finalStatus = "failed";
        }
      } else {
        logs.push(`   No GitHub Actions workflows found`);
      }
    } catch {
      logs.push(`   GitHub Actions not configured or not accessible`);
    }

    // ── 5. Latest commit info ──
    logs.push(`\n📋 Latest commit:`);
    try {
      const commitsRes = await gh(owner, repo, "/commits?per_page=1");
      const commit = commitsRes.data[0];
      logs.push(
        `   ${commit.sha.substring(0, 7)} — "${commit.commit.message.split("\n")[0]}"`,
        `   by ${commit.commit.author.name} on ${new Date(commit.commit.author.date).toLocaleString()}`
      );
    } catch {
      logs.push(`   Could not fetch commit data`);
    }

    // ── Summary ──
    if (finalStatus === "deployed") {
      logs.push(`\n✅ This project is deployed!`);
      if (deployUrl) logs.push(`🔗 Live URL: ${deployUrl}`);
    } else if (finalStatus === "failed") {
      logs.push(`\n❌ Deployment issues detected — check CI/CD logs on GitHub`);
    } else {
      logs.push(`\n📌 No active deployment detected`);
      logs.push(`💡 To deploy, set up GitHub Pages, Vercel, or GitHub Actions in your repo`);
    }

  } catch (err) {
    logs.push(`❌ Error checking repo: ${err.message}`);
    finalStatus = "failed";
  }

  // Save to DB
  project.status = finalStatus;
  project.deploymentLogs = logs;
  if (deployUrl) project.deployKey = deployUrl;
  await project.save();

  return project;
};

/* ===============================
   DEPLOY = RE-CHECK STATUS
   (Same as checkDeploymentStatus but via Socket.IO)
================================= */
exports.deployProjectService = async (userId, projectId, io) => {
  const project = await Project.findOne({ _id: projectId, userId });
  if (!project) throw new Error("Project not found");

  // Set building state while we check
  project.status = "building";
  project.deploymentLogs = ["🔄 Checking deployment status from GitHub..."];
  await project.save();
  io.to(projectId).emit("deploymentUpdate", project);

  // Run the real check
  const result = await exports.checkDeploymentStatus(userId, projectId);

  // Emit final state
  io.to(projectId).emit("deploymentUpdate", result);

  return { message: `Status: ${result.status}`, status: result.status };
};
