// A custom error that carries an HTTP status code.
// Usage anywhere in the app: throw new ApiError(404, "Workspace not found")
class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message); // sets err.message
    this.statusCode = statusCode;
    this.details = details; // optional extra info, e.g. validation errors
  }
}

module.exports = ApiError;