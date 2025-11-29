#!/usr/bin/env node

// Comprehensive project initialization script for EstateEase MVP
// This script handles all initialization tasks including migrations, directory setup, and service configuration

import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import process from "process";

// Set up path resolution for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

// Database file location
const dbPath = path.join(projectRoot, "data", "estateease.db");

// Color codes for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message, type = "info") {
  const types = {
    info: `${colors.blue}ℹ${colors.reset}`,
    success: `${colors.green}✅${colors.reset}`,
    warning: `${colors.yellow}⚠️${colors.reset}`,
    error: `${colors.red}❌${colors.reset}`,
    step: `${colors.cyan}🚀${colors.reset}`,
  };
  console.log(`${types[type]} ${message}`);
}

async function ensureDirectories() {
  log("Setting up directory structure...", "step");

  const directories = [
    "data",
    "data/documents",
    "data/documents/uploads",
    "data/backups",
    "public/uploads",
    "logs",
    "temp",
  ];

  for (const dir of directories) {
    const fullPath = path.join(projectRoot, dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      log(`Created directory: ${dir}`, "success");
    } else {
      log(`Directory exists: ${dir}`, "info");
    }
  }
}

async function runDatabaseMigrations(db) {
  log("Running database migrations...", "step");

  // Create migrations tracking table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      migration_name TEXT NOT NULL UNIQUE,
      applied_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Get list of migration files
  const migrationsDir = path.join(projectRoot, "app/db/data-migrations");
  const migrationFiles = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const migrationFile of migrationFiles) {
    // Check if migration has been applied
    const migrationName = migrationFile.replace(".sql", "");
    const applied = db
      .prepare("SELECT 1 FROM schema_migrations WHERE migration_name = ?")
      .get(migrationName);

    if (applied) {
      log(`Migration already applied: ${migrationName}`, "info");
      continue;
    }

    // Read and execute migration
    const migrationPath = path.join(migrationsDir, migrationFile);
    const migrationSQL = fs.readFileSync(migrationPath, "utf-8");

    try {
      log(`Applying migration: ${migrationName}`, "info");

      db.transaction(() => {
        // Split migration by statements and execute each
        const statements = migrationSQL
          .split(";")
          .map((stmt) => stmt.trim())
          .filter((stmt) => stmt.length > 0 && !stmt.startsWith("--"));

        for (const statement of statements) {
          if (statement.trim()) {
            try {
              db.exec(statement + ";");
            } catch (stmtError) {
              // Log error but continue with other statements
              if (statement.toUpperCase().startsWith("INSERT")) {
                log(
                  `Warning: Insert statement failed (may be duplicate): ${stmtError.message}`,
                  "warning",
                );
              } else {
                throw stmtError; // Re-throw for CREATE/ALTER statements
              }
            }
          }
        }

        // Record migration as applied
        db.prepare("INSERT INTO schema_migrations (migration_name) VALUES (?)").run(migrationName);
      })();

      log(`Migration completed: ${migrationName}`, "success");
    } catch (error) {
      log(`Migration failed: ${migrationName} - ${error.message}`, "error");
      throw error;
    }
  }
}

async function createEnvFile() {
  log("Setting up environment configuration...", "step");

  const envPath = path.join(projectRoot, ".env");
  const envExamplePath = path.join(projectRoot, ".env.example");

  // Create .env.example if it doesn't exist
  if (!fs.existsSync(envExamplePath)) {
    const envExample = `# EstateEase Environment Configuration

# Database
DATABASE_URL=file:./data/estateease.db

# Session Secret (generate a secure random string for production)
SESSION_SECRET=your-secret-key-here

# Application
NODE_ENV=development
PORT=3000

# File Upload
UPLOAD_DIR=./data/documents/uploads
MAX_FILE_SIZE=10485760

# Authentication (for future implementation)
JWT_SECRET=your-jwt-secret-here
JWT_EXPIRES_IN=7d

# Email (for future implementation)
EMAIL_FROM=noreply@estateease.com
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=

# Storage (for future implementation)
STORAGE_TYPE=local
# For S3: STORAGE_TYPE=s3
# AWS_ACCESS_KEY_ID=
# AWS_SECRET_ACCESS_KEY=
# AWS_REGION=
# AWS_BUCKET_NAME=
`;

    fs.writeFileSync(envExamplePath, envExample);
    log("Created .env.example file", "success");
  }

  // Create .env if it doesn't exist
  if (!fs.existsSync(envPath)) {
    // Generate a simple session secret for development
    const sessionSecret = "dev-" + Math.random().toString(36).substring(2, 15);

    const envContent = `# EstateEase Environment Configuration

# Database
DATABASE_URL=file:./data/estateease.db

# Session Secret
SESSION_SECRET=${sessionSecret}

# Application
NODE_ENV=development
PORT=3000

# File Upload
UPLOAD_DIR=./data/documents/uploads
MAX_FILE_SIZE=10485760
`;

    fs.writeFileSync(envPath, envContent);
    log("Created .env file with development defaults", "success");
  } else {
    log(".env file already exists", "info");
  }
}

