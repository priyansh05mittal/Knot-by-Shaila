require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Category = require('../models/Category');

const seed = async () => {
  await connectDB();

  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@crochetnest.com';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@12345';

  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    await User.create({
      fullName: 'Crochet Nest Admin',
      email: adminEmail,
      contactNumber: '9999999999',
      password: adminPassword,
      role: 'admin',
      isVerified: true,
      acceptedTerms: true,
    });
    console.log(`✅ Admin user created: ${adminEmail} / ${adminPassword}`);
  } else {
    console.log('ℹ️  Admin user already exists, skipping.');
  }

  const defaultCategories = [
    { name: 'Crochet Bags', description: 'Handmade crochet bags and totes' },
    { name: 'Crochet Tops', description: 'Handcrafted crochet tops and blouses' },
    { name: 'Crochet Accessories', description: 'Scarves, headbands, and more' },
    { name: 'Amigurumi & Toys', description: 'Cute handmade crochet toys' },
    { name: 'Home Decor', description: 'Crochet coasters, wall hangings, cushion covers' },
    { name: 'Custom Gifts', description: 'Personalized handmade crochet gifts' },
  ];

  for (const cat of defaultCategories) {
    const exists = await Category.findOne({ name: cat.name });
    if (!exists) {
      await Category.create(cat);
      console.log(`✅ Category created: ${cat.name}`);
    }
  }

  console.log('🎉 Seeding complete.');
  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});