import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp,

} from 'firebase/firestore';
import { db } from '../config/firebase.js';
import { CloudinaryService } from './cloudinaryService.js';
import heroImage from '../assets/hero.jpg';

const APP_DATA_COLLECTION = 'appData';
const HERO_IMAGES_DOC = 'heroImages';

export class AppDataService {
    // Get hero images configuration
    static async getHeroImages() {
        try {
            const docRef = doc(db, APP_DATA_COLLECTION, HERO_IMAGES_DOC);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return docSnap.data();
            } else {
                // Return default configuration if document doesn't exist
                return {
                    images: [
                        {
                            id: 'default',
                            url: heroImage,
                            alt: 'Luxury perfume bottles elegantly displayed on a marble surface with soft lighting',
                            isActive: true,
                            order: 1
                        }
                    ],
                    carouselEnabled: false,
                    autoSlideInterval: 5000,
                    updatedAt: new Date()
                };
            }
        } catch (error) {
            console.error('Error getting hero images:', error);
            throw error;
        }
    }

    // Update hero images configuration
    static async updateHeroImages(heroData) {
        try {
            const docRef = doc(db, APP_DATA_COLLECTION, HERO_IMAGES_DOC);
            await setDoc(docRef, {
                ...heroData,
                updatedAt: serverTimestamp()
            }, { merge: true });
        } catch (error) {
            console.error('Error updating hero images:', error);
            throw error;
        }
    }

    // Upload new hero image using Cloudinary
    static async uploadHeroImage(file, imageData) {
        try {
            // Validate file before upload
            const validation = CloudinaryService.validateFile(file, {
                maxSize: 10 * 1024 * 1024, // 10MB
                allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
            });

            if (!validation.isValid) {
                throw new Error(validation.errors.join(', '));
            }

            // Upload to Cloudinary
            const uploadResult = await CloudinaryService.uploadHeroImage(file, {
                alt: imageData.alt || 'Hero image'
            });

            // Get current hero images
            const currentData = await this.getHeroImages();
            const newImage = {
                id: `hero-${Date.now()}`,
                url: uploadResult.url,
                publicId: uploadResult.publicId,
                alt: imageData.alt || 'Hero image',
                isActive: imageData.isActive || false,
                order: currentData.images.length + 1,
                uploadedAt: new Date(),
                cloudinaryData: {
                    publicId: uploadResult.publicId,
                    width: uploadResult.width,
                    height: uploadResult.height,
                    format: uploadResult.format,
                    bytes: uploadResult.bytes
                }
            };

            // Add new image to the array
            const updatedImages = [...currentData.images, newImage];

            // Update the document
            await this.updateHeroImages({
                ...currentData,
                images: updatedImages
            });

            return newImage;
        } catch (error) {
            console.error('Error uploading hero image:', error);
            throw error;
        }
    }

    // Delete hero image
    static async deleteHeroImage(imageId) {
        try {
            const currentData = await this.getHeroImages();
            const imageToDelete = currentData.images.find(img => img.id === imageId);

            if (!imageToDelete) {
                throw new Error('Image not found');
            }

            // Don't allow deletion if it's the only image
            if (currentData.images.length <= 1) {
                throw new Error('Cannot delete the last hero image');
            }

            // Delete from Cloudinary if it has a publicId
            if (imageToDelete.publicId || imageToDelete.cloudinaryData?.publicId) {
                try {
                    const publicId = imageToDelete.publicId || imageToDelete.cloudinaryData?.publicId;
                    await CloudinaryService.deleteImage(publicId);
                } catch (cloudinaryError) {
                    console.warn('Could not delete image from Cloudinary:', cloudinaryError);
                    // Continue with deletion from database even if Cloudinary deletion fails
                }
            }

            // Remove from images array
            const updatedImages = currentData.images
                .filter(img => img.id !== imageId)
                .map((img, index) => ({ ...img, order: index + 1 }));

            // If the deleted image was active and there are other images, make the first one active
            if (imageToDelete.isActive && updatedImages.length > 0) {
                updatedImages[0].isActive = true;
            }

            await this.updateHeroImages({
                ...currentData,
                images: updatedImages
            });

        } catch (error) {
            console.error('Error deleting hero image:', error);
            throw error;
        }
    }

    // Update image order
    static async updateImageOrder(images) {
        try {
            const currentData = await this.getHeroImages();
            await this.updateHeroImages({
                ...currentData,
                images: images.map((img, index) => ({ ...img, order: index + 1 }))
            });
        } catch (error) {
            console.error('Error updating image order:', error);
            throw error;
        }
    }

    // Set active image
    static async setActiveImage(imageId) {
        try {
            const currentData = await this.getHeroImages();
            const updatedImages = currentData.images.map(img => ({
                ...img,
                isActive: img.id === imageId
            }));

            await this.updateHeroImages({
                ...currentData,
                images: updatedImages
            });
        } catch (error) {
            console.error('Error setting active image:', error);
            throw error;
        }
    }

    // Toggle carousel mode
    static async toggleCarousel(enabled, autoSlideInterval = 5000) {
        try {
            const currentData = await this.getHeroImages();
            await this.updateHeroImages({
                ...currentData,
                carouselEnabled: enabled,
                autoSlideInterval: autoSlideInterval
            });
        } catch (error) {
            console.error('Error toggling carousel:', error);
            throw error;
        }
    }

    // Get optimized image URL for display
    static getOptimizedImageUrl(image, options = {}) {
        if (!image.url) return null;

        // If it's a Cloudinary URL, optimize it
        if (image.url.includes('cloudinary.com')) {
            return CloudinaryService.getOptimizedUrl(image.url, options);
        }

        // Return original URL for non-Cloudinary images
        return image.url;
    }
}
