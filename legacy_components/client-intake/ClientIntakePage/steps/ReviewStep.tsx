import React, { useEffect } from 'react';

import { Pencil } from 'lucide-react';

import Button from '../../common/Button';
import Card from '../../common/Card';

import type { StepProps, FinancialAccount, FamilyMember, Appointee } from '../../../types';

interface ReviewStepProps extends StepProps {}

const ReviewStep: React.FC<ReviewStepProps> = ({
  data,
  setValidationTrigger,
  setCurrentStepIndex,
}) => {
  const { personalDetails, financialAccounts, familyMembers, healthcareDirectives, keyRoles } =
    data;

  useEffect(() => {
    setValidationTrigger(() => true); // Review step is always valid for submission by itself
  }, [setValidationTrigger]);

  const handleEditSection = (stepIndex: number) => {
    if (setCurrentStepIndex) {
      setCurrentStepIndex(stepIndex);
    }
  };

  const formatBooleanDisplay = (value: boolean | null | undefined) => {
    if (value === null || value === undefined) return 'N/A';
    return value ? 'Yes' : 'No';
  };

  const DetailItem: React.FC<{ label: string; value?: string | number | null }> = ({
    label,
    value,
  }) => (
    <div className="grid grid-cols-3 gap-x-2 py-0.5">
      <dt className="font-medium text-neutral-600 dark:text-neutral-400">{label}:</dt>
      <dd className="col-span-2 text-neutral-800 dark:text-neutral-100">{value || 'N/A'}</dd>
    </div>
  );

  const renderAppointeeList = (appointees: Appointee[], capacity: string) => {
    if (!appointees || appointees.length === 0) {
      return (
        <p className="text-xs text-neutral-500 dark:text-neutral-400 ml-4 py-0.5">{`No ${capacity.toLowerCase()} appointees specified.`}</p>
      );
    }
    return (
      <ul className="list-disc list-inside ml-4 space-y-1">
        {appointees.map(appointee => (
          <li key={appointee.id} className="text-sm text-neutral-700 dark:text-neutral-200 py-0.5">
            <strong>{appointee.name}</strong> ({appointee.type})
            {appointee.relationshipToClient && ` - ${appointee.relationshipToClient}`}
            {appointee.contactInfo && (
              <span className="block text-xs text-neutral-500 dark:text-neutral-400">
                Contact: {appointee.contactInfo}
              </span>
            )}
            {appointee.notes && (
              <span className="block text-xs italic text-neutral-500 dark:text-neutral-400">
                Notes: {appointee.notes}
              </span>
            )}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="space-y-6">
      <Card
        title="Personal Details"
        actions={(
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditSection(0)}
            leftIcon={<Pencil className="w-4 h-4" />}
          >
            Edit
          </Button>
        )}
      >
        <dl className="space-y-1 text-sm">
          <DetailItem label="Full Name" value={personalDetails.fullName} />
          <DetailItem label="Email" value={personalDetails.email} />
          <DetailItem label="Phone" value={personalDetails.phone} />
          <DetailItem label="Address" value={personalDetails.address} />
          <DetailItem label="Date of Birth" value={personalDetails.dateOfBirth} />
          <DetailItem label="Birthplace" value={personalDetails.birthplace} />
        </dl>
      </Card>

      <Card
        title="Financial Accounts"
        actions={(
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditSection(1)}
            leftIcon={<Pencil className="w-4 h-4" />}
          >
            Edit
          </Button>
        )}
      >
        {financialAccounts.length > 0 ? (
          <ul className="space-y-3">
            {financialAccounts.map((account: FinancialAccount, index: number) => (
              <li
                key={account.id || index}
                className="p-3 border border-neutral-200 dark:border-neutral-600 rounded-md bg-neutral-50 dark:bg-neutral-700/50"
              >
                <p className="font-semibold text-neutral-800 dark:text-neutral-100">
                  {account.name}
                </p>
                <dl className="text-sm space-y-0.5 mt-1">
                  <div className="grid grid-cols-3 gap-1">
                    <dt className="text-neutral-500 dark:text-neutral-400">Institution:</dt>
                    <dd className="col-span-2 text-neutral-700 dark:text-neutral-200">
                      {account.institution}
                    </dd>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <dt className="text-neutral-500 dark:text-neutral-400">Type:</dt>
                    <dd className="col-span-2 text-neutral-700 dark:text-neutral-200">
                      {account.accountType}
                    </dd>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <dt className="text-neutral-500 dark:text-neutral-400">Value:</dt>
                    <dd className="col-span-2 text-neutral-700 dark:text-neutral-200">
                      ${account.value?.toLocaleString() || '0'}
                    </dd>
                  </div>
                  {account.description && (
                    <div className="grid grid-cols-1 gap-1">
                      <dt className="text-neutral-500 dark:text-neutral-400 italic">
                        Description:
                      </dt>
                      <dd className="col-span-2 text-neutral-700 dark:text-neutral-200 italic whitespace-pre-wrap">
                        {account.description}
                      </dd>
                    </div>
                  )}
                </dl>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-neutral-600 dark:text-neutral-300 text-sm">
            No financial accounts added.
          </p>
        )}
      </Card>

      <Card
        title="Family & Relationships"
        actions={(
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditSection(2)}
            leftIcon={<Pencil className="w-4 h-4" />}
          >
            Edit
          </Button>
        )}
      >
        {familyMembers.length > 0 ? (
          <ul className="space-y-3">
            {familyMembers.map((member: FamilyMember, index: number) => (
              <li
                key={member.id || index}
                className="p-3 border border-neutral-200 dark:border-neutral-600 rounded-md bg-neutral-50 dark:bg-neutral-700/50"
              >
                <p className="font-semibold text-neutral-800 dark:text-neutral-100">
                  {member.fullName}
                </p>
                <dl className="text-sm space-y-0.5 mt-1">
                  <DetailItem label="Relationship" value={member.relationship} />
                  <DetailItem label="Date of Birth" value={member.dateOfBirth} />
                  <DetailItem label="Birthplace" value={member.birthplace} />
                  <DetailItem label="Email" value={member.email} />
                  <DetailItem label="Phone" value={member.phone} />
                  {member.notes && (
                    <div className="grid grid-cols-1 gap-1">
                      <dt className="text-neutral-500 dark:text-neutral-400 italic">Notes:</dt>
                      <dd className="text-neutral-700 dark:text-neutral-200 italic whitespace-pre-wrap">
                        {member.notes}
                      </dd>
                    </div>
                  )}
                </dl>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-neutral-600 dark:text-neutral-300 text-sm">No family members added.</p>
        )}
      </Card>

      <Card
        title="Healthcare Directives"
        actions={(
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditSection(3)}
            leftIcon={<Pencil className="w-4 h-4" />}
          >
            Edit
          </Button>
        )}
      >
        <dl className="space-y-1 text-sm">
          <DetailItem
            label="Has Living Will"
            value={formatBooleanDisplay(healthcareDirectives.hasLivingWill)}
          />
          {healthcareDirectives.hasLivingWill && (
            <DetailItem
              label="Living Will Location"
              value={healthcareDirectives.livingWillLocation}
            />
          )}
          <div className="pt-1">
            <DetailItem
              label="Has Healthcare Proxy"
              value={formatBooleanDisplay(healthcareDirectives.hasHealthcareProxy)}
            />
          </div>
          {healthcareDirectives.hasHealthcareProxy && (
            <>
              <DetailItem label="Proxy Name" value={healthcareDirectives.healthcareProxyName} />
              <DetailItem
                label="Proxy Contact"
                value={healthcareDirectives.healthcareProxyContact}
              />
            </>
          )}
          <div className="pt-1">
            <DetailItem
              label="Organ Donor Preference"
              value={healthcareDirectives.organDonorPreference}
            />
          </div>
        </dl>
      </Card>

      <Card
        title="Key Roles & Appointments"
        actions={(
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditSection(4)}
            leftIcon={<Pencil className="w-4 h-4" />}
          >
            Edit
          </Button>
        )}
      >
        {keyRoles && keyRoles.length > 0 ? (
          keyRoles.map((role, index) => (
            <div
              key={index}
              className={`p-3 ${index > 0 ? 'mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-600' : ''}`}
            >
              <h4 className="font-semibold text-md text-neutral-800 dark:text-neutral-100 mb-1.5">
                {role.roleType}
              </h4>
              <div>
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
                  Primary Appointee(s):
                </p>
                {renderAppointeeList(role.primaryAppointees, 'Primary')}
              </div>
              <div className="mt-1.5">
                <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
                  Successor Appointee(s):
                </p>
                {renderAppointeeList(role.successorAppointees, 'Successor')}
              </div>
              {role.roleSpecificNotes && (
                <div className="mt-1.5">
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
                    Notes for {role.roleType}:
                  </p>
                  <p className="text-xs italic text-neutral-500 dark:text-neutral-400 whitespace-pre-wrap">
                    {role.roleSpecificNotes}
                  </p>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-neutral-600 dark:text-neutral-300 text-sm">No key roles assigned.</p>
        )}
      </Card>

      <div className="mt-6 p-4 bg-primary-light/10 dark:bg-primary-dark/20 border border-primary-light/30 dark:border-primary-dark/40 rounded-md">
        <p className="text-sm text-primary-dark dark:text-primary-light">
          Please review all information carefully. Clicking "Submit Intake" will save this
          information. You can typically edit it later via "My Assets" or by contacting support.
        </p>
      </div>
    </div>
  );
};

export default ReviewStep;
