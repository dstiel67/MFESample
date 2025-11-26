import { defineConfig } from 'vite';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    federation({
      name: 'shell',
      remotes: {
        mfe1: 'http://localhost:4201/remoteEntry.json'
      },
      shared: []  // No shared dependencies needed
    })
  ],
  server: {
    port: 4200,
    strictPort: true
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',  // Enable minification for production
    cssCodeSplit: true,  // Split CSS for better caching
    sourcemap: false,  // Disable sourcemaps for production (can be enabled if needed)
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          'router': ['./src/router.js'],
          'mfe-loader': ['./src/mfe-loader.js'],
          'navigation': ['./src/navigation.js']
        },
        // Asset file naming
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js'
      }
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    // Output directory
    outDir: 'dist',
    // Empty output directory before build
    emptyOutDir: true,
    // Copy public directory to dist
    copyPublicDir: true
  },
  preview: {
    port: 4200,
    strictPort: true
  }
});
