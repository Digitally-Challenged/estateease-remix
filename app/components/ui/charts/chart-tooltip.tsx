interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
  dataKey: string;
  payload: Record<string, unknown>;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
  valueFormatter?: (value: number) => string;
  labelFormatter?: (label: string) => string;
}

/**
 * Custom tooltip component for all charts
 * Provides consistent styling and formatting across visualizations
 */
export function ChartTooltip({
  active,
  payload,
  label,
  valueFormatter = (value) => value.toLocaleString(),
  labelFormatter = (label) => label
}: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
      {label && (
        <p className="text-sm font-medium text-gray-900 mb-2">
          {labelFormatter(label)}
        </p>
      )}
      <div className="space-y-1">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-600">{entry.name}:</span>
            <span className="text-sm font-medium text-gray-900">
              {valueFormatter(entry.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}