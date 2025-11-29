import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChartContainer } from "./chart-container";
import { ChartTooltip } from "./chart-tooltip";
import { CHART_COLORS } from "./chart-colors";
import { formatCurrency } from "~/utils/format";

interface EstateTaxProjectionPoint {
  year: number;
  netWorth: number;
  exemption: number;
  taxableEstate: number;
  estateTax: number;
}

interface EstateTaxChartProps {
  data: EstateTaxProjectionPoint[];
  height?: number;
}

/**
 * Area chart showing estate tax projections over time
 * Displays projected net worth, exemptions, and tax liability
 */
export function EstateTaxChart({ data, height = 300 }: EstateTaxChartProps) {
  const formatYAxis = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return formatCurrency(value);
  };

  return (
    <ChartContainer height={height}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.8} />
              <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="colorExemption" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART_COLORS.secondary} stopOpacity={0.8} />
              <stop offset="95%" stopColor={CHART_COLORS.secondary} stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="colorTax" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART_COLORS.tertiary} stopOpacity={0.8} />
              <stop offset="95%" stopColor={CHART_COLORS.tertiary} stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
          <XAxis dataKey="year" stroke={CHART_COLORS.axis} style={{ fontSize: "12px" }} />
          <YAxis
            stroke={CHART_COLORS.axis}
            style={{ fontSize: "12px" }}
            tickFormatter={formatYAxis}
          />
          <Tooltip
            content={
              <ChartTooltip
                valueFormatter={formatCurrency}
                labelFormatter={(label) => `Year ${label}`}
              />
            }
          />
          <Area
            type="monotone"
            dataKey="netWorth"
            name="Net Worth"
            stroke={CHART_COLORS.primary}
            fillOpacity={1}
            fill="url(#colorNetWorth)"
          />
          <Area
            type="monotone"
            dataKey="exemption"
            name="Federal Exemption"
            stroke={CHART_COLORS.secondary}
            fillOpacity={1}
            fill="url(#colorExemption)"
          />
          <Area
            type="monotone"
            dataKey="estateTax"
            name="Estate Tax"
            stroke={CHART_COLORS.tertiary}
            fillOpacity={1}
            fill="url(#colorTax)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
