const mongoose = require("mongoose");
const Workspace = require("../models/workspace.model");
const ApiError = require("../utils/ApiError");

// Usage: requireWorkspaceRole("owner", "admin")
// With no arguments, any member is allowed.
function requireWorkspaceRole(...allowedRoles) {
  return async (req, res, next) => {
    const { workspaceId } = req.params;

    if (!mongoose.isValidObjectId(workspaceId)) {
      throw new ApiError(400, "Invalid workspace id");
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) throw new ApiError(404, "Workspace not found");

    // Is THIS user a member of THIS workspace? (the multi-tenant check)
    const member = workspace.members.find((m) => m.user.equals(req.user._id));
    if (!member) throw new ApiError(403, "You are not a member of this workspace");

    if (allowedRoles.length > 0 && !allowedRoles.includes(member.role)) {
      throw new ApiError(403, "You don't have permission to do this");
    }

    req.workspace = workspace; // controllers reuse it, no second DB query
    req.memberRole = member.role;
    next();
  };
}

module.exports = { requireWorkspaceRole };