import { z } from "zod";

export const chefsQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val) : 12)),
  search: z.string().optional(),
  specialty: z.string().optional(),
  minExperience: z.string().optional().transform((val) => (val ? parseInt(val) : undefined)),
});

export type ChefsQueryValues = z.infer<typeof chefsQuerySchema>;
