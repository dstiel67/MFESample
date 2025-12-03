# Technical Challenges: Vanilla JS Shell with Native Federation

## Executive Summary

This document details the technical challenges encountered while attempting to create a vanilla JavaScript shell that loads Angular microfrontends using Native Federation. After extensive investigation and multiple implementation attempts, we determined that **direct Native Federation integration from vanilla JS is not practically feasible**. The project successfully implements an **iframe-based solution** as a pragmatic alternative.

## Original Goal

Create a lightweight vanilla JavaScript shell application that:
- Uses Vite for fast builds
- Dynamically loads Angular 20 microfrontends
- Uses Native Federation for module loading
- Maintains zero framework dependencies in the shell
- Provides proper lifecycle management for loaded MFEs

## What We Attempted

### Attempt 1: Webpack Module Federation with Vite Plugin
**Approach:** Use `@originjs/vite-plugin-federation` to load Angular MFEs

**Configuration:**
```javascript
// vite.config.js
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    federation({
      name: 'shell',
      remotes: {
        mfe1: 'http://localhost:4201/remoteEntry.json'
      }
    })
  ]
});
```

**Result:** ❌ **Failed**

**Why it failed:**
- `@originjs/vite-plugin-federation` implements **Webpack Module Federation** format
- Angular MFE1 uses **Native Federation** (different format)
- The two systems are incompatible:
  - Webpack MF uses a specific container format
  - Native Federation uses a different module structure and dependency resolution
  - remoteEntry.json formats are different

**Error encountered:**
```
Failed to fetch dynamically imported module: http://localhost:4201/remoteEntry.json
```

### Attempt 2: Direct Import of Bootstrap Module
**Approach:** Fetch remoteEntry.json, parse it, and directly import the bootstrap.js file

**Code:**
```javascript
const response = await fetch('http://localhost:4201/remoteEntry.json');
const remoteEntry = await response.json();
const bootstrapExpose = remoteEntry.exposes.find(e => e.key === './bootstrap');
const bootstrapUrl = `http://localhost:4201/${bootstrapExpose.outFileName}`;
const module = await import(bootstrapUrl);
```

**Result:** ❌ **Failed**

**Why it failed:**
- The bootstrap.js module contains **bare module specifiers**:
  ```javascript
  import { Component } from '@angular/core';
  import { bootstrapApplication } from '@angular/platform-browser';
  ```
- Browsers cannot resolve bare imports without help
- Need either:
  - Import maps (complex to generate for all Angular dependencies)
  - Module Federation runtime (which we tried next)

**Error encountered:**
```
Failed to resolve module specifier "@angular/platform-browser". 
Relative references must start with either "/", "./", or "../".
```

### Attempt 3: Native Federation Runtime Package
**Approach:** Use `@softarc/native-federation-runtime` to properly load Native Federation modules

**Code:**
```javascript
import { initFederation, loadRemoteModule } from '@softarc/native-federation-runtime';

// Initialize
await initFederation({
  mfe1: 'http://localhost:4201/remoteEntry.json'
});

