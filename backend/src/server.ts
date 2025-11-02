import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { connectDatabase } from './config/database';
import { setupSocketIO } from './config/socket';
import { setupRaceHandlers } from './services/raceService';
import authRoutes from './routes/authRoutes';
import shopRoutes from './routes/shopRoutes';
import inventoryRoutes from './routes/inventoryRoutes';
import { seedShopItems } from './services/shopService';
import { env, getAllowedOrigins } from './config/env';

const app = express();
const httpServer = createServer(app);
const PORT = env.PORT;

// CORS configuration
const allowedOrigins = getAllowedOrigins();
console.log('🌐 CORS allowed origins:', allowedOrigins);

app.use(cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Log the incoming origin for debugging
    console.log('🔍 CORS request from origin:', origin);
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('✅ Allowing request with no origin');
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      console.log('✅ Origin allowed:', origin);
      callback(null, true);
    } else if (env.isProduction) {
      // In production, be strict about origins
      console.log('❌ Origin not allowed:', origin);
      console.log('💡 Allowed origins:', allowedOrigins);
      callback(new Error('Not allowed by CORS'));
    } else {
      // In development, allow all origins
      console.log('✅ Development mode: allowing origin:', origin);
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/inventory', inventoryRoutes);

// Health check
app.get('/health', (req: express.Request, res: express.Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: Error & { status?: number }, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// 404 handler
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Setup Socket.io
const io = setupSocketIO(httpServer);
setupRaceHandlers(io);

// Start server
const startServer = async () => {
  try {
    console.log('🚀 Starting server...');
    await connectDatabase();
    await seedShopItems();
    
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 WebSocket server ready`);
      console.log(`🌐 Environment: ${env.NODE_ENV}`);
      console.log(`🌐 Allowed origins: ${allowedOrigins.join(', ')}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:');
    console.error('   Error:', error instanceof Error ? error.message : error);
    console.error('   Stack:', error instanceof Error ? error.stack : 'No stack trace');
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
const gracefulShutdown = (signal: string) => {
  console.log(`${signal} received, shutting down gracefully...`);
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
  
  // Force close after 10 seconds
  setTimeout(() => {
    console.error('Forcing shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

