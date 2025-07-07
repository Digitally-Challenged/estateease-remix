/**
 * Custom hook for managing asset data and providing unified access
 * to both basic and enhanced asset contexts
 *
 * @description This hook centralizes access to asset data from multiple contexts,
 * automatically determining whether to use enhanced or basic assets based on
 * data availability. It also provides access to related entities like trusts
 * and businesses.
 *
 * @example
 * ```tsx
 * const { assets, loading, useEnhanced } = useAssetData();
 *
 * if (loading) return <LoadingSpinner />;
 *
 * return (
 *   <div>
 *     {assets.map(asset => (
 *       <AssetCard key={asset.id} asset={asset} />
 *     ))}
 *   </div>
 * );
 * ```
 *
 * @returns Asset data and related context information
 */

import { useBusinesses } from '../contexts/BusinessContext';
import { useTrusts } from '../contexts/TrustContext';
import { useUnifiedAssets } from '../contexts/UnifiedAssetContext';

import type { Asset } from '../types';
import type { AnyEnhancedAsset } from '../types/assets';

export interface UseAssetDataReturn {
  assets: AnyEnhancedAsset[];
  loading: boolean;
  ownershipTotals: Record<string, number>;
  useEnhanced: boolean;
  trusts: ReturnType<typeof useTrusts>['trusts'];
  businesses: ReturnType<typeof useBusinesses>['businesses'];
  assetContext: ReturnType<typeof useUnifiedAssets>;
}

/**
 * Hook to manage asset data from multiple contexts
 * Automatically determines whether to use enhanced or basic assets
 */
export const useAssetData = (): UseAssetDataReturn => {
  const unifiedContext = useUnifiedAssets();
  const { trusts } = useTrusts();
  const { businesses } = useBusinesses();

  // All assets are now enhanced in the unified context
  const useEnhanced = true;

  return {
    assets: unifiedContext.assets,
    loading: unifiedContext.loading,
    ownershipTotals: unifiedContext.ownershipTotals,
    useEnhanced,
    trusts,
    businesses,
    assetContext: unifiedContext,
  };
};

/**
 * Type-safe helper function to get asset properties
 * Replaces the unsafe any casting in the original component
 */
export const getAssetProperty = <T = unknown>(
  asset: Asset | AnyEnhancedAsset,
  property: keyof Asset | keyof AnyEnhancedAsset,
): T | undefined => {
  return (asset as Record<string, T>)[property as string];
};

/**
 * Helper to check if an asset is enhanced
 * Note: All assets in UnifiedAssetContext are enhanced
 */
export const isEnhancedAsset = (asset: Asset | AnyEnhancedAsset): asset is AnyEnhancedAsset => {
  return 'ownership' in asset;
};

export default useAssetData;
