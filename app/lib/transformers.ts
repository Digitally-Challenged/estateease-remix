/**
 * Transformation functions for converting between database and application types
 * Handles case conversion, JSON parsing, and type safety
 */

import type {
  DatabaseAsset,
  DatabaseTrust,
  DatabaseFamilyMember,
  DatabaseTrustTrustee,
  DatabaseTrustBeneficiary,
  DatabaseLegalRole,
  DatabaseHealthcareDirective,
  DatabaseBeneficiary,
  DatabaseProfessional,
  DatabaseEmergencyContact
} from './dal';

import type {
  FamilyMember,
  LegalRole,
  HealthcareDirective,
  Beneficiary,
  Professional,
  EmergencyContact
} from '../types/people';

import type {
  Trust,
  Trustee,
  TrustBeneficiary
} from '../types/trusts';

import type {
  AnyEnhancedAsset,
  OwnershipInfo,
  RealEstateAsset,
  FinancialAccount,
  InsurancePolicy,
  BusinessInterest,
  Vehicle,
  PersonalProperty,
  Debt
} from '../types/assets';

import {
  AssetCategory,
  PropertyType,
  FinancialAccountType,
  InsurancePolicyType,
  VehicleType,
  DebtType
} from '../types/enums';

// =============================================
// UTILITY FUNCTIONS
// =============================================

/**
 * Safely parse JSON strings with fallback
 */
function parseJsonField<T>(jsonString: string | null, fallback: T): T {
  if (!jsonString) return fallback;
  try {
    return JSON.parse(jsonString) as T;
  } catch {
    return fallback;
  }
}

/**
 * Parse JSON array fields (like powers, specializations)
 */
function parseJsonArray(jsonString: string | null): string[] {
  return parseJsonField(jsonString, []);
}

/**
 * Convert string to UPPERCASE for database storage
 */
function toUpperCase(value: string | undefined | null): string | null {
  return value ? value.toUpperCase() : null;
}

/**
 * Convert database numeric boolean to TypeScript boolean
 */
function toBoolean(value: number | null | undefined): boolean {
  return Boolean(value);
}

/**
 * Convert database preferred contact to typed value
 */
function toPreferredContact(value: string | null | undefined): 'phone' | 'email' | 'text' | undefined {
  if (!value) return undefined;
  const lowerValue = value.toLowerCase();
  if (lowerValue === 'phone' || lowerValue === 'email' || lowerValue === 'text') {
    return lowerValue as 'phone' | 'email' | 'text';
  }
  return undefined;
}

// =============================================
// ASSET TRANSFORMATIONS
// =============================================

/**
 * Transform database asset to application asset type
 */
