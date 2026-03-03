import { z } from "zod";

export const createMenuSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(200, "Name must be less than 200 characters"),
  description: z
    .string()
    .max(5000, "Description must be less than 5000 characters")
    .optional()
    .nullable(),
  downloadUrl: z
    .string()
    .max(2048, "Download URL must be less than 2048 characters")
    .optional()
    .nullable(),
  isActive: z.boolean().default(true),
});

export const updateMenuSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(200, "Name must be less than 200 characters")
    .optional(),
  description: z
    .string()
    .max(5000, "Description must be less than 5000 characters")
    .optional()
    .nullable(),
  downloadUrl: z
    .string()
    .max(2048, "Download URL must be less than 2048 characters")
    .optional()
    .nullable(),
  isActive: z.boolean().optional(),
});

export const menusQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  isActive: z.enum(["true", "false", "all"]).default("all"),
  sortBy: z
    .enum(["name", "createdAt", "updatedAt", "isActive"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type CreateMenuData = z.infer<typeof createMenuSchema>;
export type UpdateMenuData = z.infer<typeof updateMenuSchema>;
export type MenusQuery = z.infer<typeof menusQuerySchema>;
