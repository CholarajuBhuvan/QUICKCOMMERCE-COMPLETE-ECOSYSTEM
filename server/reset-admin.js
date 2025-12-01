// Reset admin account with correct password
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

async function resetAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Delete existing admin
    await User.deleteOne({ email: 'admin@quickmart.com' });
    console.log('🗑️  Deleted old admin account');

    // Hash password properly
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Create new admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@quickmart.com',
      password: hashedPassword,
      phone: '1234567890',
      role: 'admin',
      isActive: true
    });

    console.log('✅ Admin account recreated successfully!');
    console.log('\n======================================');
    console.log('Login credentials:');
    console.log('Email: admin@quickmart.com');
    console.log('Password: admin123');
    console.log('======================================');
    console.log('\nAccess admin dashboard at: http://localhost:3003');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetAdmin();
