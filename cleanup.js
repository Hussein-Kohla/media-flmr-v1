const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'components', 'ui');
const filesToRemove = [
  'Input.tsx',
  'Button.tsx',
  'Card.tsx',
  'SkeletonLoader.tsx',
  'Sidebar.tsx',
  'Toast.tsx'
];

let removed = [];

try {
  const dirFiles = fs.readdirSync(targetDir);
  console.log("Directory contents before:", dirFiles);
  for (const file of filesToRemove) {
    if (dirFiles.includes(file)) {
      const fullPath = path.join(targetDir, file);
      fs.unlinkSync(fullPath);
      removed.push(file);
    }
  }
  console.log("Removed files:", removed);
  const dirFilesAfter = fs.readdirSync(targetDir);
  console.log("Directory contents after:", dirFilesAfter);
} catch (err) {
  console.error("Error:", err);
}
