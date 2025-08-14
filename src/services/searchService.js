import { ProductService } from './productService.js';

export class SearchService {
    static _cache = {
        products: null,
        collections: null
    };

    // Load all products & collections into cache (only once unless forceRefresh = true)
    static async _loadData(forceRefresh = false) {
        if (!forceRefresh && this._cache.products && this._cache.collections) {
            return this._cache;
        }

        try {
            const [products, collections] = await Promise.all([
                ProductService.getAllProducts(),
                ProductService.getAllCollections()
            ]);

            this._cache.products = products;
            this._cache.collections = collections;

            return this._cache;
        } catch (error) {
            console.error('Error loading data for search:', error);
            throw error;
        }
    }

    // Helper: checks if a term matches a field
    static _fieldMatch(value, term) {
        return value?.toLowerCase().includes(term);
    }

    // Helper: rank the match relevance (name > description > category)
    static _rankItem(item, fields, searchTerm) {
        let score = 0;

        if (this._fieldMatch(item[fields[0]], searchTerm)) score += 3; // name
        if (this._fieldMatch(item[fields[1]], searchTerm)) score += 2; // description
        if (fields[2] && this._fieldMatch(item[fields[2]], searchTerm)) score += 1; // category

        return score;
    }

    // Main search method
    static async search(searchTerm, forceRefresh = false) {
        if (!searchTerm || searchTerm.trim() === '') {
            return { products: [], collections: [] };
        }

        const normalizedSearchTerm = searchTerm.toLowerCase().trim();

        try {
            const { products, collections } = await this._loadData(forceRefresh);

            // Filter & rank products
            const filteredProducts = products
                .map(product => ({
                    ...product,
                    _score: this._rankItem(product, ['name', 'description', 'category'], normalizedSearchTerm)
                }))
                .filter(item => item._score > 0)
                .sort((a, b) => b._score - a._score);

            // Filter & rank collections
            const filteredCollections = collections
                .map(collection => ({
                    ...collection,
                    _score: this._rankItem(collection, ['name', 'description'], normalizedSearchTerm)
                }))
                .filter(item => item._score > 0)
                .sort((a, b) => b._score - a._score);

            return {
                products: filteredProducts,
                collections: filteredCollections
            };
        } catch (error) {
            console.error('Error during search:', error);
            throw error;
        }
    }
}
