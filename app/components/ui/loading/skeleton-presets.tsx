import { Skeleton, SkeletonContainer } from "./skeleton";
import { cn } from "~/lib/utils";

/**
 * Preset skeleton components for common UI patterns
 * Provides consistent loading states across the application
 */

export interface SkeletonPresetProps {
  className?: string;
  animate?: boolean;
}

/**
 * Asset card skeleton for asset lists
 */
export function AssetCardSkeleton({ className, animate = true }: SkeletonPresetProps) {
  return (
    <div className={cn("p-4 border border-gray-200 rounded-lg", className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <Skeleton variant="circular" width={40} height={40} animate={animate} />
          <div className="space-y-2">
            <Skeleton variant="text" width={120} height={16} animate={animate} />
            <Skeleton variant="text" width={80} height={12} animate={animate} />
          </div>
        </div>
        <Skeleton variant="text" width={100} height={20} animate={animate} />
      </div>
      <div className="space-y-2">
        <Skeleton variant="text" width="100%" height={12} animate={animate} />
        <Skeleton variant="text" width="75%" height={12} animate={animate} />
      </div>
      <div className="flex justify-between items-center mt-4">
        <Skeleton variant="text" width={60} height={12} animate={animate} />
        <Skeleton variant="rectangular" width={60} height={24} animate={animate} className="rounded" />
      </div>
    </div>
  );
}

/**
 * Asset list skeleton for multiple assets
 */
export function AssetListSkeleton({ 
  count = 3, 
  className, 
  animate = true 
}: SkeletonPresetProps & { count?: number }) {
  return (
    <SkeletonContainer count={count} spacing="md" className={className}>
      <AssetCardSkeleton animate={animate} />
    </SkeletonContainer>
  );
}

/**
 * Trust card skeleton
 */
export function TrustCardSkeleton({ className, animate = true }: SkeletonPresetProps) {
  return (
    <div className={cn("p-6 border border-gray-200 rounded-lg", className)}>
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-2">
          <Skeleton variant="text" width={180} height={20} animate={animate} />
          <Skeleton variant="text" width={120} height={14} animate={animate} />
        </div>
        <Skeleton variant="circular" width={32} height={32} animate={animate} />
      </div>
      
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Skeleton variant="text" width={60} height={12} animate={animate} />
            <Skeleton variant="text" width={100} height={16} animate={animate} />
          </div>
          <div className="space-y-1">
            <Skeleton variant="text" width={80} height={12} animate={animate} />
            <Skeleton variant="text" width={120} height={16} animate={animate} />
          </div>
        </div>
        
        <div className="space-y-1">
          <Skeleton variant="text" width={70} height={12} animate={animate} />
          <Skeleton variant="text" width="100%" height={14} animate={animate} />
          <Skeleton variant="text" width="80%" height={14} animate={animate} />
        </div>
      </div>
    </div>
  );
}

/**
 * Family member card skeleton
 */
export function FamilyMemberSkeleton({ className, animate = true }: SkeletonPresetProps) {
  return (
    <div className={cn("p-4 border border-gray-200 rounded-lg", className)}>
      <div className="flex items-center space-x-4 mb-3">
        <Skeleton variant="circular" width={48} height={48} animate={animate} />
        <div className="space-y-2">
          <Skeleton variant="text" width={140} height={18} animate={animate} />
          <Skeleton variant="text" width={100} height={14} animate={animate} />
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Skeleton variant="text" width={50} height={12} animate={animate} />
            <Skeleton variant="text" width={120} height={14} animate={animate} />
          </div>
          <div className="space-y-1">
            <Skeleton variant="text" width={40} height={12} animate={animate} />
            <Skeleton variant="text" width={100} height={14} animate={animate} />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Dashboard stats card skeleton
 */
export function StatsCardSkeleton({ className, animate = true }: SkeletonPresetProps) {
  return (
    <div className={cn("p-6 border border-gray-200 rounded-lg", className)}>
      <div className="flex items-center justify-between mb-2">
        <Skeleton variant="text" width={100} height={14} animate={animate} />
        <Skeleton variant="circular" width={20} height={20} animate={animate} />
      </div>
      <Skeleton variant="text" width={120} height={32} animate={animate} />
      <Skeleton variant="text" width={80} height={12} animate={animate} className="mt-2" />
    </div>
  );
}

/**
 * Chart skeleton
 */
export function ChartSkeleton({ className, animate = true }: SkeletonPresetProps) {
  return (
    <div className={cn("p-6 border border-gray-200 rounded-lg", className)}>
      <div className="mb-4">
        <Skeleton variant="text" width={150} height={20} animate={animate} />
        <Skeleton variant="text" width={200} height={14} animate={animate} className="mt-1" />
      </div>
      <Skeleton variant="rectangular" width="100%" height={300} animate={animate} className="rounded" />
    </div>
  );
}

/**
 * Table row skeleton
 */
export function TableRowSkeleton({ 
  columns = 4, 
  className, 
  animate = true 
}: SkeletonPresetProps & { columns?: number }) {
  return (
    <tr className={className}>
      {Array.from({ length: columns }).map((_, index) => (
        <td key={index} className="px-6 py-4">
          <Skeleton 
            variant="text" 
            width={index === 0 ? 150 : index === columns - 1 ? 80 : 120} 
            height={16} 
            animate={animate} 
          />
        </td>
      ))}
    </tr>
  );
}

/**
 * Table skeleton with header and rows
 */
export function TableSkeleton({ 
  rows = 5, 
  columns = 4, 
  className, 
  animate = true 
}: SkeletonPresetProps & { rows?: number; columns?: number }) {
  return (
    <div className={cn("border border-gray-200 rounded-lg overflow-hidden", className)}>
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            {Array.from({ length: columns }).map((_, index) => (
              <th key={index} className="px-6 py-3 text-left">
                <Skeleton variant="text" width={100} height={16} animate={animate} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {Array.from({ length: rows }).map((_, index) => (
            <TableRowSkeleton key={index} columns={columns} animate={animate} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Form skeleton
 */
export function FormSkeleton({ 
  fields = 4, 
  className, 
  animate = true 
}: SkeletonPresetProps & { fields?: number }) {
  return (
    <div className={cn("space-y-6", className)}>
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton variant="text" width={120} height={16} animate={animate} />
          <Skeleton variant="rectangular" width="100%" height={40} animate={animate} className="rounded" />
        </div>
      ))}
      <div className="flex justify-end space-x-3 pt-4">
        <Skeleton variant="rectangular" width={80} height={36} animate={animate} className="rounded" />
        <Skeleton variant="rectangular" width={100} height={36} animate={animate} className="rounded" />
      </div>
    </div>
  );
}

/**
 * Navigation skeleton
 */
export function NavigationSkeleton({ className, animate = true }: SkeletonPresetProps) {
  return (
    <nav className={cn("space-y-2", className)}>
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="flex items-center space-x-3 px-3 py-2">
          <Skeleton variant="circular" width={20} height={20} animate={animate} />
          <Skeleton variant="text" width={120} height={16} animate={animate} />
        </div>
      ))}
    </nav>
  );
}

/**
 * Header skeleton
 */
export function HeaderSkeleton({ className, animate = true }: SkeletonPresetProps) {
  return (
    <header className={cn("flex items-center justify-between p-4 border-b border-gray-200", className)}>
      <div className="flex items-center space-x-4">
        <Skeleton variant="circular" width={40} height={40} animate={animate} />
        <Skeleton variant="text" width={150} height={20} animate={animate} />
      </div>
      <div className="flex items-center space-x-3">
        <Skeleton variant="circular" width={32} height={32} animate={animate} />
        <Skeleton variant="circular" width={32} height={32} animate={animate} />
        <Skeleton variant="circular" width={32} height={32} animate={animate} />
      </div>
    </header>
  );
}

/**
 * Page skeleton with header and content
 */
export function PageSkeleton({ 
  variant = 'list',
  className, 
  animate = true 
}: SkeletonPresetProps & { variant?: 'list' | 'form' | 'dashboard' }) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton variant="text" width={250} height={32} animate={animate} />
          <Skeleton variant="text" width={400} height={16} animate={animate} />
        </div>
        <Skeleton variant="rectangular" width={120} height={40} animate={animate} className="rounded" />
      </div>

      {/* Content based on variant */}
      {variant === 'list' && (
        <div className="space-y-4">
          <AssetListSkeleton count={4} animate={animate} />
        </div>
      )}

      {variant === 'form' && (
        <FormSkeleton fields={6} animate={animate} />
      )}

      {variant === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <StatsCardSkeleton key={index} animate={animate} />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartSkeleton animate={animate} />
            <ChartSkeleton animate={animate} />
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Quick preset skeletons for common scenarios
 */
export const SkeletonPresets = {
  AssetCard: AssetCardSkeleton,
  AssetList: AssetListSkeleton,
  TrustCard: TrustCardSkeleton,
  FamilyMember: FamilyMemberSkeleton,
  StatsCard: StatsCardSkeleton,
  Chart: ChartSkeleton,
  Table: TableSkeleton,
  Form: FormSkeleton,
  Navigation: NavigationSkeleton,
  Header: HeaderSkeleton,
  Page: PageSkeleton
};