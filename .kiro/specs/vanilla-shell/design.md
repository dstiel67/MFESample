# Design Document

## Overview

This design converts the Angular 20 shell application into a lightweight vanilla JavaScript shell that uses Vite and Module Federation to dynamically load Angular microfrontends. The shell will handle routing, navigation, and microfrontend lifecycle management without any framework dependencies, while MFE1 remains a full Angular 20 application with SSR support.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│           Vanilla JavaScript Shell (Port 4200)          │
│  ┌───────────────────────────────────────────────────┐  │
│  │  - Vite Dev Server / Static Build                 │  │
│  │  - Module Federation Plugin                       │  │
│  │  - Client-side Router (History API)               │  │
│  │  - Microfrontend Lifecycle Manager                │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          │ Loads via Module Federation
                          ▼
┌─────────────────────────────────────────────────────────┐
│          Angular 20 MFE1 (Port 4201)                    │
│  ┌───────────────────────────────────────────────────┐  │
│  │  - Angular CLI Build                              │  │
│  │  - Native Federation                              │  │
│  │  - SSR Support (Production)                       │  │
│  │  - Exposes Routes Module                          │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Technology Stack

**Shell:**
- Vite 5.x - Build tool and dev server
- @originjs/vite-plugin-federation - Module Federation for Vite
- Vanilla JavaScript (ES6+) - No framework
- CSS3 - Styling

**MFE1 (unchanged):**
- Angular 20
- @angular-architects/native-federation
- Angular SSR

## Components and Interfaces

### 1. Shell Application Structure

```
shell-vanilla/
├── index.html              # Main HTML entry point
├── src/
│   ├── main.js            # Application entry point
│   ├── router.js          # Client-side routing
│   ├── mfe-loader.js      # Microfrontend loading logic
│   ├── navigation.js      # Navigation component
│   └── styles.css         # Global styles
├── vite.config.js         # Vite configuration with Module Federation
├── package.json
└── public/
    └── federation.manifest.json
```

### 2. Router Module (router.js)

```javascript
class Router {
  constructor() {
    this.routes = new Map();
    this.currentRoute = null;
  }

  register(path, handler) {
    this.routes.set(path, handler);
  }

  navigate(path) {
    // Update URL and call handler
  }

  init() {
    // Setup popstate listener
  }
}
```

### 3. MFE Loader Module (mfe-loader.js)

```javascript
class MFELoader {
  constructor() {
    this.loadedMFEs = new Map();
    this.currentMFE = null;
  }

  async loadMFE(name, container) {
    // Load remote module
    // Bootstrap Angular app
    // Return cleanup function
  }

  async unloadMFE(name) {
    // Call cleanup
    // Remove from DOM
  }
}
```

### 4. Navigation Component (navigation.js)

```javascript
function createNavigation() {
  // Create nav element
  // Add event listeners
  // Return DOM element
}

function updateActiveLink(path) {
  // Update active state
}
```

## Data Models

### Federation Manifest

```json
{
  "mfe1": "http://localhost:4201/remoteEntry.json"
}
```

### Route Configuration

```javascript
const routes = [
  { path: '/', handler: renderHome },
  { path: '/home', handler: renderHome },
  { path: '/mfe1', handler: loadMFE1 }
];
```

### MFE Configuration

