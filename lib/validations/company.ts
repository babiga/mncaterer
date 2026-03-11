import { z } from "zod";

export const companyProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  phone: z.string().optional().nullable(),
  avatar: z.string().optional().nullable(),
  companyName: z.string().min(2, "Company name must be at least 2 characters").max(100),
  description: z.string().max(2000, "Description is too long").optional().nullable(),
  services: z.array(z.string()),
  portfolioImages: z.array(z.string()),
});

export type CompanyProfileData = z.infer<typeof companyProfileSchema>;
