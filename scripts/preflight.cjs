#!/usr/bin/env node
// Pawprint Network — Pre-flight build check
const fs = require('fs');
const path = require('path');
const RED = '\x1b[31m'; const GREEN = '\x1b[32m'; const YELLOW = '\x1b[33m'; const RESET = '\x1b[0m';
let failed = false;

function checkFile(file, checks) {
  const full = path.join(process.cwd(), file);
  if (!fs.existsSync(full)) {
    console.error(`${RED}✗ FAIL${RESET}  ${file} — FILE NOT FOUND\n`);
    failed = true;
    return;
  }
  const lines = fs.readFileSync(full, 'utf8').split('\n');
  const codeOnly = lines
    .filter(l => !l.trim().startsWith('//') && !l.trim().startsWith('*'))
    .join('\n');
  for (const { pattern, message } of checks) {
    if (pattern.test(codeOnly)) {
      console.error(`${RED}✗ FAIL${RESET}  ${file}\n      ${message}\n`);
      failed = true;
    }
  }
}

function checkExists(file, label) {
  const full = path.join(process.cwd(), file);
  if (!fs.existsSync(full)) {
    console.error(`${RED}✗ FAIL${RESET}  ${label} not found at ${file}\n`);
    failed = true;
  } else {
    console.log(`${GREEN}✓${RESET}  ${label} present`);
  }
}

// ── Checks ────────────────────────────────────────────────────────────────

checkFile('server.ts', [
  { pattern: /fileURLToPath/,     message: 'fileURLToPath is ESM-only — crashes the CJS build. Remove it.' },
  { pattern: /import\.meta\.url/, message: 'import.meta.url is ESM-only — crashes the CJS build. Remove it.' },
  { pattern: /const __dirname\s*=/, message: '__dirname via fileURLToPath is ESM-only. Remove it.' },
]);

checkExists('public/pawprint_landing.html', 'Landing page');
checkExists('public/icons/instameow-icon.png', 'instameow icon');
checkExists('public/icons/instawoof-icon.png', 'instawoof icon');

// ── Result ────────────────────────────────────────────────────────────────

if (failed) {
  console.error(`\n${RED}Pre-flight FAILED — fix the above before deploying.${RESET}`);
  process.exit(1);
} else {
  console.log(`\n${GREEN}✓ Pre-flight passed — safe to build.${RESET}`);
}
