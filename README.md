# Microfrontend Architecture with Module Federation

This project demonstrates a microfrontend architecture using Module Federation with multiple shell implementations and Angular v20 microfrontends.

## Architecture Overview

This repository contains three applications:

- **Shell (Angular)**: Angular 20 host application with SSR support (port 4200)
- **Shell (Vanilla)**: Lightweight vanilla JavaScript host application (port 4200)
- **MFE1** (Remote): Angular 20 microfrontend with SSR support (port 4201)

Both shell implementations can dynamically load the same Angular microfrontends using Module Federation, demonstrating framework-agnostic host capabilities.

### Architecture Comparison

```
┌─────────────────────────────────────────────────────────────┐
│                   Angular Shell (shell/)                     │
│  - Angular 20 with SSR                                       │
│  - Native Federation                                         │
│  - Full Angular features                                     │
│  - ~500KB bundle size                                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Both load same MFEs
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                Vanilla Shell (shell-vanilla/)                │
│  - Pure JavaScript (no framework)                            │
│  - Vite + Module Federation                                  │
│  - Minimal dependencies                                      │
│  - ~32KB bundle size                                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Module Federation
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Angular MFE1 (mfe1/)                      │
│  - Angular 20 with SSR                                       │
│  - Native Federation                                         │
│  - Dashboard feature                                         │
│  - Exposes routes module                                     │
└─────────────────────────────────────────────────────────────┘
```

For detailed architecture documentation, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## Getting Started

### Prerequisites

```bash
# Install dependencies for all applications
cd mfe1 && npm install
cd ../shell && npm install
cd ../shell-vanilla && npm install
```

### Development Mode

#### Option 1: Vanilla JavaScript Shell (Recommended for lightweight host)

**1. Start MFE1:**
```bash
cd mfe1
npm start
```
The remote will be available at http://localhost:4201

**2. Start Vanilla Shell:**
```bash
cd shell-vanilla
npm run dev
```
The shell will be available at http://localhost:4200

#### Option 2: Angular Shell (Full Angular features with SSR)

**1. Start MFE1:**
```bash
cd mfe1
npm start
```

**2. Start Angular Shell:**
```bash
cd shell
npm start
```
The shell will be available at http://localhost:4200

### Production Mode

#### Vanilla Shell Production Build

```bash
# Build MFE1
cd mfe1
npm run build

# Build Vanilla Shell
cd shell-vanilla
npm run build

# Preview production build
npm run preview
```

#### Angular Shell with SSR

```bash
# Build and serve MFE1 with SSR
cd mfe1
npm run build
npm run serve:ssr:mfe1

# Build and serve Angular Shell with SSR
cd shell
npm run build
npm run serve:ssr:shell
```

## Features

### Vanilla Shell
- ✅ Framework-agnostic host (pure JavaScript)
- ✅ Vite for fast builds and HMR
- ✅ Module Federation for dynamic loading
- ✅ Client-side routing with History API
- ✅ Error boundary and fallback UI
- ✅ ~32KB production bundle
- ✅ Can load Angular microfrontends

### Angular Shell
- ✅ Angular v20 with zoneless architecture
- ✅ Native Federation for module sharing
- ✅ Server-Side Rendering (SSR) enabled
- ✅ Dynamic remote loading
- ✅ Lazy loading with routing
- ✅ CORS configured for SSR

### MFE1 (Angular Microfrontend)
- ✅ Angular v20 with SSR support
- ✅ Native Federation module exposure
- ✅ Dashboard feature component
- ✅ Works with both shell implementations

## Project Structure

```
.
├── shell/                      # Angular host application
│   ├── src/
│   │   ├── app/
│   │   │   ├── home/          # Home component
│   │   │   └── app.routes.ts
│   │   ├── bootstrap.ts
│   │   └── server.ts          # SSR server
│   ├── federation.config.js
│   └── public/federation.manifest.json
│
├── shell-vanilla/              # Vanilla JavaScript host
│   ├── src/
│   │   ├── main.js            # Application entry
│   │   ├── router.js          # Client-side router
│   │   ├── mfe-loader.js      # MFE lifecycle manager
│   │   ├── navigation.js      # Navigation component
│   │   ├── error-boundary.js  # Error handling
│   │   └── styles.css
│   ├── vite.config.js         # Vite + Federation config
│   ├── index.html
│   └── public/
│       └── federation.manifest.json
│
└── mfe1/                       # Angular remote application
    ├── src/
    │   ├── app/
    │   │   ├── features/
    │   │   │   └── dashboard/
    │   │   └── app.routes.ts
    │   ├── bootstrap.ts        # Exposes mount function
    │   └── server.ts           # SSR server
    └── federation.config.js
```

