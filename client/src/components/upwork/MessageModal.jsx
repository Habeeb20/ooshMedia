// components/MessageModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Send, X, Loader2, MessageSquare } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const MessageModal = ({ 
  isOpen, 
  onClose, 
  conversation: conversationId,     // ← New: Pass conversation._id
  otherPartyName 
}) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const currentUserId = localStorage.getItem('userId');

  useEffect(() => {
    if (isOpen && conversationId) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000); // Poll every 5 seconds
      return () => clearInterval(interval);
    }
  }, [isOpen, conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/proposal-message/${conversationId}`, {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem('token')}` 
        },
      });

      const data = await res.json();
      if (data.success) {
        setMessages(data.conversation.messages || []);
      } else {
        toast.error(data.message || "Failed to load messages");
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // Block contact info
    const lowerMsg = newMessage.toLowerCase();
    const forbidden = [
      /\+?\d{1,3}[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/,
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/,
      /https?:\/\/[^\s]+/,
      /wa\.me|whatsapp|tel:/
    ];

    if (forbidden.some(regex => regex.test(lowerMsg))) {
      toast.error("Sharing contact details is not allowed.");
      return;
    }

    const optimisticMsg = {
      _id: Date.now().toString(),
      sender: { _id: currentUserId },
      content: newMessage,
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, optimisticMsg]);
    setNewMessage('');
    setSending(true);

    try {
      const res = await fetch(`${API_BASE_URL}/proposal-message/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content: newMessage })
      });

      const data = await res.json();
      if (data.success) {
        // Replace optimistic message with real one
        setMessages(prev => prev.map(m => 
          m._id === optimisticMsg._id ? data.data : m
        ));
      } else {
        toast.error(data.message || "Failed to send message");
        setMessages(prev => prev.filter(m => m._id !== optimisticMsg._id));
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to send message');
      setMessages(prev => prev.filter(m => m._id !== optimisticMsg._id));
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.95, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 30 }}
        className="bg-white rounded-3xl w-full max-w-2xl h-[88vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <MessageSquare size={22} />
            </div>
            <div>
              <h3 className="font-semibold">{otherPartyName}</h3>
              <p className="text-xs opacity-90">Messaging</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition">
            <X size={26} />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50">
          {loading && messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="animate-spin text-emerald-600" size={40} />
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <MessageSquare size={60} className="mb-4 opacity-30" />
              <p>No messages yet. Say hello!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender?._id?.toString() === currentUserId || 
                          msg.sender?.toString() === currentUserId;
              return (
                <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] px-4 py-3 rounded-2xl ${isMe 
                    ? 'bg-emerald-600 text-white rounded-br-none' 
                    : 'bg-white border rounded-bl-none'}`}>
                    <p>{msg.content}</p>
                    <p className="text-[10px] mt-1 opacity-70 text-right">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} className="bg-white border-t p-4 flex items-center gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 py-3.5 px-5 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className={`p-4 rounded-full transition ${sending || !newMessage.trim() 
              ? 'bg-gray-300' 
              : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
          >
            {sending ? <Loader2 className="animate-spin" size={22} /> : <Send size={22} />}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default MessageModal;