const { z } = require("zod");

const createProjectSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  description: z.string().trim().max(500).optional(),
});

const updateProjectSchema = createProjectSchema.partial();

module.exports = { createProjectSchema, updateProjectSchema };