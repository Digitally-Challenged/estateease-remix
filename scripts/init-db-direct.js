#!/usr/bin/env node

// Direct database initialization script for EstateEase
// This script creates the SQLite database and seeds it with initial data

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import process from 'process';

// Set up path resolution for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Database file location
const dbPath = path.join(projectRoot, 'data', 'estateease.db');

// Ensure data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

async function initializeDatabase() {
  let db;
  
  try {
    console.log('🚀 Starting database initialization...');
    console.log(`📍 Database location: ${dbPath}`);
    
    // Initialize database connection
    db = new Database(dbPath);
    
    // Enable foreign keys
    db.pragma('foreign_keys = ON');
    
    // Set performance optimizations
    db.pragma('journal_mode = WAL');
    db.pragma('synchronous = NORMAL');
    db.pragma('cache_size = 1000');
    
    console.log('✅ Database connected successfully');
    
    // Check if tables exist
    const result = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get();
    
    if (!result) {
      console.log('📋 Database tables not found, initializing...');
      
      // Read and execute the SQLite schema
      const schemaPath = path.join(projectRoot, 'app/db/schema/sqlite-schema.sql');
      console.log(`📋 Reading schema from: ${schemaPath}`);
      
      if (!fs.existsSync(schemaPath)) {
        throw new Error(`Schema file not found: ${schemaPath}`);
      }
      
      const schema = fs.readFileSync(schemaPath, 'utf-8');
      
      // Execute the entire schema as one block to handle dependencies properly
      console.log('📋 Executing schema as single transaction...');
      
      try {
        db.exec(schema);
      } catch (error) {
        console.error('Error executing schema');
        throw error;
      }
      
      console.log('✅ Database tables initialized successfully');
      
      // Read and execute the seed data
      const seedPath = path.join(projectRoot, 'data/sqlite-seed-data.sql');
      console.log(`🌱 Reading seed data from: ${seedPath}`);
      
      if (!fs.existsSync(seedPath)) {
        throw new Error(`Seed data file not found: ${seedPath}`);
      }
      
      const seedData = fs.readFileSync(seedPath, 'utf-8');
      
      // Execute the entire seed data as one block
      console.log('🌱 Executing seed data...');
      
      try {
        db.exec(seedData);
      } catch (error) {
        console.error('Error executing seed data');
        throw error;
      }
      
      console.log('✅ Database seeded successfully');
    } else {
      console.log('✅ Database already initialized');
    }
    
    // Test the database by querying some basic data
    const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get();
    const trustCount = db.prepare("SELECT COUNT(*) as count FROM trusts").get();
    const assetCount = db.prepare("SELECT COUNT(*) as count FROM assets").get();
    
    console.log('📊 Database Summary:');
    console.log(`   Users: ${userCount.count}`);
    console.log(`   Trusts: ${trustCount.count}`);
    console.log(`   Assets: ${assetCount.count}`);
    
    console.log('');
    console.log('🎉 Database initialization completed successfully!');
    console.log('📊 You can now start the Remix development server with: npm run dev');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  } finally {
    if (db) {
      db.close();
    }
  }
}

// Run the initialization
initializeDatabase();