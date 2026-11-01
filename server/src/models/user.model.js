const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    // Stores the bcrypt hash, never the real password.
    // select: false keeps it out of queries unless you ask with .select("+passwordHash")
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);