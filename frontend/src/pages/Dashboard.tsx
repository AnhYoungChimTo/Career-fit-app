import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { Interview } from '../types';
import ProfileModal from '../components/ProfileModal';
import SettingsDropdown from '../components/SettingsDropdown';
import ChangePasswordModal from '../components/ChangePasswordModal';

export default function Dashboard() {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadInterviews();
    loadUserData();
  }, []);

  const loadUserData = () => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);
  };

  const loadInterviews = async () => {
    try {
      setIsLoading(true);
      const response = await api.getMyInterviews();

      if (response.success && response.data) {
        setInterviews(response.data);
      } else {
        setError(response.error?.message || 'Failed to load interviews');
      }
    } catch (err: any) {
      console.error('Failed to load interviews:', err);
      setError('Failed to load interviews');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    api.logout();
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string; label: string }> = {
      in_progress: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'In Progress' },
      completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' },
      abandoned: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Abandoned' },
    };

    const { bg, text, label } = config[status] || config.abandoned;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}>
        {label}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const isLite = type === 'lite';
    const isUpgraded = type === 'lite_upgraded';

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        isLite ? 'bg-purple-100 text-purple-800' :
        isUpgraded ? 'bg-indigo-100 text-indigo-800' :
        'bg-indigo-100 text-indigo-800'
      }`}>
        {isLite ? 'Lite' : isUpgraded ? 'Deep (Upgraded)' : 'Deep'}
      </span>
    );
  };

  const stats = {
    total: interviews.length,
    inProgress: interviews.filter(i => i.status === 'in_progress').length,
    completed: interviews.filter(i => i.status === 'completed').length,
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const userInitials = user.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : user.email ? user.email[0].toUpperCase() : 'U';

  const handleProfileUpdate = (updatedUser: any) => {
    setUser(updatedUser);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-indigo-600">Career Fit Analysis</h1>
            <SettingsDropdown
              onChangePassword={() => setIsChangePasswordModalOpen(true)}
              onLogout={handleLogout}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                    {userInitials}
                  </div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-400 rounded-full border-2 border-white"></div>
                </div>
              </div>

              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  {user.name || 'User'}
                </h2>
                <p className="text-sm text-gray-600 mb-3">{user.email}</p>
                <button
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center justify-center mx-auto"
                  onClick={() => setIsProfileModalOpen(true)}
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Update Profile
                </button>
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Assessments</span>
                  <span className="text-lg font-bold text-indigo-600">{stats.total}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">In Progress</span>
                  <span className="text-lg font-bold text-blue-600">{stats.inProgress}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Completed</span>
                  <span className="text-lg font-bold text-green-600">{stats.completed}</span>
                </div>
              </div>

              <div className="border-t border-gray-200 mt-6 pt-4 space-y-3">
                <button
                  onClick={() => navigate('/interview-selection')}
                  className="w-full bg-indigo-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  New Assessment
                </button>

                <button
                  onClick={() => navigate('/job-library')}
                  className="w-full bg-white text-indigo-600 px-4 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors flex items-center justify-center border-2 border-indigo-600"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                  </svg>
                  Browse Jobs
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome back, {user.name?.split(' ')[0] || 'there'}!
              </h2>
              <p className="text-gray-600">
                Track your career assessments and continue your journey to find the perfect fit.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Your Interviews</h2>
              </div>

              {interviews.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No interviews yet</h3>
                  <p className="text-gray-600 mb-4">Start your first career assessment to discover your perfect fit!</p>
                  <button
                    onClick={() => navigate('/interview-selection')}
                    className="inline-flex items-center bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                  >
                    Get Started
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {interviews.map((interview) => (
                    <div key={interview.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {getTypeBadge(interview.interviewType)}
                            {getStatusBadge(interview.status)}
                          </div>
                          <div className="text-sm text-gray-600">
                            Started: {new Date(interview.startedAt).toLocaleDateString()}
                            {interview.completedAt && (
                              <> • Completed: {new Date(interview.completedAt).toLocaleDateString()}</>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {interview.status === 'in_progress' && (
                            <button
                              onClick={() => navigate(`/interview/${interview.id}`)}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                            >
                              Resume
                            </button>
                          )}
                          {interview.status === 'completed' && (
                            <button
                              onClick={() => navigate(`/results/${interview.id}`)}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
                            >
                              View Results
                            </button>
                          )}
                          {interview.status === 'abandoned' && (
                            <span className="text-gray-400 text-sm italic">No longer active</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onUpdate={handleProfileUpdate}
      />

      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
      />
    </div>
  );
}
