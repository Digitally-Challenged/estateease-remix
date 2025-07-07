export interface Trust {
  id: string;
  name: string;
  type: 'revocable' | 'irrevocable' | 'special_needs' | 'charitable' | 'other';
  taxId: string;
  dateCreated: string;
  dateAmended?: string;
  grantor: string;
  trustees: Trustee[];
  beneficiaries: TrustBeneficiary[];
  purpose: string;
  isActive: boolean;
  assets?: string[];
  provisions?: TrustProvision[];
  notes?: string;
}

export interface Trustee {
  name: string;
  type: 'primary' | 'successor' | 'co-trustee';
  powers: string[];
  startDate?: string;
  endDate?: string;
  orderOfSuccession?: number;
  compensation?: {
    type: 'none' | 'percentage' | 'hourly' | 'flat_fee';
    amount?: number;
    details?: string;
  };
}

export interface TrustBeneficiary {
  name: string;
  type: 'primary' | 'contingent' | 'remainder';
  relationship: string;
  percentage?: number;
  conditions?: string;
  distributions?: {
    type: 'mandatory' | 'discretionary';
    schedule?: string;
    amount?: number | string;
  };
}

export interface TrustProvision {
  type: 'marital_trust' | 'bypass_trust' | 'qtip' | 'charitable' | 'special_needs' | 'spendthrift' | 'other';
  description: string;
  conditions?: string;
}