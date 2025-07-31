// filepath: /Users/mac/junaidAfzal/Zaki-s-Essence/src/services/contactService.js
import { collection, addDoc, serverTimestamp, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../config/firebase.js';

const CONTACT_COLLECTION = 'contactMessages';

export class ContactService {
    // Save contact message to Firestore
    static async submitContactMessage({ name, phone, message }) {
        try {
            await addDoc(collection(db, CONTACT_COLLECTION), {
                name,
                phone,
                message,
                createdAt: serverTimestamp()
            });
        } catch (error) {
            console.error('Error submitting contact message:', error);
            throw error;
        }
    }

    // Fetch all contact messages (for admin)
    static async getAllMessages() {
        try {
            const q = query(collection(db, CONTACT_COLLECTION), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.() || null
            }));
        } catch (error) {
            console.error('Error fetching contact messages:', error);
            throw error;
        }
    }
}
