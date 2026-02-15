import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { Career, CareerFilters, CareerStats } from '../types';

export default function JobLibrary() {
  const navigate = useNavigate();
  const [careers, setCareers] = useState<Career[]>([]);
  const [stats, setStats] = useState<CareerStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [experienceLevelFilter, setExperienceLevelFilter] = useState('');
  const [stressLevelFilter, setStressLevelFilter] = useState('');
  const [growthPotentialFilter, setGrowthPotentialFilter] = useState('');
  const [minSalary, setMinSalary] = useState('');
  const [maxSalary, setMaxSalary] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCareers, setTotalCareers] = useState(0);
  const careersPerPage = 12;

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    loadCareers();
  }, [
    searchQuery,
    categoryFilter,
    experienceLevelFilter,
    stressLevelFilter,
    growthPotentialFilter,
    minSalary,
    maxSalary,
    currentPage,
  ]);

  const loadStats = async () => {
    try {
      const response = await api.getCareerStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const loadCareers = async () => {
    try {
      setIsLoading(true);
      setError('');

      const filters: CareerFilters = {
        limit: careersPerPage,
        offset: (currentPage - 1) * careersPerPage,
      };

      if (searchQuery) filters.search = searchQuery;
      if (categoryFilter) filters.category = categoryFilter;
      if (experienceLevelFilter) filters.experienceLevel = experienceLevelFilter;
      if (stressLevelFilter) filters.stressLevel = stressLevelFilter;
      if (growthPotentialFilter) filters.growthPotential = growthPotentialFilter;
      if (minSalary) filters.minSalary = parseInt(minSalary.replace(/,/g, ''));
      if (maxSalary) filters.maxSalary = parseInt(maxSalary.replace(/,/g, ''));

      const response = await api.getAllCareers(filters);

      if (response.success && response.data) {
        setCareers(response.data.careers);
        setTotalCareers(response.data.pagination.total);
      } else {
        setError(response.error?.message || 'Failed to load careers');
      }
    } catch (err: any) {
      console.error('Failed to load careers:', err);
      setError('Failed to load careers');
    } finally {
      setIsLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('');
    setExperienceLevelFilter('');
    setStressLevelFilter('');
    setGrowthPotentialFilter('');
    setMinSalary('');
    setMaxSalary('');
    setCurrentPage(1);
  };

  const formatSalary = (salary: number): string => {
    if (salary >= 1000000) {
      return `${(salary / 1000000).toFixed(1)}M`;
    }
    return salary.toLocaleString();
  };

  const getStressLevelColor = (level?: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'very_high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGrowthPotentialColor = (level?: string) => {
    switch (level) {
      case 'very_high': return 'bg-purple-100 text-purple-800';
      case 'high': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-indigo-100 text-indigo-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalPages = Math.ceil(totalCareers / careersPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-indigo-600">Job Library</h1>
                <p className="text-sm text-gray-600">{totalCareers} careers available</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Clear All
                </button>
              </div>

              {/* Search */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search careers..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Category */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Categories</option>
                  {stats && Object.keys(stats.byCategory).map(category => (
                    <option key={category} value={category}>
                      {category} ({stats.byCategory[category]})
                    </option>
                  ))}
                </select>
              </div>

              {/* Experience Level */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience Level
                </label>
                <select
                  value={experienceLevelFilter}
                  onChange={(e) => {
                    setExperienceLevelFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Levels</option>
                  <option value="intern">Intern (0-1 years)</option>
                  <option value="entry">Entry (1-3 years)</option>
                  <option value="mid">Mid-Level (3-7 years)</option>
                  <option value="senior">Senior (7-12 years)</option>
                  <option value="executive">Executive (12+ years)</option>
                </select>
              </div>

              {/* Salary Range */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Salary Range (VND/month)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={minSalary}
                    onChange={(e) => {
                      const value = e.target.value.replace(/,/g, '');
                      if (/^\d*$/.test(value)) {
                        setMinSalary(value ? parseInt(value).toLocaleString() : '');
                        setCurrentPage(1);
                      }
                    }}
                    placeholder="Min"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                  <input
                    type="text"
                    value={maxSalary}
                    onChange={(e) => {
                      const value = e.target.value.replace(/,/g, '');
                      if (/^\d*$/.test(value)) {
                        setMaxSalary(value ? parseInt(value).toLocaleString() : '');
                        setCurrentPage(1);
                      }
                    }}
                    placeholder="Max"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
              </div>

              {/* Stress Level */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stress Level
                </label>
                <select
                  value={stressLevelFilter}
                  onChange={(e) => {
                    setStressLevelFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Levels</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="very_high">Very High</option>
                </select>
              </div>

              {/* Growth Potential */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Growth Potential
                </label>
                <select
                  value={growthPotentialFilter}
                  onChange={(e) => {
                    setGrowthPotentialFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Levels</option>
                  <option value="very_high">Very High</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Career Grid */}
          <div className="lg:col-span-3">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading careers...</p>
                </div>
              </div>
            ) : careers.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No careers found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your filters or search query</p>
                <button
                  onClick={clearFilters}
                  className="text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {careers.map((career) => (
                    <div
                      key={career.id}
                      className="bg-white rounded-lg shadow hover:shadow-xl transition-shadow cursor-pointer overflow-hidden"
                      onClick={() => setSelectedCareer(career)}
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {career.name}
                            </h3>
                            <p className="text-sm text-gray-600">{career.vietnameseName}</p>
                          </div>
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            {career.experienceLevel}
                          </span>
                        </div>

                        <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                          {career.description}
                        </p>

                        <div className="space-y-2 mb-4">
                          {career.avgSalaryVND && (
                            <div className="flex items-center text-sm">
                              <svg className="w-4 h-4 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                              </svg>
                              <span className="font-medium text-green-700">
                                {formatSalary(career.salaryRange.min)} - {formatSalary(career.salaryRange.max)} VND
                              </span>
                            </div>
                          )}

                          {career.workHoursPerWeek && (
                            <div className="flex items-center text-sm text-gray-600">
                              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                              </svg>
                              {career.workHoursPerWeek} hours/week
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {career.stressLevel && (
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getStressLevelColor(career.stressLevel)}`}>
                              Stress: {career.stressLevel.replace('_', ' ')}
                            </span>
                          )}
                          {career.growthPotential && (
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getGrowthPotentialColor(career.growthPotential)}`}>
                              Growth: {career.growthPotential.replace('_', ' ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-2 border rounded-lg text-sm font-medium ${
                              currentPage === pageNum
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Career Detail Modal */}
      {selectedCareer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">{selectedCareer.name}</h2>
              <button
                onClick={() => setSelectedCareer(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-6">
              <p className="text-lg text-gray-600 mb-4">{selectedCareer.vietnameseName}</p>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700">{selectedCareer.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Salary Range</h3>
                  <p className="text-2xl font-bold text-green-700">
                    {formatSalary(selectedCareer.salaryRange.min)} - {formatSalary(selectedCareer.salaryRange.max)}
                  </p>
                  <p className="text-sm text-gray-600">VND per month</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Work Hours</h3>
                  <p className="text-2xl font-bold text-indigo-700">
                    {selectedCareer.workHoursPerWeek || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600">hours per week</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Stress Level</h3>
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium ${getStressLevelColor(selectedCareer.stressLevel)}`}>
                    {selectedCareer.stressLevel?.replace('_', ' ') || 'N/A'}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Growth Potential</h3>
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium ${getGrowthPotentialColor(selectedCareer.growthPotential)}`}>
                    {selectedCareer.growthPotential?.replace('_', ' ') || 'N/A'}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setSelectedCareer(null);
                    navigate('/interview-selection');
                  }}
                  className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                >
                  Take Career Assessment
                </button>
                <button
                  onClick={() => setSelectedCareer(null)}
                  className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
