#!/usr/bin/env node

/**
 * Script to fix asset types in the database
 * Converts asset types to uppercase to match enum values
 */

import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database path
const dbPath = path.join(__dirname, "../data/estateease.db");
const db = new Database(dbPath);

console.log("Fixing asset types in asset_details JSON...\n");

// Type mappings per category
const typeMappings = {
  REAL_ESTATE: {
    single_family: "SINGLE_FAMILY",
    condo: "CONDO",
    townhouse: "TOWNHOUSE",
    multi_family: "MULTI_FAMILY",
    commercial: "COMMERCIAL",
    land: "LAND",
    residential: "RESIDENTIAL",
    other: "OTHER",
  },
  FINANCIAL_ACCOUNT: {
    checking: "CHECKING",
    savings: "SAVINGS",
    money_market: "MONEY_MARKET",
    cd: "CD",
    investment_brokerage: "INVESTMENT_BROKERAGE",
    retirement_401k: "RETIREMENT_401K",
    retirement_ira: "RETIREMENT_IRA",
    retirement_roth_ira: "RETIREMENT_ROTH_IRA",
    crypto: "CRYPTO",
    other: "OTHER",
  },
  INSURANCE_POLICY: {
    life: "LIFE",
    disability: "DISABILITY",
    health: "HEALTH",
    long_term_care: "LONG_TERM_CARE",
    homeowners: "HOMEOWNERS",
    auto: "AUTO",
    umbrella: "UMBRELLA",
    business: "BUSINESS",
    other: "OTHER",
  },
  BUSINESS_INTEREST: {
    sole_proprietorship: "SOLE_PROPRIETORSHIP",
    partnership: "PARTNERSHIP",
    llc: "LLC",
    s_corp: "S_CORP",
    c_corp: "C_CORP",
    corporation: "C_CORP", // Map generic corporation to C_CORP
    non_profit: "NON_PROFIT",
    other: "OTHER",
  },
  PERSONAL_PROPERTY: {
    antiques: "ANTIQUES",
    art: "ART",
    collectibles: "COLLECTIBLES",
    electronics: "ELECTRONICS",
    furniture: "FURNITURE",
    jewelry: "JEWELRY",
    other: "OTHER",
  },
};

try {
  // Get all assets with asset_details
  const assetsStmt = db.prepare(`
    SELECT asset_id, category, asset_details 
    FROM assets 
    WHERE asset_details IS NOT NULL AND is_active = 1
  `);

  const assets = assetsStmt.all();
  let updatedCount = 0;

  for (const asset of assets) {
    try {
      const details = JSON.parse(asset.asset_details);
      let updated = false;

      // Get the appropriate mapping for this category
      const categoryMappings = typeMappings[asset.category];

      if (categoryMappings && details.type) {
        const lowerType = details.type.toLowerCase();

        // Check if we need to update the type
        if (categoryMappings[lowerType]) {
          details.type = categoryMappings[lowerType];
          updated = true;
        } else if (!Object.values(categoryMappings).includes(details.type)) {
          // If the current type isn't in the valid values, set to OTHER
          console.log(
            `  ⚠️  Asset ${asset.asset_id}: Unknown type '${details.type}' for category ${asset.category}, setting to OTHER`,
          );
          details.type = "OTHER";
          updated = true;
        }
      }

      // Also check for businessType field (used in some business assets)
      if (asset.category === "BUSINESS_INTEREST" && details.businessType) {
        const lowerBusinessType = details.businessType.toLowerCase();
        if (typeMappings.BUSINESS_INTEREST[lowerBusinessType]) {
          details.businessType = typeMappings.BUSINESS_INTEREST[lowerBusinessType];
          updated = true;
        }
      }

      if (updated) {
        const updateStmt = db.prepare(`
          UPDATE assets 
          SET asset_details = ?,
              updated_at = datetime('now')
          WHERE asset_id = ?
        `);
        updateStmt.run(JSON.stringify(details), asset.asset_id);
        updatedCount++;
        console.log(`✅ Updated asset ${asset.asset_id} (${asset.category})`);
      }
    } catch (e) {
      console.error(`Failed to update asset ${asset.asset_id}:`, e.message);
    }
  }

  console.log(`\n✅ Updated ${updatedCount} assets with corrected types`);

  // Show sample of current asset types by category
  console.log("\nSample asset types by category:");
  const sampleStmt = db.prepare(`
    SELECT category, asset_details, COUNT(*) as count
    FROM assets 
    WHERE is_active = 1 AND asset_details IS NOT NULL
    GROUP BY category
    LIMIT 10
  `);

  const samples = sampleStmt.all();
  samples.forEach((sample) => {
    try {
      const details = JSON.parse(sample.asset_details);
      console.log(`  ${sample.category}: type = ${details.type || "N/A"}`);
    } catch (e) {
      console.log(`  ${sample.category}: (invalid JSON)`);
    }
  });
} catch (error) {
  console.error("❌ Error fixing asset types:", error);
} finally {
  db.close();
}
