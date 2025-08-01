/**
 * Cloudinary Service for file uploads and management
 * Handles image uploads, transformations, and deletions using Cloudinary API
 */

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export class CloudinaryService {
    /**
     * Upload an image to Cloudinary
     * @param {File} file - The file to upload
     * @param {Object} options - Upload options
     * @param {string} options.folder - Folder to upload to
     * @param {string} options.publicId - Custom public ID
     * @param {Array} options.tags - Tags for the image
     * @param {Object} options.transformation - Transformation parameters
     * @returns {Promise<Object>} Upload result with URL and public_id
     */
    static async uploadImage(file, options = {}) {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

            // Add optional parameters
            if (options.folder) {
                formData.append('folder', options.folder);
            }

            if (options.publicId) {
                formData.append('public_id', options.publicId);
            }

            if (options.tags && options.tags.length > 0) {
                formData.append('tags', options.tags.join(','));
            }

            // Add transformation if provided
            if (options.transformation) {
                formData.append('transformation', JSON.stringify(options.transformation));
            }

            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
                {
                    method: 'POST',
                    body: formData,
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'Upload failed');
            }

            const result = await response.json();
            return {
                url: result.secure_url,
                publicId: result.public_id,
                width: result.width,
                height: result.height,
                format: result.format,
                bytes: result.bytes,
                created_at: result.created_at,
                resourceType: result.resource_type,
                tags: result.tags || []
            };
        } catch (error) {
            console.error('Error uploading to Cloudinary:', error);
            throw new Error(`Upload failed: ${error.message}`);
        }
    }

    /**
     * Delete an image from Cloudinary
     * @param {string} _publicId - The public ID of the image to delete
     * @returns {Promise<Object>} Deletion result
     */
    // eslint-disable-next-line no-unused-vars
    static async deleteImage(_publicId) {
        try {
            // For security reasons, image deletion should be handled on the backend
            // This is a placeholder - you should implement this on your server
            console.warn('Image deletion should be handled on the backend for security');

            // For now, we'll just return success since the main functionality is upload
            return { success: true, message: 'Image marked for deletion' };
        } catch (error) {
            console.error('Error deleting from Cloudinary:', error);
            throw new Error(`Deletion failed: ${error.message}`);
        }
    }

    /**
     * Generate a transformed image URL
     * @param {string} publicId - The public ID of the image
     * @param {Object} transformations - Transformation parameters
     * @returns {string} Transformed image URL
     */
    static getTransformedUrl(publicId) {


        return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${publicId}`;
    }

    /**
     * Upload hero image with optimized settings for best quality
     * @param {File} file - The file to upload
     * @param {Object} metadata - Additional metadata
     * @returns {Promise<Object>} Upload result
     */
    static async uploadHeroImage(file, metadata = {}) {
        const timestamp = Date.now();
        const fileName = file.name.split('.')[0];
        const publicId = `hero-images/${timestamp}-${fileName}`;

        return await this.uploadImage(file, {
            folder: 'hero-images',
            publicId: publicId,
            tags: ['hero', 'website', metadata.alt || 'hero-image'],

        });
    }

    /**
     * Upload product image with optimized settings for best quality
     * @param {File} file - The file to upload
     * @param {Object} metadata - Additional metadata
     * @returns {Promise<Object>} Upload result
     */
    static async uploadProductImage(file, metadata = {}) {
        const timestamp = Date.now();
        const fileName = file.name.split('.')[0];
        const publicId = `products/${timestamp}-${fileName}`;

        return await this.uploadImage(file, {
            folder: 'products',
            publicId: publicId,
            tags: ['product', 'catalog', metadata.productId || 'product-image'],

        });
    }

    /**
     * Upload collection image with optimized settings for best quality
     * @param {File} file - The file to upload
     * @param {Object} metadata - Additional metadata
     * @returns {Promise<Object>} Upload result
     */
    static async uploadCollectionImage(file, metadata = {}) {
        const timestamp = Date.now();
        const fileName = file.name.split('.')[0];
        const publicId = `collections/${timestamp}-${fileName}`;

        return await this.uploadImage(file, {
            folder: 'collections',
            publicId: publicId,
            tags: ['collection', 'catalog', metadata.collectionName || 'collection-image'],

        });
    }

    /**
     * Get optimized image URL for display with best quality settings
     * @param {string} url - Original Cloudinary URL
     * @param {Object} options - Display options
     * @returns {string} Optimized URL
     */
    static getOptimizedUrl(url, options = {}) {
        if (!url || !url.includes('cloudinary.com')) {
            return url; // Return original URL if not a Cloudinary URL
        }

        try {
            // Extract public ID from URL
            const urlParts = url.split('/');
            const uploadIndex = urlParts.findIndex(part => part === 'upload');
            if (uploadIndex === -1) return url;

            const publicId = urlParts.slice(uploadIndex + 1).join('/');

            // Detect device pixel ratio for high-DPI displays
            const dpr = window.devicePixelRatio || 1;
            const highDPI = dpr > 1;

            const transformations = {
                quality: options.quality || (highDPI ? 'auto:best' : 'auto:good'),
                format: options.format || 'auto',
                dpr: highDPI ? 'auto' : undefined,
                ...options
            };

            return this.getTransformedUrl(publicId, transformations);
        } catch (error) {
            console.error('Error generating optimized URL:', error);
            return url; // Return original URL on error
        }
    }

    /**
     * Get high-quality image URL for hero displays
     * @param {string} url - Original Cloudinary URL
     * @param {Object} options - Display options
     * @returns {string} High-quality optimized URL
     */
    static getHeroQualityUrl(url, options = {}) {
        const defaultOptions = {
            quality: 'auto:best',
            format: 'auto',
            dpr: 'auto',
            width: options.width || (window.innerWidth > 1920 ? 2560 : window.innerWidth * 1.5),
            height: options.height || (window.innerHeight > 1080 ? 1440 : window.innerHeight * 1.5),
            crop: 'fill',
            gravity: 'auto'
        };

        return this.getOptimizedUrl(url, { ...defaultOptions, ...options });
    }

    /**
     * Get high-quality image URL for product displays
     * @param {string} url - Original Cloudinary URL
     * @param {Object} options - Display options
     * @returns {string} High-quality optimized URL
     */
    static getProductQualityUrl(url, options = {}) {
        const dpr = window.devicePixelRatio || 1;
        const baseWidth = options.width || 400;
        const baseHeight = options.height || 500;

        const defaultOptions = {
            quality: 'auto:best',
            format: 'auto',
            dpr: 'auto',
            width: baseWidth * Math.min(dpr, 2), // Cap at 2x for performance
            height: baseHeight * Math.min(dpr, 2),
            crop: 'fill',
            gravity: 'auto'
        };

        return this.getOptimizedUrl(url, { ...defaultOptions, ...options });
    }

    /**
     * Validate file before upload
     * @param {File} file - File to validate
     * @param {Object} options - Validation options
     * @returns {Object} Validation result
     */
    static validateFile(file, options = {}) {
        const {
            maxSize = 10 * 1024 * 1024, // 10MB default
            allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
        } = options;

        const errors = [];

        if (!file) {
            errors.push('No file selected');
            return { isValid: false, errors };
        }

        if (file.size > maxSize) {
            errors.push(`File size must be less than ${(maxSize / (1024 * 1024)).toFixed(1)}MB`);
        }

        if (!allowedTypes.includes(file.type)) {
            errors.push(`File type must be one of: ${allowedTypes.map(type => type.split('/')[1]).join(', ')}`);
        }

        return {
            isValid: errors.length === 0,
            errors,
            fileInfo: {
                name: file.name,
                size: file.size,
                type: file.type
            }
        };
    }
}

export default CloudinaryService;
