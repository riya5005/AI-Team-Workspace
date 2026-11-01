const mongoose = require("mongoose");
const Task = require("../models/task.model");
const ApiError = require("../utils/ApiError");
const { findProjectOrFail } = require("./project.controllers");

const SORTABLE = ["createdAt", "updatedAt", "dueDate", "title"];

function assertAssigneeIsMember(workspace, assigneeId) {
  if (!assigneeId) return;
  const isMember = workspace.members.some((m) => m.user.equals(assigneeId));
  if (!isMember) throw new ApiError(400, "Assignee must be a member of this workspace");
}

async function findTaskOrFail(workspaceId, taskId) {
  if (!mongoose.isValidObjectId(taskId)) throw new ApiError(400, "Invalid task id");
  const task = await Task.findOne({ _id: taskId, workspace: workspaceId });
  if (!task) throw new ApiError(404, "Task not found");
  return task;
}

async function createTask(req, res) {
  // Project must exist AND belong to this workspace
  await findProjectOrFail(req.workspace._id, req.body.project);
  assertAssigneeIsMember(req.workspace, req.body.assignee);

  const task = await Task.create({
    ...req.body,
    workspace: req.workspace._id,
    createdBy: req.user._id,
  });
  res.status(201).json({ success: true, task });
}

async function listTasks(req, res) {
  const q = req.query;

  // Build the filter only from whitelisted fields, and only accept plain strings.
  // This stops query-injection like ?status[$ne]=x
  const filter = { workspace: req.workspace._id };

  if (typeof q.project === "string") {
    if (!mongoose.isValidObjectId(q.project)) throw new ApiError(400, "Invalid project id");
    filter.project = q.project;
  }
  if (typeof q.status === "string") {
    if (!["todo", "in_progress", "done"].includes(q.status)) throw new ApiError(400, "Invalid status");
    filter.status = q.status;
  }
  if (typeof q.priority === "string") {
    if (!["low", "medium", "high"].includes(q.priority)) throw new ApiError(400, "Invalid priority");
    filter.priority = q.priority;
  }
  if (typeof q.assignee === "string") {
    if (q.assignee === "me") filter.assignee = req.user._id;
    else if (mongoose.isValidObjectId(q.assignee)) filter.assignee = q.assignee;
    else throw new ApiError(400, "Invalid assignee id");
  }
  if (typeof q.search === "string" && q.search.trim()) {
    // Escape regex characters so user input can't break the pattern
    const safe = q.search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.title = { $regex: safe, $options: "i" };
  }

  // Pagination with sane limits
  const page = Math.max(parseInt(q.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(q.limit) || 20, 1), 100);

  // Sorting: ?sort=dueDate or ?sort=-dueDate (minus = descending)
  let sort = { createdAt: -1 };
  if (typeof q.sort === "string") {
    const desc = q.sort.startsWith("-");
    const field = desc ? q.sort.slice(1) : q.sort;
    if (!SORTABLE.includes(field)) throw new ApiError(400, `Sort must be one of: ${SORTABLE.join(", ")}`);
    sort = { [field]: desc ? -1 : 1 };
  }

  const [tasks, total] = await Promise.all([
    Task.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("assignee", "username email"),
    Task.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    tasks,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

async function getTask(req, res) {
  const task = await findTaskOrFail(req.workspace._id, req.params.taskId);
  await task.populate("assignee", "username email");
  res.status(200).json({ success: true, task });
}

async function updateTask(req, res) {
  const task = await findTaskOrFail(req.workspace._id, req.params.taskId);

  if (req.body.assignee !== undefined) assertAssigneeIsMember(req.workspace, req.body.assignee);

  // Only copy fields the validator allowed
  const fields = ["title", "description", "status", "priority", "assignee", "dueDate"];
  for (const f of fields) {
    if (req.body[f] !== undefined) task[f] = req.body[f];
  }
  await task.save();

  res.status(200).json({ success: true, task });
}

async function deleteTask(req, res) {
  const task = await findTaskOrFail(req.workspace._id, req.params.taskId);

  // Owner/admin can delete anything, a plain member only their own tasks
  const isManager = ["owner", "admin"].includes(req.memberRole);
  const isCreator = task.createdBy.equals(req.user._id);
  if (!isManager && !isCreator) throw new ApiError(403, "You can only delete tasks you created");

  await task.deleteOne();
  res.status(200).json({ success: true, message: "Task deleted" });
}

module.exports = { createTask, listTasks, getTask, updateTask, deleteTask };