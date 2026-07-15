/**
 * startup.cjs — CommonJS startup wrapper
 *
 * This file MUST be set as the "Application startup file" in cPanel's
 * Setup Node.js App (instead of app.js).
 *
 * Because this is CommonJS (.cjs), all process.env assignments run
 * SYNCHRONOUSLY before the ESM app.js is dynamically imported.
 * This ensures DATABASE_URL is available before Prisma initializes.
 */

'use strict';

const fs = require('fs');
const path = require('path');

// --- Load .env file manually (synchronous, before ESM import) ---
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    process.env[key] = val; // Force overwrite env from .env file
  }
  console.log('[startup] Loaded .env file from:', envPath);
} else {
  console.log('[startup] No .env file found, using cPanel environment variables');
}

console.log('[startup] DATABASE_URL is', process.env.DATABASE_URL ? 'SET' : 'MISSING');
console.log('[startup] Starting app.js...');

// --- Dynamically import the ESM app AFTER all env vars are set ---
import('./app.js').catch((err) => {
  console.error('[startup] Failed to start app:', err);
  process.exit(1);
});