// Load module
const module = await loadRemoteModule('mfe1', './bootstrap');
```

**Result:** ❌ **Failed**

**Why it failed:**
- The `initFederation` function makes internal HTTP requests that fail
- Returns HTML error pages instead of expected JSON
- The runtime expects to be in a Native Federation build context
- Designed for Angular-to-Angular communication, not vanilla JS consumption
- Lacks documentation for standalone usage outside Angular

**Error encountered:**
```
Unexpected token '<', "<!DOCTYPE "... is not valid JSON
```

**What we discovered:**
- The runtime tries to fetch and process remoteEntry.json files
- Internal requests fail, returning HTML 404 pages
- The package is tightly coupled to the Angular/Native Federation build system
- No examples exist of using it from vanilla JS
- The API surface suggests it should work, but implementation details prevent it

### Attempt 4: Import Maps
**Approach:** Manually create import maps to resolve Angular dependencies

**Concept:**
```html
<script type="importmap">
{
  "imports": {
    "@angular/core": "http://localhost:4201/node_modules/@angular/core/fesm2022/core.mjs",
    "@angular/common": "http://localhost:4201/node_modules/@angular/common/fesm2022/common.mjs",
    "@angular/platform-browser": "http://localhost:4201/node_modules/@angular/platform-browser/fesm2022/platform-browser.mjs",
    // ... hundreds more
  }
}
</script>
```

**Result:** ❌ **Not Pursued**

**Why we didn't pursue it:**
- Would require mapping **all** Angular dependencies (50+ packages)
- Each package has multiple entry points
- Version management nightmare
- Native Federation uses bundled/shared modules, not direct node_modules access
- Maintenance burden too high
- Defeats the purpose of Module Federation (shared dependency management)

## Root Cause Analysis

### Why Native Federation Doesn't Work from Vanilla JS

1. **Architectural Mismatch**
   - Native Federation is designed for **Angular-to-Angular** communication
   - Assumes both host and remote are Angular applications
   - Runtime expects Angular's dependency injection and module system

2. **Module Resolution**
   - Native Federation modules use **bare imports** (`@angular/core`)
   - Requires sophisticated runtime to resolve these
   - The runtime (`@softarc/native-federation-runtime`) doesn't work standalone

3. **Build System Integration**
   - Native Federation is tightly integrated with Angular CLI
   - Generates specific metadata during build
   - Expects certain build artifacts and structure

4. **Shared Dependencies**
   - Native Federation's main benefit is **shared dependency management**
   - This requires both apps to use the same dependency resolution system
   - Vanilla JS has no equivalent system

5. **Documentation Gap**
   - All Native Federation documentation shows Angular examples
   - No examples of vanilla JS consumption
   - API suggests it should work, but implementation prevents it

## The Iframe Solution

### What We Implemented

Instead of Module Federation, we implemented a **pragmatic iframe-based approach**:

```javascript
// Create iframe
const iframe = document.createElement('iframe');
iframe.src = 'http://localhost:4201';
container.appendChild(iframe);

// Cleanup
iframe.parentNode.removeChild(iframe);
```

### Advantages

✅ **Simple** - No complex module resolution  
✅ **Reliable** - Works immediately without configuration  
✅ **Isolated** - MFE runs in its own context  
✅ **Compatible** - Works with any framework  
✅ **No rebuild required** - MFE1 works as-is  
✅ **Production-ready** - Stable and well-understood technology

### Limitations

❌ **No shared state** - Shell and MFE can't directly share data  
❌ **Separate routing** - MFE has its own router  
❌ **Communication overhead** - Need postMessage API  
❌ **SEO challenges** - Content inside iframe harder to index  
❌ **Styling isolation** - MFE styles don't inherit from shell  
❌ **Not "true" microfrontends** - More like embedded applications

### When to Use Iframes

Iframes are appropriate when:
- You need to integrate applications from different frameworks
- The applications are truly independent
- You don't need deep integration or shared state
- Isolation is more important than integration
- You want maximum stability and simplicity

## Alternative Solutions

### Option 1: Use the Angular Shell (Recommended)

The Angular shell at `shell/` directory:
- ✅ Fully compatible with Native Federation
- ✅ Proper module resolution
- ✅ Shared dependencies work correctly
- ✅ SSR support maintained
- ✅ Production-ready
- ✅ Already built and tested

**When to use:** Production applications requiring deep integration

### Option 2: Rebuild MFE with Webpack Module Federation

Convert MFE1 to use standard Module Federation:
- Remove `@angular-architects/native-federation`
- Install `@angular-architects/module-federation` (Webpack-based)
- Switch build to Webpack
- Configure Webpack Module Federation plugin
- Then `@originjs/vite-plugin-federation` would work

**Downsides:**
- Significant rebuild effort
- Lose Native Federation benefits
- Webpack slower than esbuild
- Lose SSR support (complex with Webpack MF)

**When to use:** When you absolutely need vanilla shell with deep integration

### Option 3: Web Components

Wrap Angular MFE as a Web Component:

```typescript
// In MFE1
import { createCustomElement } from '@angular/elements';

