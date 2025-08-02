import React, { useEffect, useState } from 'react';
import SEOService from '../services/seoService';

// Sitemap generator component
const SitemapGenerator = () => {
    const [sitemapXML, setSitemapXML] = useState('');

    useEffect(() => {
        generateSitemap();
    }, []);

    const generateSitemap = async () => {
        try {
            // You would fetch actual products and collections from your database
            const products = []; // await ProductService.getAllProducts();
            const collections = []; // await CollectionService.getAllCollections();

            const sitemapData = SEOService.generateSitemapData(products, collections);
            const xml = generateXMLSitemap(sitemapData);
            setSitemapXML(xml);

            // Create a downloadable sitemap
            const blob = new Blob([xml], { type: 'application/xml' });
            const url = URL.createObjectURL(blob);

            // You could automatically upload this to your public folder
            console.log('Generated sitemap:', xml);
        } catch (error) {
            console.error('Error generating sitemap:', error);
        }
    };

    const generateXMLSitemap = (urls) => {
        const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n';
        const urlsetOpen = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
        const urlsetClose = '</urlset>';

        const urlEntries = urls.map(url => `
    <url>
        <loc>${url.url}</loc>
        <lastmod>${url.lastmod}</lastmod>
        <changefreq>${url.changefreq}</changefreq>
        <priority>${url.priority}</priority>
    </url>`).join('');

        return xmlHeader + urlsetOpen + urlEntries + '\n' + urlsetClose;
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Sitemap Generator</h1>
            <button
                onClick={generateSitemap}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4"
            >
                Generate Sitemap
            </button>
            {sitemapXML && (
                <div>
                    <h2 className="text-xl font-semibold mb-2">Generated Sitemap:</h2>
                    <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
                        {sitemapXML}
                    </pre>
                </div>
            )}
        </div>
    );
};

export default SitemapGenerator;
