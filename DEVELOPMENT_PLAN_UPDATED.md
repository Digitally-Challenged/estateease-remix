# EstateEase Development Plan - UPDATED
**Last Updated: January 7, 2025 at 5:45 PM**
**Previous Update: January 7, 2025 at 5:05 PM**

## 🎯 Completed Items (January 7, 2025)

### ✅ Priority 1: Critical Fixes - COMPLETED

#### 1.1 Dark Mode Fix ✅
**Status**: FULLY FIXED
**Changes Made**:
- Moved ThemeProvider to root level in `app/root.tsx`
- Added theme initialization script to prevent flash
- Updated dark mode classes in:
  - `app/components/ui/card.tsx`
  - `app/routes/_app.dashboard._index.tsx`
  - `app/routes/_app.assets._index.tsx`
  - `app/routes/_app.trusts._index.tsx`
  - `app/routes/_app.family._index.tsx`
  - `app/routes/_app.financial-overview.tsx`
- Dark mode now works across all pages with proper contrast

#### 1.2 Number Formatting ✅
**Status**: FIXED
**Changes Made**:
- Updated `app/utils/format.ts` to show 2 decimal places
- Removed duplicate formatCurrency functions from 9 files
- All currency values now display as $X,XXX,XXX.00

#### 1.3 ESLint Errors ✅
**Status**: FIXED (Not in original plan but critical)
**Changes Made**:
- Fixed 11 ESLint errors across 6 files
- Replaced `any` types with proper TypeScript types
- Removed unused imports
- Fixed React unescaped entities

## 📋 Remaining Work Items

### 🔴 Priority 1.3: AI Advisor 404 Error
**Status**: NOT STARTED
**Issue**: Route exists but showing 404
**File**: `app/routes/_app.chatbot.tsx`
**Solution**: 
- Verify route file naming and ensure it's using `_app.` prefix
- Check loader implementation
- Ensure navigation link is correct

### 🟡 Priority 2: Data Model Updates

#### 2.1 Financial Accounts Enhancement
**Status**: NOT STARTED
**Files to Update**: 
- `app/types/assets.ts`
- `app/lib/dal.ts`
- `app/lib/dal-crud.ts`
- `app/routes/_app.assets.financial._index.tsx`
- `app/components/forms/asset-form.tsx`

**Database Migration**:
```sql
-- Add to assets table for financial accounts
ALTER TABLE assets ADD COLUMN institution_name TEXT;
ALTER TABLE assets ADD COLUMN account_number TEXT;
ALTER TABLE assets ADD COLUMN routing_number TEXT;
ALTER TABLE assets ADD COLUMN account_type TEXT;
```

**Type Updates**:
```typescript
interface FinancialAccount extends Asset {
  institutionName: string;
  accountNumber: string;
  routingNumber?: string;
  accountType: 'checking' | 'savings' | 'money_market' | 'cd' | 'investment' | 'retirement';
}
```

#### 2.2 Business Interests Enhancement
**Status**: NOT STARTED
**Files to Update**:
- `app/types/assets.ts`
- `app/lib/dal.ts`
- `app/lib/dal-crud.ts`
- `app/routes/_app.assets.business._index.tsx`
- `app/components/forms/asset-form.tsx` (add business-specific fields)

**Database Migration**:
```sql
-- Add to assets table for business interests
ALTER TABLE assets ADD COLUMN incorporation_type TEXT;
ALTER TABLE assets ADD COLUMN state_of_incorporation TEXT;
ALTER TABLE assets ADD COLUMN ein TEXT;
ALTER TABLE assets ADD COLUMN registered_agent TEXT;
ALTER TABLE assets ADD COLUMN business_address TEXT;
```

