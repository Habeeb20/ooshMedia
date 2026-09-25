import { useEffect, useRef, useState } from 'react';
import { chatApi } from '../api/rentalChatapi';

import useRentalChatSocket from '../utils/UserRentalChatSocket';
import { getCurrentUserId } from '../utils/authToken';

const WINE = '#8B1E3F';

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Drop this into the booking detail / "my rentals" page once a booking's
 * status is one of: confirmed, item_collected, return_requested, completed.
 *
 *   <ChatPanel bookingId={booking._id} currentUserId={user.id} socket={socket} otherPartyName={owner or renter name} />
 *
 * `socket` is optional — omit it and the panel still works via polling-free
 * request/response (send + refetch), it just won't get live pushes until a
 * socket instance is passed in from wherever your app already manages one.
 */
export default function ChatPanel({ bookingId, currentUserId: currentUserIdProp, socket, otherPartyName = 'the other party', disabled = false }) {
  // Falls back to decoding the JWT in localStorage if the parent didn't pass
  // a usable currentUserId — this is what was causing every message to
  // render on the same side for every viewer.
  const currentUserId = currentUserIdProp || getCurrentUserId();
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);

  const scrollToBottom = () => bottomRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    chatApi
      .getMessages(bookingId)
      .then((res) => {
        if (cancelled) return;
        setMessages(res.messages || []);
        setConversationId(res.conversationId);
      })
      .catch((err) => !cancelled && setError(err.response?.data?.message || 'Could not load chat.'))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [bookingId]);

  useEffect(() => { scrollToBottom(); }, [messages.length]);

  useRentalChatSocket(socket, {
    conversationId,
    onNewMessage: ({ message }) => {
      setMessages((prev) => (prev.some((m) => m._id === message._id) ? prev : [...prev, message]));
    },
  });

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    setError(null);
    // Optimistic append
    const tempId = `temp-${Date.now()}`;
    setMessages((prev) => [...prev, { _id: tempId, text, sender: currentUserId, createdAt: new Date().toISOString(), pending: true }]);
    setDraft('');
    try {
      const res = await chatApi.sendMessage(bookingId, text);
      setConversationId((id) => id || res.conversationId);
      setMessages((prev) => prev.map((m) => (m._id === tempId ? res.message : m)));
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m._id !== tempId));
      setError(err.response?.data?.message || 'Message failed to send.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col rounded-2xl border border-[#E7DEE1] bg-white h-[480px]">
      <div className="px-4 py-3 border-b border-[#F3E4E8]">
        <p className="text-sm font-semibold text-[#221B1D]">Chat with {otherPartyName}</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {loading ? (
          <p className="text-sm text-[#6B6067] text-center mt-8">Loading conversation…</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-[#6B6067] text-center mt-8">Say hello — you're all set to coordinate pickup here.</p>
        ) : (
          messages.map((m) => {
            const senderId = m.sender?._id || m.sender;
            const mine = String(senderId) === String(currentUserId);
            return (
              <div key={m._id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                    mine ? 'text-white rounded-br-sm' : 'bg-[#F3E4E8] text-[#221B1D] rounded-bl-sm'
                  } ${m.pending ? 'opacity-60' : ''}`}
                  style={mine ? { backgroundColor: WINE } : undefined}
                >
                  <p>{m.text}</p>
                  <p className={`text-[10px] mt-1 ${mine ? 'text-white/70' : 'text-[#6B6067]'}`}>{formatTime(m.createdAt)}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {error && <p className="px-4 text-xs text-red-600">{error}</p>}

      <div className="p-3 border-t border-[#F3E4E8] flex items-center gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          disabled={disabled}
          placeholder={disabled ? 'Chat unlocks once payment is confirmed' : 'Type a message…'}
          className="flex-1 rounded-lg border border-[#E7DEE1] px-3 py-2 text-sm disabled:bg-gray-50"
        />
        <button
          onClick={handleSend}
          disabled={disabled || sending || !draft.trim()}
          className="rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          style={{ backgroundColor: WINE }}
        >
          Send
        </button>
      </div>
    </div>
  );
}