import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { SocketUser } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

export interface AuthSocket extends Socket {
  user?: SocketUser;
  handshake: Socket['handshake'];
  id: Socket['id'];
}

export const setupSocketIO = (httpServer: HTTPServer): Server => {
  const io = new Server(httpServer, {
    cors: {
      origin: FRONTEND_URL,
      credentials: true,
      methods: ['GET', 'POST']
    }
  });

  // Authentication middleware
  io.use((socket: AuthSocket, next: (err?: Error) => void) => {
    try {
      const token = socket.handshake.auth.token;

      if (token) {
        const decoded = jwt.verify(token, JWT_SECRET) as {
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

