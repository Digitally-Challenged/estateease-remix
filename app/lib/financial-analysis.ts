/**
 * Advanced Financial Analysis Engine for EstateEase
 * Financial-Analysis-Agent - Comprehensive financial modeling and tax optimization
 */

import {
  FEDERAL_ESTATE_TAX_EXEMPTION,
  FEDERAL_ESTATE_TAX_RATE,
  GIFT_TAX_ANNUAL_EXCLUSION,
  GST_TAX,
  STATE_TAX_INFO,
  FINANCIAL_PLANNING_DEFAULTS,
} from "~/data/financial-constants";

import type { Asset, Trust, FamilyMember } from "~/types";

// =================================
// CORE FINANCIAL ANALYSIS TYPES
// =================================

export interface FinancialProfile {
  netWorth: number;
  liquidAssets: number;
  illiquidAssets: number;
  annualIncome: number;
  monthlyExpenses: number;
  riskTolerance: "conservative" | "moderate" | "aggressive";
  timeHorizon: number; // years
  goals: string[];
}

export interface TaxAnalysis {
  federalEstateTax: number;
  stateEstateTax: number;
  generationSkippingTax: number;
  totalTaxLiability: number;
  effectiveRate: number;
  recommendedStrategies: TaxStrategy[];
}

export interface TaxStrategy {
  id: string;
  name: string;
  description: string;
  potentialSavings: number;
  implementationCost: number;
  timeframe: string;
  riskLevel: "low" | "medium" | "high";
  priority: "critical" | "high" | "medium" | "low";
  legalRequirements: string[];
}

export interface CashFlowProjection {
  year: number;
  income: number;
  expenses: number;
  netCashFlow: number;
  cumulativeCashFlow: number;
  assetValue: number;
  liquidityRatio: number;
}

export interface SuccessionPlan {
  totalWealth: number;
  generation1Transfer: number;
  generation2Transfer: number;
  charitableGiving: number;
  taxOptimizedTransfer: number;
  liquidityNeeds: number;
  timingRecommendations: string[];
}

// =================================
// ADVANCED ESTATE TAX CALCULATIONS
// =================================

export class EstateTaxCalculator {
  /**
   * Calculate comprehensive estate tax analysis for multi-generational planning
   */
  static calculateAdvancedEstateTax(
    assets: Asset[],
    maritalStatus: "single" | "married",
    spouseNetWorth: number = 0,
    domicileState: string = "CA",
    projectionYears: number = 20,
  ): TaxAnalysis {
    const netWorth = assets.reduce((sum, asset) => sum + asset.value, 0);
    const totalCombinedWealth = netWorth + spouseNetWorth;

    // Federal Estate Tax Calculation
    const federalExemption =
      maritalStatus === "married"
        ? FEDERAL_ESTATE_TAX_EXEMPTION.MARRIED
        : FEDERAL_ESTATE_TAX_EXEMPTION.INDIVIDUAL;

    const taxableEstate = Math.max(0, totalCombinedWealth - federalExemption);
    const federalEstateTax = taxableEstate * FEDERAL_ESTATE_TAX_RATE;

    // State Estate Tax Calculation
    const stateInfo = STATE_TAX_INFO.ESTATE_TAX_STATES.find((s) =>
      s.state.toLowerCase().includes(domicileState.toLowerCase()),
    );

    let stateEstateTax = 0;
    if (stateInfo) {
      const stateTaxableEstate = Math.max(0, totalCombinedWealth - stateInfo.exemption);
      stateEstateTax = stateTaxableEstate * stateInfo.maxRate;
    }

    // Generation-Skipping Transfer Tax
    const gstTaxableAmount = Math.max(0, netWorth - GST_TAX.EXEMPTION);
    const generationSkippingTax = gstTaxableAmount * GST_TAX.RATE;

    const totalTaxLiability = federalEstateTax + stateEstateTax + generationSkippingTax;
    const effectiveRate =
      totalCombinedWealth > 0 ? (totalTaxLiability / totalCombinedWealth) * 100 : 0;

    // Generate recommended strategies
    const recommendedStrategies = this.generateTaxStrategies(
      totalCombinedWealth,
      taxableEstate,
      totalTaxLiability,
      assets,
    );

    return {
      federalEstateTax,
      stateEstateTax,
      generationSkippingTax,
      totalTaxLiability,
      effectiveRate,
      recommendedStrategies,
    };
  }

