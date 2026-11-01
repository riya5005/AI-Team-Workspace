const express = require("express");
const router = express.Router({ mergeParams: true });

const { requireWorkspaceRole } = require("../middlewares/workspace.middleware");
const { listActivity } = require("../controllers/activity.controllers");

router.get("/", requireWorkspaceRole(), listActivity);

module.exports = router;