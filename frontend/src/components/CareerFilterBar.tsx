import { useState } from 'react';

export interface FilterOptions {
  categories: string[];
  stressLevels: string[];
  growthPotentials: string[];
  searchQuery: string;
}

interface CareerFilterBarProps {
  onFilterChange: (filters: FilterOptions) => void;
  totalCareers: number;
  filteredCount: number;
}

const CATEGORIES = [
  { value: 'all', label: 'All Industries', icon: '🌐' },
  { value: 'marketing', label: 'Marketing & Digital', icon: '📊' },
  { value: 'finance', label: 'Finance & Banking', icon: '💰' },
  { value: 'international-relations', label: 'International Relations', icon: '🌍' },
];

const STRESS_LEVELS = [
  { value: 'low', label: 'Low Stress', color: 'bg-green-100 text-green-800' },
  { value: 'medium', label: 'Medium Stress', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'High Stress', color: 'bg-orange-100 text-orange-800' },
  { value: 'very_high', label: 'Very High Stress', color: 'bg-red-100 text-red-800' },
];

const GROWTH_POTENTIALS = [
  { value: 'low', label: 'Low Growth', color: 'bg-gray-100 text-gray-800' },
  { value: 'medium', label: 'Medium Growth', color: 'bg-blue-100 text-blue-800' },
  { value: 'high', label: 'High Growth', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'very_high', label: 'Very High Growth', color: 'bg-purple-100 text-purple-800' },
];

export default function CareerFilterBar({ onFilterChange, totalCareers, filteredCount }: CareerFilterBarProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['all']);
  const [selectedStressLevels, setSelectedStressLevels] = useState<string[]>([]);
  const [selectedGrowthPotentials, setSelectedGrowthPotentials] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCategoryToggle = (category: string) => {
    let newCategories: string[];

    if (category === 'all') {
      newCategories = ['all'];
    } else {
      const filtered = selectedCategories.filter(c => c !== 'all');
      if (filtered.includes(category)) {
        newCategories = filtered.filter(c => c !== category);
        if (newCategories.length === 0) newCategories = ['all'];
      } else {
        newCategories = [...filtered, category];
      }
    }

    setSelectedCategories(newCategories);
    emitFilterChange(newCategories, selectedStressLevels, selectedGrowthPotentials, searchQuery);
  };

  const handleStressLevelToggle = (level: string) => {
    const newLevels = selectedStressLevels.includes(level)
      ? selectedStressLevels.filter(l => l !== level)
      : [...selectedStressLevels, level];

    setSelectedStressLevels(newLevels);
    emitFilterChange(selectedCategories, newLevels, selectedGrowthPotentials, searchQuery);
  };

  const handleGrowthPotentialToggle = (potential: string) => {
    const newPotentials = selectedGrowthPotentials.includes(potential)
      ? selectedGrowthPotentials.filter(p => p !== potential)
      : [...selectedGrowthPotentials, potential];

    setSelectedGrowthPotentials(newPotentials);
    emitFilterChange(selectedCategories, selectedStressLevels, newPotentials, searchQuery);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    emitFilterChange(selectedCategories, selectedStressLevels, selectedGrowthPotentials, query);
  };

  const emitFilterChange = (
    categories: string[],
    stressLevels: string[],
    growthPotentials: string[],
    query: string
  ) => {
    onFilterChange({
      categories: categories.includes('all') ? [] : categories,
      stressLevels,
      growthPotentials,
      searchQuery: query,
    });
  };

  const clearAllFilters = () => {
    setSelectedCategories(['all']);
    setSelectedStressLevels([]);
    setSelectedGrowthPotentials([]);
    setSearchQuery('');
    onFilterChange({
      categories: [],
      stressLevels: [],
      growthPotentials: [],
      searchQuery: '',
    });
  };

  const activeFiltersCount =
    (selectedCategories.includes('all') ? 0 : selectedCategories.length) +
    selectedStressLevels.length +
    selectedGrowthPotentials.length +
    (searchQuery ? 1 : 0);

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
      {/* Main Filter Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search careers by name, description, or skills..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full px-4 py-3 pl-12 pr-4 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {searchQuery && (
              <button
                onClick={() => handleSearchChange('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-3 mb-3">
          <span className="text-sm font-medium text-gray-700">Industry:</span>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => handleCategoryToggle(cat.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategories.includes(cat.value)
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-1">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Filters Toggle */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            {isExpanded ? '▼' : '▶'} Advanced Filters
            {activeFiltersCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
                {activeFiltersCount}
              </span>
            )}
          </button>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Showing <span className="font-semibold text-gray-900">{filteredCount}</span> of{' '}
              <span className="font-semibold text-gray-900">{totalCareers}</span> careers
            </span>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Advanced Filters (Collapsible) */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
            {/* Stress Level Filter */}
            <div>
              <span className="text-sm font-medium text-gray-700 mb-2 block">Stress Level:</span>
              <div className="flex flex-wrap gap-2">
                {STRESS_LEVELS.map((level) => (
                  <button
                    key={level.value}
                    onClick={() => handleStressLevelToggle(level.value)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                      selectedStressLevels.includes(level.value)
                        ? `${level.color} ring-2 ring-offset-1 ring-current`
                        : `${level.color} opacity-50 hover:opacity-100`
                    }`}
                  >
                    {level.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Growth Potential Filter */}
            <div>
              <span className="text-sm font-medium text-gray-700 mb-2 block">Growth Potential:</span>
              <div className="flex flex-wrap gap-2">
                {GROWTH_POTENTIALS.map((potential) => (
                  <button
                    key={potential.value}
                    onClick={() => handleGrowthPotentialToggle(potential.value)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                      selectedGrowthPotentials.includes(potential.value)
                        ? `${potential.color} ring-2 ring-offset-1 ring-current`
                        : `${potential.color} opacity-50 hover:opacity-100`
                    }`}
                  >
                    {potential.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
