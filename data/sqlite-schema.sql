-- EstateEase SQLite Database Schema
-- Adapted from SQL Server schema for SQLite
-- Created: 2025-07-07

-- =============================================
-- LOOKUP TABLES (Reference Data)
-- =============================================

-- Trust Types
CREATE TABLE IF NOT EXISTS trust_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Trustee Types
CREATE TABLE IF NOT EXISTS trustee_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Beneficiary Types
CREATE TABLE IF NOT EXISTS beneficiary_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Legal Role Types
CREATE TABLE IF NOT EXISTS legal_role_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Healthcare Directive Types
CREATE TABLE IF NOT EXISTS healthcare_directive_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Professional Types
CREATE TABLE IF NOT EXISTS professional_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Relationship Types
CREATE TABLE IF NOT EXISTS relationship_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- =============================================
-- CORE TABLES
-- =============================================

-- Users (Estate Plan Owners)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    external_id TEXT UNIQUE, -- For integration with auth system
    first_name TEXT NOT NULL,
    middle_name TEXT,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone_number TEXT,
    date_of_birth TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Trusts
CREATE TABLE IF NOT EXISTS trusts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trust_id TEXT NOT NULL UNIQUE, -- Maps to 'id' in TypeScript
    name TEXT NOT NULL,
    trust_type_id INTEGER NOT NULL,
    tax_id TEXT, -- Encrypted in production
    date_created TEXT NOT NULL,
    grantor TEXT NOT NULL,
    purpose TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_by INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (trust_type_id) REFERENCES trust_types(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Trust Trustees (Many-to-Many)
CREATE TABLE IF NOT EXISTS trust_trustees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trust_id INTEGER NOT NULL,
    trustee_name TEXT NOT NULL,
    trustee_type_id INTEGER NOT NULL,
    powers TEXT, -- JSON array stored as string
    start_date TEXT,
    end_date TEXT,
    order_of_succession INTEGER,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (trust_id) REFERENCES trusts(id),
    FOREIGN KEY (trustee_type_id) REFERENCES trustee_types(id)
);

-- Trust Beneficiaries (Many-to-Many)
CREATE TABLE IF NOT EXISTS trust_beneficiaries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trust_id INTEGER NOT NULL,
    beneficiary_name TEXT NOT NULL,
    beneficiary_type_id INTEGER NOT NULL,
    relationship_type_id INTEGER NOT NULL,
    percentage REAL CHECK (percentage >= 0 AND percentage <= 100),
    conditions TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (trust_id) REFERENCES trusts(id),
    FOREIGN KEY (beneficiary_type_id) REFERENCES beneficiary_types(id),
    FOREIGN KEY (relationship_type_id) REFERENCES relationship_types(id)
);

-- Family Members
CREATE TABLE IF NOT EXISTS family_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    family_member_id TEXT NOT NULL UNIQUE, -- Maps to 'id' in TypeScript
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    relationship_type_id INTEGER NOT NULL,
    date_of_birth TEXT,
    is_minor INTEGER NOT NULL DEFAULT 0,
    is_dependent INTEGER NOT NULL DEFAULT 0,
    primary_phone TEXT,
    secondary_phone TEXT,
    email TEXT,
    preferred_contact TEXT,
    street1 TEXT,
    street2 TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    country TEXT DEFAULT 'USA',
    notes TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (relationship_type_id) REFERENCES relationship_types(id)
);

-- Legal Roles
CREATE TABLE IF NOT EXISTS legal_roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    legal_role_id TEXT NOT NULL UNIQUE, -- Maps to 'id' in TypeScript
    user_id INTEGER NOT NULL,
    role_type_id INTEGER NOT NULL,
    person_id TEXT, -- References family_member_id or external ID
    person_name TEXT NOT NULL,
    is_primary INTEGER NOT NULL DEFAULT 0,
    order_of_precedence INTEGER,
    specific_powers TEXT, -- JSON array stored as string
    compensation_type TEXT,
    compensation_amount REAL,
    compensation_details TEXT,
    start_date TEXT,
    end_date TEXT,
    end_conditions TEXT,
    notes TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (role_type_id) REFERENCES legal_role_types(id)
);

-- Healthcare Directives
CREATE TABLE IF NOT EXISTS healthcare_directives (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    directive_id TEXT NOT NULL UNIQUE, -- Maps to 'id' in TypeScript
    user_id INTEGER NOT NULL,
    directive_type_id INTEGER NOT NULL,
    person_id TEXT, -- For healthcare proxy
    person_name TEXT,
    is_primary INTEGER NOT NULL DEFAULT 0,
    -- Living Will Decisions (stored as separate columns for querying)
    life_sustaining_decision TEXT,
    artificial_nutrition_decision TEXT,
    pain_management_instructions TEXT,
    organ_donation INTEGER,
    body_disposition TEXT,
    religious_preferences TEXT,
    additional_instructions TEXT,
    date_created TEXT NOT NULL,
    last_updated TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (directive_type_id) REFERENCES healthcare_directive_types(id)
);

