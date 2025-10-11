# Build Process Explained

## Monorepo Build Order

This project uses **Turborepo** to manage the build process across multiple packages.

### Package Dependencies

```
@pulseai/web (Next.js app)
  ├── depends on → @pulseai/shared (types)
  └── depends on → @pulseai/worker (AI functions)
```

### Build Command Breakdown

When you run:
```bash
cd ../.. && pnpm install && pnpm turbo run build --filter=@pulseai/web
```

Here's what happens:

#### 1. `cd ../..`
- **Why:** Vercel sets Root Directory to `apps/web`
- **Effect:** Changes to project root directory
- **Result:** Now at `/Users/you/project/` instead of `/Users/you/project/apps/web/`

#### 2. `pnpm install`
- **Why:** Install all workspace dependencies
- **Effect:** Installs packages for all workspaces (shared, worker, web)
- **Result:** `node_modules` populated in root and each package

#### 3. `pnpm turbo run build --filter=@pulseai/web`
- **Why:** Build web app and its dependencies
- **Effect:** Turborepo determines build order:
  1. Build `@pulseai/shared` (no dependencies)
  2. Build `@pulseai/worker` (depends on shared)
  3. Build `@pulseai/web` (depends on shared and worker)
- **Result:** All packages built in correct order

### What Turbo Does

From `turbo.json`:
```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"]  // ← Build dependencies first
    }
  }
}
```

The `^build` means "run build on all dependencies first".

### Build Scripts

Each package has a build script in its `package.json`:

**packages/shared/package.json:**
```json
{
  "scripts": {
    "build": "tsc"
  }
}
```
Compiles TypeScript to JavaScript in `dist/` folder.

**packages/worker/package.json:**
```json
{
  "scripts": {
    "build": "tsc"
  }
}
```
Compiles TypeScript to JavaScript in `dist/` folder.

**apps/web/package.json:**
```json
{
  "scripts": {
    "build": "next build"
  }
}
```
Builds Next.js app to `.next/` folder.

### Output Files

After build completes:
```
apps/web/.next/           ← Next.js build output (deployed)
packages/shared/dist/     ← Compiled types
packages/worker/dist/     ← Compiled AI functions
```

Vercel serves files from `apps/web/.next/`.

## Local Build

To build locally:

```bash
# From project root
pnpm install
pnpm turbo run build

# Or build just web app
pnpm turbo run build --filter=@pulseai/web

# Or build specific package
pnpm turbo run build --filter=@pulseai/shared
```

## Troubleshooting Build Errors

### Error: Cannot find module '@pulseai/shared'

**Cause:** Shared package not built before web app.

**Fix:** Run turbo build which builds dependencies first:
```bash
pnpm turbo run build --filter=@pulseai/web
```

### Error: No Next.js version detected

**Cause:** Vercel looking in wrong directory.

**Fix:** Set Root Directory to `apps/web` in Vercel dashboard.

### Error: workspace:* not resolved

**Cause:** Using npm/yarn instead of pnpm.

**Fix:** Make sure Install Command is `cd ../.. && pnpm install`

### Build succeeds but app crashes

**Cause:** Environment variables not set.

**Fix:** Add required env vars in Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `OPENAI_API_KEY`

## Production vs Development

### Development
```bash
pnpm dev
```
- Runs all packages in watch mode
- Hot reload enabled
- No build step needed

### Production
```bash
pnpm turbo run build
pnpm --filter @pulseai/web start
```
- Builds all packages
- Optimized output
- No watch mode

## Cache

Turborepo caches build outputs. If nothing changed:
```
>>> FULL TURBO (cached)
```

This makes subsequent builds much faster!

To clear cache:
```bash
pnpm turbo run clean
rm -rf node_modules
pnpm install
```

## Summary

✅ **Correct Build Command for Vercel:**
```bash
cd ../.. && pnpm install && pnpm turbo run build --filter=@pulseai/web
```

✅ **This ensures:**
1. We're in the right directory (root)
2. All dependencies are installed
3. Packages build in correct order
4. Web app has access to built dependencies

