import { getDatabase } from "~/lib/database";

const db = getDatabase();

export interface AssetPerformanceMetrics {
  totalValue: number;
  monthlyChange: number;
  yearlyChange: number;
  riskScore: number;
  diversificationScore: number;
  liquidityRatio: number;
}

export interface AssetCategory {
  name: string;
  value: number;
  percentage: number;
  change: number;
  color: string;
  count: number;
}

export interface ConcentrationRisk {
  type: "ownership" | "category" | "institution" | "geographic";
  description: string;
  percentage: number;
  severity: "low" | "medium" | "high" | "critical";
  recommendation: string;
}

export interface PortfolioAllocation {
  category: string;
  current: number;
  target: number;
  variance: number;
}

export interface AssetTrendData {
  date: string;
  value: number;
  category: string;
}

/**
 * Calculate comprehensive asset performance metrics
 */
export async function calculateAssetMetrics(userId: number): Promise<AssetPerformanceMetrics> {
  // Get current portfolio value
  const totalValueResult = (await db
    .prepare(
      `
    SELECT SUM(value) as total_value 
    FROM assets 
    WHERE user_id = ? AND is_active = 1
  `,
    )
    .get(userId)) as { total_value: number };

  const totalValue = totalValueResult.total_value || 0;

  // Calculate risk score based on concentration and diversification
  const riskScore = await calculateRiskScore(userId);

  // Calculate diversification score
  const diversificationScore = await calculateDiversificationScore(userId);

  // Calculate liquidity ratio
  const liquidityRatio = await calculateLiquidityRatio(userId);

  // TODO: Implement historical data tracking for performance changes
  // For now, using placeholder values
  const monthlyChange = 2.5; // Placeholder
  const yearlyChange = 8.3; // Placeholder

  return {
    totalValue,
    monthlyChange,
    yearlyChange,
    riskScore,
    diversificationScore,
    liquidityRatio,
  };
}

/**
 * Get asset category breakdown with performance data
 */
export async function getAssetCategories(userId: number): Promise<AssetCategory[]> {
  const categories = (await db
    .prepare(
      `
    SELECT 
      category,
      COUNT(*) as count,
      SUM(value) as total_value
    FROM assets 
    WHERE user_id = ? AND is_active = 1
    GROUP BY category
    ORDER BY total_value DESC
  `,
    )
    .all(userId)) as { category: string; count: number; total_value: number }[];

  const totalPortfolioValue = categories.reduce((sum, cat) => sum + cat.total_value, 0);

  const categoryColors = {
    FINANCIAL_ACCOUNT: "#3B82F6",
    REAL_ESTATE: "#10B981",
    BUSINESS_INTEREST: "#F59E0B",
    PERSONAL_PROPERTY: "#8B5CF6",
    INSURANCE_POLICY: "#EF4444",
    VEHICLE: "#06B6D4",
    DEBT: "#6B7280",
    DIGITAL_ASSET: "#F97316",
    OTHER: "#84CC16",
  };

  return categories.map((category) => ({
    name: formatCategoryName(category.category),
    value: category.total_value,
    percentage: (category.total_value / totalPortfolioValue) * 100,
    change: Math.random() * 10 - 5, // Placeholder for actual performance tracking
    color: categoryColors[category.category as keyof typeof categoryColors] || "#6B7280",
    count: category.count,
  }));
}

/**
 * Identify concentration risks in the portfolio
 */
