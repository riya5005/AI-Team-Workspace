// Keep: fixes Atlas SRV lookup problems on some networks
const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

// Load .env before requiring app/db, since they read process.env
require("dotenv").config();

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