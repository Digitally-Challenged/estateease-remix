/**
 * Data Access Layer - Coleman Trust Version
 *
 * This DAL is designed to work with the Coleman Trust normalized database schema
 * that properly supports estate planning relationships based on the Excel migration.
 */

import { getDatabase } from "./database";
import { transformDatabaseAsset } from "./transformers";
import type { AnyEnhancedAsset } from "../types/assets";
import type { Trust as CanonicalTrust } from "../types/trusts";
import { AssetCategory } from "../types/enums";

// =================================
// DATABASE TYPES (Raw database row types)
// =================================

export interface DatabaseAsset {
  asset_id: string;
  name: string;
  category: string;
  type: string;
  value: number;
  description?: string;
  ownership_type: string;
  ownership_details: string | null;
  asset_details: string | null;
  account_type?: string;
  institution_name?: string;
  account_number?: string;
  routing_number?: string;
  notes?: string;
  is_active: number;
  created_at: string;
  updated_at: string;
  user_id?: number;
}

export interface DatabaseTrust {
  id: number;
  trust_id: string;
  name: string;
  trust_type_id: number;
  trust_type_code: string;
  grantor: string;
  tax_id?: string;
  date_created: string;
  purpose?: string;
  is_active: number;
  created_by?: number;
}

export interface DatabaseTrustTrustee {
  trust_id: number;
  person_id: string;
  trustee_name: string;
  trustee_type_id: number;
  trustee_type_code: string;
  order_of_succession?: number;
  powers: string | null;
  start_date?: string;
  end_date?: string;
  is_active: number;
}

export interface DatabaseTrustBeneficiary {
  trust_id: number;
  person_id: string;
  beneficiary_name: string;
  beneficiary_type_id: number;
  beneficiary_type_code: string;
  relationship_type_id: number;
  relationship_type_code: string;
  percentage?: number;
  conditions?: string;
  is_active: number;
}

export interface DatabaseFamilyMember {
  family_member_id: string;
  name: string;
  relationship_code: string;
  date_of_birth?: string;
  is_minor: number;
  is_dependent: number;
  primary_phone?: string;
  secondary_phone?: string;
  email?: string;
  preferred_contact?: string;
  street1?: string;
  street2?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  notes?: string;
  is_active: number;
}

export interface DatabaseLegalRole {
  legal_role_id: string;
  role_type_code: string;
  person_id?: string;
  person_name: string;
  is_primary: number;
  order_of_precedence?: number;
  specific_powers: string | null;
  compensation_type?: string;
  compensation_amount?: number;
  compensation_details?: string;
  start_date?: string;
  end_date?: string;
  end_conditions?: string;
  notes?: string;
  is_active: number;
}

export interface DatabaseHealthcareDirective {
  directive_id: string;
  directive_type_code: string;
  date_created: string;
  last_updated: string;
  person_id?: string;
  person_name?: string;
  is_primary: number;
  life_sustaining_decision?: string;
  artificial_nutrition_decision?: string;
  pain_management_instructions?: string;
  organ_donation: number;
  body_disposition?: string;
  religious_preferences?: string;
  additional_instructions?: string;
  is_active: number;
}

export interface DatabaseBeneficiary {
  beneficiary_id: string;
  name: string;
  relationship_code: string;
  percentage?: number;
  is_primary: number;
  is_contingent: number;
  contingent_to?: string;
  per_stirpes: number;
  primary_phone?: string;
  email?: string;
  preferred_contact?: string;
  notes?: string;
  is_active: number;
}

export interface DatabaseProfessional {
  professional_id: string;
  name: string;
  professional_type_code: string;
  firm?: string;
  title?: string;
  specializations: string | null;
  credentials: string | null;
  primary_phone?: string;
  secondary_phone?: string;
  email?: string;
  preferred_contact?: string;
  street1?: string;
  street2?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  years_experience?: number;
  is_preferred_provider: number;
  notes?: string;
  is_active: number;
}

export interface DatabaseEmergencyContact {
  contact_id: string;
  name: string;
  relationship_code: string;
  contact_type: string;
  primary_phone: string;
  secondary_phone?: string;
  email?: string;
  preferred_contact?: string;
  priority: number;
  availability?: string;
  medical_authority: number;
  can_make_decisions: number;
  languages: string | null;
  notes?: string;
  is_active: number;
}

export interface UpdateUserProfileInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: {
    street1?: string;
    street2?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  maritalStatus?: string;
  numberOfDependents?: number;
  occupation?: string;
  employer?: string;
}
// Additional database row type interfaces for type safety

interface DatabaseUserProfileRow {
  profile_id: string;
  user_id: number;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  street1?: string;
  street2?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  marital_status?: string;
  number_of_dependents?: number;
  occupation?: string;
  employer?: string;
  created_at: string;
  updated_at: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  contactType: string;
  priority: number;
  contactInfo: {
    primaryPhone?: string;
    email?: string;
    preferredContact?: string;
  };
  availability?: string;
  medicalAuthority: boolean;
  canMakeDecisions: boolean;
  languages: string[];
  notes?: string;
}

export interface AssetData {
  id: string;
  name: string;
  category: string;
  type: string;
  value: number;
  description?: string;
  ownership_type: string;
  ownership_details: Record<string, unknown> | null;
  asset_details: Record<string, unknown> | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user_id?: number;
}


// =================================
// PERSON MANAGEMENT
// =================================

export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  dateOfBirth?: string;
  isMinor: boolean;
  isDependent: boolean;
  contactInfo: {
    primaryPhone?: string;
    secondaryPhone?: string;
    email?: string;
    preferredContact?: string;
  };
  address: {
    street1?: string;
    street2?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  notes?: string;
  isActive: boolean;
}

export function getPersons(userId?: number): Person[] {
  const db = getDatabase();

  let query = `
    SELECT
      fm.family_member_id,
      fm.name,
      fm.date_of_birth,
      fm.is_minor,
      fm.is_dependent,
      fm.primary_phone,
      fm.secondary_phone,
      fm.email,
      fm.preferred_contact,
      fm.street1,
      fm.street2,
      fm.city,
      fm.state,
      fm.zip_code,
      fm.country,
      fm.notes,
      fm.is_active
    FROM family_members fm
    WHERE fm.is_active = 1
  `;

  const params: (number | string)[] = [];
  if (userId) {
    query += ` AND fm.user_id = ?`;
    params.push(userId);
  }

  query += ` ORDER BY fm.name`;

  const stmt = db.prepare(query);
  const rows = stmt.all(...params) as {
    family_member_id: string;
    name: string;
    date_of_birth?: string;
    is_minor: number;
    is_dependent: number;
    primary_phone?: string;
    secondary_phone?: string;
    email?: string;
    preferred_contact?: string;
    street1?: string;
    street2?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    country?: string;
    notes?: string;
    is_active: number;
  }[];

  return rows.map((row) => {
    const parts = row.name.split(' ');
    return {
      id: row.family_member_id,
      firstName: parts[0] || '',
      lastName: parts.slice(1).join(' ') || '',
      fullName: row.name,
      dateOfBirth: row.date_of_birth,
      isMinor: row.is_minor === 1,
      isDependent: row.is_dependent === 1,
      contactInfo: {
        primaryPhone: row.primary_phone,
        secondaryPhone: row.secondary_phone,
        email: row.email,
        preferredContact: row.preferred_contact,
      },
      address: {
        street1: row.street1,
        street2: row.street2,
        city: row.city,
        state: row.state,
        zipCode: row.zip_code,
        country: row.country,
      },
      notes: row.notes,
      isActive: row.is_active === 1,
    };
  });
}

