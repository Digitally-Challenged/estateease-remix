import React, { useState, useEffect } from "react";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { Modal, ModalFooter } from "~/components/ui/modal";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/forms/input";
import { Select } from "~/components/ui/forms/select";
import { Textarea } from "~/components/ui/forms/textarea";
import { FormField } from "~/components/ui/forms/form-field";
import { Checkbox } from "~/components/ui/forms/checkbox";

export interface FamilyMember {
  id?: string;
  name: string;
  relationship: string;
  dateOfBirth?: string;
  isMinor: boolean;
  isDependent: boolean;
  primaryPhone?: string;
  secondaryPhone?: string;
  email?: string;
  preferredContact?: string;
  street1?: string;
  street2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  notes?: string;
}

export interface FamilyMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member?: FamilyMember | null;
  mode: 'create' | 'edit';
}

const relationshipOptions = [
  { value: 'spouse', label: 'Spouse' },
  { value: 'child', label: 'Child' },
  { value: 'parent', label: 'Parent' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'grandchild', label: 'Grandchild' },
  { value: 'grandparent', label: 'Grandparent' },
  { value: 'niece_nephew', label: 'Niece/Nephew' },
  { value: 'aunt_uncle', label: 'Aunt/Uncle' },
  { value: 'cousin', label: 'Cousin' },
  { value: 'in_law', label: 'In-Law' },
  { value: 'step_relative', label: 'Step Relative' },
  { value: 'other', label: 'Other' },
];

const contactMethods = [
  { value: 'phone', label: 'Phone' },
  { value: 'email', label: 'Email' },
  { value: 'text', label: 'Text Message' },
  { value: 'mail', label: 'Mail' },
];

const stateOptions = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
];

export function FamilyMemberModal({ isOpen, onClose, member, mode }: FamilyMemberModalProps) {
  const navigation = useNavigation();
  const actionData = useActionData();
  const isSubmitting = navigation.state === "submitting";

  const [formData, setFormData] = useState<FamilyMember>({
    name: '',
    relationship: '',
    dateOfBirth: '',
    isMinor: false,
    isDependent: false,
    primaryPhone: '',
    secondaryPhone: '',
    email: '',
    preferredContact: 'phone',
    street1: '',
    street2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
    notes: '',
  });

  useEffect(() => {
    if (member) {
      setFormData(member);
    } else {
      setFormData({
        name: '',
        relationship: '',
        dateOfBirth: '',
        isMinor: false,
        isDependent: false,
        primaryPhone: '',
        secondaryPhone: '',
        email: '',
        preferredContact: 'phone',
        street1: '',
        street2: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'USA',
        notes: '',
      });
    }
  }, [member]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string) => (checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const calculateAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  useEffect(() => {
    if (formData.dateOfBirth) {
      const age = calculateAge(formData.dateOfBirth);
      if (age !== null) {
        setFormData(prev => ({ ...prev, isMinor: age < 18 }));
      }
    }
  }, [formData.dateOfBirth]);

  return (
    <Modal
      open={isOpen}
      onOpenChange={onClose}
      size="lg"
      title={mode === 'create' ? 'Add Family Member' : 'Edit Family Member'}
      description={mode === 'create' ? 'Add a new family member to your estate plan' : 'Update family member information'}
    >
      <Form method="post" className="space-y-6">
        <input type="hidden" name="action" value={mode === 'create' ? 'create_family_member' : 'update_family_member'} />
        {member?.id && <input type="hidden" name="id" value={member.id} />}

        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Basic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Full Name" required error={actionData?.errors?.name}>
              <Input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="John Doe"
                required
              />
            </FormField>

            <FormField label="Relationship" required error={actionData?.errors?.relationship}>
              <Select
                name="relationship"
                value={formData.relationship}
                onChange={handleInputChange}
                required
              >
                <option value="">Select relationship</option>
                {relationshipOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField label="Date of Birth" error={actionData?.errors?.dateOfBirth}>
              <Input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
              />
            </FormField>

            <div className="space-y-2">
              <Checkbox
                id="isMinor"
                name="isMinor"
                checked={formData.isMinor}
                onCheckedChange={handleCheckboxChange('isMinor')}
                disabled={!!formData.dateOfBirth}
              >
                Minor (under 18)
              </Checkbox>
              
              <Checkbox
                id="isDependent"
                name="isDependent"
                checked={formData.isDependent}
                onCheckedChange={handleCheckboxChange('isDependent')}
              >
                Financial dependent
              </Checkbox>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Contact Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Primary Phone" error={actionData?.errors?.primaryPhone}>
              <Input
                type="tel"
                name="primaryPhone"
                value={formData.primaryPhone}
                onChange={handleInputChange}
                placeholder="(555) 123-4567"
              />
            </FormField>

            <FormField label="Secondary Phone" error={actionData?.errors?.secondaryPhone}>
              <Input
                type="tel"
                name="secondaryPhone"
                value={formData.secondaryPhone}
                onChange={handleInputChange}
                placeholder="(555) 987-6543"
              />
            </FormField>

            <FormField label="Email" error={actionData?.errors?.email}>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="john.doe@example.com"
              />
            </FormField>

            <FormField label="Preferred Contact Method" error={actionData?.errors?.preferredContact}>
              <Select
                name="preferredContact"
                value={formData.preferredContact}
                onChange={handleInputChange}
              >
                {contactMethods.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>
        </div>

        {/* Address */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Address</h3>
          
          <div className="space-y-4">
            <FormField label="Street Address" error={actionData?.errors?.street1}>
              <Input
                name="street1"
                value={formData.street1}
                onChange={handleInputChange}
                placeholder="123 Main Street"
              />
            </FormField>

            <FormField label="Address Line 2" error={actionData?.errors?.street2}>
              <Input
                name="street2"
                value={formData.street2}
                onChange={handleInputChange}
                placeholder="Apt 4B"
              />
            </FormField>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <FormField label="City" error={actionData?.errors?.city} containerClassName="col-span-2">
                <Input
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="New York"
                />
              </FormField>

              <FormField label="State" error={actionData?.errors?.state}>
                <Select
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                >
                  <option value="">Select</option>
                  {stateOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.value}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField label="ZIP Code" error={actionData?.errors?.zipCode}>
                <Input
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  placeholder="10001"
                />
              </FormField>
            </div>

            <FormField label="Country" error={actionData?.errors?.country}>
              <Input
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                placeholder="USA"
              />
            </FormField>
          </div>
        </div>

        {/* Notes */}
        <FormField label="Notes" error={actionData?.errors?.notes}>
          <Textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="Additional information about this family member..."
            rows={3}
          />
        </FormField>

        <ModalFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {mode === 'create' ? 'Add Family Member' : 'Save Changes'}
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
}