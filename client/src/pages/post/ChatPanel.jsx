// ChatPanel.jsx — floating chat window, light theme
import { useState, useEffect, useRef, useCallback } from 'react';

const API         = import.meta.env.VITE_BACKEND_URL + '/api/posts';
const token       = () => localStorage.getItem('token');
const currentUser = () => { try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; } };

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ src, name, size = 'sm' }) {
  const dim = size === 'lg' ? 'w-9 h-9 text-sm' : 'w-7 h-7 text-xs';
  if (src)
    return <img src={src} alt={name} className={`${dim} rounded-xl object-cover flex-shrink-0 ring-1 ring-black/10`} />;
  return (
    <div className={`${dim} rounded-xl bg-[#8B1E3F] text-white font-bold flex items-center justify-center flex-shrink-0`}>
      {name?.[0]?.toUpperCase() || '?'}
    </div>
  );
}

// ─── Message bubble ───────────────────────────────────────────────────────────
function MessageBubble({ message, isMine }) {
  const time = new Date(message.createdAt).toLocaleTimeString('en-NG', {
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className={`flex items-end gap-2 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isMine && (
        <Avatar src={message.sender?.profilePicture} name={message.sender?.firstName} />
      )}
      <div className={`max-w-[75%] flex flex-col gap-1 ${isMine ? 'items-end' : 'items-start'}`}>
        <div
          className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isMine
              ? 'bg-[#8B1E3F] text-white rounded-br-sm'
              : 'bg-gray-100 border border-gray-200 text-gray-800 rounded-bl-sm'
          }`}
        >
          {message.text}
        </div>
        <div className="flex items-center gap-1.5 px-1">
          <span className="text-gray-400 text-[10px]">{time}</span>
          {isMine && (
            <svg
              width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke={message.read ? '#8B1E3F' : '#d1d5db'} strokeWidth="2.5"
            >
              <path d="M20 6 9 17l-5-5"/>
              {message.read && <path d="M24 6 13 17"/>}
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Chat panel ───────────────────────────────────────────────────────────────
export default function ChatPanel({
  postId, postTitle, participantId, participantName, participantAvatar, onClose
}) {
  const me      = currentUser();
  const [messages,  setMessages]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [sending,   setSending]   = useState(false);
  const [text,      setText]      = useState('');
  const [minimized, setMinimized] = useState(false);
  const bottomRef   = useRef(null);
  const inputRef    = useRef(null);
  const pollRef     = useRef(null);

  const loadChat = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res  = await fetch(`${API}/${postId}/chat/${participantId}`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await res.json();
      if (data.success) setMessages(data.data.messages || []);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [postId, participantId]);

  useEffect(() => {
    loadChat();
    pollRef.current = setInterval(() => loadChat(true), 5000);
    return () => clearInterval(pollRef.current);
  }, [loadChat]);

  useEffect(() => {
    if (!minimized) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [messages, minimized]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    const msgText   = text.trim();
    setText('');
    setSending(true);

    const optimistic = {
      _id:       `opt-${Date.now()}`,
      sender:    { _id: me?._id, firstName: me?.firstName, profilePicture: me?.profilePicture },
      text:      msgText,
      createdAt: new Date().toISOString(),
      read:      false,
    };
    setMessages(prev => [...prev, optimistic]);

    try {
      const res  = await fetch(`${API}/${postId}/chat/${participantId}/send`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body:    JSON.stringify({ text: msgText }),
      });
      const data = await res.json();
      if (data.success)
        setMessages(prev => prev.map(m => m._id === optimistic._id ? data.data : m));
    } catch {
      setMessages(prev => prev.filter(m => m._id !== optimistic._id));
      setText(msgText);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); }
  };

  return (
    <div
      className="fixed bottom-0 right-4 sm:right-6 z-[200] flex flex-col transition-all duration-300 w-[calc(100vw-2rem)] sm:w-80 md:w-96"
      style={{ height: minimized ? '52px' : '500px' }}
    >
      <div className="flex flex-col h-full bg-white border border-gray-200 rounded-t-2xl shadow-2xl shadow-black/10 overflow-hidden">

        {/* Header */}
        <div
          className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 cursor-pointer select-none flex-shrink-0"
          onClick={() => setMinimized(v => !v)}
        >
          <div className="relative">
            <Avatar src={participantAvatar} name={participantName} size="lg" />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-gray-900 font-bold text-sm truncate">{participantName}</p>
            <p className="text-gray-400 text-[10px] truncate">{postTitle}</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); setMinimized(v => !v); }}
              className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors"
              aria-label={minimized ? 'Expand chat' : 'Minimise chat'}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                {minimized ? <path d="m18 15-6-6-6 6"/> : <path d="m6 9 6 6 6-6"/>}
              </svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-red-100 flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors"
              aria-label="Close chat"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        {!minimized && (
          <>
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 bg-[#8B1E3F] rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 120}ms` }}
                      />
                    ))}
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-8">
                  <div className="w-12 h-12 rounded-2xl bg-[#8B1E3F]/10 border border-[#8B1E3F]/20 flex items-center justify-center text-2xl">
                    💬
                  </div>
                  <div>
                    <p className="text-gray-700 text-sm font-semibold">Start the conversation</p>
                    <p className="text-gray-400 text-xs mt-0.5">Say hello to {participantName}</p>
                  </div>
                </div>
              ) : (
                messages.map(msg => (
                  <MessageBubble
                    key={msg._id}
                    message={msg}
                    isMine={
                      msg.sender?._id?.toString() === me?._id?.toString() ||
                      msg.sender?.toString()       === me?._id?.toString()
                    }
                  />
                ))
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={handleSend}
              className="flex items-end gap-2 px-3 py-3 border-t border-gray-100 bg-white flex-shrink-0"
            >
              <textarea
                ref={inputRef}
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message…"
                rows={1}
                style={{ resize: 'none', maxHeight: '80px' }}
                className="flex-1 bg-gray-100 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-[#8B1E3F]/50 focus:bg-white transition-colors leading-snug"
              />
              <button
                type="submit"
                disabled={!text.trim() || sending}
                className="w-10 h-10 bg-[#8B1E3F] hover:bg-[#a02248] disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-all flex-shrink-0 disabled:cursor-not-allowed active:scale-95"
                aria-label="Send"
              >
                {sending ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="m22 2-7 20-4-9-9-4 20-7z"/>
                    <path d="M22 2 11 13"/>
                  </svg>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}