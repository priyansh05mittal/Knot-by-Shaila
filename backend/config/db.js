const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log("Mongo URI loaded:", process.env.MONGO_URI ? "YES" : "NO");

    mongoose.set('strictQuery', true);

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      autoIndex: process.env.NODE_ENV !== 'production',
    });

    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      console.error(`❌ MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
    });
  } catch (error) {
    console.error(`❌ Failed to connect to MongoDB Atlas: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;