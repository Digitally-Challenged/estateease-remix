import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useNavigate } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/forms/input";
import { FormField } from "~/components/ui/forms/form-field";
import { Select } from "~/components/ui/forms/select";
import { Textarea } from "~/components/ui/forms/textarea";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { createWill } from "~/lib/dal";
import { requireUser } from "~/lib/auth.server";
import { US_STATES } from "~/types/enums";
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left";
import Plus from "lucide-react/dist/esm/icons/plus";
import Trash2 from "lucide-react/dist/esm/icons/trash-2";
import { useState } from "react";
import { z } from "zod";
import { willFormSchema, formatWillValidationErrors } from "~/lib/validation";

interface ActionData {
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireUser(request);
  const formData = await request.formData();

  try {
    // Parse form data
    const rawData = {
      documentName: formData.get("documentName"),
      testatorName: formData.get("testatorName"),
      dateCreated: new Date().toISOString().split("T")[0],
      dateSigned: formData.get("dateSigned"),
      status: formData.get("status") || "DRAFT",
      executorPrimary: formData.get("executorPrimary"),
      executorSecondary: formData.get("executorSecondary"),
      witness1Name: formData.get("witness1Name"),
      witness2Name: formData.get("witness2Name"),
      notaryName: formData.get("notaryName"),
      notaryState: formData.get("notaryState"),
      specificBequests: formData.get("specificBequests"),
      residuaryClause: formData.get("residuaryClause"),
      guardianNominations: formData.get("guardianNominations"),
      funeralWishes: formData.get("funeralWishes"),
      otherProvisions: formData.get("otherProvisions"),
      revokesPrior: true,
      codicilCount: 0,
      attorneyName: formData.get("attorneyName"),
      lawFirm: formData.get("lawFirm"),
      notes: formData.get("notes"),
    };

    // Validate the form data
    const validatedData = willFormSchema.parse(rawData);

    // Create the will with validated data
    await createWill({
      ...validatedData,
      userId: user.id,
      dateCreated: validatedData.dateCreated,
      dateSigned: validatedData.dateSigned || null,
      executorPrimary: validatedData.executorPrimary,
      executorSecondary: validatedData.executorSecondary || null,
      witness1Name: validatedData.witness1Name,
      witness2Name: validatedData.witness2Name,
      notaryName: validatedData.notaryName || null,
      notaryState: validatedData.notaryState || null,
      specificBequests: validatedData.specificBequests || null,
      residuaryClause: validatedData.residuaryClause || null,
      guardianNominations: validatedData.guardianNominations || null,
      funeralWishes: validatedData.funeralWishes || null,
      otherProvisions: validatedData.otherProvisions || null,
      revokesPrior: validatedData.revokesPrior,
      codicilCount: validatedData.codicilCount,
      attorneyName: validatedData.attorneyName || null,
      lawFirm: validatedData.lawFirm || null,
      notes: validatedData.notes || null,
    });

    return redirect("/wills");
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return json(
        {
          error: "Please correct the validation errors below.",
          fieldErrors: formatWillValidationErrors(error),
        },
        { status: 400 },
      );
    }

    console.error("Error creating will:", error);
    return json(
      {
        error: "Failed to create will. Please try again.",
        fieldErrors: {},
      },
      { status: 500 },
    );
  }
}

