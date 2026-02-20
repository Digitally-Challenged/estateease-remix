import type { ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useActionData } from "@remix-run/react";
import { TrustForm } from "~/components/forms/trust-form";
import { createTrustSchema, formatTrustValidationErrors } from "~/lib/validation";
import { createTrust } from "~/lib/dal-crud";
import type { ValidatedBeneficiary, ValidatedTrustee } from "~/lib/validation/trust-schemas";
import { requireUser } from "~/lib/auth.server";

interface ActionData {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  formData?: Record<string, unknown>;
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent !== "create") {
    return json({ error: "Invalid intent" }, { status: 400 });
  }

  try {
    // Parse form data
    const name = formData.get("name") as string;
    const type = formData.get("type") as string;
    const description = formData.get("description") as string;
    const establishedDate = formData.get("establishedDate") as string;
    const purpose = formData.get("purpose") as string;
    const grantor = formData.get("grantor") as string;
    const taxId = formData.get("taxId") as string;
    const attorneyName = formData.get("attorneyName") as string;
    const lawFirm = formData.get("lawFirm") as string;
    const establishedState = formData.get("establishedState") as string;
    const governingLaw = formData.get("governingLaw") as string;

    // Parse complex data
    const beneficiariesData = formData.get("beneficiaries") as string;
    const trusteesData = formData.get("trustees") as string;

    let beneficiaries: ValidatedBeneficiary[] = [];
    let trustees: ValidatedTrustee[] = [];

    try {
      beneficiaries = JSON.parse(beneficiariesData || "[]");
      trustees = JSON.parse(trusteesData || "[]");
    } catch {
      return json(
        {
          error: "Invalid beneficiary or trustee data",
          fieldErrors: {},
        },
        { status: 400 },
      );
    }

    // Create trust data object
    const trustData = {
      name,
      type,
      status: "ACTIVE" as const,
      description: description || undefined,
      establishedDate: establishedDate ? new Date(establishedDate) : undefined,
      purpose: purpose || undefined,
      grantor: grantor || "Nicholas Coleman", // Default grantor
      taxId: taxId || undefined,
      trustees,
      beneficiaries,
      notes: description || undefined,
      legalInfo: {
        attorneyName: attorneyName || undefined,
        lawFirm: lawFirm || undefined,
        establishedState: establishedState || undefined,
        governingLaw: governingLaw || undefined,
      },
      userId: (await requireUser(request)).id,
    };

    // Validate the trust data
    const validationResult = createTrustSchema.safeParse(trustData);

    if (!validationResult.success) {
      const fieldErrors = formatTrustValidationErrors(validationResult.error);
      return json(
        {
          error: "Validation failed",
          fieldErrors,
          formData: trustData,
        },
        { status: 400 },
      );
    }

    // Transform data for database
    const dbTrustData = {
      name: validationResult.data.name,
      type: validationResult.data.type.toLowerCase() as "revocable" | "irrevocable",
      taxId: validationResult.data.taxId || `TR-${Date.now()}`, // Generate default tax ID if not provided
      dateCreated: validationResult.data.establishedDate?.toISOString() || new Date().toISOString(),
      grantor: validationResult.data.grantor || "Nicholas Coleman",
      purpose: validationResult.data.purpose || "Estate planning purposes",
      notes: validationResult.data.notes,
      isActive: true,
      trustees: validationResult.data.trustees.map((t) => ({
        name: t.name,
        type: t.isPrimary ? "primary" : t.isSuccessor ? "successor" : "co-trustee",
        powers: ["Standard trustee powers"],
        startDate: new Date().toISOString(),
        orderOfSuccession: t.isSuccessor ? 1 : undefined,
        compensation: {
          type: "none" as const,
          details: "",
        },
      })),
      beneficiaries: validationResult.data.beneficiaries.map((b) => ({
        name: b.name,
        type: b.contingent ? "contingent" : "primary",
        relationship: b.relationship,
        percentage: b.percentage,
        conditions: b.notes,
        distributions: {
          type: "discretionary" as const,
          schedule: "",
          amount: "",
        },
      })),
    };

    // Create the trust
    await createTrust(dbTrustData, request);

    // Redirect to the trust overview page
    return redirect("/trusts");
  } catch (error) {
    console.error("Error creating trust:", error);
    return json(
      {
        error: error instanceof Error ? error.message : "Failed to create trust",
        fieldErrors: {},
      },
      { status: 500 },
    );
  }
}

export default function NewTrust() {
  const actionData = useActionData<ActionData>();

  return (
    <div className="mx-auto max-w-4xl py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Create New Trust</h1>
        <p className="text-gray-600">
          Set up a new trust for your estate planning needs
        </p>
      </div>

      {actionData?.error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="font-medium text-red-800">Error</div>
          <div className="mt-1 text-sm text-red-600">{actionData.error}</div>

          {actionData.fieldErrors && Object.keys(actionData.fieldErrors).length > 0 && (
            <div className="mt-3">
              <div className="text-sm font-medium text-red-700">
                Validation Errors:
              </div>
              <ul className="mt-1 list-inside list-disc text-sm text-red-600">
                {Object.entries(actionData.fieldErrors).map(([field, errors]) => (
                  <li key={field}>
                    <strong>{field}:</strong> {Array.isArray(errors) ? errors.join(", ") : errors}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <TrustForm mode="create" />
    </div>
  );
}
