-- EstateEase SQLite Database Schema
-- Created: 2025-07-07
-- Description: Complete database schema for the EstateEase estate planning application

-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- =============================================
-- CORE USER MANAGEMENT
-- =============================================

-- Users table for multi-tenant support
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    external_id TEXT UNIQUE,
    email TEXT UNIQUE,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT 1
);

-- =============================================
-- TRUST MANAGEMENT
-- =============================================

-- Trust types lookup
CREATE TABLE IF NOT EXISTS trust_types (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT 1
);

-- Trustee types lookup
CREATE TABLE IF NOT EXISTS trustee_types (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER,
    is_active BOOLEAN DEFAULT 1
);

-- Beneficiary types lookup
CREATE TABLE IF NOT EXISTS beneficiary_types (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT 1
);

-- Main trusts table
CREATE TABLE IF NOT EXISTS trusts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    tax_id TEXT,
    date_created TEXT NOT NULL,
    date_amended TEXT,
    grantor TEXT NOT NULL,
    purpose TEXT,
    is_active BOOLEAN DEFAULT 1,
    notes TEXT,
    user_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Trust trustees
CREATE TABLE IF NOT EXISTS trust_trustees (
    id TEXT PRIMARY KEY,
    trust_id TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    powers TEXT,
    start_date TEXT,
    end_date TEXT,
    order_of_succession INTEGER,
    compensation_type TEXT,
    compensation_amount REAL,
    compensation_details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trust_id) REFERENCES trusts(id) ON DELETE CASCADE,
    FOREIGN KEY (type) REFERENCES trustee_types(code)
);

-- Trust beneficiaries
CREATE TABLE IF NOT EXISTS trust_beneficiaries (
    id TEXT PRIMARY KEY,
    trust_id TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    relationship TEXT NOT NULL,
    percentage REAL,
    conditions TEXT,
    distribution_type TEXT,
    distribution_schedule TEXT,
    distribution_amount TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trust_id) REFERENCES trusts(id) ON DELETE CASCADE,
    FOREIGN KEY (type) REFERENCES beneficiary_types(code)
);

-- =============================================
-- ASSET MANAGEMENT
-- =============================================

-- Assets table - core asset tracking
CREATE TABLE IF NOT EXISTS assets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    asset_type TEXT,
    value REAL NOT NULL DEFAULT 0,
    ownership_type TEXT NOT NULL,
    ownership_percentage REAL DEFAULT 100,
    date_acquired TEXT,
    description TEXT,
    location TEXT,
    is_active BOOLEAN DEFAULT 1,
    user_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Asset details - flexible JSON storage for asset-specific details
CREATE TABLE IF NOT EXISTS asset_details (
    id TEXT PRIMARY KEY,
    asset_id TEXT NOT NULL,
    detail_key TEXT NOT NULL,
    detail_value TEXT,
    data_type TEXT DEFAULT 'text',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
    UNIQUE(asset_id, detail_key)
);

-- Asset ownership tracking
CREATE TABLE IF NOT EXISTS asset_ownership (
    id TEXT PRIMARY KEY,
    asset_id TEXT NOT NULL,
    owner_type TEXT NOT NULL, -- 'individual', 'trust', 'business'
    owner_id TEXT, -- references users.id, trusts.id, or business_entities.id
    ownership_percentage REAL DEFAULT 100,
    date_acquired TEXT,
    acquisition_cost REAL,
    notes TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
);

-- =============================================
-- FAMILY & CONTACT MANAGEMENT
-- =============================================

-- Relationship types lookup
CREATE TABLE IF NOT EXISTS relationship_types (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    is_family BOOLEAN DEFAULT 0,
    sort_order INTEGER,
    is_active BOOLEAN DEFAULT 1
);

-- Family members and contacts
CREATE TABLE IF NOT EXISTS family_members (
    id TEXT PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    relationship TEXT,
    birth_date TEXT,
    email TEXT,
    phone TEXT,
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    country TEXT DEFAULT 'US',
    notes TEXT,
    is_active BOOLEAN DEFAULT 1,
    user_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (relationship) REFERENCES relationship_types(code)
);

