import { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import MentorPageLayout from '../../../components/mentor/MentorPageLayout';
import type { MentorSession } from '../../../types';

function StatusChip({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    confirmed: { label: 'Confirmed', bg: '#BEE3F8', color: '#2A69AC' },
    completed: { label: 'Completed', bg: '#C6F6D5', color: '#276749' },
    cancelled: { label: 'Cancelled', bg: '#FED7D7', color: '#9B2335' },
    no_show: { label: 'No Show', bg: '#E2E8F0', color: '#4A5568' },
  };
  const s = map[status] || map.confirmed;
  return <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: s.bg, color: s.color }}>{s.label}</span>;
}

interface CreateSessionForm {
  connectionId: string;
  title: string;
  scheduledAt: string;
  durationMins: number;
  meetingUrl: string;
  agenda: string;
}

export default function CalendarTab() {
  const [sessions, setSessions] = useState<MentorSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<CreateSessionForm>({ connectionId: '', title: '', scheduledAt: '', durationMins: 60, meetingUrl: '', agenda: '' });
  const [creating, setCreating] = useState(false);

  const load = () => {
    api.listMentorSessions().then((res: any) => setSessions(res.data || [])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const upcoming = sessions.filter(s => s.status === 'confirmed' && new Date(s.scheduledAt) >= new Date());
  const past = sessions.filter(s => s.status === 'completed' || new Date(s.scheduledAt) < new Date());

  const handleCreate = async () => {
    if (!form.connectionId || !form.scheduledAt) return;
    setCreating(true);
    try {
      await api.createMentorSession(form);
      setShowModal(false);
      setForm({ connectionId: '', title: '', scheduledAt: '', durationMins: 60, meetingUrl: '', agenda: '' });
      load();
    } finally {
      setCreating(false);
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <MentorPageLayout>
      <div className="max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Calendar &amp; Sessions</h1>
          <button onClick={() => setShowModal(true)}
            className="text-sm px-4 py-2 rounded-xl text-white font-medium" style={{ backgroundColor: '#FF6B6B' }}>
            + Create Session
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#FF6B6B', borderTopColor: 'transparent' }} />
          </div>
        ) : (
          <>
            {/* Upcoming */}
            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Upcoming ({upcoming.length})</p>
              {upcoming.length === 0 ? (
                <div className="bg-white rounded-2xl p-6 text-center border border-gray-100 shadow-sm">
                  <p className="text-2xl mb-2">📅</p>
                  <p className="text-sm text-gray-400">No upcoming sessions. Create one to get started.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcoming.map(s => (
                    <div key={s.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl flex flex-col items-center justify-center bg-red-50 flex-shrink-0">
                        <p className="text-xs font-bold" style={{ color: '#FF6B6B' }}>{new Date(s.scheduledAt).toLocaleDateString('en-US', { month: 'short' })}</p>
                        <p className="text-lg font-bold text-gray-800 leading-none">{new Date(s.scheduledAt).getDate()}</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-semibold text-gray-800 text-sm truncate">{s.title || 'Session'}</p>
                          <StatusChip status={s.status} />
                        </div>
                        <p className="text-xs text-gray-400">{formatDate(s.scheduledAt)} · {s.durationMins} min</p>
                      </div>
                      {s.meetingUrl && (
                        <a href={s.meetingUrl} target="_blank" rel="noopener noreferrer"
                          className="text-sm px-3 py-1.5 rounded-xl text-white font-medium flex-shrink-0" style={{ backgroundColor: '#4ECDC4' }}>
                          Join
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Past */}
            {past.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Past Sessions</p>
                <div className="space-y-2">
                  {past.slice(0, 10).map(s => (
                    <div key={s.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4 opacity-80">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-medium text-gray-700 text-sm truncate">{s.title || 'Session'}</p>
                          <StatusChip status={s.status} />
                        </div>
                        <p className="text-xs text-gray-400">{formatDate(s.scheduledAt)} · {s.durationMins} min</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Create Session Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-5" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Create Session</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Session Title</label>
                  <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. CV Review Call" className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Connection ID (Mentee)</label>
                  <input type="text" value={form.connectionId} onChange={e => setForm(f => ({ ...f, connectionId: e.target.value }))} placeholder="Connection ID" className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Date &amp; Time</label>
                  <input type="datetime-local" value={form.scheduledAt} onChange={e => setForm(f => ({ ...f, scheduledAt: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Duration</label>
                  <select value={form.durationMins} onChange={e => setForm(f => ({ ...f, durationMins: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none">
                    {[30, 45, 60, 90].map(d => <option key={d} value={d}>{d} min</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Meeting Link</label>
                  <input type="url" value={form.meetingUrl} onChange={e => setForm(f => ({ ...f, meetingUrl: e.target.value }))} placeholder="https://zoom.us/..." className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Agenda (optional)</label>
                  <textarea rows={2} value={form.agenda} onChange={e => setForm(f => ({ ...f, agenda: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none resize-none" />
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setShowModal(false)} className="flex-1 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                <button onClick={handleCreate} disabled={creating} className="flex-1 py-2 rounded-xl text-white text-sm font-semibold disabled:opacity-60" style={{ backgroundColor: '#FF6B6B' }}>{creating ? 'Creating…' : 'Create Session'}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MentorPageLayout>
  );
}
