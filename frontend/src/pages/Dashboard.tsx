import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { Interview } from '../types';

export default function Dashboard() {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
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

  const stats = {
    total: interviews.length,
    inProgress: interviews.filter(i => i.status === 'in_progress').length,
    completed: interviews.filter(i => i.status === 'completed').length,
  };

  const completedInterviews = interviews.filter(i => i.status === 'completed');
  const inProgressInterviews = interviews.filter(i => i.status === 'in_progress');
  const latestCompleted = completedInterviews[0];

  // Calculate profile completeness
  const profileFields = [
    user?.name, user?.headline, user?.location, user?.about,
    user?.currentRole, user?.currentCompany, user?.linkedinUrl
  ];
  const filledFields = profileFields.filter(Boolean).length;
  const profileCompleteness = Math.round((filledFields / profileFields.length) * 100);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name?.split(' ')[0] || 'there'}!
        </h1>
        <p className="text-gray-600 mt-1">
          Track your career assessments and continue your journey to find the perfect fit.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Assessments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* In Progress Assessments */}
          {inProgressInterviews.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  Continue Your Assessment
                </h2>
              </div>
              <div className="divide-y divide-gray-100">
                {inProgressInterviews.map((interview) => (
                  <div key={interview.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          interview.interviewType === 'lite' ? 'bg-purple-100 text-purple-800' : 'bg-indigo-100 text-indigo-800'
                        }`}>
                          {interview.interviewType === 'lite' ? 'Lite' : interview.interviewType === 'lite_upgraded' ? 'Deep (Upgraded)' : 'Deep'}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          In Progress
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        Started: {new Date(interview.startedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => navigate(`/interview/${interview.id}`)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      </svg>
                      Resume
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed Assessments */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Your Assessments
              </h2>
            </div>

            {interviews.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No assessments yet</h3>
                <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                  Start your first career assessment to discover your perfect fit!
                </p>
                <button
                  onClick={() => navigate('/interview-selection')}
                  className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                >
                  Get Started
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {completedInterviews.map((interview) => (
                  <div key={interview.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          interview.interviewType === 'lite' ? 'bg-purple-100 text-purple-800' : 'bg-indigo-100 text-indigo-800'
                        }`}>
                          {interview.interviewType === 'lite' ? 'Lite' : interview.interviewType === 'lite_upgraded' ? 'Deep (Upgraded)' : 'Deep'}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Completed
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        Completed: {interview.completedAt ? new Date(interview.completedAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    <button
                      onClick={() => navigate(`/results/${interview.id}`)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      View Results
                    </button>
                  </div>
                ))}

                {/* Show abandoned interviews at the bottom */}
                {interviews.filter(i => i.status === 'abandoned').map((interview) => (
                  <div key={interview.id} className="px-6 py-4 flex items-center justify-between opacity-60">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          interview.interviewType === 'lite' ? 'bg-purple-100 text-purple-800' : 'bg-indigo-100 text-indigo-800'
                        }`}>
                          {interview.interviewType === 'lite' ? 'Lite' : 'Deep'}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          Abandoned
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">
                        Started: {new Date(interview.startedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-gray-400 text-sm italic">No longer active</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Sidebar Cards */}
        <div className="space-y-6">
          {/* Profile Completeness */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Profile Completeness</h3>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full transition-all duration-500 ${
                    profileCompleteness >= 80 ? 'bg-green-500' :
                    profileCompleteness >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${profileCompleteness}%` }}
                />
              </div>
              <span className="text-sm font-bold text-gray-700">{profileCompleteness}%</span>
            </div>
            <p className="text-xs text-gray-500">
              {profileCompleteness < 100
                ? 'Complete your profile to get better career matches.'
                : 'Great! Your profile is complete.'}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/interview-selection')}
                className="w-full bg-indigo-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                New Assessment
              </button>

              <button
                onClick={() => navigate('/job-library')}
                className="w-full bg-white text-indigo-600 px-4 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2 border-2 border-indigo-200 text-sm"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                </svg>
                Browse Jobs
              </button>

              {latestCompleted && (
                <button
                  onClick={() => navigate(`/results/${latestCompleted.id}`)}
                  className="w-full bg-white text-green-600 px-4 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors flex items-center justify-center gap-2 border-2 border-green-200 text-sm"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Latest Results
                </button>
              )}
            </div>
          </div>

          {/* Recommended Next Steps */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-sm p-6 text-white">
            <h3 className="text-sm font-semibold uppercase tracking-wide mb-4 text-indigo-100">Recommended Next Steps</h3>
            <ul className="space-y-3">
              {stats.completed === 0 && (
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs">1</span>
                  <span className="text-sm">Complete your first career assessment</span>
                </li>
              )}
              {stats.completed > 0 && stats.completed < 2 && (
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs">1</span>
                  <span className="text-sm">Try the Deep Assessment for more detailed results</span>
                </li>
              )}
              {profileCompleteness < 100 && (
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs">{stats.completed === 0 ? '2' : '1'}</span>
                  <span className="text-sm">Complete your profile for better matches</span>
                </li>
              )}
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs">
                  {profileCompleteness < 100 ? '3' : '2'}
                </span>
                <span className="text-sm">Explore the Job Library to discover careers</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
