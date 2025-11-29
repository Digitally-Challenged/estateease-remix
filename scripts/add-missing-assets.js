#!/usr/bin/env node

/**
 * Script to add missing assets from Excel file to SQLite database
 * Based on the verification results, adds only actual assets that were missed
 */

import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import process from "process";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database path
const dbPath = path.join(__dirname, "../data/estateease.db");
const db = new Database(dbPath);

// Enable foreign keys
db.pragma("foreign_keys = ON");

console.log("Adding missing assets to database...\n");

// Get user IDs
const getNickUserId = () => {
  const result = db.prepare(`SELECT id FROM users WHERE external_id = 'user-nick-001'`).get();
  return result ? result.id : null;
};

const getKelseyUserId = () => {
  const result = db.prepare(`SELECT id FROM users WHERE external_id = 'user-kelsey-001'`).get();
  return result ? result.id : null;
};

const nickUserId = getNickUserId();
const kelseyUserId = getKelseyUserId();

if (!nickUserId || !kelseyUserId) {
  console.error("Could not find Nick or Kelsey user IDs. Make sure users are created first.");
  process.exit(1);
}

console.log(`Found Nick user ID: ${nickUserId}`);
console.log(`Found Kelsey user ID: ${kelseyUserId}\n`);

// Missing assets identified from the verification script
const missingAssets = [
  // Credit Cards (these are liabilities but should be tracked)
  {
    id: "cc-7000",
    userId: kelseyUserId,
    name: "Chase Credit Card",
    category: "financial_account",
    value: -162.0, // Negative value for debt
    details: {
      type: "credit_card",
      institution: "Chase",
      accountNumber: "******8058",
      owner: "Kelsey",
      notes: "Personal credit card",
    },
  },
  {
    id: "cc-7001",
    userId: kelseyUserId,
    name: "Chase Business Credit Card",
    category: "financial_account",
    value: 0.0,
    details: {
      type: "credit_card",
      institution: "Chase Business",
      owner: "Kelsey",
      notes: "Business credit card - Willow Consulting",
    },
  },

  // Additional personal information that should be stored (not as assets but as user metadata)
  // These are not assets, so we'll skip them but note them for future user profile updates:
  // - DOB: Nick 1/5/1985, Kelsey 3/13/1989
  // - Birthplace: Nick - Blytheville, Kelsey - Hot Springs
  // - Marriage: 10/03/2015 - Fayetteville, AR
  // - Email: nickcoleman85@gmail.com, kelseyfbrown@gmail.com
  // - Phone: Nick 870-740-0598, Kelsey 501-545-9627
  // - Address: 2211 NW Willow, Bentonville, AR 72712

  // Prospective Inheritances (these should be tracked as notes or future assets)
  {
    id: "pi-8000",
    userId: nickUserId,
    name: "Prospective Inheritance - Robert Bobby Coleman",
    category: "personal_property",
    value: 0.0,
    details: {
      propertyType: "future_inheritance",
      from: "Robert Bobby Coleman",
      beneficiary: "Nick",
      notes: "Future inheritance from father",
    },
  },
  {
    id: "pi-8001",
    userId: nickUserId,
    name: "Prospective Inheritance - Other Coleman Family",
    category: "personal_property",
    value: 0.0,
    details: {
      propertyType: "future_inheritance",
      from: "Other Coleman Family Members",
      beneficiary: "Nick",
      notes: "Potential future inheritance from extended family",
    },
  },
  {
    id: "pi-8002",
    userId: kelseyUserId,
    name: "Prospective Inheritance - Yvonne Westfall",
    category: "personal_property",
    value: 0.0,
    details: {
      propertyType: "future_inheritance",
      from: "Yvonne Westfall",
      beneficiary: "Kelsey",
      notes: "Future inheritance from mother",
    },
  },
];

