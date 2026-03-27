import { z } from "zod";

export const siteContentSchema = z.object({
  type: z.enum(["BANNER", "SOCIAL_LINK", "PARTNER", "CHEF_POSTER"]),
  title: z.string().optional().nullable(),
  subtitle: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  link: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  isActive: z.boolean().default(true).optional(),
  sortOrder: z.coerce.number().int().default(0).optional(),
});

export const contentsQuerySchema = z.object({
  type: z.enum(["BANNER", "SOCIAL_LINK", "PARTNER", "CHEF_POSTER"]).optional(),
  isActive: z.enum(["true", "false", "all"]).optional().default("all"),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(100),
  sortBy: z.string().default("sortOrder"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});