export function transformDatabaseAsset(dbAsset: DatabaseAsset): AnyEnhancedAsset {
  const ownershipDetails = parseJsonField(dbAsset.ownership_details, {}) as Record<string, unknown>;
  const assetDetails = parseJsonField(dbAsset.asset_details, {}) as Record<string, unknown>;
  
  // Base asset properties
  const baseAsset = {
    id: dbAsset.asset_id,
    name: dbAsset.name,
    value: dbAsset.value,
    notes: dbAsset.notes || undefined,
    ownership: {
      type: dbAsset.ownership_type.toLowerCase() as OwnershipInfo['type'],
      percentage: ownershipDetails.percentage || 100,
      trustId: ownershipDetails.trustId,
      businessEntityId: ownershipDetails.businessEntityId,
      ...ownershipDetails
    } as OwnershipInfo
  };

  // Return type-specific asset based on category
  switch (dbAsset.category) {
    case 'REAL_ESTATE':
      return {
        ...baseAsset,
        category: AssetCategory.REAL_ESTATE,
        propertyType: assetDetails.propertyType || PropertyType.SINGLE_FAMILY,
        address: assetDetails.address || '',
        mortgageBalance: assetDetails.mortgageBalance || 0,
        monthlyRent: assetDetails.monthlyRent || 0,
        annualPropertyTax: assetDetails.annualPropertyTax || 0,
        annualInsurance: assetDetails.annualInsurance || 0,
        lastAppraisalDate: assetDetails.lastAppraisalDate,
        lastAppraisalValue: assetDetails.lastAppraisalValue
      } as RealEstateAsset;
      
    case 'FINANCIAL_ACCOUNT':
      return {
        ...baseAsset,
        category: AssetCategory.FINANCIAL_ACCOUNT,
        accountType: assetDetails.accountType || FinancialAccountType.CHECKING,
        institution: assetDetails.institution || '',
        accountNumber: assetDetails.accountNumber || '',
        interestRate: assetDetails.interestRate,
        maturityDate: assetDetails.maturityDate,
        beneficiaries: assetDetails.beneficiaries
      } as FinancialAccount;
      
    case 'INSURANCE_POLICY':
      return {
        ...baseAsset,
        category: AssetCategory.INSURANCE_POLICY,
        policyType: assetDetails.policyType || InsurancePolicyType.LIFE,
        insurer: assetDetails.insurer || '',
        policyNumber: assetDetails.policyNumber || '',
        coverageAmount: assetDetails.coverageAmount || dbAsset.value,
        premium: assetDetails.premium || { amount: 0, frequency: 'monthly' },
        deductible: assetDetails.deductible || 0,
        beneficiaries: assetDetails.beneficiaries,
        expirationDate: assetDetails.expirationDate
      } as InsurancePolicy;
      
    case 'BUSINESS_INTEREST':
      return {
        ...baseAsset,
        category: AssetCategory.BUSINESS_INTEREST,
        businessType: assetDetails.businessType || '',
        businessName: assetDetails.businessName || dbAsset.name,
        taxId: assetDetails.taxId || '',
        percentageOwned: assetDetails.percentageOwned || 100,
        valuationMethod: assetDetails.valuationMethod || 'income_approach',
        valuationDate: assetDetails.valuationDate || new Date().toISOString(),
        annualRevenue: assetDetails.annualRevenue,
        annualProfit: assetDetails.annualProfit
      } as BusinessInterest;
      
    case 'VEHICLE':
      return {
        ...baseAsset,
        category: AssetCategory.VEHICLE,
        vehicleType: assetDetails.vehicleType || VehicleType.CAR,
        year: assetDetails.year || new Date().getFullYear(),
        make: assetDetails.make || '',
        model: assetDetails.model || '',
        vin: assetDetails.vin || '',
        loanBalance: assetDetails.loanBalance,
        monthlyPayment: assetDetails.monthlyPayment
      } as Vehicle;
      
    case 'PERSONAL_PROPERTY':
      return {
        ...baseAsset,
        category: AssetCategory.PERSONAL_PROPERTY,
        itemType: assetDetails.itemType || '',
        description: assetDetails.description || dbAsset.name,
        location: assetDetails.location,
        purchaseDate: assetDetails.purchaseDate,
        purchasePrice: assetDetails.purchasePrice
      } as PersonalProperty;
      
    case 'DEBT':
      return {
        ...baseAsset,
        category: AssetCategory.DEBT,
        debtType: assetDetails.debtType || DebtType.OTHER,
        creditor: assetDetails.creditor || '',
        accountNumber: assetDetails.accountNumber,
        originalAmount: assetDetails.originalAmount || dbAsset.value,
        currentBalance: assetDetails.currentBalance || dbAsset.value,
        interestRate: assetDetails.interestRate || 0,
        monthlyPayment: assetDetails.monthlyPayment || 0,
        maturityDate: assetDetails.maturityDate
      } as Debt;
      
    default:
      // Fallback for unknown categories
      return {
        ...baseAsset,
        category: dbAsset.category as AssetCategory,
        ...assetDetails
      } as AnyEnhancedAsset;
  }
}

/**
 * Transform application asset to database format
 */
