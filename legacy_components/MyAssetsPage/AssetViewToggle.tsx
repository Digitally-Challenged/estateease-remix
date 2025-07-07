/**
 * Asset view mode toggle component
 * Allows switching between card and table view modes
 */

import React from 'react';

import { Grid3x3, List } from 'lucide-react';

import Button from '../common/Button';

import type { ViewMode } from '../../hooks/useAssetFilters';

interface AssetViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  disabled?: boolean;
}

/**
 * Toggle component for switching between card and table view modes
 */
const AssetViewToggle: React.FC<AssetViewToggleProps> = ({
  viewMode,
  onViewModeChange,
  disabled = false,
}) => {
  return (
    <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1">
      <Button
        variant={viewMode === 'card' ? 'primary' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('card')}
        disabled={disabled}
        aria-label="Card view"
        aria-pressed={viewMode === 'card'}
        className={`
          px-3 py-2 text-sm font-medium transition-all duration-200
          ${
    viewMode === 'card'
      ? 'bg-primary-DEFAULT text-white shadow-sm'
      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
    }
        `}
      >
        <Grid3x3 className="h-4 w-4 mr-1" />
        Cards
      </Button>

      <Button
        variant={viewMode === 'table' ? 'primary' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('table')}
        disabled={disabled}
        aria-label="Table view"
        aria-pressed={viewMode === 'table'}
        className={`
          px-3 py-2 text-sm font-medium transition-all duration-200
          ${
    viewMode === 'table'
      ? 'bg-primary-DEFAULT text-white shadow-sm'
      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
    }
        `}
      >
        <List className="h-4 w-4 mr-1" />
        Table
      </Button>
    </div>
  );
};

export default React.memo(AssetViewToggle);
