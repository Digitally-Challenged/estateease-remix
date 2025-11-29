import { z } from "zod";

/**
 * Family member relationship validation schema
 */
export const relationshipSchema = z.enum(
  [
    "SPOUSE",
    "CHILD",
    "PARENT",
    "SIBLING",
    "GRANDPARENT",
    "GRANDCHILD",
    "AUNT_UNCLE",
    "NIECE_NEPHEW",
    "COUSIN",
    "IN_LAW",
    "STEP_FAMILY",
    "OTHER",
  ],
  {
    errorMap: () => ({ message: "Invalid relationship type" }),
  },
);

/**
 * Gender validation schema (optional field)
 */
export const genderSchema = z
  .enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"], {
    errorMap: () => ({ message: "Invalid gender selection" }),
  })
  .optional();

/**
 * Contact information validation schema
 */
export const contactInfoSchema = z.object({
  primaryEmail: z.string().email("Invalid email format").optional().or(z.literal("")),
  secondaryEmail: z.string().email("Invalid email format").optional().or(z.literal("")),
  primaryPhone: z
    .string()
    .regex(/^[+]?[1-9]\d{0,15}$/, "Invalid phone number format")
    .optional()
    .or(z.literal("")),
  secondaryPhone: z
    .string()
    .regex(/^[+]?[1-9]\d{0,15}$/, "Invalid phone number format")
    .optional()
    .or(z.literal("")),
  address: z
    .object({
      street: z.string().max(200, "Street address too long").optional().or(z.literal("")),
      city: z.string().max(100, "City name too long").optional().or(z.literal("")),
      state: z.string().max(50, "State name too long").optional().or(z.literal("")),
      zipCode: z.string().max(20, "ZIP code too long").optional().or(z.literal("")),
      country: z.string().max(50, "Country name too long").optional().or(z.literal("")),
    })
    .optional(),
  emergencyContact: z
    .object({
      name: z.string().max(100, "Emergency contact name too long").optional().or(z.literal("")),
      phone: z.string().max(20, "Emergency contact phone too long").optional().or(z.literal("")),
      relationship: z
        .string()
        .max(50, "Emergency contact relationship too long")
        .optional()
        .or(z.literal("")),
    })
    .optional(),
});

/**
 * Legal role validation schema
 */
export const legalRoleSchema = z.enum(
  [
    "EXECUTOR",
    "TRUSTEE",
    "GUARDIAN",
    "POWER_OF_ATTORNEY",
    "HEALTHCARE_PROXY",
    "BENEFICIARY",
    "SUCCESSOR_TRUSTEE",
    "CONTINGENT_BENEFICIARY",
    "NONE",
  ],
  {
    errorMap: () => ({ message: "Invalid legal role" }),
  },
);

/**
 * Base family member schema without refinements
 */
const baseFamilyMemberSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name cannot exceed 50 characters")
    .refine((name) => name.trim().length > 0, { message: "First name cannot be only whitespace" }),

  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name cannot exceed 50 characters")
    .refine((name) => name.trim().length > 0, { message: "Last name cannot be only whitespace" }),

  middleName: z
    .string()
    .max(50, "Middle name cannot exceed 50 characters")
    .optional()
    .or(z.literal("")),

  nickname: z.string().max(30, "Nickname cannot exceed 30 characters").optional().or(z.literal("")),

  relationship: relationshipSchema,

  dateOfBirth: z.date().optional(),

  gender: genderSchema,

  ssn: z
    .string()
    .regex(/^\d{3}-\d{2}-\d{4}$/, "SSN must be in format XXX-XX-XXXX")
    .optional()
    .or(z.literal("")),

  contactInfo: contactInfoSchema.optional(),

  legalRoles: z.array(legalRoleSchema).max(5, "Too many legal roles assigned").default([]),

  isDeceased: z.boolean().default(false),

  dateOfDeath: z.date().optional(),

  notes: z.string().max(1000, "Notes cannot exceed 1000 characters").optional().or(z.literal("")),

  // Financial information
  financialInfo: z
    .object({
      dependentStatus: z.boolean().default(false),
      hasSpecialNeeds: z.boolean().default(false),
      estimatedNetWorth: z.number().min(0, "Net worth cannot be negative").optional(),
      annualIncome: z.number().min(0, "Annual income cannot be negative").optional(),
    })
    .optional(),

  // Professional information (for professional team members)
  professionalInfo: z
    .object({
      title: z.string().max(100, "Title too long").optional(),
      company: z.string().max(100, "Company name too long").optional(),
      specializations: z
        .array(z.string().max(50, "Specialization too long"))
        .max(10, "Too many specializations")
        .optional(),
      licenseNumber: z.string().max(50, "License number too long").optional(),
      yearsOfExperience: z.number().min(0, "Years of experience cannot be negative").optional(),
    })
    .optional(),

  // Document references
  documentIds: z.array(z.string()).optional(),

  // Privacy settings
  privacySettings: z
    .object({
      shareContactInfo: z.boolean().default(true),
      shareFinancialInfo: z.boolean().default(false),
      allowEmailContact: z.boolean().default(true),
    })
    .optional(),
});

