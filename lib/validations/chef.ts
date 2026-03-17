import { z } from "zod";

export const chefProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  phone: z.string(),
  avatar: z.string(),
  coverImage: z.string().optional().nullable(),
  specialty: z.string().min(2, "Specialty is required"),
  specialties: z.array(z.string()),
  education: z.array(z.string()),
  experience: z.array(z.string()),
  events: z.array(z.string()),
  degrees: z.array(z.string()),
  awards: z.array(z.string()),
  bio: z.string().max(1000, "Bio is too long"),
  yearsExperience: z.coerce.number().min(0).max(50),
  certifications: z.array(z.string()),
});

export type ChefProfileData = z.infer<typeof chefProfileSchema>;
