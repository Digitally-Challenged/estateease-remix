import { useState } from "react";
import { ChevronDown, ChevronUp, X, Filter } from "lucide-react";
import { AssetCategory, OwnershipType } from "~/types/enums";
import { formatCurrency } from "~/utils/format";

interface SearchFiltersProps {
  onFiltersChange: (filters: SearchFilters) => void;
  initialFilters?: SearchFilters;
}

export interface SearchFilters {
  categories: AssetCategory[];
  ownershipTypes: OwnershipType[];
  valueRange: {
    min?: number;
    max?: number;
  };
  dateRange: {
    from?: string;
    to?: string;
  };
  hasNotes: boolean | null; // null = no filter, true = has notes, false = no notes
}

const defaultFilters: SearchFilters = {
  categories: [],
  ownershipTypes: [],
  valueRange: {},
  dateRange: {},
  hasNotes: null
};

export function SearchFilters({ onFiltersChange, initialFilters = defaultFilters }: SearchFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);

  // Helper to format enum values for display
  const formatEnumLabel = (value: string): string => {
    return value
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  // Update filters and notify parent
  const updateFilters = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  // Handle category filter changes
  const handleCategoryChange = (category: AssetCategory, checked: boolean) => {
    const newCategories = checked
      ? [...filters.categories, category]
      : filters.categories.filter(c => c !== category);
    
    updateFilters({ ...filters, categories: newCategories });
  };

  // Handle ownership type filter changes
  const handleOwnershipChange = (ownershipType: OwnershipType, checked: boolean) => {
    const newOwnershipTypes = checked
      ? [...filters.ownershipTypes, ownershipType]
      : filters.ownershipTypes.filter(o => o !== ownershipType);
    
    updateFilters({ ...filters, ownershipTypes: newOwnershipTypes });
  };

  // Handle value range changes
  const handleValueRangeChange = (field: 'min' | 'max', value: string) => {
    const numValue = value === '' ? undefined : parseFloat(value);
    updateFilters({
      ...filters,
      valueRange: { ...filters.valueRange, [field]: numValue }
    });
  };

  // Handle date range changes
  const handleDateRangeChange = (field: 'from' | 'to', value: string) => {
    updateFilters({
      ...filters,
      dateRange: { ...filters.dateRange, [field]: value || undefined }
    });
  };

  // Clear all filters
  const clearAllFilters = () => {
    updateFilters(defaultFilters);
  };

  // Check if any filters are active
  const hasActiveFilters = 
    filters.categories.length > 0 ||
    filters.ownershipTypes.length > 0 ||
    filters.valueRange.min !== undefined ||
    filters.valueRange.max !== undefined ||
    filters.dateRange.from !== undefined ||
    filters.dateRange.to !== undefined ||
    filters.hasNotes !== null;

  // Count active filters
  const activeFilterCount = 
    filters.categories.length +
    filters.ownershipTypes.length +
    (filters.valueRange.min !== undefined ? 1 : 0) +
    (filters.valueRange.max !== undefined ? 1 : 0) +
    (filters.dateRange.from !== undefined ? 1 : 0) +
    (filters.dateRange.to !== undefined ? 1 : 0) +
    (filters.hasNotes !== null ? 1 : 0);

  return (
    <div className="bg-secondary-50 border border-secondary-200 rounded-lg">
      {/* Filter Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-secondary-100 rounded-t-lg transition-colors"
      >
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-secondary-500" />
          <span className="font-medium text-secondary-900">Advanced Filters</span>
          {activeFilterCount > 0 && (
            <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2 py-1 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearAllFilters();
              }}
              className="text-secondary-400 hover:text-secondary-600 text-sm transition-colors"
            >
              Clear all
            </button>
          )}
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-secondary-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-secondary-500" />
          )}
        </div>
      </button>

      {/* Filter Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-6 border-t border-secondary-100">
          {/* Asset Categories */}
          <div>
            <h4 className="text-sm font-medium text-secondary-700 mb-3">Asset Categories</h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(AssetCategory).map((category) => (
                <label key={category} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(category)}
                    onChange={(e) => handleCategoryChange(category, e.target.checked)}
                    className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-secondary-700">{formatEnumLabel(category)}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Ownership Types */}
          <div>
            <h4 className="text-sm font-medium text-secondary-700 mb-3">Ownership Types</h4>
            <div className="space-y-2">
              {Object.values(OwnershipType).map((ownershipType) => (
                <label key={ownershipType} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={filters.ownershipTypes.includes(ownershipType)}
                    onChange={(e) => handleOwnershipChange(ownershipType, e.target.checked)}
                    className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-secondary-700">{formatEnumLabel(ownershipType)}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Value Range */}
          <div>
            <h4 className="text-sm font-medium text-secondary-700 mb-3">Value Range</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="value-min" className="block text-xs text-secondary-500 mb-1">Minimum Value</label>
                <input
                  id="value-min"
                  type="number"
                  placeholder="0"
                  value={filters.valueRange.min || ''}
                  onChange={(e) => handleValueRangeChange('min', e.target.value)}
                  className="w-full px-3 py-2 border border-secondary-300 bg-secondary-50 text-secondary-900 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm transition-colors"
                />
              </div>
              <div>
                <label htmlFor="value-max" className="block text-xs text-secondary-500 mb-1">Maximum Value</label>
                <input
                  id="value-max"
                  type="number"
                  placeholder="No limit"
                  value={filters.valueRange.max || ''}
                  onChange={(e) => handleValueRangeChange('max', e.target.value)}
                  className="w-full px-3 py-2 border border-secondary-300 bg-secondary-50 text-secondary-900 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm transition-colors"
                />
              </div>
            </div>
            {(filters.valueRange.min || filters.valueRange.max) && (
              <div className="mt-2 text-xs text-secondary-500">
                Range: {filters.valueRange.min ? formatCurrency(filters.valueRange.min) : '$0'} - {' '}
                {filters.valueRange.max ? formatCurrency(filters.valueRange.max) : 'No limit'}
              </div>
            )}
          </div>

          {/* Date Range */}
          <div>
            <h4 className="text-sm font-medium text-secondary-700 mb-3">Date Range</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="date-from" className="block text-xs text-secondary-500 mb-1">From Date</label>
                <input
                  id="date-from"
                  type="date"
                  value={filters.dateRange.from || ''}
                  onChange={(e) => handleDateRangeChange('from', e.target.value)}
                  className="w-full px-3 py-2 border border-secondary-300 bg-secondary-50 text-secondary-900 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm transition-colors"
                />
              </div>
              <div>
                <label htmlFor="date-to" className="block text-xs text-secondary-500 mb-1">To Date</label>
                <input
                  id="date-to"
                  type="date"
                  value={filters.dateRange.to || ''}
                  onChange={(e) => handleDateRangeChange('to', e.target.value)}
                  className="w-full px-3 py-2 border border-secondary-300 bg-secondary-50 text-secondary-900 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Notes Filter */}
          <div>
            <h4 className="text-sm font-medium text-secondary-700 mb-3">Notes</h4>
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="radio"
                  name="notesFilter"
                  checked={filters.hasNotes === null}
                  onChange={() => updateFilters({ ...filters, hasNotes: null })}
                  className="text-primary-600 focus:ring-primary-500"
                />
                <span className="text-secondary-700">All items</span>
              </label>
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="radio"
                  name="notesFilter"
                  checked={filters.hasNotes === true}
                  onChange={() => updateFilters({ ...filters, hasNotes: true })}
                  className="text-primary-600 focus:ring-primary-500"
                />
                <span className="text-secondary-700">Items with notes</span>
              </label>
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="radio"
                  name="notesFilter"
                  checked={filters.hasNotes === false}
                  onChange={() => updateFilters({ ...filters, hasNotes: false })}
                  className="text-primary-600 focus:ring-primary-500"
                />
                <span className="text-secondary-700">Items without notes</span>
              </label>
            </div>
          </div>

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="pt-4 border-t border-secondary-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-secondary-700">Active Filters</span>
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
                >
                  Clear all
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {filters.categories.map((category) => (
                  <span
                    key={category}
                    className="inline-flex items-center px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full"
                  >
                    {formatEnumLabel(category)}
                    <button
                      onClick={() => handleCategoryChange(category, false)}
                      className="ml-1 hover:text-primary-600 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {filters.ownershipTypes.map((ownershipType) => (
                  <span
                    key={ownershipType}
                    className="inline-flex items-center px-2 py-1 bg-success-50 text-success-900 text-xs rounded-full"
                  >
                    {formatEnumLabel(ownershipType)}
                    <button
                      onClick={() => handleOwnershipChange(ownershipType, false)}
                      className="ml-1 hover:text-success-500 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {(filters.valueRange.min !== undefined || filters.valueRange.max !== undefined) && (
                  <span className="inline-flex items-center px-2 py-1 bg-secondary-100 text-secondary-800 text-xs rounded-full">
                    Value: {filters.valueRange.min ? formatCurrency(filters.valueRange.min) : '$0'} - {' '}
                    {filters.valueRange.max ? formatCurrency(filters.valueRange.max) : '∞'}
                    <button
                      onClick={() => updateFilters({ ...filters, valueRange: {} })}
                      className="ml-1 hover:text-secondary-600 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {(filters.dateRange.from || filters.dateRange.to) && (
                  <span className="inline-flex items-center px-2 py-1 bg-warning-50 text-warning-900 text-xs rounded-full">
                    Date: {filters.dateRange.from || '∞'} to {filters.dateRange.to || '∞'}
                    <button
                      onClick={() => updateFilters({ ...filters, dateRange: {} })}
                      className="ml-1 hover:text-warning-500 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.hasNotes !== null && (
                  <span className="inline-flex items-center px-2 py-1 bg-secondary-100 text-secondary-800 text-xs rounded-full">
                    {filters.hasNotes ? 'Has notes' : 'No notes'}
                    <button
                      onClick={() => updateFilters({ ...filters, hasNotes: null })}
                      className="ml-1 hover:text-secondary-600 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}