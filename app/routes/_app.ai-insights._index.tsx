import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState, useCallback } from "react";
import { requireUser } from "~/lib/auth.server";
import { getAssets, getFamilyMembers, getTrusts, getProfessionals } from "~/lib/dal";
import { aiInsights } from "~/lib/ai-insights";
import { AIInsightsDashboard } from "~/components/ai/ai-insights-dashboard";
import type { EstateInsight, PredictiveModel, AIRecommendation } from "~/lib/ai-insights";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  const userId = 1; // Default user for now

  try {
    // Load all estate data
    const [assets, familyMembers, trusts, professionals] = await Promise.all([
      getAssets(userId),
      getFamilyMembers(userId),
      getTrusts(userId),
      getProfessionals(userId),
    ]);

    // Generate AI insights and analysis
    const analysisResult = await aiInsights.analyzeEstate({
      assets,
      trusts,
      familyMembers,
      professionals,
    });

    return json({
      user,
      insights: analysisResult.insights,
      predictiveModel: analysisResult.predictiveModel,
      recommendations: analysisResult.recommendations,
      riskAssessment: analysisResult.riskAssessment,
      estateData: {
        assets,
        trusts,
        familyMembers,
        professionals,
      },
    });
  } catch (error) {
    console.error("Failed to load AI insights:", error);
    return json(
      {
        error: "Failed to load AI insights",
        insights: [],
        predictiveModel: {
          estateGrowthRate: 0,
          taxOptimizationPotential: 0,
          riskScore: 0,
          liquidityRatio: 0,
          successionReadiness: 0,
          complianceScore: 0,
        },
        recommendations: [],
        riskAssessment: {},
      },
      { status: 500 },
    );
  }
}

export default function AIInsights() {
  const { user, insights, predictiveModel, recommendations, riskAssessment, estateData, error } =
    useLoaderData<typeof loader>();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // In a real implementation, this would trigger a fresh analysis
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate analysis
      window.location.reload(); // For now, just reload the page
    } catch (error) {
      console.error("Failed to refresh insights:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const handleInsightClick = useCallback((insight: EstateInsight) => {
    // Navigate to detailed insight view or open modal
    console.log("Insight clicked:", insight);
    // In a real implementation, this might open a detailed view or modal
  }, []);

  const handleRecommendationAction = useCallback((recommendation: AIRecommendation) => {
    // Handle recommendation action (e.g., schedule consultation, create task)
    console.log("Recommendation action:", recommendation);
    // In a real implementation, this might:
    // - Schedule a consultation with a professional
    // - Create a task in the user's todo list
    // - Navigate to relevant forms or tools
  }, []);

  if (error) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-700 dark:bg-red-900/20">
          <h2 className="mb-2 text-lg font-semibold text-red-900 dark:text-red-100">
            Unable to Load AI Insights
          </h2>
          <p className="text-red-700 dark:text-red-300">
            We encountered an error while analyzing your estate data. Please try refreshing the page
            or contact support if the issue persists.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <AIInsightsDashboard
        insights={insights}
        predictiveModel={predictiveModel}
        recommendations={recommendations}
        riskAssessment={riskAssessment}
        onRefresh={handleRefresh}
        onInsightClick={handleInsightClick}
        onRecommendationAction={handleRecommendationAction}
      />
    </div>
  );
}
