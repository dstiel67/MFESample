# Architecture Overview

## System Architecture

This project demonstrates two different shell implementations that can both load the same Angular microfrontends:

### Angular Shell Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser / Client                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP Request
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                Angular Shell Application                     │
│                    (Host - Port 4200)                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Angular Router:                                      │  │
│  │  - /home  → Home Component (Local)                    │  │
│  │  - /mfe1  → Lazy Load Remote Module                   │  │
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
│  │  - ./bootstrap → bootstrap.ts (for vanilla shell)     │  │
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

### Vanilla Shell Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser / Client                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP Request
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Vanilla JavaScript Shell                        │
│                    (Host - Port 4200)                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Client-Side Router (History API):                   │  │
│  │  - /home  → Render Home Page (Vanilla JS)            │  │
│  │  - /mfe1  → Load and Mount MFE                        │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  MFE Loader:                                          │  │
│  │  - Dynamic import via Module Federation              │  │
│  │  - Call MFE mount() function                          │  │
│  │  - Manage lifecycle (mount/unmount)                   │  │
│  │  - Error boundary and fallback UI                     │  │
│  └───────────────────────────────────────────────────────┘  │
│                              │                               │
│                              │ Federation Manifest           │
│                              │ (federation.manifest.json)    │
│                              ▼                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Vite Module Federation Plugin                        │  │
│  │  - Loads remote entry points                          │  │
│  │  - No shared dependencies (framework-agnostic)        │  │
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
│  │  - ./bootstrap → bootstrap.ts                         │  │
│  │    └─ mount(container) → { unmount() }                │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### Angular Shell Flow

#### 1. Initial Load
```
User → Angular Shell (4200) → Bootstrap Angular → Render Home Component
```

#### 2. Remote Module Load
```
User clicks "Load MFE1"
    ↓
Angular Router activates /mfe1 route
    ↓
loadRemoteModule('mfe1', './routes')
    ↓
Fetch http://localhost:4201/remoteEntry.json
    ↓
Load MFE1 routes and components
    ↓
Angular renders Dashboard Component
```

### Vanilla Shell Flow

#### 1. Initial Load
```
User → Vanilla Shell (4200) → Load main.js → Initialize Router → Render Home Page
```

#### 2. Remote Module Load
```
User clicks "MFE1 Dashboard"
    ↓
Navigation handler prevents default
    ↓
Router.navigate('/mfe1')
    ↓
History API updates URL
    ↓
Route handler executes
    ↓
mfeLoader.loadMFE('mfe1', 'mfe-container')
    ↓
Dynamic import: import('mfe1/bootstrap')
    ↓
Fetch http://localhost:4201/remoteEntry.json
    ↓
Load bootstrap module
    ↓
Call mount(container) function
    ↓
MFE bootstraps Angular app in container
    ↓
Returns { unmount: () => app.destroy() }
    ↓
Store unmount function for cleanup
```

