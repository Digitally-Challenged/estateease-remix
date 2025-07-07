/**
 * Refactored MyAssetsPage component
 * Broken down into smaller, focused components and hooks for better maintainability
 */

import React, { useState, useEffect } from 'react';

import { Plus, PieChart, TrendingUp } from 'lucide-react';
import { useLocation } from 'react-router-dom';

import { useAssetData } from '../../hooks/useAssetData';
import { useAssetFilters } from '../../hooks/useAssetFilters';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { logError } from '../../utils/logger';
import Button from '../common/Button';
import Card from '../common/Card';
import LoadingState from '../common/LoadingState';
import Modal from '../common/Modal';

import AssetCardView from './AssetCardView';
import AssetFilters from './AssetFilters';
import AssetFormModal from './AssetFormModal';
import AssetTable from './AssetTable';
import AssetViewModal from './AssetViewModal';
import AssetViewToggle from './AssetViewToggle';
import VirtualizedAssetTable from './VirtualizedAssetTable';

import type { ViewMode } from '../../hooks/useAssetFilters';
import type { Asset } from '../../types';
import type { AnyEnhancedAsset } from '../../types/assets';

/**
 * Asset management header component
 */
const AssetPageHeader: React.FC<{
  onAddAsset: () => void;
  totalValue: number;
  totalCount: number;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}> = React.memo(({ onAddAsset, totalValue, totalCount, viewMode, onViewModeChange }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          My Assets
        </h1>
        <div className="flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
          <span className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            {totalCount} Assets
          </span>
          <span className="flex items-center gap-1">
            <PieChart className="h-4 w-4" />
            Total Value: {formatCurrency(totalValue)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <AssetViewToggle viewMode={viewMode} onViewModeChange={onViewModeChange} />
        <Button
          onClick={onAddAsset}
          leftIcon={<Plus className="h-4 w-4" />}
          aria-label="Add new asset"
        >
          Add Asset
        </Button>
      </div>
    </div>
  );
});

AssetPageHeader.displayName = 'AssetPageHeader';

/**
 * Asset deletion confirmation modal
 */
const AssetDeleteModal: React.FC<{
  asset: Asset | AnyEnhancedAsset | null;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}> = React.memo(({ asset, isDeleting, onConfirm, onCancel }) => {
  if (!asset) return null;

  return (
    <Modal isOpen onClose={onCancel} title="Delete Asset" className="max-w-md">
      <div className="space-y-4">
        <p className="text-neutral-700 dark:text-neutral-300">
          Are you sure you want to delete "{asset.name}"? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onCancel} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} isLoading={isDeleting}>
            Delete Asset
          </Button>
        </div>
      </div>
    </Modal>
  );
});

AssetDeleteModal.displayName = 'AssetDeleteModal';

/**
 * Main refactored MyAssetsPage component
 */
