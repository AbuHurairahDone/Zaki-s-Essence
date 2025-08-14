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
            const xml = SEOService.generateXMLSitemap(sitemapData);
            setSitemapXML(xml);

            // Create a downloadable sitemap
            const blob = new Blob([xml], { type: 'application/xml' });


            // You could automatically upload this to your public folder
            console.log('Generated sitemap:', xml);
        } catch (error) {
            console.error('Error generating sitemap:', error);
        }
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
