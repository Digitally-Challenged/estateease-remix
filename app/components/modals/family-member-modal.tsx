import { useState, useEffect } from "react";
import X from "lucide-react/dist/esm/icons/x";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/forms/input";
import { Select } from "~/components/ui/forms/select";
import { Textarea } from "~/components/ui/forms/textarea";
import { FormField } from "~/components/ui/forms/form-field";
import { useFetcher } from "@remix-run/react";
import { FamilyRelationship } from "~/types/enums";
import type { FamilyMember } from "~/types/people";

interface FamilyMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member?: FamilyMember | null;
  onSuccess?: () => void;
}

const RELATIONSHIP_OPTIONS = Object.values(FamilyRelationship).map((value) => ({
  value,
  label: value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase()),
}));

const US_STATES = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
];

interface ActionData {
  error?: string;
  success?: boolean;
}

export function FamilyMemberModal({ isOpen, onClose, member, onSuccess }: FamilyMemberModalProps) {
  const fetcher = useFetcher<ActionData>();
  const isEditing = !!member;

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    suffix: "",
    relationship: "",
    email: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    birthDate: "",
    notes: "",
  });

  // Reset form when member changes
  useEffect(() => {
    if (member) {
      setFormData({
        firstName: member.firstName || "",
        lastName: member.lastName || "",
        middleName: member.middleName || "",
        suffix: member.suffix || "",
        relationship: member.relationship || "",
        email: member.contactInfo?.email || "",
        phone: member.contactInfo?.phone || "",
        addressLine1: member.contactInfo?.addressLine1 || "",
        addressLine2: member.contactInfo?.addressLine2 || "",
        city: member.contactInfo?.city || "",
        state: member.contactInfo?.state || "",
        postalCode: member.contactInfo?.postalCode || "",
        birthDate: member.birthDate || "",
        notes: member.notes || "",
      });
    } else {
      // Reset form for new member
      setFormData({
        firstName: "",
        lastName: "",
        middleName: "",
        suffix: "",
        relationship: "",
        email: "",
        phone: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        postalCode: "",
        birthDate: "",
        notes: "",
      });
    }
  }, [member]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const submitData = {
      ...formData,
      intent: isEditing ? "update" : "create",
      familyMemberId: member?.id || undefined,
    };

    // Remove undefined values before submission
    const cleanedData = Object.fromEntries(
      Object.entries(submitData).filter(([, v]) => v !== undefined),
    );

    const submitFormData = new FormData();
    Object.entries(cleanedData).forEach(([key, value]) => {
      submitFormData.append(key, String(value));
    });

    fetcher.submit(submitFormData, {
      method: "POST",
      action: "/family",
    });
  };

  // Handle successful submission
  useEffect(() => {
    if (fetcher.data?.success) {
      onSuccess?.();
      onClose();
    }
  }, [fetcher.data, onSuccess, onClose]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  const isSubmitting = fetcher.state === "submitting";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            onClose();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Close modal"
      />
      <div className="relative mx-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-lg dark:bg-gray-800">
        <div className="sticky top-0 flex items-center justify-between border-b bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="text-xl font-semibold">
            {isEditing ? "Edit Family Member" : "Add Family Member"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
            disabled={isSubmitting}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Error display */}
          {fetcher.data?.error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-600">{fetcher.data.error}</p>
            </div>
          )}

          {/* Personal Information */}
          <div className="space-y-6">
            <div>
              <h3 className="mb-4 text-lg font-medium">Personal Information</h3>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="First Name" required>
                  <Input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                  />
                </FormField>

                <FormField label="Last Name" required>
                  <Input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                  />
                </FormField>

                <FormField label="Middle Name">
                  <Input
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                  />
                </FormField>

                <FormField label="Suffix">
                  <Input
                    name="suffix"
                    value={formData.suffix}
                    onChange={handleInputChange}
                    placeholder="Jr., Sr., III, etc."
                    disabled={isSubmitting}
                  />
                </FormField>

                <FormField label="Relationship" required>
                  <Select
                    name="relationship"
                    value={formData.relationship}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                    options={[{ value: "", label: "Select relationship" }, ...RELATIONSHIP_OPTIONS]}
                  />
                </FormField>

                <FormField label="Birth Date">
                  <Input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                  />
                </FormField>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="mb-4 text-lg font-medium">Contact Information</h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Email">
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                    />
                  </FormField>

                  <FormField label="Phone">
                    <Input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="(555) 123-4567"
                      disabled={isSubmitting}
                    />
                  </FormField>
                </div>

                <FormField label="Address Line 1">
                  <Input
                    name="addressLine1"
                    value={formData.addressLine1}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                  />
                </FormField>

                <FormField label="Address Line 2">
                  <Input
                    name="addressLine2"
                    value={formData.addressLine2}
                    onChange={handleInputChange}
                    placeholder="Apartment, suite, etc."
                    disabled={isSubmitting}
                  />
                </FormField>

                <div className="grid grid-cols-6 gap-4">
                  <div className="col-span-3">
                    <FormField label="City">
                      <Input
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                      />
                    </FormField>
                  </div>

                  <div className="col-span-2">
                    <FormField label="State">
                      <Select
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                        options={[{ value: "", label: "Select state" }, ...US_STATES]}
                      />
                    </FormField>
                  </div>

                  <div className="col-span-1">
                    <FormField label="Zip">
                      <Input
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        placeholder="12345"
                        maxLength={10}
                        disabled={isSubmitting}
                      />
                    </FormField>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <FormField label="Notes">
                <Textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Any additional information..."
                  disabled={isSubmitting}
                />
              </FormField>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-3 border-t pt-6 dark:border-gray-700">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : isEditing ? "Update" : "Add"} Family Member
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
