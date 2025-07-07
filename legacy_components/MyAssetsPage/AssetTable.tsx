import React from 'react';

import { Eye, Pencil, Trash, FileText, Users, User, Building2, ScrollText } from 'lucide-react';

import Button from '../common/Button';
import Card from '../common/Card';

import type { Asset } from '../../types';
import type { AnyEnhancedAsset } from '../../types/assets';

type SortField = 'name' | 'category' | 'value' | 'owner' | 'ownership';
type SortDirection = 'asc' | 'desc';

interface AssetTableProps<T = Asset | AnyEnhancedAsset> {
  assets: T[];
  onView: (asset: T) => void;
  onEdit: (asset: T) => void;
  onDelete: (asset: T) => void;
  sortField?: SortField;
  sortDirection?: SortDirection;
  onSort?: (field: SortField) => void;
}

// Helper function to safely get asset properties
const getAssetProperty = (asset: Asset | AnyEnhancedAsset, property: string): any => {
  return (asset as any)[property];
};

// Memoized table row component for better performance
const AssetTableRow = React.memo(
  <T extends Asset | AnyEnhancedAsset>({
    asset,
    onView,
    onEdit,
    onDelete,
  }: {
    asset: T;
    onView: (asset: T) => void;
    onEdit: (asset: T) => void;
    onDelete: (asset: T) => void;
  }) => {
    const assetId = getAssetProperty(asset, 'id');
    const assetName = getAssetProperty(asset, 'name');
    const assetDescription =
      getAssetProperty(asset, 'description') || getAssetProperty(asset, 'notes');
    const assetValue = getAssetProperty(asset, 'value');
    const assetDocumentIds =
      getAssetProperty(asset, 'documentIds') || getAssetProperty(asset, 'documents') || [];

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
              return 'Joint';
            case 'individual':
              if (ownership.owners.nick) return 'Nick';
              if (ownership.owners.kelsey) return 'Kelsey';
              return 'Individual';
            case 'trust':
              return 'Trust';
            case 'business':
              return 'Business';
            default:
              return 'Unknown';
          }
        };

        return (
          <div className="flex items-center gap-1">
            {getOwnershipIcon()}
            <span>{getOwnershipLabel()}</span>
          </div>
        );
      }

      // Legacy asset with simple owner field
      const owner = getAssetProperty(asset, 'owner');
      return owner || 'N/A';
    };

    return (
      <tr
        key={assetId}
        className="hover:bg-neutral-50 dark:hover:bg-neutral-700/30 transition-colors duration-150"
      >
        <td className="px-4 py-3 whitespace-nowrap">
          <div className="flex items-center gap-2">
            <div>
              <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {assetName}
              </div>
              {/* Show institution name and account info for financial accounts */}
              {asset.category === 'Financial Account' && getAssetProperty(asset, 'institution') && (
                <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-0.5">
                  {getAssetProperty(asset, 'institution')}
                  {getAssetProperty(asset, 'accountNumber') && (
                    <span className="text-neutral-500 dark:text-neutral-400 ml-2">
                      • {getAssetProperty(asset, 'accountNumber')}
                    </span>
                  )}
                  {getAssetProperty(asset, 'accountType') && (
                    <span className="text-neutral-500 dark:text-neutral-400 ml-2">
                      • {getAssetProperty(asset, 'accountType')}
                    </span>
                  )}
                </div>
              )}
              {assetDescription && (
                <div className="text-xs text-neutral-500 dark:text-neutral-400 truncate max-w-xs mt-0.5">
                  {assetDescription}
                </div>
              )}
            </div>
            {assetDocumentIds && assetDocumentIds.length > 0 && (
              <div
                className="flex items-center text-xs text-neutral-500 dark:text-neutral-400"
                title={`${assetDocumentIds.length} document${assetDocumentIds.length > 1 ? 's' : ''} attached`}
              >
                <FileText className="w-4 h-4" />
                <span className="ml-1">{assetDocumentIds.length}</span>
              </div>
            )}
          </div>
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-600 dark:text-neutral-300">
          {asset.category}
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-600 dark:text-neutral-300">
          ${assetValue?.toLocaleString() || '0'}
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-600 dark:text-neutral-300">
          {renderOwnership(asset)}
        </td>
        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium space-x-1">
          <Button variant="ghost" size="sm" onClick={() => onView(asset)} title="View Asset">
            <Eye className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onEdit(asset)} title="Edit Asset">
            <Pencil className="w-4 h-4" />
          </Button>
          <Button variant="danger" size="sm" onClick={() => onDelete(asset)} title="Delete Asset">
            <Trash className="w-4 h-4" />
          </Button>
        </td>
      </tr>
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

AssetTableRow.displayName = 'AssetTableRow';

const AssetTable = <T extends Asset | AnyEnhancedAsset>({
  assets,
  onView,
  onEdit,
  onDelete,
  sortField,
  sortDirection,
  onSort,
}: AssetTableProps<T>) => {
  if (assets.length === 0) {
    // This case should ideally be handled by the parent component's empty state logic
    return null;
  }

  const renderSortableHeader = (field: SortField, label: string) => {
    const isActive = sortField === field;
    const isAsc = sortDirection === 'asc';

    return (
      <th
        scope="col"
        className="px-4 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-600 transition-colors"
        onClick={() => onSort?.(field)}
      >
        <div className="flex items-center gap-1">
          {label}
          {isActive && <span className="text-primary-DEFAULT">{isAsc ? '↑' : '↓'}</span>}
        </div>
      </th>
    );
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden p-0">
      {' '}
      {/* Remove Card padding for full-width table */}
      <div className="flex-1 overflow-auto">
        <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
          <thead className="bg-neutral-50 dark:bg-neutral-700/50 sticky top-0 z-10">
            <tr>
              {renderSortableHeader('name', 'Asset Name')}
              {renderSortableHeader('category', 'Category')}
              {renderSortableHeader('value', 'Value')}
              {renderSortableHeader('ownership', 'Ownership')}
              <th
                scope="col"
                className="px-4 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-700">
            {assets.map(asset => (
              <AssetTableRow
                key={getAssetProperty(asset, 'id')}
                asset={asset}
                onView={onView}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default React.memo(AssetTable);
