# Path Aliases Configuration Guide

## Overview

This project uses TypeScript path aliases to simplify imports. Path aliases are defined in `tsconfig.json` and allow you to use shortcuts like `@/modules` instead of relative paths like `../../modules`.

## Path Aliases in tsconfig.json

The following path aliases are configured in `tsconfig.json`:

```json
"paths": {
  "@/*": ["src/*"],
  "@config/*": ["src/config/*"],
  "@middleware/*": ["src/middleware/*"],
  "@modules/*": ["src/modules/*"],
  "@services/*": ["src/services/*"],
  "@utils/*": ["src/utils/*"],
  "@types/*": ["src/types/*"],
  "@prisma/*": ["prisma/*"]
}
```

## Development Environment

For development, we use `ts-node-dev` with the `tsconfig-paths/register` hook to resolve path aliases:

```bash
ts-node-dev --respawn --transpile-only --require tsconfig-paths/register --esm src/server.ts
```

## Production Build

For production builds, we use a two-step process:

1. Compile TypeScript with `tsc` (which preserves the path aliases in the compiled JavaScript)
2. Use a bootstrap file (`tsconfig-paths-bootstrap.js`) to register the path aliases at runtime

## How to Use Path Aliases

Instead of writing:

```typescript
import { userService } from '../../../modules/accounts/services/user.service';
import { logger } from '../../../../utils/logger';
```

You can write:

```typescript
import { userService } from '@modules/accounts/services/user.service';
import { logger } from '@utils/logger';
```

## Troubleshooting

If you encounter issues with path aliases not being resolved:

1. Make sure you're using the correct npm scripts (`npm run dev:new` or `npm run start:new`)
2. Check that `tsconfig-paths` is installed as a dev dependency
3. Verify that the paths in `tsconfig.json` match the actual project structure
4. For production builds, ensure `tsconfig-paths-bootstrap.js` is properly configured

## Adding New Path Aliases

To add a new path alias:

1. Add it to the `paths` section in `tsconfig.json`
2. Add it to the `paths` object in `tsconfig-paths-bootstrap.js`
3. Restart your development server