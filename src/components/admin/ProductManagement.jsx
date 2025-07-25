import React, { useState, useEffect } from 'react';
import { ProductService } from '../../services/productService.js';
import { CloudinaryService } from '../../services/cloudinaryService.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPlus,
    faEdit,
    faTrash,
    faSearch,
    faStar,
    faEye,
    faBox,
    faPercentage,
    faTimes,
    faLayerGroup,
    faUpload,
    faImage
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

function ProductManagement() {
    const [products, setProducts] = useState([]);
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCollection, setSelectedCollection] = useState('All');
    const [showProductModal, setShowProductModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

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
        const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCollection = selectedCollection === 'All' || product.collectionRef === selectedCollection;
        return matchesSearch && matchesCollection;
    });

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: 'PKR'
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

    const getCollectionName = (collectionId) => {
        const collection = collections.find(c => c.id === collectionId);
        return collection?.name || 'Unknown Collection';
    };

    const getTotalStock = (stockData) => {
        if (!stockData) return 0;
        return Object.values(stockData).reduce((total, stock) => total + (stock || 0), 0);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-2 border-yellow-700 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Product Management</h1>
                    <p className="text-sm sm:text-base text-gray-600">Manage your fragrance products</p>
                </div>
                <button
                    onClick={() => {
                        setEditingProduct(null);
                        setShowProductModal(true);
                    }}
                    className="w-full sm:w-auto bg-yellow-700 hover:bg-yellow-800 text-white px-4 py-2 rounded-lg flex items-center justify-center transition-colors"
                >
                    <FontAwesomeIcon icon={faPlus} className="mr-2" />
                    Add Product
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row gap-4">
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
                    <div className="w-full sm:w-auto">
                        <select
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-700"
                            value={selectedCollection}
                            onChange={(e) => setSelectedCollection(e.target.value)}
                        >
                            <option value="All">All Collections</option>
                            {collections.map(collection => (
                                <option key={collection.id} value={collection.id}>{collection.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredProducts.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        collections={collections}
                        onEdit={() => {
                            setEditingProduct(product);
                            setShowProductModal(true);
                        }}
                        onDelete={() => handleDeleteProduct(product.id)}
                        formatCurrency={formatCurrency}
                        formatDate={formatDate}
                        getCollectionName={getCollectionName}
                        getTotalStock={getTotalStock}
                    />
                ))}
            </div>

            {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-gray-400 text-4xl sm:text-6xl mb-4">
                        <FontAwesomeIcon icon={faSearch} />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">No products found</h3>
                    <p className="text-sm sm:text-base text-gray-500">Try adjusting your search or filters</p>
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

// Product Card Component
function ProductCard({ product, onEdit, onDelete, formatCurrency, formatDate, getCollectionName, getTotalStock }) {
    const [imageError, setImageError] = useState(false);

    const handleImageError = () => {
        setImageError(true);
    };

    // Helper function to get price display for admin card
    const getPriceDisplay = () => {
        if (product.variantPricing) {
            const prices = Object.values(product.variantPricing).filter(price => price > 0);
            if (prices.length > 0) {
                const minPrice = Math.min(...prices);
                const maxPrice = Math.max(...prices);
                if (minPrice === maxPrice) {
                    return formatCurrency(minPrice);
                }
                return `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`;
            }
        }
        // Fallback to legacy price
        return formatCurrency(product.price || 0);
    };

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
                {!imageError ? (
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-32 sm:h-48 object-cover"
                        onError={handleImageError}
                    />
                ) : (
                    <div className="w-full h-32 sm:h-48 bg-gray-200 flex items-center justify-center">
                        <div className="text-center text-gray-500">
                            <FontAwesomeIcon icon={faEye} className="text-2xl mb-1" />
                            <p className="text-xs">No Image</p>
                        </div>
                    </div>
                )}
                <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded flex items-center">
                    <FontAwesomeIcon icon={faLayerGroup} className="mr-1" />
                    {getCollectionName(product.collectionRef)}
                </div>
                {product.discountPercentage && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded flex items-center">
                        <FontAwesomeIcon icon={faPercentage} className="mr-1" />
                        {product.discountPercentage}% OFF
                    </div>
                )}
            </div>

            <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-sm sm:text-lg truncate pr-2">{product.name}</h3>
                    <div className="flex items-center text-yellow-600 flex-shrink-0">
                        <FontAwesomeIcon icon={faStar} className="text-xs mr-1" />
                        <span className="text-xs sm:text-sm">{product.rating}</span>
                    </div>
                </div>

                <p className="text-gray-600 text-xs sm:text-sm mb-3 line-clamp-2">{product.description}</p>

                <div className="space-y-2 mb-3">
                    <div className="flex justify-between items-center">
                        <span className="font-bold text-lg text-gray-900">
                            {getPriceDisplay()}
                        </span>
                        <div className="flex items-center text-gray-600">
                            <FontAwesomeIcon icon={faBox} className="text-xs mr-1" />
                            <span className="text-xs">Stock: {getTotalStock(product.stock)}</span>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                        {product.variants?.map((variant) => (
                            <span key={variant} className="px-2 py-1 bg-gray-100 text-xs rounded flex flex-col items-center">
                                <span className="font-medium">{variant}</span>
                                {product.variantPricing && product.variantPricing[variant] && (
                                    <span className="text-green-600">{formatCurrency(product.variantPricing[variant])}</span>
                                )}
                                <span className="text-gray-500">Stock: {product.stock?.[variant] || 0}</span>
                            </span>
                        ))}
                    </div>
                </div>

                <div className="text-xs text-gray-500 mb-3">
                    Created: {formatDate(product.createdAt)}
                </div>

                <div className="flex space-x-2">
                    <button
                        onClick={onEdit}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-xs sm:text-sm transition-colors"
                    >
                        <FontAwesomeIcon icon={faEdit} className="mr-1" />
                        Edit
                    </button>
                    <button
                        onClick={onDelete}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-xs sm:text-sm transition-colors"
                    >
                        <FontAwesomeIcon icon={faTrash} className="mr-1" />
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

// Product Modal Component
function ProductModal({ product, collections, onClose, onSave }) {
    const [formData, setFormData] = useState({
        name: product?.name || '',
        description: product?.description || '',
        collectionRef: product?.collectionRef || '',
        image: product?.image || '',
        variants: product?.variants || ['50ml', '100ml'],
        variantPricing: product?.variantPricing || { '50ml': 0, '100ml': 0 },
        stock: product?.stock || { '50ml': 0, '100ml': 0 },
        sold: product?.sold || { '50ml': 0, '100ml': 0 },
        discountPercentage: product?.discountPercentage || '',
        publicId: product?.publicId || '', // For Cloudinary
        cloudinaryData: product?.cloudinaryData || null
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newVariant, setNewVariant] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(formData.image);
    const [uploadingImage, setUploadingImage] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file
            const validation = CloudinaryService.validateFile(file, {
                maxSize: 10 * 1024 * 1024, // 10MB
                allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
            });

            if (!validation.isValid) {
                toast.error(validation.errors.join(', '));
                return;
            }

            setImageFile(file);

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => setImagePreview(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    const uploadImage = async () => {
        if (!imageFile) return;

        setUploadingImage(true);
        try {
            const uploadResult = await CloudinaryService.uploadProductImage(imageFile, {
                productName: formData.name || 'product',
                collection: collections.find(c => c.id === formData.collectionRef)?.name || 'general'
            });

            setFormData(prev => ({
                ...prev,
                image: uploadResult.url,
                publicId: uploadResult.publicId,
                cloudinaryData: {
                    publicId: uploadResult.publicId,
                    width: uploadResult.width,
                    height: uploadResult.height,
                    format: uploadResult.format,
                    bytes: uploadResult.bytes
                }
            }));

            setImageFile(null);
            toast.success('Image uploaded successfully');
        } catch (error) {
            console.error('Error uploading image:', error);
            toast.error('Failed to upload image');
        } finally {
            setUploadingImage(false);
        }
    };

    const addVariant = () => {
        if (newVariant.trim() && !formData.variants.includes(newVariant.trim())) {
            const variant = newVariant.trim();
            setFormData(prev => ({
                ...prev,
                variants: [...prev.variants, variant],
                variantPricing: {
                    ...prev.variantPricing,
                    [variant]: 0
                },
                stock: {
                    ...prev.stock,
                    [variant]: 0
                },
                sold: {
                    ...prev.sold,
                    [variant]: 0
                }
            }));
            setNewVariant('');
        }
    };

    const removeVariant = (variantToRemove) => {
        if (formData.variants.length > 1) {
            setFormData(prev => {
                const newVariantPricing = { ...prev.variantPricing };
                const newStock = { ...prev.stock };
                const newSold = { ...prev.sold };
                delete newVariantPricing[variantToRemove];
                delete newStock[variantToRemove];
                delete newSold[variantToRemove];

                return {
                    ...prev,
                    variants: prev.variants.filter(v => v !== variantToRemove),
                    variantPricing: newVariantPricing,
                    stock: newStock,
                    sold: newSold
                };
            });
        }
    };

    const handleStockChange = (variant, value) => {
        setFormData(prev => ({
            ...prev,
            stock: {
                ...prev.stock,
                [variant]: parseInt(value) || 0
            }
        }));
    };

    const handlePriceChange = (variant, value) => {
        setFormData(prev => ({
            ...prev,
            variantPricing: {
                ...prev.variantPricing,
                [variant]: parseFloat(value) || 0
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.collectionRef) {
            toast.error('Please select a collection');
            return;
        }

        if (!formData.image) {
            toast.error('Please upload a product image');
            return;
        }

        if (formData.variants.length === 0) {
            toast.error('Please add at least one variant');
            return;
        }

        // Validate that all variants have prices
        const hasEmptyPrices = formData.variants.some(variant =>
            !formData.variantPricing[variant] || formData.variantPricing[variant] <= 0
        );

        if (hasEmptyPrices) {
            toast.error('Please set a price for all variants');
            return;
        }

        // Upload image if there's a new file selected
        if (imageFile) {
            await uploadImage();
            return; // Let the upload complete, then user can submit again
        }

        setIsSubmitting(true);

        try {
            // Ensure sold defaults to 0 for all variants (for new products)
            const soldData = { ...formData.sold };
            if (!product) {
                formData.variants.forEach(variant => {
                    soldData[variant] = 0;
                });
            }

            const productData = {
                ...formData,
                rating: 0, // Always default to 0
                sold: soldData,
                discountPercentage: formData.discountPercentage ? parseFloat(formData.discountPercentage) : null
            };

            // Remove the old price field if it exists (for migration)
            if (productData.price) {
                delete productData.price;
            }

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

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addVariant();
        }
    };

    const getLowestPrice = () => {
        const prices = Object.values(formData.variantPricing).filter(price => price > 0);
        return prices.length > 0 ? Math.min(...prices) : 0;
    };

    const getHighestPrice = () => {
        const prices = Object.values(formData.variantPricing).filter(price => price > 0);
        return prices.length > 0 ? Math.max(...prices) : 0;
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white p-4 sm:p-6 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-lg sm:text-xl font-bold">
                        {product ? 'Edit Product' : 'Add New Product'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1"
                    >
                        <FontAwesomeIcon icon={faTimes} className="text-xl" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Product Name *
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
                                    Collection *
                                </label>
                                <select
                                    name="collectionRef"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-700"
                                    value={formData.collectionRef}
                                    onChange={handleChange}
                                >
                                    <option value="">Select a collection</option>
                                    {collections.map(collection => (
                                        <option key={collection.id} value={collection.id}>{collection.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description *
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

                        {/* Product Image Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Product Image *
                            </label>

                            {/* Current Image Preview */}
                            {imagePreview && (
                                <div className="mb-4">
                                    <div className="relative inline-block">
                                        <img
                                            src={imagePreview}
                                            alt="Product preview"
                                            className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                                        />
                                        {formData.image && (
                                            <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                                                Current
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* File Upload */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="flex-1">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageSelect}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-700"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Supports JPEG, PNG, WebP. Max size: 10MB
                                    </p>
                                </div>

                                {imageFile && (
                                    <button
                                        type="button"
                                        onClick={uploadImage}
                                        disabled={uploadingImage}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center"
                                    >
                                        {uploadingImage ? (
                                            <>
                                                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                                                Uploading...
                                            </>
                                        ) : (
                                            <>
                                                <FontAwesomeIcon icon={faUpload} className="mr-2" />
                                                Upload
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>

                            {!formData.image && !imageFile && (
                                <div className="mt-3 p-4 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-500">
                                    <FontAwesomeIcon icon={faImage} className="text-2xl mb-2" />
                                    <p className="text-sm">No image selected</p>
                                    <p className="text-xs">Please upload a product image</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Pricing Overview */}
                    {formData.variants.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Pricing Overview</h3>

                            <div className="bg-blue-50 p-4 rounded-lg">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                                    <div>
                                        <p className="text-sm text-gray-600">Price Range</p>
                                        <p className="text-lg font-semibold text-blue-600">
                                            Rs. {getLowestPrice().toFixed(0)} - Rs. {getHighestPrice().toFixed(0)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Total Variants</p>
                                        <p className="text-lg font-semibold text-blue-600">{formData.variants.length}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Discount</p>
                                        <p className="text-lg font-semibold text-blue-600">
                                            {formData.discountPercentage ? `${formData.discountPercentage}%` : 'None'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Discount (%)
                                </label>
                                <input
                                    type="number"
                                    name="discountPercentage"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-700"
                                    value={formData.discountPercentage}
                                    onChange={handleChange}
                                    placeholder="Optional"
                                />
                            </div>
                        </div>
                    )}

                    {/* Variants & Stock */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Product Variants, Pricing & Stock</h3>

                        {/* Add Variant Section */}
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Add Product Variants
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="e.g., 30ml, 50ml, 100ml"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-700"
                                    value={newVariant}
                                    onChange={(e) => setNewVariant(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                />
                                <button
                                    type="button"
                                    onClick={addVariant}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                                >
                                    <FontAwesomeIcon icon={faPlus} className="mr-1" />
                                    Add
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Press Enter or click Add to add a variant</p>
                        </div>

                        {/* Current Variants */}
                        {formData.variants.length > 0 && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Current Variants ({formData.variants.length})
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {formData.variants.map((variant) => (
                                        <div key={variant} className="border border-gray-200 rounded-lg p-4 bg-white">
                                            <div className="flex justify-between items-center mb-3">
                                                <h4 className="font-medium text-gray-900">{variant}</h4>
                                                {formData.variants.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeVariant(variant)}
                                                        className="text-red-500 hover:text-red-700 p-1"
                                                        title="Remove variant"
                                                    >
                                                        <FontAwesomeIcon icon={faTimes} className="text-sm" />
                                                    </button>
                                                )}
                                            </div>

                                            <div className="space-y-3">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 mb-2">
                                                        Price ($) *
                                                    </label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        required
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-700"
                                                        value={formData.variantPricing[variant] || ''}
                                                        onChange={(e) => handlePriceChange(variant, e.target.value)}
                                                        placeholder="0.00"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 mb-2">
                                                        Stock Quantity
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-700"
                                                        value={formData.stock[variant] || 0}
                                                        onChange={(e) => handleStockChange(variant, e.target.value)}
                                                    />
                                                </div>

                                                {/* Show sold count for existing products (read-only) */}
                                                {product && formData.sold && formData.sold[variant] !== undefined && (
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-600 mb-1">
                                                            Units Sold
                                                        </label>
                                                        <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-700">
                                                            {formData.sold[variant] || 0} sold
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {formData.variants.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                <FontAwesomeIcon icon={faBox} className="text-3xl mb-2" />
                                <p>No variants added yet</p>
                                <p className="text-xs">Add at least one variant to continue</p>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-6 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full sm:w-auto px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || formData.variants.length === 0}
                            className="w-full sm:w-auto px-6 py-2 bg-yellow-700 hover:bg-yellow-800 text-white rounded-lg transition-colors disabled:opacity-50"
                        >
                            {isSubmitting ? 'Saving...' : (product ? 'Update Product' : 'Add Product')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ProductManagement;
