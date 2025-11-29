import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/progress";
import FileText from "lucide-react/dist/esm/icons/file-text";
import Brain from "lucide-react/dist/esm/icons/brain";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import Target from "lucide-react/dist/esm/icons/target";
import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
import Shield from "lucide-react/dist/esm/icons/shield";
import Clock from "lucide-react/dist/esm/icons/clock";
import Users from "lucide-react/dist/esm/icons/users";
import Eye from "lucide-react/dist/esm/icons/eye";
import RefreshCw from "lucide-react/dist/esm/icons/refresh-cw";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import BookOpen from "lucide-react/dist/esm/icons/book-open";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import type { Document } from "~/types";
import type { DocumentAnalysisResult } from "~/lib/ai-natural-language";

interface DocumentAIAnalysisProps {
  document: Document;
  analysis?: DocumentAnalysisResult;
  onAnalyze?: (document: Document) => Promise<DocumentAnalysisResult>;
  onActionClick?: (action: string, document: Document) => void;
}

export function DocumentAIAnalysis({
  document,
  analysis,
  onAnalyze,
  onActionClick,
}: DocumentAIAnalysisProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<DocumentAnalysisResult | null>(
    analysis || null,
  );

  const handleAnalyze = async () => {
    if (!onAnalyze) return;

    setIsAnalyzing(true);
    try {
      const result = await onAnalyze(document);
      setCurrentAnalysis(result);
    } catch (error) {
      console.error("Failed to analyze document:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getComplianceColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getComplianceLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    return "Needs Attention";
  };

  const getCategoryIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes("will")) return <FileText className="h-4 w-4" />;
    if (cat.includes("trust")) return <Shield className="h-4 w-4" />;
    if (cat.includes("power")) return <Users className="h-4 w-4" />;
    if (cat.includes("tax")) return <TrendingUp className="h-4 w-4" />;
    if (cat.includes("insurance")) return <Target className="h-4 w-4" />;
    return <BookOpen className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="rounded-lg bg-indigo-100 p-2">
                <Brain className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <CardTitle className="flex items-center space-x-2">
                  {getCategoryIcon(document.category || "")}
                  <span>AI Document Analysis</span>
                </CardTitle>
                <CardDescription>{document.name}</CardDescription>
              </div>
            </div>
            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              variant={currentAnalysis ? "outline" : "default"}
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  {currentAnalysis ? "Re-analyze" : "Analyze Document"}
                </>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Analysis Results */}
      {currentAnalysis ? (
        <>
          {/* Summary & Compliance Score */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Document Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="leading-relaxed text-gray-700 dark:text-gray-300">
                  {currentAnalysis.summary}
                </p>

                {currentAnalysis.keyTerms.length > 0 && (
                  <div className="mt-4">
                    <h4 className="mb-2 font-medium text-gray-900 dark:text-gray-100">Key Terms</h4>
                    <div className="flex flex-wrap gap-2">
                      {currentAnalysis.keyTerms.map((term, index) => (
                        <Badge key={index} variant="secondary">
                          {term}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Compliance Score</CardTitle>
                <CardDescription>Document compliance and legal status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div
                    className={`text-3xl font-bold ${getComplianceColor(currentAnalysis.compliance.score)}`}
                  >
                    {currentAnalysis.compliance.score}%
                  </div>
                  <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                    {getComplianceLabel(currentAnalysis.compliance.score)}
                  </div>
                  <Progress value={currentAnalysis.compliance.score} className="h-3" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Entities Extracted */}
          <Card>
            <CardHeader>
              <CardTitle>Extracted Information</CardTitle>
              <CardDescription>Key information identified in the document</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div>
                  <h4 className="mb-2 flex items-center font-medium text-gray-900 dark:text-gray-100">
                    <Users className="mr-2 h-4 w-4" />
                    People
                  </h4>
                  <div className="space-y-1">
                    {currentAnalysis.entities.people.length > 0 ? (
                      currentAnalysis.entities.people.map((person, index) => (
                        <div key={index} className="text-sm text-gray-600 dark:text-gray-400">
                          {person}
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-500">None identified</div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="mb-2 flex items-center font-medium text-gray-900 dark:text-gray-100">
                    <Clock className="mr-2 h-4 w-4" />
                    Dates
                  </h4>
                  <div className="space-y-1">
                    {currentAnalysis.entities.dates.length > 0 ? (
                      currentAnalysis.entities.dates.map((date, index) => (
                        <div key={index} className="text-sm text-gray-600 dark:text-gray-400">
                          {date}
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-500">None identified</div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="mb-2 flex items-center font-medium text-gray-900 dark:text-gray-100">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Amounts
                  </h4>
                  <div className="space-y-1">
                    {currentAnalysis.entities.amounts.length > 0 ? (
                      currentAnalysis.entities.amounts.map((amount, index) => (
                        <div key={index} className="text-sm text-gray-600 dark:text-gray-400">
                          {amount}
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-500">None identified</div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="mb-2 flex items-center font-medium text-gray-900 dark:text-gray-100">
                    <Target className="mr-2 h-4 w-4" />
                    Properties
                  </h4>
                  <div className="space-y-1">
                    {currentAnalysis.entities.properties.length > 0 ? (
                      currentAnalysis.entities.properties.map((property, index) => (
                        <div key={index} className="text-sm text-gray-600 dark:text-gray-400">
                          {property}
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-500">None identified</div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Risk Factors */}
          {currentAnalysis.riskFactors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5 text-orange-600" />
                  Risk Factors
                </CardTitle>
                <CardDescription>Potential issues or concerns identified</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentAnalysis.riskFactors.map((risk, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 rounded-lg bg-orange-50 p-3 dark:bg-orange-900/20"
                    >
                      <AlertCircle className="mt-0.5 h-5 w-5 text-orange-600" />
                      <span className="text-sm text-orange-900 dark:text-orange-100">{risk}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Compliance Issues */}
          {currentAnalysis.compliance.issues.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5 text-red-600" />
                  Compliance Issues
                </CardTitle>
                <CardDescription>Areas requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentAnalysis.compliance.issues.map((issue, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 rounded-lg bg-red-50 p-3 dark:bg-red-900/20"
                    >
                      <AlertTriangle className="mt-0.5 h-5 w-5 text-red-600" />
                      <span className="text-sm text-red-900 dark:text-red-100">{issue}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
                Recommended Actions
              </CardTitle>
              <CardDescription>
                Steps to improve document compliance and effectiveness
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {currentAnalysis.actionItems.map((action, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                  >
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="mt-0.5 h-5 w-5 text-green-600" />
                      <span className="text-sm text-gray-900 dark:text-gray-100">{action}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onActionClick?.(action, document)}
                    >
                      Take Action
                    </Button>
                  </div>
                ))}
              </div>

              {/* Compliance Recommendations */}
              {currentAnalysis.compliance.recommendations.length > 0 && (
                <div className="mt-6 border-t border-gray-200 pt-6 dark:border-gray-700">
                  <h4 className="mb-3 font-medium text-gray-900 dark:text-gray-100">
                    Compliance Recommendations
                  </h4>
                  <div className="space-y-2">
                    {currentAnalysis.compliance.recommendations.map((recommendation, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-3 rounded bg-blue-50 p-2 dark:bg-blue-900/20"
                      >
                        <Eye className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-blue-900 dark:text-blue-100">
                          {recommendation}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        /* No Analysis Yet */
        <Card>
          <CardContent className="py-12 text-center">
            <Brain className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
              AI Document Analysis
            </h3>
            <p className="mx-auto mb-6 max-w-md text-gray-600 dark:text-gray-400">
              Get intelligent insights about your document including compliance analysis, risk
              factors, and recommended actions.
            </p>
            <Button onClick={handleAnalyze} disabled={isAnalyzing}>
              {isAnalyzing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Analyze Document
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default DocumentAIAnalysis;
