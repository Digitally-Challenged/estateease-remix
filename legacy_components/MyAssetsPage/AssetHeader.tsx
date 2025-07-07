import React from 'react';

import { Plus, Grid3x3, List } from 'lucide-react';

import Button from '../common/Button';

type ViewMode = 'card' | 'table';
type OwnershipFilter = 'all' | 'joint' | 'nick' | 'kelsey' | 'trust' | 'business';

interface AssetHeaderProps {
  useEnhanced: boolean;
  ownershipFilter: OwnershipFilter;
  currentFilterValue: number;
  filteredAssetsCount: number;
  totalAssetsCount: number;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onAddAsset: () => void;
}

const AssetHeader: React.FC<AssetHeaderProps> = ({
  useEnhanced,
  ownershipFilter,
  currentFilterValue,
  filteredAssetsCount,
  totalAssetsCount,
  viewMode,
  onViewModeChange,
  onAddAsset,
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-100">
          {useEnhanced ? 'Asset Portfolio' : 'My Assets'}
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">
          {ownershipFilter === 'all'
            ? 'Total'
            : ownershipFilter.charAt(0).toUpperCase() + ownershipFilter.slice(1)}{' '}
          Portfolio Value:
          <span className="font-semibold text-neutral-800 dark:text-neutral-200 ml-2">
            ${currentFilterValue.toLocaleString()}
          </span>
          {ownershipFilter !== 'all' && (
            <span className="text-sm text-neutral-500 dark:text-neutral-400 ml-2">
              ({filteredAssetsCount} of {totalAssetsCount} assets)
            </span>
          )}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center bg-neutral-100 dark:bg-neutral-700 rounded-lg p-1">
          <Button
            variant={viewMode === 'card' ? 'primary' : 'ghost'}
            onClick={() => onViewModeChange('card')}
            aria-label="Card View"
            title="Card View"
            size="sm"
            className="px-3 py-1.5"
          >
            <Grid3x3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'table' ? 'primary' : 'ghost'}
            onClick={() => onViewModeChange('table')}
            aria-label="Table View"
            title="Table View"
            size="sm"
            className="px-3 py-1.5"
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
        <Button
          onClick={onAddAsset}
          leftIcon={<Plus className="w-5 h-5" />}
          className="shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
        >
          Add Asset
        </Button>
      </div>
    </div>
  );
};

export default React.memo(AssetHeader);
