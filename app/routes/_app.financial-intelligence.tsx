/**
 * Financial Intelligence Route - Advanced Financial Analysis Dashboard
 * Powered by Financial-Analysis-Agent for comprehensive estate planning insights
 */

import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useRevalidator } from "@remix-run/react";
import { useState, useEffect } from "react";

import { getAssets, getTrusts, getFamilyMembers } from "~/lib/dal";
import { FinancialDashboardGenerator } from "~/lib/financial-analysis";
import { ComprehensiveTaxAnalyzer } from "~/lib/tax-calculations";
import { FinancialDashboard } from "~/components/financial/financial-dashboard";

import type { FinancialProfile } from "~/lib/financial-analysis";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const userId = 1; // Default user for now

    // Fetch all necessary data
    const [assets, trusts, familyMembers] = await Promise.all([
      getAssets(userId),
      getTrusts(userId),
      getFamilyMembers(userId),
    ]);

    // Calculate basic financial metrics
    const netWorth = assets.reduce((sum, asset) => sum + (asset?.value || 0), 0);
    const liquidAssets = assets
      .filter(
        (asset) =>
          asset?.category === "FINANCIAL_ACCOUNT" &&
          ["CHECKING", "SAVINGS", "MONEY_MARKET", "INVESTMENT_BROKERAGE"].includes(
            String(asset?.details?.accountType || ""),
          ),
      )
      .reduce((sum, asset) => sum + (asset?.value || 0), 0);

    // Create comprehensive financial profile
    const financialProfile: FinancialProfile = {
      netWorth,
      liquidAssets,
      illiquidAssets: netWorth - liquidAssets,
      annualIncome: 150000, // Default - would come from user input
      monthlyExpenses: 8000, // Default - would come from user input
      riskTolerance: "moderate",
      timeHorizon: 20, // years
      goals: ["Estate tax minimization", "Wealth transfer", "Liquidity planning"],
    };

    // Generate comprehensive financial analysis
    const dashboardData = FinancialDashboardGenerator.generateDashboardData(
      assets as unknown as import("~/types").Asset[],
      trusts as unknown as import("~/types/trusts").Trust[],
      familyMembers as unknown as import("~/types/people").FamilyMember[],
      financialProfile,
    );

    // Generate comprehensive tax analysis
    const taxAnalysis = ComprehensiveTaxAnalyzer.analyzeCompleteTaxSituation(
      assets,
      financialProfile.annualIncome,
      "single",
      "CA",
      0, // No prior gifts
    );

    // Calculate additional insights
    const insights = {
      // Asset diversification analysis
      assetDiversification: calculateAssetDiversification(assets),

      // Risk assessment
      riskAnalysis: assessPortfolioRisk(assets),

      // Income generation potential
      incomeGeneration: analyzeIncomeGeneration(assets),

      // Estate planning readiness
      estatePlanningReadiness: assessEstatePlanningReadiness(assets, trusts, familyMembers),

      // Financial goal tracking
      goalProgress: trackFinancialGoals(financialProfile, netWorth),
    };

    return json({
      assets,
      trusts,
      familyMembers,
      financialProfile,
      dashboardData,
      taxAnalysis,
      insights,
      lastUpdated: new Date().toISOString(),
      error: null,
    });
  } catch (error) {
    console.error("Failed to load financial intelligence data:", error);

    return json({
      assets: [],
      trusts: [],
      familyMembers: [],
      financialProfile: null,
      dashboardData: null,
      taxAnalysis: null,
      insights: null,
      lastUpdated: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Failed to load financial data",
    });
  }
}

// =================================
// ANALYSIS HELPER FUNCTIONS
// =================================

