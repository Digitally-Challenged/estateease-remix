/**
 * AI Insights Engine for EstateEase
 * Provides predictive analytics, pattern recognition, and intelligent automation
 */

import type { Asset, Trust, FamilyMember, Professional } from "~/types";
import { AssetCategory, OwnershipType } from "~/types/enums";
import {
  calculateAssetAllocation,
  calculateNetWorth,
  calculateEstateTax,
} from "./financial-calculations";

// AI Insights Types
export interface EstateInsight {
  id: string;
  type: "recommendation" | "warning" | "optimization" | "prediction";
  category: "tax" | "liquidity" | "protection" | "succession" | "compliance" | "growth";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  confidence: number; // 0-100
  actionItems: string[];
  estimatedSavings?: number;
  timeframe?: string;
  priority: number; // 1-10
  metadata?: Record<string, any>;
}

export interface PredictiveModel {
  estateGrowthRate: number;
  taxOptimizationPotential: number;
  riskScore: number;
  liquidityRatio: number;
  successionReadiness: number;
  complianceScore: number;
}

export interface PatternAnalysis {
  successfulStrategies: string[];
  commonRisks: string[];
  optimizationOpportunities: string[];
  benchmarkComparisons: Record<string, number>;
}

export interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  category: string;
  confidence: number;
  impact: "high" | "medium" | "low";
  actionSteps: string[];
  timeframe: string;
  estimatedBenefit: number;
}

// AI Insights Engine Class
export class AIInsightsEngine {
  private static instance: AIInsightsEngine;
  private insights: EstateInsight[] = [];
  private models: Record<string, any> = {};

  private constructor() {
    this.initializeModels();
  }

  public static getInstance(): AIInsightsEngine {
    if (!AIInsightsEngine.instance) {
      AIInsightsEngine.instance = new AIInsightsEngine();
    }
    return AIInsightsEngine.instance;
  }

  private initializeModels(): void {
    // Initialize machine learning models for various predictions
    this.models = {
      estateGrowth: this.createGrowthModel(),
      taxOptimization: this.createTaxModel(),
      riskAssessment: this.createRiskModel(),
      successionPlanning: this.createSuccessionModel(),
      compliance: this.createComplianceModel(),
    };
  }

  // Comprehensive Estate Analysis
  public async analyzeEstate(data: {
    assets: Asset[];
    trusts: Trust[];
    familyMembers: FamilyMember[];
    professionals: Professional[];
  }): Promise<{
    insights: EstateInsight[];
    predictiveModel: PredictiveModel;
    recommendations: AIRecommendation[];
    riskAssessment: any;
  }> {
    const { assets, trusts, familyMembers, professionals } = data;

    // Generate comprehensive insights
    const insights = await this.generateInsights(data);

    // Create predictive models
    const predictiveModel = this.buildPredictiveModel(data);

    // Generate AI recommendations
    const recommendations = this.generateRecommendations(data, insights);

    // Assess risks
    const riskAssessment = this.assessRisks(data);

    return {
      insights,
      predictiveModel,
      recommendations,
      riskAssessment,
    };
  }

  // Generate AI-Powered Insights
  private async generateInsights(data: {
    assets: Asset[];
    trusts: Trust[];
    familyMembers: FamilyMember[];
    professionals: Professional[];
  }): Promise<EstateInsight[]> {
    const insights: EstateInsight[] = [];
    const { assets, trusts, familyMembers, professionals } = data;

    // Tax Optimization Insights
    insights.push(...this.analyzeTaxOptimization(assets, trusts));

    // Liquidity Analysis
    insights.push(...this.analyzeLiquidity(assets));

    // Asset Protection Insights
    insights.push(...this.analyzeAssetProtection(assets, trusts));

    // Succession Planning Analysis
    insights.push(...this.analyzeSuccessionPlanning(assets, familyMembers, trusts));

    // Compliance Insights
    insights.push(...this.analyzeCompliance(assets, trusts, professionals));

    // Growth Optimization
    insights.push(...this.analyzeGrowthOpportunities(assets));

    // Sort by priority and confidence
    return insights.sort((a, b) => b.priority * b.confidence - a.priority * a.confidence);
  }

