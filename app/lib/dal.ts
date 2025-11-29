/**
 * Data Access Layer - Coleman Trust Version
 *
 * This DAL is designed to work with the Coleman Trust normalized database schema
 * that properly supports estate planning relationships based on the Excel migration.
 */

import { getDatabase } from "./database";

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

  const params: any[] = [];
  if (userId) {
    query += ` AND (
      p.id IN (SELECT person_id FROM family_relationships WHERE user_id = ?)
      OR p.id IN (SELECT person_id FROM professional_relationships WHERE user_id = ?)
    )`;
    params.push(userId, userId);
  }

  query += ` ORDER BY p.last_name, p.first_name`;

  const stmt = db.prepare(query);
  const persons = stmt.all(...params);

  return persons.map((person: any) => ({
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

  const params: any[] = [];
  if (userId) {
    query += ` AND fr.user_id = ?`;
    params.push(userId);
  }

  query += ` ORDER BY p.last_name, p.first_name`;

  const stmt = db.prepare(query);
  const members = stmt.all(...params);

  return members.map((member: any) => ({
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

  const params: any[] = [];
  if (userId) {
    query += ` AND p.user_id = ?`;
    params.push(userId);
  }

  query += ` ORDER BY p.name`;

  const stmt = db.prepare(query);
  const professionals = stmt.all(...params);

  return professionals.map((prof: any) => {
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

  const params: any[] = [];
  if (userId) {
    trustQuery += ` AND t.created_by = ?`;
    params.push(userId);
  }

  trustQuery += ` ORDER BY t.name`;

  const trustStmt = db.prepare(trustQuery);
  const trusts = trustStmt.all(...params);

  if (trusts.length === 0) {
    return [];
  }

  // Get trustees for all trusts
  const trustIds = trusts.map((t: any) => t.id);
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
  const allTrustees = trusteesStmt.all(...trustIds);

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
  const allBeneficiaries = beneficiariesStmt.all(...trustIds);

  // Group trustees and beneficiaries by trust_id
  const trusteesByTrustId = allTrustees.reduce((acc: any, trustee: any) => {
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

  const beneficiariesByTrustId = allBeneficiaries.reduce((acc: any, beneficiary: any) => {
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
  return trusts.map((trust: any) => ({
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

  const params: any[] = [];
  if (userId) {
    query += ` AND lr.user_id = ?`;
    params.push(userId);
  }

  query += ` ORDER BY lr.document_type, lr.priority_order, p.last_name`;

  const stmt = db.prepare(query);
  const roles = stmt.all(...params);

  return roles.map((role: any) => ({
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
  preferences?: any;
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

  const params: any[] = [];
  if (userId) {
    query += ` AND hd.created_by = ?`;
    params.push(userId);
  }

  query += ` ORDER BY hd.date_created DESC`;

  const stmt = db.prepare(query);
  const directives = stmt.all(...params);

  return directives.map((directive: any) => ({
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
          firstName: directive.proxy1_first_name,
          lastName: directive.proxy1_last_name,
          fullName: directive.proxy1_full_name,
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
          firstName: directive.proxy2_first_name,
          lastName: directive.proxy2_last_name,
          fullName: directive.proxy2_full_name,
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
    preferences: directive.preferences ? JSON.parse(directive.preferences) : undefined,
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

  const params: any[] = [];
  if (userId) {
    query += ` AND t.created_by = ?`;
    params.push(userId);
  }

  query += ` ORDER BY p.last_name, p.first_name`;

  const stmt = db.prepare(query);
  const beneficiaries = stmt.all(...params);

  return beneficiaries.map((beneficiary: any) => ({
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

export function getEmergencyContacts(userId?: number): any[] {
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

  const params: any[] = [];
  if (userId) {
    query += " AND ec.user_id = ?";
    params.push(userId);
  }

  query += " ORDER BY ec.priority ASC, ec.contact_name";

  try {
    const stmt = db.prepare(query);
    const contacts = stmt.all(...params);

    return contacts.map((contact: any) => ({
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

export function getAssets(userId?: number): any[] {
  const db = getDatabase();
  let query = `
    SELECT 
      a.*
    FROM assets a
    WHERE a.is_active = 1
  `;

  const params: any[] = [];
  if (userId) {
    query += " AND a.user_id = ?";
    params.push(userId);
  }

  query += " ORDER BY a.name";

  const stmt = db.prepare(query);
  const assets = stmt.all(...params);

  return assets.map((asset: any) => {
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

export function getAsset(assetId: string): any | null {
  const db = getDatabase();
  const stmt = db.prepare("SELECT * FROM assets WHERE asset_id = ? AND is_active = 1");
  const asset = stmt.get(assetId);

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
export function getRecentAssets(userId?: number | string, limit: number = 4): any[] {
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
