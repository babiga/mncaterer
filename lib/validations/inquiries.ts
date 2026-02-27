import { z } from "zod";

export const createInquirySchema = z.object({
  type: z.enum(["INDIVIDUAL", "ORG"], {
    required_error: "Please select inquiry type",
  }),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  phone: z
    .string()
    .min(5, "Phone is required")
    .max(30, "Phone must be less than 30 characters"),
  email: z.string().email("Please provide a valid email address"),
  serviceType: z.enum(["CORPORATE", "PRIVATE", "WEDDING", "VIP", "OTHER"], {
    required_error: "Please select service type",
  }),
  message: z
    .string()
    .max(5000, "Message must be less than 5000 characters")
    .optional()
    .nullable(),
});

export const inquiriesQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(200).default(100),
  status: z.enum(["NEW", "IN_PROGRESS", "RESOLVED"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const updateInquirySchema = z.object({
  status: z.enum(["NEW", "IN_PROGRESS", "RESOLVED"]),
});

export type CreateInquiryData = z.infer<typeof createInquirySchema>;
export type UpdateInquiryData = z.infer<typeof updateInquirySchema>;
