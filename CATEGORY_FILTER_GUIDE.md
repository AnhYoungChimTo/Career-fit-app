# Career Category Filter System - Implementation Guide

**Created**: February 16, 2026
**Feature**: Category-based career filtering for frontend and backend

---

## Overview

Added a comprehensive category filtering system that allows users to filter careers by industry, stress level, growth potential, and search query. The system includes:

1. **Database Schema** - Added `category` field to Career model
2. **Backend API** - Updated careers controller to support category filtering
3. **Frontend Components** - Filter bar with advanced filtering options
4. **Utilities** - Helper functions for filtering and formatting

---

## Database Changes

### Schema Update

Added `category` field to the `Career` model in Prisma schema:

```prisma
model Career {
  id                String   @id @default(uuid())
  name              String   @unique
  vietnameseName    String
  description       String

  // NEW: Category/Industry classification
  category          String   @default("general")

  requirements      Json
  avgSalaryVND      String?
  workHoursPerWeek  Int?
  stressLevel       String?
  growthPotential   String?
  cachedAnalysis    Json?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([name])
  @@index([category])  // NEW: Index for efficient filtering
}
```

### Migration

Migration created: `20260216072835_add_career_category`

```bash
npx prisma migrate dev --name add_career_category
```

### Seed Data Updated

All three seed files now include the `category` field:

| Seed File | Category Value | Careers Count |
|-----------|---------------|---------------|
| `marketing-careers.seed.ts` | `'marketing'` | 43 |
| `international-relations-careers.seed.ts` | `'international-relations'` | 43 |
| `finance-careers.seed.ts` | `'finance'` | 45 |

**Total**: 131 careers across 3 categories

---

## Backend API

### Endpoints

#### 1. Get All Careers with Filters

```
GET /api/careers
```

**Query Parameters**:

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `category` | string | Filter by industry category | `marketing`, `finance`, `international-relations` |
| `stressLevel` | string | Filter by stress level | `low`, `medium`, `high`, `very_high` |
| `growthPotential` | string | Filter by growth potential | `low`, `medium`, `high`, `very_high` |
| `search` | string | Search in name, Vietnamese name, description | `"marketing manager"` |
| `experienceLevel` | string | Filter by experience level | `intern`, `entry`, `mid`, `senior`, `executive` |
| `minSalary` | number | Minimum salary in VND | `10000000` |
| `maxSalary` | number | Maximum salary in VND | `50000000` |
| `limit` | number | Results per page (default: 50) | `20` |
| `offset` | number | Pagination offset (default: 0) | `0` |

**Example Requests**:

```bash
# Get all marketing careers
GET /api/careers?category=marketing

# Get high-growth finance careers
GET /api/careers?category=finance&growthPotential=very_high

# Get low-stress careers with search
GET /api/careers?stressLevel=low&search=coordinator

# Combined filters
GET /api/careers?category=marketing&stressLevel=medium&limit=10
```

**Response Format**:

```json
{
  "success": true,
  "data": {
    "careers": [
      {
        "id": "uuid",
        "name": "Marketing Manager",
        "vietnameseName": "Quản lý Marketing",
        "description": "Leads marketing team...",
        "category": "marketing",
        "avgSalaryVND": "15,000,000 - 30,000,000",
        "salaryRange": { "min": 15000000, "max": 30000000 },
        "workHoursPerWeek": 45,
        "stressLevel": "medium",
        "growthPotential": "high",
        "experienceLevel": "Mid-Level",
        "requirements": { "a1": {...}, "a2": {...}, "a3": {...} },
        "createdAt": "2026-02-16T...",
        "updatedAt": "2026-02-16T..."
      }
    ],
    "pagination": {
      "total": 43,
      "limit": 50,
      "offset": 0,
      "hasMore": false
    }
  }
}
```

#### 2. Get Career Statistics

```
GET /api/careers/stats
```

**Response**:

```json
{
  "success": true,
  "data": {
    "totalCareers": 131,
    "byCategory": {
      "marketing": 43,
      "finance": 45,
      "international-relations": 43
    },
    "byStressLevel": {
      "low": 15,
      "medium": 58,
      "high": 42,
      "very_high": 16
    },
    "byGrowthPotential": {
      "low": 0,
      "medium": 8,
      "high": 52,
      "very_high": 71
    }
  }
}
```

