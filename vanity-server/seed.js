require("dotenv").config();
const connectDB = require("./config/db");

const Flow = require("./models/Flow");
const Step = require("./models/Step");

const seedData = async () => {
  try {
    await connectDB();

    await Flow.deleteMany();
    await Step.deleteMany();

    // 🔹 Developer Flow
    const devFlow = await Flow.create({
      segment: "developer",
      activationGoal: "first_api_call",
    });

    await Step.insertMany([
      {
        flowId: devFlow._id,
        type: "info",
        title: "Welcome Developer! Learn about our API.",
        order: 1,
      },
      {
        flowId: devFlow._id,
        type: "action",
        title: "Generate your API key.",
        order: 2,
      },
      {
        flowId: devFlow._id,
        type: "action",
        title: "Make your first API call.",
        order: 3,
      },
    ]);

    // 🔹 Founder Flow
    const founderFlow = await Flow.create({
      segment: "founder",
      activationGoal: "create_first_project",
    });

    await Step.insertMany([
      {
        flowId: founderFlow._id,
        type: "info",
        title: "Welcome Founder! Let’s set up your workspace.",
        order: 1,
      },
      {
        flowId: founderFlow._id,
        type: "action",
        title: "Create your first project.",
        order: 2,
      },
      {
        flowId: founderFlow._id,
        type: "action",
        title: "Invite your first team member.",
        order: 3,
      },
    ]);

    // 🔹 Marketer Flow
    const marketerFlow = await Flow.create({
      segment: "marketer",
      activationGoal: "launch_first_campaign",
    });

    await Step.insertMany([
      {
        flowId: marketerFlow._id,
        type: "info",
        title: "Welcome Marketer! Explore campaign tools.",
        order: 1,
      },
      {
        flowId: marketerFlow._id,
        type: "action",
        title: "Create your first campaign.",
        order: 2,
      },
      {
        flowId: marketerFlow._id,
        type: "action",
        title: "Launch your campaign.",
        order: 3,
      },
    ]);

    console.log("Multiple flows seeded successfully 🚀");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedData();
