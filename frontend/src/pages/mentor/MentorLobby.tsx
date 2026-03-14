import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import SidePanel from '../../components/mentor/SidePanel';
import type { Mentor, Notification } from '../../types';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface MenteeCard {
  id: string;
  name: string;
  currentRole?: string;
  currentCompany?: string;
  currentIndustry?: string;
  targetIndustry?: string;
  goalType: string;
  goalLabel?: string;
  urgency: 'actively_looking' | 'exploring' | 'open_to_offers';
  education?: string;
  bio?: string;
  location?: string;
  timezone?: string;
  matchScore?: number;
}

interface Filters {
  goalType: string;
  urgency: string;
  industry: string;
  search: string;
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-pulse">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-gray-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-2/3" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
        </div>
        <div className="w-16 h-6 bg-gray-200 rounded-full" />
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-4/5" />
        <div className="h-3 bg-gray-100 rounded w-3/5" />
      </div>
      <div className="flex gap-2 mt-4">
        <div className="h-9 bg-gray-200 rounded-xl flex-1" />
        <div className="h-9 bg-gray-100 rounded-xl flex-1" />
      </div>
    </div>
  );
}

const URGENCY_META: Record<
  MenteeCard['urgency'],
  { label: string; icon: string; color: string; bg: string }
> = {
  actively_looking: { label: 'Actively Looking', icon: '🔥', color: '#991B1B', bg: '#FEF2F2' },
  exploring: { label: 'Exploring', icon: '⏳', color: '#92400E', bg: '#FFFBEB' },
  open_to_offers: { label: 'Open to Offers', icon: '💼', color: '#065F46', bg: '#ECFDF5' },
};

interface ConnectModalProps {
  mentee: MenteeCard;
  currentUser: { id: string; name?: string } | null;
  mentorId: string;
  onClose: () => void;
}

