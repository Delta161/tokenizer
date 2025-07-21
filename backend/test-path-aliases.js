// test-path-aliases.js
// Run this file with: node --import ./tsconfig-paths-bootstrap.js test-path-aliases.js

import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Testing path alias resolution...');

// Test if path aliases are working by checking if files exist
const pathsToCheck = [
  { alias: '@/config', path: resolve(__dirname, 'dist/src/config') },
  { alias: '@/modules', path: resolve(__dirname, 'dist/src/modules') },
  { alias: '@/utils', path: resolve(__dirname, 'dist/src/utils') },
  { alias: '@/prisma', path: resolve(__dirname, 'dist/prisma') },
];

pathsToCheck.forEach(({ alias, path }) => {
  const exists = fs.existsSync(path);
  console.log(`${alias} -> ${path}: ${exists ? '✅ Exists' : '❌ Not found'}`);
});

console.log('\nIf all paths show "Exists", your path aliases are correctly configured.');
console.log('If any paths show "Not found", check your tsconfig.json and tsconfig-paths-bootstrap.js files.');