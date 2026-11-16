import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    port: 3000,
    host: true
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      // Two independent pages: the product (index.html) and the isolated
      // walkthrough demo (demo.html). They share components, never state.
      input: {
        main: resolve(__dirname, 'index.html'),
        demo: resolve(__dirname, 'demo.html'),
      },
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-livekit': ['livekit-client', '@livekit/components-react'],
          'vendor-icons': ['lucide-react'],
        },
      },
    },
  },
});
