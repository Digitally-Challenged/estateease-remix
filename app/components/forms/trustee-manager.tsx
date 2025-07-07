import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/forms/input";
import { FormField } from "~/components/ui/forms/form-field";
import { Select } from "~/components/ui/forms/select";
import { Textarea } from "~/components/ui/forms/textarea";
import { Plus, Trash2 } from "lucide-react";
import type { ValidatedTrustee } from "~/lib/validation/trust-schemas";

interface TrusteeManagerProps {
  trustees: ValidatedTrustee[];
  onChange: (trustees: ValidatedTrustee[]) => void;
}

export function TrusteeManager({ trustees, onChange }: TrusteeManagerProps) {
  const [nextId, setNextId] = useState(trustees.length + 1);

  const addTrustee = () => {
    const newTrustee: ValidatedTrustee = {
      id: `trustee-${nextId}`,
      name: '',
      type: 'INDIVIDUAL',
      isPrimary: false,
      isSuccessor: false,
      contactInfo: {
        email: '',
        phone: '',
        address: ''
      },
      notes: ''
    };
    
    onChange([...trustees, newTrustee]);
    setNextId(nextId + 1);
  };

  const removeTrustee = (id: string) => {
    onChange(trustees.filter(t => t.id !== id));
  };

  const updateTrustee = (id: string, updates: Partial<ValidatedTrustee>) => {
    onChange(trustees.map(t => 
      t.id === id ? { ...t, ...updates } : t
    ));
  };

  const updateTrusteeContactInfo = (id: string, contactUpdates: Partial<ValidatedTrustee['contactInfo']>) => {
    onChange(trustees.map(t => 
      t.id === id ? { 
        ...t, 
        contactInfo: { ...t.contactInfo, ...contactUpdates }
      } : t
    ));
  };

  const primaryTrustees = trustees.filter(t => t.isPrimary);

  return (
    <div className="space-y-4">
      {/* Add Trustee Button */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Primary trustees: {primaryTrustees.length}
          {primaryTrustees.length === 0 && (
            <span className="text-red-600 ml-2">At least one primary trustee is required</span>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addTrustee}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Trustee
        </Button>
      </div>

      {/* Trustee List */}
      <div className="space-y-4">
        {trustees.map((trustee, index) => (
          <div key={trustee.id} className="border rounded-lg p-4 bg-gray-50">
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-medium text-gray-900">
                Trustee {index + 1}
                {trustee.isPrimary && ' (Primary)'}
                {trustee.isSuccessor && ' (Successor)'}
              </h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeTrustee(trustee.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Name" required>
                <Input
                  value={trustee.name}
                  onChange={(e) => updateTrustee(trustee.id, { name: e.target.value })}
                  placeholder="Trustee name"
                  required
                />
              </FormField>

              <FormField label="Type" required>
                <Select
                  value={trustee.type}
                  onChange={(e) => updateTrustee(trustee.id, { type: e.target.value as ValidatedTrustee['type'] })}
                  options={[
                    { value: 'INDIVIDUAL', label: 'Individual' },
                    { value: 'CORPORATE', label: 'Corporate' },
                    { value: 'CO_TRUSTEE', label: 'Co-Trustee' }
                  ]}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <FormField label="Role">
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={trustee.isPrimary}
                      onChange={(e) => updateTrustee(trustee.id, { isPrimary: e.target.checked })}
                      className="mr-2"
                    />
                    Primary Trustee
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={trustee.isSuccessor}
                      onChange={(e) => updateTrustee(trustee.id, { isSuccessor: e.target.checked })}
                      className="mr-2"
                    />
                    Successor Trustee
                  </label>
                </div>
              </FormField>

              <FormField label="Email">
                <Input
                  type="email"
                  value={trustee.contactInfo?.email || ''}
                  onChange={(e) => updateTrusteeContactInfo(trustee.id, { email: e.target.value })}
                  placeholder="trustee@example.com"
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <FormField label="Phone">
                <Input
                  type="tel"
                  value={trustee.contactInfo?.phone || ''}
                  onChange={(e) => updateTrusteeContactInfo(trustee.id, { phone: e.target.value })}
                  placeholder="(555) 123-4567"
                />
              </FormField>

              <FormField label="Address">
                <Input
                  value={trustee.contactInfo?.address || ''}
                  onChange={(e) => updateTrusteeContactInfo(trustee.id, { address: e.target.value })}
                  placeholder="Mailing address"
                />
              </FormField>
            </div>

            <div className="mt-4">
              <FormField label="Notes">
                <Textarea
                  value={trustee.notes || ''}
                  onChange={(e) => updateTrustee(trustee.id, { notes: e.target.value })}
                  placeholder="Additional notes about this trustee..."
                  rows={2}
                />
              </FormField>
            </div>
          </div>
        ))}
      </div>

      {trustees.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No trustees added yet. Click &quot;Add Trustee&quot; to get started.
        </div>
      )}
    </div>
  );
}