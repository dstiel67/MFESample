import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    // Note: We're not using @originjs/vite-plugin-federation because
    // Angular Native Federation uses a different format.
    // Instead, we load Native Federation modules manually in mfe-loader.js
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
