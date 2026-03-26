import { z } from "zod";

export const bankTransferSettingsSchema = z.object({
  bankName: z.string().trim().min(1, "Bank name is required").max(120),
  accountNumber: z
    .string()
    .trim()
    .min(1, "Account number is required")
    .max(120),
  accountHolderName: z
    .string()
    .trim()
    .min(1, "Account holder name is required")
    .max(120),
  iban: z.string().trim().max(60).optional().or(z.literal("")),
  paymentInstructions: z
    .string()
    .trim()
    .max(1000)
    .optional()
    .or(z.literal("")),
  initialTaxAmount: z.coerce.number().min(1, "Initial tax amount is required"),
  isActive: z.boolean(),
});

export type BankTransferSettingsInput = z.infer<
  typeof bankTransferSettingsSchema
>;
