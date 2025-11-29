# QuickMart Admin Dashboard

A comprehensive admin dashboard for the QuickMart e-commerce ecosystem built with React, Redux Toolkit, and Tailwind CSS.

## ✅ Completed Features

### 📊 Dashboard Pages
- **Dashboard Overview** - Real-time metrics, charts, and KPIs
- **Orders Management** - View, filter, and manage customer orders
- **Order Details** - Detailed order information with timeline tracking
- **Customer Management** - Customer profiles, statistics, and interaction history
- **Product Catalog** - Product listing with inventory status and management
- **Inventory Management** - Stock tracking, bin management, and QR code scanning
- **Staff Management** - Picker, rider, and admin staff oversight
- **Analytics Dashboard** - Comprehensive business analytics with charts
- **Settings** - System configuration and preferences

### 🎨 UI/UX Features
- **Modern Design** - Clean, professional interface with Tailwind CSS
- **Responsive Layout** - Mobile-first design that works on all devices
- **Smooth Animations** - Framer Motion animations for enhanced user experience
- **Interactive Charts** - Recharts integration for data visualization
- **Real-time Updates** - Socket.io ready for live data synchronization
- **Loading States** - Skeleton loading animations
- **Form Handling** - React Hook Form with validation

### 🛠 Technical Implementation
- **React 18** - Modern React with hooks and functional components
- **Redux Toolkit** - State management with RTK Query ready
- **React Router v6** - Client-side routing with protected routes
- **Tailwind CSS** - Utility-first CSS framework
- **Heroicons** - Beautiful SVG icons
- **Socket.io Client** - Real-time communication setup
- **Authentication** - JWT-based authentication system
- **Role-based Access** - Admin-only access controls

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   
   The backend server should have a `.env` file with:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/ecommerce-ecosystem
   JWT_SECRET=your-super-secret-jwt-key
   ```

3. **Start MongoDB**
   ```bash
   mongod
   ```

4. **Start Backend Server** (from the server directory)
   ```bash
   cd ../server
   npm install
   npm run dev
   ```

5. **Start Admin Dashboard**
   ```bash
   npm start
   ```

   The admin dashboard will be available at: http://localhost:3003

## 📱 Application Structure

```
src/
├── components/           # Reusable UI components
│   ├── common/          # Common components (LoadingSpinner, ProtectedRoute)
│   ├── layout/          # Layout components (Navbar, Sidebar)
│   └── notifications/   # Notification components
├── pages/               # Page components
│   ├── DashboardPage.js     # Main dashboard overview
│   ├── OrdersPage.js        # Orders listing and management
│   ├── OrderDetailPage.js   # Individual order details
│   ├── CustomersPage.js     # Customer management
│   ├── ProductsPage.js      # Product catalog
│   ├── InventoryPage.js     # Inventory and bin management
│   ├── StaffPage.js         # Staff management
│   ├── AnalyticsPage.js     # Business analytics
│   ├── SettingsPage.js      # System settings
│   └── auth/
│       └── LoginPage.js     # Authentication
└── store/               # Redux store and slices
    ├── store.js         # Main store configuration
    └── slices/          # Redux slices
        ├── authSlice.js
        ├── dashboardSlice.js
        ├── notificationsSlice.js
        ├── socketSlice.js
        └── uiSlice.js
```

## 🔐 Demo Credentials

**Admin User:**
- Email: `admin@demo.com`
- Password: `demo123`

## 📊 Available Analytics

- **Revenue Tracking** - Daily, weekly, monthly revenue trends
- **Order Analytics** - Order volume, status distribution, hourly patterns
- **Customer Insights** - Customer growth, satisfaction ratings
- **Product Performance** - Top-selling products, category breakdown
- **Operational Metrics** - Delivery times, accuracy rates, staff performance

## 🛡 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Role-based Access Control** - Admin-only access restrictions
- **Protected Routes** - Automatic redirection for unauthorized users
- **Session Management** - Automatic logout on token expiry

## 🎯 Key Features by Page

### Dashboard
- Real-time metrics cards
- Revenue and order trends
- Quick actions and alerts
- Recent activity feed

### Orders
- Comprehensive order listing
- Advanced filtering and search
- Order status management
- Detailed order timeline

### Customers
- Customer profiles and statistics
- Contact information management
- Order history and preferences
- Customer satisfaction ratings

### Products
- Product catalog with images
- Inventory status indicators
- Category-based filtering
- Stock level monitoring

### Inventory
- Bin location management
- QR code integration ready
- Stock level tracking
- Expiry date monitoring

### Staff
- Employee performance tracking
- Role-based staff categorization
- Activity monitoring
- Performance metrics

### Analytics
- Interactive charts and graphs
- Customizable date ranges
- Export capabilities ready
- Performance benchmarking

### Settings
- System configuration
- Notification preferences
- Delivery settings
- Payment method management
- Security configurations

## 🔄 Real-time Features (Ready)

The application is prepared for real-time updates with:
- Socket.io client integration
- Redux store updates for live data
- Notification system for alerts
- Order status synchronization

## 🚦 Current Status

✅ **Completed:**
- All page components implemented
- Redux store configured
- Authentication system
- Responsive design
- Loading states and animations
- Mock data integration

🔄 **In Progress:**
- Backend API integration
- Real-time socket connections
- Data persistence

⏳ **Next Steps:**
- API endpoint connections
- Form submissions
- Real-time notifications
- Image upload functionality
- Advanced filtering options

## 🤝 Contributing

This is part of the QuickMart e-commerce ecosystem. The admin dashboard integrates with:
- Customer shopping app (port 3000)
- Picker warehouse app (port 3001)  
- Rider delivery app (port 3002)
- Backend API server (port 5000)

## 📝 Notes

- All components use mock data currently
- Charts and analytics are fully functional with sample data
- The design system is consistent across all components
- All forms are validation-ready
- The application is fully responsive and accessible

---

**QuickMart Admin Dashboard** - Efficiently manage your e-commerce operations with style and precision.