-- Professional team (attorneys, CPAs, advisors)
CREATE TABLE IF NOT EXISTS professionals (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL, -- 'attorney', 'cpa', 'financial_advisor', 'insurance_agent', etc.
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    company TEXT,
    title TEXT,
    specialization TEXT,
    email TEXT,
    phone TEXT,
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    country TEXT DEFAULT 'US',
    website TEXT,
    license_number TEXT,
    is_preferred BOOLEAN DEFAULT 0,
    notes TEXT,
    is_active BOOLEAN DEFAULT 1,
    user_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- =============================================
-- LEGAL ROLES & ASSIGNMENTS
-- =============================================

-- Legal role types lookup
CREATE TABLE IF NOT EXISTS legal_role_types (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT 1
);

-- Legal role assignments
CREATE TABLE IF NOT EXISTS legal_roles (
    id TEXT PRIMARY KEY,
    role_type TEXT NOT NULL,
    assignee_type TEXT NOT NULL, -- 'family_member', 'professional'
    assignee_id TEXT NOT NULL,
    document_type TEXT, -- 'will', 'trust', 'power_of_attorney', etc.
    document_id TEXT,
    is_primary BOOLEAN DEFAULT 0,
    succession_order INTEGER,
    appointment_date TEXT,
    notes TEXT,
    is_active BOOLEAN DEFAULT 1,
    user_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (role_type) REFERENCES legal_role_types(code)
);

-- =============================================
-- HEALTHCARE DIRECTIVES
-- =============================================

-- Healthcare directive types
CREATE TABLE IF NOT EXISTS healthcare_directive_types (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT 1
);

-- Healthcare directives
CREATE TABLE IF NOT EXISTS healthcare_directives (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    document_date TEXT,
    effective_date TEXT,
    healthcare_proxy_id TEXT, -- references family_members.id
    backup_proxy_id TEXT, -- references family_members.id
    physician_name TEXT,
    physician_phone TEXT,
    specific_instructions TEXT,
    is_active BOOLEAN DEFAULT 1,
    user_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (type) REFERENCES healthcare_directive_types(code)
);

-- =============================================
-- DOCUMENT MANAGEMENT
-- =============================================

-- Document categories
CREATE TABLE IF NOT EXISTS document_categories (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    parent_category TEXT,
    sort_order INTEGER,
    is_active BOOLEAN DEFAULT 1,
    FOREIGN KEY (parent_category) REFERENCES document_categories(code)
);

-- Documents
CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    filename TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    category TEXT,
    entity_type TEXT, -- 'trust', 'asset', 'family_member', etc.
    entity_id TEXT,
    title TEXT,
    description TEXT,
    document_date TEXT,
    upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    file_path TEXT,
    is_active BOOLEAN DEFAULT 1,
    user_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (category) REFERENCES document_categories(code)
);

-- =============================================
-- BUSINESS ENTITIES
-- =============================================

