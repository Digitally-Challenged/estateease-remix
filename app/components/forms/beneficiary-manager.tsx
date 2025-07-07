import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/forms/input";
import { FormField } from "~/components/ui/forms/form-field";
import { Select } from "~/components/ui/forms/select";
import { Textarea } from "~/components/ui/forms/textarea";
import { Plus, Trash2 } from "lucide-react";
import type { ValidatedBeneficiary } from "~/lib/validation/trust-schemas";

interface BeneficiaryManagerProps {
  beneficiaries: ValidatedBeneficiary[];
  onChange: (beneficiaries: ValidatedBeneficiary[]) => void;
  error?: string;
}

export function BeneficiaryManager({ beneficiaries, onChange, error }: BeneficiaryManagerProps) {
  const [nextId, setNextId] = useState(beneficiaries.length + 1);

  const addBeneficiary = () => {
    const newBeneficiary: ValidatedBeneficiary = {
      id: `beneficiary-${nextId}`,
      name: '',
      relationship: '',
      percentage: 0,
      contingent: false,
      notes: ''
    };
    
    onChange([...beneficiaries, newBeneficiary]);
    setNextId(nextId + 1);
  };

  const removeBeneficiary = (id: string) => {
    onChange(beneficiaries.filter(b => b.id !== id));
  };

  const updateBeneficiary = (id: string, updates: Partial<ValidatedBeneficiary>) => {
    onChange(beneficiaries.map(b => 
      b.id === id ? { ...b, ...updates } : b
    ));
  };

  // Calculate total percentage for primary beneficiaries
  const primaryBeneficiaries = beneficiaries.filter(b => !b.contingent);
  const totalPercentage = primaryBeneficiaries.reduce((sum, b) => sum + b.percentage, 0);

  return (
    <div className="space-y-4">
      {/* Add Beneficiary Button */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Primary beneficiaries total: {totalPercentage.toFixed(1)}%
          {error && <div className="text-red-600 mt-1">{error}</div>}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addBeneficiary}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Beneficiary
        </Button>
      </div>

      {/* Beneficiary List */}
      <div className="space-y-4">
        {beneficiaries.map((beneficiary, index) => (
          <div key={beneficiary.id} className="border rounded-lg p-4 bg-gray-50">
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-medium text-gray-900">
                Beneficiary {index + 1} {beneficiary.contingent && '(Contingent)'}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  onChange={(e) => updateBeneficiary(beneficiary.id, { relationship: e.target.value })}
                  placeholder="e.g., Spouse, Child, Sibling"
                  required
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <FormField label="Percentage" required>
                <Input
                  type="number"
                  value={beneficiary.percentage}
                  onChange={(e) => updateBeneficiary(beneficiary.id, { percentage: Number(e.target.value) })}
                  min="0"
                  max="100"
                  step="0.1"
                  required
                />
              </FormField>

              <FormField label="Beneficiary Type">
                <Select
                  value={beneficiary.contingent ? 'contingent' : 'primary'}
                  onChange={(e) => updateBeneficiary(beneficiary.id, { contingent: e.target.value === 'contingent' })}
                  options={[
                    { value: 'primary', label: 'Primary' },
                    { value: 'contingent', label: 'Contingent' }
                  ]}
                />
              </FormField>
            </div>

            <div className="mt-4">
              <FormField label="Notes">
                <Textarea
                  value={beneficiary.notes || ''}
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
        <div className="text-center py-8 text-gray-500">
          No beneficiaries added yet. Click &quot;Add Beneficiary&quot; to get started.
        </div>
      )}
    </div>
  );
}