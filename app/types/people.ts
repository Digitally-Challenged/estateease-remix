export interface ContactInfo {
  primaryPhone?: string;
  secondaryPhone?: string;
  phone?: string; // Alias for primaryPhone
  email?: string;
  preferredContact?: "phone" | "email" | "text";
  address?: {
    street1: string;
    street2?: string;
    city: string;
    state: string;
    zipCode: string;
  };
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
}

export interface FamilyMember {
  id: string;
  userId?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  suffix?: string;
  name: string;
  relationship: "spouse" | "child" | "parent" | "sibling" | "other";
  dateOfBirth?: string;
  birthDate?: string; // Alias for dateOfBirth
  isMinor: boolean;
  isDependent: boolean;
  contact?: ContactInfo;
  contactInfo?: ContactInfo;
  notes?: string;
  legalRoles?: LegalRole[];
  healthcareRoles?: HealthcareDirective[];
}

export interface LegalRole {
  id: string;
  roleType:
    | "executor"
    | "trustee"
    | "successor_trustee"
    | "power_of_attorney"
    | "guardian"
    | "healthcare_proxy";
  personId: string;
  personName: string;
  isPrimary: boolean;
  orderOfPrecedence?: number;
  specificPowers?: string[];
  compensation?: {
    type: "none" | "hourly" | "percentage" | "flat_fee";
    amount?: number;
    details?: string;
  };
  startDate?: string;
  endDate?: string;
  endConditions?: string;
  notes?: string;
}

export interface HealthcareDirective {
  id: string;
  type: "living_will" | "healthcare_proxy" | "dnr" | "organ_donation";
  personId?: string;
  personName?: string;
  isPrimary?: boolean;
  decisions?: {
    lifeSustaining?: "continue" | "discontinue" | "depends";
    artificialNutrition?: "continue" | "discontinue" | "depends";
    painManagement?: string;
    organDonation?: boolean;
    bodyDisposition?: "burial" | "cremation" | "donation";
  };
  religiousPreferences?: string;
  additionalInstructions?: string;
  dateCreated: string;
  lastUpdated: string;
}

export interface Beneficiary {
  id: string;
  name: string;
  relationship: "spouse" | "child" | "parent" | "sibling" | "trust" | "charity" | "other";
  percentage?: number;
  isPrimary: boolean;
  isContingent: boolean;
  contingentTo?: string;
  perStirpes?: boolean;
  contactInfo?: ContactInfo;
  notes?: string;
}

export interface Professional {
  id: string;
  name: string;
  type:
    | "estate_attorney"
    | "tax_attorney"
    | "financial_advisor"
    | "accountant"
    | "insurance_agent"
    | "other";
  firm?: string;
  title?: string;
  specializations?: string[];
  contactInfo: ContactInfo;
  credentials?: string[];
  yearsExperience?: number;
  isPreferredProvider?: boolean;
  notes?: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  contactType: "primary" | "secondary" | "medical" | "legal" | "other";
  contactInfo: ContactInfo;
  priority: number;
  availability?: string;
  medicalAuthority?: boolean;
  canMakeDecisions?: boolean;
  languages?: string[];
  notes?: string;
}
