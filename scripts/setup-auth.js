#!/usr/bin/env node

// Authentication setup script for EstateEase
// This script creates the necessary tables and configuration for basic authentication

import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
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

async function setupAuthentication() {
  let db;

  try {
    log("Setting up authentication...", "step");

    // Connect to database
    db = new Database(dbPath);
    db.pragma("foreign_keys = ON");

    // Add authentication columns to users table
    log("Adding authentication columns to users table...", "info");

    // Check if columns already exist
    const columns = db.prepare("PRAGMA table_info(users)").all();
    const hasPasswordHash = columns.some((col) => col.name === "password_hash");
    const hasLastLogin = columns.some((col) => col.name === "last_login");

    if (!hasPasswordHash) {
      db.exec(`
        ALTER TABLE users ADD COLUMN password_hash TEXT;
        ALTER TABLE users ADD COLUMN last_login DATETIME;
        ALTER TABLE users ADD COLUMN login_count INTEGER DEFAULT 0;
        ALTER TABLE users ADD COLUMN password_reset_token TEXT;
        ALTER TABLE users ADD COLUMN password_reset_expires DATETIME;
        ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT 0;
        ALTER TABLE users ADD COLUMN email_verification_token TEXT;
      `);
      log("Authentication columns added", "success");
    } else {
      log("Authentication columns already exist", "info");
    }

    // Create sessions table
    log("Creating sessions table...", "info");

    db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        expires_at DATETIME NOT NULL,
        data TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
      
      CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
    `);

    log("Sessions table created", "success");

    // Create auth configuration file
    log("Creating authentication configuration...", "info");

    const authConfigPath = path.join(projectRoot, "app/config/auth.config.js");
    const authConfigDir = path.dirname(authConfigPath);

    if (!fs.existsSync(authConfigDir)) {
      fs.mkdirSync(authConfigDir, { recursive: true });
    }

    const authConfig = `// Authentication configuration for EstateEase

export const authConfig = {
  // Session configuration
  session: {
    secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    cookieName: 'estateease_session',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    httpOnly: true,
  },
  
  // Password requirements
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false,
  },
  
  // Token expiration
  tokens: {
    passwordResetExpiry: 60 * 60 * 1000, // 1 hour
    emailVerificationExpiry: 24 * 60 * 60 * 1000, // 24 hours
  },
  
  // Rate limiting
  rateLimit: {
    login: {
      maxAttempts: 5,
      windowMs: 15 * 60 * 1000, // 15 minutes
    },
    passwordReset: {
      maxAttempts: 3,
      windowMs: 60 * 60 * 1000, // 1 hour
    },
  },
};

export default authConfig;
`;

    fs.writeFileSync(authConfigPath, authConfig);
    log("Authentication configuration created", "success");

    // Add sample passwords to existing users (for development only!)
    if (process.env.NODE_ENV !== "production") {
      log("Setting up development passwords for existing users...", "warning");

      const defaultPassword = "password123";
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);

      const updateStmt = db.prepare(`
        UPDATE users 
        SET password_hash = ?, email_verified = 1 
        WHERE password_hash IS NULL
      `);

      const result = updateStmt.run(hashedPassword);

      if (result.changes > 0) {
        log(`Updated ${result.changes} users with default password: ${defaultPassword}`, "warning");
        log("⚠️  IMPORTANT: Change these passwords immediately!", "warning");
      }
    }

    // Verify setup
    const userWithAuth = db
      .prepare(
        `
      SELECT COUNT(*) as count 
      FROM users 
      WHERE password_hash IS NOT NULL
    `,
      )
      .get();

    log(`Users with authentication: ${userWithAuth.count}`, "info");

    console.log(`\n${colors.bright}${colors.green}
╔══════════════════════════════════════════╗
║    Authentication Setup Complete! 🔐     ║
╚══════════════════════════════════════════╝
${colors.reset}`);

    console.log("\nNext steps:");
    console.log("1. Implement login/logout routes in app/routes");
    console.log("2. Add authentication middleware");
    console.log("3. Protect routes that require authentication");
    console.log("4. Implement password reset flow");
    console.log("5. Add proper session management");

    if (process.env.NODE_ENV !== "production") {
      console.log(`\n${colors.yellow}Development users can login with:`);
      console.log(`Email: [any existing email]`);
      console.log(`Password: password123${colors.reset}`);
    }
  } catch (error) {
    log(`Authentication setup failed: ${error.message}`, "error");
    console.error(error.stack);
    process.exit(1);
  } finally {
    if (db) {
      db.close();
    }
  }
}

// Run the setup
setupAuthentication();
