import React from 'react';

import {
  Eye,
  Pencil,
  Trash,
  TrendingUp,
  FileText,
  Users,
  User,
  Building2,
  ScrollText,
} from 'lucide-react';

import { AssetCategory } from '../../types';
import { AssetIcon } from '../../utils/asset-icons';
import Button from '../common/Button';

import type {
  Asset,
  RealEstate,
  FinancialAccount,
  Investment,
  InsurancePolicy,
  PersonalProperty,
  BusinessInterest,
  DigitalAsset,
} from '../../types';
import type { AnyEnhancedAsset } from '../../types/assets';

interface AssetCardViewProps<T = Asset | AnyEnhancedAsset> {
  assets: T[];
  onView: (asset: T) => void;
  onEdit: (asset: T) => void;
  onDelete: (asset: T) => void;
}

// Helper function to safely get asset properties
const getAssetProperty = (asset: Asset | AnyEnhancedAsset, property: string): any => {
  return (asset as any)[property];
};

// Utility functions moved outside components for better performance
const getCategoryColor = (category: string) => {
  const colors = {
    'Real Estate': 'blue',
    Investment: 'green',
    'Financial Account': 'purple',
    'Insurance Policy': 'orange',
    'Personal Property': 'pink',
    'Business Interest': 'indigo',
    'Digital Asset': 'cyan',
    Other: 'gray',
  };
  return colors[category as keyof typeof colors] || 'gray';
};