export function transformAssetToDatabase(asset: Partial<AnyEnhancedAsset>): {
  category: string;
  ownership_type: string;
  ownership_details: string;
  asset_details: string;
} {
  const ownershipDetails: Record<string, unknown> = {};
  const assetDetails: Record<string, unknown> = {};
  
  // Extract ownership details
  if (asset.ownership) {
    ownershipDetails.percentage = asset.ownership.percentage || 100;
    if (asset.ownership.trustId) ownershipDetails.trustId = asset.ownership.trustId;
    if (asset.ownership.businessEntityId) ownershipDetails.businessEntityId = asset.ownership.businessEntityId;
    if (asset.ownership.owners) ownershipDetails.owners = asset.ownership.owners;
    if (asset.ownership.survivorshipRights !== undefined) ownershipDetails.survivorshipRights = asset.ownership.survivorshipRights;
    if (asset.ownership.tenancyType) ownershipDetails.tenancyType = asset.ownership.tenancyType;
    if (asset.ownership.notes) ownershipDetails.notes = asset.ownership.notes;
  }
  
  // Extract category-specific details
  switch (asset.category) {
    case AssetCategory.REAL_ESTATE: {
      const realEstate = asset as Partial<RealEstateAsset>;
      if (realEstate.propertyType) assetDetails.propertyType = realEstate.propertyType;
      if (realEstate.address) assetDetails.address = realEstate.address;
      if (realEstate.mortgageBalance !== undefined) assetDetails.mortgageBalance = realEstate.mortgageBalance;
      if (realEstate.monthlyRent !== undefined) assetDetails.monthlyRent = realEstate.monthlyRent;
      if (realEstate.annualPropertyTax !== undefined) assetDetails.annualPropertyTax = realEstate.annualPropertyTax;
      if (realEstate.annualInsurance !== undefined) assetDetails.annualInsurance = realEstate.annualInsurance;
      if (realEstate.lastAppraisalDate) assetDetails.lastAppraisalDate = realEstate.lastAppraisalDate;
      if (realEstate.lastAppraisalValue !== undefined) assetDetails.lastAppraisalValue = realEstate.lastAppraisalValue;
      break;
    }
      
    case AssetCategory.FINANCIAL_ACCOUNT: {
      const financial = asset as Partial<FinancialAccount>;
      if (financial.accountType) assetDetails.accountType = financial.accountType;
      if (financial.institution) assetDetails.institution = financial.institution;
      if (financial.accountNumber) assetDetails.accountNumber = financial.accountNumber;
      if (financial.interestRate !== undefined) assetDetails.interestRate = financial.interestRate;
      if (financial.maturityDate) assetDetails.maturityDate = financial.maturityDate;
      if (financial.beneficiaries) assetDetails.beneficiaries = financial.beneficiaries;
      break;
    }
      
    case AssetCategory.INSURANCE_POLICY: {
      const insurance = asset as Partial<InsurancePolicy>;
      if (insurance.policyType) assetDetails.policyType = insurance.policyType;
      if (insurance.insurer) assetDetails.insurer = insurance.insurer;
      if (insurance.policyNumber) assetDetails.policyNumber = insurance.policyNumber;
      if (insurance.coverageAmount !== undefined) assetDetails.coverageAmount = insurance.coverageAmount;
      if (insurance.premium) assetDetails.premium = insurance.premium;
      if (insurance.deductible !== undefined) assetDetails.deductible = insurance.deductible;
      if (insurance.beneficiaries) assetDetails.beneficiaries = insurance.beneficiaries;
      if (insurance.expirationDate) assetDetails.expirationDate = insurance.expirationDate;
      break;
    }
      
    case AssetCategory.BUSINESS_INTEREST: {
      const business = asset as Partial<BusinessInterest>;
      if (business.businessType) assetDetails.businessType = business.businessType;
      if (business.businessName) assetDetails.businessName = business.businessName;
      if (business.taxId) assetDetails.taxId = business.taxId;
      if (business.percentageOwned !== undefined) assetDetails.percentageOwned = business.percentageOwned;
      if (business.valuationMethod) assetDetails.valuationMethod = business.valuationMethod;
      if (business.valuationDate) assetDetails.valuationDate = business.valuationDate;
      if (business.annualRevenue !== undefined) assetDetails.annualRevenue = business.annualRevenue;
      if (business.annualProfit !== undefined) assetDetails.annualProfit = business.annualProfit;
      break;
    }
      
    case AssetCategory.VEHICLE: {
      const vehicle = asset as Partial<Vehicle>;
      if (vehicle.vehicleType) assetDetails.vehicleType = vehicle.vehicleType;
      if (vehicle.year !== undefined) assetDetails.year = vehicle.year;
      if (vehicle.make) assetDetails.make = vehicle.make;
      if (vehicle.model) assetDetails.model = vehicle.model;
      if (vehicle.vin) assetDetails.vin = vehicle.vin;
      if (vehicle.loanBalance !== undefined) assetDetails.loanBalance = vehicle.loanBalance;
      if (vehicle.monthlyPayment !== undefined) assetDetails.monthlyPayment = vehicle.monthlyPayment;
      break;
    }
      
    case AssetCategory.PERSONAL_PROPERTY: {
      const personal = asset as Partial<PersonalProperty>;
      if (personal.itemType) assetDetails.itemType = personal.itemType;
      if (personal.description) assetDetails.description = personal.description;
      if (personal.location) assetDetails.location = personal.location;
      if (personal.purchaseDate) assetDetails.purchaseDate = personal.purchaseDate;
      if (personal.purchasePrice !== undefined) assetDetails.purchasePrice = personal.purchasePrice;
      break;
    }
      
    case AssetCategory.DEBT: {
      const debt = asset as Partial<Debt>;
      if (debt.debtType) assetDetails.debtType = debt.debtType;
      if (debt.creditor) assetDetails.creditor = debt.creditor;
      if (debt.accountNumber) assetDetails.accountNumber = debt.accountNumber;
      if (debt.originalAmount !== undefined) assetDetails.originalAmount = debt.originalAmount;
      if (debt.currentBalance !== undefined) assetDetails.currentBalance = debt.currentBalance;
      if (debt.interestRate !== undefined) assetDetails.interestRate = debt.interestRate;
      if (debt.monthlyPayment !== undefined) assetDetails.monthlyPayment = debt.monthlyPayment;
      if (debt.maturityDate) assetDetails.maturityDate = debt.maturityDate;
      break;
    }
  }
  
  return {
    category: toUpperCase(asset.category) || 'PERSONAL_PROPERTY',
    ownership_type: toUpperCase(asset.ownership?.type) || 'INDIVIDUAL',
    ownership_details: JSON.stringify(ownershipDetails),
    asset_details: JSON.stringify(assetDetails)
  };
}

