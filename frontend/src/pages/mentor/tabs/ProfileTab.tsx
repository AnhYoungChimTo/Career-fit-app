import { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import MentorPageLayout from '../../../components/mentor/MentorPageLayout';
import type { Mentor, MentorCredential } from '../../../types';

const BADGE_LABELS: Record<string, string> = {
  ex_tier1_bank: 'Ex-Tier 1 Bank',
  cfa_cpa_mba: 'CFA / CPA / MBA',
  vc_pe: 'VC or PE Background',
  university: 'Top University Affiliation',
  years_exp: 'Years of Experience',
};

function BadgeChip({ status }: { status: string }) {
  if (status === 'verified') return <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: '#C6F6D5', color: '#276749' }}>✅ Verified</span>;
  if (status === 'rejected') return <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: '#FED7D7', color: '#9B2335' }}>❌ Rejected</span>;
  return <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: '#FEFCBF', color: '#975A16' }}>⏳ Pending</span>;
}

export default function ProfileTab() {
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    displayName: '',
    headline: '',
    aboutMe: '',
    philosophy: '',
    mentorshipStyle: '',
    sessionPriceUsd: 0,
    linkedinUrl: '',
  });

  useEffect(() => {
    api.getMyMentorProfile().then((res: any) => {
      const m = res.data as Mentor;
      setMentor(m);
      setForm({
        displayName: m.displayName || '',
        headline: m.headline || '',
        aboutMe: m.aboutMe || '',
        philosophy: m.philosophy || '',
        mentorshipStyle: m.mentorshipStyle || '',
        sessionPriceUsd: m.sessionPriceUsd || 0,
        linkedinUrl: m.linkedinUrl || '',
      });
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateMyMentorProfile(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const completeness = () => {
    if (!mentor) return 0;
    const fields = [mentor.displayName, mentor.headline, mentor.aboutMe, mentor.philosophy, mentor.industry, mentor.externalMeetUrl];
    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  };

  if (loading) return (
    <MentorPageLayout>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#FF6B6B', borderTopColor: 'transparent' }} />
      </div>
    </MentorPageLayout>
  );

  const pct = completeness();
  const credentials: MentorCredential[] = mentor?.credentials || [];

  return (
    <MentorPageLayout>
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-800 mb-6" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Your Profile</h1>

        {/* Completeness bar */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-semibold text-gray-700">Profile Completeness</p>
            <span className="text-sm font-bold" style={{ color: pct >= 80 ? '#48BB78' : '#F6AD55' }}>{pct}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
            <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: pct >= 80 ? '#48BB78' : '#FF6B6B' }} />
          </div>
          {pct < 100 && <p className="text-xs text-gray-400 mt-1">Complete your profile to attract the best mentees</p>}
        </div>

        {/* Avatar section */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-5">
          <p className="text-sm font-semibold text-gray-700 mb-3">Profile Photo</p>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0" style={{ backgroundColor: '#FF6B6B' }}>
              {(form.displayName || '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">Upload a professional headshot (min 400×400px)</p>
              <button className="text-sm px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">Upload Photo</button>
            </div>
          </div>
        </div>

        {/* Editable fields */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-5 space-y-4">
          <p className="text-sm font-semibold text-gray-700">Basic Info</p>
          {[
            { label: 'Display Name', key: 'displayName', placeholder: 'Your full name' },
            { label: 'Headline', key: 'headline', placeholder: 'e.g. Senior Investment Banker | Ex-Goldman Sachs' },
            { label: 'LinkedIn URL', key: 'linkedinUrl', placeholder: 'https://linkedin.com/in/...' },
          ].map(({ label, key, placeholder }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
              <input
                type="text"
                value={(form as any)[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 text-gray-800"
                style={{ focusRingColor: '#FF6B6B' } as any}
              />
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Session Price (USD)</label>
            <input
              type="number"
              min={0}
              value={form.sessionPriceUsd}
              onChange={e => setForm(f => ({ ...f, sessionPriceUsd: Number(e.target.value) }))}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none text-gray-800"
            />
          </div>
        </div>

        {/* Bios */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-5 space-y-4">
          <p className="text-sm font-semibold text-gray-700">Bio &amp; Philosophy</p>
          {[
            { label: 'About Me', key: 'aboutMe', max: 600, rows: 4 },
            { label: 'Mentorship Philosophy', key: 'philosophy', max: 400, rows: 3 },
            { label: 'My Style (short)', key: 'mentorshipStyle', max: 300, rows: 2 },
          ].map(({ label, key, max, rows }) => (
            <div key={key}>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-gray-500">{label}</label>
                <span className="text-xs text-gray-300">{((form as any)[key] as string).length}/{max}</span>
              </div>
              <textarea
                rows={rows}
                maxLength={max}
                value={(form as any)[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none resize-none text-gray-800"
              />
            </div>
          ))}
        </div>

        {/* Credentials */}
        {credentials.length > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-5">
            <p className="text-sm font-semibold text-gray-700 mb-3">Credential Badges</p>
            <div className="space-y-2">
              {credentials.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                  <span className="text-sm text-gray-700">{BADGE_LABELS[c.badgeType] || c.badgeLabel}</span>
                  <BadgeChip status={c.status} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Public profile link */}
        {mentor?.username && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-5">
            <p className="text-sm font-semibold text-gray-700 mb-2">Your Public Profile URL</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm bg-gray-50 px-3 py-2 rounded-xl text-gray-600 border border-gray-100 truncate">
                {window.location.origin}/m/{mentor.username}
              </code>
              <a href={`/m/${mentor.username}`} target="_blank" rel="noopener noreferrer"
                className="shrink-0 text-sm px-4 py-2 rounded-xl text-white font-medium" style={{ backgroundColor: '#FF6B6B' }}>
                Preview
              </a>
            </div>
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all disabled:opacity-60"
          style={{ backgroundColor: '#FF6B6B' }}
        >
          {saving ? 'Saving…' : saved ? '✅ Saved!' : 'Save Changes'}
        </button>
      </div>
    </MentorPageLayout>
  );
}