-- Business entities
CREATE TABLE IF NOT EXISTS business_entities (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    legal_structure TEXT NOT NULL,
    industry TEXT,
    tax_id TEXT,
    formation_date TEXT,
    formation_state TEXT,
    description TEXT,
    valuation REAL,
    valuation_date TEXT,
    ownership_percentage REAL,
    is_active BOOLEAN DEFAULT 1,
    user_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- =============================================
-- FINANCIAL CALCULATIONS & PROJECTIONS
-- =============================================

-- Estate valuations (periodic snapshots)
CREATE TABLE IF NOT EXISTS estate_valuations (
    id TEXT PRIMARY KEY,
    valuation_date TEXT NOT NULL,
    total_assets REAL NOT NULL DEFAULT 0,
    total_liabilities REAL NOT NULL DEFAULT 0,
    net_worth REAL NOT NULL DEFAULT 0,
    liquid_assets REAL NOT NULL DEFAULT 0,
    illiquid_assets REAL NOT NULL DEFAULT 0,
    federal_exemption_amount REAL,
    state_exemption_amount REAL,
    estimated_federal_tax REAL DEFAULT 0,
    estimated_state_tax REAL DEFAULT 0,
    notes TEXT,
    user_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- =============================================
-- ACTIVITY LOG & AUDIT TRAIL
-- =============================================

-- Activity log for audit trail
CREATE TABLE IF NOT EXISTS activity_log (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id TEXT,
    old_values TEXT, -- JSON
    new_values TEXT, -- JSON
    ip_address TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- User-related indexes
CREATE INDEX IF NOT EXISTS idx_users_external_id ON users(external_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Trust-related indexes
CREATE INDEX IF NOT EXISTS idx_trusts_user_id ON trusts(user_id);
CREATE INDEX IF NOT EXISTS idx_trusts_type ON trusts(type);
CREATE INDEX IF NOT EXISTS idx_trusts_is_active ON trusts(is_active);
CREATE INDEX IF NOT EXISTS idx_trust_trustees_trust_id ON trust_trustees(trust_id);
CREATE INDEX IF NOT EXISTS idx_trust_beneficiaries_trust_id ON trust_beneficiaries(trust_id);

-- Asset-related indexes
CREATE INDEX IF NOT EXISTS idx_assets_user_id ON assets(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_category ON assets(category);
CREATE INDEX IF NOT EXISTS idx_assets_ownership_type ON assets(ownership_type);
CREATE INDEX IF NOT EXISTS idx_assets_is_active ON assets(is_active);
CREATE INDEX IF NOT EXISTS idx_asset_details_asset_id ON asset_details(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_ownership_asset_id ON asset_ownership(asset_id);

-- Family & contact indexes
CREATE INDEX IF NOT EXISTS idx_family_members_user_id ON family_members(user_id);
CREATE INDEX IF NOT EXISTS idx_family_members_relationship ON family_members(relationship);
CREATE INDEX IF NOT EXISTS idx_family_members_is_active ON family_members(is_active);
CREATE INDEX IF NOT EXISTS idx_professionals_user_id ON professionals(user_id);
CREATE INDEX IF NOT EXISTS idx_professionals_type ON professionals(type);
CREATE INDEX IF NOT EXISTS idx_professionals_is_active ON professionals(is_active);

-- Legal role indexes
CREATE INDEX IF NOT EXISTS idx_legal_roles_user_id ON legal_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_legal_roles_role_type ON legal_roles(role_type);
CREATE INDEX IF NOT EXISTS idx_legal_roles_assignee ON legal_roles(assignee_type, assignee_id);

-- Document indexes
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_category ON documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_entity ON documents(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_documents_is_active ON documents(is_active);

-- Activity log indexes
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_entity ON activity_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at);

-- Estate valuation indexes
CREATE INDEX IF NOT EXISTS idx_estate_valuations_user_id ON estate_valuations(user_id);
CREATE INDEX IF NOT EXISTS idx_estate_valuations_date ON estate_valuations(valuation_date);

-- =============================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
-- =============================================

-- Users table triggers
CREATE TRIGGER IF NOT EXISTS update_users_timestamp 
    AFTER UPDATE ON users
    FOR EACH ROW
    WHEN NEW.updated_at = OLD.updated_at
BEGIN
    UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Trusts table triggers
CREATE TRIGGER IF NOT EXISTS update_trusts_timestamp 
    AFTER UPDATE ON trusts
    FOR EACH ROW
    WHEN NEW.updated_at = OLD.updated_at
BEGIN
    UPDATE trusts SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Assets table triggers
CREATE TRIGGER IF NOT EXISTS update_assets_timestamp 
    AFTER UPDATE ON assets
    FOR EACH ROW
    WHEN NEW.updated_at = OLD.updated_at
BEGIN
    UPDATE assets SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Family members table triggers
CREATE TRIGGER IF NOT EXISTS update_family_members_timestamp 
    AFTER UPDATE ON family_members
    FOR EACH ROW
    WHEN NEW.updated_at = OLD.updated_at
BEGIN
    UPDATE family_members SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Professionals table triggers
CREATE TRIGGER IF NOT EXISTS update_professionals_timestamp 
    AFTER UPDATE ON professionals
    FOR EACH ROW
    WHEN NEW.updated_at = OLD.updated_at
BEGIN
    UPDATE professionals SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;