// =============================================
// TRUST TRANSFORMATIONS
// =============================================

/**
 * Transform database trust to application trust type
 */
export function transformDatabaseTrust(
  dbTrust: DatabaseTrust,
  trustees: DatabaseTrustTrustee[],
  beneficiaries: DatabaseTrustBeneficiary[]
): Trust {
  return {
    id: dbTrust.trust_id,
    name: dbTrust.name,
    type: dbTrust.trust_type_code as Trust['type'],
    taxId: dbTrust.tax_id || '',
    dateCreated: dbTrust.date_created,
    grantor: dbTrust.grantor,
    trustees: trustees.map(transformDatabaseTrustee),
    beneficiaries: beneficiaries.map(transformDatabaseTrustBeneficiary),
    purpose: dbTrust.purpose || '',
    isActive: toBoolean(dbTrust.is_active)
  };
}

/**
 * Transform database trustee to application trustee type
 */
export function transformDatabaseTrustee(dbTrustee: DatabaseTrustTrustee): Trustee {
  return {
    name: dbTrustee.trustee_name,
    type: dbTrustee.trustee_type_code as Trustee['type'],
    powers: parseJsonArray(dbTrustee.powers),
    startDate: dbTrustee.start_date || undefined,
    endDate: dbTrustee.end_date || undefined,
    orderOfSuccession: dbTrustee.order_of_succession || undefined
  };
}

/**
 * Transform database trust beneficiary to application type
 */
export function transformDatabaseTrustBeneficiary(dbBenef: DatabaseTrustBeneficiary): TrustBeneficiary {
  return {
    name: dbBenef.beneficiary_name,
    type: dbBenef.beneficiary_type_code as TrustBeneficiary['type'],
    relationship: dbBenef.relationship_type_code || '',
    percentage: dbBenef.percentage || undefined,
    conditions: dbBenef.conditions || undefined
  };
}

/**
 * Transform application trust to database format
 */
