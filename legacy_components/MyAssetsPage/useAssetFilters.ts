/**
 * Custom hook for managing asset filtering, sorting, and search functionality
 */

import { useState, useMemo } from 'react';

import { getAssetProperty, isEnhancedAsset } from './useAssetData';

import type { Asset, AssetCategory } from '../types';
import type { AnyEnhancedAsset } from '../types/assets';

export type ViewMode = 'card' | 'table';
export type OwnershipFilter = 'all' | 'joint' | 'nick' | 'kelsey' | 'trust' | 'business';
export type SortField = 'name' | 'category' | 'value' | 'owner' | 'ownership';
export type SortDirection = 'asc' | 'desc';

export interface AssetFilters {
  searchTerm: string;
  categoryFilter: AssetCategory | 'all';
  ownershipFilter: OwnershipFilter;
  sortField: SortField;
  sortDirection: SortDirection;
}

export interface UseAssetFiltersReturn {
  filters: AssetFilters;
  filteredAssets: (Asset | AnyEnhancedAsset)[];
  setSearchTerm: (term: string) => void;
  setCategoryFilter: (category: AssetCategory | 'all') => void;
  setOwnershipFilter: (filter: OwnershipFilter) => void;
  setSortField: (field: SortField) => void;
  setSortDirection: (direction: SortDirection) => void;
  toggleSortDirection: () => void;
  clearFilters: () => void;
  totalFilteredValue: number;
  filteredCount: number;
}

/**
 * Hook to manage asset filtering, sorting, and search
 */
export const useAssetFilters = (assets: (Asset | AnyEnhancedAsset)[]): UseAssetFiltersReturn => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<AssetCategory | 'all'>('all');
  const [ownershipFilter, setOwnershipFilter] = useState<OwnershipFilter>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const filters: AssetFilters = {
    searchTerm,
    categoryFilter,
    ownershipFilter,
    sortField,
    sortDirection,
  };

  // Memoized filtered and sorted assets
  const filteredAssets = useMemo(() => {
    let filtered = assets;

    // Apply search filter
    if (searchTerm.trim()) {
      const lowercaseSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        asset =>
          asset.name?.toLowerCase().includes(lowercaseSearchTerm) ||
          asset.category?.toLowerCase().includes(lowercaseSearchTerm) ||
          asset.description?.toLowerCase().includes(lowercaseSearchTerm),
      );
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(asset => asset.category === categoryFilter);
    }

    // Apply ownership filter
    if (ownershipFilter !== 'all') {
      filtered = filtered.filter(asset => {
        if (isEnhancedAsset(asset) && asset.ownership) {
          switch (ownershipFilter) {
            case 'joint':
              return asset.ownership.type === 'joint';
            case 'nick':
              return (
                asset.ownership.type === 'individual' &&
                asset.ownership.ownerName?.toLowerCase().includes('nick')
              );
            case 'kelsey':
              return (
                asset.ownership.type === 'individual' &&
                asset.ownership.ownerName?.toLowerCase().includes('kelsey')
              );
            case 'trust':
              return asset.ownership.type === 'trust';
            case 'business':
              return asset.ownership.type === 'business';
            default:
              return true;
          }
        }
        return ownershipFilter === 'all';
      });
    }

    // Apply sorting
    return [...filtered].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case 'name':
          aValue = a.name || '';
          bValue = b.name || '';
          break;
        case 'category':
          aValue = a.category || '';
          bValue = b.category || '';
          break;
        case 'value':
          aValue = a.value || 0;
          bValue = b.value || 0;
          break;
        case 'owner':
          if (isEnhancedAsset(a) && isEnhancedAsset(b)) {
            aValue = a.ownership?.ownerName || '';
            bValue = b.ownership?.ownerName || '';
          } else {
            aValue = '';
            bValue = '';
          }
          break;
        case 'ownership':
          if (isEnhancedAsset(a) && isEnhancedAsset(b)) {
            aValue = a.ownership?.type || '';
            bValue = b.ownership?.type || '';
          } else {
            aValue = '';
            bValue = '';
          }
          break;
        default:
          aValue = '';
          bValue = '';
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortDirection === 'asc' ? comparison : -comparison;
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        const comparison = aValue - bValue;
        return sortDirection === 'asc' ? comparison : -comparison;
      }

      return 0;
    });
  }, [assets, searchTerm, categoryFilter, ownershipFilter, sortField, sortDirection]);

  // Calculate total value of filtered assets
  const totalFilteredValue = useMemo(() => {
    return filteredAssets.reduce((total, asset) => total + (asset.value || 0), 0);
  }, [filteredAssets]);

  const toggleSortDirection = () => {
    setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setOwnershipFilter('all');
    setSortField('name');
    setSortDirection('asc');
  };

  return {
    filters,
    filteredAssets,
    setSearchTerm,
    setCategoryFilter,
    setOwnershipFilter,
    setSortField,
    setSortDirection,
    toggleSortDirection,
    clearFilters,
    totalFilteredValue,
    filteredCount: filteredAssets.length,
  };
};

export default useAssetFilters;
