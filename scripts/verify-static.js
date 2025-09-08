// filepath: /Users/mac/junaidAfzal/Zaki-s-Essence/scripts/verify-static.js
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.resolve(__dirname, '..', 'dist');
const REQUIRED = ['index.html', 'sitemap.xml', 'robots.txt'];

async function exists(p) {
    try { await fs.access(p); return true; } catch { return false; }
}

async function main() {
    let ok = true;
    for (const f of REQUIRED) {
        const p = path.join(DIST_DIR, f);
        const has = await exists(p);
        if (!has) {
            console.error(`[verify-static] Missing: ${f} in dist/`);
            ok = false;
        } else {
            console.log(`[verify-static] OK: ${f}`);
        }
    }
    if (!ok) process.exit(1);
    console.log('[verify-static] All required static files present.');
}

main().catch((e) => { console.error('[verify-static] Error:', e); process.exit(1); });
