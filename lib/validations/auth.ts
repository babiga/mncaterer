import { z } from "zod";

// Login schema
export const getLoginSchema = (t: any) =>
  z.object({
    email: z.string().min(1, t("emailRequired")).email(t("emailInvalid")),
    password: z.string().min(1, t("passwordRequired")).min(8, t("passwordMin")),
  });

// Base password schema for reuse
const getPasswordSchema = (t: any) =>
  z
    .string()
    .min(1, t("passwordRequired"))
    .min(8, t("passwordMin"))
    .regex(/[A-Z]/, t("passwordUppercase"))
    .regex(/[a-z]/, t("passwordLowercase"))
    .regex(/[0-9]/, t("passwordNumber"));

// Individual signup schema (client-side)
export const getIndividualSignupSchema = (t: any) =>
  z
    .object({
      firstName: z
        .string()
        .min(1, t("firstNameRequired"))
        .min(2, t("firstNameMin"))
        .max(50),
      lastName: z
        .string()
        .min(1, t("lastNameRequired"))
        .min(2, t("lastNameMin"))
        .max(50),
      email: z.string().min(1, t("emailRequired")).email(t("emailInvalid")),
      phone: z
        .string()
        .min(1, t("phoneRequired"))
        .regex(/^[+]?[0-9]{8,15}$/, t("phoneInvalid")),
      password: getPasswordSchema(t),
      confirmPassword: z.string().min(1, t("confirmPasswordRequired")),
      acceptTerms: z
        .boolean()
        .refine((val) => val === true, t("termsRequired")),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("passwordMismatch"),
      path: ["confirmPassword"],
    });

// Company signup schema (client-side)
export const getCompanySignupSchema = (t: any) =>
  z
    .object({
      companyName: z
        .string()
        .min(1, t("companyNameRequired"))
        .min(2, t("companyNameMin"))
        .max(100),
      companyLegalNo: z
        .string()
        .min(1, t("companyLegalNoRequired"))
        .min(5, t("companyLegalNoMin"))
        .max(20),
      email: z.string().min(1, t("emailRequired")).email(t("emailInvalid")),
      phone: z
        .string()
        .min(1, t("phoneRequired"))
        .regex(/^[+]?[0-9]{8,15}$/, t("phoneInvalid")),
      password: getPasswordSchema(t),
      confirmPassword: z.string().min(1, t("confirmPasswordRequired")),
      acceptTerms: z
        .boolean()
        .refine((val) => val === true, t("termsRequired")),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("passwordMismatch"),
      path: ["confirmPassword"],
    });

// Chef signup schema (client-side)
export const getChefSignupSchema = (t: any) =>
  z
    .object({
      firstName: z
        .string()
        .min(1, t("firstNameRequired"))
        .min(2, t("firstNameMin"))
        .max(50),
      lastName: z
        .string()
        .min(1, t("lastNameRequired"))
        .min(2, t("lastNameMin"))
        .max(50),
      email: z.string().min(1, t("emailRequired")).email(t("emailInvalid")),
      phone: z
        .string()
        .min(1, t("phoneRequired"))
        .regex(/^[+]?[0-9]{8,15}$/, t("phoneInvalid")),
      password: getPasswordSchema(t),
      confirmPassword: z.string().min(1, t("confirmPasswordRequired")),
      acceptTerms: z
        .boolean()
        .refine((val) => val === true, t("termsRequired")),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("passwordMismatch"),
      path: ["confirmPassword"],
    });

// API signup schema (server-side) - discriminated union
export const signupApiSchema = z.discriminatedUnion("userType", [
  z.object({
    userType: z.literal("INDIVIDUAL"),
    firstName: z.string().min(1).min(2).max(50),
    lastName: z.string().min(1).min(2).max(50),
    email: z.string().min(1).email(),
    phone: z
      .string()
      .min(1)
      .regex(/^[+]?[0-9]{8,15}$/),
    password: z.string().min(1).min(8),
  }),
  z.object({
    userType: z.literal("CORPORATE"),
    companyName: z.string().min(1).min(2).max(100),
    companyLegalNo: z.string().min(1).min(5).max(20),
    email: z.string().min(1).email(),
    phone: z
      .string()
      .min(1)
      .regex(/^[+]?[0-9]{8,15}$/),
    password: z.string().min(1).min(8),
  }),
  z.object({
    userType: z.literal("CHEF"),
    firstName: z.string().min(1).min(2).max(50),
    lastName: z.string().min(1).min(2).max(50),
    email: z.string().min(1).email(),
    phone: z
      .string()
      .min(1)
      .regex(/^[+]?[0-9]{8,15}$/),
    password: z.string().min(1).min(8),
  }),
]);

// Type exports
export const loginSchema = z.object({
  email: z.string(),
  password: z.string(),
});
export const individualSignupSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  phone: z.string(),
  password: z.string(),
  confirmPassword: z.string(),
  acceptTerms: z.boolean(),
});
export const companySignupSchema = z.object({
  companyName: z.string(),
  companyLegalNo: z.string(),
  email: z.string(),
  phone: z.string(),
  password: z.string(),
  confirmPassword: z.string(),
  acceptTerms: z.boolean(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type IndividualSignupFormData = z.infer<typeof individualSignupSchema>;
export type CompanySignupFormData = z.infer<typeof companySignupSchema>;
export type ChefSignupFormData = IndividualSignupFormData; // They share the same fields for now
export type SignupApiData = z.infer<typeof signupApiSchema>;
