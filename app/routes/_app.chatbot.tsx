import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState, useCallback } from "react";
import { requireUser } from "~/lib/auth.server";
import { getAssets, getFamilyMembers, getTrusts, getProfessionals } from "~/lib/dal";
import { nlpProcessor } from "~/lib/ai-natural-language";
import { aiInsights } from "~/lib/ai-insights";
import { AIChatbot } from "~/components/ai/ai-chatbot";
import type { QueryAnalysis, ConversationContext } from "~/lib/ai-natural-language";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  const userId = 1; // Default user for now

  // Load user's estate data for context
  const [assets, familyMembers, trusts, professionals] = await Promise.all([
    getAssets(userId),
    getFamilyMembers(userId),
    getTrusts(userId),
    getProfessionals(userId),
  ]);

  // Calculate basic estate metrics for context
  const totalEstateValue = assets.reduce((sum, asset) => sum + asset.value, 0);

  const initialContext: Partial<ConversationContext> = {
    userId: user.id || "default",
    sessionId: `session-${Date.now()}`,
    userProfile: {
      estateValue: totalEstateValue,
      primaryConcerns: ["tax-planning", "asset-protection"], // Could be derived from data
      knowledgeLevel:
        totalEstateValue > 5000000
          ? "advanced"
          : totalEstateValue > 1000000
            ? "intermediate"
            : "beginner",
    },
  };

  return json({
    user,
    initialContext,
    estateMetrics: {
      totalValue: totalEstateValue,
      assetCount: assets.length,
      trustCount: trusts.length,
      familyMemberCount: familyMembers.length,
    },
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireUser(request);
  const formData = await request.formData();
  const query = formData.get("query") as string;
  const action = formData.get("action") as string;

  if (action === "analyze-query") {
    try {
      const analysis = await nlpProcessor.analyzeQuery(query);
      return json({ analysis });
    } catch (error) {
      console.error("Error analyzing query:", error);
      return json({ error: "Failed to analyze query" }, { status: 500 });
    }
  }

  if (action === "generate-response") {
    try {
      const analysisData = formData.get("analysis");
      const analysis: QueryAnalysis = analysisData ? JSON.parse(analysisData as string) : null;

      if (!analysis) {
        return json({ error: "Missing analysis data" }, { status: 400 });
      }

      const response = nlpProcessor.generateContextualResponse(query, analysis);
      return json({ response });
    } catch (error) {
      console.error("Error generating response:", error);
      return json({ error: "Failed to generate response" }, { status: 500 });
    }
  }

  return json({ error: "Invalid action" }, { status: 400 });
}

export default function Chatbot() {
  const { user, initialContext, estateMetrics } = useLoaderData<typeof loader>();

  const handleQueryAnalyze = useCallback(async (query: string): Promise<QueryAnalysis> => {
    try {
      const formData = new FormData();
      formData.append("query", query);
      formData.append("action", "analyze-query");

      const response = await fetch("/chatbot", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      return data.analysis;
    } catch (error) {
      console.error("Error analyzing query:", error);
      // Return fallback analysis
      return {
        intent: "question",
        category: "estate",
        confidence: 50,
        entities: [],
        suggestedResponses: [],
      };
    }
  }, []);

  const handleResponseGenerate = useCallback(
    async (query: string, analysis: QueryAnalysis): Promise<string> => {
      try {
        const formData = new FormData();
        formData.append("query", query);
        formData.append("analysis", JSON.stringify(analysis));
        formData.append("action", "generate-response");

        const response = await fetch("/chatbot", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        return data.response;
      } catch (error) {
        console.error("Error generating response:", error);
        return "I apologize, but I'm having trouble processing your request right now. Please try again or contact support if the issue persists.";
      }
    },
    [],
  );

  const handleFeedback = useCallback((messageId: string, feedback: "positive" | "negative") => {
    // In a real implementation, this would be sent to an analytics service
  }, []);

  return (
    <div className="space-y-6">
      {/* Estate Context Banner */}
      <div className="rounded-lg border border-indigo-200 bg-gradient-to-r from-indigo-50 to-blue-50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-indigo-900">
              AI Advisor with Your Estate Context
            </h2>
            <p className="mt-1 text-sm text-indigo-700">
              I have access to your estate information to provide personalized guidance
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <div className="font-bold text-indigo-900">
                ${estateMetrics.totalValue.toLocaleString()}
              </div>
              <div className="text-indigo-600">Total Estate Value</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-indigo-900">
                {estateMetrics.assetCount}
              </div>
              <div className="text-indigo-600">Assets Tracked</div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Chatbot Component */}
      <AIChatbot
        initialContext={initialContext}
        onQueryAnalyze={handleQueryAnalyze}
        onResponseGenerate={handleResponseGenerate}
        onFeedback={handleFeedback}
      />
    </div>
  );
}
