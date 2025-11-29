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
import { createPowerOfAttorney } from "~/lib/dal";
import { requireUser } from "~/lib/auth.server";
import { US_STATES } from "~/types/enums";
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left";
import Plus from "lucide-react/dist/esm/icons/plus";
import { useState } from "react";
import { powerOfAttorneyFormSchema, formatPowerOfAttorneyValidationErrors } from "~/lib/validation";

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
      type: formData.get("type"),
      principalName: formData.get("principalName"),
      agentPrimary: formData.get("agentPrimary"),
      agentSecondary: formData.get("agentSecondary"),
      effectiveDate: formData.get("effectiveDate"),
      terminationDate: formData.get("terminationDate"),
      durable: formData.get("durable") === "true",
      springCondition: formData.get("springCondition"),
      powersGranted: formData.get("powersGranted"),
      limitations: formData.get("limitations"),
      healthcarePowers: formData.get("healthcarePowers"),
      financialPowers: formData.get("financialPowers"),
      realEstatePowers: formData.get("realEstatePowers"),
      businessPowers: formData.get("businessPowers"),
      taxPowers: formData.get("taxPowers"),
      giftPowers: formData.get("giftPowers"),
      trustPowers: formData.get("trustPowers"),
      specialInstructions: formData.get("specialInstructions"),
      witness1Name: formData.get("witness1Name"),
      witness2Name: formData.get("witness2Name"),
      notaryName: formData.get("notaryName"),
      notaryState: formData.get("notaryState"),
      dateSigned: formData.get("dateSigned"),
      status: formData.get("status") || "DRAFT",
      attorneyName: formData.get("attorneyName"),
      lawFirm: formData.get("lawFirm"),
      notes: formData.get("notes"),
    };

    // Validate the form data
    const validatedData = powerOfAttorneyFormSchema.parse(rawData);

    // Create the power of attorney with validated data
    await createPowerOfAttorney({
      ...validatedData,
      userId: user.id,
      effectiveDate: validatedData.effectiveDate || null,
      terminationDate: validatedData.terminationDate || null,
      agentSecondary: validatedData.agentSecondary || null,
      springCondition: validatedData.springCondition || null,
      powersGranted: validatedData.powersGranted || null,
      limitations: validatedData.limitations || null,
      healthcarePowers: validatedData.healthcarePowers || null,
      financialPowers: validatedData.financialPowers || null,
      realEstatePowers: validatedData.realEstatePowers || null,
      businessPowers: validatedData.businessPowers || null,
      taxPowers: validatedData.taxPowers || null,
      giftPowers: validatedData.giftPowers || null,
      trustPowers: validatedData.trustPowers || null,
      specialInstructions: validatedData.specialInstructions || null,
      witness1Name: validatedData.witness1Name || null,
      witness2Name: validatedData.witness2Name || null,
      notaryName: validatedData.notaryName || null,
      notaryState: validatedData.notaryState || null,
      dateSigned: validatedData.dateSigned || null,
      attorneyName: validatedData.attorneyName || null,
      lawFirm: validatedData.lawFirm || null,
      notes: validatedData.notes || null,
    });

    return redirect("/powers-attorney");
  } catch (error: any) {
    if (error.name === "ZodError") {
      return json(
        {
          error: "Please correct the validation errors below.",
          fieldErrors: formatPowerOfAttorneyValidationErrors(error),
        },
        { status: 400 },
      );
    }

    console.error("Error creating power of attorney:", error);
    return json(
      {
        error: "Failed to create power of attorney. Please try again.",
        fieldErrors: {},
      },
      { status: 500 },
    );
  }
}

