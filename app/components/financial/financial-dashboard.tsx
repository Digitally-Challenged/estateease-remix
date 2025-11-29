/**
 * Financial Dashboard Component - Real-time Financial Intelligence
 * Financial-Analysis-Agent Integration for EstateEase
 */

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Progress } from "~/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Shield,
  AlertTriangle,
  Target,
  BarChart3,
  Calculator,
  Zap,
  CheckCircle,
  Clock,
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react";

import type { Asset, Trust, FamilyMember } from "~/types";
import type { CashFlowProjection, SuccessionPlan } from "~/lib/financial-analysis";

// Define missing types
interface TaxStrategy {
  name: string;
  description: string;
  potentialSavings: number;
  priority: "critical" | "high" | "medium" | "low";
  timeframe: string;
  riskLevel: "low" | "medium" | "high";
}

interface UrgentAction {
  name: string;
  potentialSavings: number;
}

interface InvestmentPerformance {
  returnRate: number;
  benchmarkComparison: number;
  volatility: number;
}

// =================================
// COMPONENT TYPES
// =================================

interface FinancialDashboardProps {
  assets: Asset[];
  trusts: Trust[];
  familyMembers: FamilyMember[];
  dashboardData: {
    summary: {
      netWorth: number;
      liquidityRatio: number;
      monthlyIncome: number;
      taxLiability: number;
      effectiveTaxRate: number;
    };
    taxOptimization: {
      currentLiability: number;
      potentialSavings: number;
      strategies: TaxStrategy[];
      urgentActions: UrgentAction[];
    };
    cashFlow: {
      projections: CashFlowProjection[];
      liquidityTrend: number[];
      shortfallYears: number[];
    };
    investments: {
      performance: InvestmentPerformance;
      rebalancingNeeded: boolean;
      riskAlignment: number;
    };
    succession: {
      plan: SuccessionPlan;
      readiness: number;
      nextSteps: string[];
    };
  };
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: "up" | "down" | "neutral";
  subtitle?: string;
  critical?: boolean;
}

// =================================
// UTILITY FUNCTIONS
// =================================

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

