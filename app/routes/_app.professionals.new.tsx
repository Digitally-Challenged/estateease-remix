import { json, redirect, type ActionFunctionArgs } from "@remix-run/node";
import { useActionData, useNavigate } from "@remix-run/react";
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

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const data = {
    name: formData.get("name") as string,
    type: formData.get("type") as string,
    firm: (formData.get("firm") as string) || undefined,
    title: (formData.get("title") as string) || undefined,
    email: (formData.get("email") as string) || undefined,
    primaryPhone: (formData.get("primaryPhone") as string) || undefined,
    secondaryPhone: (formData.get("secondaryPhone") as string) || undefined,
    address: {
      street1: (formData.get("street1") as string) || undefined,
      city: (formData.get("city") as string) || undefined,
      state: (formData.get("state") as string) || undefined,
      zipCode: (formData.get("zipCode") as string) || undefined,
    },
    specializations: ((formData.get("specializations") as string) || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    notes: (formData.get("notes") as string) || undefined,
  };

  // Basic validation
  if (!data.name || !data.type) {
    return json({ error: "Name and professional type are required" }, { status: 400 });
  }

  try {
    // TODO: Implement professional creation in DAL
    // const professionalId = await createProfessional(data);

    return redirect("/family");
  } catch (error) {
    console.error("Error creating professional:", error);
    return json({ error: "Failed to create professional" }, { status: 500 });
  }
}

const PROFESSIONAL_TYPE_OPTIONS = [
  { value: "ATTORNEY", label: "Attorney" },
  { value: "FINANCIAL_ADVISOR", label: "Financial Advisor" },
  { value: "ACCOUNTANT", label: "Accountant/CPA" },
  { value: "INSURANCE_AGENT", label: "Insurance Agent" },
  { value: "REAL_ESTATE_AGENT", label: "Real Estate Agent" },
  { value: "BANKER", label: "Banker" },
  { value: "TRUSTEE", label: "Trustee" },
  { value: "APPRAISER", label: "Appraiser" },
  { value: "OTHER", label: "Other" },
];

const US_STATES = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
];

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
    navigate("/family");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Add Professional</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Add a new professional to your team
          </p>
        </div>
        <Button variant="outline" onClick={handleCancel}>
          <X className="mr-2 h-4 w-4" />
          Cancel
        </Button>
      </div>

      {actionData?.error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-700 dark:bg-red-900/20">
          <p className="text-red-600 dark:text-red-400">{actionData.error}</p>
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
                >
                  <option value="">Select type</option>
                  {PROFESSIONAL_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </FormField>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField label="Firm/Company" icon={<Briefcase className="h-4 w-4" />}>
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
              <FormField label="Email" icon={<Mail className="h-4 w-4" />}>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="professional@example.com"
                />
              </FormField>

              <FormField label="Primary Phone" icon={<Phone className="h-4 w-4" />}>
                <Input
                  name="primaryPhone"
                  type="tel"
                  value={formData.primaryPhone}
                  onChange={(e) => setFormData({ ...formData, primaryPhone: e.target.value })}
                  placeholder="(555) 123-4567"
                />
              </FormField>
            </div>

            <FormField label="Secondary Phone" icon={<Phone className="h-4 w-4" />}>
              <Input
                name="secondaryPhone"
                type="tel"
                value={formData.secondaryPhone}
                onChange={(e) => setFormData({ ...formData, secondaryPhone: e.target.value })}
                placeholder="(555) 987-6543"
              />
            </FormField>

            <div className="space-y-4">
              <h3 className="flex items-center text-lg font-medium text-gray-900 dark:text-gray-100">
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
                  >
                    <option value="">Select state</option>
                    {US_STATES.map((state) => (
                      <option key={state.value} value={state.value}>
                        {state.label}
                      </option>
                    ))}
                  </Select>
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

            <FormField label="Specializations" description="Comma-separated list of specialties">
              <Input
                name="specializations"
                value={formData.specializations}
                onChange={(e) => setFormData({ ...formData, specializations: e.target.value })}
                placeholder="Estate Planning, Tax Law, Investment Management"
              />
            </FormField>

            <FormField label="Notes" description="Additional information">
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
