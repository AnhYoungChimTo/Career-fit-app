import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { Career, CareerFilters, CareerStats } from '../types';

// Job type quick-filter tabs (inspired by jobs.neu.edu.vn)
const JOB_TYPE_TABS = [
  { label: 'All', value: '' },
  { label: 'Internship', value: 'intern' },
  { label: 'Fresh Graduate', value: 'entry' },
  { label: 'Mid-Level', value: 'mid' },
  { label: 'Senior', value: 'senior' },
  { label: 'Executive', value: 'executive' },
];

const CATEGORY_ICONS: Record<string, string> = {
  marketing: '📣',
  sales: '💼',
  finance: '💰',
  law: '⚖️',
  'international-relations': '🌍',
  hr: '👥',
  it: '💻',
  design: '🎨',
  general: '🏢',
};

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

  const getStressLevelColor = (level?: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-700 border border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
      case 'high': return 'bg-orange-100 text-orange-700 border border-orange-200';
      case 'very_high': return 'bg-red-100 text-red-700 border border-red-200';
      default: return 'bg-gray-100 text-gray-600 border border-gray-200';
    }
  };

  const getGrowthPotentialColor = (level?: string) => {
    switch (level) {
      case 'very_high': return 'bg-purple-100 text-purple-700 border border-purple-200';
      case 'high': return 'bg-blue-100 text-blue-700 border border-blue-200';
      case 'medium': return 'bg-indigo-100 text-indigo-700 border border-indigo-200';
      case 'low': return 'bg-gray-100 text-gray-600 border border-gray-200';
      default: return 'bg-gray-100 text-gray-600 border border-gray-200';
    }
  };

  // Job type badge — mirrors the reference site's colored type pills
  const getJobTypeBadge = (level?: string) => {
    switch (level) {
      case 'intern':
        return { label: 'Internship', classes: 'bg-sky-100 text-sky-700 border border-sky-200' };
      case 'entry':
        return { label: 'Fresh Graduate', classes: 'bg-emerald-100 text-emerald-700 border border-emerald-200' };
      case 'mid':
        return { label: 'Mid-Level', classes: 'bg-amber-100 text-amber-700 border border-amber-200' };
      case 'senior':
        return { label: 'Senior', classes: 'bg-violet-100 text-violet-700 border border-violet-200' };
      case 'executive':
        return { label: 'Executive', classes: 'bg-rose-100 text-rose-700 border border-rose-200' };
      default:
        return { label: level ?? 'N/A', classes: 'bg-gray-100 text-gray-600 border border-gray-200' };
    }
  };

  const getCategoryIcon = (category?: string) => {
    return CATEGORY_ICONS[category ?? ''] ?? '🏢';
  };

  const totalPages = Math.ceil(totalCareers / careersPerPage);
  const hasActiveFilters =
    searchQuery || categoryFilter || experienceLevelFilter ||
    stressLevelFilter || growthPotentialFilter || minSalary || maxSalary;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top navbar */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Dashboard
          </button>

          <div className="text-center">
            <h1 className="text-lg font-bold text-gray-900 leading-none">Job Library</h1>
            <p className="text-xs text-gray-500 mt-0.5">{totalCareers} career paths available</p>
          </div>

          <div className="w-24" /> {/* spacer */}
        </div>
      </div>

      {/* Hero search bar (inspired by NEU jobs portal top section) */}
      <div className="bg-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-indigo-200 text-sm mb-3 font-medium">Find your career path</p>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                placeholder="Search by career name, keyword..."
                className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm border-0 focus:outline-none focus:ring-2 focus:ring-white/50 shadow"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2.5 rounded-lg text-sm border-0 focus:outline-none focus:ring-2 focus:ring-white/50 shadow bg-white text-gray-700 min-w-[140px]"
            >
              <option value="">All Categories</option>
              {stats && Object.keys(stats.byCategory).map(cat => (
                <option key={cat} value={cat}>
                  {getCategoryIcon(cat)} {cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')} ({stats.byCategory[cat]})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Job type quick-filter tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto py-2">
            {JOB_TYPE_TABS.map(tab => (
              <button
                key={tab.value}
                onClick={() => { setExperienceLevelFilter(tab.value); setCurrentPage(1); }}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex-shrink-0 ${
                  experienceLevelFilter === tab.value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-4">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-sm font-semibold text-gray-900">Filters</h2>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* Salary Range */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Salary (VND/month)
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={minSalary}
                    onChange={(e) => {
                      const v = e.target.value.replace(/,/g, '');
                      if (/^\d*$/.test(v)) { setMinSalary(v ? parseInt(v).toLocaleString() : ''); setCurrentPage(1); }
                    }}
                    placeholder="Min"
                    className="w-full px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="text"
                    value={maxSalary}
                    onChange={(e) => {
                      const v = e.target.value.replace(/,/g, '');
                      if (/^\d*$/.test(v)) { setMaxSalary(v ? parseInt(v).toLocaleString() : ''); setCurrentPage(1); }
                    }}
                    placeholder="Max"
                    className="w-full px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Stress Level */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Stress Level
                </label>
                {['', 'low', 'medium', 'high', 'very_high'].map(v => (
                  <label key={v} className="flex items-center gap-2 py-1 cursor-pointer">
                    <input
                      type="radio"
                      name="stress"
                      checked={stressLevelFilter === v}
                      onChange={() => { setStressLevelFilter(v); setCurrentPage(1); }}
                      className="accent-indigo-600"
                    />
                    <span className="text-sm text-gray-700">
                      {v === '' ? 'Any' : v.replace('_', ' ').replace(/^\w/, c => c.toUpperCase())}
                    </span>
                  </label>
                ))}
              </div>

              {/* Growth Potential */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Growth Potential
                </label>
                {['', 'very_high', 'high', 'medium', 'low'].map(v => (
                  <label key={v} className="flex items-center gap-2 py-1 cursor-pointer">
                    <input
                      type="radio"
                      name="growth"
                      checked={growthPotentialFilter === v}
                      onChange={() => { setGrowthPotentialFilter(v); setCurrentPage(1); }}
                      className="accent-indigo-600"
                    />
                    <span className="text-sm text-gray-700">
                      {v === '' ? 'Any' : v.replace('_', ' ').replace(/^\w/, c => c.toUpperCase())}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Results count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">
                {isLoading ? 'Loading...' : (
                  <>
                    <span className="font-semibold text-gray-900">{totalCareers}</span> careers found
                    {hasActiveFilters && <span className="text-indigo-600"> (filtered)</span>}
                  </>
                )}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-200 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-1.5" />
                        <div className="h-3 bg-gray-100 rounded w-1/2" />
                      </div>
                    </div>
                    <div className="h-3 bg-gray-100 rounded w-full mb-1.5" />
                    <div className="h-3 bg-gray-100 rounded w-5/6 mb-4" />
                    <div className="h-8 bg-gray-200 rounded-lg" />
                  </div>
                ))}
              </div>
            ) : careers.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <div className="text-4xl mb-3">🔍</div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">No careers found</h3>
                <p className="text-sm text-gray-500 mb-4">Try adjusting your filters or search query</p>
                <button onClick={clearFilters} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                  Clear all filters
                </button>
              </div>
            ) : (
              <>
                {/* Career Cards Grid — card design inspired by jobs.neu.edu.vn */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
                  {careers.map((career) => {
                    const badge = getJobTypeBadge(career.experienceLevel);
                    return (
                      <div
                        key={career.id}
                        className="bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer flex flex-col"
                        onClick={() => setSelectedCareer(career)}
                      >
                        {/* Card header */}
                        <div className="p-4 flex-1">
                          <div className="flex items-start gap-3 mb-3">
                            {/* Category icon badge */}
                            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-lg flex-shrink-0 border border-indigo-100">
                              {getCategoryIcon(career.category)}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-1">
                                <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">
                                  {career.name}
                                </h3>
                                {/* Job type badge — matches reference site pill style */}
                                <span className={`flex-shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full ml-1 ${badge.classes}`}>
                                  {badge.label}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 mt-0.5 truncate">{career.vietnameseName}</p>
                            </div>
                          </div>

                          {/* Description */}
                          <p className="text-xs text-gray-600 line-clamp-2 mb-3 leading-relaxed">
                            {career.description}
                          </p>

                          {/* Salary */}
                          {career.avgSalaryVND && (
                            <div className="flex items-center gap-1.5 mb-2">
                              <svg className="w-3.5 h-3.5 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                              </svg>
                              <span className="text-xs font-semibold text-green-700">
                                {career.avgSalaryVND} VND
                              </span>
                            </div>
                          )}

                          {/* Hours */}
                          {career.workHoursPerWeek && (
                            <div className="flex items-center gap-1.5 mb-3">
                              <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                              </svg>
                              <span className="text-xs text-gray-500">{career.workHoursPerWeek} hrs/week</span>
                            </div>
                          )}

                          {/* Stress + Growth tags */}
                          <div className="flex flex-wrap gap-1.5">
                            {career.stressLevel && (
                              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${getStressLevelColor(career.stressLevel)}`}>
                                Stress: {career.stressLevel.replace('_', ' ')}
                              </span>
                            )}
                            {career.growthPotential && (
                              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${getGrowthPotentialColor(career.growthPotential)}`}>
                                Growth: {career.growthPotential.replace('_', ' ')}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Card footer — "Apply" style CTA button, mirrors reference site */}
                        <div className="px-4 pb-4">
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedCareer(career); }}
                            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-1.5">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      ‹ Prev
                    </button>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5) pageNum = i + 1;
                      else if (currentPage <= 3) pageNum = i + 1;
                      else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                      else pageNum = currentPage - 2 + i;

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-9 h-9 border rounded-lg text-sm font-medium ${
                            currentPage === pageNum
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Next ›
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
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedCareer(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-start justify-between rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-2xl border border-indigo-100 flex-shrink-0">
                  {getCategoryIcon(selectedCareer.category)}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 leading-tight">{selectedCareer.name}</h2>
                  <p className="text-sm text-gray-500">{selectedCareer.vietnameseName}</p>
                </div>
              </div>
              <button onClick={() => setSelectedCareer(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-5">
              {/* Job type + category tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedCareer.experienceLevel && (
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getJobTypeBadge(selectedCareer.experienceLevel).classes}`}>
                    {getJobTypeBadge(selectedCareer.experienceLevel).label}
                  </span>
                )}
                {selectedCareer.category && (
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 capitalize">
                    {selectedCareer.category.replace('-', ' ')}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-gray-700 leading-relaxed mb-5">{selectedCareer.description}</p>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-green-50 rounded-xl p-3 border border-green-100">
                  <p className="text-xs text-green-600 font-medium mb-1">Salary Range</p>
                  <p className="text-base font-bold text-green-800">
                    {selectedCareer.avgSalaryVND ?? 'Negotiable'}
                  </p>
                  <p className="text-xs text-green-600">VND / month</p>
                </div>
                <div className="bg-indigo-50 rounded-xl p-3 border border-indigo-100">
                  <p className="text-xs text-indigo-600 font-medium mb-1">Work Hours</p>
                  <p className="text-base font-bold text-indigo-800">
                    {selectedCareer.workHoursPerWeek ?? '—'}
                  </p>
                  <p className="text-xs text-indigo-600">hours / week</p>
                </div>
                <div className="rounded-xl p-3 border border-gray-100 bg-gray-50">
                  <p className="text-xs text-gray-500 font-medium mb-1">Stress Level</p>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getStressLevelColor(selectedCareer.stressLevel)}`}>
                    {selectedCareer.stressLevel?.replace('_', ' ') ?? 'N/A'}
                  </span>
                </div>
                <div className="rounded-xl p-3 border border-gray-100 bg-gray-50">
                  <p className="text-xs text-gray-500 font-medium mb-1">Growth Potential</p>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getGrowthPotentialColor(selectedCareer.growthPotential)}`}>
                    {selectedCareer.growthPotential?.replace('_', ' ') ?? 'N/A'}
                  </span>
                </div>
              </div>

              {/* Cached analysis */}
              {selectedCareer.cachedAnalysis && (
                <div className="border-t border-gray-100 pt-4 mb-5">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                    </svg>
                    Career Analysis
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    {typeof selectedCareer.cachedAnalysis === 'string' ? (
                      <pre className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed font-mono overflow-x-auto">
                        {selectedCareer.cachedAnalysis}
                      </pre>
                    ) : (
                      <div className="space-y-3 text-sm text-gray-700">
                        {selectedCareer.cachedAnalysis.detailedAnalysis && (
                          <div>
                            <h4 className="text-xs font-semibold text-gray-900 mb-1">Detailed Analysis</h4>
                            <p className="text-xs whitespace-pre-line leading-relaxed">{selectedCareer.cachedAnalysis.detailedAnalysis}</p>
                          </div>
                        )}
                        {selectedCareer.cachedAnalysis.careerPattern && (
                          <div>
                            <h4 className="text-xs font-semibold text-gray-900 mb-1">Career Progression</h4>
                            <p className="text-xs whitespace-pre-line leading-relaxed">{selectedCareer.cachedAnalysis.careerPattern.progression}</p>
                          </div>
                        )}
                        {selectedCareer.cachedAnalysis.skillStack?.length > 0 && (
                          <div>
                            <h4 className="text-xs font-semibold text-gray-900 mb-2">Key Skills</h4>
                            <div className="flex flex-wrap gap-1.5">
                              {selectedCareer.cachedAnalysis.skillStack.map((skill: string, i: number) => (
                                <span key={i} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium border border-indigo-100">{skill}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* CTAs */}
              <div className="flex gap-3">
                <button
                  onClick={() => { setSelectedCareer(null); navigate('/interview-selection'); }}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                >
                  Take Career Assessment
                </button>
                <button
                  onClick={() => setSelectedCareer(null)}
                  className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
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