// =================================
// METRIC CARD COMPONENT
// =================================

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  trend = "neutral",
  subtitle,
  critical = false,
}) => {
  const trendColors = {
    up: "text-green-600 dark:text-green-400",
    down: "text-red-600 dark:text-red-400",
    neutral: "text-gray-600 dark:text-gray-400",
  };

  const cardBorder = critical
    ? "border-red-200 dark:border-red-700 bg-red-50/50 dark:bg-red-900/10"
    : "";

  return (
    <Card className={cardBorder}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </CardTitle>
        <Icon
          className={`h-4 w-4 ${critical ? "text-red-600 dark:text-red-400" : "text-gray-600 dark:text-gray-400"}`}
        />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {typeof value === "number" ? formatCurrency(value) : value}
        </div>
        <div className="mt-1 flex items-center justify-between">
          {subtitle && <p className="text-xs text-gray-600 dark:text-gray-400">{subtitle}</p>}
          {change !== undefined && (
            <p className={`flex items-center text-xs ${trendColors[trend]}`}>
              {trend === "up" && <TrendingUp className="mr-1 h-3 w-3" />}
              {trend === "down" && <TrendingDown className="mr-1 h-3 w-3" />}
              {change > 0 ? "+" : ""}
              {formatPercentage(change)}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// =================================
// TAX OPTIMIZATION PANEL
// =================================

const TaxOptimizationPanel: React.FC<{
  taxOptimization: FinancialDashboardProps["dashboardData"]["taxOptimization"];
}> = ({ taxOptimization }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <Shield className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
            Tax Optimization Center
          </span>
          <Button variant="ghost" size="sm" onClick={() => setShowDetails(!showDetails)}>
            {showDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </CardTitle>
        <CardDescription>AI-powered tax reduction strategies and optimization</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Tax Overview */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-lg bg-gray-50 p-4 text-center dark:bg-gray-900">
              <p className="text-sm text-gray-600 dark:text-gray-400">Current Tax Liability</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {formatCurrency(taxOptimization.currentLiability)}
              </p>
            </div>
            <div className="rounded-lg bg-green-50 p-4 text-center dark:bg-green-900/20">
              <p className="text-sm text-gray-600 dark:text-gray-400">Potential Savings</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(taxOptimization.potentialSavings)}
              </p>
            </div>
          </div>

          {/* Urgent Actions */}
          {taxOptimization.urgentActions.length > 0 && (
            <div className="rounded-r-lg border-l-4 border-orange-400 bg-orange-50 p-4 dark:bg-orange-900/20">
              <div className="flex items-start">
                <AlertTriangle className="mr-3 mt-0.5 h-5 w-5 text-orange-600 dark:text-orange-400" />
                <div>
                  <h4 className="font-medium text-orange-800 dark:text-orange-200">
                    Urgent Actions Required
                  </h4>
                  <div className="mt-2 space-y-2">
                    {taxOptimization.urgentActions.map((action, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-orange-700 dark:text-orange-300">
                          {action.name}
                        </span>
                        <Badge variant="destructive" className="text-xs">
                          {formatCurrency(action.potentialSavings)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Strategy List */}
          {showDetails && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">
                Recommended Strategies
              </h4>
              {taxOptimization.strategies.slice(0, 5).map((strategy, index) => (
                <div
                  key={index}
                  className="rounded-lg border p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h5 className="font-medium text-gray-900 dark:text-gray-100">
                          {strategy.name}
                        </h5>
                        <Badge
                          variant={strategy.priority === "critical" ? "destructive" : "secondary"}
                        >
                          {strategy.priority}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {strategy.description}
                      </p>
                      <div className="mt-2 flex items-center space-x-4 text-xs">
                        <span className="text-green-600 dark:text-green-400">
                          Savings: {formatCurrency(strategy.potentialSavings)}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">
                          Timeframe: {strategy.timeframe}
                        </span>
                        <span
                          className={`${
                            strategy.riskLevel === "low"
                              ? "text-green-600 dark:text-green-400"
                              : strategy.riskLevel === "medium"
                                ? "text-yellow-600 dark:text-yellow-400"
                                : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          Risk: {strategy.riskLevel}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="mt-1 h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// =================================
// CASH FLOW ANALYSIS PANEL
// =================================

const CashFlowAnalysisPanel: React.FC<{
  cashFlow: FinancialDashboardProps["dashboardData"]["cashFlow"];
}> = ({ cashFlow }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChart3 className="mr-2 h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          Cash Flow Analysis
        </CardTitle>
        <CardDescription>10-year cash flow projections and liquidity planning</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Current Status */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-blue-50 p-3 text-center dark:bg-blue-900/20">
              <p className="text-sm text-blue-600 dark:text-blue-400">Current Liquidity</p>
              <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
                {formatPercentage(cashFlow.liquidityTrend[0] || 0)}
              </p>
            </div>
            <div className="rounded-lg bg-green-50 p-3 text-center dark:bg-green-900/20">
              <p className="text-sm text-green-600 dark:text-green-400">Positive Years</p>
              <p className="text-lg font-bold text-green-700 dark:text-green-300">
                {cashFlow.projections.filter((p) => p.netCashFlow > 0).length}/10
              </p>
            </div>
            <div className="rounded-lg bg-yellow-50 p-3 text-center dark:bg-yellow-900/20">
              <p className="text-sm text-yellow-600 dark:text-yellow-400">Shortfall Years</p>
              <p className="text-lg font-bold text-yellow-700 dark:text-yellow-300">
                {cashFlow.shortfallYears.length}
              </p>
            </div>
          </div>

          {/* Projection Summary */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">
              10-Year Projection Summary
            </h4>
            {cashFlow.projections.slice(0, 5).map((projection, index) => (
              <div key={index} className="flex items-center justify-between rounded border p-2">
                <span className="text-sm font-medium">Year {projection.year}</span>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {formatCurrency(projection.netCashFlow)}
                  </span>
                  <div className="w-16">
                    <Progress
                      value={Math.max(0, Math.min(100, projection.liquidityRatio))}
                      className="h-2"
                    />
                  </div>
                  <span className="w-12 text-xs text-gray-500 dark:text-gray-400">
                    {formatPercentage(projection.liquidityRatio)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Warnings */}
          {cashFlow.shortfallYears.length > 0 && (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-700 dark:bg-yellow-900/20">
              <div className="flex items-start">
                <Clock className="mr-2 mt-0.5 h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <div>
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Cash Flow Concerns
                  </p>
                  <p className="mt-1 text-xs text-yellow-700 dark:text-yellow-300">
                    Projected shortfalls in years: {cashFlow.shortfallYears.join(", ")}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// =================================
// SUCCESSION PLANNING PANEL
// =================================

const SuccessionPlanningPanel: React.FC<{
  succession: FinancialDashboardProps["dashboardData"]["succession"];
}> = ({ succession }) => {
  const getReadinessColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getReadinessLevel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Work";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Target className="mr-2 h-5 w-5 text-purple-600" />
          Succession Planning
        </CardTitle>
        <CardDescription>Multi-generational wealth transfer optimization</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Readiness Score */}
          <div className="rounded-lg bg-gray-50 p-4 text-center dark:bg-gray-900">
            <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">Succession Readiness</p>
            <div className="relative">
              <div className="mx-auto h-24 w-24">
                <Progress value={succession.readiness} className="h-24 w-24 rounded-full" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-2xl font-bold ${getReadinessColor(succession.readiness)}`}>
                    {succession.readiness}%
                  </span>
                </div>
              </div>
            </div>
            <p className={`mt-2 text-sm font-medium ${getReadinessColor(succession.readiness)}`}>
              {getReadinessLevel(succession.readiness)}
            </p>
          </div>

          {/* Transfer Breakdown */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Transfer Plan</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Generation 1:</span>
                  <span className="font-medium">
                    {formatCurrency(succession.plan.generation1Transfer)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Generation 2:</span>
                  <span className="font-medium">
                    {formatCurrency(succession.plan.generation2Transfer)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Charitable:</span>
                  <span className="font-medium">
                    {formatCurrency(succession.plan.charitableGiving)}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-600 dark:text-gray-400">Tax-Optimized:</span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    {formatCurrency(succession.plan.taxOptimizedTransfer)}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Liquidity Planning</h4>
              <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
                <p className="text-sm text-blue-600 dark:text-blue-400">Liquidity Needs</p>
                <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
                  {formatCurrency(succession.plan.liquidityNeeds)}
                </p>
                <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                  {formatPercentage(
                    (succession.plan.liquidityNeeds / succession.plan.totalWealth) * 100,
                  )}{" "}
                  of total wealth
                </p>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">Recommended Next Steps</h4>
            {succession.nextSteps.slice(0, 3).map((step, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm">
                <CheckCircle className="h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                <span className="text-gray-700 dark:text-gray-300">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// =================================
// MAIN DASHBOARD COMPONENT
// =================================

export const FinancialDashboard: React.FC<FinancialDashboardProps> = ({
  assets,
  dashboardData,
}) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => setRefreshing(false), 1000);
  };

  const { summary, taxOptimization, cashFlow, succession } = dashboardData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Financial Intelligence Dashboard
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Real-time financial analysis and estate planning optimization
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <Zap className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          <span>Refresh Analysis</span>
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
        <MetricCard
          title="Net Worth"
          value={summary.netWorth}
          icon={DollarSign}
          subtitle={`${assets.length} assets`}
        />
        <MetricCard
          title="Liquidity Ratio"
          value={formatPercentage(summary.liquidityRatio)}
          icon={BarChart3}
          trend={summary.liquidityRatio > 20 ? "up" : "down"}
          subtitle="Cash & equivalents"
        />
        <MetricCard
          title="Monthly Income"
          value={summary.monthlyIncome}
          icon={TrendingUp}
          subtitle="Investment income"
        />
        <MetricCard
          title="Tax Liability"
          value={summary.taxLiability}
          icon={Calculator}
          critical={summary.taxLiability > 100000}
          subtitle={`${formatPercentage(summary.effectiveTaxRate)} effective rate`}
        />
        <MetricCard
          title="Tax Savings"
          value={taxOptimization.potentialSavings}
          icon={Shield}
          trend="up"
          subtitle={`${taxOptimization.strategies.length} strategies`}
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tax">Tax Optimization</TabsTrigger>
          <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
          <TabsTrigger value="succession">Succession</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <TaxOptimizationPanel taxOptimization={taxOptimization} />
            <CashFlowAnalysisPanel cashFlow={cashFlow} />
          </div>
        </TabsContent>

        <TabsContent value="tax" className="space-y-4">
          <TaxOptimizationPanel taxOptimization={taxOptimization} />
        </TabsContent>

        <TabsContent value="cashflow" className="space-y-4">
          <CashFlowAnalysisPanel cashFlow={cashFlow} />
        </TabsContent>

        <TabsContent value="succession" className="space-y-4">
          <SuccessionPlanningPanel succession={succession} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialDashboard;
