import { type ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { AssetForm } from "~/components/forms/asset-form";
import { getTrusts } from "~/lib/dal";
import { createAsset } from "~/lib/dal-crud";
import { z } from "zod";
import { 
  assetFormSchema, 
  validateAssetCategory, 
  validateOwnershipType,
  formatValidationErrors 
} from "~/lib/validation/asset-schemas";

export async function loader() {
  const userId = 'user-nick-001'; // Default user for now
  const trusts = await getTrusts(userId);
  
  return json({ trusts });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  
  if (intent !== "create") {
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
    
    // Create the asset with validated data
    await createAsset({
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
      userId: 'user-nick-001', // Default user for now
    } as Parameters<typeof createAsset>[0]);
    
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
    
    console.error("Error creating asset:", error);
    return json(
      { error: "Failed to create asset" },
      { status: 500 }
    );
  }
}

export default function NewAsset() {
  const { trusts } = useLoaderData<typeof loader>();
  
  return (
    <div className="max-w-4xl mx-auto">
      <AssetForm trusts={trusts} mode="create" />
    </div>
  );
}