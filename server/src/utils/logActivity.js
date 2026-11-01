const Activity = require("../models/activity.model");

// Logging must never break the real action, so errors are caught and printed.
async function logActivity({ workspace, actor, action, message, entityType, entityId }) {
  try {
    await Activity.create({ workspace, actor, action, message, entityType, entityId });
  } catch (err) {
    console.error("Failed to log activity:", err.message);
  }
}

module.exports = logActivity;