#### 2.3 Remove Digital Assets Category
**Status**: NOT STARTED
**Files to Update**:
- `app/constants/asset-options.ts` - Remove DIGITAL_ASSETS from AssetCategory enum
- `app/routes/_app.dashboard._index.tsx` - Remove from statistics calculation
- `app/components/layout/sidebar.tsx` - Remove from navigation
- `app/routes/_app.assets.new.tsx` - Remove from asset type selection
- `app/lib/dal.ts` - Update queries to exclude digital assets

#### 2.4 Add Kelsey's Trust Data
**Status**: NOT STARTED
**Files to Create**:
- `db/data-migrations/003-kelsey-trust-data.sql`

**SQL Migration**:
```sql
-- Insert Kelsey's trust
INSERT INTO trusts (trust_id, name, type, date_created, grantor, tax_id, user_id, is_active)
VALUES (
  'trust-kelsey-001',
  'Kelsey Brown Coleman Revocable Trust',
  'REVOCABLE',
  '2025-02-04',
  'Kelsey Brown Coleman',
  'XX-XXXXXXX',
  'user-nick-001',
  1
);

-- Add beneficiaries
INSERT INTO trust_beneficiaries (trust_id, beneficiary_type, beneficiary_id, percentage)
VALUES 
  ('trust-kelsey-001', 'person', 'family-nick-001', 100);

-- Add trustees
INSERT INTO trust_trustees (trust_id, trustee_type, trustee_id, is_primary)
VALUES 
  ('trust-kelsey-001', 'person', 'family-kelsey-001', 1);
```

### 🟢 Priority 3: Document Management System

#### 3.1 Database Schema
**Status**: NOT STARTED
**File to Create**: `db/data-migrations/004-documents-table.sql`

```sql
CREATE TABLE documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  document_id TEXT UNIQUE NOT NULL DEFAULT ('doc-' || lower(hex(randomblob(16)))),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('pdf', 'docx', 'jpg', 'png')),
  category TEXT NOT NULL,
  size INTEGER NOT NULL,
  url TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  uploaded_by TEXT NOT NULL,
  uploaded_at TEXT DEFAULT CURRENT_TIMESTAMP,
  is_active INTEGER DEFAULT 1,
  FOREIGN KEY (uploaded_by) REFERENCES users(user_id)
);

CREATE INDEX idx_documents_entity ON documents(entity_type, entity_id);
CREATE INDEX idx_documents_category ON documents(category);
```

#### 3.2 Document Components
**Status**: NOT STARTED
**Files to Create**:
- `app/components/documents/document-uploader.tsx`
- `app/components/documents/document-viewer.tsx`
- `app/components/documents/document-list.tsx`
- `app/components/documents/document-categories.tsx`
- `app/components/documents/document-modal.tsx`

#### 3.3 Document API Routes
**Status**: NOT STARTED
**Files to Create**:
- `app/routes/api.documents.upload.tsx`
- `app/routes/api.documents.$documentId.tsx`
- `app/routes/api.documents.download.$documentId.tsx`

#### 3.4 Document Integration
**Status**: NOT STARTED
**Files to Update**:
- `app/lib/dal.ts` - Add document queries
- `app/lib/dal-crud.ts` - Add document CRUD operations
- `app/types/index.ts` - Add Document type definitions
- `app/routes/_app.documents._index.tsx` - Update to use new components

### 🔵 Priority 4: UI/UX Improvements

#### 4.1 Asset Accordion Implementation
**Status**: NOT STARTED
**Files to Create**:
- `app/components/ui/asset-accordion.tsx`

**Files to Update**:
- `app/routes/_app.assets._index.tsx` - Replace current list with accordion
- `app/routes/_app.assets.real-estate.tsx` - Use accordion component
- `app/routes/_app.assets.financial._index.tsx` - Use accordion component
- `app/routes/_app.assets.business._index.tsx` - Use accordion component

#### 4.2 Family & Professional CRUD Modals
**Status**: NOT STARTED
**Files to Create**:
- `app/components/modals/family-member-modal.tsx`
- `app/components/modals/professional-modal.tsx`
- `app/components/modals/emergency-contact-modal.tsx`