#### 3. Get Single Career

```
GET /api/careers/:id
```

Returns detailed information for a single career.

---

## Frontend Components

### 1. CareerFilterBar Component

**Location**: `frontend/src/components/CareerFilterBar.tsx`

**Features**:
- 🔍 Search bar with real-time filtering
- 🏷️ Category pills (All, Marketing, Finance, International Relations)
- ⚡ Advanced filters (collapsible):
  - Stress Level (Low, Medium, High, Very High)
  - Growth Potential (Low, Medium, High, Very High)
- 📊 Results counter showing filtered vs total
- 🧹 Clear all filters button
- ✨ Active filters badge

**Usage Example**:

```tsx
import CareerFilterBar, { FilterOptions } from '../components/CareerFilterBar';

function MyPage() {
  const [filteredCareers, setFilteredCareers] = useState<Career[]>([]);
  const [allCareers, setAllCareers] = useState<Career[]>([]);

  const handleFilterChange = (filters: FilterOptions) => {
    const filtered = filterCareers(allCareers, filters);
    setFilteredCareers(filtered);
  };

  return (
    <div>
      <CareerFilterBar
        onFilterChange={handleFilterChange}
        totalCareers={allCareers.length}
        filteredCount={filteredCareers.length}
      />
      {/* Career cards grid */}
    </div>
  );
}
```

**Props**:

```typescript
interface CareerFilterBarProps {
  onFilterChange: (filters: FilterOptions) => void;  // Callback when filters change
  totalCareers: number;                              // Total careers count
  filteredCount: number;                             // Filtered careers count
}

interface FilterOptions {
  categories: string[];        // Selected categories
  stressLevels: string[];     // Selected stress levels
  growthPotentials: string[]; // Selected growth potentials
  searchQuery: string;        // Search query
}
```

### 2. Career Filter Utilities

**Location**: `frontend/src/utils/careerFilters.ts`

**Functions**:

```typescript
// Filter careers based on selected options
function filterCareers(careers: Career[], filters: FilterOptions): Career[]

// Get unique categories from careers list
function getUniqueCategories(careers: Career[]): string[]

// Get career count by category
function getCategoryCount(careers: Career[], category: string): number

// Format category name for display
function formatCategoryName(category: string): string
// 'marketing' → 'Marketing & Digital'
// 'finance' → 'Finance & Banking'
// 'international-relations' → 'International Relations'

// Get category icon
function getCategoryIcon(category: string): string
// 'marketing' → '📊'
// 'finance' → '💰'
// 'international-relations' → '🌍'
```

### 3. CareersExplorer Page (Example Implementation)

**Location**: `frontend/src/pages/CareersExplorer.tsx`

Complete example page showing:
- Fetching careers from API
- Applying filters with FilterBar
- Displaying career cards in a grid
- Loading and error states
- Responsive design

---

## Usage Examples

### Backend API Testing

```bash
# Test category filtering
curl http://localhost:3001/api/careers?category=marketing

# Test combined filters
curl "http://localhost:3001/api/careers?category=finance&stressLevel=high&growthPotential=very_high"

# Test search
curl "http://localhost:3001/api/careers?search=manager&category=marketing"

# Get statistics
curl http://localhost:3001/api/careers/stats
```

### Frontend Usage

#### Basic Filter Implementation

```tsx
import { useState, useEffect } from 'react';
import CareerFilterBar from '../components/CareerFilterBar';
import { filterCareers } from '../utils/careerFilters';
import api from '../services/api';

export default function Careers() {
  const [allCareers, setAllCareers] = useState([]);
  const [filteredCareers, setFilteredCareers] = useState([]);

  useEffect(() => {
    api.get('/careers').then(res => {
      setAllCareers(res.data.data.careers);
      setFilteredCareers(res.data.data.careers);
    });
  }, []);

  const handleFilterChange = (filters) => {
    const filtered = filterCareers(allCareers, filters);
    setFilteredCareers(filtered);
  };

  return (
    <div>
      <CareerFilterBar
        onFilterChange={handleFilterChange}
        totalCareers={allCareers.length}
        filteredCount={filteredCareers.length}
      />
      <div className="grid grid-cols-3 gap-4">
        {filteredCareers.map(career => (
          <CareerCard key={career.id} career={career} />
        ))}
      </div>
    </div>
  );
}
```

