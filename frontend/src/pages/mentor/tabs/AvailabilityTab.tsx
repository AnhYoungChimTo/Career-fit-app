import { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import MentorPageLayout from '../../../components/mentor/MentorPageLayout';
import type { Mentor } from '../../../types';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const BLOCKS = ['Morning', 'Afternoon', 'Evening'];

const MENTOR_STATUSES = [
  { value: 'active', label: '🟢 Active', desc: 'Accepting new mentees' },
  { value: 'paused', label: '🟡 Paused', desc: 'Existing mentees only' },
  { value: 'on_leave', label: '⚫ On Leave', desc: 'Not available' },
];

export default function AvailabilityTab() {
  const [_mentor, setMentor] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [availability, setAvailability] = useState<Record<string, boolean>>({});
  const [sessionDuration, setSessionDuration] = useState(60);
  const [bufferTime, setBufferTime] = useState(0);
  const [advanceBooking, setAdvanceBooking] = useState('1_week');
  const [mentorStatus, setMentorStatus] = useState('active');
  const [statusSaving, setStatusSaving] = useState(false);

  useEffect(() => {
    api.getMyMentorProfile().then((res: any) => {
      const m = res.data as Mentor;
      setMentor(m);
      setAvailability(m.availability || {});
      setSessionDuration(m.sessionDuration || 60);
      setBufferTime(m.bufferTime || 0);
      setAdvanceBooking(m.advanceBooking || '1_week');
      setMentorStatus(m.mentorStatus || 'active');
    }).finally(() => setLoading(false));
  }, []);

  const toggleSlot = (day: string, block: string) => {
    const key = `${day}_${block}`;
    setAvailability(a => ({ ...a, [key]: !a[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateMyMentorProfile({ availability, sessionDuration, bufferTime, advanceBooking });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (s: string) => {
    setMentorStatus(s);
    setStatusSaving(true);
    try {
      await api.updateMentorStatus(s);
    } finally {
      setStatusSaving(false);
    }
  };

  return (
    <MentorPageLayout>
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-800 mb-6" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Availability Settings</h1>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#FF6B6B', borderTopColor: 'transparent' }} />
          </div>
        ) : (
          <>
            {/* Mentor status */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-5">
              <p className="text-sm font-semibold text-gray-700 mb-3">Mentor Status {statusSaving && <span className="text-xs text-gray-400 ml-1">Saving…</span>}</p>
              <div className="grid grid-cols-3 gap-3">
                {MENTOR_STATUSES.map(s => (
                  <button key={s.value} onClick={() => handleStatusChange(s.value)}
                    className="p-3 rounded-xl border-2 text-left transition-all"
                    style={{ borderColor: mentorStatus === s.value ? '#FF6B6B' : '#E2E8F0', backgroundColor: mentorStatus === s.value ? '#FFF0F0' : 'white' }}>
                    <p className="text-sm font-medium text-gray-800">{s.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{s.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Weekly grid */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-5">
              <p className="text-sm font-semibold text-gray-700 mb-4">Weekly Availability</p>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left text-xs text-gray-400 font-medium pb-2 w-28">Day</th>
                      {BLOCKS.map(b => <th key={b} className="text-center text-xs text-gray-400 font-medium pb-2">{b}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {DAYS.map(day => (
                      <tr key={day} className="border-t border-gray-50">
                        <td className="py-2 text-sm text-gray-600 font-medium">{day}</td>
                        {BLOCKS.map(block => {
                          const key = `${day}_${block}`;
                          const active = !!availability[key];
                          return (
                            <td key={block} className="py-2 text-center">
                              <button onClick={() => toggleSlot(day, block)}
                                className="w-8 h-8 rounded-lg mx-auto flex items-center justify-center transition-all"
                                style={{ backgroundColor: active ? '#FF6B6B' : '#F3F4F6', color: active ? 'white' : '#9CA3AF' }}>
                                {active ? '✓' : '·'}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Session settings */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-5 space-y-4">
              <p className="text-sm font-semibold text-gray-700">Session Preferences</p>

              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Session Duration</label>
                <div className="flex gap-2">
                  {[30, 45, 60, 90].map(d => (
                    <button key={d} onClick={() => setSessionDuration(d)}
                      className="flex-1 py-2 rounded-xl border-2 text-sm font-medium transition-all"
                      style={{ borderColor: sessionDuration === d ? '#FF6B6B' : '#E2E8F0', backgroundColor: sessionDuration === d ? '#FFF0F0' : 'white', color: sessionDuration === d ? '#FF6B6B' : '#6B7280' }}>
                      {d} min
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Buffer Between Sessions</label>
                <select value={bufferTime} onChange={e => setBufferTime(Number(e.target.value))} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none">
                  <option value={0}>No buffer</option>
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Advance Booking Window</label>
                <select value={advanceBooking} onChange={e => setAdvanceBooking(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none">
                  <option value="1_week">1 week in advance</option>
                  <option value="2_weeks">2 weeks in advance</option>
                  <option value="1_month">1 month in advance</option>
                </select>
              </div>
            </div>

            <button onClick={handleSave} disabled={saving}
              className="w-full py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-60 transition-all"
              style={{ backgroundColor: '#FF6B6B' }}>
              {saving ? 'Saving…' : saved ? '✅ Saved!' : 'Save Availability'}
            </button>
          </>
        )}
      </div>
    </MentorPageLayout>
  );
}
