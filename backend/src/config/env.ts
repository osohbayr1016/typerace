import dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

// Log environment loading status for debugging
console.log('🔍 Environment check:');
console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
console.log(`   PORT: ${process.env.PORT || 'not set (will use 5000)'}`);
console.log(`   MONGODB_URI: ${process.env.MONGODB_URI ? '✅ set' : '❌ not set'}`);
console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? '✅ set' : '❌ not set'}`);
console.log(`   FRONTEND_URL: ${process.env.FRONTEND_URL || 'not set (will use localhost:3000)'}`);

// Validate required environment variables
const requiredEnvVars = {
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
};

if (isProduction) {
  const missingVars = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables in production:');
    missingVars.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    console.error('💡 Please set these variables in your Render dashboard:');
    console.error('   1. Go to your Render dashboard');
    console.error('   2. Select your service');
    console.error('   3. Go to "Environment" tab');
    console.error('   4. Add the missing variables');
    process.exit(1);
  }

  // In production, ensure JWT_SECRET is not a fallback
  if (process.env.JWT_SECRET === 'fallback-secret-key' || 
      process.env.JWT_SECRET === undefined) {
    console.error('❌ JWT_SECRET must be set to a secure value in production');
    console.error('💡 Generate a secure JWT_SECRET using:');
    console.error('   node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'base64\'))"');
    process.exit(1);
  }
}

interface EnvConfig {
  NODE_ENV: string;
  PORT: number;
  MONGODB_URI: string;
  JWT_SECRET: string;
  FRONTEND_URL: string;
  isProduction: boolean;
}

export const env: EnvConfig = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  MONGODB_URI: process.env.MONGODB_URI || '',
  JWT_SECRET: process.env.JWT_SECRET || 'fallback-secret-key',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  isProduction,
};

// Helper to get allowed origins for CORS
export const getAllowedOrigins = (): string[] => {
  const origins: string[] = [];
  
  if (env.FRONTEND_URL) {
    origins.push(env.FRONTEND_URL);
  }

  // Allow common production origins
  if (env.isProduction) {
    // Add any additional production URLs here if needed
    // origins.push('https://your-production-domain.com');
  }

  return origins;
};

