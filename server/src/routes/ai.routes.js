const express = require("express");
const rateLimit = require("express-rate-limit");
const { z } = require("zod");

const router = express.Router({ mergeParams: true });

const ApiError = require("../utils/ApiError");
const validate = require("../middlewares/validate.middleware");
const { requireWorkspaceRole } = require("../middlewares/workspace.middleware");
const { breakdown, summary } = require("../controllers/ai.controllers");

// Limit per logged-in user: AI calls cost money and time
const aiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 10,
  keyGenerator: (req) => String(req.user._id),
  handler: (req, res, next) =>
    next(new ApiError(429, "Too many AI requests. Please wait a few minutes.")),
});

const breakdownBody = z.object({
  goal: z.string().trim().min(3, "Goal is too short").max(200, "Goal is too long"),
});

router.post("/breakdown", requireWorkspaceRole(), aiLimiter, validate(breakdownBody), breakdown);
router.get("/summary", requireWorkspaceRole(), aiLimiter, summary);

module.exports = router;