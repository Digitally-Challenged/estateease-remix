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
import Heart from "lucide-react/dist/esm/icons/heart";
import User from "lucide-react/dist/esm/icons/user";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const data = {
    directiveType: formData.get("directiveType") as string,
    personName: (formData.get("personName") as string) || undefined,
    isPrimary: formData.get("isPrimary") === "true",
    lifeSustainingDecision: (formData.get("lifeSustainingDecision") as string) || undefined,
    artificialNutritionDecision:
      (formData.get("artificialNutritionDecision") as string) || undefined,
    painManagementInstructions: (formData.get("painManagementInstructions") as string) || undefined,
    organDonation: formData.get("organDonation") === "true",
    bodyDisposition: (formData.get("bodyDisposition") as string) || undefined,
    religiousPreferences: (formData.get("religiousPreferences") as string) || undefined,
    additionalInstructions: (formData.get("additionalInstructions") as string) || undefined,
  };

  // Basic validation
  if (!data.directiveType) {
    return json({ error: "Directive type is required" }, { status: 400 });
  }

  try {
    // TODO: Implement healthcare directive creation in DAL
    // const directiveId = await createHealthcareDirective(data);
    console.log("Creating healthcare directive:", data);

    return redirect("/family");
  } catch (error) {
    console.error("Error creating healthcare directive:", error);
    return json({ error: "Failed to create healthcare directive" }, { status: 500 });
  }
}

const DIRECTIVE_TYPE_OPTIONS = [
  { value: "ADVANCE_DIRECTIVE", label: "Advance Directive" },
  { value: "LIVING_WILL", label: "Living Will" },
  { value: "HEALTHCARE_PROXY", label: "Healthcare Proxy" },
  { value: "DNR", label: "Do Not Resuscitate (DNR)" },
  { value: "POLST", label: "POLST" },
];

const LIFE_SUSTAINING_OPTIONS = [
  { value: "continue", label: "Continue all life-sustaining treatments" },
  { value: "limited", label: "Limited life-sustaining treatments" },
  { value: "comfort", label: "Comfort care only" },
  { value: "discontinue", label: "Discontinue life-sustaining treatments" },
];

const NUTRITION_OPTIONS = [
  { value: "continue", label: "Continue artificial nutrition and hydration" },
  { value: "trial", label: "Trial period of artificial nutrition" },
  { value: "discontinue", label: "Do not provide artificial nutrition" },
];

const DISPOSITION_OPTIONS = [
  { value: "burial", label: "Burial" },
  { value: "cremation", label: "Cremation" },
  { value: "donation", label: "Body donation" },
  { value: "other", label: "Other" },
];

export default function NewHealthcareDirective() {
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    directiveType: "",
    personName: "",
    isPrimary: true,
    lifeSustainingDecision: "",
    artificialNutritionDecision: "",
    painManagementInstructions: "",
    organDonation: false,
    bodyDisposition: "",
    religiousPreferences: "",
    additionalInstructions: "",
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Add Healthcare Directive
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Create a new healthcare directive or advance directive
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
          <CardTitle className="flex items-center">
            <Heart className="mr-2 h-5 w-5" />
            Healthcare Directive Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} method="post" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField label="Directive Type" required>
                <Select
                  name="directiveType"
                  value={formData.directiveType}
                  onChange={(e) => setFormData({ ...formData, directiveType: e.target.value })}
                  required
                >
                  <option value="">Select directive type</option>
                  {DIRECTIVE_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField label="Healthcare Agent/Proxy" icon={<User className="h-4 w-4" />}>
                <Input
                  name="personName"
                  value={formData.personName}
                  onChange={(e) => setFormData({ ...formData, personName: e.target.value })}
                  placeholder="Name of healthcare agent"
                />
              </FormField>
            </div>

            <FormField label="Primary Agent">
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  name="isPrimary"
                  id="isPrimary"
                  checked={formData.isPrimary}
                  onChange={(e) => setFormData({ ...formData, isPrimary: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <label htmlFor="isPrimary" className="text-sm text-gray-700 dark:text-gray-300">
                  This is the primary healthcare agent
                </label>
              </div>
            </FormField>

            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Medical Treatment Preferences
              </h3>

              <FormField label="Life-Sustaining Treatment">
                <Select
                  name="lifeSustainingDecision"
                  value={formData.lifeSustainingDecision}
                  onChange={(e) =>
                    setFormData({ ...formData, lifeSustainingDecision: e.target.value })
                  }
                >
                  <option value="">Select preference</option>
                  {LIFE_SUSTAINING_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField label="Artificial Nutrition and Hydration">
                <Select
                  name="artificialNutritionDecision"
                  value={formData.artificialNutritionDecision}
                  onChange={(e) =>
                    setFormData({ ...formData, artificialNutritionDecision: e.target.value })
                  }
                >
                  <option value="">Select preference</option>
                  {NUTRITION_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField label="Pain Management Instructions">
                <Textarea
                  name="painManagementInstructions"
                  value={formData.painManagementInstructions}
                  onChange={(e) =>
                    setFormData({ ...formData, painManagementInstructions: e.target.value })
                  }
                  placeholder="Specific instructions for pain management and comfort care..."
                  rows={3}
                />
              </FormField>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                End-of-Life Preferences
              </h3>

              <FormField label="Organ Donation">
                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    name="organDonation"
                    id="organDonation"
                    checked={formData.organDonation}
                    onChange={(e) => setFormData({ ...formData, organDonation: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <label
                    htmlFor="organDonation"
                    className="text-sm text-gray-700 dark:text-gray-300"
                  >
                    I consent to organ and tissue donation
                  </label>
                </div>
              </FormField>

              <FormField label="Body Disposition">
                <Select
                  name="bodyDisposition"
                  value={formData.bodyDisposition}
                  onChange={(e) => setFormData({ ...formData, bodyDisposition: e.target.value })}
                >
                  <option value="">Select preference</option>
                  {DISPOSITION_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField label="Religious/Spiritual Preferences">
                <Textarea
                  name="religiousPreferences"
                  value={formData.religiousPreferences}
                  onChange={(e) =>
                    setFormData({ ...formData, religiousPreferences: e.target.value })
                  }
                  placeholder="Any religious or spiritual considerations for medical care..."
                  rows={2}
                />
              </FormField>
            </div>

            <FormField label="Additional Instructions">
              <Textarea
                name="additionalInstructions"
                value={formData.additionalInstructions}
                onChange={(e) =>
                  setFormData({ ...formData, additionalInstructions: e.target.value })
                }
                placeholder="Any additional healthcare instructions or preferences..."
                rows={4}
              />
            </FormField>

            <div className="rounded-md border border-blue-200 bg-blue-50 p-4 dark:border-blue-700 dark:bg-blue-900/20">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Important Note
                  </h3>
                  <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                    <p>
                      Healthcare directives should be reviewed by an attorney and properly executed
                      according to your state's laws. This form helps organize your preferences but
                      may need additional legal documentation.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                Create Directive
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
