import mongoose from 'mongoose';
import { env } from './env';

const MONGODB_URI = env.MONGODB_URI;

export const connectDatabase = async (): Promise<void> => {
  try {
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    console.log('🔌 Attempting to connect to MongoDB...');
    console.log(`   URI format: ${MONGODB_URI.substring(0, 20)}...`);
    
    await mongoose.connect(MONGODB_URI);
    
    console.log('✅ MongoDB connected successfully');
    console.log(`   Database: ${mongoose.connection.name}`);
    
    mongoose.connection.on('error', (error: Error) => {
      console.error('❌ MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

  } catch (error) {
    console.error('❌ Failed to connect to MongoDB');
    console.error('   Error details:', error instanceof Error ? error.message : error);
    console.error('💡 Troubleshooting tips:');
    console.error('   1. Check MONGODB_URI is correct in Render dashboard');
    console.error('   2. Verify IP whitelist includes 0.0.0.0/0 in MongoDB Atlas');
    console.error('   3. Ensure database user has proper permissions');
    console.error('   4. Check MongoDB connection string format');
    process.exit(1);
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error);
  }
};

