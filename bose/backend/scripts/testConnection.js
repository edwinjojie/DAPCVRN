import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
  console.log('🔍 Testing MongoDB Atlas connection...');
  console.log(`📍 Connection URI: ${process.env.MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')}`);
  
  try {
    const options = {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    };

    await mongoose.connect(process.env.MONGODB_URI, options);
    
    console.log('✅ MongoDB connection successful!');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🌐 Host: ${mongoose.connection.host}`);
    console.log(`📡 Port: ${mongoose.connection.port}`);
    
    // Test a simple operation
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📁 Collections found: ${collections.length}`);
    
    await mongoose.connection.close();
    console.log('👋 Connection closed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ MongoDB connection failed:');
    console.error(`   Error: ${error.message}`);
    console.error('\n💡 Troubleshooting steps:');
    console.error('   1. Verify your IP is whitelisted in MongoDB Atlas');
    console.error('   2. Check if 0.0.0.0/0 is added to Network Access');
    console.error('   3. Verify username and password are correct');
    console.error('   4. Check if your firewall/antivirus is blocking port 27017');
    console.error('   5. Try using a different network (mobile hotspot)');
    process.exit(1);
  }
}

testConnection();

