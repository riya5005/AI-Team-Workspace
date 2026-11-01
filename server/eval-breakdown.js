require("dotenv").config();
const { generateBreakdown } = require("./src/services/ai.service");

const goals = [
  "Launch a landing page", "Plan a college tech fest", "Build a login system",
  "Prepare for campus placements", "Migrate a database to MongoDB Atlas",
  "Organise a team offsite", "Write a research paper", "Release version 1.0 of a mobile app",
  "Set up CI/CD for a Node project", "Redesign the company website",
  "Onboard a new developer", "Create a marketing campaign",
  "Learn React in a month", "Fix performance issues in a web app",
  "Host a hackathon", "Prepare a product demo", "Write API documentation",
  "Add payments to an online store", "Plan a product launch event", "Clean up technical debt",
];

(async () => {
  let ok = 0;
  for (const goal of goals) {
    try {
      const subtasks = await generateBreakdown(goal);
      ok++;
      console.log(`OK   (${subtasks.length} tasks) ${goal}`);
    } catch (e) {
      console.log(`FAIL ${goal}: ${e.message}`);
    }
    await new Promise((r) => setTimeout(r, 1500)); // stay under free-tier limits
  }
  console.log(`\nValid structured output: ${ok}/${goals.length}`);
})();