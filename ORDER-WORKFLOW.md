# Complete Order Workflow - QuickCommerce Ecosystem

## 📦 End-to-End Order Flow

### 1. **Customer Places Order** 
**Status:** `pending` → `confirmed`

**Customer Actions:**
- Browse products on http://localhost:3000
- Add items to cart
- Fill delivery address at checkout
- Select payment method (COD, Card, UPI, Wallet)
- Submit order

**System Actions:**
- ✅ Auto-confirms order (status: `confirmed`)
- ✅ Reserves stock for ordered items
- ✅ Generates delivery OTP (for COD orders)
- ✅ Calculates pricing (subtotal, tax 5%, delivery fee ₹40 if <₹500)

**Notifications Sent:**
- 🛒 **To All Pickers:** "New Order to Pick - Order #ORDxxx needs picking - X items" (HIGH priority, action required)
- 📦 **To All Riders:** "New Order Incoming - Order #ORDxxx placed - Delivery to [City]" (includes full address)
- 📱 **To Admin:** "New Order Placed - Order #ORDxxx"
- ✉️ **To Customer:** Order confirmation

**Real-time Socket Events:**
- `new-order-for-picking` → pickers room (with item list)
- `new-order-incoming` → riders room (with delivery address)
- `new-order` → admin room

---

### 2. **Picker Accepts Order**
**Status:** `confirmed` → `picking`

**Picker Actions:**
1. Login to picker app: http://localhost:3001
2. View new order notification
3. Click "Accept Order" button
4. Start picking items from warehouse

**API Endpoint:** `POST /api/orders/:id/accept-picking`

**System Actions:**
- ✅ Assigns picker to order
- ✅ Sets `pickingStartedAt` timestamp
- ✅ Updates all items to `pickingStatus: 'assigned'`

**Notifications Sent:**
- 📱 **To Customer:** "Order Picking Started - Your order is being picked"

**Real-time Socket Events:**
- `order-update` → customer room

---

### 3. **Picker Picks Items & Places in Bin**
**Status:** `picking` → `picked` (when all items picked)

**Picker Actions:**
1. Scan/select product QR code
2. Pick item from warehouse shelf
3. Select bin to place item
4. Mark item as "Picked"
5. Repeat for all items

**API Endpoint:** `POST /api/orders/:orderId/items/:itemIndex/picked`

**Request Body:**
```json
{
  "binId": "mongoId",
  "notes": "Optional picking notes"
}
```

**System Actions:**
- ✅ Marks item as `pickingStatus: 'picked'`
- ✅ Records bin location for each item
- ✅ Updates bin inventory
- ✅ When ALL items picked → changes order status to `picked`
- ✅ Updates picker stats (`totalItemsPicked++`)

**Notifications Sent (when all items picked):**
- 📦 **To All Riders:** "Order Ready for Pickup - Order #ORDxxx is picked and ready in bin - Deliver to [City]" (HIGH priority, action required)
- ✅ **To Customer:** "Order Picked & Ready - Your order will be delivered soon!"
- 📱 **To Admin:** Order picking completed

**Real-time Socket Events:**
- `order-ready-for-pickup` → riders room (with bin location & delivery details)
- `order-update` → customer room

---

### 4. **Rider Accepts Delivery**
**Status:** `picked` → `ready_for_delivery`

**Rider Actions:**
1. Login to rider app: http://localhost:3002
2. View "Order Ready for Pickup" notification
3. Click "Accept Delivery" button
4. View delivery address and bin location

**API Endpoint:** `POST /api/orders/:id/accept-delivery`

**System Actions:**
- ✅ Assigns rider to order
- ✅ Sets `assignedForDeliveryAt` timestamp
- ✅ Status changes to `ready_for_delivery`

**Notifications Sent:**
- 📱 **To Customer:** "Delivery Partner Assigned - Your order has been assigned to a delivery partner"

---

### 5. **Rider Picks Order from Bin**
**Status:** `ready_for_delivery` → `out_for_delivery`

**Rider Actions:**
1. Go to warehouse bin location
2. Collect all items from bin
3. Verify items match order
4. Click "Mark as Picked Up"
5. Start delivery

**API Endpoint:** `POST /api/orders/:id/pickup`

**System Actions:**
- ✅ Sets `pickedUpAt` timestamp
- ✅ Status changes to `out_for_delivery`

**Notifications Sent:**
- 🚚 **To Customer:** "Order Out for Delivery - Your order is on its way!"
- 📱 **To Admin:** Order out for delivery

**Real-time Socket Events:**
- `order-update` → customer room & admin room

---

### 6. **Rider Delivers to Customer**
**Status:** `out_for_delivery` → `delivered`

