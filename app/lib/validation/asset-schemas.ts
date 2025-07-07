import { z } from 'zod';
import { 
  AssetCategory, 
  OwnershipType,
  PropertyType,
  FinancialAccountType,
  InsurancePolicyType,
  BusinessStructureType,
  VehicleType,
  DebtType,
  PersonalPropertyType,
  BusinessType,
  InvestmentType,
  DigitalAssetType 
} from '~/types/enums';

/**
 * Validation schema for asset categories
 * Ensures only valid UPPERCASE enum values are accepted
 */
export const assetCategorySchema = z.nativeEnum(AssetCategory, {
  errorMap: () => ({ message: "Invalid asset category. Must be one of: REAL_ESTATE, FINANCIAL_ACCOUNT, INSURANCE_POLICY, BUSINESS_INTEREST, PERSONAL_PROPERTY, VEHICLE, DEBT, OTHER" })
});

/**
 * Validation schema for ownership types
 * Ensures only valid UPPERCASE enum values are accepted
 */
export const ownershipTypeSchema = z.nativeEnum(OwnershipType, {
  errorMap: () => ({ message: "Invalid ownership type. Must be one of: INDIVIDUAL, JOINT, TRUST, BUSINESS" })
});

/**
 * Asset type validation schemas based on category
 * These validate the specific asset type based on the category
 */
export const propertyTypeSchema = z.nativeEnum(PropertyType);
export const financialAccountTypeSchema = z.nativeEnum(FinancialAccountType);
export const insurancePolicyTypeSchema = z.nativeEnum(InsurancePolicyType);
export const businessStructureTypeSchema = z.nativeEnum(BusinessStructureType);
export const vehicleTypeSchema = z.nativeEnum(VehicleType);
export const debtTypeSchema = z.nativeEnum(DebtType);
export const personalPropertyTypeSchema = z.nativeEnum(PersonalPropertyType);
export const businessTypeSchema = z.nativeEnum(BusinessType);
export const investmentTypeSchema = z.nativeEnum(InvestmentType);
export const digitalAssetTypeSchema = z.nativeEnum(DigitalAssetType);

/**
 * Dynamic asset type validation based on category
 * This discriminated union ensures the asset type matches the category
 */
export const assetTypeSchema = z.discriminatedUnion('category', [
  z.object({
    category: z.literal(AssetCategory.REAL_ESTATE),
    type: propertyTypeSchema
  }),
  z.object({
    category: z.literal(AssetCategory.FINANCIAL_ACCOUNT),
    type: financialAccountTypeSchema
  }),
  z.object({
    category: z.literal(AssetCategory.INSURANCE_POLICY),
    type: insurancePolicyTypeSchema
  }),
  z.object({
    category: z.literal(AssetCategory.BUSINESS_INTEREST),
    type: businessStructureTypeSchema
  }),
  z.object({
    category: z.literal(AssetCategory.VEHICLE),
    type: vehicleTypeSchema
  }),
  z.object({
    category: z.literal(AssetCategory.DEBT),
    type: debtTypeSchema
  }),
  z.object({
    category: z.literal(AssetCategory.PERSONAL_PROPERTY),
    type: personalPropertyTypeSchema
  }),
  z.object({
    category: z.literal(AssetCategory.OTHER),
    type: z.string().min(1, "Asset type is required")
  })
]);

/**
 * Ownership validation schema
 * Validates ownership structure with conditional requirements
 */
export const ownershipSchema = z.object({
  type: ownershipTypeSchema,
  percentage: z.number()
    .min(0, "Percentage must be at least 0")
    .max(100, "Percentage cannot exceed 100")
    .default(100),
  trustId: z.string().optional(),
  businessEntityId: z.string().optional(),
  notes: z.string().max(500, "Notes cannot exceed 500 characters").optional()
}).refine(
  (data) => {
    // If ownership type is TRUST, trustId should be provided
    if (data.type === OwnershipType.TRUST && !data.trustId) {
      return false;
    }
    // If ownership type is BUSINESS, businessEntityId should be provided
    if (data.type === OwnershipType.BUSINESS && !data.businessEntityId) {
      return false;
    }
    return true;
  },
  {
    message: "Trust ID required for trust ownership, Business Entity ID required for business ownership",
    path: ["trustId"]
  }
);

/**
 * Financial data validation schema
 * Validates monetary values and percentages
 */
export const financialDataSchema = z.object({
  value: z.number()
    .refine(
      (val) => val !== 0,
      { message: "Value cannot be zero" }
    )
    .refine(
      (val) => Number.isFinite(val),
      { message: "Value must be a valid number" }
    ),
  acquisitionCost: z.number().positive("Acquisition cost must be positive").optional(),
  currentMarketValue: z.number().positive("Market value must be positive").optional(),
  annualIncome: z.number().min(0, "Annual income cannot be negative").optional(),
  appreciationRate: z.number()
    .min(-100, "Appreciation rate cannot be less than -100%")
    .max(1000, "Appreciation rate cannot exceed 1000%")
    .optional()
});

/**
 * Main asset validation schema
 * Comprehensive validation for all asset properties
 */