export function transformTrustToDatabase(trust: Partial<Trust>): {
  trust_type_code: string | null;
} {
  return {
    trust_type_code: toUpperCase(trust.type)
  };
}

// =============================================
// FAMILY MEMBER TRANSFORMATIONS
// =============================================

/**
 * Transform database family member to application type
 */
export function transformDatabaseFamilyMember(dbMember: DatabaseFamilyMember): FamilyMember {
  return {
    id: dbMember.family_member_id,
    name: dbMember.name,
    relationship: dbMember.relationship_code.toLowerCase() as FamilyMember['relationship'],
    dateOfBirth: dbMember.date_of_birth || undefined,
    isMinor: toBoolean(dbMember.is_minor),
    isDependent: toBoolean(dbMember.is_dependent),
    contactInfo: {
      primaryPhone: dbMember.primary_phone || undefined,
      secondaryPhone: dbMember.secondary_phone || undefined,
      email: dbMember.email || undefined,
      preferredContact: toPreferredContact(dbMember.preferred_contact),
      address: (dbMember.street1 && dbMember.city && dbMember.state && dbMember.zip_code) ? {
        street1: dbMember.street1,
        street2: dbMember.street2 || undefined,
        city: dbMember.city,
        state: dbMember.state,
        zipCode: dbMember.zip_code
      } : undefined
    },
    notes: dbMember.notes || undefined
  };
}

/**
 * Transform application family member to database format
 */
export function transformFamilyMemberToDatabase(member: Partial<FamilyMember>): {
  relationship_code: string | null;
  name?: string;
  date_of_birth?: string | null;
  is_minor?: number;
  is_dependent?: number;
  primary_phone?: string | null;
  secondary_phone?: string | null;
  email?: string | null;
  preferred_contact?: string | null;
  street1?: string | null;
  street2?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
  country?: string | null;
  notes?: string | null;
} {
  const result: ReturnType<typeof transformFamilyMemberToDatabase> = {
    relationship_code: toUpperCase(member.relationship)
  };
  
  if (member.name !== undefined) result.name = member.name;
  if (member.dateOfBirth !== undefined) result.date_of_birth = member.dateOfBirth || null;
  if (member.isMinor !== undefined) result.is_minor = member.isMinor ? 1 : 0;
  if (member.isDependent !== undefined) result.is_dependent = member.isDependent ? 1 : 0;
  if (member.notes !== undefined) result.notes = member.notes || null;
  
  if (member.contactInfo) {
    if (member.contactInfo.primaryPhone !== undefined) result.primary_phone = member.contactInfo.primaryPhone || null;
    if (member.contactInfo.secondaryPhone !== undefined) result.secondary_phone = member.contactInfo.secondaryPhone || null;
    if (member.contactInfo.email !== undefined) result.email = member.contactInfo.email || null;
    if (member.contactInfo.preferredContact !== undefined) result.preferred_contact = member.contactInfo.preferredContact || null;
    
    if (member.contactInfo.address) {
      if (member.contactInfo.address.street1 !== undefined) result.street1 = member.contactInfo.address.street1 || null;
      if (member.contactInfo.address.street2 !== undefined) result.street2 = member.contactInfo.address.street2 || null;
      if (member.contactInfo.address.city !== undefined) result.city = member.contactInfo.address.city || null;
      if (member.contactInfo.address.state !== undefined) result.state = member.contactInfo.address.state || null;
      if (member.contactInfo.address.zipCode !== undefined) result.zip_code = member.contactInfo.address.zipCode || null;
    }
  }
  
  return result;
}

// =============================================
// OTHER TRANSFORMATIONS
// =============================================

/**
 * Transform database legal role to application type
 */
export function transformDatabaseLegalRole(dbRole: DatabaseLegalRole): LegalRole {
  return {
    id: dbRole.legal_role_id,
    roleType: dbRole.role_type_code.toLowerCase() as LegalRole['roleType'],
    personId: dbRole.person_id || '',
    personName: dbRole.person_name,
    isPrimary: toBoolean(dbRole.is_primary),
    orderOfPrecedence: dbRole.order_of_precedence || undefined,
    specificPowers: parseJsonArray(dbRole.specific_powers),
    compensation: {
      type: (dbRole.compensation_type || 'none') as 'none' | 'hourly' | 'percentage' | 'flat_fee',
      amount: dbRole.compensation_amount || undefined,
      details: dbRole.compensation_details || undefined
    },
    startDate: dbRole.start_date || undefined,
    endDate: dbRole.end_date || undefined,
    endConditions: dbRole.end_conditions || undefined,
    notes: dbRole.notes || undefined
  };
}

