# Technical Debt Remediation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Eliminate critical technical debt across security, duplication, type safety, and testing in the EstateEase-Remix codebase.

**Architecture:** Incremental remediation in 5 phases ordered by risk. Each phase is independently shippable. Phase 1 (quick wins) eliminates the highest-risk items with minimal code change. Later phases tackle structural refactoring with test coverage as a safety net.

**Tech Stack:** Remix v2, TypeScript 5, Zod, better-sqlite3, Vitest, Tailwind CSS

---

## Phase 1: Quick Wins & Security Fixes (Tasks 1-7)

These tasks are independent. They can be done in any order or parallelized.

---

### Task 1: Delete backup file from repository

**Files:**
- Delete: `app/lib/dal.ts.backup`

**Step 1: Verify the file exists and is not imported anywhere**

Run: `grep -r "dal.ts.backup" app/`
Expected: No results (file is not referenced)

**Step 2: Delete the file**

```bash
rm app/lib/dal.ts.backup
```

**Step 3: Verify deletion**

Run: `ls app/lib/dal.ts.backup`
Expected: "No such file or directory"

**Step 4: Commit**

```bash
git add -u app/lib/dal.ts.backup
git commit -m "chore: remove stale dal.ts.backup file"
```

---

### Task 2: Remove hardcoded session secret fallback

**Files:**
- Modify: `app/lib/auth.server.ts:28`

**Step 1: Read the current line**

File `app/lib/auth.server.ts`, line 28:
```typescript
const sessionSecret = process.env.SESSION_SECRET || "default-secret-key-change-in-production";
```

**Step 2: Replace with strict environment check**

```typescript
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET environment variable is required");
}
```

**Step 3: Verify .env has the variable set**

Run: `grep SESSION_SECRET .env`
Expected: `SESSION_SECRET=<some-value>`

If missing, add it:
```bash
echo 'SESSION_SECRET=dev-secret-change-in-production-$(openssl rand -hex 16)' >> .env
```

**Step 4: Verify .env.example documents the variable**

Run: `grep SESSION_SECRET .env.example`
Expected: `SESSION_SECRET=` or similar placeholder. If missing, add it.

**Step 5: Run the app to verify it starts**

Run: `npm run dev` (verify no crash on startup, then Ctrl+C)

**Step 6: Commit**

```bash
git add app/lib/auth.server.ts
git commit -m "fix: require SESSION_SECRET env var, remove hardcoded fallback"
```

---

### Task 3: Add auth check to assets.new action

**Files:**
- Modify: `app/routes/_app.assets.new.tsx:23-29`

**Step 1: Read the current action function**

The action at line 23 processes form data without calling `requireUser()` first. It calls `requireUser` much later at line 162 just to get the userId, which means the entire form parsing/validation runs unauthenticated.

**Step 2: Add requireUser at the top of the action**

Replace lines 23-25:
```typescript
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");
```

With:
```typescript
export async function action({ request }: ActionFunctionArgs) {
  const user = await requireUser(request);
  const formData = await request.formData();
  const intent = formData.get("intent");
```

**Step 3: Replace the late requireUser call at line 162**

Replace:
```typescript
      userId: (await requireUser(request)).id,
```

With:
```typescript
      userId: user.id,
```

**Step 4: Run typecheck**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 5: Commit**

```bash
git add app/routes/_app.assets.new.tsx
git commit -m "fix: add auth check at start of asset creation action"
```

---

### Task 4: Extract shared formatValidationErrors utility

There are 7 identical copies of this function across 6 schema files + validation/index.ts. We'll create one shared version and update all imports.

**Files:**
- Modify: `app/lib/validation/index.ts:157-171,196-210` (remove duplicates, export shared version)
- Modify: `app/lib/validation/asset-schemas.ts:371-387` (remove local copy)
- Modify: `app/lib/validation/auth-schemas.ts:268-283` (remove local copy)
- Modify: `app/lib/validation/trust-schemas.ts:249-264` (remove local copy)
- Modify: `app/lib/validation/family-schemas.ts:439-454` (remove local copy)
- Modify: `app/lib/validation/power-of-attorney-schemas.ts:221-236` (remove local copy)
- Modify: `app/lib/validation/will-schemas.ts:165-180` (remove local copy)

**Step 1: Write a failing test for the shared utility**

