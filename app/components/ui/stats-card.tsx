import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { cn } from "~/lib/utils";

export interface StatsCardProps {
  /**
   * The title/label of the stat
   */
  title: string;

  /**
   * The main value to display
   */
  value: string | number;

  /**
   * Optional description text below the value
   */
  description?: string;

  /**
   * Lucide icon component to display
   */
  icon: LucideIcon;

  /**
   * Optional trend indicator
   */
  trend?: {
    value: number | string;
    isPositive: boolean;
  };

  /**
   * Additional className for the root Card element
   */
  className?: string;
}

/**
 * StatsCard - A reusable component for displaying statistics
 *
 * This component standardizes the display of key metrics across the application,
 * showing a title, value, optional trend, and icon.
 *
 * @example
 * ```tsx
 * <StatsCard
 *   title="Total Net Worth"
 *   value="$2,450,000"
 *   description="from last month"
 *   icon={DollarSign}
 *   trend={{ value: "+2.3%", isPositive: true }}
 * />
 * ```
 */
export const StatsCard = React.forwardRef<HTMLDivElement, StatsCardProps>(
  ({ title, value, description, icon: Icon, trend, className }, ref) => {
    return (
      <Card ref={ref} className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </CardTitle>
          <Icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</div>
          {(description || trend) && (
            <p
              className={cn(
                "text-xs",
                trend
                  ? trend.isPositive
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                  : "text-gray-600 dark:text-gray-400",
              )}
            >
              {trend && <span>{trend.value} </span>}
              {description}
            </p>
          )}
        </CardContent>
      </Card>
    );
  },
);

StatsCard.displayName = "StatsCard";