/**
 * Transform database healthcare directive to application type
 */
export function transformDatabaseHealthcareDirective(dbDirective: DatabaseHealthcareDirective): HealthcareDirective {
  const base = {
    id: dbDirective.directive_id,
    type: dbDirective.directive_type_code as HealthcareDirective['type'],
    dateCreated: dbDirective.date_created,
    lastUpdated: dbDirective.last_updated
  };

  if (dbDirective.directive_type_code === 'healthcare_proxy') {
    return {
      ...base,
      personId: dbDirective.person_id || undefined,
      personName: dbDirective.person_name || undefined,
      isPrimary: toBoolean(dbDirective.is_primary)
    };
  } else {
    return {
      ...base,
      decisions: {
        lifeSustaining: dbDirective.life_sustaining_decision as 'continue' | 'discontinue' | 'depends' | undefined,
        artificialNutrition: dbDirective.artificial_nutrition_decision as 'continue' | 'discontinue' | 'depends' | undefined,
        painManagement: dbDirective.pain_management_instructions || undefined,
        organDonation: toBoolean(dbDirective.organ_donation),
        bodyDisposition: dbDirective.body_disposition as 'burial' | 'cremation' | 'donation' | undefined
      },
      religiousPreferences: dbDirective.religious_preferences || undefined,
      additionalInstructions: dbDirective.additional_instructions || undefined
    };
  }
}

/**
 * Transform database beneficiary to application type
 */
export function transformDatabaseBeneficiary(dbBenef: DatabaseBeneficiary): Beneficiary {
  return {
    id: dbBenef.beneficiary_id,
    name: dbBenef.name,
    relationship: dbBenef.relationship_code as Beneficiary['relationship'],
    percentage: dbBenef.percentage || undefined,
    isPrimary: toBoolean(dbBenef.is_primary),
    isContingent: toBoolean(dbBenef.is_contingent),
    contingentTo: dbBenef.contingent_to || undefined,
    perStirpes: toBoolean(dbBenef.per_stirpes),
    contactInfo: {
      primaryPhone: dbBenef.primary_phone || undefined,
      email: dbBenef.email || undefined,
      preferredContact: toPreferredContact(dbBenef.preferred_contact)
    },
    notes: dbBenef.notes || undefined
  };
}

/**
 * Transform database professional to application type
 */
export function transformDatabaseProfessional(dbProf: DatabaseProfessional): Professional {
  return {
    id: dbProf.professional_id,
    name: dbProf.name,
    type: dbProf.professional_type_code as Professional['type'],
    firm: dbProf.firm || undefined,
    title: dbProf.title || undefined,
    specializations: parseJsonArray(dbProf.specializations),
    contactInfo: {
      primaryPhone: dbProf.primary_phone || undefined,
      secondaryPhone: dbProf.secondary_phone || undefined,
      email: dbProf.email || undefined,
      preferredContact: toPreferredContact(dbProf.preferred_contact),
      address: dbProf.street1 ? {
        street1: dbProf.street1,
        street2: dbProf.street2 || undefined,
        city: dbProf.city || '',
        state: dbProf.state || '',
        zipCode: dbProf.zip_code || ''
      } : undefined
    },
    credentials: parseJsonArray(dbProf.credentials),
    yearsExperience: dbProf.years_experience || undefined,
    isPreferredProvider: toBoolean(dbProf.is_preferred_provider),
    notes: dbProf.notes || undefined
  };
}

/**
 * Transform database emergency contact to application type
 */