const MyAssetsPage: React.FC = () => {
  const location = useLocation();
  const { assets, loading, ownershipTotals, useEnhanced, trusts, businesses, assetContext } =
    useAssetData();

  const {
    filters,
    filteredAssets,
    setSearchTerm,
    setCategoryFilter,
    setOwnershipFilter,
    setSortField,
    setSortDirection,
    clearFilters,
    totalFilteredValue,
    filteredCount,
  } = useAssetFilters(assets);

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | AnyEnhancedAsset | null>(null);
  const [viewingAsset, setViewingAsset] = useState<Asset | AnyEnhancedAsset | null>(null);
  const [deletingAsset, setDeletingAsset] = useState<Asset | AnyEnhancedAsset | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // View mode state
  const [viewMode, setViewMode] = useLocalStorage<ViewMode>('assetViewMode', 'card');

  // Handle URL-based modal opening
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const showModal = params.get('modal');

    if (showModal === 'add-asset') {
      setIsFormModalOpen(true);
    }
  }, [location.search]);

  // Modal handlers
  const handleAddAsset = () => {
    setEditingAsset(null);
    setIsFormModalOpen(true);
  };

  const handleEditAsset = (asset: Asset | AnyEnhancedAsset) => {
    setEditingAsset(asset);
    setIsFormModalOpen(true);
  };

  const handleViewAsset = (asset: Asset | AnyEnhancedAsset) => {
    setViewingAsset(asset);
    setIsViewModalOpen(true);
  };

  const handleDeleteAsset = (asset: Asset | AnyEnhancedAsset) => {
    setDeletingAsset(asset);
  };

  const handleConfirmDelete = async () => {
    if (!deletingAsset) return;

    setIsDeleting(true);
    try {
      if (useEnhanced) {
        await enhancedContext.deleteAsset(deletingAsset.id);
      } else if (basicContext) {
        await basicContext.deleteAsset(deletingAsset.id);
      }
      setDeletingAsset(null);
    } catch (error) {
      logError('Failed to delete asset', { assetId: deletingAsset.id }, error as Error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeletingAsset(null);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setEditingAsset(null);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setViewingAsset(null);
  };

  // Calculate total asset value
  const totalAssetValue = assets.reduce((total, asset) => total + (asset.value || 0), 0);

  if (loading) {
    return (
      <LoadingState isLoading={loading} variant="spinner" message="Loading your assets...">
        <div />
      </LoadingState>
    );
  }

  return (
    <div className="flex flex-col h-full max-h-full">
      {/* Page Header - Fixed position */}
      <div className="flex-shrink-0 mb-6">
        <AssetPageHeader
          onAddAsset={handleAddAsset}
          totalValue={totalAssetValue}
          totalCount={assets.length}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
      </div>

      {/* Ownership Summary (Enhanced Assets Only) */}
      {useEnhanced && ownershipTotals && (
        <div className="flex-shrink-0 mb-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              Ownership Breakdown
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(ownershipTotals).map(([type, value]) => (
                <div key={type} className="text-center">
                  <div className="text-2xl font-bold text-primary-DEFAULT">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(value)}
                  </div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400 capitalize">
                    {type.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Asset Filters */}
      <div className="flex-shrink-0 mb-6">
        <AssetFilters
          searchTerm={filters.searchTerm}
          categoryFilter={filters.categoryFilter}
          ownershipFilter={filters.ownershipFilter}
          sortField={filters.sortField}
          sortDirection={filters.sortDirection}
          onSearchChange={setSearchTerm}
          onCategoryChange={setCategoryFilter}
          onOwnershipChange={setOwnershipFilter}
          onSortFieldChange={setSortField}
          onSortDirectionChange={setSortDirection}
          onClearFilters={clearFilters}
          filteredCount={filteredCount}
          totalCount={assets.length}
          totalValue={totalFilteredValue}
        />
      </div>

      {/* Asset List - Takes remaining space with proper overflow handling */}
      <div className="flex-1 overflow-hidden">
        {filteredAssets.length === 0 ? (
          <Card className="text-center py-12">
            <div className="text-neutral-500 dark:text-neutral-400">
              {assets.length === 0 ? (
                <>
                  <PieChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No assets found</h3>
                  <p className="mb-4">
                    Start building your asset portfolio by adding your first asset.
                  </p>
                  <Button onClick={handleAddAsset} leftIcon={<Plus className="h-4 w-4" />}>
                    Add Your First Asset
                  </Button>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-medium mb-2">No assets match your filters</h3>
                  <p className="mb-4">Try adjusting your search or filter criteria.</p>
                  <Button variant="ghost" onClick={clearFilters}>
                    Clear All Filters
                  </Button>
                </>
              )}
            </div>
          </Card>
        ) : (
          <div className="h-full">
            {viewMode === 'card' ? (
              <AssetCardView
                assets={filteredAssets}
                onEdit={handleEditAsset}
                onView={handleViewAsset}
                onDelete={handleDeleteAsset}
              />
            ) : // Use VirtualizedAssetTable for large lists (>50 items) for better performance
              filteredAssets.length > 50 ? (
                <VirtualizedAssetTable
                  assets={filteredAssets}
                  onEdit={handleEditAsset}
                  onView={handleViewAsset}
                  onDelete={handleDeleteAsset}
                  sortField={filters.sortField}
                  sortDirection={filters.sortDirection}
                  onSort={field => {
                    if (field === filters.sortField) {
                      setSortDirection(filters.sortDirection === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortField(field);
                      setSortDirection('asc');
                    }
                  }}
                />
              ) : (
                <AssetTable
                  assets={filteredAssets}
                  onEdit={handleEditAsset}
                  onView={handleViewAsset}
                  onDelete={handleDeleteAsset}
                  sortField={filters.sortField}
                  sortDirection={filters.sortDirection}
                  onSort={field => {
                    if (field === filters.sortField) {
                      setSortDirection(filters.sortDirection === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortField(field);
                      setSortDirection('asc');
                    }
                  }}
                />
              )}
          </div>
        )}
      </div>

      {/* Modals */}
      <AssetFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        editingAsset={editingAsset}
      />

      <AssetViewModal
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        asset={viewingAsset}
      />

      <AssetDeleteModal
        asset={deletingAsset}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
};

export default MyAssetsPage;
