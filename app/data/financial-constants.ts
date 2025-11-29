/**
 * Financial Constants for Estate Planning Calculations
 * Updated for 2025 tax year
 * Sources: IRS.gov, SSA.gov, and other official sources
 */

// ===========================
// ESTATE TAX CONSTANTS
// ===========================

/**
 * Federal Estate Tax Exemption for 2025
 * Source: IRS Rev. Proc. 2024-40
 */
export const FEDERAL_ESTATE_TAX_EXEMPTION = {
  /** Per person exemption amount */
  INDIVIDUAL: 13_990_000,
  /** Married couple with portability */
  MARRIED: 27_980_000,
  /** Year these amounts apply */
  YEAR: 2025,
} as const;

/**
 * Federal Estate Tax Rate
 * Source: IRC Section 2001(c)
 */
export const FEDERAL_ESTATE_TAX_RATE = 0.4;

/**
 * Gift Tax Annual Exclusion for 2025
 * Source: IRS Rev. Proc. 2024-40
 */
export const GIFT_TAX_ANNUAL_EXCLUSION = {
  /** Per recipient per year */
  AMOUNT: 18_000,
  /** For gifts to non-citizen spouse */
  NON_CITIZEN_SPOUSE: 185_000,
  YEAR: 2025,
} as const;

/**
 * Generation-Skipping Transfer (GST) Tax
 * Source: IRS Rev. Proc. 2024-40
 */
export const GST_TAX = {
  /** GST exemption matches estate tax exemption */
  EXEMPTION: 13_990_000,
  /** GST tax rate */
  RATE: 0.4,
  YEAR: 2025,
} as const;

// ===========================
// STATE TAX CONSTANTS
// ===========================

/**
 * State Estate and Inheritance Tax Information
 * Note: California has no state estate or inheritance tax as of 2025
 */
export const STATE_TAX_INFO = {
  CALIFORNIA: {
    ESTATE_TAX: false,
    INHERITANCE_TAX: false,
    EXEMPTION: null,
    RATE: null,
  },
  /** States with estate tax (2025) */
  ESTATE_TAX_STATES: [
    { state: "Connecticut", exemption: 12_920_000, minRate: 0.12, maxRate: 0.12 },
    { state: "Hawaii", exemption: 5_490_000, minRate: 0.1, maxRate: 0.2 },
    { state: "Illinois", exemption: 4_000_000, minRate: 0.008, maxRate: 0.16 },
    { state: "Maine", exemption: 6_810_000, minRate: 0.08, maxRate: 0.12 },
    { state: "Maryland", exemption: 5_000_000, minRate: 0.008, maxRate: 0.16 },
    { state: "Massachusetts", exemption: 2_000_000, minRate: 0.008, maxRate: 0.16 },
    { state: "Minnesota", exemption: 3_000_000, minRate: 0.13, maxRate: 0.16 },
    { state: "New York", exemption: 6_940_000, minRate: 0.032, maxRate: 0.16 },
    { state: "Oregon", exemption: 1_000_000, minRate: 0.1, maxRate: 0.16 },
    { state: "Rhode Island", exemption: 1_774_583, minRate: 0.008, maxRate: 0.16 },
    { state: "Vermont", exemption: 5_000_000, minRate: 0.16, maxRate: 0.16 },
    { state: "Washington", exemption: 2_193_000, minRate: 0.1, maxRate: 0.2 },
    { state: "District of Columbia", exemption: 4_710_760, minRate: 0.12, maxRate: 0.16 },
  ],
  /** States with inheritance tax (2025) */
  INHERITANCE_TAX_STATES: [
    "Iowa", // Phasing out by 2025
    "Kentucky",
    "Maryland", // Has both estate and inheritance tax
    "Nebraska",
    "New Jersey",
    "Pennsylvania",
  ],
} as const;

// ===========================
// FINANCIAL PLANNING CONSTANTS
// ===========================

/**
 * Default Financial Planning Assumptions
 * These are commonly used baseline assumptions
 */
export const FINANCIAL_PLANNING_DEFAULTS = {
  /** Average long-term inflation rate */
  INFLATION_RATE: 0.03,
  /** Conservative investment return assumption */
  INVESTMENT_RETURN: 0.07,
  /** Safe withdrawal rate for retirement planning */
  SAFE_WITHDRAWAL_RATE: 0.04,
  /** Average real return (investment return - inflation) */
  REAL_RETURN: 0.04,
} as const;

