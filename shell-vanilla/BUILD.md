# Production Build Guide

## Building for Production

To create a production build of the vanilla shell:

```bash
npm run build
```

This will:
- Minify JavaScript using esbuild
- Split CSS for better caching
- Generate hashed filenames for cache busting
- Split code into chunks (router, mfe-loader, navigation)
- Output to the `dist/` directory

## Build Output

The production build generates:

```
dist/
├── index.html                          # Main HTML entry point
├── federation.manifest.json            # MFE remote configuration
└── assets/
    ├── index-[hash].js                 # Main application bundle
    ├── index-[hash].css                # Compiled styles
    ├── router-[hash].js                # Router module chunk
    ├── navigation-[hash].js            # Navigation component chunk
    └── mfe-loader-[hash].js            # MFE loader module chunk
```

## Bundle Size

The total production bundle is approximately **32KB** (uncompressed), making it extremely lightweight compared to framework-based shells.

## Serving Static Files

The production build outputs static files that can be served by any web server:

### Using Vite Preview (for testing)

```bash
npm run preview
```

This starts a local server at http://localhost:4200 to preview the production build.

### Using a Static Server

You can serve the `dist/` directory with any static file server:

```bash
# Using Python
python -m http.server 4200 --directory dist

# Using Node.js http-server
npx http-server dist -p 4200

# Using nginx
# Point nginx root to the dist/ directory
```

### Deployment

The `dist/` directory can be deployed to any static hosting service:
- Netlify
- Vercel
- AWS S3 + CloudFront
- GitHub Pages
- Any CDN or web server

## Configuration for Different Environments

### Federation Manifest

The shell uses `public/federation.manifest.json` to configure MFE remote URLs. This file is copied to `dist/` during the build process.

**Available manifest templates:**
- `public/federation.manifest.json` - Active configuration (used by build)
- `public/federation.manifest.dev.json` - Development template
- `public/federation.manifest.staging.json` - Staging template
- `public/federation.manifest.prod.json` - Production template

### Environment-Specific Builds

**Option 1: Manual Update**

Update `public/federation.manifest.json` before building:

```bash
# For development
cp public/federation.manifest.dev.json public/federation.manifest.json
npm run build

# For production
cp public/federation.manifest.prod.json public/federation.manifest.json
npm run build
```

**Option 2: Post-Build Update**

Build once, then update the manifest in `dist/`:

```bash
npm run build
# Update dist/federation.manifest.json with production URLs
```

**Option 3: Environment Variables**

Use environment variable substitution:

```bash
# Set environment variables
export MFE1_URL="https://mfe1.production.com/remoteEntry.json"

# Use envsubst to replace placeholders
envsubst < public/federation.manifest.json > dist/federation.manifest.json
```

### Example Configurations

**Development (localhost):**
```json
{
  "mfe1": "http://localhost:4201/remoteEntry.json"
}
```

**Staging:**
```json
{
  "mfe1": "https://staging-mfe1.example.com/remoteEntry.json"
}
```

**Production:**
```json
{
  "mfe1": "https://mfe1.example.com/remoteEntry.json"
}
```

**CDN-hosted:**
```json
{
  "mfe1": "https://cdn.example.com/mfe1/v1.2.3/remoteEntry.json"
}
```

For comprehensive configuration details, see [FEDERATION_CONFIG.md](./FEDERATION_CONFIG.md).

## Build Optimization

The Vite configuration includes:
- **Minification**: Enabled via esbuild for fast, efficient compression
- **Code Splitting**: Manual chunks for router, navigation, and mfe-loader
- **CSS Splitting**: Separate CSS files for better caching
- **Asset Hashing**: All files include content hashes for cache busting
- **Tree Shaking**: Unused code is automatically removed

## Verifying the Build

After building, you can verify:

1. **Bundle sizes**: Check the build output for file sizes
2. **Static serving**: Run `npm run preview` to test
3. **MFE loading**: Ensure MFE1 is running and accessible
4. **Navigation**: Test all routes work correctly

## Requirements Satisfied

This build configuration satisfies:
- **Requirement 3.2**: Uses Vite to create optimized production bundles
- **Requirement 3.5**: Outputs static files that can be served by any web server