function ConnectModal({ mentee, currentUser, mentorId, onClose }: ConnectModalProps) {
  const [message, setMessage] = useState(
    `Hi ${mentee.name}, I came across your profile and would love to connect! I believe I can help you with your goal of ${mentee.goalLabel || mentee.goalType}.`
  );
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    setSending(true);
    setError('');
    try {
      await api.createConnection({
        mentorId,
        menteeId: mentee.id,
        introMessage: message,
        initiatedBy: currentUser?.id || '',
      });
      setSent(true);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message || 'Failed to send request.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10">
        {sent ? (
          <div className="text-center py-6">
            <div className="text-5xl mb-4">🎉</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Request Sent!</h3>
            <p className="text-gray-500 text-sm mb-6">
              Your connection request has been sent to {mentee.name}.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-xl text-white font-semibold"
              style={{ backgroundColor: '#FF6B6B' }}
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 font-['Plus_Jakarta_Sans']">
                  Connect with {mentee.name}
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">{mentee.currentRole || 'Mentee'}</p>
              </div>
              <button onClick={onClose} className="text-gray-300 hover:text-gray-500 text-xl ml-4">
                ✕
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Intro Message
              </label>
              <textarea
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 resize-none"
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write a personalized message..."
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 mb-4">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={sending || !message.trim()}
                className="flex-1 py-3 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: '#FF6B6B' }}
              >
                {sending ? 'Sending...' : 'Send Request'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const ONBOARDING_SLIDES = [
  {
    icon: '👋',
    title: 'Welcome to your Mentor Portal!',
    body: 'This is your command center for managing mentees, sessions, and your professional brand.',
  },
  {
    icon: '🎯',
    title: 'Browse the Mentee Feed',
    body: 'Explore mentees looking for guidance. Filter by goals, urgency, and industry to find the best matches.',
  },
  {
    icon: '🚀',
    title: 'Make an Impact',
    body: 'Send connection requests to up to 3 mentees on the free plan. Upgrade anytime for unlimited access.',
  },
];

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────

export default function MentorLobby() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [mentees, setMentees] = useState<MenteeCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedError, setFeedError] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filters, setFilters] = useState<Filters>({ goalType: '', urgency: '', industry: '', search: '' });
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingSlide, setOnboardingSlide] = useState(0);
  const [connectTarget, setConnectTarget] = useState<MenteeCard | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    loadMentorData();
    loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadFeed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.goalType, filters.urgency, filters.industry]);

  const loadMentorData = async () => {
    try {
      const res = await api.getMyMentorProfile();
      const mentorData: Mentor = res?.data;
      setMentor(mentorData);
      if (mentorData && !mentorData.onboardingDone) {
        setShowOnboarding(true);
      }
    } catch {
      // Not a mentor yet or error — silently fail
    }
  };

  const loadFeed = useCallback(async () => {
    setLoading(true);
    setFeedError('');
    try {
      const params: Record<string, string> = {};
      if (filters.goalType) params.goalType = filters.goalType;
      if (filters.urgency) params.urgency = filters.urgency;
      if (filters.industry) params.industry = filters.industry;
      const res = await api.getMenteeFeed(params);
      setMentees(res?.data || []);
    } catch {
      setFeedError('Failed to load mentee feed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [filters.goalType, filters.urgency, filters.industry]);

  const loadNotifications = async () => {
    try {
      const res = await api.getNotifications();
      setNotifications(res?.data || []);
    } catch {
      // Silently fail
    }
  };

  const handleMarkOnboardingDone = async () => {
    try {
      await api.markOnboardingDone();
    } catch {
      // Silently fail
    } finally {
      setShowOnboarding(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredMentees = mentees.filter((m) => {
    if (!filters.search) return true;
    const q = filters.search.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      (m.currentRole || '').toLowerCase().includes(q) ||
      (m.goalLabel || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#FFF8F0' }}>
      {/* Side Panel */}
      <SidePanel activeTab="mentees" onTabChange={() => {}} />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4 shrink-0">
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900 font-['Plus_Jakarta_Sans']">
              Mentee Feed
            </h1>
          </div>

          {/* Search */}
          <div className="relative w-64">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Search mentees..."
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 bg-gray-50"
            />
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <span className="text-lg">🔔</span>
              {unreadCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-bold"
                  style={{ backgroundColor: '#FF6B6B' }}
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-40 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                  <p className="font-semibold text-sm text-gray-800">Notifications</p>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-gray-400 hover:text-gray-600 text-sm"
                  >
                    ✕
                  </button>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-center text-sm text-gray-400 py-6">No notifications</p>
                  ) : (
                    notifications.slice(0, 10).map((n) => (
                      <div
                        key={n.id}
                        className="px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors"
                        style={{ backgroundColor: n.isRead ? 'white' : '#FFF8F0' }}
                      >
                        <p className="text-sm font-medium text-gray-800">{n.title}</p>
                        {n.body && <p className="text-xs text-gray-500 mt-0.5">{n.body}</p>}
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(n.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User avatar */}
          <div className="flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold cursor-pointer"
              style={{ backgroundColor: '#FF6B6B' }}
              onClick={() => navigate('/mentor/profile')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate('/mentor/profile')}
            >
              {(user?.name || 'M').charAt(0).toUpperCase()}
            </div>
          </div>

          {/* Upgrade CTA */}
          {mentor && !mentor.isPremium && (
            <button
              className="px-4 py-2 rounded-xl text-sm font-semibold text-amber-800 border border-amber-200 hover:bg-amber-50 transition-colors"
              style={{ backgroundColor: '#FFFBEB' }}
              onClick={() => navigate('/mentor/upgrade')}
            >
              ⭐ Upgrade
            </button>
          )}
        </header>

        {/* Filter chips */}
        <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-3 overflow-x-auto shrink-0">
          {/* Goal filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium whitespace-nowrap">Goal:</span>
            {[
              { label: 'All', value: '' },
              { label: 'Land Role', value: 'land_role' },
              { label: 'Career Switch', value: 'career_switch' },
              { label: 'Top University', value: 'top_university' },
              { label: 'Startup', value: 'build_startup' },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFilters((f) => ({ ...f, goalType: opt.value }))}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap"
                style={{
                  backgroundColor: filters.goalType === opt.value ? '#FF6B6B' : '#F3F4F6',
                  color: filters.goalType === opt.value ? 'white' : '#6B7280',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="w-px h-5 bg-gray-200" />

          {/* Urgency filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium whitespace-nowrap">Urgency:</span>
            {[
              { label: 'All', value: '' },
              { label: 'Actively Looking', value: 'actively_looking' },
              { label: 'Exploring', value: 'exploring' },
              { label: 'Open to Offers', value: 'open_to_offers' },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFilters((f) => ({ ...f, urgency: opt.value }))}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap"
                style={{
                  backgroundColor: filters.urgency === opt.value ? '#FF6B6B' : '#F3F4F6',
                  color: filters.urgency === opt.value ? 'white' : '#6B7280',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="w-px h-5 bg-gray-200" />

          {/* Industry filter */}
          <select
            className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-600 focus:outline-none"
            value={filters.industry}
            onChange={(e) => setFilters((f) => ({ ...f, industry: e.target.value }))}
          >
            <option value="">All Industries</option>
            {[
              'Investment Banking', 'Private Equity', 'Venture Capital', 'Consulting',
              'Corporate Finance', 'Startup', 'Asset Management',
            ].map((ind) => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>
        </div>

        {/* Feed content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
            </div>
          ) : feedError ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="text-5xl mb-4">😕</div>
              <p className="text-gray-600 font-medium mb-2">Couldn't load mentee feed</p>
              <p className="text-sm text-gray-400 mb-6">{feedError}</p>
              <button
                onClick={loadFeed}
                className="px-6 py-3 rounded-xl text-white font-semibold transition-all hover:opacity-90"
                style={{ backgroundColor: '#FF6B6B' }}
              >
                Try Again
              </button>
            </div>
          ) : filteredMentees.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="text-5xl mb-4">🌱</div>
              <p className="text-lg font-semibold text-gray-700 mb-2">No mentees found</p>
              <p className="text-sm text-gray-400 mb-6">
                Try adjusting your filters or share your profile link to attract mentees.
              </p>
              <button
                onClick={() => {
                  const profileUrl = `${window.location.origin}/m/${mentor?.username || ''}`;
                  navigator.clipboard.writeText(profileUrl).catch(() => {});
                  alert('Profile link copied to clipboard!');
                }}
                className="px-6 py-3 rounded-xl font-semibold border-2 transition-all"
                style={{ borderColor: '#FF6B6B', color: '#FF6B6B' }}
              >
                📋 Copy Profile Link
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {filteredMentees.map((mentee) => {
                const urgency = URGENCY_META[mentee.urgency] || URGENCY_META.exploring;
                return (
                  <div
                    key={mentee.id}
                    className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                  >
                    {/* Header */}
                    <div className="flex items-start gap-3 mb-3">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white text-base font-bold flex-shrink-0"
                        style={{ backgroundColor: '#4ECDC4' }}
                      >
                        {(mentee.name || '?').charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-sm truncate">{mentee.name}</h3>
                        <p className="text-xs text-gray-500 truncate">
                          {mentee.currentRole}
                          {mentee.currentCompany ? ` @ ${mentee.currentCompany}` : ''}
                        </p>
                      </div>
                      {mentee.matchScore !== undefined && (
                        <span
                          className="text-xs font-bold px-2 py-1 rounded-full text-white flex-shrink-0"
                          style={{ backgroundColor: '#FF6B6B' }}
                        >
                          {mentee.matchScore}% match
                        </span>
                      )}
                    </div>

                    {/* Urgency pill */}
                    <div className="mb-3">
                      <span
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{ backgroundColor: urgency.bg, color: urgency.color }}
                      >
                        {urgency.icon} {urgency.label}
                      </span>
                    </div>

                    {/* Career arrow */}
                    {(mentee.currentIndustry || mentee.targetIndustry) && (
                      <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                        <span className="font-medium">{mentee.currentIndustry || '—'}</span>
                        <span className="text-gray-300">→</span>
                        <span className="font-semibold" style={{ color: '#FF6B6B' }}>
                          {mentee.targetIndustry || '—'}
                        </span>
                      </div>
                    )}

                    {/* Goal */}
                    <p className="text-sm font-semibold text-gray-800 mb-2">
                      {mentee.goalLabel || mentee.goalType}
                    </p>

                    {/* Education */}
                    {mentee.education && (
                      <p className="text-xs text-gray-400 mb-2">🎓 {mentee.education}</p>
                    )}

                    {/* Bio */}
                    {mentee.bio && (
                      <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">
                        {mentee.bio}
                      </p>
                    )}

                    {/* Footer */}
                    <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
                      {mentee.location && <span>📍 {mentee.location}</span>}
                      {mentee.timezone && <span>🕐 {mentee.timezone}</span>}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setConnectTarget(mentee)}
                        className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90"
                        style={{ backgroundColor: '#FF6B6B' }}
                      >
                        Connect
                      </button>
                      <button
                        onClick={() => navigate(`/mentees/${mentee.id}`)}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all hover:bg-gray-50"
                        style={{ borderColor: '#FF6B6B', color: '#FF6B6B' }}
                      >
                        View Profile
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Connect modal */}
      {connectTarget && mentor && (
        <ConnectModal
          mentee={connectTarget}
          currentUser={user}
          mentorId={mentor.id}
          onClose={() => setConnectTarget(null)}
        />
      )}

      {/* Day 1 Onboarding modal */}
      {showOnboarding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 z-10">
            <div className="text-center">
              <div className="text-6xl mb-4">{ONBOARDING_SLIDES[onboardingSlide].icon}</div>
              <h2 className="text-2xl font-bold text-gray-900 font-['Plus_Jakarta_Sans'] mb-3">
                {ONBOARDING_SLIDES[onboardingSlide].title}
              </h2>
              <p className="text-gray-500 leading-relaxed mb-8">
                {ONBOARDING_SLIDES[onboardingSlide].body}
              </p>

              {/* Dot navigation */}
              <div className="flex justify-center gap-2 mb-8">
                {ONBOARDING_SLIDES.map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full transition-all duration-300 cursor-pointer"
                    style={{
                      backgroundColor: i === onboardingSlide ? '#FF6B6B' : '#E5E7EB',
                    }}
                    onClick={() => setOnboardingSlide(i)}
                  />
                ))}
              </div>

              <div className="flex gap-3">
                {onboardingSlide < ONBOARDING_SLIDES.length - 1 ? (
                  <>
                    <button
                      onClick={handleMarkOnboardingDone}
                      className="flex-1 py-3 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
                    >
                      Skip
                    </button>
                    <button
                      onClick={() => setOnboardingSlide((s) => s + 1)}
                      className="flex-1 py-3 rounded-xl text-white font-semibold transition-all hover:opacity-90"
                      style={{ backgroundColor: '#FF6B6B' }}
                    >
                      Next →
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleMarkOnboardingDone}
                    className="w-full py-3 rounded-xl text-white font-semibold transition-all hover:opacity-90"
                    style={{ backgroundColor: '#FF6B6B' }}
                  >
                    Start Browsing 🚀
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
