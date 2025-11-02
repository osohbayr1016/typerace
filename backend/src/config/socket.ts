import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { SocketUser } from '../types';
import { env, getAllowedOrigins } from './env';

// Extend Socket interface with user property
// Socket.io Socket already has all properties (id, handshake, emit, on, etc.)
// Using type intersection to ensure all Socket properties are available
export type AuthSocket = Socket & {
  user?: SocketUser;
};

export const setupSocketIO = (httpServer: HTTPServer): Server => {
  const allowedOrigins = getAllowedOrigins();
  
  const io = new Server(httpServer, {
    cors: {
      origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        if (!origin || allowedOrigins.includes(origin) || !env.isProduction) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST']
    }
  });

  // Authentication middleware
  io.use((socket: AuthSocket, next: (err?: Error) => void) => {
    try {
      const token = socket.handshake.auth.token;

      if (token) {
        const decoded = jwt.verify(token, env.JWT_SECRET) as {
          id: string;
          username: string;
          email: string;
        };
        
        socket.user = {
          id: decoded.id,
          username: decoded.username,
          email: decoded.email
        };
      } else {
        // Allow guest users
        socket.user = {
          username: `Guest_${socket.id.substring(0, 6)}`
        };
      }

      next();
    } catch (error) {
      console.error('Socket auth error:', error);
      // Allow connection even if token is invalid (as guest)
      socket.user = {
        username: `Guest_${socket.id.substring(0, 6)}`
      };
      next();
    }
  });

  return io;
};

