const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true },
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    description: { type: String, trim: true, maxlength: 500, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// "list projects in this workspace" is the main query
projectSchema.index({ workspace: 1, createdAt: -1 });

module.exports = mongoose.model("Project", projectSchema);