export default function NewPowerOfAttorney() {
  const actionData = useActionData<ActionData>();
  const navigate = useNavigate();
  const [type, setType] = useState("FINANCIAL");
  const [durable, setDurable] = useState("true");

  const getFieldError = (fieldName: string) => {
    return actionData?.fieldErrors?.[fieldName]?.[0];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="rounded-lg p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Create Power of Attorney
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Designate someone to act on your behalf
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
                placeholder="e.g., Durable Financial Power of Attorney"
                required
                className={getFieldError("documentName") ? "border-red-500" : ""}
              />
            </FormField>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField label="Type" required>
                <Select
                  name="type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  options={[
                    { value: "FINANCIAL", label: "Financial" },
                    { value: "HEALTHCARE", label: "Healthcare" },
                    { value: "GENERAL", label: "General" },
                    { value: "LIMITED", label: "Limited" },
                  ]}
                />
              </FormField>

              <FormField label="Status">
                <Select
                  name="status"
                  defaultValue="DRAFT"
                  options={[
                    { value: "DRAFT", label: "Draft" },
                    { value: "ACTIVE", label: "Active" },
                    { value: "REVOKED", label: "Revoked" },
                    { value: "EXPIRED", label: "Expired" },
                  ]}
                />
              </FormField>
            </div>

            <FormField label="Principal Name" required error={getFieldError("principalName")}>
              <Input
                name="principalName"
                placeholder="Full legal name of the principal"
                required
                className={getFieldError("principalName") ? "border-red-500" : ""}
              />
            </FormField>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold">Agents</h2>
          <div className="grid gap-4">
            <FormField label="Primary Agent" required error={getFieldError("agentPrimary")}>
              <Input
                name="agentPrimary"
                placeholder="Name of primary agent/attorney-in-fact"
                required
                className={getFieldError("agentPrimary") ? "border-red-500" : ""}
              />
            </FormField>

            <FormField label="Secondary Agent">
              <Input name="agentSecondary" placeholder="Name of backup agent (optional)" />
            </FormField>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold">Effective Dates & Conditions</h2>
          <div className="grid gap-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField label="Effective Date">
                <Input name="effectiveDate" type="date" />
              </FormField>

              <FormField label="Termination Date">
                <Input name="terminationDate" type="date" />
              </FormField>
            </div>

            <FormField label="Durable Power">
              <Select
                name="durable"
                value={durable}
                onChange={(e) => setDurable(e.target.value)}
                options={[
                  { value: "true", label: "Yes - Survives incapacity" },
                  { value: "false", label: "No - Ends upon incapacity" },
                ]}
              />
            </FormField>

            <FormField label="Springing Condition">
              <Textarea
                name="springCondition"
                placeholder="Condition that triggers the POA (e.g., medical incapacity)"
                rows={2}
              />
            </FormField>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold">Powers Granted</h2>
          <div className="space-y-4">
            <FormField label="General Powers Granted">
              <Textarea
                name="powersGranted"
                placeholder="List the general powers granted to the agent"
                rows={3}
              />
            </FormField>

            <FormField label="Limitations">
              <Textarea
                name="limitations"
                placeholder="Any limitations on the agent's powers"
                rows={2}
              />
            </FormField>

            {type === "HEALTHCARE" && (
              <FormField label="Healthcare Powers">
                <Textarea
                  name="healthcarePowers"
                  placeholder="Specific healthcare decisions the agent can make"
                  rows={3}
                />
              </FormField>
            )}

            {(type === "FINANCIAL" || type === "GENERAL") && (
              <>
                <FormField label="Financial Powers">
                  <Textarea
                    name="financialPowers"
                    placeholder="Banking, investment, and financial management powers"
                    rows={2}
                  />
                </FormField>

                <FormField label="Real Estate Powers">
                  <Textarea
                    name="realEstatePowers"
                    placeholder="Powers related to buying, selling, or managing property"
                    rows={2}
                  />
                </FormField>

                <FormField label="Business Powers">
                  <Textarea
                    name="businessPowers"
                    placeholder="Powers related to business operations"
                    rows={2}
                  />
                </FormField>

                <FormField label="Tax Powers">
                  <Textarea
                    name="taxPowers"
                    placeholder="Powers to file taxes and handle tax matters"
                    rows={2}
                  />
                </FormField>

                <FormField label="Gift Powers">
                  <Textarea
                    name="giftPowers"
                    placeholder="Powers to make gifts on behalf of the principal"
                    rows={2}
                  />
                </FormField>

                <FormField label="Trust Powers">
                  <Textarea
                    name="trustPowers"
                    placeholder="Powers related to trust management"
                    rows={2}
                  />
                </FormField>
              </>
            )}

            <FormField label="Special Instructions">
              <Textarea
                name="specialInstructions"
                placeholder="Any special instructions or preferences"
                rows={3}
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

            <FormField label="Date Signed">
              <Input name="dateSigned" type="date" />
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
              <Textarea name="notes" placeholder="Any additional notes or instructions" rows={3} />
            </FormField>
          </div>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit">Create Power of Attorney</Button>
        </div>
      </Form>
    </div>
  );
}