function calculateAssetDiversification(assets: any[]) {
  const categoryTotals: Record<string, number> = {};
  const totalValue = assets.reduce((sum, asset) => {
    const category = asset?.category || "OTHER";
    categoryTotals[category] = (categoryTotals[category] || 0) + (asset?.value || 0);
    return sum + (asset?.value || 0);
  }, 0);

  const diversificationScore = Object.keys(categoryTotals).length;
  const concentrationRisk = Math.max(...Object.values(categoryTotals)) / totalValue;

  return {
    categories: Object.keys(categoryTotals).length,
    diversificationScore: Math.min(100, diversificationScore * 20), // 0-100 scale
    concentrationRisk: concentrationRisk * 100,
    recommendation:
      concentrationRisk > 0.6
        ? "High concentration risk - consider diversification"
        : concentrationRisk > 0.4
          ? "Moderate concentration - monitor diversification"
          : "Well diversified portfolio",
  };
}

function assessPortfolioRisk(assets: any[]) {
  const riskScores: Record<string, number> = {
    FINANCIAL_ACCOUNT: 0.6,
    REAL_ESTATE: 0.4,
    BUSINESS_INTEREST: 0.8,
    INSURANCE_POLICY: 0.1,
    PERSONAL_PROPERTY: 0.3,
    VEHICLE: 0.2,
    DEBT: -0.2,
  };

  const totalValue = assets.reduce((sum, asset) => sum + (asset?.value || 0), 0);
  const weightedRisk = assets.reduce((risk, asset) => {
    const weight = (asset?.value || 0) / totalValue;
    const assetRisk = riskScores[asset?.category] || 0.5;
    return risk + weight * assetRisk;
  }, 0);

  return {
    overallRisk: weightedRisk * 100,
    riskLevel: weightedRisk < 0.3 ? "Conservative" : weightedRisk < 0.6 ? "Moderate" : "Aggressive",
    volatilityEstimate: weightedRisk * 15, // Estimated annual volatility %
    recommendation:
      weightedRisk > 0.7
        ? "Consider reducing high-risk assets"
        : weightedRisk < 0.3
          ? "Consider increasing growth potential"
          : "Risk level appears appropriate",
  };
}

function analyzeIncomeGeneration(assets: any[]) {
  const incomeGeneratingAssets = assets.filter((asset) => {
    const category = asset?.category;
    const accountType = asset?.details?.accountType;
    const propertyType = asset?.details?.propertyType;

    return (
      (category === "FINANCIAL_ACCOUNT" &&
        ["INVESTMENT_BROKERAGE", "DIVIDEND_STOCKS", "BONDS"].includes(accountType)) ||
      (category === "REAL_ESTATE" &&
        ["RENTAL", "COMMERCIAL", "MULTI_FAMILY"].includes(propertyType)) ||
      category === "BUSINESS_INTEREST"
    );
  });

  const totalIncomeAssets = incomeGeneratingAssets.reduce(
    (sum, asset) => sum + (asset?.value || 0),
    0,
  );
  const totalAssets = assets.reduce((sum, asset) => sum + (asset?.value || 0), 0);

  // Estimate annual income (simplified)
  const estimatedAnnualIncome = totalIncomeAssets * 0.04; // 4% assumption
  const incomeRatio = totalAssets > 0 ? (totalIncomeAssets / totalAssets) * 100 : 0;

  return {
    incomeGeneratingValue: totalIncomeAssets,
    incomeRatio,
    estimatedAnnualIncome,
    monthlyIncome: estimatedAnnualIncome / 12,
    assetCount: incomeGeneratingAssets.length,
    recommendation:
      incomeRatio < 30
        ? "Consider increasing income-generating assets"
        : incomeRatio > 70
          ? "Well positioned for income generation"
          : "Balanced approach to income generation",
  };
}

