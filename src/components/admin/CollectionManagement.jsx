import React, { useState, useEffect } from 'react';
import { ProductService } from '../../services/productService.js';
import { CloudinaryService } from '../../services/cloudinaryService.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPlus,
    faEdit,
    faTrash,
    faSearch,
    faLayerGroup,
    faTimes,
    faBox,
    faStar,
    faStarHalfAlt,
    faUpload,
    faImage
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

function CollectionManagement() {
    const [collections, setCollections] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCollectionModal, setShowCollectionModal] = useState(false);
    const [editingCollection, setEditingCollection] = useState(null);
    const [featuredCollections, setFeaturedCollections] = useState([]);

    useEffect(() => {
        loadCollections();
        loadProducts();
        loadFeaturedCollections();
    }, []);

    const loadCollections = async () => {
        try {
            const collectionsData = await ProductService.getAllCollections();
            setCollections(collectionsData);
        } catch (error) {
            console.error('Error loading collections:', error);
            toast.error('Failed to load collections');
        } finally {
            setLoading(false);
        }
    };

    const loadProducts = async () => {
        try {
            const productsData = await ProductService.getAllProducts();
            setProducts(productsData);
        } catch (error) {
            console.error('Error loading products:', error);
        }
    };

    const loadFeaturedCollections = async () => {
        try {
            const featured = await ProductService.getFeaturedCollections();
            setFeaturedCollections(featured);
        } catch (error) {
            console.error('Error loading featured collections:', error);
        }
    };

    const handleToggleFeatured = async (collectionId, currentFeaturedStatus) => {
        try {
            await ProductService.toggleFeaturedCollection(collectionId, !currentFeaturedStatus);
            toast.success(
                !currentFeaturedStatus
                    ? 'Collection featured successfully'
                    : 'Collection unfeatured successfully'
            );
            loadCollections();
            loadFeaturedCollections();
        } catch (error) {
            console.error('Error toggling featured status:', error);
            toast.error(error.message || 'Failed to update featured status');
        }
    };

    const handleDeleteCollection = async (collectionId) => {
        // Check if any products are using this collection
        const productsInCollection = products.filter(product => product.collectionRef === collectionId);
        if (productsInCollection.length > 0) {
            toast.error(`Cannot delete collection. ${productsInCollection.length} products are using this collection.`);
            return;
        }

        if (!window.confirm('Are you sure you want to delete this collection?')) {
            return;
        }

        try {
            await ProductService.deleteCollection(collectionId);
            toast.success('Collection deleted successfully');
            loadCollections();
        } catch (error) {
            console.error('Error deleting collection:', error);
            toast.error('Failed to delete collection');
        }
    };

    const filteredCollections = collections.filter(collection =>
        collection.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        collection.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }).format(date.toDate ? date.toDate() : new Date(date));
    };

    const getProductCount = (collectionId) => {
        return products.filter(product => product.collectionRef === collectionId).length;
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
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Collection Management</h1>
                    <p className="text-sm sm:text-base text-gray-600">Manage your fragrance collections</p>
                </div>
                <button
                    onClick={() => {
                        setEditingCollection(null);
                        setShowCollectionModal(true);
                    }}
                    className="w-full sm:w-auto bg-yellow-700 hover:bg-yellow-800 text-white px-4 py-2 rounded-lg flex items-center justify-center transition-colors"
                >
                    <FontAwesomeIcon icon={faPlus} className="mr-2" />
                    Add Collection
                </button>
            </div>

            {/* Search */}
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                <div className="relative">
                    <FontAwesomeIcon
                        icon={faSearch}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    />
                    <input
                        type="text"
                        placeholder="Search collections..."
                        className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-700"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Collections Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredCollections.map((collection) => (
                    <CollectionCard
                        key={collection.id}
                        collection={collection}
                        productCount={getProductCount(collection.id)}
                        onEdit={() => {
                            setEditingCollection(collection);
                            setShowCollectionModal(true);
                        }}
                        onDelete={() => handleDeleteCollection(collection.id)}
                        onToggleFeatured={() => handleToggleFeatured(collection.id, collection.isFeatured)}
                        formatDate={formatDate}
                    />
                ))}
            </div>

            {filteredCollections.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-gray-400 text-4xl sm:text-6xl mb-4">
                        <FontAwesomeIcon icon={faLayerGroup} />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">No collections found</h3>
                    <p className="text-sm sm:text-base text-gray-500">
                        {searchTerm ? 'Try adjusting your search' : 'Create your first collection to get started'}
                    </p>
                </div>
            )}

            {/* Collection Modal */}
            {showCollectionModal && (
                <CollectionModal
                    collection={editingCollection}
                    products={products}
                    onClose={() => {
                        setShowCollectionModal(false);
                        setEditingCollection(null);
                    }}
                    onSave={() => {
                        loadCollections();
                        setShowCollectionModal(false);
                        setEditingCollection(null);
                    }}
                />
            )}
        </div>
    );
}

