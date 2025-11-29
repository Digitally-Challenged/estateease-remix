/**
 * Data Access Layer - Coleman Trust Version
 *
 * This DAL is designed to work with the Coleman Trust normalized database schema
 * that properly supports estate planning relationships based on the Excel migration.
 */

import { getDatabase } from "./database";

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

interface DatabasePerson {
  person_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
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
      p.*
    FROM persons p
    WHERE p.is_active = 1
  `;

  const params: (number | string)[] = [];
  if (userId) {
    query += ` AND (
      p.id IN (SELECT person_id FROM family_relationships WHERE user_id = ?)
      OR p.id IN (SELECT person_id FROM professional_relationships WHERE user_id = ?)
    )`;
    params.push(userId, userId);
  }

  query += ` ORDER BY p.last_name, p.first_name`;

  const stmt = db.prepare(query);
  const persons = stmt.all(...params) as DatabasePerson[];

  return persons.map((person) => ({
    id: person.person_id,
    firstName: person.first_name,
    lastName: person.last_name,
    fullName: person.full_name,
    dateOfBirth: person.date_of_birth,
    isMinor: person.is_minor === 1,
    isDependent: person.is_dependent === 1,
    contactInfo: {
      primaryPhone: person.primary_phone,
      secondaryPhone: person.secondary_phone,
      email: person.email,
      preferredContact: person.preferred_contact,
    },
    address: {
      street1: person.street1,
      street2: person.street2,
      city: person.city,
      state: person.state,
      zipCode: person.zip_code,
      country: person.country,
    },
    notes: person.notes,
    isActive: person.is_active === 1,
  }));
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

export function getFamilyMembers(userId?: number): FamilyMember[] {
  const db = getDatabase();

  let query = `
    SELECT 
      p.*,
      rt.name as relationship_type_name,
      rt.code as relationship_type_code
    FROM persons p
    JOIN family_relationships fr ON p.id = fr.person_id
    JOIN relationship_types rt ON fr.relationship_type_id = rt.id
    WHERE fr.is_active = 1 AND p.is_active = 1
  `;

  const params: (number | string)[] = [];
  if (userId) {
    query += ` AND fr.user_id = ?`;
    params.push(userId);
  }

  query += ` ORDER BY p.last_name, p.first_name`;

  const stmt = db.prepare(query);
  const members = stmt.all(...params) as (DatabasePerson & { relationship_type_name: string; relationship_type_code: string })[];

  return members.map((member) => ({
    id: member.person_id,
    firstName: member.first_name,
    lastName: member.last_name,
    fullName: member.full_name,
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
  }));
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

export function getProfessionals(userId?: number): Professional[] {
  const db = getDatabase();

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
  if (userId) {
    query += ` AND p.user_id = ?`;
    params.push(userId);
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

export function getTrusts(userId?: number): Trust[] {
  const db = getDatabase();

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
  if (userId) {
    trustQuery += ` AND t.created_by = ?`;
    params.push(userId);
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

  const trusteesQuery = `
    SELECT 
      tt.trust_id,
      tt.order_of_succession,
      tt.powers,
      tt.start_date,
      tt.end_date,
      p.*,
      ttype.name as trustee_type_name
    FROM trust_trustees tt
    JOIN persons p ON tt.person_id = p.id
    JOIN trustee_types ttype ON tt.trustee_type_id = ttype.id
    WHERE tt.trust_id IN (${placeholders}) AND tt.is_active = 1
    ORDER BY tt.trust_id, tt.order_of_succession ASC
  `;

  const trusteesStmt = db.prepare(trusteesQuery);
  const allTrustees = trusteesStmt.all(...trustIds) as (DatabasePerson & { trust_id: number; order_of_succession?: number; powers: string | null; start_date?: string; end_date?: string; trustee_type_name: string })[];

  // Get beneficiaries for all trusts
  const beneficiariesQuery = `
    SELECT 
      tb.trust_id,
      tb.percentage,
      tb.conditions,
      p.*,
      bt.name as beneficiary_type_name,
      rt.name as relationship_type_name
    FROM trust_beneficiaries tb
    JOIN persons p ON tb.person_id = p.id
    JOIN beneficiary_types bt ON tb.beneficiary_type_id = bt.id
    JOIN relationship_types rt ON tb.relationship_type_id = rt.id
    WHERE tb.trust_id IN (${placeholders}) AND tb.is_active = 1
    ORDER BY tb.trust_id, tb.percentage DESC
  `;

  const beneficiariesStmt = db.prepare(beneficiariesQuery);
  const allBeneficiaries = beneficiariesStmt.all(...trustIds) as (DatabasePerson & { trust_id: number; percentage?: number; conditions?: string; beneficiary_type_name: string; relationship_type_name: string })[];

  // Group trustees and beneficiaries by trust_id
  const trusteesByTrustId = allTrustees.reduce<Record<number, Trustee[]>>((acc, trustee) => {
    if (!acc[trustee.trust_id]) acc[trustee.trust_id] = [];
    acc[trustee.trust_id].push({
      id: trustee.person_id,
      firstName: trustee.first_name,
      lastName: trustee.last_name,
      fullName: trustee.full_name,
      dateOfBirth: trustee.date_of_birth,
      isMinor: trustee.is_minor === 1,
      isDependent: trustee.is_dependent === 1,
      contactInfo: {
        primaryPhone: trustee.primary_phone,
        secondaryPhone: trustee.secondary_phone,
        email: trustee.email,
        preferredContact: trustee.preferred_contact,
      },
      address: {
        street1: trustee.street1,
        street2: trustee.street2,
        city: trustee.city,
        state: trustee.state,
        zipCode: trustee.zip_code,
        country: trustee.country,
      },
      notes: trustee.notes,
      isActive: trustee.is_active === 1,
      type: trustee.trustee_type_name,
      powers: trustee.powers ? JSON.parse(trustee.powers) : [],
      startDate: trustee.start_date,
      endDate: trustee.end_date,
      orderOfSuccession: trustee.order_of_succession,
    });
    return acc;
  }, {});

  const beneficiariesByTrustId = allBeneficiaries.reduce<Record<number, Beneficiary[]>>((acc, beneficiary) => {
    if (!acc[beneficiary.trust_id]) acc[beneficiary.trust_id] = [];
    acc[beneficiary.trust_id].push({
      id: beneficiary.person_id,
      firstName: beneficiary.first_name,
      lastName: beneficiary.last_name,
      fullName: beneficiary.full_name,
      dateOfBirth: beneficiary.date_of_birth,
      isMinor: beneficiary.is_minor === 1,
      isDependent: beneficiary.is_dependent === 1,
      contactInfo: {
        primaryPhone: beneficiary.primary_phone,
        secondaryPhone: beneficiary.secondary_phone,
        email: beneficiary.email,
        preferredContact: beneficiary.preferred_contact,
      },
      address: {
        street1: beneficiary.street1,
        street2: beneficiary.street2,
        city: beneficiary.city,
        state: beneficiary.state,
        zipCode: beneficiary.zip_code,
        country: beneficiary.country,
      },
      notes: beneficiary.notes,
      isActive: beneficiary.is_active === 1,
      type: beneficiary.beneficiary_type_name,
      relationship: beneficiary.relationship_type_name,
      percentage: beneficiary.percentage,
      conditions: beneficiary.conditions,
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

export function getTrust(trustId: string): Trust | null {
  const trusts = getTrusts();
  return trusts.find((trust) => trust.id === trustId) || null;
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

export function getLegalRoles(userId?: number): LegalRole[] {
  const db = getDatabase();

  let query = `
    SELECT 
      lr.*,
      p.*,
      lrt.name as role_type_name,
      lrt.code as role_type_code
    FROM legal_roles lr
    JOIN persons p ON lr.assignee_id = p.id
    JOIN legal_role_types lrt ON lr.role_type_id = lrt.id
    WHERE lr.is_active = 1 AND p.is_active = 1
  `;

  const params: (number | string)[] = [];
  if (userId) {
    query += ` AND lr.user_id = ?`;
    params.push(userId);
  }

  query += ` ORDER BY lr.document_type, lr.priority_order, p.last_name`;

  const stmt = db.prepare(query);
  const roles = stmt.all(...params) as (DatabasePerson & { role_id: string; role_type_name: string; role_type_code: string; document_type?: string; document_id?: number; priority_order?: number; conditions?: string })[];

  return roles.map((role) => ({
    id: role.role_id,
    assignee: {
      id: role.person_id,
      firstName: role.first_name,
      lastName: role.last_name,
      fullName: role.full_name,
      dateOfBirth: role.date_of_birth,
      isMinor: role.is_minor === 1,
      isDependent: role.is_dependent === 1,
      contactInfo: {
        primaryPhone: role.primary_phone,
        secondaryPhone: role.secondary_phone,
        email: role.email,
        preferredContact: role.preferred_contact,
      },
      address: {
        street1: role.street1,
        street2: role.street2,
        city: role.city,
        state: role.state,
        zipCode: role.zip_code,
        country: role.country,
      },
      notes: role.notes,
      isActive: role.is_active === 1,
    },
    roleType: role.role_type_name,
    documentType: role.document_type,
    documentId: role.document_id,
    priorityOrder: role.priority_order,
    conditions: role.conditions,
    isActive: role.is_active === 1,
  }));
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

export function getHealthcareDirectives(userId?: number): HealthcareDirective[] {
  const db = getDatabase();

  let query = `
    SELECT 
      hd.*,
      hdt.name as directive_type_name,
      p_principal.person_id as principal_person_id,
      p_principal.first_name as principal_first_name,
      p_principal.last_name as principal_last_name,
      p_principal.full_name as principal_full_name,
      p_proxy1.person_id as proxy1_person_id,
      p_proxy1.first_name as proxy1_first_name,
      p_proxy1.last_name as proxy1_last_name,
      p_proxy1.full_name as proxy1_full_name,
      p_proxy2.person_id as proxy2_person_id,
      p_proxy2.first_name as proxy2_first_name,
      p_proxy2.last_name as proxy2_last_name,
      p_proxy2.full_name as proxy2_full_name
    FROM healthcare_directives hd
    JOIN healthcare_directive_types hdt ON hd.directive_type_id = hdt.id
    JOIN persons p_principal ON hd.principal_id = p_principal.id
    LEFT JOIN persons p_proxy1 ON hd.proxy_primary_id = p_proxy1.id
    LEFT JOIN persons p_proxy2 ON hd.proxy_secondary_id = p_proxy2.id
    WHERE hd.is_active = 1
  `;

  const params: (number | string)[] = [];
  if (userId) {
    query += ` AND hd.created_by = ?`;
    params.push(userId);
  }

  query += ` ORDER BY hd.date_created DESC`;

  const stmt = db.prepare(query);
  const directives = stmt.all(...params) as { directive_id: string; directive_type_name: string; date_created: string; date_executed?: string; preferences?: string; is_active: number; principal_person_id: string; principal_first_name: string; principal_last_name: string; principal_full_name: string; proxy1_person_id?: string; proxy1_first_name?: string; proxy1_last_name?: string; proxy1_full_name?: string; proxy2_person_id?: string; proxy2_first_name?: string; proxy2_last_name?: string; proxy2_full_name?: string }[];

  return directives.map((directive): HealthcareDirective => ({
    id: directive.directive_id,
    principal: {
      id: directive.principal_person_id,
      firstName: directive.principal_first_name,
      lastName: directive.principal_last_name,
      fullName: directive.principal_full_name,
      dateOfBirth: undefined,
      isMinor: false,
      isDependent: false,
      contactInfo: {},
      address: {},
      isActive: true,
    },
    primaryProxy: directive.proxy1_person_id
      ? {
          id: directive.proxy1_person_id,
          firstName: directive.proxy1_first_name || "",
          lastName: directive.proxy1_last_name || "",
          fullName: directive.proxy1_full_name || "",
          dateOfBirth: undefined,
          isMinor: false,
          isDependent: false,
          contactInfo: {},
          address: {},
          isActive: true,
        }
      : undefined,
    secondaryProxy: directive.proxy2_person_id
      ? {
          id: directive.proxy2_person_id,
          firstName: directive.proxy2_first_name || "",
          lastName: directive.proxy2_last_name || "",
          fullName: directive.proxy2_full_name || "",
          dateOfBirth: undefined,
          isMinor: false,
          isDependent: false,
          contactInfo: {},
          address: {},
          isActive: true,
        }
      : undefined,
    directiveType: directive.directive_type_name,
    dateCreated: directive.date_created,
    dateExecuted: directive.date_executed,
    preferences: directive.preferences ? JSON.parse(directive.preferences) as Record<string, unknown> : undefined,
    isActive: directive.is_active === 1,
  }));
}

// =================================
// BENEFICIARIES (STANDALONE)
// =================================

export function getBeneficiaries(userId?: number): Beneficiary[] {
  const db = getDatabase();

  let query = `
    SELECT DISTINCT
      p.*,
      'trust_beneficiary' as source_type,
      bt.name as beneficiary_type_name,
      rt.name as relationship_type_name,
      tb.percentage,
      tb.conditions
    FROM persons p
    JOIN trust_beneficiaries tb ON p.id = tb.person_id
    JOIN beneficiary_types bt ON tb.beneficiary_type_id = bt.id
    JOIN relationship_types rt ON tb.relationship_type_id = rt.id
    JOIN trusts t ON tb.trust_id = t.id
    WHERE tb.is_active = 1 AND p.is_active = 1
  `;

  const params: (number | string)[] = [];
  if (userId) {
    query += ` AND t.created_by = ?`;
    params.push(userId);
  }

  query += ` ORDER BY p.last_name, p.first_name`;

  const stmt = db.prepare(query);
  const beneficiaries = stmt.all(...params) as (DatabasePerson & { source_type: string; beneficiary_type_name: string; relationship_type_name: string; percentage?: number; conditions?: string })[];

  return beneficiaries.map((beneficiary) => ({
    id: beneficiary.person_id,
    firstName: beneficiary.first_name,
    lastName: beneficiary.last_name,
    fullName: beneficiary.full_name,
    dateOfBirth: beneficiary.date_of_birth,
    isMinor: beneficiary.is_minor === 1,
    isDependent: beneficiary.is_dependent === 1,
    contactInfo: {
      primaryPhone: beneficiary.primary_phone,
      secondaryPhone: beneficiary.secondary_phone,
      email: beneficiary.email,
      preferredContact: beneficiary.preferred_contact,
    },
    address: {
      street1: beneficiary.street1,
      street2: beneficiary.street2,
      city: beneficiary.city,
      state: beneficiary.state,
      zipCode: beneficiary.zip_code,
      country: beneficiary.country,
    },
    notes: beneficiary.notes,
    isActive: beneficiary.is_active === 1,
    type: beneficiary.beneficiary_type_name,
    relationship: beneficiary.relationship_type_name,
    percentage: beneficiary.percentage,
    conditions: beneficiary.conditions,
  }));
}

// =================================
// EMERGENCY CONTACTS
// =================================

export function getEmergencyContacts(userId?: number): EmergencyContact[] {
  const db = getDatabase();
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
  if (userId) {
    query += " AND ec.user_id = ?";
    params.push(userId);
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

export function getAssets(userId?: number): AssetData[] {
  const db = getDatabase();
  let query = `
    SELECT 
      a.*
    FROM assets a
    WHERE a.is_active = 1
  `;

  const params: (number | string)[] = [];
  if (userId) {
    query += " AND a.user_id = ?";
    params.push(userId);
  }

  query += " ORDER BY a.name";

  const stmt = db.prepare(query);
  const assets = stmt.all(...params) as DatabaseAsset[];

  return assets.map((asset) => {
    let ownership_details = null;
    try {
      if (typeof asset.ownership_details === "string") {
        ownership_details = JSON.parse(asset.ownership_details);
      } else {
        ownership_details = asset.ownership_details;
      }
    } catch (e) {
      console.error("Failed to parse ownership_details:", e);
      ownership_details = null;
    }

    let asset_details = null;
    try {
      if (typeof asset.asset_details === "string") {
        asset_details = JSON.parse(asset.asset_details);
      } else {
        asset_details = asset.asset_details;
      }
    } catch (e) {
      console.error("Failed to parse asset_details:", e);
      asset_details = null;
    }

    return {
      id: asset.asset_id,
      name: asset.name,
      category: asset.category,
      type: asset.type,
      value: asset.value,
      description: asset.description,
      ownership_type: asset.ownership_type,
      ownership_details,
      asset_details,
      isActive: asset.is_active === 1,
      createdAt: asset.created_at,
      updatedAt: asset.updated_at,
    };
  });
}

export function getAsset(assetId: string): AssetData | null {
  const db = getDatabase();
  const stmt = db.prepare("SELECT * FROM assets WHERE asset_id = ? AND is_active = 1");
  const asset = stmt.get(assetId) as DatabaseAsset | undefined;

  if (!asset) return null;

  // Transform the asset similar to getAssets
  let ownership_details = null;
  try {
    if (typeof asset.ownership_details === "string") {
      ownership_details = JSON.parse(asset.ownership_details);
    } else {
      ownership_details = asset.ownership_details;
    }
  } catch (e) {
    console.error("Failed to parse ownership_details:", e);
    ownership_details = null;
  }

  let asset_details = null;
  try {
    if (typeof asset.asset_details === "string") {
      asset_details = JSON.parse(asset.asset_details);
    } else {
      asset_details = asset.asset_details;
    }
  } catch (e) {
    console.error("Failed to parse asset_details:", e);
    asset_details = null;
  }

  return {
    id: asset.asset_id,
    name: asset.name,
    category: asset.category,
    type: asset.type,
    value: asset.value,
    description: asset.description,
    ownership_type: asset.ownership_type,
    ownership_details,
    asset_details,
    isActive: asset.is_active === 1,
    createdAt: asset.created_at,
    updatedAt: asset.updated_at,
  };
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

  const totalNetWorth = assets.reduce((sum, asset) => sum + (asset.value || 0), 0);

  const realEstateValue = assets
    .filter((asset) => asset.category === "REAL_ESTATE")
    .reduce((sum, asset) => sum + (asset.value || 0), 0);

  const investmentValue = assets
    .filter((asset) => asset.category === "FINANCIAL_ACCOUNT")
    .reduce((sum, asset) => sum + (asset.value || 0), 0);

  return {
    totalNetWorth,
    realEstateValue,
    investmentValue,
    trustCount: trusts.length,
    assetCount: assets.length,
  };
}

// Recent Assets Function
export function getRecentAssets(userId?: number | string, limit: number = 4): AssetData[] {
  const userIdNum =
    typeof userId === "string" ? parseInt(userId.split("-").pop() || "1") : userId || 1;

  const assets = getAssets(userIdNum);

  // Sort by updatedAt or createdAt, then take the most recent
  return assets
    .sort((a, b) => {
      const aDate = new Date(a.updatedAt || a.createdAt || 0);
      const bDate = new Date(b.updatedAt || b.createdAt || 0);
      return bDate.getTime() - aDate.getTime();
    })
    .slice(0, limit);
}

// =================================
// TRUST ASSETS
// =================================

export function getAssetsByTrust(trustId: string): AssetData[] {
  const db = getDatabase();

  // Get trust's internal ID
  const trustStmt = db.prepare("SELECT id FROM trusts WHERE trust_id = ? AND is_active = 1");
  const trust = trustStmt.get(trustId) as { id: number } | undefined;

  if (!trust) {
    return [];
  }

  // Get assets linked to this trust
  const query = `
    SELECT
      a.*
    FROM assets a
    JOIN trust_assets ta ON a.id = ta.asset_id
    WHERE ta.trust_id = ? AND a.is_active = 1 AND ta.is_active = 1
    ORDER BY a.name
  `;

  const stmt = db.prepare(query);
  const assets = stmt.all(trust.id) as DatabaseAsset[];

  return assets.map((asset) => {
    let ownership_details = null;
    try {
      if (typeof asset.ownership_details === "string") {
        ownership_details = JSON.parse(asset.ownership_details);
      } else {
        ownership_details = asset.ownership_details;
      }
    } catch (e) {
      console.error("Failed to parse ownership_details:", e);
      ownership_details = null;
    }

    let asset_details = null;
    try {
      if (typeof asset.asset_details === "string") {
        asset_details = JSON.parse(asset.asset_details);
      } else {
        asset_details = asset.asset_details;
      }
    } catch (e) {
      console.error("Failed to parse asset_details:", e);
      asset_details = null;
    }

    return {
      id: asset.asset_id,
      name: asset.name,
      category: asset.category,
      type: asset.type,
      value: asset.value,
      description: asset.description,
      ownership_type: asset.ownership_type,
      ownership_details,
      asset_details,
      isActive: asset.is_active === 1,
      createdAt: asset.created_at,
      updatedAt: asset.updated_at,
    };
  });
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
        p.person_id as id,
        p.first_name,
        p.last_name,
        p.full_name,
        p.email,
        rt.name as relationship
      FROM persons p
      JOIN family_relationships fr ON p.id = fr.person_id
      JOIN relationship_types rt ON fr.relationship_type_id = rt.id
      WHERE fr.is_active = 1 AND p.is_active = 1
    `;

    const params: (number | string)[] = [];
    if (userId) {
      const userIdNum = typeof userId === "string" ? parseInt(userId.split("-").pop() || "1") : userId;
      familyQuery += " AND fr.user_id = ?";
      params.push(userIdNum);
    }

    const familyStmt = db.prepare(familyQuery);
    const members = familyStmt.all(...params) as { id: string; first_name: string; last_name: string; full_name: string; email?: string; relationship: string }[];

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
export function getUserProfile(userId: number): UserProfile | null {
  const db = getDatabase();

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

    const profile = stmt.get(userId) as DatabaseUserProfileRow | undefined;

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
export function updateUserProfile(userId: number, data: UpdateUserProfileInput): void {
  const db = getDatabase();

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

    values.push(userId);

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
