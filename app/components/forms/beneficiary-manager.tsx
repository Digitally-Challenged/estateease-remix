import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/forms/input";
import { FormField } from "~/components/ui/forms/form-field";
import { Select } from "~/components/ui/forms/select";
import { Textarea } from "~/components/ui/forms/textarea";
import Plus from "lucide-react/dist/esm/icons/plus";
import Trash2 from "lucide-react/dist/esm/icons/trash-2";
import type { ValidatedBeneficiary } from "~/lib/validation/trust-schemas";

interface BeneficiaryManagerProps {
  beneficiaries: ValidatedBeneficiary[];
  onChange: (beneficiaries: ValidatedBeneficiary[]) => void;
  error?: string;
}

export function BeneficiaryManager({ beneficiaries, onChange, error }: BeneficiaryManagerProps) {
  const addBeneficiary = () => {
    const newBeneficiary: ValidatedBeneficiary = {
      id: `beneficiary-${Date.now()}`, // Use timestamp for unique ID
      name: "",
      relationship: "",
      percentage: 0,
      contingent: false,
      notes: "",
    };

    onChange([...beneficiaries, newBeneficiary]);
  };

  const removeBeneficiary = (id: string) => {
    onChange(beneficiaries.filter((b) => b.id !== id));
  };

  const updateBeneficiary = (id: string, updates: Partial<ValidatedBeneficiary>) => {
    onChange(beneficiaries.map((b) => (b.id === id ? { ...b, ...updates } : b)));
  };

  // Calculate total percentage for primary beneficiaries
  const primaryBeneficiaries = beneficiaries.filter((b) => !b.contingent);
  const totalPercentage = primaryBeneficiaries.reduce((sum, b) => sum + b.percentage, 0);

  return (
    <div className="space-y-4">
      {/* Add Beneficiary Button */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Primary beneficiaries total: {totalPercentage.toFixed(1)}%
          {error && <div className="mt-1 text-red-600">{error}</div>}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={addBeneficiary}>
          <Plus className="mr-2 h-4 w-4" />
          Add Beneficiary
        </Button>
      </div>

      {/* Beneficiary List */}
      <div className="space-y-4">
        {beneficiaries.map((beneficiary, index) => (
          <div key={beneficiary.id} className="rounded-lg border bg-gray-50 p-4">
            <div className="mb-3 flex items-start justify-between">
              <h4 className="font-medium text-gray-900">
                Beneficiary {index + 1} {beneficiary.contingent && "(Contingent)"}
              </h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeBeneficiary(beneficiary.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField label="Name" required>
                <Input
                  value={beneficiary.name}
                  onChange={(e) => updateBeneficiary(beneficiary.id, { name: e.target.value })}
                  placeholder="Beneficiary name"
                  required
                />
              </FormField>

              <FormField label="Relationship" required>
                <Input
                  value={beneficiary.relationship}
                  onChange={(e) =>
                    updateBeneficiary(beneficiary.id, { relationship: e.target.value })
                  }
                  placeholder="e.g., Spouse, Child, Sibling"
                  required
                />
              </FormField>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField label="Percentage" required>
                <Input
                  type="number"
                  value={beneficiary.percentage.toString()}
                  onChange={(e) =>
                    updateBeneficiary(beneficiary.id, { percentage: Number(e.target.value) })
                  }
                  min="0"
                  max="100"
                  step="0.1"
                  required
                />
              </FormField>

              <FormField label="Beneficiary Type">
                <Select
                  value={beneficiary.contingent ? "contingent" : "primary"}
                  onChange={(e) =>
                    updateBeneficiary(beneficiary.id, {
                      contingent: e.target.value === "contingent",
                    })
                  }
                  options={[
                    { value: "primary", label: "Primary" },
                    { value: "contingent", label: "Contingent" },
                  ]}
                />
              </FormField>
            </div>

            <div className="mt-4">
              <FormField label="Notes">
                <Textarea
                  value={beneficiary.notes || ""}
                  onChange={(e) => updateBeneficiary(beneficiary.id, { notes: e.target.value })}
                  placeholder="Additional notes or conditions..."
                  rows={2}
                />
              </FormField>
            </div>
          </div>
        ))}
      </div>

      {beneficiaries.length === 0 && (
        <div className="py-8 text-center text-gray-500">
          No beneficiaries added yet. Click &quot;Add Beneficiary&quot; to get started.
        </div>
      )}
    </div>
  );
}
