/**
 * Validation Constants for EstateEase Application
 * 
 * This file contains all validation-related constants including regex patterns,
 * field length limits, value ranges, and validation rules.
 */

// ===========================
// REGEX PATTERNS
// ===========================

/**
 * Regular expression patterns for field validation
 */
export const REGEX_PATTERNS = {
  /** US phone number formats: (123) 456-7890, 123-456-7890, 1234567890 */
  PHONE_US: /^(\+1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/,
  
  /** International phone with country code */
  PHONE_INTERNATIONAL: /^(\+[1-9]\d{0,2}[-.\s]?)?(\(?\d{1,4}\)?[-.\s]?)?\d{1,15}$/,
  
  /** Email validation (RFC 5322 simplified) */
  EMAIL: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
  
  /** US Social Security Number (with or without dashes) */
  SSN: /^(?!000|666|9\d{2})\d{3}[-]?(?!00)\d{2}[-]?(?!0000)\d{4}$/,
  
  /** US Employer Identification Number (with or without dash) */
  EIN: /^(?!00)\d{2}[-]?(?!0000000)\d{7}$/,
  
  /** US ZIP code (5 digits or ZIP+4) */
  ZIP_US: /^\d{5}(-\d{4})?$/,
  
  /** Canadian postal code */
  ZIP_CANADA: /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i,
  
  /** URL validation */
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)$/,
  
  /** Strong password (min 8 chars, 1 upper, 1 lower, 1 number, 1 special) */
  PASSWORD_STRONG: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  
  /** Medium password (min 8 chars, letters and numbers) */
  PASSWORD_MEDIUM: /^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/,
  
  /** Username (alphanumeric, underscore, dash, 3-20 chars) */
  USERNAME: /^[a-zA-Z0-9_-]{3,20}$/,
  
  /** Alphanumeric only */
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  
  /** Letters only (with spaces) */
  LETTERS_ONLY: /^[a-zA-Z\s]+$/,
  
  /** Numbers only */
  NUMBERS_ONLY: /^\d+$/,
  
  /** Decimal numbers (positive or negative) */
  DECIMAL: /^-?\d+(\.\d+)?$/,
  
  /** Currency format (e.g., $1,234.56 or 1234.56) */
  CURRENCY: /^\$?\d{1,3}(,\d{3})*(\.\d{2})?$/,
  
  /** Percentage (0-100 with optional decimals) */
  PERCENTAGE: /^(100(\.0{1,2})?|[0-9]?[0-9](\.[0-9]{1,2})?)$/,
  
  /** Credit card number (basic validation) */
  CREDIT_CARD: /^[0-9]{13,19}$/,
  
  /** Bank routing number (9 digits) */
  ROUTING_NUMBER: /^\d{9}$/,
  
  /** Bank account number (3-17 digits) */
  ACCOUNT_NUMBER: /^\d{3,17}$/,
} as const;

// ===========================
// FIELD LENGTH LIMITS
// ===========================

/**
 * Minimum and maximum lengths for various form fields
 */
export const FIELD_LENGTHS = {
  /** Name fields (first, last, company, etc.) */
  NAME: {
    MIN: 1,
    MAX: 100,
  },
  
  /** Full name fields */
  FULL_NAME: {
    MIN: 2,
    MAX: 200,
  },
  
  /** Title/label fields */
  TITLE: {
    MIN: 1,
    MAX: 200,
  },
  
  /** Short description fields */
  DESCRIPTION_SHORT: {
    MIN: 0,
    MAX: 500,
  },
  
  /** Long description fields */
  DESCRIPTION_LONG: {
    MIN: 0,
    MAX: 5000,
  },
  
  /** Notes/comments fields */
  NOTES: {
    MIN: 0,
    MAX: 10000,
  },
  
  /** Address line fields */
  ADDRESS_LINE: {
    MIN: 1,
    MAX: 200,
  },
  
  /** City names */
  CITY: {
    MIN: 1,
    MAX: 100,
  },
  
  /** State/province codes */
  STATE_CODE: {
    MIN: 2,
    MAX: 2,
  },
  
  /** Country codes */
  COUNTRY_CODE: {
    MIN: 2,
    MAX: 3,
  },
  
  /** Username */
  USERNAME: {
    MIN: 3,
    MAX: 20,
  },
  
  /** Password */
  PASSWORD: {
    MIN: 8,
    MAX: 128,
  },
  
  /** Email */
  EMAIL: {
    MIN: 5,
    MAX: 254, // RFC 5321
  },
  
  /** Phone number (formatted) */
  PHONE: {
    MIN: 10,
    MAX: 20,
  },
  
  /** URL fields */
  URL: {
    MIN: 10,
    MAX: 2048,
  },
  
  /** Tax ID fields */
  TAX_ID: {
    MIN: 9,
    MAX: 20,
  },
  
  /** Policy numbers */
  POLICY_NUMBER: {
    MIN: 1,
    MAX: 50,
  },
  
  /** Account numbers */
  ACCOUNT_NUMBER: {
    MIN: 3,
    MAX: 30,
  },
  
  /** Reference numbers */
  REFERENCE_NUMBER: {
    MIN: 1,
    MAX: 50,
  },
} as const;

