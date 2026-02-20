import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useNavigate } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/forms/input";
import { FormField } from "~/components/ui/forms/form-field";
import { Select } from "~/components/ui/forms/select";
import { Textarea } from "~/components/ui/forms/textarea";
import { getFamilyMember, updateFamilyMember } from "~/lib/dal-crud";
import { requireUser } from "~/lib/auth.server";
import { FamilyRelationship, US_STATES } from "~/types/enums";
import ArrowLeft from "lucide-react/dist/esm/icons/arrow-left";
import User from "lucide-react/dist/esm/icons/user";
import Phone from "lucide-react/dist/esm/icons/phone";
import Mail from "lucide-react/dist/esm/icons/mail";
import Home from "lucide-react/dist/esm/icons/home";
import Heart from "lucide-react/dist/esm/icons/heart";
import Shield from "lucide-react/dist/esm/icons/shield";
import { useState } from "react";

interface ActionData {
  error?: string;
  fieldErrors?: Record<string, string>;
}

// Helper to convert external_id to numeric user_id
function getUserIdFromExternalId(externalId: string): number {
  const match = externalId.match(/(\d+)$/);
  return match ? parseInt(match[1]) : 1;
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  const { memberId } = params;

  if (!memberId) {
    throw new Response("Not Found", { status: 404 });
  }

  const familyMember = await getFamilyMember(user.id, memberId);

  if (!familyMember) {
    throw new Response("Not Found", { status: 404 });
  }

  // AUTHORIZATION: Verify ownership
  const userId = getUserIdFromExternalId(user.id);
  if (familyMember.user_id !== userId) {
    throw json({ message: "Forbidden" }, { status: 403 });
  }

  return json({ familyMember });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const user = await requireUser(request);
  const { memberId } = params;

  if (!memberId) {
    throw new Response("Not Found", { status: 404 });
  }

  const formData = await request.formData();

  try {
    const updates = {
      name: formData.get("name") as string,
      relationship: formData.get("relationship") as FamilyRelationship,
      dateOfBirth: (formData.get("dateOfBirth") as string) || null,
      email: (formData.get("email") as string) || null,
      phone: (formData.get("phone") as string) || null,
      address: (formData.get("address") as string) || null,
      city: (formData.get("city") as string) || null,
      state: (formData.get("state") as string) || null,
      zipCode: (formData.get("zipCode") as string) || null,
      notes: (formData.get("notes") as string) || null,
      isEmergencyContact: formData.get("isEmergencyContact") === "true",
      isBeneficiary: formData.get("isBeneficiary") === "true",
      isTrustee: formData.get("isTrustee") === "true",
      isExecutor: formData.get("isExecutor") === "true",
      isPowerOfAttorney: formData.get("isPowerOfAttorney") === "true",
      isHealthcareProxy: formData.get("isHealthcareProxy") === "true",
    };

    // The DAL's updateFamilyMember accepts additional fields beyond the
    // canonical FamilyMember type (email, phone, address, etc.)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await updateFamilyMember(memberId, updates as any);
    return redirect("/family");
  } catch (error) {
    console.error("Error updating family member:", error);
    return json(
      {
        error: "Failed to update family member. Please try again.",
        fieldErrors: {},
      },
      { status: 400 },
    );
  }
}

/** Shape returned by getFamilyMember in dal-crud (superset of canonical FamilyMember) */
interface EditableFamilyMember {
  id: string;
  name: string;
  relationship: string;
  dateOfBirth?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  notes?: string;
  isEmergencyContact?: boolean;
  isBeneficiary?: boolean;
  isTrustee?: boolean;
  isExecutor?: boolean;
  isPowerOfAttorney?: boolean;
  isHealthcareProxy?: boolean;
  user_id?: number;
}

