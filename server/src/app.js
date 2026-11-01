const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const workspaceRouter = require("./routes/workspace.routes");

const healthRouter = require("./routes/health.routes");
const authRouter = require("./routes/auth.routes");
const ApiError = require("./utils/ApiError");
const errorMiddleware = require("./middlewares/error.middleware");
   app.set("trust proxy", 1); // lets Express see HTTPS behind Render/Vercel, needed for secure cookies

const app = express();

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

// 404 handler: after all routes
app.use((req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
});

// Error handler: always last
app.use(errorMiddleware);

module.exports = app;