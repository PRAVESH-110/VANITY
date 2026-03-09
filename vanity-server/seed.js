require("dotenv").config();
const connectDB = require("./config/db");

const Flow = require("./models/Flow");
const Step = require("./models/Step");

const seedData = async () => {
  try {
    await connectDB();

    await Flow.deleteMany();
    await Step.deleteMany();

    console.log("🌱 Seeding onboarding flows...");

    // ──────────────────────────────────────────
    // 🔹 Developer Flow
    // ──────────────────────────────────────────
    const devFlow = await Flow.create({
      segment: "developer",
      activationGoal: "first_api_call",
    });

    await Step.insertMany([
      {
        flowId: devFlow._id,
        type: "info",
        title: "Welcome, Developer! 👋",
        description:
          "You're about to set up your first project with VANITY. This quick onboarding will walk you through creating a project, generating your API key, and making your first successful API call.",
        order: 1,
      },
      {
        flowId: devFlow._id,
        type: "action",
        title: "Create Your First Project",
        description:
          "Give your project a name and connect your GitHub repository. VANITY will track deployments and help you monitor your codebase health.",
        order: 2,
      },
      {
        flowId: devFlow._id,
        type: "action",
        title: "Generate Your API Key",
        description:
          "Your API key lets you authenticate API calls from your app. Store it securely and never commit it to your repository.",
        order: 3,
      },
    ]);

    // ──────────────────────────────────────────
    // 🔹 Founder Flow
    // ──────────────────────────────────────────
    const founderFlow = await Flow.create({
      segment: "founder",
      activationGoal: "create_first_project",
    });

    await Step.insertMany([
      {
        flowId: founderFlow._id,
        type: "info",
        title: "Welcome, Founder! 🚀",
        description:
          "VANITY helps you ship faster and stay on top of your product's health. Let's set up your workspace step by step.",
        order: 1,
      },
      {
        flowId: founderFlow._id,
        type: "action",
        title: "Create Your First Project",
        description:
          "Create your product's project within VANITY. Link your GitHub repo so we can track your deployment pipeline end-to-end.",
        order: 2,
      },
      {
        flowId: founderFlow._id,
        type: "form",
        title: "Invite Your Team",
        description:
          "Great products are built by great teams. Invite your co-founders, developers, and other collaborators so everyone is aligned from day one.",
        order: 3,
      },
    ]);

    // ──────────────────────────────────────────
    // 🔹 Marketer Flow
    // ──────────────────────────────────────────
    const marketerFlow = await Flow.create({
      segment: "marketer",
      activationGoal: "launch_first_campaign",
    });

    await Step.insertMany([
      {
        flowId: marketerFlow._id,
        type: "info",
        title: "Welcome, Marketer! 🎯",
        description:
          "VANITY gives you visibility into your product's adoption. Track onboarding flows, campaign impact, and user activation in one place.",
        order: 1,
      },
      {
        flowId: marketerFlow._id,
        type: "action",
        title: "Create Your First Campaign",
        description:
          "Define a campaign to track a specific user activation goal — for example, getting 100 users to complete onboarding within their first week.",
        order: 2,
      },
      {
        flowId: marketerFlow._id,
        type: "action",
        title: "Launch Your Campaign",
        description:
          "Your campaign is ready! Launch it now and start tracking real-time activation metrics. You can always tweak and re-launch.",
        order: 3,
      },
    ]);

    console.log("✅ Flows seeded: developer, founder, marketer");
    console.log("✅ Steps seeded: 3 per flow (9 total)");
    console.log("🎉 Database seeding complete!");
    process.exit();
  } catch (error) {
    console.error("❌ Seed error:", error);
    process.exit(1);
  }
};

seedData();
