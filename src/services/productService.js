import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase.js';

// Collections references
const PRODUCTS_COLLECTION = 'products';
const COLLECTIONS_COLLECTION = 'collections';

export class ProductService {
    static normalizeProductData(raw) {
        const variants = raw.variants || [];
        const incomingMap = raw.variantImages || {};
        
        const variantImages = variants.reduce((acc, v) => {
            const variantData = incomingMap[v];
            if (typeof variantData === 'string') {
                // Handle old format (string URL)
                acc[v] = {
                    images: [{ url: variantData, publicId: '' }],
                    primary: variantData
                };
            } else if (variantData && Array.isArray(variantData.images)) {
                // Handle new format { images: [], primary: ... }
                acc[v] = variantData;
            } else {
                // Default empty state
                acc[v] = { images: [], primary: null };
            }
            return acc;
        }, {});

        // Ensure fragrance notes fields exist
        const fragranceNotes = {
            top: raw.fragranceNotes?.top || '',
            middle: raw.fragranceNotes?.middle || '',
            base: raw.fragranceNotes?.base || ''
        };

        // New optional marketing / logistics fields with safe defaults
        const scentLasting = raw.scentLasting || ''; // e.g. "8-10 hours"
        const minOrderFreeShip = (raw.minOrderFreeShip === 0 || raw.minOrderFreeShip)
            ? raw.minOrderFreeShip
            : null; // number (PKR) or null

        return {
            ...raw,
            variantImages,
            fragranceNotes,
            scentLasting,
            minOrderFreeShip
        };
    }

    // Get all products
    static async getAllProducts() {
        try {
            const querySnapshot = await getDocs(
                query(collection(db, PRODUCTS_COLLECTION), orderBy('createdAt', 'desc'))
            );
            return querySnapshot.docs.map(doc => {
                const data = { id: doc.id, ...doc.data() };
                return this.normalizeProductData(data);
            });
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    }

    // Get products by category
    static async getProductsByCategory(category) {
        try {
            const q = query(
                collection(db, PRODUCTS_COLLECTION),
                where('category', '==', category),
                orderBy('createdAt', 'desc')
            );
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => {
                const data = { id: doc.id, ...doc.data() };
                return this.normalizeProductData(data);
            });
        } catch (error) {
            console.error('Error fetching products by category:', error);
            throw error;
        }
    }

    // Get single product
    static async getProduct(productId) {
        try {
            const docRef = doc(db, PRODUCTS_COLLECTION, productId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = { id: docSnap.id, ...docSnap.data() };
                return this.normalizeProductData(data);
            } else {
                throw new Error('Product not found');
            }
        } catch (error) {
            console.error('Error fetching product:', error);
            throw error;
        }
    }

    // Add new product (Admin only)
    static async addProduct(productData) {
        try {
            // Validate weekly sale constraints
            if (productData.isWeeklySale) {
                if (!productData.discountPercentage || productData.discountPercentage <= 0) {
                    throw new Error('Weekly sale products must have a valid discount percentage');
                }
                if (productData.isNewArrival) {
                    throw new Error('A product cannot be both a weekly sale and new arrival');
                }
            }

            // Validate new arrival constraints
            if (productData.isNewArrival && productData.isWeeklySale) {
                throw new Error('A product cannot be both a weekly sale and new arrival');
            }

            // Ensure fragrance notes are properly structured
            const fragranceNotes = {
                top: productData.fragranceNotes?.top || '',
                middle: productData.fragranceNotes?.middle || '',
                base: productData.fragranceNotes?.base || ''
            };

            const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
                ...productData,
                fragranceNotes,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            return docRef.id;
        } catch (error) {
            console.error('Error adding product:', error);
            throw error;
        }
    }