**Files to Update**:
- `app/routes/_app.family._index.tsx` - Add modal triggers and state
- `app/lib/dal-crud.ts` - Ensure family CRUD operations exist

#### 4.3 Key Roles Edit Modal Fix
**Status**: NOT STARTED
**Files to Update**:
- `app/routes/_app.key-roles._index.tsx` - Debug and fix edit functionality
- `app/components/modals/key-role-modal.tsx` - Create if doesn't exist

### 🟣 Priority 5: Data Additions

#### 5.1 Insurance Policy Types
**Status**: NOT STARTED
**Files to Update**:
- `app/constants/asset-options.ts` - Add new insurance types to enum
- `app/components/forms/asset-form.tsx` - Add insurance-specific fields
- `app/routes/_app.assets.insurance._index.tsx` - Update to display new types

**New Insurance Types**:
```typescript
export enum InsuranceType {
  LIFE = 'LIFE',
  DISABILITY = 'DISABILITY',
  LONG_TERM_CARE = 'LONG_TERM_CARE',
  HOMEOWNERS = 'HOMEOWNERS',
  AUTO = 'AUTO',
  UMBRELLA = 'UMBRELLA',
  VALUABLE_ITEMS = 'VALUABLE_ITEMS'
}
```

#### 5.2 Insurance-Specific Fields
**Database Migration**: `db/data-migrations/005-insurance-fields.sql`
```sql
-- Add insurance-specific columns
ALTER TABLE assets ADD COLUMN policy_number TEXT;
ALTER TABLE assets ADD COLUMN provider TEXT;
ALTER TABLE assets ADD COLUMN coverage_amount REAL;
ALTER TABLE assets ADD COLUMN premium REAL;
ALTER TABLE assets ADD COLUMN deductible REAL;
ALTER TABLE assets ADD COLUMN policy_start_date TEXT;
ALTER TABLE assets ADD COLUMN policy_end_date TEXT;
```

### ⚫ Priority 6: Advanced Features

#### 6.1 Succession Planning Flowchart
**Status**: NOT STARTED
**Dependencies**: `npm install reactflow`
**Files to Create**:
- `app/components/succession/succession-flowchart.tsx`
- `app/components/succession/family-tree-node.tsx`
- `app/components/succession/beneficiary-flow.tsx`

**Files to Update**:
- `app/routes/_app.succession-planning._index.tsx` - Integrate flowchart

#### 6.2 Navigation Consolidation
**Status**: NOT STARTED
**Files to Update**:
- `app/components/layout/sidebar.tsx` - Reorganize navigation
- `app/constants/navigation.ts` - Update navigation structure

**Changes**:
- Move Healthcare Directives under Key Roles
- Move Legal Documents under Estate Planning
- Simplify navigation hierarchy

## 📂 File Directory Reference

