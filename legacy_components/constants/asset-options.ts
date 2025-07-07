import {
  AssetCategory,
  FinancialAccountType,
  DocumentType,
  PropertyType,
  InvestmentType,
  InsurancePolicyType,
  PersonalPropertyType,
  BusinessType,
  DigitalAssetType,
} from '../types';

export const ASSET_CATEGORIES_OPTIONS = Object.values(AssetCategory)
  .sort((a, b) => a.localeCompare(b)) // Sort alphabetically
  .map(category => ({
    value: category,
    label: category,
  }));

export const FINANCIAL_ACCOUNT_TYPE_OPTIONS = Object.values(FinancialAccountType).map(type => ({
  value: type,
  label: type,
}));

export const PROPERTY_TYPE_OPTIONS = Object.values(PropertyType).map(type => ({
  value: type,
  label: type,
}));

export const INVESTMENT_TYPE_OPTIONS = Object.values(InvestmentType).map(type => ({
  value: type,
  label: type,
}));

export const INSURANCE_POLICY_TYPE_OPTIONS = Object.values(InsurancePolicyType).map(type => ({
  value: type,
  label: type,
}));

export const PERSONAL_PROPERTY_TYPE_OPTIONS = Object.values(PersonalPropertyType).map(type => ({
  value: type,
  label: type,
}));

export const BUSINESS_TYPE_OPTIONS = Object.values(BusinessType).map(type => ({
  value: type,
  label: type,
}));

export const DIGITAL_ASSET_TYPE_OPTIONS = Object.values(DigitalAssetType).map(type => ({
  value: type,
  label: type,
}));

export const DOCUMENT_TYPE_OPTIONS = Object.values(DocumentType).map(type => ({
  value: type,
  label: type,
}));