export async function identifyConcentrationRisks(userId: number): Promise<ConcentrationRisk[]> {
  const risks: ConcentrationRisk[] = [];

  // Check ownership concentration
  const ownershipConcentration = (await db
    .prepare(
      `
    SELECT 
      ownership_type,
      SUM(value) as total_value,
      COUNT(*) as count
    FROM assets 
    WHERE user_id = ? AND is_active = 1
    GROUP BY ownership_type
    ORDER BY total_value DESC
  `,
    )
    .all(userId)) as { ownership_type: string; total_value: number; count: number }[];

  const totalValue = ownershipConcentration.reduce((sum, item) => sum + item.total_value, 0);

  for (const ownership of ownershipConcentration) {
    const percentage = (ownership.total_value / totalValue) * 100;

    if (percentage > 80) {
      risks.push({
        type: "ownership",
        description: `${percentage.toFixed(1)}% of assets in ${ownership.ownership_type.toLowerCase()} ownership`,
        percentage,
        severity: "critical",
        recommendation:
          "Consider diversifying ownership structure through trusts or joint ownership",
      });
    } else if (percentage > 60) {
      risks.push({
        type: "ownership",
        description: `${percentage.toFixed(1)}% of assets in ${ownership.ownership_type.toLowerCase()} ownership`,
        percentage,
        severity: "high",
        recommendation:
          "Review ownership structure for tax efficiency and estate planning benefits",
      });
    }
  }

  // Check category concentration
  const categoryConcentration = (await db
    .prepare(
      `
    SELECT 
      category,
      SUM(value) as total_value
    FROM assets 
    WHERE user_id = ? AND is_active = 1
    GROUP BY category
    ORDER BY total_value DESC
    LIMIT 1
  `,
    )
    .get(userId)) as { category: string; total_value: number };

  if (categoryConcentration) {
    const percentage = (categoryConcentration.total_value / totalValue) * 100;

    if (percentage > 70) {
      risks.push({
        type: "category",
        description: `${percentage.toFixed(1)}% of portfolio in ${formatCategoryName(categoryConcentration.category)}`,
        percentage,
        severity: percentage > 80 ? "critical" : "high",
        recommendation: "Diversify across asset categories to reduce concentration risk",
      });
    } else if (percentage > 50) {
      risks.push({
        type: "category",
        description: `${percentage.toFixed(1)}% of portfolio in ${formatCategoryName(categoryConcentration.category)}`,
        percentage,
        severity: "medium",
        recommendation: "Consider rebalancing to improve diversification",
      });
    }
  }

  // Check institution concentration
  const institutionConcentration = (await db
    .prepare(
      `
    SELECT 
      institution_name,
      SUM(value) as total_value,
      COUNT(*) as count
    FROM assets 
    WHERE user_id = ? AND is_active = 1 AND institution_name IS NOT NULL
    GROUP BY institution_name
    HAVING SUM(value) > 250000
    ORDER BY total_value DESC
  `,
    )
    .all(userId)) as { institution_name: string; total_value: number; count: number }[];

  for (const institution of institutionConcentration) {
    const percentage = (institution.total_value / totalValue) * 100;

    if (institution.total_value > 250000) {
      // FDIC insurance limit
      risks.push({
        type: "institution",
        description: `$${(institution.total_value / 1000).toFixed(0)}K at ${institution.institution_name} exceeds FDIC limits`,
        percentage,
        severity: institution.total_value > 500000 ? "high" : "medium",
        recommendation: "Distribute funds across multiple institutions to maximize FDIC protection",
      });
    }
  }

  return risks;
}

/**
 * Calculate portfolio risk score (0-100, higher is better/lower risk)
 */
async function calculateRiskScore(userId: number): Promise<number> {
  let score = 100;

  // Penalize ownership concentration
  const ownershipConcentration = (await db
    .prepare(
      `
    SELECT 
      ownership_type,
      SUM(value) as total_value
    FROM assets 
    WHERE user_id = ? AND is_active = 1
    GROUP BY ownership_type
    ORDER BY total_value DESC
    LIMIT 1
  `,
    )
    .get(userId)) as { ownership_type: string; total_value: number };

  const totalValue = (await db
    .prepare(
      `
    SELECT SUM(value) as total 
    FROM assets 
    WHERE user_id = ? AND is_active = 1
  `,
    )
    .get(userId)) as { total: number };

  if (ownershipConcentration && totalValue) {
    const concentrationPct = (ownershipConcentration.total_value / totalValue.total) * 100;
    if (concentrationPct > 80) score -= 40;
    else if (concentrationPct > 60) score -= 25;
    else if (concentrationPct > 40) score -= 10;
  }

  // Penalize category concentration
  const categoryConcentration = (await db
    .prepare(
      `
    SELECT 
      category,
      SUM(value) as total_value
    FROM assets 
    WHERE user_id = ? AND is_active = 1
    GROUP BY category
    ORDER BY total_value DESC
    LIMIT 1
  `,
    )
    .get(userId)) as { category: string; total_value: number };

  if (categoryConcentration && totalValue) {
    const concentrationPct = (categoryConcentration.total_value / totalValue.total) * 100;
    if (concentrationPct > 70) score -= 30;
    else if (concentrationPct > 50) score -= 15;
    else if (concentrationPct > 30) score -= 5;
  }

  return Math.max(0, score);
}

/**
 * Calculate diversification score (0-100, higher is better)
 */
async function calculateDiversificationScore(userId: number): Promise<number> {
  const categories = (await db
    .prepare(
      `
    SELECT category, COUNT(*) as count
    FROM assets 
    WHERE user_id = ? AND is_active = 1 AND value > 0
    GROUP BY category
  `,
    )
    .all(userId)) as { category: string; count: number }[];

  // Base score based on number of asset categories
  let score = Math.min(categories.length * 15, 75); // Max 75 for category diversity

  // Bonus for balanced allocation
  const categoryValues = (await db
    .prepare(
      `
    SELECT 
      category,
      SUM(value) as total_value
    FROM assets 
    WHERE user_id = ? AND is_active = 1
    GROUP BY category
  `,
    )
    .all(userId)) as { category: string; total_value: number }[];

  const totalValue = categoryValues.reduce((sum, cat) => sum + cat.total_value, 0);
  const percentages = categoryValues.map((cat) => (cat.total_value / totalValue) * 100);

  // Calculate Herfindahl-Hirschman Index for concentration
  const hhi = percentages.reduce((sum, pct) => sum + pct * pct, 0);
  const normalizedHHI = (10000 - hhi) / 10000; // Normalize to 0-1, higher is better

  score += normalizedHHI * 25; // Add up to 25 points for balanced allocation

  return Math.min(100, Math.max(0, score));
}