    // Update product (Admin only)
    static async updateProduct(productId, productData) {
        try {
            // Validate weekly sale constraints
            if (productData.isWeeklySale) {
                if (!productData.discountPercentage || productData.discountPercentage <= 0) {
                    throw new Error('Weekly sale products must have a valid discount percentage');
                }
                if (productData.isNewArrival) {
                    throw new Error('A product cannot be both a weekly sale and new arrival');
                }
            }

            // Validate new arrival constraints
            if (productData.isNewArrival && productData.isWeeklySale) {
                throw new Error('A product cannot be both a weekly sale and new arrival');
            }

            // Ensure fragrance notes are properly structured
            const fragranceNotes = {
                top: productData.fragranceNotes?.top || '',
                middle: productData.fragranceNotes?.middle || '',
                base: productData.fragranceNotes?.base || ''
            };

            const docRef = doc(db, PRODUCTS_COLLECTION, productId);
            await updateDoc(docRef, {
                ...productData,
                fragranceNotes,
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error('Error updating product:', error);
            throw error;
        }
    }

    // Delete product (Admin only)
    static async deleteProduct(productId) {
        try {
            const docRef = doc(db, PRODUCTS_COLLECTION, productId);
            await deleteDoc(docRef);
        } catch (error) {
            console.error('Error deleting product:', error);
            throw error;
        }
    }

    // Get all collections
    static async getAllCollections() {
        try {
            const querySnapshot = await getDocs(
                query(collection(db, COLLECTIONS_COLLECTION), orderBy('createdAt', 'desc'))
            );
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error fetching collections:', error);
            throw error;
        }
    }

    // Add new collection (Admin only)
    static async addCollection(collectionData) {
        try {
            const docRef = await addDoc(collection(db, COLLECTIONS_COLLECTION), {
                ...collectionData,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            return docRef.id;
        } catch (error) {
            console.error('Error adding collection:', error);
            throw error;
        }
    }

    // Update collection (Admin only)
    static async updateCollection(collectionId, collectionData) {
        try {
            const docRef = doc(db, COLLECTIONS_COLLECTION, collectionId);
            await updateDoc(docRef, {
                ...collectionData,
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error('Error updating collection:', error);
            throw error;
        }
    }

    // Delete collection (Admin only)
    static async deleteCollection(collectionId) {
        try {
            const docRef = doc(db, COLLECTIONS_COLLECTION, collectionId);
            await deleteDoc(docRef);
        } catch (error) {
            console.error('Error deleting collection:', error);
            throw error;
        }
    }

    // Get featured collections (limited to 3)
    static async getFeaturedCollections() {
        try {
            const q = query(
                collection(db, COLLECTIONS_COLLECTION),
                where('isFeatured', '==', true),
                orderBy('featuredOrder', 'asc'),
                limit(3)
            );
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error fetching featured collections:', error);
            throw error;
        }
    }

    // Toggle featured status of a collection (Admin only)
    static async toggleFeaturedCollection(collectionId, isFeatured) {
        try {
            // If featuring a collection, check if we already have 3 featured
            if (isFeatured) {
                const featuredCollections = await this.getFeaturedCollections();
                if (featuredCollections.length >= 3) {
                    throw new Error('Maximum of 3 collections can be featured at once');
                }
            }

            const docRef = doc(db, COLLECTIONS_COLLECTION, collectionId);
            const updateData = {
                isFeatured,
                updatedAt: serverTimestamp()
            };

            // If featuring, add featuredOrder based on current count
            if (isFeatured) {
                const featuredCollections = await this.getFeaturedCollections();
                updateData.featuredOrder = featuredCollections.length + 1;
            } else {
                // If unfeaturing, remove featuredOrder
                updateData.featuredOrder = null;
            }

            await updateDoc(docRef, updateData);

            // If unfeaturing, reorder the remaining featured collections
            if (!isFeatured) {
                await this.reorderFeaturedCollections();
            }
        } catch (error) {
            console.error('Error toggling featured collection:', error);
            throw error;
        }
    }

    // Reorder featured collections to maintain sequential order
    static async reorderFeaturedCollections() {
        try {
            const featuredCollections = await this.getFeaturedCollections();

            // Update the order for remaining featured collections
            const updatePromises = featuredCollections.map((collection, index) => {
                const docRef = doc(db, COLLECTIONS_COLLECTION, collection.id);
                return updateDoc(docRef, {
                    featuredOrder: index + 1,
                    updatedAt: serverTimestamp()
                });
            });

            await Promise.all(updatePromises);
        } catch (error) {
            console.error('Error reordering featured collections:', error);
            throw error;
        }
    }

    // Get collections with filter options
    static async getCollections(options = {}) {
        try {
            let q = query(collection(db, COLLECTIONS_COLLECTION));

            if (options.featured) {
                q = query(q, where('isFeatured', '==', true));
            }

            if (options.orderBy) {
                q = query(q, orderBy(options.orderBy, options.order || 'desc'));
            } else {
                q = query(q, orderBy('createdAt', 'desc'));
            }

            if (options.limit) {
                q = query(q, limit(options.limit));
            }

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error fetching collections:', error);
            throw error;
        }
    }

    // Update product stock and sold counts when order is confirmed
    static async updateProductStock(productId, variantUpdates) {
        try {
            const docRef = doc(db, PRODUCTS_COLLECTION, productId);
            const productDoc = await getDoc(docRef);

            if (!productDoc.exists()) {
                throw new Error(`Product ${productId} not found`);
            }

            const productData = productDoc.data();
            const currentStock = productData.stock || {};
            const currentSold = productData.sold || {};

            // Update stock and sold counts for each variant
            const updatedStock = { ...currentStock };
            const updatedSold = { ...currentSold };

            Object.entries(variantUpdates).forEach(([variant, { quantitySold }]) => {
                if (quantitySold > 0) {
                    // Confirming order: decrement stock, increment sold
                    updatedStock[variant] = Math.max(0, (updatedStock[variant] || 0) - quantitySold);
                    updatedSold[variant] = (updatedSold[variant] || 0) + quantitySold;
                } else {
                    // Cancelling order: increment stock, decrement sold
                    const absQuantity = Math.abs(quantitySold);
                    updatedStock[variant] = (updatedStock[variant] || 0) + absQuantity;
                    updatedSold[variant] = Math.max(0, (updatedSold[variant] || 0) - absQuantity);
                }
            });

            // Update the product document
            await updateDoc(docRef, {
                stock: updatedStock,
                sold: updatedSold,
                updatedAt: serverTimestamp()
            });

            return {
                productId,
                updatedStock,
                updatedSold
            };
        } catch (error) {
            console.error('Error updating product stock:', error);
            throw error;
        }
    }

    // Batch update stock for multiple products (used when confirming orders)
    static async batchUpdateProductStock(stockUpdates) {
        try {
            const updatePromises = Object.entries(stockUpdates).map(([productId, variantUpdates]) =>
                this.updateProductStock(productId, variantUpdates)
            );

            const results = await Promise.all(updatePromises);
            return results;
        } catch (error) {
            console.error('Error batch updating product stock:', error);
            throw error;
        }
    }

    // Check if products have sufficient stock for an order
    static async checkStockAvailability(orderItems) {
        try {
            const stockChecks = await Promise.all(
                orderItems.map(async (item) => {
                    const product = await this.getProduct(item.product.id);
                    const availableStock = product.stock?.[item.variant] || 0;

                    return {
                        productId: item.product.id,
                        productName: item.product.name,
                        variant: item.variant,
                        requested: item.quantity,
                        available: availableStock,
                        sufficient: availableStock >= item.quantity
                    };
                })
            );

            const insufficientStock = stockChecks.filter(check => !check.sufficient);

            return {
                allSufficient: insufficientStock.length === 0,
                stockChecks,
                insufficientStock
            };
        } catch (error) {
            console.error('Error checking stock availability:', error);
            throw error;
        }
    }

    // Update product rating based on new review
    static async updateProductRating(productId, newRating) {
        try {
            const docRef = doc(db, PRODUCTS_COLLECTION, productId);
            const productDoc = await getDoc(docRef);
            if (!productDoc.exists()) throw new Error('Product not found');
            const productData = productDoc.data();
            // Calculate new average rating
            let ratings = productData.ratings || [];
            ratings.push(newRating);
            const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
            await updateDoc(docRef, {
                rating: parseFloat(avgRating.toFixed(2)),
                ratings,
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error('Error updating product rating:', error);
            throw error;
        }
    }

    // Get new arrivals
    static async getNewArrivals() {
        try {
            const q = query(
                collection(db, PRODUCTS_COLLECTION),
                where('isNewArrival', '==', true),
                orderBy('createdAt', 'desc')
            );
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => {
                const data = { id: doc.id, ...doc.data() };
                return this.normalizeProductData(data);
            });
        } catch (error) {
            console.error('Error fetching new arrivals:', error);
            throw error;
        }
    }

    // Get weekly sales
    static async getWeeklySaleProducts() {
        try {
            const q = query(
                collection(db, PRODUCTS_COLLECTION),
                where('isWeeklySale', '==', true),
                where('discountPercentage', '>', 0),
                orderBy('discountPercentage', 'desc')
            );
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => {
                const data = { id: doc.id, ...doc.data() };
                return this.normalizeProductData(data);
            });
        } catch (error) {
            console.error('Error fetching weekly sale products:', error);
            throw error;
        }
    }
}