function assessEstatePlanningReadiness(assets: any[], trusts: any[], familyMembers: any[]) {
  let readinessScore = 0;
  const checkpoints = [];

  // Basic will and estate planning documents (20 points)
  if (trusts.length > 0) {
    readinessScore += 20;
    checkpoints.push({ item: "Trust structures in place", status: "complete" });
  } else {
    checkpoints.push({ item: "Trust structures needed", status: "missing" });
  }

  // Beneficiary designations (15 points)
  if (familyMembers.length > 0) {
    readinessScore += 15;
    checkpoints.push({ item: "Family members documented", status: "complete" });
  } else {
    checkpoints.push({ item: "Family member documentation needed", status: "missing" });
  }

  // Asset documentation (20 points)
  if (assets.length >= 5) {
    readinessScore += 20;
    checkpoints.push({ item: "Asset inventory comprehensive", status: "complete" });
  } else {
    checkpoints.push({ item: "Asset inventory incomplete", status: "partial" });
  }

  // Insurance coverage (15 points)
  const insuranceAssets = assets.filter((a) => a?.category === "INSURANCE_POLICY");
  if (insuranceAssets.length > 0) {
    readinessScore += 15;
    checkpoints.push({ item: "Life insurance documented", status: "complete" });
  } else {
    checkpoints.push({ item: "Life insurance evaluation needed", status: "missing" });
  }

  // Business succession planning (15 points)
  const businessAssets = assets.filter((a) => a?.category === "BUSINESS_INTEREST");
  if (businessAssets.length === 0) {
    readinessScore += 15; // No business assets to plan for
    checkpoints.push({ item: "No business succession needed", status: "n/a" });
  } else {
    checkpoints.push({ item: "Business succession planning needed", status: "missing" });
  }

  // Tax planning strategies (15 points)
  const netWorth = assets.reduce((sum, asset) => sum + (asset?.value || 0), 0);
  if (netWorth < 5000000) {
    readinessScore += 15; // Lower complexity for smaller estates
    checkpoints.push({ item: "Tax planning appropriate for estate size", status: "complete" });
  } else {
    checkpoints.push({ item: "Advanced tax planning recommended", status: "partial" });
  }

  return {
    readinessScore,
    readinessLevel:
      readinessScore >= 80
        ? "Excellent"
        : readinessScore >= 60
          ? "Good"
          : readinessScore >= 40
            ? "Fair"
            : "Needs Work",
    checkpoints,
    nextSteps: checkpoints
      .filter((cp) => cp.status === "missing" || cp.status === "partial")
      .slice(0, 3)
      .map((cp) => cp.item),
  };
}

function trackFinancialGoals(profile: FinancialProfile, currentNetWorth: number) {
  const goals = [
    {
      name: "Estate Tax Minimization",
      target: "Reduce tax liability by 30%",
      progress: 65,
      status: "on-track",
    },
    {
      name: "Wealth Transfer Planning",
      target: "Structure for next generation",
      progress: 40,
      status: "needs-attention",
    },
    {
      name: "Liquidity Planning",
      target: "20% liquid assets",
      progress: (profile.liquidAssets / profile.netWorth) * 100,
      status: profile.liquidAssets / profile.netWorth >= 0.2 ? "complete" : "in-progress",
    },
  ];

  return {
    goals,
    overallProgress: goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length,
    completedGoals: goals.filter((g) => g.status === "complete").length,
    totalGoals: goals.length,
  };
}

// =================================
// MAIN COMPONENT
// =================================

export default function FinancialIntelligence() {
  const data = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(
      () => {
        revalidator.revalidate();
        setLastRefresh(new Date());
      },
      5 * 60 * 1000,
    );

    return () => clearInterval(interval);
  }, [revalidator]);

  if (data.error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
            Financial Intelligence Dashboard
          </h1>
          <div className="max-w-md rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-700 dark:bg-red-900/20">
            <p className="text-red-800 dark:text-red-200">{data.error}</p>
            <button
              onClick={() => revalidator.revalidate()}
              className="mt-4 rounded bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
            >
              Retry Loading
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data.dashboardData || !data.financialProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading financial intelligence...</p>
        </div>
      </div>
    );
  }

  return (
    <FinancialDashboard
      assets={data.assets as unknown as import("~/types").Asset[]}
      trusts={data.trusts as unknown as import("~/types/trusts").Trust[]}
      familyMembers={data.familyMembers as unknown as import("~/types/people").FamilyMember[]}
      dashboardData={data.dashboardData as unknown as Parameters<typeof FinancialDashboard>[0]["dashboardData"]}
    />
  );
}
