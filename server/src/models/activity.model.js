const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    message: { type: String, required: true },
    entityType: { type: String, enum: ["task", "project", "member", "workspace"] },
    entityId: { type: mongoose.Schema.Types.ObjectId },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

activitySchema.index({ workspace: 1, createdAt: -1 });

module.exports = mongoose.model("Activity", activitySchema);