import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import Download from "lucide-react/dist/esm/icons/download";
import Upload from "lucide-react/dist/esm/icons/upload";
import Database from "lucide-react/dist/esm/icons/database";
import FileSpreadsheet from "lucide-react/dist/esm/icons/file-spreadsheet";
import FileText from "lucide-react/dist/esm/icons/file-text";
import Calendar from "lucide-react/dist/esm/icons/calendar";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";

export default function DataSettings() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Data Management</h1>
        <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500">
          Import, export, and manage your estate planning data
        </p>
      </div>

      {/* Data Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="mr-2 h-5 w-5" />
            Data Overview
          </CardTitle>
          <CardDescription>Summary of your stored information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="rounded-lg bg-gray-50 p-4 text-center dark:bg-gray-900">
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">12</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                Total Assets
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4 text-center dark:bg-gray-900">
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">2</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                Active Trusts
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4 text-center dark:bg-gray-900">
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">8</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                Family Members
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4 text-center dark:bg-gray-900">
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">47</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                Total Records
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Download className="mr-2 h-5 w-5" />
            Export Data
          </CardTitle>
          <CardDescription>Download your estate planning data in various formats</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <FileSpreadsheet className="mt-0.5 h-5 w-5 text-green-600 dark:text-green-400" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">Excel Export</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                      Export all data to Excel spreadsheet format (.xlsx)
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <FileText className="mt-0.5 h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">PDF Report</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                      Generate a comprehensive PDF report of your estate plan
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Generate
                </Button>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <Database className="mt-0.5 h-5 w-5 text-purple-600" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">Full Backup</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                      Download a complete backup of all your data (.json)
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
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
            <Upload className="mr-2 h-5 w-5" />
            Import Data
          </CardTitle>
          <CardDescription>Import estate planning data from other sources</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-700 dark:bg-yellow-900/20">
              <div className="flex">
                <AlertTriangle className="mt-0.5 h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Important Notice
                  </h4>
                  <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                    Importing data will merge with existing information. We recommend creating a
                    backup before importing.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center dark:border-gray-600">
              <Upload className="mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-gray-500" />
              <p className="mb-2 text-gray-600 dark:text-gray-400 dark:text-gray-500">
                Drag and drop your file here, or click to browse
              </p>
              <p className="mb-4 text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">
                Supported formats: CSV, Excel (.xlsx), JSON
              </p>
              <Button variant="outline">Select File</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Data History
          </CardTitle>
          <CardDescription>Recent data operations and backups</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-gray-200 py-3 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Automatic Backup</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                    Today at 3:00 AM
                  </p>
                </div>
              </div>
              <Badge variant="secondary">Completed</Badge>
            </div>

            <div className="flex items-center justify-between border-b border-gray-200 py-3 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <Download className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Excel Export</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                    Yesterday at 2:30 PM
                  </p>
                </div>
              </div>
              <Badge variant="secondary">Completed</Badge>
            </div>

            <div className="flex items-center justify-between border-b border-gray-200 py-3 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Automatic Backup</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                    2 days ago at 3:00 AM
                  </p>
                </div>
              </div>
              <Badge variant="secondary">Completed</Badge>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center space-x-3">
                <Upload className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Data Import</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                    Last week
                  </p>
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
          <CardDescription>How long we keep your data and backups</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400 dark:text-gray-500">
                Automatic Backups
              </span>
              <span className="font-medium">30 days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400 dark:text-gray-500">
                Deleted Records
              </span>
              <span className="font-medium">90 days (recoverable)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400 dark:text-gray-500">
                Activity Logs
              </span>
              <span className="font-medium">1 year</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400 dark:text-gray-500">
                Export History
              </span>
              <span className="font-medium">6 months</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
