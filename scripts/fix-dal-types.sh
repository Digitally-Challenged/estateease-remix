#!/bin/bash

# Script to replace any types with proper types in dal.ts

DAL_FILE="app/lib/dal.ts"

# Add additional Database row type interfaces near the top
sed -i '' '/^export interface DatabaseEmergencyContact {/a\
\
interface DatabasePerson {\
  person_id: string;\
  first_name: string;\
  last_name: string;\
  full_name: string;\
  date_of_birth?: string;\
  is_minor: number;\
  is_dependent: number;\
  primary_phone?: string;\
  secondary_phone?: string;\
  email?: string;\
  preferred_contact?: string;\
  street1?: string;\
  street2?: string;\
  city?: string;\
  state?: string;\
  zip_code?: string;\
  country?: string;\
  notes?: string;\
  is_active: number;\
}
' "$DAL_FILE"

echo "Type replacement complete!"