/**
 * Base professional member schema without refinements
 */
const baseProfessionalMemberSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50, "First name too long"),
  lastName: z.string().min(1, "Last name is required").max(50, "Last name too long"),

  profession: z.enum(
    [
      "ESTATE_ATTORNEY",
      "TAX_ATTORNEY",
      "FAMILY_LAW_ATTORNEY",
      "BUSINESS_ATTORNEY",
      "CPA",
      "FINANCIAL_ADVISOR",
      "INVESTMENT_ADVISOR",
      "INSURANCE_AGENT",
      "TRUST_OFFICER",
      "ESTATE_PLANNER",
      "REAL_ESTATE_AGENT",
      "APPRAISER",
      "PHYSICIAN",
      "PSYCHIATRIST",
      "THERAPIST",
      "OTHER",
    ],
    {
      errorMap: () => ({ message: "Invalid profession type" }),
    },
  ),

  company: z.string().min(1, "Company name is required").max(100, "Company name too long"),

  title: z.string().max(100, "Title too long").optional().or(z.literal("")),

  specializations: z
    .array(z.string().max(50, "Specialization too long"))
    .max(10, "Too many specializations")
    .default([]),

  contactInfo: contactInfoSchema,

  licenseInfo: z
    .object({
      licenseNumber: z.string().max(50, "License number too long").optional().or(z.literal("")),
      licenseState: z.string().max(50, "License state too long").optional().or(z.literal("")),
      expirationDate: z.date().optional(),
      isActive: z.boolean().default(true),
    })
    .optional(),

  yearsOfExperience: z
    .number()
    .min(0, "Years of experience cannot be negative")
    .max(100, "Years of experience too high")
    .optional(),

  hourlyRate: z.number().min(0, "Hourly rate cannot be negative").optional(),

  retainerRequired: z.boolean().default(false),

  notes: z.string().max(1000, "Notes too long").optional().or(z.literal("")),

  lastContactDate: z.date().optional(),

  documentIds: z.array(z.string()).optional(),
});

/**
 * Family member validation schema with refinements
 */
export const familyMemberSchema = baseFamilyMemberSchema
  .refine(
    (data) => {
      // If deceased, date of death should be provided
      if (data.isDeceased && !data.dateOfDeath) {
        return false;
      }
      return true;
    },
    {
      message: "Date of death is required for deceased family members",
      path: ["dateOfDeath"],
    },
  )
  .refine(
    (data) => {
      // Date of death should be after date of birth
      if (data.dateOfBirth && data.dateOfDeath && data.dateOfDeath <= data.dateOfBirth) {
        return false;
      }
      return true;
    },
    {
      message: "Date of death must be after date of birth",
      path: ["dateOfDeath"],
    },
  )
  .refine(
    (data) => {
      // If has special needs, should not be assigned as executor/trustee
      if (data.financialInfo?.hasSpecialNeeds) {
        const restrictedRoles = ["EXECUTOR", "TRUSTEE", "POWER_OF_ATTORNEY"];
        const hasRestrictedRole = data.legalRoles.some((role) => restrictedRoles.includes(role));
        if (hasRestrictedRole) {
          return false;
        }
      }
      return true;
    },
    {
      message:
        "Family members with special needs typically should not serve as executor, trustee, or power of attorney",
      path: ["legalRoles"],
    },
  );

/**
 * Professional team member validation schema
 */
export const professionalMemberSchema = baseProfessionalMemberSchema;

/**
 * Family member creation schema
 */
export const createFamilyMemberSchema = baseFamilyMemberSchema.extend({
  userId: z.string().min(1, "User ID is required"),
});

/**
 * Professional member creation schema
 */
export const createProfessionalMemberSchema = baseProfessionalMemberSchema.extend({
  userId: z.string().min(1, "User ID is required"),
});

