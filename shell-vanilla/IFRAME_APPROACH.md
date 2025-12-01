# Iframe Approach for Loading MFEs

## Overview

The vanilla JavaScript shell uses an **iframe-based approach** to load Angular microfrontends. This is a pragmatic solution that works around the incompatibility between standard Module Federation and Angular's Native Federation.

## Why Iframe?

### The Problem
- Angular MFE1 uses **Native Federation**, which has a proprietary module format
- Native Federation modules require the Native Federation runtime to resolve Angular dependencies
- The vanilla JS shell cannot easily integrate with Native Federation's runtime
- Standard Module Federation (`@originjs/vite-plugin-federation`) is incompatible with Native Federation

### The Solution
- Load the Angular MFE in an **iframe**
- The iframe loads the full Angular application from its own server
- Simple, reliable, and works immediately
- No complex module resolution needed

## How It Works

### 1. MFE Configuration

The MFE URLs are configured in `mfe-loader.js`:

```javascript
const mfeUrls = {
  'mfe1': 'http://localhost:4201'
};
```

### 2. Loading Process

When you navigate to `/mfe1`:

1. The router calls `mfeLoader.loadMFE('mfe1', '#mfe-container')`
2. The loader creates an iframe element
3. The iframe's `src` is set to `http://localhost:4201`
4. The iframe is inserted into the `#mfe-container` div
5. The Angular app loads inside the iframe

### 3. Lifecycle Management

**Mounting:**
```javascript
// Creates iframe and inserts it into container
const iframe = document.createElement('iframe');
iframe.src = mfeUrl;
container.appendChild(iframe);
```

**Unmounting:**
```javascript
// Removes iframe from DOM when navigating away
iframe.parentNode.removeChild(iframe);
```

## Advantages

✅ **Simple** - No complex module resolution
✅ **Reliable** - Works immediately without configuration issues
✅ **Isolated** - MFE runs in its own context
✅ **Compatible** - Works with any framework (Angular, React, Vue, etc.)
✅ **No rebuild required** - MFE1 works as-is

## Limitations

❌ **No shared state** - Shell and MFE can't directly share data
❌ **Separate routing** - MFE has its own router inside the iframe
❌ **Communication overhead** - Need postMessage API for cross-frame communication
❌ **SEO challenges** - Content inside iframe is harder to index
❌ **Styling isolation** - MFE styles don't inherit from shell

## Communication Between Shell and MFE

If you need the shell and MFE to communicate, use the `postMessage` API:

### From Shell to MFE:

```javascript
const iframe = document.getElementById('mfe-iframe-mfe1');
iframe.contentWindow.postMessage({
  type: 'SHELL_EVENT',
  data: { userId: 123 }
}, 'http://localhost:4201');
```

### From MFE to Shell:

```javascript
// In the Angular MFE
window.parent.postMessage({
  type: 'MFE_EVENT',
  data: { action: 'navigate', path: '/home' }
}, 'http://localhost:4200');
```

### Listening for Messages:

```javascript
// In the shell
window.addEventListener('message', (event) => {
  if (event.origin !== 'http://localhost:4201') return;
  
  console.log('Message from MFE:', event.data);
  
  if (event.data.type === 'MFE_EVENT') {
    // Handle MFE event
  }
});
```

## Production Considerations

### 1. CORS Configuration

Ensure the MFE server allows iframe embedding:

```javascript
// In MFE server
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'ALLOW-FROM http://localhost:4200');
  // Or use Content-Security-Policy
  res.setHeader('Content-Security-Policy', "frame-ancestors 'self' http://localhost:4200");
  next();
});
```

### 2. URL Configuration

For production, update the MFE URLs:

```javascript
const mfeUrls = {
  'mfe1': process.env.MFE1_URL || 'https://mfe1.production.com'
};
```

### 3. Loading States

The iframe approach includes:
- Loading spinner while iframe loads
- Error handling if iframe fails to load
- Proper cleanup on navigation

### 4. Responsive Sizing

The iframe automatically adjusts to container size:

```css
#mfe-container iframe {
  width: 100%;
  min-height: 600px;
  border: none;
}
```

## Alternative Approaches

If the iframe approach doesn't meet your needs:

### 1. Use the Angular Shell
The Angular shell at `shell/` fully supports Native Federation and is production-ready.

### 2. Rebuild MFE with Webpack Module Federation
Convert MFE1 to use standard Module Federation instead of Native Federation.

### 3. Create a Vanilla JS MFE
Build a new microfrontend in vanilla JS that can be loaded via Module Federation.

### 4. Web Components
Wrap the Angular MFE as a Web Component for better integration.

## Testing the Iframe Approach

1. **Start MFE1:**
   ```bash
   cd mfe1
   npm start
   ```
   MFE1 runs on http://localhost:4201

2. **Start Vanilla Shell:**
   ```bash
   cd shell-vanilla
   npm run dev
   ```
   Shell runs on http://localhost:4200

3. **Navigate to MFE1:**
   - Open http://localhost:4200
   - Click "MFE1 Dashboard" in navigation
   - The Angular app loads in an iframe

## Troubleshooting

### Iframe Not Loading

**Check MFE is running:**
```bash
curl http://localhost:4201
```

**Check browser console** for CORS or X-Frame-Options errors

**Verify iframe src:**
```javascript
console.log(iframe.src); // Should be http://localhost:4201
```

### Blank Iframe

- Check MFE server is responding
- Look for JavaScript errors in iframe (open iframe in new tab)
- Verify MFE routes are configured correctly

### Communication Issues

- Verify `postMessage` origins match exactly
- Check both shell and MFE are listening for messages
- Use browser DevTools to inspect message events

## Conclusion

The iframe approach is a **pragmatic solution** that allows the vanilla shell to display Angular microfrontends without complex module resolution. While it has limitations compared to true Module Federation, it's simple, reliable, and works immediately.

For production applications requiring deep integration, consider using the Angular shell instead.
