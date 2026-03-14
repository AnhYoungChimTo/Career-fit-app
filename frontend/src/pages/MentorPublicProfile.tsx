import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import type { Mentor, Review } from '../types';

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => <span key={i} style={{ color: i <= rating ? '#F6AD55' : '#E2E8F0' }}>★</span>)}
    </div>
  );
}

function BadgePill({ label, status }: { label: string; status: string }) {
  if (status !== 'verified') return null;
  return (
    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: '#C6F6D5', color: '#276749' }}>
      ✅ {label}
    </span>
  );
}

export default function MentorPublicProfile() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [joiningWaitlist, setJoiningWaitlist] = useState(false);
  const [onWaitlist, setOnWaitlist] = useState(false);

  useEffect(() => {
    if (!username) return;
    api.getPublicMentorProfile(username).then((res: any) => {
      const m = res.data as Mentor;
      setMentor(m);
      return api.getMentorReviews(m.id);
    }).then((rRes: any) => {
      setReviews((rRes.data || []).slice(0, 3));
    }).catch(() => setError('Mentor not found')).finally(() => setLoading(false));
  }, [username]);

  const handleConnect = async () => {
    if (!user) { navigate('/login', { state: { redirectTo: `/m/${username}` } }); return; }
    if (!mentor) return;
    setConnecting(true);
    try {
      await api.createConnection({ mentorId: mentor.id, initiatedBy: 'mentee' });
      setConnected(true);
    } finally {
      setConnecting(false);
    }
  };

  const handleJoinWaitlist = async () => {
    if (!user) { navigate('/login'); return; }
    if (!mentor) return;
    setJoiningWaitlist(true);
    try {
      await api.joinWaitlist(mentor.id);
      setOnWaitlist(true);
    } finally {
      setJoiningWaitlist(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FFF8F0' }}>
      <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#FF6B6B', borderTopColor: 'transparent' }} />
    </div>
  );

  if (error || !mentor) return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: '#FFF8F0' }}>
      <p className="text-5xl mb-4">🔍</p>
      <p className="text-xl font-bold text-gray-700 mb-2">Mentor not found</p>
      <button onClick={() => navigate('/mentors')} className="text-sm px-5 py-2 rounded-xl text-white" style={{ backgroundColor: '#FF6B6B' }}>Browse Mentors</button>
    </div>
  );

  const isFull = mentor.status === 'full';
  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;
  const initials = (mentor.displayName || mentor.username || '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen py-10 px-4" style={{ backgroundColor: '#FFF8F0' }}>
      <div className="max-w-3xl mx-auto">

        {/* Hero */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4" style={{ backgroundColor: '#FF6B6B' }}>
              {initials}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              {mentor.displayName || mentor.username}
            </h1>
            {mentor.headline && <p className="text-gray-500 mb-3">{mentor.headline}</p>}
            {(mentor.locationCity || mentor.locationCountry) && (
              <p className="text-sm text-gray-400 mb-3">📍 {[mentor.locationCity, mentor.locationCountry].filter(Boolean).join(', ')}</p>
            )}

            {/* Credential badges */}
            {mentor.credentials && mentor.credentials.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center mb-4">
                {mentor.credentials.filter(c => c.status === 'verified').map(c => (
                  <BadgePill key={c.id} label={c.badgeLabel} status={c.status} />
                ))}
              </div>
            )}

            {/* Stats bar */}
            <div className="flex gap-6 text-center border-t border-gray-100 pt-5 mt-2 w-full justify-center">
              {[
                { label: 'Mentees', value: mentor.totalMentees ?? '—' },
                { label: 'Sessions', value: mentor.totalSessions ?? '—' },
                { label: 'Avg Rating', value: avgRating ? `${avgRating}⭐` : '—' },
                { label: 'Reviews', value: reviews.length },
              ].map(stat => (
                <div key={stat.label}>
                  <p className="text-lg font-bold text-gray-800">{stat.value}</p>
                  <p className="text-xs text-gray-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* About */}
        {(mentor.aboutMe || mentor.philosophy) && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6 space-y-4">
            {mentor.aboutMe && (
              <div>
                <h2 className="text-base font-bold text-gray-800 mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>About</h2>
                <p className="text-sm text-gray-600 leading-relaxed">{mentor.aboutMe}</p>
              </div>
            )}
            {mentor.philosophy && (
              <div>
                <h2 className="text-base font-bold text-gray-800 mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Mentorship Philosophy</h2>
                <p className="text-sm text-gray-600 leading-relaxed italic">"{mentor.philosophy}"</p>
              </div>
            )}
          </div>
        )}

        {/* Can help with */}
        {(mentor.supportedGoals?.length > 0 || mentor.mentorIndustries?.length > 0) && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
            <h2 className="text-base font-bold text-gray-800 mb-3" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Can Help With</h2>
            <div className="flex flex-wrap gap-2">
              {mentor.supportedGoals?.map(g => (
                <span key={g} className="text-xs px-3 py-1 rounded-full font-medium" style={{ backgroundColor: '#FFF0F0', color: '#FF6B6B' }}>{g}</span>
              ))}
              {mentor.mentorIndustries?.map(ind => (
                <span key={ind} className="text-xs px-3 py-1 rounded-full font-medium" style={{ backgroundColor: '#E6FFFA', color: '#2C7A7B' }}>{ind}</span>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {mentor.workExperiences && mentor.workExperiences.length > 0 && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
            <h2 className="text-base font-bold text-gray-800 mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Experience</h2>
            <div className="space-y-4">
              {mentor.workExperiences.map(exp => (
                <div key={exp.id} className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-xl flex-shrink-0">🏢</div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{exp.title}</p>
                    <p className="text-sm text-gray-500">{exp.company}</p>
                    {(exp.startDate || exp.endDate) && <p className="text-xs text-gray-400">{exp.startDate} — {exp.endDate || 'Present'}</p>}
                    {exp.description && <p className="text-xs text-gray-500 mt-1">{exp.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {mentor.educationEntries && mentor.educationEntries.length > 0 && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
            <h2 className="text-base font-bold text-gray-800 mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Education</h2>
            <div className="space-y-3">
              {mentor.educationEntries.map(edu => (
                <div key={edu.id} className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-xl flex-shrink-0">🎓</div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{edu.university}</p>
                    <p className="text-sm text-gray-500">{edu.degree}</p>
                    {edu.graduationYear && <p className="text-xs text-gray-400">Class of {edu.graduationYear}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        {reviews.length > 0 && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
            <h2 className="text-base font-bold text-gray-800 mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>What Mentees Say</h2>
            <div className="space-y-4">
              {reviews.map(r => (
                <div key={r.id} className="border-b border-gray-50 last:border-0 pb-4 last:pb-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-gray-700">{r.reviewer?.name || 'Mentee'}</p>
                    <StarRow rating={r.rating} />
                  </div>
                  <p className="text-sm text-gray-500">{r.body}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Session info + CTA */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 text-center">
          {mentor.sessionPriceUsd > 0 ? (
            <p className="text-2xl font-bold text-gray-800 mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>${mentor.sessionPriceUsd}<span className="text-base font-normal text-gray-400"> / session</span></p>
          ) : (
            <p className="text-2xl font-bold mb-1" style={{ color: '#48BB78', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Free</p>
          )}
          {mentor.freeIntroSession && <p className="text-sm text-gray-400 mb-4">✨ Free introductory session available</p>}

          {isFull ? (
            <div>
              <div className="inline-flex items-center gap-2 text-sm font-medium text-red-500 bg-red-50 px-4 py-2 rounded-full mb-4">
                🔴 Currently Full
              </div>
              <br />
              {onWaitlist ? (
                <p className="text-sm text-gray-500">✅ You're on the waitlist!</p>
              ) : (
                <button onClick={handleJoinWaitlist} disabled={joiningWaitlist}
                  className="w-full max-w-xs py-3 rounded-2xl border-2 font-semibold text-sm transition-all disabled:opacity-60"
                  style={{ borderColor: '#FF6B6B', color: '#FF6B6B' }}>
                  {joiningWaitlist ? 'Joining…' : 'Join Waitlist'}
                </button>
              )}
            </div>
          ) : connected ? (
            <p className="text-sm font-semibold" style={{ color: '#48BB78' }}>✅ Connection request sent!</p>
          ) : (
            <button onClick={handleConnect} disabled={connecting}
              className="w-full max-w-xs py-3 rounded-2xl text-white font-semibold text-sm transition-all disabled:opacity-60 hover:opacity-90"
              style={{ backgroundColor: '#FF6B6B' }}>
              {connecting ? 'Sending…' : 'Request Mentorship'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
