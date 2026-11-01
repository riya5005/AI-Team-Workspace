// Express only treats a function as an error handler if it has FOUR parameters,
// even if you never use `next`.
function errorMiddleware(err, req, res, next) {
  // Pick a status code. body-parser (broken JSON) sets err.status, ApiError sets err.statusCode.
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || "Internal Server Error";

  // Mongoose: duplicate key, e.g. registering an email that already exists
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `${field} already exists`;
  }

  // Mongoose: schema validation failed (required field missing, too short, etc.)
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  // Hide internal details in production: a 500 message could leak server info
  if (statusCode === 500 && process.env.NODE_ENV === "production") {
    message = "Internal Server Error";
  }
    // Mongoose: invalid ObjectId or wrong type
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}`;
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(err.details && { details: err.details }),
    // Stack trace only while developing
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
}

module.exports = errorMiddleware;