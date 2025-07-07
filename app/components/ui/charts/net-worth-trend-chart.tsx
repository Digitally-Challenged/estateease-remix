import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartContainer } from './chart-container';
import { ChartTooltip } from './chart-tooltip';
import { chartColors, getChartTheme } from './chart-colors';
import { useTheme } from '~/utils/theme';

interface NetWorthDataPoint {
  month: string;
  netWorth: number;
  assets: number;
  liabilities: number;
}

interface NetWorthTrendChartProps {
  data: NetWorthDataPoint[];
  height?: number;
}

/**
 * Line chart showing net worth trend over time
 * Displays total net worth, assets, and liabilities
 */
export function NetWorthTrendChart({ data, height = 300 }: NetWorthTrendChartProps) {
  const { theme } = useTheme();
  const chartTheme = getChartTheme(theme);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatYAxis = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value}`;
  };

  return (
    <ChartContainer height={height}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart 
          data={data} 
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} />
          <XAxis 
            dataKey="month" 
            stroke={chartTheme.axisColor}
            style={{ fontSize: '12px', fill: chartTheme.textColor }}
          />
          <YAxis 
            stroke={chartTheme.axisColor}
            style={{ fontSize: '12px', fill: chartTheme.textColor }}
            tickFormatter={formatYAxis}
          />
          <Tooltip 
            content={
              <ChartTooltip 
                valueFormatter={formatCurrency}
              />
            }
          />
          <Legend 
            wrapperStyle={{ fontSize: '14px', color: chartTheme.textColor }}
          />
          <Line 
            type="monotone" 
            dataKey="netWorth" 
            name="Net Worth"
            stroke={chartColors.primary[0]} 
            strokeWidth={3}
            dot={{ r: 4, fill: chartColors.primary[0] }}
            activeDot={{ r: 6, fill: chartColors.primary[0] }}
          />
          <Line 
            type="monotone" 
            dataKey="assets" 
            name="Total Assets"
            stroke={chartColors.semantic.success} 
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ r: 3, fill: chartColors.semantic.success }}
          />
          <Line 
            type="monotone" 
            dataKey="liabilities" 
            name="Total Liabilities"
            stroke={chartColors.semantic.error} 
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ r: 3, fill: chartColors.semantic.error }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}