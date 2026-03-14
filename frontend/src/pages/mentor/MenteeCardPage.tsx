import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import SidePanel from '../../components/mentor/SidePanel';

interface MenteeProfile {
  id: string;
  name?: string;
  email: string;
  headline?: string;
  location?: string;
  currentRole?: string;
  currentCompany?: string;
  about?: string;
  // Extended profile fields
  bio?: string;
  careerGoal?: string;
  careerGoalDescription?: string;
  urgency?: 'low' | 'medium' | 'high';
  matchScore?: number;
  industry?: string;
  education?: string;
  experiences?: Array<{
    title: string;
    company: string;
    startDate?: string;
    endDate?: string;
    description?: string;
  }>;
  educationEntries?: Array<{
    university: string;
    degree: string;
    graduationYear?: string;
  }>;
  skills?: string[];
  connectionId?: string;
  connectionStatus?: string;
}

const URGENCY_COLORS: Record<string, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-green-100 text-green-700',
};

export default function MenteeCardPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [profile, setProfile] = useState<MenteeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get('/profile/' + id);
        const data = res?.data || res;
        setProfile(data);
        if (data?.connectionStatus === 'active') {
          setConnected(true);
        }
      } catch (err: any) {
        setError(err?.response?.data?.error?.message || err?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleConnect = async () => {
    if (!id) return;
    setConnecting(true);
    try {
      await api.createConnection({ mentorId: user?.id || '', menteeId: id, initiatedBy: 'mentor' });
      setConnected(true);
      showToast('Connection request sent!');
    } catch (err: any) {
      showToast(err?.response?.data?.error?.message || 'Failed to send request');
    } finally {
      setConnecting(false);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#FFF8F0' }}>
      <SidePanel activeTab="mentees" onTabChange={() => {}} />

      <main className="flex-1 overflow-y-auto">
        {/* Toast */}
        {toast && (
          <div
            className="fixed top-4 right-4 z-50 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium"
            style={{ backgroundColor: '#4ECDC4' }}
          >
            {toast}
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center h-full">
            <div
              className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: '#FF6B6B', borderTopColor: 'transparent' }}
            />
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <p className="text-red-500 font-medium">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-white border border-gray-200 hover:bg-gray-50"
            >
              ← Go Back
            </button>
          </div>
        )}

        {!loading && !error && profile && (
          <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
            {/* Back button */}
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition-colors"
            >
              ← Back to Feed
            </button>

            {/* Hero card */}
            <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6">
              <div className="flex items-start gap-5">
                {/* Avatar */}
                <div
                  className="flex-shrink-0 rounded-full flex items-center justify-center text-white font-bold text-2xl"
                  style={{ width: 80, height: 80, backgroundColor: '#FF6B6B' }}
                >
                  {getInitials(profile.name)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">
                        {profile.name || profile.email}
                      </h1>
                      {(profile.currentRole || profile.currentCompany) && (
                        <p className="text-gray-500 text-sm mt-0.5">
                          {[profile.currentRole, profile.currentCompany]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {profile.urgency && (
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            URGENCY_COLORS[profile.urgency] || 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {profile.urgency.charAt(0).toUpperCase() + profile.urgency.slice(1)}{' '}
                          Urgency
                        </span>
                      )}
                      {profile.matchScore !== undefined && (
                        <span
                          className="px-2.5 py-0.5 rounded-full text-xs font-semibold text-white"
                          style={{ backgroundColor: '#4ECDC4' }}
                        >
                          {profile.matchScore}% Match
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                    {profile.industry && (
                      <span className="flex items-center gap-1">
                        🏭 {profile.industry}
                      </span>
                    )}
                    {profile.education && (
                      <span className="flex items-center gap-1">
                        🎓 {profile.education}
                      </span>
                    )}
                    {profile.location && (
                      <span className="flex items-center gap-1">
                        📍 {profile.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action bar */}
              <div className="flex items-center gap-3 mt-5 pt-5 border-t border-gray-100">
                {!connected ? (
                  <button
                    onClick={handleConnect}
                    disabled={connecting}
                    className="px-5 py-2.5 rounded-lg text-white text-sm font-semibold transition-opacity disabled:opacity-60"
                    style={{ backgroundColor: '#FF6B6B' }}
                  >
                    {connecting ? 'Sending...' : 'Send Connection Request'}
                  </button>
                ) : (
                  <span
                    className="px-5 py-2.5 rounded-lg text-white text-sm font-semibold"
                    style={{ backgroundColor: '#4ECDC4' }}
                  >
                    Connected
                  </span>
                )}
                {profile.connectionStatus === 'active' && profile.connectionId && (
                  <button
                    onClick={() => navigate(`/mentor/roadmap/${profile.connectionId}`)}
                    className="px-5 py-2.5 rounded-lg text-sm font-semibold border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition-colors"
                  >
                    View Roadmap
                  </button>
                )}
              </div>
            </div>

            {/* Career Goal */}
            {(profile.careerGoal || profile.careerGoalDescription) && (
              <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6">
                <h2 className="text-base font-bold text-gray-900 mb-2">Career Goal</h2>
                {profile.careerGoal && (
                  <p className="text-sm font-semibold text-gray-700 mb-1">{profile.careerGoal}</p>
                )}
                {profile.careerGoalDescription && (
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {profile.careerGoalDescription}
                  </p>
                )}
              </div>
            )}

            {/* Bio */}
            {(profile.about || profile.bio) && (
              <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6">
                <h2 className="text-base font-bold text-gray-900 mb-2">About</h2>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                  {profile.about || profile.bio}
                </p>
              </div>
            )}

            {/* Experience */}
            {profile.experiences && profile.experiences.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6">
                <h2 className="text-base font-bold text-gray-900 mb-4">Experience</h2>
                <div className="space-y-4">
                  {profile.experiences.map((exp, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div
                        className="flex-shrink-0 w-2 h-2 rounded-full mt-2"
                        style={{ backgroundColor: '#FF6B6B' }}
                      />
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{exp.title}</p>
                        <p className="text-sm text-gray-500">{exp.company}</p>
                        {(exp.startDate || exp.endDate) && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            {exp.startDate || ''} — {exp.endDate || 'Present'}
                          </p>
                        )}
                        {exp.description && (
                          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {profile.educationEntries && profile.educationEntries.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6">
                <h2 className="text-base font-bold text-gray-900 mb-4">Education</h2>
                <div className="space-y-3">
                  {profile.educationEntries.map((edu, idx) => (
                    <div key={idx} className="flex gap-3">
                      <span className="text-base mt-0.5">🎓</span>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{edu.degree}</p>
                        <p className="text-sm text-gray-500">{edu.university}</p>
                        {edu.graduationYear && (
                          <p className="text-xs text-gray-400">{edu.graduationYear}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills */}
            {profile.skills && profile.skills.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6">
                <h2 className="text-base font-bold text-gray-900 mb-3">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-100"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom back button */}
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition-colors pb-4"
            >
              ← Back to Feed
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
