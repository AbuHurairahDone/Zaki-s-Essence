import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    serverTimestamp,
    collection,
    getDocs,
    addDoc,
    deleteDoc
} from 'firebase/firestore';
import {
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject
} from 'firebase/storage';
import { db, storage } from '../config/firebase.js';

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
                            url: './src/assets/hero.jpg',
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

    // Upload new hero image
    static async uploadHeroImage(file, imageData) {
        try {
            // Create unique filename
            const timestamp = Date.now();
            const filename = `hero-images/${timestamp}-${file.name}`;
            const storageRef = ref(storage, filename);

            // Upload file
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);

            // Get current hero images
            const currentData = await this.getHeroImages();
            const newImage = {
                id: `hero-${timestamp}`,
                url: downloadURL,
                alt: imageData.alt || 'Hero image',
                isActive: imageData.isActive || false,
                order: currentData.images.length + 1,
                uploadedAt: new Date()
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

            // Delete from storage if it's not the default image
            if (imageToDelete.url.startsWith('https://')) {
                try {
                    const storageRef = ref(storage, imageToDelete.url);
                    await deleteObject(storageRef);
                } catch (storageError) {
                    console.warn('Could not delete image from storage:', storageError);
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
}
