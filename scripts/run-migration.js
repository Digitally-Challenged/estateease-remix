#!/usr/bin/env node

// Script to run the business entity fields migration
// Run with: node scripts/run-migration.js

import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Set up path resolution for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

// Database file location
const dbPath = path.join(projectRoot, "data", "estateease.db");

async function runMigration() {
  let db;

  try {
    console.log("🚀 Running business entity fields migration...");

    // Check if database exists
    if (!fs.existsSync(dbPath)) {
      throw new Error("Database not found. Please run npm run db:init first.");
    }

    // Initialize database connection
    db = new Database(dbPath);

    // Enable foreign keys
    db.pragma("foreign_keys = ON");

    console.log("✅ Database connected successfully");

    // Check if migration has already been applied
    const checkColumn = db
      .prepare(
        `
      SELECT COUNT(*) as count 
      FROM pragma_table_info('assets') 
      WHERE name = 'incorporation_type'
    `,
      )
      .get();

    if (checkColumn.count > 0) {
      console.log("⚠️  Migration already applied - skipping");
      return;
    }

    // Read migration file
    const migrationPath = path.join(
      projectRoot,
      "app/db/data-migrations/003-add-business-entity-fields.sql",
    );
    console.log(`📋 Reading migration from: ${migrationPath}`);

    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Migration file not found: ${migrationPath}`);
    }

    const migrationSQL = fs.readFileSync(migrationPath, "utf-8");

    // Execute migration in a transaction
    console.log("📋 Executing migration...");

    db.transaction(() => {
      // Split migration by statements and execute each
      const statements = migrationSQL
        .split(";")
        .map((stmt) => stmt.trim())
        .filter((stmt) => stmt.length > 0 && !stmt.startsWith("--"));

      for (const statement of statements) {
        if (statement.trim()) {
          db.exec(statement + ";");
        }
      }
    })();

    console.log("✅ Migration completed successfully");

    // Verify the columns were added
    const verifyIncType = db
      .prepare(
        `
      SELECT COUNT(*) as count 
      FROM pragma_table_info('assets') 
      WHERE name = 'incorporation_type'
    `,
      )
      .get();

    const verifyState = db
      .prepare(
        `
      SELECT COUNT(*) as count 
      FROM pragma_table_info('assets') 
      WHERE name = 'state_of_incorporation'
    `,
      )
      .get();

    const verifyEIN = db
      .prepare(
        `
      SELECT COUNT(*) as count 
      FROM pragma_table_info('assets') 
      WHERE name = 'ein'
    `,
      )
      .get();

    console.log("📊 Verification:");
    console.log(`   incorporation_type column: ${verifyIncType.count > 0 ? "✅" : "❌"}`);
    console.log(`   state_of_incorporation column: ${verifyState.count > 0 ? "✅" : "❌"}`);
    console.log(`   ein column: ${verifyEIN.count > 0 ? "✅" : "❌"}`);

    console.log("");
    console.log("🎉 Business entity fields migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    // eslint-disable-next-line no-undef
    process.exit(1);
  } finally {
    if (db) {
      db.close();
    }
  }
}

// Run the migration
runMigration();
