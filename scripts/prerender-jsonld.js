// filepath: /Users/mac/junaidAfzal/Zaki-s-Essence/scripts/prerender-jsonld.js
// Build-time prerender for product JSON-LD and head tags
// - Reads dist/index.html as a template
// - Loads products from src/products.js (fallback source)
// - Writes dist/products/{id}/index.html with injected Product JSON-LD and meta

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.resolve(__dirname, '..', 'dist');
const TEMPLATE_PATH = path.join(DIST_DIR, 'index.html');
const BASE_URL = 'https://zakisessence.pk';
const SITEMAP_PATH = path.join(DIST_DIR, 'sitemap.xml');

function slugify(str) {
    return String(str || '')
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function getProductSegment(product) {
    if (product?.slug) return String(product.slug);
    if (product?.name) {
        const s = slugify(product.name);
        if (s) return s;
    }
    return String(product?.id ?? 'item');
}

async function ensureDir(dir) {
    await fs.mkdir(dir, { recursive: true });
}

function toJsonLd(product) {
    // Derive a price from variantPricing (min) if available, else fallback
    let price = undefined;
    if (product?.variantPricing && typeof product.variantPricing === 'object') {
        const values = Object.values(product.variantPricing).map(Number).filter(v => !Number.isNaN(v));
        if (values.length) price = Math.min(...values).toFixed(2);
    }

    const segment = product.__segment || getProductSegment(product);

    return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description,
        image: product.image ? [product.image] : (product.images || []),
        brand: {
            '@type': 'Brand',
            name: "Zaki's Essence",
        },
        category: product.category || 'Fragrance',
        offers: {
            '@type': 'Offer',
            price: price ?? product.price ?? undefined,
            priceCurrency: 'PKR',
            availability: 'https://schema.org/InStock',
            url: `${BASE_URL}/products/${segment}`,
            seller: {
                '@type': 'Organization',
                name: "Zaki's Essence",
            },
        },
        sku: String(product.sku || product.id),
        mpn: String(product.mpn || product.id),
    };
}

function injectBeforeHeadClose(html, snippet) {
    return html.replace(/\n?<\/head>/i, `${snippet}\n</head>`);
}

function replaceTagContent(html, tagName, newContent) {
    const re = new RegExp(`<${tagName}[^>]*>[\\s\\S]*?</${tagName}>`, 'i');
    if (re.test(html)) return html.replace(re, `<${tagName}>${newContent}</${tagName}>`);
    // Insert into head if missing
    return html.replace(/<head[^>]*>/i, (m) => `${m}\n<${tagName}>${newContent}</${tagName}>`);
}

function upsertLinkCanonical(html, href) {
    const linkRe = /<link\s+rel=["']canonical["'][^>]*>/i;
    const tag = `<link rel="canonical" href="${href}" />`;
    if (linkRe.test(html)) return html.replace(linkRe, tag);
    return html.replace(/<head[^>]*>/i, (m) => `${m}\n${tag}`);
}

function upsertMeta(html, attr, name, content) {
    const re = new RegExp(`<meta\\s+${attr}=["']${name}["'][^>]*>`, 'i');
    const tag = `<meta ${attr}="${name}" content="${content}" />`;
    if (re.test(html)) return html.replace(re, tag);
    return html.replace(/<head[^>]*>/i, (m) => `${m}\n${tag}`);
}

function applyProductHead(html, product) {
    const segment = getProductSegment(product);
    const url = `${BASE_URL}/products/${segment}`;
    const title = `${product.name} - Premium Fragrance | Zaki's Essence`;
    const description = product.description?.slice(0, 300) || `Discover ${product.name} at Zaki's Essence.`;
    const image = product.image || (Array.isArray(product.images) ? product.images[0] : undefined) || `${BASE_URL}/logo_bg.jpg`;

    let out = html;
    out = replaceTagContent(out, 'title', title);
    out = upsertLinkCanonical(out, url);

    // Basic meta
    out = upsertMeta(out, 'name', 'description', description);

    // Open Graph
    out = upsertMeta(out, 'property', 'og:title', title);
    out = upsertMeta(out, 'property', 'og:description', description);
    out = upsertMeta(out, 'property', 'og:url', url);
    out = upsertMeta(out, 'property', 'og:image', image);

    // Twitter
    out = upsertMeta(out, 'property', 'twitter:title', title);
    out = upsertMeta(out, 'property', 'twitter:description', description);
    out = upsertMeta(out, 'property', 'twitter:image', image);
    out = upsertMeta(out, 'property', 'twitter:url', url);

    // JSON-LD
    const jsonLd = toJsonLd({ ...product, __segment: segment });
    const ldScript = `\n<script type="application/ld+json">\n${JSON.stringify(jsonLd, null, 2)}\n</script>`;
    out = injectBeforeHeadClose(out, ldScript);

    return out;
}

function toIsoDate(value, fallback) {
    try {
        if (!value) return fallback;
        if (typeof value === 'string') return value.slice(0, 10);
        if (value instanceof Date) return value.toISOString().slice(0, 10);
        if (typeof value?.toDate === 'function') return value.toDate().toISOString().slice(0, 10);
        return fallback;
    } catch {
        return fallback;
    }
}

async function loadProductsFromFirestoreAdmin() {
    if (!process.env.PRERENDER_FIREBASE) return null;
    try {
        const admin = (await import('firebase-admin')).default ?? (await import('firebase-admin'));

        // Initialize credentials
        if (!admin.apps?.length) {
            let credential;
            if (process.env.PRERENDER_FIREBASE_SA_JSON) {
                credential = admin.credential.cert(JSON.parse(process.env.PRERENDER_FIREBASE_SA_JSON));
            } else if (process.env.PRERENDER_FIREBASE_SA_B64) {
                const json = Buffer.from(process.env.PRERENDER_FIREBASE_SA_B64, 'base64').toString('utf8');
                credential = admin.credential.cert(JSON.parse(json));
            } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
                // firebase-admin will read the file path automatically
                credential = admin.credential.applicationDefault();
            } else {
                console.warn('PRERENDER_FIREBASE is set but no service account credentials found.');
                return null;
            }
            admin.initializeApp({ credential });
        }

        const firestore = (await import('firebase-admin/firestore')).getFirestore?.() ?? admin.firestore();
        const snapshot = await firestore
            .collection('products')
            .orderBy('createdAt', 'desc')
            .get();
        const products = snapshot.docs.map(d => {
            const data = d.data();
            return {
                id: d.id,
                ...data,
                // Normalize timestamps for sitemap
                updatedAt: data.updatedAt ?? data.updated_at ?? null,
            };
        });
        console.log(`Loaded ${products.length} products from Firestore (Admin)`);
        return products;
    } catch (e) {
        console.warn('Failed to load products via Firestore Admin:', e.message);
        return null;
    }
}

