#!/usr/bin/env node

/**
 * Script to migrate Excel data from initial-assets.ts to SQLite database
 * This ensures the database is in sync with the TypeScript constants
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

console.log("Starting Excel data migration to database...\n");

// First, let's get the user IDs
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

// Get asset category IDs
const getAssetCategoryId = (code) => {
  const result = db.prepare(`SELECT id FROM asset_categories WHERE code = ?`).get(code);
  return result ? result.id : null;
};

// Create asset categories if they don't exist
const createAssetCategories = () => {
  const categories = [
    { code: "real_estate", name: "Real Estate", description: "Property and land holdings" },
    {
      code: "financial_account",
      name: "Financial Account",
      description: "Bank and investment accounts",
    },
    {
      code: "insurance_policy",
      name: "Insurance Policy",
      description: "Life, disability, and other insurance",
    },
    {
      code: "business_interest",
      name: "Business Interest",
      description: "Ownership in businesses and LLCs",
    },
    {
      code: "personal_property",
      name: "Personal Property",
      description: "Vehicles, jewelry, and other valuables",
    },
    {
      code: "digital_asset",
      name: "Digital Asset",
      description: "Cryptocurrency, domains, and online assets",
    },
  ];

  const insertCategory = db.prepare(`
    INSERT OR IGNORE INTO asset_categories (code, name, description)
    VALUES (?, ?, ?)
  `);

  categories.forEach((cat) => {
    insertCategory.run(cat.code, cat.name, cat.description);
  });
};

// Create the asset_categories table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS asset_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

createAssetCategories();

// Clear existing assets (optional - comment out if you want to append)
console.log("Clearing existing assets...");
db.prepare("DELETE FROM assets").run();

// Asset data from the updated initial-assets.ts (post Excel migration)
const assets = [
  // Financial Accounts
  {
    id: "fa-1000",
    userId: nickUserId,
    name: "Joint Checking",
    category: "financial_account",
    value: 7947.74,
    details: {
      type: "checking",
      institution: "Arvest Bank",
      accountNumber: "******9373",
      owner: "Joint (Nick & Kelsey)",
      beneficiary: "Surviving Spouse",
    },
  },
  {
    id: "fa-1001",
    userId: nickUserId,
    name: "Joint Savings - Use",
    category: "financial_account",
    value: 3329.72,
    details: {
      type: "savings",
      institution: "Arvest Bank",
      accountNumber: "******8047",
      owner: "Joint (Nick & Kelsey)",
      beneficiary: "Surviving Spouse",
    },
  },
  {
    id: "fa-1002",
    userId: nickUserId,
    name: "Joint Vacation Savings",
    category: "financial_account",
    value: 2125.0,
    details: {
      type: "savings",
      institution: "Arvest Bank",
      accountNumber: "******4220",
      owner: "Joint (Nick & Kelsey)",
      beneficiary: "Surviving Spouse",
    },
  },
  {
    id: "fa-1003",
    userId: nickUserId,
    name: "Health Savings Account",
    category: "financial_account",
    value: 2950.57,
    details: {
      type: "investment_brokerage",
      institution: "Fidelity Investments",
      accountNumber: "******5257",
      owner: "Joint (Nick & Kelsey)",
      beneficiary: "Surviving Spouse",
    },
  },
  {
    id: "fa-1004",
    userId: kelseyUserId,
    name: "Travel",
    category: "financial_account",
    value: 3212.0,
    details: {
      type: "checking",
      institution: "Capital One",
      accountNumber: "******6101",
      owner: "Kelsey",
      beneficiary: "Nick",
    },
  },
  {
    id: "fa-1005",
    userId: kelseyUserId,
    name: "Hanzlik (Kelsey Moms $)",
    category: "financial_account",
    value: 19017.0,
    details: {
      type: "checking",
      institution: "Capital One",
      accountNumber: "******1703",
      owner: "Kelsey",
      beneficiary: "Nick",
    },
  },
  {
    id: "fa-1006",
    userId: kelseyUserId,
    name: "Checking",
    category: "financial_account",
    value: 1097.0,
    details: {
      type: "checking",
      institution: "Capital One",
      accountNumber: "******8998",
      owner: "Kelsey",
      beneficiary: "Nick",
    },
  },
  {
    id: "fa-1007",
    userId: kelseyUserId,
    name: "Savings - Spending",
    category: "financial_account",
    value: 6010.0,
    details: {
      type: "savings",
      institution: "Capital One",
      accountNumber: "******7416",
      owner: "Kelsey",
      beneficiary: "Nick",
    },
  },
  {
    id: "fa-1008",
    userId: kelseyUserId,
    name: "Savings - Emergency",
    category: "financial_account",
    value: 10645.0,
    details: {
      type: "savings",
      institution: "Capital One",
      accountNumber: "******0437",
      owner: "Kelsey",
      beneficiary: "Nick",
    },
  },
  {
    id: "fa-1009",
    userId: kelseyUserId,
    name: "Savings Willow Consulting",
    category: "financial_account",
    value: 1926.0,
    details: {
      type: "savings",
      institution: "Chase",
      accountNumber: "******9220",
      owner: "Kelsey",
      beneficiary: "Nick",
    },
  },
  {
    id: "fa-1010",
    userId: kelseyUserId,
    name: "Checking Willow Consulting",
    category: "financial_account",
    value: 4128.0,
    details: {
      type: "checking",
      institution: "Chase",
      accountNumber: "******0276",
      owner: "Kelsey",
      beneficiary: "Nick",
    },
  },
  {
    id: "fa-1011",
    userId: kelseyUserId,
    name: "Walmart Stock (Stock Purchase Plan)",
    category: "financial_account",
    value: 72000.0,
    details: {
      type: "investment_brokerage",
      institution: "Computer Share",
      owner: "Kelsey",
      beneficiary: "Nick",
    },
  },
  {
    id: "fa-1012",
    userId: kelseyUserId,
    name: "Walmart Stock",
    category: "financial_account",
    value: 22098.0,
    details: {
      type: "investment_brokerage",
      institution: "Merrill Lynch",
      accountNumber: "******38114",
      owner: "Kelsey",
      beneficiary: "Nick",
    },
  },
  {
    id: "fa-1013",
    userId: kelseyUserId,
    name: "Brokerage IRA",
    category: "financial_account",
    value: 195249.0,
    details: {
      type: "retirement_ira",
      institution: "Wells Fargo",
      accountNumber: "******5487",
      owner: "Kelsey",
      beneficiary: "Nick",
    },
  },
  {
    id: "fa-1014",
    userId: kelseyUserId,
    name: "Brokerage",
    category: "financial_account",
    value: 18395.0,
    details: {
      type: "investment_brokerage",
      institution: "Wells Fargo",
      accountNumber: "******5329",
      owner: "Kelsey",
      beneficiary: "Nick",
    },
  },
  {
    id: "fa-1015",
    userId: kelseyUserId,
    name: "Brokerage IRA",
    category: "financial_account",
    value: 60717.0,
    details: {
      type: "retirement_ira",
      institution: "Wells Fargo",
      accountNumber: "******9389",
      owner: "Kelsey",
      beneficiary: "Nick",
    },
  },
  {
    id: "fa-1016",
    userId: nickUserId,
    name: "Individual Checking",
    category: "financial_account",
    value: 4928.03,
    details: {
      type: "checking",
      institution: "Arvest Bank",
      accountNumber: "******6738",
      owner: "Nick",
      beneficiary: "Kelsey",
    },
  },
  {
    id: "fa-1017",
    userId: nickUserId,
    name: "Coleman Law Firm Operating Account",
    category: "financial_account",
    value: 19984.94,
    details: {
      type: "checking",
      institution: "Arvest Bank",
      accountNumber: "******9375",
      owner: "Nick",
      beneficiary: "Kelsey",
    },
  },
  {
    id: "fa-1018",
    userId: nickUserId,
    name: "Coleman Law Firm Money Market",
    category: "financial_account",
    value: 5325.74,
    details: {
      type: "savings",
      institution: "Arvest Bank",
      accountNumber: "******0202",
      owner: "Nick",
      beneficiary: "Kelsey",
    },
  },
  {
    id: "fa-1019",
    userId: nickUserId,
    name: "LexMed Operating Account",
    category: "financial_account",
    value: 4463.11,
    details: {
      type: "checking",
      institution: "Arvest Bank",
      accountNumber: "******8100",
      owner: "Nick",
      beneficiary: "Kelsey",
    },
  },
  {
    id: "fa-1020",
    userId: nickUserId,
    name: "LexMed Money Market Account",
    category: "financial_account",
    value: 10012.47,
    details: {
      type: "savings",
      institution: "Arvest Bank",
      accountNumber: "******7994",
      owner: "Nick",
      beneficiary: "Kelsey",
    },
  },
  {
    id: "fa-1021",
    userId: nickUserId,
    name: "Coleman Law Firm Solo 401(k)",
    category: "financial_account",
    value: 194435.36,
    details: {
      type: "retirement_401k",
      institution: "Northwestern Mutual",
      accountNumber: "******1281",
      owner: "Nick",
      beneficiary: "Kelsey",
    },
  },
  {
    id: "fa-1022",
    userId: nickUserId,
    name: "SEP IRA",
    category: "financial_account",
    value: 55106.71,
    details: {
      type: "retirement_ira",
      institution: "Wells Fargo",
      accountNumber: "******6920",
      owner: "Nick",
      beneficiary: "Kelsey",
    },
  },
  {
    id: "fa-1023",
    userId: nickUserId,
    name: "Brokerage IRA",
    category: "financial_account",
    value: 270225.35,
    details: {
      type: "retirement_ira",
      institution: "Wells Fargo Advisors",
      accountNumber: "******6140",
      owner: "Nick",
      beneficiary: "Kelsey",
    },
  },
  {
    id: "fa-1024",
    userId: nickUserId,
    name: "Investments (Recently Inherited)",
    category: "financial_account",
    value: 954032.31,
    details: {
      type: "investment_brokerage",
      institution: "Wells Fargo",
      accountNumber: "******9884",
      owner: "Nick (Inherited)",
      beneficiary: "Kelsey",
    },
  },
  {
    id: "fa-1025",
    userId: nickUserId,
    name: "IRA (Inherited) + proceeds from home sale",
    category: "financial_account",
    value: 275326.34,
    details: {
      type: "retirement_ira",
      institution: "Wells Fargo",
      accountNumber: "******6625",
      owner: "Nick",
      beneficiary: "Kelsey",
    },
  },
  {
    id: "fa-1026",
    userId: nickUserId,
    name: "IRA (Inherited)",
    category: "financial_account",
    value: 57073.71,
    details: {
      type: "retirement_ira",
      institution: "Wells Fargo",
      accountNumber: "******0080",
      owner: "Nick",
      beneficiary: "Kelsey",
    },
  },
  {
    id: "fa-1027",
    userId: nickUserId,
    name: "Roth IRA",
    category: "financial_account",
    value: 36173.25,
    details: {
      type: "retirement_ira",
      institution: "Wells Fargo",
      accountNumber: "******9141",
      owner: "Nick",
      beneficiary: "Kelsey",
    },
  },
  {
    id: "fa-1028",
    userId: nickUserId,
    name: "IRA (Inherited)",
    category: "financial_account",
    value: 25000.81,
    details: {
      type: "retirement_ira",
      institution: "Wells Fargo",
      accountNumber: "******6702",
      owner: "Nick",
      beneficiary: "Kelsey",
    },
  },
  {
    id: "fa-1029",
    userId: nickUserId,
    name: "Brokerage Investment",
    category: "financial_account",
    value: 0.0,
    details: {
      type: "investment_brokerage",
      institution: "Wells Fargo",
      accountNumber: "******1022",
      owner: "Nick",
      beneficiary: "Kelsey",
    },
  },
  {
    id: "fa-1030",
    userId: nickUserId,
    name: "Business Brokerage",
    category: "financial_account",
    value: 1126866.58,
    details: {
      type: "investment_brokerage",
      institution: "Wells Fargo (Pollard-Geeslin)",
      accountNumber: "******3355",
      owner: "Nick/Kit",
      beneficiary: "Kelsey",
    },
  },
  {
    id: "fa-1031",
    userId: nickUserId,
    name: "Business Brokerage",
    category: "financial_account",
    value: 847489.86,
    details: {
      type: "investment_brokerage",
      institution: "Wells Fargo (Pollard-Geeslin)",
      accountNumber: "******2780",
      owner: "Nick/Kit",
      beneficiary: "Kelsey",
    },
  },

  // Real Estate
  {
    id: "re-2000",
    userId: nickUserId,
    name: "2211 NW Willow, Bentonville, AR",
    category: "real_estate",
    value: 746400.0,
    details: {
      propertyType: "single_family",
      address: "2211 NW Willow, Bentonville, AR 72712",
      mortgageBalance: 384189.16,
      ownershipType: "Mortgaged (Joint Tenancy)",
      owner: "Nick/Kelsey",
      beneficiary: "Kelsey",
    },
  },
  {
    id: "re-2001",
    userId: nickUserId,
    name: "3 Rio Vista Circle, Hardy, AR",
    category: "real_estate",
    value: 115100.0,
    details: {
      propertyType: "residential",
      address: "3 Rio Vista Circle, Hardy, AR 72542",
      mortgageBalance: 0,
      ownershipType: "Owned outright (Joint Tenancy)",
      owner: "Nick Coleman & Kit Coleman",
      beneficiary: "Kit",
      notes: "Joint ownership with Kit Coleman - needs succession planning",
    },
  },
  {
    id: "re-2002",
    userId: nickUserId,
    name: "Pemiscot Farmland (Geeslin Trust)",
    category: "real_estate",
    value: 1109000.0,
    details: {
      propertyType: "land",
      address: "Pemiscot Farmland",
      mortgageBalance: 0,
      ownershipType: "Owned outright (Joint Tenancy)",
      owner: "Nick Coleman & Kit Coleman",
      beneficiary: "Kit",
      notes: "Need to put in LLC, generates $60,000/year rental income",
    },
  },
  {
    id: "re-2003",
    userId: nickUserId,
    name: "Blytheville Lot",
    category: "real_estate",
    value: -50000.0,
    details: {
      propertyType: "land",
      address: "Blytheville Lot",
      mortgageBalance: 0,
      ownershipType: "Owned outright (Joint Tenancy)",
      owner: "Nick Coleman & Kit Coleman",
      beneficiary: "Kit",
    },
  },

  // Personal Property
  {
    id: "pp-3000",
    userId: nickUserId,
    name: "2021 BMW X5",
    category: "personal_property",
    value: 44157.0,
    details: { propertyType: "vehicle", year: 2021, owner: "Nick", beneficiary: "Kelsey" },
  },
  {
    id: "pp-3001",
    userId: kelseyUserId,
    name: "2025 Honda CRV",
    category: "personal_property",
    value: 40000.0,
    details: { propertyType: "vehicle", year: 2025, owner: "Kelsey", beneficiary: "Nick" },
  },
  {
    id: "pp-3002",
    userId: nickUserId,
    name: "Portrait",
    category: "personal_property",
    value: 0,
    details: { propertyType: "portrait", owner: "Kit", notes: "Include in hand written list" },
  },
  {
    id: "pp-3003",
    userId: nickUserId,
    name: "Family Heirlooms & Jewelry",
    category: "personal_property",
    value: 0,
    details: {
      propertyType: "family_heirloom",
      owner: "Kelsey/Nick",
      notes: "Include in hand written list",
    },
  },

  // Insurance Policies
  {
    id: "ip-life-4000",
    userId: nickUserId,
    name: "Northwestern Mutual Life Insurance",
    category: "insurance_policy",
    value: 3461.67,
    details: {
      policyType: "life",
      insurer: "Northwestern Mutual",
      policyNumber: "****3413",
      coverageAmount: 37395.0,
      owner: "Nick",
      beneficiary: "Kelsey",
    },
  },
  {
    id: "ip-dis-4500",
    userId: nickUserId,
    name: "Northwestern Mutual Disability Income",
    category: "insurance_policy",
    value: 0,
    details: {
      policyType: "disability",
      insurer: "Northwestern Mutual",
      policyNumber: "****4309",
      monthlyBenefit: 5201.0,
      annualPremium: 1152.65,
      owner: "Nick",
      notes: "Monthly Benefit: $5,201.00, Annual Premium: $1,152.65",
    },
  },

  // Business Interests
  {
    id: "bi-5000",
    userId: nickUserId,
    name: "Pollard-Geeslin Holding Company C-Corp",
    category: "business_interest",
    value: 0,
    details: {
      businessType: "corporation",
      businessName: "Pollard-Geeslin Holding Company C-Corp",
      owner: "Joint Shareholder Nick and Kit Coleman",
      notes: "Joint Shareholder with Kit Coleman.",
    },
  },
  {
    id: "bi-5001",
    userId: nickUserId,
    name: "Bubbas, Inc (Pemiscot Farm)",
    category: "business_interest",
    value: 750000.0,
    details: {
      businessType: "corporation",
      businessName: "Bubbas, Inc",
      owner: "Nick Coleman & Kit Coleman",
      percentageOwned: 50,
      notes:
        "Family corporation formed to hold Pemiscot Farmland for liability protection and estate planning benefits. Generates $60,000 annual rental income. EIN: #33-4111838",
    },
  },
  {
    id: "bi-5002",
    userId: kelseyUserId,
    name: "Willow Consulting LLC (Kelsey F. Brown Sole MBR)",
    category: "business_interest",
    value: 0,
    details: {
      businessType: "llc",
      businessName: "Willow Consulting LLC (Kelsey F. Brown Sole MBR)",
      owner: "Kelsey",
      percentageOwned: 100,
    },
  },
  {
    id: "bi-5003",
    userId: nickUserId,
    name: "Nicholas L. Coleman, Attorney at Law, PLLC",
    category: "business_interest",
    value: 0,
    details: {
      businessType: "llc",
      businessName: "Nicholas L. Coleman, Attorney at Law, PLLC",
      owner: "Nick",
      percentageOwned: 100,
    },
  },
  {
    id: "bi-5004",
    userId: nickUserId,
    name: "LexMed, LLC (Nicholas Coleman Sole MBR)",
    category: "business_interest",
    value: 0,
    details: {
      businessType: "llc",
      businessName: "LexMed, LLC (Nicholas Coleman Sole MBR)",
      owner: "Nick",
      percentageOwned: 100,
    },
  },

  // Digital Assets
  {
    id: "da-sm-6000",
    userId: nickUserId,
    name: "Facebook Account",
    category: "digital_asset",
    value: 0,
    details: { assetType: "social_media", accessInfo: "Facebook", owner: "Nick/Kelsey (Assumed)" },
  },
  {
    id: "da-sm-6001",
    userId: nickUserId,
    name: "Instagram Account",
    category: "digital_asset",
    value: 0,
    details: { assetType: "social_media", accessInfo: "Instagram", owner: "Nick/Kelsey (Assumed)" },
  },
  {
    id: "da-sm-6002",
    userId: nickUserId,
    name: "Reddit Account",
    category: "digital_asset",
    value: 0,
    details: { assetType: "social_media", accessInfo: "Reddit", owner: "Nick/Kelsey (Assumed)" },
  },
  {
    id: "da-sm-6003",
    userId: nickUserId,
    name: "Linkedin Account",
    category: "digital_asset",
    value: 0,
    details: { assetType: "social_media", accessInfo: "Linkedin", owner: "Nick/Kelsey (Assumed)" },
  },
  {
    id: "da-sm-6004",
    userId: nickUserId,
    name: "Marco Polo Account",
    category: "digital_asset",
    value: 0,
    details: {
      assetType: "social_media",
      accessInfo: "Marco Polo",
      owner: "Nick/Kelsey (Assumed)",
    },
  },
  {
    id: "da-sm-6005",
    userId: nickUserId,
    name: "Pinterest Account",
    category: "digital_asset",
    value: 0,
    details: { assetType: "social_media", accessInfo: "Pinterest", owner: "Nick/Kelsey (Assumed)" },
  },
];

// Prepare insert statement
const insertAsset = db.prepare(`
  INSERT INTO assets (
    asset_id, user_id, name, category, value, 
    ownership_type, ownership_details, asset_details, 
    notes, is_active, last_updated
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, datetime('now'))
`);

// Insert all assets
const insertAll = db.transaction(() => {
  let successCount = 0;
  let errorCount = 0;

  assets.forEach((asset) => {
    try {
      const categoryId = getAssetCategoryId(asset.category);
      if (!categoryId) {
        console.error(`Could not find category ID for: ${asset.category}`);
        errorCount++;
        return;
      }

      // Determine ownership type
      let ownershipType = "individual";
      if (asset.details.owner?.includes("Joint")) {
        ownershipType = "joint";
      } else if (asset.details.owner?.includes("Trust")) {
        ownershipType = "trust";
      } else if (asset.category === "business_interest") {
        ownershipType = "business";
      }

      // Prepare ownership details
      const ownershipDetails = {
        owner: asset.details.owner,
        beneficiary: asset.details.beneficiary,
        percentageOwned: asset.details.percentageOwned,
      };

      // Prepare asset details
      const assetDetails = { ...asset.details };
      delete assetDetails.owner;
      delete assetDetails.beneficiary;

      insertAsset.run(
        asset.id,
        asset.userId,
        asset.name,
        asset.category.toUpperCase().replace("_", "_"),
        asset.value,
        ownershipType,
        JSON.stringify(ownershipDetails),
        JSON.stringify(assetDetails),
        asset.details.notes || null,
      );

      successCount++;
    } catch (error) {
      console.error(`Error inserting asset ${asset.id}: ${error.message}`);
      errorCount++;
    }
  });

  console.log(`\nMigration completed!`);
  console.log(`✅ Successfully inserted: ${successCount} assets`);
  if (errorCount > 0) {
    console.log(`❌ Failed to insert: ${errorCount} assets`);
  }
  console.log(
    `Total assets in database: ${db.prepare("SELECT COUNT(*) as count FROM assets").get().count}`,
  );
});

// Execute the transaction
insertAll();

// Close the database
db.close();

console.log("\nExcel data migration completed!");
