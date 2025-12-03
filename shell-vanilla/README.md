# Vanilla JavaScript Shell

A lightweight, framework-agnostic shell application that dynamically loads Angular microfrontends using an iframe-based approach.

> **Note:** This implementation uses iframes instead of Module Federation due to incompatibility between vanilla JS and Angular Native Federation. See [TECHNICAL_CHALLENGES.md](./TECHNICAL_CHALLENGES.md) for details on why this approach was chosen.

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

The shell will be available at http://localhost:4200

## Build

### Production Build

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory with:
- Minified JavaScript (~32KB total)
- Code splitting (router, navigation, mfe-loader)
- Hashed filenames for cache busting
- Optimized CSS

### Preview Production Build

```bash
npm run preview
```

Serves the production build at http://localhost:4200

### Deployment

The `dist/` directory contains static files that can be served by any web server:
- Netlify, Vercel, AWS S3, GitHub Pages
- Any static file server (nginx, Apache, etc.)

**Quick Deploy Scripts:**

```bash
# Deploy for development
npm run deploy:dev

# Deploy for staging
npm run deploy:staging

# Deploy for production
npm run deploy:prod
```

The deploy scripts automatically select the appropriate federation manifest for the target environment and build the application.

See [BUILD.md](./BUILD.md) for detailed build configuration and deployment options.

## Architecture

### Overview

This shell is a lightweight, framework-agnostic host application that can dynamically load Angular (or other framework) microfrontends using Module Federation.

