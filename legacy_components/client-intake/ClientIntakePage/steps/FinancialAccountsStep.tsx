import type { ChangeEvent } from 'react';
import React, { useState, useEffect, useCallback } from 'react';

import { Plus, Trash2, Pencil } from 'lucide-react';

import { FINANCIAL_ACCOUNT_TYPE_OPTIONS } from '../../../constants/asset-options';
import { AssetCategory } from '../../../types';
import Button from '../../common/Button';
import Card from '../../common/Card';
import Input from '../../common/Input';
import Select from '../../common/Select';

import type { StepProps, FinancialAccount } from '../../../types';

interface FinancialAccountsStepProps extends StepProps {}

const FinancialAccountsStep: React.FC<FinancialAccountsStepProps> = ({
  data,
  updateData,
  setValidationTrigger,
}) => {
  const { financialAccounts } = data;
  const [currentAccount, setCurrentAccount] = useState<Partial<FinancialAccount>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const resetSubForm = () => {
    setCurrentAccount({});
    setFormErrors({});
    setIsAdding(false);
    setEditingIndex(null);
  };

  const validateCurrentAccountFields = useCallback((): boolean => {
    const errors: Record<string, string> = {};
    let isValid = true;
    if (!currentAccount.name?.trim()) {
      errors.name = 'Account name is required.';
      isValid = false;
    }
    if (!currentAccount.institution?.trim()) {
      errors.institution = 'Institution is required.';
      isValid = false;
    }
    if (!currentAccount.accountType) {
      errors.accountType = 'Account type is required.';
      isValid = false;
    }
    if (
      currentAccount.value === undefined ||
      currentAccount.value === null ||
      currentAccount.value < 0
    ) {
      errors.value = 'A valid positive value is required.';
      isValid = false;
    }
    setFormErrors(errors);
    return isValid;
  }, [currentAccount]);

  const handleAddOrUpdateAccount = () => {
    if (!validateCurrentAccountFields()) {
      return;
    }

    const newAccount: FinancialAccount = {
      id:
        currentAccount.id || `temp-fa-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: currentAccount.name!,
      category: AssetCategory.FINANCIAL_ACCOUNT,
      value: currentAccount.value!,
      accountType: currentAccount.accountType!,
      institution: currentAccount.institution!,
      description: currentAccount.description,
    };

    let updatedAccounts;
    if (editingIndex !== null) {
      updatedAccounts = financialAccounts.map((acc, index) =>
        index === editingIndex ? newAccount : acc,
      );
    } else {
      updatedAccounts = [...financialAccounts, newAccount];
    }

    updateData('financialAccounts', updatedAccounts);
    resetSubForm();
  };

  const handleEditAccount = (index: number) => {
    setCurrentAccount(financialAccounts[index]);
    setEditingIndex(index);
    setIsAdding(true);
    setFormErrors({});
  };

  const handleRemoveAccount = (indexToRemove: number) => {
    updateData(
      'financialAccounts',
      financialAccounts.filter((_, index) => index !== indexToRemove),
    );
  };

  const toggleAddForm = () => {
    if (isAdding) {
      // If cancelling
      resetSubForm();
    } else {
      setIsAdding(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentAccount(prev => ({
      ...prev,
      [name]: name === 'value' ? (value === '' ? undefined : parseFloat(value)) : value,
    }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' })); // Clear error on change
    }
  };

  const handleInputBlur = () => {
    // Trigger validation for the specific field on blur if needed, or rely on submit validation
    // For simplicity, full validation on submit of sub-form
    validateCurrentAccountFields();
  };

  const mainValidateStep = useCallback((): boolean => {
    if (isAdding) {
      // If user is in the middle of adding/editing an account, that sub-form must be valid
      // or they should cancel it. Forcing validation here:
      const subFormIsValid = validateCurrentAccountFields();
      if (!subFormIsValid) {
        // alert("Please complete or cancel editing the current financial account before proceeding.");
        return false; // Prevent proceeding
      }
    }
    return true; // Otherwise, step is considered valid to proceed from
  }, [isAdding, validateCurrentAccountFields]);

  useEffect(() => {
    setValidationTrigger(mainValidateStep);
  }, [setValidationTrigger, mainValidateStep]);

  return (
    <div className="space-y-6">
      <div>
        <Button onClick={toggleAddForm} variant="ghost" leftIcon={<Plus className="w-4 h-4" />}>
          {isAdding ? 'Cancel Adding Account' : 'Add New Financial Account'}
        </Button>
      </div>

      {isAdding && (
        <Card
          title={editingIndex !== null ? 'Edit Financial Account' : 'Add New Financial Account'}
          className="mb-6 bg-neutral-50 dark:bg-neutral-700/50"
        >
          <div className="space-y-4">
            <Input
              id={`financialAccount-name-${editingIndex ?? 'new'}`}
              label="Account Name"
              name="name"
              value={currentAccount.name || ''}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              required
              error={formErrors.name}
            />
            <Input
              id={`financialAccount-institution-${editingIndex ?? 'new'}`}
              label="Institution"
              name="institution"
              value={currentAccount.institution || ''}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              required
              error={formErrors.institution}
            />
            <Select
              label="Account Type"
              name="accountType"
              id={`financialAccount-accountType-${editingIndex ?? 'new'}`}
              value={currentAccount.accountType || ''}
              onChange={handleInputChange}
              onBlur={handleInputBlur as (e: ChangeEvent<HTMLSelectElement>) => void}
              options={FINANCIAL_ACCOUNT_TYPE_OPTIONS}
              required
              error={formErrors.accountType}
            />
            <Input
              id={`financialAccount-value-${editingIndex ?? 'new'}`}
              label="Current Value"
              name="value"
              type="number"
              value={currentAccount.value === undefined ? '' : currentAccount.value}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              required
              min="0"
              step="0.01"
              error={formErrors.value}
            />
            <Input
              id={`financialAccount-description-${editingIndex ?? 'new'}`}
              label="Description (Optional)"
              name="description"
              value={currentAccount.description || ''}
              onChange={handleInputChange}
            />
            <Button onClick={handleAddOrUpdateAccount}>
              {editingIndex !== null ? 'Update Account' : 'Add Account to List'}
            </Button>
          </div>
        </Card>
      )}

      {financialAccounts.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-neutral-700 dark:text-neutral-200 mb-2">
            Added Accounts:
          </h3>
          <ul className="space-y-3">
            {financialAccounts.map((account, index) => (
              <li
                key={account.id || index}
                className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-800 shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-neutral-800 dark:text-neutral-100">
                      {account.name}
                    </p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-300">
                      {account.institution} - {account.accountType}
                    </p>
                    <p className="text-sm text-primary-DEFAULT font-medium">
                      ${account.value.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex space-x-2 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditAccount(index)}
                      aria-label="Edit account"
                      disabled={isAdding && editingIndex !== index}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleRemoveAccount(index)}
                      aria-label="Remove account"
                      disabled={isAdding}
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
      {financialAccounts.length === 0 && !isAdding && (
        <p className="text-neutral-500 dark:text-neutral-400">
          No financial accounts added yet. Click "Add New Financial Account" to begin.
        </p>
      )}
    </div>
  );
};

export default FinancialAccountsStep;