```javascript
const mfeConfig = {
  name: 'mfe1',
  container: '#mfe-container',
  module: './routes',
  exposedModule: 'routes'
};
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Shell independence from Angular

*For any* shell build output, the bundle should not contain any Angular framework code or dependencies
**Validates: Requirements 1.1, 6.1**

### Property 2: Route navigation consistency

*For any* navigation action (link click, back/forward, direct URL), the system should update both the URL and the displayed content to match
**Validates: Requirements 4.2, 4.3, 4.4**

### Property 3: MFE lifecycle cleanup

*For any* microfrontend that is mounted, when it is unmounted, all its DOM elements should be removed and cleanup functions should be called
**Validates: Requirements 5.2, 5.3, 5.4**

### Property 4: MFE loading error handling

*For any* microfrontend load failure, the shell should remain functional and display an error message without crashing
**Validates: Requirements 2.4**

### Property 5: Module Federation isolation

*For any* shell build, it should not include MFE-specific code, and for any MFE build, it should not include shell-specific code
**Validates: Requirements 6.1, 6.2**

### Property 6: Navigation state synchronization

*For any* route change, the active navigation link should be updated to reflect the current route
**Validates: Requirements 4.5**

### Property 7: Container element management

*For any* microfrontend mount operation, a container element should be created before mounting and should exist in the DOM while the MFE is active
**Validates: Requirements 5.1**

## Error Handling

### 1. MFE Load Failures

```javascript
try {
  await loadMFE('mfe1');
} catch (error) {
  console.error('Failed to load MFE:', error);
  displayError('Unable to load the requested module');
  // Shell remains functional
}
```

### 2. Navigation Errors

```javascript
router.register('/mfe1', async () => {
  try {
    await loadMFE1();
  } catch (error) {
    router.navigate('/error');
  }
});
```

### 3. Invalid Routes

```javascript
// Fallback to home for unknown routes
if (!routes.has(path)) {
  router.navigate('/home');
}
```

### 4. Module Federation Errors

```javascript
// Graceful degradation if remote is unavailable
const remote = await import('mfe1/routes').catch(() => {
  return { default: ErrorComponent };
});
```

## Testing Strategy

### Unit Tests

**Shell Components:**
- Router path matching and navigation
- MFE loader mount/unmount logic
- Navigation component rendering
- Error handling for failed loads

**Test Framework:** Vitest (fast, Vite-native)

**Example Tests:**
```javascript
describe('Router', () => {
  it('should navigate to registered routes', () => {
    const router = new Router();
    router.register('/home', mockHandler);
    router.navigate('/home');
    expect(mockHandler).toHaveBeenCalled();
  });
});
```

### Integration Tests

- Shell loading MFE1 successfully
- Navigation between shell and MFE routes
- Browser back/forward navigation
- MFE cleanup on route change

**Test Framework:** Playwright for E2E

### Property-Based Tests

**Framework:** fast-check (JavaScript property testing library)

**Configuration:** Minimum 100 iterations per property test

**Test Annotations:** Each property test must include a comment with the format:
`// Feature: vanilla-shell, Property N: [property description]`

**Property Tests:**

1. **Shell Bundle Independence**
   ```javascript
   // Feature: vanilla-shell, Property 1: Shell independence from Angular
   test('shell bundle contains no Angular code', async () => {
     const bundle = await buildShell();
     const content = await readBundle(bundle);
     expect(content).not.toContain('@angular');
     expect(content).not.toContain('ng-');
   });
   ```

2. **Route Navigation Consistency**
   ```javascript
   // Feature: vanilla-shell, Property 2: Route navigation consistency
   fc.assert(
     fc.property(fc.constantFrom('/home', '/mfe1', '/'), (path) => {
       router.navigate(path);
       return window.location.pathname === path;
     })
   );
   ```

3. **MFE Lifecycle Cleanup**
   ```javascript
   // Feature: vanilla-shell, Property 3: MFE lifecycle cleanup
   fc.assert(
     fc.property(fc.string(), async (mfeName) => {
       const container = document.createElement('div');
       await mfeLoader.loadMFE(mfeName, container);
       await mfeLoader.unloadMFE(mfeName);
       return container.children.length === 0;
     })
   );
   ```

4. **Error Handling Stability**
   ```javascript
   // Feature: vanilla-shell, Property 4: MFE loading error handling
   fc.assert(
     fc.property(fc.string(), async (invalidMFE) => {
       const beforeState = captureAppState();
       try {
         await mfeLoader.loadMFE(invalidMFE);
       } catch (error) {
         // Shell should still be functional
       }
       const afterState = captureAppState();
       return afterState.isStable && afterState.canNavigate;
     })
   );
   ```

5. **Build Isolation**
   ```javascript
   // Feature: vanilla-shell, Property 5: Module Federation isolation
   test('builds are independent', async () => {
     const shellBundle = await buildShell();
     const mfeBundle = await buildMFE();
     
     const shellContent = await readBundle(shellBundle);
     const mfeContent = await readBundle(mfeBundle);
     
     // Shell should not contain MFE code
     expect(shellContent).not.toContain('dashboard');
     // MFE should not contain shell code
     expect(mfeContent).not.toContain('shell-navigation');
   });
   ```

## Implementation Notes

### Vite Configuration

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    federation({
      name: 'shell',
      remotes: {
        mfe1: 'http://localhost:4201/assets/remoteEntry.js'
      },
      shared: []  // No shared dependencies needed
    })
  ],
  server: {
    port: 4200
  },
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false
  }
});
```

### Angular MFE Integration

The Angular MFE needs to expose a bootstrap function that the vanilla shell can call:

```typescript
// mfe1/src/bootstrap.ts
export async function mount(container: string | HTMLElement) {
  const app = await bootstrapApplication(AppComponent, appConfig);
  return {
    unmount: () => app.destroy()
  };
}
```

### Development Workflow

1. Start MFE1: `cd mfe1 && npm start` (port 4201)
2. Start Shell: `cd shell-vanilla && npm run dev` (port 4200)
3. Navigate to http://localhost:4200

### Production Build

1. Build MFE1: `cd mfe1 && npm run build`
2. Build Shell: `cd shell-vanilla && npm run build`
3. Serve both with any static server or deploy separately
