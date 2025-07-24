import React, { useState, useEffect } from 'react';
import { ProductService } from '../../services/productService.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPlus,
    faEdit,
    faTrash,
    faSearch,
    faStar,
    faEye
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

function ProductManagement() {
    const [products, setProducts] = useState([]);
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [showProductModal, setShowProductModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const categories = ['All', 'Floral', 'Oriental', 'Fresh', 'Woody', 'Aquatic', 'Amber'];

    useEffect(() => {
        loadProducts();
        loadCollections();
    }, []);

    const loadProducts = async () => {
        try {
            const productsData = await ProductService.getAllProducts();
            setProducts(productsData);
        } catch (error) {
            console.error('Error loading products:', error);
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const loadCollections = async () => {
        try {
            const collectionsData = await ProductService.getAllCollections();
            setCollections(collectionsData);
        } catch (error) {
            console.error('Error loading collections:', error);
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (!window.confirm('Are you sure you want to delete this product?')) {
            return;
        }

        try {
            await ProductService.deleteProduct(productId);
            toast.success('Product deleted successfully');
            loadProducts();
        } catch (error) {
            console.error('Error deleting product:', error);
            toast.error('Failed to delete product');
        }
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }).format(date.toDate ? date.toDate() : new Date(date));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-2 border-yellow-700 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
                    <p className="text-gray-600">Manage your fragrance products</p>
                </div>
                <button
                    onClick={() => {
                        setEditingProduct(null);
                        setShowProductModal(true);
                    }}
                    className="bg-yellow-700 hover:bg-yellow-800 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
                >
                    <FontAwesomeIcon icon={faPlus} className="mr-2" />
                    Add Product
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <FontAwesomeIcon
                                icon={faSearch}
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                            />
                            <input
                                type="text"
                                placeholder="Search products..."
                                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-700"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div>
                        <select
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-700"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            {categories.map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                    <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="relative">
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-48 object-cover"
                            />
                            <div className="absolute top-2 right-2 bg-gray-900 text-white text-xs px-2 py-1 rounded">
                                {product.category}
                            </div>
                        </div>

                        <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-lg">{product.name}</h3>
                                <div className="flex items-center text-yellow-600">
                                    <FontAwesomeIcon icon={faStar} className="text-xs mr-1" />
                                    <span className="text-sm">{product.rating}</span>
                                </div>
                            </div>

                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>

                            <div className="flex justify-between items-center mb-3">
                                <span className="font-bold text-xl text-gray-900">
                                    {formatCurrency(product.price)}
                                </span>
                                <div className="flex space-x-1">
                                    {product.variants?.map((variant) => (
                                        <span key={variant} className="px-2 py-1 bg-gray-100 text-xs rounded">
                                            {variant}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="text-xs text-gray-500 mb-3">
                                Created: {formatDate(product.createdAt)}
                            </div>

                            <div className="flex space-x-2">
                                <button
                                    onClick={() => {
                                        setEditingProduct(product);
                                        setShowProductModal(true);
                                    }}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-colors"
                                >
                                    <FontAwesomeIcon icon={faEdit} className="mr-1" />
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDeleteProduct(product.id)}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm transition-colors"
                                >
                                    <FontAwesomeIcon icon={faTrash} className="mr-1" />
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">
                        <FontAwesomeIcon icon={faSearch} />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No products found</h3>
                    <p className="text-gray-500">Try adjusting your search or filters</p>
                </div>
            )}

            {/* Product Modal */}
            {showProductModal && (
                <ProductModal
                    product={editingProduct}
                    collections={collections}
                    onClose={() => {
                        setShowProductModal(false);
                        setEditingProduct(null);
                    }}
                    onSave={() => {
                        loadProducts();
                        setShowProductModal(false);
                        setEditingProduct(null);
                    }}
                />
            )}
        </div>
    );
}

// Product Modal Component
function ProductModal({ product, collections, onClose, onSave }) {
    const [formData, setFormData] = useState({
        name: product?.name || '',
        description: product?.description || '',
        price: product?.price || '',
        category: product?.category || 'Floral',
        image: product?.image || '',
        rating: product?.rating || 4.5,
        variants: product?.variants || ['50ml', '100ml']
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const categories = ['Floral', 'Oriental', 'Fresh', 'Woody', 'Aquatic', 'Amber'];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleVariantsChange = (e) => {
        const variants = e.target.value.split(',').map(v => v.trim()).filter(v => v);
        setFormData(prev => ({
            ...prev,
            variants
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const productData = {
                ...formData,
                price: parseFloat(formData.price),
                rating: parseFloat(formData.rating)
            };

            if (product) {
                await ProductService.updateProduct(product.id, productData);
                toast.success('Product updated successfully');
            } else {
                await ProductService.addProduct(productData);
                toast.success('Product added successfully');
            }

            onSave();
        } catch (error) {
            console.error('Error saving product:', error);
            toast.error('Failed to save product');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold">
                        {product ? 'Edit Product' : 'Add New Product'}
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Product Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-700"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Category
                            </label>
                            <select
                                name="category"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-700"
                                value={formData.category}
                                onChange={handleChange}
                            >
                                {categories.map(category => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            name="description"
                            required
                            rows="3"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-700"
                            value={formData.description}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Price ($)
                            </label>
                            <input
                                type="number"
                                name="price"
                                required
                                step="0.01"
                                min="0"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-700"
                                value={formData.price}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Rating
                            </label>
                            <input
                                type="number"
                                name="rating"
                                required
                                step="0.1"
                                min="0"
                                max="5"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-700"
                                value={formData.rating}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Image URL
                        </label>
                        <input
                            type="url"
                            name="image"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-700"
                            value={formData.image}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Variants (comma-separated)
                        </label>
                        <input
                            type="text"
                            placeholder="50ml, 100ml"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-700"
                            value={formData.variants.join(', ')}
                            onChange={handleVariantsChange}
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-yellow-700 hover:bg-yellow-800 text-white rounded-lg transition-colors disabled:opacity-50"
                        >
                            {isSubmitting ? 'Saving...' : 'Save Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ProductManagement;
