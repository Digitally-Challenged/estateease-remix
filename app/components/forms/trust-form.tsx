import { Form, useNavigation } from "@remix-run/react";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { FormField } from "~/components/ui/forms/form-field";
import { Input } from "~/components/ui/forms/input";
import { Select } from "~/components/ui/forms/select";
import { Textarea } from "~/components/ui/forms/textarea";
import { Button } from "~/components/ui/button";
import { BeneficiaryManager } from "~/components/forms/beneficiary-manager";
import { TrusteeManager } from "~/components/forms/trustee-manager";
import type { Trust } from "~/types";
import type { ValidatedBeneficiary, ValidatedTrustee } from "~/lib/validation/trust-schemas";

interface TrustFormProps {
  trust?: Trust;
  mode: "create" | "edit";
}

export function TrustForm({ trust, mode }: TrustFormProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  // Form state
  const [trustType, setTrustType] = useState<string>(trust?.type || "");
  const [beneficiaries, setBeneficiaries] = useState<ValidatedBeneficiary[]>(
    trust?.beneficiaries.map((b) => ({
      id: `${b.name}-${Math.random()}`,
      name: b.name,
      relationship: b.relationship,
      percentage: b.percentage || 0,
      contingent: b.type === "contingent",
      notes: b.conditions || "",
    })) || [],
  );
  const [trustees, setTrustees] = useState<ValidatedTrustee[]>(
    trust?.trustees.map((t) => ({
      id: `${t.name}-${Math.random()}`,
      name: t.name,
      type: t.type === "primary" ? "INDIVIDUAL" : "CORPORATE",
      isPrimary: t.type === "primary",
      isSuccessor: t.type === "successor",
      contactInfo: {
        email: "",
        phone: "",
        address: "",
      },
      notes: "",
    })) || [],
  );

  // Validation state
  const [beneficiaryPercentageError, setBeneficiaryPercentageError] = useState<string>("");

  // Validate beneficiary percentages
  const validateBeneficiaryPercentages = (beneficiaries: ValidatedBeneficiary[]) => {
    const primaryBeneficiaries = beneficiaries.filter((b) => !b.contingent);
    const totalPercentage = primaryBeneficiaries.reduce((sum, b) => sum + b.percentage, 0);

    if (primaryBeneficiaries.length > 0 && Math.abs(totalPercentage - 100) > 0.01) {
      setBeneficiaryPercentageError("Primary beneficiary percentages must sum to 100%");
      return false;
    }

    setBeneficiaryPercentageError("");
    return true;
  };

  // Handle beneficiary changes
  const handleBeneficiariesChange = (newBeneficiaries: ValidatedBeneficiary[]) => {
    setBeneficiaries(newBeneficiaries);
    validateBeneficiaryPercentages(newBeneficiaries);
  };

  // Handle form submission
  const handleSubmit = (event: React.FormEvent) => {
    if (!validateBeneficiaryPercentages(beneficiaries)) {
      event.preventDefault();
      return;
    }

    // Ensure at least one primary trustee
    const primaryTrustees = trustees.filter((t) => t.isPrimary);
    if (primaryTrustees.length === 0) {
      event.preventDefault();
      // You might want to show an error message here
      return;
    }
  };

  return (
    <Form method="post" className="space-y-6" onSubmit={handleSubmit}>
      <input type="hidden" name="intent" value={mode} />
      {mode === "edit" && trust && <input type="hidden" name="trustId" value={trust.id} />}

      {/* Hidden fields for complex data */}
      <input type="hidden" name="beneficiaries" value={JSON.stringify(beneficiaries)} />
      <input type="hidden" name="trustees" value={JSON.stringify(trustees)} />

      <Card>
        <CardHeader>
          <CardTitle>{mode === "create" ? "Create New Trust" : "Edit Trust"}</CardTitle>
          <CardDescription>
            {mode === "create"
              ? "Enter the details for the new trust"
              : "Update the trust information"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField label="Trust Name" required>
              <Input
                name="name"
                defaultValue={trust?.name}
                required
                placeholder="e.g., Coleman Family Revocable Trust"
              />
            </FormField>

            <FormField label="Trust Type" required>
              <Select
                name="type"
                value={trustType}
                onChange={(e) => setTrustType(e.target.value)}
                required
                placeholder="Select trust type"
                options={[
                  { value: "REVOCABLE", label: "Revocable" },
                  { value: "IRREVOCABLE", label: "Irrevocable" },
                ]}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField label="Tax ID (EIN)">
              <Input
                name="taxId"
                defaultValue={trust?.taxId}
                placeholder="XX-XXXXXXX"
                pattern="[0-9]{2}-[0-9]{7}"
                title="Format: XX-XXXXXXX"
              />
            </FormField>

            <FormField label="Date Established">
              <Input
                type="date"
                name="establishedDate"
                defaultValue={
                  trust?.dateCreated ? new Date(trust.dateCreated).toISOString().split("T")[0] : ""
                }
              />
            </FormField>
          </div>

          <FormField label="Trust Purpose">
            <Textarea
              name="purpose"
              defaultValue={trust?.purpose}
              rows={3}
              placeholder="Describe the purpose of this trust..."
            />
          </FormField>

          <FormField label="Description">
            <Textarea
              name="description"
              defaultValue={trust?.notes}
              rows={3}
              placeholder="Additional notes about this trust..."
            />
          </FormField>

          {/* Grantor Information */}
          <div className="border-t pt-4">
            <h3 className="mb-3 text-lg font-medium text-gray-900">Grantor Information</h3>
            <FormField label="Grantor Name" required>
              <Input
                name="grantor"
                defaultValue={trust?.grantor}
                required
                placeholder="Name of the person creating the trust"
              />
            </FormField>
          </div>

          {/* Trustee Management */}
          <div className="border-t pt-4">
            <h3 className="mb-3 text-lg font-medium text-gray-900">Trustees</h3>
            <TrusteeManager trustees={trustees} onChange={setTrustees} />
          </div>

          {/* Beneficiary Management */}
          <div className="border-t pt-4">
            <h3 className="mb-3 text-lg font-medium text-gray-900">Beneficiaries</h3>
            <BeneficiaryManager
              beneficiaries={beneficiaries}
              onChange={handleBeneficiariesChange}
              error={beneficiaryPercentageError}
            />
          </div>

          {/* Legal Information */}
          <div className="border-t pt-4">
            <h3 className="mb-3 text-lg font-medium text-gray-900">Legal Information</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField label="Attorney Name">
                <Input name="attorneyName" placeholder="Name of attorney who created the trust" />
              </FormField>

              <FormField label="Law Firm">
                <Input name="lawFirm" placeholder="Name of law firm" />
              </FormField>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField label="State Established">
                <Input name="establishedState" placeholder="State where trust was established" />
              </FormField>

              <FormField label="Governing Law">
                <Input name="governingLaw" placeholder="Governing law jurisdiction" />
              </FormField>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 border-t pt-4">
            <Button type="button" variant="secondary" onClick={() => window.history.back()}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !!beneficiaryPercentageError}
              loading={isSubmitting}
            >
              {isSubmitting
                ? mode === "create"
                  ? "Creating Trust..."
                  : "Updating Trust..."
                : mode === "create"
                  ? "Create Trust"
                  : "Update Trust"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </Form>
  );
}
