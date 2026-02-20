import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./card";
import { Button } from "./button";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  PieChart,
  BarChart3,
  Eye,
  Download,
  RefreshCw,
  Target,
  Shield,
  Zap,
} from "lucide-react";

interface AssetPerformanceMetrics {
  totalValue: number;
  monthlyChange: number;
  yearlyChange: number;
  riskScore: number;
  diversificationScore: number;
  liquidityRatio: number;
}

interface ConcentrationRisk {
  type: "ownership" | "category" | "institution" | "geographic";
  description: string;
  percentage: number;
  severity: "low" | "medium" | "high" | "critical";
  recommendation: string;
}

interface AssetCategory {
  name: string;
  value: number;
  percentage: number;
  change: number;
  color: string;
}

interface AssetPerformanceDashboardProps {
  metrics: AssetPerformanceMetrics;
  categories: AssetCategory[];
  concentrationRisks: ConcentrationRisk[];
  isLoading?: boolean;
  onRefresh?: () => void;
  onExport?: () => void;
}

// Extract static helper functions outside component
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatPercentage = (value: number) => {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
};

const getTrendColor = (change: number) => {
  return change >= 0 ? "text-green-600" : "text-red-600";
};

const getRiskColor = (severity: string) => {
  switch (severity) {
    case "low":
      return "bg-green-100 text-green-800 border-green-200";
    case "medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "high":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "critical":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getScoreColor = (score: number) => {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-yellow-600";
  return "text-red-600";
};

// Tab configuration
const TABS = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "allocation", label: "Asset Allocation", icon: PieChart },
  { id: "risks", label: "Risk Analysis", icon: AlertTriangle },
] as const;

function AssetPerformanceDashboardComponent({
  metrics,
  categories,
  concentrationRisks,
  isLoading = false,
  onRefresh,
  onExport,
}: AssetPerformanceDashboardProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "allocation" | "risks">("overview");
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Memoized trend icon component
  const TrendIcon = useMemo(() => {
    const TrendIconComponent = ({ change }: { change: number }) =>
      change >= 0 ? (
        <TrendingUp className="h-4 w-4 text-green-600" />
      ) : (
        <TrendingDown className="h-4 w-4 text-red-600" />
      );
    TrendIconComponent.displayName = "TrendIcon";
    return React.memo(TrendIconComponent);
  }, []);

  // Memoized risk icon component
  const RiskIcon = useMemo(() => {
    const RiskIconComponent = ({ severity }: { severity: string }) => {
      switch (severity) {
        case "critical":
          return <AlertTriangle className="h-4 w-4" />;
        case "high":
          return <Shield className="h-4 w-4" />;
        default:
          return <Eye className="h-4 w-4" />;
      }
    };
    RiskIconComponent.displayName = "RiskIcon";
    return React.memo(RiskIconComponent);
  }, []);

  // Memoized callbacks
  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId as "overview" | "allocation" | "risks");
  }, []);

  const handleRefresh = useCallback(() => {
    if (onRefresh && !isLoading) {
      onRefresh();
    }
  }, [onRefresh, isLoading]);

  const handleExport = useCallback(() => {
    if (onExport) {
      onExport();
    }
  }, [onExport]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Asset Performance Dashboard
          </h2>
          <p className="text-sm text-gray-600">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Portfolio
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(metrics.totalValue)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2 flex items-center">
              <TrendIcon change={metrics.yearlyChange} />
              <span className={`ml-1 text-sm ${getTrendColor(metrics.yearlyChange)}`}>
                {formatPercentage(metrics.yearlyChange)} YTD
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Risk Score</p>
                <p className={`text-2xl font-bold ${getScoreColor(metrics.riskScore)}`}>
                  {metrics.riskScore}/100
                </p>
              </div>
              <Shield className="h-8 w-8 text-orange-600" />
            </div>
            <div className="mt-2">
              <span className="text-sm text-gray-600">
                {metrics.riskScore >= 80
                  ? "Low Risk"
                  : metrics.riskScore >= 60
                    ? "Moderate Risk"
                    : "High Risk"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Diversification
                </p>
                <p className={`text-2xl font-bold ${getScoreColor(metrics.diversificationScore)}`}>
                  {metrics.diversificationScore}/100
                </p>
              </div>
              <PieChart className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2">
              <span className="text-sm text-gray-600">Allocation Score</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Liquidity Ratio
                </p>
                <p className={`text-2xl font-bold ${getScoreColor(metrics.liquidityRatio * 100)}`}>
                  {(metrics.liquidityRatio * 100).toFixed(1)}%
                </p>
              </div>
              <Zap className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2">
              <span className="text-sm text-gray-600">Available Liquidity</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`group inline-flex items-center border-b-2 px-1 py-2 text-sm font-medium ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                <Icon className="mr-2 h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Monthly Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">This Month</span>
                    <div className="flex items-center">
                      <TrendIcon change={metrics.monthlyChange} />
                      <span
                        className={`ml-1 text-sm font-medium ${getTrendColor(metrics.monthlyChange)}`}
                      >
                        {formatPercentage(metrics.monthlyChange)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Year to Date</span>
                    <div className="flex items-center">
                      <TrendIcon change={metrics.yearlyChange} />
                      <span
                        className={`ml-1 text-sm font-medium ${getTrendColor(metrics.yearlyChange)}`}
                      >
                        {formatPercentage(metrics.yearlyChange)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="mr-2 h-5 w-5" />
                  Optimization Targets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Risk Score Target</span>
                    <span className="text-sm font-medium">&gt; 80</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Diversification Target</span>
                    <span className="text-sm font-medium">&gt; 85</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Liquidity Target</span>
                    <span className="text-sm font-medium">10-15%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "allocation" && (
          <Card>
            <CardHeader>
              <CardTitle>Asset Category Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categories.map((category, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="h-4 w-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <div className="flex items-center space-x-4 text-right">
                      <div>
                        <div className="font-medium">{formatCurrency(category.value)}</div>
                        <div className="text-sm text-gray-600">
                          {category.percentage.toFixed(1)}%
                        </div>
                      </div>
                      <div className="flex items-center">
                        <TrendIcon change={category.change} />
                        <span className={`ml-1 text-sm ${getTrendColor(category.change)}`}>
                          {formatPercentage(category.change)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "risks" && (
          <div className="space-y-4">
            {concentrationRisks.map((risk, index) => (
              <Card
                key={index}
                className={`border-l-4 ${
                  risk.severity === "critical"
                    ? "border-l-red-500"
                    : risk.severity === "high"
                      ? "border-l-orange-500"
                      : risk.severity === "medium"
                        ? "border-l-yellow-500"
                        : "border-l-green-500"
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={`rounded-full p-2 ${getRiskColor(risk.severity)}`}>
                        <RiskIcon severity={risk.severity} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {risk.description}
                        </h4>
                        <p className="mt-1 text-sm text-gray-600">
                          {risk.recommendation}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{risk.percentage.toFixed(1)}%</div>
                      <div
                        className={`text-xs font-medium uppercase ${
                          risk.severity === "critical"
                            ? "text-red-600"
                            : risk.severity === "high"
                              ? "text-orange-600"
                              : risk.severity === "medium"
                                ? "text-yellow-600"
                                : "text-green-600"
                        }`}
                      >
                        {risk.severity}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Add display name for debugging
AssetPerformanceDashboardComponent.displayName = "AssetPerformanceDashboard";

// Memoize the component for better performance
export const AssetPerformanceDashboard = React.memo(AssetPerformanceDashboardComponent);
