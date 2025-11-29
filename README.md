# QuickMart - Complete E-commerce Ecosystem

A comprehensive e-commerce platform that includes customer shopping, warehouse management, delivery operations, and administrative controls. Built with modern technologies to handle the complete order fulfillment lifecycle.

## 🏗️ Architecture Overview

This platform consists of 4 main applications:

1. **Customer App** (`client/`) - Shopping interface for customers
2. **Picker App** (`picker-app/`) - Warehouse worker interface for inventory and order picking
3. **Rider App** (`rider-app/`) - Delivery partner interface for order fulfillment
4. **Admin Dashboard** (`admin-dashboard/`) - Management interface with analytics
5. **Backend API** (`server/`) - Node.js/Express API with MongoDB

## 🚀 Features

### Customer Application
- **Product Catalog** - Browse products with advanced filtering and search
- **Shopping Cart** - Add/remove items with real-time inventory checking
- **Checkout Process** - Multiple payment methods (COD, Card, UPI)
- **Order Tracking** - Real-time order status updates
- **User Profiles** - Account management and address book
- **10-Minute Delivery** - Ultra-fast delivery promise

### Picker/Warehouse Application
- **Order Queue** - View and accept orders for picking
- **QR Code Scanning** - Scan bin locations for accurate picking
- **Inventory Management** - Add, remove, and transfer stock between bins
- **Bin Management** - Organize warehouse locations efficiently
- **Real-time Notifications** - Get notified of new orders and stock alerts
- **Performance Tracking** - Monitor picking efficiency and accuracy

### Rider Application
- **Delivery Queue** - View orders ready for delivery
- **Route Optimization** - Efficient delivery planning
- **Order Collection** - Collect packages from designated bins
- **Customer Communication** - In-app messaging and calling
- **Proof of Delivery** - Photo capture and digital signatures
- **Earnings Tracking** - Monitor delivery statistics and payments

### Admin Dashboard
- **Real-time Analytics** - Order metrics, sales data, and KPIs
- **Inventory Overview** - Stock levels, low stock alerts, and replenishment
- **Staff Management** - Picker and rider performance monitoring
- **Store Operations** - Multi-location warehouse management
- **Customer Insights** - User behavior and order patterns
- **Financial Reports** - Revenue tracking and profit analysis

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI framework
- **Redux Toolkit** - State management
- **React Router** - Navigation
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **React Hook Form** - Form handling
- **Socket.io Client** - Real-time communication

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Socket.io** - Real-time communication
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File uploads
- **QR Code** - QR code generation

### Additional Tools
- **Nodemailer** - Email notifications
- **Twilio** - SMS notifications
- **Stripe** - Payment processing
- **QR Scanner** - QR code scanning (frontend)

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Ecommerce
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install all app dependencies
npm run install-all
```

### 3. Environment Setup

Create `.env` file in the `server/` directory:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ecommerce-ecosystem
JWT_SECRET=your-super-secret-jwt-key

# Email Configuration
EMAIL_FROM=noreply@quickmart.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# SMS Configuration (Twilio)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Payment Gateway (Stripe)
STRIPE_SECRET_KEY=your-stripe-secret-key
```

### 4. Start MongoDB
```bash
# Start MongoDB service
mongod
```

### 5. Seed Database (Optional)
```bash
cd server
npm run seed
```

### 6. Start All Applications
```bash
# Start all applications concurrently
npm run dev
```

This will start:
- Backend API: http://localhost:5000
- Customer App: http://localhost:3000
- Picker App: http://localhost:3001
- Rider App: http://localhost:3002
- Admin Dashboard: http://localhost:3003

## 🧪 Demo Credentials

### Customer
- Email: `customer@demo.com`
- Password: `demo123`

### Picker
- Email: `picker@demo.com`
- Password: `demo123`

### Rider
- Email: `rider@demo.com`
- Password: `demo123`

### Admin
- Email: `admin@demo.com`
- Password: `demo123`

## 🗃️ Database Schema

### Core Models
- **User** - Customers, pickers, riders, and admins
- **Product** - Product catalog with inventory details
- **Order** - Customer orders with item details and tracking
- **Bin** - Warehouse storage locations with QR codes
- **Store** - Warehouse/dark store locations
- **Notification** - Real-time notifications and alerts

### Key Relationships
- Orders → Items → Products → Bin Locations
- Users → Roles (Customer/Picker/Rider/Admin)
- Stores → Bins → Products → Inventory

## 📱 Mobile Responsiveness

All applications are fully responsive and optimized for:
- Mobile phones (iOS/Android)
- Tablets
- Desktop computers
- Warehouse handheld devices

## 🔄 Real-time Features

- **Order Updates** - Live status changes across all apps
- **Inventory Sync** - Real-time stock level updates
- **Notifications** - Instant alerts for new orders, stock issues
- **Live Tracking** - Order progress visibility for customers
- **Performance Metrics** - Real-time dashboard updates

## 🧩 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile

### Products
- `GET /api/products` - Get products with filtering
- `GET /api/products/:id` - Get single product
- `POST /api/products/:id/reviews` - Add product review

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders/my-orders` - Get user orders
- `POST /api/orders/:id/accept-picking` - Accept order for picking
- `POST /api/orders/:id/items/:index/picked` - Mark item as picked

### Inventory
- `GET /api/inventory/bins` - Get warehouse bins
- `POST /api/inventory/bins/:id/add-stock` - Add stock to bin
- `POST /api/inventory/scan-qr` - Scan QR code

## 🔐 Security Features

- **JWT Authentication** - Secure token-based auth
- **Role-based Access** - Granular permission control
- **Password Hashing** - Bcrypt encryption
- **Rate Limiting** - API abuse prevention
- **Input Validation** - XSS and injection protection
- **CORS Configuration** - Cross-origin request security

## 📊 Performance Optimizations

- **Code Splitting** - Lazy loading of routes
- **Image Optimization** - Responsive images with lazy loading
- **Caching** - Redux state persistence
- **Database Indexing** - Optimized MongoDB queries
- **Real-time Updates** - Efficient Socket.io connections

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
# Build all frontend apps
cd client && npm run build
cd ../picker-app && npm run build
cd ../rider-app && npm run build
cd ../admin-dashboard && npm run build

# Start production server
cd ../server && npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Email: support@quickmart.com
- Documentation: [Link to docs]

---

**QuickMart** - Revolutionizing e-commerce with lightning-fast delivery and seamless operations.
