import { Form, useNavigation } from "@remix-run/react";
import { useState, useMemo, memo, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { FormField } from "~/components/ui/forms/form-field";
import { Input } from "~/components/ui/forms/input";
import { Select } from "~/components/ui/forms/select";
import { Textarea } from "~/components/ui/forms/textarea";
import { Button } from "~/components/ui/button";
import type { AnyAsset, Trust, FinancialAccount, InsurancePolicy } from "~/types";
import {
  AssetCategory,
  PropertyType,
  FinancialAccountType,
  InsurancePolicyType,
  BusinessStructureType,
  PersonalPropertyType,
  OwnershipType,
  IncorporationType,
  US_STATES,
} from "~/types/enums";

interface AssetFormProps {
  asset?: AnyAsset;
  trusts: Trust[];
  mode: "create" | "edit";
}

// Helper function to format enum values to human-readable labels
function formatEnumLabel(value: string): string {
  // Handle UPPERCASE enum values
  return value
    .toLowerCase()
    .split("_")
    .map((word) => {
      // Special cases
      if (word === "401k") return "401(k)";
      if (word === "ira") return "IRA";
      if (word === "roth") return "Roth";
      if (word === "llc") return "LLC";
      if (word === "corp") return "Corp";
      // Capitalize first letter
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

export const AssetForm = memo(function AssetForm({ asset, trusts, mode }: AssetFormProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [selectedCategory, setSelectedCategory] = useState<AssetCategory | "">(
    (asset?.category as AssetCategory) || "",
  );
  const [selectedInsuranceType, setSelectedInsuranceType] = useState<InsurancePolicyType | "">(
    asset?.category === AssetCategory.INSURANCE_POLICY && asset && "policyType" in asset
      ? (asset as InsurancePolicy).policyType
      : "",
  );
  const [ownershipType, setOwnershipType] = useState<OwnershipType>(
    (asset?.ownership.type as OwnershipType) || OwnershipType.INDIVIDUAL,
  );

  // Memoized callbacks for performance
  const handleCategoryChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value as AssetCategory | "");
  }, []);

  const handleInsuranceTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedInsuranceType(e.target.value as InsurancePolicyType);
  }, []);

  const handleOwnershipTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setOwnershipType(e.target.value as OwnershipType);
  }, []);

  // Get type options based on selected category
  const typeOptions = useMemo(() => {
    switch (selectedCategory) {
      case AssetCategory.REAL_ESTATE:
        return Object.values(PropertyType).map((type) => ({
          value: type,
          label: formatEnumLabel(type),
        }));
      case AssetCategory.FINANCIAL_ACCOUNT:
        return Object.values(FinancialAccountType).map((type) => ({
          value: type,
          label: formatEnumLabel(type),
        }));
      case AssetCategory.INSURANCE_POLICY:
        return Object.values(InsurancePolicyType).map((type) => ({
          value: type,
          label: formatEnumLabel(type),
        }));
      case AssetCategory.BUSINESS_INTEREST:
        return Object.values(BusinessStructureType).map((type) => ({
          value: type,
          label: formatEnumLabel(type),
        }));
      case AssetCategory.PERSONAL_PROPERTY:
        return Object.values(PersonalPropertyType).map((type) => ({
          value: type,
          label: formatEnumLabel(type),
        }));
      default:
        return [];
    }
  }, [selectedCategory]);

  return (
    <Form method="post" className="space-y-6">
      <input type="hidden" name="intent" value={mode} />
      {mode === "edit" && asset && <input type="hidden" name="assetId" value={asset.id} />}

      <Card>
        <CardHeader>
          <CardTitle>{mode === "create" ? "Add New Asset" : "Edit Asset"}</CardTitle>
          <CardDescription>
            {mode === "create"
              ? "Enter the details for the new asset"
              : "Update the asset information"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Basic Information */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField label="Asset Name" required>
              <Input
                name="name"
                defaultValue={asset?.name}
                required
                placeholder="e.g., 2211 NW Willow, Bentonville"
              />
            </FormField>

            <FormField label="Category" required>
              <Select
                name="category"
                value={selectedCategory}
                onChange={handleCategoryChange}
                required
                placeholder="Select a category"
                options={Object.values(AssetCategory).map((category) => ({
                  value: category,
                  label: formatEnumLabel(category),
                }))}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField label="Current Value" required>
              <Input
                type="number"
                name="value"
                defaultValue={asset?.value?.toString()}
                required
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </FormField>

            <FormField label="Asset Type" required>
              <Select
                name="type"
                defaultValue={(() => {
                  if (!asset) return "";
                  if (asset.category === AssetCategory.INSURANCE_POLICY && "policyType" in asset) {
                    return (asset as InsurancePolicy).policyType;
                  }
                  return asset.type || "";
                })()}
                value={
                  selectedCategory === AssetCategory.INSURANCE_POLICY
                    ? selectedInsuranceType
                    : undefined
                }
                onChange={handleInsuranceTypeChange}
                required
                disabled={!selectedCategory}
                placeholder={selectedCategory ? "Select a type" : "Select a category first"}
                options={typeOptions}
              />
            </FormField>
          </div>

          <FormField label="Description">
            <Textarea
              name="description"
              defaultValue={asset?.description}
              rows={3}
              placeholder="Additional details about the asset..."
            />
          </FormField>

          {/* Financial Account Specific Fields */}
          {selectedCategory === AssetCategory.FINANCIAL_ACCOUNT && (
            <div className="border-t pt-4">
              <h3 className="mb-3 text-lg font-medium text-gray-900">Account Information</h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField label="Institution Name" required>
                  <Input
                    name="institutionName"
                    defaultValue={(() => {
                      if (!asset) return "";
                      if (
                        asset.category === AssetCategory.FINANCIAL_ACCOUNT &&
                        "institutionName" in asset
                      ) {
                        return (
                          (asset as FinancialAccount).institutionName ||
                          (asset as FinancialAccount).institution ||
                          ""
                        );
                      }
                      return (asset.details?.institutionName as string) || "";
                    })()}
                    required
                    placeholder="e.g., Bank of America, Wells Fargo"
                  />
                </FormField>

                <FormField label="Account Type" required>
                  <Select
                    name="accountType"
                    defaultValue={(() => {
                      if (!asset) return "";
                      if (
                        asset.category === AssetCategory.FINANCIAL_ACCOUNT &&
                        "accountType" in asset
                      ) {
                        return (asset as FinancialAccount).accountType;
                      }
                      return (asset.details?.accountType as string) || "";
                    })()}
                    required
                    placeholder="Select account type"
                    options={[
                      { value: "CHECKING", label: "Checking" },
                      { value: "SAVINGS", label: "Savings" },
                      { value: "MONEY_MARKET", label: "Money Market" },
                      { value: "CD", label: "Certificate of Deposit" },
                      { value: "INVESTMENT", label: "Investment" },
                      { value: "RETIREMENT", label: "Retirement" },
                    ]}
                  />
                </FormField>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField label="Account Number" helperText="Last 4 digits only for security">
                  <Input
                    name="accountNumber"
                    defaultValue={(() => {
                      if (!asset) return "";
                      if (
                        asset.category === AssetCategory.FINANCIAL_ACCOUNT &&
                        "accountNumber" in asset
                      ) {
                        return (asset as FinancialAccount).accountNumber || "";
                      }
                      return (asset.details?.accountNumber as string) || "";
                    })()}
                    placeholder="****1234"
                    maxLength={8}
                    pattern="[\*\d]+"
                  />
                </FormField>

                <FormField label="Routing Number" helperText="9-digit routing number">
                  <Input
                    name="routingNumber"
                    defaultValue={(() => {
                      if (!asset) return "";
                      if (
                        asset.category === AssetCategory.FINANCIAL_ACCOUNT &&
                        "routingNumber" in asset
                      ) {
                        return (asset as FinancialAccount).routingNumber || "";
                      }
                      return (asset.details?.routingNumber as string) || "";
                    })()}
                    placeholder="123456789"
                    pattern="\d{9}"
                    maxLength={9}
                  />
                </FormField>
              </div>
            </div>
          )}

          {/* Business Entity Specific Fields */}
          {selectedCategory === AssetCategory.BUSINESS_INTEREST && (
            <div className="border-t pt-4">
              <h3 className="mb-3 text-lg font-medium text-gray-900">
                Business Entity Information
              </h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField label="Business Name" required>
                  <Input
                    name="businessName"
                    defaultValue={(asset?.details?.businessName as string) || ""}
                    required
                    placeholder="e.g., Coleman Construction LLC"
                  />
                </FormField>

                <FormField label="Incorporation Type" required>
                  <Select
                    name="incorporationType"
                    defaultValue={(asset?.details?.incorporationType as string) || ""}
                    required
                    placeholder="Select incorporation type"
                    options={Object.values(IncorporationType).map((type) => ({
                      value: type,
                      label: formatEnumLabel(type),
                    }))}
                  />
                </FormField>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField label="State of Incorporation" required>
                  <Select
                    name="stateOfIncorporation"
                    defaultValue={(asset?.details?.stateOfIncorporation as string) || ""}
                    required
                    placeholder="Select state"
                    options={[...US_STATES]}
                  />
                </FormField>

                <FormField
                  label="EIN (Employer Identification Number)"
                  helperText="Format: XX-XXXXXXX"
                >
                  <Input
                    name="ein"
                    defaultValue={(asset?.details?.ein as string) || ""}
                    placeholder="12-3456789"
                    pattern="\d{2}-\d{7}"
                    maxLength={10}
                  />
                </FormField>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField label="Percentage Owned" required>
                  <Input
                    type="number"
                    name="percentageOwned"
                    defaultValue={asset?.details?.percentageOwned?.toString() || ""}
                    required
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="0.00"
                  />
                </FormField>

                <FormField label="Tax ID">
                  <Input
                    name="taxId"
                    defaultValue={(asset?.details?.taxId as string) || ""}
                    placeholder="Tax identification number"
                  />
                </FormField>
              </div>
            </div>
          )}

          {/* Ownership Information */}
          <div className="border-t pt-4">
            <h3 className="mb-3 text-lg font-medium text-gray-900">Ownership Information</h3>

            <div className="space-y-4">
              <FormField label="Ownership Type" required>
                <Select
                  name="ownershipType"
                  value={ownershipType}
                  onChange={handleOwnershipTypeChange}
                  options={Object.values(OwnershipType).map((type) => ({
                    value: type,
                    label: formatEnumLabel(type),
                  }))}
                />
              </FormField>

              {ownershipType === OwnershipType.TRUST && (
                <FormField label="Select Trust" required>
                  <Select
                    name="trustId"
                    defaultValue={asset?.ownership.trustId}
                    required
                    placeholder="Select a trust"
                    options={trusts.map((trust) => ({
                      value: trust.id,
                      label: trust.name,
                    }))}
                  />
                </FormField>
              )}

              {ownershipType === OwnershipType.BUSINESS && (
                <FormField label="Business Entity Name">
                  <Input
                    name="businessEntityId"
                    defaultValue={asset?.ownership.businessEntityId}
                    placeholder="Enter business entity name"
                  />
                </FormField>
              )}

              <FormField label="Ownership Percentage" required>
                <Input
                  type="number"
                  name="percentage"
                  defaultValue={asset?.ownership.percentage?.toString() || "100"}
                  required
                  min="0"
                  max="100"
                  step="0.01"
                />
              </FormField>
            </div>
          </div>

          {/* Insurance-specific fields */}
          {selectedCategory === AssetCategory.INSURANCE_POLICY && selectedInsuranceType && (
            <div className="border-t pt-4">
              <h3 className="mb-3 text-lg font-medium text-gray-900">Insurance Policy Details</h3>

              {/* Homeowners Insurance Fields */}
              {selectedInsuranceType === InsurancePolicyType.HOMEOWNERS && (
                <div className="space-y-4">
                  <FormField label="Property Address" required>
                    <Input
                      name="propertyAddress"
                      defaultValue={(asset?.details?.propertyAddress as string) || ""}
                      placeholder="123 Main St, City, State ZIP"
                      required
                    />
                  </FormField>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField label="Coverage Amount" required>
                      <Input
                        type="number"
                        name="coverageAmount"
                        defaultValue={asset?.details?.coverageAmount?.toString()}
                        placeholder="500000"
                        min="0"
                        step="1000"
                        required
                      />
                    </FormField>

                    <FormField label="Deductible" required>
                      <Input
                        type="number"
                        name="deductible"
                        defaultValue={asset?.details?.deductible?.toString()}
                        placeholder="1000"
                        min="0"
                        step="100"
                        required
                      />
                    </FormField>
                  </div>

                  <FormField label="Insurance Company">
                    <Input
                      name="insuranceCompany"
                      defaultValue={asset?.details?.insuranceCompany as string | undefined}
                      placeholder="State Farm, Allstate, etc."
                    />
                  </FormField>

                  <FormField label="Policy Number">
                    <Input
                      name="policyNumber"
                      defaultValue={asset?.details?.policyNumber as string | undefined}
                      placeholder="Policy #"
                    />
                  </FormField>
                </div>
              )}

              {/* Auto Insurance Fields */}
              {selectedInsuranceType === InsurancePolicyType.AUTO && (
                <div className="space-y-4">
                  <FormField label="Vehicle Information" required>
                    <Input
                      name="vehicleInfo"
                      defaultValue={asset?.details?.vehicleInfo as string | undefined}
                      placeholder="2020 Toyota Camry, VIN: ..."
                      required
                    />
                  </FormField>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField label="Liability Limit (Per Person)" required>
                      <Input
                        type="number"
                        name="liabilityPerPerson"
                        defaultValue={asset?.details?.liabilityPerPerson?.toString()}
                        placeholder="250000"
                        min="0"
                        step="1000"
                        required
                      />
                    </FormField>

                    <FormField label="Liability Limit (Per Accident)" required>
                      <Input
                        type="number"
                        name="liabilityPerAccident"
                        defaultValue={asset?.details?.liabilityPerAccident?.toString()}
                        placeholder="500000"
                        min="0"
                        step="1000"
                        required
                      />
                    </FormField>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField label="Collision Deductible">
                      <Input
                        type="number"
                        name="collisionDeductible"
                        defaultValue={asset?.details?.collisionDeductible?.toString()}
                        placeholder="500"
                        min="0"
                        step="100"
                      />
                    </FormField>

                    <FormField label="Comprehensive Deductible">
                      <Input
                        type="number"
                        name="comprehensiveDeductible"
                        defaultValue={asset?.details?.comprehensiveDeductible?.toString()}
                        placeholder="500"
                        min="0"
                        step="100"
                      />
                    </FormField>
                  </div>

                  <FormField label="Insurance Company">
                    <Input
                      name="insuranceCompany"
                      defaultValue={asset?.details?.insuranceCompany as string | undefined}
                      placeholder="GEICO, Progressive, etc."
                    />
                  </FormField>

                  <FormField label="Policy Number">
                    <Input
                      name="policyNumber"
                      defaultValue={asset?.details?.policyNumber as string | undefined}
                      placeholder="Policy #"
                    />
                  </FormField>
                </div>
              )}

              {/* Umbrella Insurance Fields */}
              {selectedInsuranceType === InsurancePolicyType.UMBRELLA && (
                <div className="space-y-4">
                  <FormField label="Coverage Limit" required>
                    <Select
                      name="coverageLimit"
                      defaultValue={asset?.details?.coverageLimit?.toString()}
                      required
                      placeholder="Select coverage limit"
                      options={[
                        { value: "1000000", label: "$1 Million" },
                        { value: "2000000", label: "$2 Million" },
                        { value: "3000000", label: "$3 Million" },
                        { value: "4000000", label: "$4 Million" },
                        { value: "5000000", label: "$5 Million" },
                        { value: "10000000", label: "$10 Million" },
                      ]}
                    />
                  </FormField>

                  <FormField
                    label="Underlying Policies"
                    helperText="List the policies covered by this umbrella (e.g., home, auto, boat)"
                  >
                    <Textarea
                      name="underlyingPolicies"
                      defaultValue={asset?.details?.underlyingPolicies as string | undefined}
                      rows={3}
                      placeholder="Home insurance - State Farm Policy #123456&#10;Auto insurance - GEICO Policy #789012"
                    />
                  </FormField>

                  <FormField label="Insurance Company">
                    <Input
                      name="insuranceCompany"
                      defaultValue={asset?.details?.insuranceCompany as string | undefined}
                      placeholder="Insurance company name"
                    />
                  </FormField>

                  <FormField label="Policy Number">
                    <Input
                      name="policyNumber"
                      defaultValue={asset?.details?.policyNumber as string | undefined}
                      placeholder="Policy #"
                    />
                  </FormField>

                  <FormField label="Annual Premium">
                    <Input
                      type="number"
                      name="annualPremium"
                      defaultValue={asset?.details?.annualPremium?.toString()}
                      placeholder="500"
                      min="0"
                      step="1"
                    />
                  </FormField>
                </div>
              )}

              {/* Common fields for all insurance types */}
              {(selectedInsuranceType === InsurancePolicyType.LIFE ||
                selectedInsuranceType === InsurancePolicyType.DISABILITY ||
                selectedInsuranceType === InsurancePolicyType.LONG_TERM_CARE) && (
                <div className="space-y-4">
                  <FormField label="Policy Number">
                    <Input
                      name="policyNumber"
                      defaultValue={asset?.details?.policyNumber as string | undefined}
                      placeholder="Policy #"
                    />
                  </FormField>

                  <FormField label="Insurance Company">
                    <Input
                      name="insuranceCompany"
                      defaultValue={asset?.details?.insuranceCompany as string | undefined}
                      placeholder="Insurance company name"
                    />
                  </FormField>

                  <FormField label="Annual Premium">
                    <Input
                      type="number"
                      name="annualPremium"
                      defaultValue={asset?.details?.annualPremium?.toString()}
                      placeholder="1200"
                      min="0"
                      step="1"
                    />
                  </FormField>
                </div>
              )}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 border-t pt-4">
            <Button type="button" variant="secondary" onClick={() => window.history.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} loading={isSubmitting}>
              {isSubmitting
                ? mode === "create"
                  ? "Creating..."
                  : "Updating..."
                : mode === "create"
                  ? "Create Asset"
                  : "Update Asset"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </Form>
  );
});
