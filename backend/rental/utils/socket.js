import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let io;

/**
 * Call this once from your main server file, right after creating the HTTP server:
 *   import http from 'http';
 *   import { initSocket } from './sockets/socket.js';
 *   const server = http.createServer(app);
 *   initSocket(server);
 *   server.listen(PORT);
 */
export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {  origin: process.env.CLIENT_URL || 'http://localhost:5173', methods: ['GET', 'POST'] },
  });

  // Auth middleware — client connects with: io(URL, { auth: { token } })
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication required'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id || decoded._id;
      next();
    } catch (err) {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    // Every user gets a personal room so we can target notifications by userId
    socket.join(`user_${socket.userId}`);

    socket.on('joinItemRoom', (itemId) => socket.join(`item_${itemId}`));
    socket.on('leaveItemRoom', (itemId) => socket.leave(`item_${itemId}`));

    socket.on('disconnect', () => {
      // no-op — room membership is cleaned up automatically
    });
  });

  return io;
}

export function getIO() {
  if (!io) throw new Error('Socket.IO not initialized — call initSocket(server) first');
  return io;
}

// ==================== EVENT HELPERS ====================
// Use these from controllers instead of calling io directly, so event names stay consistent.

export const notifyUser = (userId, event, payload) => {
  if (!io) return;
  io.to(`user_${userId}`).emit(event, payload);
};

export const notifyItemWatchers = (itemId, event, payload) => {
  if (!io) return;
  io.to(`item_${itemId}`).emit(event, payload);
};

// Event name constants — keep frontend and backend in sync
export const SOCKET_EVENTS = {
  NEW_RENTAL_REQUEST: 'rental:new_request', // -> owner
  BOOKING_CONFIRMED: 'rental:booking_confirmed', // -> renter
  BOOKING_CANCELLED: 'rental:booking_cancelled', // -> owner & renter
  ITEM_COLLECTED: 'rental:item_collected', // -> owner
  RETURN_REQUESTED: 'rental:return_requested', // -> owner or renter
  RENTAL_COMPLETED: 'rental:completed', // -> owner & renter
  RENTAL_EXTENDED: 'rental:extended', // -> owner
  ITEM_AVAILABILITY_CHANGED: 'rental:availability_changed', // -> item room (anyone viewing it)
};