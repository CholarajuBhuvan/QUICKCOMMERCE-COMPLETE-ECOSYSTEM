const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  phone: String,
  role: { type: String, enum: ['customer', 'picker', 'rider', 'admin'] },
  isActive: { type: Boolean, default: true },
  isAvailable: { type: Boolean, default: true },
  pickerDetails: {
    storeId: mongoose.Schema.Types.ObjectId,
    isAvailable: { type: Boolean, default: true },
    currentShift: {
      startTime: Date,
      endTime: Date
    },
    totalItemsPicked: { type: Number, default: 0 },
    totalOrdersCompleted: { type: Number, default: 0 }
  },
  riderDetails: {
    employeeId: String,
    vehicleType: String,
    vehicleNumber: String,
    currentLocation: {
      type: { type: String, default: 'Point' },
      coordinates: [Number]
    }
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function createDemoUsers() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const salt = await bcrypt.genSalt(10);

    // Create Admin
    try {
      const adminExists = await User.findOne({ email: 'admin@quickmart.com' });
      if (!adminExists) {
        await User.create({
          name: 'Admin User',
          email: 'admin@quickmart.com',
          password: await bcrypt.hash('admin123', salt),
          phone: '+1234567890',
          role: 'admin',
          isActive: true
        });
        console.log('✅ Admin user created');
      } else {
        console.log('ℹ️  Admin user already exists');
      }
    } catch (err) {
      if (err.code !== 11000) throw err;
    }

    // Create Picker
    try {
      const pickerExists = await User.findOne({ email: 'picker@demo.com' });
      if (!pickerExists) {
        await User.create({
          name: 'John Picker',
          email: 'picker@demo.com',
          password: await bcrypt.hash('demo123', salt),
          phone: '+1234567891',
          role: 'picker',
          isActive: true,
          pickerDetails: {
            isAvailable: true,
            totalItemsPicked: 0,
            totalOrdersCompleted: 0
          }
        });
        console.log('✅ Picker user created');
      } else {
        console.log('ℹ️  Picker user already exists');
      }
    } catch (err) {
      if (err.code !== 11000) throw err;
      console.log('ℹ️  Picker user already exists');
    }

    // Create Rider
    try {
      const riderExists = await User.findOne({ email: 'rider@demo.com' });
      if (!riderExists) {
        await User.create({
          name: 'Mike Rider',
          email: 'rider@demo.com',
          password: await bcrypt.hash('demo123', salt),
          phone: '+1234567892',
          role: 'rider',
          isActive: true,
          riderDetails: {
            vehicleType: 'bike',
            vehicleNumber: 'ABC-1234',
            isAvailable: true,
            currentLocation: {
              latitude: 37.7749,
              longitude: -122.4194
            },
            totalDeliveries: 0,
            rating: 5
          }
        });
        console.log('✅ Rider user created');
      } else {
        console.log('ℹ️  Rider user already exists');
      }
    } catch (err) {
      if (err.code !== 11000) throw err;
      console.log('ℹ️  Rider user already exists');
    }

    // Create Customer
    try {
      const customerExists = await User.findOne({ email: 'customer@demo.com' });
      if (!customerExists) {
        await User.create({
          name: 'Demo Customer',
          email: 'customer@demo.com',
          password: await bcrypt.hash('demo123', salt),
          phone: '+1234567893',
          role: 'customer',
          isActive: true
        });
        console.log('✅ Customer user created');
      } else {
        console.log('ℹ️  Customer user already exists');
      }
    } catch (err) {
      if (err.code !== 11000) throw err;
    }

    console.log('\n========================================');
    console.log('✅ ALL DEMO USERS CREATED SUCCESSFULLY!');
    console.log('========================================\n');
    console.log('Login Credentials:\n');
    console.log('Admin Dashboard:');
    console.log('  Email: admin@quickmart.com');
    console.log('  Password: admin123\n');
    console.log('Picker App:');
    console.log('  Email: picker@demo.com');
    console.log('  Password: demo123\n');
    console.log('Rider App:');
    console.log('  Email: rider@demo.com');
    console.log('  Password: demo123\n');
    console.log('Customer App:');
    console.log('  Email: customer@demo.com');
    console.log('  Password: demo123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createDemoUsers();
