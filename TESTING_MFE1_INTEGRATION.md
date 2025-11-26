# Testing MFE1 Integration with Vanilla Shell

This document describes how to test that MFE1 can be mounted by the vanilla shell.

## Prerequisites

Both MFE1 and the vanilla shell must be running:

1. **Start MFE1** (in terminal 1):
   ```bash
   cd mfe1
   npm start
   ```
   MFE1 will run on http://localhost:4201

2. **Start Vanilla Shell** (in terminal 2):
   ```bash
   cd shell-vanilla
   npm run dev
   ```
   Shell will run on http://localhost:4200

## Testing the Integration

### Manual Testing

1. Open your browser to http://localhost:4200
2. You should see the vanilla shell home page
3. Click on "MFE1 Dashboard" in the navigation
4. The Angular MFE1 should load dynamically in the shell
5. Navigate back to "Home" - the MFE should be properly unmounted
6. Navigate back to "MFE1 Dashboard" - the MFE should load again

### What to Verify

✅ **Mount Function Works**:
- MFE1 loads without errors
- The Angular dashboard component appears
- No console errors related to mounting

✅ **Unmount Function Works**:
- When navigating away from MFE1, the Angular app is destroyed
- The DOM is cleaned up (no leftover app-root elements)
- No memory leaks or console errors

✅ **Container Management**:
- The MFE is rendered in the correct container (#mfe-container)
- The container is properly created and managed

✅ **Error Handling**:
- If MFE1 is not running, a friendly error message appears
- The shell remains stable even if MFE loading fails

## Implementation Details

### MFE1 Changes

The `mfe1/src/bootstrap.ts` file now exports a `mount` function:

```typescript
export async function mount(container: string | HTMLElement): Promise<{ unmount: () => void }> {
  // Creates app-root element
  // Bootstraps Angular application
  // Returns unmount function for cleanup
}
```

### Federation Configuration

The `mfe1/federation.config.js` exposes the bootstrap module:

```javascript
exposes: {
  './routes': './src/app/app.routes.ts',
  './bootstrap': './src/bootstrap.ts',  // NEW
}
```

### Vanilla Shell Integration

The `shell-vanilla/src/mfe-loader.js` imports and calls the mount function:

```javascript
// Import the bootstrap module
const module = await import('mfe1/bootstrap');

// Call the mount function
const result = await module.mount(container);

// Store the unmount function for cleanup
return result;
```

## Troubleshooting

### MFE1 doesn't load

1. Check that MFE1 is running on port 4201
2. Verify http://localhost:4201/remoteEntry.json is accessible
3. Check browser console for CORS or network errors
4. Ensure the vite.config.js has the correct remote URL

### MFE1 loads but doesn't unmount properly

1. Check that the unmount function is being called
2. Verify the app-root element is being removed from the DOM
3. Check for Angular destroy errors in the console

### Build errors

1. Ensure all dependencies are installed: `npm install`
2. Clear build cache: `rm -rf dist .angular/cache`
3. Rebuild: `npm run build`
