import { FilterOptions } from '../components/CareerFilterBar';

export interface Career {
  id: string;
  name: string;
  vietnameseName: string;
  description: string;
  category: string;
  avgSalaryVND?: string;
  workHoursPerWeek?: number;
  stressLevel?: string;
  growthPotential?: string;
  requirements: any;
  createdAt: string;
  updatedAt: string;
}

/**
 * Filter careers based on selected filter options
 */
export function filterCareers(careers: Career[], filters: FilterOptions): Career[] {
  let filtered = [...careers];

  // Filter by categories
  if (filters.categories.length > 0) {
    filtered = filtered.filter((career) =>
      filters.categories.includes(career.category)
    );
  }

  // Filter by stress levels
  if (filters.stressLevels.length > 0) {
    filtered = filtered.filter(
      (career) => career.stressLevel && filters.stressLevels.includes(career.stressLevel)
    );
  }

  // Filter by growth potentials
  if (filters.growthPotentials.length > 0) {
    filtered = filtered.filter(
      (career) =>
        career.growthPotential && filters.growthPotentials.includes(career.growthPotential)
    );
  }

  // Filter by search query
  if (filters.searchQuery.trim()) {
    const query = filters.searchQuery.toLowerCase().trim();
    filtered = filtered.filter(
      (career) =>
        career.name.toLowerCase().includes(query) ||
        career.vietnameseName.toLowerCase().includes(query) ||
        career.description.toLowerCase().includes(query) ||
        career.category.toLowerCase().includes(query)
    );
  }

  return filtered;
}

/**
 * Get unique categories from careers list
 */
export function getUniqueCategories(careers: Career[]): string[] {
  const categories = new Set(careers.map((c) => c.category));
  return Array.from(categories).sort();
}

/**
 * Get career count by category
 */
export function getCategoryCount(careers: Career[], category: string): number {
  return careers.filter((c) => c.category === category).length;
}

/**
 * Format category name for display
 */
export function formatCategoryName(category: string): string {
  const categoryMap: Record<string, string> = {
    'marketing': 'Marketing & Digital',
    'finance': 'Finance & Banking',
    'international-relations': 'International Relations',
    'technology': 'Technology & Engineering',
    'creative': 'Creative Industries',
    'education': 'Education & Training',
    'healthcare': 'Healthcare & Medical',
    'general': 'General',
  };

  return categoryMap[category] || category
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Get category icon
 */
export function getCategoryIcon(category: string): string {
  const iconMap: Record<string, string> = {
    'marketing': '📊',
    'finance': '💰',
    'international-relations': '🌍',
    'technology': '💻',
    'creative': '🎨',
    'education': '📚',
    'healthcare': '🏥',
    'general': '🌐',
  };

  return iconMap[category] || '💼';
}
