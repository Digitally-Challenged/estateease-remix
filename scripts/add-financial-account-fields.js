#!/usr/bin/env node
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database path
const dbPath = join(__dirname, '../data/estateease.db');

console.log('Adding financial account fields to assets table...');

try {
  const db = new Database(dbPath);
  
  // Add new columns to assets table
  const alterTableStatements = [
    `ALTER TABLE assets ADD COLUMN institution_name TEXT`,
    `ALTER TABLE assets ADD COLUMN account_number TEXT`,
    `ALTER TABLE assets ADD COLUMN routing_number TEXT`,
    `ALTER TABLE assets ADD COLUMN account_type TEXT`
  ];
  
  // Execute each ALTER TABLE statement
  for (const statement of alterTableStatements) {
    try {
      db.prepare(statement).run();
      console.log(`✓ Executed: ${statement}`);
    } catch (error) {
      if (error.message.includes('duplicate column name')) {
        console.log(`⚠ Column already exists, skipping: ${statement}`);
      } else {
        throw error;
      }
    }
  }
  
  // Update existing financial accounts with sample data (optional)
  const updateExistingAccounts = db.prepare(`
    UPDATE assets 
    SET institution_name = 'Bank of America',
        account_type = 'CHECKING'
    WHERE category = 'FINANCIAL_ACCOUNT' 
    AND institution_name IS NULL
    AND name LIKE '%Checking%'
  `);
  
  const changesChecking = updateExistingAccounts.run();
  console.log(`✓ Updated ${changesChecking.changes} checking accounts with default institution`);
  
  const updateSavingsAccounts = db.prepare(`
    UPDATE assets 
    SET institution_name = 'Wells Fargo',
        account_type = 'SAVINGS'
    WHERE category = 'FINANCIAL_ACCOUNT' 
    AND institution_name IS NULL
    AND name LIKE '%Savings%'
  `);
  
  const changesSavings = updateSavingsAccounts.run();
  console.log(`✓ Updated ${changesSavings.changes} savings accounts with default institution`);
  
  console.log('\n✓ Assets table structure updated successfully!');
  console.log('\nNew columns added:');
  console.log('  - institution_name TEXT');
  console.log('  - account_number TEXT');
  console.log('  - routing_number TEXT');
  console.log('  - account_type TEXT');
  
  db.close();
  
} catch (error) {
  console.error('Error updating database:', error.message);
  // eslint-disable-next-line no-undef
  process.exit(1);
}

console.log('\n✅ Migration completed successfully!');