  /**
   * Generate AI-powered tax optimization strategies
   */
  private static generateTaxStrategies(
    netWorth: number,
    taxableEstate: number,
    currentTaxLiability: number,
    assets: Asset[],
  ): TaxStrategy[] {
    const strategies: TaxStrategy[] = [];

    // Annual Gift Exclusion Strategy
    if (taxableEstate > 0) {
      const annualGiftPotential = GIFT_TAX_ANNUAL_EXCLUSION.AMOUNT * 5 * 10; // 5 recipients, 10 years
      const giftSavings = Math.min(annualGiftPotential, taxableEstate) * FEDERAL_ESTATE_TAX_RATE;

      strategies.push({
        id: "annual-gifting",
        name: "Strategic Annual Gifting Program",
        description: `Implement systematic gifting of ${GIFT_TAX_ANNUAL_EXCLUSION.AMOUNT.toLocaleString()} per recipient annually`,
        potentialSavings: giftSavings,
        implementationCost: 5000,
        timeframe: "10+ years",
        riskLevel: "low",
        priority: "high",
        legalRequirements: ["Gift tax returns for gifts exceeding annual exclusion"],
      });
    }

    // Charitable Remainder Trust Strategy
    if (netWorth > 5000000) {
      const charitableTrustAmount = netWorth * 0.15;
      const taxSavings = charitableTrustAmount * FEDERAL_ESTATE_TAX_RATE;

      strategies.push({
        id: "charitable-remainder-trust",
        name: "Charitable Remainder Trust",
        description:
          "Transfer appreciated assets to CRT for income stream and estate tax deduction",
        potentialSavings: taxSavings,
        implementationCost: 25000,
        timeframe: "1-2 years",
        riskLevel: "medium",
        priority: "high",
        legalRequirements: ["IRS qualification", "Trust documentation", "Appraisals"],
      });
    }

    // Grantor Retained Annuity Trust (GRAT)
    const appreciatingAssets = assets.filter(
      (a) => a.category === "FINANCIAL_ACCOUNT" || a.category === "BUSINESS_INTEREST",
    );

    if (appreciatingAssets.length > 0 && netWorth > 3000000) {
      const gratAmount = appreciatingAssets.reduce((sum, asset) => sum + asset.value, 0) * 0.3;
      const potentialSavings = gratAmount * 0.25 * FEDERAL_ESTATE_TAX_RATE; // Assuming 25% discount

      strategies.push({
        id: "grat-strategy",
        name: "Grantor Retained Annuity Trust (GRAT)",
        description: "Transfer appreciating assets with minimal gift tax impact",
        potentialSavings: potentialSavings,
        implementationCost: 35000,
        timeframe: "2-3 years",
        riskLevel: "medium",
        priority: "medium",
        legalRequirements: ["Annual annuity payments", "Valuation requirements"],
      });
    }

    // Life Insurance Strategy
    const lifeInsuranceAssets = assets.filter((a) => a.category === "INSURANCE_POLICY");
    if (lifeInsuranceAssets.length === 0 && currentTaxLiability > 1000000) {
      strategies.push({
        id: "life-insurance-trust",
        name: "Irrevocable Life Insurance Trust (ILIT)",
        description: "Purchase life insurance in trust to provide liquidity for estate taxes",
        potentialSavings: currentTaxLiability * 0.8,
        implementationCost: 15000,
        timeframe: "6 months",
        riskLevel: "low",
        priority: "critical",
        legalRequirements: ["Three-year lookback period", "Crummey notices"],
      });
    }

    return strategies.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }
}

