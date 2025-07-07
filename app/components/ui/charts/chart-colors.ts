/**
 * Theme-aware chart colors using design system tokens
 * Provides consistent color scheme for all charts with dark mode support
 */
export const chartColors = {
  primary: [
    'rgb(59, 130, 246)', // primary-500
    'rgb(96, 165, 250)', // primary-400
    'rgb(37, 99, 235)',  // primary-600
    'rgb(147, 197, 253)', // primary-300
    'rgb(29, 78, 216)',  // primary-700
  ],
  semantic: {
    success: 'rgb(34, 197, 94)',  // success-500
    warning: 'rgb(245, 158, 11)', // warning-500
    error: 'rgb(239, 68, 68)',    // error-500
    info: 'rgb(59, 130, 246)',    // primary-500
  },
  categories: {
    REAL_ESTATE: 'rgb(59, 130, 246)',      // primary-500
    FINANCIAL_ACCOUNT: 'rgb(34, 197, 94)', // success-500
    BUSINESS_INTEREST: 'rgb(245, 158, 11)', // warning-500
    INSURANCE_POLICY: 'rgb(239, 68, 68)',  // error-500
    PERSONAL_PROPERTY: 'rgb(139, 92, 246)', // secondary-500
  },
  ownership: {
    TRUST: 'rgb(34, 197, 94)',      // success-500
    JOINT: 'rgb(59, 130, 246)',     // primary-500
    INDIVIDUAL: 'rgb(245, 158, 11)', // warning-500
    BUSINESS: 'rgb(139, 92, 246)',   // secondary-500
  }
} as const;

/**
 * Get theme-aware chart configuration
 * @param theme - 'light' or 'dark'
 * @returns Chart theme configuration
 */
export function getChartTheme(theme: 'light' | 'dark') {
  return {
    backgroundColor: theme === 'dark' ? 'rgb(15, 23, 42)' : 'rgb(248, 250, 252)', // secondary-950 : secondary-50
    textColor: theme === 'dark' ? 'rgb(226, 232, 240)' : 'rgb(15, 23, 42)',       // secondary-200 : secondary-950
    gridColor: theme === 'dark' ? 'rgb(51, 65, 85)' : 'rgb(203, 213, 225)',       // secondary-700 : secondary-300
    axisColor: theme === 'dark' ? 'rgb(100, 116, 139)' : 'rgb(100, 116, 139)',    // secondary-500
    tooltipBg: theme === 'dark' ? 'rgb(30, 41, 59)' : 'rgb(255, 255, 255)',       // secondary-800 : white
    tooltipBorder: theme === 'dark' ? 'rgb(51, 65, 85)' : 'rgb(203, 213, 225)',   // secondary-700 : secondary-300
  };
}

// Legacy export for backward compatibility (deprecated)
export const CHART_COLORS = {
  primary: chartColors.primary[0],
  secondary: chartColors.semantic.success,
  tertiary: chartColors.semantic.error,
  quaternary: chartColors.primary[4],
  quinary: chartColors.semantic.warning,
  
  realEstate: chartColors.categories.REAL_ESTATE,
  financial: chartColors.categories.FINANCIAL_ACCOUNT,
  insurance: chartColors.categories.INSURANCE_POLICY,
  business: chartColors.categories.BUSINESS_INTEREST,
  personal: chartColors.categories.PERSONAL_PROPERTY,
  
  trust: chartColors.ownership.TRUST,
  joint: chartColors.ownership.JOINT,
  individual: chartColors.ownership.INDIVIDUAL,
  businessEntity: chartColors.ownership.BUSINESS,
  
  positive: chartColors.semantic.success,
  negative: chartColors.semantic.error,
  neutral: 'rgb(100, 116, 139)', // secondary-500
  warning: chartColors.semantic.warning,
  
  grid: 'rgb(203, 213, 225)', // secondary-300
  axis: 'rgb(100, 116, 139)', // secondary-500
  text: 'rgb(15, 23, 42)',    // secondary-950
} as const;

// Export color arrays for charts that need multiple colors
export const CATEGORY_COLORS = [
  chartColors.categories.REAL_ESTATE,
  chartColors.categories.FINANCIAL_ACCOUNT,
  chartColors.categories.INSURANCE_POLICY,
  chartColors.categories.BUSINESS_INTEREST,
  chartColors.categories.PERSONAL_PROPERTY,
];

export const OWNERSHIP_COLORS = [
  chartColors.ownership.TRUST,
  chartColors.ownership.JOINT,
  chartColors.ownership.INDIVIDUAL,
  chartColors.ownership.BUSINESS,
];

/**
 * Get category-specific color
 * @param category - Asset category
 * @returns Color for the category
 */
export function getCategoryColor(category: keyof typeof chartColors.categories): string {
  return chartColors.categories[category] || chartColors.primary[0];
}

/**
 * Get ownership-specific color
 * @param ownership - Ownership type
 * @returns Color for the ownership type
 */
export function getOwnershipColor(ownership: keyof typeof chartColors.ownership): string {
  return chartColors.ownership[ownership] || chartColors.primary[0];
}