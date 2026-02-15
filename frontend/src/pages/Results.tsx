import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { MatchingResult, CareerMatch } from '../types';

export default function Results() {
  const { interviewId } = useParams<{ interviewId: string }>();
  const navigate = useNavigate();
  const [results, setResults] = useState<MatchingResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    loadResults();
  }, [interviewId]);

  const loadResults = async () => {
    if (!interviewId) {
      setError('No interview ID provided');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.getResults(interviewId);

      if (response.success && response.data) {
        setResults(response.data);
      } else {
        setError(response.error?.message || 'Failed to load results');
      }

      setIsLoading(false);
    } catch (err: any) {
      console.error('Failed to load results:', err);
      setError(err.response?.data?.error?.message || 'Failed to load results');
      setIsLoading(false);
    }
  };

  const toggleCardExpansion = (careerId: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(careerId)) {
      newExpanded.delete(careerId);
    } else {
      newExpanded.add(careerId);
    }
    setExpandedCards(newExpanded);
  };

  const handleUpgrade = async () => {
    if (!interviewId) return;

    try {
      setIsUpgrading(true);
      const response = await api.upgradeInterview(interviewId);

      if (response.success) {
        // Navigate to the interview page to continue with Deep modules
        navigate(`/interview/${interviewId}`);
      } else {
        setError(response.error?.message || 'Failed to upgrade interview');
      }
    } catch (err: any) {
      console.error('Upgrade error:', err);
      setError(err.response?.data?.error?.message || 'Failed to upgrade interview');
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!interviewId) return;

    try {
      setIsDownloading(true);
      await api.downloadResultsPDF(interviewId);
    } catch (err: any) {
      console.error('PDF download error:', err);
      setError('Failed to download PDF report');
    } finally {
      setIsDownloading(false);
    }
  };

  const getConfidenceBadge = (confidence: 'low' | 'medium' | 'high') => {
    const config = {
      low: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Medium Confidence' },
      medium: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Good Confidence' },
      high: { bg: 'bg-green-100', text: 'text-green-800', label: 'High Confidence' },
    };

    const { bg, text, label } = config[confidence];
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${bg} ${text}`}>
        {label}
      </span>
    );
  };

  const getVersionBadge = (interviewType: string) => {
    const isLite = interviewType === 'lite';
    return (
      <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
        isLite ? 'bg-purple-100 text-purple-800' : 'bg-indigo-100 text-indigo-800'
      }`}>
        {isLite ? '⚡ Quick Analysis' : '🎯 Comprehensive Analysis'}
      </div>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing your career matches...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !results) {
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Results Not Available</h2>
            <p className="text-gray-600">{error || 'Could not load results'}</p>
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

  const isLiteVersion = results.interviewType === 'lite';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mb-4">
            {getVersionBadge(results.interviewType)}
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Your Career Matches
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Based on your assessment, here are your top career recommendations
          </p>
          <p className="text-sm text-gray-500">
            Analysis Date: {new Date(results.analysisDate).toLocaleDateString()} •
            Data Completeness: {results.dataCompleteness}%
          </p>
        </div>

        {/* Upgrade CTA for Lite users */}
        {isLiteVersion && (
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg shadow-lg p-6 mb-8 text-white">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-xl font-bold mb-2">Want More Detailed Insights?</h3>
                <p className="mb-4">
                  Upgrade to Deep Analysis to unlock 3 additional career matches, detailed personality
                  profiles, and comprehensive career roadmaps.
                </p>
                <button
                  onClick={handleUpgrade}
                  disabled={isUpgrading}
                  className="bg-white text-indigo-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpgrading ? 'Upgrading...' : 'Upgrade to Deep Analysis →'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Career Matches */}
        <div className="space-y-6">
          {results.matches.map((match: CareerMatch, index: number) => (
            <CareerMatchCard
              key={match.careerId}
              match={match}
              index={index}
              isExpanded={expandedCards.has(match.careerId)}
              onToggleExpand={() => toggleCardExpansion(match.careerId)}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            {isDownloading ? 'Generating PDF...' : 'Download PDF Report'}
          </button>
          <button
            onClick={() => navigate('/interview-selection')}
            className="bg-white text-indigo-600 border-2 border-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
          >
            Start New Assessment
          </button>
        </div>
      </div>
    </div>
  );
}

interface CareerMatchCardProps {
  match: CareerMatch;
  index: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

function CareerMatchCard({ match, index, isExpanded, onToggleExpand }: CareerMatchCardProps) {
  const getFitScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    return 'text-yellow-600';
  };

  const getFitScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 60) return 'bg-blue-50 border-blue-200';
    return 'bg-yellow-50 border-yellow-200';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Card Header */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-sm">
                #{index + 1}
              </span>
              <h2 className="text-2xl font-bold text-gray-900">{match.careerTitle}</h2>
            </div>
            <p className="text-gray-600 mb-3">{match.careerCategory}</p>
            <div className="flex items-center gap-3">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border-2 ${getFitScoreBg(match.fitScore)}`}>
                <span className={`text-2xl font-bold mr-1 ${getFitScoreColor(match.fitScore)}`}>
                  {match.fitScore}%
                </span>
                <span className="text-gray-600">Match</span>
              </div>
              {getConfidenceBadge(match.confidence)}
            </div>
          </div>
        </div>

        {/* Explanation */}
        <div className="mb-6">
          <p className="text-gray-700 leading-relaxed">{match.explanation}</p>
        </div>

        {/* Strengths & Growth Areas Preview */}
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          {/* Strengths */}
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <h3 className="font-semibold text-green-900 mb-2 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Key Strengths
            </h3>
            <ul className="space-y-1">
              {match.strengths.slice(0, isExpanded ? undefined : 2).map((strength, i) => (
                <li key={i} className="text-sm text-green-800">• {strength}</li>
              ))}
            </ul>
            {!isExpanded && match.strengths.length > 2 && (
              <p className="text-sm text-green-600 mt-1">+{match.strengths.length - 2} more</p>
            )}
          </div>

          {/* Growth Areas */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
              Growth Areas
            </h3>
            <ul className="space-y-1">
              {match.growthAreas.slice(0, isExpanded ? undefined : 2).map((area, i) => (
                <li key={i} className="text-sm text-blue-800">• {area}</li>
              ))}
            </ul>
            {!isExpanded && match.growthAreas.length > 2 && (
              <p className="text-sm text-blue-600 mt-1">+{match.growthAreas.length - 2} more</p>
            )}
          </div>
        </div>

        {/* Roadmap (Expandable) */}
        {isExpanded && (
          <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200 mb-4">
            <h3 className="font-semibold text-indigo-900 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              6-Month Career Roadmap
            </h3>
            <div className="text-sm text-indigo-900 whitespace-pre-line leading-relaxed">
              {match.roadmap}
            </div>
          </div>
        )}

        {/* Toggle Button */}
        <button
          onClick={onToggleExpand}
          className="w-full flex items-center justify-center py-2 text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
        >
          {isExpanded ? (
            <>
              <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Show Less
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              View Full Details & Roadmap
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function getConfidenceBadge(confidence: 'low' | 'medium' | 'high') {
  const config = {
    low: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Medium Confidence' },
    medium: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Good Confidence' },
    high: { bg: 'bg-green-100', text: 'text-green-800', label: 'High Confidence' },
  };

  const { bg, text, label } = config[confidence];
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${bg} ${text}`}>
      {label}
    </span>
  );
}
