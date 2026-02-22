-- EstateEase SQLite Initial Seed Data
-- Synced with Notion Coleman Trust & Estate data
-- Updated: 2026-02-20

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
('guardian', 'Guardian', 'Cares for minor children'),
('successor_agent', 'Successor Agent', 'Takes over agent duties when primary agent is unable to serve');

INSERT OR IGNORE INTO healthcare_directive_types (code, name, description) VALUES
('healthcare_proxy', 'Healthcare Proxy', 'Makes medical decisions when patient cannot'),
('living_will', 'Living Will', 'Documents end-of-life care preferences'),
('advance_directive', 'Advance Directive', 'Comprehensive advance healthcare directive'),
('dnr', 'Do Not Resuscitate', 'Do not resuscitate order'),
('polst', 'POLST', 'Physician Orders for Life-Sustaining Treatment');

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
('other', 'Other', 'Other relationship'),
('step_parent', 'Step-Parent', 'Step-mother or step-father'),
('cousin', 'Cousin', 'Cousin'),
('in_law', 'In-Law', 'Parent-in-law or sibling-in-law');

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
    'nickcoleman85@gmail.com',
    '$2b$12$./zu2sLG4TcyosmFZDitqO.Nj2BReJp26kHExcEEstmklGpw9MVj2',
    '(870) 740-0598',
    '1985-08-15',
    1
);

-- Insert Kelsey Coleman (password: password123)
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
    'Coleman',
    'kelseyfbrown@gmail.com',
    '$2b$12$./zu2sLG4TcyosmFZDitqO.Nj2BReJp26kHExcEEstmklGpw9MVj2',
    '(501) 545-9627',
    '1985-06-15',
    1
);

-- =============================================
-- FAMILY MEMBERS DATA (12 people from Notion)
-- =============================================

