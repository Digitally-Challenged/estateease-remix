/**
 * Intelligent Dashboard Component with MCP Coordination
 * Real-time estate planning analytics with swarm intelligence
 */

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import Activity from "lucide-react/dist/esm/icons/activity";
import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import Clock from "lucide-react/dist/esm/icons/clock";
import Users from "lucide-react/dist/esm/icons/users";
import Zap from "lucide-react/dist/esm/icons/zap";
import Brain from "lucide-react/dist/esm/icons/brain";
import Eye from "lucide-react/dist/esm/icons/eye";
import Settings from "lucide-react/dist/esm/icons/settings";
import { mcpCoordination, type DashboardState, type MCPAgent } from "~/lib/mcp-coordination";
import { intelligentScoping, type ScopeContext } from "~/lib/intelligent-scoping";
import type { AnyEnhancedAsset } from "~/types/assets";
import type { Trust, FamilyMember, Professional } from "~/types";
import { formatCurrency } from "~/utils/format";

interface IntelligentDashboardProps {
  assets: AnyEnhancedAsset[];
  trusts: Trust[];
  familyMembers: FamilyMember[];
  professionals: Professional[];
  userId: string;
}

interface AnalyticsResults {
  summary: {
    netWorth?: {
      total: number;
      growth: {
        oneYear: number;
      };
    };
    liquidity?: {
      liquidityRatio: number;
      liquidAssets: number;
    };
  };
  detailed: {
    allocation?: {
      riskScore: number;
      concentration: number;
    };
    estateTax?: {
      exposure: number;
      strategies: string[];
    };
    trusts?: {
      coverage: number;
      effectiveness: number;
    };
    marketImpact?: {
      volatility: number;
      correlation: number;
    };
  };
  recommendations: string[];
  alerts: string[];
  lastUpdated: string;
}

// Extract static badge variant logic outside component
const getRiskBadgeClass = (riskScore: number) => {
  if (riskScore > 70) return "text-red-600 dark:text-red-400";
  if (riskScore > 40) return "text-yellow-600 dark:text-yellow-400";
  return "text-green-600 dark:text-green-400";
};

const getRiskLabel = (riskScore: number) => {
  if (riskScore > 70) return "High concentration";
  if (riskScore > 40) return "Moderate risk";
  return "Well diversified";
};

