import { Form, useNavigation } from "@remix-run/react";
import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { FormField } from "~/components/ui/forms/form-field";
import { Input } from "~/components/ui/forms/input";
import { Select } from "~/components/ui/forms/select";
import { Textarea } from "~/components/ui/forms/textarea";
import { Button } from "~/components/ui/button";
import type { AnyAsset, Trust } from "~/types";
import {
  AssetCategory,
  PropertyType,
  FinancialAccountType,
  InsurancePolicyType,
  BusinessStructureType,
  PersonalPropertyType,
  OwnershipType,
} from "~/types/enums";

interface AssetFormProps {
  asset?: AnyAsset;
  trusts: Trust[];
  mode: 'create' | 'edit';
}

// Helper function to format enum values to human-readable labels
function formatEnumLabel(value: string): string {
  // Handle UPPERCASE enum values
  return value
    .toLowerCase()
    .split('_')
    .map(word => {
      // Special cases
      if (word === '401k') return '401(k)';
      if (word === 'ira') return 'IRA';
      if (word === 'roth') return 'Roth';
      if (word === 'llc') return 'LLC';
      if (word === 'corp') return 'Corp';
      // Capitalize first letter
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

export function AssetForm({ asset, trusts, mode }: AssetFormProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory | ''>(
    (asset?.category as AssetCategory) || ''
  );
  const [ownershipType, setOwnershipType] = useState<OwnershipType>(
    (asset?.ownership.type as OwnershipType) || OwnershipType.INDIVIDUAL
  );
  
  // Get type options based on selected category
  const typeOptions = useMemo(() => {
    switch (selectedCategory) {
      case AssetCategory.REAL_ESTATE:
        return Object.values(PropertyType).map(type => ({
          value: type,
          label: formatEnumLabel(type)
        }));
      case AssetCategory.FINANCIAL_ACCOUNT:
        return Object.values(FinancialAccountType).map(type => ({
          value: type,
          label: formatEnumLabel(type)
        }));
      case AssetCategory.INSURANCE_POLICY:
        return Object.values(InsurancePolicyType).map(type => ({
          value: type,
          label: formatEnumLabel(type)
        }));
      case AssetCategory.BUSINESS_INTEREST:
        return Object.values(BusinessStructureType).map(type => ({
          value: type,
          label: formatEnumLabel(type)
        }));
      case AssetCategory.PERSONAL_PROPERTY:
        return Object.values(PersonalPropertyType).map(type => ({
          value: type,
          label: formatEnumLabel(type)
        }));
      default:
        return [];
    }
  }, [selectedCategory]);
  
  return (
    <Form method="post" className="space-y-6">
      <input type="hidden" name="intent" value={mode} />
      {mode === 'edit' && asset && (
        <input type="hidden" name="assetId" value={asset.id} />
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>{mode === 'create' ? 'Add New Asset' : 'Edit Asset'}</CardTitle>
          <CardDescription>
            {mode === 'create' 
              ? 'Enter the details for the new asset' 
              : 'Update the asset information'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Asset Name" required>
              <Input
                name="name"
                defaultValue={asset?.name}
                required
                placeholder="e.g., 2211 NW Willow, Bentonville"
              />
            </FormField>
            
            <FormField label="Category" required>
              <Select
                name="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as AssetCategory | '')}
                required
                placeholder="Select a category"
                options={Object.values(AssetCategory).map((category) => ({
                  value: category,
                  label: formatEnumLabel(category)
                }))}
              />
            </FormField>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Current Value" required>
              <Input
                type="number"
                name="value"
                defaultValue={asset?.value?.toString()}
                required
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </FormField>
            
            <FormField label="Asset Type" required>
              <Select
                name="type"
                defaultValue={asset?.type || ''}
                required
                disabled={!selectedCategory}
                placeholder={selectedCategory ? 'Select a type' : 'Select a category first'}
                options={typeOptions}
              />
            </FormField>
          </div>
          
          <FormField label="Description">
            <Textarea
              name="description"
              defaultValue={asset?.description}
              rows={3}
              placeholder="Additional details about the asset..."
            />
          </FormField>
          
          {/* Ownership Information */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Ownership Information</h3>
            
            <div className="space-y-4">
              <FormField label="Ownership Type" required>
                <Select
                  name="ownershipType"
                  value={ownershipType}
                  onChange={(e) => setOwnershipType(e.target.value as OwnershipType)}
                  options={Object.values(OwnershipType).map((type) => ({
                    value: type,
                    label: formatEnumLabel(type)
                  }))}
                />
              </FormField>
              
              {ownershipType === OwnershipType.TRUST && (
                <FormField label="Select Trust" required>
                  <Select
                    name="trustId"
                    defaultValue={asset?.ownership.trustId}
                    required
                    placeholder="Select a trust"
                    options={trusts.map((trust) => ({
                      value: trust.id,
                      label: trust.name
                    }))}
                  />
                </FormField>
              )}
              
              {ownershipType === OwnershipType.BUSINESS && (
                <FormField label="Business Entity Name">
                  <Input
                    name="businessEntityId"
                    defaultValue={asset?.ownership.businessEntityId}
                    placeholder="Enter business entity name"
                  />
                </FormField>
              )}
              
              <FormField label="Ownership Percentage" required>
                <Input
                  type="number"
                  name="percentage"
                  defaultValue={asset?.ownership.percentage?.toString() || "100"}
                  required
                  min="0"
                  max="100"
                  step="0.01"
                />
              </FormField>
            </div>
          </div>
          
          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={() => window.history.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              {isSubmitting 
                ? (mode === 'create' ? 'Creating...' : 'Updating...') 
                : (mode === 'create' ? 'Create Asset' : 'Update Asset')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </Form>
  );
}