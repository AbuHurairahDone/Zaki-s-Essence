import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase.js';

// Admin email - you should set this to your admin email
const ADMIN_EMAILS = ['admin@zakisessence.com']; // Add your admin emails here

export class AuthService {
    // Sign in user
    static async signIn(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Check if user is admin
            const isAdmin = await this.checkAdminStatus(user.uid);

            return {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                isAdmin
            };
        } catch (error) {
            console.error('Error signing in:', error);
            throw this.handleAuthError(error);
        }
    }

    // Sign up user (for admin creation)
    static async signUp(email, password, displayName, isAdmin = false) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Update profile
            await updateProfile(user, {
                displayName: displayName
            });

            // Create user document in Firestore
            await this.createUserDocument(user.uid, {
                email: user.email,
                displayName: displayName,
                isAdmin: isAdmin,
                createdAt: new Date()
            });

            return {
                uid: user.uid,
                email: user.email,
                displayName: displayName,
                isAdmin
            };
        } catch (error) {
            console.error('Error signing up:', error);
            throw this.handleAuthError(error);
        }
    }

    // Sign out user
    static async signOut() {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Error signing out:', error);
            throw error;
        }
    }

    // Listen to authentication state changes
    static onAuthStateChanged(callback) {
        return onAuthStateChanged(auth, async (user) => {
            if (user) {
                const isAdmin = await this.checkAdminStatus(user.uid);
                callback({
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    isAdmin
                });
            } else {
                callback(null);
            }
        });
    }

    // Check if user is admin
    static async checkAdminStatus(uid) {
        try {
            const userDoc = await getDoc(doc(db, 'users', uid));
            if (userDoc.exists()) {
                return userDoc.data().isAdmin || false;
            }

            // Fallback: check if email is in admin list
            const user = auth.currentUser;
            return user && ADMIN_EMAILS.includes(user.email);
        } catch (error) {
            console.error('Error checking admin status:', error);
            return false;
        }
    }

    // Create user document in Firestore
    static async createUserDocument(uid, userData) {
        try {
            await setDoc(doc(db, 'users', uid), userData);
        } catch (error) {
            console.error('Error creating user document:', error);
            throw error;
        }
    }

    // Get current user
    static getCurrentUser() {
        return auth.currentUser;
    }

    // Check if user is authenticated
    static isAuthenticated() {
        return !!auth.currentUser;
    }

    // Handle authentication errors
    static handleAuthError(error) {
        const errorMessages = {
            'auth/user-not-found': 'No user found with this email address.',
            'auth/wrong-password': 'Incorrect password.',
            'auth/email-already-in-use': 'An account with this email already exists.',
            'auth/weak-password': 'Password should be at least 6 characters.',
            'auth/invalid-email': 'Invalid email address.',
            'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
            'auth/network-request-failed': 'Network error. Please check your connection.'
        };

        return new Error(errorMessages[error.code] || error.message);
    }

    // Admin: Create admin user
    static async createAdminUser(email, password, displayName) {
        try {
            return await this.signUp(email, password, displayName, true);
        } catch (error) {
            console.error('Error creating admin user:', error);
            throw error;
        }
    }

    // Admin: Set user as admin
    static async setUserAsAdmin(uid) {
        try {
            await setDoc(doc(db, 'users', uid), {
                isAdmin: true
            }, { merge: true });
        } catch (error) {
            console.error('Error setting user as admin:', error);
            throw error;
        }
    }
}
