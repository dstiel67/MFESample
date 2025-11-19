# Quick Start Guide

## 🚀 Running the Microfrontend Solution

### Option 1: Development Mode (Recommended for testing)

Open two terminal windows:

**Terminal 1 - Start MFE1 (Remote):**
```bash
cd mfe1
npm start
```
Wait for "Application bundle generation complete" message.

**Terminal 2 - Start Shell (Host):**
```bash
cd shell
npm start
```

Then open your browser to:
- Shell: http://localhost:4200
- MFE1: http://localhost:4201

### Option 2: Production with SSR

**Terminal 1 - Build and serve MFE1:**
```bash
cd mfe1
npm run build
npm run serve:ssr:mfe1
```

**Terminal 2 - Build and serve Shell:**
```bash
cd shell
npm run build
npm run serve:ssr:shell
```

## 🧪 Testing the Setup

1. Navigate to http://localhost:4200
2. You should see the Shell home page
3. Click "Load MFE1" button
4. The MFE1 Dashboard component should load dynamically
5. Notice the live clock in the MFE1 component

## 🔍 What to Look For

- **Module Federation**: MFE1 is loaded dynamically from a separate application
- **SSR Support**: Both apps can render on the server
- **Lazy Loading**: MFE1 routes are loaded on demand
- **Zoneless**: Both apps use Angular's new zoneless architecture
- **Native Federation**: Uses the latest Native Federation instead of Webpack Module Federation

## 📝 Key Files to Explore

- `shell/public/federation.manifest.json` - Maps remote modules
- `mfe1/federation.config.js` - Exposes MFE1 routes
- `shell/src/app/app.routes.ts` - Loads remote module dynamically
- `mfe1/src/app/features/dashboard/` - The exposed component

## 🐛 Troubleshooting

**Issue**: Shell can't load MFE1
- Make sure MFE1 is running on port 4201
- Check browser console for errors
- Verify `federation.manifest.json` has correct URL

**Issue**: SSR not working
- Make sure you built both apps first (`npm run build`)
- Check that server.mjs files exist in dist folders
- Verify ports 4200 and 4201 are not in use

**Issue**: CORS errors
- CORS is automatically configured by Native Federation
- Check that both apps are running on localhost
