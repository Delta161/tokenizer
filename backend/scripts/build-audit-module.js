import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * Script to build the audit module TypeScript files to JavaScript
 * Run with: node scripts/build-audit-module.js
 */

async function buildAuditModule() {
  console.log('Building audit module...');
  
  try {
    // Update app.js import to use .ts extension directly
    await updateAppJsImport();
    
    console.log('app.js updated successfully!');
  } catch (error) {
    console.error('Error updating app.js:', error);
  }
}

async function updateAppJsImport() {
  const appJsPath = path.resolve('app.js');
  
  try {
    let content = await fs.readFile(appJsPath, 'utf8');
    
    // Replace the import statement to use the .ts file directly
    if (content.includes("import { auditRouter } from './modules/audit/index.ts';")) {
      console.log('Import statement already updated.');
      return;
    }
    
    // If it's using .js extension, update it
    content = content.replace(
      "import { auditRouter } from './modules/audit/index.js';",
      "import { auditRouter } from './modules/audit/index.ts';"
    );
    
    await fs.writeFile(appJsPath, content, 'utf8');
  } catch (error) {
    console.error('Error updating app.js:', error);
    throw error;
  }
}

buildAuditModule();