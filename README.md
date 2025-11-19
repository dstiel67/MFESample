# Angular v20 Microfrontend with Module Federation and SSR

This project demonstrates a microfrontend architecture using Angular v20, Native Federation, and Server-Side Rendering.

## Architecture

- **Shell** (Host): Main container application running on port 4200
- **MFE1** (Remote): Microfrontend module running on port 4201

Both applications support SSR and use Native Federation for module sharing.

## Getting Started

### Development Mode (Client-Side)

#### 1. Start the Remote (MFE1)

```bash
cd mfe1
npm start
```

The remote will be available at http://localhost:4201

#### 2. Start the Shell (Host)

In a new terminal:

```bash
cd shell
npm start
```

The shell will be available at http://localhost:4200

### Production Mode with SSR

#### 1. Build and serve MFE1 with SSR

```bash
cd mfe1
npm run build
npm run serve:ssr:mfe1
```

#### 2. Build and serve Shell with SSR

In a new terminal:

```bash
cd shell
npm run build
npm run serve:ssr:shell
```

## Features

- ✅ Angular v20 with zoneless architecture
- ✅ Native Federation for module sharing
- ✅ Server-Side Rendering (SSR) enabled
- ✅ Dynamic remote loading
- ✅ Lazy loading with routing
- ✅ CORS configured for SSR

## Project Structure

```
.
├── shell/                 # Host application
│   ├── src/
│   │   ├── app/
│   │   │   ├── home/     # Home component
│   │   │   └── app.routes.ts
│   │   ├── bootstrap.ts
│   │   └── server.ts
│   ├── federation.config.js
│   └── public/federation.manifest.json
│
└── mfe1/                  # Remote application
    ├── src/
    │   ├── app/
    │   │   ├── features/
    │   │   │   └── dashboard/
    │   │   └── app.routes.ts
    │   ├── bootstrap.ts
    │   └── server.ts
    └── federation.config.js
```

## How It Works

1. **Shell App**: Acts as the host and loads remote modules dynamically
2. **MFE1**: Exposes its routes via Native Federation
3. **Federation Manifest**: Maps remote names to their entry points
4. **SSR Support**: Both apps can be rendered on the server

## Navigation

- `/home` - Shell's home page
- `/mfe1` - Loads the MFE1 dashboard component

## Development

### Build for Production

```bash
# Build MFE1
cd mfe1
npm run build

# Build Shell
cd shell
npm run build
```

### SSR Production

```bash
# Serve MFE1 with SSR
cd mfe1
npm run serve:ssr:mfe1

# Serve Shell with SSR
cd shell
npm run serve:ssr:shell
```

## Key Configuration Files

- `federation.config.js` - Native Federation configuration
- `federation.manifest.json` - Remote module mappings
- `bootstrap.ts` - Application bootstrap with federation
- `bootstrap-server.ts` - SSR bootstrap configuration
