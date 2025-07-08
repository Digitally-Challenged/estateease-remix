#!/usr/bin/env node

/**
 * Script to add documents tables to the existing database
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import process from 'process';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database path
const dbPath = path.join(__dirname, '../data/estateease.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

console.log('Adding documents tables to database...\n');

try {
  // Create documents table
  db.exec(`
    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      document_id TEXT NOT NULL UNIQUE,
      user_id INTEGER NOT NULL,
      
      -- Document info
      name TEXT NOT NULL,
      original_filename TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      file_type TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      
      -- Categorization
      category TEXT NOT NULL,
      description TEXT,
      
      -- Related entity (optional)
      related_entity_type TEXT,
      related_entity_id TEXT,
      
      -- Status and metadata
      status TEXT DEFAULT 'pending',
      uploaded_at TEXT NOT NULL DEFAULT (datetime('now')),
      verified_at TEXT,
      expires_at TEXT,
      
      -- Search and organization
      tags TEXT,
      is_archived INTEGER DEFAULT 0,
      
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
  console.log('✅ Created documents table');

  // Create document access log table
  db.exec(`
    CREATE TABLE IF NOT EXISTS document_access_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      document_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      action TEXT NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      accessed_at TEXT NOT NULL DEFAULT (datetime('now')),
      
      FOREIGN KEY (document_id) REFERENCES documents(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
  console.log('✅ Created document_access_log table');

  // Create indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
    CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
    CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
    CREATE INDEX IF NOT EXISTS idx_documents_related ON documents(related_entity_type, related_entity_id);
  `);
  console.log('✅ Created document indexes');

  console.log('\n✅ Document tables added successfully!');

} catch (error) {
  console.error('❌ Error adding document tables:', error);
  process.exit(1);
} finally {
  db.close();
} 