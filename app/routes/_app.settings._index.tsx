import { Link } from "@remix-run/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { 
  User, 
  Settings, 
  Shield, 
  Database, 
  ChevronRight,
  Bell,
  Globe,
  Palette,
  Key,
  Download
} from "lucide-react";
import { useTheme } from "~/utils/theme";

export default function SettingsIndex() {
  const { theme } = useTheme();
  
  const settingsSections = [
    {
      title: "Profile",
      description: "Manage your personal information and account details",
      icon: User,
      href: "/settings/profile",
      color: "text-blue-600 dark:text-blue-400"
    },
    {
      title: "Preferences",
      description: "Customize how EstateEase works for you",
      icon: Settings,
      href: "/settings/preferences",
      color: "text-purple-600"
    },
    {
      title: "Security",
      description: "Manage your account security and access controls",
      icon: Shield,
      href: "/settings/security",
      color: "text-green-600 dark:text-green-400"
    },
    {
      title: "Data Management",
      description: "Import, export, and manage your estate planning data",
      icon: Database,
      href: "/settings/data",
      color: "text-orange-600 dark:text-orange-400"
    }
  ];

  const quickSettings = [
    {
      title: "Email Notifications",
      icon: Bell,
      status: "Enabled",
      href: "/settings/preferences"
    },
    {
      title: "Language & Region",
      icon: Globe,
      status: "English (US)",
      href: "/settings/preferences"
    },
    {
      title: "Theme",
      icon: Palette,
      status: theme === "dark" ? "Dark Mode" : "Light Mode",
      href: "/settings/preferences"
    },
    {
      title: "Two-Factor Auth",
      icon: Key,
      status: "Not Enabled",
      href: "/settings/security"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500">Manage your account settings and preferences</p>
      </div>

      {/* Quick Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Settings</CardTitle>
          <CardDescription>Frequently accessed settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickSettings.map((setting) => {
              const Icon = setting.icon;
              return (
                <Link
                  key={setting.title}
                  to={setting.href}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-900 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5 text-gray-600 dark:text-gray-400 dark:text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{setting.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">{setting.status}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {settingsSections.map((section) => {
          const Icon = section.icon;
          return (
            <Link
              key={section.title}
              to={section.href}
              className="block hover:shadow-lg transition-shadow"
            >
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <Icon className={`h-8 w-8 ${section.color}`} />
                    <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <CardTitle className="mt-4">{section.title}</CardTitle>
                  <CardDescription>{section.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
          <CardDescription>Additional account management options</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Link
              to="/settings/data"
              className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-900 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Download className="h-5 w-5 text-gray-600 dark:text-gray-400 dark:text-gray-500" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Export All Data</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">Download a complete backup of your information</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}