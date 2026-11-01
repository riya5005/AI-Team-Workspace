const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    title: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 2000, default: "" },
    status: { type: String, enum: ["todo", "in_progress", "done"], default: "todo" },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    dueDate: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// Indexes match the queries we actually run:
// board view = tasks of one project grouped by status
taskSchema.index({ workspace: 1, project: 1, status: 1 });
// "my tasks" = tasks assigned to one person in a workspace
taskSchema.index({ workspace: 1, assignee: 1, status: 1 });
// default sort order for lists
taskSchema.index({ workspace: 1, createdAt: -1 });

module.exports = mongoose.model("Task", taskSchema);