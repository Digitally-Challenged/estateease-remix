#!/usr/bin/env node

const fs = require("fs");
const glob = require("glob");

// Icon name mappings
const iconMappings = {
  "bar-chart3": "bar-chart-3",
  building2: "building-2",
  link2: "link-2",
  edit2: "edit-2",
};

function fixIconImports(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  let modified = false;

  // Fix each icon mapping
  Object.entries(iconMappings).forEach(([oldName, newName]) => {
    const regex = new RegExp(`lucide-react/dist/esm/icons/${oldName}`, "g");
    if (content.match(regex)) {
      content = content.replace(regex, `lucide-react/dist/esm/icons/${newName}`);
      modified = true;
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed icon names in: ${filePath}`);
    return true;
  }

  return false;
}

// Find all TypeScript/JavaScript files
const files = glob.sync("app/**/*.{ts,tsx,js,jsx}", {
  ignore: ["**/node_modules/**", "**/dist/**", "**/build/**"],
});

console.log(`Checking ${files.length} files for icon name issues...`);

let fixedCount = 0;
files.forEach((file) => {
  if (fixIconImports(file)) {
    fixedCount++;
  }
});

console.log(`\n✅ Fixed icon names in ${fixedCount} files`);
