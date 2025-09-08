// filepath: /Users/mac/junaidAfzal/Zaki-s-Essence/scripts/prebuild-hide-public-index.js
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.resolve(__dirname, '..', 'public');
const SRC = path.join(PUBLIC_DIR, 'index.html');
const HIDDEN = path.join(PUBLIC_DIR, '__index.hidden');

async function exists(p) {
    try { await fs.access(p); return true; } catch { return false; }
}

async function main() {
    const hasIndex = await exists(SRC);
    if (!hasIndex) {
        console.log('[prebuild] No public/index.html found, nothing to hide.');
        return;
    }
    // If already hidden, skip
    if (await exists(HIDDEN)) {
        console.log('[prebuild] public/__index.hidden already exists.');
        return;
    }
    await fs.rename(SRC, HIDDEN);
    console.log('[prebuild] Renamed public/index.html -> public/__index.hidden');
}

main().catch((e) => { console.error('[prebuild] Error hiding public/index.html:', e); process.exit(1); });
