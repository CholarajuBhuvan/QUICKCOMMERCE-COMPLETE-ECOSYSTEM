const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Product = require('../models/Product');

const sampleProducts = [
  {
    name: 'Organic Bananas',
    description: 'Fresh organic bananas, rich in potassium and perfect for a healthy snack. Locally sourced from sustainable farms.',
    category: 'groceries',
    subcategory: 'Fresh Produce',
    brand: 'Fresh Farms',
    sku: 'FF-BAN-001',
    images: [],
    price: {
      mrp: 4.99,
      selling: 3.99,
      discount: 1.00
    },
    inventory: {
      totalStock: 150,
      availableStock: 150,
      reservedStock: 0,
      minStockLevel: 20,
      maxStockLevel: 500
    },
    isActive: true,
    isFeatured: true
  },
  {
    name: 'Whole Milk',
    description: 'Fresh whole milk from grass-fed cows, rich in calcium and vitamins. Perfect for drinking or cooking.',
    category: 'groceries',
    subcategory: 'Dairy',
    brand: 'Meadow Fresh',
    sku: 'MF-MLK-002',
    images: [],
    price: {
      mrp: 5.49,
      selling: 4.49,
      discount: 1.00
    },
    inventory: {
      totalStock: 50,
      availableStock: 8,
      reservedStock: 2,
      minStockLevel: 15,
      maxStockLevel: 100
    },
    isActive: true,
    isFeatured: false
  },
  {
    name: 'Premium Chicken Breast',
    description: 'Premium boneless chicken breast, perfect for grilling or roasting. Antibiotic-free and hormone-free.',
    category: 'groceries',
    subcategory: 'Meat',
    brand: 'Prime Cut',
    sku: 'PC-CHK-003',
    images: [],
    price: {
      mrp: 14.99,
      selling: 12.99,
      discount: 2.00
    },
    inventory: {
      totalStock: 35,
      availableStock: 25,
      reservedStock: 5,
      minStockLevel: 10,
      maxStockLevel: 100
    },
    isActive: true,
    isFeatured: true
  },
  {
    name: 'Artisan Sourdough Bread',
    description: 'Handcrafted sourdough bread made with traditional fermentation methods. Crispy crust and soft interior.',
    category: 'groceries',
    subcategory: 'Bakery',
    brand: 'Artisan Baker',
    sku: 'AB-BRD-004',
    images: [],
    price: {
      mrp: 6.99,
      selling: 5.99,
      discount: 1.00
    },
    inventory: {
      totalStock: 0,
      availableStock: 0,
      reservedStock: 0,
      minStockLevel: 5,
      maxStockLevel: 50
    },
    isActive: true,
    isFeatured: false
  },
  {
    name: 'Greek Yogurt',
    description: 'Creamy Greek yogurt with live cultures and high protein content. Perfect for breakfast or snacks.',
    category: 'groceries',
    subcategory: 'Dairy',
    brand: 'Mediterranean Plus',
    sku: 'MP-YOG-005',
    images: [],
    price: {
      mrp: 7.99,
      selling: 6.99,
      discount: 1.00
    },
    inventory: {
      totalStock: 60,
      availableStock: 45,
      reservedStock: 5,
      minStockLevel: 20,
      maxStockLevel: 150
    },
    isActive: false,
    isFeatured: false
  },
  {
    name: 'Fresh Strawberries',
    description: 'Sweet and juicy strawberries, perfect for desserts or snacking. Handpicked at peak ripeness.',
    category: 'groceries',
    subcategory: 'Fresh Produce',
    brand: 'Berry Best',
    sku: 'BB-STR-006',
    images: [],
    price: {
      mrp: 6.49,
      selling: 5.49,
      discount: 1.00
    },
    inventory: {
      totalStock: 80,
      availableStock: 75,
      reservedStock: 5,
      minStockLevel: 15,
      maxStockLevel: 200
    },
    isActive: true,
    isFeatured: true
  },
  {
    name: 'Organic Eggs - Dozen',
    description: 'Farm-fresh organic eggs from free-range chickens. Rich in nutrients and flavor.',
    category: 'groceries',
    subcategory: 'Dairy',
    brand: 'Happy Hens',
    sku: 'HH-EGG-007',
    images: [],
    price: {
      mrp: 7.99,
      selling: 6.99,
      discount: 1.00
    },
    inventory: {
      totalStock: 120,
      availableStock: 95,
      reservedStock: 15,
      minStockLevel: 30,
      maxStockLevel: 200
    },
    isActive: true,
    isFeatured: false
  },
  {
    name: 'Wild Salmon Fillet',
    description: 'Fresh wild-caught salmon fillet, rich in omega-3. Perfect for grilling or baking.',
    category: 'groceries',
    subcategory: 'Meat',
    brand: 'Ocean Harvest',
    sku: 'OH-SAL-008',
    images: [],
    price: {
      mrp: 19.99,
      selling: 17.99,
      discount: 2.00
    },
    inventory: {
      totalStock: 25,
      availableStock: 18,
      reservedStock: 3,
      minStockLevel: 8,
      maxStockLevel: 50
    },
    isActive: true,
    isFeatured: true
  }
];

async function seedProducts() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing products (optional)
    const deleteResult = await Product.deleteMany({});
    console.log(`🗑️  Deleted ${deleteResult.deletedCount} existing products`);

    // Insert new products
    const insertedProducts = await Product.insertMany(sampleProducts);
    console.log(`✅ Successfully created ${insertedProducts.length} products`);

    console.log('\nProducts created:');
    insertedProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} (${product.sku}) - $${product.price.selling} - Stock: ${product.inventory.availableStock}`);
    });

    console.log('\n✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    process.exit(1);
  }
}

seedProducts();
