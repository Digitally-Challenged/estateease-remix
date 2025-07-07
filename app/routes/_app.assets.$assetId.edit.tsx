import { type ActionFunctionArgs, type LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { AssetForm } from "~/components/forms/asset-form";
import { getAsset, getTrusts } from "~/lib/dal";
import { updateAsset, deleteAsset } from "~/lib/dal-crud";
import { z } from "zod";
import { 
  assetFormSchema, 
  validateAssetCategory, 
  validateOwnershipType,
  formatValidationErrors 
} from "~/lib/validation/asset-schemas";
import type { AnyEnhancedAsset } from "~/types/assets";

export async function loader({ params }: LoaderFunctionArgs) {
  const { assetId } = params;
  if (!assetId) {
    throw new Response("Asset ID is required", { status: 400 });
  }
  
  const userId = 'user-nick-001'; // Default user for now
  const [asset, trusts] = await Promise.all([
    getAsset(assetId),
    getTrusts(userId)
  ]);
  
  if (!asset) {
    throw new Response("Asset not found", { status: 404 });
  }
  
  return json({ asset, trusts });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { assetId } = params;
  if (!assetId) {
    return json({ error: "Asset ID is required" }, { status: 400 });
  }
  
  const formData = await request.formData();
  const intent = formData.get("intent");
  
  if (intent === "delete") {
    await deleteAsset(assetId);
    return redirect("/assets");
  }
  
  if (intent !== "edit") {
    return json({ error: "Invalid intent" }, { status: 400 });
  }
  
  try {
    // Parse and validate form data using new validation schema
    const rawData = {
      name: formData.get("name"),
      category: formData.get("category"),
      value: formData.get("value"),
      type: formData.get("type"),
      description: formData.get("description"),
      ownershipType: formData.get("ownershipType"),
      trustId: formData.get("trustId"),
      businessEntityId: formData.get("businessEntityId"),
      percentage: formData.get("percentage"),
    };
    
    // Validate form data with comprehensive schema
    const validatedData = assetFormSchema.parse(rawData);
    
    // Additional enum validation to ensure type safety
    const validatedCategory = validateAssetCategory(validatedData.category);
    const validatedOwnershipType = validateOwnershipType(validatedData.ownershipType);
    
    // Update the asset with validated data
    await updateAsset(assetId, {
      name: validatedData.name,
      category: validatedCategory,
      value: validatedData.value,
      type: validatedData.type,
      description: validatedData.description || '',
      ownership: {
        type: validatedOwnershipType,
        trustId: validatedData.trustId || undefined,
        businessEntityId: validatedData.businessEntityId || undefined,
        percentage: validatedData.percentage,
      },
    } as Partial<AnyEnhancedAsset>);
    
    return redirect(`/assets`);
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Use custom error formatter for better user experience
      const formattedErrors = formatValidationErrors(error);
      return json(
        { errors: formattedErrors },
        { status: 400 }
      );
    }
    
    console.error("Error updating asset:", error);
    return json(
      { error: "Failed to update asset" },
      { status: 500 }
    );
  }
}

export default function EditAsset() {
  const { asset, trusts } = useLoaderData<typeof loader>();
  
  return (
    <div className="max-w-4xl mx-auto">
      <AssetForm asset={asset} trusts={trusts} mode="edit" />
      
      {/* Delete button */}
      <form method="post" className="mt-6">
        <input type="hidden" name="intent" value="delete" />
        <button
          type="submit"
          onClick={(e) => {
            if (!confirm("Are you sure you want to delete this asset?")) {
              e.preventDefault();
            }
          }}
          className="px-4 py-2 text-red-600 border border-red-600 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Delete Asset
        </button>
      </form>
    </div>
  );
}