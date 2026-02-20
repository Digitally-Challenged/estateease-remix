import { z } from "zod";
import { createEnumValidator } from "./helpers";

/**
 * Trust type validation schema
 */
export const trustTypeSchema = z.enum(["REVOCABLE", "IRREVOCABLE"], {
  errorMap: () => ({ message: "Trust type must be either REVOCABLE or IRREVOCABLE" }),
});

/**
 * Trust status validation schema
 */
export const trustStatusSchema = z.enum(["ACTIVE", "TERMINATED", "PENDING"], {
  errorMap: () => ({ message: "Trust status must be ACTIVE, TERMINATED, or PENDING" }),
});

/**
 * Beneficiary validation schema
 */
export const beneficiarySchema = z.object({
  id: z.string().min(1, "Beneficiary ID is required"),
  name: z.string().min(1, "Beneficiary name is required").max(100, "Name too long"),
  relationship: z.string().min(1, "Relationship is required").max(50, "Relationship too long"),
  percentage: z
    .number()
    .min(0, "Percentage must be at least 0")
    .max(100, "Percentage cannot exceed 100"),
  contingent: z.boolean().default(false),
  notes: z.string().max(500, "Notes too long").optional(),
});

/**
 * Trustee validation schema
 */
export const trusteeSchema = z.object({
  id: z.string().min(1, "Trustee ID is required"),
  name: z.string().min(1, "Trustee name is required").max(100, "Name too long"),
  type: z.enum(["INDIVIDUAL", "CORPORATE", "CO_TRUSTEE"], {
    errorMap: () => ({ message: "Trustee type must be INDIVIDUAL, CORPORATE, or CO_TRUSTEE" }),
  }),
  isPrimary: z.boolean().default(false),
  isSuccessor: z.boolean().default(false),
  contactInfo: z
    .object({
      email: z.string().email("Invalid email format").optional(),
      phone: z.string().max(20, "Phone number too long").optional(),
      address: z.string().max(200, "Address too long").optional(),
    })
    .optional(),
  notes: z.string().max(500, "Notes too long").optional(),
});

/**
 * Base trust schema without refinements
 */
const baseTrustSchema = z.object({
  name: z
    .string()
    .min(1, "Trust name is required")
    .max(150, "Trust name cannot exceed 150 characters")
    .refine((name) => name.trim().length > 0, { message: "Trust name cannot be only whitespace" }),

  type: trustTypeSchema,

  status: trustStatusSchema.default("ACTIVE"),

  description: z
    .string()
    .max(1000, "Description cannot exceed 1000 characters")
    .optional()
    .or(z.literal("")),

  establishedDate: z.date().optional(),

  terminationDate: z.date().optional(),

  trustees: z
    .array(trusteeSchema)
    .min(1, "At least one trustee is required")
    .max(10, "Too many trustees"),

  beneficiaries: z
    .array(beneficiarySchema)
    .min(1, "At least one beneficiary is required")
    .max(20, "Too many beneficiaries"),

  totalValue: z.number().min(0, "Total value cannot be negative").optional(),

  taxId: z
    .string()
    .regex(/^\d{2}-\d{7}$/, "Tax ID must be in format XX-XXXXXXX")
    .optional(),

  grantor: z
    .string()
    .min(1, "Grantor name is required")
    .max(100, "Grantor name too long")
    .optional(),

  purpose: z.string().max(500, "Purpose description too long").optional(),

  distributionTerms: z.string().max(1000, "Distribution terms too long").optional(),

  notes: z.string().max(2000, "Notes cannot exceed 2000 characters").optional().or(z.literal("")),

  // Document references
  documentIds: z.array(z.string()).optional(),

  // Legal information
  legalInfo: z
    .object({
      attorneyName: z.string().max(100, "Attorney name too long").optional(),
      lawFirm: z.string().max(100, "Law firm name too long").optional(),
      establishedState: z.string().max(50, "State name too long").optional(),
      governingLaw: z.string().max(100, "Governing law too long").optional(),
    })
    .optional(),
});

/**
 * Trust validation schema with refinements
 */
export const trustSchema = baseTrustSchema
  .refine(
    (data) => {
      // Validate beneficiary percentages sum to 100% for primary beneficiaries
      const primaryBeneficiaries = data.beneficiaries.filter((b) => !b.contingent);
      const totalPercentage = primaryBeneficiaries.reduce((sum, b) => sum + b.percentage, 0);

      if (primaryBeneficiaries.length > 0 && Math.abs(totalPercentage - 100) > 0.01) {
        return false;
      }

      return true;
    },
    {
      message: "Primary beneficiary percentages must sum to 100%",
      path: ["beneficiaries"],
    },
  )
  .refine(
    (data) => {
      // Ensure at least one primary trustee
      const primaryTrustees = data.trustees.filter((t) => t.isPrimary);
      return primaryTrustees.length >= 1;
    },
    {
      message: "At least one trustee must be designated as primary",
      path: ["trustees"],
    },
  )
  .refine(
    (data) => {
      // Termination date must be after establishment date
      if (data.establishedDate && data.terminationDate) {
        return data.terminationDate > data.establishedDate;
      }
      return true;
    },
    {
      message: "Termination date must be after establishment date",
      path: ["terminationDate"],
    },
  );

/**
 * Trust creation schema
 */
export const createTrustSchema = baseTrustSchema.extend({
  userId: z.string().min(1, "User ID is required"),
});

/**
 * Trust update schema
 */
export const updateTrustSchema = baseTrustSchema.partial().extend({
  id: z.string().min(1, "Trust ID is required"),
});

/**
 * Trust search/filter schema
 */
export const trustSearchSchema = z
  .object({
    query: z.string().max(200, "Search query too long").optional(),
    type: trustTypeSchema.optional(),
    status: trustStatusSchema.optional(),
    minValue: z.number().positive("Minimum value must be positive").optional(),
    maxValue: z.number().positive("Maximum value must be positive").optional(),
    userId: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.minValue && data.maxValue && data.minValue >= data.maxValue) {
        return false;
      }
      return true;
    },
    {
      message: "Minimum value must be less than maximum value",
      path: ["minValue"],
    },
  );

/**
 * Form data validation schema for trusts
 */
export const trustFormSchema = z.object({
  name: z.string().min(1, "Trust name is required").max(150, "Name too long"),
  type: z
    .string()
    .refine((val) => ["REVOCABLE", "IRREVOCABLE"].includes(val), { message: "Invalid trust type" }),
  description: z.string().max(1000, "Description too long").optional().or(z.literal("")),
  establishedDate: z.string().optional().or(z.literal("")),
  purpose: z.string().max(500, "Purpose too long").optional().or(z.literal("")),
  notes: z.string().max(2000, "Notes too long").optional().or(z.literal("")),
});

/**
 * Type exports
 */
export type ValidatedTrust = z.infer<typeof trustSchema>;
export type ValidatedCreateTrust = z.infer<typeof createTrustSchema>;
export type ValidatedUpdateTrust = z.infer<typeof updateTrustSchema>;
export type ValidatedTrustSearch = z.infer<typeof trustSearchSchema>;
export type ValidatedTrustForm = z.infer<typeof trustFormSchema>;
export type ValidatedBeneficiary = z.infer<typeof beneficiarySchema>;
export type ValidatedTrustee = z.infer<typeof trusteeSchema>;

/**
 * Validation helper functions
 */
export const validateTrustType = createEnumValidator(trustTypeSchema, "trust type");
export const validateTrustStatus = createEnumValidator(trustStatusSchema, "trust status");
