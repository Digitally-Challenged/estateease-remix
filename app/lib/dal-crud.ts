import { getDatabase } from './database';
import type { Trust, FamilyMember, Professional } from '~/types';
import type { AnyEnhancedAsset } from '../types/assets';
import { OwnershipType } from '~/types/enums';
import {
  transformAssetToDatabase,
  transformTrustToDatabase
} from './transformers';

// Asset CRUD Operations

export function createAsset(asset: Partial<AnyEnhancedAsset> & { name: string; value: number; category: string }): string {
  const db = getDatabase();
  
  // Generate asset ID
  const assetId = `ASSET-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Transform asset data to database format
  const { category, ownership_type, ownership_details, asset_details } = transformAssetToDatabase(asset);
  
  // Insert asset
  const insertStmt = db.prepare(`
    INSERT INTO assets (
      asset_id, user_id, name, category, value,
      ownership_type, ownership_details,
      asset_details, notes, is_active
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
  `);
  
  insertStmt.run(
    assetId,
    1, // Default user ID - will need to get from users table
    asset.name,
    category,
    asset.value,
    ownership_type,
    ownership_details,
    asset_details,
    asset.notes || null
  );
  
  // Handle trust ownership
  if (asset.ownership && asset.ownership.type === OwnershipType.TRUST && asset.ownership.trustId) {
    const trustStmt = db.prepare('SELECT id FROM trusts WHERE trust_id = ?');
    const trust = trustStmt.get(asset.ownership.trustId) as { id: number } | undefined;
    
    if (trust) {
      const trustAssetStmt = db.prepare(`
        INSERT INTO trust_assets (trust_id, asset_id, ownership_percentage, is_active)
        VALUES (?, (SELECT id FROM assets WHERE asset_id = ?), ?, 1)
      `);
      trustAssetStmt.run(trust.id, assetId, asset.ownership.percentage || 100);
    }
  }
  
  return assetId;
}

export function updateAsset(assetId: string, updates: Partial<AnyEnhancedAsset>): void {
  const db = getDatabase();
  const params: (string | number | null)[] = [];
  const setClauses: string[] = [];
  
  if (updates.name !== undefined) {
    setClauses.push('name = ?');
    params.push(updates.name);
  }
  
  if (updates.value !== undefined) {
    setClauses.push('value = ?');
    params.push(updates.value);
  }
  
  if (updates.notes !== undefined) {
    setClauses.push('notes = ?');
    params.push(updates.notes);
  }
  
  // Use transformer for category and ownership data
  if (updates.category !== undefined || updates.ownership !== undefined) {
    const { category, ownership_type, ownership_details, asset_details } = transformAssetToDatabase(updates);
    
    if (updates.category !== undefined) {
      setClauses.push('category = ?');
      params.push(category);
    }
    
    if (updates.ownership !== undefined) {
      setClauses.push('ownership_type = ?');
      params.push(ownership_type);
      setClauses.push('ownership_details = ?');
      params.push(ownership_details);
    }
    
    // Update asset_details if category-specific fields changed
    if (Object.keys(updates).some(key => !['id', 'name', 'value', 'notes', 'category', 'ownership'].includes(key))) {
      setClauses.push('asset_details = ?');
      params.push(asset_details);
    }
  }
  
  if (setClauses.length === 0) return;
  
  setClauses.push('updated_at = ?');
  params.push(new Date().toISOString());
  
  params.push(assetId);
  
  const query = `UPDATE assets SET ${setClauses.join(', ')} WHERE asset_id = ?`;
  const stmt = db.prepare(query);
  stmt.run(...params);
}

export function deleteAsset(assetId: string): void {
  const db = getDatabase();
  
  // Soft delete
  const stmt = db.prepare(`
    UPDATE assets 
    SET is_active = 0, updated_at = ? 
    WHERE asset_id = ?
  `);
  
  stmt.run(new Date().toISOString(), assetId);
}

// Trust CRUD Operations

export function createTrust(trust: Omit<Trust, 'id' | 'trustees' | 'beneficiaries'>): string {
  const db = getDatabase();
  
  // Transform trust data to database format
  const { trust_type_code } = transformTrustToDatabase(trust);
  
  // Get trust type ID
  const typeStmt = db.prepare('SELECT id FROM trust_types WHERE code = ?');
  const trustType = typeStmt.get(trust_type_code) as { id: number } | undefined;
  if (!trustType) throw new Error(`Invalid trust type: ${trust.type}`);
  
  // Generate trust ID
  const trustId = `TRUST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Insert trust
  const insertStmt = db.prepare(`
    INSERT INTO trusts (
      trust_id, user_id, name, trust_type_id, tax_id,
      date_created, grantor, purpose, is_active
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
  `);
  
  insertStmt.run(
    trustId,
    1, // Default to user 1 for now
    trust.name,
    trustType.id,
    trust.taxId || null,
    trust.dateCreated || new Date().toISOString(),
    trust.grantor,
    trust.purpose || null
  );
  
  return trustId;
}

export function updateTrust(trustId: string, updates: Partial<Trust>): void {
  const db = getDatabase();
  const params: (string | number | null)[] = [];
  const setClauses: string[] = [];
  
  if (updates.name !== undefined) {
    setClauses.push('name = ?');
    params.push(updates.name);
  }
  
  if (updates.taxId !== undefined) {
    setClauses.push('tax_id = ?');
    params.push(updates.taxId);
  }
  
  if (updates.purpose !== undefined) {
    setClauses.push('purpose = ?');
    params.push(updates.purpose);
  }
  
  if (updates.type !== undefined) {
    const typeStmt = db.prepare('SELECT id FROM trust_types WHERE code = ?');
    const trustType = typeStmt.get(updates.type.toUpperCase()) as { id: number } | undefined;
    if (!trustType) throw new Error(`Invalid trust type: ${updates.type}`);
    
    setClauses.push('trust_type_id = ?');
    params.push(trustType.id);
  }
  
  if (setClauses.length === 0) return;
  
  setClauses.push('updated_at = ?');
  params.push(new Date().toISOString());
  
  params.push(trustId);
  
  const query = `UPDATE trusts SET ${setClauses.join(', ')} WHERE trust_id = ?`;
  const stmt = db.prepare(query);
  stmt.run(...params);
}

export function deleteTrust(trustId: string): void {
  const db = getDatabase();
  
  // Soft delete
  const stmt = db.prepare(`
    UPDATE trusts 
    SET is_active = 0, updated_at = ? 
    WHERE trust_id = ?
  `);
  
  stmt.run(new Date().toISOString(), trustId);
}

// Trust Trustee Management

export function addTrustee(trustId: string, personId: string, trusteeTypeCode: string, orderOfSuccession?: number): void {
  const db = getDatabase();
  
  // Get trust DB ID
  const trustStmt = db.prepare('SELECT id FROM trusts WHERE trust_id = ?');
  const trust = trustStmt.get(trustId) as { id: number } | undefined;
  if (!trust) throw new Error(`Trust not found: ${trustId}`);
  
  // Get person DB ID
  const personStmt = db.prepare('SELECT id FROM family_members WHERE family_member_id = ?');
  const person = personStmt.get(personId) as { id: number } | undefined;
  if (!person) throw new Error(`Person not found: ${personId}`);
  
  // Get trustee type ID
  const typeStmt = db.prepare('SELECT id FROM trustee_types WHERE code = ?');
  const trusteeType = typeStmt.get(trusteeTypeCode) as { id: number } | undefined;
  if (!trusteeType) throw new Error(`Invalid trustee type: ${trusteeTypeCode}`);
  
  // Insert trustee
  const insertStmt = db.prepare(`
    INSERT INTO trust_trustees (
      trust_id, person_id, trustee_type_id, order_of_succession,
      powers, start_date, is_active
    ) VALUES (?, ?, ?, ?, ?, ?, 1)
  `);
  
  insertStmt.run(
    trust.id,
    person.id,
    trusteeType.id,
    orderOfSuccession || null,
    JSON.stringify(['Full discretionary powers']), // Default powers
    new Date().toISOString()
  );
}

export function removeTrustee(trustId: string, personId: string): void {
  const db = getDatabase();
  
  // Get trust DB ID
  const trustStmt = db.prepare('SELECT id FROM trusts WHERE trust_id = ?');
  const trust = trustStmt.get(trustId) as { id: number } | undefined;
  if (!trust) throw new Error(`Trust not found: ${trustId}`);
  
  // Get person DB ID
  const personStmt = db.prepare('SELECT id FROM family_members WHERE family_member_id = ?');
  const person = personStmt.get(personId) as { id: number } | undefined;
  if (!person) throw new Error(`Person not found: ${personId}`);
  
  // Soft delete
  const stmt = db.prepare(`
    UPDATE trust_trustees 
    SET is_active = 0, end_date = ?, updated_at = ?
    WHERE trust_id = ? AND person_id = ?
  `);
  
  const now = new Date().toISOString();
  stmt.run(now, now, trust.id, person.id);
}

// Trust Beneficiary Management

export function addBeneficiary(
  trustId: string, 
  personId: string, 
  beneficiaryTypeCode: string, 
  percentage?: number,
  conditions?: string
): void {
  const db = getDatabase();
  
  // Get trust DB ID
  const trustStmt = db.prepare('SELECT id FROM trusts WHERE trust_id = ?');
  const trust = trustStmt.get(trustId) as { id: number } | undefined;
  if (!trust) throw new Error(`Trust not found: ${trustId}`);
  
  // Get person DB ID
  const personStmt = db.prepare('SELECT id FROM family_members WHERE family_member_id = ?');
  const person = personStmt.get(personId) as { id: number } | undefined;
  if (!person) throw new Error(`Person not found: ${personId}`);
  
  // Get beneficiary type ID
  const typeStmt = db.prepare('SELECT id FROM beneficiary_types WHERE code = ?');
  const beneficiaryType = typeStmt.get(beneficiaryTypeCode) as { id: number } | undefined;
  if (!beneficiaryType) throw new Error(`Invalid beneficiary type: ${beneficiaryTypeCode}`);
  
  // Insert beneficiary
  const insertStmt = db.prepare(`
    INSERT INTO trust_beneficiaries (
      trust_id, person_id, beneficiary_type_id, percentage,
      conditions, is_active
    ) VALUES (?, ?, ?, ?, ?, 1)
  `);
  
  insertStmt.run(
    trust.id,
    person.id,
    beneficiaryType.id,
    percentage || null,
    conditions || null
  );
}

export function removeBeneficiary(trustId: string, personId: string): void {
  const db = getDatabase();
  
  // Get trust DB ID
  const trustStmt = db.prepare('SELECT id FROM trusts WHERE trust_id = ?');
  const trust = trustStmt.get(trustId) as { id: number } | undefined;
  if (!trust) throw new Error(`Trust not found: ${trustId}`);
  
  // Get person DB ID
  const personStmt = db.prepare('SELECT id FROM family_members WHERE family_member_id = ?');
  const person = personStmt.get(personId) as { id: number } | undefined;
  if (!person) throw new Error(`Person not found: ${personId}`);
  
  // Soft delete
  const stmt = db.prepare(`
    UPDATE trust_beneficiaries 
    SET is_active = 0, updated_at = ?
    WHERE trust_id = ? AND person_id = ?
  `);
  
  stmt.run(new Date().toISOString(), trust.id, person.id);
}

// Family Member CRUD Operations

export function createFamilyMember(member: Omit<FamilyMember, 'id' | 'legalRoles' | 'healthcareRoles'>): string {
  const db = getDatabase();
  
  // Get relationship type ID
  const relStmt = db.prepare('SELECT id FROM relationship_types WHERE code = ?');
  const relType = relStmt.get(member.relationship.toUpperCase()) as { id: number } | undefined;
  if (!relType) throw new Error(`Invalid relationship type: ${member.relationship}`);
  
  // Generate family member ID
  const memberId = `FAMILY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Insert family member
  const insertStmt = db.prepare(`
    INSERT INTO family_members (
      family_member_id, user_id, first_name, last_name,
      relationship_type_id, date_of_birth, email, phone,
      address, city, state, zip, is_active
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
  `);
  
  insertStmt.run(
    memberId,
    member.userId || 1, // Default to user 1 for now
    member.firstName,
    member.lastName,
    relType.id,
    member.dateOfBirth || null,
    (member.contactInfo?.email || member.contact?.email) || null,
    (member.contactInfo?.primaryPhone || member.contact?.primaryPhone) || null,
    (member.contactInfo?.address?.street1 || member.contact?.address?.street1) || null,
    (member.contactInfo?.address?.city || member.contact?.address?.city) || null,
    (member.contactInfo?.address?.state || member.contact?.address?.state) || null,
    (member.contactInfo?.address?.zipCode || member.contact?.address?.zipCode) || null
  );
  
  return memberId;
}

export function updateFamilyMember(memberId: string, updates: Partial<FamilyMember>): void {
  const db = getDatabase();
  const params: (string | number | null)[] = [];
  const setClauses: string[] = [];
  
  if (updates.firstName !== undefined) {
    setClauses.push('first_name = ?');
    params.push(updates.firstName);
  }
  
  if (updates.lastName !== undefined) {
    setClauses.push('last_name = ?');
    params.push(updates.lastName);
  }
  
  if (updates.dateOfBirth !== undefined) {
    setClauses.push('date_of_birth = ?');
    params.push(updates.dateOfBirth);
  }
  
  const contactInfo = updates.contactInfo;
  if (contactInfo) {
    if (contactInfo.email !== undefined) {
      setClauses.push('email = ?');
      params.push(contactInfo.email);
    }
    
    if (contactInfo.primaryPhone !== undefined) {
      setClauses.push('phone = ?');
      params.push(contactInfo.primaryPhone);
    }
    
    if (contactInfo.address) {
      if (contactInfo.address.street1 !== undefined) {
        setClauses.push('address = ?');
        params.push(contactInfo.address.street1);
      }
      if (contactInfo.address.city !== undefined) {
        setClauses.push('city = ?');
        params.push(contactInfo.address.city);
      }
      if (contactInfo.address.state !== undefined) {
        setClauses.push('state = ?');
        params.push(contactInfo.address.state);
      }
      if (contactInfo.address.zipCode !== undefined) {
        setClauses.push('zip = ?');
        params.push(contactInfo.address.zipCode);
      }
    }
  }
  
  if (setClauses.length === 0) return;
  
  setClauses.push('updated_at = ?');
  params.push(new Date().toISOString());
  
  params.push(memberId);
  
  const query = `UPDATE family_members SET ${setClauses.join(', ')} WHERE family_member_id = ?`;
  const stmt = db.prepare(query);
  stmt.run(...params);
}

export function deleteFamilyMember(memberId: string): void {
  const db = getDatabase();
  
  // Soft delete
  const stmt = db.prepare(`
    UPDATE family_members 
    SET is_active = 0, updated_at = ? 
    WHERE family_member_id = ?
  `);
  
  stmt.run(new Date().toISOString(), memberId);
}

// Professional CRUD Operations

export function createProfessional(professional: Omit<Professional, 'id'>): string {
  const db = getDatabase();
  
  // Get professional type ID
  const typeStmt = db.prepare('SELECT id FROM professional_types WHERE code = ?');
  const profType = typeStmt.get(professional.type.toUpperCase()) as { id: number } | undefined;
  if (!profType) throw new Error(`Invalid professional type: ${professional.type}`);
  
  // Generate professional ID
  const professionalId = `PROF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Insert professional
  const insertStmt = db.prepare(`
    INSERT INTO professionals (
      professional_id, user_id, first_name, last_name,
      professional_type_id, firm_name, email, phone,
      address, city, state, zip, specializations,
      notes, is_active
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
  `);
  
  const [firstName, ...lastNameParts] = professional.name.split(' ');
  const lastName = lastNameParts.join(' ');
  
  insertStmt.run(
    professionalId,
    1, // Default to user 1 for now
    firstName,
    lastName,
    profType.id,
    professional.firm || null,
    professional.contactInfo.email || null,
    professional.contactInfo.primaryPhone || null,
    professional.contactInfo.address?.street1 || null,
    professional.contactInfo.address?.city || null,
    professional.contactInfo.address?.state || null,
    professional.contactInfo.address?.zipCode || null,
    professional.specializations ? JSON.stringify(professional.specializations) : null,
    professional.notes || null
  );
  
  return professionalId;
}

export function updateProfessional(professionalId: string, updates: Partial<Professional>): void {
  const db = getDatabase();
  const params: (string | number | null)[] = [];
  const setClauses: string[] = [];
  
  if (updates.name !== undefined) {
    const [firstName, ...lastNameParts] = updates.name.split(' ');
    const lastName = lastNameParts.join(' ');
    setClauses.push('first_name = ?', 'last_name = ?');
    params.push(firstName, lastName);
  }
  
  if (updates.firm !== undefined) {
    setClauses.push('firm_name = ?');
    params.push(updates.firm);
  }
  
  const contactInfo = updates.contactInfo;
  if (contactInfo) {
    if (contactInfo.email !== undefined) {
      setClauses.push('email = ?');
      params.push(contactInfo.email);
    }
    
    if (contactInfo.primaryPhone !== undefined) {
      setClauses.push('phone = ?');
      params.push(contactInfo.primaryPhone);
    }
    
    if (contactInfo.address) {
      if (contactInfo.address.street1 !== undefined) {
        setClauses.push('address = ?');
        params.push(contactInfo.address.street1);
      }
      if (contactInfo.address.city !== undefined) {
        setClauses.push('city = ?');
        params.push(contactInfo.address.city);
      }
      if (contactInfo.address.state !== undefined) {
        setClauses.push('state = ?');
        params.push(contactInfo.address.state);
      }
      if (contactInfo.address.zipCode !== undefined) {
        setClauses.push('zip = ?');
        params.push(contactInfo.address.zipCode);
      }
    }
  }
  
  if (updates.specializations !== undefined) {
    setClauses.push('specializations = ?');
    params.push(JSON.stringify(updates.specializations));
  }
  
  if (updates.notes !== undefined) {
    setClauses.push('notes = ?');
    params.push(updates.notes);
  }
  
  if (setClauses.length === 0) return;
  
  setClauses.push('updated_at = ?');
  params.push(new Date().toISOString());
  
  params.push(professionalId);
  
  const query = `UPDATE professionals SET ${setClauses.join(', ')} WHERE professional_id = ?`;
  const stmt = db.prepare(query);
  stmt.run(...params);
}

export function deleteProfessional(professionalId: string): void {
  const db = getDatabase();
  
  // Soft delete
  const stmt = db.prepare(`
    UPDATE professionals 
    SET is_active = 0, updated_at = ? 
    WHERE professional_id = ?
  `);
  
  stmt.run(new Date().toISOString(), professionalId);
}