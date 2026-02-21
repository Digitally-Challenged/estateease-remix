# UX/UI/Styling Audit — EstateEase · Real Estate Portfolio

---

## 🔴 Critical Issues (Broken Layouts / Overflow)

### 1. Stat Cards Overflow — Text Clipping on 3 of 4 Cards

**Location:** Summary row — Total Property Value, Net Equity, Total Mortgage Debt cards

The four KPI cards use `md:grid-cols-4` which renders each card at ~175px wide. The monetary values use `text-2xl font-bold` (30px), which causes content like `$746,400.00`, `$362,210.84`, and `$384,189.16` to overflow and get clipped. The "Monthly Rental Income" card is the only one that doesn't overflow because its value is `$0.00`.

**Measured overflow:**

- Total Property Value: clientWidth 174px → scrollWidth 224px (+50px overflow)
- Net Equity: clientWidth 174px → scrollWidth 219px (+45px overflow)
- Total Mortgage Debt: clientWidth 174px → scrollWidth 210px (+36px overflow)

**Fix:** Reduce the value font size to `text-lg` or `text-xl` within the card, or add `truncate` / `text-ellipsis` with a tooltip, or switch to `grid-cols-2` on medium screens and `grid-cols-4` only on large screens.

---

### 2. Page Title "Real Estate" Wraps to Two Lines in Header

**Location:** Top navbar H1

The `<h1>` renders "Real Estate" at 25px semibold but has `flex-shrink: 1` (default), so it competes with the `flex-1` search wrapper. The result: the H1 collapses to ~107px wide and the text wraps — 75px height when it should be ~37px (one line). The header row is misaligned because the left group ends up 75px tall while the right group (user info, net worth) is only 48px tall.

**Fix:** Add `whitespace-nowrap flex-shrink-0` to the H1.

---

### 3. "Income & Expenses" Values Wrap Awkwardly

**Location:** Property detail card → Income & Expenses column

`"$8,500.00 annually"` and `"$2,400.00 annually"` are each in a `flex justify-between` row inside a 222px column. The value span is 131px wide and `white-space: normal`, so "annually" wraps to a second line in red text. This creates vertically uneven rows and makes "annually" appear to float as its own disconnected element.

**Fix:** Use `whitespace-nowrap` on the value span, or put the frequency ("annually") in a lighter sub-label below the amount, or abbreviate to `/yr`.

---

## 🟠 High Severity Issues (UI Bugs / Logic Errors)

### 4. Double Active State in Sidebar Navigation

**Location:** Left sidebar — "All Assets" and "Real Estate" both highlighted

Both `<a href="/assets">` and `<a href="/assets/real-estate">` receive `bg-primary-600 text-white` (the active style). At 1199px viewport width, two navigation items are simultaneously highlighted in solid blue. Only the most specific active route ("Real Estate") should carry the active style; "All Assets" should use a subtler ancestor-active treatment (e.g., a left border accent or medium weight text).

---

### 5. Sidebar Default Scroll Hides Primary Navigation

**Location:** Left sidebar

The sidebar `<nav>` has `scrollHeight: 1675px` vs `clientHeight: 995px`, and it loads pre-scrolled to `scrollTop: 282px` (41.5% down). This means "Dashboard", "AI Dashboard", "Financial Overview", and "Financial Intelligence" are hidden above the visible area. A user returning to the dashboard would need to scroll up first — the most critical navigation destination is invisible by default.

**Fix:** Reset sidebar `scrollTop` to 0 on mount, or anchor-scroll to the active item with `scrollIntoView({ block: 'nearest' })`.

---

### 6. Search Bar is Effectively Unusable (101px Wide)

**Location:** Header search input

The search form wrapper has `max-w-lg flex-1`, but in the constrained flex row it only resolves to 101px — too narrow to show any meaningful input or its own placeholder text ("Search assets, trusts, beneficiaries..."). The placeholder is completely truncated.

**Fix:** Either give the search a minimum width (`min-w-[200px]`) or consider moving it to its own full-width area, or use an icon-button that expands to a modal/popover search.

---

## 🟡 Medium Severity Issues (Color Semantics / Consistency)

### 7. Red Used for Non-Negative Expense Figures

**Location:** Income & Expenses section; Mortgage Information section

`text-red-600` is applied to: Outstanding Mortgage Balance (`$384,189.16`), Property Tax (`$8,500.00 annually`), and Insurance (`$2,400.00 annually`). While debts and fixed costs are outflows, using the same urgent red across all of them collapses the distinction between "this is a balance you owe on a loan" vs. "this is a routine annual expense." Property tax and insurance are normal, expected costs — not alarming figures.

**Fix:** Reserve `text-red-600` strictly for negative cash flow or delinquency. Use a neutral `text-gray-700` or `text-slate-600` for routine expenses, and reserve a lighter red or an amber for the LTV/debt balance if emphasis is needed.

---

### 8. Color-Only Priority Indicators in Recommendations

