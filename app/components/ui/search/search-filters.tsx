import { useState } from "react";
import ChevronDown from "lucide-react/dist/esm/icons/chevron-down";
import ChevronUp from "lucide-react/dist/esm/icons/chevron-up";
import X from "lucide-react/dist/esm/icons/x";
import Filter from "lucide-react/dist/esm/icons/filter";
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
  hasNotes: null,
};

export function SearchFilters({
  onFiltersChange,
  initialFilters = defaultFilters,
}: SearchFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);

  // Helper to format enum values for display
  const formatEnumLabel = (value: string): string => {
    return value
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
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
      : filters.categories.filter((c) => c !== category);

    updateFilters({ ...filters, categories: newCategories });
  };

  // Handle ownership type filter changes
  const handleOwnershipChange = (ownershipType: OwnershipType, checked: boolean) => {
    const newOwnershipTypes = checked
      ? [...filters.ownershipTypes, ownershipType]
      : filters.ownershipTypes.filter((o) => o !== ownershipType);

    updateFilters({ ...filters, ownershipTypes: newOwnershipTypes });
  };

  // Handle value range changes
  const handleValueRangeChange = (field: "min" | "max", value: string) => {
    const numValue = value === "" ? undefined : parseFloat(value);
    updateFilters({
      ...filters,
      valueRange: { ...filters.valueRange, [field]: numValue },
    });
  };

  // Handle date range changes
  const handleDateRangeChange = (field: "from" | "to", value: string) => {
    updateFilters({
      ...filters,
      dateRange: { ...filters.dateRange, [field]: value || undefined },
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
    <div className="rounded-lg border border-secondary-200 bg-secondary-50">
      {/* Filter Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between rounded-t-lg px-4 py-3 text-left transition-colors hover:bg-secondary-100"
      >
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-secondary-500" />
          <span className="font-medium text-secondary-900">Advanced Filters</span>
          {activeFilterCount > 0 && (
            <span className="rounded-full bg-primary-100 px-2 py-1 text-xs font-medium text-primary-800">
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
              className="text-sm text-secondary-400 transition-colors hover:text-secondary-600"
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
        <div className="space-y-6 border-t border-secondary-100 px-4 pb-4">
          {/* Asset Categories */}
          <div>
            <h4 className="mb-3 text-sm font-medium text-secondary-700">Asset Categories</h4>
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
            <h4 className="mb-3 text-sm font-medium text-secondary-700">Ownership Types</h4>
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
            <h4 className="mb-3 text-sm font-medium text-secondary-700">Value Range</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="value-min" className="mb-1 block text-xs text-secondary-500">
                  Minimum Value
                </label>
                <input
                  id="value-min"
                  type="number"
                  placeholder="0"
                  value={filters.valueRange.min || ""}
                  onChange={(e) => handleValueRangeChange("min", e.target.value)}
                  className="w-full rounded-md border border-secondary-300 bg-secondary-50 px-3 py-2 text-sm text-secondary-900 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label htmlFor="value-max" className="mb-1 block text-xs text-secondary-500">
                  Maximum Value
                </label>
                <input
                  id="value-max"
                  type="number"
                  placeholder="No limit"
                  value={filters.valueRange.max || ""}
                  onChange={(e) => handleValueRangeChange("max", e.target.value)}
                  className="w-full rounded-md border border-secondary-300 bg-secondary-50 px-3 py-2 text-sm text-secondary-900 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            {(filters.valueRange.min || filters.valueRange.max) && (
              <div className="mt-2 text-xs text-secondary-500">
                Range: {filters.valueRange.min ? formatCurrency(filters.valueRange.min) : "$0"} -{" "}
                {filters.valueRange.max ? formatCurrency(filters.valueRange.max) : "No limit"}
              </div>
            )}
          </div>

          {/* Date Range */}
          <div>
            <h4 className="mb-3 text-sm font-medium text-secondary-700">Date Range</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="date-from" className="mb-1 block text-xs text-secondary-500">
                  From Date
                </label>
                <input
                  id="date-from"
                  type="date"
                  value={filters.dateRange.from || ""}
                  onChange={(e) => handleDateRangeChange("from", e.target.value)}
                  className="w-full rounded-md border border-secondary-300 bg-secondary-50 px-3 py-2 text-sm text-secondary-900 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label htmlFor="date-to" className="mb-1 block text-xs text-secondary-500">
                  To Date
                </label>
                <input
                  id="date-to"
                  type="date"
                  value={filters.dateRange.to || ""}
                  onChange={(e) => handleDateRangeChange("to", e.target.value)}
                  className="w-full rounded-md border border-secondary-300 bg-secondary-50 px-3 py-2 text-sm text-secondary-900 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Notes Filter */}
          <div>
            <h4 className="mb-3 text-sm font-medium text-secondary-700">Notes</h4>
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
            <div className="border-t border-secondary-100 pt-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-secondary-700">Active Filters</span>
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-primary-600 transition-colors hover:text-primary-700"
                >
                  Clear all
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {filters.categories.map((category) => (
                  <span
                    key={category}
                    className="inline-flex items-center rounded-full bg-primary-100 px-2 py-1 text-xs text-primary-800"
                  >
                    {formatEnumLabel(category)}
                    <button
                      onClick={() => handleCategoryChange(category, false)}
                      className="ml-1 transition-colors hover:text-primary-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {filters.ownershipTypes.map((ownershipType) => (
                  <span
                    key={ownershipType}
                    className="inline-flex items-center rounded-full bg-success-50 px-2 py-1 text-xs text-success-900"
                  >
                    {formatEnumLabel(ownershipType)}
                    <button
                      onClick={() => handleOwnershipChange(ownershipType, false)}
                      className="ml-1 transition-colors hover:text-success-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {(filters.valueRange.min !== undefined || filters.valueRange.max !== undefined) && (
                  <span className="inline-flex items-center rounded-full bg-secondary-100 px-2 py-1 text-xs text-secondary-800">
                    Value: {filters.valueRange.min ? formatCurrency(filters.valueRange.min) : "$0"}{" "}
                    - {filters.valueRange.max ? formatCurrency(filters.valueRange.max) : "∞"}
                    <button
                      onClick={() => updateFilters({ ...filters, valueRange: {} })}
                      className="ml-1 transition-colors hover:text-secondary-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {(filters.dateRange.from || filters.dateRange.to) && (
                  <span className="inline-flex items-center rounded-full bg-warning-50 px-2 py-1 text-xs text-warning-900">
                    Date: {filters.dateRange.from || "∞"} to {filters.dateRange.to || "∞"}
                    <button
                      onClick={() => updateFilters({ ...filters, dateRange: {} })}
                      className="ml-1 transition-colors hover:text-warning-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.hasNotes !== null && (
                  <span className="inline-flex items-center rounded-full bg-secondary-100 px-2 py-1 text-xs text-secondary-800">
                    {filters.hasNotes ? "Has notes" : "No notes"}
                    <button
                      onClick={() => updateFilters({ ...filters, hasNotes: null })}
                      className="ml-1 transition-colors hover:text-secondary-600"
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
