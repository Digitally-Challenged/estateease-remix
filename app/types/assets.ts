import {
  AssetCategory,
  PropertyType,
  FinancialAccountType,
  InsurancePolicyType,
  VehicleType,
  DebtType,
  OwnershipType
} from './enums';

export interface BaseAsset {
  id: string;
  userId?: string;
  name: string;
  category: AssetCategory;
  type?: string;
  description?: string;
  value: number;
  ownership: OwnershipInfo;
  notes?: string;
  details?: Record<string, unknown>;
}

export interface OwnershipInfo {
  type: OwnershipType;
  trustId?: string;
  businessId?: string;
  businessEntityId?: string;
  percentage?: number;
  owners?: {
    nick?: { percentage: number; isPrimary: boolean };
    kelsey?: { percentage: number; isPrimary: boolean };
    other?: Record<string, { percentage: number; isPrimary: boolean }>;
  };
  survivorshipRights?: boolean;
  tenancyType?: 'joint_tenancy' | 'tenants_in_common' | 'community_property';
  notes?: string;
}

export interface RealEstateAsset extends BaseAsset {
  category: AssetCategory.REAL_ESTATE;
  propertyType: PropertyType;
  address: string;
  mortgageBalance: number;
  monthlyRent: number;
  annualPropertyTax: number;
  annualInsurance: number;
  lastAppraisalDate?: string;
  lastAppraisalValue?: number;
}

export interface FinancialAccount extends BaseAsset {
  category: AssetCategory.FINANCIAL_ACCOUNT;
  accountType: FinancialAccountType;
  institution: string;
  accountNumber: string;
  interestRate?: number;
  maturityDate?: string;
  beneficiaries?: {
    primary?: BeneficiaryInfo[];
    contingent?: BeneficiaryInfo[];
  };
}

export interface BeneficiaryInfo {
  id: string;
  name: string;
  relationship: string;
  percentage: number;
}

export interface InsurancePolicy extends BaseAsset {
  category: AssetCategory.INSURANCE_POLICY;
  policyType: InsurancePolicyType;
  insurer: string;
  policyNumber: string;
  coverageAmount: number;
  premium: {
    amount: number;
    frequency: 'monthly' | 'quarterly' | 'semi-annually' | 'annually';
  };
  deductible: number;
  beneficiaries?: {
    primary?: BeneficiaryInfo[];
    contingent?: BeneficiaryInfo[];
  };
  expirationDate?: string;
}

export interface BusinessInterest extends BaseAsset {
  category: AssetCategory.BUSINESS_INTEREST;
  businessType: string;
  businessName: string;
  taxId: string;
  percentageOwned: number;
  valuationMethod: 'income_approach' | 'asset_approach' | 'market_approach';
  valuationDate: string;
  annualRevenue?: number;
  annualProfit?: number;
}

export interface Vehicle extends BaseAsset {
  category: AssetCategory.VEHICLE;
  vehicleType: VehicleType;
  year: number;
  make: string;
  model: string;
  vin: string;
  loanBalance?: number;
  monthlyPayment?: number;
}

export interface PersonalProperty extends BaseAsset {
  category: AssetCategory.PERSONAL_PROPERTY;
  itemType: string;
  description: string;
  location?: string;
  purchaseDate?: string;
  purchasePrice?: number;
}

export interface Debt extends BaseAsset {
  category: AssetCategory.DEBT;
  debtType: DebtType;
  creditor: string;
  accountNumber?: string;
  originalAmount: number;
  currentBalance: number;
  interestRate: number;
  monthlyPayment: number;
  maturityDate?: string;
}

export type AnyAsset = RealEstateAsset | FinancialAccount | InsurancePolicy | BusinessInterest | Vehicle | PersonalProperty | Debt;

export type AnyEnhancedAsset = AnyAsset;