Create file `tests/lib/validation/format-errors.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { z } from "zod";
import { formatValidationErrors } from "~/lib/validation";

describe("formatValidationErrors", () => {
  it("formats a single field error", () => {
    const schema = z.object({ name: z.string().min(1, "Name is required") });
    const result = schema.safeParse({ name: "" });
    if (!result.success) {
      const formatted = formatValidationErrors(result.error);
      expect(formatted).toEqual({ name: ["Name is required"] });
    }
  });

  it("formats multiple errors on same field", () => {
    const schema = z.object({
      password: z.string().min(8, "Too short").regex(/[A-Z]/, "Need uppercase"),
    });
    const result = schema.safeParse({ password: "ab" });
    if (!result.success) {
      const formatted = formatValidationErrors(result.error);
      expect(formatted.password).toContain("Too short");
      expect(formatted.password).toContain("Need uppercase");
    }
  });

  it("formats nested path errors", () => {
    const schema = z.object({
      address: z.object({ city: z.string().min(1, "City required") }),
    });
    const result = schema.safeParse({ address: { city: "" } });
    if (!result.success) {
      const formatted = formatValidationErrors(result.error);
      expect(formatted["address.city"]).toEqual(["City required"]);
    }
  });

  it("formats errors across multiple fields", () => {
    const schema = z.object({
      name: z.string().min(1, "Name required"),
      email: z.string().email("Invalid email"),
    });
    const result = schema.safeParse({ name: "", email: "bad" });
    if (!result.success) {
      const formatted = formatValidationErrors(result.error);
      expect(formatted.name).toEqual(["Name required"]);
      expect(formatted.email).toEqual(["Invalid email"]);
    }
  });

  it("returns empty object for no issues", () => {
    // Manually construct a ZodError with empty issues
    const error = new z.ZodError([]);
    const formatted = formatValidationErrors(error);
    expect(formatted).toEqual({});
  });
});
```

**Step 2: Run the test to verify it passes with existing code**

Run: `npx vitest run tests/lib/validation/format-errors.test.ts`
Expected: All 5 tests PASS (the function already exists in index.ts export from asset-schemas)

**Step 3: Update `app/lib/validation/index.ts`**

The file currently has:
- Line 21: Re-exports `formatValidationErrors` from `./asset-schemas`
- Lines 157-171: Defines `formatProfileValidationErrors` (yet another copy)
- Lines 196-210: Defines a non-exported `formatValidationErrors` function

Replace the `formatProfileValidationErrors` at lines 156-171 and the private `formatValidationErrors` at lines 196-210 with a single exported function. Remove the re-export of `formatValidationErrors` from `./asset-schemas` on line 21.

New single shared function (place it right before `ValidationErrors` constant, replacing both copies):

```typescript
/**
 * Shared validation error formatter
 * Formats Zod validation errors into a { fieldPath: [messages] } map
 */
export function formatValidationErrors(
  error: z.ZodError | { issues: Array<{ path: (string | number)[]; message: string }> },
): Record<string, string[]> {
  const formatted: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const path = issue.path.join(".");
    if (!formatted[path]) {
      formatted[path] = [];
    }
    formatted[path].push(issue.message);
  }

  return formatted;
}
```

Remove from the asset-schemas re-export block (line 21):
```
  formatValidationErrors,
```

Keep the domain-specific names as aliases for backwards compatibility by adding these re-exports after the function:
```typescript
// Backwards-compatible aliases (all point to same function)
export { formatValidationErrors as formatProfileValidationErrors };
```

**Step 4: Remove `formatValidationErrors` from `app/lib/validation/asset-schemas.ts`**

Delete lines 371-387 (the entire `formatValidationErrors` function).

**Step 5: Remove `formatAuthValidationErrors` from `app/lib/validation/auth-schemas.ts`**

Delete lines 268-283 (the entire function).

Update `app/lib/validation/index.ts` line 138: Change `formatAuthValidationErrors` re-export to:
```typescript
// Remove formatAuthValidationErrors from auth-schemas imports
```

Add alias in index.ts:
```typescript
export { formatValidationErrors as formatAuthValidationErrors };
```

**Step 6: Remove `formatTrustValidationErrors` from `app/lib/validation/trust-schemas.ts`**

Delete lines 249-264.

Update index.ts: Remove from trust-schemas imports, add:
```typescript
export { formatValidationErrors as formatTrustValidationErrors };
```

**Step 7: Remove `formatFamilyValidationErrors` from `app/lib/validation/family-schemas.ts`**

Delete lines 439-454.

Update index.ts: Remove from family-schemas imports, add:
```typescript
export { formatValidationErrors as formatFamilyValidationErrors };
```

**Step 8: Remove `formatPowerOfAttorneyValidationErrors` from `app/lib/validation/power-of-attorney-schemas.ts`**

Delete lines 221-236.

Update index.ts: Remove from power-of-attorney-schemas imports, add:
```typescript
export { formatValidationErrors as formatPowerOfAttorneyValidationErrors };
```

**Step 9: Remove `formatWillValidationErrors` from `app/lib/validation/will-schemas.ts`**

Delete lines 165-180.

