import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../services/api';
import MentorPageLayout from '../../../components/mentor/MentorPageLayout';
import type { Notification } from '../../../types';

const NOTIFICATION_ICONS: Record<string, string> = {
  new_connection_request: '🤝',
  connection_accepted: '🎉',
  new_message: '💬',
  session_confirmed: '📅',
  milestone_pending_confirmation: '✅',
  new_review: '⭐',
  mentee_unresponsive: '⏰',
  premium_expiring: '💎',
  admin_review_needed: '🔍',
  default: '🔔',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function InboxTab() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const load = () => {
    api.getNotifications().then((res: any) => setNotifications(res.data || [])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleMarkRead = async (id: string) => {
    await api.markNotificationRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    await api.markAllNotificationsRead();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setMarkingAll(false);
  };

  const getActionForNotification = (n: Notification) => {
    const data = n.data || {};
    switch (n.type) {
      case 'new_connection_request':
        return { label: 'View Request', onClick: () => navigate('/mentor/mentees') };
      case 'connection_accepted':
        return { label: 'View Mentee', onClick: () => data.connectionId && navigate(`/mentor/roadmap/${data.connectionId}`) };
      case 'new_message':
        return { label: 'Reply', onClick: () => data.connectionId && navigate(`/mentor/chat/${data.connectionId}`) };
      case 'session_confirmed':
        return { label: 'View Session', onClick: () => data.sessionId && navigate(`/mentor/session/${data.sessionId}`) };
      case 'milestone_pending_confirmation':
        return { label: 'Confirm', onClick: () => data.connectionId && navigate(`/mentor/roadmap/${data.connectionId}`) };
      case 'new_review':
        return { label: 'View &amp; Reply', onClick: () => navigate('/mentor/reviews') };
      default:
        return null;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <MentorPageLayout>
      <div className="max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Inbox</h1>
            {unreadCount > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full text-white font-bold" style={{ backgroundColor: '#FF6B6B' }}>{unreadCount}</span>
            )}
          </div>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead} disabled={markingAll} className="text-sm text-gray-400 hover:text-gray-600 underline disabled:opacity-50">
              {markingAll ? 'Marking…' : 'Mark all as read'}
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#FF6B6B', borderTopColor: 'transparent' }} />
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-gray-100 shadow-sm">
            <p className="text-4xl mb-3">🔔</p>
            <p className="font-semibold text-gray-600 mb-1">All caught up!</p>
            <p className="text-sm text-gray-400">No new notifications</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map(n => {
              const action = getActionForNotification(n);
              return (
                <div key={n.id}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-start gap-3 transition-all"
                  style={{ opacity: n.isRead ? 0.7 : 1, borderLeftWidth: n.isRead ? 1 : 3, borderLeftColor: n.isRead ? '#E2E8F0' : '#FF6B6B' }}>
                  <span className="text-xl flex-shrink-0 mt-0.5">{NOTIFICATION_ICONS[n.type] || NOTIFICATION_ICONS.default}</span>
                  <div className="flex-1 min-w-0">
                    {n.title && <p className="text-sm font-semibold text-gray-800 mb-0.5">{n.title}</p>}
                    {n.body && <p className="text-sm text-gray-500 leading-snug">{n.body}</p>}
                    <p className="text-xs text-gray-300 mt-1">{timeAgo(n.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {action && (
                      <button onClick={action.onClick}
                        className="text-xs px-3 py-1.5 rounded-xl text-white font-medium" style={{ backgroundColor: '#FF6B6B' }}
                        dangerouslySetInnerHTML={{ __html: action.label }}
                      />
                    )}
                    {!n.isRead && (
                      <button onClick={() => handleMarkRead(n.id)} className="text-xs text-gray-300 hover:text-gray-500 transition-colors p-1" title="Mark as read">✓</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MentorPageLayout>
  );
}
