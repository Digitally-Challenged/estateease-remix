import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { 
  FileText, 
  Download, 
  Calendar, 
  TrendingUp,
  PieChart,
  BarChart3,
  FileCheck,
  AlertCircle
} from "lucide-react";

export default function Reports() {
  const reportTypes = [
    {
      title: "Estate Summary Report",
      description: "Comprehensive overview of your entire estate including assets, trusts, and beneficiaries",
      icon: FileText,
      lastGenerated: "2024-01-15",
      status: "ready"
    },
    {
      title: "Asset Allocation Analysis",
      description: "Detailed breakdown of asset categories and ownership structures",
      icon: PieChart,
      lastGenerated: "2024-01-10",
      status: "ready"
    },
    {
      title: "Tax Planning Report",
      description: "Estate tax projections and optimization strategies",
      icon: TrendingUp,
      lastGenerated: "2024-01-05",
      status: "ready"
    },
    {
      title: "Beneficiary Distribution Report",
      description: "Summary of planned distributions to beneficiaries",
      icon: BarChart3,
      lastGenerated: "2023-12-28",
      status: "outdated"
    },
    {
      title: "Legal Documents Checklist",
      description: "Status of all estate planning documents",
      icon: FileCheck,
      lastGenerated: "2024-01-20",
      status: "ready"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
      case 'outdated':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
      default:
        return 'text-gray-600 dark:text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-900';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ready':
        return 'Up to date';
      case 'outdated':
        return 'Needs update';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Reports & Analytics</h1>
        <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 mt-2">Generate comprehensive reports for your estate planning needs</p>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Generate frequently used reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button>
              <FileText className="h-4 w-4 mr-2" />
              Generate Full Estate Report
            </Button>
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Monthly Reports
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export All Reports
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Available Reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          return (
            <Card key={report.title}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <Icon className="h-5 w-5 text-gray-600 dark:text-gray-400 dark:text-gray-500 mt-0.5" />
                    <div>
                      <CardTitle className="text-lg">{report.title}</CardTitle>
                      <CardDescription className="mt-1">{report.description}</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">Last generated</p>
                    <p className="font-medium">{new Date(report.lastGenerated).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}>
                      {getStatusText(report.status)}
                    </span>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
                {report.status === 'outdated' && (
                  <div className="mt-3 flex items-center text-sm text-yellow-600 dark:text-yellow-400">
                    <AlertCircle className="h-4 w-4 mr-1" />
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
            <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
              Generate custom reports by selecting specific data points, date ranges, and formatting options.
            </p>
            <Button variant="outline">
              Create Custom Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 