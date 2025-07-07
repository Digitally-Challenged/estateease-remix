import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/forms/input";
import { FormField } from "~/components/ui/forms/form-field";
import { User, Mail, Phone, Calendar, MapPin, Save } from "lucide-react";
import { getUserProfile } from "~/lib/dal";

export async function loader() {
  const userId = 'user-nick-001'; // Default user for now
  const userProfile = await getUserProfile(userId);
  
  return json({ userProfile });
}

export default function ProfileSettings() {
  const { userProfile } = useLoaderData<typeof loader>();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600">Manage your personal information and account details</p>
      </div>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Update your personal details and contact information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="First Name"
                required
              >
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    name="firstName"
                    defaultValue={userProfile?.first_name || "Nicholas"}
                    className="pl-10"
                  />
                </div>
              </FormField>

              <FormField
                label="Last Name"
                required
              >
                <Input
                  type="text"
                  name="lastName"
                  defaultValue={userProfile?.last_name || "Coleman"}
                />
              </FormField>

              <FormField
                label="Email Address"
                required
              >
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="email"
                    name="email"
                    defaultValue={userProfile?.email || "nicholas.coleman@example.com"}
                    className="pl-10"
                  />
                </div>
              </FormField>

              <FormField
                label="Phone Number"
              >
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="tel"
                    name="phone"
                    defaultValue={userProfile?.phone_number || "(503) 555-0123"}
                    className="pl-10"
                  />
                </div>
              </FormField>

              <FormField
                label="Date of Birth"
              >
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="date"
                    name="dateOfBirth"
                    defaultValue={userProfile?.date_of_birth || "1981-03-15"}
                    className="pl-10"
                  />
                </div>
              </FormField>

              <FormField
                label="City, State"
              >
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
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
                <Save className="h-4 w-4 mr-2" />
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
          <CardDescription>
            Key details about your estate planning status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">Primary Residence</h4>
              <p className="text-gray-900">Portland, Oregon</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">Marital Status</h4>
              <p className="text-gray-900">Married</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">Number of Children</h4>
              <p className="text-gray-900">2</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">Estate Plan Last Updated</h4>
              <p className="text-gray-900">January 2024</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>
            Manage your account preferences and security
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div>
                <h4 className="font-medium text-gray-900">Email Notifications</h4>
                <p className="text-sm text-gray-600">Receive updates about your estate planning</p>
              </div>
              <Button variant="outline" size="sm">
                Configure
              </Button>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div>
                <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                <p className="text-sm text-gray-600">Add an extra layer of security</p>
              </div>
              <Button variant="outline" size="sm">
                Enable
              </Button>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <h4 className="font-medium text-gray-900">Data Export</h4>
                <p className="text-sm text-gray-600">Download all your estate planning data</p>
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