# Troubleshooting Guide

This guide covers common issues you may encounter when working with the vanilla JavaScript shell and provides solutions.

## Table of Contents

- [Development Issues](#development-issues)
- [Module Federation Issues](#module-federation-issues)
- [MFE Loading Issues](#mfe-loading-issues)
- [Build and Deployment Issues](#build-and-deployment-issues)
- [CORS Issues](#cors-issues)
- [Performance Issues](#performance-issues)
- [Browser Compatibility](#browser-compatibility)

## Development Issues

### Dev Server Won't Start

**Symptom:** `npm run dev` fails or port is already in use

**Solutions:**

1. **Port already in use:**
   ```bash
   # Find process using port 4200
   lsof -i :4200
   # Kill the process
   kill -9 <PID>
   ```

2. **Dependencies not installed:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Vite cache issues:**
   ```bash
   rm -rf node_modules/.vite
   npm run dev
   ```

### Hot Module Replacement Not Working

**Symptom:** Changes to code don't reflect in browser

**Solutions:**

1. **Hard refresh the browser:** `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows/Linux)

2. **Clear Vite cache:**
   ```bash
   rm -rf node_modules/.vite
   npm run dev
   ```

3. **Check file watchers:**
   ```bash
   # Increase file watcher limit on Linux
   echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
   sudo sysctl -p
   ```

### Navigation Not Working

**Symptom:** Clicking navigation links causes full page reload or doesn't navigate

**Solutions:**

1. **Check event listeners:** Ensure `data-link` attribute is present on navigation links
   ```html
   <a href="/mfe1" data-link>MFE1</a>
   ```

2. **Verify router initialization:** Check that `router.init()` is called in `main.js`

3. **Check browser console:** Look for JavaScript errors that might be breaking the router

4. **Verify History API support:**
   ```javascript
   if (!window.history || !window.history.pushState) {
     console.error('History API not supported');
   }
   ```

## Module Federation Issues

### Remote Entry Not Found

**Symptom:** `Failed to fetch remote entry` or 404 error

**Solutions:**

1. **Verify MFE is running:**
   ```bash
   # Check if MFE1 is running on port 4201
   curl http://localhost:4201/remoteEntry.json
   ```

2. **Check federation manifest:**
   ```bash
   # Verify the URL in public/federation.manifest.json
   cat public/federation.manifest.json
   ```

3. **Verify remote entry exists:**
   - Navigate to http://localhost:4201/remoteEntry.json in browser
   - Should return JSON with module information

4. **Check vite.config.js remotes:**
   ```javascript
   remotes: {
     mfe1: 'http://localhost:4201/remoteEntry.json'
   }
   ```

### Module Not Found Error

**Symptom:** `Cannot find module './bootstrap'` or similar

**Solutions:**

1. **Verify MFE exposes the module:**
   ```javascript
   // In mfe1/federation.config.js
   exposes: {
     './bootstrap': './src/bootstrap.ts'
   }
   ```

2. **Check import statement:**
   ```javascript
   // In shell-vanilla/src/mfe-loader.js
   const module = await import('mfe1/bootstrap');
   ```

3. **Rebuild MFE after config changes:**
   ```bash
   cd mfe1
   npm run build
   npm start
   ```

4. **Clear browser cache:** Hard refresh or clear cache in DevTools

### Shared Dependencies Conflict

**Symptom:** Multiple versions of same library loaded or runtime errors

**Solutions:**

1. **Check shared configuration:**
   ```javascript
   // In vite.config.js
   shared: [] // Vanilla shell typically doesn't share dependencies
   ```

2. **Verify MFE shared config:**
   ```javascript
   // In mfe1/federation.config.js
   shared: {
     '@angular/core': { singleton: true, strictVersion: true }
   }
   ```

3. **Use singleton for critical libraries:**
   ```javascript
   shared: {
     'library-name': { singleton: true }
   }
   ```

## MFE Loading Issues

### MFE Fails to Mount

**Symptom:** Error boundary displays or blank screen when navigating to MFE route

**Solutions:**

1. **Check MFE exports mount function:**
   ```typescript
   // In mfe1/src/bootstrap.ts
   export async function mount(container: string | HTMLElement) {
     // Bootstrap logic
     return { unmount: () => { /* cleanup */ } };
   }
   ```

2. **Verify container element exists:**
   ```javascript
   // In shell-vanilla/src/mfe-loader.js
   const container = document.getElementById('mfe-container');
   if (!container) {
     console.error('Container element not found');
   }
   ```

3. **Check browser console for errors:** Look for Angular bootstrap errors

4. **Verify MFE is built correctly:**
   ```bash
   cd mfe1
   npm run build
   npm start
   ```

### MFE Not Cleaning Up

**Symptom:** Memory leaks, duplicate content, or errors when navigating away

**Solutions:**

1. **Verify unmount function is returned:**
   ```typescript
   export async function mount(container) {
     const app = await bootstrapApplication(AppComponent);
     return {
       unmount: () => app.destroy() // Must return unmount
     };
   }
   ```

2. **Check unmount is called:**
   ```javascript
   // In shell-vanilla/src/mfe-loader.js
   async unloadMFE(name) {
     const mfe = this.loadedMFEs.get(name);
     if (mfe && mfe.unmount) {
       await mfe.unmount();
     }
   }
   ```

3. **Verify DOM cleanup:**
   ```javascript
   // Container should be empty after unmount
   console.log(container.children.length); // Should be 0
   ```

### MFE Styles Conflicting

**Symptom:** Styles from MFE affect shell or vice versa

**Solutions:**

1. **Use scoped styles in MFE:**
   ```typescript
   @Component({
     selector: 'app-dashboard',
     encapsulation: ViewEncapsulation.Emulated // Default, provides scoping
   })
   ```

2. **Use CSS modules in shell:**
   ```javascript
   // Import styles as modules
   import styles from './component.module.css';
   ```

3. **Add namespace to shell styles:**
   ```css
   .shell-nav { /* Shell-specific styles */ }
   .shell-content { /* Shell-specific styles */ }
   ```

4. **Use Shadow DOM for isolation:**
   ```typescript
   @Component({
     encapsulation: ViewEncapsulation.ShadowDom
   })
   ```

## Build and Deployment Issues

### Build Fails

**Symptom:** `npm run build` exits with errors

**Solutions:**

1. **Check Node.js version:**
   ```bash
   node --version # Should be 18.x or higher
   ```

2. **Clear cache and rebuild:**
   ```bash
   rm -rf node_modules dist .vite
   npm install
   npm run build
   ```

3. **Check for syntax errors:**
   ```bash
   # Run ESLint if configured
   npm run lint
   ```

4. **Verify vite.config.js is valid:**
   ```bash
   node -c vite.config.js
   ```

### Production Build Not Working

**Symptom:** Build succeeds but app doesn't work when deployed

**Solutions:**

1. **Test production build locally:**
   ```bash
   npm run build
   npm run preview
   ```

2. **Check federation manifest URLs:**
   ```json
   {
     "mfe1": "https://production-mfe1.com/remoteEntry.json"
   }
   ```

3. **Verify base path in vite.config.js:**
   ```javascript
   export default defineConfig({
     base: '/', // Or '/app/' if deployed to subdirectory
   });
   ```

4. **Check console for errors:** Open browser DevTools and look for 404s or CORS errors

### Assets Not Loading

**Symptom:** Images, fonts, or other assets return 404

**Solutions:**

1. **Place assets in public/ folder:**
   ```
   shell-vanilla/
   └── public/
       ├── images/
       └── fonts/
   ```

2. **Reference assets with absolute paths:**
   ```html
   <img src="/images/logo.png" alt="Logo">
   ```

3. **Check build output:**
   ```bash
   ls -la dist/
   # Verify assets are copied to dist/
   ```

## CORS Issues

### CORS Error When Loading MFE

**Symptom:** `Access to fetch at '...' has been blocked by CORS policy`

**Solutions:**

1. **Configure CORS in MFE dev server:**
   ```javascript
   // In mfe1/angular.json
   "serve": {
     "options": {
       "headers": {
         "Access-Control-Allow-Origin": "*"
       }
     }
   }
   ```

2. **Use proxy in development:**
   ```javascript
   // In shell-vanilla/vite.config.js
   server: {
     proxy: {
       '/mfe1': {
         target: 'http://localhost:4201',
         changeOrigin: true
       }
     }
   }
   ```

3. **For production, configure web server:**
   ```nginx
   # nginx example
   add_header Access-Control-Allow-Origin "https://shell.example.com";
   add_header Access-Control-Allow-Methods "GET, OPTIONS";
   ```

4. **Use same-origin deployment:**
   - Deploy shell and MFEs under same domain
   - Use reverse proxy to route requests

### Preflight Request Failing

**Symptom:** OPTIONS request fails before actual request

**Solutions:**

1. **Handle OPTIONS requests:**
   ```javascript
   // In MFE server
   app.options('*', (req, res) => {
     res.header('Access-Control-Allow-Origin', '*');
     res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
     res.header('Access-Control-Allow-Headers', 'Content-Type');
     res.sendStatus(200);
   });
   ```

2. **Check allowed headers:**
   ```
   Access-Control-Allow-Headers: Content-Type, Authorization
   ```

## Performance Issues

### Slow Initial Load

**Symptom:** Shell takes long time to load initially

**Solutions:**

1. **Enable code splitting:**
   ```javascript
   // In vite.config.js
   build: {
     rollupOptions: {
       output: {
         manualChunks: {
           router: ['./src/router.js'],
           mfeLoader: ['./src/mfe-loader.js']
         }
       }
     }
   }
   ```

2. **Preload critical resources:**
   ```html
   <link rel="preload" href="/assets/main.js" as="script">
   ```

3. **Optimize images:**
   ```bash
   # Use WebP format
   # Compress images before adding to public/
   ```

4. **Enable compression on server:**
   ```nginx
   gzip on;
   gzip_types text/css application/javascript;
   ```

### Slow MFE Loading

**Symptom:** MFE takes long time to load after navigation

**Solutions:**

1. **Preload remote entry:**
   ```javascript
   // In main.js
   const link = document.createElement('link');
   link.rel = 'preload';
   link.href = 'http://localhost:4201/remoteEntry.json';
   link.as = 'fetch';
   document.head.appendChild(link);
   ```

2. **Use CDN for MFE hosting:**
   ```json
   {
     "mfe1": "https://cdn.example.com/mfe1/remoteEntry.json"
   }
   ```

3. **Enable caching:**
   ```
   Cache-Control: public, max-age=31536000, immutable
   ```

4. **Optimize MFE bundle size:**
   ```bash
   cd mfe1
   npm run build -- --stats-json
   # Analyze bundle with webpack-bundle-analyzer
   ```

### Memory Leaks

**Symptom:** Browser becomes slow after multiple navigations

**Solutions:**

1. **Verify MFE cleanup:**
   ```javascript
   // Ensure unmount destroys Angular app
   unmount: () => {
     app.destroy();
     container.innerHTML = ''; // Clear DOM
   }
   ```

2. **Remove event listeners:**
   ```javascript
   // In navigation.js
   const cleanup = () => {
     links.forEach(link => {
       link.removeEventListener('click', handleClick);
     });
   };
   ```

3. **Use Chrome DevTools Memory Profiler:**
   - Take heap snapshot before navigation
   - Navigate to MFE and back
   - Take another snapshot
   - Compare to find leaks

## Browser Compatibility

### App Not Working in Older Browsers

**Symptom:** Blank screen or errors in IE11, older Safari

**Solutions:**

1. **Check browser support:**
   ```javascript
   // Module Federation requires modern browsers
   // Minimum: Chrome 89+, Firefox 87+, Safari 15+, Edge 89+
   ```

2. **Add polyfills if needed:**
   ```bash
   npm install core-js
   ```
   ```javascript
   // In main.js
   import 'core-js/stable';
   ```

3. **Update browserslist:**
   ```json
   // In package.json
   "browserslist": [
     "last 2 Chrome versions",
     "last 2 Firefox versions",
     "last 2 Safari versions"
   ]
   ```

### ES Modules Not Supported

**Symptom:** `Uncaught SyntaxError: Cannot use import statement outside a module`

**Solutions:**

1. **Verify script type:**
   ```html
   <script type="module" src="/src/main.js"></script>
   ```

2. **Check browser support:** ES modules require modern browsers

3. **Use module/nomodule pattern:**
   ```html
   <script type="module" src="/modern.js"></script>
   <script nomodule src="/legacy.js"></script>
   ```

## Getting Help

If you're still experiencing issues:

1. **Check browser console:** Look for error messages and stack traces
2. **Check network tab:** Verify all resources are loading correctly
3. **Enable verbose logging:**
   ```javascript
   // In mfe-loader.js
   console.log('Loading MFE:', name);
   console.log('Container:', container);
   ```
4. **Review documentation:**
   - [FEDERATION_CONFIG.md](./FEDERATION_CONFIG.md)
   - [MFE_INTEGRATION.md](./MFE_INTEGRATION.md)
   - [ERROR_BOUNDARY_TEST.md](./ERROR_BOUNDARY_TEST.md)

5. **Test with minimal setup:**
   - Start fresh shell and MFE
   - Test with default configuration
   - Add customizations incrementally

## Common Error Messages

### "Failed to fetch dynamically imported module"

**Cause:** Remote entry URL is incorrect or MFE is not running

**Solution:** Verify MFE is running and URL in federation.manifest.json is correct

### "Shared module is not available for eager consumption"

**Cause:** Shared module configuration mismatch

**Solution:** Ensure shared modules are configured consistently in both shell and MFE

### "Cannot read properties of undefined (reading 'mount')"

**Cause:** MFE doesn't export mount function or export name is wrong

**Solution:** Verify MFE exports `mount` function in bootstrap.ts

### "Container element not found"

**Cause:** DOM element with id 'mfe-container' doesn't exist

**Solution:** Verify index.html contains `<div id="mfe-container"></div>`

### "Navigation failed: route not found"

**Cause:** Route is not registered in router

**Solution:** Add route registration in main.js: `router.register('/path', handler)`