#### Server-Side Filtering (Alternative)

Instead of client-side filtering, you can filter on the backend:

```tsx
const handleFilterChange = async (filters: FilterOptions) => {
  const params = new URLSearchParams();

  if (filters.categories.length > 0) {
    params.append('category', filters.categories[0]); // Single category
  }

  if (filters.stressLevels.length > 0) {
    params.append('stressLevel', filters.stressLevels[0]);
  }

  if (filters.searchQuery) {
    params.append('search', filters.searchQuery);
  }

  const response = await api.get(`/careers?${params.toString()}`);
  setFilteredCareers(response.data.data.careers);
};
```

---

## Category Definitions

### Current Categories

| Category | Value | Display Name | Icon | Description |
|----------|-------|--------------|------|-------------|
| **Marketing** | `marketing` | Marketing & Digital | 📊 | Marketing, digital marketing, brand management, content, social media, SEO, advertising |
| **Finance** | `finance` | Finance & Banking | 💰 | Banking, corporate finance, investment banking, accounting, Big 4, FinTech, financial advisory |
| **International Relations** | `international-relations` | International Relations | 🌍 | NGO, diplomacy, development, humanitarian, policy, advocacy, external relations |
| **General** | `general` | General | 🌐 | Default category for uncategorized careers |

### Future Categories (Planned)

| Category | Value | Display Name | Icon |
|----------|-------|--------------|------|
| **Technology** | `technology` | Technology & Engineering | 💻 |
| **Creative** | `creative` | Creative Industries | 🎨 |
| **Education** | `education` | Education & Training | 📚 |
| **Healthcare** | `healthcare` | Healthcare & Medical | 🏥 |
| **Government** | `government` | Government & Public Sector | 🏛️ |

---

## Styling & Design

### Tailwind CSS Classes Used

**Filter Bar**:
- `sticky top-0` - Sticky header
- `z-10` - Above content
- `shadow-sm` - Subtle shadow
- `border-b` - Bottom border

**Category Pills**:
- Selected: `bg-blue-600 text-white shadow-md`
- Unselected: `bg-gray-100 text-gray-700 hover:bg-gray-200`
- `rounded-full` - Pill shape
- `px-4 py-2` - Padding

**Stress Level Tags**:
- Low: `bg-green-100 text-green-800`
- Medium: `bg-yellow-100 text-yellow-800`
- High: `bg-orange-100 text-orange-800`
- Very High: `bg-red-100 text-red-800`

**Growth Potential Tags**:
- Low: `bg-gray-100 text-gray-800`
- Medium: `bg-blue-100 text-blue-800`
- High: `bg-indigo-100 text-indigo-800`
- Very High: `bg-purple-100 text-purple-800`

### Responsive Design

The filter bar is fully responsive:
- **Mobile** (< 640px): Stacked layout, single column
- **Tablet** (640px - 1024px): 2-column grid
- **Desktop** (> 1024px): Full horizontal layout

---

## Testing

### Manual Testing Checklist

**Backend**:
- [ ] GET `/api/careers` returns all careers
- [ ] GET `/api/careers?category=marketing` returns only marketing careers
- [ ] GET `/api/careers?category=finance` returns only finance careers
- [ ] GET `/api/careers?stressLevel=low` returns low-stress careers
- [ ] GET `/api/careers/stats` returns correct category counts
- [ ] Combined filters work correctly
- [ ] Search query filters properly
- [ ] Pagination works with filters

**Frontend**:
- [ ] Filter bar renders correctly
- [ ] Category pills toggle selection
- [ ] Search bar filters in real-time
- [ ] Advanced filters expand/collapse
- [ ] Active filters count updates
- [ ] "Clear All" button resets filters
- [ ] Results counter shows correct numbers
- [ ] Career cards display category badges
- [ ] Responsive design works on mobile

### Test API Endpoint