-- fm-001: Kelsey Coleman (Nick's spouse)
INSERT OR IGNORE INTO family_members (
    family_member_id, user_id, name, relationship_type_id,
    date_of_birth, is_minor, is_dependent,
    primary_phone, email, preferred_contact,
    street1, city, state, zip_code, country,
    notes, is_active
) VALUES (
    'fm-001',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    'Kelsey Fey Coleman',
    (SELECT id FROM relationship_types WHERE code = 'spouse'),
    '1985-06-15', 0, 0,
    '(501) 545-9627', 'kelseyfbrown@gmail.com', 'phone',
    '2211 NW Willow', 'Bentonville', 'AR', '72712', 'USA',
    'Primary beneficiary and successor trustee',
    1
);

-- fm-002: Kit Coleman (Nick's brother)
INSERT OR IGNORE INTO family_members (
    family_member_id, user_id, name, relationship_type_id,
    date_of_birth, is_minor, is_dependent,
    primary_phone, email, preferred_contact,
    street1, city, state, zip_code, country,
    notes, is_active
) VALUES (
    'fm-002',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    'Kit Coleman',
    (SELECT id FROM relationship_types WHERE code = 'sibling'),
    null, 0, 0,
    '(870) 740-8150', 'kitcoleman66@gmail.com', 'phone',
    '2720 North Taylor St', 'Little Rock', 'AR', '72207', 'USA',
    'Brother, successor agent and co-owner of family properties',
    1
);

-- fm-003: Yvonne Westfall (Kelsey's mother)
INSERT OR IGNORE INTO family_members (
    family_member_id, user_id, name, relationship_type_id,
    is_minor, is_dependent,
    primary_phone, email, preferred_contact,
    street1, city, state, zip_code, country,
    notes, is_active
) VALUES (
    'fm-003',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    'Yvonne Louise Westfall',
    (SELECT id FROM relationship_types WHERE code = 'in_law'),
    0, 0,
    '(501) 627-4978', 'yvonne.westfall79@gmail.com', 'phone',
    '760 N Moore Rd', 'Hot Springs', 'AR', '71913', 'USA',
    'Kelsey''s mother. First choice guardian for future minor children.',
    1
);

-- fm-004: Joy Shepard (Kelsey's cousin)
INSERT OR IGNORE INTO family_members (
    family_member_id, user_id, name, relationship_type_id,
    is_minor, is_dependent,
    primary_phone, email, preferred_contact,
    street1, city, state, zip_code, country,
    notes, is_active
) VALUES (
    'fm-004',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    'Joy Shepard',
    (SELECT id FROM relationship_types WHERE code = 'cousin'),
    0, 0,
    '(870) 588-1397', 'joyshepherd@yahoo.com', 'phone',
    '98 CR 378', 'Wynne', 'AR', '72396', 'USA',
    'Kelsey''s cousin. Successor guardian for future minor children.',
    1
);

-- fm-005: Bobby Coleman (Nick's father)
INSERT OR IGNORE INTO family_members (
    family_member_id, user_id, name, relationship_type_id,
    is_minor, is_dependent,
    primary_phone, email, preferred_contact,
    street1, city, state, zip_code, country,
    notes, is_active
) VALUES (
    'fm-005',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    'Bobby Coleman',
    (SELECT id FROM relationship_types WHERE code = 'parent'),
    0, 0,
    '(870) 740-2086', 'bobbycoleman@icloud.com', 'phone',
    '37 N. Wedgewood', 'Blytheville', 'AR', '72315', 'USA',
    'Nick''s father',
    1
);

-- fm-006: Terri Coleman (Nick's step-mother)
INSERT OR IGNORE INTO family_members (
    family_member_id, user_id, name, relationship_type_id,
    is_minor, is_dependent,
    primary_phone, preferred_contact,
    street1, city, state, zip_code, country,
    notes, is_active
) VALUES (
    'fm-006',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    'Terri Coleman',
    (SELECT id FROM relationship_types WHERE code = 'step_parent'),
    0, 0,
    '(870) 974-3569', 'phone',
    '2710 Casey Springs Rd', 'Jonesboro', 'AR', '72404', 'USA',
    'Nick''s step-mother',
    1
);

-- fm-007: Emily Hanzlik (Kelsey's sister)
INSERT OR IGNORE INTO family_members (
    family_member_id, user_id, name, relationship_type_id,
    is_minor, is_dependent,
    primary_phone, preferred_contact,
    notes, is_active
) VALUES (
    'fm-007',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    'Emily Hanzlik',
    (SELECT id FROM relationship_types WHERE code = 'other'),
    0, 0,
    '(870) 588-7650', 'phone',
    'Kelsey''s sister (sister-in-law). Backup medical POA for Kelsey.',
    1
);

-- fm-008: Samuel Hanzlik (Kelsey's brother)
INSERT OR IGNORE INTO family_members (
    family_member_id, user_id, name, relationship_type_id,
    is_minor, is_dependent,
    primary_phone, preferred_contact,
    notes, is_active
) VALUES (
    'fm-008',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    'Samuel Hanzlik',
    (SELECT id FROM relationship_types WHERE code = 'other'),
    0, 0,
    '(870) 318-5895', 'phone',
    'Kelsey''s brother (brother-in-law)',
    1
);

-- fm-009: Julia Shepherd (Kelsey's cousin)
INSERT OR IGNORE INTO family_members (
    family_member_id, user_id, name, relationship_type_id,
    is_minor, is_dependent,
    street1, city, state, zip_code,
    notes, is_active
) VALUES (
    'fm-009',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    'Julia Shepherd',
    (SELECT id FROM relationship_types WHERE code = 'cousin'),
    0, 0,
    '98 CR 378', 'Wynne', 'AR', '72396',
    'Kelsey''s cousin',
    1
);

-- fm-010: John Shepherd IV (Kelsey's cousin)
INSERT OR IGNORE INTO family_members (
    family_member_id, user_id, name, relationship_type_id,
    is_minor, is_dependent,
    street1, city, state, zip_code,
    notes, is_active
) VALUES (
    'fm-010',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    'John Shepherd IV',
    (SELECT id FROM relationship_types WHERE code = 'cousin'),
    0, 0,
    '98 CR 378', 'Wynne', 'AR', '72396',
    'Kelsey''s cousin',
    1
);

-- fm-011: Coleman Children (placeholder for future children)
INSERT OR IGNORE INTO family_members (
    family_member_id, user_id, name, relationship_type_id,
    is_minor, is_dependent,
    notes, is_active
) VALUES (
    'fm-011',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    'Coleman Children',
    (SELECT id FROM relationship_types WHERE code = 'child'),
    1, 1,
    'Placeholder for future children. Trust terms: Age 18 trustee discretion, Age 25 $300k home purchase, Age 35 full access.',
    1
);

-- =============================================
-- TRUSTS DATA
-- =============================================

-- Nicholas Coleman Revocable Trust
INSERT OR IGNORE INTO trusts (
    trust_id, name, trust_type_id, tax_id,
    date_created, grantor, purpose, is_active, created_by
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

-- Kelsey Coleman Revocable Trust
INSERT OR IGNORE INTO trusts (
    trust_id, name, trust_type_id, tax_id,
    date_created, grantor, purpose, is_active, created_by
) VALUES (
    'trust-kcrt-001',
    'Kelsey Coleman Revocable Trust',
    (SELECT id FROM trust_types WHERE code = 'revocable'),
    'XX-XXXXXXX',
    '2024-01-15',
    'Kelsey Fey Coleman',
    'Primary estate planning vehicle for Kelsey''s assets',
    1,
    (SELECT id FROM users WHERE external_id = 'user-kelsey-001')
);

-- Kathleen Geeslin Trust (Inherited)
INSERT OR IGNORE INTO trusts (
    trust_id, name, trust_type_id, tax_id,
    date_created, grantor, purpose, is_active, created_by
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
    trust_id, trustee_name, trustee_type_id,
    powers, start_date, order_of_succession, is_active
) VALUES
(
    (SELECT id FROM trusts WHERE trust_id = 'trust-ncrt-001'),
    'Nicholas Lynn Coleman',
    (SELECT id FROM trustee_types WHERE code = 'primary'),
    '["Full control and management of trust assets"]',
    '2024-01-15', 0, 1
),
(
    (SELECT id FROM trusts WHERE trust_id = 'trust-ncrt-001'),
    'Kelsey Fey Coleman',
    (SELECT id FROM trustee_types WHERE code = 'successor'),
    '["Full control upon grantor incapacity or death"]',
    null, 1, 1
),
(
    (SELECT id FROM trusts WHERE trust_id = 'trust-ncrt-001'),
    'Arvest Trust Company',
    (SELECT id FROM trustee_types WHERE code = 'successor'),
    '["Corporate trustee powers"]',
    null, 2, 1
);

-- Kelsey Coleman Revocable Trust Trustees
INSERT OR IGNORE INTO trust_trustees (
    trust_id, trustee_name, trustee_type_id,
    powers, start_date, order_of_succession, is_active
) VALUES
(
    (SELECT id FROM trusts WHERE trust_id = 'trust-kcrt-001'),
    'Kelsey Fey Coleman',
    (SELECT id FROM trustee_types WHERE code = 'primary'),
    '["Full control and management of trust assets"]',
    '2024-01-15', 0, 1
),
(
    (SELECT id FROM trusts WHERE trust_id = 'trust-kcrt-001'),
    'Nicholas Lynn Coleman',
    (SELECT id FROM trustee_types WHERE code = 'successor'),
    '["Full control upon grantor incapacity or death"]',
    null, 1, 1
),
(
    (SELECT id FROM trusts WHERE trust_id = 'trust-kcrt-001'),
    'Arvest Trust Company',
    (SELECT id FROM trustee_types WHERE code = 'successor'),
    '["Corporate trustee powers"]',
    null, 2, 1
);

-- Kathleen Geeslin Trust Trustees
INSERT OR IGNORE INTO trust_trustees (
    trust_id, trustee_name, trustee_type_id,
    powers, start_date, order_of_succession, is_active
) VALUES
(
    (SELECT id FROM trusts WHERE trust_id = 'trust-kgt-001'),
    'Nicholas Lynn Coleman',
    (SELECT id FROM trustee_types WHERE code = 'primary'),
    '["Investment and distribution decisions"]',
    '2023-01-01', 0, 1
),
(
    (SELECT id FROM trusts WHERE trust_id = 'trust-kgt-001'),
    'Kit Coleman',
    (SELECT id FROM trustee_types WHERE code = 'co-trustee'),
    '["Investment and distribution decisions"]',
    '2023-01-01', 0, 1
);

-- =============================================
-- TRUST BENEFICIARIES
-- =============================================

-- Nicholas Coleman Revocable Trust Beneficiaries
INSERT OR IGNORE INTO trust_beneficiaries (
    trust_id, beneficiary_name, beneficiary_type_id,
    relationship_type_id, percentage, conditions, is_active
) VALUES
(
    (SELECT id FROM trusts WHERE trust_id = 'trust-ncrt-001'),
    'Kelsey Fey Coleman',
    (SELECT id FROM beneficiary_types WHERE code = 'primary'),
    (SELECT id FROM relationship_types WHERE code = 'spouse'),
    100,
    'Marital Trust and Bypass Trust provisions',
    1
),
(
    (SELECT id FROM trusts WHERE trust_id = 'trust-ncrt-001'),
    'Coleman Children',
    (SELECT id FROM beneficiary_types WHERE code = 'contingent'),
    (SELECT id FROM relationship_types WHERE code = 'child'),
    null,
    'Age 18: trustee discretion distributions. Age 25: up to $300k for home purchase. Age 35: full access to trust assets.',
    1
),
(
    (SELECT id FROM trusts WHERE trust_id = 'trust-ncrt-001'),
    'Kit Coleman',
    (SELECT id FROM beneficiary_types WHERE code = 'remainder'),
    (SELECT id FROM relationship_types WHERE code = 'sibling'),
    null,
    'If no descendants, all assets pass to Kit Coleman',
    1
);

-- Kelsey Coleman Revocable Trust Beneficiaries
INSERT OR IGNORE INTO trust_beneficiaries (
    trust_id, beneficiary_name, beneficiary_type_id,
    relationship_type_id, percentage, conditions, is_active
) VALUES
(
    (SELECT id FROM trusts WHERE trust_id = 'trust-kcrt-001'),
    'Nicholas Lynn Coleman',
    (SELECT id FROM beneficiary_types WHERE code = 'primary'),
    (SELECT id FROM relationship_types WHERE code = 'spouse'),
    100,
    'Marital Trust and Bypass Trust provisions',
    1
),
(
    (SELECT id FROM trusts WHERE trust_id = 'trust-kcrt-001'),
    'Coleman Children',
    (SELECT id FROM beneficiary_types WHERE code = 'contingent'),
    (SELECT id FROM relationship_types WHERE code = 'child'),
    null,
    'Age 18: trustee discretion distributions. Age 25: up to $300k for home purchase. Age 35: full access to trust assets.',
    1
),
(
    (SELECT id FROM trusts WHERE trust_id = 'trust-kcrt-001'),
    'Yvonne Louise Westfall',
    (SELECT id FROM beneficiary_types WHERE code = 'remainder'),
    (SELECT id FROM relationship_types WHERE code = 'in_law'),
    null,
    'If no descendants, split equally among Hanzlik family (Yvonne, Joy, Emily, Samuel)',
    1
);

-- Kathleen Geeslin Trust Beneficiaries
INSERT OR IGNORE INTO trust_beneficiaries (
    trust_id, beneficiary_name, beneficiary_type_id,
    relationship_type_id, percentage, conditions, is_active
) VALUES
(
    (SELECT id FROM trusts WHERE trust_id = 'trust-kgt-001'),
    'Nicholas Lynn Coleman',
    (SELECT id FROM beneficiary_types WHERE code = 'primary'),
    (SELECT id FROM relationship_types WHERE code = 'child'),
    50, null, 1
),
(
    (SELECT id FROM trusts WHERE trust_id = 'trust-kgt-001'),
    'Kit Coleman',
    (SELECT id FROM beneficiary_types WHERE code = 'primary'),
    (SELECT id FROM relationship_types WHERE code = 'child'),
    50, null, 1
);

-- =============================================
-- BENEFICIARIES (Standalone)
-- =============================================

INSERT OR IGNORE INTO beneficiaries (
    beneficiary_id, user_id, name, relationship_type_id,
    percentage, is_primary, is_contingent, per_stirpes,
    primary_phone, email, preferred_contact, notes
) VALUES
-- Nick's beneficiaries
(
    'ben-001',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    'Kelsey Fey Coleman',
    (SELECT id FROM relationship_types WHERE code = 'spouse'),
    100, 1, 0, 0,
    '(501) 545-9627', 'kelseyfbrown@gmail.com', 'phone',
    'Primary beneficiary of all trust assets'
),
(
    'ben-002',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    'Coleman Children',
    (SELECT id FROM relationship_types WHERE code = 'child'),
    null, 0, 1, 1,
    null, null, null,
    'Contingent beneficiaries through Bypass Trust. Age 18: trustee discretion. Age 25: $300k home purchase. Age 35: full access.'
),
(
    'ben-003',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    'Kit Coleman',
    (SELECT id FROM relationship_types WHERE code = 'sibling'),
    null, 0, 1, 0,
    '(870) 740-8150', 'kitcoleman66@gmail.com', 'phone',
    'If no heirs, all to Kit'
),
-- Kelsey's beneficiaries
(
    'ben-004',
    (SELECT id FROM users WHERE external_id = 'user-kelsey-001'),
    'Nicholas Lynn Coleman',
    (SELECT id FROM relationship_types WHERE code = 'spouse'),
    100, 1, 0, 0,
    '(870) 740-0598', 'nickcoleman85@gmail.com', 'phone',
    'Primary beneficiary of all trust assets'
),
(
    'ben-005',
    (SELECT id FROM users WHERE external_id = 'user-kelsey-001'),
    'Yvonne Louise Westfall',
    (SELECT id FROM relationship_types WHERE code = 'in_law'),
    25, 0, 1, 0,
    '(501) 627-4978', 'yvonne.westfall79@gmail.com', 'phone',
    'If no heirs, split equally among Hanzlik family. Includes Kelsey''s IRAs.'
),
(
    'ben-006',
    (SELECT id FROM users WHERE external_id = 'user-kelsey-001'),
    'Joy Shepard',
    (SELECT id FROM relationship_types WHERE code = 'cousin'),
    25, 0, 1, 0,
    '(870) 588-1397', 'joyshepherd@yahoo.com', 'phone',
    'If no heirs, split equally among Hanzlik family'
),
(
    'ben-007',
    (SELECT id FROM users WHERE external_id = 'user-kelsey-001'),
    'Emily Hanzlik',
    (SELECT id FROM relationship_types WHERE code = 'other'),
    25, 0, 1, 0,
    '(870) 588-7650', null, 'phone',
    'If no heirs, split equally among Hanzlik family'
),
(
    'ben-008',
    (SELECT id FROM users WHERE external_id = 'user-kelsey-001'),
    'Samuel Hanzlik',
    (SELECT id FROM relationship_types WHERE code = 'other'),
    25, 0, 1, 0,
    '(870) 318-5895', null, 'phone',
    'If no heirs, split equally among Hanzlik family'
);

-- =============================================
-- LEGAL ROLES (Matching 10 Notion Designations)
-- =============================================

INSERT OR IGNORE INTO legal_roles (
    legal_role_id, user_id, role_type_id,
    person_id, person_name, is_primary,
    order_of_precedence, specific_powers,
    compensation_type, start_date, notes
) VALUES
-- Guardian for Children: Primary Yvonne, Backup Kit, Backup Joy
(
    'lr-001',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    (SELECT id FROM legal_role_types WHERE code = 'guardian'),
    'fm-003', 'Yvonne Louise Westfall', 1, 1,
    '["Physical custody of minor children", "Educational decisions", "Medical decisions", "Daily care"]',
    'none', null,
    'First choice guardian for future minor children'
),
(
    'lr-002',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    (SELECT id FROM legal_role_types WHERE code = 'guardian'),
    'fm-002', 'Kit Coleman', 0, 2,
    '["Physical custody of minor children", "Educational decisions", "Medical decisions", "Daily care"]',
    'none', null,
    'Backup guardian #1 for future minor children'
),
(
    'lr-003',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    (SELECT id FROM legal_role_types WHERE code = 'guardian'),
    'fm-004', 'Joy Shepard', 0, 3,
    '["Physical custody of minor children", "Educational decisions", "Medical decisions", "Daily care"]',
    'none', null,
    'Backup guardian #2 for future minor children'
),
-- Financial POA for Nick: Primary Kelsey
(
    'lr-004',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    (SELECT id FROM legal_role_types WHERE code = 'power_of_attorney'),
    'fm-001', 'Kelsey Fey Coleman', 1, 1,
    '["Banking and financial transactions", "Real estate transactions", "Tax matters", "Digital assets", "Business operations", "Investment decisions"]',
    'none', '2024-01-15',
    'Durable financial power of attorney for Nick'
),
-- Financial POA for Kelsey: Primary Nick
(
    'lr-005',
    (SELECT id FROM users WHERE external_id = 'user-kelsey-001'),
    (SELECT id FROM legal_role_types WHERE code = 'power_of_attorney'),
    null, 'Nicholas Lynn Coleman', 1, 1,
    '["Banking and financial transactions", "Real estate transactions", "Tax matters", "Digital assets", "Business operations", "Investment decisions"]',
    'none', '2024-01-15',
    'Durable financial power of attorney for Kelsey'
),
-- Financial POA if Both Incapacitated: Primary Arvest, Backup Kit
(
    'lr-006',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    (SELECT id FROM legal_role_types WHERE code = 'power_of_attorney'),
    'corp-001', 'Arvest Trust Company', 1, 1,
    '["Full financial management", "Corporate fiduciary services", "Trust administration"]',
    'percentage', '2024-01-15',
    'Financial POA if both Nick and Kelsey are incapacitated'
),
(
    'lr-007',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    (SELECT id FROM legal_role_types WHERE code = 'power_of_attorney'),
    'fm-002', 'Kit Coleman', 0, 2,
    '["Same powers as primary agent"]',
    'none', '2024-01-15',
    'Backup financial agent if both Nick and Kelsey are incapacitated'
),
-- Successor Agent for Nick: Primary Kit
(
    'lr-008',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    (SELECT id FROM legal_role_types WHERE code = 'successor_agent'),
    'fm-002', 'Kit Coleman', 1, 1,
    '["Full successor agent powers"]',
    'none', '2024-01-15',
    'Successor agent for Nick'
),
-- Successor Agent for Kelsey: Primary Yvonne, Backup Joy
(
    'lr-009',
    (SELECT id FROM users WHERE external_id = 'user-kelsey-001'),
    (SELECT id FROM legal_role_types WHERE code = 'successor_agent'),
    'fm-003', 'Yvonne Louise Westfall', 1, 1,
    '["Full successor agent powers"]',
    'none', '2024-01-15',
    'Successor agent for Kelsey'
),
(
    'lr-010',
    (SELECT id FROM users WHERE external_id = 'user-kelsey-001'),
    (SELECT id FROM legal_role_types WHERE code = 'successor_agent'),
    'fm-004', 'Joy Shepard', 0, 2,
    '["Full successor agent powers"]',
    'none', '2024-01-15',
    'Backup successor agent for Kelsey'
),
-- Executor for Nick: Primary Kelsey, Backup Arvest
(
    'lr-011',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    (SELECT id FROM legal_role_types WHERE code = 'executor'),
    'fm-001', 'Kelsey Fey Coleman', 1, 1,
    '["Probate estate administration", "Pay debts and taxes", "Distribute assets per will", "Sell real estate if needed", "Handle legal proceedings"]',
    'none', '2024-01-15',
    'Primary executor of pour-over will'
),
(
    'lr-012',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    (SELECT id FROM legal_role_types WHERE code = 'executor'),
    'corp-001', 'Arvest Trust Company', 0, 2,
    '["Full executor powers", "Corporate fiduciary services"]',
    'percentage', '2024-01-15',
    'Successor corporate executor'
),
-- Trustee for Nick: Self as primary, Kelsey as successor
(
    'lr-013',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    (SELECT id FROM legal_role_types WHERE code = 'trustee'),
    'self', 'Nicholas Lynn Coleman', 1, 1,
    '["Full control of trust assets", "Amend or revoke trust", "Investment decisions", "Distribution decisions"]',
    'none', '2024-01-15',
    'Initial trustee of revocable trust'
),
(
    'lr-014',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    (SELECT id FROM legal_role_types WHERE code = 'successor_trustee'),
    'fm-001', 'Kelsey Fey Coleman', 0, 1,
    '["Full trustee powers upon incapacity or death", "Cannot amend trust after grantor''s death"]',
    'none', '2024-01-15',
    'First successor trustee'
);

-- =============================================
-- HEALTHCARE DIRECTIVES
-- =============================================

-- Nick's Healthcare Proxy: Primary Kelsey, Backup Kit
INSERT OR IGNORE INTO healthcare_directives (
    directive_id, user_id, directive_type_id,
    person_id, person_name, is_primary,
    date_created, last_updated
) VALUES
(
    'hd-001',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    (SELECT id FROM healthcare_directive_types WHERE code = 'healthcare_proxy'),
    'fm-001', 'Kelsey Fey Coleman', 1,
    '2024-01-15', '2024-01-15'
),
(
    'hd-002',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    (SELECT id FROM healthcare_directive_types WHERE code = 'healthcare_proxy'),
    'fm-002', 'Kit Coleman', 0,
    '2024-01-15', '2024-01-15'
);

-- Nick's Living Will
INSERT OR IGNORE INTO healthcare_directives (
    directive_id, user_id, directive_type_id, is_primary,
    life_sustaining_decision, artificial_nutrition_decision,
    pain_management_instructions, organ_donation, body_disposition,
    religious_preferences, additional_instructions,
    date_created, last_updated
) VALUES (
    'hd-003',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    (SELECT id FROM healthcare_directive_types WHERE code = 'living_will'),
    1,
    'discontinue', 'discontinue',
    'Provide comfort care and pain management',
    0, 'burial', 'None specified',
    'Withhold artificial nutrition and hydration in terminal, end-stage, or permanent vegetative state',
    '2024-01-15', '2024-01-15'
);

-- Kelsey's Healthcare Proxy: Primary Nick, Backup Yvonne, Joy, Emily
INSERT OR IGNORE INTO healthcare_directives (
    directive_id, user_id, directive_type_id,
    person_id, person_name, is_primary,
    date_created, last_updated
) VALUES
(
    'hd-004',
    (SELECT id FROM users WHERE external_id = 'user-kelsey-001'),
    (SELECT id FROM healthcare_directive_types WHERE code = 'healthcare_proxy'),
    null, 'Nicholas Lynn Coleman', 1,
    '2024-01-15', '2024-01-15'
),
(
    'hd-005',
    (SELECT id FROM users WHERE external_id = 'user-kelsey-001'),
    (SELECT id FROM healthcare_directive_types WHERE code = 'healthcare_proxy'),
    'fm-003', 'Yvonne Louise Westfall', 0,
    '2024-01-15', '2024-01-15'
),
(
    'hd-006',
    (SELECT id FROM users WHERE external_id = 'user-kelsey-001'),
    (SELECT id FROM healthcare_directive_types WHERE code = 'healthcare_proxy'),
    'fm-004', 'Joy Shepard', 0,
    '2024-01-15', '2024-01-15'
),
(
    'hd-007',
    (SELECT id FROM users WHERE external_id = 'user-kelsey-001'),
    (SELECT id FROM healthcare_directive_types WHERE code = 'healthcare_proxy'),
    'fm-007', 'Emily Hanzlik', 0,
    '2024-01-15', '2024-01-15'
);

-- Kelsey's Living Will
INSERT OR IGNORE INTO healthcare_directives (
    directive_id, user_id, directive_type_id, is_primary,
    life_sustaining_decision, artificial_nutrition_decision,
    pain_management_instructions, organ_donation, body_disposition,
    religious_preferences, additional_instructions,
    date_created, last_updated
) VALUES (
    'hd-008',
    (SELECT id FROM users WHERE external_id = 'user-kelsey-001'),
    (SELECT id FROM healthcare_directive_types WHERE code = 'living_will'),
    1,
    'discontinue', 'discontinue',
    'Provide comfort care and pain management',
    0, 'burial', 'None specified',
    'Withhold artificial nutrition and hydration in terminal, end-stage, or permanent vegetative state',
    '2024-01-15', '2024-01-15'
);

-- =============================================
-- PROFESSIONALS
-- =============================================

INSERT OR IGNORE INTO professionals (
    professional_id, user_id, name, professional_type_id,
    firm, title, specializations,
    primary_phone, email, preferred_contact,
    street1, city, state, zip_code, country,
    years_experience, is_preferred_provider, notes
) VALUES
(
    'prof-001',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    'Adam Flock',
    (SELECT id FROM professional_types WHERE code = 'estate_attorney'),
    'RMP LLP', 'Lead Attorney',
    '["Estate Planning", "Trust Planning", "Probate", "Real Estate", "Tax Planning"]',
    '(479) 553-9800', NULL, 'phone',
    '809 SW A Street, Suite 105', 'Bentonville', 'AR', '72712', 'USA',
    3, 1, 'Lead estate planning attorney at RMP LLP. Associate: Sierra N. Glover (sglover@rmp.law)'
),
(
    'prof-002',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    'Arvest Wealth Management',
    (SELECT id FROM professional_types WHERE code = 'other'),
    'Arvest Bank', 'Trust Department',
    '["Trust Administration", "Wealth Management", "Fiduciary Services"]',
    '(479) 273-3331', 'trust@arvest.com', 'phone',
    '201 NE A St', 'Bentonville', 'AR', '72712', 'USA',
    null, 1, 'Corporate trustee for Geeslin Family Trust'
),
(
    'prof-003',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    'Marc Henline',
    (SELECT id FROM professional_types WHERE code = 'financial_advisor'),
    'Wells Fargo Advisors', 'Financial Advisor',
    '["Investment Management", "Retirement Planning", "Trust Investments"]',
    '(479) 756-0600', 'marc.henline@wellsfargoadvisors.com', 'phone',
    '438 Millsap Rd Suite 100', 'Fayetteville', 'AR', '72703', 'USA',
    null, 1, 'Manages trust investment accounts'
),
(
    'prof-004',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    'Nick Steimle, CPA',
    (SELECT id FROM professional_types WHERE code = 'accountant'),
    'Begley, Young & Company', 'CPA',
    '["Estate Tax", "Trust Taxation", "Business Tax", "Personal Tax"]',
    '(573) 334-4338', 'nick@begleycpa.com', 'email',
    '2103 Themis St.', 'Cape Girardeau', 'MO', '63701', 'USA',
    null, 1, 'Handles personal and trust tax returns'
);

-- =============================================
-- EMERGENCY CONTACTS
-- =============================================

INSERT OR IGNORE INTO emergency_contacts (
    contact_id, user_id, name, relationship_type_id,
    contact_type, primary_phone, secondary_phone, email,
    preferred_contact, priority, availability,
    medical_authority, can_make_decisions,
    languages, notes
) VALUES
(
    'ec-001',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    'Kelsey Fey Coleman',
    (SELECT id FROM relationship_types WHERE code = 'spouse'),
    'primary', '(501) 545-9627', null, 'kelseyfbrown@gmail.com',
    'phone', 1, '24/7', 1, 1,
    '["English"]',
    'Primary emergency contact and healthcare decision maker'
),
(
    'ec-002',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    'Kit Coleman',
    (SELECT id FROM relationship_types WHERE code = 'sibling'),
    'secondary', '(870) 740-8150', null, 'kitcoleman66@gmail.com',
    'phone', 2, '24/7', 1, 1,
    '["English"]',
    'Brother and successor healthcare agent'
),
(
    'ec-003',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    'Bobby Coleman',
    (SELECT id FROM relationship_types WHERE code = 'parent'),
    'secondary', '(870) 740-2086', null, 'bobbycoleman@icloud.com',
    'phone', 3, '24/7', 0, 0,
    '["English"]',
    'Nick''s father'
),
(
    'ec-004',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    'Yvonne Louise Westfall',
    (SELECT id FROM relationship_types WHERE code = 'in_law'),
    'secondary', '(501) 627-4978', null, 'yvonne.westfall79@gmail.com',
    'phone', 4, '24/7', 0, 0,
    '["English"]',
    'Kelsey''s mother'
);

-- =============================================
-- ASSETS DATA (38 assets from Notion)
-- =============================================

INSERT OR IGNORE INTO assets (
    asset_id, user_id, name, category, value,
    ownership_type, ownership_details, asset_details, notes
) VALUES

-- =============================================
-- REAL ESTATE (4 assets)
-- =============================================
(
    'ea-re-001',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    '2211 NW Willow, Bentonville, AR',
    'REAL_ESTATE',
    746400,
    'JOINT',
    '{"owners": ["Nicholas Lynn Coleman", "Kelsey Fey Coleman"], "percentage": 50, "notes": "50% owned by Nicholas Coleman Trust, 50% by Kelsey Coleman Trust"}',
    '{"propertyType": "SINGLE_FAMILY", "address": "2211 NW Willow, Bentonville, AR 72712", "lastAppraisalValue": 746400}',
    'Primary residence, transferred to trusts via Warranty Deed'
),
(
    'ea-re-002',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    'Pemiscot Farmland (Geeslin Trust)',
    'REAL_ESTATE',
    554500,
    'TRUST',
    '{"trustId": "trust-kgt-001", "percentage": 50, "coOwner": "Kit Coleman", "notes": "Nick owns 50%, Kit owns 50%. Full value $1,109,000."}',
    '{"propertyType": "FARMLAND", "address": "Pemiscot County, MO", "fullValue": 1109000, "ownershipShare": 0.50}',
    'Nick''s 50% share of inherited farmland. Full value $1,109,000. Kit Coleman owns other 50%.'
),
(
    'ea-re-003',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    '3 Rio Vista Circle, Hardy AR 72542',
    'REAL_ESTATE',
    115100,
    'JOINT',
    '{"owners": ["Nicholas Lynn Coleman", "Kelsey Fey Coleman"], "notes": "Vacation/family property"}',
    '{"propertyType": "SINGLE_FAMILY", "address": "3 Rio Vista Circle, Hardy, AR 72542", "lastAppraisalValue": 115100}',
    'Family property in Hardy, AR'
),
(
    'ea-re-004',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    'Blytheville Lot',
    'REAL_ESTATE',
    50000,
    'JOINT',
    '{"owners": ["Nicholas Lynn Coleman", "Kelsey Fey Coleman"], "notes": "Vacant lot"}',
    '{"propertyType": "LAND", "address": "Blytheville, AR", "lastAppraisalValue": 50000}',
    'Vacant lot in Blytheville'
),

-- =============================================
-- VEHICLES (2 assets)
-- =============================================
(
    'ea-pp-001',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    '2021 BMW X5',
    'PERSONAL_PROPERTY',
    44157,
    'INDIVIDUAL',
    '{"owner": "Nicholas Lynn Coleman"}',
    '{"propertyType": "VEHICLE", "year": 2021, "make": "BMW", "model": "X5"}',
    'Nick''s vehicle'
),
(
    'ea-pp-002',
    (SELECT id FROM users WHERE external_id = 'user-kelsey-001'),
    '2025 Honda CRV',
    'PERSONAL_PROPERTY',
    40000,
    'INDIVIDUAL',
    '{"owner": "Kelsey Fey Coleman"}',
    '{"propertyType": "VEHICLE", "year": 2025, "make": "Honda", "model": "CRV"}',
    'Kelsey''s vehicle'
),

-- =============================================
-- INVESTMENT ACCOUNTS - NICK (11 assets)
-- =============================================
(
    'ea-fa-001',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    'Northwestern Mutual Solo 401(k)',
    'FINANCIAL_ACCOUNT',
    315750,
    'INDIVIDUAL',
    '{"owner": "Nicholas Lynn Coleman", "notes": "Coleman Law Firm retirement plan"}',
    '{"accountType": "RETIREMENT_401K", "institution": "Northwestern Mutual", "accountNumber": "****1281"}',
    'Law firm 401(k) plan'
),
(
    'ea-fa-002',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    'Wells Fargo - Recently Inherited',
    'FINANCIAL_ACCOUNT',
    1031991.91,
    'INDIVIDUAL',
    '{"owner": "Nicholas Lynn Coleman", "notes": "Recently inherited assets"}',
    '{"accountType": "INVESTMENT_BROKERAGE", "institution": "Wells Fargo", "accountNumber": "****0884"}',
    'Recently inherited brokerage account'
),
(
    'ea-fa-003',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    'Wells Fargo Advisors - Brokerage IRA',
    'FINANCIAL_ACCOUNT',
    283447.52,
    'INDIVIDUAL',
    '{"owner": "Nicholas Lynn Coleman"}',
    '{"accountType": "TRADITIONAL_IRA", "institution": "Wells Fargo Advisors", "accountNumber": "****6140"}',
    'Traditional IRA brokerage account'
),
(
    'ea-fa-004',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    'Wells Fargo (Pollard-Geeslin) Brokerage 1',
    'FINANCIAL_ACCOUNT',
    600995.75,
    'TRUST',
    '{"trustId": "trust-kgt-001", "percentage": 50, "coOwner": "Kit Coleman", "notes": "Nick owns 50%, Kit owns 50%. Full value $1,201,991.50."}',
    '{"accountType": "INVESTMENT_BROKERAGE", "institution": "Wells Fargo", "accountNumber": "****3355", "fullValue": 1201991.50, "ownershipShare": 0.50}',
    'Nick''s 50% share. Full value $1,201,991.50. Kit Coleman owns other 50%.'
),
(
    'ea-fa-005',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    'Wells Fargo (Pollard-Geeslin) Brokerage 2',
    'FINANCIAL_ACCOUNT',
    442150.36,
    'TRUST',
    '{"trustId": "trust-kgt-001", "percentage": 50, "coOwner": "Kit Coleman", "notes": "Nick owns 50%, Kit owns 50%. Full value $884,300.72."}',
    '{"accountType": "INVESTMENT_BROKERAGE", "institution": "Wells Fargo", "accountNumber": "****2780", "fullValue": 884300.72, "ownershipShare": 0.50}',
    'Nick''s 50% share. Full value $884,300.72. Kit Coleman owns other 50%.'
),
(
    'ea-fa-006',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    'Wells Fargo - Brokerage',
    'FINANCIAL_ACCOUNT',
    282224.28,
    'INDIVIDUAL',
    '{"owner": "Nicholas Lynn Coleman"}',
    '{"accountType": "INVESTMENT_BROKERAGE", "institution": "Wells Fargo", "accountNumber": "****6625"}',
    'Personal brokerage account'
),
(
    'ea-fa-007',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    'Wells Fargo - IRA + Home Sale Proceeds',
    'FINANCIAL_ACCOUNT',
    275326.34,
    'INDIVIDUAL',
    '{"owner": "Nicholas Lynn Coleman"}',
    '{"accountType": "TRADITIONAL_IRA", "institution": "Wells Fargo", "accountNumber": "****6625"}',
    'Traditional IRA including home sale proceeds'
),
(
    'ea-fa-008',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    'Wells Fargo - SEP IRA',
    'FINANCIAL_ACCOUNT',
    60899.60,
    'INDIVIDUAL',
    '{"owner": "Nicholas Lynn Coleman"}',
    '{"accountType": "SEP_IRA", "institution": "Wells Fargo", "accountNumber": "****6920"}',
    'SEP IRA for law firm'
),
(
    'ea-fa-009',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    'Wells Fargo - IRA (Inherited)',
    'FINANCIAL_ACCOUNT',
    63823.72,
    'INDIVIDUAL',
    '{"owner": "Nicholas Lynn Coleman", "notes": "Inherited IRA"}',
    '{"accountType": "TRADITIONAL_IRA", "institution": "Wells Fargo", "accountNumber": "****0080"}',
    'Inherited traditional IRA'
),
(
    'ea-fa-010',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    'Wells Fargo - Roth IRA',
    'FINANCIAL_ACCOUNT',
    67.74,
    'INDIVIDUAL',
    '{"owner": "Nicholas Lynn Coleman"}',
    '{"accountType": "ROTH_IRA", "institution": "Wells Fargo", "accountNumber": "****9141"}',
    'Roth IRA'
),
(
    'ea-fa-011',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    'Wells Fargo - Brokerage IRA',
    'FINANCIAL_ACCOUNT',
    44.41,
    'INDIVIDUAL',
    '{"owner": "Nicholas Lynn Coleman"}',
    '{"accountType": "TRADITIONAL_IRA", "institution": "Wells Fargo", "accountNumber": "****6702"}',
    'Traditional IRA brokerage'
),

-- =============================================
-- INVESTMENT ACCOUNTS - KELSEY (5 assets)
-- =============================================
(
    'ea-fa-012',
    (SELECT id FROM users WHERE external_id = 'user-kelsey-001'),
    'Wells Fargo - Brokerage IRA (Traditional)',
    'FINANCIAL_ACCOUNT',
    195249,
    'INDIVIDUAL',
    '{"owner": "Kelsey Fey Coleman"}',
    '{"accountType": "TRADITIONAL_IRA", "institution": "Wells Fargo", "accountNumber": "****5487"}',
    'Kelsey''s traditional IRA'
),
(
    'ea-fa-013',
    (SELECT id FROM users WHERE external_id = 'user-kelsey-001'),
    'Wells Fargo - Brokerage IRA (Roth)',
    'FINANCIAL_ACCOUNT',
    60717,
    'INDIVIDUAL',
    '{"owner": "Kelsey Fey Coleman"}',
    '{"accountType": "ROTH_IRA", "institution": "Wells Fargo", "accountNumber": "****9389"}',
    'Kelsey''s Roth IRA'
),
(
    'ea-fa-014',
    (SELECT id FROM users WHERE external_id = 'user-kelsey-001'),
    'Wells Fargo - Brokerage',
    'FINANCIAL_ACCOUNT',
    18395,
    'INDIVIDUAL',
    '{"owner": "Kelsey Fey Coleman"}',
    '{"accountType": "INVESTMENT_BROKERAGE", "institution": "Wells Fargo", "accountNumber": "****5329"}',
    'Kelsey''s brokerage account'
),
(
    'ea-fa-015',
    (SELECT id FROM users WHERE external_id = 'user-kelsey-001'),
    'Computer Share - Walmart Stock',
    'FINANCIAL_ACCOUNT',
    72000,
    'INDIVIDUAL',
    '{"owner": "Kelsey Fey Coleman"}',
    '{"accountType": "INVESTMENT_BROKERAGE", "institution": "ComputerShare", "accountNumber": "****9996"}',
    'Walmart stock via ComputerShare'
),
(
    'ea-fa-016',
    (SELECT id FROM users WHERE external_id = 'user-kelsey-001'),
    'Merrill Lynch - Walmart Stock',
    'FINANCIAL_ACCOUNT',
    22098,
    'INDIVIDUAL',
    '{"owner": "Kelsey Fey Coleman"}',
    '{"accountType": "INVESTMENT_BROKERAGE", "institution": "Merrill Lynch", "accountNumber": "****8114"}',
    'Walmart stock via Merrill Lynch'
),

-- =============================================
-- INVESTMENT ACCOUNTS - JOINT (1 asset)
-- =============================================
(
    'ea-fa-017',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    'Fidelity - HSA',
    'FINANCIAL_ACCOUNT',
    2950.57,
    'JOINT',
    '{"owners": ["Nicholas Lynn Coleman", "Kelsey Fey Coleman"]}',
    '{"accountType": "HSA", "institution": "Fidelity", "accountNumber": "****5257"}',
    'Joint Health Savings Account'
),

-- =============================================
-- BANK ACCOUNTS - JOINT (3 assets)
-- =============================================
(
    'ea-ba-001',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    'Arvest - Joint Checking',
    'FINANCIAL_ACCOUNT',
    7947.74,
    'JOINT',
    '{"owners": ["Nicholas Lynn Coleman", "Kelsey Fey Coleman"]}',
    '{"accountType": "CHECKING", "institution": "Arvest Bank", "accountNumber": "****9373"}',
    'Joint checking account'
),
(
    'ea-ba-002',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    'Arvest - Joint Savings',
    'FINANCIAL_ACCOUNT',
    3329.72,
    'JOINT',
    '{"owners": ["Nicholas Lynn Coleman", "Kelsey Fey Coleman"]}',
    '{"accountType": "SAVINGS", "institution": "Arvest Bank", "accountNumber": "****8047"}',
    'Joint savings account'
),
(
    'ea-ba-003',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    'Arvest - Joint Vacation Savings',
    'FINANCIAL_ACCOUNT',
    2125,
    'JOINT',
    '{"owners": ["Nicholas Lynn Coleman", "Kelsey Fey Coleman"]}',
    '{"accountType": "SAVINGS", "institution": "Arvest Bank", "accountNumber": "****4220"}',
    'Joint vacation savings account'
),

-- =============================================
-- BANK ACCOUNTS - NICK (3 assets)
-- =============================================
(
    'ea-ba-004',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    'Arvest - Coleman Law Firm Operating',
    'FINANCIAL_ACCOUNT',
    19984.94,
    'INDIVIDUAL',
    '{"owner": "Nicholas Lynn Coleman", "notes": "Coleman Law Firm operating account"}',
    '{"accountType": "CHECKING", "institution": "Arvest Bank", "accountNumber": "****9375"}',
    'Coleman Law Firm operating checking account'
),
(
    'ea-ba-005',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    'Arvest - Individual Checking',
    'FINANCIAL_ACCOUNT',
    4928.03,
    'INDIVIDUAL',
    '{"owner": "Nicholas Lynn Coleman"}',
    '{"accountType": "CHECKING", "institution": "Arvest Bank", "accountNumber": "****6738"}',
    'Nick''s individual checking account'
),
(
    'ea-ba-006',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    'Arvest - Coleman Law Firm Money Market',
    'FINANCIAL_ACCOUNT',
    5325.74,
    'INDIVIDUAL',
    '{"owner": "Nicholas Lynn Coleman", "notes": "Coleman Law Firm money market"}',
    '{"accountType": "SAVINGS", "institution": "Arvest Bank", "accountNumber": "****0202"}',
    'Coleman Law Firm money market account'
),

-- =============================================
-- BANK ACCOUNTS - KELSEY (7 assets)
-- =============================================
(
    'ea-ba-007',
    (SELECT id FROM users WHERE external_id = 'user-kelsey-001'),
    'Capital One - Emergency',
    'FINANCIAL_ACCOUNT',
    10645,
    'INDIVIDUAL',
    '{"owner": "Kelsey Fey Coleman"}',
    '{"accountType": "SAVINGS", "institution": "Capital One", "accountNumber": "****0437"}',
    'Kelsey''s emergency savings'
),
(
    'ea-ba-008',
    (SELECT id FROM users WHERE external_id = 'user-kelsey-001'),
    'Capital One - Checking',
    'FINANCIAL_ACCOUNT',
    1097,
    'INDIVIDUAL',
    '{"owner": "Kelsey Fey Coleman"}',
    '{"accountType": "CHECKING", "institution": "Capital One", "accountNumber": "****8998"}',
    'Kelsey''s checking account'
),
(
    'ea-ba-009',
    (SELECT id FROM users WHERE external_id = 'user-kelsey-001'),
    'Capital One - Savings Travel',
    'FINANCIAL_ACCOUNT',
    3212,
    'INDIVIDUAL',
    '{"owner": "Kelsey Fey Coleman"}',
    '{"accountType": "SAVINGS", "institution": "Capital One", "accountNumber": "****6101"}',
    'Kelsey''s travel savings'
),
(
    'ea-ba-010',
    (SELECT id FROM users WHERE external_id = 'user-kelsey-001'),
    'Capital One - Savings Spending',
    'FINANCIAL_ACCOUNT',
    6010,
    'INDIVIDUAL',
    '{"owner": "Kelsey Fey Coleman"}',
    '{"accountType": "SAVINGS", "institution": "Capital One", "accountNumber": "****7416"}',
    'Kelsey''s spending savings'
),
(
    'ea-ba-011',
    (SELECT id FROM users WHERE external_id = 'user-kelsey-001'),
    'Capital One - Hanzlik (Moms $)',
    'FINANCIAL_ACCOUNT',
    19017,
    'INDIVIDUAL',
    '{"owner": "Kelsey Fey Coleman"}',
    '{"accountType": "SAVINGS", "institution": "Capital One", "accountNumber": "****1703"}',
    'Kelsey''s Hanzlik family savings (Mom''s money)'
),
(
    'ea-ba-012',
    (SELECT id FROM users WHERE external_id = 'user-kelsey-001'),
    'Chase - Checking Willow Consulting',
    'FINANCIAL_ACCOUNT',
    4128,
    'INDIVIDUAL',
    '{"owner": "Kelsey Fey Coleman", "notes": "Willow Consulting business account"}',
    '{"accountType": "CHECKING", "institution": "Chase", "accountNumber": "****0276"}',
    'Willow Consulting checking account'
),
(
    'ea-ba-013',
    (SELECT id FROM users WHERE external_id = 'user-kelsey-001'),
    'Chase - Savings Willow Consulting',
    'FINANCIAL_ACCOUNT',
    1926,
    'INDIVIDUAL',
    '{"owner": "Kelsey Fey Coleman", "notes": "Willow Consulting business savings"}',
    '{"accountType": "SAVINGS", "institution": "Chase", "accountNumber": "****9220"}',
    'Willow Consulting savings account'
),

-- =============================================
-- INSURANCE (2 assets)
-- =============================================
(
    'ea-ip-001',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    'Northwestern Mutual - Life Insurance',
    'INSURANCE_POLICY',
    37395,
    'INDIVIDUAL',
    '{"owner": "Nicholas Lynn Coleman"}',
    '{"policyType": "LIFE", "insurer": "Northwestern Mutual", "policyNumber": "****3413", "coverageAmount": 37395}',
    'Life insurance policy - coverage amount'
),
(
    'ea-ip-002',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    'Northwestern Mutual - Disability Insurance',
    'INSURANCE_POLICY',
    5201,
    'INDIVIDUAL',
    '{"owner": "Nicholas Lynn Coleman"}',
    '{"policyType": "DISABILITY", "insurer": "Northwestern Mutual", "policyNumber": "****4309", "monthlyBenefit": 5201}',
    'Disability insurance - monthly benefit amount'
);

-- =============================================
-- WILLS
-- =============================================

INSERT OR IGNORE INTO wills (
    will_id, user_id, document_name, testator_name,
    date_created, date_signed, status,
    executor_primary, executor_secondary,
    witness1_name, witness2_name, notary_name, notary_state,
    residuary_clause, revokes_prior, attorney_name, law_firm, notes
) VALUES
(
    'will-nick-001',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    'Last Will and Testament of Nicholas Lynn Coleman',
    'Nicholas Lynn Coleman',
    '2024-01-15', '2024-01-15', 'EXECUTED',
    'Kelsey Fey Coleman', 'Kit Coleman',
    'Witness One', 'Witness Two', 'Notary Public', 'AR',
    'All remaining assets to be distributed per trust provisions',
    1, 'Estate Planning Attorney', 'Estate Law Firm',
    'Executed alongside trust documents. Pour-over will directing assets to trusts.'
),
(
    'will-kelsey-001',
    (SELECT id FROM users WHERE external_id = 'user-kelsey-001'),
    'Last Will and Testament of Kelsey Fey Coleman',
    'Kelsey Fey Coleman',
    '2024-01-15', '2024-01-15', 'EXECUTED',
    'Nicholas Lynn Coleman', 'Yvonne Louise Westfall',
    'Witness One', 'Witness Two', 'Notary Public', 'AR',
    'All remaining assets to be distributed per trust provisions',
    1, 'Estate Planning Attorney', 'Estate Law Firm',
    'Executed alongside trust documents. Pour-over will directing assets to trusts.'
);

-- =============================================
-- POWERS OF ATTORNEY
-- =============================================

INSERT OR IGNORE INTO powers_of_attorney (
    poa_id, user_id, document_name, type,
    principal_name, agent_primary, agent_secondary,
    effective_date, durable, status,
    financial_powers, real_estate_powers, tax_powers,
    date_signed, attorney_name, law_firm, notes
) VALUES
(
    'poa-nick-fin-001',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    'Durable Financial Power of Attorney - Nick Coleman',
    'FINANCIAL',
    'Nicholas Lynn Coleman', 'Kelsey Fey Coleman', 'Kit Coleman',
    '2024-01-15', 1, 'ACTIVE',
    'Full authority over financial accounts and investments',
    'Full authority over real estate transactions',
    'Full authority to file tax returns and handle tax matters',
    '2024-01-15', 'Estate Planning Attorney', 'Estate Law Firm',
    'Durable financial POA effective immediately'
),
(
    'poa-nick-hc-001',
    (SELECT id FROM users WHERE external_id = 'user-nick-001'),
    'Healthcare Power of Attorney - Nick Coleman',
    'HEALTHCARE',
    'Nicholas Lynn Coleman', 'Kelsey Fey Coleman', 'Kit Coleman',
    '2024-01-15', 1, 'ACTIVE',
    null, null, null,
    '2024-01-15', 'Estate Planning Attorney', 'Estate Law Firm',
    'Healthcare POA - supplements healthcare directives'
),
(
    'poa-kelsey-fin-001',
    (SELECT id FROM users WHERE external_id = 'user-kelsey-001'),
    'Durable Financial Power of Attorney - Kelsey Coleman',
    'FINANCIAL',
    'Kelsey Fey Coleman', 'Nicholas Lynn Coleman', 'Yvonne Louise Westfall',
    '2024-01-15', 1, 'ACTIVE',
    'Full authority over financial accounts and investments',
    'Full authority over real estate transactions',
    'Full authority to file tax returns and handle tax matters',
    '2024-01-15', 'Estate Planning Attorney', 'Estate Law Firm',
    'Durable financial POA effective immediately'
),
(
    'poa-kelsey-hc-001',
    (SELECT id FROM users WHERE external_id = 'user-kelsey-001'),
    'Healthcare Power of Attorney - Kelsey Coleman',
    'HEALTHCARE',
    'Kelsey Fey Coleman', 'Nicholas Lynn Coleman', 'Yvonne Louise Westfall',
    '2024-01-15', 1, 'ACTIVE',
    null, null, null,
    '2024-01-15', 'Estate Planning Attorney', 'Estate Law Firm',
    'Healthcare POA - supplements healthcare directives'
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
    '{"migration": "sqlite-seed-data.sql", "status": "completed", "source": "Notion Coleman Trust & Estate", "timestamp": "' || datetime('now') || '"}'
);
