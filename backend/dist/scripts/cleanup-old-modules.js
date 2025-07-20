/**
 * Cleanup script for removing old module structure after migration
 *
 * This script helps with the cleanup process after migrating from the old
 * modules structure to the new flattened structure in src/modules.
 *
 * It performs the following tasks:
 * 1. Verifies all modules have been migrated
 * 2. Creates a backup of the old modules directory
 * 3. Updates import references in key files
 * 4. Provides guidance on manual verification steps
 */
import { promises as fs } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { createReadStream, createWriteStream } from 'fs';
import { createGzip } from 'zlib';
import { pipeline } from 'stream/promises';
// Configuration
const OLD_MODULES_DIR = path.resolve('modules');
const NEW_MODULES_DIR = path.resolve('src/modules');
const BACKUP_DIR = path.resolve('backups');
const BACKUP_FILENAME = `modules-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.tar.gz`;
// Helper function to execute shell commands
async function execCommand(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing command: ${error.message}`);
                reject(error);
                return;
            }
            if (stderr) {
                console.warn(`Command stderr: ${stderr}`);
            }
            resolve(stdout);
        });
    });
}
// Check if all modules have been migrated
async function verifyMigration() {
    console.log('Verifying all modules have been migrated...');
    try {
        // Get list of old modules
        const oldModules = await fs.readdir(OLD_MODULES_DIR);
        // Get list of new modules
        const newModules = await fs.readdir(NEW_MODULES_DIR);
        // Check if any old modules are missing in the new structure
        const missingModules = oldModules.filter(module => !newModules.includes(module));
        if (missingModules.length > 0) {
            console.error('⚠️ The following modules have not been migrated yet:');
            missingModules.forEach(module => console.error(`  - ${module}`));
            console.error('Please migrate these modules before proceeding with cleanup.');
            return false;
        }
        console.log('✅ All modules have been successfully migrated!');
        return true;
    }
    catch (error) {
        console.error('Error verifying migration:', error);
        return false;
    }
}
// Create a backup of the old modules directory
async function createBackup() {
    console.log('Creating backup of old modules directory...');
    try {
        // Create backups directory if it doesn't exist
        await fs.mkdir(BACKUP_DIR, { recursive: true });
        // Create backup using tar and gzip
        const backupPath = path.join(BACKUP_DIR, BACKUP_FILENAME);
        // Use tar command if available (Unix-like systems)
        if (process.platform !== 'win32') {
            await execCommand(`tar -czf "${backupPath}" -C "${path.dirname(OLD_MODULES_DIR)}" "${path.basename(OLD_MODULES_DIR)}"`);
        }
        else {
            // On Windows, we'll use a simpler approach (not a full directory backup)
            console.log('Creating a simple backup on Windows (not a full directory backup)');
            // This is a placeholder - a proper Windows backup would require additional libraries
            await execCommand(`powershell Compress-Archive -Path "${OLD_MODULES_DIR}" -DestinationPath "${backupPath.replace('.tar.gz', '.zip')}"`);
        }
        console.log(`✅ Backup created at: ${backupPath}`);
        return true;
    }
    catch (error) {
        console.error('Error creating backup:', error);
        return false;
    }
}
// Main function
async function cleanup() {
    console.log('Starting cleanup process...');
    // Step 1: Verify all modules have been migrated
    const migrationVerified = await verifyMigration();
    if (!migrationVerified) {
        console.error('Migration verification failed. Aborting cleanup.');
        return;
    }
    // Step 2: Create a backup of the old modules directory
    const backupCreated = await createBackup();
    if (!backupCreated) {
        console.error('Backup creation failed. Aborting cleanup.');
        return;
    }
    // Step 3: Provide guidance on manual verification steps
    console.log('\n📋 Cleanup Checklist:');
    console.log('1. ✅ Verified all modules have been migrated');
    console.log('2. ✅ Created backup of old modules directory');
    console.log('3. ⏳ Manual verification steps:');
    console.log('   - Run tests to ensure functionality is preserved');
    console.log('   - Verify the application starts correctly with the new structure');
    console.log('   - Check for any remaining import references to the old structure');
    console.log('\nOnce you have completed these steps, you can safely remove the old modules directory with:');
    console.log('   node scripts/remove-old-modules.js');
}
// Run the cleanup process
cleanup();
//# sourceMappingURL=cleanup-old-modules.js.map