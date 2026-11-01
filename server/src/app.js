const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const healthRouter = require("./routes/health.routes");
const authRouter = require("./routes/auth.routes");
const workspaceRouter = require("./routes/workspace.routes");
const ApiError = require("./utils/ApiError");
const errorMiddleware = require("./middlewares/error.middleware");

// 1. Create the app FIRST
const app = express();

// 2. Only now can you call app.set / app.use
app.set("trust proxy", 1); // needed for secure cookies behind Render/Vercel

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/api/health", healthRouter);
app.use("/api/auth", authRouter);
app.use("/api/workspaces", workspaceRouter); // this line was missing

// 404 handler: after all routes
app.use((req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
});

// Error handler: always last
app.use(errorMiddleware);

module.exports = app;