const formatValue = (value: number) => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toLocaleString()}`;
};

// Memoized card component for better performance
const AssetCard = React.memo(
  <T extends Asset | AnyEnhancedAsset>({
    asset,
    index,
    onView,
    onEdit,
    onDelete,
  }: {
    asset: T;
    index: number;
    onView: (asset: T) => void;
    onEdit: (asset: T) => void;
    onDelete: (asset: T) => void;
  }) => {
    const renderOwnership = (asset: T) => {
      // Check if it's an enhanced asset with ownership structure
      const ownership = getAssetProperty(asset, 'ownership');
      if (ownership) {
        const getOwnershipIcon = () => {
          switch (ownership.type) {
            case 'joint':
              return <Users className="w-4 h-4" />;
            case 'individual':
              return <User className="w-4 h-4" />;
            case 'trust':
              return <ScrollText className="w-4 h-4" />;
            case 'business':
              return <Building2 className="w-4 h-4" />;
            default:
              return <User className="w-4 h-4" />;
          }
        };

        const getOwnershipLabel = () => {
          switch (ownership.type) {
            case 'joint':
              return 'Joint Ownership';
            case 'individual':
              if (ownership.owners.nick) return 'Nick';
              if (ownership.owners.kelsey) return 'Kelsey';
              return 'Individual';
            case 'trust':
              return 'Trust Owned';
            case 'business':
              return 'Business Owned';
            default:
              return 'Unknown';
          }
        };

        return (
          <div className="flex items-center text-sm">
            <span className="text-neutral-500 dark:text-neutral-400">Owner:</span>
            <div className="ml-2 flex items-center gap-1 font-medium text-neutral-700 dark:text-neutral-300">
              {getOwnershipIcon()}
              <span>{getOwnershipLabel()}</span>
            </div>
          </div>
        );
      }

      // Legacy asset with simple owner field
      const owner = getAssetProperty(asset, 'owner');
      if (owner) {
        return (
          <div className="flex items-center text-sm">
            <span className="text-neutral-500 dark:text-neutral-400">Owner:</span>
            <span className="ml-2 font-medium text-neutral-700 dark:text-neutral-300">{owner}</span>
          </div>
        );
      }

      return null;
    };

    const getAssetSubType = (asset: T): string | undefined => {
      switch (asset.category) {
        case AssetCategory.REAL_ESTATE:
          return (asset as RealEstate).propertyType;
        case AssetCategory.FINANCIAL_ACCOUNT:
          return (asset as FinancialAccount).accountType;
        case AssetCategory.INVESTMENT:
          return (asset as Investment).investmentType;
        case AssetCategory.INSURANCE_POLICY:
          return (asset as InsurancePolicy).policyType;
        case AssetCategory.PERSONAL_PROPERTY:
          return (asset as PersonalProperty).propertyType;
        case AssetCategory.BUSINESS_INTEREST:
          return (asset as BusinessInterest).businessType;
        case AssetCategory.DIGITAL_ASSET:
          return (asset as DigitalAsset).assetType;
        default:
          return undefined;
      }
    };

    const color = getCategoryColor(asset.category);
    const assetId = getAssetProperty(asset, 'id');
    const assetName = getAssetProperty(asset, 'name');
    const assetValue = getAssetProperty(asset, 'value');
    const assetDescription =
      getAssetProperty(asset, 'description') || getAssetProperty(asset, 'notes');
    const assetDocumentIds =
      getAssetProperty(asset, 'documentIds') || getAssetProperty(asset, 'documents') || [];

    return (
      <div
        key={assetId}
        className="group relative bg-white dark:bg-neutral-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-neutral-200 dark:border-neutral-700 overflow-hidden"
        style={{
          animation: 'fadeInUp 0.5s ease-out forwards',
          animationDelay: `${index * 50}ms`,
          opacity: 0,
        }}
      >
        {/* Gradient background accent */}
        <div
          className={`absolute inset-0 bg-gradient-to-br from-${color}-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
        />

        <div className="relative p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 pr-4">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                {assetName}
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                {asset.category}
              </p>
            </div>
            <div className={`p-3 rounded-xl bg-${color}-100 dark:bg-${color}-900/30`}>
              <AssetIcon
                category={asset.category}
                subType={getAssetSubType(asset)}
                className={`w-6 h-6 text-${color}-600 dark:text-${color}-400`}
              />
            </div>
          </div>

          {/* Value Display */}
          <div className="mb-4">
            <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              {formatValue(assetValue || 0)}
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">Current Value</p>
          </div>

          {/* Details */}
          <div className="space-y-2 mb-4">
            {/* Show institution name for financial accounts */}
            {asset.category === 'Financial Account' && getAssetProperty(asset, 'institution') && (
              <div className="flex items-center text-sm">
                <span className="text-neutral-500 dark:text-neutral-400">Institution:</span>
                <span className="ml-2 font-medium text-blue-600 dark:text-blue-400">
                  {getAssetProperty(asset, 'institution')}
                </span>
              </div>
            )}
            {/* Show account number for financial accounts */}
            {asset.category === 'Financial Account' && getAssetProperty(asset, 'accountNumber') && (
              <div className="flex items-center text-sm">
                <span className="text-neutral-500 dark:text-neutral-400">Account:</span>
                <span className="ml-2 font-medium text-neutral-700 dark:text-neutral-300">
                  {getAssetProperty(asset, 'accountNumber')}
                </span>
              </div>
            )}
            {/* Show account type for financial accounts */}
            {asset.category === 'Financial Account' && getAssetProperty(asset, 'accountType') && (
              <div className="flex items-center text-sm">
                <span className="text-neutral-500 dark:text-neutral-400">Type:</span>
                <span className="ml-2 font-medium text-neutral-700 dark:text-neutral-300">
                  {getAssetProperty(asset, 'accountType')}
                </span>
              </div>
            )}
            {renderOwnership(asset)}
            {assetDocumentIds && assetDocumentIds.length > 0 && (
              <div className="flex items-center text-sm">
                <FileText className="w-4 h-4 text-neutral-500 dark:text-neutral-400 mr-1" />
                <span className="text-neutral-600 dark:text-neutral-400">
                  {assetDocumentIds.length} document{assetDocumentIds.length > 1 ? 's' : ''}{' '}
                  attached
                </span>
              </div>
            )}
            {assetDescription && (
              <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
                {assetDescription}
              </p>
            )}
          </div>

          {/* Trend indicator (placeholder for future enhancement) */}
          <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400 mb-4">
            <TrendingUp className="w-4 h-4" />
            <span>+5.2% this year</span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-700">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onView(asset)}
              className="text-primary-DEFAULT hover:text-primary-dark"
            >
              View Details
            </Button>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(asset)}
                title="Edit Asset"
                className="hover:bg-neutral-100 dark:hover:bg-neutral-700"
              >
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(asset)}
                title="Delete Asset"
                className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison for memo optimization
    const prevAsset = prevProps.asset;
    const nextAsset = nextProps.asset;

    return (
      getAssetProperty(prevAsset, 'id') === getAssetProperty(nextAsset, 'id') &&
      getAssetProperty(prevAsset, 'name') === getAssetProperty(nextAsset, 'name') &&
      getAssetProperty(prevAsset, 'value') === getAssetProperty(nextAsset, 'value') &&
      getAssetProperty(prevAsset, 'category') === getAssetProperty(nextAsset, 'category') &&
      getAssetProperty(prevAsset, 'owner') === getAssetProperty(nextAsset, 'owner') &&
      JSON.stringify(getAssetProperty(prevAsset, 'ownership')) ===
        JSON.stringify(getAssetProperty(nextAsset, 'ownership'))
    );
  },
);

AssetCard.displayName = 'AssetCard';

const AssetCardView = <T extends Asset | AnyEnhancedAsset>({
  assets,
  onView,
  onEdit,
  onDelete,
}: AssetCardViewProps<T>) => {
  if (assets.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {assets.map((asset, index) => (
        <AssetCard
          key={getAssetProperty(asset, 'id')}
          asset={asset}
          index={index}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default React.memo(AssetCardView);
