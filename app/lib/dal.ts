import { getDatabase } from './database';
import type { Trust } from '../types/trusts';
import type { FamilyMember, LegalRole, HealthcareDirective, Beneficiary, Professional, EmergencyContact } from '../types/people';
import type { AnyEnhancedAsset, OwnershipInfo } from '../types/assets';
import { AssetCategory } from '../types/enums';
import {
  transformDatabaseAsset,
  transformDatabaseTrust,
  transformDatabaseFamilyMember,
  transformDatabaseLegalRole,
  transformDatabaseHealthcareDirective,
  transformDatabaseBeneficiary,
  transformDatabaseProfessional,
  transformDatabaseEmergencyContact,
  transformDashboardStats
} from './transformers';

// =============================================
// DATABASE RESPONSE INTERFACES
// =============================================

export interface DatabaseUser {
  id: number;
  external_id: string | null;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  email: string;
  phone_number: string | null;
  date_of_birth: string | null;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface DatabaseTrust {
  id: number;
  trust_id: string;
  name: string;
  trust_type_id: number;
  trust_type_code?: string;
  trust_type_name?: string;
  tax_id: string | null;
  date_created: string;
  grantor: string;
  purpose: string | null;
  is_active: number;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface DatabaseTrustTrustee {
  id: number;
  trust_id: number;
  trustee_name: string;
  trustee_type_id: number;
  trustee_type_code?: string;
  trustee_type_name?: string;
  powers: string | null;
  start_date: string | null;
  end_date: string | null;
  order_of_succession: number | null;
  is_active: number;
}

export interface DatabaseTrustBeneficiary {
  id: number;
  trust_id: number;
  beneficiary_name: string;
  beneficiary_type_id: number;
  beneficiary_type_code?: string;
  relationship_type_id: number;
  relationship_type_code?: string;
  percentage: number | null;
  conditions: string | null;
  is_active: number;
}

export interface DatabaseAsset {
  id: number;
  asset_id: string;
  user_id: number;
  name: string;
  category: string;
  value: number;
  ownership_type: string;
  ownership_details: string | null;
  asset_details: string | null;
  notes: string | null;
  is_active: number;
  last_updated: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseFamilyMember {
  id: number;
  family_member_id: string;
  user_id: number;
  name: string;
  relationship_type_id: number;
  relationship_code: string;
  date_of_birth: string | null;
  is_minor: number;
  is_dependent: number;
  primary_phone: string | null;
  secondary_phone: string | null;
  email: string | null;
  preferred_contact: string | null;
  street1: string | null;
  street2: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  country: string | null;
  notes: string | null;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface DatabaseLegalRole {
  id: number;
  legal_role_id: string;
  user_id: number;
  role_type_id: number;
  role_type_code: string;
  person_id: string | null;
  person_name: string;
  is_primary: number;
  order_of_precedence: number | null;
  specific_powers: string | null;
  compensation_type: string | null;
  compensation_amount: number | null;
  compensation_details: string | null;
  start_date: string | null;
  end_date: string | null;
  end_conditions: string | null;
  notes: string | null;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface DatabaseHealthcareDirective {
  id: number;
  directive_id: string;
  user_id: number;
  directive_type_id: number;
  directive_type_code: string;
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
  created_at: string;
  updated_at: string;
}

export interface DatabaseBeneficiary {
  id: number;
  beneficiary_id: string;
  user_id: number;
  name: string;
  relationship_type_id: number;
  relationship_code: string;
  percentage: number | null;
  is_primary: number;
  is_contingent: number;
  contingent_to: string | null;
  per_stirpes: number;
  primary_phone: string | null;
  email: string | null;
  preferred_contact: string | null;
  notes: string | null;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface DatabaseProfessional {
  id: number;
  professional_id: string;
  user_id: number;
  name: string;
  professional_type_id: number;
  professional_type_code: string;
  firm: string | null;
  title: string | null;
  specializations: string | null;
  primary_phone: string | null;
  secondary_phone: string | null;
  email: string | null;
  preferred_contact: string | null;
  street1: string | null;
  street2: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  country: string | null;
  credentials: string | null;
  years_experience: number | null;
  is_preferred_provider: number;
  notes: string | null;
  is_active: number;
  created_at: string;
  updated_at: string;
}

export interface DatabaseEmergencyContact {
  id: number;
  contact_id: string;
  user_id: number;
  name: string;
  relationship_type_id: number;
  relationship_code: string;
  contact_type: string;
  primary_phone: string;
  secondary_phone: string | null;
  email: string | null;
  preferred_contact: string | null;
  priority: number;
  availability: string | null;
  medical_authority: number;
  can_make_decisions: number;
  languages: string | null;
  notes: string | null;
  is_active: number;
  created_at: string;
  updated_at: string;
}

// =============================================
// UTILITY FUNCTIONS
// =============================================

function parseJsonField<T>(jsonString: string | null): T | null {
  if (!jsonString) return null;
  try {
    return JSON.parse(jsonString);
  } catch {
    return null;
  }
}

// =============================================
// USER OPERATIONS
// =============================================

export function getUserProfile(userId: string = 'user-nick-001'): DatabaseUser | null {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT * FROM users 
    WHERE external_id = ? AND is_active = 1
  `);
  
  return stmt.get(userId) as DatabaseUser | null;
}

export function getAllUsers(): DatabaseUser[] {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT * FROM users 
    WHERE is_active = 1
    ORDER BY first_name, last_name
  `);
  
  return stmt.all() as DatabaseUser[];
}

// =============================================
// TRUST OPERATIONS
// =============================================

export function getTrusts(userId?: string): Trust[] {
  const db = getDatabase();
  
  let query = `
    SELECT 
      t.*,
      tt.code as trust_type_code,
      tt.name as trust_type_name
    FROM trusts t
    INNER JOIN trust_types tt ON t.trust_type_id = tt.id
    WHERE t.is_active = 1
  `;
  
  const params: string[] = [];
  if (userId) {
    query += ` AND t.created_by = (SELECT id FROM users WHERE external_id = ?)`;
    params.push(userId);
  }
  
  query += ` ORDER BY t.name`;
  
  const stmt = db.prepare(query);
  const dbTrusts = stmt.all(params) as DatabaseTrust[];
  
  return dbTrusts.map(dbTrust => {
    const trustees = getTrustTrustees(dbTrust.id);
    const beneficiaries = getTrustBeneficiaries(dbTrust.id);
    return transformDatabaseTrust(dbTrust, trustees, beneficiaries);
  });
}

export function getTrust(trustId: string): Trust | null {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT 
      t.*,
      tt.code as trust_type_code,
      tt.name as trust_type_name
    FROM trusts t
    INNER JOIN trust_types tt ON t.trust_type_id = tt.id
    WHERE t.trust_id = ? AND t.is_active = 1
  `);
  
  const dbTrust = stmt.get(trustId) as DatabaseTrust | null;
  if (!dbTrust) return null;
  
  const trustees = getTrustTrustees(dbTrust.id);
  const beneficiaries = getTrustBeneficiaries(dbTrust.id);
  return transformDatabaseTrust(dbTrust, trustees, beneficiaries);
}

function getTrustTrustees(trustDbId: number): DatabaseTrustTrustee[] {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT 
      tt.*,
      ttype.code as trustee_type_code,
      ttype.name as trustee_type_name
    FROM trust_trustees tt
    INNER JOIN trustee_types ttype ON tt.trustee_type_id = ttype.id
    WHERE tt.trust_id = ? AND tt.is_active = 1
    ORDER BY tt.order_of_succession, tt.id
  `);
  
  const dbTrustees = stmt.all(trustDbId) as DatabaseTrustTrustee[];
  
  return dbTrustees;
}

function getTrustBeneficiaries(trustDbId: number): DatabaseTrustBeneficiary[] {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT 
      tb.*,
      bt.code as beneficiary_type_code,
      rt.code as relationship_type_code
    FROM trust_beneficiaries tb
    INNER JOIN beneficiary_types bt ON tb.beneficiary_type_id = bt.id
    INNER JOIN relationship_types rt ON tb.relationship_type_id = rt.id
    WHERE tb.trust_id = ? AND tb.is_active = 1
    ORDER BY tb.id
  `);
  
  const dbBeneficiaries = stmt.all(trustDbId) as DatabaseTrustBeneficiary[];
  
  return dbBeneficiaries;
}

// =============================================
// FAMILY MEMBER OPERATIONS
// =============================================

export function getFamilyMembers(userId: string = 'user-nick-001'): FamilyMember[] {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT 
      fm.*,
      rt.code as relationship_code
    FROM family_members fm
    INNER JOIN relationship_types rt ON fm.relationship_type_id = rt.id
    WHERE fm.user_id = (SELECT id FROM users WHERE external_id = ?)
      AND fm.is_active = 1
    ORDER BY fm.name
  `);
  
  const dbMembers = stmt.all(userId) as DatabaseFamilyMember[];
  
  return dbMembers.map(transformDatabaseFamilyMember);
}

// =============================================
// LEGAL ROLE OPERATIONS
// =============================================

export function getLegalRoles(userId: string = 'user-nick-001'): LegalRole[] {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT 
      lr.*,
      lrt.code as role_type_code
    FROM legal_roles lr
    INNER JOIN legal_role_types lrt ON lr.role_type_id = lrt.id
    WHERE lr.user_id = (SELECT id FROM users WHERE external_id = ?)
      AND lr.is_active = 1
    ORDER BY lr.role_type_id, lr.order_of_precedence
  `);
  
  const dbRoles = stmt.all(userId) as DatabaseLegalRole[];
  
  return dbRoles.map(transformDatabaseLegalRole);
}

// =============================================
// HEALTHCARE DIRECTIVE OPERATIONS
// =============================================

export function getHealthcareDirectives(userId: string = 'user-nick-001'): HealthcareDirective[] {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT 
      hd.*,
      hdt.code as directive_type_code
    FROM healthcare_directives hd
    INNER JOIN healthcare_directive_types hdt ON hd.directive_type_id = hdt.id
    WHERE hd.user_id = (SELECT id FROM users WHERE external_id = ?)
      AND hd.is_active = 1
    ORDER BY hd.directive_type_id, hd.is_primary DESC
  `);
  
  const dbDirectives = stmt.all(userId) as DatabaseHealthcareDirective[];
  
  return dbDirectives.map(transformDatabaseHealthcareDirective);
}

// =============================================
// BENEFICIARY OPERATIONS
// =============================================

export function getBeneficiaries(userId: string = 'user-nick-001'): Beneficiary[] {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT 
      b.*,
      rt.code as relationship_code
    FROM beneficiaries b
    INNER JOIN relationship_types rt ON b.relationship_type_id = rt.id
    WHERE b.user_id = (SELECT id FROM users WHERE external_id = ?)
      AND b.is_active = 1
    ORDER BY b.is_primary DESC, b.name
  `);
  
  const dbBeneficiaries = stmt.all(userId) as DatabaseBeneficiary[];
  
  return dbBeneficiaries.map(transformDatabaseBeneficiary);
}

// =============================================
// PROFESSIONAL OPERATIONS
// =============================================

export function getProfessionals(userId: string = 'user-nick-001'): Professional[] {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT 
      p.*,
      pt.code as professional_type_code
    FROM professionals p
    INNER JOIN professional_types pt ON p.professional_type_id = pt.id
    WHERE p.user_id = (SELECT id FROM users WHERE external_id = ?)
      AND p.is_active = 1
    ORDER BY p.is_preferred_provider DESC, p.name
  `);
  
  const dbProfessionals = stmt.all(userId) as DatabaseProfessional[];
  
  return dbProfessionals.map(transformDatabaseProfessional);
}

// =============================================
// EMERGENCY CONTACT OPERATIONS
// =============================================

export function getEmergencyContacts(userId: string = 'user-nick-001'): EmergencyContact[] {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT 
      ec.*,
      rt.code as relationship_code
    FROM emergency_contacts ec
    INNER JOIN relationship_types rt ON ec.relationship_type_id = rt.id
    WHERE ec.user_id = (SELECT id FROM users WHERE external_id = ?)
      AND ec.is_active = 1
    ORDER BY ec.priority, ec.name
  `);
  
  const dbContacts = stmt.all(userId) as DatabaseEmergencyContact[];
  
  return dbContacts.map(transformDatabaseEmergencyContact);
}

// =============================================
// ASSET OPERATIONS
// =============================================

export function getRecentAssets(userId: string = 'user-nick-001', limit: number = 4): AnyEnhancedAsset[] {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT * FROM assets
    WHERE user_id = (SELECT id FROM users WHERE external_id = ?)
      AND is_active = 1
    ORDER BY updated_at DESC, created_at DESC
    LIMIT ?
  `);
  
