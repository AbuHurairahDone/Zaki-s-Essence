import React, { useState, useEffect } from 'react';
import { AppDataService } from '../../services/appDataService.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faImage,
    faPlus,
    faTrash,
    faEdit,
    faEye,
    faEyeSlash,
    faArrowUp,
    faArrowDown,
    faSave,
    faTimes,
    faPlay,
    faPause,
    faUpload
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

function HeroImageManagement() {
    const [heroData, setHeroData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingImage, setEditingImage] = useState(null);
    const [draggedItem, setDraggedItem] = useState(null);

    useEffect(() => {
        loadHeroData();
    }, []);

    const loadHeroData = async () => {
        try {
            const data = await AppDataService.getHeroImages();
            setHeroData(data);
        } catch (error) {
            console.error('Error loading hero data:', error);
            toast.error('Failed to load hero images');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (file, imageData) => {
        try {
            setUploading(true);
            await AppDataService.uploadHeroImage(file, imageData);
            toast.success('Hero image uploaded successfully');
            loadHeroData();
            setShowAddModal(false);
        } catch (error) {
            console.error('Error uploading image:', error);
            toast.error('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteImage = async (imageId) => {
        if (!window.confirm('Are you sure you want to delete this image?')) return;

        try {
            await AppDataService.deleteHeroImage(imageId);
            toast.success('Image deleted successfully');
            loadHeroData();
        } catch (error) {
            console.error('Error deleting image:', error);
            toast.error(error.message || 'Failed to delete image');
        }
    };

    const handleSetActive = async (imageId) => {
        try {
            await AppDataService.setActiveImage(imageId);
            toast.success('Active image updated');
            loadHeroData();
        } catch (error) {
            console.error('Error setting active image:', error);
            toast.error('Failed to update active image');
        }
    };

    const handleToggleCarousel = async () => {
        try {
            await AppDataService.toggleCarousel(
                !heroData.carouselEnabled,
                heroData.autoSlideInterval
            );
            toast.success(
                heroData.carouselEnabled
                    ? 'Carousel disabled'
                    : 'Carousel enabled'
            );
            loadHeroData();
        } catch (error) {
            console.error('Error toggling carousel:', error);
            toast.error('Failed to toggle carousel');
        }
    };

    const handleUpdateInterval = async (interval) => {
        try {
            await AppDataService.toggleCarousel(heroData.carouselEnabled, interval);
            toast.success('Auto-slide interval updated');
            loadHeroData();
        } catch (error) {
            console.error('Error updating interval:', error);
            toast.error('Failed to update interval');
        }
    };

    const handleDragStart = (e, index) => {
        setDraggedItem(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = async (e, dropIndex) => {
        e.preventDefault();

        if (draggedItem === null || draggedItem === dropIndex) return;

        const newImages = [...heroData.images];
        const draggedImage = newImages[draggedItem];

        newImages.splice(draggedItem, 1);
        newImages.splice(dropIndex, 0, draggedImage);

        try {
            await AppDataService.updateImageOrder(newImages);
            toast.success('Image order updated');
            loadHeroData();
        } catch (error) {
            console.error('Error updating order:', error);
            toast.error('Failed to update order');
        }

        setDraggedItem(null);
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Hero Image Management</h1>
                    <p className="text-sm sm:text-base text-gray-600">Manage hero section images and carousel settings</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="w-full sm:w-auto bg-yellow-700 hover:bg-yellow-800 text-white px-4 py-2 rounded-lg flex items-center justify-center transition-colors"
                >
                    <FontAwesomeIcon icon={faPlus} className="mr-2" />
                    Add Image
                </button>
            </div>

            {/* Carousel Settings */}
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                <h2 className="text-lg font-semibold mb-4">Carousel Settings</h2>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={heroData.carouselEnabled}
                            onChange={handleToggleCarousel}
                            className="mr-2"
                        />
                        <span className="text-sm sm:text-base">Enable Carousel</span>
                    </label>

                    {heroData.carouselEnabled && (
                        <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-600">Auto-slide interval:</label>
                            <select
                                value={heroData.autoSlideInterval}
                                onChange={(e) => handleUpdateInterval(Number(e.target.value))}
                                className="px-3 py-1 border border-gray-300 rounded text-sm"
                            >
                                <option value={3000}>3 seconds</option>
                                <option value={5000}>5 seconds</option>
                                <option value={7000}>7 seconds</option>
                                <option value={10000}>10 seconds</option>
                            </select>
                        </div>
                    )}
                </div>
            </div>

            {/* Images Grid */}
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                <h2 className="text-lg font-semibold mb-4">
                    Hero Images ({heroData.images?.length || 0})
                </h2>

                {heroData.images?.length === 0 ? (
                    <div className="text-center py-12">
                        <FontAwesomeIcon icon={faImage} className="text-4xl text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">No hero images</h3>
                        <p className="text-gray-500 mb-4">Add your first hero image to get started</p>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="bg-yellow-700 hover:bg-yellow-800 text-white px-4 py-2 rounded-lg"
                        >
                            Add Image
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {heroData.images
                            .sort((a, b) => a.order - b.order)
                            .map((image, index) => (
                                <HeroImageCard
                                    key={image.id}
                                    image={image}
                                    index={index}
                                    onDelete={handleDeleteImage}
                                    onSetActive={handleSetActive}
                                    onDragStart={handleDragStart}
                                    onDragOver={handleDragOver}
                                    onDrop={handleDrop}
                                    isDragging={draggedItem === index}
                                />
                            ))}
                    </div>
                )}
            </div>

            {/* Add Image Modal */}
            {showAddModal && (
                <AddImageModal
                    onClose={() => setShowAddModal(false)}
                    onUpload={handleFileUpload}
                    uploading={uploading}
                />
            )}
        </div>
    );
}

// Hero Image Card Component
function HeroImageCard({
    image,
    index,
    onDelete,
    onSetActive,
    onDragStart,
    onDragOver,
    onDrop,
    isDragging
}) {
    return (
        <div
            draggable
            onDragStart={(e) => onDragStart(e, index)}
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, index)}
            className={`relative bg-white border-2 rounded-lg overflow-hidden transition-all cursor-move ${image.isActive
                    ? 'border-yellow-500 ring-2 ring-yellow-200'
                    : 'border-gray-200 hover:border-gray-300'
                } ${isDragging ? 'opacity-50' : ''}`}
        >
            {/* Active Badge */}
            {image.isActive && (
                <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full z-10">
                    Active
                </div>
            )}

            {/* Order Badge */}
            <div className="absolute top-2 right-2 bg-gray-900 text-white text-xs px-2 py-1 rounded-full z-10">
                #{image.order}
            </div>

            {/* Image */}
            <div className="aspect-video">
                <img
                    src={image.url}
                    alt={image.alt}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Actions */}
            <div className="p-3 space-y-2">
                <p className="text-sm text-gray-600 truncate">{image.alt}</p>
                <div className="flex flex-wrap gap-2">
                    {!image.isActive && (
                        <button
                            onClick={() => onSetActive(image.id)}
                            className="flex-1 text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded transition-colors"
                        >
                            <FontAwesomeIcon icon={faEye} className="mr-1" />
                            Set Active
                        </button>
                    )}
                    <button
                        onClick={() => onDelete(image.id)}
                        className="flex-1 text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded transition-colors"
                    >
                        <FontAwesomeIcon icon={faTrash} className="mr-1" />
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

// Add Image Modal Component
function AddImageModal({ onClose, onUpload, uploading }) {
    const [file, setFile] = useState(null);
    const [alt, setAlt] = useState('');
    const [preview, setPreview] = useState(null);

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setAlt(`Hero image - ${selectedFile.name.split('.')[0]}`);

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => setPreview(e.target.result);
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            toast.error('Please select an image');
            return;
        }

        await onUpload(file, { alt });
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold">Add Hero Image</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <FontAwesomeIcon icon={faTimes} className="text-xl" />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* File Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Image
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-700"
                            required
                        />
                    </div>

                    {/* Preview */}
                    {preview && (
                        <div className="aspect-video rounded-lg overflow-hidden">
                            <img
                                src={preview}
                                alt="Preview"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    {/* Alt Text */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Alt Text
                        </label>
                        <input
                            type="text"
                            value={alt}
                            onChange={(e) => setAlt(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-700"
                            placeholder="Describe the image for accessibility"
                            required
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={uploading}
                            className="flex-1 bg-yellow-700 hover:bg-yellow-800 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                        >
                            {uploading ? (
                                <>
                                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2 inline-block"></div>
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <FontAwesomeIcon icon={faUpload} className="mr-2" />
                                    Upload Image
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default HeroImageManagement;
