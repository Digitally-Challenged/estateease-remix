#!/usr/bin/env node

// Database initialization script for EstateEase
// This script creates the SQLite database and seeds it with initial data

import { fileURLToPath } from "url";
import path from "path";
import process from "process";

// Set up path resolution for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

// Add the project root to the module path so we can import from app/
process.env.NODE_PATH = path.join(projectRoot, "app");

// Dynamic import of database functions
async function initializeDatabase() {
  try {
    console.log("🚀 Starting database initialization...");

    // Import database functions
    const { checkAndInitializeDatabase } = await import("../app/lib/database.ts");

    // Initialize database
    await checkAndInitializeDatabase();

    console.log("✅ Database initialization completed successfully!");
    console.log("📊 You can now start the Remix development server with: npm run dev");
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    process.exit(1);
  }
}

// Run the initialization
initializeDatabase();
