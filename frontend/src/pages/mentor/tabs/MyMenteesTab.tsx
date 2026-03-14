import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../services/api';
import MentorPageLayout from '../../../components/mentor/MentorPageLayout';
import type { MentorConnection } from '../../../types';

function StatusTag({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    active: { label: 'Active', bg: '#C6F6D5', color: '#276749' },
    pending: { label: 'Awaiting Response', bg: '#FEFCBF', color: '#975A16' },
    declined: { label: 'Declined', bg: '#FED7D7', color: '#9B2335' },
    ended: { label: 'Ended', bg: '#E2E8F0', color: '#4A5568' },
  };
  const s = map[status] || map.active;
  return (
    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

export default function MyMenteesTab() {
  const navigate = useNavigate();
  const [connections, setConnections] = useState<MentorConnection[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.listConnections().then((res: any) => {
      setConnections(res.data || []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const pending = connections.filter(c => c.status === 'pending');
  const active = connections.filter(c => c.status === 'active');

  const handleAccept = async (id: string) => {
    await api.acceptConnection(id);
    load();
  };

  const handleReject = async (id: string) => {
    await api.rejectConnection(id);
    load();
  };

  const initials = (name?: string) =>
    (name || '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <MentorPageLayout>
      <div className="max-w-3xl">
        <h1 className="text-2xl font-bold text-gray-800 mb-6" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>My Mentees</h1>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#FF6B6B', borderTopColor: 'transparent' }} />
          </div>
        ) : (
          <>
            {/* Pending Requests */}
            {pending.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Pending Requests ({pending.length})</p>
                <div className="space-y-3">
                  {pending.map(c => (
                    <div key={c.id} className="bg-white rounded-2xl p-4 shadow-sm border border-amber-100 flex items-center gap-4">
                      <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 text-sm" style={{ backgroundColor: '#F6AD55' }}>
                        {initials(c.mentee?.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 text-sm">{c.mentee?.name || 'Mentee'}</p>
                        <p className="text-xs text-gray-400 mt-0.5 truncate">{c.introMessage || 'Sent a connection request'}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => handleAccept(c.id)}
                          className="text-sm px-3 py-1.5 rounded-xl text-white font-medium" style={{ backgroundColor: '#48BB78' }}>
                          Accept
                        </button>
                        <button onClick={() => handleReject(c.id)}
                          className="text-sm px-3 py-1.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50">
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Active Mentees */}
            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Active Mentees ({active.length})</p>
              {active.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm">
                  <p className="text-3xl mb-3">👥</p>
                  <p className="font-semibold text-gray-600 mb-1">No active mentees yet</p>
                  <p className="text-sm text-gray-400">Go to your lobby to connect with mentees</p>
                  <button onClick={() => navigate('/mentor/lobby')}
                    className="mt-4 text-sm px-5 py-2 rounded-xl text-white font-medium" style={{ backgroundColor: '#FF6B6B' }}>
                    Browse Mentees
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {active.map(c => (
                    <div key={c.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
                      <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 text-sm" style={{ backgroundColor: '#4ECDC4' }}>
                        {initials(c.mentee?.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-semibold text-gray-800 text-sm">{c.mentee?.name || 'Mentee'}</p>
                          <StatusTag status={c.status} />
                        </div>
                        <p className="text-xs text-gray-400">{c.mentee?.currentRole || 'No role listed'}</p>
                        <p className="text-xs text-gray-300 mt-0.5">Connected {new Date(c.acceptedAt || c.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => navigate(`/mentor/chat/${c.id}`)}
                          className="text-xs px-3 py-1.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50">
                          💬 Message
                        </button>
                        <button onClick={() => navigate(`/mentor/roadmap/${c.id}`)}
                          className="text-xs px-3 py-1.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50">
                          🗺 Roadmap
                        </button>
                        <button onClick={() => navigate(`/mentor/mentee/${c.menteeId}`)}
                          className="text-xs px-3 py-1.5 rounded-xl text-white font-medium" style={{ backgroundColor: '#FF6B6B' }}>
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Free tier usage bar */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-medium text-gray-600">Free Tier Slots</p>
                <span className="text-sm text-gray-400">{active.length}/3 used</span>
              </div>
              <div className="flex gap-2 mb-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex-1 h-2 rounded-full" style={{ backgroundColor: i <= active.length ? '#FF6B6B' : '#E5E7EB' }} />
                ))}
              </div>
              {active.length >= 3 && (
                <p className="text-xs text-amber-600">You've reached the 3-mentee free limit. <span className="font-semibold cursor-pointer underline">Upgrade to connect with more.</span></p>
              )}
            </div>
          </>
        )}
      </div>
    </MentorPageLayout>
  );
}
