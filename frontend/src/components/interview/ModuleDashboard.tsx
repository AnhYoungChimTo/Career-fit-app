import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Interview } from '../../types';
import { api } from '../../services/api';

interface Module {
  moduleId: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  isRecommended: boolean;
  questionsCount: number;
  answeredCount: number;
  status: 'not_started' | 'in_progress' | 'completed';
}

interface ModuleDashboardProps {
  interviewId: string;
  interview: Interview;
  onModuleSelect: (moduleId: string) => void;
}

export default function ModuleDashboard({ interviewId, interview: _interview, onModuleSelect }: ModuleDashboardProps) {
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadModules();
  }, [interviewId]);

  const loadModules = async () => {
    try {
      setIsLoading(true);
      const response = await api.getDeepModules(interviewId);
      if (response.success && response.data) {
        setModules(response.data);
      }
    } catch (error) {
      console.error('Failed to load modules:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteInterview = async () => {
    const completedCount = modules.filter((m) => m.status === 'completed').length;

    if (completedCount < 6) {
      if (!confirm(`You've only completed ${completedCount} out of 12 modules. We recommend completing at least 6 modules for accurate results. Continue anyway?`)) {
        return;
      }
    }

    try {
      await api.completeInterview(interviewId);
      navigate(`/results/${interviewId}`);
    } catch (error) {
      console.error('Failed to complete interview:', error);
    }
  };

  const completedCount = modules.filter((m) => m.status === 'completed').length;
  const inProgressCount = modules.filter((m) => m.status === 'in_progress').length;
  const recommendedCount = modules.filter((m) => m.isRecommended).length;
  const totalProgress = modules.length > 0
    ? Math.round((completedCount / modules.length) * 100)
    : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading modules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Return to Dashboard Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Return to Dashboard
          </button>
        </div>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Deep Career Analysis
              </h1>
              <p className="text-gray-600">
                Complete modules to build your comprehensive career profile
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-indigo-600">{totalProgress}%</div>
              <div className="text-sm text-gray-500">Complete</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div
              className="bg-indigo-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${totalProgress}%` }}
            ></div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-green-600">{completedCount}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-yellow-600">{inProgressCount}</div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-2xl font-bold text-blue-600">{recommendedCount}</div>
              <div className="text-sm text-gray-600">Recommended</div>
            </div>
          </div>
        </div>

        {/* Recommended Path Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Recommended Path</h3>
              <p className="text-blue-800 text-sm">
                We recommend completing the {recommendedCount} modules marked "Recommended" for the most accurate results.
                However, you're free to work on modules in any order and skip modules that don't apply to you.
              </p>
            </div>
          </div>
        </div>

        {/* Module Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {modules.map((module) => (
            <button
              key={module.moduleId}
              onClick={() => onModuleSelect(module.moduleId)}
              className={`text-left bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-200 border-2 ${
                module.status === 'completed'
                  ? 'border-green-500 bg-green-50'
                  : module.status === 'in_progress'
                  ? 'border-indigo-500'
                  : 'border-gray-200 hover:border-indigo-300'
              }`}
            >
              {/* Module Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg ${
                    module.status === 'completed'
                      ? 'bg-green-500 text-white'
                      : module.status === 'in_progress'
                      ? 'bg-indigo-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {module.moduleId}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{module.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-gray-500">
                        ~{module.estimatedMinutes} min
                      </span>
                      {module.isRecommended && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                          Recommended
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                {module.status === 'completed' && (
                  <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-600 text-sm mb-4">{module.description}</p>

              {/* Progress */}
              {module.status !== 'not_started' && (
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{module.answeredCount} / {module.questionsCount} questions</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        module.status === 'completed' ? 'bg-green-500' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${(module.answeredCount / module.questionsCount) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Action Text */}
              <div className="mt-4 text-sm font-medium">
                {module.status === 'completed' && (
                  <span className="text-green-600">✓ Review or edit answers</span>
                )}
                {module.status === 'in_progress' && (
                  <span className="text-indigo-600">→ Continue module</span>
                )}
                {module.status === 'not_started' && (
                  <span className="text-gray-500">Start module →</span>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center bg-white rounded-xl p-6 shadow-md">
          <button
            onClick={() => navigate('/interview-selection')}
            className="text-gray-600 hover:text-gray-900 font-medium"
          >
            ← Back to Interview Selection
          </button>

          <button
            onClick={handleCompleteInterview}
            disabled={completedCount === 0}
            className={`px-8 py-3 rounded-lg font-semibold transition-all ${
              completedCount === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-xl'
            }`}
          >
            {completedCount >= 6 ? 'Complete Interview & See Results' : `Complete Anyway (${completedCount}/12 modules)`}
          </button>
        </div>
      </div>
    </div>
  );
}
