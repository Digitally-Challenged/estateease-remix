import React, { useState, useEffect, useContext } from 'react';

import {
  FileText,
  Plus,
  Trash2,
  CheckCircle,
  Users,
  User,
  Building2,
  ScrollText,
} from 'lucide-react';

import { ASSET_CATEGORIES_OPTIONS } from '../../constants/asset-options';
import { useBusinesses } from '../../contexts/BusinessContext';
import { DocumentContext } from '../../contexts/DocumentContext';
import { useTrusts } from '../../contexts/TrustContext';
import { useUnifiedAssets } from '../../contexts/UnifiedAssetContext';
import {
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
import Modal from '../common/Modal';
import Select from '../common/Select';

import AssetFormRenderer from './AssetFormRenderer';

import type {
  Asset,
  FinancialAccount,
  RealEstate,
  Investment,
  InsurancePolicy,
  PersonalProperty,
  BusinessInterest,
  DigitalAsset,
  UploadedDocument,
} from '../../types';
import type { AnyEnhancedAsset } from '../../types/assets';
import type { Ownership, OwnershipType, TenancyType } from '../../types/ownership';

interface AssetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingAsset?: Asset | AnyEnhancedAsset | null;
  useEnhanced?: boolean;
  trusts?: any[];
  businesses?: any[];
}

const getDefaultAssetData = (
  category: AssetCategory,
  useEnhanced = false,
): Partial<Asset | AnyEnhancedAsset> => {
  const baseDefaults: Partial<Asset | AnyEnhancedAsset> = {
    name: '',
    value: 0,
    description: useEnhanced ? undefined : '',
    notes: useEnhanced ? '' : undefined,
    category,
    documentIds: useEnhanced ? undefined : [],
    documents: useEnhanced ? [] : undefined,
    ownership: useEnhanced
      ? {
        type: 'individual' as OwnershipType,
        owners: {
          nick: { percentage: 100, isPrimary: true },
        },
        survivorshipRights: false,
        tenancyType: 'sole_ownership' as TenancyType,
      }
      : undefined,
    lastUpdated: useEnhanced ? new Date() : undefined,
  };
  switch (category) {
    case AssetCategory.FINANCIAL_ACCOUNT:
      return {
        ...baseDefaults,
        accountType: FinancialAccountType.CHECKING,
        institution: '',
      } as Partial<FinancialAccount>;
    case AssetCategory.REAL_ESTATE:
      return {
        ...baseDefaults,
        address: '',
        propertyType: PropertyType.SINGLE_FAMILY,
      } as Partial<RealEstate>;
    case AssetCategory.INVESTMENT:
      return { ...baseDefaults, investmentType: InvestmentType.STOCKS } as Partial<Investment>;
    case AssetCategory.INSURANCE_POLICY:
      return {
        ...baseDefaults,
        policyType: InsurancePolicyType.LIFE,
        policyNumber: '',
        insurer: '',
        coverageAmount: 0,
      } as Partial<InsurancePolicy>;
    case AssetCategory.PERSONAL_PROPERTY:
      return {
        ...baseDefaults,
        propertyType: PersonalPropertyType.JEWELRY,
      } as Partial<PersonalProperty>;
    case AssetCategory.BUSINESS_INTEREST:
      return {
        ...baseDefaults,
        businessName: '',
        businessType: BusinessType.LLC,
      } as Partial<BusinessInterest>;
    case AssetCategory.DIGITAL_ASSET:
      return {
        ...baseDefaults,
        assetType: DigitalAssetType.ONLINE_ACCOUNT,
      } as Partial<DigitalAsset>;
    default:
      return baseDefaults;
  }
};

