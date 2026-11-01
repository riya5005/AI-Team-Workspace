const bcrypt = require("bcryptjs");
const User = require("../models/user.model");
const ApiError = require("../utils/ApiError");
const { setAuthCookie, clearAuthCookie } = require("../utils/token");

// Never return the hash: build the response shape explicitly
function publicUser(user) {
  return { id: user._id, username: user.username, email: user.email };
}

async function registerUser(req, res) {
  const { username, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, "Email already in use");

  const passwordHash = await bcrypt.hash(password, 10); // 10 = salt rounds (cost)
  const user = await User.create({ username, email, passwordHash });

  setAuthCookie(res, user._id);
  res.status(201).json({ success: true, user: publicUser(user) });
}

async function loginUser(req, res) {
  const { email, password } = req.body;

  // passwordHash is select:false, so request it explicitly
  const user = await User.findOne({ email }).select("+passwordHash");

  // Same message for "no such user" and "wrong password" so attackers can't
  // discover which emails are registered
  const valid = user && (await bcrypt.compare(password, user.passwordHash));
  if (!valid) throw new ApiError(401, "Invalid email or password");

  setAuthCookie(res, user._id);
  res.status(200).json({ success: true, user: publicUser(user) });
}

async function logoutUser(req, res) {
  clearAuthCookie(res);
  res.status(200).json({ success: true, message: "Logged out" });
}

async function getMe(req, res) {
  // req.user was attached by authMiddleware
  res.status(200).json({ success: true, user: publicUser(req.user) });
}

module.exports = { registerUser, loginUser, logoutUser, getMe };