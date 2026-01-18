#!/usr/bin/env node
import { execSync, spawn } from 'node:child_process';
import { existsSync, statSync, writeFileSync } from 'node:fs';

// Routes to test (from vite.config.ts)
const routes = [
  '/',
  '/json',
  '/hash',
  '/uuid',
  '/base64',
  '/password',
  '/jwt',
  '/timestamp',
];

const PORT = 4173;
const BASE_URL = `http://localhost:${PORT}`;
const SKIP_BUILD = process.argv.includes('--skip-build');

// Check if dist exists and is recent (less than 5 min old)
const shouldBuild = () => {
  if (SKIP_BUILD) return false;
  if (!existsSync('dist/index.html')) return true;
  const stat = statSync('dist/index.html');
  const ageMinutes = (Date.now() - stat.mtimeMs) / 1000 / 60;
  return ageMinutes > 5;
};

if (shouldBuild()) {
  console.log('🔨 Building app...');
  execSync('npm run build', { stdio: 'inherit' });
} else {
  console.log('⚡ Using existing build (use --skip-build to force skip)');
}

console.log('\n🚀 Starting server...');
const server = spawn('npx', ['serve', 'dist', '-l', String(PORT)], {
  stdio: 'pipe',
  detached: true,
});

// Wait for server to start
await new Promise((resolve) => setTimeout(resolve, 2000));

const results = [];

try {
  for (const route of routes) {
    const url = `${BASE_URL}${route}`;
    console.log(`\n📊 Testing ${route}...`);

    try {
      const output = execSync(
        `npx lighthouse ${url} --output=json --chrome-flags="--headless" 2>/dev/null`,
        { encoding: 'utf-8', maxBuffer: 50 * 1024 * 1024 }
      );

      const data = JSON.parse(output);
      const scores = {
        route,
        performance: Math.round(data.categories.performance.score * 100),
        accessibility: Math.round(data.categories.accessibility.score * 100),
        bestPractices: Math.round(data.categories['best-practices'].score * 100),
        seo: Math.round(data.categories.seo.score * 100),
      };

      // Collect failed audits
      const issues = [];
      for (const category of ['accessibility', 'seo', 'best-practices']) {
        const audits = data.categories[category].auditRefs
          .map((ref) => data.audits[ref.id])
          .filter((a) => a.score !== null && a.score < 1);
        for (const audit of audits) {
          issues.push({ category, title: audit.title, score: audit.score });
        }
      }
      scores.issues = issues;

      results.push(scores);

      const perfColor = scores.performance >= 90 ? '🟢' : scores.performance >= 50 ? '🟡' : '🔴';
      const a11yColor = scores.accessibility >= 90 ? '🟢' : scores.accessibility >= 50 ? '🟡' : '🔴';
      const bpColor = scores.bestPractices >= 90 ? '🟢' : scores.bestPractices >= 50 ? '🟡' : '🔴';
      const seoColor = scores.seo >= 90 ? '🟢' : scores.seo >= 50 ? '🟡' : '🔴';

      console.log(
        `   ${perfColor} Perf: ${scores.performance} | ${a11yColor} A11y: ${scores.accessibility} | ${bpColor} Best: ${scores.bestPractices} | ${seoColor} SEO: ${scores.seo}`
      );

      // Show issues if any
      if (issues.length > 0) {
        const criticalIssues = issues.filter((i) => i.score === 0);
        if (criticalIssues.length > 0) {
          console.log(`   ⚠️  Issues: ${criticalIssues.map((i) => i.title).join(', ')}`);
        }
      }
    } catch (error) {
      console.log(`   ❌ Failed to test ${route}: ${error.message}`);
      results.push({ route, error: true });
    }
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('📋 SUMMARY');
  console.log('='.repeat(80));
  console.log(
    'Route'.padEnd(20) +
      'Perf'.padStart(8) +
      'A11y'.padStart(8) +
      'Best'.padStart(8) +
      'SEO'.padStart(8)
  );
  console.log('-'.repeat(52));

  for (const r of results) {
    if (r.error) {
      console.log(`${r.route.padEnd(20)}${'FAIL'.padStart(8)}`);
    } else {
      console.log(
        `${r.route.padEnd(20)}${String(r.performance).padStart(8)}${String(r.accessibility).padStart(8)}${String(r.bestPractices).padStart(8)}${String(r.seo).padStart(8)}`
      );
    }
  }

  // Save results
  writeFileSync('lighthouse-report.json', JSON.stringify(results, null, 2));
  console.log('\n✅ Results saved to lighthouse-report.json');
} finally {
  // Kill server
  console.log('\n🛑 Stopping server...');
  process.kill(-server.pid);
}
