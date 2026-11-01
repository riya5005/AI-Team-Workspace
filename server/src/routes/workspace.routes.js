const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const { requireWorkspaceRole } = require("../middlewares/workspace.middleware");
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

const projectRoutes = require("./project.routes");
const taskRoutes = require("./task.routes");
const activityRoutes = require("./activity.routes");

const aiRoutes = require("./ai.routes");
// next to the other nested routes:
router.use("/:workspaceId/ai", aiRoutes);

// Every workspace route requires login
router.use(authMiddleware);

router.post("/", validate(createWorkspaceSchema), createWorkspace);
router.get("/", listMyWorkspaces);

router.get("/:workspaceId", requireWorkspaceRole(), getWorkspace);

router.post(
  "/:workspaceId/members",
  requireWorkspaceRole("owner", "admin"),
  validate(addMemberSchema),
  addMember
);
router.delete("/:workspaceId/members/:userId", requireWorkspaceRole("owner", "admin"), removeMember);
router.patch(
  "/:workspaceId/members/:userId",
  requireWorkspaceRole("owner"),
  validate(updateRoleSchema),
  updateMemberRole
);

// Nested resources
router.use("/:workspaceId/projects", projectRoutes);
router.use("/:workspaceId/tasks", taskRoutes);
router.use("/:workspaceId/activity", activityRoutes);

module.exports = router;