// =================================
// CASH FLOW MODELING
// =================================

export class CashFlowModeler {
  /**
   * Generate comprehensive cash flow projections with scenario analysis
   */
  static projectCashFlow(
    assets: Asset[],
    profile: FinancialProfile,
    projectionYears: number = 30,
  ): CashFlowProjection[] {
    const projections: CashFlowProjection[] = [];
    let cumulativeCashFlow = 0;
    let currentAssetValue = profile.netWorth;

    for (let year = 1; year <= projectionYears; year++) {
      // Project income growth (inflation + real growth)
      const incomeGrowthRate = FINANCIAL_PLANNING_DEFAULTS.INFLATION_RATE + 0.02;
      const projectedIncome = profile.annualIncome * Math.pow(1 + incomeGrowthRate, year);

      // Project expense growth (inflation)
      const projectedExpenses =
        profile.monthlyExpenses *
        12 *
        Math.pow(1 + FINANCIAL_PLANNING_DEFAULTS.INFLATION_RATE, year);

      // Investment returns on assets
      const investmentReturn = currentAssetValue * FINANCIAL_PLANNING_DEFAULTS.INVESTMENT_RETURN;

      const totalIncome = projectedIncome + investmentReturn;
      const netCashFlow = totalIncome - projectedExpenses;

      cumulativeCashFlow += netCashFlow;
      currentAssetValue += netCashFlow;

      // Calculate liquidity ratio
      const liquidAssets = this.calculateLiquidAssets(assets, year);
      const liquidityRatio = currentAssetValue > 0 ? (liquidAssets / currentAssetValue) * 100 : 0;

      projections.push({
        year,
        income: totalIncome,
        expenses: projectedExpenses,
        netCashFlow,
        cumulativeCashFlow,
        assetValue: currentAssetValue,
        liquidityRatio,
      });
    }

    return projections;
  }

  private static calculateLiquidAssets(assets: Asset[], year: number): number {
    // Simplified calculation - in reality would need more sophisticated modeling
    return (
      assets
        .filter((a) => a.category === "FINANCIAL_ACCOUNT")
        .reduce((sum, asset) => sum + asset.value, 0) *
      Math.pow(1 + FINANCIAL_PLANNING_DEFAULTS.INVESTMENT_RETURN, year)
    );
  }
}

// =================================
// INVESTMENT PERFORMANCE ANALYSIS
// =================================

export class InvestmentAnalyzer {
  /**
   * Analyze investment performance and risk-adjusted returns
   */
  static analyzePortfolioPerformance(assets: Asset[]): {
    totalValue: number;
    assetAllocation: Record<string, number>;
    riskScore: number;
    recommendedRebalancing: string[];
    expectedReturn: number;
    volatility: number;
  } {
    const investmentAssets = assets.filter(
      (a) => a.category === "FINANCIAL_ACCOUNT" || a.category === "BUSINESS_INTEREST",
    );

    const totalValue = investmentAssets.reduce((sum, asset) => sum + asset.value, 0);

    // Calculate asset allocation
    const assetAllocation: Record<string, number> = {};
    investmentAssets.forEach((asset) => {
      const category = asset.category;
      assetAllocation[category] = (assetAllocation[category] || 0) + asset.value;
    });

    // Normalize to percentages
    Object.keys(assetAllocation).forEach((key) => {
      assetAllocation[key] = (assetAllocation[key] / totalValue) * 100;
    });

    // Calculate risk score (simplified)
    const stockPercentage = assetAllocation["FINANCIAL_ACCOUNT"] || 0;
    const businessPercentage = assetAllocation["BUSINESS_INTEREST"] || 0;
    const riskScore = (stockPercentage * 0.8 + businessPercentage * 1.2) / 100;

    // Generate rebalancing recommendations
    const recommendedRebalancing: string[] = [];
    if (stockPercentage > 80) {
      recommendedRebalancing.push("Consider reducing equity allocation for better diversification");
    }
    if (businessPercentage > 30) {
      recommendedRebalancing.push(
        "High concentration in business interests - consider diversification",
      );
    }

    return {
      totalValue,
      assetAllocation,
      riskScore,
      recommendedRebalancing,
      expectedReturn: 7.2, // Simplified - would use actual portfolio analysis
      volatility: 12.5,
    };
  }
}

