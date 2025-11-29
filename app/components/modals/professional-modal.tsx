import React, { useState, useEffect } from "react";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { Modal, ModalFooter } from "~/components/ui/modal";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/forms/input";
import { Select } from "~/components/ui/forms/select";
import { Textarea } from "~/components/ui/forms/textarea";
import { FormField } from "~/components/ui/forms/form-field";
import { Checkbox } from "~/components/ui/forms/checkbox";
import { Badge } from "~/components/ui/badge";

export interface Professional {
  id?: string;
  name: string;
  professionalType: string;
  firm?: string;
  title?: string;
  specializations: string[];
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
  credentials?: string[];
  yearsExperience?: number;
  isPreferredProvider: boolean;
  notes?: string;
}

export interface ProfessionalModalProps {
  isOpen: boolean;
  onClose: () => void;
  professional?: Professional | null;
  mode: "create" | "edit";
}

const professionalTypes = [
  { value: "attorney", label: "Attorney" },
  { value: "cpa", label: "CPA/Tax Professional" },
  { value: "financial_advisor", label: "Financial Advisor" },
  { value: "insurance_agent", label: "Insurance Agent" },
  { value: "real_estate_agent", label: "Real Estate Agent" },
  { value: "banker", label: "Banker" },
  { value: "trust_officer", label: "Trust Officer" },
  { value: "investment_manager", label: "Investment Manager" },
  { value: "business_broker", label: "Business Broker" },
  { value: "appraiser", label: "Appraiser" },
  { value: "other", label: "Other Professional" },
];

const attorneySpecializations = [
  "Estate Planning",
  "Tax Law",
  "Business Law",
  "Real Estate Law",
  "Family Law",
  "Probate",
  "Elder Law",
  "Asset Protection",
  "Trusts & Estates",
  "Corporate Law",
];

const cpaSpecializations = [
  "Tax Planning",
  "Estate Tax",
  "Business Taxation",
  "Tax Preparation",
  "Audit",
  "Financial Reporting",
  "International Tax",
  "Non-Profit Tax",
  "Tax Strategy",
  "IRS Representation",
];

const financialAdvisorSpecializations = [
  "Wealth Management",
  "Retirement Planning",
  "Investment Management",
  "Financial Planning",
  "Risk Management",
  "Portfolio Management",
  "Alternative Investments",
  "Trust Services",
  "Charitable Planning",
  "Insurance Planning",
];

const contactMethods = [
  { value: "phone", label: "Phone" },
  { value: "email", label: "Email" },
  { value: "text", label: "Text Message" },
  { value: "mail", label: "Mail" },
];

const stateOptions = [
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
  errors?: Record<string, string>;
  success?: boolean;
}

