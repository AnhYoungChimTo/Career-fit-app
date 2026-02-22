import { useState, useEffect } from 'react';
import CareerFilterBar, { type FilterOptions } from '../components/CareerFilterBar';
import { filterCareers, type Career, formatCategoryName, getCategoryIcon } from '../utils/careerFilters';
import { api } from '../services/api';

export default function CareersExplorer() {
  const [allCareers, setAllCareers] = useState<Career[]>([]);
  const [filteredCareers, setFilteredCareers] = useState<Career[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all careers on component mount
  useEffect(() => {
    fetchCareers();
  }, []);

  const fetchCareers = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/careers'); // Adjust endpoint as needed
      setAllCareers(response.data);
      setFilteredCareers(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load careers');
      console.error('Error fetching careers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (filters: FilterOptions) => {
    const filtered = filterCareers(allCareers, filters);
    setFilteredCareers(filtered);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading careers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-medium">Error: {error}</p>
          <button
            onClick={fetchCareers}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Filter Bar */}
      <CareerFilterBar
        onFilterChange={handleFilterChange}
        totalCareers={allCareers.length}
        filteredCount={filteredCareers.length}
      />

      {/* Career Cards Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredCareers.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No careers found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCareers.map((career) => (
              <CareerCard key={career.id} career={career} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Career Card Component
function CareerCard({ career }: { career: Career }) {
  const getStressColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'very_high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getGrowthColor = (potential: string) => {
    switch (potential) {
      case 'low':
        return 'bg-gray-100 text-gray-800';
      case 'medium':
        return 'bg-blue-100 text-blue-800';
      case 'high':
        return 'bg-indigo-100 text-indigo-800';
      case 'very_high':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
      {/* Category Badge */}
      <div className="flex items-center justify-between mb-3">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <span className="mr-1">{getCategoryIcon(career.category)}</span>
          {formatCategoryName(career.category)}
        </span>
      </div>

      {/* Career Title */}
      <h3 className="text-lg font-bold text-gray-900 mb-1">{career.name}</h3>
      <p className="text-sm text-gray-600 mb-3">{career.vietnameseName}</p>

      {/* Description */}
      <p className="text-sm text-gray-700 mb-4 line-clamp-3">{career.description}</p>

      {/* Metadata */}
      <div className="space-y-2 mb-4">
        {career.avgSalaryVND && (
          <div className="flex items-center text-sm">
            <span className="text-gray-500 mr-2">💵</span>
            <span className="text-gray-700">{career.avgSalaryVND} VND/month</span>
          </div>
        )}
        {career.workHoursPerWeek && (
          <div className="flex items-center text-sm">
            <span className="text-gray-500 mr-2">⏰</span>
            <span className="text-gray-700">{career.workHoursPerWeek} hours/week</span>
          </div>
        )}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {career.stressLevel && (
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${getStressColor(career.stressLevel)}`}
          >
            {career.stressLevel.replace('_', ' ')}
          </span>
        )}
        {career.growthPotential && (
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${getGrowthColor(
              career.growthPotential
            )}`}
          >
            {career.growthPotential.replace('_', ' ')} growth
          </span>
        )}
      </div>

      {/* View Details Button */}
      <button className="mt-4 w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
        View Details
      </button>
    </div>
  );
}