const AssetFormModal: React.FC<AssetFormModalProps> = ({
  isOpen,
  onClose,
  editingAsset,
  useEnhanced = false,
  trusts = [],
  businesses = [],
}) => {
  const unifiedAssets = useUnifiedAssets();
  const documentCtx = useContext(DocumentContext);

  const [selectedCategory, setSelectedCategory] = useState<AssetCategory | null>(
    editingAsset?.category || null,
  );
  const [assetData, setAssetData] = useState<Partial<Asset | AnyEnhancedAsset>>(editingAsset || {});
  const [ownershipData, setOwnershipData] = useState<Ownership>({
    type: 'individual',
    owners: {
      nick: { percentage: 100, isPrimary: true },
    },
    survivorshipRights: false,
    tenancyType: 'sole_ownership',
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [showDocumentSelector, setShowDocumentSelector] = useState(false);
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>(
    editingAsset?.documentIds || (editingAsset as any)?.documents || [],
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingAsset) {
      setSelectedCategory(editingAsset.category);
      setAssetData(editingAsset);
      setSelectedDocumentIds(editingAsset.documentIds || (editingAsset as any)?.documents || []);
      if (useEnhanced && (editingAsset as any).ownership) {
        setOwnershipData((editingAsset as any).ownership);
      }
    } else {
      // Reset to defaults when not editing
      setSelectedCategory(null);
      setAssetData({});
      setSelectedDocumentIds([]);
      setOwnershipData({
        type: 'individual',
        owners: {
          nick: { percentage: 100, isPrimary: true },
        },
        survivorshipRights: false,
        tenancyType: 'sole_ownership',
      });
    }
  }, [editingAsset, useEnhanced]);

  if (!documentCtx) {
    throw new Error('Contexts must be used within their Providers');
  }

  const { documents } = documentCtx;

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory = e.target.value as AssetCategory;
    setSelectedCategory(newCategory);
    setAssetData(getDefaultAssetData(newCategory, useEnhanced));
    setFormErrors({});
  };

  const handleFieldChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setAssetData(prev => ({ ...prev, [name]: value }));
    // Clear the error for this field when it's changed
    setFormErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};
    if (!assetData.name) errors.name = 'Asset name is required';
    if (!assetData.value || assetData.value <= 0)
      errors.value = 'Asset value must be greater than 0';
    if (!selectedCategory) errors.category = 'Asset category is required';

    // Add category-specific validations
    if (selectedCategory === AssetCategory.FINANCIAL_ACCOUNT) {
      if (!(assetData as FinancialAccount).institution)
        errors.institution = 'Institution is required';
    } else if (selectedCategory === AssetCategory.REAL_ESTATE) {
      if (!(assetData as RealEstate).address) errors.address = 'Property address is required';
    } else if (selectedCategory === AssetCategory.INSURANCE_POLICY) {
      if (!(assetData as InsurancePolicy).policyNumber)
        errors.policyNumber = 'Policy number is required';
      if (!(assetData as InsurancePolicy).insurer) errors.insurer = 'Insurer is required';
      if (
        !(assetData as InsurancePolicy).coverageAmount ||
        (assetData as InsurancePolicy).coverageAmount <= 0
      ) {
        errors.coverageAmount = 'Coverage amount must be greater than 0';
      }
    } else if (selectedCategory === AssetCategory.BUSINESS_INTEREST) {
      if (!(assetData as BusinessInterest).businessName)
        errors.businessName = 'Business name is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !selectedCategory || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const finalAssetData = {
        ...assetData,
        id: editingAsset?.id || Date.now().toString(),
        category: selectedCategory,
        ...(useEnhanced
          ? {
            documents: selectedDocumentIds,
            ownership: ownershipData,
            lastUpdated: new Date(),
          }
          : {
            documentIds: selectedDocumentIds,
            documentsAvailable: selectedDocumentIds.length > 0,
          }),
      };

      // Clean up numeric fields for all categories
      const numericFields = [
        'value',
        'lotSize',
        'yearBuilt',
        'mortgageBalance',
        'quantity',
        'coverageAmount',
        'premium',
        'netAccumulatedValue',
        'monthlyBenefit',
        'year',
        'percentageOwned',
      ];
      numericFields.forEach(field => {
        // @ts-ignore
        if (finalAssetData[field] !== undefined && finalAssetData[field] !== null) {
          // @ts-ignore
          if (typeof finalAssetData[field] === 'string') {
            // @ts-ignore
            const numVal = parseFloat(finalAssetData[field]);
            if (!isNaN(numVal)) {
              // @ts-ignore
              finalAssetData[field] = numVal;
            } else {
              // @ts-ignore
              delete finalAssetData[field]; // Remove if empty string or failed to parse
            }
            // @ts-ignore
          } else if (typeof finalAssetData[field] === 'number' && isNaN(finalAssetData[field])) {
            // @ts-ignore
            delete finalAssetData[field]; // Remove if NaN
          }
        } else {
          // @ts-ignore
          delete finalAssetData[field]; // Remove if null or undefined
        }
      });

      if (editingAsset) {
        await unifiedAssets.updateAsset(finalAssetData as AnyEnhancedAsset);
      } else {
        await unifiedAssets.addAsset(finalAssetData as AnyEnhancedAsset);
      }

      // Simulate a small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 300));

      onClose();
    } catch (error) {
      console.error('Error saving asset:', error);
      setFormErrors({ general: 'Failed to save asset. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleDocumentSelection = (documentId: string) => {
    setSelectedDocumentIds(prev =>
      prev.includes(documentId) ? prev.filter(id => id !== documentId) : [...prev, documentId],
    );
  };

  const getRelevantDocuments = (): UploadedDocument[] => {
    // Filter documents that might be relevant to this asset
    return documents.filter(doc => {
      const docNameLower = doc.fileName.toLowerCase();
      const assetNameLower = assetData.name?.toLowerCase() || '';

      // Check if document name contains asset name
      if (assetNameLower && docNameLower.includes(assetNameLower)) return true;

      // Category-specific matching
      if (selectedCategory === AssetCategory.INSURANCE_POLICY) {
        return (
          doc.userDefinedType === 'Insurance Policy' ||
          docNameLower.includes('insurance') ||
          docNameLower.includes('policy')
        );
      }
      if (selectedCategory === AssetCategory.REAL_ESTATE) {
        return (
          doc.userDefinedType === 'Deed' ||
          docNameLower.includes('deed') ||
          docNameLower.includes('title') ||
          docNameLower.includes('property')
        );
      }
      if (selectedCategory === AssetCategory.FINANCIAL_ACCOUNT) {
        return (
          doc.userDefinedType === 'Financial Statement' ||
          docNameLower.includes('statement') ||
          docNameLower.includes('account')
        );
      }
      if (selectedCategory === AssetCategory.INVESTMENT) {
        return (
          doc.userDefinedType === 'Investment Record' ||
          docNameLower.includes('investment') ||
          docNameLower.includes('portfolio')
        );
      }

      return false;
    });
  };

  const modalTitle = editingAsset ? `Edit ${editingAsset.name}` : 'Add New Asset';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {formErrors.general && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
            <p className="text-sm text-red-800 dark:text-red-200">{formErrors.general}</p>
          </div>
        )}

        <Select
          label="Asset Category"
          name="category"
          id="category"
          value={selectedCategory || ''}
          onChange={handleCategoryChange}
          options={ASSET_CATEGORIES_OPTIONS}
          error={formErrors.category}
          required
          disabled={!!editingAsset} // Disable if editing
        />

        {selectedCategory && ( // Only show other fields if category is selected
          <>
            <Input
              label="Asset Name"
              name="name"
              id="name"
              value={assetData.name || ''}
              onChange={handleFieldChange}
              error={formErrors.name}
              required
            />
            <Input
              label="Estimated Value ($)"
              name="value"
              id="value"
              type="number"
              value={String(assetData.value ?? '')} // Ensure value is string for input
              onChange={handleFieldChange}
              error={formErrors.value}
              required
              min="0"
              step="0.01"
            />
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1"
              >
                Description (Optional)
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={assetData.description || ''}
                onChange={handleFieldChange}
                className="block w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-DEFAULT focus:border-primary-DEFAULT sm:text-sm bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500"
              />
            </div>

            <AssetFormRenderer
              category={selectedCategory}
              formData={assetData}
              handleFieldChange={handleFieldChange}
              formErrors={formErrors}
            />

            {/* Ownership Section - Enhanced Assets Only */}
            {useEnhanced && (
              <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
                <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Ownership Structure
                </h3>

                <div className="space-y-4">
                  <Select
                    label="Ownership Type"
                    name="ownershipType"
                    value={ownershipData.type}
                    onChange={e =>
                      setOwnershipData(prev => ({
                        ...prev,
                        type: e.target.value as OwnershipType,
                        ...(e.target.value === 'individual' && {
                          owners: { nick: { percentage: 100, isPrimary: true } },
                          survivorshipRights: false,
                        }),
                        ...(e.target.value === 'joint' && {
                          owners: {
                            nick: { percentage: 50, isPrimary: true },
                            kelsey: { percentage: 50, isPrimary: false },
                          },
                          survivorshipRights: true,
                        }),
                        ...(e.target.value === 'trust' && {
                          trustId: trusts[0]?.id || '',
                        }),
                        ...(e.target.value === 'business' && {
                          businessId: businesses[0]?.id || '',
                        }),
                      }))
                    }
                    options={[
                      { value: 'individual', label: 'Individual Ownership' },
                      { value: 'joint', label: 'Joint Ownership' },
                      { value: 'trust', label: 'Trust Ownership' },
                      { value: 'business', label: 'Business Ownership' },
                    ]}
                    required
                  />

                  {ownershipData.type === 'individual' && (
                    <Select
                      label="Owner"
                      name="individualOwner"
                      value={ownershipData.owners.nick ? 'nick' : 'kelsey'}
                      onChange={e =>
                        setOwnershipData(prev => ({
                          ...prev,
                          owners:
                            e.target.value === 'nick'
                              ? { nick: { percentage: 100, isPrimary: true } }
                              : { kelsey: { percentage: 100, isPrimary: true } },
                        }))
                      }
                      options={[
                        { value: 'nick', label: 'Nick' },
                        { value: 'kelsey', label: 'Kelsey' },
                      ]}
                      required
                    />
                  )}

                  {ownershipData.type === 'joint' && (
                    <div className="space-y-3">
                      <Select
                        label="Tenancy Type"
                        name="tenancyType"
                        value={ownershipData.tenancyType || 'joint_tenancy'}
                        onChange={e =>
                          setOwnershipData(prev => ({
                            ...prev,
                            tenancyType: e.target.value as TenancyType,
                          }))
                        }
                        options={[
                          {
                            value: 'joint_tenancy',
                            label: 'Joint Tenancy (with right of survivorship)',
                          },
                          { value: 'tenants_in_common', label: 'Tenants in Common' },
                          { value: 'community_property', label: 'Community Property' },
                        ]}
                        required
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          label="Nick's Percentage"
                          type="number"
                          value={ownershipData.owners.nick?.percentage || 50}
                          onChange={e =>
                            setOwnershipData(prev => ({
                              ...prev,
                              owners: {
                                ...prev.owners,
                                nick: { ...prev.owners.nick, percentage: Number(e.target.value) },
                              },
                            }))
                          }
                          min="0"
                          max="100"
                          required
                        />
                        <Input
                          label="Kelsey's Percentage"
                          type="number"
                          value={ownershipData.owners.kelsey?.percentage || 50}
                          onChange={e =>
                            setOwnershipData(prev => ({
                              ...prev,
                              owners: {
                                ...prev.owners,
                                kelsey: {
                                  ...prev.owners.kelsey,
                                  percentage: Number(e.target.value),
                                },
                              },
                            }))
                          }
                          min="0"
                          max="100"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {ownershipData.type === 'trust' && trusts.length > 0 && (
                    <Select
                      label="Trust"
                      name="trustId"
                      value={ownershipData.trustId || ''}
                      onChange={e =>
                        setOwnershipData(prev => ({
                          ...prev,
                          trustId: e.target.value,
                        }))
                      }
                      options={trusts.map(trust => ({ value: trust.id, label: trust.name }))}
                      required
                    />
                  )}

                  {ownershipData.type === 'business' && businesses.length > 0 && (
                    <Select
                      label="Business Entity"
                      name="businessId"
                      value={ownershipData.businessId || ''}
                      onChange={e =>
                        setOwnershipData(prev => ({
                          ...prev,
                          businessId: e.target.value,
                        }))
                      }
                      options={businesses.map(business => ({
                        value: business.id,
                        label: business.name,
                      }))}
                      required
                    />
                  )}

                  {ownershipData.type === 'trust' && trusts.length === 0 && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/30 rounded-md p-3">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        No trusts have been created yet. Create a trust first to assign ownership.
                      </p>
                    </div>
                  )}

                  {ownershipData.type === 'business' && businesses.length === 0 && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/30 rounded-md p-3">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        No business entities have been created yet. Create a business entity first
                        to assign ownership.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Document Attachment Section */}
            <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Related Documents
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDocumentSelector(!showDocumentSelector)}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  {showDocumentSelector ? 'Hide' : 'Add'} Documents
                </Button>
              </div>

              {/* Selected Documents */}
              {selectedDocumentIds.length > 0 && (
                <div className="mb-3 space-y-2">
                  {selectedDocumentIds.map(docId => {
                    const doc = documents.find(d => d.id === docId);
                    if (!doc) return null;
                    return (
                      <div
                        key={docId}
                        className="flex items-center justify-between p-2 bg-neutral-50 dark:bg-neutral-700 rounded-md"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                          <span className="text-sm text-neutral-700 dark:text-neutral-200">
                            {doc.fileName}
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleDocumentSelection(docId)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Document Selector */}
              {showDocumentSelector && (
                <div className="max-h-48 overflow-y-auto border border-neutral-200 dark:border-neutral-600 rounded-md p-3 space-y-2">
                  {documents.length === 0 ? (
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center py-4">
                      No documents uploaded yet. Upload documents in the Document Vault.
                    </p>
                  ) : (
                    <>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">
                        Select documents related to this asset:
                      </p>
                      {getRelevantDocuments().length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                            Suggested Documents:
                          </p>
                          {getRelevantDocuments().map(doc => (
                            <label
                              key={doc.id}
                              className="flex items-center gap-2 p-2 hover:bg-neutral-100 dark:hover:bg-neutral-600 rounded cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={selectedDocumentIds.includes(doc.id)}
                                onChange={() => toggleDocumentSelection(doc.id)}
                                className="h-4 w-4 text-primary-DEFAULT border-neutral-300 dark:border-neutral-600 rounded focus:ring-primary-light"
                              />
                              <span className="text-sm text-neutral-700 dark:text-neutral-200">
                                {doc.fileName}
                              </span>
                              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                ({doc.userDefinedType})
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                      <div className="border-t border-neutral-200 dark:border-neutral-700 pt-2 mt-2">
                        <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                          All Documents:
                        </p>
                        {documents
                          .filter(doc => !getRelevantDocuments().includes(doc))
                          .map(doc => (
                            <label
                              key={doc.id}
                              className="flex items-center gap-2 p-2 hover:bg-neutral-100 dark:hover:bg-neutral-600 rounded cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={selectedDocumentIds.includes(doc.id)}
                                onChange={() => toggleDocumentSelection(doc.id)}
                                className="h-4 w-4 text-primary-DEFAULT border-neutral-300 dark:border-neutral-600 rounded focus:ring-primary-light"
                              />
                              <span className="text-sm text-neutral-700 dark:text-neutral-200">
                                {doc.fileName}
                              </span>
                              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                ({doc.userDefinedType})
                              </span>
                            </label>
                          ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={!selectedCategory || isSubmitting}>
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Saving...
              </span>
            ) : editingAsset ? (
              'Save Changes'
            ) : (
              'Add Asset'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AssetFormModal;
