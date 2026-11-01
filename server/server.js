// Load .env first, so process.env.NODE_ENV is available below
require("dotenv").config();

const dns = require("node:dns");

// Local only: fixes Atlas SRV lookup problems on some networks.
// Skipped in production, where the host's DNS works fine.
if (process.env.NODE_ENV !== "production") {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
}

// Use your real app from src/app.js. Do NOT call express() here.
const app = require("./src/app");
const connectDB = require("./src/db/db");

// Connect to the DB first, then start listening
async function startServer() {
  await connectDB();

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

startServer();