// ===========================
// VALUE RANGES
// ===========================

/**
 * Minimum and maximum values for numeric fields
 */
export const VALUE_RANGES = {
  /** Currency/financial amounts */
  CURRENCY: {
    MIN: 0,
    MAX: 999999999999.99, // Just under 1 trillion
    DECIMAL_PLACES: 2,
  },
  
  /** Large financial amounts (for estate values) */
  ESTATE_VALUE: {
    MIN: 0,
    MAX: 99999999999999, // 100 trillion (storing as cents to avoid precision issues)
    DECIMAL_PLACES: 2,
  },
  
  /** Percentage values */
  PERCENTAGE: {
    MIN: 0,
    MAX: 100,
    DECIMAL_PLACES: 2,
  },
  
  /** Interest rates (can be negative in some cases) */
  INTEREST_RATE: {
    MIN: -10,
    MAX: 100,
    DECIMAL_PLACES: 4,
  },
  
  /** Age values */
  AGE: {
    MIN: 0,
    MAX: 150,
  },
  
  /** Year values */
  YEAR: {
    MIN: 1900,
    MAX: 2100,
  },
  
  /** Quantity/count fields */
  QUANTITY: {
    MIN: 0,
    MAX: 999999,
  },
  
  /** Square footage */
  SQUARE_FOOTAGE: {
    MIN: 0,
    MAX: 9999999,
    DECIMAL_PLACES: 2,
  },
  
  /** Acreage */
  ACREAGE: {
    MIN: 0,
    MAX: 999999,
    DECIMAL_PLACES: 4,
  },
  
  /** Term lengths (in months) */
  TERM_MONTHS: {
    MIN: 1,
    MAX: 600, // 50 years
  },
  
  /** Beneficiary allocation (must total 100%) */
  BENEFICIARY_PERCENTAGE: {
    MIN: 0.01,
    MAX: 100,
    DECIMAL_PLACES: 2,
  },
} as const;

// ===========================
// DATE VALIDATION
// ===========================

/**
 * Date validation rules and constraints
 */
export const DATE_VALIDATION = {
  /** Minimum valid date (for historical dates) */
  MIN_DATE: new Date('1900-01-01'),
  
  /** Maximum valid date (for future planning) */
  MAX_DATE: new Date('2100-12-31'),
  
  /** Maximum days in the future for documents */
  DOCUMENT_MAX_FUTURE_DAYS: 365,
  
  /** Maximum years in the past for birth dates */
  BIRTH_DATE_MAX_YEARS_AGO: 150,
  
  /** Minimum age for legal capacity */
  LEGAL_AGE: 18,
  
  /** Date formats accepted */
  ACCEPTED_FORMATS: [
    'MM/DD/YYYY',
    'MM-DD-YYYY',
    'YYYY-MM-DD',
  ] as const,
} as const;

// ===========================
// PASSWORD REQUIREMENTS
// ===========================

/**
 * Password validation requirements
 */