// Collection Card Component
function CollectionCard({ collection, productCount, onEdit, onDelete, onToggleFeatured, formatDate }) {
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
                <img
                    src={collection.image}
                    alt={collection.name}
                    className="w-full h-32 sm:h-48 object-cover"
                />
                <div className="absolute top-2 left-2 bg-gray-900 text-white text-xs px-2 py-1 rounded flex items-center">
                    <FontAwesomeIcon icon={faLayerGroup} className="mr-1" />
                    Collection
                </div>
                <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded flex items-center">
                    <FontAwesomeIcon icon={faBox} className="mr-1" />
                    {productCount} Products
                </div>
            </div>

            <div className="p-4">
                <h3 className="font-bold text-sm sm:text-lg mb-2 truncate">{collection.name}</h3>
                <p className="text-gray-600 text-xs sm:text-sm mb-3 line-clamp-3">{collection.description}</p>

                <div className="text-xs text-gray-500 mb-3">
                    Created: {formatDate(collection.createdAt)}
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

                {/* Featured Collection Toggle */}
                <div className="mt-3">
                    <button
                        onClick={onToggleFeatured}
                        className={`w-full px-4 py-2 rounded-lg flex items-center justify-center transition-all
                        ${collection.isFeatured ? 'bg-yellow-600 hover:bg-yellow-700 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                    >
                        <FontAwesomeIcon icon={collection.isFeatured ? faStar : faStarHalfAlt} className="mr-2" />
                        {collection.isFeatured ? 'Featured Collection' : 'Mark as Featured'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Collection Modal Component
function CollectionModal({ collection, products, onClose, onSave }) {
    const [formData, setFormData] = useState({
        name: collection?.name || '',
        description: collection?.description || '',
        image: collection?.image || '',
        publicId: collection?.publicId || '', // For Cloudinary
        cloudinaryData: collection?.cloudinaryData || null
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
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
            const uploadResult = await CloudinaryService.uploadCollectionImage(imageFile, {
                collectionName: formData.name || 'collection'
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.image) {
            toast.error('Please upload a collection image');
            return;
        }

        // Upload image if there's a new file selected
        if (imageFile) {
            await uploadImage();
            return; // Let the upload complete, then user can submit again
        }

        setIsSubmitting(true);

        try {
            const collectionData = {
                ...formData
            };

            if (collection) {
                await ProductService.updateCollection(collection.id, collectionData);
                toast.success('Collection updated successfully');
            } else {
                await ProductService.addCollection(collectionData);
                toast.success('Collection added successfully');
            }

            onSave();
        } catch (error) {
            console.error('Error saving collection:', error);
            toast.error('Failed to save collection');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Get products associated with this collection
    const associatedProducts = products.filter(product => product.collectionRef === collection?.id);

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white p-4 sm:p-6 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-lg sm:text-xl font-bold">
                        {collection ? 'Edit Collection' : 'Add New Collection'}
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
                        <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Collection Information</h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Collection Name *
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
                                Description *
                            </label>
                            <textarea
                                name="description"
                                required
                                rows="4"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-700"
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Collection Image Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Collection Image *
                            </label>

                            {/* Current Image Preview */}
                            {imagePreview && (
                                <div className="mb-4">
                                    <div className="relative inline-block">
                                        <img
                                            src={imagePreview}
                                            alt="Collection preview"
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
                                    <p className="text-xs">Please upload a collection image</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Associated Products (Read-only view) */}
                    {collection && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                                Associated Products ({associatedProducts.length})
                            </h3>

                            {associatedProducts.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="text-gray-400 text-4xl mb-4">
                                        <FontAwesomeIcon icon={faBox} />
                                    </div>
                                    <p className="text-gray-500">No products in this collection yet</p>
                                    <p className="text-xs text-gray-400 mt-2">Products are automatically added when you create them and select this collection</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-64 overflow-y-auto">
                                    {associatedProducts.map((product) => (
                                        <div key={product.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                                            <div className="flex items-start space-x-3">
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="w-12 h-12 object-cover rounded"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-medium text-gray-900 truncate">
                                                        {product.name}
                                                    </h4>
                                                    <p className="text-xs text-gray-500 truncate">{product.description}</p>
                                                    <div className="flex items-center mt-1">
                                                        <span className="text-xs font-medium text-gray-900">
                                                            {product.variantPricing ?
                                                                `Rs. ${Math.min(...Object.values(product.variantPricing).filter(p => p > 0))} - Rs. ${Math.max(...Object.values(product.variantPricing).filter(p => p > 0))}` :
                                                                `Rs. ${product.price || 0}`
                                                            }
                                                        </span>
                                                        <span className="text-xs text-gray-500 ml-2">
                                                            {product.variants?.join(', ')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
                                <FontAwesomeIcon icon={faBox} className="mr-1" />
                                Products are automatically associated with collections when created. To manage product-collection relationships, edit individual products.
                            </div>
                        </div>
                    )}

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
                            disabled={isSubmitting}
                            className="w-full sm:w-auto px-6 py-2 bg-yellow-700 hover:bg-yellow-800 text-white rounded-lg transition-colors disabled:opacity-50"
                        >
                            {isSubmitting ? 'Saving...' : (collection ? 'Update Collection' : 'Add Collection')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CollectionManagement;
