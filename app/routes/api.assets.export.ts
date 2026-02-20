import { json, type ActionFunction } from "@remix-run/node";
import { exportPortfolioData } from "~/services/asset-management.server";
import { getUserIdFromSession } from "~/lib/auth.server";

export const action: ActionFunction = async ({ request }) => {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const userId = await getUserIdFromSession(request);

    if (!userId) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const numericUserId = parseInt(String(userId), 10) || 0;
    const portfolioData = await exportPortfolioData(numericUserId);

    // Create a comprehensive export with formatted data
    const exportData = {
      ...portfolioData,
      metadata: {
        generatedBy: "EstateEase Asset Management System",
        version: "1.0.0",
        exportFormat: "JSON",
        userTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      summary: {
        totalAssets: portfolioData.assets.length,
        totalCategories: portfolioData.categories.length,
        riskAlerts: portfolioData.risks.filter(
          (r) => r.severity === "critical" || r.severity === "high",
        ).length,
        portfolioHealth: getPortfolioHealthScore(portfolioData),
      },
    };

    const fileName = `portfolio-analysis-${new Date().toISOString().split("T")[0]}.json`;

    return new Response(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "X-Export-Date": new Date().toISOString(),
        "X-Portfolio-Value": portfolioData.metrics.totalValue.toString(),
      },
    });
  } catch (error) {
    console.error("Portfolio export error:", error);
    return json({ error: "Failed to export portfolio data" }, { status: 500 });
  }
};

function getPortfolioHealthScore(portfolioData: any): {
  score: number;
  rating: string;
  factors: string[];
} {
  let score = 100;
  const factors: string[] = [];

  // Risk score impact
  if (portfolioData.metrics.riskScore < 60) {
    score -= 20;
    factors.push("High concentration risk detected");
  } else if (portfolioData.metrics.riskScore < 80) {
    score -= 10;
    factors.push("Moderate risk levels");
  }

  // Diversification impact
  if (portfolioData.metrics.diversificationScore < 60) {
    score -= 15;
    factors.push("Poor diversification");
  } else if (portfolioData.metrics.diversificationScore < 80) {
    score -= 8;
    factors.push("Adequate diversification");
  }

  // Liquidity impact
  if (portfolioData.metrics.liquidityRatio < 0.05) {
    score -= 15;
    factors.push("Low liquidity");
  } else if (portfolioData.metrics.liquidityRatio < 0.1) {
    score -= 8;
    factors.push("Moderate liquidity");
  }

  // Critical risks impact
  const criticalRisks = portfolioData.risks.filter((r: any) => r.severity === "critical").length;
  score -= criticalRisks * 10;
  if (criticalRisks > 0) {
    factors.push(`${criticalRisks} critical risk(s) identified`);
  }

  // High risks impact
  const highRisks = portfolioData.risks.filter((r: any) => r.severity === "high").length;
  score -= highRisks * 5;
  if (highRisks > 0) {
    factors.push(`${highRisks} high risk(s) identified`);
  }

  score = Math.max(0, Math.min(100, score));

  let rating: string;
  if (score >= 90) rating = "Excellent";
  else if (score >= 80) rating = "Good";
  else if (score >= 70) rating = "Fair";
  else if (score >= 60) rating = "Poor";
  else rating = "Critical";

  return { score, rating, factors };
}
