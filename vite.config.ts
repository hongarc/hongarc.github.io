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

// Base path: '/' for local, '/friendly/' for GitHub Pages
const base = process.env.GITHUB_ACTIONS ? '/friendly/' : '/';

// Routes for pre-rendering (only works when base is '/')
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
  base,
  plugins: [
    react(),
    tailwindcss(),
    // Pre-render only for local builds (base '/')
    // GitHub Pages subdirectory deployment has base path issues with prerenderer
    ...(base === '/'
      ? [
          prerender({
            routes,
            renderer: new rendererPuppeteer({
              renderAfterTime: 500,
              headless: true,
            }),
          }),
        ]
      : []),
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
});
