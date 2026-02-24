import { z } from "zod";

type ProfileValidationTranslator = (key: string) => string;

export const updateProfileApiSchema = z.object({
  name: z.string().min(2).max(100),
  firstName: z
    .string()
    .min(2)
    .max(50)
    .nullable()
    .optional(),
  lastName: z
    .string()
    .min(2)
    .max(50)
    .nullable()
    .optional(),
  phone: z
    .string()
    .regex(/^[+]?[0-9]{8,15}$/)
    .nullable()
    .optional(),
  address: z.string().max(500).nullable().optional(),
});

export function getUpdateProfileSchema(t: ProfileValidationTranslator) {
  return z.object({
    name: z
      .string()
      .min(2, t("nameMin"))
      .max(100, t("nameMax")),
    firstName: z
      .string()
      .max(50, t("firstNameMax"))
      .optional(),
    lastName: z
      .string()
      .max(50, t("lastNameMax"))
      .optional(),
    phone: z
      .string()
      .regex(/^[+]?[0-9]{8,15}$/, t("phoneInvalid"))
      .or(z.literal(""))
      .optional(),
    address: z
      .string()
      .max(500, t("addressMax"))
      .optional(),
  });
}

export type UpdateProfileData = z.infer<
  ReturnType<typeof getUpdateProfileSchema>
>;