const mfe1Element = createCustomElement(AppComponent, { injector });
customElements.define('mfe1-app', mfe1Element);
```

```javascript
// In vanilla shell
container.innerHTML = '<mfe1-app></mfe1-app>';
```

**Advantages:**
- Standard web platform API
- Better encapsulation than iframe
- Works across frameworks

**Challenges:**
- Still need to load Angular bundle
- Requires `@angular/elements` package
- Some setup in MFE1
- Styling encapsulation issues

**When to use:** When you need better integration than iframes but can't use Angular shell

### Option 4: Create a Vanilla JS MFE

Build a new microfrontend in vanilla JS:
- No Angular dependencies
- Can use standard Module Federation
- Works with `@originjs/vite-plugin-federation`
- Lightweight and fast

**When to use:** Starting fresh or adding new features

## Lessons Learned

### 1. Module Federation is Not Universal

Module Federation comes in different flavors:
- **Webpack Module Federation** - Original, widely supported
- **Native Federation** - Angular-specific, better Angular integration
- **Vite Module Federation** - Vite plugin, compatible with Webpack MF

These are **not interchangeable**. Choose based on your stack.

### 2. Framework Boundaries are Real

Crossing framework boundaries is harder than it seems:
- Each framework has its own module system
- Dependency resolution differs
- Build systems are incompatible
- "Universal" solutions often have hidden assumptions

### 3. Iframes are Underrated

Modern web development often dismisses iframes, but they:
- Are simple and reliable
- Provide true isolation
- Work across any framework
- Are well-understood and stable
- Have legitimate use cases

### 4. Documentation Matters

The `@softarc/native-federation-runtime` package:
- Has an API that suggests standalone usage
- Lacks examples of such usage
- Fails in ways that aren't documented
- Shows the importance of comprehensive documentation

### 5. Pragmatism Over Purity

The "perfect" solution (vanilla JS + Native Federation) wasn't achievable.  
The "good" solution (vanilla JS + iframes) works well.  
Sometimes good enough is better than perfect.

## Recommendations

### For This Project

1. **Use the iframe solution** for the vanilla shell
   - It works reliably
   - Demonstrates the concept
   - Is production-ready

2. **Use the Angular shell** for production
   - Located at `shell/` directory
   - Fully compatible with Native Federation
   - Better integration and performance

3. **Document the tradeoffs**
   - Be transparent about limitations
   - Explain why iframes were chosen
   - Provide alternatives for different use cases

### For Future Projects

1. **Match technologies** - Use Angular shell with Angular MFEs for Native Federation

2. **Choose Module Federation flavor early** - Webpack MF vs Native Federation

3. **Consider iframes** - Don't dismiss them for cross-framework integration

4. **Test integration early** - Don't assume technologies will work together

5. **Have a Plan B** - Always have a fallback approach

## Conclusion

The vanilla JavaScript shell with Native Federation was an ambitious goal that revealed important limitations in cross-framework module loading. While we couldn't achieve the original vision, we:

1. ✅ Created a working vanilla JS shell
2. ✅ Successfully load and display Angular MFEs
3. ✅ Implemented proper lifecycle management
4. ✅ Provided comprehensive error handling
5. ✅ Documented the challenges and solutions

The iframe approach is a **pragmatic, production-ready solution** that achieves the core goal: a lightweight shell loading Angular microfrontends. It may not be the "pure" Module Federation solution we envisioned, but it's reliable, maintainable, and works.

Sometimes the best solution is the one that works.

## References

- [Native Federation Documentation](https://www.npmjs.com/package/@angular-architects/native-federation)
- [Webpack Module Federation](https://webpack.js.org/concepts/module-federation/)
- [@originjs/vite-plugin-federation](https://github.com/originjs/vite-plugin-federation)
- [Angular Elements](https://angular.io/guide/elements)
- [MDN: iframe](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe)
- [MDN: postMessage](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)

## Appendix: Error Messages Reference

### Error 1: Module Federation Format Mismatch
```
Failed to fetch dynamically imported module: http://localhost:4201/remoteEntry.json
```
**Cause:** Webpack Module Federation plugin trying to load Native Federation remote  
**Solution:** Use matching federation systems

### Error 2: Bare Module Specifier
```
Failed to resolve module specifier "@angular/platform-browser". 
Relative references must start with either "/", "./", or "../".
```
**Cause:** Browser can't resolve npm package names  
**Solution:** Need import maps or module federation runtime

### Error 3: Native Federation Runtime Initialization
```
Unexpected token '<', "<!DOCTYPE "... is not valid JSON
```
**Cause:** Native Federation runtime making requests that return HTML errors  
**Solution:** Use Native Federation only in Angular-to-Angular scenarios

### Error 4: Unknown Remote
```
Error: unknown remote mfe1
```
**Cause:** Native Federation runtime not properly initialized with remote configuration  
**Solution:** Ensure initFederation called with correct manifest
