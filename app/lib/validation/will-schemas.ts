import { z } from "zod";
import { createEnumValidator } from "./helpers";

/**
 * Will status validation schema
 */
export const willStatusSchema = z.enum(["DRAFT", "SIGNED", "EXECUTED", "REVOKED"], {
  errorMap: () => ({ message: "Will status must be DRAFT, SIGNED, EXECUTED, or REVOKED" }),
});

/**
 * Will validation schema
 */
export const willSchema = z.object({
  documentName: z
    .string()
    .min(1, "Document name is required")
    .max(200, "Document name cannot exceed 200 characters"),

  testatorName: z
    .string()
    .min(1, "Testator name is required")
    .max(100, "Testator name cannot exceed 100 characters"),

  dateCreated: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), "Invalid date format")
    .transform((date) => new Date(date)),

  dateSigned: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), "Invalid date format")
    .transform((date) => new Date(date))
    .optional(),

  status: willStatusSchema.default("DRAFT"),

  executorPrimary: z
    .string()
    .min(1, "Primary executor is required")
    .max(100, "Primary executor name too long"),

  executorSecondary: z.string().max(100, "Secondary executor name too long").optional(),

  witness1Name: z
    .string()
    .min(1, "First witness name is required")
    .max(100, "First witness name too long"),

  witness2Name: z
    .string()
    .min(1, "Second witness name is required")
    .max(100, "Second witness name too long"),

  notaryName: z.string().max(100, "Notary name too long").optional(),

  notaryState: z.string().max(50, "Notary state too long").optional(),

  specificBequests: z.string().max(5000, "Specific bequests too long").optional(),

  residuaryClause: z.string().max(2000, "Residuary clause too long").optional(),

  guardianNominations: z.string().max(2000, "Guardian nominations too long").optional(),

  funeralWishes: z.string().max(2000, "Funeral wishes too long").optional(),

  otherProvisions: z.string().max(5000, "Other provisions too long").optional(),

  revokesPrior: z.boolean().default(true),

  codicilCount: z
    .number()
    .min(0, "Codicil count cannot be negative")
    .max(20, "Too many codicils")
    .default(0),

  attorneyName: z.string().max(100, "Attorney name too long").optional(),

  lawFirm: z.string().max(100, "Law firm name too long").optional(),

  notes: z.string().max(2000, "Notes too long").optional(),
});

/**
 * Will creation schema
 */
export const createWillSchema = willSchema.extend({
  userId: z.string().min(1, "User ID is required"),
});

/**
 * Will update schema
 */
export const updateWillSchema = willSchema.partial().extend({
  id: z.string().min(1, "Will ID is required"),
});

/**
 * Will form validation schema
 */
export const willFormSchema = z.object({
  documentName: z.string().min(1, "Document name is required").max(200, "Document name too long"),
  testatorName: z.string().min(1, "Testator name is required").max(100, "Testator name too long"),
  dateCreated: z.string().min(1, "Date created is required"),
  dateSigned: z.string().optional().or(z.literal("")),
  status: z
    .string()
    .refine((val) => ["DRAFT", "SIGNED", "EXECUTED", "REVOKED"].includes(val), {
      message: "Invalid status",
    })
    .default("DRAFT"),
  executorPrimary: z
    .string()
    .min(1, "Primary executor is required")
    .max(100, "Primary executor name too long"),
  executorSecondary: z
    .string()
    .max(100, "Secondary executor name too long")
    .optional()
    .or(z.literal("")),
  witness1Name: z
    .string()
    .min(1, "First witness name is required")
    .max(100, "First witness name too long"),
  witness2Name: z
    .string()
    .min(1, "Second witness name is required")
    .max(100, "Second witness name too long"),
  notaryName: z.string().max(100, "Notary name too long").optional().or(z.literal("")),
  notaryState: z.string().max(50, "Notary state too long").optional().or(z.literal("")),
  specificBequests: z.string().max(5000, "Specific bequests too long").optional().or(z.literal("")),
  residuaryClause: z.string().max(2000, "Residuary clause too long").optional().or(z.literal("")),
  guardianNominations: z
    .string()
    .max(2000, "Guardian nominations too long")
    .optional()
    .or(z.literal("")),
  funeralWishes: z.string().max(2000, "Funeral wishes too long").optional().or(z.literal("")),
  otherProvisions: z.string().max(5000, "Other provisions too long").optional().or(z.literal("")),
  revokesPrior: z.boolean().default(true),
  codicilCount: z.coerce.number().min(0).max(20).default(0),
  attorneyName: z.string().max(100, "Attorney name too long").optional().or(z.literal("")),
  lawFirm: z.string().max(100, "Law firm name too long").optional().or(z.literal("")),
  notes: z.string().max(2000, "Notes too long").optional().or(z.literal("")),
});

/**
 * Type exports
 */
export type ValidatedWill = z.infer<typeof willSchema>;
export type ValidatedCreateWill = z.infer<typeof createWillSchema>;
export type ValidatedUpdateWill = z.infer<typeof updateWillSchema>;
export type ValidatedWillForm = z.infer<typeof willFormSchema>;

/**
 * Validation helper functions
 */
export const validateWillStatus = createEnumValidator(willStatusSchema, "will status");
