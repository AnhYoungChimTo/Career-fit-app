import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { api } from '../services/api';
import InterviewConductor from '../components/interview/InterviewConductor';
import ModuleDashboard from '../components/interview/ModuleDashboard';
import type { InterviewStatus, Interview } from '../types';

export default function Interview() {
  const { interviewId } = useParams<{ interviewId: string }>();
  const navigate = useNavigate();
  const [interview, setInterview] = useState<InterviewStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadInterview();
  }, [interviewId]);

  const loadInterview = async () => {
    if (!interviewId) {
      setError('No interview ID provided');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.getInterviewStatus(interviewId);

      if (response.success && response.data) {
        setInterview(response.data);

        // If interview is already completed, redirect to results
        if (response.data.status === 'completed') {
          navigate(`/results/${interviewId}`);
          return;
        }
      } else {
        setError(response.error?.message || 'Failed to load interview');
      }

      setIsLoading(false);
    } catch (err: any) {
      console.error('Failed to load interview:', err);
      setError(err.response?.data?.error?.message || 'Failed to load interview');
      setIsLoading(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading interview...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !interview) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <svg
              className="w-16 h-16 text-red-500 mx-auto mb-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Interview Not Found</h2>
            <p className="text-gray-600">{error || 'Could not load interview'}</p>
          </div>
          <button
            onClick={() => navigate('/interview-selection')}
            className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Start New Interview
          </button>
        </div>
      </div>
    );
  }

  // For Deep interviews, show module dashboard if no module selected
  const isDeepInterview = interview.interviewType === 'deep' || interview.interviewType === 'lite_upgraded';

  if (isDeepInterview && !selectedModule) {
    return (
      <ModuleDashboard
        key={refreshKey}
        interviewId={interviewId!}
        interview={interview as unknown as Interview}
        onModuleSelect={(moduleId) => setSelectedModule(moduleId)}
      />
    );
  }

  // Render interview conductor
  // For Lite: show conductor directly
  // For Deep: show conductor for selected module
  const conductorType = interview.interviewType === 'lite_upgraded' ? 'lite' : interview.interviewType;

  return (
    <InterviewConductor
      interviewId={interviewId!}
      interviewType={conductorType}
      moduleId={selectedModule || undefined}
      onBackToDashboard={isDeepInterview ? () => { setSelectedModule(null); setRefreshKey((k) => k + 1); } : undefined}
    />
  );
}
