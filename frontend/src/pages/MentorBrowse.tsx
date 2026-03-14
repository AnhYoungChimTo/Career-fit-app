import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import type { Mentor } from '../types';

function MentorCard({ mentor, onConnect }: { mentor: Mentor; onConnect: (id: string) => void }) {
  const navigate = useNavigate();
  const initials = (mentor.displayName || mentor.username || '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const verifiedBadges = mentor.credentials?.filter(c => c.status === 'verified').slice(0, 2) || [];
  const statusColor: Record<string, string> = { active: '#48BB78', paused: '#F6AD55', full: '#FC8181', on_leave: '#9CA3AF', pending: '#9CA3AF', rejected: '#9CA3AF' };
  const statusDot = statusColor[mentor.status] || '#9CA3AF';

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow" style={{ borderRadius: '16px' }}>
      <div className="flex items-start gap-4 mb-3">
        <div className="relative flex-shrink-0">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: '#FF6B6B' }}>
            {initials}
          </div>
          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white" style={{ backgroundColor: statusDot }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-800 text-sm truncate">{mentor.displayName || mentor.username}</p>
          {mentor.industry && <p className="text-xs text-gray-500 mt-0.5">{mentor.industry}</p>}
          {(mentor.locationCity || mentor.locationCountry) && (
            <p className="text-xs text-gray-400 mt-0.5">📍 {[mentor.locationCity, mentor.locationCountry].filter(Boolean).join(', ')}</p>
          )}
        </div>
        {mentor.sessionPriceUsd > 0 ? (
          <div className="text-right flex-shrink-0">
            <p className="font-bold text-gray-800 text-sm">${mentor.sessionPriceUsd}</p>
            <p className="text-xs text-gray-400">/ session</p>
          </div>
        ) : (
          <span className="text-xs font-bold flex-shrink-0" style={{ color: '#48BB78' }}>Free</span>
        )}
      </div>

      {/* Badges */}
      {verifiedBadges.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {verifiedBadges.map(b => (
            <span key={b.id} className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: '#C6F6D5', color: '#276749' }}>✅ {b.badgeLabel}</span>
          ))}
        </div>
      )}

      {/* Headline */}
      {mentor.headline && <p className="text-xs text-gray-500 mb-3 line-clamp-2">{mentor.headline}</p>}

      {/* Industries */}
      {mentor.mentorIndustries?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {mentor.mentorIndustries.slice(0, 3).map(ind => (
            <span key={ind} className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#E6FFFA', color: '#2C7A7B' }}>{ind}</span>
          ))}
        </div>
      )}

      {/* Rating */}
      {mentor.avgRating && (
        <div className="flex items-center gap-1 mb-3">
          <span className="text-sm" style={{ color: '#F6AD55' }}>★</span>
          <span className="text-sm font-semibold text-gray-700">{mentor.avgRating.toFixed(1)}</span>
          {mentor.totalReviews && <span className="text-xs text-gray-400">({mentor.totalReviews})</span>}
        </div>
      )}

      <div className="flex gap-2 mt-auto pt-3 border-t border-gray-50">
        <button onClick={() => navigate(`/m/${mentor.username}`)}
          className="flex-1 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors font-medium">
          View Profile
        </button>
        {mentor.status === 'full' ? (
          <button className="flex-1 py-2 rounded-xl text-sm font-medium" style={{ backgroundColor: '#FFF0F0', color: '#FC8181' }}>
            Full
          </button>
        ) : (
          <button onClick={() => onConnect(mentor.id)}
            className="flex-1 py-2 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90"
            style={{ backgroundColor: '#FF6B6B' }}>
            Connect
          </button>
        )}
      </div>
    </div>
  );
}

