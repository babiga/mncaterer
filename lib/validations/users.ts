import { z } from "zod";

// Base password schema for reuse
const passwordSchema = z
  .string()
  .min(1, "Password is required")
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

// Customer update schema
export const updateCustomerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .optional(),
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be less than 50 characters")
    .optional(),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be less than 50 characters")
    .optional(),
  phone: z
    .string()
    .regex(/^[+]?[0-9]{8,15}$/, "Please enter a valid phone number")
    .optional()
    .nullable(),
  address: z
    .string()
    .max(500, "Address must be less than 500 characters")
    .optional()
    .nullable(),
});

// Dashboard user create schema (client-side with confirmPassword)
export const createDashboardUserSchema = z
  .object({
    name: z
      .string()
      .min(1, "Name is required")
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must be less than 100 characters"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
    phone: z
      .string()
      .regex(/^[+]?[0-9]{8,15}$/, "Please enter a valid phone number")
      .optional()
      .nullable()
      .or(z.literal("")),
    avatar: z.string().optional().nullable().or(z.literal("")),
    role: z.enum(["ADMIN", "CHEF", "COMPANY"], {
      required_error: "Please select a role",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Dashboard user create schema (API - without confirmPassword)
export const createDashboardUserApiSchema = z.object({
  name: z.string().min(1).min(2).max(100),
  email: z.string().min(1).email(),
  password: passwordSchema,
  phone: z
    .string()
    .regex(/^[+]?[0-9]{8,15}$/)
    .optional()
    .nullable()
    .or(z.literal("")),
  avatar: z.string().optional().nullable().or(z.literal("")),
  role: z.enum(["ADMIN", "CHEF", "COMPANY"]),
  specialty: z.string().optional(),
});

// Dashboard user update schema
export const updateDashboardUserSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .optional(),
  phone: z
    .string()
    .regex(/^[+]?[0-9]{8,15}$/, "Please enter a valid phone number")
    .optional()
    .nullable()
    .or(z.literal("")),
  avatar: z.string().optional().nullable().or(z.literal("")),
  specialty: z.string().optional(),
});

// Status toggle schemas
export const toggleActiveSchema = z.object({
  isActive: z.boolean(),
});

export const toggleVerifySchema = z.object({
  isVerified: z.boolean(),
});

export const toggleFeaturedSchema = z.object({
  isFeatured: z.boolean(),
});

export const updateChefTaxStatusSchema = z.object({
  taxStatus: z.enum(["PENDING", "PAID", "WAIVED"]),
});

// Query params schema for customers list endpoint
export const usersQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  userType: z.enum(["INDIVIDUAL", "CORPORATE"]).optional(),
  sortBy: z.string().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Query params schema for dashboard users list endpoint
export const dashboardUsersQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  role: z.enum(["ADMIN", "CHEF", "COMPANY"]).optional(),
  isActive: z
    .string()
    .transform((val) => val === "true")
    .optional(),
  isVerified: z
    .string()
    .transform((val) => val === "true")
    .optional(),
  sortBy: z.string().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Type exports
export type UpdateCustomerData = z.infer<typeof updateCustomerSchema>;
export type CreateDashboardUserData = z.infer<typeof createDashboardUserSchema>;
export type CreateDashboardUserApiData = z.infer<
  typeof createDashboardUserApiSchema
>;
export type UpdateDashboardUserData = z.infer<typeof updateDashboardUserSchema>;
export type UsersQuery = z.infer<typeof usersQuerySchema>;
export type DashboardUsersQuery = z.infer<typeof dashboardUsersQuerySchema>;