export function getPerson(personId: string): Person | null {
  const persons = getPersons();
  return persons.find((person) => person.id === personId) || null;
}

// =================================
// FAMILY RELATIONSHIPS
// =================================

export interface FamilyMember extends Person {
  relationship: string;
  relationshipType: string;
}

export function getFamilyMembers(userId?: number | string): FamilyMember[] {
  const db = getDatabase();
  const numUserId = typeof userId === 'string' ? parseInt(userId.split('-').pop() || '1') : userId;

  let query = `
    SELECT
      fm.family_member_id,
      fm.name,
      fm.date_of_birth,
      fm.is_minor,
      fm.is_dependent,
      fm.primary_phone,
      fm.secondary_phone,
      fm.email,
      fm.preferred_contact,
      fm.street1,
      fm.street2,
      fm.city,
      fm.state,
      fm.zip_code,
      fm.country,
      fm.notes,
      fm.is_active,
      rt.name as relationship_type_name,
      rt.code as relationship_type_code
    FROM family_members fm
    JOIN relationship_types rt ON fm.relationship_type_id = rt.id
    WHERE fm.is_active = 1
  `;

  const params: (number | string)[] = [];
  if (numUserId) {
    query += ` AND fm.user_id = ?`;
    params.push(numUserId);
  }

  query += ` ORDER BY fm.name`;

  const stmt = db.prepare(query);
  const members = stmt.all(...params) as {
    family_member_id: string;
    name: string;
    date_of_birth?: string;
    is_minor: number;
    is_dependent: number;
    primary_phone?: string;
    secondary_phone?: string;
    email?: string;
    preferred_contact?: string;
    street1?: string;
    street2?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    country?: string;
    notes?: string;
    is_active: number;
    relationship_type_name: string;
    relationship_type_code: string;
  }[];

  return members.map((member) => {
    const parts = member.name.split(' ');
    return {
      id: member.family_member_id,
      firstName: parts[0] || '',
      lastName: parts.slice(1).join(' ') || '',
      fullName: member.name,
      dateOfBirth: member.date_of_birth,
      isMinor: member.is_minor === 1,
      isDependent: member.is_dependent === 1,
      contactInfo: {
        primaryPhone: member.primary_phone,
        secondaryPhone: member.secondary_phone,
        email: member.email,
        preferredContact: member.preferred_contact,
      },
      address: {
        street1: member.street1,
        street2: member.street2,
        city: member.city,
        state: member.state,
        zipCode: member.zip_code,
        country: member.country,
      },
      notes: member.notes,
      isActive: member.is_active === 1,
      relationship: member.relationship_type_name,
      relationshipType: member.relationship_type_code.toLowerCase().replace("_", "-"),
    };
  });
}

// =================================
// PROFESSIONAL RELATIONSHIPS
// =================================

export interface Professional extends Person {
  type: string;
  firm?: string;
  title?: string;
  specializations: string[];
  credentials: string[];
  yearsExperience?: number;
  isPreferredProvider: boolean;
}

export function getProfessionals(userId?: number | string): Professional[] {
  const db = getDatabase();
  const numUserId = typeof userId === 'string' ? parseInt(userId.split('-').pop() || '1') : userId;

  // Use existing professionals table for now (simplified)
  let query = `
    SELECT
      p.*,
      pt.name as professional_type_name,
      pt.code as professional_type_code
    FROM professionals p
    LEFT JOIN professional_types pt ON p.professional_type_id = pt.id
    WHERE p.is_active = 1
  `;

  const params: (number | string)[] = [];
  if (numUserId) {
    query += ` AND p.user_id = ?`;
    params.push(numUserId);
  }

  query += ` ORDER BY p.name`;

  const stmt = db.prepare(query);
  const professionals = stmt.all(...params) as (DatabaseProfessional & { professional_type_name?: string; professional_type_code?: string })[];

  return professionals.map((prof) => {
    let specializations: string[] = [];
    let credentials: string[] = [];

    try {
      specializations = prof.specializations ? JSON.parse(prof.specializations) : [];
      credentials = prof.credentials ? JSON.parse(prof.credentials) : [];
    } catch (e) {
      console.error("Failed to parse professional data:", e);
    }

    // Parse name from professionals table
    const [firstName, ...lastNameParts] = prof.name.split(" ");
    const lastName = lastNameParts.join(" ") || "";

    return {
      id: prof.professional_id,
      firstName: firstName,
      lastName: lastName,
      fullName: prof.name,
      dateOfBirth: undefined,
      isMinor: false,
      isDependent: false,
      contactInfo: {
        primaryPhone: prof.primary_phone,
        secondaryPhone: prof.secondary_phone,
        email: prof.email,
        preferredContact: prof.preferred_contact,
      },
      address: {
        street1: prof.street1,
        street2: prof.street2,
        city: prof.city,
        state: prof.state,
        zipCode: prof.zip_code,
        country: prof.country,
      },
      notes: prof.notes,
      isActive: prof.is_active === 1,
      type: prof.professional_type_code
        ? prof.professional_type_code.toLowerCase().replace("_", "-")
        : "other",
      firm: prof.firm,
      title: prof.title,
      specializations,
      credentials,
      yearsExperience: prof.years_experience,
      isPreferredProvider: prof.is_preferred_provider === 1,
    };
  });
}

// =================================
// IMPROVED TRUSTS
// =================================

export interface Trustee extends Person {
  type: string;
  powers: string[];
  startDate?: string;
  endDate?: string;
  orderOfSuccession?: number;
}

export interface Beneficiary extends Person {
  type: string;
  relationship: string;
  percentage?: number;
  conditions?: string;
}

export interface Trust {
  id: string;
  name: string;
  type: string;
  grantor: Person;
  taxId?: string;
  dateCreated: string;
  purpose?: string;
  trustees: Trustee[];
  beneficiaries: Beneficiary[];
  isActive: boolean;
}

