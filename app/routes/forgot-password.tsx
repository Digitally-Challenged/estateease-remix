import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useNavigation } from "@remix-run/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { FormField } from "~/components/ui/forms/form-field";
import { Input } from "~/components/ui/forms/input";
import { Button } from "~/components/ui/button";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { getUser } from "~/lib/auth.server";
import { z } from "zod";
import { passwordResetRequestFormSchema, formatAuthValidationErrors } from "~/lib/validation";
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";

export const meta: MetaFunction = () => {
  return [
    { title: "Forgot Password | EstateEase" },
    { name: "description", content: "Reset your EstateEase password" },
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
    const validatedData = passwordResetRequestFormSchema.parse(submission);

    // TODO: Implement actual password reset logic
    // For now, we'll just simulate success

    // In a real implementation, you would:
    // 1. Check if user exists
    // 2. Generate a secure reset token
    // 3. Store token in database with expiration
    // 4. Send reset email

    return json({ success: true, fieldErrors: null });
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

export default function ForgotPassword() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const getFieldError = (fieldName: string) => {
    return actionData?.fieldErrors?.[fieldName]?.[0];
  };

  if (actionData?.success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">EstateEase</h1>
            <p className="mt-2 text-sm text-gray-600">Comprehensive estate planning made simple</p>
          </div>

          <Card>
            <CardHeader>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-center">Check your email</CardTitle>
              <CardDescription className="text-center">
                We've sent a password reset link to your email address.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-center">
                <p className="text-sm text-gray-600">
                  If you don't see the email in your inbox, check your spam folder.
                </p>
                <div className="space-y-2">
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/login">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to login
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" className="w-full">
                    <Link to="/contact">Need help? Contact support</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">EstateEase</h1>
          <p className="mt-2 text-sm text-gray-600">Comprehensive estate planning made simple</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Reset your password</CardTitle>
            <CardDescription>
              Enter your email address and we'll send you a link to reset your password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form method="post" className="space-y-4">
              {actionData?.error && (
                <Alert variant="destructive">
                  <AlertDescription>{actionData.error}</AlertDescription>
                </Alert>
              )}

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

              <div className="space-y-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  loading={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? "Sending reset link..." : "Send reset link"}
                </Button>

                <Button asChild variant="ghost" className="w-full">
                  <Link to="/login">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to login
                  </Link>
                </Button>
              </div>
            </Form>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
