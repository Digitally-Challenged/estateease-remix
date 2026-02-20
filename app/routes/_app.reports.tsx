import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Link } from "@remix-run/react";
import FileText from "lucide-react/dist/esm/icons/file-text";
import Download from "lucide-react/dist/esm/icons/download";
import Calendar from "lucide-react/dist/esm/icons/calendar";
import TrendingUp from "lucide-react/dist/esm/icons/trending-up";
import PieChart from "lucide-react/dist/esm/icons/pie-chart";
import BarChart3 from "lucide-react/dist/esm/icons/bar-chart-3";
import FileCheck from "lucide-react/dist/esm/icons/file-check";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import ExternalLink from "lucide-react/dist/esm/icons/external-link";
import Loader2 from "lucide-react/dist/esm/icons/loader-2";

export default function Reports() {
  const [isExporting, setIsExporting] = useState(false);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  const handleExportAll = async () => {
    setIsExporting(true);
    try {
      // TODO: Implement actual export functionality
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate export

      // Create a downloadable bundle (placeholder)
      const reportData = {
        exportDate: new Date().toISOString(),
        reports: reportTypes.map((report) => ({
          ...report,
          data: `Sample data for ${report.title}`,
        })),
      };

      const blob = new Blob([JSON.stringify(reportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `estate-reports-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleGenerateReport = async (reportTitle: string) => {
    setIsGenerating(reportTitle);
    try {
      // TODO: Implement actual report generation
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate generation

      // Create downloadable report (placeholder)
      const reportData = {
        title: reportTitle,
        generatedDate: new Date().toISOString(),
        data: `Generated content for ${reportTitle}`,
      };

      const blob = new Blob([JSON.stringify(reportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${reportTitle.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Report generation failed:", error);
    } finally {
      setIsGenerating(null);
    }
  };

  const reportTypes = [
    {
      title: "Estate Summary Report",
      description:
"Comprehensive overview of your entire estate including assets, trusts, and beneficiaries",
      icon: FileText,
      lastGenerated: "2024-01-15",
      status: "ready",
    },
    {
      title: "Asset Allocation Analysis",
      description: "Detailed breakdown of asset categories and ownership structures",
      icon: PieChart,
      lastGenerated: "2024-01-10",
      status: "ready",
    },
    {
      title: "Tax Planning Report",
      description: "Estate tax projections and optimization strategies",
      icon: TrendingUp,
      lastGenerated: "2024-01-05",
      status: "ready",
    },
    {
      title: "Beneficiary Distribution Report",
      description: "Summary of planned distributions to beneficiaries",
      icon: BarChart3,
      lastGenerated: "2023-12-28",
      status: "outdated",
    },
    {
      title: "Legal Documents Checklist",
      description: "Status of all estate planning documents",
      icon: FileCheck,
      lastGenerated: "2024-01-20",
      status: "ready",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready":
        return "text-green-600 bg-green-50";
      case "outdated":
        return "text-yellow-600 bg-yellow-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "ready":
        return "Up to date";
      case "outdated":
        return "Needs update";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="mt-2 text-gray-600">
          Generate comprehensive reports for your estate planning needs
        </p>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Generate frequently used reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col flex-wrap gap-4 sm:flex-row">
            <Link to="/reports/estate-summary">
              <Button className="w-full sm:w-auto">
                <FileText className="mr-2 h-4 w-4" />
                View Estate Summary
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Button variant="outline" className="w-full sm:w-auto">
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Monthly Reports
            </Button>
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={handleExportAll}
              disabled={isExporting}
            >
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export All Reports
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Available Reports */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          return (
            <Card key={report.title}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <Icon className="mt-0.5 h-5 w-5 text-gray-600" />
                    <div>
                      <CardTitle className="text-lg">{report.title}</CardTitle>
                      <CardDescription className="mt-1">{report.description}</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      Last generated
                    </p>
                    <p className="font-medium">
                      {new Date(report.lastGenerated).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(report.status)} text-center`}
                    >
                      {getStatusText(report.status)}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full sm:w-auto"
                      onClick={() => handleGenerateReport(report.title)}
                      disabled={isGenerating === report.title}
                    >
                      {isGenerating === report.title ? (
                        <>
                          <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Download className="mr-1 h-4 w-4" />
                          Download
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                {report.status === "outdated" && (
                  <div className="mt-3 flex items-center text-sm text-yellow-600">
                    <AlertCircle className="mr-1 h-4 w-4" />
                    This report may contain outdated information
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Custom Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Reports</CardTitle>
          <CardDescription>Create customized reports based on your specific needs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Generate custom reports by selecting specific data points, date ranges, and formatting
              options.
            </p>
            <Button variant="outline">Create Custom Report</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