**Rider Actions:**
1. Navigate to delivery address
2. Arrive at customer location
3. Ask customer for OTP (COD orders only)
4. Enter delivery OTP in app
5. Hand over order to customer
6. Click "Mark as Delivered"
7. Optional: Add delivery notes

**API Endpoint:** `POST /api/orders/:id/deliver`

**Request Body:**
```json
{
  "deliveryOTP": "123456",  // Required for COD
  "deliveryNotes": "Delivered to security guard"  // Optional
}
```

**System Actions:**
- ✅ Verifies delivery OTP (for COD orders)
- ✅ Sets `deliveredAt` timestamp
- ✅ Status changes to `delivered`
- ✅ Payment status → `paid`
- ✅ Updates rider stats (`totalDeliveries++`)

**Notifications Sent:**
- 🎉 **To Customer:** "Order Delivered Successfully! Thank you for shopping!"
- 📱 **To Admin:** Order delivered confirmation

**Real-time Socket Events:**
- `order-update` → customer room
- `order-delivered` → admin room

---

## 🔐 Authentication & Authorization

### Required Roles:
- **Customer:** Can place orders, view order status, cancel orders
- **Picker:** Can accept picking, mark items as picked, view warehouse inventory
- **Rider:** Can accept delivery, pickup from bin, mark as delivered
- **Admin:** Can view all orders, manage all operations

### Login Credentials:
- **Admin:** admin@quickmart.com / admin123 (http://localhost:3003)
- **Customer:** Register at http://localhost:3000/register
- **Picker:** Use demo picker account (see PICKER-LOGIN-GUIDE.md)
- **Rider:** Use demo rider account

---

## 📊 Order Status Flow

```
pending → confirmed → picking → picked → ready_for_delivery → out_for_delivery → delivered
   ↓                                                                                    
cancelled (can be cancelled at any stage before delivery)
```

---

## 🔔 Real-time Notifications Summary

### Picker Receives:
1. New order to pick (when customer places order)
2. Order status updates

### Rider Receives:
1. New order incoming (when customer places order - for awareness)
2. **Order ready for pickup (when picker completes picking - HIGH priority)**
3. Order status updates

### Customer Receives:
1. Order confirmation
2. Picking started
3. Order picked & ready
4. Delivery partner assigned
5. Out for delivery
6. Delivered

### Admin Receives:
1. All order events
2. Real-time dashboard updates

---

## 🚀 Testing the Complete Flow

### Step-by-Step Test:

1. **Start all apps:**
   - Ensure all 5 PowerShell windows are running
   - Backend: http://localhost:5000
   - Customer: http://localhost:3000
   - Picker: http://localhost:3001
   - Rider: http://localhost:3002
   - Admin: http://localhost:3003

2. **Customer places order:**
   - Go to http://localhost:3000
   - Add products to cart
   - Checkout and place order
   - ✅ Verify notification appears

3. **Picker picks items:**
   - Go to http://localhost:3001
   - See "New Order to Pick" notification
   - Accept order
   - Mark each item as picked with bin location
   - ✅ All items picked → order ready

4. **Rider delivers:**
   - Go to http://localhost:3002
   - See "Order Ready for Pickup" notification
   - Accept delivery
   - Mark as picked up from bin
   - Enter delivery OTP and mark as delivered
   - ✅ Order complete!

---

## 📱 API Endpoints Summary

| Endpoint | Method | Role | Description |
|----------|--------|------|-------------|
| `/api/orders` | POST | Customer | Place new order |
| `/api/orders/:id/accept-picking` | POST | Picker | Accept order for picking |
| `/api/orders/:orderId/items/:itemIndex/picked` | POST | Picker | Mark item as picked |
| `/api/orders/delivery/available` | GET | Rider | Get orders ready for delivery |
| `/api/orders/:id/accept-delivery` | POST | Rider | Accept order for delivery |
| `/api/orders/:id/pickup` | POST | Rider | Mark as picked up from bin |
| `/api/orders/:id/deliver` | POST | Rider | Mark as delivered |
| `/api/orders/:id/cancel` | POST | Customer | Cancel order |

---

## 💡 Key Features

- ✅ Real-time notifications via Socket.io
- ✅ Automatic order confirmation
- ✅ Stock reservation on order placement
- ✅ Bin-based inventory management
- ✅ OTP-based delivery verification (COD)
- ✅ Multi-role workflow coordination
- ✅ Complete order tracking
- ✅ Automated notifications at each stage
- ✅ Non-blocking notification system (won't fail order creation)

---

## 🎯 Order placed successfully!
The complete workflow is now active. All notifications will be sent automatically at each stage of the order lifecycle.
