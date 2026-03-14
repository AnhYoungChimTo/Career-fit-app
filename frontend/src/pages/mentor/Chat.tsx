import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import SidePanel from '../../components/mentor/SidePanel';
import type { ChatMessage, MentorConnection } from '../../types';

export default function Chat() {
  const { connectionId } = useParams<{ connectionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [connection, setConnection] = useState<MentorConnection | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingInit, setLoadingInit] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = useCallback(async () => {
    if (!connectionId) return;
    try {
      const res = await api.getChatMessages(connectionId);
      const data: ChatMessage[] = res?.data || res || [];
      setMessages(data);
    } catch {
      // silently ignore poll errors
    }
  }, [connectionId]);

  useEffect(() => {
    if (!connectionId) return;
    const init = async () => {
      setLoadingInit(true);
      setError(null);
      try {
        const [connRes, msgRes] = await Promise.all([
          api.getConnection(connectionId),
          api.getChatMessages(connectionId),
        ]);
        setConnection(connRes?.data || connRes);
        const msgs: ChatMessage[] = msgRes?.data || msgRes || [];
        setMessages(msgs);
      } catch (err: any) {
        setError(err?.response?.data?.error?.message || err?.message || 'Failed to load chat');
      } finally {
        setLoadingInit(false);
      }
    };
    init();
  }, [connectionId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Poll for new messages every 5 seconds
  useEffect(() => {
    if (!connectionId || loadingInit) return;
    pollRef.current = setInterval(fetchMessages, 5000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [connectionId, loadingInit, fetchMessages]);

  const handleSend = async () => {
    const content = inputValue.trim();
    if (!content || !connectionId) return;
    setSending(true);
    // Optimistic update
    const optimistic: ChatMessage = {
      id: 'temp_' + Date.now(),
      connectionId,
      senderId: user?.id || '',
      content,
      isRead: false,
      createdAt: new Date().toISOString(),
      sender: user || undefined,
    };
    setMessages((prev) => [...prev, optimistic]);
    setInputValue('');
    try {
      const res = await api.sendChatMessage(connectionId, content);
      const saved: ChatMessage = res?.data || res;
      setMessages((prev) =>
        prev.map((m) => (m.id === optimistic.id ? saved : m))
      );
    } catch (err: any) {
      // Remove optimistic message on failure
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      showToast(err?.response?.data?.error?.message || 'Failed to send message');
      setInputValue(content);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileClick = () => {
    showToast('File sharing coming soon');
  };

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Group messages by date
  const groupedMessages: Array<{ date: string; messages: ChatMessage[] }> = [];
  messages.forEach((msg) => {
    const dateLabel = formatDate(msg.createdAt);
    const lastGroup = groupedMessages[groupedMessages.length - 1];
    if (lastGroup && lastGroup.date === dateLabel) {
      lastGroup.messages.push(msg);
    } else {
      groupedMessages.push({ date: dateLabel, messages: [msg] });
    }
  });

  const otherPerson =
    user?.id === connection?.mentor?.userId
      ? connection?.mentee
      : connection?.mentor?.user;

  const statusColor =
    connection?.status === 'active'
      ? 'text-green-600'
      : connection?.status === 'pending'
      ? 'text-amber-600'
      : 'text-gray-400';

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#FFF8F0' }}>
      <SidePanel activeTab="inbox" onTabChange={() => {}} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toast */}
        {toast && (
          <div
            className="fixed top-4 right-4 z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium"
            style={{ backgroundColor: '#4ECDC4' }}
          >
            {toast}
          </div>
        )}

        {/* Top bar */}
        <div className="bg-white border-b border-orange-100 px-6 py-3 flex items-center gap-4 flex-shrink-0">
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-gray-400 hover:text-gray-700 transition-colors"
          >
            ←
          </button>

          <div
            className="flex-shrink-0 rounded-full flex items-center justify-center text-white font-semibold text-sm"
            style={{ width: 38, height: 38, backgroundColor: '#FF6B6B' }}
          >
            {getInitials(otherPerson?.name)}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {otherPerson?.name || otherPerson?.email || 'Connection'}
            </p>
            <p className={`text-xs capitalize ${statusColor}`}>
              {connection?.status || 'Loading...'}
            </p>
          </div>
        </div>

        {loadingInit && (
          <div className="flex items-center justify-center flex-1">
            <div
              className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: '#FF6B6B', borderTopColor: 'transparent' }}
            />
          </div>
        )}

        {error && !loadingInit && (
          <div className="flex flex-col items-center justify-center flex-1 gap-4">
            <p className="text-red-500 text-sm font-medium">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-white border border-gray-200 hover:bg-gray-50"
            >
              ← Go Back
            </button>
          </div>
        )}

        {!loadingInit && !error && (
          <>
            {/* Messages area */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-1">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <p className="text-gray-400 text-sm">No messages yet.</p>
                  <p className="text-gray-300 text-xs mt-1">Say hello to start the conversation!</p>
                </div>
              )}

              {groupedMessages.map((group) => (
                <div key={group.date}>
                  {/* Date divider */}
                  <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px bg-gray-100" />
                    <span className="text-xs text-gray-400 font-medium">{group.date}</span>
                    <div className="flex-1 h-px bg-gray-100" />
                  </div>

                  {group.messages.map((msg) => {
                    const isSelf = msg.senderId === user?.id;
                    const senderName = msg.sender?.name || msg.sender?.email || 'User';
                    return (
                      <div
                        key={msg.id}
                        className={`flex items-end gap-2 mb-3 ${isSelf ? 'flex-row-reverse' : 'flex-row'}`}
                      >
                        {/* Avatar */}
                        {!isSelf && (
                          <div
                            className="flex-shrink-0 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                            style={{
                              width: 28,
                              height: 28,
                              backgroundColor: '#4ECDC4',
                            }}
                          >
                            {getInitials(senderName)}
                          </div>
                        )}

                        <div className={`max-w-xs lg:max-w-md ${isSelf ? 'items-end' : 'items-start'} flex flex-col`}>
                          <div
                            className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                              isSelf
                                ? 'text-white rounded-br-sm'
                                : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm shadow-sm'
                            }`}
                            style={isSelf ? { backgroundColor: '#FF6B6B' } : {}}
                          >
                            {msg.content}
                          </div>
                          <div className={`flex items-center gap-1 mt-1 ${isSelf ? 'flex-row-reverse' : ''}`}>
                            <span className="text-xs text-gray-400">
                              {formatTime(msg.createdAt)}
                            </span>
                            {isSelf && (
                              <span className="text-xs text-gray-400">
                                {msg.isRead ? '✓✓' : '✓'}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Self avatar */}
                        {isSelf && (
                          <div
                            className="flex-shrink-0 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                            style={{
                              width: 28,
                              height: 28,
                              backgroundColor: '#FF6B6B',
                            }}
                          >
                            {getInitials(user?.name)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="bg-white border-t border-orange-100 px-6 py-4 flex-shrink-0">
              <div className="flex items-center gap-3">
                {/* File attachment button */}
                <button
                  onClick={handleFileClick}
                  className="flex-shrink-0 p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors text-lg"
                  title="Attach file"
                >
                  📎
                </button>

                {/* Text input */}
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-full outline-none focus:border-orange-300 bg-gray-50 transition-colors"
                  disabled={sending}
                />

                {/* Send button */}
                <button
                  onClick={handleSend}
                  disabled={sending || !inputValue.trim()}
                  className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white transition-opacity disabled:opacity-40"
                  style={{ backgroundColor: '#FF6B6B' }}
                  title="Send message"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
