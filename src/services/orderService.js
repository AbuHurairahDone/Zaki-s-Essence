import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase.js';

// Collection reference
const ORDERS_COLLECTION = 'orders';

// Order status constants
export const ORDER_STATUS = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled'
};

export class OrderService {
    // Create new order
    static async createOrder(orderData) {
        try {
            const order = {
                ...orderData,
                status: ORDER_STATUS.PENDING,
                orderNumber: this.generateOrderNumber(),
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            const docRef = await addDoc(collection(db, ORDERS_COLLECTION), order);
            return {
                id: docRef.id,
                ...order
            };
        } catch (error) {
            console.error('Error creating order:', error);
            throw error;
        }
    }

    // Get all orders (Admin only)
    static async getAllOrders(statusFilter = null, limitCount = 50) {
        try {
            let q = query(
                collection(db, ORDERS_COLLECTION),
                orderBy('createdAt', 'desc'),
                limit(limitCount)
            );

            if (statusFilter) {
                q = query(
                    collection(db, ORDERS_COLLECTION),
                    where('status', '==', statusFilter),
                    orderBy('createdAt', 'desc'),
                    limit(limitCount)
                );
            }

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate(),
                updatedAt: doc.data().updatedAt?.toDate()
            }));
        } catch (error) {
            console.error('Error fetching orders:', error);
            throw error;
        }
    }

    // Get orders by customer email
    static async getOrdersByCustomer(customerEmail) {
        try {
            const q = query(
                collection(db, ORDERS_COLLECTION),
                where('customerInfo.email', '==', customerEmail),
                orderBy('createdAt', 'desc')
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate(),
                updatedAt: doc.data().updatedAt?.toDate()
            }));
        } catch (error) {
            console.error('Error fetching customer orders:', error);
            throw error;
        }
    }

    // Get single order
    static async getOrder(orderId) {
        try {
            const docRef = doc(db, ORDERS_COLLECTION, orderId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                return {
                    id: docSnap.id,
                    ...data,
                    createdAt: data.createdAt?.toDate(),
                    updatedAt: data.updatedAt?.toDate()
                };
            } else {
                throw new Error('Order not found');
            }
        } catch (error) {
            console.error('Error fetching order:', error);
            throw error;
        }
    }

    // Update order status (Admin only)
    static async updateOrderStatus(orderId, status, adminNotes = '') {
        try {
            const docRef = doc(db, ORDERS_COLLECTION, orderId);
            const updateData = {
                status,
                updatedAt: serverTimestamp()
            };

            if (adminNotes) {
                updateData.adminNotes = adminNotes;
            }

            // Add status history
            const order = await this.getOrder(orderId);
            const statusHistory = order.statusHistory || [];
            statusHistory.push({
                status,
                timestamp: new Date(),
                notes: adminNotes
            });
            updateData.statusHistory = statusHistory;

            await updateDoc(docRef, updateData);
        } catch (error) {
            console.error('Error updating order status:', error);
            throw error;
        }
    }

    // Get order statistics (Admin only)
    static async getOrderStatistics() {
        try {
            const orders = await this.getAllOrders(null, 1000); // Get more orders for stats

            const stats = {
                total: orders.length,
                pending: orders.filter(order => order.status === ORDER_STATUS.PENDING).length,
                confirmed: orders.filter(order => order.status === ORDER_STATUS.CONFIRMED).length,
                processing: orders.filter(order => order.status === ORDER_STATUS.PROCESSING).length,
                shipped: orders.filter(order => order.status === ORDER_STATUS.SHIPPED).length,
                delivered: orders.filter(order => order.status === ORDER_STATUS.DELIVERED).length,
                cancelled: orders.filter(order => order.status === ORDER_STATUS.CANCELLED).length,
                totalRevenue: orders
                    .filter(order => order.status !== ORDER_STATUS.CANCELLED)
                    .reduce((sum, order) => sum + (order.totalAmount || 0), 0)
            };

            return stats;
        } catch (error) {
            console.error('Error getting order statistics:', error);
            throw error;
        }
    }

    // Generate unique order number
    static generateOrderNumber() {
        const timestamp = Date.now().toString().slice(-8);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `ZE${timestamp}${random}`;
    }

    // Get recent orders (Admin dashboard)
    static async getRecentOrders(limitCount = 10) {
        try {
            const q = query(
                collection(db, ORDERS_COLLECTION),
                orderBy('createdAt', 'desc'),
                limit(limitCount)
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate(),
                updatedAt: doc.data().updatedAt?.toDate()
            }));
        } catch (error) {
            console.error('Error fetching recent orders:', error);
            throw error;
        }
    }
}
