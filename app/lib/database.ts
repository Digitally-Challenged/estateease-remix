import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// Get the current file path and derive the project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../../");

// Database file location
const dbPath = path.join(projectRoot, "data", "estateease.db");

// Ensure data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize database connection
let db: Database.Database;

function initDatabase() {
  try {
    db = new Database(dbPath);

    // Enable foreign keys
    db.pragma("foreign_keys = ON");

    // Set performance optimizations
    db.pragma("journal_mode = WAL");
    db.pragma("synchronous = NORMAL");
    db.pragma("cache_size = 1000");

    return db;
  } catch (error) {
    console.error("Failed to connect to database:", error);
    throw error;
  }
}

// Get database instance (singleton pattern)
export function getDatabase(): Database.Database {
  if (!db) {
    db = initDatabase();
  }
  return db;
}

// Close database connection
export function closeDatabase() {
  if (db) {
    db.close();
  }
}

// Database initialization script
export function initializeTables() {
  const db = getDatabase();

  try {
    // Read and execute the SQLite schema
    const schemaPath = path.join(__dirname, "../db/schema/sqlite-schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf-8");

    // Split the schema by statements and execute each one
    const statements = schema
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0 && !stmt.startsWith("--"));

    db.transaction(() => {
      for (const statement of statements) {
        if (statement.trim()) {
          db.exec(statement + ";");
        }
      }
    })();
  } catch (error) {
    console.error("Failed to initialize tables:", error);
    throw error;
  }
}

// Seed database with initial data
export function seedDatabase() {
  const db = getDatabase();

  try {
    // Read and execute the seed data
    const seedPath = path.join(__dirname, "../db/data-migrations/sqlite-seed-data.sql");
    const seedData = fs.readFileSync(seedPath, "utf-8");

    // Split and execute seed statements
    const statements = seedData
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0 && !stmt.startsWith("--"));

    db.transaction(() => {
      for (const statement of statements) {
        if (statement.trim()) {
          db.exec(statement + ";");
        }
      }
    })();
  } catch (error) {
    console.error("Failed to seed database:", error);
    throw error;
  }
}

// Check if database needs initialization
export function checkAndInitializeDatabase() {
  const db = getDatabase();

  try {
    // Check if tables exist by querying for one of the main tables
    const result = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")
      .get();

    if (!result) {
      initializeTables();
      seedDatabase();
    } else {
      // Database already initialized
    }
  } catch (error) {
    console.error("Error checking database state:", error);
    throw error;
  }
}

// Export the database instance for direct use
export default getDatabase;