export function getTrusts(userId?: number | string): Trust[] {
  const db = getDatabase();
  const numUserId = typeof userId === 'string' ? parseInt(userId.split('-').pop() || '1') : userId;

  // Get trusts with basic information (simplified for current schema)
  let trustQuery = `
    SELECT
      t.*,
      tt.name as trust_type_name,
      tt.code as trust_type_code
    FROM trusts t
    JOIN trust_types tt ON t.trust_type_id = tt.id
    WHERE t.is_active = 1
  `;

  const params: (number | string)[] = [];
  if (numUserId) {
    trustQuery += ` AND t.created_by = ?`;
    params.push(numUserId);
  }

  trustQuery += ` ORDER BY t.name`;

  const trustStmt = db.prepare(trustQuery);
  const trusts = trustStmt.all(...params) as (DatabaseTrust & { trust_type_name: string; trust_type_code: string })[];

  if (trusts.length === 0) {
    return [];
  }

  // Get trustees for all trusts
  const trustIds = trusts.map((t) => t.id);
  const placeholders = trustIds.map(() => "?").join(",");

  // Get trustees for all trusts (using trustee_name from trust_trustees table directly)
  const trusteesQuery = `
    SELECT
      tt.trust_id,
      tt.trustee_name,
      tt.order_of_succession,
      tt.powers,
      tt.start_date,
      tt.end_date,
      ttype.name as trustee_type_name
    FROM trust_trustees tt
    JOIN trustee_types ttype ON tt.trustee_type_id = ttype.id
    WHERE tt.trust_id IN (${placeholders}) AND tt.is_active = 1
    ORDER BY tt.trust_id, tt.order_of_succession ASC
  `;

  interface TrusteeRow {
    trust_id: number;
    trustee_name: string;
    order_of_succession: number | null;
    powers: string | null;
    start_date: string | null;
    end_date: string | null;
    trustee_type_name: string;
  }

  const trusteesStmt = db.prepare(trusteesQuery);
  const allTrustees = trusteesStmt.all(...trustIds) as TrusteeRow[];

  // Get beneficiaries for all trusts (using beneficiary_name from trust_beneficiaries table directly)
  const beneficiariesQuery = `
    SELECT
      tb.trust_id,
      tb.beneficiary_name,
      tb.percentage,
      tb.conditions,
      bt.name as beneficiary_type_name,
      rt.name as relationship_type_name
    FROM trust_beneficiaries tb
    JOIN beneficiary_types bt ON tb.beneficiary_type_id = bt.id
    JOIN relationship_types rt ON tb.relationship_type_id = rt.id
    WHERE tb.trust_id IN (${placeholders}) AND tb.is_active = 1
    ORDER BY tb.trust_id, tb.percentage DESC
  `;

  interface BeneficiaryRow {
    trust_id: number;
    beneficiary_name: string;
    percentage: number | null;
    conditions: string | null;
    beneficiary_type_name: string;
    relationship_type_name: string;
  }

  const beneficiariesStmt = db.prepare(beneficiariesQuery);
  const allBeneficiaries = beneficiariesStmt.all(...trustIds) as BeneficiaryRow[];

  // Helper to build a Person from a name string
  const personFromName = (name: string): Person => {
    const parts = name.split(' ');
    return {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      firstName: parts[0] || '',
      lastName: parts.slice(1).join(' ') || '',
      fullName: name,
      isMinor: false,
      isDependent: false,
      contactInfo: {},
      address: {},
      isActive: true,
    };
  };

  // Group trustees and beneficiaries by trust_id
  const trusteesByTrustId = allTrustees.reduce<Record<number, Trustee[]>>((acc, trustee) => {
    if (!acc[trustee.trust_id]) acc[trustee.trust_id] = [];
    acc[trustee.trust_id].push({
      ...personFromName(trustee.trustee_name),
      type: trustee.trustee_type_name,
      powers: trustee.powers ? JSON.parse(trustee.powers) : [],
      startDate: trustee.start_date || undefined,
      endDate: trustee.end_date || undefined,
      orderOfSuccession: trustee.order_of_succession || undefined,
    });
    return acc;
  }, {});

  const beneficiariesByTrustId = allBeneficiaries.reduce<Record<number, Beneficiary[]>>((acc, beneficiary) => {
    if (!acc[beneficiary.trust_id]) acc[beneficiary.trust_id] = [];
    acc[beneficiary.trust_id].push({
      ...personFromName(beneficiary.beneficiary_name),
      type: beneficiary.beneficiary_type_name,
      relationship: beneficiary.relationship_type_name,
      percentage: beneficiary.percentage || undefined,
      conditions: beneficiary.conditions || undefined,
    });
    return acc;
  }, {});

  // Build complete trust objects
  return trusts.map((trust) => ({
    id: trust.trust_id,
    name: trust.name,
    type: trust.trust_type_code
      ? trust.trust_type_code.toLowerCase().replace("_", "-")
      : "revocable",
    grantor: {
      id: trust.grantor, // Using text grantor field for now
      firstName: "",
      lastName: "",
      fullName: trust.grantor,
      dateOfBirth: undefined,
      isMinor: false,
      isDependent: false,
      contactInfo: {},
      address: {},
      isActive: true,
    },
    taxId: trust.tax_id,
    dateCreated: trust.date_created,
    purpose: trust.purpose,
    trustees: trusteesByTrustId[trust.id] || [],
    beneficiaries: beneficiariesByTrustId[trust.id] || [],
    isActive: trust.is_active === 1,
  }));
}