async function createGitIgnore() {
  log("Setting up Git configuration...", "step");

  const gitignorePath = path.join(projectRoot, ".gitignore");

  if (!fs.existsSync(gitignorePath)) {
    const gitignoreContent = `# Dependencies
node_modules/
.pnp
.pnp.js

# Production
build/
dist/

# Environment
.env
.env.local
.env.*.local

# Database
data/*.db
data/*.db-shm
data/*.db-wal
data/backups/

# Uploads
data/documents/uploads/
public/uploads/

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store

# Testing
coverage/
.nyc_output/

# Temporary files
temp/
tmp/

# Remix
.cache/
`;

    fs.writeFileSync(gitignorePath, gitignoreContent);
    log("Created .gitignore file", "success");
  } else {
    log(".gitignore file already exists", "info");
  }
}

async function verifySetup(db) {
  log("Verifying project setup...", "step");

  try {
    // Check database tables
    const tables = db
      .prepare(
        `
      SELECT name FROM sqlite_master 
      WHERE type='table' 
      ORDER BY name
    `,
      )
      .all();

    log(`Database tables: ${tables.length}`, "info");

    // Check record counts
    const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get();
    const trustCount = db.prepare("SELECT COUNT(*) as count FROM trusts").get();
    const assetCount = db.prepare("SELECT COUNT(*) as count FROM assets").get();
    const willCount = db.prepare("SELECT COUNT(*) as count FROM wills").get();
    const poaCount = db.prepare("SELECT COUNT(*) as count FROM powers_of_attorney").get();

    log("Database Summary:", "info");
    log(`  Users: ${userCount.count}`, "info");
    log(`  Trusts: ${trustCount.count}`, "info");
    log(`  Assets: ${assetCount.count}`, "info");
    log(`  Wills: ${willCount.count}`, "info");
    log(`  Powers of Attorney: ${poaCount.count}`, "info");

    // Check if migrations were applied
    const migrations = db
      .prepare("SELECT migration_name FROM schema_migrations ORDER BY applied_at")
      .all();
    log(`Applied migrations: ${migrations.length}`, "info");
    migrations.forEach((m) => log(`  - ${m.migration_name}`, "info"));

    return true;
  } catch (error) {
    log(`Verification error: ${error.message}`, "error");
    return false;
  }
}

async function initializeProject() {
  console.log(`${colors.bright}${colors.cyan}
╔══════════════════════════════════════════╗
║     EstateEase Project Initialization    ║
╚══════════════════════════════════════════╝
${colors.reset}`);

  let db;

  try {
    // 1. Ensure directories exist
    await ensureDirectories();

    // 2. Create environment files
    await createEnvFile();

    // 3. Create .gitignore
    await createGitIgnore();

    // 4. Initialize database if needed
    log("Initializing database...", "step");

    if (!fs.existsSync(dbPath)) {
      log("Database not found, running db:init...", "warning");
      const { execSync } = await import("child_process");
      execSync("npm run db:init", { stdio: "inherit" });
    }

    // 5. Connect to database
    db = new Database(dbPath);
    db.pragma("foreign_keys = ON");
    db.pragma("journal_mode = WAL");
    log("Database connected", "success");

    // 6. Run migrations
    await runDatabaseMigrations(db);

    // 7. Verify setup
    const isValid = await verifySetup(db);

    if (isValid) {
      console.log(`\n${colors.bright}${colors.green}
╔══════════════════════════════════════════╗
║        Initialization Complete! 🎉       ║
╚══════════════════════════════════════════╝
${colors.reset}`);

      console.log("\nNext steps:");
      console.log("1. Review and update .env file with your settings");
      console.log("2. Run: npm run dev");
      console.log("3. Open: http://localhost:3000");
      console.log("\nFor MVP development, focus on:");
      console.log("- Fixing TypeScript errors");
      console.log("- Adding authentication");
      console.log("- Implementing document upload");
      console.log("- Creating basic reports");
    } else {
      throw new Error("Setup verification failed");
    }
  } catch (error) {
    log(`Initialization failed: ${error.message}`, "error");
    console.error(error.stack);
    process.exit(1);
  } finally {
    if (db) {
      db.close();
    }
  }
}

// Run the initialization
initializeProject();
