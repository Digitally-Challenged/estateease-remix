import React, { useContext } from 'react';

import { FileText, Eye, Users, User, Building2, ScrollText } from 'lucide-react';

import { DocumentContext } from '../../contexts/DocumentContext';
import { AssetCategory } from '../../types';
import Button from '../common/Button';
import Modal from '../common/Modal';

import type {
  Asset,
  FinancialAccount,
  RealEstate,
  Investment,
  InsurancePolicy,
  PersonalProperty,
  BusinessInterest,
  DigitalAsset,
} from '../../types';
import type { AnyEnhancedAsset } from '../../types/assets';

interface AssetViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset | AnyEnhancedAsset | null;
}

// Helper function to safely get asset properties
const getAssetProperty = (asset: Asset | AnyEnhancedAsset, property: string): any => {
  return (asset as any)[property];
};

const AssetViewModal: React.FC<AssetViewModalProps> = ({ isOpen, onClose, asset }) => {
  const documentCtx = useContext(DocumentContext);

  if (!asset || !documentCtx) return null;

  const { documents } = documentCtx;
  const documentIds =
    getAssetProperty(asset, 'documentIds') || getAssetProperty(asset, 'documents') || [];
  const linkedDocuments =
    documentIds.length > 0 ? documents.filter(doc => documentIds.includes(doc.id)) : [];

  const assetName = getAssetProperty(asset, 'name');
  const assetValue = getAssetProperty(asset, 'value');
  const assetDescription =
    getAssetProperty(asset, 'description') || getAssetProperty(asset, 'notes');

  const renderSpecificDetails = () => {
    switch (asset.category) {
      case AssetCategory.FINANCIAL_ACCOUNT:
        const fa = asset as FinancialAccount;
        return (
          <>
            <DetailItem label="Account Type" value={fa.accountType} />
            <DetailItem label="Institution" value={fa.institution} />
            {fa.accountNumber && <DetailItem label="Account Number" value={fa.accountNumber} />}
            {fa.beneficiaries && fa.beneficiaries.length > 0 && (
              <DetailItem label="Beneficiaries" value={fa.beneficiaries.join(', ')} />
            )}
          </>
        );
      case AssetCategory.REAL_ESTATE:
        const re = asset as RealEstate;
        return (
          <>
            <DetailItem label="Property Address" value={re.address} />
            <DetailItem label="Property Type" value={re.propertyType} />
            {re.lotSize && <DetailItem label="Lot Size" value={re.lotSize} />}
            {re.yearBuilt && <DetailItem label="Year Built" value={re.yearBuilt.toString()} />}
            {re.mortgageBalance && (
              <DetailItem
                label="Mortgage Balance"
                value={`$${re.mortgageBalance.toLocaleString()}`}
              />
            )}
            {re.ownershipType && <DetailItem label="Ownership Type" value={re.ownershipType} />}
          </>
        );
      case AssetCategory.INVESTMENT:
        const inv = asset as Investment;
        return (
          <>
            <DetailItem label="Investment Type" value={inv.investmentType} />
            {inv.institution && <DetailItem label="Institution" value={inv.institution} />}
            {inv.accountNumber && <DetailItem label="Account Number" value={inv.accountNumber} />}
            {inv.quantity && <DetailItem label="Quantity" value={inv.quantity.toString()} />}
            {inv.symbol && <DetailItem label="Symbol/Ticker" value={inv.symbol} />}
          </>
        );
      case AssetCategory.INSURANCE_POLICY:
        const ip = asset as InsurancePolicy;
        return (
          <>
            <DetailItem label="Policy Type" value={ip.policyType} />
            <DetailItem label="Policy Number" value={ip.policyNumber} />
            <DetailItem label="Insurer" value={ip.insurer} />
            <DetailItem label="Coverage Amount" value={`$${ip.coverageAmount.toLocaleString()}`} />
            {ip.premium && <DetailItem label="Premium" value={`$${ip.premium.toLocaleString()}`} />}
            {ip.beneficiaries && ip.beneficiaries.length > 0 && (
              <DetailItem label="Beneficiaries" value={ip.beneficiaries.join(', ')} />
            )}
          </>
        );
      case AssetCategory.PERSONAL_PROPERTY:
        const pp = asset as PersonalProperty;
        return (
          <>
            <DetailItem label="Property Type" value={pp.propertyType} />
            {pp.location && <DetailItem label="Location" value={pp.location} />}
            {pp.serialNumber && <DetailItem label="Serial Number" value={pp.serialNumber} />}
          </>
        );
      case AssetCategory.BUSINESS_INTEREST:
        const bi = asset as BusinessInterest;
        return (
          <>
            <DetailItem label="Business Name" value={bi.businessName} />
            <DetailItem label="Business Type" value={bi.businessType} />
            {bi.percentageOwned !== undefined && (
              <DetailItem label="Percentage Owned" value={`${bi.percentageOwned}%`} />
            )}
          </>
        );
      case AssetCategory.DIGITAL_ASSET:
        const da = asset as DigitalAsset;
        return (
          <>
            <DetailItem label="Asset Type" value={da.assetType} />
            {da.accessInfo && <DetailItem label="Access Information" value={da.accessInfo} />}
            {da.associatedEmail && (
              <DetailItem label="Associated Email" value={da.associatedEmail} />
            )}
          </>
        );
      default:
        return (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Detailed view for this asset category is not yet implemented.
          </p>
        );
    }
  };

  const renderOwnership = () => {
    // Check if it's an enhanced asset with ownership structure
    const ownership = getAssetProperty(asset, 'ownership');
    if (ownership) {
      const getOwnershipLabel = () => {
        switch (ownership.type) {
          case 'joint':
            return 'Joint Ownership';
          case 'individual':
            if (ownership.owners.nick) return 'Nick (Individual)';
            if (ownership.owners.kelsey) return 'Kelsey (Individual)';
            return 'Individual';
          case 'trust':
            return 'Trust Ownership';
          case 'business':
            return 'Business Ownership';
          default:
            return 'Unknown';
        }
      };

      return <DetailItem label="Ownership" value={getOwnershipLabel()} />;
    }

    // Legacy asset with simple owner field
    const owner = getAssetProperty(asset, 'owner');
    if (owner) {
      return <DetailItem label="Owner" value={owner} />;
    }

    return null;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Asset Details: ${assetName}`}>
      <div className="space-y-4 text-neutral-700 dark:text-neutral-200">
        <DetailItem label="Asset Name" value={assetName} />
        <DetailItem label="Category" value={asset.category} />
        <DetailItem label="Estimated Value" value={`$${assetValue?.toLocaleString() || '0'}`} />
        {assetDescription && <DetailItem label="Description" value={assetDescription} />}
        {renderOwnership()}

        <hr className="my-3 border-neutral-200 dark:border-neutral-600" />
        <h4 className="text-md font-semibold text-neutral-800 dark:text-neutral-100">
          Specific Details:
        </h4>
        {renderSpecificDetails()}

        {linkedDocuments.length > 0 && (
          <>
            <hr className="my-3 border-neutral-200 dark:border-neutral-600" />
            <div>
              <h4 className="text-md font-semibold text-neutral-800 dark:text-neutral-100 mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Related Documents ({linkedDocuments.length})
              </h4>
              <div className="space-y-2">
                {linkedDocuments.map(doc => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-700 rounded-md"
                  >
                    <div>
                      <p className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                        {doc.fileName}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {doc.userDefinedType} • Uploaded{' '}
                        {new Date(doc.uploadDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => (window.location.hash = `#/documents?view=${doc.id}`)}
                      leftIcon={<Eye className="w-4 h-4" />}
                    >
                      View
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

interface DetailItemProps {
  label: string;
  value: string | undefined;
}
const DetailItem: React.FC<DetailItemProps> = ({ label, value }) => (
  <div className="grid grid-cols-3 gap-2 py-1">
    <dt className="text-sm font-medium text-neutral-600 dark:text-neutral-400">{label}:</dt>
    <dd className="col-span-2 text-sm text-neutral-800 dark:text-neutral-100">{value || 'N/A'}</dd>
  </div>
);

export default AssetViewModal;
