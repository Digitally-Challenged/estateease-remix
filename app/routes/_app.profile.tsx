import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useNavigate } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/forms/input";
import { FormField } from "~/components/ui/forms/form-field";
import { Textarea } from "~/components/ui/forms/textarea";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { requireUser, updateProfile, changePassword } from "~/lib/auth.server";
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left";
import User from "lucide-react/dist/esm/icons/user";
import Lock from "lucide-react/dist/esm/icons/lock";
import Save from "lucide-react/dist/esm/icons/save";
import Eye from "lucide-react/dist/esm/icons/eye";
import EyeOff from "lucide-react/dist/esm/icons/eye-off";
import { useState } from "react";
import { z } from "zod";
import {
  profileUpdateFormSchema,
  changePasswordFormSchema,
  formatProfileValidationErrors,
  formatAuthValidationErrors,
} from "~/lib/validation";

interface ActionData {
  type?: "profile" | "password";
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);

  return json({
    user: {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      phone: user.phone_number || "",
      dateOfBirth: user.date_of_birth || "",
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    },
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireUser(request);
  const formData = await request.formData();
  const actionType = formData.get("actionType") as string;

  try {
    if (actionType === "profile") {
      // Handle profile update
      const rawData = {
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        dateOfBirth: formData.get("dateOfBirth"),
        bio: formData.get("bio"),
      };

      // Validate the form data
      const validatedData = profileUpdateFormSchema.parse(rawData);

      // Update the profile
      const result = await updateProfile(user.id, validatedData);

      if (result.success) {
        return json({
          type: "profile",
          success: true,
        });
      } else {
        return json(
          {
            type: "profile",
            error: result.error || "Failed to update profile",
          },
          { status: 400 },
        );
      }
    } else if (actionType === "password") {
      // Handle password change
      const rawData = {
        currentPassword: formData.get("currentPassword"),
        newPassword: formData.get("newPassword"),
        confirmPassword: formData.get("confirmPassword"),
      };

      // Validate the form data
      const validatedData = changePasswordFormSchema.parse(rawData);

      // Change the password
      const result = await changePassword(
        user.id,
        validatedData.currentPassword,
        validatedData.newPassword,
      );

      if (result.success) {
        return json({
          type: "password",
          success: true,
        });
      } else {
        return json(
          {
            type: "password",
            error: result.error || "Failed to change password",
          },
          { status: 400 },
        );
      }
    }
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return json(
        {
          type: actionType,
          error: "Please correct the validation errors below.",
          fieldErrors:
            actionType === "profile"
              ? formatProfileValidationErrors(error)
              : formatAuthValidationErrors(error),
        },
        { status: 400 },
      );
    }

    console.error(`Error ${actionType}:`, error);
    return json(
      {
        type: actionType,
        error: `Failed to ${actionType}. Please try again.`,
      },
      { status: 500 },
    );
  }
}