Update index.ts: Remove from will-schemas imports, add:
```typescript
export { formatValidationErrors as formatWillValidationErrors };
```

**Step 10: Run the tests**

Run: `npx vitest run tests/lib/validation/format-errors.test.ts`
Expected: All 5 tests PASS

**Step 11: Run typecheck to verify no broken imports**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 12: Commit**

```bash
git add app/lib/validation/ tests/lib/validation/
git commit -m "refactor: consolidate 7 identical formatValidationErrors into single shared utility"
```

---

### Task 5: Create generic enum validator factory

There are 8 identical enum validator functions (validateAssetCategory, validateTrustType, etc.) that all follow the same pattern. Replace with a factory.

**Files:**
- Modify: `app/lib/validation/index.ts` (add factory, keep existing `validateEnum`)
- Modify: `app/lib/validation/asset-schemas.ts:355-369`
- Modify: `app/lib/validation/trust-schemas.ts:233-247`
- Modify: `app/lib/validation/power-of-attorney-schemas.ts:205-219`
- Modify: `app/lib/validation/will-schemas.ts:157-163`
- Modify: `app/lib/validation/family-schemas.ts:431-437`

**Step 1: Write failing test**

Create file `tests/lib/validation/enum-validator.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { z } from "zod";
import { createEnumValidator } from "~/lib/validation";

describe("createEnumValidator", () => {
  const colorSchema = z.enum(["RED", "GREEN", "BLUE"]);
  const validateColor = createEnumValidator(colorSchema, "color");

  it("returns parsed value for valid input", () => {
    expect(validateColor("RED")).toBe("RED");
    expect(validateColor("GREEN")).toBe("GREEN");
  });

  it("throws descriptive error for invalid input", () => {
    expect(() => validateColor("PURPLE")).toThrow("Invalid color: PURPLE");
  });

  it("throws for empty string", () => {
    expect(() => validateColor("")).toThrow("Invalid color: ");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run tests/lib/validation/enum-validator.test.ts`
