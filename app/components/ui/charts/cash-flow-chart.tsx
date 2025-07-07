import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartContainer } from './chart-container';
import { ChartTooltip } from './chart-tooltip';
import { CHART_COLORS } from './chart-colors';

interface CashFlowDataPoint {
  month: string;
  income: number;
  expenses: number;
  netFlow: number;
}

interface CashFlowChartProps {
  data: CashFlowDataPoint[];
  height?: number;
}

/**
 * Bar chart showing monthly cash flow
 * Displays income, expenses, and net cash flow by month
 */
export function CashFlowChart({ data, height = 300 }: CashFlowChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatYAxis = (value: number) => {
    if (Math.abs(value) >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (Math.abs(value) >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value}`;
  };

  return (
    <ChartContainer height={height}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={data} 
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
          <XAxis 
            dataKey="month" 
            stroke={CHART_COLORS.axis}
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke={CHART_COLORS.axis}
            style={{ fontSize: '12px' }}
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
            wrapperStyle={{ fontSize: '14px' }}
          />
          <Bar 
            dataKey="income" 
            name="Income"
            fill={CHART_COLORS.secondary} 
            radius={[4, 4, 0, 0]}
          />
          <Bar 
            dataKey="expenses" 
            name="Expenses"
            fill={CHART_COLORS.tertiary} 
            radius={[4, 4, 0, 0]}
          />
          <Bar 
            dataKey="netFlow" 
            name="Net Flow"
            fill={CHART_COLORS.primary} 
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}