import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/forms/input";
import { FormField } from "~/components/ui/forms/form-field";
import User from "lucide-react/dist/esm/icons/user";
import Mail from "lucide-react/dist/esm/icons/mail";
import Phone from "lucide-react/dist/esm/icons/phone";
import Calendar from "lucide-react/dist/esm/icons/calendar";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import Save from "lucide-react/dist/esm/icons/save";
import { getUserProfile } from "~/lib/dal";
import { requireUser } from "~/lib/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  const userId = user.id;
  const userProfile = await getUserProfile(userId);

  return json({ userProfile });
}

export default function ProfileSettings() {
  const { userProfile } = useLoaderData<typeof loader>();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Profile Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500">
          Manage your personal information and account details
        </p>
      </div>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your personal details and contact information</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField label="First Name" required>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400 dark:text-gray-500" />
                  <Input
                    type="text"
                    name="firstName"
                    defaultValue={userProfile?.firstName || "Nicholas"}
                    className="pl-10"
                  />
                </div>
              </FormField>

              <FormField label="Last Name" required>
                <Input
                  type="text"
                  name="lastName"
                  defaultValue={userProfile?.lastName || "Coleman"}
                />
              </FormField>

              <FormField label="Email Address" required>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400 dark:text-gray-500" />
                  <Input
                    type="email"
                    name="email"
                    defaultValue={userProfile?.email || "nicholas.coleman@example.com"}
                    className="pl-10"
                  />
                </div>
              </FormField>

              <FormField label="Phone Number">
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400 dark:text-gray-500" />
                  <Input
                    type="tel"
                    name="phone"
                    defaultValue={userProfile?.phone || "(503) 555-0123"}
                    className="pl-10"
                  />
                </div>
              </FormField>

              <FormField label="Date of Birth">
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400 dark:text-gray-500" />
                  <Input
                    type="date"
                    name="dateOfBirth"
                    defaultValue={userProfile?.dateOfBirth || "1981-03-15"}
                    className="pl-10"
                  />
                </div>
              </FormField>

              <FormField label="City, State">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400 dark:text-gray-500" />
                  <Input
                    type="text"
                    name="location"
                    defaultValue="Portland, OR"
                    className="pl-10"
                  />
                </div>
              </FormField>
            </div>

            <div className="flex justify-end">
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Estate Information */}
      <Card>
        <CardHeader>
          <CardTitle>Estate Information</CardTitle>
          <CardDescription>Key details about your estate planning status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <h4 className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Primary Residence
              </h4>
              <p className="text-gray-900 dark:text-gray-100">Portland, Oregon</p>
            </div>
            <div>
              <h4 className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Marital Status
              </h4>
              <p className="text-gray-900 dark:text-gray-100">Married</p>
            </div>
            <div>
              <h4 className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Number of Children
              </h4>
              <p className="text-gray-900 dark:text-gray-100">2</p>
            </div>
            <div>
              <h4 className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                Estate Plan Last Updated
              </h4>
              <p className="text-gray-900 dark:text-gray-100">January 2024</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>Manage your account preferences and security</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200 py-3 dark:border-gray-700">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                  Email Notifications
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                  Receive updates about your estate planning
                </p>
              </div>
              <Button variant="outline" size="sm">
                Configure
              </Button>
            </div>
            <div className="flex items-center justify-between border-b border-gray-200 py-3 dark:border-gray-700">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                  Two-Factor Authentication
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                  Add an extra layer of security
                </p>
              </div>
              <Button variant="outline" size="sm">
                Enable
              </Button>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">Data Export</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-500">
                  Download all your estate planning data
                </p>
              </div>
              <Button variant="outline" size="sm">
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
