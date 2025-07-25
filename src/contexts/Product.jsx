import React, { useState, useEffect } from "react";
import { ProductService } from "../services/productService.js";
import { ProductContext } from "./contexts.js";

export const ProductProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);

            // Try to load from Firebase first
            const [productsData, collectionsData] = await Promise.all([
                ProductService.getAllProducts(),
                ProductService.getAllCollections()
            ]);

            if (productsData.length > 0) {
                setProducts(productsData);
            } else {
                // Fallback to local products if Firebase is empty
                const { products: localProducts } = await import("../products.js");
                setProducts(localProducts);
            }

            setCollections(collectionsData);
        } catch (error) {
            console.error('Error loading data:', error);
            setError(error.message);

            // Fallback to local products on error
            try {
                const { products: localProducts } = await import("../products.js");
                setProducts(localProducts);
            } catch (fallbackError) {
                console.error('Error loading fallback data:', fallbackError);
            }
        } finally {
            setLoading(false);
        }
    };

    const refreshProducts = () => {
        loadData();
    };

    return (
        <ProductContext.Provider value={{
            products,
            collections,
            loading,
            error,
            refreshProducts
        }}>
            {children}
        </ProductContext.Provider>
    );
};

export default ProductProvider;
