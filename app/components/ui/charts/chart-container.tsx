import { ReactNode } from "react";
import { useTheme } from "~/utils/theme";
import { getChartTheme } from "./chart-colors";

interface ChartContainerProps {
  children: ReactNode;
  height?: number;
  className?: string;
}

/**
 * A responsive container wrapper for all chart components
 * Ensures consistent sizing and responsive behavior across all charts
 */
export function ChartContainer({ children, height = 300, className = "" }: ChartContainerProps) {
  const { theme } = useTheme();
  const chartTheme = getChartTheme(theme);

  return (
    <div className={`w-full ${className}`}>
      <div
        className="w-full rounded-lg p-2"
        style={{
          height: `${height}px`,
          backgroundColor: chartTheme.backgroundColor,
        }}
      >
        {children}
      </div>
    </div>
  );
}
