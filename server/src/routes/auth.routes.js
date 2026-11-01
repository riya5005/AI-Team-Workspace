const express = require("express");
const router = express.Router();

const { registerUser, loginUser, logoutUser, getMe } = require("../controllers/auth.controllers");
const validate = require("../middlewares/validate.middleware");
const authMiddleware = require("../middlewares/auth.middleware");
const { registerSchema, loginSchema } = require("../validators/auth.validator");

router.post("/register", validate(registerSchema), registerUser);
router.post("/login", validate(loginSchema), loginUser);
router.post("/logout", logoutUser);
router.get("/me", authMiddleware, getMe);

module.exports = router;