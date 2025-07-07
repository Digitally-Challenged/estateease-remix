/**
 * Export all validation schemas for easy importing
 */

// Asset validation exports
export {
  assetSchema,
  createAssetSchema,
  updateAssetSchema,
  assetSearchSchema,
  assetFormSchema,
  bulkAssetSchema,
  assetCategorySchema,
  ownershipTypeSchema,
  ownershipSchema,
  financialDataSchema,
  validateAssetCategory,
  validateOwnershipType,
  formatValidationErrors,
  type ValidatedAsset,
  type ValidatedCreateAsset,
  type ValidatedUpdateAsset,
  type ValidatedAssetSearch,
  type ValidatedAssetForm,
  type ValidatedBulkAsset
} from './asset-schemas';

// Trust validation exports
export {
  trustSchema,
  createTrustSchema,
  updateTrustSchema,
  trustSearchSchema,
  trustFormSchema,
  trustTypeSchema,
  trustStatusSchema,
  beneficiarySchema,
  trusteeSchema,
  validateTrustType,
  validateTrustStatus,
  formatTrustValidationErrors,
  type ValidatedTrust,
  type ValidatedCreateTrust,
  type ValidatedUpdateTrust,
  type ValidatedTrustSearch,
  type ValidatedTrustForm,
  type ValidatedBeneficiary,
  type ValidatedTrustee
} from './trust-schemas';

// Family validation exports
export {
  familyMemberSchema,
  professionalMemberSchema,
  createFamilyMemberSchema,
  createProfessionalMemberSchema,
  updateFamilyMemberSchema,
  updateProfessionalMemberSchema,
  familySearchSchema,
  familyMemberFormSchema,
  professionalMemberFormSchema,
  relationshipSchema,
  genderSchema,
  contactInfoSchema,
  legalRoleSchema,
  validateRelationship,
  validateLegalRole,
  formatFamilyValidationErrors,
  type ValidatedFamilyMember,
  type ValidatedProfessionalMember,
  type ValidatedCreateFamilyMember,
  type ValidatedCreateProfessionalMember,
  type ValidatedUpdateFamilyMember,
  type ValidatedUpdateProfessionalMember,
  type ValidatedFamilySearch,
  type ValidatedFamilyMemberForm,
  type ValidatedProfessionalMemberForm,
  type ValidatedContactInfo
} from './family-schemas';

/**
 * Common validation utilities
 */
export const ValidationErrors = {
  INVALID_ENUM: 'INVALID_ENUM',
  REQUIRED_FIELD: 'REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  OUT_OF_RANGE: 'OUT_OF_RANGE',
  BUSINESS_RULE_VIOLATION: 'BUSINESS_RULE_VIOLATION'
} as const;

/**
 * Validation result helper
 */
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: Record<string, string[]>;
}

/**
 * Format validation errors from Zod error
 */
function formatValidationErrors(error: { issues: Array<{ path: (string | number)[]; message: string }> }): Record<string, string[]> {
  const formatted: Record<string, string[]> = {};
  
  for (const issue of error.issues) {
    const path = issue.path.join('.');
    if (!formatted[path]) {
      formatted[path] = [];
    }
    formatted[path].push(issue.message);
  }
  
  return formatted;
}

/**
 * Create a validation result from a Zod parse attempt
 */
export function createValidationResult<T>(
  parseResult: { success: boolean; data?: T; error?: { issues: Array<{ path: (string | number)[]; message: string }> } }
): ValidationResult<T> {
  if (parseResult.success) {
    return {
      success: true,
      data: parseResult.data
    };
  }
  
  return {
    success: false,
    errors: formatValidationErrors(parseResult.error!)
  };
}

/**
 * Validate enum values against allowed options
 */
export function validateEnum<T extends Record<string, string>>(
  value: string,
  enumObject: T,
  fieldName: string
): T[keyof T] {
  const validValues = Object.values(enumObject);
  if (!validValues.includes(value as T[keyof T])) {
    throw new Error(
      `Invalid ${fieldName}: ${value}. Must be one of: ${validValues.join(', ')}`
    );
  }
  return value as T[keyof T];
}

/**
 * Common validation patterns
 */
export const ValidationPatterns = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[+]?[1-9][\d]{0,15}$/,
  SSN: /^\d{3}-\d{2}-\d{4}$/,
  TAX_ID: /^\d{2}-\d{7}$/,
  ZIP_CODE: /^\d{5}(-\d{4})?$/,
  CURRENCY: /^\$?[\d,]+(\.\d{2})?$/
} as const;

/**
 * Sanitize user input for validation
 */
export function sanitizeInput(input: unknown): string {
  if (typeof input !== 'string') {
    return '';
  }
  return input.trim();
}

/**
 * Parse currency string to number
 */
export function parseCurrency(value: string): number {
  if (!value) return 0;
  const numericValue = parseFloat(value.replace(/[$,]/g, ''));
  return isNaN(numericValue) ? 0 : numericValue;
}

/**
 * Validate percentage value
 */
export function validatePercentage(value: number, allowNegative = false): boolean {
  if (!allowNegative && value < 0) return false;
  if (value > 100) return false;
  return true;
}

