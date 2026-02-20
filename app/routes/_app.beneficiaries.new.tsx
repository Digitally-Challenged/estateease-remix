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
import { FamilyRelationship } from "~/types/enums";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const data = {
    name: formData.get("name") as string,
    relationship: formData.get("relationship") as string,
    percentage: Number(formData.get("percentage")),
    isPrimary: formData.get("isPrimary") === "true",
    isContingent: formData.get("isContingent") === "true",
    notes: (formData.get("notes") as string) || undefined,
  };

  // Basic validation
  if (!data.name || !data.relationship) {
    return json({ error: "Name and relationship are required" }, { status: 400 });
  }

  if (data.percentage < 0 || data.percentage > 100) {
    return json({ error: "Percentage must be between 0 and 100" }, { status: 400 });
  }

  try {
    // TODO: Implement beneficiary creation in DAL
    // const beneficiaryId = await createBeneficiary(data);

    return redirect("/beneficiaries");
  } catch (error) {
    console.error("Error creating beneficiary:", error);
    return json({ error: "Failed to create beneficiary" }, { status: 500 });
  }
}

const RELATIONSHIP_OPTIONS = Object.values(FamilyRelationship).map((value) => ({
  value,
  label: value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase()),
}));

export default function NewBeneficiary() {
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    relationship: "",
    percentage: 0,
    isPrimary: true,
    isContingent: false,
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
    navigate("/beneficiaries");
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add Beneficiary</h1>
          <p className="mt-1 text-gray-600">
            Add a new beneficiary to your estate plan
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
          <CardTitle>Beneficiary Information</CardTitle>
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

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <FormField label="Percentage" helperText="Percentage of estate (0-100)">
                <Input
                  name="percentage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.percentage}
                  onChange={(e) => setFormData({ ...formData, percentage: Number(e.target.value) })}
                  placeholder="0.0"
                />
              </FormField>

              <FormField label="Primary Beneficiary">
                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    name="isPrimary"
                    id="isPrimary"
                    checked={formData.isPrimary}
                    onChange={(e) => setFormData({ ...formData, isPrimary: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor="isPrimary" className="text-sm text-gray-700">
                    Primary beneficiary
                  </label>
                </div>
              </FormField>

              <FormField label="Contingent Beneficiary">
                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    name="isContingent"
                    id="isContingent"
                    checked={formData.isContingent}
                    onChange={(e) => setFormData({ ...formData, isContingent: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <label
                    htmlFor="isContingent"
                    className="text-sm text-gray-700"
                  >
                    Contingent beneficiary
                  </label>
                </div>
              </FormField>
            </div>

            <FormField label="Notes" helperText="Additional notes or conditions">
              <Textarea
                name="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Enter any additional notes or conditions..."
                rows={3}
              />
            </FormField>

            <div className="flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                Create Beneficiary
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