```
app/
├── components/
│   ├── documents/              # NEW FOLDER
│   │   ├── document-uploader.tsx
│   │   ├── document-viewer.tsx
│   │   ├── document-list.tsx
│   │   ├── document-categories.tsx
│   │   └── document-modal.tsx
│   ├── modals/                 # NEW FOLDER
│   │   ├── family-member-modal.tsx
│   │   ├── professional-modal.tsx
│   │   ├── emergency-contact-modal.tsx
│   │   └── key-role-modal.tsx
│   ├── succession/             # NEW FOLDER
│   │   ├── succession-flowchart.tsx
│   │   ├── family-tree-node.tsx
│   │   └── beneficiary-flow.tsx
│   ├── forms/
│   │   └── asset-form.tsx      # UPDATE: Add insurance/business fields
│   ├── layout/
│   │   └── sidebar.tsx         # UPDATE: Navigation consolidation
│   └── ui/
│       └── asset-accordion.tsx # NEW FILE
├── constants/
│   ├── asset-options.ts        # UPDATE: Remove digital, add insurance
│   └── navigation.ts           # UPDATE: Consolidate navigation
├── lib/
│   ├── dal.ts                  # UPDATE: Add document queries
│   └── dal-crud.ts             # UPDATE: Add document/family CRUD
├── routes/
│   ├── api.documents.upload.tsx       # NEW FILE
│   ├── api.documents.$documentId.tsx  # NEW FILE
│   ├── api.documents.download.$documentId.tsx # NEW FILE
│   ├── _app.chatbot.tsx        # FIX: 404 error
│   ├── _app.assets._index.tsx  # UPDATE: Use accordion
│   ├── _app.assets.financial._index.tsx # UPDATE: Enhanced fields
│   ├── _app.assets.business._index.tsx  # UPDATE: Enhanced fields
│   ├── _app.assets.insurance._index.tsx # UPDATE: New types
│   ├── _app.family._index.tsx  # UPDATE: Add CRUD modals
│   ├── _app.key-roles._index.tsx # FIX: Edit modal
│   └── _app.succession-planning._index.tsx # UPDATE: Add flowchart
├── types/
│   ├── assets.ts               # UPDATE: Financial/Business interfaces
│   └── index.ts                # UPDATE: Add Document type
└── db/
    └── data-migrations/
        ├── 003-kelsey-trust-data.sql     # NEW FILE
        ├── 004-documents-table.sql       # NEW FILE
        └── 005-insurance-fields.sql      # NEW FILE
```

## 🚀 Next Session TODO List

### Immediate Tasks (Day 1)
1. **Fix AI Advisor 404** 
   - Check `app/routes/_app.chatbot.tsx`
   - Verify route naming and loader

2. **Remove Digital Assets**
   - Update `app/constants/asset-options.ts`
   - Clean up all references in routes and components

3. **Add Kelsey's Trust**
   - Create migration file
   - Run database migration

### Core Features (Days 2-3)
4. **Financial Account Enhancements**
   - Update types and interfaces
   - Add database fields
   - Update forms and display

5. **Business Interest Enhancements**
   - Add incorporation fields
   - Update business asset form
   - Add EIN validation

6. **Document Management System**
   - Create documents table
   - Build upload/viewer components
   - Integrate with assets

### UI Improvements (Days 4-5)
7. **Asset Accordion**
   - Create accordion component
   - Replace list views
   - Add expand/collapse all

8. **Family CRUD Modals**
   - Build modal components
   - Add create/edit/delete
   - Update family page

9. **Fix Key Roles Edit**
   - Debug modal issues
   - Ensure data binding works

### Advanced Features (Week 2)
10. **Insurance Enhancements**
    - Add new policy types
    - Create insurance-specific form
    - Add policy tracking

11. **Succession Planning Visual**
    - Install React Flow
    - Create family tree component
    - Add drag-drop functionality

12. **Navigation Cleanup**
    - Consolidate menu items
    - Update sidebar
    - Improve UX flow

## 📊 Success Metrics

### Technical
- ✅ ESLint: 0 errors (DONE)
- ✅ Dark Mode: Working on all pages (DONE)
- ✅ Currency Format: Shows .00 (DONE)
- ⏳ TypeScript: 13 errors remaining
- ⏳ All routes accessible (AI Advisor 404)

### Features
- ⏳ Document upload/management
- ⏳ Enhanced financial accounts
- ⏳ Kelsey's trust added
- ⏳ Family CRUD operations
- ⏳ Insurance policy tracking

### UX
- ⏳ Accordion asset views
- ⏳ Modal-based editing
- ⏳ Simplified navigation
- ⏳ Visual succession planning

---

**Session Summary**: January 7, 2025
- Fixed critical dark mode and formatting issues
- Cleaned up all ESLint errors
- Created comprehensive plan for remaining work
- Ready for next phase of development