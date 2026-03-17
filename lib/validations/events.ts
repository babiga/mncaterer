import { z } from "zod";

// Create event schema
export const createEventSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .min(2, "Title must be at least 2 characters")
    .max(200, "Title must be less than 200 characters"),
  description: z
    .string()
    .max(5000, "Description must be less than 5000 characters")
    .optional()
    .nullable(),
  eventType: z.enum(["WEDDING", "CORPORATE", "PRIVATE", "SOCIAL"], {
    required_error: "Please select an event type",
  }),
  guestCount: z.coerce
    .number()
    .min(1, "Guest count must be at least 1")
    .max(100000, "Guest count is too large"),
  eventDate: z.string().optional().nullable(),
  coverImageUrl: z.string().optional().nullable(),
  imageUrls: z.array(z.string()).optional().default([]),
  videoUrl: z.string().optional().nullable(),
  chefProfileId: z.string().optional().nullable(),
  companyProfileId: z.string().optional().nullable(),
  isFeatured: z.boolean().optional().default(false),
});

// Update event schema (all fields optional)
export const updateEventSchema = z.object({
  title: z
    .string()
    .min(2, "Title must be at least 2 characters")
    .max(200, "Title must be less than 200 characters")
    .optional(),
  description: z
    .string()
    .max(5000, "Description must be less than 5000 characters")
    .optional()
    .nullable(),
  eventType: z.enum(["WEDDING", "CORPORATE", "PRIVATE", "SOCIAL"]).optional(),
  guestCount: z.coerce
    .number()
    .min(1, "Guest count must be at least 1")
    .max(100000, "Guest count is too large")
    .optional(),
  eventDate: z.string().optional().nullable(),
  coverImageUrl: z.string().optional().nullable(),
  imageUrls: z.array(z.string()).optional(),
  videoUrl: z.string().optional().nullable(),
  chefProfileId: z.string().optional().nullable(),
  companyProfileId: z.string().optional().nullable(),
  isFeatured: z.boolean().optional(),
});

// Query params schema for events list endpoint
export const eventsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(12),
  search: z.string().optional(),
  eventType: z.enum(["WEDDING", "CORPORATE", "PRIVATE", "SOCIAL"]).optional(),
  isFeatured: z
    .string()
    .transform((val) => val === "true")
    .optional(),
  minGuests: z.coerce.number().optional(),
  maxGuests: z.coerce.number().optional(),
  sortBy: z.string().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Type exports
export type CreateEventData = z.infer<typeof createEventSchema>;
export type UpdateEventData = z.infer<typeof updateEventSchema>;
export type EventsQuery = z.infer<typeof eventsQuerySchema>;