function IntelligentDashboardComponent({
  assets,
  trusts,
  familyMembers,
  professionals,
  userId,
}: IntelligentDashboardProps) {
  const [dashboardState, setDashboardState] = useState<DashboardState>(
    mcpCoordination.getDashboardState(),
  );
  const [analyticsResults, setAnalyticsResults] = useState<AnalyticsResults | null>(null);
  const [, setAgentStatus] = useState<{ [key: string]: MCPAgent }>({});
  const [scopeContext, setScopeContext] = useState<ScopeContext>({
    userId,
    timeframe: "current",
    focus: "overview",
    entityScope: [],
    calculationDepth: "detailed",
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Execute comprehensive analytics with MCP coordination
  const executeAnalytics = useCallback(async () => {
    if (isAnalyzing) return;

    setIsAnalyzing(true);
    try {
      const results = await mcpCoordination.executeDashboardAnalytics(
        assets,
        trusts,
        familyMembers,
        professionals,
        scopeContext,
      );

      setAnalyticsResults(results.analytics);
      setAgentStatus(mcpCoordination.getAgentStatus());
    } catch (error) {
      console.error("Analytics execution failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [assets, trusts, familyMembers, professionals, scopeContext, isAnalyzing]);

  // Update scope context and re-analyze
  const updateScopeContext = useCallback((updates: Partial<ScopeContext>) => {
    setScopeContext((prev) => ({ ...prev, ...updates }));
  }, []);

  // Subscribe to dashboard state updates
  useEffect(() => {
    const unsubscribe = mcpCoordination.subscribe(setDashboardState);
    return unsubscribe;
  }, []);

  // Load initial analytics
  useEffect(() => {
    executeAnalytics();
  }, [executeAnalytics]);

  // Get coordination status
  const coordinationStatus = intelligentScoping.getCoordinationStatus();
  const performanceInsights = intelligentScoping.getPerformanceInsights();

  return (
    <div className="space-y-6">
      {/* Header with Intelligent Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center text-3xl font-bold text-gray-900 dark:text-gray-100">
            <Brain className="mr-3 h-8 w-8 text-blue-600 dark:text-blue-400" />
            Intelligent Estate Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            AI-powered analytics with swarm coordination
          </p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Scope Controls */}
          <div className="flex items-center space-x-2">
            <Button
              variant={scopeContext.focus === "overview" ? "primary" : "outline"}
              size="sm"
              onClick={() => updateScopeContext({ focus: "overview" })}
            >
              <Eye className="mr-1 h-4 w-4" />
              Overview
            </Button>
            <Button
              variant={scopeContext.focus === "planning" ? "primary" : "outline"}
              size="sm"
              onClick={() => updateScopeContext({ focus: "planning" })}
            >
              Planning
            </Button>
            <Button
              variant={scopeContext.focus === "tax" ? "primary" : "outline"}
              size="sm"
              onClick={() => updateScopeContext({ focus: "tax" })}
            >
              Tax
            </Button>
            <Button
              variant={scopeContext.focus === "risk" ? "primary" : "outline"}
              size="sm"
              onClick={() => updateScopeContext({ focus: "risk" })}
            >
              Risk
            </Button>
          </div>

          <Button
            onClick={executeAnalytics}
            disabled={isAnalyzing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Zap className="mr-2 h-4 w-4" />
            {isAnalyzing ? "Analyzing..." : "Refresh Analytics"}
          </Button>
        </div>
      </div>

      {/* Coordination Status Bar */}
      <Card className="border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium">Active Agents:</span>
                <Badge variant="default">{dashboardState.coordination.activeAgents}</Badge>
              </div>

              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium">Completed Today:</span>
                <Badge variant="secondary">{coordinationStatus.completedToday}</Badge>
              </div>

              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                <span className="text-sm font-medium">Avg Time:</span>
                <Badge variant="outline">{coordinationStatus.averageExecutionTime}ms</Badge>
              </div>

              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium">Cache Efficiency:</span>
                <Badge variant="outline">{coordinationStatus.cacheEfficiency}%</Badge>
              </div>
            </div>

            {dashboardState.loading && (
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                <span className="text-sm text-blue-600 dark:text-blue-400">Processing...</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Analytics Results */}
      {analyticsResults && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {analyticsResults.summary.netWorth && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Net Worth</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(analyticsResults.summary.netWorth.total)}
                  </div>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    +
                    {(
                      (analyticsResults.summary.netWorth.growth.oneYear /
                        analyticsResults.summary.netWorth.total -
                        1) *
                      100
                    ).toFixed(1)}
                    % projected
                  </p>
                </CardContent>
              </Card>
            )}

            {analyticsResults.detailed.allocation && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
                  <AlertCircle
                    className={`h-4 w-4 ${getRiskBadgeClass(analyticsResults.detailed.allocation.riskScore)}`}
                  />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analyticsResults.detailed.allocation.riskScore.toFixed(0)}
                  </div>
                  <p
                    className={`text-xs ${getRiskBadgeClass(analyticsResults.detailed.allocation.riskScore)}`}
                  >
                    {getRiskLabel(analyticsResults.detailed.allocation.riskScore)}
                  </p>
                </CardContent>
              </Card>
            )}

            {analyticsResults.summary.liquidity && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Liquidity Ratio</CardTitle>
                  <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analyticsResults.summary.liquidity.liquidityRatio.toFixed(1)}%
                  </div>
                  <p
                    className={`text-xs ${
                      analyticsResults.summary.liquidity.riskLevel === "high"
                        ? "text-red-600 dark:text-red-400"
                        : analyticsResults.summary.liquidity.riskLevel === "medium"
                          ? "text-yellow-600 dark:text-yellow-400"
                          : "text-green-600 dark:text-green-400"
                    }`}
                  >
                    {analyticsResults.summary.liquidity.riskLevel} risk
                  </p>
                </CardContent>
              </Card>
            )}

            {analyticsResults.detailed.estateTax && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Estate Tax</CardTitle>
                  <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(analyticsResults.detailed.estateTax.estimatedTax)}
                  </div>
                  <p className="text-xs text-orange-600 dark:text-orange-400">
                    {analyticsResults.detailed.estateTax.effectiveRate.toFixed(1)}% effective rate
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Recommendations and Alerts */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* AI Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="mr-2 h-5 w-5 text-blue-600 dark:text-blue-400" />
                  AI Recommendations
                </CardTitle>
                <CardDescription>
                  Intelligent suggestions based on your estate analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsResults.recommendations.length > 0 ? (
                    analyticsResults.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600 dark:text-green-400" />
                        <span className="text-sm">{recommendation}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      No recommendations at this time. Your estate plan looks well optimized!
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* System Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertCircle className="mr-2 h-5 w-5 text-orange-600 dark:text-orange-400" />
                  System Alerts
                </CardTitle>
                <CardDescription>Important notifications and action items</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsResults.alerts.length > 0 ? (
                    analyticsResults.alerts.map((alert, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-600 dark:text-orange-400" />
                        <span className="text-sm">{alert}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      No alerts. All systems operating normally.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-2 h-5 w-5 text-purple-600 dark:text-purple-400" />
                Performance Insights
              </CardTitle>
              <CardDescription>System optimization recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div>
                  <h4 className="mb-2 font-medium">Slowest Operations</h4>
                  <div className="space-y-1">
                    {performanceInsights.slowestScopes.map((scope, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {scope}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="mb-2 font-medium">Cache Opportunities</h4>
                  <div className="space-y-1">
                    {performanceInsights.mostCacheable.map((scope, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {scope}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="mb-2 font-medium">Optimizations</h4>
                  <div className="space-y-1">
                    {performanceInsights.recommendedOptimizations.slice(0, 2).map((opt, index) => (
                      <div key={index} className="text-xs text-gray-600 dark:text-gray-400">
                        {opt}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

// Add display name for debugging
IntelligentDashboardComponent.displayName = "IntelligentDashboard";

// Memoize the component for better performance
const IntelligentDashboard = React.memo(IntelligentDashboardComponent);

// Export default component
export default IntelligentDashboard;
