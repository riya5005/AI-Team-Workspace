const Task = require("../models/task.model");
const Activity = require("../models/activity.model");
const { generateBreakdown, generateSummary } = require("../services/ai.service");

async function breakdown(req, res) {
  const subtasks = await generateBreakdown(req.body.goal);
  res.status(200).json({ success: true, subtasks });
}

async function summary(req, res) {
  const [grouped, recent] = await Promise.all([
    Task.aggregate([
      { $match: { workspace: req.workspace._id } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    Activity.find({ workspace: req.workspace._id }).sort({ createdAt: -1 }).limit(30),
  ]);

  const counts = { todo: 0, in_progress: 0, done: 0 };
  grouped.forEach((g) => (counts[g._id] = g.count));

  const text = await generateSummary({
    counts,
    activities: recent.map((a) => a.message),
  });

  res.status(200).json({ success: true, summary: text, counts });
}

module.exports = { breakdown, summary };