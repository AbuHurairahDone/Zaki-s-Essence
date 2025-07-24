# Zaki's Essence - Premium Fragrance E-commerce Platform

A modern, full-featured e-commerce platform for luxury fragrances built with React, Firebase, and Tailwind CSS. Features a complete admin panel for order and product management.

## 🌟 Features

### Customer Features
- **Product Catalog**: Browse premium fragrances with detailed descriptions
- **Smart Shopping Cart**: Add/remove items with quantity management
- **Responsive Design**: Optimized for all devices
- **Smooth Animations**: Enhanced user experience with CSS animations
- **Order Placement**: Complete checkout flow with customer information

### Admin Features
- **Secure Admin Panel**: Role-based authentication system
- **Dashboard Analytics**: Order statistics and revenue tracking
- **Product Management**: Add, edit, delete products with image uploads
- **Collection Management**: Organize products into themed collections
- **Order Management**: Track orders with status updates and history
- **Real-time Updates**: Live data synchronization with Firebase

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Firebase (Firestore, Authentication, Storage)
- **Icons**: FontAwesome
- **Notifications**: React Toastify
- **Routing**: React Router DOM

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Zaki-s-Essence
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Firebase Setup**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Firestore Database
   - Enable Authentication (Email/Password)
   - Enable Storage (optional, for image uploads)
   - Get your Firebase configuration

4. **Environment Configuration**
   - Copy `.env.example` to `.env`
   - Add your Firebase configuration to the `.env` file

5. **Update Firebase Configuration**
   ```javascript
   // src/config/firebase.js
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-project-id.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project-id.appspot.com",
     messagingSenderId: "your-sender-id",
     appId: "your-app-id"
   };
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Access the application**
   - Main site: `http://localhost:5173`
   - Admin panel: `http://localhost:5173/admin`

## 🔐 Admin Setup

### Creating Admin User
1. **Method 1: Update Admin Emails**
   ```javascript
   // src/services/authService.js
   const ADMIN_EMAILS = ['your-admin-email@domain.com'];
   ```

2. **Method 2: Use Firebase Console**
   - Create user in Firebase Authentication
   - Add user document in Firestore `users` collection:
   ```json
   {
     "email": "admin@domain.com",
     "isAdmin": true,
     "displayName": "Admin Name"
   }
   ```

### Admin Panel Access
- Navigate to `/admin`
- Sign in with admin credentials
- Access dashboard, products, collections, and orders

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── admin/           # Admin panel components
│   ├── CartPanel.jsx    # Shopping cart with checkout
│   ├── Navbar.jsx       # Navigation component
│   └── ...
├── contexts/            # React contexts
│   ├── AuthContext.jsx  # Authentication state
│   ├── CartContext.jsx  # Shopping cart state
│   └── Product.jsx      # Product data state
├── services/            # Firebase services
│   ├── authService.js   # Authentication operations
│   ├── orderService.js  # Order management
│   └── productService.js # Product operations
├── config/              # Configuration files
│   └── firebase.js      # Firebase initialization
└── ...
```

## 🛒 Order Management

### Order Statuses
- **Pending**: New order received
- **Confirmed**: Order confirmed by admin
- **Processing**: Order being prepared
- **Shipped**: Order shipped to customer
- **Delivered**: Order delivered successfully
- **Cancelled**: Order cancelled

### Order Flow
1. Customer adds items to cart
2. Customer proceeds to checkout
3. Order created with "pending" status
4. Admin can update status through admin panel
5. Status history is maintained for tracking

## 🎨 Customization

### Styling
- Tailwind CSS for responsive design
- Custom animations in `src/index.css`
- Color scheme can be modified in Tailwind config

### Product Data
- Products can be managed through admin panel
- Initial product data in `src/products.js` (fallback)
- Firebase Firestore for production data

### Collections
- Create themed product collections
- Manage through admin panel
- Display on main website

## 🔧 Firebase Collections Structure

### Products Collection
```json
{
  "name": "Product Name",
  "description": "Product description",
  "price": 99.99,
  "category": "Floral",
  "image": "image-url",
  "rating": 4.5,
  "variants": ["50ml", "100ml"],
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### Orders Collection
```json
{
  "orderNumber": "ZE12345678",
  "status": "pending",
  "items": [
    {
      "product": {...},
      "variant": "50ml",
      "quantity": 2
    }
  ],
  "customerInfo": {
    "name": "Customer Name",
    "email": "customer@email.com",
    "phone": "123-456-7890"
  },
  "shippingAddress": {...},
  "totalAmount": 199.98,
  "createdAt": "timestamp",
  "statusHistory": [...]
}
```

### Users Collection
```json
{
  "email": "user@email.com",
  "displayName": "User Name",
  "isAdmin": false,
  "createdAt": "timestamp"
}
```

## 📱 Responsive Design

- Mobile-first approach
- Responsive admin panel
- Touch-friendly interfaces
- Optimized for all screen sizes

## 🔒 Security Features

- Firebase Authentication
- Role-based access control
- Admin-only routes protection
- Input validation and sanitization
- Secure API calls

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

### Environment Variables
- Set up environment variables in your hosting platform
- Configure Firebase security rules
- Set up proper CORS policies

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact: [your-email@domain.com]

## 🎯 Future Enhancements

- Payment gateway integration (Stripe/PayPal)
- Email notifications for orders
- Advanced product filtering
- Customer reviews and ratings
- Inventory management
- Multi-language support
- SEO optimization
- Analytics dashboard

---

Built with ❤️ by [Your Name]
