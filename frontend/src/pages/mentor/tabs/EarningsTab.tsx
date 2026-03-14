import { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import MentorPageLayout from '../../../components/mentor/MentorPageLayout';
import type { MentorSession, Mentor } from '../../../types';

export default function EarningsTab() {
  const [sessions, setSessions] = useState<MentorSession[]>([]);
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.listMentorSessions(), api.getMyMentorProfile()]).then(([sRes, mRes]) => {
      setSessions((sRes as any).data || []);
      setMentor((mRes as any).data || null);
    }).finally(() => setLoading(false));
  }, []);

  const completedSessions = sessions.filter(s => s.status === 'completed');
  const thisMonth = completedSessions.filter(s => {
    const d = new Date(s.scheduledAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const totalEarnings = completedSessions.reduce((sum, s) => sum + (s.netEarnings || 0), 0);
  const monthEarnings = thisMonth.reduce((sum, s) => sum + (s.netEarnings || 0), 0);

  return (
    <MentorPageLayout>
      <div className="max-w-3xl">
        <h1 className="text-2xl font-bold text-gray-800 mb-6" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Earnings &amp; Payouts</h1>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#FF6B6B', borderTopColor: 'transparent' }} />
          </div>
        ) : (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: 'This Month', value: `$${monthEarnings.toFixed(2)}`, sub: `${thisMonth.length} sessions`, color: '#FF6B6B' },
                { label: 'All Time', value: `$${totalEarnings.toFixed(2)}`, sub: `${completedSessions.length} sessions`, color: '#4ECDC4' },
                { label: 'Pending Payout', value: '$0.00', sub: 'Connect payout method', color: '#F6AD55' },
              ].map(card => (
                <div key={card.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
                  <p className="text-xs text-gray-400 mb-1 font-medium">{card.label}</p>
                  <p className="text-2xl font-bold mb-1" style={{ color: card.color, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{card.value}</p>
                  <p className="text-xs text-gray-400">{card.sub}</p>
                </div>
              ))}
            </div>

            {/* Subscription status */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Plan</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {mentor?.isPremium ? 'Premium — 15% platform fee' : 'Free — 20% platform fee'}
                  </p>
                </div>
                {!mentor?.isPremium && (
                  <button className="text-sm px-4 py-2 rounded-xl text-white font-medium" style={{ backgroundColor: '#FF6B6B' }}>
                    Upgrade
                  </button>
                )}
                {mentor?.isPremium && (
                  <span className="text-xs px-3 py-1 rounded-full font-semibold text-white" style={{ backgroundColor: '#2C3E6B' }}>⭐ Premium</span>
                )}
              </div>
            </div>

            {/* Payout method */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
              <p className="text-sm font-semibold text-gray-700 mb-3">Payout Method</p>
              <p className="text-sm text-gray-400 mb-3">Connect a payout method to receive earnings from sessions.</p>
              <button className="text-sm px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                Connect Bank / PayPal / Stripe
              </button>
            </div>

            {/* Transaction history */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <p className="text-sm font-semibold text-gray-700 mb-4">Transaction History</p>
              {completedSessions.length === 0 ? (
                <p className="text-sm text-center text-gray-400 py-6">No completed sessions yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left text-xs text-gray-400 font-medium pb-2">Date</th>
                        <th className="text-left text-xs text-gray-400 font-medium pb-2">Session</th>
                        <th className="text-right text-xs text-gray-400 font-medium pb-2">Gross</th>
                        <th className="text-right text-xs text-gray-400 font-medium pb-2">Fee</th>
                        <th className="text-right text-xs text-gray-400 font-medium pb-2">Net</th>
                      </tr>
                    </thead>
                    <tbody>
                      {completedSessions.map(s => (
                        <tr key={s.id} className="border-b border-gray-50">
                          <td className="py-2 text-gray-500 text-xs">{new Date(s.scheduledAt).toLocaleDateString()}</td>
                          <td className="py-2 text-gray-700 truncate max-w-[160px]">{s.title || 'Session'}</td>
                          <td className="py-2 text-right text-gray-700">${(s.priceUsd || 0).toFixed(2)}</td>
                          <td className="py-2 text-right text-red-400">-${(s.platformFee || 0).toFixed(2)}</td>
                          <td className="py-2 text-right font-semibold" style={{ color: '#48BB78' }}>${(s.netEarnings || 0).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </MentorPageLayout>
  );
}
