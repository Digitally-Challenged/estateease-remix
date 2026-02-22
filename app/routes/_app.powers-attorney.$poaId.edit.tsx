import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useNavigate } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/forms/input";
import { Select } from "~/components/ui/forms/select";
import { Textarea } from "~/components/ui/forms/textarea";
import { FormField } from "~/components/ui/forms/form-field";
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left";
import { getPowerOfAttorneyById } from "~/lib/dal";
import { updatePowerOfAttorney } from "~/lib/dal-crud";
import { US_STATES } from "~/types/enums";
import { z } from "zod";

export async function loader({ params }: LoaderFunctionArgs) {
  const { poaId } = params;
  if (!poaId) throw new Response("Not Found", { status: 404 });

  const poa = getPowerOfAttorneyById(poaId);
  if (!poa) throw new Response("Not Found", { status: 404 });

  return json({ poa });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { poaId } = params;
  if (!poaId) throw new Response("Not Found", { status: 404 });

  const formData = await request.formData();

  try {
    const schema = z.object({
      documentName: z.string().min(1, "Document name is required"),
      type: z.enum(["FINANCIAL", "HEALTHCARE", "GENERAL", "LIMITED"]),
      principalName: z.string().min(1, "Principal name is required"),
      agentPrimary: z.string().min(1, "Primary agent is required"),
      agentSecondary: z.string().optional().transform(v => v || null),
      effectiveDate: z.string().optional().transform(v => v || null),
      terminationDate: z.string().optional().transform(v => v || null),
      durable: z.string().optional().transform(v => v === "true"),
      springCondition: z.string().optional().transform(v => v || null),
      powersGranted: z.string().optional().transform(v => v || null),
      limitations: z.string().optional().transform(v => v || null),
      healthcarePowers: z.string().optional().transform(v => v || null),
      financialPowers: z.string().optional().transform(v => v || null),
      specialInstructions: z.string().optional().transform(v => v || null),
      witness1Name: z.string().optional().transform(v => v || null),
      witness2Name: z.string().optional().transform(v => v || null),
      notaryName: z.string().optional().transform(v => v || null),
      notaryState: z.string().optional().transform(v => v || null),
      dateSigned: z.string().optional().transform(v => v || null),
      status: z.enum(["DRAFT", "ACTIVE", "REVOKED", "EXPIRED"]),
      attorneyName: z.string().optional().transform(v => v || null),
      lawFirm: z.string().optional().transform(v => v || null),
      notes: z.string().optional().transform(v => v || null),
    });

    const raw = Object.fromEntries(formData);
    const result = schema.safeParse(raw);
    if (!result.success) {
      return json({ error: result.error.issues[0].message }, { status: 400 });
    }

    updatePowerOfAttorney(poaId, result.data);

    return redirect("/powers-attorney");
  } catch (error) {
    console.error("Error updating POA:", error);
    return json({ error: "Failed to update power of attorney" }, { status: 500 });
  }
}

export default function EditPowerOfAttorney() {
  const { poa } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="rounded-lg p-2 transition-colors hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Power of Attorney</h1>
          <p className="mt-1 text-gray-600">Update {poa.documentName}</p>
        </div>
      </div>

      {actionData?.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-red-800">{actionData.error}</p>
        </div>
      )}

      <Form method="post" className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Document Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField label="Document Name" required>
                <Input name="documentName" defaultValue={poa.documentName} required />
              </FormField>
              <FormField label="Type" required>
                <Select name="type" defaultValue={poa.type} required placeholder="" options={[
                  { value: "FINANCIAL", label: "Financial" },
                  { value: "HEALTHCARE", label: "Healthcare" },
                  { value: "GENERAL", label: "General" },
                  { value: "LIMITED", label: "Limited" },
                ]} />
              </FormField>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField label="Status">
                <Select name="status" defaultValue={poa.status} placeholder="" options={[
                  { value: "DRAFT", label: "Draft" },
                  { value: "ACTIVE", label: "Active" },
                  { value: "REVOKED", label: "Revoked" },
                  { value: "EXPIRED", label: "Expired" },
                ]} />
              </FormField>
              <FormField label="Date Signed">
                <Input name="dateSigned" type="date" defaultValue={poa.dateSigned?.split("T")[0] || ""} />
              </FormField>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" name="durable" id="durable" value="true" defaultChecked={poa.durable} className="rounded border-gray-300" />
              <label htmlFor="durable" className="text-sm text-gray-700">Durable (survives incapacity)</label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Parties</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <FormField label="Principal Name" required>
              <Input name="principalName" defaultValue={poa.principalName} required />
            </FormField>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField label="Primary Agent" required>
                <Input name="agentPrimary" defaultValue={poa.agentPrimary} required />
              </FormField>
              <FormField label="Secondary Agent">
                <Input name="agentSecondary" defaultValue={poa.agentSecondary || ""} />
              </FormField>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Powers & Limitations</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <FormField label="Powers Granted">
              <Textarea name="powersGranted" defaultValue={poa.powersGranted || ""} rows={3} />
            </FormField>
            <FormField label="Limitations">
              <Textarea name="limitations" defaultValue={poa.limitations || ""} rows={2} />
            </FormField>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField label="Healthcare Powers">
                <Textarea name="healthcarePowers" defaultValue={poa.healthcarePowers || ""} rows={2} />
              </FormField>
              <FormField label="Financial Powers">
                <Textarea name="financialPowers" defaultValue={poa.financialPowers || ""} rows={2} />
              </FormField>
            </div>
            <FormField label="Springing Condition">
              <Input name="springCondition" defaultValue={poa.springCondition || ""} />
            </FormField>
            <FormField label="Special Instructions">
              <Textarea name="specialInstructions" defaultValue={poa.specialInstructions || ""} rows={2} />
            </FormField>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField label="Effective Date">
                <Input name="effectiveDate" type="date" defaultValue={poa.effectiveDate?.split("T")[0] || ""} />
              </FormField>
              <FormField label="Termination Date">
                <Input name="terminationDate" type="date" defaultValue={poa.terminationDate?.split("T")[0] || ""} />
              </FormField>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Witnesses & Notary</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField label="Witness 1">
                <Input name="witness1Name" defaultValue={poa.witness1Name || ""} />
              </FormField>
              <FormField label="Witness 2">
                <Input name="witness2Name" defaultValue={poa.witness2Name || ""} />
              </FormField>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField label="Notary Name">
                <Input name="notaryName" defaultValue={poa.notaryName || ""} />
              </FormField>
              <FormField label="Notary State">
                <Select name="notaryState" defaultValue={poa.notaryState || ""} placeholder="Select state" options={[...US_STATES]} />
              </FormField>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Legal & Notes</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField label="Attorney Name">
                <Input name="attorneyName" defaultValue={poa.attorneyName || ""} />
              </FormField>
              <FormField label="Law Firm">
                <Input name="lawFirm" defaultValue={poa.lawFirm || ""} />
              </FormField>
            </div>
            <FormField label="Notes">
              <Textarea name="notes" defaultValue={poa.notes || ""} rows={3} />
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

export { RouteErrorBoundary as ErrorBoundary } from "~/components/ui/error/route-error-boundary";
