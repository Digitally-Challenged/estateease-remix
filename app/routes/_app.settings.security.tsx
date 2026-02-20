import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Switch } from "~/components/ui/forms/switch";
import { Input } from "~/components/ui/forms/input";
import { FormField } from "~/components/ui/forms/form-field";
import Key from "lucide-react/dist/esm/icons/key";
import Smartphone from "lucide-react/dist/esm/icons/smartphone";
import Lock from "lucide-react/dist/esm/icons/lock";
import AlertTriangle from "lucide-react/dist/esm/icons/alert-triangle";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import History from "lucide-react/dist/esm/icons/history";
import Save from "lucide-react/dist/esm/icons/save";

export default function SecuritySettings() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Security Settings</h1>
        <p className="text-gray-600">
          Manage your account security and access controls
        </p>
      </div>

      {/* Security Status */}
      <Card>
        <CardHeader>
          <CardTitle>Security Status</CardTitle>
          <CardDescription>Overview of your current security settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-gray-900">
                  Strong Password
                </span>
              </div>
              <Badge variant="secondary">Active</Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <span className="font-medium text-gray-900">
                  Two-Factor Authentication
                </span>
              </div>
              <Badge variant="outline">Not Enabled</Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-gray-900">Last Login</span>
              </div>
              <span className="text-sm text-gray-600">
                Today at 9:15 AM
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Password Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Key className="mr-2 h-5 w-5" />
            Password Management
          </CardTitle>
          <CardDescription>Update your password and password requirements</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <FormField label="Current Password" required>
              <Input type="password" name="currentPassword" placeholder="Enter current password" />
            </FormField>

            <FormField
              label="New Password"
              required
              helperText="Must be at least 12 characters with uppercase, lowercase, numbers, and symbols"
            >
              <Input type="password" name="newPassword" placeholder="Enter new password" />
            </FormField>

            <FormField label="Confirm New Password" required>
              <Input type="password" name="confirmPassword" placeholder="Confirm new password" />
            </FormField>

            <div className="flex justify-end">
              <Button type="submit">Update Password</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Smartphone className="mr-2 h-5 w-5" />
            Two-Factor Authentication (2FA)
          </CardTitle>
          <CardDescription>Add an extra layer of security to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Enable 2FA</h4>
                <p className="text-sm text-gray-600">
                  Require a verification code in addition to your password
                </p>
              </div>
              <Switch id="enable-2fa" name="enable2fa" defaultChecked={false} />
            </div>

            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <div className="flex">
                <AlertTriangle className="mt-0.5 h-5 w-5 text-yellow-600" />
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-yellow-800">
                    Recommendation
                  </h4>
                  <p className="mt-1 text-sm text-yellow-700">
                    We strongly recommend enabling two-factor authentication to protect your estate
                    planning data.
                  </p>
                </div>
              </div>
            </div>

            <Button variant="outline" className="w-full">
              Set Up Two-Factor Authentication
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Login Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <History className="mr-2 h-5 w-5" />
            Active Sessions
          </CardTitle>
          <CardDescription>Manage devices that have access to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-lg border border-gray-200 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">
                    MacBook Pro - Chrome
                  </h4>
                  <p className="text-sm text-gray-600">
                    Portland, OR • 192.168.1.1
                  </p>
                  <p className="text-sm text-gray-500">
                    Last active: Just now
                  </p>
                </div>
                <Badge variant="secondary">Current</Badge>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">
                    iPhone 14 Pro - Safari
                  </h4>
                  <p className="text-sm text-gray-600">
                    Portland, OR • Mobile Network
                  </p>
                  <p className="text-sm text-gray-500">
                    Last active: 2 hours ago
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  End Session
                </Button>
              </div>
            </div>

            <Button variant="outline" className="w-full">
              End All Other Sessions
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lock className="mr-2 h-5 w-5" />
            Privacy Settings
          </CardTitle>
          <CardDescription>Control who can access your estate planning information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label
                  htmlFor="share-with-spouse"
                  className="font-medium text-gray-900"
                >
                  Share with Spouse
                </label>
                <p className="text-sm text-gray-600">
                  Allow your spouse to view estate planning details
                </p>
              </div>
              <Switch id="share-with-spouse" name="shareWithSpouse" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label
                  htmlFor="share-with-advisors"
                  className="font-medium text-gray-900"
                >
                  Share with Advisors
                </label>
                <p className="text-sm text-gray-600">
                  Allow authorized advisors to access specific information
                </p>
              </div>
              <Switch id="share-with-advisors" name="shareWithAdvisors" defaultChecked={false} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label
                  htmlFor="require-approval"
                  className="font-medium text-gray-900"
                >
                  Require Approval for Changes
                </label>
                <p className="text-sm text-gray-600">
                  Send notifications for all account modifications
                </p>
              </div>
              <Switch id="require-approval" name="requireApproval" defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button>
          <Save className="mr-2 h-4 w-4" />
          Save Security Settings
        </Button>
      </div>
    </div>
  );
}
