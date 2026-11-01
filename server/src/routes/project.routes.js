const express = require("express");
// mergeParams lets this router see :workspaceId from the parent route
const router = express.Router({ mergeParams: true });

const validate = require("../middlewares/validate.middleware");
const { requireWorkspaceRole } = require("../middlewares/workspace.middleware");
const { createProjectSchema, updateProjectSchema } = require("../validators/project.validator");
const {
  createProject,
  listProjects,
  getProject,
  updateProject,
  deleteProject,
} = require("../controllers/project.controllers");

// Any member can view and create. Only owner/admin can rename or delete.
router.get("/", requireWorkspaceRole(), listProjects);
router.post("/", requireWorkspaceRole(), validate(createProjectSchema), createProject);
router.get("/:projectId", requireWorkspaceRole(), getProject);
router.patch(
  "/:projectId",
  requireWorkspaceRole("owner", "admin"),
  validate(updateProjectSchema),
  updateProject
);
router.delete("/:projectId", requireWorkspaceRole("owner", "admin"), deleteProject);

module.exports = router;