import React from 'react';

import { Search, X, TrendingUp, Users, User, ScrollText, Building2, PieChart } from 'lucide-react';

import { ASSET_CATEGORIES_OPTIONS } from '../../constants/asset-options';
import Button from '../common/Button';
import Card from '../common/Card';

import type { AssetCategory } from '../../types';

type OwnershipFilter = 'all' | 'joint' | 'nick' | 'kelsey' | 'trust' | 'business';

interface EnhancedAssetFiltersProps {
  useEnhanced: boolean;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  ownershipFilter: OwnershipFilter;
  onOwnershipFilterChange: (filter: OwnershipFilter) => void;
  selectedCategories: AssetCategory[];
  onCategoryFilterChange: (category: AssetCategory) => void;
  filteredAssetsCount: number;
  totalAssetsCount: number;
  onClearAllFilters: () => void;
}

const EnhancedAssetFilters: React.FC<EnhancedAssetFiltersProps> = ({
  useEnhanced,
  searchTerm,
  onSearchChange,
  ownershipFilter,
  onOwnershipFilterChange,
  selectedCategories,
  onCategoryFilterChange,
  filteredAssetsCount,
  totalAssetsCount,
  onClearAllFilters,
}) => {
  const hasActiveFilters = selectedCategories.length > 0 || ownershipFilter !== 'all' || searchTerm;

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Search className="w-6 h-6 text-primary-DEFAULT" />
          <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100">
            Search & Filters
          </h2>
          {hasActiveFilters && (
            <div className="flex items-center gap-2">
              <span className="bg-primary-DEFAULT text-white text-xs px-2 py-1 rounded-full font-medium">
                {[
                  searchTerm && 'Search',
                  ownershipFilter !== 'all' && 'Owner',
                  selectedCategories.length > 0 && `${selectedCategories.length} Categories`,
                ]
                  .filter(Boolean)
                  .join(' • ')}
              </span>
            </div>
          )}
        </div>
        {hasActiveFilters && (
          <Button
            onClick={onClearAllFilters}
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <X className="w-4 h-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {/* Enhanced Search Bar */}
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
          <input
            id="asset-search"
            type="text"
            value={searchTerm}
            onChange={e => onSearchChange(e.target.value)}
            placeholder={
              useEnhanced
                ? 'Search by name, description, category, or notes...'
                : 'Search by name, description, category, or owner...'
            }
            className="w-full pl-12 pr-4 py-4 text-lg border-2 border-neutral-200 dark:border-neutral-600 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary-DEFAULT/20 focus:border-primary-DEFAULT dark:bg-neutral-700 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400 transition-all duration-200"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Ownership Filter Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          {useEnhanced ? (
            <TrendingUp className="w-5 h-5 text-purple-600" />
          ) : (
            <Users className="w-5 h-5 text-purple-600" />
          )}
          <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">
            {useEnhanced ? 'Ownership Structure' : 'Asset Owner'}
          </h3>
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            ({filteredAssetsCount} of {totalAssetsCount} assets)
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { value: 'all', label: 'All Assets', icon: Users, color: 'blue' },
            { value: 'joint', label: 'Joint', icon: Users, color: 'purple' },
            { value: 'nick', label: 'Nick', icon: User, color: 'blue' },
            { value: 'kelsey', label: 'Kelsey', icon: User, color: 'pink' },
            ...(useEnhanced
              ? [
                { value: 'trust', label: 'Trusts', icon: ScrollText, color: 'green' },
                { value: 'business', label: 'Business', icon: Building2, color: 'amber' },
              ]
              : []),
          ].map(({ value, label, icon: Icon, color }) => {
            const isSelected = ownershipFilter === value;
            const colorClasses = {
              blue: isSelected
                ? 'bg-blue-600 text-white'
                : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30',
              purple: isSelected
                ? 'bg-purple-600 text-white'
                : 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/30',
              pink: isSelected
                ? 'bg-pink-600 text-white'
                : 'bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300 hover:bg-pink-100 dark:hover:bg-pink-900/30',
              green: isSelected
                ? 'bg-green-600 text-white'
                : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30',
              amber: isSelected
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/30',
            };

            return (
              <button
                key={value}
                onClick={() => onOwnershipFilterChange(value as OwnershipFilter)}
                className={`
                  flex flex-col items-center gap-2 p-4 rounded-lg text-sm font-medium transition-all duration-200 border-2
                  ${
              isSelected
                ? `${colorClasses[color as keyof typeof colorClasses]} border-current shadow-lg transform scale-105`
                : `${colorClasses[color as keyof typeof colorClasses]} border-transparent`
              }
                `}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
                {isSelected && <div className="w-2 h-2 bg-current rounded-full" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Filter Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <PieChart className="w-5 h-5 text-emerald-600" />
          <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">
            Asset Categories
          </h3>
          {selectedCategories.length > 0 && (
            <span className="text-sm text-neutral-500 dark:text-neutral-400">
              ({selectedCategories.length} selected)
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {ASSET_CATEGORIES_OPTIONS.map(opt => {
            const isSelected = selectedCategories.includes(opt.value);
            const categoryIcons: Record<string, string> = {
              'Real Estate': '🏠',
              Investment: '📈',
              'Financial Account': '🏦',
              'Insurance Policy': '🛡️',
              'Personal Property': '📦',
              'Business Interest': '🏢',
              'Digital Asset': '💻',
            };
            const icon = categoryIcons[opt.value] || '📄';

            return (
              <button
                key={opt.value}
                onClick={() => onCategoryFilterChange(opt.value)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 border-2 text-left
                  ${
              isSelected
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg transform scale-105'
                : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 border-transparent'
              }
                `}
              >
                <span className="text-lg">{icon}</span>
                <span className="flex-1">{opt.label}</span>
                {isSelected && <div className="w-2 h-2 bg-current rounded-full" />}
              </button>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

export default EnhancedAssetFilters;
