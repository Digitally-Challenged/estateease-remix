import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/progress";
import Brain from "lucide-react/dist/esm/icons/brain";
import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import Target from "lucide-react/dist/esm/icons/target";
import Lightbulb from "lucide-react/dist/esm/icons/lightbulb";
import BarChart3 from "lucide-react/dist/esm/icons/bar-chart-3";
import Zap from "lucide-react/dist/esm/icons/zap";
import Eye from "lucide-react/dist/esm/icons/eye";
import ArrowRight from "lucide-react/dist/esm/icons/arrow-right";
import RefreshCw from "lucide-react/dist/esm/icons/refresh-cw";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import type { EstateInsight, PredictiveModel, AIRecommendation } from "~/lib/ai-insights";

interface AIInsightsDashboardProps {
  insights: EstateInsight[];
  predictiveModel: PredictiveModel;
  recommendations: AIRecommendation[];
  riskAssessment: Record<string, number>;
  onRefresh?: () => void;
  onInsightClick?: (insight: EstateInsight) => void;
  onRecommendationAction?: (recommendation: AIRecommendation) => void;
}

export function AIInsightsDashboard({
  insights,
  predictiveModel,
  recommendations,
  riskAssessment,
  onRefresh,
  onInsightClick,
  onRecommendationAction,
}: AIInsightsDashboardProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh?.();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const getInsightIcon = (type: EstateInsight["type"]) => {
    switch (type) {
      case "recommendation":
        return <Lightbulb className="h-5 w-5" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5" />;
      case "optimization":
        return <TrendingUp className="h-5 w-5" />;
      case "prediction":
        return <Eye className="h-5 w-5" />;
      default:
        return <Brain className="h-5 w-5" />;
    }
  };

  const getImpactColor = (impact: "high" | "medium" | "low") => {
    switch (impact) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const filteredInsights =
    selectedCategory === "all"
      ? insights
      : insights.filter((insight) => insight.category === selectedCategory);

  const categories = ["all", ...Array.from(new Set(insights.map((i) => i.category)))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="rounded-lg bg-indigo-100 p-2">
            <Brain className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              AI Insights Dashboard
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Intelligent estate planning recommendations and predictions
            </p>
          </div>
        </div>
        <Button onClick={handleRefresh} variant="outline" disabled={isRefreshing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh Analysis
        </Button>
      </div>

      {/* Predictive Model Overview */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-sm font-medium">
              <TrendingUp className="mr-2 h-4 w-4 text-green-600" />
              Estate Growth Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {predictiveModel.estateGrowthRate.toFixed(1)}%
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Projected annual growth</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-sm font-medium">
              <Target className="mr-2 h-4 w-4 text-blue-600" />
              Tax Optimization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {predictiveModel.taxOptimizationPotential.toFixed(0)}%
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Potential tax savings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-sm font-medium">
              <AlertTriangle className="mr-2 h-4 w-4 text-orange-600" />
              Risk Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(100 - predictiveModel.riskScore)}`}>
              {predictiveModel.riskScore.toFixed(0)}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Lower is better</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Scores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="mr-2 h-5 w-5" />
            Estate Health Metrics
          </CardTitle>
          <CardDescription>Comprehensive analysis of your estate planning status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">Liquidity Ratio</span>
                  <span
                    className={`text-sm font-bold ${getScoreColor(predictiveModel.liquidityRatio)}`}
                  >
                    {predictiveModel.liquidityRatio.toFixed(1)}%
                  </span>
                </div>
                <Progress value={predictiveModel.liquidityRatio} className="h-2" />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">Succession Readiness</span>
                  <span
                    className={`text-sm font-bold ${getScoreColor(predictiveModel.successionReadiness)}`}
                  >
                    {predictiveModel.successionReadiness.toFixed(0)}%
                  </span>
                </div>
                <Progress value={predictiveModel.successionReadiness} className="h-2" />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">Compliance Score</span>
                  <span
                    className={`text-sm font-bold ${getScoreColor(predictiveModel.complianceScore)}`}
                  >
                    {predictiveModel.complianceScore.toFixed(0)}%
                  </span>
                </div>
                <Progress value={predictiveModel.complianceScore} className="h-2" />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">Risk Breakdown</h4>
              {Object.entries(riskAssessment).map(([risk, score]) => (
                <div key={risk} className="flex items-center justify-between">
                  <span className="text-sm capitalize">
                    {risk.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                  <div className="flex items-center space-x-2">
                    <div
                      className={`h-3 w-3 rounded-full ${
                        score < 30 ? "bg-green-500" : score < 60 ? "bg-yellow-500" : "bg-red-500"
                      }`}
                    />
                    <span className="text-sm font-medium">{score}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Sparkles className="mr-2 h-5 w-5" />
            Priority Recommendations
          </CardTitle>
          <CardDescription>
            AI-generated recommendations based on your estate analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendations.slice(0, 3).map((recommendation) => (
              <div
                key={recommendation.id}
                className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center space-x-2">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        {recommendation.title}
                      </h4>
                      <Badge className={getImpactColor(recommendation.impact)}>
                        {recommendation.impact}
                      </Badge>
                      <Badge variant="outline">{recommendation.confidence}% confidence</Badge>
                    </div>
                    <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                      {recommendation.description}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Category: {recommendation.category}</span>
                      <span>Timeframe: {recommendation.timeframe}</span>
                      {recommendation.estimatedBenefit > 0 && (
                        <span>
                          Est. Benefit: ${recommendation.estimatedBenefit.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => onRecommendationAction?.(recommendation)}
                    className="ml-4"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Zap className="mr-2 h-5 w-5" />
                AI Insights ({filteredInsights.length})
              </CardTitle>
              <CardDescription>
                Detailed analysis and recommendations for your estate
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="capitalize"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredInsights.map((insight) => (
              <button
                key={insight.id}
                className="w-full cursor-pointer rounded-lg border border-gray-200 p-4 text-left transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                onClick={() => onInsightClick?.(insight)}
                type="button"
              >
                <div className="flex items-start space-x-3">
                  <div
                    className={`rounded-lg p-2 ${
                      insight.type === "warning"
                        ? "bg-red-100 text-red-600"
                        : insight.type === "optimization"
                          ? "bg-blue-100 text-blue-600"
                          : insight.type === "prediction"
                            ? "bg-purple-100 text-purple-600"
                            : "bg-green-100 text-green-600"
                    }`}
                  >
                    {getInsightIcon(insight.type)}
                  </div>
                  <div className="flex-1">
                    <div className="mb-2 flex items-center space-x-2">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        {insight.title}
                      </h4>
                      <Badge className={getImpactColor(insight.impact)}>{insight.impact}</Badge>
                      <Badge variant="outline">{insight.confidence}% confidence</Badge>
                      <Badge variant="secondary">Priority {insight.priority}</Badge>
                    </div>
                    <p className="mb-3 text-gray-600 dark:text-gray-400">{insight.description}</p>

                    {insight.actionItems.length > 0 && (
                      <div>
                        <h5 className="mb-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                          Action Items:
                        </h5>
                        <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                          {insight.actionItems.slice(0, 3).map((item, index) => (
                            <li key={index} className="flex items-center">
                              <CheckCircle className="mr-2 h-3 w-3 text-green-500" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-700">
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Category: {insight.category}</span>
                        {insight.timeframe && <span>Timeframe: {insight.timeframe}</span>}
                        {insight.estimatedSavings && (
                          <span>Est. Savings: ${insight.estimatedSavings.toLocaleString()}</span>
                        )}
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AIInsightsDashboard;
