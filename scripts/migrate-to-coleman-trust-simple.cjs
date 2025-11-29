/**
 * Simplified Coleman Trust Schema Migration
 * Creates the essential normalized tables without complex constraints
 */

const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const projectRoot = path.resolve(__dirname, "..");
const dbPath = path.join(projectRoot, "data/estateease.db");
const backupPath = path.join(
  projectRoot,
  "data/backups",
  `estateease-backup-${new Date().toISOString().split("T")[0]}.db`,
);

console.log("🚀 Starting simplified Coleman Trust schema migration...");

// Ensure backup directory exists
const backupDir = path.dirname(backupPath);
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

try {
  // 1. Create backup of current database
  console.log("📦 Creating backup of current database...");
  fs.copyFileSync(dbPath, backupPath);
  console.log(`✅ Backup created: ${backupPath}`);

  // 2. Open database connection
  const db = new Database(dbPath);
  db.pragma("foreign_keys = OFF"); // Disable during migration

  // 3. Read current data before transformation
  console.log("📊 Reading current data...");

  const currentUsers = db.prepare("SELECT * FROM users").all();
  const currentFamilyMembers = db.prepare("SELECT * FROM family_members").all();
  const currentProfessionals = db.prepare("SELECT * FROM professionals").all();
  const currentTrusts = db.prepare("SELECT * FROM trusts").all();
  const currentTrustTrustees = db.prepare("SELECT * FROM trust_trustees").all();
  const currentTrustBeneficiaries = db.prepare("SELECT * FROM trust_beneficiaries").all();

  console.log(`📋 Current data summary:
    - Users: ${currentUsers.length}
    - Family Members: ${currentFamilyMembers.length}
    - Professionals: ${currentProfessionals.length}
    - Trusts: ${currentTrusts.length}
    - Trust Trustees: ${currentTrustTrustees.length}
    - Trust Beneficiaries: ${currentTrustBeneficiaries.length}`);

  // 4. Create the essential new tables
  console.log("🔄 Creating essential Coleman Trust tables...");

  // Create persons table
  db.exec(`
    CREATE TABLE IF NOT EXISTS persons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      person_id TEXT NOT NULL UNIQUE,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      full_name TEXT,
      date_of_birth TEXT,
      is_minor INTEGER NOT NULL DEFAULT 0,
      is_dependent INTEGER NOT NULL DEFAULT 0,
      primary_phone TEXT,
      secondary_phone TEXT,
      email TEXT,
      preferred_contact TEXT,
      street1 TEXT,
      street2 TEXT,
      city TEXT,
      state TEXT,
      zip_code TEXT,
      country TEXT DEFAULT 'USA',
      notes TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // Drop and recreate family_relationships table with correct structure
  db.exec(`DROP TABLE IF EXISTS family_relationships`);
  db.exec(`
    CREATE TABLE family_relationships (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      person_id INTEGER NOT NULL,
      relationship_type_id INTEGER NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // Create professional_relationships table
  db.exec(`
    CREATE TABLE IF NOT EXISTS professional_relationships (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      person_id INTEGER NOT NULL,
      professional_type TEXT NOT NULL,
      firm TEXT,
      title TEXT,
      specializations TEXT,
      credentials TEXT,
      years_experience INTEGER,
      is_preferred_provider INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // Add person_id columns to existing trust tables if they don't exist
  try {
    db.exec("ALTER TABLE trust_trustees ADD COLUMN person_id INTEGER");
  } catch (error) {
    if (!error.message.includes("duplicate column name")) {
      console.warn(`⚠️  Warning adding person_id to trust_trustees: ${error.message}`);
    }
  }

  try {
    db.exec("ALTER TABLE trust_beneficiaries ADD COLUMN person_id INTEGER");
  } catch (error) {
    if (!error.message.includes("duplicate column name")) {
      console.warn(`⚠️  Warning adding person_id to trust_beneficiaries: ${error.message}`);
    }
  }

  // Add person_id to users table if it doesn't exist
  try {
    db.exec("ALTER TABLE users ADD COLUMN person_id INTEGER");
  } catch (error) {
    if (!error.message.includes("duplicate column name")) {
      console.warn(`⚠️  Warning adding person_id to users: ${error.message}`);
    }
  }

  console.log("✅ Essential tables created successfully");

  // 5. Transform and migrate data
  console.log("🔄 Migrating data to normalized structure...");

  // 5a. Create persons from family_members
  const personInsert = db.prepare(`
    INSERT OR IGNORE INTO persons (
      person_id, first_name, last_name, full_name, date_of_birth, 
      is_minor, is_dependent, primary_phone, secondary_phone, email, 
      preferred_contact, street1, street2, city, state, zip_code, 
      country, notes, is_active, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Migrate family members to persons
  for (const member of currentFamilyMembers) {
    const [firstName, ...lastNameParts] = member.name.split(" ");
    const lastName = lastNameParts.join(" ") || "";

    personInsert.run(
      member.family_member_id,
      firstName,
      lastName,
      member.name,
      member.date_of_birth,
      member.is_minor,
      member.is_dependent,
      member.primary_phone,
      member.secondary_phone,
      member.email,
      member.preferred_contact,
      member.street1,
      member.street2,
      member.city,
      member.state,
      member.zip_code,
      member.country,
      member.notes,
      member.is_active,
      member.created_at,
      member.updated_at,
    );
  }

  // Migrate professionals to persons
  for (const professional of currentProfessionals) {
    const [firstName, ...lastNameParts] = professional.name.split(" ");
    const lastName = lastNameParts.join(" ") || "";

    personInsert.run(
      professional.professional_id,
      firstName,
      lastName,
      professional.name,
      null, // date_of_birth
      0, // is_minor
      0, // is_dependent
      professional.primary_phone,
      professional.secondary_phone,
      professional.email,
      professional.preferred_contact,
      professional.street1,
      professional.street2,
      professional.city,
      professional.state,
      professional.zip_code,
      professional.country,
      professional.notes,
      professional.is_active,
      professional.created_at,
      professional.updated_at,
    );
  }

  // 5b. Create family_relationships
  const familyRelationshipInsert = db.prepare(`
    INSERT OR IGNORE INTO family_relationships (
      user_id, person_id, relationship_type_id, is_active, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const member of currentFamilyMembers) {
    familyRelationshipInsert.run(
      member.user_id,
      member.family_member_id,
      member.relationship_type_id,
      member.is_active,
      member.created_at,
      member.updated_at,
    );
  }

  // 5c. Create professional_relationships
  const professionalRelationshipInsert = db.prepare(`
    INSERT OR IGNORE INTO professional_relationships (
      user_id, person_id, professional_type, firm, title, specializations, 
      credentials, years_experience, is_preferred_provider, is_active, 
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const professional of currentProfessionals) {
    professionalRelationshipInsert.run(
      professional.user_id,
      professional.professional_id,
      professional.professional_type,
      professional.firm,
      professional.title,
      professional.specializations,
      professional.credentials,
      professional.years_experience,
      professional.is_preferred_provider,
      professional.is_active,
      professional.created_at,
      professional.updated_at,
    );
  }

  // 5d. Link trust trustees to persons
  const updateTrusteePersonId = db.prepare(`
    UPDATE trust_trustees 
    SET person_id = ? 
    WHERE trustee_name = ?
  `);

  for (const trustee of currentTrustTrustees) {
    // Try to find matching person by name
    const matchingPerson = db
      .prepare(
        `
      SELECT person_id FROM persons WHERE full_name = ?
    `,
      )
      .get(trustee.trustee_name);

    if (matchingPerson) {
      updateTrusteePersonId.run(matchingPerson.person_id, trustee.trustee_name);
    }
  }

  // 5e. Link trust beneficiaries to persons
  const updateBeneficiaryPersonId = db.prepare(`
    UPDATE trust_beneficiaries 
    SET person_id = ? 
    WHERE beneficiary_name = ?
  `);

  for (const beneficiary of currentTrustBeneficiaries) {
    // Try to find matching person by name
    const matchingPerson = db
      .prepare(
        `
      SELECT person_id FROM persons WHERE full_name = ?
    `,
      )
      .get(beneficiary.beneficiary_name);

    if (matchingPerson) {
      updateBeneficiaryPersonId.run(matchingPerson.person_id, beneficiary.beneficiary_name);
    }
  }

  // 6. Re-enable foreign keys
  db.pragma("foreign_keys = ON");

  // 7. Verify migration success
  console.log("✅ Verifying migration...");

  const newPersons = db.prepare("SELECT COUNT(*) as count FROM persons").get();
  const newFamilyRelationships = db
    .prepare("SELECT COUNT(*) as count FROM family_relationships")
    .get();
  const newProfessionalRelationships = db
    .prepare("SELECT COUNT(*) as count FROM professional_relationships")
    .get();

  console.log(`📊 Migration results:
    - Persons created: ${newPersons.count}
    - Family relationships: ${newFamilyRelationships.count}
    - Professional relationships: ${newProfessionalRelationships.count}`);

  // 8. Create migration completion marker
  db.prepare(
    `
    INSERT OR REPLACE INTO audit_log (action, table_name, record_id, user_id, new_values, changed_at)
    VALUES ('SCHEMA_MIGRATION', 'DATABASE', 'coleman-trust-simple', 1, ?, datetime('now'))
  `,
  ).run(
    JSON.stringify({
      migration_date: new Date().toISOString(),
      backup_location: backupPath,
      persons_migrated: newPersons.count,
      status: "completed",
    }),
  );

  db.close();

  console.log("🎉 Simplified Coleman Trust migration completed successfully!");
  console.log(`📦 Backup saved to: ${backupPath}`);
  console.log("🔄 The application can now use the normalized person relationships.");
} catch (error) {
  console.error("❌ Migration failed:", error);

  // Restore from backup if migration failed
  if (fs.existsSync(backupPath)) {
    console.log("🔄 Restoring from backup...");
    fs.copyFileSync(backupPath, dbPath);
    console.log("✅ Database restored from backup");
  }

  process.exit(1);
}
