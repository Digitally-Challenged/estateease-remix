import React, { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { useUnifiedAssets } from '../../contexts/UnifiedAssetContext';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { DefinedRoleType } from '../../types';
import { AssetCategory, FinancialAccountType } from '../../types/enums';
import Button from '../common/Button';
import Card from '../common/Card';
import Modal from '../common/Modal';
import MultiStepForm from '../common/MultiStepForm';

import FamilyRelationshipsStep from './steps/FamilyRelationshipsStep';
import FinancialAccountsStep from './steps/FinancialAccountsStep';
import HealthcareDirectivesStep from './steps/HealthcareDirectivesStep';
import KeyRolesStep from './steps/KeyRolesStep';
import PersonalDetailsStep from './steps/PersonalDetailsStep';
import ReviewStep from './steps/ReviewStep';

import type { ClientIntakeData, IntakeFormStep, FamilyMember, Appointee } from '../../types';
import type { AnyEnhancedAsset } from '../../types/assets';

const initialKelseyAppointee: Appointee = {
  id: 'appointee-kelsey-initial',
  type: 'individual',
  name: 'Kelsey Fey Brown',
  relationshipToClient: 'Spouse',
  contactInfo: 'kelseyfbrown@gmail.com / 501-545-9627',
  notes: 'Primary appointee (Surviving Spouse)',
};

const initialArvestAppointee: Appointee = {
  id: 'appointee-arvest-initial',
  type: 'institution',
  name: 'Arvest Bank Trust Department', // Example institution name
  contactInfo: 'Refer to Arvest Bank for contact details.', // Placeholder
  notes: 'Successor or Co-Appointee Institution',
};

const initialIntakeData: ClientIntakeData = {
  personalDetails: {
    fullName: 'Nicholas Lynn Coleman',
    email: 'nickcoleman85@gmail.com',
    phone: '870-740-0598',
    address: '2211 NW Willow, Bentonville, AR 72712',
    dateOfBirth: '1985-01-05',
    birthplace: 'Blytheville',
  },
  financialAccounts: [],
  familyMembers: [
    {
      id: 'fm-initial-kelsey',
      fullName: 'Kelsey Fey Brown',
      relationship: 'Spouse',
      dateOfBirth: '1989-03-13',
      birthplace: 'Hot Springs',
      email: 'kelseyfbrown@gmail.com',
      phone: '501-545-9627',
      notes:
        'Married Nicholas Lynn Coleman on 10/03/2015 in Fayetteville, AR. No previous marriages or children.',
    } as FamilyMember,
  ],
  healthcareDirectives: {
    hasLivingWill: null,
    livingWillLocation: '',
    hasHealthcareProxy: null,
    healthcareProxyName: '',
    healthcareProxyContact: '',
    organDonorPreference: '',
  },
  keyRoles: [
    {
      roleType: DefinedRoleType.EXECUTOR,
      primaryAppointees: [initialKelseyAppointee],
      successorAppointees: [initialArvestAppointee],
      roleSpecificNotes: 'Executor to manage the estate according to the will.',
    },
    {
      roleType: DefinedRoleType.TRUSTEE,
      primaryAppointees: [initialKelseyAppointee],
      successorAppointees: [initialArvestAppointee],
      roleSpecificNotes: 'Trustee to manage any trusts established for beneficiaries.',
    },
    {
      roleType: DefinedRoleType.GUARDIAN,
      primaryAppointees: [], // To be filled by user if applicable
      successorAppointees: [], // To be filled by user if applicable
      roleSpecificNotes:
        "Information regarding guardians for minor children can be found in a separate document referred to as 'upon death tan' or should be discussed if children are present or expected.",
    },
  ],
};

const ClientIntakePage: React.FC = () => {
  const navigate = useNavigate();
  const unifiedAssets = useUnifiedAssets();

  const [formData, setFormData] = useLocalStorage<ClientIntakeData>(
    'clientIntakeForm',
    initialIntakeData,
  );
  const [currentStepIndex, setCurrentStepIndex] = useLocalStorage<number>('clientIntakeStep', 0);

  const [isSubmitted, setIsSubmitted] = useLocalStorage<boolean>('clientIntakeSubmitted', false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps: IntakeFormStep[] = [
    { id: 'personal', title: 'Personal Details', component: PersonalDetailsStep },
    { id: 'financial', title: 'Financial Accounts', component: FinancialAccountsStep },
    { id: 'family', title: 'Family & Relationships', component: FamilyRelationshipsStep },
    { id: 'healthcare', title: 'Healthcare Directives', component: HealthcareDirectivesStep },
    { id: 'keyroles', title: 'Key Roles & Appointments', component: KeyRolesStep },
    { id: 'review', title: 'Review & Submit', component: ReviewStep },
  ];

  const updateFormData = <K extends keyof ClientIntakeData>(key: K, value: ClientIntakeData[K]) => {
    setFormData(prevData => ({
      ...prevData,
      [key]: value,
    }));
  };

  const resetIntake = () => {
    setFormData(initialIntakeData);
    setCurrentStepIndex(0);
    setIsSubmitted(false);
  };

  const handleInitiateSubmit = () => {
    setShowConfirmationModal(true);
  };

  const handleConfirmSubmit = async () => {
    setShowConfirmationModal(false);
    setIsSubmitting(true);

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Add financial accounts from intake to the main asset list
    const existingAssetIds = new Set(unifiedAssets.assets.map(a => a.id));
    const accountsToAdd = formData.financialAccounts.filter(
      acc =>
        !existingAssetIds.has(acc.id.startsWith('temp-fa-') ? `fa-${acc.id.substring(8)}` : acc.id),
    );

    accountsToAdd.forEach(acc => {
      const { id, ...accountWithoutId } = acc; // Destructure to avoid duplicate id
      const newAccount: AnyEnhancedAsset = {
        id: id.startsWith('temp-fa-')
          ? `fa-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
          : id,
        ...accountWithoutId,
        name: acc.name,
        value: acc.value,
        institution: acc.institution,
        accountType: acc.accountType, // Type conversion between the two enums
        category: AssetCategory.FINANCIAL_ACCOUNT,
        ownership: {
          type: 'individual' as const,
          ownerName: 'Nicholas Lynn Coleman',
          percentage: 100,
        },
        beneficiaries: acc.beneficiaries
          ? {
            primary: acc.beneficiaries.map((b: string | { name: string }) => ({
              id: `ben-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
              name: typeof b === 'string' ? b : b.name,
              relationship: 'other' as const,
              percentage: 100 / acc.beneficiaries.length,
              isOrganization: false,
            })),
            contingent: [],
          }
          : undefined,
        lastUpdated: new Date(),
      };
      void unifiedAssets.addAsset(newAccount);
    });

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <Card title="Intake Submitted Successfully!">
        <p className="text-neutral-700 dark:text-neutral-200 mb-4">
          Thank you for completing the client intake process. Your information has been saved.
        </p>
        <p className="text-neutral-700 dark:text-neutral-200 mb-6">
          You can view your added assets on the "My Assets" page or your dashboard. Your other
          intake information is also saved.
        </p>
        <div className="space-x-4">
          <Button onClick={() => navigate('/')}>Go to Dashboard</Button>
          <Button onClick={resetIntake} variant="ghost">
            Start New Intake (Resets to Coleman Data)
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-neutral-800 dark:text-neutral-100">
        Client Intake Form
      </h1>
      <Card>
        <MultiStepForm
          steps={steps}
          currentStepIndex={currentStepIndex}
          setCurrentStepIndex={setCurrentStepIndex}
          formData={formData}
          updateFormData={updateFormData}
          onSubmit={handleInitiateSubmit}
          isSubmitting={isSubmitting}
        />
      </Card>
      <Modal
        isOpen={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        title="Confirm Submission"
      >
        <p className="text-neutral-700 dark:text-neutral-200">
          Are you sure you want to submit this intake information? Please ensure all details are
          correct.
        </p>
        <div className="mt-6 flex justify-end space-x-3">
          <Button
            variant="ghost"
            onClick={() => setShowConfirmationModal(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleConfirmSubmit} isLoading={isSubmitting} disabled={isSubmitting}>
            Confirm & Submit
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ClientIntakePage;