## How It Works

### Vanilla Shell Flow

1. **Shell Loads**: Vanilla JavaScript shell initializes with client-side router
2. **User Navigation**: User clicks navigation link or enters URL
3. **Route Matching**: Router matches path and executes handler
4. **MFE Loading**: For MFE routes, loader fetches remote entry via Module Federation
5. **Bootstrap**: MFE's mount function is called with container element
6. **Rendering**: Angular MFE renders inside the vanilla shell
7. **Cleanup**: On navigation away, unmount function is called to clean up MFE

### Angular Shell Flow

1. **Shell Loads**: Angular shell bootstraps with SSR support
2. **User Navigation**: Angular router handles navigation
3. **Lazy Loading**: MFE routes are lazy-loaded via Native Federation
4. **Module Loading**: Remote module is fetched and integrated
5. **Rendering**: MFE components render within Angular shell
6. **SSR**: Server pre-renders content for faster initial load

### Navigation Routes

**Vanilla Shell:**
- `/` or `/home` - Vanilla shell home page
- `/mfe1` - Dynamically loads MFE1 dashboard

**Angular Shell:**
- `/home` - Angular shell home page
- `/mfe1` - Lazy loads MFE1 routes

## Key Configuration Files

### Vanilla Shell
- `vite.config.js` - Vite build configuration with Module Federation plugin
- `public/federation.manifest.json` - Runtime remote module mappings
- `src/main.js` - Application entry point and initialization
- `src/router.js` - Client-side routing implementation
- `src/mfe-loader.js` - MFE lifecycle management

### Angular Shell
- `federation.config.js` - Native Federation configuration
- `public/federation.manifest.json` - Remote module mappings
- `bootstrap.ts` - Application bootstrap with federation
- `server.ts` - SSR server configuration

### MFE1
- `federation.config.js` - Exposes routes module
- `bootstrap.ts` - Exports mount function for vanilla shell
- `app.routes.ts` - Angular routes exposed to shells

## Documentation

### Vanilla Shell Documentation
- **[shell-vanilla/README.md](./shell-vanilla/README.md)** - Quick start and overview
- **[shell-vanilla/FEDERATION_CONFIG.md](./shell-vanilla/FEDERATION_CONFIG.md)** - Module Federation configuration guide
- **[shell-vanilla/BUILD.md](./shell-vanilla/BUILD.md)** - Production build and deployment
- **[shell-vanilla/MFE_INTEGRATION.md](./shell-vanilla/MFE_INTEGRATION.md)** - MFE integration details
- **[shell-vanilla/ERROR_BOUNDARY_TEST.md](./shell-vanilla/ERROR_BOUNDARY_TEST.md)** - Error handling testing
- **[shell-vanilla/TROUBLESHOOTING.md](./shell-vanilla/TROUBLESHOOTING.md)** - Common issues and solutions

### General Documentation
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Overall system architecture
- **[QUICKSTART.md](./QUICKSTART.md)** - Quick start guide

## Choosing a Shell Implementation

### Use Vanilla Shell When:
- You want minimal bundle size (~32KB vs ~500KB)
- You don't need Angular features in the host
- You want faster build times
- You prefer framework-agnostic architecture
- You're building a simple container for MFEs

### Use Angular Shell When:
- You need SSR for the shell itself
- You want to share Angular services across MFEs
- You need Angular features in the host (forms, HTTP, etc.)
- You're already invested in Angular ecosystem
- You need complex routing with guards and resolvers

## Testing

### Vanilla Shell
```bash
cd shell-vanilla
npm run dev
# Navigate to http://localhost:4200
# Test navigation and MFE loading
```

### Integration Testing
See [TESTING_MFE1_INTEGRATION.md](./TESTING_MFE1_INTEGRATION.md) for comprehensive integration testing guide.

## Deployment

### Vanilla Shell Deployment
```bash
cd shell-vanilla
npm run build
# Deploy dist/ folder to any static hosting service
```

### Angular Shell Deployment
```bash
cd shell
npm run build
# Deploy dist/shell/browser for static hosting
# Deploy dist/shell/server for SSR
```

### MFE1 Deployment
```bash
cd mfe1
npm run build
# Deploy separately from shell
# Update federation.manifest.json with production URL
```
