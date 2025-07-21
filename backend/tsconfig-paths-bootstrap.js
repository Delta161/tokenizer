// tsconfig-paths-bootstrap.js
import { register } from 'tsconfig-paths';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load tsconfig.json paths
register({
  baseUrl: resolve(__dirname, './dist'),
  paths: {
    '@/*': ['src/*'],
    '@config/*': ['src/config/*'],
    '@middleware/*': ['src/middleware/*'],
    '@modules/*': ['src/modules/*'],
    '@services/*': ['src/services/*'],
    '@utils/*': ['src/utils/*'],
    '@types/*': ['src/types/*'],
    '@prisma/*': ['prisma/*']
  }
});