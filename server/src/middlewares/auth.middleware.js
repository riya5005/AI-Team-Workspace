const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const ApiError = require("../utils/ApiError");
const { COOKIE_NAME } = require("../utils/token");

async function authMiddleware(req, res, next) {
  const token = req.cookies[COOKIE_NAME];
  if (!token) throw new ApiError(401, "Not logged in");

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    // expired or tampered token
    throw new ApiError(401, "Invalid or expired token");
  }

  const user = await User.findById(payload.id);
  if (!user) throw new ApiError(401, "User no longer exists");

  req.user = user; // available to every controller after this
  next();
}

module.exports = authMiddleware;