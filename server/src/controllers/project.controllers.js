const mongoose = require("mongoose");
const Project = require("../models/project.model");
const Task = require("../models/task.model");
const ApiError = require("../utils/ApiError");

// Find a project, but ONLY inside the workspace from the URL.
// Without the workspace filter, a user could read another workspace's project by id.
async function findProjectOrFail(workspaceId, projectId) {
  if (!mongoose.isValidObjectId(projectId)) throw new ApiError(400, "Invalid project id");
  const project = await Project.findOne({ _id: projectId, workspace: workspaceId });
  if (!project) throw new ApiError(404, "Project not found");
  return project;
}

async function createProject(req, res) {
  const project = await Project.create({
    workspace: req.workspace._id,
    name: req.body.name,
    description: req.body.description,
    createdBy: req.user._id,
  });
  res.status(201).json({ success: true, project });
}

async function listProjects(req, res) {
  const projects = await Project.find({ workspace: req.workspace._id }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, projects });
}

async function getProject(req, res) {
  const project = await findProjectOrFail(req.workspace._id, req.params.projectId);
  res.status(200).json({ success: true, project });
}

async function updateProject(req, res) {
  const project = await findProjectOrFail(req.workspace._id, req.params.projectId);
  if (req.body.name !== undefined) project.name = req.body.name;
  if (req.body.description !== undefined) project.description = req.body.description;
  await project.save();
  res.status(200).json({ success: true, project });
}

async function deleteProject(req, res) {
  const project = await findProjectOrFail(req.workspace._id, req.params.projectId);
  await Task.deleteMany({ project: project._id }); // don't leave orphan tasks
  await project.deleteOne();
  res.status(200).json({ success: true, message: "Project deleted" });
}

module.exports = {
  createProject,
  listProjects,
  getProject,
  updateProject,
  deleteProject,
  findProjectOrFail,
};