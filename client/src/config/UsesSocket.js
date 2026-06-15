import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';


// Singleton socket — one connection for the whole app
let socket;

export const useSocket = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user?._id) return;

    if (!socket) {
      socket = io(import.meta.env.VITE_API_BASE_URL, {
        withCredentials: true,
      });
    }

    // Join the user's private room so the server can emit directly to them
    socket.emit('join_user_room', user._id);

    return () => {
      // Do NOT disconnect here — we want the singleton to persist
      // across component mounts. Disconnect on logout instead.
    };
  }, [user?._id]);

  return socket;
};

// Call this on logout to cleanly close the connection
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};