export default function NewWill() {
  const actionData = useActionData<ActionData>();
  const navigate = useNavigate();
  const [bequests, setBequests] = useState<string[]>([""]);

  const getFieldError = (fieldName: string) => {
    return actionData?.fieldErrors?.[fieldName]?.[0];
  };

  const addBequest = () => {
    setBequests([...bequests, ""]);
  };

  const removeBequest = (index: number) => {
    setBequests(bequests.filter((_, i) => i !== index));
  };

  const updateBequest = (index: number, value: string) => {
    const updated = [...bequests];
    updated[index] = value;
    setBequests(updated);
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
          <h1 className="text-3xl font-bold text-gray-900">Create New Will</h1>
          <p className="mt-1 text-gray-600">
            Draft your last will and testament
          </p>
        </div>
      </div>

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

      <Form method="post" className="space-y-6">
        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold">Basic Information</h2>
          <div className="grid gap-4">
            <FormField label="Document Name" required error={getFieldError("documentName")}>
              <Input
                name="documentName"
                placeholder="e.g., Last Will and Testament of John Doe"
                required
                className={getFieldError("documentName") ? "border-red-500" : ""}
              />
            </FormField>

            <FormField label="Testator Name" required error={getFieldError("testatorName")}>
              <Input
                name="testatorName"
                placeholder="Full legal name"
                required
                className={getFieldError("testatorName") ? "border-red-500" : ""}
              />
            </FormField>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField label="Date Signed">
                <Input name="dateSigned" type="date" />
              </FormField>

              <FormField label="Status">
                <Select
                  name="status"
                  defaultValue="DRAFT"
                  options={[
                    { value: "DRAFT", label: "Draft" },
                    { value: "SIGNED", label: "Signed" },
                    { value: "EXECUTED", label: "Executed" },
                    { value: "REVOKED", label: "Revoked" },
                  ]}
                />
              </FormField>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold">Executors</h2>
          <div className="grid gap-4">
            <FormField label="Primary Executor" required error={getFieldError("executorPrimary")}>
              <Input
                name="executorPrimary"
                placeholder="Name of primary executor"
                required
                className={getFieldError("executorPrimary") ? "border-red-500" : ""}
              />
            </FormField>

            <FormField label="Secondary Executor" error={getFieldError("executorSecondary")}>
              <Input
                name="executorSecondary"
                placeholder="Name of backup executor (optional)"
                className={getFieldError("executorSecondary") ? "border-red-500" : ""}
              />
            </FormField>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold">Witnesses & Notary</h2>
          <div className="grid gap-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField label="Witness 1">
                <Input name="witness1Name" placeholder="First witness name" />
              </FormField>

              <FormField label="Witness 2">
                <Input name="witness2Name" placeholder="Second witness name" />
              </FormField>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField label="Notary Name">
                <Input name="notaryName" placeholder="Notary public name" />
              </FormField>

              <FormField label="Notary State">
                <Select
                  name="notaryState"
                  options={[{ value: "", label: "Select state" }, ...US_STATES]}
                />
              </FormField>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold">Distribution & Provisions</h2>
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <FormField label="Specific Bequests" className="mb-0">
                  <span className="text-sm text-gray-500">
                    List specific items or amounts to beneficiaries
                  </span>
                </FormField>
                <Button type="button" variant="outline" size="sm" onClick={addBequest}>
                  <Plus className="mr-1 h-4 w-4" />
                  Add Bequest
                </Button>
              </div>
              <div className="space-y-2">
                {bequests.map((bequest, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={bequest}
                      onChange={(e) => updateBequest(index, e.target.value)}
                      placeholder={`Bequest ${index + 1}: e.g., "$10,000 to John Doe"`}
                    />
                    {bequests.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeBequest(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <input
                type="hidden"
                name="specificBequests"
                value={JSON.stringify(bequests.filter((b) => b))}
              />
            </div>

            <FormField label="Residuary Clause">
              <Textarea
                name="residuaryClause"
                placeholder="Describe how remaining assets should be distributed"
                rows={3}
              />
            </FormField>

            <FormField label="Guardian Nominations">
              <Textarea
                name="guardianNominations"
                placeholder="Nominate guardians for minor children"
                rows={2}
              />
            </FormField>

            <FormField label="Funeral Wishes">
              <Textarea
                name="funeralWishes"
                placeholder="Specify any funeral or memorial preferences"
                rows={2}
              />
            </FormField>

            <FormField label="Other Provisions">
              <Textarea
                name="otherProvisions"
                placeholder="Any additional provisions or instructions"
                rows={3}
              />
            </FormField>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold">Legal Information</h2>
          <div className="grid gap-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField label="Attorney Name">
                <Input name="attorneyName" placeholder="Drafting attorney name" />
              </FormField>

              <FormField label="Law Firm">
                <Input name="lawFirm" placeholder="Law firm name" />
              </FormField>
            </div>

            <FormField label="Notes">
              <Textarea
                name="notes"
                placeholder="Any additional notes or special instructions"
                rows={3}
              />
            </FormField>
          </div>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit">Create Will</Button>
        </div>
      </Form>
    </div>
  );
}

export { RouteErrorBoundary as ErrorBoundary } from "~/components/ui/error/route-error-boundary";
