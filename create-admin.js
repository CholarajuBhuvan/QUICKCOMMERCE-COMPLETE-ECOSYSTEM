// Run this to create an admin account
// Usage: node create-admin.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  phone: String,
  role: { type: String, enum: ['customer', 'picker', 'rider', 'admin'] },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date, default: Date.now }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@quickmart.com',
      password: hashedPassword,
      phone: '1234567890',
      role: 'admin',
      isActive: true
    });

    console.log('✅ Admin account created successfully!');
    console.log('\nLogin credentials:');
    console.log('Email: admin@quickmart.com');
    console.log('Password: admin123');
    console.log('\nAccess admin dashboard at: http://localhost:3003');

    process.exit(0);
  } catch (error) {
    if (error.code === 11000) {
      console.log('⚠️  Admin account already exists!');
      console.log('\nLogin credentials:');
      console.log('Email: admin@quickmart.com');
      console.log('Password: admin123');
    } else {
      console.error('❌ Error:', error.message);
    }
    process.exit(1);
  }
}

createAdmin();
