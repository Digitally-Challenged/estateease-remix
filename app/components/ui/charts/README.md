# Chart Components Documentation

This directory contains reusable chart components for data visualization using Recharts.

## Components

### 1. NetWorthTrendChart

- **Purpose**: Displays net worth trend over time with assets and liabilities
- **Type**: Line chart
- **Props**:
  - `data`: Array of `{month, netWorth, assets, liabilities}`
  - `height`: Optional chart height (default: 300px)

### 2. AssetAllocationChart

- **Purpose**: Shows portfolio distribution by asset category
- **Type**: Pie chart
- **Props**:
  - `data`: Array of `{name, value, percentage, count}`
  - `height`: Optional chart height (default: 300px)
  - `showLegend`: Show/hide legend (default: true)

### 3. CashFlowChart

- **Purpose**: Monthly cash flow visualization
- **Type**: Bar chart
- **Props**:
  - `data`: Array of `{month, income, expenses, netFlow}`
  - `height`: Optional chart height (default: 300px)

### 4. EstateTaxChart

- **Purpose**: Estate tax projections over time
- **Type**: Area chart
- **Props**:
  - `data`: Array of `{year, netWorth, exemption, taxableEstate, estateTax}`
  - `height`: Optional chart height (default: 300px)

### 5. LiquidityGauge

- **Purpose**: Visual gauge showing liquidity percentage
- **Type**: Semi-circle gauge
- **Props**:
  - `percentage`: Current liquidity percentage
  - `height`: Optional chart height (default: 200px)
  - `targetPercentage`: Target liquidity (default: 20%)

## Usage

```tsx
import { AssetAllocationChart, NetWorthTrendChart } from "~/components/ui/charts";

// In your component
<AssetAllocationChart data={allocationData} height={300} showLegend={true} />;
```

## Color Scheme

All charts use a consistent color palette defined in `chart-colors.ts`:

- Primary: Blue (#2563eb)
- Secondary: Green (#16a34a)
- Tertiary: Red (#dc2626)
- Category-specific colors for different asset types
- Status colors for positive/negative/neutral states

## Responsive Design

All charts are wrapped in `ChartContainer` which ensures:

- 100% width responsiveness
- Consistent height management
- Proper sizing on all screen sizes

## Tooltips

Custom tooltips are implemented for better data display:

- Currency formatting for financial values
- Percentage formatting where applicable
- Consistent styling across all charts