// Key appointments and roles (these should be in legal_roles table, not assets)
const keyAppointments = {
  executor: "Surviving spouse, then Institution - Arvest",
  trustee: "Surviving spouse, then Institution - Arvest",
  guardians: "See Upon Death section for detailed guardian assignments",
  financialPOA: {
    nick: "Kelsey (if Nick passes)",
    kelsey: "Nick (if Kelsey passes)",
  },
  medicalPOA: {
    kelsey: ["Nick Coleman", "Yvonne Westfall", "Joy Shepherd", "Emily Hanzlik"],
  },
  successorAgents: {
    kelsey: {
      primary: "Yvonne Westfall - 760 N Moore Rd. Hot Springs AR, 71913",
      secondary: "Joy Shepard - 98 CR 378 Wynne Arkansas 72396",
    },
  },
};

// Important notes about inheritance if no heirs
const inheritanceNotes = `
If there are no heirs and both Nick and Kelsey die:
- Assets originally Kelsey's to be divided equally between the Hanzlik family
- This includes Kelsey's IRAs
- Beneficiaries: Yvonne Louise Westfall, Joy Bonady Shepherd, Emily Marie Hanzlik, 
  Samuel Stephen Hanzlik, Julia Jean Shepherd, John Bryant Shepherd IV
`;

// Trust provisions for children
const trustProvisions = `
Children's Trust Provisions:
- Financials to be managed by Arvest Bank until age 35
- Children get access to money at age 35 and become their own trustee at age 35
- Access to $300K each at age 25 for home purchase
- Access to money at age 18 with trustee determination for housing, health, education
`;

// Prepare insert statement
const insertAsset = db.prepare(`
  INSERT INTO assets (
    asset_id, user_id, name, category, value, 
    ownership_type, ownership_details, asset_details, 
    notes, is_active, last_updated
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, datetime('now'))
`);

// Insert missing assets
const insertAll = db.transaction(() => {
  let successCount = 0;
  let errorCount = 0;

  missingAssets.forEach((asset) => {
    try {
      // Determine ownership type
      let ownershipType = "individual";

      // Prepare ownership details
      const ownershipDetails = {
        owner: asset.details.owner,
        beneficiary: asset.details.beneficiary,
      };

      // Prepare asset details
      const assetDetails = { ...asset.details };
      delete assetDetails.owner;
      delete assetDetails.beneficiary;

      insertAsset.run(
        asset.id,
        asset.userId,
        asset.name,
        asset.category.toUpperCase().replace(/_/g, "_"),
        asset.value,
        ownershipType,
        JSON.stringify(ownershipDetails),
        JSON.stringify(assetDetails),
        asset.details.notes || null,
      );

      successCount++;
      console.log(`✅ Added: ${asset.name}`);
    } catch (error) {
      console.error(`❌ Error inserting asset ${asset.id}: ${error.message}`);
      errorCount++;
    }
  });

  console.log(`\nMissing assets migration completed!`);
  console.log(`✅ Successfully inserted: ${successCount} assets`);
  if (errorCount > 0) {
    console.log(`❌ Failed to insert: ${errorCount} assets`);
  }
});

// Execute the transaction
insertAll();

// Also create notes records for important information
console.log("\n--- Important Information from Excel ---");
console.log("\nKey Appointments:", JSON.stringify(keyAppointments, null, 2));
console.log("\nInheritance Notes:", inheritanceNotes);
console.log("\nTrust Provisions:", trustProvisions);

// Get updated count
const totalAssets = db
  .prepare("SELECT COUNT(*) as count FROM assets WHERE is_active = 1")
  .get().count;
console.log(`\nTotal assets now in database: ${totalAssets}`);

// Show category summary
console.log("\nAsset Category Summary:");
const categorySummary = db
  .prepare(
    `
  SELECT 
    category,
    COUNT(*) as count,
    SUM(value) as total_value
  FROM assets
  WHERE is_active = 1
  GROUP BY category
  ORDER BY category
`,
  )
  .all();

categorySummary.forEach((cat) => {
  console.log(
    `${cat.category}: ${cat.count} assets, Total value: $${cat.total_value.toLocaleString()}`,
  );
});

// Close the database
db.close();

console.log("\n✅ Missing assets have been added to the database!");
