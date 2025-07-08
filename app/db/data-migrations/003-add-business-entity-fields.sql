-- Add Business Entity Enhancement Fields
-- Migration: 003-add-business-entity-fields.sql
-- Purpose: Add incorporation type, state of incorporation, and EIN fields to assets table

-- Add new columns to assets table
ALTER TABLE assets ADD COLUMN incorporation_type TEXT;
ALTER TABLE assets ADD COLUMN state_of_incorporation TEXT;
ALTER TABLE assets ADD COLUMN ein TEXT;

-- Create indexes for business-specific queries
CREATE INDEX IF NOT EXISTS idx_assets_incorporation_type ON assets(incorporation_type);
CREATE INDEX IF NOT EXISTS idx_assets_state_of_incorporation ON assets(state_of_incorporation);

-- Update existing business assets to have default values (optional)
-- This ensures data consistency for existing records
UPDATE assets 
SET incorporation_type = 'LLC' 
WHERE category = 'BUSINESS_INTEREST' 
  AND incorporation_type IS NULL;

UPDATE assets 
SET state_of_incorporation = 'AR' 
WHERE category = 'BUSINESS_INTEREST' 
  AND state_of_incorporation IS NULL;