/**
 * Family member update schema
 */
export const updateFamilyMemberSchema = baseFamilyMemberSchema.partial().extend({
  id: z.string().min(1, "Family member ID is required"),
});

/**
 * Professional member update schema
 */
export const updateProfessionalMemberSchema = baseProfessionalMemberSchema.partial().extend({
  id: z.string().min(1, "Professional member ID is required"),
});

/**
 * Family search/filter schema
 */
export const familySearchSchema = z.object({
  query: z.string().max(200, "Search query too long").optional(),
  relationship: relationshipSchema.optional(),
  legalRole: legalRoleSchema.optional(),
  isDeceased: z.boolean().optional(),
  profession: z.string().optional(),
  userId: z.string().optional(),
});

/**
 * Form validation schemas
 */
export const familyMemberFormSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50, "First name too long"),
  lastName: z.string().min(1, "Last name is required").max(50, "Last name too long"),
  middleName: z.string().max(50, "Middle name too long").optional().or(z.literal("")),
  relationship: z
    .string()
    .refine(
      (val) =>
        [
          "SPOUSE",
          "CHILD",
          "PARENT",
          "SIBLING",
          "GRANDPARENT",
          "GRANDCHILD",
          "AUNT_UNCLE",
          "NIECE_NEPHEW",
          "COUSIN",
          "IN_LAW",
          "STEP_FAMILY",
          "OTHER",
        ].includes(val),
      { message: "Invalid relationship" },
    ),
  dateOfBirth: z.string().optional().or(z.literal("")),
  primaryEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  primaryPhone: z.string().optional().or(z.literal("")),
  notes: z.string().max(1000, "Notes too long").optional().or(z.literal("")),
});

export const professionalMemberFormSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50, "First name too long"),
  lastName: z.string().min(1, "Last name is required").max(50, "Last name too long"),
  profession: z
    .string()
    .refine(
      (val) =>
        [
          "ESTATE_ATTORNEY",
          "TAX_ATTORNEY",
          "FAMILY_LAW_ATTORNEY",
          "BUSINESS_ATTORNEY",
          "CPA",
          "FINANCIAL_ADVISOR",
          "INVESTMENT_ADVISOR",
          "INSURANCE_AGENT",
          "TRUST_OFFICER",
          "ESTATE_PLANNER",
          "REAL_ESTATE_AGENT",
          "APPRAISER",
          "PHYSICIAN",
          "PSYCHIATRIST",
          "THERAPIST",
          "OTHER",
        ].includes(val),
      { message: "Invalid profession" },
    ),
  company: z.string().min(1, "Company is required").max(100, "Company name too long"),
  title: z.string().max(100, "Title too long").optional().or(z.literal("")),
  primaryEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  primaryPhone: z.string().optional().or(z.literal("")),
  hourlyRate: z.coerce.number().min(0).optional(),
  notes: z.string().max(1000, "Notes too long").optional().or(z.literal("")),
});

/**
 * Type exports
 */
export type ValidatedFamilyMember = z.infer<typeof familyMemberSchema>;
export type ValidatedProfessionalMember = z.infer<typeof professionalMemberSchema>;
export type ValidatedCreateFamilyMember = z.infer<typeof createFamilyMemberSchema>;
export type ValidatedCreateProfessionalMember = z.infer<typeof createProfessionalMemberSchema>;
export type ValidatedUpdateFamilyMember = z.infer<typeof updateFamilyMemberSchema>;
export type ValidatedUpdateProfessionalMember = z.infer<typeof updateProfessionalMemberSchema>;
export type ValidatedFamilySearch = z.infer<typeof familySearchSchema>;
export type ValidatedFamilyMemberForm = z.infer<typeof familyMemberFormSchema>;
export type ValidatedProfessionalMemberForm = z.infer<typeof professionalMemberFormSchema>;
export type ValidatedContactInfo = z.infer<typeof contactInfoSchema>;

/**
 * Validation helper functions
 */
export const validateRelationship = (relationship: string) => {
  const result = relationshipSchema.safeParse(relationship);
  if (!result.success) {
    throw new Error(`Invalid relationship: ${relationship}`);
  }
  return result.data;
};

export const validateLegalRole = (role: string) => {
  const result = legalRoleSchema.safeParse(role);
  if (!result.success) {
    throw new Error(`Invalid legal role: ${role}`);
  }
  return result.data;
};

/**
 * Family validation error formatter
 */
export const formatFamilyValidationErrors = (error: z.ZodError) => {
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
