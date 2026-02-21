# UX Audit Fixes — Real Estate Portfolio Page

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix 13 verified UX/UI/accessibility issues from the Real Estate Portfolio page audit (issue #13 CRUD deferred as separate feature).

**Architecture:** All changes are CSS/markup-level fixes in existing components — no new files, no schema changes, no API changes. The route file `_app.assets.real-estate.tsx` contains the page-specific markup. Shared layout components (`header.tsx`, `sidebar.tsx`) and the reusable `StatsCard` component are touched for their respective issues. One small utility function (`pluralize`) is added to `format.ts`.

**Tech Stack:** React, Remix, Tailwind CSS, Vitest

---

## Task 1: Fix Stat Card Value Overflow (Issue #1 — Critical)

The four KPI cards use `text-2xl` (30px) for dollar values inside ~175px-wide cards at `md:grid-cols-4`. Values like `$746,400.00` overflow by 36-50px.

**Files:**
- Modify: `app/routes/_app.assets.real-estate.tsx:93` (grid class)
- Modify: `app/routes/_app.assets.real-estate.tsx:102,119,136,153` (value divs)
- Modify: `app/components/ui/stats-card.tsx:69` (reusable component value class)

**Step 1: Fix the grid breakpoint in the route file**

Change the summary grid from `md:grid-cols-4` to `md:grid-cols-2 lg:grid-cols-4` so cards get adequate width on medium screens:

```tsx
// Line 93: Change this
<div className="grid grid-cols-1 gap-6 md:grid-cols-4">
// To this
<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
```

**Step 2: Reduce value font size and add truncation on the inline stat cards**

For each of the four `<CardContent>` value divs (lines 102, 119, 136, 153), change:

```tsx
// From
<div className="text-2xl font-bold text-gray-900">
// To
<div className="text-lg font-bold text-gray-900 lg:text-xl">
```

**Step 3: Also fix the reusable StatsCard component for consistency**

In `app/components/ui/stats-card.tsx` line 69, change:

```tsx
// From
<div className="text-2xl font-bold text-gray-900">{value}</div>
// To
<div className="text-lg font-bold text-gray-900 lg:text-xl">{value}</div>
```

**Step 4: Verify visually**

Run: `npm run dev`
Check: Navigate to `/assets/real-estate`. All four stat cards should display full dollar values without overflow at any viewport width.

**Step 5: Commit**

```bash
git add app/routes/_app.assets.real-estate.tsx app/components/ui/stats-card.tsx
git commit -m "fix: stat card overflow — responsive grid + smaller value font"
```

---

## Task 2: Fix Header H1 Wrap (Issue #2 — Critical)

The H1 in `header.tsx` competes with the flex-1 search bar and wraps to two lines.

**Files:**
- Modify: `app/components/layout/header.tsx:104`

**Step 1: Add nowrap and shrink-0 to H1**

```tsx
// Line 104: Change this
<h1 className="hidden text-xl font-semibold text-secondary-900 lg:block">
// To this
<h1 className="hidden shrink-0 whitespace-nowrap text-xl font-semibold text-secondary-900 lg:block">
```

**Step 2: Verify visually**

Run: `npm run dev`
Check: Header H1 stays on one line at all viewport widths. Search bar still gets remaining space.

**Step 3: Commit**

```bash
git add app/components/layout/header.tsx
git commit -m "fix: prevent header H1 text from wrapping to two lines"
```

---

## Task 3: Fix "annually" Text Wrap in Expenses (Issue #3 — Critical)

The expense values like `$8,500.00 annually` wrap the word "annually" to a new line inside a narrow flex column.

**Files:**
- Modify: `app/routes/_app.assets.real-estate.tsx:320-321,330-331`

**Step 1: Add whitespace-nowrap to expense value spans**

For the Property Tax value span (around line 320):

```tsx
// From
<span className="text-red-600">
  {formatCurrency(asset.annualPropertyTax)} annually
</span>
// To
<span className="whitespace-nowrap text-gray-700">
  {formatCurrency(asset.annualPropertyTax)}/yr
</span>
```

For the Insurance value span (around line 330):

```tsx
// From
<span className="text-red-600">
  {formatCurrency(asset.annualInsurance)} annually
</span>
// To
<span className="whitespace-nowrap text-gray-700">
  {formatCurrency(asset.annualInsurance)}/yr
</span>
```

> Note: This also addresses **Issue #7** (red on routine expenses) by changing from `text-red-600` to `text-gray-700`.

**Step 2: Verify visually**

Run: `npm run dev`
Check: Expense values show as e.g. `$8,500.00/yr` on one line, in neutral gray.

**Step 3: Commit**

```bash
git add app/routes/_app.assets.real-estate.tsx
git commit -m "fix: expense values nowrap, abbreviate /yr, neutral color"
```

---

## Task 4: Fix Double Active Sidebar NavLink (Issue #4 — High)

Both "All Assets" (`/assets`) and "Real Estate" (`/assets/real-estate`) highlight simultaneously because `NavLink` `isActive` matches on prefix by default.

**Files:**
- Modify: `app/components/layout/sidebar.tsx:208-217`

**Step 1: Add `end` prop to child NavLinks whose `href` is also a parent group `href`**

The "All Assets" child NavLink at `/assets` needs the `end` prop so it only matches exactly:

```tsx
// Line 208-209: Change this
<NavLink
  to={child.href}
// To this
<NavLink
  to={child.href}
  end={child.href === item.href}
```

This adds `end` only when the child href equals the parent group href (i.e., `/assets`), so it won't match `/assets/real-estate`.

**Step 2: Verify visually**

Run: `npm run dev`
Check: Navigate to `/assets/real-estate`. Only "Real Estate" should be highlighted. "All Assets" should use the default inactive style.

**Step 3: Commit**

```bash
git add app/components/layout/sidebar.tsx
git commit -m "fix: prevent double active state in sidebar nav with end prop"
```

---

## Task 5: Fix Sidebar Pre-Scroll (Issue #5 — High)

The sidebar nav loads pre-scrolled ~282px down, hiding Dashboard and other top-level items.

**Files:**
- Modify: `app/components/layout/sidebar.tsx:163` (the `<nav>` element)

**Step 1: Add a ref and useEffect to scroll active item into view**

Add import for `useEffect` and `useRef` at the top of `sidebar.tsx`:

```tsx
// At the top, add to imports
import { useEffect, useRef } from "react";
```

Add a ref to the `<nav>` element and scroll the active link into view on mount:

```tsx
// Inside the Sidebar component, before the return:
const navRef = useRef<HTMLElement>(null);

useEffect(() => {
  if (navRef.current) {
    const activeLink = navRef.current.querySelector('[aria-current="page"]');
    if (activeLink) {
      activeLink.scrollIntoView({ block: "nearest" });
    } else {
      navRef.current.scrollTop = 0;
    }
  }
}, []);
```

Then on the `<nav>` tag (line 163):

```tsx
// From
<nav className="flex flex-1 flex-col overflow-y-auto px-2 py-2 lg:px-4 lg:py-4">
// To
<nav ref={navRef} className="flex flex-1 flex-col overflow-y-auto px-2 py-2 lg:px-4 lg:py-4">
```

**Step 2: Verify visually**

Run: `npm run dev`
Check: On initial load, sidebar starts at top (Dashboard visible). When navigating to a link deep in the list, it scrolls to show the active item without hiding the top.

**Step 3: Commit**

```bash
git add app/components/layout/sidebar.tsx
git commit -m "fix: sidebar scrolls active link into view instead of pre-scrolled"
```

---

## Task 6: Fix Search Bar Width (Issue #6 — High)

The search bar collapses to ~101px in the header flex row, making it unusable.

**Files:**
- Modify: `app/components/layout/header.tsx:109-113`

**Step 1: Add a min-width to the SearchBar wrapper**

```tsx
// Line 109-113: Change this
<SearchBar
  ref={searchBarRef}
  className="max-w-lg flex-1"
  placeholder="Search assets, trusts, beneficiaries..."
  showQuickStats={false}
/>
// To this
<SearchBar
  ref={searchBarRef}
  className="min-w-[200px] max-w-lg flex-1"
  placeholder="Search assets, trusts, beneficiaries..."
  showQuickStats={false}
/>
```

**Step 2: Verify visually**

Run: `npm run dev`
Check: Search bar is at least 200px wide and placeholder text is partially visible. At narrow viewports, it may push the right-side stats to compress, which is acceptable.

**Step 3: Commit**

```bash
git add app/components/layout/header.tsx
git commit -m "fix: ensure search bar has minimum usable width"
```

---

## Task 7: Fix Red Color on Routine Expenses (Issue #7 — Medium)

Already addressed in Task 3 (expense spans changed from `text-red-600` to `text-gray-700`). This task handles the remaining `text-red-600` on the mortgage Outstanding Balance.

**Files:**
- Modify: `app/routes/_app.assets.real-estate.tsx:262`

**Step 1: Change mortgage balance color from red to amber**

```tsx
// Line 262: Change this
<span className="font-medium text-red-600">
// To this
<span className="font-medium text-amber-600">
```

This distinguishes "debt you owe" (amber) from "crisis/negative" (red), while keeping it visually distinct from neutral text.

**Step 2: Commit**

```bash
git add app/routes/_app.assets.real-estate.tsx
git commit -m "fix: use amber for mortgage balance, reserve red for true negatives"
```

---

## Task 8: Add Accessible Labels to Priority Dots (Issue #8 — Medium)

The three recommendation dots (blue, yellow, green) use color alone with no text label or ARIA.

**Files:**
- Modify: `app/routes/_app.assets.real-estate.tsx:391,402,413` (the three dot divs)

**Step 1: Add sr-only labels and aria-hidden to dots**

For each of the three recommendation items, wrap the dot and add a screen-reader label. The pattern (repeated for each):

Blue dot (~line 391):
```tsx
// From
<div className="mt-2 h-2 w-2 rounded-full bg-blue-500"></div>
// To
<>
  <div className="mt-2 h-2 w-2 rounded-full bg-blue-500" aria-hidden="true"></div>
  <span className="sr-only">Status: Protected</span>
</>
```

Yellow dot (~line 402):
```tsx
// From
<div className="mt-2 h-2 w-2 rounded-full bg-yellow-500"></div>
// To
<>
  <div className="mt-2 h-2 w-2 rounded-full bg-yellow-500" aria-hidden="true"></div>
  <span className="sr-only">Status: Needs attention</span>
</>
```

Green dot (~line 413):
```tsx
// From
<div className="mt-2 h-2 w-2 rounded-full bg-green-500"></div>
// To
<>
  <div className="mt-2 h-2 w-2 rounded-full bg-green-500" aria-hidden="true"></div>
  <span className="sr-only">Status: Good</span>
</>
```

**Step 2: Commit**

```bash
git add app/routes/_app.assets.real-estate.tsx
git commit -m "fix: add accessible labels to color-only priority dots"
```

---

## Task 9: Fix capitalize on ALL-CAPS Property Type (Issue #9 — Medium)

The `propertyType` field stores values like `SINGLE_FAMILY`. The code replaces `_` with ` ` giving `SINGLE FAMILY`, then applies `capitalize` which has no effect on all-caps text.

**Files:**
- Modify: `app/routes/_app.assets.real-estate.tsx:191-193`

**Step 1: Use `.toLowerCase()` before display so `capitalize` works correctly**

```tsx
// Line 191-193: Change this
{asset.propertyType && (
  <div className="text-sm capitalize text-gray-600">
    {asset.propertyType.replace("_", " ")}
  </div>
)}
// To this
{asset.propertyType && (
  <div className="text-sm capitalize text-gray-600">
    {asset.propertyType.replace(/_/g, " ").toLowerCase()}
  </div>
)}
```

Note: Also changed `replace("_", " ")` to `replace(/_/g, " ")` to handle multiple underscores (e.g., `MULTI_FAMILY_HOME`).

**Step 2: Verify visually**

Run: `npm run dev`
Check: Property type displays as "Single Family" instead of "SINGLE FAMILY".

**Step 3: Commit**

```bash
git add app/routes/_app.assets.real-estate.tsx
git commit -m "fix: lowercase property type before capitalize so it renders correctly"
```

---

## Task 10: Fix Label Inconsistency in Property Details Grid (Issue #10 — Medium)

The "Appraisal Date" row uses `text-xs text-gray-500` while sibling rows use `text-sm text-gray-600`.

**Files:**
- Modify: `app/routes/_app.assets.real-estate.tsx:243-246`

**Step 1: Match appraisal date row styling to sibling rows**

```tsx
// Lines 243-246: Change this
{asset.lastAppraisalDate && (
  <div className="flex justify-between text-xs text-gray-500">
    <span>Appraisal Date:</span>
    <span>{formatDate(asset.lastAppraisalDate)}</span>
  </div>
)}
// To this
{asset.lastAppraisalDate && (
  <div className="flex justify-between text-sm">
    <span className="text-gray-600">Appraisal Date:</span>
    <span className="text-gray-900">{formatDate(asset.lastAppraisalDate)}</span>
  </div>
)}
```

**Step 2: Commit**

```bash
git add app/routes/_app.assets.real-estate.tsx
git commit -m "fix: consistent label styling on appraisal date row"
```

---

## Task 11: Add aria-labels to Icon Buttons (Issue #11 — Low)

The hamburger menu and notification bell buttons in `header.tsx` have no accessible names.

**Files:**
- Modify: `app/components/layout/header.tsx:96-101,144`

**Step 1: Add aria-label to hamburger button**

```tsx
// Line 96-99: Change this
<button
  onClick={onMenuClick}
  className="rounded-md p-2 text-secondary-500 hover:bg-secondary-100 hover:text-secondary-900 lg:hidden"
>
// To this
<button
  onClick={onMenuClick}
  aria-label="Open navigation menu"
  className="rounded-md p-2 text-secondary-500 hover:bg-secondary-100 hover:text-secondary-900 lg:hidden"
>
```

**Step 2: Add aria-label to notification bell button**

```tsx
// Line 144: Change this
<button className="relative rounded-lg p-2 text-secondary-500 hover:bg-secondary-100 hover:text-secondary-900">
// To this
<button aria-label="Notifications" className="relative rounded-lg p-2 text-secondary-500 hover:bg-secondary-100 hover:text-secondary-900">
```

**Step 3: Commit**

```bash
git add app/components/layout/header.tsx
git commit -m "fix: add aria-labels to header icon buttons"
```

---

## Task 12: Fix "1 properties" Pluralization (Issue #12 — Low)

The stat card subtitle hardcodes "properties" regardless of count.

**Files:**
- Modify: `app/utils/format.ts` (add `pluralize` helper)
- Test: `tests/utils/format.test.ts` (add tests)
- Modify: `app/routes/_app.assets.real-estate.tsx:105-107`

**Step 1: Write the failing test**

Add to `tests/utils/format.test.ts`:

```ts
import { pluralize } from "~/utils/format";

describe("pluralize", () => {
  it("returns singular for count of 1", () => {
    expect(pluralize(1, "property", "properties")).toBe("1 property");
  });

  it("returns plural for count of 0", () => {
    expect(pluralize(0, "property", "properties")).toBe("0 properties");
  });

  it("returns plural for count > 1", () => {
    expect(pluralize(5, "property", "properties")).toBe("5 properties");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run tests/utils/format.test.ts`
Expected: FAIL — `pluralize` is not exported from `~/utils/format`

**Step 3: Implement the pluralize function**

Add to `app/utils/format.ts`:

```ts
/**
 * Pluralize a word based on count
 * @param count The number to check
 * @param singular The singular form
 * @param plural The plural form
 * @returns Formatted string like "1 property" or "5 properties"
 */
export function pluralize(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run tests/utils/format.test.ts`
Expected: PASS

**Step 5: Use pluralize in the route file**

```tsx
// Line 12: Add to imports
import { formatCurrency, formatDate, pluralize } from "~/utils/format";

// Lines 105-107: Change this
<p className="text-xs text-gray-600">
  {realEstateAssets.length} properties
</p>
// To this
<p className="text-xs text-gray-600">
  {pluralize(realEstateAssets.length, "property", "properties")}
</p>
```

**Step 6: Commit**

```bash
git add app/utils/format.ts tests/utils/format.test.ts app/routes/_app.assets.real-estate.tsx
git commit -m "fix: pluralize property count — '1 property' not '1 properties'"
```

---

## Task 13: Remove Duplicate Notes Section (Issue #14 — Low)

The Notes section at the bottom of each property card duplicates the `asset.notes` text already shown inside the Ownership Structure section above it.

**Files:**
- Modify: `app/routes/_app.assets.real-estate.tsx:339-349`

**Step 1: Remove the duplicate Notes section**

Delete lines 339-349 entirely (the `{/* Additional Notes */}` block):

```tsx
// DELETE this entire block:
{/* Additional Notes */}
{asset.notes && (
  <div className="border-t pt-4">
    <h4 className="mb-2 text-sm font-medium text-gray-700">
      Notes
    </h4>
    <p className="text-sm text-gray-600">
      {asset.notes}
    </p>
  </div>
)}
```

The notes are already displayed inside the Ownership Structure section (lines 210-214).

**Step 2: Verify visually**

Run: `npm run dev`
Check: Notes text appears once in Ownership Structure, no duplicate Notes section below.

**Step 3: Commit**

```bash
git add app/routes/_app.assets.real-estate.tsx
git commit -m "fix: remove duplicate notes section from property card"
```

---

## Summary

| Task | Issue(s) | Severity | Files Changed |
|------|----------|----------|---------------|
| 1 | #1 | Critical | `_app.assets.real-estate.tsx`, `stats-card.tsx` |
| 2 | #2 | Critical | `header.tsx` |
| 3 | #3, #7 | Critical+Medium | `_app.assets.real-estate.tsx` |
| 4 | #4 | High | `sidebar.tsx` |
| 5 | #5 | High | `sidebar.tsx` |
| 6 | #6 | High | `header.tsx` |
| 7 | #7 | Medium | `_app.assets.real-estate.tsx` |
| 8 | #8 | Medium | `_app.assets.real-estate.tsx` |
| 9 | #9 | Medium | `_app.assets.real-estate.tsx` |
| 10 | #10 | Medium | `_app.assets.real-estate.tsx` |
| 11 | #11 | Low | `header.tsx` |
| 12 | #12 | Low | `format.ts`, `format.test.ts`, `_app.assets.real-estate.tsx` |
| 13 | #14 | Low | `_app.assets.real-estate.tsx` |

**Total: 13 tasks, 4 files modified, 1 test file updated, 0 new files.**

Issue #13 (CRUD actions) is deferred as a separate feature.
