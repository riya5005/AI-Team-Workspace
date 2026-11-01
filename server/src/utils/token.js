const jwt = require("jsonwebtoken");

const COOKIE_NAME = "token";

// Must be identical when setting and clearing the cookie
const cookieOptions = {
  httpOnly: true, // JavaScript in the browser cannot read it (protects against XSS)
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production", // HTTPS only in production
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};

function signToken(userId) {
  // Only put the id in the token, nothing sensitive
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

function setAuthCookie(res, userId) {
  res.cookie(COOKIE_NAME, signToken(userId), cookieOptions);
}

function clearAuthCookie(res) {
  const { maxAge, ...optionsWithoutMaxAge } = cookieOptions;
  res.clearCookie(COOKIE_NAME, optionsWithoutMaxAge);
}

module.exports = { COOKIE_NAME, setAuthCookie, clearAuthCookie };