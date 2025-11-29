#!/usr/bin/env node

/**
 * Script to add missing 'type' field to assets
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

console.log("Adding missing type fields to assets...\n");

try {
  // Get all assets
  const assetsStmt = db.prepare(`
    SELECT asset_id, category, asset_details 
    FROM assets 
    WHERE is_active = 1
  `);

  const assets = assetsStmt.all();
  let updatedCount = 0;

  for (const asset of assets) {
    try {
      let details = {};
      if (asset.asset_details) {
        details = JSON.parse(asset.asset_details);
      }

      // Check if type field is missing
      if (!details.type) {
        let updated = false;

        // Determine the type based on category and existing data
        switch (asset.category) {
          case "BUSINESS_INTEREST":
            // Use businessType if available, otherwise C_CORP
            details.type = details.businessType || "C_CORP";
            updated = true;
            break;

          case "REAL_ESTATE":
            details.type = "SINGLE_FAMILY"; // Default for real estate
            updated = true;
            break;

          case "FINANCIAL_ACCOUNT":
            // Try to determine from name or description
            if (details.accountType) {
              details.type = details.accountType.toUpperCase();
            } else {
              details.type = "OTHER";
            }
            updated = true;
            break;

          case "INSURANCE_POLICY":
            details.type = "LIFE"; // Default for insurance
            updated = true;
            break;

          case "PERSONAL_PROPERTY":
            details.type = "OTHER";
            updated = true;
            break;

          case "DIGITAL_ASSET":
            details.type = "CRYPTOCURRENCY"; // Default for digital assets
            updated = true;
            break;

          default:
            details.type = "OTHER";
            updated = true;
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
          console.log(
            `✅ Added type '${details.type}' to asset ${asset.asset_id} (${asset.category})`,
          );
        }
      }
    } catch (e) {
      console.error(`Failed to update asset ${asset.asset_id}:`, e.message);
    }
  }

  console.log(`\n✅ Updated ${updatedCount} assets with missing types`);

  // Verify bi-5001 specifically
  const bi5001Stmt = db.prepare(`
    SELECT asset_id, category, asset_details 
    FROM assets 
    WHERE asset_id = 'bi-5001'
  `);

  const bi5001 = bi5001Stmt.get();
  if (bi5001) {
    const details = JSON.parse(bi5001.asset_details);
    console.log(`\nAsset bi-5001 now has type: ${details.type}`);
  }
} catch (error) {
  console.error("❌ Error adding missing types:", error);
} finally {
  db.close();
}
