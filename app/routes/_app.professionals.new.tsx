import { json, redirect, type ActionFunctionArgs } from "@remix-run/node";
import { useActionData, useNavigate } from "@remix-run/react";
import { z } from "zod";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/forms/input";
import { Select } from "~/components/ui/forms/select";
import { Textarea } from "~/components/ui/forms/textarea";
import { FormField } from "~/components/ui/forms/form-field";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import X from "lucide-react/dist/esm/icons/x";
import Save from "lucide-react/dist/esm/icons/save";
import Phone from "lucide-react/dist/esm/icons/phone";
import Mail from "lucide-react/dist/esm/icons/mail";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import Briefcase from "lucide-react/dist/esm/icons/briefcase";
import { US_STATES, PROFESSIONAL_TYPE_OPTIONS } from "~/types/enums";

const professionalSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  type: z.string().min(1, "Type is required"),
  firm: z.string().optional().default(""),
  title: z.string().optional().default(""),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  primaryPhone: z.string().max(20).optional().default(""),
  secondaryPhone: z.string().max(20).optional().default(""),
  street1: z.string().optional().default(""),
  city: z.string().optional().default(""),
  state: z.string().optional().default(""),
  zipCode: z.string().optional().default(""),
  specializations: z.string().optional().default(""),
  notes: z.string().optional().default(""),
});

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const rawData = Object.fromEntries(formData);
  const result = professionalSchema.safeParse(rawData);
  if (!result.success) {
    return json(
      { error: "Validation failed", fieldErrors: result.error.flatten().fieldErrors },
      { status: 400 },
    );
  }
  const validated = result.data;

  const data = {
    name: validated.name,
    type: validated.type,
    firm: validated.firm || undefined,
    title: validated.title || undefined,
    email: validated.email || undefined,
    primaryPhone: validated.primaryPhone || undefined,
    secondaryPhone: validated.secondaryPhone || undefined,
    address: {
      street1: validated.street1 || undefined,
      city: validated.city || undefined,
      state: validated.state || undefined,
      zipCode: validated.zipCode || undefined,
    },
    specializations: (validated.specializations || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    notes: validated.notes || undefined,
  };

  try {
    const { createProfessional } = await import("~/lib/dal-crud");

    await createProfessional(
      {
        name: validated.name,
        type: validated.type,
        firm: validated.firm || undefined,
        title: validated.title || undefined,
        specializations: data.specializations,
        contactInfo: {
          email: validated.email || undefined,
          primaryPhone: validated.primaryPhone || undefined,
          secondaryPhone: validated.secondaryPhone || undefined,
          address: {
            street1: validated.street1 || undefined,
            city: validated.city || undefined,
            state: validated.state || undefined,
            zipCode: validated.zipCode || undefined,
          },
        },
        notes: validated.notes || undefined,
      } as Parameters<typeof createProfessional>[0],
      request,
    );

    return redirect("/professionals");
  } catch (error) {
    console.error("Error creating professional:", error);
    return json({ error: "Failed to create professional" }, { status: 500 });
  }
}

export default function NewProfessional() {
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    firm: "",
    title: "",
    email: "",
    primaryPhone: "",
    secondaryPhone: "",
    street1: "",
    city: "",
    state: "",
    zipCode: "",
    specializations: "",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    // Submit the form
    form.submit();
  };

  const handleCancel = () => {
    navigate("/professionals");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add Professional</h1>
          <p className="mt-1 text-gray-600">
            Add a new professional to your team
          </p>
        </div>
        <Button variant="outline" onClick={handleCancel}>
          <X className="mr-2 h-4 w-4" />
          Cancel
        </Button>
      </div>

      {actionData?.error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4">
          <p className="text-red-600">{actionData.error}</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Professional Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} method="post" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField label="Full Name" required>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter full name"
                  required
                />
              </FormField>

              <FormField label="Professional Type" required>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  required
                  placeholder="Select type"
                  options={[...PROFESSIONAL_TYPE_OPTIONS]}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField label="Firm/Company">
                <Input
                  name="firm"
                  value={formData.firm}
                  onChange={(e) => setFormData({ ...formData, firm: e.target.value })}
                  placeholder="Law Firm, Financial Services, etc."
                />
              </FormField>

              <FormField label="Title/Position">
                <Input
                  name="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Partner, Senior Advisor, etc."
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField label="Email">
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="professional@example.com"
                />
              </FormField>

              <FormField label="Primary Phone">
                <Input
                  name="primaryPhone"
                  type="tel"
                  value={formData.primaryPhone}
                  onChange={(e) => setFormData({ ...formData, primaryPhone: e.target.value })}
                  placeholder="(555) 123-4567"
                />
              </FormField>
            </div>

            <FormField label="Secondary Phone">
              <Input
                name="secondaryPhone"
                type="tel"
                value={formData.secondaryPhone}
                onChange={(e) => setFormData({ ...formData, secondaryPhone: e.target.value })}
                placeholder="(555) 987-6543"
              />
            </FormField>

            <div className="space-y-4">
              <h3 className="flex items-center text-lg font-medium text-gray-900">
                <MapPin className="mr-2 h-5 w-5" />
                Address
              </h3>

              <FormField label="Street Address">
                <Input
                  name="street1"
                  value={formData.street1}
                  onChange={(e) => setFormData({ ...formData, street1: e.target.value })}
                  placeholder="123 Main Street"
                />
              </FormField>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <FormField label="City">
                  <Input
                    name="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="City"
                  />
                </FormField>

                <FormField label="State">
                  <Select
                    name="state"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="Select state"
                    options={[...US_STATES]}
                  />
                </FormField>

                <FormField label="ZIP Code">
                  <Input
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    placeholder="12345"
                  />
                </FormField>
              </div>
            </div>

            <FormField label="Specializations" helperText="Comma-separated list of specialties">
              <Input
                name="specializations"
                value={formData.specializations}
                onChange={(e) => setFormData({ ...formData, specializations: e.target.value })}
                placeholder="Estate Planning, Tax Law, Investment Management"
              />
            </FormField>

            <FormField label="Notes" helperText="Additional information">
              <Textarea
                name="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Enter any additional notes..."
                rows={3}
              />
            </FormField>

            <div className="flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                Create Professional
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export { RouteErrorBoundary as ErrorBoundary } from "~/components/ui/error/route-error-boundary";
