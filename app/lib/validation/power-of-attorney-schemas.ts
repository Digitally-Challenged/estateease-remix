import { z } from "zod";

/**
 * Power of Attorney type validation schema
 */
export const poaTypeSchema = z.enum(["FINANCIAL", "HEALTHCARE", "GENERAL", "LIMITED"], {
  errorMap: () => ({ message: "POA type must be FINANCIAL, HEALTHCARE, GENERAL, or LIMITED" }),
});

/**
 * Power of Attorney status validation schema
 */
export const poaStatusSchema = z.enum(["DRAFT", "ACTIVE", "REVOKED", "EXPIRED"], {
  errorMap: () => ({ message: "POA status must be DRAFT, ACTIVE, REVOKED, or EXPIRED" }),
});

/**
 * Power of Attorney validation schema
 */
export const powerOfAttorneySchema = z.object({
  documentName: z
    .string()
    .min(1, "Document name is required")
    .max(200, "Document name cannot exceed 200 characters"),

  type: poaTypeSchema,

  principalName: z
    .string()
    .min(1, "Principal name is required")
    .max(100, "Principal name cannot exceed 100 characters"),

  agentPrimary: z
    .string()
    .min(1, "Primary agent is required")
    .max(100, "Primary agent name too long"),

  agentSecondary: z.string().max(100, "Secondary agent name too long").optional(),

  effectiveDate: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), "Invalid date format")
    .transform((date) => new Date(date))
    .optional(),

  terminationDate: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), "Invalid date format")
    .transform((date) => new Date(date))
    .optional(),

  durable: z.boolean().default(true),

  springCondition: z.string().max(500, "Spring condition too long").optional(),

  powersGranted: z.string().max(2000, "Powers granted too long").optional(),

  limitations: z.string().max(2000, "Limitations too long").optional(),

  healthcarePowers: z.string().max(2000, "Healthcare powers too long").optional(),

  financialPowers: z.string().max(2000, "Financial powers too long").optional(),

  realEstatePowers: z.string().max(2000, "Real estate powers too long").optional(),

  businessPowers: z.string().max(2000, "Business powers too long").optional(),

  taxPowers: z.string().max(2000, "Tax powers too long").optional(),

  giftPowers: z.string().max(2000, "Gift powers too long").optional(),

  trustPowers: z.string().max(2000, "Trust powers too long").optional(),

  specialInstructions: z.string().max(2000, "Special instructions too long").optional(),

  witness1Name: z.string().max(100, "First witness name too long").optional(),

  witness2Name: z.string().max(100, "Second witness name too long").optional(),

  notaryName: z.string().max(100, "Notary name too long").optional(),

  notaryState: z.string().max(50, "Notary state too long").optional(),

  dateSigned: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), "Invalid date format")
    .transform((date) => new Date(date))
    .optional(),

  status: poaStatusSchema.default("DRAFT"),

  attorneyName: z.string().max(100, "Attorney name too long").optional(),

  lawFirm: z.string().max(100, "Law firm name too long").optional(),

  notes: z.string().max(2000, "Notes too long").optional(),
});

/**
 * Power of Attorney creation schema
 */
export const createPowerOfAttorneySchema = powerOfAttorneySchema.extend({
  userId: z.string().min(1, "User ID is required"),
});

/**
 * Power of Attorney update schema
 */
export const updatePowerOfAttorneySchema = powerOfAttorneySchema.partial().extend({
  id: z.string().min(1, "Power of Attorney ID is required"),
});

/**
 * Power of Attorney form validation schema
 */
