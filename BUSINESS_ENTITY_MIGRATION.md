# Business Entity Enhancement Migration

This migration adds new fields to support business entity information for business assets.

## New Fields Added

The following fields have been added to the `assets` table:
- `incorporation_type` - The type of business entity (LLC, S-Corp, C-Corp, Partnership, Sole Proprietorship)
- `state_of_incorporation` - The US state where the business is incorporated
- `ein` - Employer Identification Number (format: XX-XXXXXXX)

## Running the Migration

To apply the business entity fields migration to your database:

```bash
# Run the migration script
node scripts/run-migration.js
```

This will:
1. Check if the migration has already been applied
2. Add the three new columns to the assets table
3. Create indexes for performance
4. Set default values for existing business assets

## Using the New Fields

When creating or editing a business asset in the UI:
1. Select "Business Interest" as the asset category
2. You'll see new fields appear:
   - Incorporation Type dropdown
   - State of Incorporation selector (all US states)
   - EIN field with format validation

The fields are only visible and used when the asset category is BUSINESS_INTEREST.

## Technical Details

- Migration file: `/app/db/data-migrations/003-add-business-entity-fields.sql`
- Form updates: `/app/components/forms/asset-form.tsx`
- Type updates: `/app/types/assets.ts` and `/app/types/enums.ts`
- DAL updates: `/app/lib/dal-crud.ts` and `/app/lib/transformers.ts`

## Rollback

If you need to rollback this migration, you can manually remove the columns:

```sql
-- Remove the columns (WARNING: This will delete data)
ALTER TABLE assets DROP COLUMN incorporation_type;
ALTER TABLE assets DROP COLUMN state_of_incorporation;
ALTER TABLE assets DROP COLUMN ein;

-- Remove the indexes
DROP INDEX IF EXISTS idx_assets_incorporation_type;
DROP INDEX IF EXISTS idx_assets_state_of_incorporation;
```