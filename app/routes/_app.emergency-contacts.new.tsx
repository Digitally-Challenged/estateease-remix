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
import { FamilyRelationship } from "~/types/enums";

const emergencyContactSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  relationship: z.string().min(1, "Relationship is required"),
  primaryPhone: z.string().min(1, "Phone is required").max(20),
  secondaryPhone: z.string().max(20).optional().default(""),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  contactType: z.string().optional().default("emergency"),
  priority: z.coerce.number().min(1).optional().default(1),
  medicalAuthority: z.string().optional(),
  canMakeDecisions: z.string().optional(),
  notes: z.string().optional().default(""),
});

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const rawData = Object.fromEntries(formData);
  const result = emergencyContactSchema.safeParse(rawData);
  if (!result.success) {
    return json(
      { error: "Validation failed", fieldErrors: result.error.flatten().fieldErrors },
      { status: 400 },
    );
  }
  const validated = result.data;

  const data = {
    name: validated.name,
    relationship: validated.relationship,
    primaryPhone: validated.primaryPhone,
    secondaryPhone: validated.secondaryPhone || undefined,
    email: validated.email || undefined,
    contactType: validated.contactType,
    priority: validated.priority,
    medicalAuthority: validated.medicalAuthority === "true",
    canMakeDecisions: validated.canMakeDecisions === "true",
    notes: validated.notes || undefined,
  };

  try {
    const { createEmergencyContact } = await import("~/lib/dal-crud");
    const { getUserId } = await import("~/lib/auth.server");
    const userId = await getUserId(request);

    createEmergencyContact(data, userId);

    return redirect("/emergency-contacts");
  } catch (error) {
    console.error("Error creating emergency contact:", error);
    return json({ error: "Failed to create emergency contact" }, { status: 500 });
  }
}

const RELATIONSHIP_OPTIONS = Object.values(FamilyRelationship).map((value) => ({
  value,
  label: value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase()),
}));

const CONTACT_TYPE_OPTIONS = [
  { value: "emergency", label: "Emergency" },
  { value: "medical", label: "Medical" },
  { value: "legal", label: "Legal" },
  { value: "general", label: "General" },
];

export default function NewEmergencyContact() {
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    relationship: "",
    primaryPhone: "",
    secondaryPhone: "",
    email: "",
    contactType: "emergency",
    priority: 1,
    medicalAuthority: false,
    canMakeDecisions: false,
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
    navigate("/emergency-contacts");
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Add Emergency Contact
          </h1>
          <p className="mt-1 text-gray-600">Add a new emergency contact</p>
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
          <CardTitle>Contact Information</CardTitle>
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

              <FormField label="Relationship" required>
                <Select
                  name="relationship"
                  value={formData.relationship}
                  onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                  required
                >
                  <option value="">Select relationship</option>
                  {RELATIONSHIP_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </FormField>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField label="Primary Phone" required>
                <Input
                  name="primaryPhone"
                  type="tel"
                  value={formData.primaryPhone}
                  onChange={(e) => setFormData({ ...formData, primaryPhone: e.target.value })}
                  placeholder="(555) 123-4567"
                  required
                />
              </FormField>

              <FormField label="Secondary Phone">
                <Input
                  name="secondaryPhone"
                  type="tel"
                  value={formData.secondaryPhone}
                  onChange={(e) => setFormData({ ...formData, secondaryPhone: e.target.value })}
                  placeholder="(555) 987-6543"
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
                  placeholder="contact@example.com"
                />
              </FormField>

              <FormField label="Contact Type">
                <Select
                  name="contactType"
                  value={formData.contactType}
                  onChange={(e) => setFormData({ ...formData, contactType: e.target.value })}
                >
                  {CONTACT_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </FormField>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <FormField label="Priority" helperText="1 = highest priority">
                <Input
                  name="priority"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
                />
              </FormField>

              <FormField label="Medical Authority">
                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    name="medicalAuthority"
                    id="medicalAuthority"
                    checked={formData.medicalAuthority}
                    onChange={(e) =>
                      setFormData({ ...formData, medicalAuthority: e.target.checked })
                    }
                    className="rounded border-gray-300"
                  />
                  <label
                    htmlFor="medicalAuthority"
                    className="text-sm text-gray-700"
                  >
                    Can make medical decisions
                  </label>
                </div>
              </FormField>

              <FormField label="Decision Making">
                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    name="canMakeDecisions"
                    id="canMakeDecisions"
                    checked={formData.canMakeDecisions}
                    onChange={(e) =>
                      setFormData({ ...formData, canMakeDecisions: e.target.checked })
                    }
                    className="rounded border-gray-300"
                  />
                  <label
                    htmlFor="canMakeDecisions"
                    className="text-sm text-gray-700"
                  >
                    General decisions
                  </label>
                </div>
              </FormField>
            </div>

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
                Create Contact
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