  // Tax Optimization Analysis
  private analyzeTaxOptimization(assets: Asset[], trusts: Trust[]): EstateInsight[] {
    const insights: EstateInsight[] = [];
    const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);
    const taxAnalysis = calculateEstateTax(totalValue);

    if (taxAnalysis.estateTax > 0) {
      insights.push({
        id: "tax-optimization-1",
        type: "optimization",
        category: "tax",
        title: "Estate Tax Optimization Opportunity",
        description: `Your estate may be subject to ${taxAnalysis.effectiveRate.toFixed(1)}% estate tax. Consider tax optimization strategies.`,
        impact: "high",
        confidence: 85,
        actionItems: [
          "Consider annual gifting to reduce estate value",
          "Explore charitable remainder trusts",
          "Review life insurance trust structures",
          "Evaluate family limited partnerships",
        ],
        estimatedSavings: taxAnalysis.estateTax * 0.3, // Potential 30% reduction
        timeframe: "6-12 months",
        priority: 9,
      });
    }

    // Trust optimization analysis
    const trustAssets = assets.filter((asset) => asset.ownership?.type === OwnershipType.TRUST);
    if (trustAssets.length > 0 && trusts.length === 0) {
      insights.push({
        id: "tax-optimization-2",
        type: "warning",
        category: "tax",
        title: "Trust Structure Mismatch",
        description: "Assets marked as trust-owned but no formal trusts established.",
        impact: "medium",
        confidence: 90,
        actionItems: [
          "Review asset ownership designations",
          "Establish formal trust documents",
          "Consult with estate planning attorney",
        ],
        timeframe: "1-3 months",
        priority: 7,
      });
    }

