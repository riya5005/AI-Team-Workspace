const mongoose = require("mongoose");
const Workspace = require("../models/workspace.model");
const User = require("../models/user.model");
const ApiError = require("../utils/ApiError");
const logActivity = require("../utils/logActivity");

async function createWorkspace(req, res) {
  const workspace = await Workspace.create({
    name: req.body.name,
    owner: req.user._id,
    members: [{ user: req.user._id, role: "owner" }], // creator is the owner
  });

  res.status(201).json({ success: true, workspace });
}

async function listMyWorkspaces(req, res) {
  const workspaces = await Workspace.find({ "members.user": req.user._id }).sort({
    createdAt: -1,
  });

  const result = workspaces.map((w) => ({
    id: w._id,
    name: w.name,
    myRole: w.members.find((m) => m.user.equals(req.user._id)).role,
    memberCount: w.members.length,
    createdAt: w.createdAt,
  }));

  res.status(200).json({ success: true, workspaces: result });
}

async function getWorkspace(req, res) {
  // Replace member user ids with username + email (never the hash: it's select:false)
  await req.workspace.populate("members.user", "username email");

  res.status(200).json({
    success: true,
    workspace: {
      id: req.workspace._id,
      name: req.workspace.name,
      owner: req.workspace.owner,
      myRole: req.memberRole,
      members: req.workspace.members.map((m) => ({
        id: m.user._id,
        username: m.user.username,
        email: m.user.email,
        role: m.role,
      })),
    },
  });
}

async function addMember(req, res) {
  const { email, role } = req.body;

  // Only the owner can hand out the admin role
  if (role === "admin" && req.memberRole !== "owner") {
    throw new ApiError(403, "Only the owner can add admins");
  }

  const userToAdd = await User.findOne({ email });
  if (!userToAdd) throw new ApiError(404, "No user with that email. They must register first");

  const alreadyMember = req.workspace.members.some((m) => m.user.equals(userToAdd._id));
  if (alreadyMember) throw new ApiError(409, "User is already a member");

  req.workspace.members.push({ user: userToAdd._id, role });
  await req.workspace.save();

  await logActivity({
    workspace: req.workspace._id,
    actor: req.user._id,
    action: "member.added",
    message: `${req.user.username} added ${userToAdd.username} as ${role}`,
    entityType: "member",
    entityId: userToAdd._id,
  });

  res.status(201).json({ success: true, message: "Member added" });
}

async function updateMemberRole(req, res) {
  const { userId } = req.params;
  if (!mongoose.isValidObjectId(userId)) throw new ApiError(400, "Invalid user id");

  const target = req.workspace.members.find((m) => m.user.equals(userId));
  if (!target) throw new ApiError(404, "Member not found");
  if (target.role === "owner") throw new ApiError(400, "The owner's role cannot be changed");

  target.role = req.body.role;
  await req.workspace.save();

  const targetUser = await User.findById(userId);

  await logActivity({
    workspace: req.workspace._id,
    actor: req.user._id,
    action: "member.role_changed",
    message: `${req.user.username} changed ${targetUser ? targetUser.username : "a member"} to ${req.body.role}`,
    entityType: "member",
    entityId: userId,
  });

  res.status(200).json({ success: true, message: "Role updated" });
}

async function removeMember(req, res) {
  const { userId } = req.params;
  if (!mongoose.isValidObjectId(userId)) throw new ApiError(400, "Invalid user id");

  const target = req.workspace.members.find((m) => m.user.equals(userId));
  if (!target) throw new ApiError(404, "Member not found");
  if (target.role === "owner") throw new ApiError(400, "The owner cannot be removed");

  // Admins can remove plain members, but only the owner can remove an admin
  if (target.role === "admin" && req.memberRole !== "owner") {
    throw new ApiError(403, "Only the owner can remove admins");
  }

  req.workspace.members = req.workspace.members.filter((m) => !m.user.equals(userId));
  await req.workspace.save();

  const targetUser = await User.findById(userId);

  await logActivity({
    workspace: req.workspace._id,
    actor: req.user._id,
    action: "member.removed",
    message: `${req.user.username} removed ${targetUser ? targetUser.username : "a member"}`,
    entityType: "member",
    entityId: userId,
  });

  res.status(200).json({ success: true, message: "Member removed" });
}

module.exports = {
  createWorkspace,
  listMyWorkspaces,
  getWorkspace,
  addMember,
  updateMemberRole,
  removeMember,
};