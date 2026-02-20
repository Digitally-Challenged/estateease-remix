-- EstateEase SQLite Initial Seed Data
-- Migrates hardcoded data from TypeScript files to SQLite
-- Created: 2025-07-07

-- =============================================
-- REFERENCE DATA POPULATION
-- =============================================

-- Insert Reference Data
INSERT OR IGNORE INTO trust_types (code, name, description) VALUES
('revocable', 'Revocable Trust', 'A trust that can be modified or terminated by the grantor'),
('irrevocable', 'Irrevocable Trust', 'A trust that cannot be modified or terminated without beneficiary permission'),
('special_needs', 'Special Needs Trust', 'A trust designed to benefit individuals with disabilities'),
('charitable', 'Charitable Trust', 'A trust established for charitable purposes'),
('other', 'Other Trust', 'Other types of trusts');

INSERT OR IGNORE INTO trustee_types (code, name, description, sort_order) VALUES
('primary', 'Primary Trustee', 'The main trustee responsible for trust administration', 1),
('successor', 'Successor Trustee', 'Takes over when primary trustee is unable to serve', 2),
('co-trustee', 'Co-Trustee', 'Serves alongside other trustees', 3);

INSERT OR IGNORE INTO beneficiary_types (code, name, description) VALUES
('primary', 'Primary Beneficiary', 'First in line to receive benefits'),
('contingent', 'Contingent Beneficiary', 'Receives benefits if primary beneficiary is unable'),
('remainder', 'Remainder Beneficiary', 'Receives remaining trust assets');

INSERT OR IGNORE INTO legal_role_types (code, name, description) VALUES
('executor', 'Executor', 'Manages estate through probate'),
('trustee', 'Trustee', 'Manages trust assets'),
('successor_trustee', 'Successor Trustee', 'Takes over trust management when needed'),
('power_of_attorney', 'Power of Attorney', 'Acts on behalf of principal for financial matters'),
('guardian', 'Guardian', 'Cares for minor children');

INSERT OR IGNORE INTO healthcare_directive_types (code, name, description) VALUES
('healthcare_proxy', 'Healthcare Proxy', 'Makes medical decisions when patient cannot'),
('living_will', 'Living Will', 'Documents end-of-life care preferences');

INSERT OR IGNORE INTO professional_types (code, name, description) VALUES
('estate_attorney', 'Estate Planning Attorney', 'Legal counsel for estate planning'),
('financial_advisor', 'Financial Advisor', 'Investment and financial planning'),
('accountant', 'CPA/Accountant', 'Tax preparation and planning'),
('insurance_agent', 'Insurance Agent', 'Insurance planning and policies'),
('other', 'Other Professional', 'Other professional services');

INSERT OR IGNORE INTO relationship_types (code, name, description) VALUES
('spouse', 'Spouse', 'Married partner'),
('child', 'Child', 'Son or daughter'),
('sibling', 'Sibling', 'Brother or sister'),
('parent', 'Parent', 'Mother or father'),
('grandchild', 'Grandchild', 'Child of child'),
('trust', 'Trust', 'Trust entity'),
('other', 'Other', 'Other relationship');

-- =============================================
-- USERS DATA
-- =============================================

-- Insert Nicholas Coleman (password: password123)
INSERT OR IGNORE INTO users (
    external_id,
    first_name,
    middle_name,
    last_name,
    email,
    password_hash,
    phone_number,
    date_of_birth,
    is_active
) VALUES (
    'user-nick-001',
    'Nicholas',
    'Lynn',
    'Coleman',
    'nick@colemanlaw.com',
    '$2b$12$./zu2sLG4TcyosmFZDitqO.Nj2BReJp26kHExcEEstmklGpw9MVj2',
    '(479) 555-0001',
    '1982-08-15',
    1
);

