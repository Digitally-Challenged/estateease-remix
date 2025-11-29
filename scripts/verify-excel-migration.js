#!/usr/bin/env node

/**
 * Script to verify Excel data migration to SQLite database
 * Compares data in Coleman Trust Updated June 2025.xlsx with database
 * Excludes Kathleen Geeslin Trust information as requested
 */

import Database from "better-sqlite3";
import ExcelJS from "exceljs";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import process from "process";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// File paths
const dbPath = path.join(__dirname, "../data/estateease.db");
const excelPath = path.join(__dirname, "../data/Coleman Trust Updated June 2025.xlsx");

// Check if files exist
if (!fs.existsSync(dbPath)) {
  console.error("Database file not found:", dbPath);
  process.exit(1);
}

if (!fs.existsSync(excelPath)) {
  console.error("Excel file not found:", excelPath);
  process.exit(1);
}

// Main async function
async function main() {
  // Open database
  const db = new Database(dbPath);
  db.pragma("foreign_keys = ON");

  // Read Excel file
  console.log("Reading Excel file...");
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(excelPath);
  const sheetNames = workbook.worksheets.map((ws) => ws.name);
  console.log("Sheet names:", sheetNames);

  // Helper function to convert Excel data to JSON
  function sheetToJson(worksheet) {
    const rows = [];
    const headers = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) {
        // First row is headers
        row.eachCell((cell, colNumber) => {
          headers[colNumber - 1] = cell.value;
        });
      } else {
        // Data rows
        const rowData = {};
        row.eachCell((cell, colNumber) => {
          const header = headers[colNumber - 1];
          if (header) {
            rowData[header] = cell.value || null;
          }
        });
        rows.push(rowData);
      }
    });

    return rows;
  }

  // Get user IDs
  const getNickUserId = () => {
    const result = db.prepare(`SELECT id FROM users WHERE external_id = 'user-nick-001'`).get();
    return result ? result.id : null;
  };

  const getKelseyUserId = () => {
    const result = db.prepare(`SELECT id FROM users WHERE external_id = 'user-kelsey-001'`).get();
    return result ? result.id : null;
  };

  const nickUserId = getNickUserId();
  const kelseyUserId = getKelseyUserId();

  console.log(`\nUser IDs found:`);
  console.log(`Nick user ID: ${nickUserId}`);
  console.log(`Kelsey user ID: ${kelseyUserId}\n`);

  // Function to get all assets from database
  function getDatabaseAssets() {
    const query = `
    SELECT 
      a.asset_id,
      a.user_id,
      a.name,
      a.category,
      a.value,
      a.ownership_type,
      a.ownership_details,
      a.asset_details,
      a.notes,
      u.first_name || ' ' || u.last_name as owner_name
    FROM assets a
    JOIN users u ON a.user_id = u.id
    WHERE a.is_active = 1
    ORDER BY a.category, a.name
  `;

    return db.prepare(query).all();
  }

  // Function to check if an asset exists in database
  function findAssetInDatabase(assetName, value, category, dbAssets) {
    return dbAssets.find((dbAsset) => {
      // Normalize for comparison
      const dbName = dbAsset.name.toLowerCase().trim();
      const searchName = assetName.toLowerCase().trim();
      const dbValue = parseFloat(dbAsset.value);
      const searchValue = parseFloat(value) || 0;

      // Check for exact name match
      if (dbName === searchName) return true;

      // Check for partial matches
      if (dbName.includes(searchName) || searchName.includes(dbName)) {
        // Also check if values are close (within $1 for rounding differences)
        if (Math.abs(dbValue - searchValue) < 1) return true;
      }

      return false;
    });
  }

  // Process each sheet
  const verificationResults = {
    totalExcelRows: 0,
    foundInDb: 0,
    notFoundInDb: [],
    kelseyGeeslinExcluded: 0,
  };

  // Get all database assets
  const dbAssets = getDatabaseAssets();
  console.log(`Total assets in database: ${dbAssets.length}\n`);

  // Process each sheet in the Excel file
  workbook.worksheets.forEach((worksheet) => {
    const sheetName = worksheet.name;
    console.log(`\n=== Processing sheet: ${sheetName} ===`);

    const data = sheetToJson(worksheet);

    if (data.length === 0) {
      console.log("No data in this sheet");
      return;
    }

    console.log(`Rows in sheet: ${data.length}`);
    console.log("Columns:", Object.keys(data[0] || {}));

    // Process each row
    data.forEach((row, index) => {
      // Skip rows that appear to be headers or empty
      if (!row || Object.values(row).every((v) => !v || v === "")) return;

      // Check if this is Kathleen Geeslin Trust data (to be excluded)
      const rowStr = JSON.stringify(row).toLowerCase();
      if (
        rowStr.includes("kathleen") ||
        rowStr.includes("geeslin") ||
        rowStr.includes("kit coleman") ||
        rowStr.includes("kit")
      ) {
        verificationResults.kelseyGeeslinExcluded++;
        return;
      }

      verificationResults.totalExcelRows++;

      // Try to identify the asset based on common column names
      let assetName =
        row["Asset"] ||
        row["Account Name"] ||
        row["Description"] ||
        row["Property"] ||
        row["Name"] ||
        row["Account"] ||
        "";
      let value =
        row["Value"] ||
        row["Amount"] ||
        row["Balance"] ||
        row["Current Value"] ||
        row["Market Value"] ||
        "0";

      if (!assetName) {
        // Try to construct a name from other fields
        const possibleNameFields = Object.entries(row)
          .filter(([, val]) => val && typeof val === "string" && val.length > 3)
          .map(([, val]) => val);

        if (possibleNameFields.length > 0) {
          assetName = possibleNameFields[0];
        }
      }

      if (assetName) {
        const found = findAssetInDatabase(assetName, value, sheetName, dbAssets);

        if (found) {
          verificationResults.foundInDb++;
        } else {
          verificationResults.notFoundInDb.push({
            sheet: sheetName,
            row: index + 1,
            assetName,
            value,
            fullRow: row,
          });
        }
      }
    });
  });

  // Display results
  console.log("\n" + "=".repeat(80));
  console.log("VERIFICATION SUMMARY");
  console.log("=".repeat(80));
  console.log(
    `Total rows in Excel (excluding headers/empty): ${verificationResults.totalExcelRows}`,
  );
  console.log(`Kathleen Geeslin Trust rows excluded: ${verificationResults.kelseyGeeslinExcluded}`);
  console.log(`Assets found in database: ${verificationResults.foundInDb}`);
  console.log(`Assets NOT found in database: ${verificationResults.notFoundInDb.length}`);

  if (verificationResults.notFoundInDb.length > 0) {
    console.log("\n" + "-".repeat(80));
    console.log("MISSING ASSETS (not found in database):");
    console.log("-".repeat(80));

    verificationResults.notFoundInDb.forEach((missing) => {
      console.log(`\nSheet: ${missing.sheet}, Row: ${missing.row}`);
      console.log(`Asset: ${missing.assetName}`);
      console.log(`Value: ${missing.value}`);
      console.log("Full row data:", JSON.stringify(missing.fullRow, null, 2));
    });
  }

  // Also check for database assets that might not be in Excel
  console.log("\n" + "-".repeat(80));
  console.log("DATABASE ASSET CATEGORIES SUMMARY:");
  console.log("-".repeat(80));

  const categorySummary = db
    .prepare(
      `
  SELECT 
    category,
    COUNT(*) as count,
    SUM(value) as total_value
  FROM assets
  WHERE is_active = 1
  GROUP BY category
  ORDER BY category
`,
    )
    .all();

  categorySummary.forEach((cat) => {
    console.log(
      `${cat.category}: ${cat.count} assets, Total value: $${cat.total_value.toLocaleString()}`,
    );
  });

  // Close database
  db.close();

  console.log("\n✅ Verification complete!");
}

// Run the main function
main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
