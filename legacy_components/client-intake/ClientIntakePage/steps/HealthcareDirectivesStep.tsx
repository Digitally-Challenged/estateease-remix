import React, { useState, useEffect, useCallback } from 'react';

import { OrganDonorPreference } from '../../../types';
import Card from '../../common/Card'; // Using Card for better grouping visually
import Input from '../../common/Input';
import Select from '../../common/Select';

import type { StepProps } from '../../../types';

interface HealthcareDirectivesStepProps extends StepProps {}

const organDonorOptions = [
  // { value: '', label: 'Select an option', disabled: true }, // Removed, Select component handles placeholder
  { value: OrganDonorPreference.YES, label: 'Yes, I am a registered donor' },
  { value: OrganDonorPreference.NO, label: 'No, I am not a donor' },
  { value: OrganDonorPreference.UNDECIDED, label: 'I am undecided' },
];

const yesNoNullOptions = [
  { value: 'true', label: 'Yes' },
  { value: 'false', label: 'No' },
];

const HealthcareDirectivesStep: React.FC<HealthcareDirectivesStepProps> = ({
  data,
  updateData,
  setValidationTrigger,
}) => {
  const { healthcareDirectives } = data;
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = useCallback(
    (name: string, value: any): string => {
      switch (name) {
        case 'hasLivingWill':
          return value === null || value === undefined
            ? 'Please select an option for Living Will.'
            : '';
        case 'livingWillLocation':
          // Required only if hasLivingWill is true
          return healthcareDirectives.hasLivingWill && !value?.trim()
            ? 'Living will location is required if you have one.'
            : '';
        case 'hasHealthcareProxy':
          return value === null || value === undefined
            ? 'Please select an option for Healthcare Proxy.'
            : '';
        case 'healthcareProxyName':
          // Required only if hasHealthcareProxy is true
          return healthcareDirectives.hasHealthcareProxy && !value?.trim()
            ? 'Healthcare proxy name is required if you have one.'
            : '';
        case 'healthcareProxyContact':
          // Required only if hasHealthcareProxy is true
          return healthcareDirectives.hasHealthcareProxy && !value?.trim()
            ? 'Healthcare proxy contact is required if you have one.'
            : '';
        case 'organDonorPreference':
          return !value ? 'Please select your organ donor preference.' : '';
        default:
          return '';
      }
    },
    [healthcareDirectives.hasLivingWill, healthcareDirectives.hasHealthcareProxy],
  );

  const validateAllFields = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    const fieldsToValidate: (keyof typeof healthcareDirectives)[] = [
      'hasLivingWill',
      'livingWillLocation',
      'hasHealthcareProxy',
      'healthcareProxyName',
      'healthcareProxyContact',
      'organDonorPreference',
    ];

    fieldsToValidate.forEach(field => {
      const error = validateField(field, healthcareDirectives[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [healthcareDirectives, validateField]);

  useEffect(() => {
    setValidationTrigger(validateAllFields);
  }, [setValidationTrigger, validateAllFields]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    let processedValue: any = value;
    if (type === 'checkbox') {
      // Though we are using Select for Yes/No
      processedValue = (e.target as HTMLInputElement).checked;
    } else if (name === 'hasLivingWill' || name === 'hasHealthcareProxy') {
      processedValue = value === 'true' ? true : value === 'false' ? false : null;
    }

    const updatedDirectives = { ...healthcareDirectives, [name]: processedValue };

    // If 'hasLivingWill' is set to false, clear 'livingWillLocation'
    if (name === 'hasLivingWill' && !processedValue) {
      updatedDirectives.livingWillLocation = '';
      if (errors.livingWillLocation) setErrors(prev => ({ ...prev, livingWillLocation: '' }));
    }
    // If 'hasHealthcareProxy' is set to false, clear proxy details
    if (name === 'hasHealthcareProxy' && !processedValue) {
      updatedDirectives.healthcareProxyName = '';
      updatedDirectives.healthcareProxyContact = '';
      if (errors.healthcareProxyName) setErrors(prev => ({ ...prev, healthcareProxyName: '' }));
      if (errors.healthcareProxyContact)
        setErrors(prev => ({ ...prev, healthcareProxyContact: '' }));
    }

    updateData('healthcareDirectives', updatedDirectives);

    if (errors[name]) {
      const fieldError = validateField(name, processedValue);
      setErrors(prevErrors => ({ ...prevErrors, [name]: fieldError }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let processedValue: any = value;
    if (name === 'hasLivingWill' || name === 'hasHealthcareProxy') {
      processedValue = value === 'true' ? true : value === 'false' ? false : null;
    }
    const fieldError = validateField(name, processedValue);
    setErrors(prevErrors => ({ ...prevErrors, [name]: fieldError }));
  };

  return (
    <div className="space-y-6">
      <Card title="Living Will & Healthcare Proxy" className="bg-neutral-50 dark:bg-neutral-800/50">
        <Select
          label="Do you have a Living Will?"
          name="hasLivingWill"
          id="hasLivingWill"
          value={
            healthcareDirectives.hasLivingWill === null
              ? ''
              : String(healthcareDirectives.hasLivingWill)
          }
          onChange={handleChange}
          onBlur={handleBlur}
          options={yesNoNullOptions} // Use directly, Select provides placeholder
          required
          error={errors.hasLivingWill}
          wrapperClassName="mb-4"
        />

        {healthcareDirectives.hasLivingWill === true && (
          <Input
            label="Location of Living Will"
            name="livingWillLocation"
            id="livingWillLocation"
            value={healthcareDirectives.livingWillLocation || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="e.g., Home safe, Attorney's office"
            error={errors.livingWillLocation}
            wrapperClassName="mb-4"
          />
        )}

        <Select
          label="Do you have a Healthcare Proxy (Power of Attorney for Healthcare)?"
          name="hasHealthcareProxy"
          id="hasHealthcareProxy"
          value={
            healthcareDirectives.hasHealthcareProxy === null
              ? ''
              : String(healthcareDirectives.hasHealthcareProxy)
          }
          onChange={handleChange}
          onBlur={handleBlur}
          options={yesNoNullOptions} // Use directly, Select provides placeholder
          required
          error={errors.hasHealthcareProxy}
          wrapperClassName="mt-4 mb-4"
        />

        {healthcareDirectives.hasHealthcareProxy === true && (
          <>
            <Input
              label="Healthcare Proxy Full Name"
              name="healthcareProxyName"
              id="healthcareProxyName"
              value={healthcareDirectives.healthcareProxyName || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g., John Smith"
              error={errors.healthcareProxyName}
              wrapperClassName="mb-4"
            />
            <Input
              label="Healthcare Proxy Contact Information"
              name="healthcareProxyContact"
              id="healthcareProxyContact"
              value={healthcareDirectives.healthcareProxyContact || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="e.g., (555) 987-6543, john.proxy@email.com"
              error={errors.healthcareProxyContact}
              wrapperClassName="mb-4"
            />
          </>
        )}
      </Card>

      <Card title="Organ Donation" className="bg-neutral-50 dark:bg-neutral-800/50">
        <Select
          label="Organ Donor Preference"
          name="organDonorPreference"
          id="organDonorPreference"
          value={healthcareDirectives.organDonorPreference || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          options={organDonorOptions}
          required
          error={errors.organDonorPreference}
        />
      </Card>
    </div>
  );
};

export default HealthcareDirectivesStep;
