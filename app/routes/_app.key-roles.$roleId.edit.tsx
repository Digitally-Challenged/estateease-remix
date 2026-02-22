import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useNavigate } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/forms/input";
import { Select } from "~/components/ui/forms/select";
import { Textarea } from "~/components/ui/forms/textarea";
import { FormField } from "~/components/ui/forms/form-field";
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left";
import Shield from "lucide-react/dist/esm/icons/shield";
import { getLegalRoleById } from "~/lib/dal";
import { updateLegalRole } from "~/lib/dal-crud";

const COMPENSATION_TYPE_OPTIONS = [
  { value: "none", label: "No compensation" },
  { value: "statutory", label: "Statutory fee" },
  { value: "percentage", label: "Percentage of estate" },
  { value: "hourly", label: "Hourly rate" },
  { value: "fixed", label: "Fixed amount" },
  { value: "other", label: "Other arrangement" },
];

export async function loader({ params }: LoaderFunctionArgs) {
  const { roleId } = params;
  if (!roleId) throw new Response("Not Found", { status: 404 });

  const role = getLegalRoleById(roleId);
  if (!role) throw new Response("Not Found", { status: 404 });

  return json({ role });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { roleId } = params;
  if (!roleId) throw new Response("Not Found", { status: 404 });

  const formData = await request.formData();

  try {
    updateLegalRole(roleId, {
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
    });

    return redirect("/key-roles");
  } catch (error) {
    console.error("Error updating legal role:", error);
    return json({ error: "Failed to update legal role" }, { status: 500 });
  }
}

export default function EditKeyRole() {
  const { role } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();

  const specificPowers = role.specific_powers
    ? (typeof role.specific_powers === "string"
        ? JSON.parse(role.specific_powers)
        : role.specific_powers
      ).join(", ")
    : "";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="rounded-lg p-2 transition-colors hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Role Assignment</h1>
          <p className="mt-1 text-gray-600">
            Update {role.role_type_name} assignment for {role.person_name}
          </p>
        </div>
      </div>

      {actionData?.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-red-800">{actionData.error}</p>
        </div>
      )}

      <Form method="post" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Role Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md bg-gray-50 p-3">
              <p className="text-sm text-gray-600">
                Role Type: <span className="font-medium text-gray-900">{role.role_type_name}</span>
              </p>
            </div>

            <FormField label="Person Name" required>
              <Input name="personName" defaultValue={role.person_name} required />
            </FormField>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <FormField label="Primary Role">
                <div className="flex items-center space-x-2 pt-2">
                  <input type="checkbox" name="isPrimary" id="isPrimary" value="true" defaultChecked={role.is_primary === 1} className="rounded border-gray-300" />
                  <label htmlFor="isPrimary" className="text-sm text-gray-700">Primary person</label>
                </div>
              </FormField>
              <FormField label="Order of Precedence">
                <Input name="orderOfPrecedence" type="number" min="1" max="10" defaultValue={role.order_of_precedence || 1} />
              </FormField>
              <FormField label="Start Date">
                <Input name="startDate" type="date" defaultValue={role.start_date?.split("T")[0] || ""} />
              </FormField>
            </div>

            <FormField label="Specific Powers" helperText="Comma-separated">
              <Input name="specificPowers" defaultValue={specificPowers} />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Compensation</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <FormField label="Compensation Type">
                <Select name="compensationType" defaultValue={role.compensation_type || "none"}>
                  {COMPENSATION_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Amount">
                <Input name="compensationAmount" type="number" step="0.01" min="0" defaultValue={role.compensation_amount || 0} />
              </FormField>
              <FormField label="Details">
                <Input name="compensationDetails" defaultValue={role.compensation_details || ""} />
              </FormField>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Termination & Notes</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField label="End Date">
                <Input name="endDate" type="date" defaultValue={role.end_date?.split("T")[0] || ""} />
              </FormField>
              <FormField label="End Conditions">
                <Input name="endConditions" defaultValue={role.end_conditions || ""} />
              </FormField>
            </div>
            <FormField label="Notes">
              <Textarea name="notes" defaultValue={role.notes || ""} rows={3} />
            </FormField>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit">Save Changes</Button>
        </div>
      </Form>
    </div>
  );
}
