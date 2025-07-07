import React, { useState, useEffect } from 'react';

import {
  FINANCIAL_ACCOUNT_TYPE_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
  INVESTMENT_TYPE_OPTIONS,
  INSURANCE_POLICY_TYPE_OPTIONS,
  PERSONAL_PROPERTY_TYPE_OPTIONS,
  BUSINESS_TYPE_OPTIONS,
  DIGITAL_ASSET_TYPE_OPTIONS,
} from '../../constants/asset-options';
import {
  Asset,
  AssetCategory,
  FinancialAccountType,
  PropertyType,
  InvestmentType,
  InsurancePolicyType,
  PersonalPropertyType,
  BusinessType,
  DigitalAssetType,
} from '../../types';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';

import type {
  FinancialAccount,
  RealEstate,
  Investment,
  InsurancePolicy,
  PersonalProperty,
  BusinessInterest,
  DigitalAsset,
} from '../../types';

interface AssetFormRendererProps {
  category: AssetCategory | '';
  formData: any; // Partial data of the specific asset type
  handleFieldChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
  formErrors: Record<string, string>;
}

const AssetFormRenderer: React.FC<AssetFormRendererProps> = ({
  category,
  formData,
  handleFieldChange,
  formErrors,
}) => {
  switch (category) {
    case AssetCategory.FINANCIAL_ACCOUNT:
      const faData = formData as Partial<FinancialAccount>;
      return (
        <>
          <Input
            label="Institution Name"
            name="institution"
            id="institution"
            value={faData.institution || ''}
            onChange={handleFieldChange}
            error={formErrors.institution}
            required
          />
          <Select
            label="Account Type"
            name="accountType"
            id="accountType"
            value={faData.accountType || ''}
            onChange={handleFieldChange}
            options={FINANCIAL_ACCOUNT_TYPE_OPTIONS}
            error={formErrors.accountType}
            required
          />
          <Input
            label="Account Number (Optional)"
            name="accountNumber"
            id="accountNumber"
            value={faData.accountNumber || ''}
            onChange={handleFieldChange}
            error={formErrors.accountNumber}
            placeholder="e.g., ******1234"
          />
        </>
      );
    case AssetCategory.REAL_ESTATE:
      const reData = formData as Partial<RealEstate>;
      return (
        <>
          <Input
            label="Property Address"
            name="address"
            id="address"
            value={reData.address || ''}
            onChange={handleFieldChange}
            error={formErrors.address}
            required
          />
          <Select
            label="Property Type"
            name="propertyType"
            id="propertyType"
            value={reData.propertyType || ''}
            onChange={handleFieldChange}
            options={PROPERTY_TYPE_OPTIONS}
            error={formErrors.propertyType}
            required
          />
          <Input
            label="Lot Size (Optional)"
            name="lotSize"
            id="lotSize"
            value={reData.lotSize || ''}
            onChange={handleFieldChange}
            error={formErrors.lotSize}
            placeholder="e.g., 0.5 acres or 5000 sq ft"
          />
          <Input
            label="Year Built (Optional)"
            name="yearBuilt"
            id="yearBuilt"
            type="number"
            value={String(reData.yearBuilt ?? '')} // Ensure value is string
            onChange={handleFieldChange}
            error={formErrors.yearBuilt}
            placeholder="e.g., 1995"
            min="1000"
            max={new Date().getFullYear()}
          />
        </>
      );
    case AssetCategory.INVESTMENT:
      const invData = formData as Partial<Investment>;
      return (
        <>
          <Select
            label="Investment Type"
            name="investmentType"
            id="investmentType"
            value={invData.investmentType || ''}
            onChange={handleFieldChange}
            options={INVESTMENT_TYPE_OPTIONS}
            error={formErrors.investmentType}
            required
          />
          <Input
            label="Institution (Optional)"
            name="institution"
            id="inv-institution"
            value={invData.institution || ''}
            onChange={handleFieldChange}
            error={formErrors.institution}
          />
          <Input
            label="Account Number (Optional)"
            name="accountNumber"
            id="inv-accountNumber"
            value={invData.accountNumber || ''}
            onChange={handleFieldChange}
            error={formErrors.accountNumber}
          />
          <Input
            label="Symbol/Ticker (Optional)"
            name="symbol"
            id="symbol"
            value={invData.symbol || ''}
            onChange={handleFieldChange}
            error={formErrors.symbol}
          />
          <Input
            label="Quantity (Optional)"
            name="quantity"
            id="quantity"
            type="number"
            value={String(invData.quantity ?? '')} // Ensure value is string
            onChange={handleFieldChange}
            error={formErrors.quantity}
            step="any"
            min="0"
          />
        </>
      );
    case AssetCategory.INSURANCE_POLICY:
      const ipData = formData as Partial<InsurancePolicy>;
      return (
        <>
          <Select
            label="Policy Type"
            name="policyType"
            id="policyType"
            value={ipData.policyType || ''}
            onChange={handleFieldChange}
            options={INSURANCE_POLICY_TYPE_OPTIONS}
            error={formErrors.policyType}
            required
          />
          <Input
            label="Policy Number"
            name="policyNumber"
            id="policyNumber"
            value={ipData.policyNumber || ''}
            onChange={handleFieldChange}
            error={formErrors.policyNumber}
            required
          />
          <Input
            label="Insurer Name"
            name="insurer"
            id="insurer"
            value={ipData.insurer || ''}
            onChange={handleFieldChange}
            error={formErrors.insurer}
            required
          />
          <Input
            label="Coverage Amount ($)"
            name="coverageAmount"
            id="coverageAmount"
            type="number"
            value={String(ipData.coverageAmount ?? '')}
            onChange={handleFieldChange}
            error={formErrors.coverageAmount}
            required
            min="0"
            step="0.01"
          />
          <Input
            label="Premium (Optional)"
            name="premium"
            id="premium"
            type="number"
            value={String(ipData.premium ?? '')}
            onChange={handleFieldChange}
            error={formErrors.premium}
            min="0"
            step="0.01"
          />
        </>
      );
    case AssetCategory.PERSONAL_PROPERTY:
      const ppData = formData as Partial<PersonalProperty>;
      return (
        <>
          <Select
            label="Property Type"
            name="propertyType"
            id="pp-propertyType"
            value={ppData.propertyType || ''}
            onChange={handleFieldChange}
            options={PERSONAL_PROPERTY_TYPE_OPTIONS}
            error={formErrors.propertyType}
            required
          />
          <Input
            label="Location (Optional)"
            name="location"
            id="location"
            value={ppData.location || ''}
            onChange={handleFieldChange}
            error={formErrors.location}
            placeholder="e.g., Home, Storage Unit"
          />
          <Input
            label="Serial Number (Optional)"
            name="serialNumber"
            id="serialNumber"
            value={ppData.serialNumber || ''}
            onChange={handleFieldChange}
            error={formErrors.serialNumber}
          />
        </>
      );
    case AssetCategory.BUSINESS_INTEREST:
      const biData = formData as Partial<BusinessInterest>;
      return (
        <>
          <Input
            label="Business Name"
            name="businessName"
            id="businessName"
            value={biData.businessName || ''}
            onChange={handleFieldChange}
            error={formErrors.businessName}
            required
          />
          <Select
            label="Business Type"
            name="businessType"
            id="businessType"
            value={biData.businessType || ''}
            onChange={handleFieldChange}
            options={BUSINESS_TYPE_OPTIONS}
            error={formErrors.businessType}
            required
          />
          <Input
            label="Percentage Owned (Optional)"
            name="percentageOwned"
            id="percentageOwned"
            type="number"
            value={String(biData.percentageOwned ?? '')}
            onChange={handleFieldChange}
            error={formErrors.percentageOwned}
            min="0"
            max="100"
            step="0.01"
          />
        </>
      );
    case AssetCategory.DIGITAL_ASSET:
      const daData = formData as Partial<DigitalAsset>;
      return (
        <>
          <Select
            label="Digital Asset Type"
            name="assetType"
            id="da-assetType"
            value={daData.assetType || ''}
            onChange={handleFieldChange}
            options={DIGITAL_ASSET_TYPE_OPTIONS}
            error={formErrors.assetType}
            required
          />
          <Input
            label="Access Information (Optional)"
            name="accessInfo"
            id="accessInfo"
            value={daData.accessInfo || ''}
            onChange={handleFieldChange}
            error={formErrors.accessInfo}
            placeholder="e.g., Username, Website URL"
          />
          <Input
            label="Associated Email (Optional)"
            name="associatedEmail"
            id="associatedEmail"
            type="email"
            value={daData.associatedEmail || ''}
            onChange={handleFieldChange}
            error={formErrors.associatedEmail}
          />
        </>
      );
    default:
      if (category) {
        return (
          <p className="text-sm text-neutral-500 dark:text-neutral-400 py-2">
            Specific form fields for '{category}' are not yet available. Please fill common details.
          </p>
        );
      }
      return null;
  }
};

export default AssetFormRenderer;
