const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

async function resetDemoUsers() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Delete demo users
    const result = await User.deleteMany({ 
      email: { 
        $in: ['picker@demo.com', 'rider@demo.com', 'customer@demo.com'] 
      } 
    });
    
    console.log(`✅ Deleted ${result.deletedCount} demo users`);
    console.log('\nNow run: node scripts/createDemoUsers.js');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetDemoUsers();
