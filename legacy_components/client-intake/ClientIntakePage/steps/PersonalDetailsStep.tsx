import React, { useState, useEffect, useCallback } from 'react';

import Input from '../../common/Input';

import type { StepProps } from '../../../types';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD

interface PersonalDetailsStepProps extends StepProps {}

const PersonalDetailsStep: React.FC<PersonalDetailsStepProps> = ({
  data,
  updateData,
  setValidationTrigger,
}) => {
  const { personalDetails } = data;
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = useCallback((name: string, value: string): string => {
    switch (name) {
      case 'fullName':
        return value.trim() ? '' : 'Full name is required.';
      case 'email':
        if (!value.trim()) return 'Email is required.';
        return emailRegex.test(value) ? '' : 'Invalid email address format.';
      case 'phone': // Optional, basic validation
        return value.trim() && !/^[0-9\s()+-]*$/.test(value) ? 'Invalid phone characters.' : '';
      case 'address': // Optional
        return '';
      case 'dateOfBirth':
        if (!value.trim()) return ''; // Optional field
        return dateRegex.test(value) ? '' : 'Date of Birth must be YYYY-MM-DD.';
      case 'birthplace': // Optional
        return '';
      default:
        return '';
    }
  }, []);

  const validateAllFields = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    const fieldsToValidate: (keyof typeof personalDetails)[] = [
      'fullName',
      'email',
      'phone',
      'address',
      'dateOfBirth',
      'birthplace',
    ];

    fieldsToValidate.forEach(field => {
      const error = validateField(field as string, personalDetails[field] || '');
      if (error) {
        newErrors[field as string] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [personalDetails, validateField]);

  useEffect(() => {
    setValidationTrigger(validateAllFields);
  }, [setValidationTrigger, validateAllFields]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateData('personalDetails', { ...personalDetails, [name]: value });

    if (errors[name]) {
      const fieldError = validateField(name, value);
      setErrors(prevErrors => ({ ...prevErrors, [name]: fieldError }));
    }
  };

  const handleBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const fieldError = validateField(name, value);
    setErrors(prevErrors => ({ ...prevErrors, [name]: fieldError }));
  };

  return (
    <div className="space-y-4">
      <Input
        label="Full Name"
        name="fullName"
        id="fullName"
        value={personalDetails.fullName || ''}
        onChange={handleChange}
        onBlur={handleBlur}
        required
        placeholder="e.g., Jane Doe"
        error={errors.fullName}
        aria-describedby={errors.fullName ? 'fullName-error' : undefined}
      />

      <Input
        label="Email Address"
        name="email"
        id="email"
        type="email"
        value={personalDetails.email || ''}
        onChange={handleChange}
        onBlur={handleBlur}
        required
        placeholder="e.g., jane.doe@example.com"
        error={errors.email}
        aria-describedby={errors.email ? 'email-error' : undefined}
      />

      <Input
        label="Phone Number"
        name="phone"
        id="phone"
        type="tel"
        value={personalDetails.phone || ''}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="e.g., (555) 123-4567"
        error={errors.phone}
        aria-describedby={errors.phone ? 'phone-error' : undefined}
      />

      <Input
        label="Street Address (Optional)"
        name="address"
        id="address"
        value={personalDetails.address || ''}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="e.g., 123 Main St, Anytown, USA"
        error={errors.address}
        aria-describedby={errors.address ? 'address-error' : undefined}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Date of Birth (Optional)"
          name="dateOfBirth"
          id="dateOfBirth"
          type="date" // Allows date picker
          value={personalDetails.dateOfBirth || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="YYYY-MM-DD"
          error={errors.dateOfBirth}
          aria-describedby={errors.dateOfBirth ? 'dateOfBirth-error' : undefined}
        />
        <Input
          label="Birthplace (Optional)"
          name="birthplace"
          id="birthplace"
          value={personalDetails.birthplace || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="e.g., City, State"
          error={errors.birthplace}
          aria-describedby={errors.birthplace ? 'birthplace-error' : undefined}
        />
      </div>
    </div>
  );
};

export default PersonalDetailsStep;
