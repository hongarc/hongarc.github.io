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

// Prerendering all 29 routes through puppeteer is ~93% of build time. It is
// required for the deployed site's SEO, but skippable when you just need to
// check a bundle locally: SKIP_PRERENDER=1 npm run build
const skipPrerender = process.env.SKIP_PRERENDER === '1';

export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    // Pre-render all routes for SEO
    ...(skipPrerender
      ? []
      : [
          prerender({
            routes,
            renderer: new rendererPuppeteer({
              renderAfterTime: 500,
              headless: true,
            }),
            /**
             * While a route is being prerendered, on-demand chunks (Firebase, Prism,
             * …) start loading and Vite injects a <link rel="modulepreload"> for each
             * one, pointing at the prerender server's own origin. Serialised into the
             * static HTML those links 404 for real visitors, and preloading them would
             * defeat the point of loading those chunks on demand — so drop them.
             * Build-time preload links are root-relative and are left untouched.
             */
            postProcess(renderedRoute) {
              renderedRoute.html = renderedRoute.html.replaceAll(
                /<link\b[^>]*\brel="modulepreload"[^>]*\bhref="https?:\/\/[^"]*"[^>]*>/g,
                ''
              );
            },
          }),
        ]),
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
    rolldownOptions: {
      output: {
        // Rolldown (Vite 8) replaces the object form of manualChunks with codeSplitting
        // groups. Order matters: earlier groups win ties, which is what keeps the
        // shared Firebase core out of the Firestore chunk below.
        codeSplitting: {
          groups: [
            {
              name: 'vendor',
              test: /node_modules[/\\](react|react-dom|react-router|react-router-dom|scheduler)[/\\]/,
            },
            { name: 'ramda', test: /node_modules[/\\]ramda[/\\]/ },
            // Firebase is loaded on demand (see src/lib/firebase.ts). Naming the
            // groups keeps the build output readable and each SDK separately
            // cacheable — Firestore alone is bigger than everything else.
            // Each SDK must include its own `firebase/<sdk>` facade module. Lumping
            // the facades together puts auth's and firestore's re-exports in the
            // same chunk as app's, which makes importing firebase/app statically
            // pull both — ~490 kB fetched on every visit, signed in or not.
            // The shared core (util/app/component/logger) must be claimed BEFORE the
            // SDK groups. Left unclaimed it lands in whichever SDK chunk is built
            // first — Firestore — and then auth and analytics statically import
            // that chunk, dragging all 972 kB of Firestore into every visit.
            {
              name: 'firebase-app',
              test: /node_modules[/\\](@firebase[/\\](app|util|component|logger)|idb)[/\\]/,
            },
            {
              name: 'firebase-firestore',
              test: /node_modules[/\\](@firebase[/\\](firestore|webchannel-wrapper)|firebase[/\\]firestore)/,
            },
            {
              name: 'firebase-auth',
              test: /node_modules[/\\](@firebase[/\\]auth|firebase[/\\]auth)/,
            },
            {
              name: 'firebase-analytics',
              test: /node_modules[/\\](@firebase[/\\](analytics|installations)|firebase[/\\]analytics)/,
            },
            { name: 'firebase-misc', test: /node_modules[/\\](@firebase|firebase)[/\\]/ },
            // Rolldown names a chunk after its entry file, which turns these
            // on-demand libraries into 'esm', 'lib', 'browser'… Naming them by
            // package keeps the build output diagnosable. Each group includes
            // that package's own dependencies so the chunk count is unchanged.
            { name: 'sql-formatter', test: /node_modules[/\\](sql-formatter|nearley)[/\\]/ },
            { name: 'hash-wasm', test: /node_modules[/\\]hash-wasm[/\\]/ },
            { name: 'jsqr', test: /node_modules[/\\]jsqr[/\\]/ },
            { name: 'qrcode', test: /node_modules[/\\](qrcode|dijkstrajs)[/\\]/ },
            { name: 'jsonpath-plus', test: /node_modules[/\\]jsonpath-plus[/\\]/ },
            { name: 'text-diff', test: /node_modules[/\\]diff[/\\]/ },
            { name: 'marked', test: /node_modules[/\\]marked[/\\]/ },
            { name: 'yaml', test: /node_modules[/\\]yaml[/\\]/ },
            {
              name: 'querystring',
              test: /node_modules[/\\](qs|object-inspect|side-channel|side-channel-list|side-channel-map|side-channel-weakmap|get-intrinsic|get-proto|gopd|call-bind-apply-helpers|call-bound|dunder-proto|es-define-property|es-errors|es-object-atoms|function-bind|has-symbols|hasown|math-intrinsics)[/\\]/,
            },
          ],
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
