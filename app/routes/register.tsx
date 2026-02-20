import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useNavigation } from "@remix-run/react";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { FormField } from "~/components/ui/forms/form-field";
import { Input } from "~/components/ui/forms/input";
import { Button } from "~/components/ui/button";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { getUser, register, createUserSession } from "~/lib/auth.server";
import { z } from "zod";
import { registerFormSchema, formatAuthValidationErrors } from "~/lib/validation";
import Eye from "lucide-react/dist/esm/icons/eye";
import EyeOff from "lucide-react/dist/esm/icons/eye-off";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";

export const meta: MetaFunction = () => {
  return [
    { title: "Register | EstateEase" },
    { name: "description", content: "Create your EstateEase account" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUser(request);

  if (user) {
    return redirect("/dashboard");
  }

  return json({});
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const submission = Object.fromEntries(formData);

  try {
    const validatedData = registerFormSchema.parse(submission);

    const result = await register({
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      email: validatedData.email,
      password: validatedData.password,
      confirmPassword: validatedData.confirmPassword,
      acceptTerms: true, // Form validation ensures this is checked
    });

    if (!result.success) {
      return json({ error: result.error, fieldErrors: null }, { status: 400 });
    }

    return createUserSession(result.userId!, "/dashboard");
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return json({ error: null, fieldErrors: formatAuthValidationErrors(error) }, { status: 400 });
    }

    return json(
      { error: "An unexpected error occurred. Please try again.", fieldErrors: null },
      { status: 500 },
    );
  }
}

export default function Register() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const isSubmitting = navigation.state === "submitting";

  const getFieldError = (fieldName: string) => {
    return actionData?.fieldErrors?.[fieldName]?.[0];
  };

  const passwordRequirements = [
    { text: "At least 8 characters", pattern: /.{8,}/ },
    { text: "One uppercase letter", pattern: /[A-Z]/ },
    { text: "One lowercase letter", pattern: /[a-z]/ },
    { text: "One number", pattern: /\d/ },
    { text: "One special character", pattern: /[@$!%*?&]/ },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">EstateEase</h1>
          <p className="mt-2 text-sm text-gray-600">Comprehensive estate planning made simple</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create your account</CardTitle>
            <CardDescription>
              Get started with your comprehensive estate planning journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form method="post" className="space-y-4">
              {actionData?.error && (
                <Alert variant="destructive">
                  <AlertDescription>{actionData.error}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-4">
                <FormField label="First name" required error={getFieldError("firstName")}>
                  <Input
                    type="text"
                    name="firstName"
                    required
                    autoComplete="given-name"
                    placeholder="First name"
                    className={getFieldError("firstName") ? "border-red-500" : ""}
                  />
                </FormField>

                <FormField label="Last name" required error={getFieldError("lastName")}>
                  <Input
                    type="text"
                    name="lastName"
                    required
                    autoComplete="family-name"
                    placeholder="Last name"
                    className={getFieldError("lastName") ? "border-red-500" : ""}
                  />
                </FormField>
              </div>

              <FormField label="Email address" required error={getFieldError("email")}>
                <Input
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  placeholder="Enter your email"
                  className={getFieldError("email") ? "border-red-500" : ""}
                />
              </FormField>

              <FormField label="Password" required error={getFieldError("password")}>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    autoComplete="new-password"
                    placeholder="Create a password"
                    className={getFieldError("password") ? "border-red-500" : ""}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                {/* Password requirements */}
                <div className="mt-2 space-y-1">
                  {passwordRequirements.map((req, index) => (
                    <div key={index} className="flex items-center text-xs text-gray-600">
                      <CheckCircle className="mr-1 h-3 w-3 text-green-500" />
                      {req.text}
                    </div>
                  ))}
                </div>
              </FormField>

              <FormField label="Confirm password" required error={getFieldError("confirmPassword")}>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    required
                    autoComplete="new-password"
                    placeholder="Confirm your password"
                    className={getFieldError("confirmPassword") ? "border-red-500" : ""}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </FormField>

              <div className="flex items-start">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  required
                  className="mt-1 rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <label className="ml-2 text-sm text-gray-600">
                  I agree to the{" "}
                  <Link to="/terms" className="text-blue-600 hover:text-blue-500">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="text-blue-600 hover:text-blue-500">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                loading={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? "Creating account..." : "Create account"}
              </Button>
            </Form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            By creating an account, you agree to our{" "}
            <Link to="/terms" className="text-blue-600 hover:text-blue-500">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="text-blue-600 hover:text-blue-500">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
