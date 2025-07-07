import type { ChangeEvent } from 'react';
import React, { useState, useEffect, useCallback } from 'react';

import { Plus, Trash2, Pencil, Users } from 'lucide-react';

import { DefinedRoleType } from '../../../types';
import Button from '../../common/Button';
import Card from '../../common/Card';
import Input from '../../common/Input';
import Modal from '../../common/Modal';
import Select from '../../common/Select';

import type { StepProps, KeyRole, Appointee } from '../../../types';

interface KeyRolesStepProps extends StepProps {}

const initialAppointeeState: Partial<Appointee> = {
  type: 'individual',
  name: '',
  relationshipToClient: '',
  contactInfo: '',
  notes: '',
};

const appointeeTypeOptions = [
  { value: 'individual', label: 'Individual' },
  { value: 'institution', label: 'Institution (e.g., Bank, Trust Company)' },
];

const KeyRolesStep: React.FC<KeyRolesStepProps> = ({ data, updateData, setValidationTrigger }) => {
  const { keyRoles } = data; // keyRoles will be initialized in ClientIntakePage

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRoleTypeForModal, setCurrentRoleTypeForModal] = useState<DefinedRoleType | null>(
    null,
  );
  const [currentAppointeeCapacity, setCurrentAppointeeCapacity] = useState<
    'primary' | 'successor' | null
  >(null);
  const [editingAppointee, setEditingAppointee] = useState<Partial<Appointee> | null>(null);
  const [editingAppointeeIndex, setEditingAppointeeIndex] = useState<number | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const getRoleByType = (roleType: DefinedRoleType): KeyRole | undefined => {
    return keyRoles.find(kr => kr.roleType === roleType);
  };

  // Ensures a role object exists in the keyRoles array to work with
  const ensureRoleInKeyRolesArray = (roleType: DefinedRoleType): KeyRole[] => {
    const roles = [...keyRoles];
    if (!roles.find(r => r.roleType === roleType)) {
      roles.push({
        roleType,
        primaryAppointees: [],
        successorAppointees: [],
        roleSpecificNotes: '',
      });
    }
    return roles;
  };

  const validateAppointeeFields = useCallback((): boolean => {
    const errors: Record<string, string> = {};
    let isValid = true;
    if (!editingAppointee?.name?.trim()) {
      errors.name = 'Appointee name is required.';
      isValid = false;
    }
    if (
      editingAppointee?.type === 'individual' &&
      !editingAppointee?.relationshipToClient?.trim()
    ) {
      // errors.relationshipToClient = 'Relationship is required for individuals.';
      // isValid = false; // Making relationship optional for MVP simplicity if not strictly needed
    }
    setFormErrors(errors);
    return isValid;
  }, [editingAppointee]);

  const openAppointeeModal = (
    roleType: DefinedRoleType,
    capacity: 'primary' | 'successor',
    appointee?: Appointee,
    index?: number,
  ) => {
    setCurrentRoleTypeForModal(roleType);
    setCurrentAppointeeCapacity(capacity);
    setEditingAppointee(
      appointee ? { ...appointee } : { ...initialAppointeeState, type: 'individual' },
    );
    setEditingAppointeeIndex(index ?? null);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleAppointeeInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setEditingAppointee(prev => ({ ...prev, [name]: value }) as Partial<Appointee>);
    if (formErrors[name]) {
      setFormErrors(prevErrors => ({ ...prevErrors, [name]: '' }));
    }
  };

  const handleRoleNotesChange = (roleType: DefinedRoleType, notes: string) => {
    const updatedKeyRoles = keyRoles.map(kr =>
      kr.roleType === roleType ? { ...kr, roleSpecificNotes: notes } : kr,
    );
    // If the role wasn't found (e.g., initial state might be empty), add it.
    if (!updatedKeyRoles.find(kr => kr.roleType === roleType)) {
      updatedKeyRoles.push({
        roleType,
        primaryAppointees: [],
        successorAppointees: [],
        roleSpecificNotes: notes,
      });
    }
    updateData('keyRoles', updatedKeyRoles);
  };

  const handleAddOrUpdateAppointee = () => {
    if (!currentRoleTypeForModal || !currentAppointeeCapacity || !editingAppointee) return;
    if (!validateAppointeeFields()) return;

    const appointeeToSave: Appointee = {
      id: editingAppointee.id || `app-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      type: editingAppointee.type || 'individual',
      name: editingAppointee.name!,
      relationshipToClient: editingAppointee.relationshipToClient,
      contactInfo: editingAppointee.contactInfo,
      notes: editingAppointee.notes,
    };

    const updatedRoles = ensureRoleInKeyRolesArray(currentRoleTypeForModal).map(role => {
      if (role.roleType === currentRoleTypeForModal) {
        const listToUpdate =
          currentAppointeeCapacity === 'primary'
            ? [...role.primaryAppointees]
            : [...role.successorAppointees];
        if (editingAppointeeIndex !== null) {
          listToUpdate[editingAppointeeIndex] = appointeeToSave;
        } else {
          listToUpdate.push(appointeeToSave);
        }
        return currentAppointeeCapacity === 'primary'
          ? { ...role, primaryAppointees: listToUpdate }
          : { ...role, successorAppointees: listToUpdate };
      }
      return role;
    });

    updateData('keyRoles', updatedRoles);
    setIsModalOpen(false);
  };

  const removeAppointee = (
    roleType: DefinedRoleType,
    capacity: 'primary' | 'successor',
    indexToRemove: number,
  ) => {
    const updatedRoles = ensureRoleInKeyRolesArray(roleType).map(role => {
      if (role.roleType === roleType) {
        const listToUpdate =
          capacity === 'primary' ? role.primaryAppointees : role.successorAppointees;
        const updatedList = listToUpdate.filter((_, index) => index !== indexToRemove);
        return capacity === 'primary'
          ? { ...role, primaryAppointees: updatedList }
          : { ...role, successorAppointees: updatedList };
      }
      return role;
    });
    updateData('keyRoles', updatedRoles);
  };

  const mainValidateStep = useCallback((): boolean => {
    const executorRole = getRoleByType(DefinedRoleType.EXECUTOR);
    if (!executorRole || executorRole.primaryAppointees.length === 0) {
      setFormErrors(prev => ({
        ...prev,
        _globalExecutorError: 'At least one Primary Executor must be appointed.',
      }));
      // alert("Please appoint at least one Primary Executor."); // Consider a less obtrusive error display
      return false;
    }
    setFormErrors(prev => ({ ...prev, _globalExecutorError: '' })); // Clear global error if valid

    // Add similar validation for Trustee if needed
    // const trusteeRole = getRoleByType(DefinedRoleType.TRUSTEE);
    // if (!trusteeRole || trusteeRole.primaryAppointees.length === 0) {
    //   alert("Please appoint at least one Primary Trustee.");
    //   return false;
    // }
    return true;
  }, [keyRoles]);

  useEffect(() => {
    setValidationTrigger(mainValidateStep);
  }, [setValidationTrigger, mainValidateStep]);

  const renderAppointeeCard = (
    appointee: Appointee,
    roleType: DefinedRoleType,
    capacity: 'primary' | 'successor',
    index: number,
  ) => (
    <Card key={appointee.id || index} className="mb-2 bg-white dark:bg-neutral-700 p-3 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-semibold text-neutral-800 dark:text-neutral-100">
            {appointee.name}{' '}
            <span className="text-xs font-normal text-neutral-500 dark:text-neutral-400">
              ({appointee.type})
            </span>
          </p>
          {appointee.type === 'individual' && appointee.relationshipToClient && (
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              Relationship: {appointee.relationshipToClient}
            </p>
          )}
          {appointee.contactInfo && (
            <p className="text-sm text-neutral-600 dark:text-neutral-300">
              Contact: {appointee.contactInfo}
            </p>
          )}
          {appointee.notes && (
            <p className="text-xs italic text-neutral-500 dark:text-neutral-400 mt-1">
              Notes: {appointee.notes}
            </p>
          )}
        </div>
        <div className="flex space-x-1 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openAppointeeModal(roleType, capacity, appointee, index)}
            aria-label={`Edit ${appointee.name}`}
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => removeAppointee(roleType, capacity, index)}
            aria-label={`Remove ${appointee.name}`}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );

  const renderRoleSection = (roleType: DefinedRoleType, title: string) => {
    const roleData = getRoleByType(roleType) || {
      roleType,
      primaryAppointees: [],
      successorAppointees: [],
      roleSpecificNotes: '',
    };
    return (
      <Card
        title={title}
        className="bg-neutral-50 dark:bg-neutral-800/50"
        actions={<Users className="w-5 h-5 text-primary-DEFAULT" />}
      >
        <div className="space-y-3">
          <div>
            <h4 className="text-md font-medium text-neutral-700 dark:text-neutral-200 mb-1.5">
              Primary Appointee(s):
            </h4>
            {roleData.primaryAppointees.length > 0 ? (
              roleData.primaryAppointees.map((app, idx) =>
                renderAppointeeCard(app, roleType, 'primary', idx),
              )
            ) : (
              <p className="text-sm text-neutral-500 dark:text-neutral-400 pl-1">
                No primary appointees assigned.
              </p>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => openAppointeeModal(roleType, 'primary')}
              leftIcon={<Plus className="w-4 h-4" />}
              className="mt-2"
            >
              Add Primary Appointee
            </Button>
          </div>
          <div className="mt-3">
            <h4 className="text-md font-medium text-neutral-700 dark:text-neutral-200 mb-1.5">
              Successor Appointee(s):
            </h4>
            {roleData.successorAppointees.length > 0 ? (
              roleData.successorAppointees.map((app, idx) =>
                renderAppointeeCard(app, roleType, 'successor', idx),
              )
            ) : (
              <p className="text-sm text-neutral-500 dark:text-neutral-400 pl-1">
                No successor appointees assigned.
              </p>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => openAppointeeModal(roleType, 'successor')}
              leftIcon={<Plus className="w-4 h-4" />}
              className="mt-2"
            >
              Add Successor Appointee
            </Button>
          </div>
          <Input
            as="textarea"
            label={`Notes for ${title} (Optional)`}
            name={`${roleType}-notes`}
            id={`${roleType}-notes`}
            value={roleData.roleSpecificNotes || ''}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              handleRoleNotesChange(roleType, e.target.value)
            }
            placeholder="Any specific instructions or considerations..."
            wrapperClassName="mt-4"
            rows={2}
          />
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {formErrors._globalExecutorError && (
        <p className="text-sm text-red-600 dark:text-red-400 mb-2">
          {formErrors._globalExecutorError}
        </p>
      )}
      {renderRoleSection(DefinedRoleType.EXECUTOR, 'Executor of Will')}
      {renderRoleSection(DefinedRoleType.TRUSTEE, 'Trustee of Trust(s)')}
      {renderRoleSection(DefinedRoleType.GUARDIAN, 'Guardian of Minor Children')}

      {isModalOpen && editingAppointee && currentRoleTypeForModal && currentAppointeeCapacity && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`${editingAppointeeIndex !== null ? 'Edit' : 'Add'} ${currentAppointeeCapacity} Appointee for ${currentRoleTypeForModal}`}
        >
          <div className="space-y-4">
            <Select
              label="Appointee Type"
              name="type"
              id="appointeeType"
              value={editingAppointee.type || 'individual'}
              onChange={handleAppointeeInputChange}
              options={appointeeTypeOptions}
              error={formErrors.type}
              wrapperClassName="mb-0"
            />
            <Input
              label="Name"
              name="name"
              id="appointeeName"
              value={editingAppointee.name || ''}
              onChange={handleAppointeeInputChange}
              required
              placeholder={
                editingAppointee.type === 'individual'
                  ? "Individual's Full Name"
                  : 'Institution Name'
              }
              error={formErrors.name}
              wrapperClassName="mb-0"
            />
            {editingAppointee.type === 'individual' && (
              <Input
                label="Relationship to Client (Optional)"
                name="relationshipToClient"
                id="appointeeRelationship"
                value={editingAppointee.relationshipToClient || ''}
                onChange={handleAppointeeInputChange}
                placeholder="e.g., Spouse, Sibling, Friend"
                error={formErrors.relationshipToClient}
                wrapperClassName="mb-0"
              />
            )}
            <Input
              label="Contact Information (Optional)"
              name="contactInfo"
              id="appointeeContact"
              value={editingAppointee.contactInfo || ''}
              onChange={handleAppointeeInputChange}
              placeholder="Phone or Email"
              error={formErrors.contactInfo}
              wrapperClassName="mb-0"
            />
            <Input
              as="textarea"
              label="Notes (Optional)"
              name="notes"
              id="appointeeNotes"
              value={editingAppointee.notes || ''}
              onChange={handleAppointeeInputChange}
              placeholder="Any specific details"
              error={formErrors.notes}
              rows={2}
              wrapperClassName="mb-0"
            />
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddOrUpdateAppointee}>
              {editingAppointeeIndex !== null ? 'Save Changes' : 'Add Appointee'}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default KeyRolesStep;