export function ProfessionalModal({ isOpen, onClose, professional, mode }: ProfessionalModalProps) {
  const navigation = useNavigation();
  const actionData = useActionData<ActionData>();
  const isSubmitting = navigation.state === "submitting";

  const [formData, setFormData] = useState<Professional>({
    name: "",
    professionalType: "",
    firm: "",
    title: "",
    specializations: [],
    primaryPhone: "",
    secondaryPhone: "",
    email: "",
    preferredContact: "phone",
    street1: "",
    street2: "",
    city: "",
    state: "",
    zipCode: "",
    country: "USA",
    credentials: [],
    yearsExperience: 0,
    isPreferredProvider: false,
    notes: "",
  });

  const [newSpecialization, setNewSpecialization] = useState("");
  const [newCredential, setNewCredential] = useState("");

  useEffect(() => {
    if (professional) {
      setFormData(professional);
    } else {
      setFormData({
        name: "",
        professionalType: "",
        firm: "",
        title: "",
        specializations: [],
        primaryPhone: "",
        secondaryPhone: "",
        email: "",
        preferredContact: "phone",
        street1: "",
        street2: "",
        city: "",
        state: "",
        zipCode: "",
        country: "USA",
        credentials: [],
        yearsExperience: 0,
        isPreferredProvider: false,
        notes: "",
      });
    }
  }, [professional]);

  const getSpecializationOptions = () => {
    switch (formData.professionalType) {
      case "attorney":
        return attorneySpecializations;
      case "cpa":
        return cpaSpecializations;
      case "financial_advisor":
        return financialAdvisorSpecializations;
      default:
        return [];
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [name]: e.target.checked }));
  };

  const handleAddSpecialization = () => {
    if (newSpecialization && !formData.specializations.includes(newSpecialization)) {
      setFormData((prev) => ({
        ...prev,
        specializations: [...prev.specializations, newSpecialization],
      }));
      setNewSpecialization("");
    }
  };

  const handleRemoveSpecialization = (spec: string) => {
    setFormData((prev) => ({
      ...prev,
      specializations: prev.specializations.filter((s) => s !== spec),
    }));
  };

  const handleAddCredential = () => {
    if (newCredential && !formData.credentials?.includes(newCredential)) {
      setFormData((prev) => ({
        ...prev,
        credentials: [...(prev.credentials || []), newCredential],
      }));
      setNewCredential("");
    }
  };

  const handleRemoveCredential = (cred: string) => {
    setFormData((prev) => ({
      ...prev,
      credentials: prev.credentials?.filter((c) => c !== cred) || [],
    }));
  };

  return (
    <Modal
      open={isOpen}
      onOpenChange={onClose}
      size="xl"
      title={mode === "create" ? "Add Professional Contact" : "Edit Professional Contact"}
      description={
        mode === "create"
          ? "Add a new professional to your team"
          : "Update professional contact information"
      }
    >
      <Form method="post" className="space-y-6">
        <input
          type="hidden"
          name="action"
          value={mode === "create" ? "create_professional" : "update_professional"}
        />
        {professional?.id && <input type="hidden" name="id" value={professional.id} />}
        <input
          type="hidden"
          name="specializations"
          value={JSON.stringify(formData.specializations)}
        />
        <input type="hidden" name="credentials" value={JSON.stringify(formData.credentials)} />

        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Basic Information</h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField label="Full Name" required error={actionData?.errors?.name}>
              <Input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Jane Smith, Esq."
                required
              />
            </FormField>

            <FormField
              label="Professional Type"
              required
              error={actionData?.errors?.professionalType}
            >
              <Select
                name="professionalType"
                value={formData.professionalType}
                onChange={handleInputChange}
                required
                options={professionalTypes}
              />
            </FormField>

            <FormField label="Firm/Company" error={actionData?.errors?.firm}>
              <Input
                name="firm"
                value={formData.firm}
                onChange={handleInputChange}
                placeholder="Smith & Associates"
              />
            </FormField>

            <FormField label="Title" error={actionData?.errors?.title}>
              <Input
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Senior Partner"
              />
            </FormField>

            <FormField label="Years of Experience" error={actionData?.errors?.yearsExperience}>
              <Input
                type="number"
                name="yearsExperience"
                value={formData.yearsExperience}
                onChange={handleInputChange}
                min="0"
                placeholder="15"
              />
            </FormField>

            <div className="flex items-end">
              <Checkbox
                id="isPreferredProvider"
                name="isPreferredProvider"
                checked={formData.isPreferredProvider}
                onChange={handleCheckboxChange("isPreferredProvider")}
                label="Preferred Provider"
              />
            </div>
          </div>
        </div>

        {/* Specializations */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Specializations</h3>

          <div className="space-y-2">
            {formData.specializations.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {formData.specializations.map((spec) => (
                  <Badge key={spec} variant="secondary" className="flex items-center gap-1">
                    {spec}
                    <button
                      type="button"
                      onClick={() => handleRemoveSpecialization(spec)}
                      className="ml-1 hover:text-red-600"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              {getSpecializationOptions().length > 0 ? (
                <Select
                  value={newSpecialization}
                  onChange={(e) => setNewSpecialization(e.target.value)}
                  className="flex-1"
                  options={[
                    { value: "", label: "Select specialization" },
                    ...getSpecializationOptions()
                      .filter((spec) => !formData.specializations.includes(spec))
                      .map((spec) => ({ value: spec, label: spec })),
                  ]}
                />
              ) : (
                <Input
                  value={newSpecialization}
                  onChange={(e) => setNewSpecialization(e.target.value)}
                  placeholder="Enter specialization"
                  className="flex-1"
                />
              )}
              <Button type="button" onClick={handleAddSpecialization} variant="secondary">
                Add
              </Button>
            </div>
          </div>
        </div>

        {/* Credentials */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Credentials</h3>

          <div className="space-y-2">
            {formData.credentials && formData.credentials.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {formData.credentials.map((cred) => (
                  <Badge key={cred} variant="outline" className="flex items-center gap-1">
                    {cred}
                    <button
                      type="button"
                      onClick={() => handleRemoveCredential(cred)}
                      className="ml-1 hover:text-red-600"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <Input
                value={newCredential}
                onChange={(e) => setNewCredential(e.target.value)}
                placeholder="e.g., JD, CPA, CFP, ChFC"
                className="flex-1"
              />
              <Button type="button" onClick={handleAddCredential} variant="secondary">
                Add
              </Button>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Contact Information</h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                placeholder="jane.smith@lawfirm.com"
              />
            </FormField>

            <FormField
              label="Preferred Contact Method"
              error={actionData?.errors?.preferredContact}
            >
              <Select
                name="preferredContact"
                value={formData.preferredContact}
                onChange={handleInputChange}
                options={contactMethods}
              />
            </FormField>
          </div>
        </div>

        {/* Office Address */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Office Address</h3>

          <div className="space-y-4">
            <FormField label="Street Address" error={actionData?.errors?.street1}>
              <Input
                name="street1"
                value={formData.street1}
                onChange={handleInputChange}
                placeholder="123 Business Blvd"
              />
            </FormField>

            <FormField label="Suite/Floor" error={actionData?.errors?.street2}>
              <Input
                name="street2"
                value={formData.street2}
                onChange={handleInputChange}
                placeholder="Suite 500"
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <FormField
                label="City"
                error={actionData?.errors?.city}
                containerClassName="col-span-2"
              >
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
                  options={[{ value: "", label: "Select" }, ...stateOptions]}
                />
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
          </div>
        </div>

        {/* Notes */}
        <FormField label="Notes" error={actionData?.errors?.notes}>
          <Textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="Additional information about this professional..."
            rows={3}
          />
        </FormField>

        <ModalFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {mode === "create" ? "Add Professional" : "Save Changes"}
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
}
