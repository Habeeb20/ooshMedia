import { Server } from 'socket.io';

let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    // Each authenticated user joins their own private room
    // so we can emit directly to them from any route
    socket.on('join_user_room', (userId) => {
      socket.join(`user_${userId}`);
    });

    socket.on('disconnect', () => {});
  });

  return io;
};

// Call this anywhere in your routes: getIO().to(`user_${id}`).emit(...)
export const getIO = () => {
  if (!io) throw new Error('Socket.io not initialised. Call initSocket first.');
  return io;
};