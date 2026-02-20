import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import { TrustForm } from "~/components/forms/trust-form";
import { updateTrustSchema, formatTrustValidationErrors } from "~/lib/validation";
import { getTrust } from "~/lib/dal";
import { updateTrust } from "~/lib/dal-crud";
import { requireUser } from "~/lib/auth.server";
import type { ValidatedBeneficiary, ValidatedTrustee } from "~/lib/validation/trust-schemas";
import type { Trust } from "~/types";

interface ActionData {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  formData?: Record<string, unknown>;
}

// Helper to convert external_id to numeric user_id
function getUserIdFromExternalId(externalId: string): number {
  const match = externalId.match(/(\d+)$/);
  return match ? parseInt(match[1]) : 1;
}

export async function loader({ params, request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  const { trustId } = params;

  if (!trustId) {
    throw new Response("Trust ID is required", { status: 400 });
  }

  try {
    const trust = getTrust(trustId);

    if (!trust) {
      throw new Response("Trust not found", { status: 404 });
    }

    // AUTHORIZATION: Verify ownership
    const userId = getUserIdFromExternalId(user.id);
    if (trust.created_by !== userId) {
      throw json({ message: "Forbidden" }, { status: 403 });
    }

    return json({ trust });
  } catch (error) {
    console.error("Error loading trust:", error);
    throw new Response("Failed to load trust", { status: 500 });
  }
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { trustId } = params;
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (!trustId) {
    return json({ error: "Trust ID is required" }, { status: 400 });
  }

  if (intent !== "edit") {
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

    // Create trust update data object
    const trustUpdateData = {
      id: trustId,
      name,
      type,
      status: "ACTIVE" as const,
      description: description || undefined,
      establishedDate: establishedDate ? new Date(establishedDate) : undefined,
      purpose: purpose || undefined,
      grantor,
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
    };

    // Validate the trust data
    const validationResult = updateTrustSchema.safeParse(trustUpdateData);

    if (!validationResult.success) {
      const fieldErrors = formatTrustValidationErrors(validationResult.error);
      return json(
        {
          error: "Validation failed",
          fieldErrors,
          formData: trustUpdateData,
        },
        { status: 400 },
      );
    }

    // Transform data for database update
    const dbUpdateData = {
      name: validationResult.data.name,
      type: validationResult.data.type?.toLowerCase() as "revocable" | "irrevocable" | undefined,
      taxId: validationResult.data.taxId,
      purpose: validationResult.data.purpose,
      notes: validationResult.data.notes,
    };

    // Update the trust (basic fields only for now)
    updateTrust(trustId, dbUpdateData);

    // TODO: Update trustees and beneficiaries separately
    // This would require additional database operations

    // Redirect to the trust overview page
    return redirect("/trusts");
  } catch (error) {
    console.error("Error updating trust:", error);
    return json(
      {
        error: error instanceof Error ? error.message : "Failed to update trust",
        fieldErrors: {},
      },
      { status: 500 },
    );
  }
}

export default function EditTrust() {
  const { trust } = useLoaderData<typeof loader>();
  const actionData = useActionData<ActionData>();

  return (
    <div className="mx-auto max-w-4xl py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Edit Trust</h1>
        <p className="text-gray-600 dark:text-gray-400 dark:text-gray-500">
          Update the trust information and settings
        </p>
      </div>

      {actionData?.error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-700 dark:bg-red-900/20">
          <div className="font-medium text-red-800 dark:text-red-200">Error</div>
          <div className="mt-1 text-sm text-red-600 dark:text-red-400">{actionData.error}</div>

          {actionData.fieldErrors && Object.keys(actionData.fieldErrors).length > 0 && (
            <div className="mt-3">
              <div className="text-sm font-medium text-red-700 dark:text-red-300">
                Validation Errors:
              </div>
              <ul className="mt-1 list-inside list-disc text-sm text-red-600 dark:text-red-400">
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

      <TrustForm trust={trust as Trust} mode="edit" />
    </div>
  );
}
