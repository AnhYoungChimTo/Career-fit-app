import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import type { MentorStatus } from '../../types';

const STATUS_META: Record<
  MentorStatus,
  { label: string; color: string; bg: string; icon: string; description: string }
> = {
  pending: {
    label: 'Under Review',
    color: '#B45309',
    bg: '#FFFBEB',
    icon: '🕐',
    description: 'Our team is reviewing your profile and credentials.',
  },
  active: {
    label: 'Approved',
    color: '#065F46',
    bg: '#ECFDF5',
    icon: '✅',
    description: 'Your profile is live and visible to mentees.',
  },
  rejected: {
    label: 'Not Approved',
    color: '#991B1B',
    bg: '#FEF2F2',
    icon: '❌',
    description: 'Your application was not approved at this time.',
  },
  paused: {
    label: 'Paused',
    color: '#374151',
    bg: '#F9FAFB',
    icon: '⏸',
    description: 'Your profile is paused and not visible to new mentees.',
  },
  full: {
    label: 'Full',
    color: '#1E40AF',
    bg: '#EFF6FF',
    icon: '👥',
    description: 'You have reached your maximum number of mentees.',
  },
  on_leave: {
    label: 'On Leave',
    color: '#4B5563',
    bg: '#F3F4F6',
    icon: '🌴',
    description: 'You are currently on leave.',
  },
};

export default function MentorPending() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<MentorStatus>('pending');
  const [checking, setChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [error, setError] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    checkStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkStatus = async () => {
    setChecking(true);
    setError('');
    try {
      const res = await api.getMyMentorProfile();
      const mentorStatus: MentorStatus = res?.data?.status || 'pending';
      setStatus(mentorStatus);
      setRejectionReason(res?.data?.rejectionReason || '');
      setLastChecked(new Date());

      if (mentorStatus === 'active') {
        // Don't auto-redirect; let user click
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message || 'Could not fetch status. Please try again.');
    } finally {
      setChecking(false);
    }
  };

  const meta = STATUS_META[status] || STATUS_META.pending;

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ backgroundColor: '#FFF8F0' }}
    >
      <div className="max-w-lg w-full">
        {/* Animated illustration */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div
              className="w-32 h-32 rounded-full flex items-center justify-center text-5xl animate-pulse"
              style={{ background: 'linear-gradient(135deg, #FF6B6B, #4ECDC4)' }}
            >
              📋
            </div>
            <div
              className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full flex items-center justify-center text-xl border-4 border-white"
              style={{ backgroundColor: meta.bg }}
            >
              {meta.icon}
            </div>
          </div>
        </div>

        {/* Main card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 font-['Plus_Jakarta_Sans'] mb-3">
            Your profile is under review
          </h1>
          <p className="text-gray-500 leading-relaxed mb-6">
            Our team will verify your credentials within 24–48 hours. You'll receive an email
            once your profile has been reviewed.
          </p>

          {/* Status badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{ backgroundColor: meta.bg }}
          >
            <span>{meta.icon}</span>
            <span className="text-sm font-semibold" style={{ color: meta.color }}>
              {meta.label}
            </span>
          </div>

          {/* Rejection message */}
          {status === 'rejected' && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6 text-left">
              <p className="text-sm font-semibold text-red-700 mb-1">Application not approved</p>
              <p className="text-sm text-red-600">
                {rejectionReason ||
                  'Your application did not meet our current requirements. Please review our mentor guidelines and revise your profile.'}
              </p>
            </div>
          )}

          {/* Active state */}
          {status === 'active' && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 mb-6">
              <p className="text-sm font-semibold text-emerald-700 mb-1">
                You're approved!
              </p>
              <p className="text-sm text-emerald-600">
                Your mentor profile is now live. Head to your dashboard to start mentoring.
              </p>
            </div>
          )}

          {/* What to expect */}
          {status === 'pending' && (
            <div className="text-left bg-gray-50 rounded-xl p-4 mb-6 space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                What happens next
              </p>
              {[
                { icon: '📧', text: 'You receive a confirmation email' },
                { icon: '🔍', text: 'Our team reviews your credentials' },
                { icon: '✅', text: 'Profile goes live within 24–48 hrs' },
                { icon: '🚀', text: 'Start receiving mentee requests' },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-gray-600">
                  <span>{step.icon}</span>
                  <span>{step.text}</span>
                </div>
              ))}
            </div>
          )}

          {lastChecked && (
            <p className="text-xs text-gray-400 mb-4">
              Last checked: {lastChecked.toLocaleTimeString()}
            </p>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 mb-4">
              {error}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col gap-3">
            {status === 'active' ? (
              <button
                onClick={() => navigate('/mentor/lobby')}
                className="w-full py-3 rounded-xl text-white font-semibold transition-all hover:opacity-90"
                style={{ backgroundColor: '#FF6B6B' }}
              >
                Go to Mentor Dashboard →
              </button>
            ) : status === 'rejected' ? (
              <button
                onClick={() => navigate('/mentor/signup')}
                className="w-full py-3 rounded-xl text-white font-semibold transition-all hover:opacity-90"
                style={{ backgroundColor: '#FF6B6B' }}
              >
                Revise &amp; Resubmit Profile
              </button>
            ) : (
              <button
                onClick={checkStatus}
                disabled={checking}
                className="w-full py-3 rounded-xl font-semibold transition-all hover:opacity-90 border-2 text-gray-700 disabled:opacity-50"
                style={{ borderColor: '#FF6B6B', color: '#FF6B6B' }}
              >
                {checking ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Checking...
                  </span>
                ) : (
                  'Check Status'
                )}
              </button>
            )}

            <Link
              to="/dashboard"
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors text-center"
            >
              ← Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
