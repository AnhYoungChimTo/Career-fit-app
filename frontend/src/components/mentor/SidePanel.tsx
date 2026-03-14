import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export interface SidePanelProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const NAV_ITEMS = [
  { id: 'profile', icon: '👤', label: 'Profile', route: '/mentor/profile' },
  { id: 'mentees', icon: '👥', label: 'My Mentees', route: '/mentor/mentees' },
  { id: 'calendar', icon: '📅', label: 'Calendar', route: '/mentor/calendar' },
  { id: 'earnings', icon: '💰', label: 'Earnings', route: '/mentor/earnings' },
  { id: 'reviews', icon: '⭐', label: 'Reviews', route: '/mentor/reviews' },
  { id: 'availability', icon: '🕐', label: 'Availability', route: '/mentor/availability' },
  { id: 'inbox', icon: '🔔', label: 'Inbox', route: '/mentor/inbox' },
];

export default function SidePanel({ activeTab, onTabChange }: SidePanelProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const displayName = user?.name || 'Mentor';
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleTabClick = (item: typeof NAV_ITEMS[0]) => {
    onTabChange(item.id);
    navigate(item.route);
  };

  return (
    <div
      className="shrink-0 flex flex-col h-full"
      style={{
        width: '280px',
        backgroundColor: '#FAFAF8',
        borderRight: '1px solid #E2E8F0',
        minHeight: '100vh',
      }}
    >
      {/* Logo area */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          <div>
            <p className="text-xs text-gray-400 font-medium tracking-wide uppercase">Career Fit</p>
            <p className="text-sm font-bold text-gray-800 font-['Plus_Jakarta_Sans']">
              Mentor Portal
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left"
              style={{
                backgroundColor: isActive ? '#FF6B6B' : 'transparent',
                color: isActive ? 'white' : '#4B5563',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#FFF0F0';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                }
              }}
            >
              <span className="text-lg w-5 text-center leading-none">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="p-4 border-t border-gray-100 space-y-3">
        {/* Connection slot counter */}
        <div className="bg-white rounded-xl p-3 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-600">Mentee Slots</p>
            <span className="text-xs text-gray-400">Free Plan</span>
          </div>
          <div className="flex gap-1.5 mb-1.5">
            {[1, 2, 3].map((slot) => (
              <div
                key={slot}
                className="flex-1 h-2 rounded-full"
                style={{ backgroundColor: '#E5E7EB' }}
              />
            ))}
          </div>
          <p className="text-xs text-gray-400">0/3 slots used</p>
        </div>

        {/* Upgrade banner */}
        <div
          className="rounded-xl p-3 text-white cursor-pointer hover:opacity-90 transition-opacity"
          style={{ background: 'linear-gradient(135deg, #FF6B6B, #FF8E53)' }}
          onClick={() => navigate('/mentor/upgrade')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/mentor/upgrade')}
        >
          <p className="text-xs font-bold mb-0.5">⬆ Upgrade to Premium</p>
          <p className="text-xs opacity-80">Unlimited mentees &amp; features</p>
        </div>

        {/* User info */}
        <div className="flex items-center gap-3 px-2">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
            style={{ backgroundColor: '#FF6B6B' }}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{displayName}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email || ''}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
