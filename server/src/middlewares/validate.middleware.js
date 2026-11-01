const ApiError = require("../utils/ApiError");

// Usage: router.post("/register", validate(registerSchema), registerUser)
function validate(schema) {
  return (req, res, next) => {
    // req.body can be undefined in Express 5 if no JSON body was sent
    const result = schema.safeParse(req.body || {});

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      return next(new ApiError(400, "Validation failed", details));
    }

    req.body = result.data; // cleaned data (trimmed, lowercased email)
    next();
  };
}

module.exports = validate;