export const powerOfAttorneyFormSchema = z
  .object({
    documentName: z.string().min(1, "Document name is required").max(200, "Document name too long"),
    type: z
      .string()
      .refine((val) => ["FINANCIAL", "HEALTHCARE", "GENERAL", "LIMITED"].includes(val), {
        message: "Invalid POA type",
      }),
    principalName: z
      .string()
      .min(1, "Principal name is required")
      .max(100, "Principal name too long"),
    agentPrimary: z
      .string()
      .min(1, "Primary agent is required")
      .max(100, "Primary agent name too long"),
    agentSecondary: z
      .string()
      .max(100, "Secondary agent name too long")
      .optional()
      .or(z.literal("")),
    effectiveDate: z.string().optional().or(z.literal("")),
    terminationDate: z.string().optional().or(z.literal("")),
    durable: z.boolean().default(true),
    springCondition: z.string().max(500, "Spring condition too long").optional().or(z.literal("")),
    powersGranted: z.string().max(2000, "Powers granted too long").optional().or(z.literal("")),
    limitations: z.string().max(2000, "Limitations too long").optional().or(z.literal("")),
    healthcarePowers: z
      .string()
      .max(2000, "Healthcare powers too long")
      .optional()
      .or(z.literal("")),
    financialPowers: z.string().max(2000, "Financial powers too long").optional().or(z.literal("")),
    realEstatePowers: z
      .string()
      .max(2000, "Real estate powers too long")
      .optional()
      .or(z.literal("")),
    businessPowers: z.string().max(2000, "Business powers too long").optional().or(z.literal("")),
    taxPowers: z.string().max(2000, "Tax powers too long").optional().or(z.literal("")),
    giftPowers: z.string().max(2000, "Gift powers too long").optional().or(z.literal("")),
    trustPowers: z.string().max(2000, "Trust powers too long").optional().or(z.literal("")),
    specialInstructions: z
      .string()
      .max(2000, "Special instructions too long")
      .optional()
      .or(z.literal("")),
    witness1Name: z.string().max(100, "First witness name too long").optional().or(z.literal("")),
    witness2Name: z.string().max(100, "Second witness name too long").optional().or(z.literal("")),
    notaryName: z.string().max(100, "Notary name too long").optional().or(z.literal("")),
    notaryState: z.string().max(50, "Notary state too long").optional().or(z.literal("")),
    dateSigned: z.string().optional().or(z.literal("")),
    status: z
      .string()
      .refine((val) => ["DRAFT", "ACTIVE", "REVOKED", "EXPIRED"].includes(val), {
        message: "Invalid status",
      })
      .default("DRAFT"),
    attorneyName: z.string().max(100, "Attorney name too long").optional().or(z.literal("")),
    lawFirm: z.string().max(100, "Law firm name too long").optional().or(z.literal("")),
    notes: z.string().max(2000, "Notes too long").optional().or(z.literal("")),
  })
  .refine(
    (data) => {
      // If termination date is provided, it should be after effective date
      if (data.effectiveDate && data.terminationDate) {
        const effective = new Date(data.effectiveDate);
        const termination = new Date(data.terminationDate);
        return termination > effective;
      }
      return true;
    },
    {
      message: "Termination date must be after effective date",
      path: ["terminationDate"],
    },
  );

/**
 * Type exports
 */
export type ValidatedPowerOfAttorney = z.infer<typeof powerOfAttorneySchema>;
export type ValidatedCreatePowerOfAttorney = z.infer<typeof createPowerOfAttorneySchema>;
export type ValidatedUpdatePowerOfAttorney = z.infer<typeof updatePowerOfAttorneySchema>;
export type ValidatedPowerOfAttorneyForm = z.infer<typeof powerOfAttorneyFormSchema>;

/**
 * Validation helper functions
 */
export const validatePOAType = (type: string) => {
  const result = poaTypeSchema.safeParse(type);
  if (!result.success) {
    throw new Error(`Invalid POA type: ${type}`);
  }
  return result.data;
};

export const validatePOAStatus = (status: string) => {
  const result = poaStatusSchema.safeParse(status);
  if (!result.success) {
    throw new Error(`Invalid POA status: ${status}`);
  }
  return result.data;
};

/**
 * Power of Attorney validation error formatter
 */
export const formatPowerOfAttorneyValidationErrors = (error: z.ZodError) => {
  const formatted: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const path = issue.path.join(".");
    if (!formatted[path]) {
      formatted[path] = [];
    }
    formatted[path].push(issue.message);
  }

  return formatted;
};
