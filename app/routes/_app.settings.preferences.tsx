import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Switch } from "~/components/ui/forms/switch";
import { Select } from "~/components/ui/forms/select";
import { FormField } from "~/components/ui/forms/form-field";
import { Bell, Eye, Globe, Palette, Save } from "lucide-react";
import { useTheme } from "~/utils/theme";
import { useState } from "react";

export default function PreferencesSettings() {
  const { theme, setTheme } = useTheme();
  const [preferences, setPreferences] = useState({
    theme: (theme || 'light') as 'light' | 'dark' | 'auto',
    emailNotifications: true,
    reminderNotifications: true,
    valueAlerts: false,
    notificationFrequency: 'weekly',
    currencyDisplay: 'usd',
    dateFormat: 'mm/dd/yyyy',
    compactView: false,
    language: 'en',
    timezone: 'America/Los_Angeles',
    country: 'US',
    highContrast: false
  });

  const handleThemeChange = (value: string) => {
    setPreferences(prev => ({ ...prev, theme: value as 'light' | 'dark' | 'auto' }));
    if (value === 'light' || value === 'dark') {
      setTheme(value as 'light' | 'dark');
    }
  };

  const handleSave = () => {
    // In a real app, this would save to database
    // For now, theme is already applied on change
    // Show success toast/notification
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Preferences</h1>
        <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500">Customize how EstateEase works for you</p>
      </div>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Choose how and when you want to be notified
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="email-notifications" className="font-medium text-gray-900 dark:text-gray-100">
                    Email Notifications
                  </label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                    Receive important updates via email
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  name="emailNotifications"
                  defaultChecked
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="reminder-notifications" className="font-medium text-gray-900 dark:text-gray-100">
                    Task Reminders
                  </label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                    Get reminded about upcoming estate planning tasks
                  </p>
                </div>
                <Switch
                  id="reminder-notifications"
                  name="reminderNotifications"
                  defaultChecked
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="value-alerts" className="font-medium text-gray-900 dark:text-gray-100">
                    Value Change Alerts
                  </label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                    Be notified of significant asset value changes
                  </p>
                </div>
                <Switch
                  id="value-alerts"
                  name="valueAlerts"
                  defaultChecked={false}
                />
              </div>
            </div>

            <FormField
              label="Notification Frequency"
              className="mt-6"
            >
              <Select
                name="notificationFrequency"
                defaultValue="weekly"
                options={[
                  { value: "immediate", label: "Immediate" },
                  { value: "daily", label: "Daily Summary" },
                  { value: "weekly", label: "Weekly Summary" },
                  { value: "monthly", label: "Monthly Summary" }
                ]}
              />
            </FormField>
          </form>
        </CardContent>
      </Card>

      {/* Display Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Eye className="h-5 w-5 mr-2" />
            Display Preferences
          </CardTitle>
          <CardDescription>
            Customize the appearance of EstateEase
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <FormField
              label="Currency Display"
            >
              <Select
                name="currencyDisplay"
                defaultValue="usd"
                options={[
                  { value: "usd", label: "USD ($)" },
                  { value: "eur", label: "EUR (€)" },
                  { value: "gbp", label: "GBP (£)" },
                  { value: "cad", label: "CAD (C$)" }
                ]}
              />
            </FormField>

            <FormField
              label="Date Format"
            >
              <Select
                name="dateFormat"
                defaultValue="mm/dd/yyyy"
                options={[
                  { value: "mm/dd/yyyy", label: "MM/DD/YYYY" },
                  { value: "dd/mm/yyyy", label: "DD/MM/YYYY" },
                  { value: "yyyy-mm-dd", label: "YYYY-MM-DD" }
                ]}
              />
            </FormField>

            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="compact-view" className="font-medium text-gray-900 dark:text-gray-100">
                  Compact View
                </label>
                <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                  Show more information in less space
                </p>
              </div>
              <Switch
                id="compact-view"
                name="compactView"
                defaultChecked={false}
              />
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Regional Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            Regional Settings
          </CardTitle>
          <CardDescription>
            Set your location and language preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <FormField
              label="Language"
            >
              <Select
                name="language"
                defaultValue="en"
                options={[
                  { value: "en", label: "English" },
                  { value: "es", label: "Spanish" },
                  { value: "fr", label: "French" },
                  { value: "de", label: "German" }
                ]}
              />
            </FormField>

            <FormField
              label="Time Zone"
            >
              <Select
                name="timezone"
                defaultValue="America/Los_Angeles"
                options={[
                  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
                  { value: "America/Denver", label: "Mountain Time (MT)" },
                  { value: "America/Chicago", label: "Central Time (CT)" },
                  { value: "America/New_York", label: "Eastern Time (ET)" }
                ]}
              />
            </FormField>

            <FormField
              label="Country"
            >
              <Select
                name="country"
                defaultValue="US"
                options={[
                  { value: "US", label: "United States" },
                  { value: "CA", label: "Canada" },
                  { value: "UK", label: "United Kingdom" },
                  { value: "AU", label: "Australia" }
                ]}
              />
            </FormField>
          </form>
        </CardContent>
      </Card>

      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Palette className="h-5 w-5 mr-2" />
            Theme Settings
          </CardTitle>
          <CardDescription>
            Choose your preferred color scheme
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <FormField
              label="Theme"
            >
              <Select
                name="theme"
                value={preferences.theme}
                onChange={(e) => handleThemeChange(e.target.value)}
                options={[
                  { value: "light", label: "Light" },
                  { value: "dark", label: "Dark" },
                  { value: "auto", label: "Auto (System)" }
                ]}
              />
            </FormField>

            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="high-contrast" className="font-medium text-gray-900 dark:text-gray-100">
                  High Contrast Mode
                </label>
                <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                  Increase contrast for better visibility
                </p>
              </div>
              <Switch
                id="high-contrast"
                name="highContrast"
                defaultChecked={false}
              />
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save Preferences
        </Button>
      </div>
    </div>
  );
}