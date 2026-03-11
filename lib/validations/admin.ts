import { z } from "zod";

export const adminProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  phone: z.string().optional().nullable(),
  avatar: z.string().optional().nullable(),
});

export type AdminProfileData = z.infer<typeof adminProfileSchema>;
