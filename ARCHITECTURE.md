# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser / Client                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP Request
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Shell Application                         │
│                    (Host - Port 4200)                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Routes:                                              │  │
│  │  - /home  → Home Component (Local)                    │  │
│  │  - /mfe1  → Load Remote Module                        │  │
│  └───────────────────────────────────────────────────────┘  │
│                              │                               │
│                              │ Federation Manifest           │
│                              │ (federation.manifest.json)    │
│                              ▼                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Native Federation Runtime                            │  │
│  │  - Loads remote entry points                          │  │
│  │  - Manages shared dependencies                        │  │
│  │  - Handles module resolution                          │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Fetch remoteEntry.json
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    MFE1 Application                          │
│                   (Remote - Port 4201)                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Exposed Modules:                                     │  │
│  │  - ./routes → app.routes.ts                           │  │
│  │    └─ Dashboard Component                             │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Federation Config:                                   │  │
│  │  - name: 'mfe1'                                       │  │
│  │  - exposes: { './routes': './src/app/app.routes.ts' }│  │
│  │  - shared: Angular packages (singleton)               │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Initial Load
```
User → Shell (4200) → Loads Shell App → Renders Home Component
```

### 2. Remote Module Load
```
User clicks "Load MFE1"
    ↓
Shell Router activates /mfe1 route
    ↓
loadRemoteModule('mfe1', './routes')
    ↓
Fetch http://localhost:4201/remoteEntry.json
    ↓
Load MFE1 routes and components
    ↓
Render Dashboard Component
```

## Server-Side Rendering Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Request                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Express Server                            │
│                    (Node.js + SSR)                           │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  1. Receive HTTP request                              │  │
│  │  2. Bootstrap Angular app on server                   │  │
│  │  3. Render components to HTML                         │  │
│  │  4. Include federation scripts                        │  │
│  │  5. Send pre-rendered HTML to client                  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Client Browser                            │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  1. Receive pre-rendered HTML                         │  │
│  │  2. Display content immediately (FCP)                 │  │
│  │  3. Download and execute JavaScript                   │  │
│  │  4. Hydrate Angular application                       │  │
│  │  5. App becomes interactive                           │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Key Technologies

### Native Federation
- **Purpose**: Module sharing and dynamic loading
- **Advantages**: 
  - No Webpack dependency
  - Better performance with esbuild
  - Native ES modules support
  - Simplified configuration

### Server-Side Rendering (SSR)
- **Purpose**: Pre-render pages on server
- **Benefits**:
  - Faster First Contentful Paint (FCP)
  - Better SEO
  - Improved perceived performance
  - Works with federation

### Zoneless Architecture
- **Purpose**: Remove zone.js dependency
- **Benefits**:
  - Smaller bundle size
  - Better performance
  - Simpler change detection
  - Modern Angular approach

## Module Sharing Strategy

```javascript
// Both apps share these packages as singletons:
{
  '@angular/core': singleton,
  '@angular/common': singleton,
  '@angular/router': singleton,
  'rxjs': singleton,
  // ... other Angular packages
}
```

This ensures:
- Only one instance of Angular runs
- Shared state across microfrontends
- Reduced bundle size
- Consistent versions

## Deployment Considerations

### Development
- Run both apps locally
- Hot reload enabled
- CORS automatically configured

### Production
- Build both apps separately
- Deploy to different domains/paths
- Update federation.manifest.json with production URLs
- Configure CORS on server
- Use CDN for static assets

### Example Production URLs
```json
{
  "mfe1": "https://mfe1.example.com/remoteEntry.json"
}
```
