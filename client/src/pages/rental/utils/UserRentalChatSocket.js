/* eslint-disable react-hooks/refs */
import { useEffect, useRef } from 'react';

// Deliberately takes an already-connected `socket` instance rather than
// creating its own — plug in whatever your app already uses to hand out the
// socket.io-client connection (a SocketContext, a singleton module, etc).
// If you don't have one yet, the minimal version looks like:
//
//   import { io } from 'socket.io-client';
//   const socket = io(import.meta.env.VITE_SOCKET_URL || '/', {
//     auth: { token: localStorage.getItem('token') },
//   });
//
// matching however your server's utils/socket.js authenticates a connection
// to a specific userId (since notifyUser(userId, event, payload) needs to
// find the right socket).
//
// Server-side, add these two entries to your existing SOCKET_EVENTS map:
//   NEW_MESSAGE: 'rental:new_message',
//   MESSAGES_READ: 'rental:messages_read',

export function useRentalChatSocket(socket, { conversationId, onNewMessage, onMessagesRead }) {
  const onNewMessageRef = useRef(onNewMessage);
  const onMessagesReadRef = useRef(onMessagesRead);
  onNewMessageRef.current = onNewMessage;
  onMessagesReadRef.current = onMessagesRead;

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (payload) => {
      if (conversationId && payload.conversationId !== conversationId) return;
      onNewMessageRef.current?.(payload);
    };
    const handleMessagesRead = (payload) => {
      if (conversationId && payload.conversationId !== conversationId) return;
      onMessagesReadRef.current?.(payload);
    };

    socket.on('rental:new_message', handleNewMessage);
    socket.on('rental:messages_read', handleMessagesRead);

    return () => {
      socket.off('rental:new_message', handleNewMessage);
      socket.off('rental:messages_read', handleMessagesRead);
    };
  }, [socket, conversationId]);
}

export default useRentalChatSocket;