async function loadProducts() {
    // Prefer external API if provided (for CI/live data)
    const apiUrl = process.env.PRERENDER_PRODUCTS_URL;
    if (apiUrl) {
        try {
            const res = await fetch(apiUrl, { headers: { 'accept': 'application/json' } });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            if (Array.isArray(data)) return data;
            if (Array.isArray(data?.products)) return data.products;
            console.warn('API returned unexpected shape, falling back to other sources.');
        } catch (e) {
            console.warn('Failed to fetch products from API:', e.message);
        }
    }

    // Try Firestore Admin if enabled
    const fromFs = await loadProductsFromFirestoreAdmin();
    if (fromFs && fromFs.length) return fromFs;

    // Fallback to local static products
    try {
        const mod = await import(path.resolve(__dirname, '..', 'src', 'products.js'));
        if (Array.isArray(mod.products)) return mod.products;
        if (Array.isArray(mod.default)) return mod.default;
    } catch (e) {
        console.warn('Could not import src/products.js, falling back to empty list. Error:', e.message);
    }
    return [];
}

function buildSitemapEntry(loc, lastmodIso) {
    return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmodIso}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`;
}

async function readFileIfExists(p) {
    try {
        return await fs.readFile(p, 'utf8');
    } catch {
        return null;
    }
}

async function updateSitemap(products) {
    const today = new Date().toISOString().split('T')[0];

    const entries = products.map(p =>
        buildSitemapEntry(
            `${BASE_URL}/products/${getProductSegment(p)}`,
            toIsoDate(p.updatedAt || p.updated_at || p.lastModified, today)
        )
    ).join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
        `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
        `${entries}\n</urlset>\n`;

    await fs.writeFile(SITEMAP_PATH, xml, 'utf8');
    console.log('✅ Sitemap regenerated with all product URLs');
}

async function main() {
    // Ensure template exists
    const exists = await fs
        .access(TEMPLATE_PATH)
        .then(() => true)
        .catch(() => false);
    if (!exists) {
        console.error('dist/index.html not found. Run `vite build` first.');
        process.exit(1);
    }

    const template = await fs.readFile(TEMPLATE_PATH, 'utf8');
    const products = await loadProducts();

    if (!products.length) {
        console.warn('No products found to prerender. Skipping.');
        return;
    }

    for (const product of products) {
        const segment = getProductSegment(product);
        const dir = path.join(DIST_DIR, 'products', segment);
        await ensureDir(dir);

        const html = applyProductHead(template, product);
        const outPath = path.join(dir, 'index.html');
        await fs.writeFile(outPath, html, 'utf8');
        console.log('Prerendered:', outPath);
    }

    // Update sitemap
    await updateSitemap(products);

    console.log(`Done. Generated ${products.length} product pages with JSON-LD.`);
}

main().catch((err) => {
    console.error('Prerender failed:', err);
    process.exit(1);
});
