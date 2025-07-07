#!/usr/bin/env node

/**
 * Script to update user profiles with personal information from Excel
 * This includes DOB, phone numbers, email addresses, etc.
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database path
const dbPath = path.join(__dirname, '../data/estateease.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

console.log('Updating user profiles with Excel data...\n');

// Update Nick's profile
const updateNick = db.prepare(`
  UPDATE users 
  SET 
    date_of_birth = ?,
    phone_number = ?,
    updated_at = datetime('now')
  WHERE external_id = 'user-nick-001'
`);

const nickResult = updateNick.run('1985-01-05', '870-740-0598');
console.log(`✅ Updated Nick's profile: ${nickResult.changes} records updated`);

// Update Kelsey's profile
const updateKelsey = db.prepare(`
  UPDATE users 
  SET 
    date_of_birth = ?,
    phone_number = ?,
    updated_at = datetime('now')
  WHERE external_id = 'user-kelsey-001'
`);

const kelseyResult = updateKelsey.run('1989-03-13', '501-545-9627');
console.log(`✅ Updated Kelsey's profile: ${kelseyResult.changes} records updated`);

// Add family members that are mentioned in the Excel (guardians and beneficiaries)
const familyMembers = [
  {
    userId: 2, // Kelsey
    name: 'Yvonne Westfall',
    relationship: 'parent',
    notes: 'Kelsey\'s mother. Primary guardian for children. Address: 760 N Moore Rd. Hot Springs AR, 71913'
  },
  {
    userId: 2, // Kelsey  
    name: 'Joy Shepherd',
    relationship: 'sibling',
    notes: 'Secondary guardian option. Address: 98 CR 378 Wynne Arkansas 72396'
  },
  {
    userId: 2, // Kelsey
    name: 'Emily Hanzlik',
    relationship: 'sibling',
    notes: 'Medical power of attorney option'
  },
  {
    userId: 2, // Kelsey
    name: 'Samuel Stephen Hanzlik',
    relationship: 'sibling',
    notes: 'Beneficiary if no heirs'
  },
  {
    userId: 2, // Kelsey
    name: 'Julia Jean Shepherd',
    relationship: 'other',
    notes: 'Beneficiary if no heirs (Joy\'s child)'
  },
  {
    userId: 2, // Kelsey
    name: 'John Bryant Shepherd IV',
    relationship: 'other',
    notes: 'Beneficiary if no heirs (Joy\'s child)'
  },
  {
    userId: 1, // Nick
    name: 'Robert Bobby Coleman',
    relationship: 'parent',
    notes: 'Nick\'s father - prospective inheritance'
  }
];

// Insert family members if they don't exist
const insertFamilyMember = db.prepare(`
  INSERT OR IGNORE INTO family_members (
    family_member_id,
    user_id,
    name,
    relationship_type_id,
    notes,
    is_active,
    created_at,
    updated_at
  ) VALUES (?, ?, ?, (SELECT id FROM relationship_types WHERE code = ?), ?, 1, datetime('now'), datetime('now'))
`);

let familyCount = 0;
familyMembers.forEach((member, index) => {
  const familyMemberId = `fm-excel-${9000 + index}`;
  const result = insertFamilyMember.run(
    familyMemberId,
    member.userId,
    member.name,
    member.relationship,
    member.notes
  );
  if (result.changes > 0) {
    familyCount++;
    console.log(`✅ Added family member: ${member.name}`);
  }
});

console.log(`\nAdded ${familyCount} new family members`);

// Add legal roles based on Excel data
const legalRoles = [
  {
    userId: 1,
    roleType: 'executor',
    personName: 'Kelsey Brown Coleman',
    isPrimary: true,
    notes: 'Primary executor (surviving spouse)'
  },
  {
    userId: 1,
    roleType: 'executor', 
    personName: 'Arvest Bank',
    isPrimary: false,
    orderOfPrecedence: 2,
    notes: 'Secondary executor if spouse unavailable'
  },
  {
    userId: 2,
    roleType: 'executor',
    personName: 'Nicholas Coleman',
    isPrimary: true,
    notes: 'Primary executor (surviving spouse)'
  },
  {
    userId: 2,
    roleType: 'executor',
    personName: 'Arvest Bank', 
    isPrimary: false,
    orderOfPrecedence: 2,
    notes: 'Secondary executor if spouse unavailable'
  },
  {
    userId: 1,
    roleType: 'power_of_attorney',
    personName: 'Kelsey Brown Coleman',
    isPrimary: true,
    notes: 'Financial power of attorney if Nick passes'
  },
  {
    userId: 2,
    roleType: 'power_of_attorney',
    personName: 'Nicholas Coleman',
    isPrimary: true,
    notes: 'Financial power of attorney if Kelsey passes'
  },
  {
    userId: 2,
    roleType: 'healthcare_proxy',
    personName: 'Nicholas Coleman',
    isPrimary: true,
    orderOfPrecedence: 1,
    notes: 'Primary medical power of attorney'
  },
  {
    userId: 2,
    roleType: 'healthcare_proxy',
    personName: 'Yvonne Westfall',
    isPrimary: false,
    orderOfPrecedence: 2,
    notes: 'Secondary medical power of attorney'
  },
  {
    userId: 2,
    roleType: 'healthcare_proxy',
    personName: 'Joy Shepherd',
    isPrimary: false,
    orderOfPrecedence: 3,
    notes: 'Tertiary medical power of attorney'
  },
  {
    userId: 2,
    roleType: 'healthcare_proxy',
    personName: 'Emily Hanzlik',
    isPrimary: false,
    orderOfPrecedence: 4,
    notes: 'Quaternary medical power of attorney'
  }
];

// Insert legal roles
const insertLegalRole = db.prepare(`
  INSERT OR IGNORE INTO legal_roles (
    legal_role_id,
    user_id,
    role_type_id,
    person_name,
    is_primary,
    order_of_precedence,
    notes,
    is_active,
    created_at,
    updated_at
  ) VALUES (?, ?, (SELECT id FROM legal_role_types WHERE code = ?), ?, ?, ?, ?, 1, datetime('now'), datetime('now'))
`);

let roleCount = 0;
legalRoles.forEach((role, index) => {
  const roleId = `lr-excel-${10000 + index}`;
  const result = insertLegalRole.run(
    roleId,
    role.userId,
    role.roleType,
    role.personName,
    role.isPrimary ? 1 : 0,
    role.orderOfPrecedence || null,
    role.notes
  );
  if (result.changes > 0) {
    roleCount++;
    console.log(`✅ Added legal role: ${role.roleType} - ${role.personName}`);
  }
});

console.log(`\nAdded ${roleCount} new legal roles`);

// Store important notes as a document/note (since we don't have a notes table, we'll output them)
console.log('\n--- Important Estate Planning Notes ---');
console.log('\n1. Marriage Information:');
console.log('   - Date: October 3, 2015');
console.log('   - Location: Fayetteville, AR');

console.log('\n2. Guardian Provisions (if both parents pass):');
console.log('   - Primary Guardian: Yvonne Westfall (Kelsey\'s mother)');
console.log('   - Financials managed by Arvest Bank until children reach age 35');
console.log('   - Children become their own trustee at age 35');
console.log('   - Access to $300K each at age 25 for home purchase');
console.log('   - Access to funds at age 18 with trustee approval for housing, health, education');

console.log('\n3. No Heirs Provisions:');
console.log('   - Assets originally Kelsey\'s to be divided equally among Hanzlik family');
console.log('   - Beneficiaries: Yvonne Westfall, Joy Shepherd, Emily Hanzlik,');
console.log('     Samuel Hanzlik, Julia Shepherd, John Shepherd IV');

// Close database
db.close();

console.log('\n✅ User profiles and related data have been updated!'); 