export default function MentorBrowse() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'suggested' | 'all'>('suggested');
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ industry: '', credential: '', price_max: '' });
  const [_connecting, setConnecting] = useState<Record<string, boolean>>({});
  const [connected, setConnected] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    loadMentors();
  }, [activeTab, filters]);

  const loadMentors = () => {
    setLoading(true);
    const params: Record<string, string> = { ...filters };
    if (search) params.q = search;
    if (activeTab === 'suggested') params.suggested = 'true';
    api.browseMentors(params).then((res: any) => setMentors(res.data || [])).finally(() => setLoading(false));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadMentors();
  };

  const handleConnect = async (mentorId: string) => {
    if (!user) { navigate('/login'); return; }
    setConnecting(c => ({ ...c, [mentorId]: true }));
    try {
      await api.createConnection({ mentorId, initiatedBy: 'mentee' });
      setConnected(c => ({ ...c, [mentorId]: true }));
    } finally {
      setConnecting(c => ({ ...c, [mentorId]: false }));
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF8F0' }}>
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            <span className="font-bold text-gray-800" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Find a Mentor</span>
          </div>
          <button onClick={() => navigate('/dashboard')} className="text-sm text-gray-400 hover:text-gray-600">← Dashboard</button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Tab bar */}
        <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 mb-6 w-fit">
          {(['suggested', 'all'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="px-5 py-2 rounded-xl text-sm font-medium transition-all"
              style={{ backgroundColor: activeTab === tab ? 'white' : 'transparent', color: activeTab === tab ? '#FF6B6B' : '#6B7280', boxShadow: activeTab === tab ? '0 1px 4px rgba(0,0,0,0.08)' : 'none' }}>
              {tab === 'suggested' ? '✨ Suggested for You' : '🔍 Browse All'}
            </button>
          ))}
        </div>

        {/* Search + filters */}
        {activeTab === 'all' && (
          <form onSubmit={handleSearch} className="flex gap-3 mb-6 flex-wrap">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, role, industry…"
              className="flex-1 min-w-60 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none bg-white"
            />
            <select value={filters.industry} onChange={e => setFilters(f => ({ ...f, industry: e.target.value }))}
              className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none">
              <option value="">All Industries</option>
              {['Investment Banking', 'Private Equity', 'Venture Capital', 'Consulting', 'Corporate Finance', 'Startup', 'Asset Management'].map(i => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
            <select value={filters.price_max} onChange={e => setFilters(f => ({ ...f, price_max: e.target.value }))}
              className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none">
              <option value="">Any Price</option>
              <option value="0">Free only</option>
              <option value="50">Up to $50</option>
              <option value="100">Up to $100</option>
              <option value="200">Up to $200</option>
            </select>
            <button type="submit" className="px-5 py-2.5 rounded-xl text-white text-sm font-medium" style={{ backgroundColor: '#FF6B6B' }}>Search</button>
          </form>
        )}

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-2xl p-5 animate-pulse border border-gray-100">
                <div className="flex gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-gray-200" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-full" />
                  <div className="h-3 bg-gray-100 rounded w-4/5" />
                </div>
                <div className="flex gap-2 mt-4">
                  <div className="h-9 bg-gray-100 rounded-xl flex-1" />
                  <div className="h-9 bg-gray-200 rounded-xl flex-1" />
                </div>
              </div>
            ))}
          </div>
        ) : mentors.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-4">🔍</p>
            <p className="text-lg font-semibold text-gray-600 mb-2">No mentors found</p>
            <p className="text-sm text-gray-400">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {mentors.map(mentor => (
              connected[mentor.id] ? (
                <div key={mentor.id} className="bg-white rounded-2xl p-5 shadow-sm border border-green-100 flex items-center justify-center text-center">
                  <div>
                    <p className="text-2xl mb-2">✅</p>
                    <p className="text-sm font-semibold text-gray-700">{mentor.displayName || mentor.username}</p>
                    <p className="text-xs text-gray-400 mt-1">Request sent!</p>
                  </div>
                </div>
              ) : (
                <MentorCard key={mentor.id} mentor={mentor} onConnect={handleConnect} />
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