// =================================
// SUCCESSION PLANNING OPTIMIZER
// =================================

export class SuccessionPlanOptimizer {
  /**
   * Generate optimal wealth transfer strategies across generations
   */
  static optimizeMultiGenerationalTransfer(
    assets: Asset[],
    familyMembers: FamilyMember[],
    charitableIntent: number = 0,
  ): SuccessionPlan {
    const totalWealth = assets.reduce((sum, asset) => sum + asset.value, 0);

    // Calculate optimal transfer amounts
    const exemptionAmount = FEDERAL_ESTATE_TAX_EXEMPTION.INDIVIDUAL;
    const generation1Transfer = Math.min(totalWealth * 0.6, exemptionAmount);
    const generation2Transfer = Math.min(totalWealth * 0.3, GST_TAX.EXEMPTION);
    const charitableGiving = Math.min(totalWealth * (charitableIntent / 100), totalWealth * 0.25);

    // Calculate tax-optimized transfer
    const remainingWealth =
      totalWealth - generation1Transfer - generation2Transfer - charitableGiving;
    const taxOptimizedTransfer = remainingWealth * (1 - FEDERAL_ESTATE_TAX_RATE);

    // Estimate liquidity needs
    const estimatedTaxLiability =
      Math.max(0, totalWealth - exemptionAmount) * FEDERAL_ESTATE_TAX_RATE;
    const liquidityNeeds = estimatedTaxLiability + totalWealth * 0.05; // 5% for expenses

    // Generate timing recommendations
    const timingRecommendations = [
      "Begin annual gifting program immediately to maximize exclusions",
      "Establish trusts before significant asset appreciation",
      "Consider timing of asset transfers based on valuation discounts",
      "Coordinate with tax year-end planning for optimal timing",
    ];

    return {
      totalWealth,
      generation1Transfer,
      generation2Transfer,
      charitableGiving,
      taxOptimizedTransfer,
      liquidityNeeds,
      timingRecommendations,
    };
  }
}

// =================================
// FINANCIAL GOAL PLANNING
// =================================

export class FinancialGoalPlanner {
  /**
   * Calculate required savings and investment strategy for specific goals
   */
  static calculateGoalFunding(
    goal: {
      name: string;
      targetAmount: number;
      timeHorizon: number; // years
      priority: "high" | "medium" | "low";
    },
    currentSavings: number,
    monthlyContribution: number,
  ): {
    requiredMonthlyContribution: number;
    probabilityOfSuccess: number;
    recommendedStrategy: string;
    milestones: Array<{ year: number; targetBalance: number; onTrack: boolean }>;
  } {
    const annualReturn = FINANCIAL_PLANNING_DEFAULTS.INVESTMENT_RETURN;
    const monthlyReturn = annualReturn / 12;
    const totalMonths = goal.timeHorizon * 12;

    // Calculate future value of current savings
    const futureValueOfSavings = currentSavings * Math.pow(1 + annualReturn, goal.timeHorizon);

    // Calculate required additional savings
    const requiredAdditionalSavings = goal.targetAmount - futureValueOfSavings;

    // Calculate required monthly contribution using PMT formula
    const requiredMonthlyContribution =
      requiredAdditionalSavings > 0
        ? (requiredAdditionalSavings * monthlyReturn) /
          (Math.pow(1 + monthlyReturn, totalMonths) - 1)
        : 0;

    // Calculate probability of success (simplified model)
    const contributionRatio = monthlyContribution / Math.max(requiredMonthlyContribution, 1);
    const probabilityOfSuccess = Math.min(95, contributionRatio * 85);

    // Generate strategy recommendation
    let recommendedStrategy = "Maintain current contribution levels";
    if (contributionRatio < 0.8) {
      recommendedStrategy = "Increase monthly contributions or extend timeline";
    } else if (contributionRatio > 1.2) {
      recommendedStrategy = "Consider more conservative investment approach";
    }

    // Generate milestones
    const milestones = [];
    for (let year = 1; year <= goal.timeHorizon; year++) {
      const targetBalance =
        currentSavings * Math.pow(1 + annualReturn, year) +
        monthlyContribution * 12 * ((Math.pow(1 + annualReturn, year) - 1) / annualReturn);
      const requiredBalance = goal.targetAmount * (year / goal.timeHorizon);

      milestones.push({
        year,
        targetBalance,
        onTrack: targetBalance >= requiredBalance * 0.9,
      });
    }

    return {
      requiredMonthlyContribution,
      probabilityOfSuccess,
      recommendedStrategy,
      milestones,
    };
  }
}

