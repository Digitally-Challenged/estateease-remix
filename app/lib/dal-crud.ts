import { getDatabase } from "./database";
import type { Trust, FamilyMember, Professional, BusinessInterest } from "~/types";
import type { AnyEnhancedAsset } from "../types/assets";
import { OwnershipType, AssetCategory } from "~/types/enums";
import { transformAssetToDatabase, transformTrustToDatabase } from "./transformers";
import { getUserId } from "./auth.server";

// Asset CRUD Operations

export function createAsset(
  asset: Partial<AnyEnhancedAsset> & { name: string; value: number; category: string },
  request: Request,
): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const db = getDatabase();
      const userId = await getUserId(request);

      // Generate asset ID
      const assetId = `ASSET-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Transform asset data to database format
      const { category, ownership_type, ownership_details, asset_details } =
        transformAssetToDatabase(asset);

      // Insert asset
      const insertStmt = db.prepare(`
    INSERT INTO assets (
      asset_id, user_id, name, category, value,
      ownership_type, ownership_details,
      asset_details, notes, is_active,
      institution_name, account_type, account_number, routing_number,
      incorporation_type, state_of_incorporation, ein
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?)
  `);

      // Extract financial account fields if applicable
      let institutionName = null;
      let accountType = null;
      let accountNumber = null;
      let routingNumber = null;

      if (category === "FINANCIAL_ACCOUNT" && asset.details) {
        institutionName =
          ((asset.details as Record<string, unknown>).institutionName as string) || null;
        accountType = ((asset.details as Record<string, unknown>).accountType as string) || null;
        accountNumber =
          ((asset.details as Record<string, unknown>).accountNumber as string) || null;
        routingNumber =
          ((asset.details as Record<string, unknown>).routingNumber as string) || null;
      }

      // Extract business entity fields if applicable
      let incorporationType = null;
      let stateOfIncorporation = null;
      let ein = null;

      if (category === "BUSINESS_INTEREST") {
        if (asset.details) {
          incorporationType =
            ((asset.details as Record<string, unknown>).incorporationType as string) || null;
          stateOfIncorporation =
            ((asset.details as Record<string, unknown>).stateOfIncorporation as string) || null;
          ein = ((asset.details as Record<string, unknown>).ein as string) || null;
        }
        // Also check if they're directly on the asset (for typed assets)
        const businessAsset = asset as Partial<BusinessInterest>;
        if (businessAsset.incorporationType) incorporationType = businessAsset.incorporationType;
        if (businessAsset.stateOfIncorporation)
          stateOfIncorporation = businessAsset.stateOfIncorporation;
        if (businessAsset.ein) ein = businessAsset.ein;
      }

      insertStmt.run(
        assetId,
        userId,
        asset.name,
        category,
        asset.value,
        ownership_type,
        ownership_details,
        asset_details,
        asset.notes || null,
        institutionName,
        accountType,
        accountNumber,
        routingNumber,
        incorporationType,
        stateOfIncorporation,
        ein,
      );

      // Handle trust ownership
      if (
        asset.ownership &&
        asset.ownership.type === OwnershipType.TRUST &&
        asset.ownership.trustId
      ) {
        const trustStmt = db.prepare("SELECT id FROM trusts WHERE trust_id = ?");
        const trust = trustStmt.get(asset.ownership.trustId) as { id: number } | undefined;

        if (trust) {
          const trustAssetStmt = db.prepare(`
        INSERT INTO trust_assets (trust_id, asset_id, ownership_percentage, is_active)
        VALUES (?, (SELECT id FROM assets WHERE asset_id = ?), ?, 1)
      `);
          trustAssetStmt.run(trust.id, assetId, asset.ownership.percentage || 100);
        }
      }

      resolve(assetId);
    } catch (error) {
      reject(error);
    }
  });
}

export function updateAsset(assetId: string, updates: Partial<AnyEnhancedAsset>): void {
  const db = getDatabase();
  const params: (string | number | null)[] = [];
  const setClauses: string[] = [];

  if (updates.name !== undefined) {
    setClauses.push("name = ?");
    params.push(updates.name);
  }

  if (updates.value !== undefined) {
    setClauses.push("value = ?");
    params.push(updates.value);
  }

  if (updates.notes !== undefined) {
    setClauses.push("notes = ?");
    params.push(updates.notes);
  }

  // Use transformer for category and ownership data
  if (updates.category !== undefined || updates.ownership !== undefined) {
    const { category, ownership_type, ownership_details, asset_details } =
      transformAssetToDatabase(updates);

    if (updates.category !== undefined) {
      setClauses.push("category = ?");
      params.push(category);
    }

    if (updates.ownership !== undefined) {
      setClauses.push("ownership_type = ?");
      params.push(ownership_type);
      setClauses.push("ownership_details = ?");
      params.push(ownership_details);
    }

    // Update asset_details if category-specific fields changed
    if (
      Object.keys(updates).some(
        (key) => !["id", "name", "value", "notes", "category", "ownership"].includes(key),
      )
    ) {
      setClauses.push("asset_details = ?");
      params.push(asset_details);
    }
  }

  // Handle financial account specific fields
  if (updates.details && typeof updates.details === "object") {
    const details = updates.details as Record<string, unknown>;

    if (details.institutionName !== undefined) {
      setClauses.push("institution_name = ?");
      params.push((details.institutionName as string) || null);
    }

    if (details.accountType !== undefined) {
      setClauses.push("account_type = ?");
      params.push((details.accountType as string) || null);
    }

    if (details.accountNumber !== undefined) {
      setClauses.push("account_number = ?");
      params.push((details.accountNumber as string) || null);
    }

    if (details.routingNumber !== undefined) {
      setClauses.push("routing_number = ?");
      params.push((details.routingNumber as string) || null);
    }

    // Handle business entity specific fields
    if (details.incorporationType !== undefined) {
      setClauses.push("incorporation_type = ?");
      params.push((details.incorporationType as string) || null);
    }

    if (details.stateOfIncorporation !== undefined) {
      setClauses.push("state_of_incorporation = ?");
      params.push((details.stateOfIncorporation as string) || null);
    }

    if (details.ein !== undefined) {
      setClauses.push("ein = ?");
      params.push((details.ein as string) || null);
    }
  }

  // Also check for business fields directly on the updates object (for typed assets)
  if (updates.category === AssetCategory.BUSINESS_INTEREST) {
    const businessUpdates = updates as Partial<BusinessInterest>;

    if (
      businessUpdates.incorporationType !== undefined &&
      !setClauses.includes("incorporation_type = ?")
    ) {
      setClauses.push("incorporation_type = ?");
      params.push(businessUpdates.incorporationType || null);
    }

    if (
      businessUpdates.stateOfIncorporation !== undefined &&
      !setClauses.includes("state_of_incorporation = ?")
    ) {
      setClauses.push("state_of_incorporation = ?");
      params.push(businessUpdates.stateOfIncorporation || null);
    }

    if (businessUpdates.ein !== undefined && !setClauses.includes("ein = ?")) {
      setClauses.push("ein = ?");
      params.push(businessUpdates.ein || null);
    }
  }

  if (setClauses.length === 0) return;

  setClauses.push("updated_at = ?");
  params.push(new Date().toISOString());

  params.push(assetId);

  const query = `UPDATE assets SET ${setClauses.join(", ")} WHERE asset_id = ?`;
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

export function createTrust(
  trust: Omit<Trust, "id" | "trustees" | "beneficiaries">,
  request: Request,
): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const db = getDatabase();
      const userId = await getUserId(request);

      // Transform trust data to database format
      const { trust_type_code } = transformTrustToDatabase(trust);

      // Get trust type ID
      const typeStmt = db.prepare("SELECT id FROM trust_types WHERE code = ?");
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
        userId,
        trust.name,
        trustType.id,
        trust.taxId || null,
        trust.dateCreated || new Date().toISOString(),
        trust.grantor,
        trust.purpose || null,
      );

      resolve(trustId);
    } catch (error) {
      reject(error);
    }
  });
}

export function updateTrust(trustId: string, updates: Partial<Trust>): void {
  const db = getDatabase();
  const params: (string | number | null)[] = [];
  const setClauses: string[] = [];

  if (updates.name !== undefined) {
    setClauses.push("name = ?");
    params.push(updates.name);
  }

  if (updates.taxId !== undefined) {
    setClauses.push("tax_id = ?");
    params.push(updates.taxId);
  }

  if (updates.purpose !== undefined) {
    setClauses.push("purpose = ?");
    params.push(updates.purpose);
  }

  if (updates.type !== undefined) {
    const typeStmt = db.prepare("SELECT id FROM trust_types WHERE code = ?");
    const trustType = typeStmt.get(updates.type.toUpperCase()) as { id: number } | undefined;
    if (!trustType) throw new Error(`Invalid trust type: ${updates.type}`);

    setClauses.push("trust_type_id = ?");
    params.push(trustType.id);
  }

  if (setClauses.length === 0) return;

  setClauses.push("updated_at = ?");
  params.push(new Date().toISOString());

  params.push(trustId);

  const query = `UPDATE trusts SET ${setClauses.join(", ")} WHERE trust_id = ?`;
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

export function addTrustee(
  trustId: string,
  personId: string,
  trusteeTypeCode: string,
  orderOfSuccession?: number,
): void {
  const db = getDatabase();

  // Get trust DB ID
  const trustStmt = db.prepare("SELECT id FROM trusts WHERE trust_id = ?");
  const trust = trustStmt.get(trustId) as { id: number } | undefined;
  if (!trust) throw new Error(`Trust not found: ${trustId}`);

  // Get person DB ID
  const personStmt = db.prepare("SELECT id FROM family_members WHERE family_member_id = ?");
  const person = personStmt.get(personId) as { id: number } | undefined;
  if (!person) throw new Error(`Person not found: ${personId}`);

  // Get trustee type ID
  const typeStmt = db.prepare("SELECT id FROM trustee_types WHERE code = ?");
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
    JSON.stringify(["Full discretionary powers"]), // Default powers
    new Date().toISOString(),
  );
}

export function removeTrustee(trustId: string, personId: string): void {
  const db = getDatabase();

  // Get trust DB ID
  const trustStmt = db.prepare("SELECT id FROM trusts WHERE trust_id = ?");
  const trust = trustStmt.get(trustId) as { id: number } | undefined;
  if (!trust) throw new Error(`Trust not found: ${trustId}`);

  // Get person DB ID
  const personStmt = db.prepare("SELECT id FROM family_members WHERE family_member_id = ?");
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
  conditions?: string,
): void {
  const db = getDatabase();

  // Get trust DB ID
  const trustStmt = db.prepare("SELECT id FROM trusts WHERE trust_id = ?");
  const trust = trustStmt.get(trustId) as { id: number } | undefined;
  if (!trust) throw new Error(`Trust not found: ${trustId}`);

  // Get person DB ID
  const personStmt = db.prepare("SELECT id FROM family_members WHERE family_member_id = ?");
  const person = personStmt.get(personId) as { id: number } | undefined;
  if (!person) throw new Error(`Person not found: ${personId}`);

  // Get beneficiary type ID
  const typeStmt = db.prepare("SELECT id FROM beneficiary_types WHERE code = ?");
  const beneficiaryType = typeStmt.get(beneficiaryTypeCode) as { id: number } | undefined;
  if (!beneficiaryType) throw new Error(`Invalid beneficiary type: ${beneficiaryTypeCode}`);

  // Insert beneficiary
  const insertStmt = db.prepare(`
    INSERT INTO trust_beneficiaries (
      trust_id, person_id, beneficiary_type_id, percentage,
      conditions, is_active
    ) VALUES (?, ?, ?, ?, ?, 1)
  `);

  insertStmt.run(trust.id, person.id, beneficiaryType.id, percentage || null, conditions || null);
}

export function removeBeneficiary(trustId: string, personId: string): void {
  const db = getDatabase();

  // Get trust DB ID
  const trustStmt = db.prepare("SELECT id FROM trusts WHERE trust_id = ?");
  const trust = trustStmt.get(trustId) as { id: number } | undefined;
  if (!trust) throw new Error(`Trust not found: ${trustId}`);

  // Get person DB ID
  const personStmt = db.prepare("SELECT id FROM family_members WHERE family_member_id = ?");
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

export function createFamilyMember(
  member: Omit<FamilyMember, "id" | "legalRoles" | "healthcareRoles">,
  request: Request,
): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const db = getDatabase();
      const userId = await getUserId(request);

      // Get relationship type ID
      const relStmt = db.prepare("SELECT id FROM relationship_types WHERE code = ?");
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
        userId,
        member.firstName,
        member.lastName,
        relType.id,
        member.dateOfBirth || null,
        member.contactInfo?.email || member.contact?.email || null,
        member.contactInfo?.primaryPhone || member.contact?.primaryPhone || null,
        member.contactInfo?.address?.street1 || member.contact?.address?.street1 || null,
        member.contactInfo?.address?.city || member.contact?.address?.city || null,
        member.contactInfo?.address?.state || member.contact?.address?.state || null,
        member.contactInfo?.address?.zipCode || member.contact?.address?.zipCode || null,
      );

      resolve(memberId);
    } catch (error) {
      reject(error);
    }
  });
}

export function updateFamilyMember(memberId: string, updates: Partial<FamilyMember>): void {
  const db = getDatabase();
  const params: (string | number | null)[] = [];
  const setClauses: string[] = [];

  if (updates.firstName !== undefined) {
    setClauses.push("first_name = ?");
    params.push(updates.firstName);
  }

  if (updates.lastName !== undefined) {
    setClauses.push("last_name = ?");
    params.push(updates.lastName);
  }

  if (updates.dateOfBirth !== undefined) {
    setClauses.push("date_of_birth = ?");
    params.push(updates.dateOfBirth);
  }

  const contactInfo = updates.contactInfo;
  if (contactInfo) {
    if (contactInfo.email !== undefined) {
      setClauses.push("email = ?");
      params.push(contactInfo.email);
    }

    if (contactInfo.primaryPhone !== undefined) {
      setClauses.push("phone = ?");
      params.push(contactInfo.primaryPhone);
    }

    if (contactInfo.address) {
      if (contactInfo.address.street1 !== undefined) {
        setClauses.push("address = ?");
        params.push(contactInfo.address.street1);
      }
      if (contactInfo.address.city !== undefined) {
        setClauses.push("city = ?");
        params.push(contactInfo.address.city);
      }
      if (contactInfo.address.state !== undefined) {
        setClauses.push("state = ?");
        params.push(contactInfo.address.state);
      }
      if (contactInfo.address.zipCode !== undefined) {
        setClauses.push("zip = ?");
        params.push(contactInfo.address.zipCode);
      }
    }
  }

  if (setClauses.length === 0) return;

  setClauses.push("updated_at = ?");
  params.push(new Date().toISOString());

  params.push(memberId);

  const query = `UPDATE family_members SET ${setClauses.join(", ")} WHERE family_member_id = ?`;
  const stmt = db.prepare(query);
  stmt.run(...params);
}

export function getFamilyMember(userId: string, memberId: string): FamilyMember | null {
  const db = getDatabase();

  const query = `
    SELECT
      fm.*,
      rt.name as relationship_type_name,
      rt.code as relationship_type_code
    FROM family_members fm
    JOIN relationship_types rt ON fm.relationship_type_id = rt.id
    WHERE fm.family_member_id = ? AND fm.is_active = 1
  `;

  const stmt = db.prepare(query);
  const member = stmt.get(memberId) as any;

  if (!member) {
    return null;
  }

  return {
    id: member.family_member_id,
    firstName: member.first_name,
    lastName: member.last_name,
    name: `${member.first_name} ${member.last_name}`,
    relationship: member.relationship_type_code
      ? member.relationship_type_code.toLowerCase().replace("_", "-")
      : "other",
    dateOfBirth: member.date_of_birth || null,
    email: member.email || null,
    phone: member.phone || null,
    address: member.address || null,
    city: member.city || null,
    state: member.state || null,
    zipCode: member.zip || null,
    notes: member.notes || null,
    isEmergencyContact: member.is_emergency_contact === 1,
    isBeneficiary: member.is_beneficiary === 1,
    isTrustee: member.is_trustee === 1,
    isExecutor: member.is_executor === 1,
    isPowerOfAttorney: member.is_power_of_attorney === 1,
    isHealthcareProxy: member.is_healthcare_proxy === 1,
    contactInfo: {
      email: member.email || null,
      primaryPhone: member.phone || null,
      address: {
        street1: member.address || null,
        city: member.city || null,
        state: member.state || null,
        zipCode: member.zip || null,
      },
    },
  };
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

export function createProfessional(
  professional: Omit<Professional, "id">,
  request: Request,
): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const db = getDatabase();
      const userId = await getUserId(request);

      // Get professional type ID
      const typeStmt = db.prepare("SELECT id FROM professional_types WHERE code = ?");
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

      const [firstName, ...lastNameParts] = professional.name.split(" ");
      const lastName = lastNameParts.join(" ");

      insertStmt.run(
        professionalId,
        userId,
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
        professional.notes || null,
      );

      resolve(professionalId);
    } catch (error) {
      reject(error);
    }
  });
}

export function updateProfessional(professionalId: string, updates: Partial<Professional>): void {
  const db = getDatabase();
  const params: (string | number | null)[] = [];
  const setClauses: string[] = [];

  if (updates.name !== undefined) {
    const [firstName, ...lastNameParts] = updates.name.split(" ");
    const lastName = lastNameParts.join(" ");
    setClauses.push("first_name = ?", "last_name = ?");
    params.push(firstName, lastName);
  }

  if (updates.firm !== undefined) {
    setClauses.push("firm_name = ?");
    params.push(updates.firm);
  }

  const contactInfo = updates.contactInfo;
  if (contactInfo) {
    if (contactInfo.email !== undefined) {
      setClauses.push("email = ?");
      params.push(contactInfo.email);
    }

    if (contactInfo.primaryPhone !== undefined) {
      setClauses.push("phone = ?");
      params.push(contactInfo.primaryPhone);
    }

    if (contactInfo.address) {
      if (contactInfo.address.street1 !== undefined) {
        setClauses.push("address = ?");
        params.push(contactInfo.address.street1);
      }
      if (contactInfo.address.city !== undefined) {
        setClauses.push("city = ?");
        params.push(contactInfo.address.city);
      }
      if (contactInfo.address.state !== undefined) {
        setClauses.push("state = ?");
        params.push(contactInfo.address.state);
      }
      if (contactInfo.address.zipCode !== undefined) {
        setClauses.push("zip = ?");
        params.push(contactInfo.address.zipCode);
      }
    }
  }

  if (updates.specializations !== undefined) {
    setClauses.push("specializations = ?");
    params.push(JSON.stringify(updates.specializations));
  }

  if (updates.notes !== undefined) {
    setClauses.push("notes = ?");
    params.push(updates.notes);
  }

  if (setClauses.length === 0) return;

  setClauses.push("updated_at = ?");
  params.push(new Date().toISOString());

  params.push(professionalId);

  const query = `UPDATE professionals SET ${setClauses.join(", ")} WHERE professional_id = ?`;
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

// Document CRUD Operations

export interface Document {
  id: number;
  document_id: string;
  user_id: number;
  name: string;
  original_filename: string;
  file_path: string;
  file_size: number;
  file_type: string;
  mime_type: string;
  category: string;
  description?: string;
  related_entity_type?: string;
  related_entity_id?: string;
  status: string;
  uploaded_at: string;
  verified_at?: string;
  expires_at?: string;
  tags?: string;
  is_archived: number;
  created_at: string;
  updated_at: string;
}

export interface DocumentCreateInput {
  name: string;
  original_filename: string;
  file_path: string;
  file_size: number;
  file_type: string;
  mime_type: string;
  category: string;
  description?: string;
  related_entity_type?: string;
  related_entity_id?: string;
  tags?: string[];
}

export function createDocument(document: DocumentCreateInput, request: Request): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const db = getDatabase();
      const userId = await getUserId(request);

      // Generate document ID
      const documentId = `DOC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Insert document
      const insertStmt = db.prepare(`
    INSERT INTO documents (
      document_id, user_id, name, original_filename, file_path,
      file_size, file_type, mime_type, category, description,
      related_entity_type, related_entity_id, tags, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

      insertStmt.run(
        documentId,
        userId,
        document.name,
        document.original_filename,
        document.file_path,
        document.file_size,
        document.file_type,
        document.mime_type,
        document.category,
        document.description || null,
        document.related_entity_type || null,
        document.related_entity_id || null,
        document.tags ? JSON.stringify(document.tags) : null,
        "verified", // Default status
      );

      resolve(documentId);
    } catch (error) {
      reject(error);
    }
  });
}

export function getDocument(documentId: string): Document | null {
  const db = getDatabase();

  const stmt = db.prepare(`
    SELECT * FROM documents 
    WHERE document_id = ? AND is_archived = 0
  `);

  const document = stmt.get(documentId) as Document | undefined;
  return document || null;
}

export function getDocuments(filters?: {
  userId?: number;
  category?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  status?: string;
  limit?: number;
  offset?: number;
}): { documents: Document[]; total: number } {
  const db = getDatabase();

  const whereClauses: string[] = ["is_archived = 0"];
  const params: (string | number)[] = [];

  if (filters?.userId) {
    whereClauses.push("user_id = ?");
    params.push(filters.userId);
  }

  if (filters?.category) {
    whereClauses.push("category = ?");
    params.push(filters.category);
  }

  if (filters?.relatedEntityType) {
    whereClauses.push("related_entity_type = ?");
    params.push(filters.relatedEntityType);
  }

  if (filters?.relatedEntityId) {
    whereClauses.push("related_entity_id = ?");
    params.push(filters.relatedEntityId);
  }

  if (filters?.status) {
    whereClauses.push("status = ?");
    params.push(filters.status);
  }

  const whereClause = whereClauses.join(" AND ");

  // Get total count
  const countStmt = db.prepare(`
    SELECT COUNT(*) as count FROM documents 
    WHERE ${whereClause}
  `);
  const { count } = countStmt.get(...params) as { count: number };

  // Get documents with pagination
  const limit = filters?.limit || 50;
  const offset = filters?.offset || 0;

  const documentsStmt = db.prepare(`
    SELECT * FROM documents 
    WHERE ${whereClause}
    ORDER BY uploaded_at DESC
    LIMIT ? OFFSET ?
  `);

  params.push(limit, offset);
  const documents = documentsStmt.all(...params) as Document[];

  return { documents, total: count };
}

export function updateDocument(documentId: string, updates: Partial<Document>): void {
  const db = getDatabase();
  const params: (string | number | null)[] = [];
  const setClauses: string[] = [];

  if (updates.name !== undefined) {
    setClauses.push("name = ?");
    params.push(updates.name);
  }

  if (updates.category !== undefined) {
    setClauses.push("category = ?");
    params.push(updates.category);
  }

  if (updates.description !== undefined) {
    setClauses.push("description = ?");
    params.push(updates.description);
  }

  if (updates.status !== undefined) {
    setClauses.push("status = ?");
    params.push(updates.status);
  }

  if (updates.verified_at !== undefined) {
    setClauses.push("verified_at = ?");
    params.push(updates.verified_at);
  }

  if (updates.expires_at !== undefined) {
    setClauses.push("expires_at = ?");
    params.push(updates.expires_at);
  }

  if (updates.tags !== undefined) {
    setClauses.push("tags = ?");
    params.push(updates.tags);
  }

  if (setClauses.length === 0) return;

  setClauses.push("updated_at = ?");
  params.push(new Date().toISOString());

  params.push(documentId);

  const query = `UPDATE documents SET ${setClauses.join(", ")} WHERE document_id = ?`;
  const stmt = db.prepare(query);
  stmt.run(...params);
}

export function archiveDocument(documentId: string): void {
  const db = getDatabase();

  // Soft delete by archiving
  const stmt = db.prepare(`
    UPDATE documents 
    SET is_archived = 1, updated_at = ? 
    WHERE document_id = ?
  `);

  stmt.run(new Date().toISOString(), documentId);
}

export function logDocumentAccess(
  documentId: number,
  userId: number,
  action: string,
  ipAddress?: string,
  userAgent?: string,
): void {
  const db = getDatabase();

  const stmt = db.prepare(`
    INSERT INTO document_access_log (
      document_id, user_id, action, ip_address, user_agent
    ) VALUES (?, ?, ?, ?, ?)
  `);

  stmt.run(documentId, userId, action, ipAddress || null, userAgent || null);
}
