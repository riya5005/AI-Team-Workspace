const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const { requireWorkspaceRole } = require("../middlewares/workspace.middleware");

const projectRoutes = require("./project.routes");
const taskRoutes = require("./task.routes");


const {
  createWorkspaceSchema,
  addMemberSchema,
  updateRoleSchema,
} = require("../validators/workspace.validator");
const {
  createWorkspace,
  listMyWorkspaces,
  getWorkspace,
  addMember,
  updateMemberRole,
  removeMember,
} = require("../controllers/workspace.controllers");

// Every workspace route requires login
router.use(authMiddleware);

router.post("/", validate(createWorkspaceSchema), createWorkspace);
router.get("/", listMyWorkspaces);

// Any member can view
router.get("/:workspaceId", requireWorkspaceRole(), getWorkspace);

// Owner and admin can add or remove members
router.post(
  "/:workspaceId/members",
  requireWorkspaceRole("owner", "admin"),
  validate(addMemberSchema),
  addMember
);
router.delete("/:workspaceId/members/:userId", requireWorkspaceRole("owner", "admin"), removeMember);

// Only the owner can change roles
router.patch(
  "/:workspaceId/members/:userId",
  requireWorkspaceRole("owner"),
  validate(updateRoleSchema),
  updateMemberRole
);

router.use("/:workspaceId/projects", projectRoutes);
router.use("/:workspaceId/tasks", taskRoutes);

module.exports = router;