-- Insert Kelsey Brown (password: password123)
INSERT OR IGNORE INTO users (
    external_id,
    first_name,
    middle_name,
    last_name,
    email,
    password_hash,
    phone_number,
    date_of_birth,
    is_active
) VALUES (
    'user-kelsey-001',
    'Kelsey',
    'Fey',
    'Brown',
    'kelsey@example.com',
    '$2b$12$./zu2sLG4TcyosmFZDitqO.Nj2BReJp26kHExcEEstmklGpw9MVj2',
    '(479) 555-0001',
    '1985-06-15',
    1
);

-- =============================================
-- FAMILY MEMBERS DATA
-- =============================================

-- Kelsey as Nick's spouse
INSERT OR IGNORE INTO family_members (
    family_member_id,
    user_id,
    name,
    relationship_type_id,
    date_of_birth,
    is_minor,
    is_dependent,
    primary_phone,
    email,
    preferred_contact,
    street1,
    city,
    state,
    zip_code,
    country,
    notes,
    is_active
) VALUES (
    'fm-001',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    'Kelsey Fey Brown',
    (SELECT id FROM relationship_types WHERE code = 'spouse'),
    '1985-06-15',
    0,
    0,
    '(479) 555-0001',
    'kelsey@example.com',
    'phone',
    '2211 NW Willow',
    'Bentonville',
    'AR',
    '72712',
    'USA',
    'Primary beneficiary and successor trustee',
    1
);

