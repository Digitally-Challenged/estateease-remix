import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useNavigate } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/forms/input";
import { Select } from "~/components/ui/forms/select";
import { Textarea } from "~/components/ui/forms/textarea";
import { FormField } from "~/components/ui/forms/form-field";
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left";
import { getEmergencyContactById } from "~/lib/dal";
import { updateEmergencyContact } from "~/lib/dal-crud";

const CONTACT_TYPE_OPTIONS = [
  { value: "emergency", label: "Emergency" },
  { value: "medical", label: "Medical" },
  { value: "legal", label: "Legal" },
  { value: "general", label: "General" },
];

export async function loader({ params }: LoaderFunctionArgs) {
  const { contactId } = params;
  if (!contactId) throw new Response("Not Found", { status: 404 });

  const contact = getEmergencyContactById(contactId);
  if (!contact) throw new Response("Not Found", { status: 404 });

  return json({ contact });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { contactId } = params;
  if (!contactId) throw new Response("Not Found", { status: 404 });

  const formData = await request.formData();

  try {
    updateEmergencyContact(contactId, {
      name: formData.get("name") as string,
      contactType: formData.get("contactType") as string,
      primaryPhone: formData.get("primaryPhone") as string,
      secondaryPhone: (formData.get("secondaryPhone") as string) || undefined,
      email: (formData.get("email") as string) || undefined,
      preferredContact: (formData.get("preferredContact") as string) || undefined,
      priority: Number(formData.get("priority")) || 1,
      medicalAuthority: formData.get("medicalAuthority") === "true",
      canMakeDecisions: formData.get("canMakeDecisions") === "true",
      notes: (formData.get("notes") as string) || undefined,
    });

    return redirect("/emergency-contacts");
  } catch (error) {
    console.error("Error updating emergency contact:", error);
    return json({ error: "Failed to update emergency contact" }, { status: 500 });
  }
}

export default function EditEmergencyContact() {
  const { contact } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="rounded-lg p-2 transition-colors hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Emergency Contact</h1>
          <p className="mt-1 text-gray-600">Update {contact.name}</p>
        </div>
      </div>

      {actionData?.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-red-800">{actionData.error}</p>
        </div>
      )}

      <Form method="post" className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Contact Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField label="Full Name" required>
                <Input name="name" defaultValue={contact.name} required />
              </FormField>
              <FormField label="Contact Type">
                <Select name="contactType" defaultValue={contact.contact_type}>
                  {CONTACT_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </Select>
              </FormField>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField label="Primary Phone" required>
                <Input name="primaryPhone" type="tel" defaultValue={contact.primary_phone} required />
              </FormField>
              <FormField label="Secondary Phone">
                <Input name="secondaryPhone" type="tel" defaultValue={contact.secondary_phone || ""} />
              </FormField>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField label="Email">
                <Input name="email" type="email" defaultValue={contact.email || ""} />
              </FormField>
              <FormField label="Priority" helperText="1 = highest">
                <Input name="priority" type="number" min="1" max="10" defaultValue={contact.priority} />
              </FormField>
            </div>

            <FormField label="Preferred Contact Method">
              <Select name="preferredContact" defaultValue={contact.preferred_contact || "phone"}>
                <option value="phone">Phone</option>
                <option value="email">Email</option>
                <option value="text">Text</option>
              </Select>
            </FormField>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField label="Medical Authority">
                <div className="flex items-center space-x-2 pt-2">
                  <input type="checkbox" name="medicalAuthority" id="medicalAuthority" value="true" defaultChecked={contact.medical_authority === 1} className="rounded border-gray-300" />
                  <label htmlFor="medicalAuthority" className="text-sm text-gray-700">Can make medical decisions</label>
                </div>
              </FormField>
              <FormField label="Decision Making">
                <div className="flex items-center space-x-2 pt-2">
                  <input type="checkbox" name="canMakeDecisions" id="canMakeDecisions" value="true" defaultChecked={contact.can_make_decisions === 1} className="rounded border-gray-300" />
                  <label htmlFor="canMakeDecisions" className="text-sm text-gray-700">General decisions</label>
                </div>
              </FormField>
            </div>

            <FormField label="Notes">
              <Textarea name="notes" defaultValue={contact.notes || ""} rows={3} />
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
