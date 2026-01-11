import { resolve } from 'node:path';

import rendererPuppeteer from '@prerenderer/renderer-puppeteer';
import prerender from '@prerenderer/rollup-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// All tool routes for pre-rendering
const routes = [
  '/',
  '/json-formatter',
  '/data-converter',
  '/sql-formatter',
  '/base64-encoder',
  '/url-encoder',
  '/string-escape',
  '/regex-tester',
  '/json-to-ts',
  '/qr-generator',
  '/timestamp-converter',
  '/jwt-decoder',
  '/url-parser',
  '/color-converter',
  '/cron-parser',
  '/chmod-calculator',
  '/hash-generator',
  '/password-generator',
  '/case-converter',
  '/text-diff',
  '/uuid-generator',
  '/slug-generator',
  '/word-counter',
  '/line-tools',
  '/lorem-ipsum',
  '/html-entity',
  '/base-converter',
  '/number-formatter',
];

export default defineConfig({
  // Set base to your repository name for GitHub Pages (e.g., '/friendly/')
  // Leave as '/' for custom domain or local development
  base: process.env.GITHUB_ACTIONS ? '/friendly/' : '/',
  plugins: [
    react(),
    tailwindcss(),
    // Pre-render routes for SEO
    prerender({
      routes,
      renderer: new rendererPuppeteer({
        renderAfterTime: 500,
        headless: true,
      }),
    }),
  ],
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
