const express = require("express");
const router = express.Router({ mergeParams: true });

const validate = require("../middlewares/validate.middleware");
const { requireWorkspaceRole } = require("../middlewares/workspace.middleware");
const { createTaskSchema, updateTaskSchema } = require("../validators/task.validator");
const {
  createTask,
  listTasks,
  getTask,
  updateTask,
  deleteTask,
} = require("../controllers/task.controllers");

// Any workspace member can work with tasks. Delete rules live in the controller.
router.get("/", requireWorkspaceRole(), listTasks);
router.post("/", requireWorkspaceRole(), validate(createTaskSchema), createTask);
router.get("/:taskId", requireWorkspaceRole(), getTask);
router.patch("/:taskId", requireWorkspaceRole(), validate(updateTaskSchema), updateTask);
router.delete("/:taskId", requireWorkspaceRole(), deleteTask);

module.exports = router;