export const PASSWORD_REQUIREMENTS = {
  /** Minimum length */
  MIN_LENGTH: 8,
  
  /** Maximum length */
  MAX_LENGTH: 128,
  
  /** Require uppercase letter */
  REQUIRE_UPPERCASE: true,
  
  /** Require lowercase letter */
  REQUIRE_LOWERCASE: true,
  
  /** Require number */
  REQUIRE_NUMBER: true,
  
  /** Require special character */
  REQUIRE_SPECIAL: true,
  
  /** Special characters allowed */
  SPECIAL_CHARS: '@$!%*?&',
  
  /** Common passwords to reject */
  COMMON_PASSWORDS: [
    'password',
    'password123',
    '12345678',
    'qwerty123',
    'admin123',
    'letmein',
    'welcome123',
  ] as const,
} as const;

// ===========================
// FILE VALIDATION
// ===========================

/**
 * File validation rules
 */
export const FILE_VALIDATION = {
  /** Maximum file name length */
  FILENAME_MAX_LENGTH: 255,
  
  /** Invalid characters in file names */
  // eslint-disable-next-line no-control-regex
  INVALID_FILENAME_CHARS: /[<>:"/\\|?*\x00-\x1F]/,
  
  /** Minimum file size (1 byte) */
  MIN_SIZE: 1,
  
  /** Maximum total upload size per request (50MB) */
  MAX_TOTAL_UPLOAD_SIZE: 50 * 1024 * 1024,
} as const;

// ===========================
// FORM FIELD SPECIFIC LIMITS
// ===========================

/**
 * Specific validation rules for EstateEase form fields
 */
export const ESTATE_FORM_LIMITS = {
  /** Trust name */
  TRUST_NAME: {
    MIN: 3,
    MAX: 200,
    PATTERN: /^[a-zA-Z0-9\s,.'()-]+$/,
  },
  
  /** Beneficiary designation */
  BENEFICIARY_DESIGNATION: {
    MIN: 1,
    MAX: 100,
  },
  
  /** Legal entity name */
  ENTITY_NAME: {
    MIN: 1,
    MAX: 200,
  },
  
  /** Professional title/designation */
  PROFESSIONAL_TITLE: {
    MIN: 2,
    MAX: 100,
  },
  
  /** License/certification number */
  LICENSE_NUMBER: {
    MIN: 1,
    MAX: 50,
  },
  
  /** Case/matter number */
  CASE_NUMBER: {
    MIN: 1,
    MAX: 50,
  },
  
  /** Document title */
  DOCUMENT_TITLE: {
    MIN: 1,
    MAX: 200,
  },
  
  /** Vault/safe combination */
  SAFE_COMBINATION: {
    MIN: 3,
    MAX: 20,
    PATTERN: /^[0-9-]+$/,
  },
} as const;

// ===========================
// VALIDATION MESSAGES
// ===========================

/**
 * Standard validation error messages
 */
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid phone number',
  INVALID_SSN: 'Please enter a valid Social Security Number',
  INVALID_EIN: 'Please enter a valid Employer Identification Number',
  INVALID_ZIP: 'Please enter a valid ZIP code',
  INVALID_URL: 'Please enter a valid URL',
  PASSWORD_TOO_SHORT: `Password must be at least ${PASSWORD_REQUIREMENTS.MIN_LENGTH} characters`,
  PASSWORD_TOO_WEAK: 'Password must contain uppercase, lowercase, number, and special character',
  VALUE_TOO_LOW: 'Value is below the minimum allowed',
  VALUE_TOO_HIGH: 'Value exceeds the maximum allowed',
  INVALID_DATE: 'Please enter a valid date',
  DATE_TOO_EARLY: 'Date is too far in the past',
  DATE_TOO_LATE: 'Date is too far in the future',
  FIELD_TOO_SHORT: 'This field is too short',
  FIELD_TOO_LONG: 'This field is too long',
  INVALID_FORMAT: 'Invalid format',
  PERCENTAGE_TOTAL: 'Percentages must total 100%',
  DUPLICATE_VALUE: 'This value already exists',
  INVALID_FILE_TYPE: 'File type not allowed',
  FILE_TOO_LARGE: 'File size exceeds the maximum allowed',
} as const;