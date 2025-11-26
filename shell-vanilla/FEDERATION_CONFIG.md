# Module Federation Configuration Guide

## Overview

This guide explains how to configure Module Federation for the vanilla JavaScript shell to load Angular microfrontends across different environments.

## Federation Manifest

### Purpose

The `public/federation.manifest.json` file serves as the central configuration for all remote microfrontends. This approach provides:

- **Runtime Configuration:** Update remote URLs without rebuilding the shell
- **Environment Flexibility:** Different URLs for dev, staging, and production
- **Independent Deployment:** Shell and MFEs can be deployed separately
- **Easy Maintenance:** Single file to update for all remote configurations

### File Location

- **Source:** `public/federation.manifest.json`
- **Build Output:** `dist/federation.manifest.json` (copied during build)

### Basic Structure

```json
{
  "mfe1": "http://localhost:4201/remoteEntry.json",
  "_comment": "Update URLs based on environment"
}
```

## Environment Configuration

### Development Environment

For local development with both shell and MFEs running on localhost:

```json
{
  "mfe1": "http://localhost:4201/remoteEntry.json"
}
```

**Requirements:**
- MFE1 dev server running on port 4201
- Shell dev server running on port 4200
- Both servers must be started before navigation to MFE routes

### Staging Environment

For staging deployments with separate hosting:

```json
{
  "mfe1": "https://staging-mfe1.yourdomain.com/remoteEntry.json"
}
```

**Considerations:**
- Use HTTPS for all remote URLs
- Ensure CORS is properly configured on MFE servers
- Test cross-origin loading before production deployment

### Production Environment

For production deployments:

```json
{
  "mfe1": "https://mfe1.yourdomain.com/remoteEntry.json"
}
```

**Best Practices:**
- Use CDN URLs for better performance
- Enable caching headers on remote entry files
- Consider using versioned URLs for cache busting
- Monitor remote availability with health checks

### CDN Configuration

For CDN-hosted microfrontends:

```json
{
  "mfe1": "https://cdn.yourdomain.com/mfe1/v1.2.3/remoteEntry.json"
}
```

**Benefits:**
- Global distribution for faster loading
- Better caching and availability
- Version control in URL path

## Vite Configuration

The `vite.config.js` must also define remotes for build-time configuration:

```javascript
import { defineConfig } from 'vite';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    federation({
      name: 'shell',
      remotes: {
        mfe1: 'http://localhost:4201/remoteEntry.json'
      },
      shared: []
    })
  ]
});
```

**Note:** The vite.config.js remotes are used during development and build. The manifest file can override these at runtime.

## Adding New Microfrontends

### Step 1: Update Federation Manifest

Add the new MFE to `public/federation.manifest.json`:

```json
{
  "mfe1": "http://localhost:4201/remoteEntry.json",
  "mfe2": "http://localhost:4202/remoteEntry.json",
  "analytics": "http://localhost:4203/remoteEntry.json"
}
```

### Step 2: Update Vite Config

Add the remote to `vite.config.js`:

```javascript
remotes: {
  mfe1: 'http://localhost:4201/remoteEntry.json',
  mfe2: 'http://localhost:4202/remoteEntry.json',
  analytics: 'http://localhost:4203/remoteEntry.json'
}
```

### Step 3: Add Route Handler

Update `src/main.js` to add a route for the new MFE:

```javascript
// Add to route registration
router.register('/mfe2', async () => {
  await mfeLoader.loadMFE('mfe2', 'mfe-container');
});

router.register('/analytics', async () => {
  await mfeLoader.loadMFE('analytics', 'mfe-container');
});
```

### Step 4: Update Navigation

Add navigation links in `src/navigation.js`:

```javascript
<a href="/mfe2" data-link>MFE2</a>
<a href="/analytics" data-link>Analytics</a>
```

## Deployment Workflow

### Option 1: Manual Update

1. Build the shell: `npm run build`
2. Update `dist/federation.manifest.json` with production URLs
3. Deploy the `dist/` folder to your hosting service

### Option 2: Environment-Specific Builds

1. Create environment-specific manifest files:
   - `public/federation.manifest.dev.json`
   - `public/federation.manifest.staging.json`
   - `public/federation.manifest.prod.json`