export function getTrust(trustId: string): CanonicalTrust | null {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT
      t.*,
      tt.code as trust_type_code,
      tt.name as trust_type_name
    FROM trusts t
    JOIN trust_types tt ON t.trust_type_id = tt.id
    WHERE t.trust_id = ? AND t.is_active = 1
  `);

  const trust = stmt.get(trustId) as (DatabaseTrust & { trust_type_code: string; trust_type_name: string }) | undefined;

  if (!trust) return null;

  return {
    id: trust.trust_id,
    name: trust.name,
    type: (trust.trust_type_code?.toLowerCase() || "revocable") as CanonicalTrust["type"],
    taxId: trust.tax_id || "",
    dateCreated: trust.date_created,
    grantor: trust.grantor,
    purpose: trust.purpose || "",
    trustees: [],
    beneficiaries: [],
    notes: trust.purpose || undefined,
    isActive: trust.is_active === 1,
    created_by: trust.created_by,
  };
}

// =================================
// LEGAL ROLES
// =================================

export interface LegalRole {
  id: string;
  assignee: Person;
  roleType: string;
  documentType?: string;
  documentId?: number;
  priorityOrder?: number;
  conditions?: string;
  isActive: boolean;
}

export function getLegalRoles(userId?: number | string): LegalRole[] {
  const db = getDatabase();
  const numUserId = typeof userId === 'string' ? parseInt(userId.split('-').pop() || '1') : userId;

  let query = `
    SELECT
      lr.legal_role_id as role_id,
      lr.person_id,
      lr.person_name,
      lr.is_primary,
      lr.order_of_precedence,
      lr.specific_powers,
      lr.notes,
      lr.is_active,
      lrt.name as role_type_name,
      lrt.code as role_type_code
    FROM legal_roles lr
    JOIN legal_role_types lrt ON lr.role_type_id = lrt.id
    WHERE lr.is_active = 1
  `;

  const params: (number | string)[] = [];
  if (numUserId) {
    query += ` AND lr.user_id = ?`;
    params.push(numUserId);
  }

  query += ` ORDER BY lr.order_of_precedence, lr.person_name`;

  interface LegalRoleRow {
    role_id: string;
    person_id: string | null;
    person_name: string;
    is_primary: number;
    order_of_precedence: number | null;
    specific_powers: string | null;
    notes: string | null;
    is_active: number;
    role_type_name: string;
    role_type_code: string;
  }

  const stmt = db.prepare(query);
  const roles = stmt.all(...params) as LegalRoleRow[];

  return roles.map((role) => {
    const nameParts = role.person_name.split(' ');
    return {
      id: role.role_id,
      assignee: {
        id: role.person_id || role.role_id,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        fullName: role.person_name,
        isMinor: false,
        isDependent: false,
        contactInfo: {},
        address: {},
        notes: role.notes || undefined,
        isActive: role.is_active === 1,
      },
      roleType: role.role_type_name,
      priorityOrder: role.order_of_precedence || undefined,
      isActive: role.is_active === 1,
    };
  });
}

// =================================
// HEALTHCARE DIRECTIVES
// =================================

export interface HealthcareDirective {
  id: string;
  principal: Person;
  primaryProxy?: Person;
  secondaryProxy?: Person;
  directiveType: string;
  dateCreated: string;
  dateExecuted?: string;
  preferences?: Record<string, unknown>;
  isActive: boolean;
}

export function getHealthcareDirectives(userId?: number | string): HealthcareDirective[] {
  const db = getDatabase();
  const numUserId = typeof userId === 'string' ? parseInt(userId.split('-').pop() || '1') : userId;

  let query = `
    SELECT
      hd.directive_id,
      hd.user_id,
      hd.person_id,
      hd.person_name,
      hd.is_primary,
      hd.life_sustaining_decision,
      hd.artificial_nutrition_decision,
      hd.pain_management_instructions,
      hd.organ_donation,
      hd.body_disposition,
      hd.religious_preferences,
      hd.additional_instructions,
      hd.date_created,
      hd.last_updated,
      hd.is_active,
      hdt.name as directive_type_name
    FROM healthcare_directives hd
    JOIN healthcare_directive_types hdt ON hd.directive_type_id = hdt.id
    WHERE hd.is_active = 1
  `;

  const params: (number | string)[] = [];
  if (numUserId) {
    query += ` AND hd.user_id = ?`;
    params.push(numUserId);
  }

  query += ` ORDER BY hd.date_created DESC`;

  interface HdRow {
    directive_id: string;
    user_id: number;
    person_id: string | null;
    person_name: string | null;
    is_primary: number;
    life_sustaining_decision: string | null;
    artificial_nutrition_decision: string | null;
    pain_management_instructions: string | null;
    organ_donation: number | null;
    body_disposition: string | null;
    religious_preferences: string | null;
    additional_instructions: string | null;
    date_created: string;
    last_updated: string;
    is_active: number;
    directive_type_name: string;
  }

  const stmt = db.prepare(query);
  const directives = stmt.all(...params) as HdRow[];

  // Build a Person from the person_name field (no separate persons join needed)
  const makePerson = (name: string | null, personId: string | null): Person => {
    const parts = (name || '').split(' ');
    return {
      id: personId || 'unknown',
      firstName: parts[0] || '',
      lastName: parts.slice(1).join(' ') || '',
      fullName: name || '',
      dateOfBirth: undefined,
      isMinor: false,
      isDependent: false,
      contactInfo: {},
      address: {},
      isActive: true,
    };
  };

  return directives.map((d): HealthcareDirective => ({
    id: d.directive_id,
    principal: makePerson(d.person_name, d.person_id),
    directiveType: d.directive_type_name,
    dateCreated: d.date_created,
    preferences: {
      lifeSustainingDecision: d.life_sustaining_decision,
      artificialNutritionDecision: d.artificial_nutrition_decision,
      painManagementInstructions: d.pain_management_instructions,
      organDonation: d.organ_donation === 1,
      bodyDisposition: d.body_disposition,
      religiousPreferences: d.religious_preferences,
      additionalInstructions: d.additional_instructions,
    },
    isActive: d.is_active === 1,
  }));
}

// =================================
// BENEFICIARIES (STANDALONE)
// =================================

export function getBeneficiaries(userId?: number | string): Beneficiary[] {
  const db = getDatabase();
  const numUserId = typeof userId === 'string' ? parseInt(userId.split('-').pop() || '1') : userId;

  let query = `
    SELECT DISTINCT
      tb.beneficiary_name,
      bt.name as beneficiary_type_name,
      rt.name as relationship_type_name,
      tb.percentage,
      tb.conditions,
      tb.is_active
    FROM trust_beneficiaries tb
    JOIN beneficiary_types bt ON tb.beneficiary_type_id = bt.id
    JOIN relationship_types rt ON tb.relationship_type_id = rt.id
    JOIN trusts t ON tb.trust_id = t.id
    WHERE tb.is_active = 1
  `;

  const params: (number | string)[] = [];
  if (numUserId) {
    query += ` AND t.created_by = ?`;
    params.push(numUserId);
  }

  query += ` ORDER BY tb.beneficiary_name`;

  const stmt = db.prepare(query);
  const beneficiaries = stmt.all(...params) as {
    beneficiary_name: string;
    beneficiary_type_name: string;
    relationship_type_name: string;
    percentage?: number;
    conditions?: string;
    is_active: number;
  }[];

  return beneficiaries.map((b) => {
    const parts = b.beneficiary_name.split(' ');
    return {
      id: b.beneficiary_name.toLowerCase().replace(/\s+/g, '-'),
      firstName: parts[0] || '',
      lastName: parts.slice(1).join(' ') || '',
      fullName: b.beneficiary_name,
      isMinor: false,
      isDependent: false,
      contactInfo: {},
      address: {},
      isActive: b.is_active === 1,
      type: b.beneficiary_type_name,
      relationship: b.relationship_type_name,
      percentage: b.percentage,
      conditions: b.conditions,
    };
  });
}

// =================================
// EMERGENCY CONTACTS
// =================================

export function getEmergencyContacts(userId?: number | string): EmergencyContact[] {
  const db = getDatabase();
  const numUserId = typeof userId === 'string' ? parseInt(userId.split('-').pop() || '1') : userId;
  let query = `
    SELECT
      ec.*,
      fm.name as family_name,
      fm.email as family_email,
      fm.primary_phone as family_phone
    FROM emergency_contacts ec
    LEFT JOIN family_members fm ON ec.contact_id = fm.id AND ec.contact_type = 'family_member'
    WHERE ec.is_active = 1
  `;

  const params: (number | string)[] = [];
  if (numUserId) {
    query += " AND ec.user_id = ?";
    params.push(numUserId);
  }

  query += " ORDER BY ec.priority ASC, ec.contact_name";

  try {
    const stmt = db.prepare(query);
    const contacts = stmt.all(...params) as { id: string; contact_name?: string; family_name?: string; relationship?: string; contact_category?: string; priority?: number; phone?: string; family_phone?: string; email?: string; family_email?: string; preferred_contact_method?: string; availability?: string; medical_authority: number; decision_authority: number; languages?: string; notes?: string }[];

    return contacts.map((contact) => ({
      id: contact.id,
      name: contact.contact_name || contact.family_name || "Unknown Contact",
      relationship: contact.relationship || "emergency_contact",
      contactType: contact.contact_category || "primary",
      priority: contact.priority || 999,
      contactInfo: {
        primaryPhone: contact.phone || contact.family_phone,
        email: contact.email || contact.family_email,
        preferredContact: contact.preferred_contact_method || "phone",
      },
      availability: contact.availability,
      medicalAuthority: contact.medical_authority === 1,
      canMakeDecisions: contact.decision_authority === 1,
      languages: contact.languages ? contact.languages.split(",") : [],
      notes: contact.notes,
    }));
  } catch (error) {
    console.error("Error fetching emergency contacts:", error);
    // Return empty array if emergency_contacts table doesn't exist
    return [];
  }
}

// =================================
// ASSET MANAGEMENT (Essential for Compatibility)
// =================================

export function getAssets(userId?: number | string): AnyEnhancedAsset[] {
  const db = getDatabase();
  const numUserId = typeof userId === 'string' ? parseInt(userId.split('-').pop() || '1') : userId;
  let query = `
    SELECT
      a.*
    FROM assets a
    WHERE a.is_active = 1
  `;

  const params: (number | string)[] = [];
  if (numUserId) {
    query += " AND a.user_id = ?";
    params.push(numUserId);
  }

  query += " ORDER BY a.name";

  const stmt = db.prepare(query);
  const assets = stmt.all(...params) as DatabaseAsset[];

  return assets.map(transformDatabaseAsset);
}

export function getAsset(assetId: string): AnyEnhancedAsset | null {
  const db = getDatabase();
  const stmt = db.prepare("SELECT * FROM assets WHERE asset_id = ? AND is_active = 1");
  const asset = stmt.get(assetId) as DatabaseAsset | undefined;

  if (!asset) return null;

  return transformDatabaseAsset(asset);
}

// Dashboard Stats Function
export function getDashboardStats(userId?: number | string): {
  totalNetWorth: number;
  realEstateValue: number;
  investmentValue: number;
  trustCount: number;
  assetCount: number;
} {
  const userIdNum =
    typeof userId === "string" ? parseInt(userId.split("-").pop() || "1") : userId || 1;

  const assets = getAssets(userIdNum);
  const trusts = getTrusts(userIdNum);

  const totalNetWorth = assets.reduce((sum: number, asset) => sum + (asset.value || 0), 0);

  const realEstateValue = assets
    .filter((asset) => asset.category === AssetCategory.REAL_ESTATE)
    .reduce((sum: number, asset) => sum + (asset.value || 0), 0);

  const investmentValue = assets
    .filter((asset) => asset.category === AssetCategory.FINANCIAL_ACCOUNT)
    .reduce((sum: number, asset) => sum + (asset.value || 0), 0);

  return {
    totalNetWorth,
    realEstateValue,
    investmentValue,
    trustCount: trusts.length,
    assetCount: assets.length,
  };
}

// Recent Assets Function
export function getRecentAssets(userId?: number | string, limit: number = 4): AnyEnhancedAsset[] {
  const userIdNum =
    typeof userId === "string" ? parseInt(userId.split("-").pop() || "1") : userId || 1;

  const assets = getAssets(userIdNum);

  // Return most recent assets (already ordered by name from getAssets, take first N)
  return assets.slice(0, limit);
}

// =================================
// TRUST ASSETS
// =================================

export function getAssetsByTrust(trustId: string): AnyEnhancedAsset[] {
  const db = getDatabase();

  // Assets link to trusts via ownership_details JSON: {"trustId": "trust-xxx-001", ...}
  const query = `
    SELECT a.*
    FROM assets a
    WHERE a.is_active = 1
      AND a.ownership_type = 'TRUST'
      AND json_extract(a.ownership_details, '$.trustId') = ?
    ORDER BY a.name
  `;

  const stmt = db.prepare(query);
  const assets = stmt.all(trustId) as DatabaseAsset[];

  return assets.map(transformDatabaseAsset);
}

// =================================
// SEARCH FUNCTIONALITY
// =================================

export interface SearchOptions {
  query: string;
  userId?: string;
  types?: Array<"asset" | "trust" | "family" | "professional">;
  limit?: number;
}

export interface SearchResult {
  id: string;
  type: "asset" | "trust" | "family" | "professional";
  title: string;
  subtitle?: string;
  category?: string;
  value?: number;
  matchedField: string;
  matchScore: number;
}

export function searchAll(options: SearchOptions): SearchResult[] {
  const { query, userId, types, limit = 50 } = options;
  const db = getDatabase();
  const searchTerm = query.toLowerCase().trim();
  const results: SearchResult[] = [];

  // Determine which types to search
  const searchTypes = types && types.length > 0 ? types : ["asset", "trust", "family", "professional"];

  // Search Assets
  if (searchTypes.includes("asset")) {
    let assetQuery = `
      SELECT
        asset_id as id,
        name,
        category,
        type,
        value,
        description
      FROM assets
      WHERE is_active = 1
    `;

    const params: (number | string)[] = [];
    if (userId) {
      const userIdNum = typeof userId === "string" ? parseInt(userId.split("-").pop() || "1") : userId;
      assetQuery += " AND user_id = ?";
      params.push(userIdNum);
    }

    const assetStmt = db.prepare(assetQuery);
    const assets = assetStmt.all(...params) as { id: string; name: string; category: string; type: string; value: number; description?: string }[];

    assets.forEach((asset) => {
      const nameLower = (asset.name || "").toLowerCase();
      const categoryLower = (asset.category || "").toLowerCase();
      const descLower = (asset.description || "").toLowerCase();

      let matchScore = 0;
      let matchedField = "";

      if (nameLower.includes(searchTerm)) {
        matchScore = 100;
        matchedField = "name";
      } else if (categoryLower.includes(searchTerm)) {
        matchScore = 80;
        matchedField = "category";
      } else if (descLower.includes(searchTerm)) {
        matchScore = 60;
        matchedField = "description";
      }

      if (matchScore > 0) {
        results.push({
          id: asset.id,
          type: "asset",
          title: asset.name,
          subtitle: asset.category,
          category: asset.category,
          value: asset.value,
          matchedField,
          matchScore,
        });
      }
    });
  }

  // Search Trusts
  if (searchTypes.includes("trust")) {
    let trustQuery = `
      SELECT
        t.trust_id as id,
        t.name,
        t.grantor,
        t.purpose,
        tt.name as trust_type
      FROM trusts t
      JOIN trust_types tt ON t.trust_type_id = tt.id
      WHERE t.is_active = 1
    `;

    const params: (number | string)[] = [];
    if (userId) {
      const userIdNum = typeof userId === "string" ? parseInt(userId.split("-").pop() || "1") : userId;
      trustQuery += " AND t.created_by = ?";
      params.push(userIdNum);
    }

    const trustStmt = db.prepare(trustQuery);
    const trusts = trustStmt.all(...params) as Array<{ id: string; name: string; grantor: string; purpose?: string; trust_type: string }>;

    trusts.forEach((trust) => {
      const nameLower = (trust.name || "").toLowerCase();
      const grantorLower = (trust.grantor || "").toLowerCase();
      const purposeLower = (trust.purpose || "").toLowerCase();

      let matchScore = 0;
      let matchedField = "";

      if (nameLower.includes(searchTerm)) {
        matchScore = 100;
        matchedField = "name";
      } else if (grantorLower.includes(searchTerm)) {
        matchScore = 85;
        matchedField = "grantor";
      } else if (purposeLower.includes(searchTerm)) {
        matchScore = 70;
        matchedField = "purpose";
      }

      if (matchScore > 0) {
        results.push({
          id: trust.id,
          type: "trust",
          title: trust.name,
          subtitle: trust.trust_type || "",
          category: trust.trust_type || "",
          matchedField,
          matchScore,
        });
      }
    });
  }

  // Search Family Members
  if (searchTypes.includes("family")) {
    let familyQuery = `
      SELECT
        fm.family_member_id as id,
        fm.name as full_name,
        fm.email,
        rt.name as relationship
      FROM family_members fm
      JOIN relationship_types rt ON fm.relationship_type_id = rt.id
      WHERE fm.is_active = 1
    `;

    const params: (number | string)[] = [];
    if (userId) {
      const userIdNum = typeof userId === "string" ? parseInt(userId.split("-").pop() || "1") : userId;
      familyQuery += " AND fm.user_id = ?";
      params.push(userIdNum);
    }

    const familyStmt = db.prepare(familyQuery);
    const members = familyStmt.all(...params) as { id: string; full_name: string; email?: string; relationship: string }[];

    members.forEach((member) => {
      const nameLower = (member.full_name || "").toLowerCase();
      const emailLower = (member.email || "").toLowerCase();
      const relationshipLower = (member.relationship || "").toLowerCase();

      let matchScore = 0;
      let matchedField = "";

      if (nameLower.includes(searchTerm)) {
        matchScore = 100;
        matchedField = "name";
      } else if (emailLower.includes(searchTerm)) {
        matchScore = 90;
        matchedField = "email";
      } else if (relationshipLower.includes(searchTerm)) {
        matchScore = 75;
        matchedField = "relationship";
      }

      if (matchScore > 0) {
        results.push({
          id: member.id,
          type: "family",
          title: member.full_name,
          subtitle: member.relationship,
          category: member.relationship,
          matchedField,
          matchScore,
        });
      }
    });
  }

  // Search Professionals
  if (searchTypes.includes("professional")) {
    let profQuery = `
      SELECT
        p.professional_id as id,
        p.name,
        p.firm,
        p.email,
        pt.name as professional_type
      FROM professionals p
      LEFT JOIN professional_types pt ON p.professional_type_id = pt.id
      WHERE p.is_active = 1
    `;

    const params: (number | string)[] = [];
    if (userId) {
      const userIdNum = typeof userId === "string" ? parseInt(userId.split("-").pop() || "1") : userId;
      profQuery += " AND p.user_id = ?";
      params.push(userIdNum);
    }

    const profStmt = db.prepare(profQuery);
    const professionals = profStmt.all(...params) as { id: string; name: string; firm?: string; email?: string; professional_type?: string }[];

    professionals.forEach((prof) => {
      const nameLower = (prof.name || "").toLowerCase();
      const firmLower = (prof.firm || "").toLowerCase();
      const emailLower = (prof.email || "").toLowerCase();
      const typeLower = (prof.professional_type || "").toLowerCase();

      let matchScore = 0;
      let matchedField = "";

      if (nameLower.includes(searchTerm)) {
        matchScore = 100;
        matchedField = "name";
      } else if (firmLower.includes(searchTerm)) {
        matchScore = 90;
        matchedField = "firm";
      } else if (emailLower.includes(searchTerm)) {
        matchScore = 85;
        matchedField = "email";
      } else if (typeLower.includes(searchTerm)) {
        matchScore = 75;
        matchedField = "type";
      }

      if (matchScore > 0) {
        results.push({
          id: prof.id,
          type: "professional",
          title: prof.name,
          subtitle: prof.firm || prof.professional_type,
          category: prof.professional_type,
          matchedField,
          matchScore,
        });
      }
    });
  }

  // Sort by match score (highest first) and limit results
  return results.sort((a, b) => b.matchScore - a.matchScore).slice(0, limit);
}

// =================================
// WILLS & POWERS OF ATTORNEY
// =================================

import type { Will, PowerOfAttorney, WillStatus, PowerOfAttorneyType, PowerOfAttorneyStatus } from "../types/documents";

/**
 * Get all wills for a user
 */
export function getWills(userId: number | string): Will[] {
  const db = getDatabase();
  const numUserId = typeof userId === 'string' ? parseInt(userId.split('-').pop() || '1') : userId;

  const stmt = db.prepare(`
    SELECT * FROM wills
    WHERE user_id = ? AND is_active = 1
    ORDER BY date_created DESC
  `);

  interface WillRow {
    will_id: string;
    user_id: number;
    document_name: string;
    testator_name: string;
    date_created: string;
    date_signed: string | null;
    status: string;
    executor_primary: string | null;
    executor_secondary: string | null;
    witness1_name: string | null;
    witness2_name: string | null;
    notary_name: string | null;
    notary_state: string | null;
    specific_bequests: string | null;
    residuary_clause: string | null;
    guardian_nominations: string | null;
    funeral_wishes: string | null;
    other_provisions: string | null;
    revokes_prior: number;
    codicil_count: number;
    attorney_name: string | null;
    law_firm: string | null;
    notes: string | null;
    is_active: number;
    created_at: string;
    updated_at: string;
  }

  const rows = stmt.all(numUserId) as WillRow[];

  return rows.map((r): Will => ({
    id: r.will_id,
    userId: String(r.user_id),
    documentName: r.document_name,
    testatorName: r.testator_name,
    dateCreated: r.date_created,
    dateSigned: r.date_signed,
    status: r.status as WillStatus,
    executorPrimary: r.executor_primary,
    executorSecondary: r.executor_secondary,
    witness1Name: r.witness1_name,
    witness2Name: r.witness2_name,
    notaryName: r.notary_name,
    notaryState: r.notary_state,
    specificBequests: r.specific_bequests,
    residuaryClause: r.residuary_clause,
    guardianNominations: r.guardian_nominations,
    funeralWishes: r.funeral_wishes,
    otherProvisions: r.other_provisions,
    revokesPrior: r.revokes_prior === 1,
    codicilCount: r.codicil_count,
    attorneyName: r.attorney_name,
    lawFirm: r.law_firm,
    notes: r.notes,
    isActive: r.is_active === 1,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
}

/**
 * Create a new will
 */
export function createWill(data: Record<string, unknown>): string {
  const db = getDatabase();
  const willId = `will-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const userId = typeof data.userId === 'string' ? parseInt(String(data.userId).split('-').pop() || '1') : (data.userId as number) || 1;

  const stmt = db.prepare(`
    INSERT INTO wills (
      will_id, user_id, document_name, testator_name,
      date_created, date_signed, status,
      executor_primary, executor_secondary,
      witness1_name, witness2_name, notary_name, notary_state,
      specific_bequests, residuary_clause, guardian_nominations,
      funeral_wishes, other_provisions,
      revokes_prior, attorney_name, law_firm, notes
    ) VALUES (?, ?, ?, ?, datetime('now'), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    willId,
    userId,
    data.documentName || 'Untitled Will',
    data.testatorName || '',
    (data.dateSigned as string) || null,
    (data.status as string) || 'DRAFT',
    (data.executorPrimary as string) || null,
    (data.executorSecondary as string) || null,
    (data.witness1Name as string) || null,
    (data.witness2Name as string) || null,
    (data.notaryName as string) || null,
    (data.notaryState as string) || null,
    (data.specificBequests as string) || null,
    (data.residuaryClause as string) || null,
    (data.guardianNominations as string) || null,
    (data.funeralWishes as string) || null,
    (data.otherProvisions as string) || null,
    data.revokesPrior !== false ? 1 : 0,
    (data.attorneyName as string) || null,
    (data.lawFirm as string) || null,
    (data.notes as string) || null,
  );

  return willId;
}

/**
 * Get all powers of attorney for a user
 */
export function getPowersOfAttorney(userId: number | string): PowerOfAttorney[] {
  const db = getDatabase();
  const numUserId = typeof userId === 'string' ? parseInt(userId.split('-').pop() || '1') : userId;

  const stmt = db.prepare(`
    SELECT * FROM powers_of_attorney
    WHERE user_id = ? AND is_active = 1
    ORDER BY date_signed DESC, created_at DESC
  `);

  interface PoaRow {
    poa_id: string;
    user_id: number;
    document_name: string;
    type: string;
    principal_name: string;
    agent_primary: string;
    agent_secondary: string | null;
    effective_date: string | null;
    termination_date: string | null;
    durable: number;
    spring_condition: string | null;
    powers_granted: string | null;
    limitations: string | null;
    healthcare_powers: string | null;
    financial_powers: string | null;
    real_estate_powers: string | null;
    business_powers: string | null;
    tax_powers: string | null;
    gift_powers: string | null;
    trust_powers: string | null;
    special_instructions: string | null;
    witness1_name: string | null;
    witness2_name: string | null;
    notary_name: string | null;
    notary_state: string | null;
    date_signed: string | null;
    status: string;
    attorney_name: string | null;
    law_firm: string | null;
    notes: string | null;
    is_active: number;
    created_at: string;
    updated_at: string;
  }

  const rows = stmt.all(numUserId) as PoaRow[];

  return rows.map((r): PowerOfAttorney => ({
    id: r.poa_id,
    userId: String(r.user_id),
    documentName: r.document_name,
    type: r.type as PowerOfAttorneyType,
    principalName: r.principal_name,
    agentPrimary: r.agent_primary,
    agentSecondary: r.agent_secondary,
    effectiveDate: r.effective_date,
    terminationDate: r.termination_date,
    durable: r.durable === 1,
    springCondition: r.spring_condition,
    powersGranted: r.powers_granted,
    limitations: r.limitations,
    healthcarePowers: r.healthcare_powers,
    financialPowers: r.financial_powers,
    realEstatePowers: r.real_estate_powers,
    businessPowers: r.business_powers,
    taxPowers: r.tax_powers,
    giftPowers: r.gift_powers,
    trustPowers: r.trust_powers,
    specialInstructions: r.special_instructions,
    witness1Name: r.witness1_name,
    witness2Name: r.witness2_name,
    notaryName: r.notary_name,
    notaryState: r.notary_state,
    dateSigned: r.date_signed,
    status: r.status as PowerOfAttorneyStatus,
    attorneyName: r.attorney_name,
    lawFirm: r.law_firm,
    notes: r.notes,
    isActive: r.is_active === 1,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
}

/**
 * Create a new power of attorney
 */
export function createPowerOfAttorney(data: Record<string, unknown>): string {
  const db = getDatabase();
  const poaId = `poa-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const userId = typeof data.userId === 'string' ? parseInt(String(data.userId).split('-').pop() || '1') : (data.userId as number) || 1;

  const stmt = db.prepare(`
    INSERT INTO powers_of_attorney (
      poa_id, user_id, document_name, type,
      principal_name, agent_primary, agent_secondary,
      effective_date, termination_date, durable, spring_condition,
      powers_granted, limitations,
      healthcare_powers, financial_powers, real_estate_powers,
      business_powers, tax_powers, gift_powers, trust_powers,
      special_instructions,
      witness1_name, witness2_name, notary_name, notary_state,
      date_signed, status, attorney_name, law_firm, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    poaId,
    userId,
    data.documentName || 'Untitled POA',
    data.type || 'GENERAL',
    data.principalName || '',
    data.agentPrimary || '',
    (data.agentSecondary as string) || null,
    (data.effectiveDate as string) || null,
    (data.terminationDate as string) || null,
    data.durable !== false ? 1 : 0,
    (data.springCondition as string) || null,
    (data.powersGranted as string) || null,
    (data.limitations as string) || null,
    (data.healthcarePowers as string) || null,
    (data.financialPowers as string) || null,
    (data.realEstatePowers as string) || null,
    (data.businessPowers as string) || null,
    (data.taxPowers as string) || null,
    (data.giftPowers as string) || null,
    (data.trustPowers as string) || null,
    (data.specialInstructions as string) || null,
    (data.witness1Name as string) || null,
    (data.witness2Name as string) || null,
    (data.notaryName as string) || null,
    (data.notaryState as string) || null,
    (data.dateSigned as string) || null,
    (data.status as string) || 'DRAFT',
    (data.attorneyName as string) || null,
    (data.lawFirm as string) || null,
    (data.notes as string) || null,
  );

  return poaId;
}

/**
 * Create a new healthcare directive
 */
export function createHealthcareDirective(data: Record<string, unknown>, userIdParam: number | string): string {
  const db = getDatabase();
  const directiveId = `hd-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const userId = typeof userIdParam === 'string' ? parseInt(userIdParam.split('-').pop() || '1') : userIdParam;

  // Map directive type string to type ID
  const directiveTypeCode = (data.directiveType as string || 'advance_directive').toLowerCase().replace(/ /g, '_');
  const typeStmt = db.prepare("SELECT id FROM healthcare_directive_types WHERE code = ?");
  const typeRow = typeStmt.get(directiveTypeCode) as { id: number } | undefined;
  const typeId = typeRow?.id || 1;

  const stmt = db.prepare(`
    INSERT INTO healthcare_directives (
      directive_id, user_id, directive_type_id,
      person_name, is_primary,
      life_sustaining_decision, artificial_nutrition_decision,
      pain_management_instructions, organ_donation, body_disposition,
      religious_preferences, additional_instructions,
      date_created, last_updated
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `);

  stmt.run(
    directiveId,
    userId,
    typeId,
    (data.personName as string) || null,
    data.isPrimary ? 1 : 0,
    (data.lifeSustainingDecision as string) || null,
    (data.artificialNutritionDecision as string) || null,
    (data.painManagementInstructions as string) || null,
    data.organDonation ? 1 : 0,
    (data.bodyDisposition as string) || null,
    (data.religiousPreferences as string) || null,
    (data.additionalInstructions as string) || null,
  );

  return directiveId;
}

/**
 * Get family coordination metrics
 * Computes metrics from existing family, professional, and emergency contact data
 */
export function getFamilyCoordinationMetrics(userId: number | string): {
  totalFamilyMembers: number;
  relationshipBreakdown: { relationship: string; count: number }[];
  contactCoverage: { email: number; phone: number };
  roleCoverage: { role: string; filled: boolean }[];
  emergencyReadiness: {
    totalContacts: number;
    medicalAuthority: number;
    decisionAuthority: number;
    avgPriority: number;
  };
  coordinationScore: number;
  recommendations: string[];
} {
  const members = getFamilyMembers(userId);
  const contacts = getEmergencyContacts(userId);
  const roles = getLegalRoles(userId);

  const totalFamilyMembers = members.length;

  // Relationship breakdown
  const relationshipMap: Record<string, number> = {};
  for (const m of members) {
    const rel = m.relationship || "other";
    relationshipMap[rel] = (relationshipMap[rel] || 0) + 1;
  }
  const relationshipBreakdown = Object.entries(relationshipMap).map(([relationship, count]) => ({
    relationship,
    count,
  }));

  // Contact coverage
  let emailCount = 0;
  let phoneCount = 0;
  for (const m of members) {
    if (m.contactInfo?.email) emailCount++;
    if (m.contactInfo?.primaryPhone) phoneCount++;
  }
  const contactCoverage = {
    email: totalFamilyMembers > 0 ? Math.round((emailCount / totalFamilyMembers) * 100) : 0,
    phone: totalFamilyMembers > 0 ? Math.round((phoneCount / totalFamilyMembers) * 100) : 0,
  };

  // Role coverage
  const roleTypes = ["executor", "trustee", "guardian", "healthcare_proxy", "power_of_attorney"];
  const filledRoles = new Set(roles.map((r) => r.roleType.toLowerCase()));
  const roleCoverage = roleTypes.map((role) => ({
    role,
    filled: filledRoles.has(role),
  }));

  // Emergency readiness
  const totalContacts = contacts.length;
  const emergencyReadiness = {
    totalContacts,
    medicalAuthority: 0,
    decisionAuthority: 0,
    avgPriority: 0,
  };

  // Coordination score (0-100)
  let score = 0;
  if (totalFamilyMembers > 0) score += 20;
  if (contactCoverage.email > 50) score += 15;
  if (contactCoverage.phone > 50) score += 15;
  if (totalContacts > 0) score += 20;
  if (roleCoverage.some((r) => r.filled)) score += 15;
  if (roles.length >= 2) score += 15;

  // Recommendations
  const recommendations: string[] = [];
  if (totalFamilyMembers === 0) recommendations.push("Add family members to begin coordination");
  if (contactCoverage.email < 50) recommendations.push("Add email addresses for more family members");
  if (contactCoverage.phone < 50) recommendations.push("Add phone numbers for more family members");
  if (totalContacts === 0) recommendations.push("Add emergency contacts");
  if (!roleCoverage.some((r) => r.filled)) recommendations.push("Assign key legal roles (executor, trustee, etc.)");

  return {
    totalFamilyMembers,
    relationshipBreakdown,
    contactCoverage,
    roleCoverage,
    emergencyReadiness,
    coordinationScore: score,
    recommendations,
  };
}

// =================================
// USER PROFILE MANAGEMENT
// =================================

export interface UserProfile {
  id: string;
  userId: number;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: {
    street1?: string;
    street2?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  maritalStatus?: string;
  numberOfDependents?: number;
  occupation?: string;
  employer?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Get user profile by user ID
 */
export function getUserProfile(userId: number | string): UserProfile | null {
  const db = getDatabase();

  const numUserId = typeof userId === 'string' ? parseInt(userId.split('-').pop() || '1') : userId;

  try {
    const stmt = db.prepare(`
      SELECT
        profile_id,
        user_id,
        first_name,
        last_name,
        email,
        phone,
        date_of_birth,
        street1,
        street2,
        city,
        state,
        zip_code,
        country,
        marital_status,
        number_of_dependents,
        occupation,
        employer,
        created_at,
        updated_at
      FROM user_profiles
      WHERE user_id = ? AND is_active = 1
    `);

    const profile = stmt.get(numUserId) as DatabaseUserProfileRow | undefined;

    if (!profile) {
      return null;
    }

    return {
      id: profile.profile_id,
      userId: profile.user_id,
      firstName: profile.first_name,
      lastName: profile.last_name,
      email: profile.email || undefined,
      phone: profile.phone || undefined,
      dateOfBirth: profile.date_of_birth || undefined,
      address:
        profile.street1 || profile.city
          ? {
              street1: profile.street1 || undefined,
              street2: profile.street2 || undefined,
              city: profile.city || undefined,
              state: profile.state || undefined,
              zipCode: profile.zip_code || undefined,
              country: profile.country || undefined,
            }
          : undefined,
      maritalStatus: profile.marital_status || undefined,
      numberOfDependents: profile.number_of_dependents || undefined,
      occupation: profile.occupation || undefined,
      employer: profile.employer || undefined,
      createdAt: profile.created_at,
      updatedAt: profile.updated_at,
    };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}

/**
 * Update user profile
 */
export function updateUserProfile(userId: number | string, data: UpdateUserProfileInput): void {
  const db = getDatabase();
  const numUserId = typeof userId === 'string' ? parseInt(userId.split('-').pop() || '1') : userId;

  try {
    // Build update query dynamically based on provided fields
    const updates: string[] = [];
    const values: (string | number)[] = [];

    if (data.firstName !== undefined) {
      updates.push("first_name = ?");
      values.push(data.firstName);
    }
    if (data.lastName !== undefined) {
      updates.push("last_name = ?");
      values.push(data.lastName);
    }
    if (data.email !== undefined) {
      updates.push("email = ?");
      values.push(data.email);
    }
    if (data.phone !== undefined) {
      updates.push("phone = ?");
      values.push(data.phone);
    }
    if (data.dateOfBirth !== undefined) {
      updates.push("date_of_birth = ?");
      values.push(data.dateOfBirth);
    }
    if (data.maritalStatus !== undefined) {
      updates.push("marital_status = ?");
      values.push(data.maritalStatus);
    }
    if (data.numberOfDependents !== undefined) {
      updates.push("number_of_dependents = ?");
      values.push(data.numberOfDependents);
    }
    if (data.occupation !== undefined) {
      updates.push("occupation = ?");
      values.push(data.occupation);
    }
    if (data.employer !== undefined) {
      updates.push("employer = ?");
      values.push(data.employer);
    }

    // Handle address fields
    if (data.address) {
      if (data.address.street1 !== undefined) {
        updates.push("street1 = ?");
        values.push(data.address.street1);
      }
      if (data.address.street2 !== undefined) {
        updates.push("street2 = ?");
        values.push(data.address.street2);
      }
      if (data.address.city !== undefined) {
        updates.push("city = ?");
        values.push(data.address.city);
      }
      if (data.address.state !== undefined) {
        updates.push("state = ?");
        values.push(data.address.state);
      }
      if (data.address.zipCode !== undefined) {
        updates.push("zip_code = ?");
        values.push(data.address.zipCode);
      }
      if (data.address.country !== undefined) {
        updates.push("country = ?");
        values.push(data.address.country);
      }
    }

    // Always update the updated_at timestamp
    updates.push("updated_at = CURRENT_TIMESTAMP");

    if (updates.length === 1) {
      // Only updated_at changed, nothing to do
      return;
    }

    values.push(numUserId);

    const query = `
      UPDATE user_profiles
      SET ${updates.join(", ")}
      WHERE user_id = ? AND is_active = 1
    `;

    const stmt = db.prepare(query);
    stmt.run(...values);
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
}