/**
 * Life Expectancy Tables (simplified)
 * Source: SSA Actuarial Life Table 2024
 * Note: These are approximations - consult actuarial tables for precise calculations
 */
export const LIFE_EXPECTANCY = {
  /** Life expectancy at birth */
  AT_BIRTH: {
    MALE: 74.8,
    FEMALE: 80.2,
    COMBINED: 77.5,
  },
  /** Life expectancy at age 65 */
  AT_65: {
    MALE: 83.0,
    FEMALE: 85.7,
    COMBINED: 84.3,
  },
  /** Life expectancy at age 70 */
  AT_70: {
    MALE: 84.4,
    FEMALE: 86.9,
    COMBINED: 85.7,
  },
} as const;

// ===========================
// INSURANCE CONSTANTS
// ===========================

/**
 * Life Insurance Planning Guidelines
 * Industry standard recommendations
 */
export const LIFE_INSURANCE_GUIDELINES = {
  /** Income replacement multiples by age */
  INCOME_MULTIPLES: {
    AGE_20_29: 30,
    AGE_30_39: 20,
    AGE_40_49: 15,
    AGE_50_59: 10,
    AGE_60_PLUS: 5,
  },
  /** Minimum coverage recommendations */
  MINIMUM_COVERAGE: {
    /** 10x annual income is common baseline */
    INCOME_MULTIPLE: 10,
    /** Additional for mortgage */
    MORTGAGE_COVERAGE: 1.0,
    /** Per child for education */
    EDUCATION_PER_CHILD: 100_000,
  },
} as const;

/**
 * Disability Insurance Guidelines
 * Industry standard recommendations
 */
export const DISABILITY_INSURANCE_GUIDELINES = {
  /** Recommended income replacement percentage */
  INCOME_REPLACEMENT_PERCENTAGE: 0.6,
  /** Maximum benefit period options (years) */
  BENEFIT_PERIODS: [2, 5, 10, "TO_AGE_65", "LIFETIME"] as const,
  /** Typical elimination periods (days) */
  ELIMINATION_PERIODS: [30, 60, 90, 180] as const,
} as const;

// ===========================
// RETIREMENT PLANNING CONSTANTS
// ===========================

/**
 * 401(k) Contribution Limits for 2025
 * Source: IRS Notice 2024-80
 */
export const RETIREMENT_401K_LIMITS_2025 = {
  /** Employee elective deferral limit */
  EMPLOYEE_CONTRIBUTION: 23_500,
  /** Catch-up contribution for age 50+ */
  CATCH_UP_STANDARD: 7_500,
  /** Enhanced catch-up for ages 60-63 (SECURE 2.0) */
  CATCH_UP_ENHANCED: 11_250,
  /** Total annual contribution limit (employee + employer) */
  TOTAL_CONTRIBUTION: 70_000,
  /** Total with catch-up */
  TOTAL_WITH_CATCH_UP: 77_500,
  /** Highly compensated employee threshold */
  HCE_THRESHOLD: 160_000,
} as const;

/**
 * IRA Contribution Limits for 2025
 * Source: IRS Notice 2024-80
 */
export const IRA_LIMITS_2025 = {
  /** Traditional and Roth IRA contribution limit */
  CONTRIBUTION_LIMIT: 7_000,
  /** Catch-up contribution for age 50+ */
  CATCH_UP: 1_000,
  /** Total with catch-up */
  TOTAL_WITH_CATCH_UP: 8_000,
} as const;

/**
 * Roth IRA Income Phase-out Ranges for 2025
 * Source: IRS Notice 2024-80
 */
export const ROTH_IRA_INCOME_LIMITS_2025 = {
  /** Single filers */
  SINGLE: {
    PHASE_OUT_START: 146_000,
    PHASE_OUT_END: 161_000,
  },
  /** Married filing jointly */
  MARRIED_FILING_JOINTLY: {
    PHASE_OUT_START: 230_000,
    PHASE_OUT_END: 240_000,
  },
  /** Married filing separately */
  MARRIED_FILING_SEPARATELY: {
    PHASE_OUT_START: 0,
    PHASE_OUT_END: 10_000,
  },
} as const;

/**
 * Other Retirement Account Limits for 2025
 */
