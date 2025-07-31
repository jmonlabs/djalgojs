#!/usr/bin/env node

/**
 * Fix TypeScript compiled imports for ES Modules
 * This script adds .js extensions to relative imports in the compiled output
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, '..', 'dist');

/**
 * Recursively process all .js files in the dist directory
 */
function processDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      processDirectory(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      processJavaScriptFile(fullPath);
    }
  }
}

/**
 * Process a single JavaScript file to fix imports
 */
function processJavaScriptFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Fix import statements - add .js extension to relative imports
  content = content.replace(
    /import\s+(?:(?:{[^}]*}|\*\s+as\s+\w+|\w+)\s+from\s+)?["']([^"']+)["'];?/g,
    (match, importPath) => {
      // Only process relative imports that don't already have an extension
      if (importPath.startsWith('./') || importPath.startsWith('../')) {
        if (!path.extname(importPath)) {
          modified = true;
          return match.replace(importPath, importPath + '.js');
        }
      }
      return match;
    }
  );
  
  // Fix export statements - add .js extension to relative exports
  content = content.replace(
    /export\s+(?:\*|\{[^}]*\})\s+from\s+["']([^"']+)["'];?/g,
    (match, exportPath) => {
      // Only process relative exports that don't already have an extension
      if (exportPath.startsWith('./') || exportPath.startsWith('../')) {
        if (!path.extname(exportPath)) {
          modified = true;
          return match.replace(exportPath, exportPath + '.js');
        }
      }
      return match;
    }
  );
  
  // Fix require statements (in case any remain)
  content = content.replace(
    /require\(["']([^"']+)["']\)/g,
    (match, requirePath) => {
      if (requirePath.startsWith('./') || requirePath.startsWith('../')) {
        if (!path.extname(requirePath)) {
          modified = true;
          return match.replace(requirePath, requirePath + '.js');
        }
      }
      return match;
    }
  );
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed imports in: ${path.relative(distDir, filePath)}`);
  }
}

/**
 * Main execution
 */
function main() {
  if (!fs.existsSync(distDir)) {
    console.error('Error: dist directory does not exist. Run tsc first.');
    process.exit(1);
  }
  
  console.log('Fixing ES Module imports in compiled output...');
  processDirectory(distDir);
  console.log('Import fixing complete!');
}

main();