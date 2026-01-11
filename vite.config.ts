import { resolve } from 'node:path';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  // Set base to your repository name for GitHub Pages (e.g., '/friendly/')
  // Leave as '/' for custom domain or local development
  base: process.env.GITHUB_ACTIONS ? '/friendly/' : '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ramda: ['ramda'],
        },
      },
    },
  },
});
