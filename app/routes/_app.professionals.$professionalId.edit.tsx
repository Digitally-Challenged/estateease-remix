import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useNavigate } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/forms/input";
import { Select } from "~/components/ui/forms/select";
import { Textarea } from "~/components/ui/forms/textarea";
import { FormField } from "~/components/ui/forms/form-field";
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left";
import { getProfessionalById } from "~/lib/dal";
import { updateProfessional } from "~/lib/dal-crud";
import { US_STATES, PROFESSIONAL_TYPE_OPTIONS } from "~/types/enums";
import { z } from "zod";

export async function loader({ params }: LoaderFunctionArgs) {
  const { professionalId } = params;
  if (!professionalId) throw new Response("Not Found", { status: 404 });

  const professional = getProfessionalById(professionalId);
  if (!professional) throw new Response("Not Found", { status: 404 });

  return json({ professional });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { professionalId } = params;
  if (!professionalId) throw new Response("Not Found", { status: 404 });

  const formData = await request.formData();

  try {
    const schema = z.object({
      name: z.string().min(1, "Name is required"),
      type: z.string().optional(),
      firm: z.string().optional().transform(v => v || undefined),
      title: z.string().optional().transform(v => v || undefined),
      email: z.string().optional().transform(v => v || undefined),
      primaryPhone: z.string().optional().transform(v => v || undefined),
      secondaryPhone: z.string().optional().transform(v => v || undefined),
      street1: z.string().optional().default(""),
      city: z.string().optional().default(""),
      state: z.string().optional().default(""),
      zipCode: z.string().optional().default(""),
      specializations: z.string().optional().default(""),
      notes: z.string().optional().transform(v => v || undefined),
    });

    const raw = Object.fromEntries(formData);
    const result = schema.safeParse(raw);
    if (!result.success) {
      return json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const specializations = result.data.specializations
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    updateProfessional(professionalId, {
      name: result.data.name,
      firm: result.data.firm,
      title: result.data.title,
      specializations,
      contactInfo: {
        email: result.data.email,
        primaryPhone: result.data.primaryPhone,
        secondaryPhone: result.data.secondaryPhone,
        address: {
          street1: result.data.street1,
          city: result.data.city,
          state: result.data.state,
          zipCode: result.data.zipCode,
        },
      },
      notes: result.data.notes,
    });

    return redirect("/professionals");
  } catch (error) {
    console.error("Error updating professional:", error);
    return json({ error: "Failed to update professional" }, { status: 500 });
  }
}

export default function EditProfessional() {
  const { professional } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();

  let specializations = "";
  if (professional.specializations) {
    try {
      const parsed = typeof professional.specializations === "string"
        ? JSON.parse(professional.specializations)
        : professional.specializations;
      specializations = Array.isArray(parsed) ? parsed.join(", ") : String(parsed);
    } catch {
      specializations = String(professional.specializations);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="rounded-lg p-2 transition-colors hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Professional</h1>
          <p className="mt-1 text-gray-600">Update {professional.name}</p>
        </div>
      </div>

      {actionData?.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-red-800">{actionData.error}</p>
        </div>
      )}

      <Form method="post" className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Professional Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField label="Full Name" required>
                <Input name="name" defaultValue={professional.name} required />
              </FormField>
              <FormField label="Professional Type">
                <Select name="type" defaultValue={professional.professional_type_code || ""} placeholder="" options={PROFESSIONAL_TYPE_OPTIONS.map(o => ({ value: o.value, label: o.label }))} />
              </FormField>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField label="Firm/Company">
                <Input name="firm" defaultValue={professional.firm || ""} />
              </FormField>
              <FormField label="Title/Position">
                <Input name="title" defaultValue={professional.title || ""} />
              </FormField>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Contact Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField label="Email">
                <Input name="email" type="email" defaultValue={professional.email || ""} />
              </FormField>
              <FormField label="Primary Phone">
                <Input name="primaryPhone" type="tel" defaultValue={professional.primary_phone || ""} />
              </FormField>
            </div>
            <FormField label="Secondary Phone">
              <Input name="secondaryPhone" type="tel" defaultValue={professional.secondary_phone || ""} />
            </FormField>
            <FormField label="Street Address">
              <Input name="street1" defaultValue={professional.street1 || ""} />
            </FormField>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <FormField label="City">
                <Input name="city" defaultValue={professional.city || ""} />
              </FormField>
              <FormField label="State">
                <Select name="state" defaultValue={professional.state || ""} placeholder="Select state" options={US_STATES.map(s => ({ value: s.value, label: s.label }))} />
              </FormField>
              <FormField label="ZIP Code">
                <Input name="zipCode" defaultValue={professional.zip_code || ""} />
              </FormField>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Additional Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <FormField label="Specializations" helperText="Comma-separated">
              <Input name="specializations" defaultValue={specializations} />
            </FormField>
            <FormField label="Notes">
              <Textarea name="notes" defaultValue={professional.notes || ""} rows={3} />
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