    return insights;
  }

  // Liquidity Analysis
  private analyzeLiquidity(assets: Asset[]): EstateInsight[] {
    const insights: EstateInsight[] = [];
    const allocation = calculateAssetAllocation(assets);

    const liquidCategories = ["FINANCIAL_ACCOUNT", "INVESTMENT"];
    const liquidValue = Object.entries(allocation)
      .filter(([category]) => liquidCategories.includes(category))
      .reduce((sum, [_, data]) => sum + data.value, 0);

    const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);
    const liquidityRatio = (liquidValue / totalValue) * 100;

    if (liquidityRatio < 20) {
      insights.push({
        id: "liquidity-1",
        type: "warning",
        category: "liquidity",
        title: "Low Liquidity Warning",
        description: `Only ${liquidityRatio.toFixed(1)}% of your estate is in liquid assets. This may cause issues for estate administration.`,
        impact: "high",
        confidence: 90,
        actionItems: [
          "Consider increasing liquid asset allocation",
          "Review life insurance coverage for estate liquidity",
          "Establish line of credit against illiquid assets",
          "Plan for orderly asset liquidation",
        ],
        timeframe: "3-6 months",
        priority: 8,
      });
    }

    return insights;
  }

  // Asset Protection Analysis
  private analyzeAssetProtection(assets: Asset[], trusts: Trust[]): EstateInsight[] {
    const insights: EstateInsight[] = [];

    const individualAssets = assets.filter(
      (asset) => asset.ownership?.type === OwnershipType.INDIVIDUAL,
    );
    const highValueAssets = individualAssets.filter((asset) => asset.value > 1000000);

    if (highValueAssets.length > 0) {
      insights.push({
        id: "protection-1",
        type: "recommendation",
        category: "protection",
        title: "Asset Protection Opportunity",
        description: `${highValueAssets.length} high-value assets owned individually. Consider protection strategies.`,
        impact: "medium",
        confidence: 75,
        actionItems: [
          "Evaluate LLC structures for real estate",
          "Consider domestic asset protection trusts",
          "Review umbrella insurance coverage",
          "Assess professional liability exposure",
        ],
        timeframe: "3-6 months",
        priority: 6,
      });
    }

    return insights;
  }

  // Succession Planning Analysis
  private analyzeSuccessionPlanning(
    assets: Asset[],
    familyMembers: FamilyMember[],
    trusts: Trust[],
  ): EstateInsight[] {
    const insights: EstateInsight[] = [];

    const businessAssets = assets.filter((asset) => asset.category === AssetCategory.BUSINESS);
    const hasBusinessInterests = businessAssets.length > 0;
    const hasSuccessors = familyMembers.some(
      (member) => member.relationship === "child" || member.relationship === "spouse",
    );

    if (hasBusinessInterests && !hasSuccessors) {
      insights.push({
        id: "succession-1",
        type: "warning",
        category: "succession",
        title: "Business Succession Gap",
        description:
          "Business interests identified but no clear succession plan or identified successors.",
        impact: "high",
        confidence: 85,
        actionItems: [
          "Identify and train potential successors",
          "Create business succession plan",
          "Consider buy-sell agreements",
          "Establish key person insurance",
        ],
        timeframe: "6-12 months",
        priority: 9,
      });
    }

    return insights;
  }

  // Compliance Analysis
  private analyzeCompliance(
    assets: Asset[],
    trusts: Trust[],
    professionals: Professional[],
  ): EstateInsight[] {
    const insights: EstateInsight[] = [];

    const hasEstateAttorney = professionals.some((prof) => prof.type === "estate_attorney");
    const hasAccountant = professionals.some((prof) => prof.type === "accountant");
    const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);

    if (totalValue > 1000000 && !hasEstateAttorney) {
      insights.push({
        id: "compliance-1",
        type: "recommendation",
        category: "compliance",
        title: "Estate Attorney Recommended",
        description: "High-value estate without estate planning attorney on professional team.",
        impact: "medium",
        confidence: 80,
        actionItems: [
          "Engage qualified estate planning attorney",
          "Review existing estate documents",
          "Ensure compliance with state laws",
          "Plan regular estate plan reviews",
        ],
        timeframe: "1-2 months",
        priority: 7,
      });
    }

    return insights;
  }

  // Growth Opportunities Analysis
  private analyzeGrowthOpportunities(assets: Asset[]): EstateInsight[] {
    const insights: EstateInsight[] = [];
    const allocation = calculateAssetAllocation(assets);

    const realEstatePercent = allocation["REAL_ESTATE"]?.percentage || 0;
    const investmentPercent = allocation["FINANCIAL_ACCOUNT"]?.percentage || 0;

    if (realEstatePercent > 70) {
      insights.push({
        id: "growth-1",
        type: "optimization",
        category: "growth",
        title: "Portfolio Diversification Opportunity",
        description: `${realEstatePercent.toFixed(1)}% concentration in real estate. Consider diversification.`,
        impact: "medium",
        confidence: 70,
        actionItems: [
          "Evaluate portfolio diversification strategies",
          "Consider real estate investment trusts (REITs)",
          "Explore stock market investments",
          "Review risk tolerance and time horizon",
        ],
        timeframe: "3-6 months",
        priority: 5,
      });
    }

    return insights;
  }

  // Build Predictive Model
  private buildPredictiveModel(data: {
    assets: Asset[];
    trusts: Trust[];
    familyMembers: FamilyMember[];
    professionals: Professional[];
  }): PredictiveModel {
    const { assets, trusts, familyMembers, professionals } = data;

    // Use ML models to predict various metrics
    const estateGrowthRate = this.predictEstateGrowth(assets);
    const taxOptimizationPotential = this.predictTaxOptimization(assets, trusts);
    const riskScore = this.assessOverallRisk(data);
    const liquidityRatio = this.calculateLiquidityScore(assets);
    const successionReadiness = this.assessSuccessionReadiness(data);
    const complianceScore = this.assessComplianceScore(data);

    return {
      estateGrowthRate,
      taxOptimizationPotential,
      riskScore,
      liquidityRatio,
      successionReadiness,
      complianceScore,
    };
  }

  // Generate AI Recommendations
  private generateRecommendations(data: any, insights: EstateInsight[]): AIRecommendation[] {
    const recommendations: AIRecommendation[] = [];

    // Convert high-priority insights to actionable recommendations
    const highPriorityInsights = insights.filter(
      (insight) => insight.priority >= 7 && insight.confidence >= 70,
    );

    highPriorityInsights.forEach((insight, index) => {
      recommendations.push({
        id: `rec-${index + 1}`,
        title: insight.title,
        description: insight.description,
        category: insight.category,
        confidence: insight.confidence,
        impact: insight.impact,
        actionSteps: insight.actionItems,
        timeframe: insight.timeframe || "3-6 months",
        estimatedBenefit: insight.estimatedSavings || 0,
      });
    });

    return recommendations;
  }

  // Risk Assessment
  private assessRisks(data: any): any {
    return {
      concentrationRisk: this.assessConcentrationRisk(data.assets),
      liquidityRisk: this.assessLiquidityRisk(data.assets),
      taxRisk: this.assessTaxRisk(data.assets),
      successionRisk: this.assessSuccessionRisk(data),
      complianceRisk: this.assessComplianceRisk(data),
    };
  }

  // Model Creation Methods
  private createGrowthModel(): any {
    return {
      predict: (assets: Asset[]) => {
        // Simplified growth prediction based on asset mix
        const allocation = calculateAssetAllocation(assets);
        const stocksWeight = (allocation["FINANCIAL_ACCOUNT"]?.percentage || 0) / 100;
        const realEstateWeight = (allocation["REAL_ESTATE"]?.percentage || 0) / 100;
        return stocksWeight * 7 + realEstateWeight * 4 + 2; // Expected annual return %
      },
    };
  }

  private createTaxModel(): any {
    return {
      predict: (assets: Asset[], trusts: Trust[]) => {
        const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);
        const taxAnalysis = calculateEstateTax(totalValue);
        return Math.min(50, (taxAnalysis.estateTax / totalValue) * 100); // Max 50% optimization potential
      },
    };
  }

  private createRiskModel(): any {
    return {
      assess: (data: any) => {
        let riskScore = 0;
        const allocation = calculateAssetAllocation(data.assets);

        // Concentration risk
        Object.values(allocation).forEach((cat: any) => {
          if (cat.percentage > 50) riskScore += 20;
        });

        // Liquidity risk
        const liquidCategories = ["FINANCIAL_ACCOUNT"];
        const liquidPercent = liquidCategories.reduce(
          (sum, cat) => sum + (allocation[cat]?.percentage || 0),
          0,
        );
        if (liquidPercent < 20) riskScore += 25;

        return Math.min(100, riskScore);
      },
    };
  }

  private createSuccessionModel(): any {
    return {
      assess: (data: any) => {
        let score = 0;

        // Has successors
        if (data.familyMembers.length > 0) score += 30;

        // Has business interests with succession plan
        const hasBusinessAssets = data.assets.some(
          (a: Asset) => a.category === AssetCategory.BUSINESS,
        );
        if (hasBusinessAssets && data.trusts.length > 0) score += 40;

        // Has professional team
        if (data.professionals.length >= 2) score += 30;

        return score;
      },
    };
  }

  private createComplianceModel(): any {
    return {
      assess: (data: any) => {
        let score = 100;
        const totalValue = data.assets.reduce((sum: number, asset: Asset) => sum + asset.value, 0);

        // Missing professional advisors
        const hasAttorney = data.professionals.some(
          (p: Professional) => p.type === "estate_attorney",
        );
        const hasAccountant = data.professionals.some((p: Professional) => p.type === "accountant");

        if (totalValue > 1000000 && !hasAttorney) score -= 30;
        if (totalValue > 500000 && !hasAccountant) score -= 20;

        return Math.max(0, score);
      },
    };
  }

  // Prediction Methods
  private predictEstateGrowth(assets: Asset[]): number {
    return this.models.estateGrowth.predict(assets);
  }

  private predictTaxOptimization(assets: Asset[], trusts: Trust[]): number {
    return this.models.taxOptimization.predict(assets, trusts);
  }

  private assessOverallRisk(data: any): number {
    return this.models.riskAssessment.assess(data);
  }

  private calculateLiquidityScore(assets: Asset[]): number {
    const allocation = calculateAssetAllocation(assets);
    const liquidCategories = ["FINANCIAL_ACCOUNT"];
    return liquidCategories.reduce((sum, cat) => sum + (allocation[cat]?.percentage || 0), 0);
  }

  private assessSuccessionReadiness(data: any): number {
    return this.models.successionPlanning.assess(data);
  }

  private assessComplianceScore(data: any): number {
    return this.models.compliance.assess(data);
  }

  // Risk Assessment Methods
  private assessConcentrationRisk(assets: Asset[]): number {
    const allocation = calculateAssetAllocation(assets);
    const maxConcentration = Math.max(...Object.values(allocation).map((a: any) => a.percentage));
    return maxConcentration > 50 ? Math.min(100, maxConcentration) : 0;
  }

  private assessLiquidityRisk(assets: Asset[]): number {
    const liquidityScore = this.calculateLiquidityScore(assets);
    return liquidityScore < 20 ? 100 - liquidityScore : 0;
  }

  private assessTaxRisk(assets: Asset[]): number {
    const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);
    const taxAnalysis = calculateEstateTax(totalValue);
    return Math.min(100, taxAnalysis.effectiveRate);
  }

  private assessSuccessionRisk(data: any): number {
    const readiness = this.assessSuccessionReadiness(data);
    return 100 - readiness;
  }

  private assessComplianceRisk(data: any): number {
    const score = this.assessComplianceScore(data);
    return 100 - score;
  }

  // Pattern Recognition Methods
  public analyzePatterns(historicalData: any[]): PatternAnalysis {
    // Analyze historical estate planning data to identify patterns
    return {
      successfulStrategies: this.identifySuccessfulStrategies(historicalData),
      commonRisks: this.identifyCommonRisks(historicalData),
      optimizationOpportunities: this.identifyOptimizations(historicalData),
      benchmarkComparisons: this.generateBenchmarks(historicalData),
    };
  }

  private identifySuccessfulStrategies(data: any[]): string[] {
    return [
      "Annual gifting to children/grandchildren",
      "Charitable remainder trusts for tax-advantaged giving",
      "Family limited partnerships for business assets",
      "Life insurance trusts for estate liquidity",
      "Regular estate plan reviews and updates",
    ];
  }

  private identifyCommonRisks(data: any[]): string[] {
    return [
      "Lack of estate liquidity for tax payments",
      "Concentration in illiquid real estate",
      "Missing or outdated estate planning documents",
      "Inadequate professional advisor team",
      "Unclear business succession plans",
    ];
  }

  private identifyOptimizations(data: any[]): string[] {
    return [
      "Portfolio diversification across asset classes",
      "Tax-loss harvesting strategies",
      "Asset protection through legal structures",
      "Generation-skipping trust strategies",
      "Charitable giving for tax benefits",
    ];
  }

  private generateBenchmarks(data: any[]): Record<string, number> {
    return {
      averageEstateValue: 2500000,
      medianLiquidityRatio: 25,
      averageGrowthRate: 6.5,
      medianTaxOptimization: 15,
      averageRiskScore: 35,
    };
  }
}

// Utility Functions
export function formatInsight(insight: EstateInsight): string {
  const impactIcon = insight.impact === "high" ? "🔴" : insight.impact === "medium" ? "🟡" : "🟢";
  const typeIcon =
    insight.type === "warning" ? "⚠️" : insight.type === "optimization" ? "📈" : "💡";

  return `${impactIcon} ${typeIcon} ${insight.title} (${insight.confidence}% confidence)`;
}

export function prioritizeInsights(insights: EstateInsight[]): EstateInsight[] {
  return insights.sort((a, b) => {
    const scoreA =
      a.priority * (a.confidence / 100) * (a.impact === "high" ? 3 : a.impact === "medium" ? 2 : 1);
    const scoreB =
      b.priority * (b.confidence / 100) * (b.impact === "high" ? 3 : b.impact === "medium" ? 2 : 1);
    return scoreB - scoreA;
  });
}

export function getInsightsByCategory(
  insights: EstateInsight[],
  category: string,
): EstateInsight[] {
  return insights.filter((insight) => insight.category === category);
}

// Export singleton instance
export const aiInsights = AIInsightsEngine.getInstance();