```
┌─────────────────────────────────────────────────────────────┐
│              Vanilla JavaScript Shell (32KB)                 │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  main.js                                              │  │
│  │  - Initialize router                                  │  │
│  │  - Create navigation                                  │  │
│  │  - Register routes                                    │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  router.js                                            │  │
│  │  - History API routing                                │  │
│  │  - Route registration                                 │  │
│  │  - Navigation handling                                │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  mfe-loader.js                                        │  │
│  │  - Dynamic import MFEs                                │  │
│  │  - Call mount() function                              │  │
│  │  - Manage lifecycle                                   │  │
│  │  - Error handling                                     │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  error-boundary.js                                    │  │
│  │  - Catch and display errors                           │  │
│  │  - Fallback UI                                        │  │
│  │  - Retry functionality                                │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Module Federation
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Angular MFE1 (300KB)                            │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  bootstrap.ts                                         │  │
│  │  - export mount(container)                            │  │
│  │  - Bootstrap Angular app                              │  │
│  │  - return { unmount() }                               │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Vite**: Build tooling and dev server with HMR
- **Vanilla JavaScript (ES6+)**: No framework dependencies
- **History API**: Client-side routing
- **Iframes**: MFE loading and isolation
- **CSS3**: Styling with responsive design
- **Error Boundary**: Robust error handling and fallback UI

### Key Features

- ✅ **Lightweight**: ~32KB production bundle
- ✅ **Framework-Agnostic**: Can load MFEs from any framework
- ✅ **Fast Builds**: Vite builds in seconds
- ✅ **Hot Module Replacement**: Instant updates during development
- ✅ **Error Resilience**: Shell remains stable even when MFEs fail
- ✅ **Simple Deployment**: Static files, no server required

### Error Handling

The shell includes comprehensive error handling to ensure stability:

**Error Boundary Component** (`src/error-boundary.js`):
- User-friendly error displays with retry and navigation options
- Technical details expansion for debugging
- Toast notifications for non-critical errors
- Global error handler for unhandled errors

**Features:**
- MFE loading failures show fallback UI with retry option
- Shell remains functional even when MFEs fail to load
- Navigation errors automatically recover to home page
- Unhandled promise rejections show toast notifications
- All errors are logged to console for debugging

**Testing:**
- Visit `/test-error-boundary.html` to test error displays
- See [ERROR_BOUNDARY_TEST.md](./ERROR_BOUNDARY_TEST.md) for testing guide

## Module Federation Configuration

### Federation Manifest

The shell uses a federation manifest file (`public/federation.manifest.json`) to configure remote microfrontend URLs. This allows updating remote entry points without rebuilding the shell.

**Location:** `public/federation.manifest.json`

**Format:**
```json
{
  "mfe1": "http://localhost:4201/remoteEntry.json"
}
```

### Environment-Specific Configuration

Update the manifest for different environments:

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

**Cross-Domain Setup:**
```json
{
  "mfe1": "https://cdn.example.com/mfe1/remoteEntry.json"
}
```

### Updating Remote URLs

1. **Before Deployment:** Update `public/federation.manifest.json` with production URLs
2. **After Deployment:** The manifest is copied to `dist/federation.manifest.json` during build
3. **Runtime Updates:** You can update the manifest in the deployed `dist/` folder without rebuilding

### Adding New Microfrontends

To add a new microfrontend to the shell, follow these steps:

#### 1. Update Federation Manifest

Add the new MFE to `public/federation.manifest.json`:

```json
{
  "mfe1": "http://localhost:4201/remoteEntry.json",
  "mfe2": "http://localhost:4202/remoteEntry.json"
}
```

#### 2. Update Vite Configuration

Add the remote to `vite.config.js`:

```javascript
export default defineConfig({
  plugins: [
    federation({
      name: 'shell',
      remotes: {
        mfe1: 'http://localhost:4201/remoteEntry.json',
        mfe2: 'http://localhost:4202/remoteEntry.json'
      },
      shared: []
    })
  ]
});
```

#### 3. Register Route

Add a route handler in `src/main.js`:

```javascript
// Register MFE2 route
router.register('/mfe2', async () => {
  await mfeLoader.loadMFE('mfe2', 'mfe-container');
});
```

#### 4. Add Navigation Link

Update `src/navigation.js` to add a navigation link:

```javascript
export function createNavigation() {
  const nav = document.createElement('nav');
  nav.className = 'shell-nav';
  nav.innerHTML = `
    <div class="nav-container">
      <h1>Vanilla Shell</h1>
      <div class="nav-links">
        <a href="/" data-link>Home</a>
        <a href="/mfe1" data-link>MFE1 Dashboard</a>
        <a href="/mfe2" data-link>MFE2</a>
      </div>
    </div>
  `;
  return nav;
}
```

#### 5. Ensure MFE Exposes Bootstrap

The new MFE must export a `mount` function:

```typescript
// In mfe2/src/bootstrap.ts
export async function mount(container: string | HTMLElement) {
  const containerEl = typeof container === 'string' 
    ? document.querySelector(container) 
    : container;
  
  const app = await bootstrapApplication(AppComponent, appConfig);
  
  return {
    unmount: () => app.destroy()
  };
}
```

#### 6. Configure MFE Federation

The MFE must expose its bootstrap module:

```javascript
// In mfe2/federation.config.js
export default {
  name: 'mfe2',
  exposes: {
    './bootstrap': './src/bootstrap.ts'
  },
  shared: {
    '@angular/core': { singleton: true },
    '@angular/common': { singleton: true },
    // ... other shared dependencies
  }
};
```

#### 7. Test Integration

1. Start the new MFE: `cd mfe2 && npm start`
2. Start the shell: `cd shell-vanilla && npm run dev`
3. Navigate to http://localhost:4200/mfe2
4. Verify the MFE loads correctly
5. Test navigation between MFEs
6. Verify cleanup when navigating away

### CORS Considerations

When hosting shell and microfrontends on different domains:
- Ensure the MFE server sends appropriate CORS headers
- The remote entry point must be accessible from the shell's domain
- Consider using a CDN or reverse proxy for production

## Documentation

- **[TECHNICAL_CHALLENGES.md](./TECHNICAL_CHALLENGES.md)** - Why we use iframes instead of Module Federation
- **[IFRAME_APPROACH.md](./IFRAME_APPROACH.md)** - How the iframe-based MFE loading works
- **[BUILD.md](./BUILD.md)** - Build configuration and deployment options
- **[MFE_INTEGRATION.md](./MFE_INTEGRATION.md)** - MFE integration testing and development workflow
- **[ERROR_BOUNDARY_TEST.md](./ERROR_BOUNDARY_TEST.md)** - Error boundary testing guide
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Common issues and solutions
- **[DEV_WORKFLOW_TEST_RESULTS.md](./DEV_WORKFLOW_TEST_RESULTS.md)** - Development workflow test results

## Troubleshooting

If you encounter issues, check the [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) guide which covers:

- Development server issues
- Module Federation problems
- MFE loading failures
- Build and deployment issues
- CORS configuration
- Performance optimization
- Browser compatibility

Common quick fixes:

```bash
# Clear cache and restart
rm -rf node_modules/.vite dist
npm run dev

# Verify MFE is running
curl http://localhost:4201/remoteEntry.json

# Check federation manifest
cat public/federation.manifest.json
```