/**
 * Calculate liquidity ratio (liquid assets / total assets)
 */
async function calculateLiquidityRatio(userId: number): Promise<number> {
  const liquidAssets = (await db
    .prepare(
      `
    SELECT SUM(value) as liquid_value
    FROM assets 
    WHERE user_id = ? AND is_active = 1 
    AND (
      (category = 'FINANCIAL_ACCOUNT' AND account_type IN ('CHECKING', 'SAVINGS', 'MONEY_MARKET')) OR
      (category = 'FINANCIAL_ACCOUNT' AND account_type = 'INVESTMENT_BROKERAGE')
    )
  `,
    )
    .get(userId)) as { liquid_value: number };

  const totalAssets = (await db
    .prepare(
      `
    SELECT SUM(value) as total_value
    FROM assets 
    WHERE user_id = ? AND is_active = 1
  `,
    )
    .get(userId)) as { total_value: number };

  if (!totalAssets.total_value || totalAssets.total_value === 0) return 0;

  return (liquidAssets.liquid_value || 0) / totalAssets.total_value;
}

/**
 * Get portfolio allocation targets and variances
 */
export async function getPortfolioAllocation(userId: number): Promise<PortfolioAllocation[]> {
  const categories = await getAssetCategories(userId);

  // Define target allocations (these could be customizable per user)
  const targets = {
    "Financial Accounts": 50,
    "Real Estate": 25,
    "Business Interests": 15,
    "Personal Property": 5,
    "Insurance Policies": 3,
    Vehicles: 2,
  };

  return categories.map((category) => ({
    category: category.name,
    current: category.percentage,
    target: targets[category.name as keyof typeof targets] || 0,
    variance: category.percentage - (targets[category.name as keyof typeof targets] || 0),
  }));
}

/**
 * Generate rebalancing recommendations
 */
export async function generateRebalancingRecommendations(userId: number): Promise<{
  recommendations: Array<{
    action: "buy" | "sell" | "transfer";
    category: string;
    amount: number;
    reason: string;
    priority: "high" | "medium" | "low";
  }>;
  targetAllocation: PortfolioAllocation[];
}> {
  const currentAllocation = await getPortfolioAllocation(userId);
  const recommendations: Array<{
    action: "buy" | "sell" | "transfer";
    category: string;
    amount: number;
    reason: string;
    priority: "high" | "medium" | "low";
  }> = [];

  const totalValue = currentAllocation.reduce(
    (sum, item) => sum + (item.current / 100) * 1000000,
    0,
  ); // Assuming 1M portfolio for calculation

  for (const allocation of currentAllocation) {
    const variance = Math.abs(allocation.variance);
    const amount = (variance / 100) * totalValue;

    if (variance > 10) {
      recommendations.push({
        action: allocation.variance > 0 ? "sell" : "buy",
        category: allocation.category,
        amount,
        reason:
          allocation.variance > 0
            ? `${allocation.category} is ${variance.toFixed(1)}% over target allocation`
            : `${allocation.category} is ${variance.toFixed(1)}% under target allocation`,
        priority: variance > 20 ? "high" : variance > 15 ? "medium" : "low",
      });
    }
  }

  return {
    recommendations,
    targetAllocation: currentAllocation,
  };
}

/**
 * Helper function to format category names for display
 */
function formatCategoryName(category: string): string {
  const names = {
    FINANCIAL_ACCOUNT: "Financial Accounts",
    REAL_ESTATE: "Real Estate",
    BUSINESS_INTEREST: "Business Interests",
    PERSONAL_PROPERTY: "Personal Property",
    INSURANCE_POLICY: "Insurance Policies",
    VEHICLE: "Vehicles",
    DEBT: "Debts & Liabilities",
    DIGITAL_ASSET: "Digital Assets",
    OTHER: "Other Assets",
  };

  return names[category as keyof typeof names] || category;
}

/**
 * Export portfolio data for external analysis
 */
export async function exportPortfolioData(userId: number): Promise<{
  assets: any[];
  metrics: AssetPerformanceMetrics;
  categories: AssetCategory[];
  risks: ConcentrationRisk[];
  allocation: PortfolioAllocation[];
  exportDate: string;
}> {
  const assets = await db
    .prepare(
      `
    SELECT * FROM assets 
    WHERE user_id = ? AND is_active = 1
    ORDER BY value DESC
  `,
    )
    .all(userId);

  const metrics = await calculateAssetMetrics(userId);
  const categories = await getAssetCategories(userId);
  const risks = await identifyConcentrationRisks(userId);
  const allocation = await getPortfolioAllocation(userId);

  return {
    assets,
    metrics,
    categories,
    risks,
    allocation,
    exportDate: new Date().toISOString(),
  };
}
