/**
 * Migration Script for Backend Refactoring
 *
 * This script helps with migrating the existing backend code to the new feature-driven structure.
 * It creates the necessary directories and moves files to their new locations.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
// Define the source and destination directories
const oldStructure = {
    controllers: path.join(rootDir, 'controllers'),
    routes: path.join(rootDir, 'routes'),
    services: path.join(rootDir, 'services'),
    modules: path.join(rootDir, 'modules'),
};
const newStructure = {
    src: path.join(rootDir, 'src'),
    modules: path.join(rootDir, 'src', 'modules'),
    middleware: path.join(rootDir, 'src', 'middleware'),
    config: path.join(rootDir, 'src', 'config'),
    prisma: path.join(rootDir, 'src', 'prisma'),
    utils: path.join(rootDir, 'src', 'utils'),
    types: path.join(rootDir, 'src', 'types'),
    tests: path.join(rootDir, 'tests'),
};
// Create directories if they don't exist
const createDirectories = () => {
    console.log('Creating directories...');
    Object.values(newStructure).forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            console.log(`Created directory: ${dir}`);
        }
    });
    // Create test directories
    const testDirs = ['unit', 'integration'];
    testDirs.forEach(dir => {
        const testDir = path.join(newStructure.tests, dir);
        if (!fs.existsSync(testDir)) {
            fs.mkdirSync(testDir, { recursive: true });
            console.log(`Created directory: ${testDir}`);
        }
    });
    console.log('Directories created successfully.');
};
// Migrate a module
const migrateModule = (moduleName) => {
    console.log(`Migrating module: ${moduleName}...`);
    // Create module directory
    const moduleDir = path.join(newStructure.modules, moduleName);
    if (!fs.existsSync(moduleDir)) {
        fs.mkdirSync(moduleDir, { recursive: true });
    }
    // Check if module already exists in old modules structure
    const oldModuleDir = path.join(oldStructure.modules, moduleName);
    if (fs.existsSync(oldModuleDir)) {
        console.log(`Module ${moduleName} already exists in old structure. Copying files...`);
        // Copy files from old module directory to new module directory
        const files = fs.readdirSync(oldModuleDir);
        files.forEach(file => {
            const oldFilePath = path.join(oldModuleDir, file);
            const newFilePath = path.join(moduleDir, file);
            // Skip directories for now
            if (fs.statSync(oldFilePath).isDirectory()) {
                return;
            }
            // Copy file
            fs.copyFileSync(oldFilePath, newFilePath);
            console.log(`Copied file: ${oldFilePath} -> ${newFilePath}`);
        });
    }
    else {
        console.log(`Creating new module: ${moduleName}`);
        // Create module files
        const files = [
            `${moduleName}.controller.ts`,
            `${moduleName}.routes.ts`,
            `${moduleName}.service.ts`,
            `${moduleName}.types.ts`,
            `${moduleName}.validators.ts`,
            'index.ts',
        ];
        files.forEach(file => {
            const filePath = path.join(moduleDir, file);
            if (!fs.existsSync(filePath)) {
                fs.writeFileSync(filePath, `// ${moduleName} module - ${file}\n`);
                console.log(`Created file: ${filePath}`);
            }
        });
    }
    console.log(`Module ${moduleName} migrated successfully.`);
};
// Main function
const main = () => {
    console.log('Starting migration...');
    // Create directories
    createDirectories();
    // Migrate modules
    const modules = [
        'auth',
        'user',
        'client',
        'investor',
        'property',
        'token',
        'investment',
        'blockchain',
        'visit',
        'kyc',
    ];
    modules.forEach(module => {
        migrateModule(module);
    });
    console.log('Migration completed successfully.');
};
// Run the script
main();
//# sourceMappingURL=migrate-to-new-structure.js.map