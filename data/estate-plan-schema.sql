-- EstateEase SQL Server Database Schema
-- Migration from estate-plan-data.ts constants
-- Created: 2025-07-07

-- Enable ANSI NULL behavior
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- Create schema if not exists
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'estate')
BEGIN
    EXEC('CREATE SCHEMA estate');
END
GO

-- =============================================
-- LOOKUP TABLES (Reference Data)
-- =============================================

-- Trust Types
CREATE TABLE estate.TrustTypes (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Code NVARCHAR(50) NOT NULL UNIQUE,
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500),
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Trustee Types
CREATE TABLE estate.TrusteeTypes (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Code NVARCHAR(50) NOT NULL UNIQUE,
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500),
    SortOrder INT NOT NULL DEFAULT 0,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Beneficiary Types
CREATE TABLE estate.BeneficiaryTypes (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Code NVARCHAR(50) NOT NULL UNIQUE,
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Legal Role Types
CREATE TABLE estate.LegalRoleTypes (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Code NVARCHAR(50) NOT NULL UNIQUE,
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Healthcare Directive Types
CREATE TABLE estate.HealthcareDirectiveTypes (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Code NVARCHAR(50) NOT NULL UNIQUE,
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Professional Types
CREATE TABLE estate.ProfessionalTypes (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Code NVARCHAR(50) NOT NULL UNIQUE,
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Relationship Types
CREATE TABLE estate.RelationshipTypes (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Code NVARCHAR(50) NOT NULL UNIQUE,
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- =============================================
-- CORE TABLES
-- =============================================

-- Users (Estate Plan Owners)
CREATE TABLE estate.Users (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ExternalId NVARCHAR(100) UNIQUE, -- For integration with auth system
    FirstName NVARCHAR(100) NOT NULL,
    MiddleName NVARCHAR(100),
    LastName NVARCHAR(100) NOT NULL,
    Email NVARCHAR(255) NOT NULL UNIQUE,
    PhoneNumber NVARCHAR(20),
    DateOfBirth DATE,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- Trusts
CREATE TABLE estate.Trusts (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    TrustId NVARCHAR(50) NOT NULL UNIQUE, -- Maps to 'id' in TypeScript
    Name NVARCHAR(255) NOT NULL,
    TrustTypeId INT NOT NULL FOREIGN KEY REFERENCES estate.TrustTypes(Id),
    TaxId NVARCHAR(50), -- Encrypted in production
    DateCreated DATE NOT NULL,
    Grantor NVARCHAR(255) NOT NULL,
    Purpose NVARCHAR(MAX),
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedBy INT NOT NULL FOREIGN KEY REFERENCES estate.Users(Id),
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    INDEX IX_Trusts_TrustId NONCLUSTERED (TrustId),
    INDEX IX_Trusts_CreatedBy NONCLUSTERED (CreatedBy)
);

-- Trust Trustees (Many-to-Many)
CREATE TABLE estate.TrustTrustees (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    TrustId INT NOT NULL FOREIGN KEY REFERENCES estate.Trusts(Id),
    TrusteeName NVARCHAR(255) NOT NULL,
    TrusteeTypeId INT NOT NULL FOREIGN KEY REFERENCES estate.TrusteeTypes(Id),
    Powers NVARCHAR(MAX), -- JSON array stored as string
    StartDate DATE,
    EndDate DATE,
    OrderOfSuccession INT,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    INDEX IX_TrustTrustees_TrustId NONCLUSTERED (TrustId),
    INDEX IX_TrustTrustees_TrusteeTypeId NONCLUSTERED (TrusteeTypeId)
);

-- Trust Beneficiaries (Many-to-Many)
CREATE TABLE estate.TrustBeneficiaries (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    TrustId INT NOT NULL FOREIGN KEY REFERENCES estate.Trusts(Id),
    BeneficiaryName NVARCHAR(255) NOT NULL,
    BeneficiaryTypeId INT NOT NULL FOREIGN KEY REFERENCES estate.BeneficiaryTypes(Id),
    RelationshipTypeId INT NOT NULL FOREIGN KEY REFERENCES estate.RelationshipTypes(Id),
    Percentage DECIMAL(5,2) CHECK (Percentage >= 0 AND Percentage <= 100),
    Conditions NVARCHAR(MAX),
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    INDEX IX_TrustBeneficiaries_TrustId NONCLUSTERED (TrustId)
);

-- Family Members
CREATE TABLE estate.FamilyMembers (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    FamilyMemberId NVARCHAR(50) NOT NULL UNIQUE, -- Maps to 'id' in TypeScript
    UserId INT NOT NULL FOREIGN KEY REFERENCES estate.Users(Id),
    Name NVARCHAR(255) NOT NULL,
    RelationshipTypeId INT NOT NULL FOREIGN KEY REFERENCES estate.RelationshipTypes(Id),
    DateOfBirth DATE,
    IsMinor BIT NOT NULL DEFAULT 0,
    IsDependent BIT NOT NULL DEFAULT 0,
    PrimaryPhone NVARCHAR(20),
    SecondaryPhone NVARCHAR(20),
    Email NVARCHAR(255),
    PreferredContact NVARCHAR(50),
    Street1 NVARCHAR(255),
    Street2 NVARCHAR(255),
    City NVARCHAR(100),
    State NVARCHAR(50),
    ZipCode NVARCHAR(20),
    Country NVARCHAR(100) DEFAULT 'USA',
    Notes NVARCHAR(MAX),
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    INDEX IX_FamilyMembers_UserId NONCLUSTERED (UserId),
    INDEX IX_FamilyMembers_FamilyMemberId NONCLUSTERED (FamilyMemberId)
);

-- Legal Roles
CREATE TABLE estate.LegalRoles (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    LegalRoleId NVARCHAR(50) NOT NULL UNIQUE, -- Maps to 'id' in TypeScript
    UserId INT NOT NULL FOREIGN KEY REFERENCES estate.Users(Id),
    RoleTypeId INT NOT NULL FOREIGN KEY REFERENCES estate.LegalRoleTypes(Id),
    PersonId NVARCHAR(50), -- References FamilyMemberId or external ID
    PersonName NVARCHAR(255) NOT NULL,
    IsPrimary BIT NOT NULL DEFAULT 0,
    OrderOfPrecedence INT,
    SpecificPowers NVARCHAR(MAX), -- JSON array stored as string
    CompensationType NVARCHAR(50),
    CompensationAmount DECIMAL(10,2),
    CompensationDetails NVARCHAR(500),
    StartDate DATE,
    EndDate DATE,
    EndConditions NVARCHAR(500),
    Notes NVARCHAR(MAX),
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    INDEX IX_LegalRoles_UserId NONCLUSTERED (UserId),
    INDEX IX_LegalRoles_RoleTypeId NONCLUSTERED (RoleTypeId)
);

-- Healthcare Directives
CREATE TABLE estate.HealthcareDirectives (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    DirectiveId NVARCHAR(50) NOT NULL UNIQUE, -- Maps to 'id' in TypeScript
    UserId INT NOT NULL FOREIGN KEY REFERENCES estate.Users(Id),
    DirectiveTypeId INT NOT NULL FOREIGN KEY REFERENCES estate.HealthcareDirectiveTypes(Id),
    PersonId NVARCHAR(50), -- For healthcare proxy
    PersonName NVARCHAR(255),
    IsPrimary BIT NOT NULL DEFAULT 0,
    -- Living Will Decisions (stored as separate columns for querying)
    LifeSustainingDecision NVARCHAR(50),
    ArtificialNutritionDecision NVARCHAR(50),
    PainManagementInstructions NVARCHAR(MAX),
    OrganDonation BIT,
    BodyDisposition NVARCHAR(50),
    ReligiousPreferences NVARCHAR(500),
    AdditionalInstructions NVARCHAR(MAX),
    DateCreated DATE NOT NULL,
    LastUpdated DATE NOT NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    INDEX IX_HealthcareDirectives_UserId NONCLUSTERED (UserId),
    INDEX IX_HealthcareDirectives_DirectiveTypeId NONCLUSTERED (DirectiveTypeId)
);

-- Beneficiaries (Standalone beneficiary records)
CREATE TABLE estate.Beneficiaries (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    BeneficiaryId NVARCHAR(50) NOT NULL UNIQUE, -- Maps to 'id' in TypeScript
    UserId INT NOT NULL FOREIGN KEY REFERENCES estate.Users(Id),
    Name NVARCHAR(255) NOT NULL,
    RelationshipTypeId INT NOT NULL FOREIGN KEY REFERENCES estate.RelationshipTypes(Id),
    Percentage DECIMAL(5,2),
    IsPrimary BIT NOT NULL DEFAULT 0,
    IsContingent BIT NOT NULL DEFAULT 0,
    ContingentTo NVARCHAR(50), -- References another BeneficiaryId
    PerStirpes BIT NOT NULL DEFAULT 0,
    PrimaryPhone NVARCHAR(20),
    Email NVARCHAR(255),
    PreferredContact NVARCHAR(50),
    Notes NVARCHAR(MAX),
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    INDEX IX_Beneficiaries_UserId NONCLUSTERED (UserId)
);

-- Professionals
CREATE TABLE estate.Professionals (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ProfessionalId NVARCHAR(50) NOT NULL UNIQUE, -- Maps to 'id' in TypeScript
    UserId INT NOT NULL FOREIGN KEY REFERENCES estate.Users(Id),
    Name NVARCHAR(255) NOT NULL,
    ProfessionalTypeId INT NOT NULL FOREIGN KEY REFERENCES estate.ProfessionalTypes(Id),
    Firm NVARCHAR(255),
    Title NVARCHAR(100),
    Specializations NVARCHAR(MAX), -- JSON array stored as string
    PrimaryPhone NVARCHAR(20),
    SecondaryPhone NVARCHAR(20),
    Email NVARCHAR(255),
    PreferredContact NVARCHAR(50),
    Street1 NVARCHAR(255),
    Street2 NVARCHAR(255),
    City NVARCHAR(100),
    State NVARCHAR(50),
    ZipCode NVARCHAR(20),
    Country NVARCHAR(100) DEFAULT 'USA',
    Credentials NVARCHAR(MAX), -- JSON array stored as string
    YearsExperience INT,
    IsPreferredProvider BIT NOT NULL DEFAULT 0,
    Notes NVARCHAR(MAX),
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    INDEX IX_Professionals_UserId NONCLUSTERED (UserId),
    INDEX IX_Professionals_ProfessionalTypeId NONCLUSTERED (ProfessionalTypeId)
);

-- Emergency Contacts
CREATE TABLE estate.EmergencyContacts (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    ContactId NVARCHAR(50) NOT NULL UNIQUE, -- Maps to 'id' in TypeScript
    UserId INT NOT NULL FOREIGN KEY REFERENCES estate.Users(Id),
    Name NVARCHAR(255) NOT NULL,
    RelationshipTypeId INT NOT NULL FOREIGN KEY REFERENCES estate.RelationshipTypes(Id),
    ContactType NVARCHAR(50) NOT NULL, -- primary, secondary, etc.
    PrimaryPhone NVARCHAR(20) NOT NULL,
    SecondaryPhone NVARCHAR(20),
    Email NVARCHAR(255),
    PreferredContact NVARCHAR(50),
    Priority INT NOT NULL DEFAULT 999,
    Availability NVARCHAR(100),
    MedicalAuthority BIT NOT NULL DEFAULT 0,
    CanMakeDecisions BIT NOT NULL DEFAULT 0,
    Languages NVARCHAR(MAX), -- JSON array stored as string
    Notes NVARCHAR(MAX),
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    INDEX IX_EmergencyContacts_UserId NONCLUSTERED (UserId),
    INDEX IX_EmergencyContacts_Priority NONCLUSTERED (Priority)
);

-- =============================================
-- AUDIT AND TRACKING
-- =============================================

-- Audit Log for tracking changes
CREATE TABLE estate.AuditLog (
    Id BIGINT IDENTITY(1,1) PRIMARY KEY,
    TableName NVARCHAR(128) NOT NULL,
    RecordId INT NOT NULL,
    Action NVARCHAR(50) NOT NULL, -- INSERT, UPDATE, DELETE
    UserId INT NOT NULL,
    OldValues NVARCHAR(MAX), -- JSON
    NewValues NVARCHAR(MAX), -- JSON
    ChangedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    INDEX IX_AuditLog_TableName_RecordId NONCLUSTERED (TableName, RecordId),
    INDEX IX_AuditLog_UserId NONCLUSTERED (UserId),
    INDEX IX_AuditLog_ChangedAt NONCLUSTERED (ChangedAt)
);

-- =============================================
-- VIEWS FOR EASIER QUERYING
-- =============================================

-- Complete Trust View
CREATE VIEW estate.vw_TrustsComplete AS
SELECT 
    t.Id,
    t.TrustId,
    t.Name,
    tt.Name as TrustType,
    t.TaxId,
    t.DateCreated,
    t.Grantor,
    t.Purpose,
    t.IsActive,
    u.FirstName + ' ' + u.LastName as CreatedByName,
    t.CreatedAt,
    t.UpdatedAt
FROM estate.Trusts t
INNER JOIN estate.TrustTypes tt ON t.TrustTypeId = tt.Id
INNER JOIN estate.Users u ON t.CreatedBy = u.Id;
GO

-- Trust Trustees View
CREATE VIEW estate.vw_TrustTrusteesDetail AS
SELECT 
    tt.Id,
    tt.TrustId,
    t.Name as TrustName,
    tt.TrusteeName,
    ttype.Name as TrusteeType,
    tt.Powers,
    tt.StartDate,
    tt.EndDate,
    tt.OrderOfSuccession,
    tt.IsActive
FROM estate.TrustTrustees tt
INNER JOIN estate.Trusts t ON tt.TrustId = t.Id
INNER JOIN estate.TrusteeTypes ttype ON tt.TrusteeTypeId = ttype.Id;
GO

-- =============================================
-- STORED PROCEDURES
-- =============================================

-- Get Complete Trust Information
CREATE PROCEDURE estate.sp_GetTrustComplete
    @TrustId NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Get Trust Basic Info
    SELECT * FROM estate.vw_TrustsComplete WHERE TrustId = @TrustId;
    
    -- Get Trustees
    SELECT * FROM estate.vw_TrustTrusteesDetail WHERE TrustId IN (
        SELECT Id FROM estate.Trusts WHERE TrustId = @TrustId
    );
    
    -- Get Beneficiaries
    SELECT 
        tb.*,
        bt.Name as BeneficiaryType,
        rt.Name as RelationshipType
    FROM estate.TrustBeneficiaries tb
    INNER JOIN estate.BeneficiaryTypes bt ON tb.BeneficiaryTypeId = bt.Id
    INNER JOIN estate.RelationshipTypes rt ON tb.RelationshipTypeId = rt.Id
    WHERE tb.TrustId IN (SELECT Id FROM estate.Trusts WHERE TrustId = @TrustId);
END;
GO

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Add composite indexes for common queries
CREATE INDEX IX_TrustTrustees_Trust_Active ON estate.TrustTrustees(TrustId, IsActive) INCLUDE (TrusteeName, TrusteeTypeId);
CREATE INDEX IX_TrustBeneficiaries_Trust_Active ON estate.TrustBeneficiaries(TrustId, IsActive) INCLUDE (BeneficiaryName, Percentage);
CREATE INDEX IX_LegalRoles_User_Active ON estate.LegalRoles(UserId, IsActive) INCLUDE (RoleTypeId, PersonName);
CREATE INDEX IX_FamilyMembers_User_Active ON estate.FamilyMembers(UserId, IsActive) INCLUDE (Name, RelationshipTypeId);

-- =============================================
-- SECURITY
-- =============================================

-- Row Level Security Policy (example for multi-tenant scenario)
-- This would need to be customized based on your security requirements

-- Create security predicate function
CREATE FUNCTION estate.fn_SecurityPredicate(@UserId INT)
RETURNS TABLE
WITH SCHEMABINDING
AS
RETURN SELECT 1 AS fn_SecurityPredicate_Result
WHERE @UserId = CAST(SESSION_CONTEXT(N'UserId') AS INT)
OR IS_ROLEMEMBER('EstateAdmin') = 1;
GO

-- Apply RLS to sensitive tables (example)
-- CREATE SECURITY POLICY estate.UserDataPolicy
-- ADD FILTER PREDICATE estate.fn_SecurityPredicate(UserId) ON estate.Trusts,
-- ADD FILTER PREDICATE estate.fn_SecurityPredicate(UserId) ON estate.FamilyMembers,
-- ADD FILTER PREDICATE estate.fn_SecurityPredicate(UserId) ON estate.LegalRoles
-- WITH (STATE = ON);
-- GO

-- =============================================
-- INITIAL DATA POPULATION
-- =============================================

-- Insert Reference Data
INSERT INTO estate.TrustTypes (Code, Name, Description) VALUES
('revocable', 'Revocable Trust', 'A trust that can be modified or terminated by the grantor'),
('irrevocable', 'Irrevocable Trust', 'A trust that cannot be modified or terminated without beneficiary permission');

INSERT INTO estate.TrusteeTypes (Code, Name, Description, SortOrder) VALUES
('primary', 'Primary Trustee', 'The main trustee responsible for trust administration', 1),
('successor', 'Successor Trustee', 'Takes over when primary trustee is unable to serve', 2),
('co-trustee', 'Co-Trustee', 'Serves alongside other trustees', 3);

INSERT INTO estate.BeneficiaryTypes (Code, Name, Description) VALUES
('primary', 'Primary Beneficiary', 'First in line to receive benefits'),
('contingent', 'Contingent Beneficiary', 'Receives benefits if primary beneficiary is unable');

INSERT INTO estate.LegalRoleTypes (Code, Name, Description) VALUES
('executor', 'Executor', 'Manages estate through probate'),
('trustee', 'Trustee', 'Manages trust assets'),
('successor_trustee', 'Successor Trustee', 'Takes over trust management when needed'),
('power_of_attorney', 'Power of Attorney', 'Acts on behalf of principal for financial matters'),
('guardian', 'Guardian', 'Cares for minor children');

INSERT INTO estate.HealthcareDirectiveTypes (Code, Name, Description) VALUES
('healthcare_proxy', 'Healthcare Proxy', 'Makes medical decisions when patient cannot'),
('living_will', 'Living Will', 'Documents end-of-life care preferences');

INSERT INTO estate.ProfessionalTypes (Code, Name, Description) VALUES
('estate_attorney', 'Estate Planning Attorney', 'Legal counsel for estate planning'),
('financial_advisor', 'Financial Advisor', 'Investment and financial planning'),
('accountant', 'CPA/Accountant', 'Tax preparation and planning'),
('insurance_agent', 'Insurance Agent', 'Insurance planning and policies'),
('other', 'Other Professional', 'Other professional services');

INSERT INTO estate.RelationshipTypes (Code, Name, Description) VALUES
('spouse', 'Spouse', 'Married partner'),
('child', 'Child', 'Son or daughter'),
('sibling', 'Sibling', 'Brother or sister'),
('parent', 'Parent', 'Mother or father'),
('grandchild', 'Grandchild', 'Child of child'),
('trust', 'Trust', 'Trust entity'),
('other', 'Other', 'Other relationship');

PRINT 'Estate Plan Schema created successfully!';
GO