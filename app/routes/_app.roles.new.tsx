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
import Shield from "lucide-react/dist/esm/icons/shield";
import User from "lucide-react/dist/esm/icons/user";
import DollarSign from "lucide-react/dist/esm/icons/dollar-sign";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const data = {
    roleType: formData.get("roleType") as string,
    personName: formData.get("personName") as string,
    isPrimary: formData.get("isPrimary") === "true",
    orderOfPrecedence: Number(formData.get("orderOfPrecedence")) || 1,
    specificPowers: ((formData.get("specificPowers") as string) || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    compensationType: (formData.get("compensationType") as string) || undefined,
    compensationAmount: Number(formData.get("compensationAmount")) || undefined,
    compensationDetails: (formData.get("compensationDetails") as string) || undefined,
    startDate: (formData.get("startDate") as string) || undefined,
    endDate: (formData.get("endDate") as string) || undefined,
    endConditions: (formData.get("endConditions") as string) || undefined,
    notes: (formData.get("notes") as string) || undefined,
  };

  // Basic validation
  if (!data.roleType || !data.personName) {
    return json({ error: "Role type and person name are required" }, { status: 400 });
  }

  try {
    // TODO: Implement legal role creation in DAL
    // const roleId = await createLegalRole(data);

    return redirect("/family");
  } catch (error) {
    console.error("Error creating legal role:", error);
    return json({ error: "Failed to create legal role" }, { status: 500 });
  }
}

const ROLE_TYPE_OPTIONS = [
  { value: "EXECUTOR", label: "Executor" },
  { value: "TRUSTEE", label: "Trustee" },
  { value: "GUARDIAN", label: "Guardian" },
  { value: "CONSERVATOR", label: "Conservator" },
  { value: "POWER_OF_ATTORNEY", label: "Power of Attorney" },
  { value: "HEALTHCARE_PROXY", label: "Healthcare Proxy" },
  { value: "SUCCESSOR_TRUSTEE", label: "Successor Trustee" },
  { value: "BENEFICIARY", label: "Beneficiary" },
  { value: "OTHER", label: "Other" },
];

const COMPENSATION_TYPE_OPTIONS = [
  { value: "none", label: "No compensation" },
  { value: "statutory", label: "Statutory fee" },
  { value: "percentage", label: "Percentage of estate" },
  { value: "hourly", label: "Hourly rate" },
  { value: "fixed", label: "Fixed amount" },
  { value: "other", label: "Other arrangement" },
];

export default function NewRole() {
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    roleType: "",
    personName: "",
    isPrimary: true,
    orderOfPrecedence: 1,
    specificPowers: "",
    compensationType: "none",
    compensationAmount: 0,
    compensationDetails: "",
    startDate: "",
    endDate: "",
    endConditions: "",
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Add Role Assignment
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Assign a legal or fiduciary role to a person
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
            <Shield className="mr-2 h-5 w-5" />
            Role Assignment Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} method="post" className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField label="Role Type" required>
                <Select
                  name="roleType"
                  value={formData.roleType}
                  onChange={(e) => setFormData({ ...formData, roleType: e.target.value })}
                  required
                >
                  <option value="">Select role type</option>
                  {ROLE_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField label="Person Name" required>
                <Input
                  name="personName"
                  value={formData.personName}
                  onChange={(e) => setFormData({ ...formData, personName: e.target.value })}
                  placeholder="Enter person's full name"
                  required
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <FormField label="Primary Role">
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
                    Primary person in this role
                  </label>
                </div>
              </FormField>

              <FormField label="Order of Precedence" helperText="1 = highest priority">
                <Input
                  name="orderOfPrecedence"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.orderOfPrecedence}
                  onChange={(e) =>
                    setFormData({ ...formData, orderOfPrecedence: Number(e.target.value) })
                  }
                />
              </FormField>

              <FormField label="Start Date">
                <Input
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </FormField>
            </div>

            <FormField
              label="Specific Powers"
              helperText="Comma-separated list of specific powers or responsibilities"
            >
              <Input
                name="specificPowers"
                value={formData.specificPowers}
                onChange={(e) => setFormData({ ...formData, specificPowers: e.target.value })}
                placeholder="Manage investments, Sell real estate, Make healthcare decisions"
              />
            </FormField>

            <div className="space-y-4">
              <h3 className="flex items-center text-lg font-medium text-gray-900 dark:text-gray-100">
                <DollarSign className="mr-2 h-5 w-5" />
                Compensation
              </h3>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <FormField label="Compensation Type">
                  <Select
                    name="compensationType"
                    value={formData.compensationType}
                    onChange={(e) => setFormData({ ...formData, compensationType: e.target.value })}
                  >
                    {COMPENSATION_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </FormField>

                {formData.compensationType !== "none" &&
                  formData.compensationType !== "statutory" && (
                    <FormField label="Amount">
                      <Input
                        name="compensationAmount"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.compensationAmount}
                        onChange={(e) =>
                          setFormData({ ...formData, compensationAmount: Number(e.target.value) })
                        }
                        placeholder="0.00"
                      />
                    </FormField>
                  )}

                <FormField label="Additional Details">
                  <Input
                    name="compensationDetails"
                    value={formData.compensationDetails}
                    onChange={(e) =>
                      setFormData({ ...formData, compensationDetails: e.target.value })
                    }
                    placeholder="Additional compensation details"
                  />
                </FormField>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField label="End Date">
                <Input
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </FormField>

              <FormField label="End Conditions" helperText="Conditions that terminate this role">
                <Input
                  name="endConditions"
                  value={formData.endConditions}
                  onChange={(e) => setFormData({ ...formData, endConditions: e.target.value })}
                  placeholder="Upon death, incapacity, resignation, etc."
                />
              </FormField>
            </div>

            <FormField
              label="Notes"
              helperText="Additional information about this role assignment"
            >
              <Textarea
                name="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Enter any additional notes about this role assignment..."
                rows={3}
              />
            </FormField>

            <div className="rounded-md border border-amber-200 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-900/20">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    Legal Reminder
                  </h3>
                  <div className="mt-2 text-sm text-amber-700 dark:text-amber-300">
                    <p>
                      Role assignments should be properly documented in legal instruments such as
                      wills, trusts, or powers of attorney. Consult with an attorney to ensure
                      proper legal authority.
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
                Create Role Assignment
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
