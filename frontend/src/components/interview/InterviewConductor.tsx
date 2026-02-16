import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import type { Question, QuestionSet } from '../../types';
import QuestionRenderer from './QuestionRenderer';
import ProgressBar from './ProgressBar';

interface InterviewConductorProps {
  interviewId: string;
  interviewType: 'lite' | 'deep';
  moduleId?: string; // For deep interviews - specific module to work on
  onBackToDashboard?: () => void; // For deep interviews - return to module dashboard
}

export default function InterviewConductor({
  interviewId,
  interviewType,
  moduleId,
  onBackToDashboard,
}: InterviewConductorProps) {
  const navigate = useNavigate();

  // State
  const [questionSets, setQuestionSets] = useState<QuestionSet[]>([]);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string>('');
  const [isCompleting, setIsCompleting] = useState(false);

  // Load questions on mount
  useEffect(() => {
    loadQuestions();
  }, [interviewType, moduleId]);

  const loadQuestions = async () => {
    try {
      setIsLoading(true);

      if (interviewType === 'lite') {
        const response = await api.getLiteQuestions();
        if (response.success && response.data) {
          setQuestionSets(response.data.categories);
          // Flatten all questions
          const flattened = response.data.categories.flatMap((set) => set.questions);
          setAllQuestions(flattened);
        }
      } else if (interviewType === 'deep' && moduleId) {
        // Load specific module for Deep interview
        const response = await api.getDeepModule(moduleId);
        if (response.success && response.data) {
          const module = response.data;
          setQuestionSets([module]);
          setAllQuestions(module.questions);
        }
      }

      setIsLoading(false);
    } catch (error: any) {
      console.error('Failed to load questions:', error);
      setIsLoading(false);
      setSaveError('Failed to load questions. Please try again.');
    }
  };

  // Current question
  const currentQuestion = allQuestions[currentQuestionIndex];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;

  // Progress
  const totalQuestions = allQuestions.length;
  const answeredQuestions = Object.keys(answers).length;

  // Find current category
  const getCurrentCategory = () => {
    let count = 0;
    for (const set of questionSets) {
      if (currentQuestionIndex < count + set.questions.length) {
        return set.title;
      }
      count += set.questions.length;
    }
    return '';
  };

  // Validation
  const validateAnswer = (question: Question, value: any): string | null => {
    if (question.required && (value === undefined || value === null || value === '')) {
      return 'This question is required';
    }

    if (question.type === 'multiselect' && question.required) {
      if (!Array.isArray(value) || value.length === 0) {
        return 'Please select at least one option';
      }
    }

    if (question.type === 'ranking' && question.required) {
      if (!Array.isArray(value) || value.length === 0) {
        return 'Please rank at least one item';
      }
    }

    if (question.validation) {
      const val = question.validation;
      if (typeof value === 'string') {
        if (val.minLength && value.length < val.minLength) {
          return `Answer must be at least ${val.minLength} characters`;
        }
        if (val.maxLength && value.length > val.maxLength) {
          return `Answer must be no more than ${val.maxLength} characters`;
        }
      }
      if (typeof value === 'number') {
        if (val.min !== undefined && value < val.min) {
          return `Value must be at least ${val.min}`;
        }
        if (val.max !== undefined && value > val.max) {
          return `Value must be no more than ${val.max}`;
        }
      }
    }

    return null;
  };

  // Save answer to backend
  const saveAnswer = async (questionId: string, value: any) => {
    try {
      setIsSaving(true);
      setSaveError('');

      // Find category for this question
      let category = '';
      for (const set of questionSets) {
        if (set.questions.some((q) => q.id === questionId)) {
          category = set.category || '';
          break;
        }
      }

      await api.saveAnswer(interviewId, {
        questionId,
        answer: value,
        category,
        moduleId: moduleId, // Include moduleId for Deep interviews
      });

      setIsSaving(false);
    } catch (error: any) {
      console.error('Failed to save answer:', error);
      setIsSaving(false);
      setSaveError(
        error.response?.data?.error?.message || 'Failed to save answer. Please try again.'
      );
      // Re-throw to prevent navigation
      throw error;
    }
  };

  // Handle answer change
  const handleAnswerChange = (value: any) => {
    if (!currentQuestion) return;

    // Update local state
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: value,
    }));

    // Clear error for this question
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[currentQuestion.id];
      return newErrors;
    });
  };

  // Navigate to next question
  const handleNext = async () => {
    if (!currentQuestion) return;

    // Validate current answer
    const error = validateAnswer(currentQuestion, currentAnswer);
    if (error) {
      setErrors((prev) => ({
        ...prev,
        [currentQuestion.id]: error,
      }));
      return;
    }

    // Save answer to backend
    try {
      await saveAnswer(currentQuestion.id, currentAnswer);

      // Move to next question or complete
      if (currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // Last question - complete interview
        await handleComplete();
      }
    } catch (error) {
      // Error already handled in saveAnswer
      return;
    }
  };

  // Navigate to previous question
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Complete interview or module
  const handleComplete = async () => {
    try {
      setIsCompleting(true);

      // For Deep interviews with module dashboard, mark module as complete and return
      if (moduleId && onBackToDashboard) {
        await api.completeModule(interviewId, moduleId);
        onBackToDashboard();
      } else {
        // For Lite interviews or final Deep completion, complete entire interview
        await api.completeInterview(interviewId);
        navigate(`/results/${interviewId}`);
      }
    } catch (error: any) {
      console.error('Failed to complete:', error);
      setSaveError(
        error.response?.data?.error?.message || 'Failed to complete. Please try again.'
      );
      setIsCompleting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading questions...</p>
        </div>
      </div>
    );
  }

  // No questions loaded
  if (allQuestions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Questions Found</h2>
          <p className="text-gray-600 mb-6">
            We couldn't load the interview questions. Please try again.
          </p>
          <button
            onClick={() => navigate('/interview-selection')}
            className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700"
          >
            Back to Selection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Navigation buttons */}
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Return to Dashboard
          </button>

          {/* Back to Module Dashboard button for Deep interviews */}
          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
            >
              <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Module Dashboard
            </button>
          )}
        </div>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {moduleId ? `Module ${moduleId}` : interviewType === 'lite' ? 'Lite Assessment' : 'Deep Analysis'}
              </h1>
              {moduleId && questionSets[0] && (
                <p className="text-sm text-gray-600 mt-1">{questionSets[0].title}</p>
              )}
            </div>
            <div className="text-sm text-gray-500">
              {currentQuestionIndex + 1}/{totalQuestions}
            </div>
          </div>
          <ProgressBar
            current={currentQuestionIndex + 1}
            total={totalQuestions}
            categoryName={moduleId ? questionSets[0]?.title || '' : getCurrentCategory()}
          />
        </div>

        {/* Save error */}
        {saveError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex-1">
                <p className="text-sm text-red-700">{saveError}</p>
              </div>
              <button
                onClick={() => setSaveError('')}
                className="text-red-400 hover:text-red-600 ml-4"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Question card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          {currentQuestion && (
            <QuestionRenderer
              question={currentQuestion}
              value={currentAnswer}
              onChange={handleAnswerChange}
              error={errors[currentQuestion.id]}
            />
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ← Previous
          </button>

          <div className="flex items-center text-sm text-gray-600">
            {isSaving && (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
                Saving...
              </>
            )}
          </div>

          <button
            onClick={handleNext}
            disabled={isSaving || isCompleting}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isCompleting ? (
              <>
                <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Completing...
              </>
            ) : currentQuestionIndex === totalQuestions - 1 ? (
              moduleId && onBackToDashboard ? 'Complete Module →' : 'Complete →'
            ) : (
              'Next →'
            )}
          </button>
        </div>

        {/* Help text */}
        <div className="text-center mt-6 text-sm text-gray-500">
          Your answers are automatically saved as you progress
        </div>
      </div>
    </div>
  );
}
