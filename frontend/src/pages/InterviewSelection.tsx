import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { InterviewType, Interview } from '../types';

export default function InterviewSelection() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'situation' | 'selection'>('situation');
  const [recommendation, setRecommendation] = useState<InterviewType | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string>('');
  const [inProgressInterview, setInProgressInterview] = useState<Interview | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for in-progress interviews on mount
  useEffect(() => {
    checkInProgressInterview();
  }, []);

  const checkInProgressInterview = async () => {
    try {
      setIsLoading(true);
      const response = await api.getMyInterviews();

      if (response.success && response.data) {
        // Find in-progress interview
        const inProgress = response.data.find(
          (interview: Interview) => interview.status === 'in_progress'
        );

        if (inProgress) {
          setInProgressInterview(inProgress);
        }
      }
    } catch (err) {
      console.error('Error checking interviews:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Current situation options
  const situationOptions = [
    {
      value: 'exploring',
      label: 'Exploring my options',
      description: "I'm not sure what career path suits me best",
      recommendsLite: true,
    },
    {
      value: 'validating',
      label: 'Validating a decision',
      description: 'I have an idea but want to confirm it',
      recommendsLite: true,
    },
    {
      value: 'discovering',
      label: 'Deep self-discovery',
      description: 'I want comprehensive insights about myself',
      recommendsLite: false,
    },
    {
      value: 'career_change',
      label: 'Planning a career change',
      description: 'I need detailed guidance for a major transition',
      recommendsLite: false,
    },
  ];

  const handleSituationSelect = (value: string) => {
    const selected = situationOptions.find((opt) => opt.value === value);
    if (selected) {
      setRecommendation(selected.recommendsLite ? 'lite' : 'deep');
      setStep('selection');
    }
  };

  const handleAbandonAndStartNew = async () => {
    if (!inProgressInterview) return;

    try {
      setIsLoading(true);
      await api.abandonInterview(inProgressInterview.id);
      setInProgressInterview(null); // Clear the in-progress state
    } catch (err) {
      console.error('Error abandoning interview:', err);
      setError('Failed to abandon interview');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartInterview = async (type: InterviewType) => {
    setIsStarting(true);
    setError('');

    try {
      const response = await api.startInterview({
        interviewType: type,
        selectedModules: type === 'deep' ? undefined : undefined, // Will be selected later for deep
      });

      if (response.success && response.data) {
        // Navigate to interview page
        navigate(`/interview/${response.data.id}`);
      } else {
        setError(response.error?.message || 'Failed to start interview');
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to start interview');
    } finally {
      setIsStarting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // In-progress interview found - show resume option
  if (inProgressInterview) {
    const interviewTypeLabel = inProgressInterview.interviewType === 'lite' ? 'Lite' :
                                 inProgressInterview.interviewType === 'deep' ? 'Deep' :
                                 'Deep (Upgraded)';

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-6">
              <svg
                className="w-16 h-16 text-indigo-500 mx-auto mb-4"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome Back!
              </h2>
              <p className="text-gray-600">
                You have an in-progress {interviewTypeLabel} interview.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Interview Details:</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Type: <span className="font-medium">{interviewTypeLabel} Assessment</span></li>
                <li>• Started: {new Date(inProgressInterview.startedAt).toLocaleDateString()}</li>
                <li>• Status: <span className="text-blue-600 font-medium">In Progress</span></li>
              </ul>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => navigate(`/interview/${inProgressInterview.id}`)}
                className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
              >
                Resume Interview →
              </button>

              <button
                onClick={handleAbandonAndStartNew}
                disabled={isLoading}
                className="w-full bg-white text-gray-700 border-2 border-gray-300 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Abandoning...' : 'Start New Interview Instead'}
              </button>
            </div>

            <p className="text-sm text-gray-500 text-center mt-4">
              Note: Starting a new interview will abandon your current progress.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'situation') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Return to Dashboard Button */}
          <div className="mb-6">
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Return to Dashboard
            </button>
          </div>

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Find Your Perfect Career Fit
            </h1>
            <p className="text-lg text-gray-600">
              Let's understand your current situation to recommend the best path forward
            </p>
          </div>

          {/* Current Situation Question */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              What brings you here today?
            </h2>

            <div className="space-y-4">
              {situationOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSituationSelect(option.value)}
                  className="w-full text-left p-6 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-200"
                >
                  <div className="font-semibold text-lg text-gray-900 mb-2">
                    {option.label}
                  </div>
                  <div className="text-gray-600">{option.description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step: selection
  const liteFeatures = [
    'Quick 10-15 minute assessment',
    'Top 1-2 career recommendations',
    'Basic personality & skills analysis',
    ' 6-month action roadmap',
    'Medium confidence results',
    'Can upgrade to Deep later',
  ];

  const deepFeatures = [
    'Comprehensive 1-1.5 hour analysis',
    'Top 5 detailed career matches',
    'Complete personality & talent profile',
    'Personalized career roadmap',
    'High confidence results',
    '12 in-depth assessment modules',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Return to Dashboard Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Return to Dashboard
          </button>
        </div>

        {/* Header with recommendation */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Assessment Type
          </h1>
          <div className="inline-flex items-center px-4 py-2 bg-indigo-100 text-indigo-800 rounded-full">
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            Based on your situation, we recommend:{' '}
            <span className="font-semibold ml-1">
              {recommendation === 'lite' ? 'Lite Assessment' : 'Deep Analysis'}
            </span>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="max-w-2xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Comparison Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Lite Card */}
          <div
            className={`bg-white rounded-lg shadow-lg p-8 ${
              recommendation === 'lite' ? 'ring-4 ring-indigo-500' : ''
            }`}
          >
            {recommendation === 'lite' && (
              <div className="bg-indigo-500 text-white text-sm font-semibold px-3 py-1 rounded-full inline-block mb-4">
                RECOMMENDED FOR YOU
              </div>
            )}
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Lite Assessment
            </h2>
            <p className="text-gray-600 mb-6">
              Quick insights to get you started
            </p>

            <div className="mb-8">
              <ul className="space-y-3">
                {liteFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg
                      className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => handleStartInterview('lite')}
              disabled={isStarting}
              className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                recommendation === 'lite'
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isStarting ? 'Starting...' : 'Start Lite Assessment'}
            </button>
          </div>

          {/* Deep Card */}
          <div
            className={`bg-white rounded-lg shadow-lg p-8 ${
              recommendation === 'deep' ? 'ring-4 ring-indigo-500' : ''
            }`}
          >
            {recommendation === 'deep' && (
              <div className="bg-indigo-500 text-white text-sm font-semibold px-3 py-1 rounded-full inline-block mb-4">
                RECOMMENDED FOR YOU
              </div>
            )}
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Deep Analysis
            </h2>
            <p className="text-gray-600 mb-6">
              Comprehensive career guidance
            </p>

            <div className="mb-8">
              <ul className="space-y-3">
                {deepFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg
                      className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => handleStartInterview('deep')}
              disabled={isStarting}
              className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                recommendation === 'deep'
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isStarting ? 'Starting...' : 'Start Deep Analysis'}
            </button>
          </div>
        </div>

        {/* Back button */}
        <div className="text-center mt-8">
          <button
            onClick={() => setStep('situation')}
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            ← Change my situation
          </button>
        </div>
      </div>
    </div>
  );
}