#### 3. Navigation Away (Cleanup)
```
User navigates to different route
    ↓
Router detects route change
    ↓
mfeLoader.unloadMFE('mfe1')
    ↓
Call stored unmount() function
    ↓
MFE destroys Angular app
    ↓
Clear container DOM
    ↓
Remove from loaded MFEs map
    ↓
Load new route content
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

### Module Federation

**Angular Shell:**
- **Technology**: Native Federation (@angular-architects/native-federation)
- **Purpose**: Module sharing and dynamic loading between Angular apps
- **Advantages**: 
  - No Webpack dependency
  - Better performance with esbuild
  - Native ES modules support
  - Simplified configuration
  - Shared Angular dependencies (singleton)

**Vanilla Shell:**
- **Technology**: Vite Plugin Federation (@originjs/vite-plugin-federation)
- **Purpose**: Load remote modules without framework dependencies
- **Advantages**:
  - Framework-agnostic
  - Minimal bundle size (~32KB)
  - Fast builds with Vite
  - No shared dependencies needed
  - Can load any framework's MFEs

### Server-Side Rendering (SSR)

**Angular Shell & MFE1:**
- **Purpose**: Pre-render pages on server
- **Benefits**:
  - Faster First Contentful Paint (FCP)
  - Better SEO
  - Improved perceived performance
  - Works with federation

**Vanilla Shell:**
- **Note**: No SSR support (static HTML/JS/CSS only)
- **Benefits**: Simpler deployment, no server required

### Zoneless Architecture (Angular)
- **Purpose**: Remove zone.js dependency
- **Benefits**:
  - Smaller bundle size
  - Better performance
  - Simpler change detection
  - Modern Angular approach

### Client-Side Routing (Vanilla Shell)
- **Technology**: History API
- **Purpose**: SPA navigation without framework
- **Benefits**:
  - No framework overhead
  - Simple implementation
  - Full control over routing logic
  - Works with any MFE framework

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

**Angular Shell:**
- Run with `npm start` in shell/ directory
- Hot reload enabled via Angular CLI
- CORS automatically configured
- SSR optional in development

**Vanilla Shell:**
- Run with `npm run dev` in shell-vanilla/ directory
- Hot reload enabled via Vite HMR
- CORS automatically configured
- No SSR (static files only)

**MFE1:**
- Run with `npm start` in mfe1/ directory
- Exposes remoteEntry.json on port 4201
- Works with both shell implementations

### Production

**Angular Shell:**
- Build: `npm run build`
- Deploy browser/ folder for static hosting
- Deploy server/ folder for SSR
- Update federation.manifest.json with production URLs
- Configure CORS on server
- Use CDN for static assets

**Vanilla Shell:**
- Build: `npm run build`
- Deploy dist/ folder to any static hosting
- No server required
- Update federation.manifest.json with production URLs
- Extremely lightweight (~32KB)
- Can use any CDN or static host

**MFE1:**
- Build: `npm run build`
- Deploy separately from shell
- Can be hosted on different domain
- Update shell's federation.manifest.json with MFE URL

### Example Production URLs

**Development:**
```json
{
  "mfe1": "http://localhost:4201/remoteEntry.json"
}
```

**Production:**
```json
{
  "mfe1": "https://mfe1.example.com/remoteEntry.json"
}
```

**CDN:**
```json
{
  "mfe1": "https://cdn.example.com/mfe1/v1.2.3/remoteEntry.json"
}
```

### Deployment Strategies

**Strategy 1: Same Domain**
```
https://example.com/          → Vanilla Shell
https://example.com/mfe1/     → MFE1
```
- No CORS issues
- Simpler configuration
- Use reverse proxy (nginx, etc.)

**Strategy 2: Subdomains**
```
https://shell.example.com/    → Vanilla Shell
https://mfe1.example.com/     → MFE1
```
- Independent deployment
- Requires CORS configuration
- Better isolation

**Strategy 3: CDN + Origin**
```
https://cdn.example.com/shell/  → Vanilla Shell (CDN)
https://cdn.example.com/mfe1/   → MFE1 (CDN)
```
- Best performance
- Global distribution
- Requires proper cache headers

### Bundle Size Comparison

| Application | Bundle Size | Notes |
|-------------|-------------|-------|
| Vanilla Shell | ~32KB | Minimal, no framework |
| Angular Shell | ~500KB | Full Angular framework |
| MFE1 | ~300KB | Angular app with components |

**Recommendation:** Use vanilla shell for minimal overhead when shell doesn't need framework features.

## Choosing Between Shell Implementations

### Use Vanilla Shell When:

✅ **Minimal Bundle Size is Critical**
- Need fastest possible initial load
- Targeting mobile or slow networks
- Want ~32KB vs ~500KB bundle

✅ **Framework-Agnostic Host**
- Don't need Angular features in shell
- Want to load MFEs from different frameworks
- Prefer simple, maintainable code

✅ **Simple Container Requirements**
- Shell only needs navigation and routing
- No complex state management in shell
- No shared services between MFEs

✅ **Static Hosting**
- No server infrastructure
- Deploy to CDN or static host
- No SSR requirements for shell

✅ **Fast Build Times**
- Vite builds in seconds
- No Angular compilation overhead
- Faster development iteration

### Use Angular Shell When:

✅ **Need Angular Features in Shell**
- Shared Angular services
- Complex forms or HTTP in shell
- Angular routing guards and resolvers

✅ **SSR for Shell Required**
- Need server-side rendering for shell pages
- SEO requirements for shell content
- Want hydration and event replay

✅ **Shared State Management**
- Need to share Angular services across MFEs
- Want dependency injection in shell
- Complex state management requirements

✅ **Angular Ecosystem**
- Team is Angular-focused
- Want consistent Angular patterns
- Need Angular Material or other Angular libraries in shell

✅ **Type Safety**
- Want TypeScript throughout
- Need strong typing for shared interfaces
- Prefer Angular's dependency injection

### Hybrid Approach

You can also use both shells in different scenarios:

- **Development**: Use vanilla shell for fast iteration
- **Production**: Use Angular shell for full features
- **Mobile**: Use vanilla shell for smaller bundle
- **Desktop**: Use Angular shell for richer features

### Migration Path

**From Angular Shell to Vanilla Shell:**
1. Identify shell-specific features
2. Move complex logic to MFEs
3. Implement vanilla router and navigation
4. Test MFE loading and lifecycle
5. Deploy and compare performance

**From Vanilla Shell to Angular Shell:**
1. Create Angular project structure
2. Implement Angular routing
3. Add Native Federation configuration
4. Migrate navigation to Angular components
5. Add Angular-specific features as needed
