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
  formatValidationErrors,
} from "~/lib/validation/asset-schemas";

export async function loader() {
  const userId = "user-nick-001"; // Default user for now
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
      // Financial account specific fields
      institutionName: formData.get("institutionName"),
      accountType: formData.get("accountType"),
      accountNumber: formData.get("accountNumber"),
      routingNumber: formData.get("routingNumber"),
      // Insurance policy specific fields
      policyNumber: formData.get("policyNumber"),
      insuranceCompany: formData.get("insuranceCompany"),
      annualPremium: formData.get("annualPremium"),
      // Homeowners insurance fields
      propertyAddress: formData.get("propertyAddress"),
      coverageAmount: formData.get("coverageAmount"),
      deductible: formData.get("deductible"),
      // Auto insurance fields
      vehicleInfo: formData.get("vehicleInfo"),
      liabilityPerPerson: formData.get("liabilityPerPerson"),
      liabilityPerAccident: formData.get("liabilityPerAccident"),
      collisionDeductible: formData.get("collisionDeductible"),
      comprehensiveDeductible: formData.get("comprehensiveDeductible"),
      // Umbrella insurance fields
      coverageLimit: formData.get("coverageLimit"),
      underlyingPolicies: formData.get("underlyingPolicies"),
      // Business entity fields
      businessName: formData.get("businessName"),
      incorporationType: formData.get("incorporationType"),
      stateOfIncorporation: formData.get("stateOfIncorporation"),
      ein: formData.get("ein"),
      percentageOwned: formData.get("percentageOwned"),
      taxId: formData.get("taxId"),
    };

    // Validate form data with comprehensive schema
    const validatedData = assetFormSchema.parse(rawData);

    // Additional enum validation to ensure type safety
    const validatedCategory = validateAssetCategory(validatedData.category);
    const validatedOwnershipType = validateOwnershipType(validatedData.ownershipType);

    // Build asset details based on category
    const assetDetails: Record<string, unknown> = {};

    // Add financial account specific fields if applicable
    if (validatedCategory === "FINANCIAL_ACCOUNT") {
      assetDetails.institutionName = validatedData.institutionName || "";
      assetDetails.accountType = validatedData.accountType || "";
      assetDetails.accountNumber = validatedData.accountNumber || "";
      assetDetails.routingNumber = validatedData.routingNumber || "";
    }

    // Add insurance policy specific fields if applicable
    if (validatedCategory === "INSURANCE_POLICY") {
      const insuranceType = validatedData.type;

      // Common insurance fields
      if (validatedData.policyNumber) assetDetails.policyNumber = validatedData.policyNumber;
      if (validatedData.insuranceCompany)
        assetDetails.insuranceCompany = validatedData.insuranceCompany;
      if (validatedData.annualPremium)
        assetDetails.annualPremium = parseFloat(validatedData.annualPremium.toString());

      // Type-specific fields
      if (insuranceType === "HOMEOWNERS") {
        if (validatedData.propertyAddress)
          assetDetails.propertyAddress = validatedData.propertyAddress;
        if (validatedData.coverageAmount)
          assetDetails.coverageAmount = parseFloat(validatedData.coverageAmount.toString());
        if (validatedData.deductible)
          assetDetails.deductible = parseFloat(validatedData.deductible.toString());
      } else if (insuranceType === "AUTO") {
        if (validatedData.vehicleInfo) assetDetails.vehicleInfo = validatedData.vehicleInfo;
        if (validatedData.liabilityPerPerson)
          assetDetails.liabilityPerPerson = parseFloat(validatedData.liabilityPerPerson.toString());
        if (validatedData.liabilityPerAccident)
          assetDetails.liabilityPerAccident = parseFloat(
            validatedData.liabilityPerAccident.toString(),
          );
        if (validatedData.collisionDeductible)
          assetDetails.collisionDeductible = parseFloat(
            validatedData.collisionDeductible.toString(),
          );
        if (validatedData.comprehensiveDeductible)
          assetDetails.comprehensiveDeductible = parseFloat(
            validatedData.comprehensiveDeductible.toString(),
          );
      } else if (insuranceType === "UMBRELLA") {
        if (validatedData.coverageLimit)
          assetDetails.coverageLimit = parseFloat(validatedData.coverageLimit.toString());
        if (validatedData.underlyingPolicies)
          assetDetails.underlyingPolicies = validatedData.underlyingPolicies;
      }
    }

    // Add business entity specific fields if applicable
    if (validatedCategory === "BUSINESS_INTEREST") {
      if (validatedData.businessName) assetDetails.businessName = validatedData.businessName;
      if (validatedData.incorporationType)
        assetDetails.incorporationType = validatedData.incorporationType;
      if (validatedData.stateOfIncorporation)
        assetDetails.stateOfIncorporation = validatedData.stateOfIncorporation;
      if (validatedData.ein) assetDetails.ein = validatedData.ein;
      if (validatedData.percentageOwned)
        assetDetails.percentageOwned = parseFloat(validatedData.percentageOwned.toString());
      if (validatedData.taxId) assetDetails.taxId = validatedData.taxId;
    }

    // Create the asset with validated data
    await createAsset({
      name: validatedData.name,
      category: validatedCategory,
      value: validatedData.value,
      type: validatedData.type,
      description: validatedData.description || "",
      ownership: {
        type: validatedOwnershipType,
        trustId: validatedData.trustId || undefined,
        businessEntityId: validatedData.businessEntityId || undefined,
        percentage: validatedData.percentage,
      },
      details: assetDetails,
      userId: "user-nick-001", // Default user for now
    } as Parameters<typeof createAsset>[0]);

    return redirect(`/assets`);
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Use custom error formatter for better user experience
      const formattedErrors = formatValidationErrors(error);
      return json({ errors: formattedErrors }, { status: 400 });
    }

    console.error("Error creating asset:", error);
    return json({ error: "Failed to create asset" }, { status: 500 });
  }
}

export default function NewAsset() {
  const { trusts } = useLoaderData<typeof loader>();

  return (
    <div className="mx-auto max-w-4xl">
      <AssetForm trusts={trusts} mode="create" />
    </div>
  );
}