// =================================
// COMPREHENSIVE FINANCIAL DASHBOARD DATA
// =================================

export class FinancialDashboardGenerator {
  /**
   * Generate all financial data for comprehensive dashboard
   */
  static generateDashboardData(
    assets: Asset[],
    trusts: Trust[],
    familyMembers: FamilyMember[],
    profile: FinancialProfile,
  ) {
    const taxAnalysis = EstateTaxCalculator.calculateAdvancedEstateTax(assets, "single");
    const cashFlowProjections = CashFlowModeler.projectCashFlow(assets, profile);
    const investmentAnalysis = InvestmentAnalyzer.analyzePortfolioPerformance(assets);
    const successionPlan = SuccessionPlanOptimizer.optimizeMultiGenerationalTransfer(
      assets,
      familyMembers,
    );

    return {
      summary: {
        netWorth: profile.netWorth,
        liquidityRatio: (profile.liquidAssets / profile.netWorth) * 100,
        monthlyIncome: profile.annualIncome / 12,
        taxLiability: taxAnalysis.totalTaxLiability,
        effectiveTaxRate: taxAnalysis.effectiveRate,
      },
      taxOptimization: {
        currentLiability: taxAnalysis.totalTaxLiability,
        potentialSavings: taxAnalysis.recommendedStrategies.reduce(
          (sum, s) => sum + s.potentialSavings,
          0,
        ),
        strategies: taxAnalysis.recommendedStrategies,
        urgentActions: taxAnalysis.recommendedStrategies.filter((s) => s.priority === "critical"),
      },
      cashFlow: {
        projections: cashFlowProjections.slice(0, 10), // Next 10 years
        liquidityTrend: cashFlowProjections.map((p) => p.liquidityRatio),
        shortfallYears: cashFlowProjections.filter((p) => p.netCashFlow < 0).map((p) => p.year),
      },
      investments: {
        performance: investmentAnalysis,
        rebalancingNeeded: investmentAnalysis.recommendedRebalancing.length > 0,
        riskAlignment: investmentAnalysis.riskScore,
      },
      succession: {
        plan: successionPlan,
        readiness: this.calculateSuccessionReadiness(successionPlan, trusts),
        nextSteps: successionPlan.timingRecommendations,
      },
    };
  }

  private static calculateSuccessionReadiness(plan: SuccessionPlan, trusts: Trust[]): number {
    let readinessScore = 0;

    // Trust structure readiness (40 points)
    if (trusts.length > 0) readinessScore += 40;

    // Liquidity readiness (30 points)
    if (plan.liquidityNeeds < plan.totalWealth * 0.15) readinessScore += 30;

    // Tax optimization readiness (30 points)
    if (plan.taxOptimizedTransfer > plan.totalWealth * 0.7) readinessScore += 30;

    return readinessScore;
  }
}
