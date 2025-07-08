#!/usr/bin/env node

/**
 * Script to fix asset categories in the database
 * Converts lowercase categories to uppercase to match enum values
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

console.log('Fixing asset categories to match uppercase enum values...\n');

// Define the mapping from lowercase to uppercase
const categoryMapping = {
  'real_estate': 'REAL_ESTATE',
  'financial_account': 'FINANCIAL_ACCOUNT', 
  'insurance_policy': 'INSURANCE_POLICY',
  'business_interest': 'BUSINESS_INTEREST',
  'personal_property': 'PERSONAL_PROPERTY',
  'vehicle': 'VEHICLE',
  'debt': 'DEBT',
  'other': 'OTHER',
  'digital_asset': 'DIGITAL_ASSET' // In case this exists
};

// Also fix ownership types
const ownershipMapping = {
  'individual': 'INDIVIDUAL',
  'joint': 'JOINT',
  'trust': 'TRUST',
  'business': 'BUSINESS'
};

try {
  // Fix asset categories
  for (const [oldValue, newValue] of Object.entries(categoryMapping)) {
    const updateStmt = db.prepare(`
      UPDATE assets 
      SET category = ?,
          updated_at = datetime('now')
      WHERE category = ?
    `);
    
    const result = updateStmt.run(newValue, oldValue);
    if (result.changes > 0) {
      console.log(`✅ Updated ${result.changes} assets from '${oldValue}' to '${newValue}'`);
    }
  }
  
  // Fix ownership types
  for (const [oldValue, newValue] of Object.entries(ownershipMapping)) {
    const updateStmt = db.prepare(`
      UPDATE assets 
      SET ownership_type = ?,
          updated_at = datetime('now')
      WHERE ownership_type = ?
    `);
    
    const result = updateStmt.run(newValue, oldValue);
    if (result.changes > 0) {
      console.log(`✅ Updated ${result.changes} ownership types from '${oldValue}' to '${newValue}'`);
    }
  }
  
  // Also update the ownership_details JSON to use uppercase values
  const assetsStmt = db.prepare(`
    SELECT asset_id, ownership_details 
    FROM assets 
    WHERE ownership_details IS NOT NULL
  `);
  
  const assets = assetsStmt.all();
  let jsonUpdates = 0;
  
  for (const asset of assets) {
    try {
      const details = JSON.parse(asset.ownership_details);
      let updated = false;
      
      // Update ownership type in JSON if present
      if (details.type && ownershipMapping[details.type.toLowerCase()]) {
        details.type = ownershipMapping[details.type.toLowerCase()];
        updated = true;
      }
      
      if (updated) {
        const updateStmt = db.prepare(`
          UPDATE assets 
          SET ownership_details = ?,
              updated_at = datetime('now')
          WHERE asset_id = ?
        `);
        updateStmt.run(JSON.stringify(details), asset.asset_id);
        jsonUpdates++;
      }
    } catch (e) {
      console.error(`Failed to update JSON for asset ${asset.asset_id}:`, e.message);
    }
  }
  
  if (jsonUpdates > 0) {
    console.log(`✅ Updated ownership details JSON for ${jsonUpdates} assets`);
  }
  
  // Show current category distribution
  console.log('\nCurrent asset category distribution:');
  const categoriesStmt = db.prepare(`
    SELECT category, COUNT(*) as count 
    FROM assets 
    WHERE is_active = 1
    GROUP BY category
    ORDER BY count DESC
  `);
  
  const categories = categoriesStmt.all();
  categories.forEach(cat => {
    console.log(`  ${cat.category}: ${cat.count} assets`);
  });
  
  console.log('\n✅ Asset categories have been fixed!');

} catch (error) {
  console.error('❌ Error fixing asset categories:', error);
  // eslint-disable-next-line no-undef
  process.exit(1);
} finally {
  db.close();
} 