-- Beneficiaries (Standalone beneficiary records)
CREATE TABLE IF NOT EXISTS beneficiaries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    beneficiary_id TEXT NOT NULL UNIQUE, -- Maps to 'id' in TypeScript
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    relationship_type_id INTEGER NOT NULL,
    percentage REAL,
    is_primary INTEGER NOT NULL DEFAULT 0,
    is_contingent INTEGER NOT NULL DEFAULT 0,
    contingent_to TEXT, -- References another beneficiary_id
    per_stirpes INTEGER NOT NULL DEFAULT 0,
    primary_phone TEXT,
    email TEXT,
    preferred_contact TEXT,
    notes TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (relationship_type_id) REFERENCES relationship_types(id)
);

-- Professionals
CREATE TABLE IF NOT EXISTS professionals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    professional_id TEXT NOT NULL UNIQUE, -- Maps to 'id' in TypeScript
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    professional_type_id INTEGER NOT NULL,
    firm TEXT,
    title TEXT,
    specializations TEXT, -- JSON array stored as string
    primary_phone TEXT,
    secondary_phone TEXT,
    email TEXT,
    preferred_contact TEXT,
    street1 TEXT,
    street2 TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    country TEXT DEFAULT 'USA',
    credentials TEXT, -- JSON array stored as string
    years_experience INTEGER,
    is_preferred_provider INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (professional_type_id) REFERENCES professional_types(id)
);

-- Emergency Contacts
CREATE TABLE IF NOT EXISTS emergency_contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contact_id TEXT NOT NULL UNIQUE, -- Maps to 'id' in TypeScript
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    relationship_type_id INTEGER NOT NULL,
    contact_type TEXT NOT NULL, -- primary, secondary, etc.
    primary_phone TEXT NOT NULL,
    secondary_phone TEXT,
    email TEXT,
    preferred_contact TEXT,
    priority INTEGER NOT NULL DEFAULT 999,
    availability TEXT,
    medical_authority INTEGER NOT NULL DEFAULT 0,
    can_make_decisions INTEGER NOT NULL DEFAULT 0,
    languages TEXT, -- JSON array stored as string
    notes TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (relationship_type_id) REFERENCES relationship_types(id)
);

-- Assets
CREATE TABLE IF NOT EXISTS assets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    asset_id TEXT NOT NULL UNIQUE, -- Maps to 'id' in TypeScript
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- REAL_ESTATE, BUSINESS_INTEREST, FINANCIAL_ACCOUNT, etc.
    value REAL NOT NULL,
    -- Ownership structure (JSON stored as text)
    ownership_type TEXT NOT NULL, -- trust, joint, individual, business
    ownership_details TEXT, -- JSON with ownership specifics
    -- Asset-specific details (JSON stored as text for flexibility)
    asset_details TEXT, -- Property details, account info, business info, etc.
    -- Common fields
    notes TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    last_updated TEXT NOT NULL DEFAULT (datetime('now')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- =============================================
-- AUDIT AND TRACKING
-- =============================================

-- Audit Log for tracking changes
CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_name TEXT NOT NULL,
    record_id INTEGER NOT NULL,
    action TEXT NOT NULL, -- INSERT, UPDATE, DELETE
    user_id INTEGER NOT NULL,
    old_values TEXT, -- JSON
    new_values TEXT, -- JSON
    changed_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Trusts indexes
CREATE INDEX IF NOT EXISTS idx_trusts_trust_id ON trusts(trust_id);
CREATE INDEX IF NOT EXISTS idx_trusts_created_by ON trusts(created_by);
CREATE INDEX IF NOT EXISTS idx_trusts_type ON trusts(trust_type_id);

-- Trust relationships indexes
CREATE INDEX IF NOT EXISTS idx_trust_trustees_trust_id ON trust_trustees(trust_id);
CREATE INDEX IF NOT EXISTS idx_trust_trustees_type ON trust_trustees(trustee_type_id);
CREATE INDEX IF NOT EXISTS idx_trust_beneficiaries_trust_id ON trust_beneficiaries(trust_id);

-- Family and relationships indexes
CREATE INDEX IF NOT EXISTS idx_family_members_user_id ON family_members(user_id);
CREATE INDEX IF NOT EXISTS idx_family_members_family_member_id ON family_members(family_member_id);
CREATE INDEX IF NOT EXISTS idx_legal_roles_user_id ON legal_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_healthcare_directives_user_id ON healthcare_directives(user_id);

-- Contacts and professionals indexes
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_user_id ON emergency_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_priority ON emergency_contacts(priority);
CREATE INDEX IF NOT EXISTS idx_professionals_user_id ON professionals(user_id);

-- Assets indexes
CREATE INDEX IF NOT EXISTS idx_assets_user_id ON assets(user_id);
CREATE INDEX IF NOT EXISTS idx_assets_category ON assets(category);
CREATE INDEX IF NOT EXISTS idx_assets_asset_id ON assets(asset_id);

-- Audit log indexes
CREATE INDEX IF NOT EXISTS idx_audit_log_table_record ON audit_log(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_changed_at ON audit_log(changed_at);