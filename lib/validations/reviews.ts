import { z } from "zod";

export const createChefReviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().max(2000).optional().nullable(),
});

export const updateReviewAdminSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().max(2000).optional().nullable(),
});

export const reviewsQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(200).default(100),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  minRating: z.coerce.number().int().min(1).max(5).optional(),
});

export type CreateChefReviewData = z.infer<typeof createChefReviewSchema>;
export type UpdateReviewAdminData = z.infer<typeof updateReviewAdminSchema>;
