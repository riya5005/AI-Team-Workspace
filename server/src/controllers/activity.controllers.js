const Activity = require("../models/activity.model");

async function listActivity(req, res) {
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);

  const activities = await Activity.find({ workspace: req.workspace._id })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("actor", "username");

  res.status(200).json({ success: true, activities });
}

module.exports = { listActivity };