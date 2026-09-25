import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

let sharedSocket = null;

function getSocket() {
  if (!sharedSocket) {
    sharedSocket = io(import.meta.env.VITE_SOCKET_URL || '/', {
      auth: { token: localStorage.getItem('token') },
      autoConnect: true,
    });
  }
  return sharedSocket;
}

// Usage: useSocketEvent('rental:new_request', (payload) => { ... })
export function useSocketEvent(eventName, handler) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const socket = getSocket();
    const listener = (payload) => handlerRef.current(payload);
    socket.on(eventName, listener);
    return () => socket.off(eventName, listener);
  }, [eventName]);
}

export function joinItemRoom(itemId) {
  getSocket().emit('joinItemRoom', itemId);
}

export function leaveItemRoom(itemId) {
  getSocket().emit('leaveItemRoom', itemId);
}

export const SOCKET_EVENTS = {
  NEW_RENTAL_REQUEST: 'rental:new_request',
  BOOKING_CONFIRMED: 'rental:booking_confirmed',
  BOOKING_CANCELLED: 'rental:booking_cancelled',
  ITEM_COLLECTED: 'rental:item_collected',
  RETURN_REQUESTED: 'rental:return_requested',
  RENTAL_COMPLETED: 'rental:completed',
  RENTAL_EXTENDED: 'rental:extended',
  ITEM_AVAILABILITY_CHANGED: 'rental:availability_changed',
};