export const assetSchema = z.object({
  name: z.string()
    .min(1, "Asset name is required")
    .max(100, "Asset name cannot exceed 100 characters")
    .refine(
      (name) => name.trim().length > 0,
      { message: "Asset name cannot be only whitespace" }
    ),
  
  category: assetCategorySchema,
  
  value: z.number()
    .refine(
      (val) => val !== 0,
      { message: "Asset value cannot be zero" }
    )
    .refine(
      (val) => Number.isFinite(val),
      { message: "Asset value must be a valid number" }
    ),
  
  description: z.string()
    .max(500, "Description cannot exceed 500 characters")
    .optional()
    .or(z.literal("")),
  
  notes: z.string()
    .max(1000, "Notes cannot exceed 1000 characters")
    .optional()
    .or(z.literal("")),
  
  ownership: ownershipSchema,
  
  // Location information
  location: z.object({
    address: z.string().max(200, "Address too long").optional(),
    city: z.string().max(100, "City name too long").optional(),
    state: z.string().max(50, "State name too long").optional(),
    zipCode: z.string().max(20, "ZIP code too long").optional(),
    country: z.string().max(50, "Country name too long").optional()
  }).optional(),
  
  // Dates
  acquisitionDate: z.date().optional(),
  lastUpdated: z.date().optional(),
  
  // Financial data
  financialData: financialDataSchema.optional(),
  
  // Tags and categorization
  tags: z.array(z.string().max(50, "Tag too long")).max(10, "Too many tags").optional(),
  
  // Document references
  documentIds: z.array(z.string()).optional(),
  
  // Insurance information
  insuranceInfo: z.object({
    provider: z.string().max(100, "Provider name too long").optional(),
    policyNumber: z.string().max(100, "Policy number too long").optional(),
    coverage: z.number().positive("Coverage must be positive").optional(),
    deductible: z.number().min(0, "Deductible cannot be negative").optional()
  }).optional(),
  
  // Tax information
  taxInfo: z.object({
    taxBasis: z.number().optional(),
    depreciationSchedule: z.string().max(50, "Depreciation schedule too long").optional(),
    taxLotMethod: z.string().max(50, "Tax lot method too long").optional()
  }).optional()
});

/**
 * Asset creation schema
 * Used for validating new asset creation
 */
export const createAssetSchema = assetSchema.extend({
  userId: z.string().min(1, "User ID is required"),
  category: assetCategorySchema,
  type: z.string().min(1, "Asset type is required") // Will be validated against category-specific types
});

/**
 * Asset update schema
 * Used for validating asset updates (all fields optional except ID)
 */
export const updateAssetSchema = assetSchema.partial().extend({
  id: z.string().min(1, "Asset ID is required")
});

/**
 * Asset search/filter schema
 * Used for validating search and filter parameters
 */
export const assetSearchSchema = z.object({
  query: z.string().max(200, "Search query too long").optional(),
  category: assetCategorySchema.optional(),
  ownershipType: ownershipTypeSchema.optional(),
  minValue: z.number().positive("Minimum value must be positive").optional(),
  maxValue: z.number().positive("Maximum value must be positive").optional(),
  tags: z.array(z.string()).optional(),
  userId: z.string().optional()
}).refine(
  (data) => {
    // If both min and max values are provided, min should be less than max
    if (data.minValue && data.maxValue && data.minValue >= data.maxValue) {
      return false;
    }
    return true;
  },
  {
    message: "Minimum value must be less than maximum value",
    path: ["minValue"]
  }
);

/**
 * Form data validation schema
 * Specifically for HTML form data validation
 */
export const assetFormSchema = z.object({
  name: z.string().min(1, "Asset name is required").max(100, "Name too long"),
  category: z.string().refine(
    (val) => Object.values(AssetCategory).includes(val as AssetCategory),
    { message: "Invalid asset category" }
  ),
  type: z.string().min(1, "Asset type is required"),
  value: z.coerce.number().refine(
    (val) => val !== 0,
    { message: "Asset value cannot be zero" }
  ),
  description: z.string().max(500, "Description too long").optional().or(z.literal("")),
  notes: z.string().max(1000, "Notes too long").optional().or(z.literal("")),
  ownershipType: z.string().refine(
    (val) => Object.values(OwnershipType).includes(val as OwnershipType),
    { message: "Invalid ownership type" }
  ),
  trustId: z.string().optional().or(z.literal("")),
  businessEntityId: z.string().optional().or(z.literal("")),
  percentage: z.coerce.number().min(0).max(100).default(100)
});

/**
 * Bulk asset validation schema
 * Used for validating multiple assets at once
 */
export const bulkAssetSchema = z.object({
  assets: z.array(createAssetSchema).min(1, "At least one asset is required").max(100, "Too many assets"),
  userId: z.string().min(1, "User ID is required")
});

/**
 * Type exports for use in components
 */
export type ValidatedAsset = z.infer<typeof assetSchema>;
export type ValidatedCreateAsset = z.infer<typeof createAssetSchema>;
export type ValidatedUpdateAsset = z.infer<typeof updateAssetSchema>;
export type ValidatedAssetSearch = z.infer<typeof assetSearchSchema>;
export type ValidatedAssetForm = z.infer<typeof assetFormSchema>;
export type ValidatedBulkAsset = z.infer<typeof bulkAssetSchema>;

/**
 * Validation helper functions
 */
export const validateAssetCategory = (category: string): AssetCategory => {
  const result = assetCategorySchema.safeParse(category);
  if (!result.success) {
    throw new Error(`Invalid asset category: ${category}`);
  }
  return result.data;
};

export const validateOwnershipType = (ownershipType: string): OwnershipType => {
  const result = ownershipTypeSchema.safeParse(ownershipType);
  if (!result.success) {
    throw new Error(`Invalid ownership type: ${ownershipType}`);
  }
  return result.data;
};

/**
 * Validation error formatter
 * Formats Zod validation errors for user-friendly display
 */
export const formatValidationErrors = (error: z.ZodError) => {
  const formatted: Record<string, string[]> = {};
  
  for (const issue of error.issues) {
    const path = issue.path.join('.');
    if (!formatted[path]) {
      formatted[path] = [];
    }
    formatted[path].push(issue.message);
  }
  
  return formatted;
};