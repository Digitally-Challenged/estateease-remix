import { useState } from "react";
import ChevronDown from "lucide-react/dist/esm/icons/chevron-down";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";
import Plus from "lucide-react/dist/esm/icons/plus";
import Edit2 from "lucide-react/dist/esm/icons/edit-2";
import Trash2 from "lucide-react/dist/esm/icons/trash-2";
import DollarSign from "lucide-react/dist/esm/icons/dollar-sign";
import { Button } from "./button";
import { Badge } from "./badge";
import { formatCurrency } from "~/utils/format";
import type { AnyAsset } from "~/types/assets";
import { AssetCategory, OwnershipType } from "~/types/enums";

interface AssetAccordionProps {
  assets: AnyAsset[];
  onEdit?: (asset: AnyAsset) => void;
  onDelete?: (assetId: string) => void;
  onAdd?: (category: AssetCategory) => void;
}

interface CategoryGroup {
  category: AssetCategory;
  label: string;
  assets: AnyAsset[];
  totalValue: number;
}

const CATEGORY_LABELS: Record<AssetCategory, string> = {
  [AssetCategory.REAL_ESTATE]: "Real Estate",
  [AssetCategory.FINANCIAL_ACCOUNT]: "Financial Accounts",
  [AssetCategory.INSURANCE_POLICY]: "Insurance Policies",
  [AssetCategory.BUSINESS_INTEREST]: "Business Interests",
  [AssetCategory.PERSONAL_PROPERTY]: "Personal Property",
  [AssetCategory.VEHICLE]: "Vehicles",
  [AssetCategory.DEBT]: "Debts & Liabilities",
  [AssetCategory.OTHER]: "Other Assets",
};

const OWNERSHIP_LABELS: Record<OwnershipType, string> = {
  [OwnershipType.INDIVIDUAL]: "Individual",
  [OwnershipType.JOINT]: "Joint",
  [OwnershipType.TRUST]: "Trust",
  [OwnershipType.BUSINESS]: "Business",
};

export function AssetAccordion({ assets, onEdit, onDelete, onAdd }: AssetAccordionProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<AssetCategory>>(
    new Set([AssetCategory.REAL_ESTATE, AssetCategory.FINANCIAL_ACCOUNT]),
  );
  const [expandAll, setExpandAll] = useState(false);

  // Group assets by category
  const categoryGroups: CategoryGroup[] = Object.values(AssetCategory)
    .map((category) => {
      const categoryAssets = assets.filter((asset) => asset.category === category);
      const totalValue = categoryAssets.reduce((sum, asset) => sum + (asset.value || 0), 0);

      return {
        category,
        label: CATEGORY_LABELS[category],
        assets: categoryAssets,
        totalValue,
      };
    })
    .filter((group) => group.assets.length > 0);

  const toggleCategory = (category: AssetCategory) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const handleExpandAll = () => {
    if (expandAll) {
      setExpandedCategories(new Set());
    } else {
      setExpandedCategories(new Set(categoryGroups.map((g) => g.category)));
    }
    setExpandAll(!expandAll);
  };

  const getOwnershipBadgeVariant = (
    ownershipType: OwnershipType,
  ): "default" | "secondary" | "outline" => {
    switch (ownershipType) {
      case OwnershipType.TRUST:
        return "default";
      case OwnershipType.JOINT:
        return "secondary";
      default:
        return "outline";
    }
  };

  const totalValue = assets.reduce((sum, asset) => sum + (asset.value || 0), 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Total Portfolio Value</h2>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {formatCurrency(totalValue)}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={handleExpandAll}>
          {expandAll ? "Collapse All" : "Expand All"}
        </Button>
      </div>

      {/* Category Groups */}
      <div className="space-y-2">
        {categoryGroups.map(
          ({ category, label, assets: categoryAssets, totalValue: categoryTotal }) => {
            const isExpanded = expandedCategories.has(category);

            return (
              <div key={category} className="overflow-hidden rounded-lg border">
                {/* Category Header */}
                <button
                  className="flex w-full items-center justify-between bg-gray-50 px-4 py-3 transition-colors hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700"
                  onClick={() => toggleCategory(category)}
                  type="button"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-500" />
                    )}
                    <span className="font-medium">{label}</span>
                    <Badge variant="secondary" className="text-xs">
                      {categoryAssets.length} {categoryAssets.length === 1 ? "item" : "items"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{formatCurrency(categoryTotal)}</span>
                    {onAdd && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAdd(category);
                        }}
                        className="opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </button>

                {/* Asset List */}
                {isExpanded && (
                  <div className="divide-y dark:divide-gray-700">
                    {categoryAssets.map((asset) => (
                      <div
                        key={asset.id}
                        className="px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="mb-1 flex items-center gap-2">
                              <h4 className="font-medium">{asset.name}</h4>
                              <Badge
                                variant={getOwnershipBadgeVariant(
                                  asset.ownership.type as OwnershipType,
                                )}
                                className="text-xs"
                              >
                                {OWNERSHIP_LABELS[asset.ownership.type as OwnershipType] ||
                                  asset.ownership.type}
                              </Badge>
                            </div>

                            {asset.description && (
                              <p className="mb-1 text-sm text-gray-600 dark:text-gray-400">
                                {asset.description}
                              </p>
                            )}

                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              {asset.ownership.percentage && asset.ownership.percentage < 100 && (
                                <span>{asset.ownership.percentage}% ownership</span>
                              )}
                              {"accountNumber" in asset && asset.accountNumber && (
                                <span>••••{asset.accountNumber.slice(-4)}</span>
                              )}
                              {"policyNumber" in asset && asset.policyNumber && (
                                <span>Policy #{asset.policyNumber}</span>
                              )}
                            </div>
                          </div>

                          <div className="ml-4 flex items-center gap-3">
                            <div className="text-right">
                              <p className="font-semibold">{formatCurrency(asset.value || 0)}</p>
                              {"valuationDate" in asset && asset.valuationDate && (
                                <p className="text-xs text-gray-500">
                                  as of {new Date(asset.valuationDate).toLocaleDateString()}
                                </p>
                              )}
                            </div>

                            {(onEdit || onDelete) && (
                              <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                {onEdit && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => onEdit(asset)}
                                    title="Edit asset"
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                )}
                                {onDelete && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => onDelete(asset.id)}
                                    title="Delete asset"
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          },
        )}
      </div>

      {/* Empty State */}
      {categoryGroups.length === 0 && (
        <div className="py-8 text-center text-gray-500">
          <DollarSign className="mx-auto mb-3 h-12 w-12 text-gray-300" />
          <p>No assets found</p>
          {onAdd && (
            <Button
              variant="primary"
              onClick={() => onAdd(AssetCategory.FINANCIAL_ACCOUNT)}
              className="mt-4"
            >
              Add Your First Asset
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