export function transformDatabaseEmergencyContact(dbContact: DatabaseEmergencyContact): EmergencyContact {
  return {
    id: dbContact.contact_id,
    name: dbContact.name,
    relationship: dbContact.relationship_code,
    contactType: dbContact.contact_type as EmergencyContact['contactType'],
    contactInfo: {
      primaryPhone: dbContact.primary_phone,
      secondaryPhone: dbContact.secondary_phone || undefined,
      email: dbContact.email || undefined,
      preferredContact: toPreferredContact(dbContact.preferred_contact)
    },
    priority: dbContact.priority,
    availability: dbContact.availability || undefined,
    medicalAuthority: toBoolean(dbContact.medical_authority),
    canMakeDecisions: toBoolean(dbContact.can_make_decisions),
    languages: parseJsonArray(dbContact.languages),
    notes: dbContact.notes || undefined
  };
}

// =============================================
// DASHBOARD & FINANCIAL TRANSFORMATIONS
// =============================================

/**
 * Transform dashboard stats for consistent format
 */
export function transformDashboardStats(stats: {
  total_net_worth?: number | null;
  real_estate_value?: number | null;
  investment_value?: number | null;
  business_value?: number | null;
  insurance_value?: number | null;
  total_assets?: number | null;
  active_trusts?: number | null;
  assets_by_category?: Array<{
    category: string;
    category_value?: number | null;
    category_count?: number | null;
  }>;
}): {
  totalNetWorth: number;
  realEstateValue: number;
  investmentValue: number;
  businessValue: number;
  insuranceValue: number;
  totalAssets: number;
  activeTrusts: number;
  assetsByCategory: Array<{
    category: string;
    value: number;
    count: number;
  }>;
} {
  return {
    totalNetWorth: stats.total_net_worth || 0,
    realEstateValue: stats.real_estate_value || 0,
    investmentValue: stats.investment_value || 0,
    businessValue: stats.business_value || 0,
    insuranceValue: stats.insurance_value || 0,
    totalAssets: stats.total_assets || 0,
    activeTrusts: stats.active_trusts || 0,
    assetsByCategory: (stats.assets_by_category || []).map((cat) => ({
      category: cat.category,
      value: cat.category_value || 0,
      count: cat.category_count || 0
    }))
  };
}

/**
 * Transform financial overview data
 */
export function transformFinancialOverview(data: {
  netWorth?: number;
  assetAllocation?: Record<string, { value: number; percentage: number; count: number }>;
  ownershipSummary?: {
    trust: number;
    joint: number;
    individual: number;
    business: number;
    total: number;
  };
  trustValues?: Record<string, number>;
  estateTax?: {
    taxableEstate: number;
    estateTax: number;
    effectiveRate: number;
    exemption: number;
  };
  cashFlow?: {
    monthlyIncome: number;
    annualIncome: number;
    incomeGeneratingAssets: number;
  };
  liquidity?: {
    liquidAssets: number;
    illiquidAssets: number;
    liquidityRatio: number;
  };
}): {
  netWorth: number;
  assetAllocation: Record<string, { value: number; percentage: number; count: number }>;
  ownershipSummary: {
    trust: number;
    joint: number;
    individual: number;
    business: number;
    total: number;
  };
  trustValues: Record<string, number>;
  estateTax: {
    taxableEstate: number;
    estateTax: number;
    effectiveRate: number;
    exemption: number;
  };
  cashFlow: {
    monthlyIncome: number;
    annualIncome: number;
    incomeGeneratingAssets: number;
  };
  liquidity: {
    liquidAssets: number;
    illiquidAssets: number;
    liquidityRatio: number;
  };
} {
  return {
    netWorth: data.netWorth || 0,
    assetAllocation: data.assetAllocation || {},
    ownershipSummary: data.ownershipSummary || {
      trust: 0,
      joint: 0,
      individual: 0,
      business: 0,
      total: 0
    },
    trustValues: data.trustValues || {},
    estateTax: data.estateTax || {
      taxableEstate: 0,
      estateTax: 0,
      effectiveRate: 0,
      exemption: 0
    },
    cashFlow: data.cashFlow || {
      monthlyIncome: 0,
      annualIncome: 0,
      incomeGeneratingAssets: 0
    },
    liquidity: data.liquidity || {
      liquidAssets: 0,
      illiquidAssets: 0,
      liquidityRatio: 0
    }
  };
}