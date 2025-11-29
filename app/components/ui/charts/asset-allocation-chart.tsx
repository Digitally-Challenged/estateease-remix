import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { ChartContainer } from "./chart-container";
import { CATEGORY_COLORS, getCategoryColor, getChartTheme } from "./chart-colors";
import { useTheme } from "~/utils/theme";
import { formatCurrency } from "~/utils/format";

interface AssetAllocationData {
  name: string;
  value: number;
  percentage: number;
  count: number;
}

interface AssetAllocationChartProps {
  data: AssetAllocationData[];
  height?: number;
  showLegend?: boolean;
}

/**
 * Pie chart showing asset allocation by category
 * Displays the portfolio distribution across different asset types
 */
export function AssetAllocationChart({
  data,
  height = 300,
  showLegend = true,
}: AssetAllocationChartProps) {
  const { theme } = useTheme();
  const chartTheme = getChartTheme(theme);

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Get color for specific category, fallback to index-based color
  const getSliceColor = (entry: AssetAllocationData, index: number) => {
    // Try to match by category name to our standard categories
    const categoryKey = entry.name.toUpperCase().replace(/\s+/g, "_");
    if (
      categoryKey in
      {
        REAL_ESTATE: 1,
        FINANCIAL_ACCOUNT: 1,
        BUSINESS_INTEREST: 1,
        INSURANCE_POLICY: 1,
        PERSONAL_PROPERTY: 1,
      }
    ) {
      return getCategoryColor(
        categoryKey as keyof typeof import("./chart-colors").chartColors.categories,
      );
    }
    return CATEGORY_COLORS[index % CATEGORY_COLORS.length];
  };

  // Custom label function for pie slices - remove to fix type issues
  // const renderCustomLabel = (props: { percentage: number }) => {
  //   const { percentage } = props;
  //   if (percentage < 5) return null; // Don't show label for small slices
  //   return formatPercentage(percentage);
  // };

  // Custom tooltip content
  interface TooltipProps {
    active?: boolean;
    payload?: Array<{
      payload: AssetAllocationData;
    }>;
  }

  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (!active || !payload || payload.length === 0) return null;

    const data = payload[0].payload;
    return (
      <div
        className="rounded-lg border p-3 shadow-lg"
        style={{
          backgroundColor: chartTheme.tooltipBg,
          borderColor: chartTheme.tooltipBorder,
          color: chartTheme.textColor,
        }}
      >
        <p className="font-medium" style={{ color: chartTheme.textColor }}>
          {data.name}
        </p>
        <div className="mt-2 space-y-1 text-sm">
          <p style={{ color: chartTheme.textColor, opacity: 0.8 }}>
            Value:{" "}
            <span className="font-medium" style={{ color: chartTheme.textColor }}>
              {formatCurrency(data.value)}
            </span>
          </p>
          <p style={{ color: chartTheme.textColor, opacity: 0.8 }}>
            Percentage:{" "}
            <span className="font-medium" style={{ color: chartTheme.textColor }}>
              {formatPercentage(data.percentage)}
            </span>
          </p>
          <p style={{ color: chartTheme.textColor, opacity: 0.8 }}>
            Assets:{" "}
            <span className="font-medium" style={{ color: chartTheme.textColor }}>
              {data.count}
            </span>
          </p>
        </div>
      </div>
    );
  };

  return (
    <ChartContainer height={height}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {/* eslint-disable-next-line react/prop-types */}
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getSliceColor(entry, index)} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          {showLegend && (
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value: string) => <span style={{ fontSize: "14px" }}>{value}</span>}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