  const dbAssets = stmt.all(userId, limit) as DatabaseAsset[];
  
  return dbAssets.map(transformDatabaseAsset);
}

export function getAssets(userId: string = 'user-nick-001'): AnyEnhancedAsset[] {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT * FROM assets
    WHERE user_id = (SELECT id FROM users WHERE external_id = ?)
      AND is_active = 1
    ORDER BY category, name
  `);
  
  const dbAssets = stmt.all(userId) as DatabaseAsset[];
  
  return dbAssets.map(transformDatabaseAsset);
}

export function getAsset(assetId: string): AnyEnhancedAsset | null {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT * FROM assets
    WHERE asset_id = ? AND is_active = 1
  `);
  
  const dbAsset = stmt.get(assetId) as DatabaseAsset | null;
  
  return dbAsset ? transformDatabaseAsset(dbAsset) : null;
}

export function getAssetsByTrust(trustId: string): AnyEnhancedAsset[] {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT * FROM assets
    WHERE ownership_type = 'TRUST' 
      AND json_extract(ownership_details, '$.trustId') = ?
      AND is_active = 1
    ORDER BY category, name
  `);
  
  const dbAssets = stmt.all(trustId) as DatabaseAsset[];
  
  return dbAssets.map(transformDatabaseAsset);
}

// =============================================
// DASHBOARD STATISTICS
// =============================================

export function getDashboardStats(userId: string = 'user-nick-001') {
  const db = getDatabase();
  
  // Get total asset value
  const assetStmt = db.prepare(`
    SELECT 
      SUM(value) as total_value,
      COUNT(*) as total_count
    FROM assets
    WHERE user_id = (SELECT id FROM users WHERE external_id = ?)
      AND is_active = 1
  `);
  const assetStats = assetStmt.get(userId) as { total_value: number | null; total_count: number };
  
  // Get trust count
  const trustStmt = db.prepare(`
    SELECT COUNT(*) as trust_count
    FROM trusts
    WHERE created_by = (SELECT id FROM users WHERE external_id = ?)
      AND is_active = 1
  `);
  const trustStats = trustStmt.get(userId) as { trust_count: number };
  
  // Get asset breakdown by category
  const categoryStmt = db.prepare(`
    SELECT 
      category,
      SUM(value) as category_value,
      COUNT(*) as category_count
    FROM assets
    WHERE user_id = (SELECT id FROM users WHERE external_id = ?)
      AND is_active = 1
    GROUP BY category
    ORDER BY category_value DESC
  `);
  const categoryStats = categoryStmt.all(userId) as Array<{
    category: string;
    category_value: number;
    category_count: number;
  }>;
  
  // Calculate category-specific totals
  const realEstateValue = categoryStats.find(c => c.category === 'REAL_ESTATE')?.category_value || 0;
  const investmentValue = categoryStats.find(c => c.category === 'FINANCIAL_ACCOUNT')?.category_value || 0;
  const businessValue = categoryStats.find(c => c.category === 'BUSINESS_INTEREST')?.category_value || 0;
  const insuranceValue = categoryStats.find(c => c.category === 'INSURANCE_POLICY')?.category_value || 0;
  
  return transformDashboardStats({
    total_net_worth: assetStats.total_value || 0,
    real_estate_value: realEstateValue,
    investment_value: investmentValue,
    business_value: businessValue,
    insurance_value: insuranceValue,
    total_assets: assetStats.total_count || 0,
    active_trusts: trustStats.trust_count || 0,
    assets_by_category: categoryStats
  });
}

// =============================================
// VALIDATION HELPERS
// =============================================

export function validateTrustExists(trustId: string): boolean {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT 1 FROM trusts 
    WHERE trust_id = ? AND is_active = 1
  `);
  
  return Boolean(stmt.get(trustId));
}