export default function Profile() {
  const { user } = useLoaderData<typeof loader>();
  const actionData = useActionData<ActionData>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const getFieldError = (fieldName: string) => {
    return actionData?.fieldErrors?.[fieldName]?.[0];
  };

  const togglePasswordVisibility = (field: "current" | "new" | "confirm") => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="rounded-lg p-2 transition-colors hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Profile</h1>
          <p className="mt-1 text-gray-600">
            Manage your account settings and preferences
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("profile")}
            className={`border-b-2 px-1 py-2 text-sm font-medium ${
              activeTab === "profile"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            <User className="mr-2 inline h-4 w-4" />
            Profile Information
          </button>
          <button
            onClick={() => setActiveTab("password")}
            className={`border-b-2 px-1 py-2 text-sm font-medium ${
              activeTab === "password"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
            }`}
          >
            <Lock className="mr-2 inline h-4 w-4" />
            Change Password
          </button>
        </nav>
      </div>

      {/* Success/Error Messages */}
      {actionData?.success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">
            {actionData.type === "profile"
              ? "Profile updated successfully!"
              : "Password changed successfully!"}
          </AlertDescription>
        </Alert>
      )}

      {actionData?.error && (
        <Alert variant="destructive">
          <AlertDescription>{actionData.error}</AlertDescription>
        </Alert>
      )}

      {actionData?.fieldErrors && Object.keys(actionData.fieldErrors).length > 0 && (
        <Alert variant="destructive">
          <AlertDescription>
            <div className="space-y-1">
              {Object.entries(actionData.fieldErrors).map(([field, errors]) => (
                <div key={field}>
                  <strong className="capitalize">{field.replace(/([A-Z])/g, " $1").trim()}:</strong>{" "}
                  {errors.join(", ")}
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Profile Information Tab */}
      {activeTab === "profile" && (
        <Card className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Profile Information</h2>
            <div className="text-sm text-gray-500">
              Member since {new Date(user.createdAt).toLocaleDateString()}
            </div>
          </div>

          <Form method="post" className="space-y-4">
            <input type="hidden" name="actionType" value="profile" />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField label="First Name" required error={getFieldError("firstName")}>
                <Input
                  name="firstName"
                  defaultValue={user.firstName}
                  placeholder="Enter your first name"
                  required
                  className={getFieldError("firstName") ? "border-red-500" : ""}
                />
              </FormField>

              <FormField label="Last Name" required error={getFieldError("lastName")}>
                <Input
                  name="lastName"
                  defaultValue={user.lastName}
                  placeholder="Enter your last name"
                  required
                  className={getFieldError("lastName") ? "border-red-500" : ""}
                />
              </FormField>
            </div>

            <FormField label="Email Address" required error={getFieldError("email")}>
              <Input
                name="email"
                type="email"
                defaultValue={user.email}
                placeholder="Enter your email address"
                required
                className={getFieldError("email") ? "border-red-500" : ""}
              />
            </FormField>

            <FormField label="Phone Number" error={getFieldError("phone")}>
              <Input
                name="phone"
                type="tel"
                defaultValue={user.phone}
                placeholder="Enter your phone number"
                className={getFieldError("phone") ? "border-red-500" : ""}
              />
            </FormField>

            <FormField label="Date of Birth" error={getFieldError("dateOfBirth")}>
              <Input
                name="dateOfBirth"
                type="date"
                defaultValue={user.dateOfBirth}
                className={getFieldError("dateOfBirth") ? "border-red-500" : ""}
              />
            </FormField>

            <FormField label="Bio" error={getFieldError("bio")}>
              <Textarea
                name="bio"
                placeholder="Tell us about yourself (optional)"
                rows={4}
                className={getFieldError("bio") ? "border-red-500" : ""}
              />
            </FormField>

            <div className="flex justify-end pt-4">
              <Button type="submit" className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Update Profile
              </Button>
            </div>
          </Form>
        </Card>
      )}

      {/* Change Password Tab */}
      {activeTab === "password" && (
        <Card className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold">Change Password</h2>
            <p className="mt-1 text-sm text-gray-600">
              Your password must be at least 8 characters long and contain uppercase, lowercase,
              number, and special character.
            </p>
          </div>

          <Form method="post" className="space-y-4">
            <input type="hidden" name="actionType" value="password" />

            <FormField label="Current Password" required error={getFieldError("currentPassword")}>
              <div className="relative">
                <Input
                  name="currentPassword"
                  type={showPasswords.current ? "text" : "password"}
                  placeholder="Enter your current password"
                  required
                  className={getFieldError("currentPassword") ? "border-red-500 pr-10" : "pr-10"}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("current")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-500 hover:text-gray-700"
                >
                  {showPasswords.current ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </FormField>

            <FormField label="New Password" required error={getFieldError("newPassword")}>
              <div className="relative">
                <Input
                  name="newPassword"
                  type={showPasswords.new ? "text" : "password"}
                  placeholder="Enter your new password"
                  required
                  className={getFieldError("newPassword") ? "border-red-500 pr-10" : "pr-10"}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("new")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-500 hover:text-gray-700"
                >
                  {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </FormField>

            <FormField
              label="Confirm New Password"
              required
              error={getFieldError("confirmPassword")}
            >
              <div className="relative">
                <Input
                  name="confirmPassword"
                  type={showPasswords.confirm ? "text" : "password"}
                  placeholder="Confirm your new password"
                  required
                  className={getFieldError("confirmPassword") ? "border-red-500 pr-10" : "pr-10"}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("confirm")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-500 hover:text-gray-700"
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </FormField>

            <div className="rounded-lg bg-gray-50 p-4">
              <h4 className="mb-2 text-sm font-medium">Password Requirements:</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• At least 8 characters long</li>
                <li>• Contains uppercase letter (A-Z)</li>
                <li>• Contains lowercase letter (a-z)</li>
                <li>• Contains number (0-9)</li>
                <li>• Contains special character (@$!%*?&)</li>
              </ul>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Change Password
              </Button>
            </div>
          </Form>
        </Card>
      )}
    </div>
  );
}