```bash
cd backend

# Start backend server
npm run dev

# In another terminal, test endpoints
curl http://localhost:3001/api/careers?category=marketing | jq '.data.careers | length'
# Should return: 43

curl http://localhost:3001/api/careers?category=finance | jq '.data.careers | length'
# Should return: 45

curl http://localhost:3001/api/careers/stats | jq '.data.byCategory'
# Should return category counts
```

---

## Performance Considerations

### Database Indexing

The `category` field has a database index for efficient filtering:

```prisma
@@index([category])
```

This ensures fast queries even with thousands of careers.

### Frontend Optimization

**Client-Side Filtering** (Current):
- ✅ Fast - no network requests
- ✅ Instant updates
- ❌ All data loaded upfront
- Best for: < 500 careers

**Server-Side Filtering** (Alternative):
- ✅ Handles large datasets
- ✅ Lower initial load
- ❌ Network delay on filter change
- Best for: > 500 careers

**Recommendation**: Start with client-side filtering. Switch to server-side if career count exceeds 500.

---

## Future Enhancements

### Planned Features

1. **Multi-Category Filter**
   - Allow selecting multiple categories at once
   - Current: Single category OR all categories
   - Future: Marketing + Finance simultaneously

2. **Filter Presets**
   - Save common filter combinations
   - Examples: "High Growth Tech", "Low Stress Entry Level", "Executive Roles"

3. **URL Query Parameters**
   - Persist filters in URL
   - Shareable filtered views
   - Browser back/forward support

4. **Advanced Search**
   - Search by skills (A2 requirements)
   - Search by personality traits (A1 requirements)
   - Fuzzy matching for Vietnamese names

5. **Sort Options**
   - Sort by salary (ascending/descending)
   - Sort by growth potential
   - Sort by stress level
   - Sort by name (A-Z, Z-A)

6. **Export Filtered Results**
   - Export to CSV
   - Export to PDF
   - Share filtered list

---

## Troubleshooting

### Common Issues

**Issue**: Filters not working after database migration

**Solution**:
```bash
# Re-run seeds to populate category field
cd backend
npm run seed
```

---

**Issue**: Frontend shows "0 careers" after filtering

**Solution**: Check that the API is returning the `category` field:
```bash
curl http://localhost:3001/api/careers | jq '.data.careers[0].category'
```

---

**Issue**: TypeScript errors in frontend

**Solution**: The `Career` interface in `careerFilters.ts` includes the `category` field. Update your API response type if needed.

---

## Maintenance

### Adding New Categories

1. **Create Seed File**:
   ```bash
   touch backend/prisma/seeds/technology-careers.seed.ts
   ```

2. **Add Category to Seed Data**:
   ```typescript
   {
     name: 'Software Engineer',
     vietnameseName: 'Kỹ sư Phần mềm',
     description: '...',
     category: 'technology',  // NEW CATEGORY
     requirements: { ... },
     // ...
   }
   ```

3. **Update Frontend FilterBar**:
   ```typescript
   const CATEGORIES = [
     // ... existing categories
     { value: 'technology', label: 'Technology & Engineering', icon: '💻' },
   ];
   ```

4. **Update Utilities**:
   ```typescript
   // In careerFilters.ts
   const categoryMap = {
     // ... existing
     'technology': 'Technology & Engineering',
   };

   const iconMap = {
     // ... existing
     'technology': '💻',
   };
   ```

5. **Run Seed**:
   ```bash
   npm run seed:technology  # Individual
   npm run seed             # All seeds
   ```

---

## Summary

✅ **Completed**:
- Database schema updated with `category` field
- Migration created and applied
- All 131 careers categorized (Marketing, Finance, International Relations)
- Backend API updated to filter by category
- Frontend FilterBar component created
- Utility functions for filtering created
- Example implementation (CareersExplorer page)
- Comprehensive documentation

🎯 **Result**:
Users can now filter careers by:
- Industry category (Marketing, Finance, International Relations)
- Stress level (Low, Medium, High, Very High)
- Growth potential (Low, Medium, High, Very High)
- Search query (name, description)

📊 **Database Stats**:
- Total careers: 131
- Marketing: 43 careers
- Finance: 45 careers
- International Relations: 43 careers
- All careers properly categorized and indexed

---

**Version**: 1.0
**Last Updated**: February 16, 2026
**Author**: Career Fit Development Team
