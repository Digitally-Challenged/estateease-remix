import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useNavigate } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/forms/input";
import { Select } from "~/components/ui/forms/select";
import { Textarea } from "~/components/ui/forms/textarea";
import { FormField } from "~/components/ui/forms/form-field";
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left";
import { getWillById } from "~/lib/dal";
import { updateWill } from "~/lib/dal-crud";
import { US_STATES } from "~/types/enums";
import { z } from "zod";

export async function loader({ params }: LoaderFunctionArgs) {
  const { willId } = params;
  if (!willId) throw new Response("Not Found", { status: 404 });

  const will = getWillById(willId);
  if (!will) throw new Response("Not Found", { status: 404 });

  return json({ will });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { willId } = params;
  if (!willId) throw new Response("Not Found", { status: 404 });

  const formData = await request.formData();

  try {
    const schema = z.object({
      documentName: z.string().min(1, "Document name is required"),
      testatorName: z.string().min(1, "Testator name is required"),
      dateSigned: z.string().optional().transform(v => v || null),
      status: z.enum(["DRAFT", "SIGNED", "EXECUTED", "REVOKED"]),
      executorPrimary: z.string().optional().transform(v => v || null),
      executorSecondary: z.string().optional().transform(v => v || null),
      witness1Name: z.string().optional().transform(v => v || null),
      witness2Name: z.string().optional().transform(v => v || null),
      notaryName: z.string().optional().transform(v => v || null),
      notaryState: z.string().optional().transform(v => v || null),
      specificBequests: z.string().optional().transform(v => v || null),
      residuaryClause: z.string().optional().transform(v => v || null),
      guardianNominations: z.string().optional().transform(v => v || null),
      funeralWishes: z.string().optional().transform(v => v || null),
      otherProvisions: z.string().optional().transform(v => v || null),
      attorneyName: z.string().optional().transform(v => v || null),
      lawFirm: z.string().optional().transform(v => v || null),
      notes: z.string().optional().transform(v => v || null),
    });

    const raw = Object.fromEntries(formData);
    const result = schema.safeParse(raw);
    if (!result.success) {
      return json({ error: result.error.issues[0].message }, { status: 400 });
    }

    updateWill(willId, result.data);

    return redirect("/wills");
  } catch (error) {
    console.error("Error updating will:", error);
    return json({ error: "Failed to update will" }, { status: 500 });
  }
}

export default function EditWill() {
  const { will } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="rounded-lg p-2 transition-colors hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Will</h1>
          <p className="mt-1 text-gray-600">Update {will.documentName}</p>
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
                <Input name="documentName" defaultValue={will.documentName} required />
              </FormField>
              <FormField label="Testator Name" required>
                <Input name="testatorName" defaultValue={will.testatorName} required />
              </FormField>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField label="Status">
                <Select name="status" defaultValue={will.status} placeholder="" options={[
                  { value: "DRAFT", label: "Draft" },
                  { value: "SIGNED", label: "Signed" },
                  { value: "EXECUTED", label: "Executed" },
                  { value: "REVOKED", label: "Revoked" },
                ]} />
              </FormField>
              <FormField label="Date Signed">
                <Input name="dateSigned" type="date" defaultValue={will.dateSigned?.split("T")[0] || ""} />
              </FormField>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Executors</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField label="Primary Executor">
                <Input name="executorPrimary" defaultValue={will.executorPrimary || ""} />
              </FormField>
              <FormField label="Secondary Executor">
                <Input name="executorSecondary" defaultValue={will.executorSecondary || ""} />
              </FormField>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Witnesses & Notary</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField label="Witness 1">
                <Input name="witness1Name" defaultValue={will.witness1Name || ""} />
              </FormField>
              <FormField label="Witness 2">
                <Input name="witness2Name" defaultValue={will.witness2Name || ""} />
              </FormField>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField label="Notary Name">
                <Input name="notaryName" defaultValue={will.notaryName || ""} />
              </FormField>
              <FormField label="Notary State">
                <Select name="notaryState" defaultValue={will.notaryState || ""} placeholder="Select state" options={[...US_STATES]} />
              </FormField>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Provisions</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <FormField label="Specific Bequests">
              <Textarea name="specificBequests" defaultValue={will.specificBequests || ""} rows={3} />
            </FormField>
            <FormField label="Residuary Clause">
              <Textarea name="residuaryClause" defaultValue={will.residuaryClause || ""} rows={3} />
            </FormField>
            <FormField label="Guardian Nominations">
              <Textarea name="guardianNominations" defaultValue={will.guardianNominations || ""} rows={2} />
            </FormField>
            <FormField label="Funeral Wishes">
              <Textarea name="funeralWishes" defaultValue={will.funeralWishes || ""} rows={2} />
            </FormField>
            <FormField label="Other Provisions">
              <Textarea name="otherProvisions" defaultValue={will.otherProvisions || ""} rows={2} />
            </FormField>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Legal & Notes</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField label="Attorney Name">
                <Input name="attorneyName" defaultValue={will.attorneyName || ""} />
              </FormField>
              <FormField label="Law Firm">
                <Input name="lawFirm" defaultValue={will.lawFirm || ""} />
              </FormField>
            </div>
            <FormField label="Notes">
              <Textarea name="notes" defaultValue={will.notes || ""} rows={3} />
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
