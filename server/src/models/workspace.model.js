const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["owner", "admin", "member"], default: "member" },
  },
  { _id: false } // no separate id for each member entry
);

const workspaceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 60 },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    members: [memberSchema],
  },
  { timestamps: true }
);

// "list my workspaces" searches by members.user, so index it
workspaceSchema.index({ "members.user": 1 });

module.exports = mongoose.model("Workspace", workspaceSchema);