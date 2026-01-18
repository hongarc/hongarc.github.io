/// <reference types="vitest" />
import { execSync } from 'node:child_process';
import { resolve } from 'node:path';

import rendererPuppeteer from '@prerenderer/renderer-puppeteer';
import prerender from '@prerenderer/rollup-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Get git commit hash for build info
const getGitHash = () => {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim();
  } catch {
    return 'unknown';
  }
};

// Base path: always '/' (root deployment)
const base = '/';

// Routes for pre-rendering (must match plugin IDs)
const routes = [
  '/',
  '/json',
  '/data',
  '/sql',
  '/base64',
  '/url-encode',
  '/escape',
  '/regex',
  '/json-to-ts',
  '/qr',
  '/timestamp',
  '/objectid',
  '/jwt',
  '/url-parse',
  '/color',
  '/cron',
  '/chmod',
  '/hash',
  '/password',
  '/case',
  '/diff',
  '/uuid',
  '/slug',
  '/word-count',
  '/lines',
  '/lorem',
  '/html-entity',
  '/base',
  '/number',
];

export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    // Pre-render all routes for SEO
    prerender({
      routes,
      renderer: new rendererPuppeteer({
        renderAfterTime: 500,
        headless: true,
      }),
    }),
  ],
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __GIT_HASH__: JSON.stringify(getGitHash()),
    __BUILD_ENV__: JSON.stringify(process.env.GITHUB_ACTIONS ? 'github-pages' : 'local'),
  },
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
  test: {
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'src/__tests__/**',
        'src/components/**',
        'src/plugins/**',
        '**/*.d.ts',
        '**/*.test.ts',
        'vite.config.ts',
        'tailwind.config.js',
      ],
      // Enforce high coverage
      statements: 90,
      branches: 80,
      functions: 90,
    },
  },
});