export const OTHER_RETIREMENT_LIMITS_2025 = {
  /** SIMPLE IRA */
  SIMPLE_IRA: {
    EMPLOYEE_CONTRIBUTION: 16_000,
    CATCH_UP: 3_500,
  },
  /** SEP IRA */
  SEP_IRA: {
    /** Lesser of 25% of compensation or this amount */
    MAX_CONTRIBUTION: 70_000,
    /** Maximum compensation considered */
    COMPENSATION_LIMIT: 350_000,
  },
  /** Solo 401(k) */
  SOLO_401K: {
    /** Same as regular 401(k) for employee deferrals */
    EMPLOYEE_CONTRIBUTION: 23_500,
    /** Total contribution limit */
    TOTAL_CONTRIBUTION: 70_000,
  },
} as const;

// ===========================
// SOCIAL SECURITY CONSTANTS
// ===========================

/**
 * Social Security Constants for 2025
 * Source: SSA.gov
 */
export const SOCIAL_SECURITY_2025 = {
  /** Full retirement age by birth year */
  FULL_RETIREMENT_AGE: {
    BORN_1943_1954: 66,
    BORN_1955: 66.17, // 66 and 2 months
    BORN_1956: 66.33, // 66 and 4 months
    BORN_1957: 66.5, // 66 and 6 months
    BORN_1958: 66.67, // 66 and 8 months
    BORN_1959: 66.83, // 66 and 10 months
    BORN_1960_OR_LATER: 67,
  },
  /** Maximum taxable earnings */
  WAGE_BASE: 176_100,
  /** Earnings test exempt amounts */
  EARNINGS_TEST: {
    UNDER_FRA: 22_320, // Annual limit if under full retirement age
    YEAR_OF_FRA: 59_520, // Annual limit in year reaching FRA
  },
} as const;

// ===========================
// MEDICARE CONSTANTS
// ===========================

/**
 * Medicare Premium Surcharges for 2025 (IRMAA)
 * Source: CMS.gov
 */
export const MEDICARE_IRMAA_2025 = {
  /** Income thresholds for single filers */
  SINGLE_THRESHOLDS: [
    { income: 106_000, partB: 0, partD: 0 },
    { income: 133_000, partB: 73.9, partD: 12.9 },
    { income: 167_000, partB: 184.7, partD: 33.3 },
    { income: 200_000, partB: 295.5, partD: 53.8 },
    { income: 500_000, partB: 406.3, partD: 74.2 },
    { income: Infinity, partB: 443.0, partD: 81.0 },
  ],
  /** Income thresholds for married filing jointly */
  MARRIED_THRESHOLDS: [
    { income: 212_000, partB: 0, partD: 0 },
    { income: 266_000, partB: 73.9, partD: 12.9 },
    { income: 334_000, partB: 184.7, partD: 33.3 },
    { income: 400_000, partB: 295.5, partD: 53.8 },
    { income: 750_000, partB: 406.3, partD: 74.2 },
    { income: Infinity, partB: 443.0, partD: 81.0 },
  ],
} as const;

// ===========================
// TAX PLANNING CONSTANTS
// ===========================

/**
 * Capital Gains Tax Rates for 2025
 * Source: IRS Rev. Proc. 2024-40
 */
export const CAPITAL_GAINS_TAX_2025 = {
  /** Long-term capital gains rates */
  LONG_TERM: {
    /** 0% rate thresholds */
    RATE_0: {
      SINGLE: 48_350,
      MARRIED_FILING_JOINTLY: 96_700,
      HEAD_OF_HOUSEHOLD: 64_750,
    },
    /** 15% rate thresholds (up to these amounts) */
    RATE_15: {
      SINGLE: 533_400,
      MARRIED_FILING_JOINTLY: 600_050,
      HEAD_OF_HOUSEHOLD: 566_700,
    },
    /** 20% rate applies above 15% thresholds */
    RATE_20: 0.2,
  },
  /** Net Investment Income Tax */
  NIIT: {
    RATE: 0.038,
    THRESHOLD_SINGLE: 200_000,
    THRESHOLD_MARRIED: 250_000,
  },
} as const;

/**
 * Standard Deduction for 2025
 * Source: IRS Rev. Proc. 2024-40
 */
export const STANDARD_DEDUCTION_2025 = {
  SINGLE: 15_000,
  MARRIED_FILING_JOINTLY: 30_000,
  HEAD_OF_HOUSEHOLD: 22_500,
  /** Additional standard deduction for age 65+ or blind */
  ADDITIONAL: {
    SINGLE: 2_050,
    MARRIED: 1_600,
  },
} as const;
