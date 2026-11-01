const { z } = require("zod");

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

const createTaskSchema = z.object({
  project: objectId,
  title: z.string().trim().min(2, "Title must be at least 2 characters").max(120),
  description: z.string().trim().max(2000).optional(),
  status: z.enum(["todo", "in_progress", "done"]).default("todo"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  assignee: objectId.nullable().optional(),
  dueDate: z.coerce.date().nullable().optional(),
});

// For PATCH: every field optional, and the project cannot be changed
const updateTaskSchema = createTaskSchema
  .omit({ project: true })
  .partial()
  .extend({
    // .partial() keeps the defaults, so redefine them as plain optionals
    status: z.enum(["todo", "in_progress", "done"]).optional(),
    priority: z.enum(["low", "medium", "high"]).optional(),
  });

module.exports = { createTaskSchema, updateTaskSchema };