/**
 * Script to remove old modules directory after migration
 *
 * This script should only be run after:
 * 1. All modules have been migrated to the new structure
 * 2. A backup has been created
 * 3. The application has been tested and verified to work with the new structure
 */
import { promises as fs } from 'fs';
import path from 'path';
import readline from 'readline';
const OLD_MODULES_DIR = path.resolve('modules');
// Create readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
// Helper function to prompt for confirmation
function confirm(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
        });
    });
}
// Helper function to recursively remove a directory
async function removeDirectory(dirPath) {
    try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        // Process all entries in the directory
        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);
            if (entry.isDirectory()) {
                // Recursively remove subdirectories
                await removeDirectory(fullPath);
            }
            else {
                // Remove files
                await fs.unlink(fullPath);
            }
        }
        // Remove the empty directory
        await fs.rmdir(dirPath);
        return true;
    }
    catch (error) {
        console.error(`Error removing directory ${dirPath}:`, error);
        return false;
    }
}
// Main function
async function removeOldModules() {
    console.log('⚠️ WARNING: This script will permanently remove the old modules directory.');
    console.log('Make sure you have:');
    console.log('1. Migrated all modules to the new structure');
    console.log('2. Created a backup of the old modules directory');
    console.log('3. Tested and verified the application works with the new structure');
    // Check if old modules directory exists
    try {
        await fs.access(OLD_MODULES_DIR);
    }
    catch (error) {
        console.log('\n❌ Old modules directory not found. It may have already been removed.');
        rl.close();
        return;
    }
    // Prompt for confirmation
    const confirmed = await confirm('\nAre you sure you want to proceed? (y/n): ');
    if (!confirmed) {
        console.log('\nOperation cancelled. No changes were made.');
        rl.close();
        return;
    }
    console.log('\nRemoving old modules directory...');
    // Remove the old modules directory
    const removed = await removeDirectory(OLD_MODULES_DIR);
    if (removed) {
        console.log('\n✅ Old modules directory has been successfully removed!');
        console.log('The migration to the new structure is now complete.');
    }
    else {
        console.error('\n❌ Failed to remove old modules directory.');
        console.log('Please check the error messages and try again.');
    }
    rl.close();
}
// Run the script
removeOldModules();
//# sourceMappingURL=remove-old-modules.js.map