**Location:** Portfolio Analysis → Estate Planning Considerations

The three recommendations use colored dots (blue, yellow, green) as the sole signal of priority/status. There are no text labels ("Low", "Medium", "High"), no `aria-label`, and the dots lack `aria-hidden="true"`, so a screen reader will attempt to read them as empty elements.

**Fix:** Add a visually-hidden text label (e.g., `<span class="sr-only">High priority</span>`) adjacent to each dot, and add `aria-hidden="true"` to the decorative dot itself.

---

### 9. CSS Class Mismatch: `capitalize` Applied to All-Caps Text

**Location:** Property card → "SINGLE FAMILY" label

The element has `class="text-sm capitalize text-gray-600"`, but the text content is `"SINGLE FAMILY"` (all uppercase in the HTML). CSS `text-transform: capitalize` only capitalizes the first letter of each word — it has no effect on already-uppercase text. Visually the output is `SINGLE FAMILY`, but the intent appears to be sentence case (e.g., "Single family").

**Fix:** Either store the value in sentence case and apply `capitalize`, or keep all-caps and switch to `uppercase` class, or store as "Single Family" and remove the transform class.

---

### 10. Label Style Inconsistency in Property Details Grid

**Location:** Property Value column — "Appraisal Date:" row

"Current Value:" and "Last Appraisal:" labels have `class="text-gray-600"` (17.5px, `rgb(75,85,99)`). The "Appraisal Date:" and its value "5/31/2023" carry no class at all — they inherit a lighter `rgb(107,114,128)` at 15px, which makes them visually de-emphasized and visually inconsistent with the rows above.

**Fix:** Apply `text-xs text-gray-500` consistently if this is intentionally a sub-row, or `text-sm text-gray-600` to match the sibling rows.

---

## 🔵 Low Severity Issues (Accessibility / Content)

### 11. Icon Buttons Missing Accessible Names

**Location:** Header — hamburger menu button; notification bell button

Both icon-only buttons have no `aria-label`, no `title`, and no visible text. Screen readers will announce them as anonymous buttons.

**Fix:**

```html
<button aria-label="Open navigation menu">
  <!-- hamburger -->
  <button aria-label="Notifications (1 unread)"><!-- bell --></button>
</button>
```

---

### 12. Grammatical Error: "1 properties"

**Location:** Total Property Value stat card — subtitle

The card reads `"1 properties"` which is grammatically incorrect. The pluralization logic is not accounting for singular vs. plural.

**Fix:** Use a conditional: `${count === 1 ? 'property' : 'properties'}`.

---

### 13. No CRUD Actions on Property Card

**Location:** Property listing card for 2211 NW Willow

The property card is entirely read-only — there are no "Edit", "Delete", or "Add Property" buttons anywhere on the page. For a portfolio management tool, users expect to at minimum edit details or add new properties.

**Fix:** Add an action menu (⋮ or Edit icon) to the property card header, and a primary "Add Property" CTA button near the page title.

---

### 14. Notes Section Duplicates Ownership Description

**Location:** Property card → Notes section

The Notes content reads: _"Primary residence, transferred to trusts via Warranty Deed"_ — which is identical to the description already shown in the Ownership Structure section just above it. This redundancy wastes vertical space and could confuse users into thinking notes are auto-populated rather than editable.

---

## Summary Table

| #   | Severity    | Issue                                                  | Location                 |
| --- | ----------- | ------------------------------------------------------ | ------------------------ |
| 1   | 🔴 Critical | 3/4 stat cards overflow/clip dollar values             | KPI row                  |
| 2   | 🔴 Critical | Page title "Real Estate" wraps to 2 lines in header    | Top navbar               |
| 3   | 🔴 Critical | Expense values wrap awkwardly ("annually" floats)      | Income & Expenses column |
| 4   | 🟠 High     | Two sidebar nav items simultaneously active            | Left nav                 |
| 5   | 🟠 High     | Sidebar pre-scrolled; "Dashboard" hidden off-screen    | Left nav                 |
| 6   | 🟠 High     | Search bar collapses to 101px, input is unusable       | Header                   |
| 7   | 🟡 Medium   | Red used for routine expenses = alarming false signals | Property detail card     |
| 8   | 🟡 Medium   | Color-only priority dots, not accessible               | Portfolio Analysis       |
| 9   | 🟡 Medium   | `capitalize` class applied to already-uppercase text   | "SINGLE FAMILY" label    |
| 10  | 🟡 Medium   | Inconsistent label font size/color in details grid     | Property Value column    |
| 11  | 🔵 Low      | Hamburger & bell buttons lack `aria-label`             | Header                   |
| 12  | 🔵 Low      | Grammatical error: "1 properties"                      | Stat card                |
| 13  | 🔵 Low      | No edit/add/delete actions anywhere on page            | Property card            |
| 14  | 🔵 Low      | Notes duplicates Ownership Structure description       | Property card            |