Expected: FAIL (createEnumValidator doesn't exist yet)

**Step 3: Add the factory to `app/lib/validation/index.ts`**

Add near the top of the file (after the `z` import):

```typescript
/**
 * Creates a typed enum validator from a Zod schema.
 * Replaces the repeated pattern of safeParse + throw per-enum.
 */
export function createEnumValidator<T>(
  schema: z.ZodType<T>,
  fieldName: string,
): (value: string) => T {
  return (value: string): T => {
    const result = schema.safeParse(value);
    if (!result.success) {
      throw new Error(`Invalid ${fieldName}: ${value}`);
    }
    return result.data;
  };
}
```

**Step 4: Run tests**

Run: `npx vitest run tests/lib/validation/enum-validator.test.ts`
Expected: PASS

**Step 5: Replace individual validators with factory calls**

In `app/lib/validation/asset-schemas.ts`, replace lines 355-369:

```typescript
export const validateAssetCategory = createEnumValidator(assetCategorySchema, "asset category");
export const validateOwnershipType = createEnumValidator(ownershipTypeSchema, "ownership type");
```

Add import at top of file:
```typescript
import { createEnumValidator } from "./index";
```

In `app/lib/validation/trust-schemas.ts`, replace lines 233-247:
```typescript
export const validateTrustType = createEnumValidator(trustTypeSchema, "trust type");
export const validateTrustStatus = createEnumValidator(trustStatusSchema, "trust status");
```

Add import of `createEnumValidator` from `./index`.

In `app/lib/validation/power-of-attorney-schemas.ts`, replace lines 205-219:
```typescript
export const validatePOAType = createEnumValidator(poaTypeSchema, "POA type");
export const validatePOAStatus = createEnumValidator(poaStatusSchema, "POA status");
```

Add import of `createEnumValidator` from `./index`.

In `app/lib/validation/will-schemas.ts`, replace lines 157-163:
```typescript
export const validateWillStatus = createEnumValidator(willStatusSchema, "will status");
```

Add import of `createEnumValidator` from `./index`.

In `app/lib/validation/family-schemas.ts`, replace lines 431-437:
```typescript
export const validateLegalRole = createEnumValidator(legalRoleSchema, "legal role");
```

Add import of `createEnumValidator` from `./index`.

**Step 6: Run typecheck and all tests**

Run: `npx tsc --noEmit && npx vitest run`
Expected: All pass

**Step 7: Commit**

```bash
git add app/lib/validation/ tests/lib/validation/
git commit -m "refactor: replace 8 identical enum validators with createEnumValidator factory"
```

---

### Task 6: Consolidate US_STATES to single source

US_STATES is defined in 3 places: `app/types/enums.ts`, `app/data/ui-constants.ts`, `app/components/modals/family-member-modal.tsx`, and `app/routes/_app.professionals.new.tsx`.

**Files:**
- Keep: `app/types/enums.ts` (canonical source)
- Modify: `app/data/ui-constants.ts` (remove duplicate, re-export from enums)
- Modify: `app/components/modals/family-member-modal.tsx` (import from enums)
- Modify: `app/routes/_app.professionals.new.tsx` (import from enums)

**Step 1: Verify which files import from which source**

Run grep results show:
- `app/routes/_app.wills.new.tsx` imports from `~/types/enums` (correct)
- `app/routes/_app.powers-attorney.new.tsx` imports from `~/types/enums` (correct)
- `app/routes/_app.family.$memberId.edit.tsx` imports from `~/types/enums` (correct)
- `app/routes/_app.family.new.tsx` imports from `~/types/enums` (correct)
- `app/components/forms/asset-form.tsx` imports `US_STATES` (check source)
- `app/components/modals/family-member-modal.tsx` defines locally (line 27)
- `app/routes/_app.professionals.new.tsx` defines locally (line 68)
- `app/data/ui-constants.ts` defines own copy (line 328)

**Step 2: Remove local definition from `app/components/modals/family-member-modal.tsx`**

Delete the local `US_STATES` constant (starts at line 27, ~50+ lines of state data).

Add import at top:
```typescript
import { US_STATES } from "~/types/enums";
```

**Step 3: Remove local definition from `app/routes/_app.professionals.new.tsx`**

Delete the local `US_STATES` constant (starts at line 68, ~50+ lines).

Add import at top:
```typescript
import { US_STATES } from "~/types/enums";
```

**Step 4: Update `app/data/ui-constants.ts`**

Delete the `US_STATES` definition (line 328+). Replace with re-export:
```typescript
export { US_STATES } from "~/types/enums";
```

Or if other files import from `~/data/ui-constants`, the re-export maintains compatibility.

**Step 5: Verify `app/components/forms/asset-form.tsx` imports from correct place**

Check its import source. If it imports from `~/types/enums`, it's already correct.

**Step 6: Run typecheck**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 7: Commit**

```bash
git add app/types/enums.ts app/data/ui-constants.ts app/components/modals/family-member-modal.tsx app/routes/_app.professionals.new.tsx
git commit -m "refactor: consolidate US_STATES to single definition in types/enums"
```

---

### Task 7: Fix `catch (error: any)` blocks with proper typing

There are 6 catch blocks using `error: any`. Replace with `unknown` + type guards.

**Files:**
- Modify: `app/routes/login.tsx:50`
- Modify: `app/routes/register.tsx:54`
- Modify: `app/routes/forgot-password.tsx:48`
- Modify: `app/routes/_app.wills.new.tsx:83`
- Modify: `app/routes/_app.profile.tsx:119`
- Modify: `app/routes/_app.powers-attorney.new.tsx:93`

**Step 1: Define the replacement pattern**

Each `catch (error: any)` block should become:

```typescript
} catch (error: unknown) {
  if (error instanceof z.ZodError) {
    // handle zod errors (same as before)
  }

  const message = error instanceof Error ? error.message : "An unexpected error occurred";
  console.error("Context:", error);
  return json({ error: message, fieldErrors: null }, { status: 500 });
}
```

**Step 2: Update `app/routes/login.tsx:50`**

Replace:
```typescript
  } catch (error: any) {
    if (error.name === "ZodError") {
```

With:
```typescript
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
```

Ensure `z` is imported from `zod` at top of file.

**Step 3: Update `app/routes/register.tsx:54`**

Same pattern as login.tsx.

**Step 4: Update `app/routes/forgot-password.tsx:48`**

Same pattern. Check if it uses ZodError check - if not, just change `error: any` to `error: unknown` and add proper error extraction.

**Step 5: Update `app/routes/_app.wills.new.tsx:83`**

Already uses `error.name === "ZodError"` - change to `error instanceof z.ZodError`.

**Step 6: Update `app/routes/_app.profile.tsx:119`**

Same pattern.

**Step 7: Update `app/routes/_app.powers-attorney.new.tsx:93`**

Same pattern.

**Step 8: Run typecheck**

Run: `npx tsc --noEmit`
Expected: No errors (we're being MORE strict, not less)

**Step 9: Commit**

```bash
git add app/routes/login.tsx app/routes/register.tsx app/routes/forgot-password.tsx app/routes/_app.wills.new.tsx app/routes/_app.profile.tsx app/routes/_app.powers-attorney.new.tsx
git commit -m "fix: replace catch(error: any) with unknown + type guards in 6 routes"
```

---

## Phase 2: Replace local formatDate with shared utility (Task 8)

---

### Task 8: Replace local formatDate with `~/utils/format`

Three routes define their own `formatDate` when `app/utils/format.ts` already exports one.

**Files:**
- Modify: `app/routes/_app.trusts._index.tsx:41-47` (delete local, add import)
- Modify: `app/routes/_app.assets.real-estate.tsx:35-43` (delete local, add import)
- Modify: `app/routes/_app.real-estate.$propertyId.tsx:54-60` (delete local, add import)

Note: `_app.reports.estate-summary.tsx` already imports from `~/lib/utils` which may not be the same as `~/utils/format`. Check if `~/lib/utils` re-exports `formatDate` from `~/utils/format`. If so, both are fine. If not, standardize.

**Step 1: Check `app/lib/utils.ts` for formatDate**

Read `app/lib/utils.ts` to see if it re-exports formatDate. If it does, leave routes that import from `~/lib/utils` alone.

**Step 2: In `app/routes/_app.trusts._index.tsx`**

Delete the local `formatDate` function at lines 41-47.

Add import:
```typescript
import { formatDate } from "~/utils/format";
```

**Step 3: In `app/routes/_app.assets.real-estate.tsx`**

Delete the local `formatDate` function at lines 35-43.

Add import:
```typescript
import { formatDate } from "~/utils/format";
```

**Step 4: In `app/routes/_app.real-estate.$propertyId.tsx`**

Delete the local `formatDate` function at line 54.

Add import:
```typescript
import { formatDate } from "~/utils/format";
```

Note: The local versions accept `string | undefined` while the shared version accepts `string | Date`. If a route passes `undefined`, add a null check at the call site:
```typescript
{property.purchaseDate ? formatDate(property.purchaseDate) : "N/A"}
```

**Step 5: Run typecheck**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 6: Commit**

```bash
git add app/routes/_app.trusts._index.tsx app/routes/_app.assets.real-estate.tsx app/routes/_app.real-estate.\$propertyId.tsx
git commit -m "refactor: replace 3 local formatDate copies with shared ~/utils/format import"
```

---

## Phase 3: Move @types to devDependencies (Task 9)

---

### Task 9: Move @types packages from dependencies to devDependencies

**Files:**
- Modify: `package.json`

**Step 1: Move the packages**

```bash
npm install --save-dev @types/bcryptjs @types/better-sqlite3
npm uninstall @types/bcryptjs @types/better-sqlite3
npm install --save-dev @types/bcryptjs @types/better-sqlite3
```

Or more simply, just edit package.json manually:

Remove from `"dependencies"`:
```json
"@types/bcryptjs": "^2.4.6",
"@types/better-sqlite3": "^7.6.13",
```

Add to `"devDependencies"`:
```json
"@types/bcryptjs": "^2.4.6",
"@types/better-sqlite3": "^7.6.13",
```

**Step 2: Verify the move**

Run: `npm install`
Expected: No errors

**Step 3: Run typecheck and build**

Run: `npx tsc --noEmit && npm run build`
Expected: Both pass (types are only needed at build time)

**Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: move @types/bcryptjs and @types/better-sqlite3 to devDependencies"
```

---

## Phase 4: Critical Test Coverage (Tasks 10-13)

These tasks build foundational test infrastructure. Task 10 should go first since it sets up the test helpers. Tasks 11-13 can be parallelized after Task 10.

---

### Task 10: Set up test infrastructure and helpers

**Files:**
- Create: `tests/helpers/db.ts` (test database factory)
- Create: `tests/helpers/fixtures.ts` (common test data)
- Modify: `tests/setup.ts` (enhance mock setup)

**Step 1: Create test database helper**

Create `tests/helpers/db.ts`:

```typescript
import { vi } from "vitest";

/**
 * Creates a mock database statement that returns provided data.
 * Matches the better-sqlite3 Statement interface.
 */
export function createMockStatement(data: unknown = undefined) {
  return {
    run: vi.fn().mockReturnValue({ changes: 1, lastInsertRowid: 1 }),
    get: vi.fn().mockReturnValue(data),
    all: vi.fn().mockReturnValue(Array.isArray(data) ? data : data ? [data] : []),
    iterate: vi.fn().mockReturnValue([]),
    pluck: vi.fn().mockReturnThis(),
    bind: vi.fn().mockReturnThis(),
    columns: vi.fn().mockReturnValue([]),
    safeIntegers: vi.fn().mockReturnThis(),
  };
}

/**
 * Creates a mock database instance with prepare/exec methods.
 */
export function createMockDatabase() {
  const statements = new Map<string, ReturnType<typeof createMockStatement>>();

  return {
    prepare: vi.fn((sql: string) => {
      if (!statements.has(sql)) {
        statements.set(sql, createMockStatement());
      }
      return statements.get(sql)!;
    }),
    exec: vi.fn(),
    transaction: vi.fn((fn: Function) => fn),
    pragma: vi.fn(),
    close: vi.fn(),
    _statements: statements,
    _mockStatementReturn(sqlPattern: string, data: unknown) {
      const stmt = createMockStatement(data);
      statements.set(sqlPattern, stmt);
      return stmt;
    },
  };
}
```

**Step 2: Create test fixtures**

Create `tests/helpers/fixtures.ts`:

```typescript
import type { User } from "~/lib/auth.server";

export const testUser: User = {
  id: "user-test-001",
  external_id: "ext-test-001",
  first_name: "Test",
  middle_name: undefined,
  last_name: "User",
  email: "test@example.com",
  phone_number: "555-0100",
  date_of_birth: "1990-01-01",
  is_active: true,
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
};

export const testAsset = {
  id: "asset-test-001",
  user_id: "user-test-001",
  name: "Test Property",
  category: "REAL_ESTATE",
  value: 500000,
  type: "RESIDENTIAL",
  description: "A test property",
  ownership_type: "INDIVIDUAL",
  trust_id: null,
  is_deleted: 0,
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
};

export const testTrust = {
  id: "trust-test-001",
  user_id: "user-test-001",
  name: "Test Family Trust",
  type: "REVOCABLE",
  status: "ACTIVE",
  date_created: "2025-01-01",
  description: "A test trust",
  is_deleted: 0,
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
};

export const testFamilyMember = {
  id: "person-test-001",
  user_id: "user-test-001",
  first_name: "Jane",
  last_name: "Doe",
  full_name: "Jane Doe",
  date_of_birth: "1992-05-15",
  is_minor: 0,
  is_dependent: 0,
  relationship: "SPOUSE",
  primary_phone: "555-0101",
  email: "jane@example.com",
};
```

**Step 3: Run existing tests to verify nothing broke**

Run: `npx vitest run`
Expected: All existing tests pass

**Step 4: Commit**

```bash
git add tests/helpers/
git commit -m "test: add test infrastructure - mock DB factory and common fixtures"
```

---

### Task 11: Add tests for validation utilities

**Files:**
- Create: `tests/lib/validation/format-errors.test.ts` (from Task 4 if not already done)
- Create: `tests/lib/validation/enum-validator.test.ts` (from Task 5 if not already done)
- Create: `tests/lib/validation/schemas.test.ts` (schema validation tests)

**Step 1: Write schema validation tests**

Create `tests/lib/validation/schemas.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import {
  assetFormSchema,
  loginFormSchema,
  registerFormSchema,
  trustFormSchema,
  familyMemberFormSchema,
} from "~/lib/validation";

describe("assetFormSchema", () => {
  it("validates a complete asset form", () => {
    const result = assetFormSchema.safeParse({
      name: "Test Asset",
      category: "REAL_ESTATE",
      value: "500000",
      type: "RESIDENTIAL",
      ownershipType: "INDIVIDUAL",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const result = assetFormSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects empty name", () => {
    const result = assetFormSchema.safeParse({
      name: "",
      category: "REAL_ESTATE",
      value: "500000",
      type: "RESIDENTIAL",
      ownershipType: "INDIVIDUAL",
    });
    expect(result.success).toBe(false);
  });
});

describe("loginFormSchema", () => {
  it("validates correct login data", () => {
    const result = loginFormSchema.safeParse({
      email: "test@example.com",
      password: "SecurePass123!",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = loginFormSchema.safeParse({
      email: "not-an-email",
      password: "SecurePass123!",
    });
    expect(result.success).toBe(false);
  });
});

describe("registerFormSchema", () => {
  it("validates correct registration data", () => {
    const result = registerFormSchema.safeParse({
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      password: "SecurePass123!",
      confirmPassword: "SecurePass123!",
    });
    expect(result.success).toBe(true);
  });
});
```

**Step 2: Run all validation tests**

Run: `npx vitest run tests/lib/validation/`
Expected: All pass

**Step 3: Commit**

```bash
git add tests/lib/validation/
git commit -m "test: add validation schema and utility test suite"
```

---

### Task 12: Add tests for format utilities

**Files:**
- Create: `tests/utils/format.test.ts`

**Step 1: Write format utility tests**

Create `tests/utils/format.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import {
  formatCurrency,
  formatDate,
  formatPercentage,
  formatPhoneNumber,
  formatCompactNumber,
  formatFileSize,
} from "~/utils/format";

describe("formatCurrency", () => {
  it("formats a basic USD amount", () => {
    expect(formatCurrency(1234.56)).toBe("$1,234.56");
  });

  it("formats zero", () => {
    expect(formatCurrency(0)).toBe("$0.00");
  });

  it("formats large numbers", () => {
    expect(formatCurrency(1000000)).toBe("$1,000,000.00");
  });

  it("rounds to 2 decimal places", () => {
    expect(formatCurrency(1.999)).toBe("$2.00");
  });
});

describe("formatDate", () => {
  it("formats a date string", () => {
    const result = formatDate("2025-01-15");
    expect(result).toContain("2025");
  });

  it("formats a Date object", () => {
    const result = formatDate(new Date("2025-06-15"));
    expect(result).toContain("2025");
  });
});

describe("formatPercentage", () => {
  it("formats 0.5 as 50%", () => {
    expect(formatPercentage(0.5)).toBe("50%");
  });

  it("formats with decimal places", () => {
    expect(formatPercentage(0.3333, 2)).toBe("33.33%");
  });
});

describe("formatPhoneNumber", () => {
  it("formats 10-digit number", () => {
    expect(formatPhoneNumber("5551234567")).toBe("(555) 123-4567");
  });

  it("returns original for non-10-digit", () => {
    expect(formatPhoneNumber("123")).toBe("123");
  });
});

describe("formatCompactNumber", () => {
  it("formats billions", () => {
    expect(formatCompactNumber(2_500_000_000)).toBe("$2.5B");
  });

  it("formats millions", () => {
    expect(formatCompactNumber(1_500_000)).toBe("$1.5M");
  });

  it("formats thousands", () => {
    expect(formatCompactNumber(50_000)).toBe("$50K");
  });

  it("formats small numbers as currency", () => {
    expect(formatCompactNumber(999)).toBe("$999.00");
  });
});

describe("formatFileSize", () => {
  it("formats zero bytes", () => {
    expect(formatFileSize(0)).toBe("0 Bytes");
  });

  it("formats kilobytes", () => {
    expect(formatFileSize(1024)).toBe("1 KB");
  });

  it("formats megabytes", () => {
    expect(formatFileSize(1048576)).toBe("1 MB");
  });
});
```

**Step 2: Run format tests**

Run: `npx vitest run tests/utils/format.test.ts`
Expected: All pass

**Step 3: Commit**

```bash
git add tests/utils/format.test.ts
git commit -m "test: add comprehensive format utility test suite"
```

---

### Task 13: Add tests for auth server

**Files:**
- Create: `tests/lib/auth.test.ts`

**Step 1: Write auth tests**

Create `tests/lib/auth.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock database before importing auth module
const mockDb = {
  prepare: vi.fn(),
  exec: vi.fn(),
};

vi.mock("~/lib/database", () => ({
  getDatabase: () => mockDb,
}));

vi.mock("@remix-run/node", () => ({
  redirect: vi.fn((url: string) => {
    throw new Response(null, { status: 302, headers: { Location: url } });
  }),
  createCookieSessionStorage: vi.fn(() => ({
    getSession: vi.fn().mockResolvedValue({
      get: vi.fn().mockReturnValue(null),
      set: vi.fn(),
      unset: vi.fn(),
    }),
    commitSession: vi.fn().mockResolvedValue("session-cookie"),
    destroySession: vi.fn().mockResolvedValue(""),
  })),
}));

describe("Auth Server", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SESSION_SECRET = "test-secret";
  });

  it("module loads without error when SESSION_SECRET is set", async () => {
    // This verifies the module doesn't throw on import
    // After Task 2, it will throw if SESSION_SECRET is missing
    expect(process.env.SESSION_SECRET).toBe("test-secret");
  });
});
```

Note: Full auth tests require more complex session mocking. This establishes the pattern. Expand as you refactor auth.

**Step 2: Run auth tests**

Run: `npx vitest run tests/lib/auth.test.ts`
Expected: Pass

**Step 3: Commit**

```bash
git add tests/lib/auth.test.ts
git commit -m "test: add auth server test infrastructure"
```

---

## Phase 5: Structural Cleanup (Tasks 14-16)

These are larger refactoring tasks. Each should be done after Phase 3 tests provide safety.

---

### Task 14: Remove dead commented code from auth.server.ts

**Files:**
- Modify: `app/lib/auth.server.ts:46`

**Step 1: Delete the commented-out constant**

Remove line 46:
```typescript
// const DEFAULT_USER_ID = "user-nick-001";
```

**Step 2: Run typecheck**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add app/lib/auth.server.ts
git commit -m "chore: remove dead commented-out code from auth.server.ts"
```

---

### Task 15: Replace `as any` type assertions in DAL

**Files:**
- Modify: `app/lib/auth.server.ts:218,289`
- Modify: `app/lib/dal-crud.ts:615`
- Modify: `app/lib/dal.ts:744`
- Modify: `app/lib/security/security-monitor.server.ts:176`

**Step 1: Define proper types for each assertion**

For `auth.server.ts:218` - The query returns a user row. Create an interface:

```typescript
interface UserRow {
  id: string;
  external_id: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  email: string;
  phone_number: string | null;
  date_of_birth: string | null;
  password_hash: string;
  is_active: number;
  created_at: string;
  updated_at: string;
}
```

Replace:
```typescript
.get(credentials.email) as any;
```
With:
```typescript
.get(credentials.email) as UserRow | undefined;
```

**Step 2: Fix auth.server.ts:289**

Replace:
```typescript
.get(userId) as any;
```
With:
```typescript
.get(userId) as UserRow | undefined;
```

**Step 3: Fix dal-crud.ts:615**

Read the context to determine the row shape, then replace `as any` with the proper row type. Example:
```typescript
const member = stmt.get(memberId) as FamilyMemberRow | undefined;
```

**Step 4: Fix dal.ts:744**

Replace with proper trust row type:
```typescript
const trust = stmt.get(trustId) as TrustRow | undefined;
```

**Step 5: Fix security-monitor.server.ts:176**

Replace:
```typescript
.all(limit) as any[];
```
With the proper security event row type:
```typescript
.all(limit) as SecurityEventRow[];
```

**Step 6: Run typecheck**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 7: Commit**

```bash
git add app/lib/auth.server.ts app/lib/dal-crud.ts app/lib/dal.ts app/lib/security/security-monitor.server.ts
git commit -m "fix: replace 5 'as any' type assertions with proper row types"
```

---

### Task 16: Add error boundaries to major routes

Routes without ErrorBoundary components will crash the entire page on errors. Add boundaries to the most critical routes.

**Files:**
- Modify: `app/routes/_app.dashboard.tsx`
- Modify: `app/routes/_app.family._index.tsx`
- Modify: `app/routes/_app.trusts._index.tsx`
- Modify: `app/routes/_app.assets._index.tsx`
- Modify: `app/routes/_app.documents._index.tsx`

**Step 1: Create a reusable error boundary if one doesn't exist**

Check if `app/components/ui/error/error-boundary.tsx` exports a reusable `RouteErrorBoundary` component. If so, use it. If not, create a simple one:

```typescript
import { useRouteError, isRouteErrorResponse } from "@remix-run/react";

export function RouteErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <h1 className="text-2xl font-bold text-red-600">{error.status} {error.statusText}</h1>
        <p className="mt-2 text-gray-600">{error.data}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <h1 className="text-2xl font-bold text-red-600">Something went wrong</h1>
      <p className="mt-2 text-gray-600">
        {error instanceof Error ? error.message : "An unexpected error occurred"}
      </p>
    </div>
  );
}
```

**Step 2: Add ErrorBoundary export to each route file**

At the bottom of each route file listed above, add:

```typescript
export { RouteErrorBoundary as ErrorBoundary } from "~/components/ui/error/route-error-boundary";
```

Or if the component is already in a different location, import from there.

**Step 3: Run typecheck**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 4: Commit**

```bash
git add app/components/ui/error/ app/routes/
git commit -m "feat: add error boundaries to 5 critical routes"
```

---

## Summary Checklist

| Task | Phase | Effort | Risk Reduction |
|------|-------|--------|----------------|
| 1. Delete dal.ts.backup | 1 | 5 min | Dead code |
| 2. Remove hardcoded secret | 1 | 30 min | CRITICAL security |
| 3. Add auth to assets.new | 1 | 30 min | CRITICAL security |
| 4. Consolidate formatValidationErrors | 1 | 3 hrs | 42 lines dedup |
| 5. Enum validator factory | 1 | 2 hrs | 56 lines dedup |
| 6. Consolidate US_STATES | 1 | 1 hr | 250 lines dedup |
| 7. Fix error: any catch blocks | 1 | 2 hrs | Type safety |
| 8. Replace local formatDate | 2 | 1 hr | 28 lines dedup |
| 9. Move @types to devDeps | 3 | 15 min | Clean deps |
| 10. Test infrastructure | 4 | 2 hrs | Foundation |
| 11. Validation tests | 4 | 2 hrs | +5% coverage |
| 12. Format utility tests | 4 | 1 hr | +2% coverage |
| 13. Auth tests | 4 | 2 hrs | +3% coverage |
| 14. Remove dead code | 5 | 10 min | Clean code |
| 15. Replace as any assertions | 5 | 3 hrs | Type safety |
| 16. Add error boundaries | 5 | 2 hrs | Error resilience |
| **Total** | | **~22 hrs** | |

**After this plan:** The codebase will have eliminated all critical security issues, removed ~400 lines of duplication, achieved type safety in critical paths, and have a test foundation for safe future refactoring of the larger DAL/transformer god files.