2. Copy the appropriate file during build:
   ```bash
   cp public/federation.manifest.prod.json public/federation.manifest.json
   npm run build
   ```

3. Deploy the `dist/` folder

### Option 3: Runtime Configuration

1. Build once with placeholder URLs
2. Deploy to hosting service
3. Use environment variables or config service to inject URLs at runtime
4. Update manifest via API or deployment script

## CORS Configuration

### MFE Server Requirements

The MFE server must send appropriate CORS headers when shell and MFE are on different domains:

```
Access-Control-Allow-Origin: https://shell.yourdomain.com
Access-Control-Allow-Methods: GET, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

### Angular MFE CORS Setup

For Angular MFEs using the dev server, update `angular.json`:

```json
{
  "serve": {
    "options": {
      "headers": {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      }
    }
  }
}
```

**Production:** Configure CORS on your web server (nginx, Apache, etc.)

## Troubleshooting

### Remote Entry Not Found

**Error:** `Failed to fetch remote entry`

**Solutions:**
1. Verify the URL in federation.manifest.json is correct
2. Check that the MFE server is running
3. Inspect network tab for 404 or CORS errors
4. Ensure remoteEntry.json exists at the specified URL

### CORS Errors

**Error:** `Access to fetch at '...' from origin '...' has been blocked by CORS policy`

**Solutions:**
1. Configure CORS headers on the MFE server
2. Use a reverse proxy to serve both shell and MFEs from same origin
3. For development, use browser extensions to disable CORS (not for production)

### Module Not Found

**Error:** `Cannot find module './routes'`

**Solutions:**
1. Verify the MFE exposes the correct module in its federation config
2. Check that the module name matches in both shell and MFE configs
3. Rebuild the MFE after changing federation configuration

### Stale Cache

**Issue:** Changes to MFE not reflected in shell

**Solutions:**
1. Clear browser cache
2. Use versioned URLs in manifest
3. Add cache-busting query parameters: `remoteEntry.json?v=1.2.3`
4. Configure appropriate cache headers on remote entry files

## Security Considerations

### Content Security Policy (CSP)

When using Module Federation, update your CSP headers to allow loading scripts from MFE domains:

```
Content-Security-Policy: script-src 'self' https://mfe1.yourdomain.com https://cdn.yourdomain.com
```

### Subresource Integrity (SRI)

For production, consider using SRI hashes to verify remote entry integrity:

```json
{
  "mfe1": {
    "url": "https://mfe1.yourdomain.com/remoteEntry.json",
    "integrity": "sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC"
  }
}
```

### HTTPS Only

Always use HTTPS for production remote URLs to prevent man-in-the-middle attacks.

## Performance Optimization

### Preloading

Preload remote entries for faster navigation:

```javascript
// In main.js
const link = document.createElement('link');
link.rel = 'preload';
link.href = 'http://localhost:4201/remoteEntry.json';
link.as = 'fetch';
document.head.appendChild(link);
```

### Caching Strategy

Configure appropriate cache headers for remote entries:

```
Cache-Control: public, max-age=3600, must-revalidate
```

### CDN Usage

Host remote entries on a CDN for:
- Reduced latency
- Better availability
- Geographic distribution

## Examples

### Multi-Environment Setup

```json
{
  "mfe1": "${MFE1_URL}",
  "mfe2": "${MFE2_URL}"
}
```

Replace placeholders during deployment:

```bash
envsubst < public/federation.manifest.json > dist/federation.manifest.json
```

### Version Pinning

```json
{
  "mfe1": "https://cdn.example.com/mfe1/v1.2.3/remoteEntry.json",
  "mfe2": "https://cdn.example.com/mfe2/v2.0.1/remoteEntry.json"
}
```

### Fallback Configuration

```json
{
  "mfe1": {
    "primary": "https://mfe1.example.com/remoteEntry.json",
    "fallback": "https://cdn.example.com/mfe1/remoteEntry.json"
  }
}
```

## References

- [Module Federation Documentation](https://module-federation.github.io/)
- [Vite Plugin Federation](https://github.com/originjs/vite-plugin-federation)
- [Angular Native Federation](https://www.npmjs.com/package/@angular-architects/native-federation)
