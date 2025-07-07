import React from 'react';

import { PieChart, Plus } from 'lucide-react';

import Button from '../common/Button';

interface AssetEmptyStateProps {
  useEnhanced: boolean;
  hasAssets: boolean;
  onAddAsset: () => void;
  onClearFilters: () => void;
}

const AssetEmptyState: React.FC<AssetEmptyStateProps> = ({
  useEnhanced,
  hasAssets,
  onAddAsset,
  onClearFilters,
}) => {
  if (!hasAssets) {
    return (
      <div className="relative bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-900 rounded-2xl p-12 text-center overflow-hidden">
        <div className="absolute inset-0 bg-white/50 dark:bg-black/20 backdrop-blur-sm" />
        <div className="relative z-10">
          <div className="mx-auto w-20 h-20 bg-primary-light/20 dark:bg-primary-dark/20 rounded-full flex items-center justify-center mb-6">
            <PieChart
              className="h-10 w-10 text-primary-DEFAULT dark:text-primary-light"
              aria-hidden="true"
            />
          </div>
          <h3 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200 mb-2">
            Start Building Your Portfolio
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 mb-8 max-w-md mx-auto">
            {useEnhanced
              ? 'Track your assets with advanced ownership structures including trusts and business entities.'
              : 'Track your assets, monitor their value, and keep your estate plan up to date.'}
          </p>
          <Button
            onClick={onAddAsset}
            leftIcon={<Plus className="w-5 h-5" />}
            size="lg"
            className="shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            Add Your First Asset
          </Button>
        </div>
      </div>
    );
  }

  // No filtered results
  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800/30 rounded-xl p-8 text-center">
      <div className="mx-auto w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mb-4">
        <PieChart className="h-8 w-8 text-yellow-600 dark:text-yellow-400" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 mb-2">
        No Assets Match Your Filters
      </h3>
      <p className="text-neutral-600 dark:text-neutral-400 mb-6">
        Try adjusting your filters to see more assets.
      </p>
      <Button
        onClick={onClearFilters}
        variant="secondary"
        className="hover:bg-yellow-100 dark:hover:bg-yellow-900/20"
      >
        Clear All Filters
      </Button>
    </div>
  );
};

export default AssetEmptyState;
