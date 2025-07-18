import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

// Function to compile a TypeScript file to JavaScript
async function compileFile(filePath) {
  const command = `npx tsc ${filePath} --target ES2022 --module ESNext --moduleResolution node --esModuleInterop`;
  
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error compiling ${filePath}:`, stderr);
        reject(error);
        return;
      }
      
      console.log(`Successfully compiled ${filePath}`);
      resolve();
    });
  });
}

// Function to recursively find all TypeScript files in a directory
async function findTsFiles(dir) {
  const files = await fs.readdir(dir, { withFileTypes: true });
  
  const tsFiles = [];
  
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      const nestedFiles = await findTsFiles(fullPath);
      tsFiles.push(...nestedFiles);
    } else if (file.name.endsWith('.ts')) {
      tsFiles.push(fullPath);
    }
  }
  
  return tsFiles;
}

// Main function
async function main() {
  try {
    const documentsDir = path.join(process.cwd(), 'modules', 'documents');
    console.log(`Finding TypeScript files in ${documentsDir}...`);
    
    const tsFiles = await findTsFiles(documentsDir);
    console.log(`Found ${tsFiles.length} TypeScript files.`);
    
    for (const file of tsFiles) {
      await compileFile(file);
    }
    
    console.log('Compilation complete!');
  } catch (error) {
    console.error('Error during compilation:', error);
    process.exit(1);
  }
}

main();