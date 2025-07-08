import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { 
  Download, 
  Upload, 
  Database, 
  FileSpreadsheet,
  FileText,
  Calendar,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

export default function DataSettings() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Data Management</h1>
        <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500">Import, export, and manage your estate planning data</p>
      </div>

      {/* Data Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="h-5 w-5 mr-2" />
            Data Overview
          </CardTitle>
          <CardDescription>
            Summary of your stored information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">12</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">Total Assets</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">2</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">Active Trusts</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">8</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">Family Members</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">47</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">Total Records</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Download className="h-5 w-5 mr-2" />
            Export Data
          </CardTitle>
          <CardDescription>
            Download your estate planning data in various formats
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <FileSpreadsheet className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">Excel Export</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                      Export all data to Excel spreadsheet format (.xlsx)
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">PDF Report</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                      Generate a comprehensive PDF report of your estate plan
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Generate
                </Button>
              </div>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <Database className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">Full Backup</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                      Download a complete backup of all your data (.json)
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Backup
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Import Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="h-5 w-5 mr-2" />
            Import Data
          </CardTitle>
          <CardDescription>
            Import estate planning data from other sources
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Important Notice
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    Importing data will merge with existing information. We recommend creating a backup before importing.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500 mb-2">
                Drag and drop your file here, or click to browse
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 mb-4">
                Supported formats: CSV, Excel (.xlsx), JSON
              </p>
              <Button variant="outline">
                Select File
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Data History
          </CardTitle>
          <CardDescription>
            Recent data operations and backups
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Automatic Backup</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">Today at 3:00 AM</p>
                </div>
              </div>
              <Badge variant="secondary">Completed</Badge>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <Download className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Excel Export</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">Yesterday at 2:30 PM</p>
                </div>
              </div>
              <Badge variant="secondary">Completed</Badge>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Automatic Backup</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">2 days ago at 3:00 AM</p>
                </div>
              </div>
              <Badge variant="secondary">Completed</Badge>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center space-x-3">
                <Upload className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Data Import</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">Last week</p>
                </div>
              </div>
              <Badge variant="secondary">Completed</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Retention */}
      <Card>
        <CardHeader>
          <CardTitle>Data Retention Policy</CardTitle>
          <CardDescription>
            How long we keep your data and backups
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400 dark:text-gray-500">Automatic Backups</span>
              <span className="font-medium">30 days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400 dark:text-gray-500">Deleted Records</span>
              <span className="font-medium">90 days (recoverable)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400 dark:text-gray-500">Activity Logs</span>
              <span className="font-medium">1 year</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400 dark:text-gray-500">Export History</span>
              <span className="font-medium">6 months</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}