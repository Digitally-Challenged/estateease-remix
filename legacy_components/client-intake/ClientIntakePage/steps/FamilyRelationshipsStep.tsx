import React, { useState, useEffect, useCallback } from 'react';

import { Plus, Trash2, Pencil } from 'lucide-react';

import Button from '../../common/Button';
import Card from '../../common/Card';
import Input from '../../common/Input';

import type { StepProps, FamilyMember } from '../../../types';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD

interface FamilyRelationshipsStepProps extends StepProps {}

const initialFamilyMemberState: Partial<FamilyMember> = {
  fullName: '',
  relationship: '',
  dateOfBirth: '',
  email: '',
  phone: '',
  birthplace: '',
  notes: '',
};

const FamilyRelationshipsStep: React.FC<FamilyRelationshipsStepProps> = ({
  data,
  updateData,
  setValidationTrigger,
}) => {
  const { familyMembers } = data;
  const [currentMember, setCurrentMember] =
    useState<Partial<FamilyMember>>(initialFamilyMemberState);
  const [isAddingOrEditing, setIsAddingOrEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const resetSubForm = () => {
    setCurrentMember(initialFamilyMemberState);
    setFormErrors({});
    setIsAddingOrEditing(false);
    setEditingIndex(null);
  };

  const validateCurrentMemberField = useCallback(
    (name: string, value: string | undefined): string => {
      value = value || ''; // Treat undefined as empty string for validation
      switch (name) {
        case 'fullName':
          return value.trim() ? '' : 'Full name is required.';
        case 'relationship':
          return value.trim() ? '' : 'Relationship is required.';
        case 'dateOfBirth':
          if (!value.trim()) return ''; // Optional
          return dateRegex.test(value) ? '' : 'Date of Birth must be YYYY-MM-DD.';
        case 'email':
          if (!value.trim()) return ''; // Optional
          return emailRegex.test(value) ? '' : 'Invalid email address format.';
        case 'phone': // Optional, basic validation
          return value.trim() && !/^[0-9\s()+-]*$/.test(value) ? 'Invalid phone characters.' : '';
        case 'birthplace': // Optional
          return '';
        case 'notes': // Optional
          return '';
        default:
          return '';
      }
    },
    [],
  );

  const validateCurrentMemberFields = useCallback((): boolean => {
    const errors: Record<string, string> = {};
    let isValid = true;

    const fieldsToValidate: (keyof FamilyMember)[] = [
      'fullName',
      'relationship',
      'dateOfBirth',
      'email',
      'phone',
      'birthplace',
    ];
    fieldsToValidate.forEach(field => {
      const error = validateCurrentMemberField(field, currentMember[field]);
      if (error) {
        errors[field] = error;
        isValid = false;
      }
    });

    setFormErrors(errors);
    return isValid;
  }, [currentMember, validateCurrentMemberField]);

  const handleAddOrUpdateMember = () => {
    if (!validateCurrentMemberFields()) {
      return;
    }

    const newMember: FamilyMember = {
      id: currentMember.id || `temp-fm-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      fullName: currentMember.fullName!,
      relationship: currentMember.relationship!,
      dateOfBirth: currentMember.dateOfBirth || undefined,
      email: currentMember.email || undefined,
      phone: currentMember.phone || undefined,
      birthplace: currentMember.birthplace || undefined,
      notes: currentMember.notes || undefined,
    };

    let updatedMembers;
    if (editingIndex !== null) {
      updatedMembers = familyMembers.map((member, index) =>
        index === editingIndex ? newMember : member,
      );
    } else {
      updatedMembers = [...familyMembers, newMember];
    }

    updateData('familyMembers', updatedMembers);
    resetSubForm();
  };

  const handleEditMember = (index: number) => {
    setCurrentMember(familyMembers[index]);
    setEditingIndex(index);
    setIsAddingOrEditing(true);
    setFormErrors({});
  };

  const handleRemoveMember = (indexToRemove: number) => {
    updateData(
      'familyMembers',
      familyMembers.filter((_, index) => index !== indexToRemove),
    );
  };

  const toggleAddEditForm = () => {
    if (isAddingOrEditing) {
      resetSubForm();
    } else {
      setIsAddingOrEditing(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentMember(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      const fieldError = validateCurrentMemberField(name, value);
      setFormErrors(prev => ({ ...prev, [name]: fieldError }));
    }
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const fieldError = validateCurrentMemberField(name, value);
    setFormErrors(prev => ({ ...prev, [name]: fieldError }));
  };

  const mainValidateStep = useCallback((): boolean => {
    if (isAddingOrEditing) {
      const subFormIsValid = validateCurrentMemberFields();
      if (!subFormIsValid) {
        return false;
      }
    }
    return true;
  }, [isAddingOrEditing, validateCurrentMemberFields]);

  useEffect(() => {
    setValidationTrigger(mainValidateStep);
  }, [setValidationTrigger, mainValidateStep]);

  return (
    <div className="space-y-6">
      <div>
        <Button onClick={toggleAddEditForm} variant="ghost" leftIcon={<Plus className="w-4 h-4" />}>
          {isAddingOrEditing ? 'Cancel Adding/Editing Member' : 'Add New Family Member'}
        </Button>
      </div>

      {isAddingOrEditing && (
        <Card
          title={editingIndex !== null ? 'Edit Family Member' : 'Add New Family Member'}
          className="mb-6 bg-neutral-50 dark:bg-neutral-700/50"
        >
          <div className="space-y-4">
            <Input
              label="Full Name"
              name="fullName"
              id={`fm-fullName-${editingIndex ?? 'new'}`}
              value={currentMember.fullName || ''}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              required
              error={formErrors.fullName}
            />
            <Input
              label="Relationship"
              name="relationship"
              id={`fm-relationship-${editingIndex ?? 'new'}`}
              value={currentMember.relationship || ''}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              required
              placeholder="e.g., Spouse, Child, Parent"
              error={formErrors.relationship}
            />
            <Input
              label="Date of Birth (Optional)"
              name="dateOfBirth"
              id={`fm-dateOfBirth-${editingIndex ?? 'new'}`}
              type="date"
              value={currentMember.dateOfBirth || ''}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              error={formErrors.dateOfBirth}
            />
            <Input
              label="Birthplace (Optional)"
              name="birthplace"
              id={`fm-birthplace-${editingIndex ?? 'new'}`}
              value={currentMember.birthplace || ''}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              placeholder="e.g., City, State"
              error={formErrors.birthplace}
            />
            <Input
              label="Email (Optional)"
              name="email"
              id={`fm-email-${editingIndex ?? 'new'}`}
              type="email"
              value={currentMember.email || ''}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              placeholder="e.g., member@example.com"
              error={formErrors.email}
            />
            <Input
              label="Phone (Optional)"
              name="phone"
              id={`fm-phone-${editingIndex ?? 'new'}`}
              type="tel"
              value={currentMember.phone || ''}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              placeholder="e.g., (555) 123-4567"
              error={formErrors.phone}
            />
            <Input
              label="Notes (Optional)"
              name="notes"
              id={`fm-notes-${editingIndex ?? 'new'}`}
              value={currentMember.notes || ''}
              onChange={handleInputChange}
              placeholder="e.g., Any specific considerations"
              error={formErrors.notes}
            />
            <Button onClick={handleAddOrUpdateMember}>
              {editingIndex !== null ? 'Update Member' : 'Add Member to List'}
            </Button>
          </div>
        </Card>
      )}

      {familyMembers.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-neutral-700 dark:text-neutral-200 mb-2">
            Added Family Members:
          </h3>
          <ul className="space-y-3">
            {familyMembers.map((member, index) => (
              <li
                key={member.id || index}
                className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-800 shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-neutral-800 dark:text-neutral-100">
                      {member.fullName}
                    </p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-300">
                      Relationship: {member.relationship}
                    </p>
                    {member.dateOfBirth && (
                      <p className="text-sm text-neutral-600 dark:text-neutral-300">
                        DOB: {member.dateOfBirth}
                      </p>
                    )}
                    {member.birthplace && (
                      <p className="text-sm text-neutral-600 dark:text-neutral-300">
                        Birthplace: {member.birthplace}
                      </p>
                    )}
                    {member.email && (
                      <p className="text-sm text-neutral-600 dark:text-neutral-300">
                        Email: {member.email}
                      </p>
                    )}
                    {member.phone && (
                      <p className="text-sm text-neutral-600 dark:text-neutral-300">
                        Phone: {member.phone}
                      </p>
                    )}
                    {member.notes && (
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 italic">
                        Notes: {member.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditMember(index)}
                      aria-label="Edit family member"
                      disabled={isAddingOrEditing && editingIndex !== index}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleRemoveMember(index)}
                      aria-label="Remove family member"
                      disabled={isAddingOrEditing}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      {familyMembers.length === 0 && !isAddingOrEditing && (
        <p className="text-neutral-500 dark:text-neutral-400">
          No family members added yet. Click "Add New Family Member" to begin.
        </p>
      )}
    </div>
  );
};

export default FamilyRelationshipsStep;