-- Christopher Coleman (Nick's brother)
INSERT OR IGNORE INTO family_members (
    family_member_id,
    user_id,
    name,
    relationship_type_id,
    date_of_birth,
    is_minor,
    is_dependent,
    primary_phone,
    email,
    preferred_contact,
    notes,
    is_active
) VALUES (
    'fm-002',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    'Christopher William Coleman',
    (SELECT id FROM relationship_types WHERE code = 'sibling'),
    '1983-03-22',
    0,
    0,
    '(479) 555-0002',
    'chris@example.com',
    'email',
    'Brother, successor agent and co-owner of family properties',
    1
);

-- Yvonne Louise Westfall (Guardian choice)
INSERT OR IGNORE INTO family_members (
    family_member_id,
    user_id,
    name,
    relationship_type_id,
    is_minor,
    is_dependent,
    notes,
    is_active
) VALUES (
    'fm-003',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    'Yvonne Louise Westfall',
    (SELECT id FROM relationship_types WHERE code = 'other'),
    0,
    0,
    'First choice guardian for future minor children',
    1
);

-- Joy Bonady Shepherd (Guardian choice)
INSERT OR IGNORE INTO family_members (
    family_member_id,
    user_id,
    name,
    relationship_type_id,
    is_minor,
    is_dependent,
    notes,
    is_active
) VALUES (
    'fm-004',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    'Joy Bonady Shepherd',
    (SELECT id FROM relationship_types WHERE code = 'other'),
    0,
    0,
    'Final successor guardian for future minor children',
    1
);

-- =============================================
-- TRUSTS DATA
-- =============================================

-- Nicholas Coleman Revocable Trust
INSERT OR IGNORE INTO trusts (
    trust_id,
    name,
    trust_type_id,
    tax_id,
    date_created,
    grantor,
    purpose,
    is_active,
    created_by
) VALUES (
    'trust-ncrt-001',
    'Nicholas Coleman Revocable Trust',
    (SELECT id FROM trust_types WHERE code = 'revocable'),
    'XX-XXXXXXX',
    '2024-01-15',
    'Nicholas Lynn Coleman',
    'Primary estate planning vehicle to avoid probate and manage assets',
    1,
    (SELECT id FROM users WHERE external_id = 'user-nick-001')
);

-- Kelsey Brown Revocable Trust
INSERT OR IGNORE INTO trusts (
    trust_id,
    name,
    trust_type_id,
    tax_id,
    date_created,
    grantor,
    purpose,
    is_active,
    created_by
) VALUES (
    'trust-kbrt-001',
    'Kelsey Brown Revocable Trust',
    (SELECT id FROM trust_types WHERE code = 'revocable'),
    'XX-XXXXXXX',
    '2024-01-15',
    'Kelsey Fey Brown',
    'Primary estate planning vehicle for Kelsey''s assets',
    1,
    (SELECT id FROM users WHERE external_id = 'user-kelsey-001')
);

-- Kathleen Geeslin Trust (Inherited)
INSERT OR IGNORE INTO trusts (
    trust_id,
    name,
    trust_type_id,
    tax_id,
    date_created,
    grantor,
    purpose,
    is_active,
    created_by
) VALUES (
    'trust-kgt-001',
    'Kathleen Geeslin Trust',
    (SELECT id FROM trust_types WHERE code = 'irrevocable'),
    'XX-XXXXXXX',
    '2018-06-01',
    'Kathleen Geeslin (Deceased)',
    'Inherited trust from mother''s estate',
    1,
    (SELECT id FROM users WHERE external_id = 'user-nick-001')
);

-- =============================================
-- TRUST TRUSTEES
-- =============================================

-- Nicholas Coleman Revocable Trust Trustees
INSERT OR IGNORE INTO trust_trustees (
    trust_id,
    trustee_name,
    trustee_type_id,
    powers,
    start_date,
    order_of_succession,
    is_active
) VALUES 
(
    (SELECT id FROM trusts WHERE trust_id = 'trust-ncrt-001'),
    'Nicholas Lynn Coleman',
    (SELECT id FROM trustee_types WHERE code = 'primary'),
    '["Full control and management of trust assets"]',
    '2024-01-15',
    0,
    1
),
(
    (SELECT id FROM trusts WHERE trust_id = 'trust-ncrt-001'),
    'Kelsey Fey Brown',
    (SELECT id FROM trustee_types WHERE code = 'successor'),
    '["Full control upon grantor incapacity or death"]',
    null,
    1,
    1
),
(
    (SELECT id FROM trusts WHERE trust_id = 'trust-ncrt-001'),
    'Arvest Trust Company',
    (SELECT id FROM trustee_types WHERE code = 'successor'),
    '["Corporate trustee powers"]',
    null,
    2,
    1
);

-- Kelsey Brown Revocable Trust Trustees
INSERT OR IGNORE INTO trust_trustees (
    trust_id,
    trustee_name,
    trustee_type_id,
    powers,
    start_date,
    order_of_succession,
    is_active
) VALUES 
(
    (SELECT id FROM trusts WHERE trust_id = 'trust-kbrt-001'),
    'Kelsey Fey Brown',
    (SELECT id FROM trustee_types WHERE code = 'primary'),
    '["Full control and management of trust assets"]',
    '2024-01-15',
    0,
    1
),
(
    (SELECT id FROM trusts WHERE trust_id = 'trust-kbrt-001'),
    'Nicholas Lynn Coleman',
    (SELECT id FROM trustee_types WHERE code = 'successor'),
    '["Full control upon grantor incapacity or death"]',
    null,
    1,
    1
),
(
    (SELECT id FROM trusts WHERE trust_id = 'trust-kbrt-001'),
    'Arvest Trust Company',
    (SELECT id FROM trustee_types WHERE code = 'successor'),
    '["Corporate trustee powers"]',
    null,
    2,
    1
);

-- Kathleen Geeslin Trust Trustees
INSERT OR IGNORE INTO trust_trustees (
    trust_id,
    trustee_name,
    trustee_type_id,
    powers,
    start_date,
    order_of_succession,
    is_active
) VALUES 
(
    (SELECT id FROM trusts WHERE trust_id = 'trust-kgt-001'),
    'Nicholas Lynn Coleman',
    (SELECT id FROM trustee_types WHERE code = 'primary'),
    '["Investment and distribution decisions"]',
    '2023-01-01',
    0,
    1
),
(
    (SELECT id FROM trusts WHERE trust_id = 'trust-kgt-001'),
    'Christopher William Coleman',
    (SELECT id FROM trustee_types WHERE code = 'co-trustee'),
    '["Investment and distribution decisions"]',
    '2023-01-01',
    0,
    1
);

-- =============================================
-- TRUST BENEFICIARIES
-- =============================================

-- Nicholas Coleman Revocable Trust Beneficiaries
INSERT OR IGNORE INTO trust_beneficiaries (
    trust_id,
    beneficiary_name,
    beneficiary_type_id,
    relationship_type_id,
    percentage,
    conditions,
    is_active
) VALUES (
    (SELECT id FROM trusts WHERE trust_id = 'trust-ncrt-001'),
    'Kelsey Fey Brown',
    (SELECT id FROM beneficiary_types WHERE code = 'primary'),
    (SELECT id FROM relationship_types WHERE code = 'spouse'),
    100,
    'Marital Trust and Bypass Trust provisions',
    1
);

-- Kelsey Brown Revocable Trust Beneficiaries
INSERT OR IGNORE INTO trust_beneficiaries (
    trust_id,
    beneficiary_name,
    beneficiary_type_id,
    relationship_type_id,
    percentage,
    conditions,
    is_active
) VALUES (
    (SELECT id FROM trusts WHERE trust_id = 'trust-kbrt-001'),
    'Nicholas Lynn Coleman',
    (SELECT id FROM beneficiary_types WHERE code = 'primary'),
    (SELECT id FROM relationship_types WHERE code = 'spouse'),
    100,
    'Marital Trust and Bypass Trust provisions',
    1
);

-- Kathleen Geeslin Trust Beneficiaries
INSERT OR IGNORE INTO trust_beneficiaries (
    trust_id,
    beneficiary_name,
    beneficiary_type_id,
    relationship_type_id,
    percentage,
    conditions,
    is_active
) VALUES 
(
    (SELECT id FROM trusts WHERE trust_id = 'trust-kgt-001'),
    'Nicholas Lynn Coleman',
    (SELECT id FROM beneficiary_types WHERE code = 'primary'),
    (SELECT id FROM relationship_types WHERE code = 'child'),
    50,
    null,
    1
),
(
    (SELECT id FROM trusts WHERE trust_id = 'trust-kgt-001'),
    'Christopher William Coleman',
    (SELECT id FROM beneficiary_types WHERE code = 'primary'),
    (SELECT id FROM relationship_types WHERE code = 'child'),
    50,
    null,
    1
);

-- =============================================
-- BENEFICIARIES (Standalone)
-- =============================================

INSERT OR IGNORE INTO beneficiaries (
    beneficiary_id,
    user_id,
    name,
    relationship_type_id,
    percentage,
    is_primary,
    is_contingent,
    per_stirpes,
    primary_phone,
    email,
    preferred_contact,
    notes
) VALUES 
(
    'ben-001',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    'Kelsey Fey Brown',
    (SELECT id FROM relationship_types WHERE code = 'spouse'),
    100,
    1,
    0,
    0,
    '(479) 555-0001',
    'kelsey@example.com',
    'phone',
    'Primary beneficiary of all trust assets'
),
(
    'ben-002',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    'Future Descendants',
    (SELECT id FROM relationship_types WHERE code = 'child'),
    null,
    0,
    1,
    1,
    null,
    null,
    null,
    'Contingent beneficiaries through Bypass Trust'
),
(
    'ben-003',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    'Christopher William Coleman',
    (SELECT id FROM relationship_types WHERE code = 'sibling'),
    null,
    0,
    1,
    0,
    '(479) 555-0002',
    'chris@example.com',
    'email',
    'Contingent beneficiary of Coleman Family Property if no descendants'
);

-- =============================================
-- LEGAL ROLES
-- =============================================

INSERT OR IGNORE INTO legal_roles (
    legal_role_id,
    user_id,
    role_type_id,
    person_id,
    person_name,
    is_primary,
    order_of_precedence,
    specific_powers,
    compensation_type,
    start_date,
    notes
) VALUES 
(
    'lr-001',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    (SELECT id FROM legal_role_types WHERE code = 'executor'),
    'fm-001',
    'Kelsey Fey Brown',
    1,
    1,
    '["Probate estate administration", "Pay debts and taxes", "Distribute assets per will", "Sell real estate if needed", "Handle legal proceedings"]',
    'none',
    '2024-01-15',
    'Primary executor of pour-over will'
),
(
    'lr-002',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    (SELECT id FROM legal_role_types WHERE code = 'executor'),
    'corp-001',
    'Arvest Trust Company',
    0,
    2,
    '["Full executor powers", "Corporate fiduciary services"]',
    'percentage',
    '2024-01-15',
    'Successor corporate executor'
),
(
    'lr-003',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    (SELECT id FROM legal_role_types WHERE code = 'trustee'),
    'self',
    'Nicholas Lynn Coleman',
    1,
    1,
    '["Full control of trust assets", "Amend or revoke trust", "Investment decisions", "Distribution decisions"]',
    'none',
    '2024-01-15',
    'Initial trustee of revocable trust'
),
(
    'lr-004',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    (SELECT id FROM legal_role_types WHERE code = 'successor_trustee'),
    'fm-001',
    'Kelsey Fey Brown',
    0,
    1,
    '["Full trustee powers upon incapacity or death", "Cannot amend trust after grantor''s death"]',
    'none',
    '2024-01-15',
    'First successor trustee'
),
(
    'lr-005',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    (SELECT id FROM legal_role_types WHERE code = 'power_of_attorney'),
    'fm-001',
    'Kelsey Fey Brown',
    1,
    1,
    '["Banking and financial transactions", "Real estate transactions", "Tax matters", "Digital assets", "Business operations", "Investment decisions"]',
    'none',
    '2024-01-15',
    'Durable financial power of attorney'
),
(
    'lr-006',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    (SELECT id FROM legal_role_types WHERE code = 'power_of_attorney'),
    'fm-002',
    'Christopher William Coleman',
    0,
    2,
    '["Same powers as primary agent"]',
    'none',
    '2024-01-15',
    'Successor financial agent'
),
(
    'lr-007',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    (SELECT id FROM legal_role_types WHERE code = 'guardian'),
    'fm-003',
    'Yvonne Louise Westfall',
    1,
    1,
    '["Physical custody of minor children", "Educational decisions", "Medical decisions", "Daily care"]',
    'none',
    null,
    'First choice guardian for future minor children'
);

-- =============================================
-- HEALTHCARE DIRECTIVES
-- =============================================

INSERT OR IGNORE INTO healthcare_directives (
    directive_id,
    user_id,
    directive_type_id,
    person_id,
    person_name,
    is_primary,
    date_created,
    last_updated
) VALUES 
(
    'hd-001',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    (SELECT id FROM healthcare_directive_types WHERE code = 'healthcare_proxy'),
    'fm-001',
    'Kelsey Fey Brown',
    1,
    '2024-01-15',
    '2024-01-15'
),
(
    'hd-002',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    (SELECT id FROM healthcare_directive_types WHERE code = 'healthcare_proxy'),
    'fm-002',
    'Christopher William Coleman',
    0,
    '2024-01-15',
    '2024-01-15'
);

-- Living Will
INSERT OR IGNORE INTO healthcare_directives (
    directive_id,
    user_id,
    directive_type_id,
    is_primary,
    life_sustaining_decision,
    artificial_nutrition_decision,
    pain_management_instructions,
    organ_donation,
    body_disposition,
    religious_preferences,
    additional_instructions,
    date_created,
    last_updated
) VALUES (
    'hd-003',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    (SELECT id FROM healthcare_directive_types WHERE code = 'living_will'),
    1,
    'discontinue',
    'discontinue',
    'Provide comfort care and pain management',
    0,
    'burial',
    'None specified',
    'Withhold artificial nutrition and hydration in terminal, end-stage, or permanent vegetative state',
    '2024-01-15',
    '2024-01-15'
);

-- =============================================
-- PROFESSIONALS
-- =============================================

INSERT OR IGNORE INTO professionals (
    professional_id,
    user_id,
    name,
    professional_type_id,
    firm,
    title,
    specializations,
    primary_phone,
    email,
    preferred_contact,
    street1,
    city,
    state,
    zip_code,
    country,
    years_experience,
    is_preferred_provider,
    notes
) VALUES 
(
    'prof-001',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    'Estate Planning Attorney',
    (SELECT id FROM professional_types WHERE code = 'estate_attorney'),
    'Estate Law Firm',
    'Partner',
    '["Estate Planning", "Trust Administration", "Tax Planning"]',
    '(479) 555-1000',
    'attorney@estatelaw.com',
    'email',
    '123 Legal Plaza',
    'Bentonville',
    'AR',
    '72712',
    'USA',
    20,
    1,
    'Primary estate planning counsel'
),
(
    'prof-002',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    'Arvest Trust Company',
    (SELECT id FROM professional_types WHERE code = 'other'),
    'Arvest Bank',
    'Trust Officer',
    '["Trust Administration", "Wealth Management", "Fiduciary Services"]',
    '(479) 555-2000',
    'trust@arvest.com',
    'phone',
    '608 SW 8th Street',
    'Bentonville',
    'AR',
    '72712',
    'USA',
    null,
    1,
    'Corporate trustee and executor'
),
(
    'prof-003',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    'Financial Advisor',
    (SELECT id FROM professional_types WHERE code = 'financial_advisor'),
    'Wells Fargo Advisors',
    'Senior Advisor',
    '["Investment Management", "Retirement Planning", "Trust Investments"]',
    '(479) 555-3000',
    'advisor@wellsfargo.com',
    'phone',
    null,
    null,
    null,
    null,
    'USA',
    15,
    1,
    'Manages trust investment accounts'
),
(
    'prof-004',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    'CPA/Tax Preparer',
    (SELECT id FROM professional_types WHERE code = 'accountant'),
    'Tax & Accounting Services',
    'CPA',
    '["Estate Tax", "Trust Taxation", "Business Tax"]',
    '(479) 555-4000',
    'cpa@taxservices.com',
    'email',
    null,
    null,
    null,
    null,
    'USA',
    18,
    1,
    'Handles all tax matters for estate and trusts'
);

-- =============================================
-- EMERGENCY CONTACTS
-- =============================================

INSERT OR IGNORE INTO emergency_contacts (
    contact_id,
    user_id,
    name,
    relationship_type_id,
    contact_type,
    primary_phone,
    secondary_phone,
    email,
    preferred_contact,
    priority,
    availability,
    medical_authority,
    can_make_decisions,
    languages,
    notes
) VALUES 
(
    'ec-001',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    'Kelsey Fey Brown',
    (SELECT id FROM relationship_types WHERE code = 'spouse'),
    'primary',
    '(479) 555-0001',
    '(479) 555-0011',
    'kelsey@example.com',
    'phone',
    1,
    '24/7',
    1,
    1,
    '["English"]',
    'Primary emergency contact and healthcare decision maker'
),
(
    'ec-002',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    'Christopher William Coleman',
    (SELECT id FROM relationship_types WHERE code = 'sibling'),
    'secondary',
    '(479) 555-0002',
    null,
    'chris@example.com',
    'phone',
    2,
    '24/7',
    1,
    1,
    '["English"]',
    'Brother and successor healthcare agent'
);

-- =============================================
-- ASSETS DATA (Sample from estate-plan-data.ts)
-- =============================================

INSERT OR IGNORE INTO assets (
    asset_id,
    user_id,
    name,
    category,
    value,
    ownership_type,
    ownership_details,
    asset_details,
    notes
) VALUES 
-- Real Estate
(
    'ea-re-001',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    '2211 NW Willow, Bentonville, AR',
    'REAL_ESTATE',
    746400,
    'TRUST',
    '{"trustId": "trust-ncrt-001", "percentage": 50, "notes": "50% owned by Nicholas Coleman Trust, 50% by Kelsey Brown Trust"}',
    '{"propertyType": "SINGLE_FAMILY", "address": "2211 NW Willow, Bentonville, AR 72712", "mortgageBalance": 384189.16, "monthlyRent": 0, "annualPropertyTax": 8500, "annualInsurance": 2400, "lastAppraisalDate": "2023-06-01", "lastAppraisalValue": 746400}',
    'Primary residence, transferred to trusts via Warranty Deed'
),
-- Business Interests
(
    'ea-bi-001',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    'Nicholas L. Coleman, Attorney at Law, PLLC',
    'BUSINESS_INTEREST',
    250000,
    'TRUST',
    '{"trustId": "trust-ncrt-001", "percentage": 100, "notes": "Professional law practice"}',
    '{"businessType": "LLC", "businessName": "Nicholas L. Coleman, Attorney at Law, PLLC", "taxId": "XX-XXXXXXX", "percentageOwned": 100, "valuationMethod": "income_approach", "valuationDate": "2023-12-31", "annualRevenue": 450000, "annualProfit": 225000}',
    'Estate planning law practice, key person risk'
),
-- Financial Accounts
(
    'ea-fa-001',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    'Northwestern Mutual Solo 401(k)',
    'FINANCIAL_ACCOUNT',
    194435.36,
    'TRUST',
    '{"trustId": "trust-ncrt-001", "percentage": 100, "notes": "Coleman Law Firm retirement plan"}',
    '{"accountType": "RETIREMENT_401K", "institution": "Northwestern Mutual", "accountNumber": "****1281", "interestRate": 0, "beneficiaries": {"primary": [{"id": "ben-001", "name": "Kelsey Fey Brown", "relationship": "spouse", "percentage": 100}]}}',
    'Law firm 401(k) plan'
),
(
    'ea-fa-002',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    'Wells Fargo Brokerage (Geeslin Trust)',
    'FINANCIAL_ACCOUNT',
    1924661.43,
    'TRUST',
    '{"trustId": "trust-kgt-001", "percentage": 50, "notes": "Nick''s share of inherited trust assets"}',
    '{"accountType": "INVESTMENT_BROKERAGE", "institution": "Wells Fargo", "accountNumber": "****1022", "interestRate": 0, "beneficiaries": {"primary": [{"id": "lr-003", "name": "Nicholas Coleman Revocable Trust", "relationship": "trust", "percentage": 100}]}}',
    'Inherited investment account'
),
-- Insurance Policies
(
    'ea-ip-001',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    'Northwestern Mutual Life Insurance',
    'INSURANCE_POLICY',
    3461.67,
    'TRUST',
    '{"trustId": "trust-ncrt-001", "percentage": 100, "notes": "Whole life policy"}',
    '{"policyType": "LIFE", "insurer": "Northwestern Mutual", "policyNumber": "****3413", "coverageAmount": 37395, "premium": {"amount": 250, "frequency": "monthly"}, "deductible": 0, "beneficiaries": {"primary": [{"id": "ben-001", "name": "Kelsey Fey Brown", "relationship": "spouse", "percentage": 100}]}}',
    '90 Life policy with cash value'
);

-- =============================================
-- AUDIT ENTRY
-- =============================================

INSERT INTO audit_log (
    table_name,
    record_id,
    action,
    user_id,
    new_values
) VALUES (
    'MIGRATION',
    1,
    'INITIAL_DATA_LOAD',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    '{"migration": "sqlite-seed-data.sql", "status": "completed", "timestamp": "' || datetime('now') || '"}'
);