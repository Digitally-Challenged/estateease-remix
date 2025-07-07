import React, { memo, useCallback, useMemo } from 'react';

import { ChevronUp, ChevronDown, Eye, Edit, Trash2 } from 'lucide-react';

import Button from '../common/Button';

import type { SortField } from '../../hooks/useAssetFilters';
import type { Asset } from '../../types';
import type { AnyEnhancedAsset } from '../../types/assets';

interface VirtualizedAssetTableProps {
  assets: (Asset | AnyEnhancedAsset)[];
  onView: (asset: Asset | AnyEnhancedAsset) => void;
  onEdit: (asset: Asset | AnyEnhancedAsset) => void;
  onDelete: (asset: Asset | AnyEnhancedAsset) => void;
  sortField: SortField;
  sortDirection: 'asc' | 'desc';
  onSort: (field: SortField) => void;
}

// Row height for virtualization calculations
const ROW_HEIGHT = 60;
const HEADER_HEIGHT = 50;
const VISIBLE_ROWS = 10;

const VirtualizedAssetTable: React.FC<VirtualizedAssetTableProps> = memo(
  ({ assets, onView, onEdit, onDelete, sortField, sortDirection, onSort }) => {
    const [scrollTop, setScrollTop] = React.useState(0);
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Calculate visible range
    const visibleRange = useMemo(() => {
      const startIndex = Math.floor(scrollTop / ROW_HEIGHT);
      const endIndex = Math.min(
        startIndex + VISIBLE_ROWS + 1, // Add buffer
        assets.length,
      );
      return { startIndex, endIndex };
    }, [scrollTop, assets.length]);

    // Get visible items
    const visibleItems = useMemo(() => {
      return assets.slice(visibleRange.startIndex, visibleRange.endIndex);
    }, [assets, visibleRange]);

    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(e.currentTarget.scrollTop);
    }, []);

    const formatCurrency = useCallback((value: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    }, []);

    const SortIcon = useCallback(
      ({ field }: { field: string }) => {
        if (sortField !== field) return null;
        return sortDirection === 'asc' ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        );
      },
      [sortField, sortDirection],
    );

    const totalHeight = assets.length * ROW_HEIGHT;
    const offsetY = visibleRange.startIndex * ROW_HEIGHT;

    return (
      <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm overflow-hidden">
        {/* Fixed Header */}
        <div className="border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900">
          <div className="flex items-center px-6 py-3" style={{ height: HEADER_HEIGHT }}>
            <button
              onClick={() => onSort('name')}
              className="flex-1 flex items-center gap-1 text-left text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100"
            >
              Asset Name
              <SortIcon field="name" />
            </button>
            <button
              onClick={() => onSort('category')}
              className="w-1/4 flex items-center gap-1 text-left text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100"
            >
              Category
              <SortIcon field="category" />
            </button>
            <button
              onClick={() => onSort('value')}
              className="w-1/5 flex items-center gap-1 text-left text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100"
            >
              Value
              <SortIcon field="value" />
            </button>
            <button
              onClick={() => onSort('owner')}
              className="w-1/5 flex items-center gap-1 text-left text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100"
            >
              Owner
              <SortIcon field="owner" />
            </button>
            <div className="w-32 text-right text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Actions
            </div>
          </div>
        </div>

        {/* Scrollable Body with Virtual Scrolling */}
        <div
          ref={containerRef}
          className="overflow-y-auto"
          style={{ height: VISIBLE_ROWS * ROW_HEIGHT }}
          onScroll={handleScroll}
        >
          <div style={{ height: totalHeight, position: 'relative' }}>
            <div
              style={{
                transform: `translateY(${offsetY}px)`,
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
              }}
            >
              {visibleItems.map((asset, index) => {
                const actualIndex = visibleRange.startIndex + index;
                return (
                  <div
                    key={asset.id}
                    className={`flex items-center px-6 py-3 border-b border-neutral-100 dark:border-neutral-700/50 hover:bg-neutral-50 dark:hover:bg-neutral-700/30 transition-colors duration-150 ${
                      actualIndex % 2 === 0 ? 'bg-neutral-50/50 dark:bg-neutral-800/50' : ''
                    }`}
                    style={{ height: ROW_HEIGHT }}
                  >
                    <div className="flex-1">
                      <p className="font-medium text-neutral-900 dark:text-neutral-100">
                        {asset.name}
                      </p>
                      {/* Show institution name and account info for financial accounts */}
                      {asset.category === 'Financial Account' && (asset as any).institution && (
                        <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                          {(asset as any).institution}
                          {(asset as any).accountNumber && (
                            <span className="text-neutral-500 dark:text-neutral-400 ml-2">
                              • {(asset as any).accountNumber}
                            </span>
                          )}
                          {(asset as any).accountType && (
                            <span className="text-neutral-500 dark:text-neutral-400 ml-2">
                              • {(asset as any).accountType}
                            </span>
                          )}
                        </p>
                      )}
                      {asset.description && (
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">
                          {asset.description}
                        </p>
                      )}
                    </div>
                    <div className="w-1/4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-light/10 text-primary-dark dark:bg-primary-dark/10 dark:text-primary-light">
                        {asset.category}
                      </span>
                    </div>
                    <div className="w-1/5 font-medium text-neutral-900 dark:text-neutral-100">
                      {formatCurrency(asset.value)}
                    </div>
                    <div className="w-1/5 text-sm text-neutral-600 dark:text-neutral-400">
                      {asset.owner || 'Not specified'}
                    </div>
                    <div className="w-32 flex items-center justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onView(asset)}
                        aria-label={`View ${asset.name}`}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEdit(asset)}
                        aria-label={`Edit ${asset.name}`}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDelete(asset)}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        aria-label={`Delete ${asset.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-200 dark:border-neutral-700 px-6 py-3 bg-neutral-50 dark:bg-neutral-900">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Showing {visibleRange.startIndex + 1} to{' '}
            {Math.min(visibleRange.endIndex, assets.length)} of {assets.length} assets
          </p>
        </div>
      </div>
    );
  },
);

VirtualizedAssetTable.displayName = 'VirtualizedAssetTable';

export default VirtualizedAssetTable;
