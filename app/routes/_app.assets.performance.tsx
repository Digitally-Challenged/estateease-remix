import { json, type LoaderFunction } from "@remix-run/node";
import { useLoaderData, useRevalidator } from "@remix-run/react";
import { useState, useEffect } from "react";
import { AssetPerformanceDashboard } from "~/components/ui/asset-performance-dashboard";
import {
  calculateAssetMetrics,
  getAssetCategories,
  identifyConcentrationRisks,
  exportPortfolioData,
  type AssetPerformanceMetrics,
  type AssetCategory,
  type ConcentrationRisk,
} from "~/services/asset-management.server";

interface LoaderData {
  metrics: AssetPerformanceMetrics;
  categories: AssetCategory[];
  concentrationRisks: ConcentrationRisk[];
}

export const loader: LoaderFunction = async ({ request }) => {
  // TODO: Get actual user ID from session
  const userId = 1; // Placeholder

  try {
    const [metrics, categories, concentrationRisks] = await Promise.all([
      calculateAssetMetrics(userId),
      getAssetCategories(userId),
      identifyConcentrationRisks(userId),
    ]);

    return json<LoaderData>({
      metrics,
      categories,
      concentrationRisks,
    });
  } catch (error) {
    console.error("Error loading asset performance data:", error);

    // Return default data if there's an error
    return json<LoaderData>({
      metrics: {
        totalValue: 0,
        monthlyChange: 0,
        yearlyChange: 0,
        riskScore: 50,
        diversificationScore: 50,
        liquidityRatio: 0.1,
      },
      categories: [],
      concentrationRisks: [],
    });
  }
};

export default function AssetPerformance() {
  const { metrics, categories, concentrationRisks } = useLoaderData<LoaderData>();
  const revalidator = useRevalidator();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    revalidator.revalidate();

    // Add a minimum delay for UX
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleExport = async () => {
    try {
      // TODO: Implement actual export functionality
      const response = await fetch("/api/assets/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `portfolio-analysis-${new Date().toISOString().split("T")[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        console.error("Export failed");
      }
    } catch (error) {
      console.error("Export error:", error);

      // Fallback: create client-side export
      const exportData = {
        metrics,
        categories,
        concentrationRisks,
        exportDate: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `portfolio-analysis-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(
      () => {
        if (!isRefreshing) {
          handleRefresh();
        }
      },
      5 * 60 * 1000,
    ); // 5 minutes

    return () => clearInterval(interval);
  }, [isRefreshing]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-4 dark:border-gray-700">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Asset Performance & Analytics
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Real-time portfolio monitoring, risk analysis, and optimization insights
        </p>
      </div>

      {/* Performance Dashboard */}
      <AssetPerformanceDashboard
        metrics={metrics}
        categories={categories}
        concentrationRisks={concentrationRisks}
        isLoading={isRefreshing || revalidator.state === "loading"}
        onRefresh={handleRefresh}
        onExport={handleExport}
      />

      {/* Additional Insights */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Performance Summary */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
            Key Performance Indicators
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Portfolio Growth (YTD)
              </span>
              <span
                className={`text-sm font-medium ${
                  metrics.yearlyChange >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {metrics.yearlyChange >= 0 ? "+" : ""}
                {metrics.yearlyChange.toFixed(2)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Risk-Adjusted Score</span>
              <span
                className={`text-sm font-medium ${
                  metrics.riskScore >= 80
                    ? "text-green-600"
                    : metrics.riskScore >= 60
                      ? "text-yellow-600"
                      : "text-red-600"
                }`}
              >
                {metrics.riskScore}/100
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Diversification Index
              </span>
              <span
                className={`text-sm font-medium ${
                  metrics.diversificationScore >= 80
                    ? "text-green-600"
                    : metrics.diversificationScore >= 60
                      ? "text-yellow-600"
                      : "text-red-600"
                }`}
              >
                {metrics.diversificationScore}/100
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Liquidity Position</span>
              <span
                className={`text-sm font-medium ${
                  metrics.liquidityRatio >= 0.1 ? "text-green-600" : "text-yellow-600"
                }`}
              >
                {(metrics.liquidityRatio * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Optimization Recommendations */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">
            Optimization Opportunities
          </h3>
          <div className="space-y-3">
            {concentrationRisks.slice(0, 3).map((risk, index) => (
              <div key={index} className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {risk.type.charAt(0).toUpperCase() + risk.type.slice(1)} Risk
                  </span>
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      risk.severity === "critical"
                        ? "bg-red-100 text-red-800"
                        : risk.severity === "high"
                          ? "bg-orange-100 text-orange-800"
                          : risk.severity === "medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                    }`}
                  >
                    {risk.severity}
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">{risk.recommendation}</p>
              </div>
            ))}

            {concentrationRisks.length === 0 && (
              <div className="py-4 text-center text-gray-500 dark:text-gray-400">
                <p className="text-sm">No significant risks identified</p>
                <p className="mt-1 text-xs">Your portfolio appears well-balanced</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Items */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-900/20">
        <h3 className="mb-3 text-lg font-semibold text-blue-900 dark:text-blue-100">
          Recommended Actions
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <h4 className="mb-2 font-medium text-blue-800 dark:text-blue-200">
              Immediate (High Priority)
            </h4>
            <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
              {concentrationRisks
                .filter((risk) => risk.severity === "critical" || risk.severity === "high")
                .slice(0, 3)
                .map((risk, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>{risk.recommendation}</span>
                  </li>
                ))}
              {concentrationRisks.filter(
                (risk) => risk.severity === "critical" || risk.severity === "high",
              ).length === 0 && (
                <li className="text-green-700 dark:text-green-300">
                  No immediate actions required
                </li>
              )}
            </ul>
          </div>
          <div>
            <h4 className="mb-2 font-medium text-blue-800 dark:text-blue-200">Medium-Term</h4>
            <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
              <li>• Review and rebalance quarterly</li>
              <li>• Consider tax-loss harvesting opportunities</li>
              <li>• Optimize asset location for tax efficiency</li>
              <li>• Monitor external market conditions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
