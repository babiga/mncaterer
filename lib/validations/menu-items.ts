import { z } from "zod";

export const menuItemCategoryValues = [
  "APPETIZER",
  "MAIN_COURSE",
  "DESSERT",
  "BEVERAGE",
  "SIDE_DISH",
  "SALAD",
  "SOUP",
  "OTHER",
] as const;

export type MenuItemCategory = (typeof menuItemCategoryValues)[number];

export const createMenuItemSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(200, "Name must be less than 200 characters"),
  description: z
    .string()
    .max(5000, "Description must be less than 5000 characters")
    .optional()
    .nullable(),
  price: z.coerce
    .number()
    .min(0, "Price must be zero or greater")
    .max(1_000_000_000, "Price is too large"),
  category: z.enum(menuItemCategoryValues).default("OTHER"),
  ingredients: z.array(z.string().max(200)).default([]),
  allergens: z.array(z.string().max(200)).default([]),
  imageUrl: z
    .string()
    .max(2048, "Image URL must be less than 2048 characters")
    .optional()
    .nullable(),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0),
});

export const updateMenuItemSchema = createMenuItemSchema.partial();

export const menuItemsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(1000).default(20),
  search: z.string().optional(),
  category: z.enum([...menuItemCategoryValues, "all"] as const).default("all"),
  isActive: z.enum(["true", "false", "all"]).default("all"),
  sortBy: z
    .enum(["name", "price", "category", "createdAt", "updatedAt", "sortOrder"])
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type CreateMenuItemData = z.infer<typeof createMenuItemSchema>;
export type UpdateMenuItemData = z.infer<typeof updateMenuItemSchema>;
export type MenuItemsQuery = z.infer<typeof menuItemsQuerySchema>;
