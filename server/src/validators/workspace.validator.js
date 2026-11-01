const { z } = require("zod");

const createWorkspaceSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(60),
});

const addMemberSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email address"),
  role: z.enum(["admin", "member"]).default("member"), // nobody can be invited as owner
});

const updateRoleSchema = z.object({
  role: z.enum(["admin", "member"]),
});

module.exports = { createWorkspaceSchema, addMemberSchema, updateRoleSchema };