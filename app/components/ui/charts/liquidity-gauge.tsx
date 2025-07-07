import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { ChartContainer } from './chart-container';
import { CHART_COLORS } from './chart-colors';

interface LiquidityGaugeProps {
  percentage: number;
  height?: number;
  targetPercentage?: number;
}

/**
 * Gauge chart showing liquidity percentage
 * Displays the ratio of liquid assets to total assets
 */
export function LiquidityGauge({ percentage, height = 200, targetPercentage = 20 }: LiquidityGaugeProps) {
  // Convert percentage to gauge data
  const value = Math.min(100, Math.max(0, percentage));
  const gaugeData = [
    { name: 'Value', value: value },
    { name: 'Remaining', value: 100 - value }
  ];

  // Determine color based on liquidity level
  const getGaugeColor = () => {
    if (value < 10) return CHART_COLORS.negative; // Low liquidity - red
    if (value < targetPercentage) return CHART_COLORS.warning; // Below target - yellow
    if (value > 50) return CHART_COLORS.primary; // High liquidity - blue
    return CHART_COLORS.positive; // Good liquidity - green
  };

  const formatPercentage = (val: number) => `${val.toFixed(1)}%`;

  return (
    <ChartContainer height={height}>
      <div className="relative w-full h-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={gaugeData}
              cx="50%"
              cy="70%"
              startAngle={180}
              endAngle={0}
              innerRadius="60%"
              outerRadius="80%"
              dataKey="value"
            >
              <Cell fill={getGaugeColor()} />
              <Cell fill={CHART_COLORS.grid} />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center label */}
        <div className="absolute inset-0 flex items-center justify-center" style={{ paddingTop: '20%' }}>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">
              {formatPercentage(value)}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Liquidity Ratio
            </div>
          </div>
        </div>
        
        {/* Min/Max labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-8 pb-2">
          <span className="text-xs text-gray-500">0%</span>
          <span className="text-xs text-gray-500">100%</span>
        </div>
        
        {/* Status indicator */}
        <div className="absolute bottom-8 left-0 right-0 text-center">
          <span className={`text-xs font-medium ${
            value < 10 ? 'text-red-600' :
            value < targetPercentage ? 'text-yellow-600' :
            value > 50 ? 'text-blue-600' :
            'text-green-600'
          }`}>
            {value < 10 ? 'Low Liquidity' :
             value < targetPercentage ? 'Below Target' :
             value > 50 ? 'High Liquidity' :
             'Good Liquidity'}
          </span>
        </div>
      </div>
    </ChartContainer>
  );
}