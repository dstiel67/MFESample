# MFE1 Integration Guide

## Overview

The vanilla shell successfully integrates with Angular MFE1 using Module Federation. This document explains how the integration works.

## Integration Flow

### 1. Module Federation Configuration

The shell is configured in `vite.config.js` to load MFE1 as a remote:

```javascript
remotes: {
  mfe1: 'http://localhost:4201/remoteEntry.json'
}
```

### 2. Dynamic Import

When a user navigates to `/mfe1`, the `mfe-loader.js` dynamically imports the remote module:

```javascript
const module = await import('mfe1/bootstrap');
```

This imports the `bootstrap.ts` file from MFE1, which exposes a `mount` function.

### 3. Mount Function Call

The loader calls MFE1's mount function with the container element:

```javascript
const result = await mountFn(container, options);
```

MFE1's mount function:
- Creates an `<app-root>` element
- Bootstraps the Angular application
- Returns an object with an `unmount` function

### 4. Lifecycle Management

The loader stores the unmount function and calls it when:
- Navigating away from the MFE route
- Loading a different MFE
- Cleaning up resources

### 5. Error Handling

If loading fails, the shell:
- Catches the error
- Displays a user-friendly error message
- Maintains shell stability
- Logs detailed error information to console

## Requirements Validation

This integration satisfies the following requirements:

- **Requirement 2.1**: Fetches remote entry point from configured URL
- **Requirement 2.2**: Bootstraps Angular application in designated container
- **Requirement 2.3**: Properly unmounts previous MFE before mounting new one
- **Requirement 2.4**: Displays error message and maintains stability on failure

## Testing the Integration

1. Start MFE1: `cd mfe1 && npm start` (port 4201)
2. Start Shell: `cd shell-vanilla && npm run dev` (port 4200)
3. Navigate to http://localhost:4200
4. Click "MFE1 Dashboard" in navigation
5. Verify Angular dashboard loads successfully
6. Navigate back to home and verify cleanup

## Troubleshooting

### MFE fails to load

- Ensure MFE1 is running on port 4201
- Check browser console for CORS errors
- Verify `remoteEntry.json` is accessible at http://localhost:4201/remoteEntry.json

### Module not found error

- Verify MFE1's `federation.config.js` exposes `./bootstrap`
- Check that MFE1's `bootstrap.ts` exports a `mount` function
- Ensure both servers are running

### Cleanup issues

- Check that MFE1's mount function returns an unmount method
- Verify unmount properly destroys the Angular application
- Look for memory leaks in browser dev tools