export default function EditFamilyMember() {
  const data = useLoaderData<typeof loader>();
  const familyMember = data.familyMember as unknown as EditableFamilyMember;
  const actionData = useActionData<ActionData>();
  const navigate = useNavigate();

  // Determine if legal roles should be shown initially
  const hasLegalRoles =
    familyMember.isBeneficiary ||
    familyMember.isTrustee ||
    familyMember.isExecutor ||
    familyMember.isPowerOfAttorney ||
    familyMember.isHealthcareProxy;

  const [showLegalRoles, setShowLegalRoles] = useState(hasLegalRoles);

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
          <h1 className="text-3xl font-bold text-gray-900">
            Edit Family Member
          </h1>
          <p className="mt-1 text-gray-600">
            Update information for {familyMember.name}
          </p>
        </div>
      </div>

      {actionData?.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-red-800">{actionData.error}</p>
        </div>
      )}

      <Form method="post" className="space-y-6">
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-gray-600" />
            <h2 className="text-xl font-semibold">Personal Information</h2>
          </div>
          <div className="grid gap-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField label="Full Name" required>
                <Input
                  name="name"
                  defaultValue={familyMember.name}
                  placeholder="First and last name"
                  required
                />
              </FormField>

              <FormField label="Relationship" required>
                <Select
                  name="relationship"
                  defaultValue={familyMember.relationship}
                  required
                  options={[
                    { value: "", label: "Select relationship" },
                    { value: FamilyRelationship.SPOUSE, label: "Spouse" },
                    { value: FamilyRelationship.CHILD, label: "Child" },
                    { value: FamilyRelationship.PARENT, label: "Parent" },
                    { value: FamilyRelationship.SIBLING, label: "Sibling" },
                    { value: FamilyRelationship.GRANDCHILD, label: "Grandchild" },
                    { value: FamilyRelationship.GRANDPARENT, label: "Grandparent" },
                    { value: FamilyRelationship.AUNT_UNCLE, label: "Aunt/Uncle" },
                    { value: FamilyRelationship.NIECE_NEPHEW, label: "Niece/Nephew" },
                    { value: FamilyRelationship.COUSIN, label: "Cousin" },
                    { value: FamilyRelationship.IN_LAW, label: "In-Law" },
                    { value: FamilyRelationship.STEP_RELATIVE, label: "Step Relative" },
                    { value: FamilyRelationship.OTHER, label: "Other" },
                  ]}
                />
              </FormField>
            </div>

            <FormField label="Date of Birth">
              <Input
                name="dateOfBirth"
                type="date"
                defaultValue={familyMember.dateOfBirth?.split("T")[0] || ""}
              />
            </FormField>
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <Phone className="h-5 w-5 text-gray-600" />
            <h2 className="text-xl font-semibold">Contact Information</h2>
          </div>
          <div className="grid gap-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField label="Email">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                  <Input
                    name="email"
                    type="email"
                    defaultValue={familyMember.email || ""}
                    placeholder="email@example.com"
                    className="pl-10"
                  />
                </div>
              </FormField>

              <FormField label="Phone">
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                  <Input
                    name="phone"
                    type="tel"
                    defaultValue={familyMember.phone || ""}
                    placeholder="(555) 123-4567"
                    className="pl-10"
                  />
                </div>
              </FormField>
            </div>

            <FormField label="Street Address">
              <div className="relative">
                <Home className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <Input
                  name="address"
                  defaultValue={familyMember.address || ""}
                  placeholder="123 Main Street"
                  className="pl-10"
                />
              </div>
            </FormField>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              <FormField label="City">
                <Input name="city" defaultValue={familyMember.city || ""} placeholder="City" />
              </FormField>

              <FormField label="State">
                <Select
                  name="state"
                  defaultValue={familyMember.state || ""}
                  options={[{ value: "", label: "Select state" }, ...US_STATES]}
                />
              </FormField>

              <FormField label="Zip Code">
                <Input
                  name="zipCode"
                  defaultValue={familyMember.zipCode || ""}
                  placeholder="12345"
                  pattern="[0-9]{5}(-[0-9]{4})?"
                />
              </FormField>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <Heart className="h-5 w-5 text-gray-600" />
            <h2 className="text-xl font-semibold">Emergency & Estate Roles</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isEmergencyContact"
                name="isEmergencyContact"
                value="true"
                defaultChecked={familyMember.isEmergencyContact}
                className="h-4 w-4 rounded border-gray-300 text-primary-600"
              />
              <label
                htmlFor="isEmergencyContact"
                className="text-sm font-medium text-gray-700"
              >
                Emergency Contact
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showLegalRoles"
                checked={showLegalRoles}
                onChange={(e) => setShowLegalRoles(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary-600"
              />
              <label
                htmlFor="showLegalRoles"
                className="text-sm font-medium text-gray-700"
              >
                Has Legal Roles in Estate Planning
              </label>
            </div>

            {showLegalRoles && (
              <div className="ml-6 space-y-3 rounded-lg bg-gray-50 p-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isBeneficiary"
                    name="isBeneficiary"
                    value="true"
                    defaultChecked={familyMember.isBeneficiary}
                    className="h-4 w-4 rounded border-gray-300 text-primary-600"
                  />
                  <label
                    htmlFor="isBeneficiary"
                    className="text-sm text-gray-700"
                  >
                    Beneficiary
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isTrustee"
                    name="isTrustee"
                    value="true"
                    defaultChecked={familyMember.isTrustee}
                    className="h-4 w-4 rounded border-gray-300 text-primary-600"
                  />
                  <label htmlFor="isTrustee" className="text-sm text-gray-700">
                    Trustee
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isExecutor"
                    name="isExecutor"
                    value="true"
                    defaultChecked={familyMember.isExecutor}
                    className="h-4 w-4 rounded border-gray-300 text-primary-600"
                  />
                  <label htmlFor="isExecutor" className="text-sm text-gray-700">
                    Executor
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPowerOfAttorney"
                    name="isPowerOfAttorney"
                    value="true"
                    defaultChecked={familyMember.isPowerOfAttorney}
                    className="h-4 w-4 rounded border-gray-300 text-primary-600"
                  />
                  <label
                    htmlFor="isPowerOfAttorney"
                    className="text-sm text-gray-700"
                  >
                    Power of Attorney
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isHealthcareProxy"
                    name="isHealthcareProxy"
                    value="true"
                    defaultChecked={familyMember.isHealthcareProxy}
                    className="h-4 w-4 rounded border-gray-300 text-primary-600"
                  />
                  <label
                    htmlFor="isHealthcareProxy"
                    className="text-sm text-gray-700"
                  >
                    Healthcare Proxy
                  </label>
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-gray-600" />
            <h2 className="text-xl font-semibold">Additional Information</h2>
          </div>
          <FormField label="Notes">
            <Textarea
              name="notes"
              defaultValue={familyMember.notes || ""}
              placeholder="Any additional information about this family member..."
              rows={4}
            />
          </FormField>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit">Save Changes</Button>
        </div>
      </Form>
    </div>
  );
}