export function validateUserExists(userId: string): boolean {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT 1 FROM users 
    WHERE external_id = ? AND is_active = 1
  `);
  
  return Boolean(stmt.get(userId));
}

// =============================================
// SEARCH OPERATIONS
// =============================================

export interface SearchResult {
  id: string;
  type: 'asset' | 'trust' | 'family' | 'professional';
  title: string;
  subtitle?: string;
  category?: string;
  value?: number;
  matchedField: string;
  matchScore: number;
}

export interface SearchOptions {
  query: string;
  types?: Array<'asset' | 'trust' | 'family' | 'professional'>;
  limit?: number;
  userId?: string;
}

/**
 * Performs a fuzzy search across multiple entity types
 * Uses SQLite's LIKE operator for simple fuzzy matching
 */
export function searchAll(options: SearchOptions): SearchResult[] {
  const db = getDatabase();
  const { query, types = ['asset', 'trust', 'family', 'professional'], limit = 20, userId = 'user-nick-001' } = options;
  
  if (!query || query.trim().length === 0) {
    return [];
  }
  
  const searchTerm = `%${query.toLowerCase()}%`;
  const results: SearchResult[] = [];
  
  // Get the user's database ID
  const userStmt = db.prepare('SELECT id FROM users WHERE external_id = ?');
  const userRecord = userStmt.get(userId) as { id: number } | null;
  if (!userRecord) return [];
  const userDbId = userRecord.id;
  
  // Search assets
  if (types.includes('asset')) {
    const assetStmt = db.prepare(`
      SELECT 
        asset_id as id,
        name,
        category,
        value,
        ownership_type,
        notes,
        CASE
          WHEN LOWER(name) LIKE ? THEN 100
          WHEN LOWER(notes) LIKE ? THEN 50
          WHEN LOWER(category) LIKE ? THEN 30
          ELSE 10
        END as match_score,
        CASE
          WHEN LOWER(name) LIKE ? THEN 'name'
          WHEN LOWER(notes) LIKE ? THEN 'notes'
          WHEN LOWER(category) LIKE ? THEN 'category'
          ELSE 'other'
        END as matched_field
      FROM assets
      WHERE user_id = ?
        AND is_active = 1
        AND (
          LOWER(name) LIKE ?
          OR LOWER(notes) LIKE ?
          OR LOWER(category) LIKE ?
          OR LOWER(ownership_type) LIKE ?
        )
      ORDER BY match_score DESC
      LIMIT ?
    `);
    
    const assetResults = assetStmt.all(
      searchTerm, searchTerm, searchTerm, // for match_score
      searchTerm, searchTerm, searchTerm, // for matched_field
      userDbId,
      searchTerm, searchTerm, searchTerm, searchTerm, // for WHERE clause
      limit
    ) as Array<{
      id: string;
      name: string;
      category: string;
      value: number;
      ownership_type: string;
      notes: string | null;
      match_score: number;
      matched_field: string;
    }>;
    
    results.push(...assetResults.map(asset => ({
      id: asset.id,
      type: 'asset' as const,
      title: asset.name,
      subtitle: `${asset.category} - ${asset.ownership_type}`,
      category: asset.category,
      value: asset.value,
      matchedField: asset.matched_field,
      matchScore: asset.match_score
    })));
  }
  
  // Search trusts
  if (types.includes('trust')) {
    const trustStmt = db.prepare(`
      SELECT 
        t.trust_id as id,
        t.name,
        t.grantor,
        t.purpose,
        tt.name as trust_type,
        CASE
          WHEN LOWER(t.name) LIKE ? THEN 100
          WHEN LOWER(t.grantor) LIKE ? THEN 70
          WHEN LOWER(t.purpose) LIKE ? THEN 50
          ELSE 10
        END as match_score,
        CASE
          WHEN LOWER(t.name) LIKE ? THEN 'name'
          WHEN LOWER(t.grantor) LIKE ? THEN 'grantor'
          WHEN LOWER(t.purpose) LIKE ? THEN 'purpose'
          ELSE 'other'
        END as matched_field
      FROM trusts t
      INNER JOIN trust_types tt ON t.trust_type_id = tt.id
      WHERE t.created_by = ?
        AND t.is_active = 1
        AND (
          LOWER(t.name) LIKE ?
          OR LOWER(t.grantor) LIKE ?
          OR LOWER(t.purpose) LIKE ?
          OR LOWER(tt.name) LIKE ?
        )
      ORDER BY match_score DESC
      LIMIT ?
    `);
    
    const trustResults = trustStmt.all(
      searchTerm, searchTerm, searchTerm, // for match_score
      searchTerm, searchTerm, searchTerm, // for matched_field
      userDbId,
      searchTerm, searchTerm, searchTerm, searchTerm, // for WHERE clause
      limit
    ) as Array<{
      id: string;
      name: string;
      grantor: string;
      purpose: string | null;
      trust_type: string;
      match_score: number;
      matched_field: string;
    }>;
    
    results.push(...trustResults.map(trust => ({
      id: trust.id,
      type: 'trust' as const,
      title: trust.name,
      subtitle: `${trust.trust_type} - Grantor: ${trust.grantor}`,
      matchedField: trust.matched_field,
      matchScore: trust.match_score
    })));
  }
  
  // Search family members
  if (types.includes('family')) {
    const familyStmt = db.prepare(`
      SELECT 
        fm.family_member_id as id,
        fm.name,
        fm.email,
        fm.primary_phone,
        fm.notes,
        rt.name as relationship,
        CASE
          WHEN LOWER(fm.name) LIKE ? THEN 100
          WHEN LOWER(fm.email) LIKE ? THEN 70
          WHEN LOWER(fm.notes) LIKE ? THEN 50
          ELSE 10
        END as match_score,
        CASE
          WHEN LOWER(fm.name) LIKE ? THEN 'name'
          WHEN LOWER(fm.email) LIKE ? THEN 'email'
          WHEN LOWER(fm.notes) LIKE ? THEN 'notes'
          ELSE 'other'
        END as matched_field
      FROM family_members fm
      INNER JOIN relationship_types rt ON fm.relationship_type_id = rt.id
      WHERE fm.user_id = ?
        AND fm.is_active = 1
        AND (
          LOWER(fm.name) LIKE ?
          OR LOWER(fm.email) LIKE ?
          OR LOWER(fm.primary_phone) LIKE ?
          OR LOWER(fm.notes) LIKE ?
        )
      ORDER BY match_score DESC
      LIMIT ?
    `);
    
    const familyResults = familyStmt.all(
      searchTerm, searchTerm, searchTerm, // for match_score
      searchTerm, searchTerm, searchTerm, // for matched_field
      userDbId,
      searchTerm, searchTerm, searchTerm, searchTerm, // for WHERE clause
      limit
    ) as Array<{
      id: string;
      name: string;
      email: string | null;
      primary_phone: string | null;
      notes: string | null;
      relationship: string;
      match_score: number;
      matched_field: string;
    }>;
    
    results.push(...familyResults.map(member => ({
      id: member.id,
      type: 'family' as const,
      title: member.name,
      subtitle: member.relationship,
      matchedField: member.matched_field,
      matchScore: member.match_score
    })));
  }
  
  // Search professionals
  if (types.includes('professional')) {
    const professionalStmt = db.prepare(`
      SELECT 
        p.professional_id as id,
        p.name,
        p.firm,
        p.email,
        p.notes,
        pt.name as professional_type,
        CASE
          WHEN LOWER(p.name) LIKE ? THEN 100
          WHEN LOWER(p.firm) LIKE ? THEN 70
          WHEN LOWER(p.email) LIKE ? THEN 60
          WHEN LOWER(p.notes) LIKE ? THEN 40
          ELSE 10
        END as match_score,
        CASE
          WHEN LOWER(p.name) LIKE ? THEN 'name'
          WHEN LOWER(p.firm) LIKE ? THEN 'firm'
          WHEN LOWER(p.email) LIKE ? THEN 'email'
          WHEN LOWER(p.notes) LIKE ? THEN 'notes'
          ELSE 'other'
        END as matched_field
      FROM professionals p
      INNER JOIN professional_types pt ON p.professional_type_id = pt.id
      WHERE p.user_id = ?
        AND p.is_active = 1
        AND (
          LOWER(p.name) LIKE ?
          OR LOWER(p.firm) LIKE ?
          OR LOWER(p.email) LIKE ?
          OR LOWER(p.notes) LIKE ?
          OR LOWER(pt.name) LIKE ?
        )
      ORDER BY match_score DESC
      LIMIT ?
    `);
    
    const professionalResults = professionalStmt.all(
      searchTerm, searchTerm, searchTerm, searchTerm, // for match_score
      searchTerm, searchTerm, searchTerm, searchTerm, // for matched_field
      userDbId,
      searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, // for WHERE clause
      limit
    ) as Array<{
      id: string;
      name: string;
      firm: string | null;
      email: string | null;
      notes: string | null;
      professional_type: string;
      match_score: number;
      matched_field: string;
    }>;
    
    results.push(...professionalResults.map(prof => ({
      id: prof.id,
      type: 'professional' as const,
      title: prof.name,
      subtitle: prof.firm ? `${prof.professional_type} at ${prof.firm}` : prof.professional_type,
      matchedField: prof.matched_field,
      matchScore: prof.match_score
    })));
  }
  
  // Sort all results by match score
  results.sort((a, b) => b.matchScore - a.matchScore);
  
  // Limit total results
  return results.slice(0, limit);
}

/**
 * Search for assets by name, category, or notes
 */
export function searchAssets(query: string, userId: string = 'user-nick-001', limit: number = 10): AnyEnhancedAsset[] {
  const db = getDatabase();
  
  if (!query || query.trim().length === 0) {
    return [];
  }
  
  const searchTerm = `%${query.toLowerCase()}%`;
  
  const stmt = db.prepare(`
    SELECT * FROM assets
    WHERE user_id = (SELECT id FROM users WHERE external_id = ?)
      AND is_active = 1
      AND (
        LOWER(name) LIKE ?
        OR LOWER(notes) LIKE ?
        OR LOWER(category) LIKE ?
        OR LOWER(ownership_type) LIKE ?
      )
    ORDER BY 
      CASE 
        WHEN LOWER(name) LIKE ? THEN 1
        WHEN LOWER(category) LIKE ? THEN 2
        WHEN LOWER(ownership_type) LIKE ? THEN 3
        ELSE 4
      END,
      value DESC
    LIMIT ?
  `);
  
  const dbAssets = stmt.all(
    userId,
    searchTerm, searchTerm, searchTerm, searchTerm,
    searchTerm, searchTerm, searchTerm,
    limit
  ) as DatabaseAsset[];
  
  return dbAssets.map(dbAsset => {
    const ownershipDetails = parseJsonField<Record<string, unknown>>(dbAsset.ownership_details) || {};
    const assetDetails = parseJsonField<Record<string, unknown>>(dbAsset.asset_details) || {};
    
    const baseAsset = {
      id: dbAsset.asset_id,
      name: dbAsset.name,
      category: dbAsset.category as AssetCategory,
      value: dbAsset.value,
      ownership: {
        type: dbAsset.ownership_type as OwnershipInfo['type'],
        ...ownershipDetails
      },
      notes: dbAsset.notes || undefined
    };

    return {
      ...baseAsset,
      ...assetDetails
    } as AnyEnhancedAsset;
  });
}

/**
 * Search for trusts by name, grantor, or purpose
 */
export function searchTrusts(query: string, userId?: string, limit: number = 10): Trust[] {
  const db = getDatabase();
  
  if (!query || query.trim().length === 0) {
    return [];
  }
  
  const searchTerm = `%${query.toLowerCase()}%`;
  
  let baseQuery = `
    SELECT 
      t.*,
      tt.code as trust_type_code,
      tt.name as trust_type_name
    FROM trusts t
    INNER JOIN trust_types tt ON t.trust_type_id = tt.id
    WHERE t.is_active = 1
      AND (
        LOWER(t.name) LIKE ?
        OR LOWER(t.grantor) LIKE ?
        OR LOWER(t.purpose) LIKE ?
        OR LOWER(tt.name) LIKE ?
      )
  `;
  
  const params: (string | number)[] = [searchTerm, searchTerm, searchTerm, searchTerm];
  
  if (userId) {
    baseQuery += ` AND t.created_by = (SELECT id FROM users WHERE external_id = ?)`;
    params.push(userId);
  }
  
  baseQuery += ` ORDER BY t.name LIMIT ?`;
  params.push(limit);
  
  const stmt = db.prepare(baseQuery);
  const dbTrusts = stmt.all(params) as DatabaseTrust[];
  
  return dbTrusts.map(dbTrust => {
    const trustees = getTrustTrustees(dbTrust.id);
    const beneficiaries = getTrustBeneficiaries(dbTrust.id);
    return transformDatabaseTrust(dbTrust, trustees, beneficiaries);
  });
}

/**
 * Search for family members by name, email, or phone
 */
export function searchFamilyMembers(query: string, userId: string = 'user-nick-001', limit: number = 10): FamilyMember[] {
  const db = getDatabase();
  
  if (!query || query.trim().length === 0) {
    return [];
  }
  
  const searchTerm = `%${query.toLowerCase()}%`;
  
  const stmt = db.prepare(`
    SELECT 
      fm.*,
      rt.code as relationship_code
    FROM family_members fm
    INNER JOIN relationship_types rt ON fm.relationship_type_id = rt.id
    WHERE fm.user_id = (SELECT id FROM users WHERE external_id = ?)
      AND fm.is_active = 1
      AND (
        LOWER(fm.name) LIKE ?
        OR LOWER(fm.email) LIKE ?
        OR LOWER(fm.primary_phone) LIKE ?
        OR LOWER(fm.secondary_phone) LIKE ?
        OR LOWER(fm.notes) LIKE ?
      )
    ORDER BY fm.name
    LIMIT ?
  `);
  
  const dbMembers = stmt.all(
    userId,
    searchTerm, searchTerm, searchTerm, searchTerm, searchTerm,
    limit
  ) as DatabaseFamilyMember[];
  
  return dbMembers.map(transformDatabaseFamilyMember);
}