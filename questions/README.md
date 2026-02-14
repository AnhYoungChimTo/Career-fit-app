# Career Fit Interview Questions

This directory contains the question bank for both Lite and Deep interview versions.

## Structure

```
questions/
├── lite/                           # Lite version (10-15 min, ~37 questions)
│   ├── skills-talents.json         # 14 questions - technical aptitudes
│   ├── values-preferences.json     # 13 questions - work values
│   └── current-situation.json      # 10 questions - context for recommendations
│
└── deep/                           # Deep version (3-4 hours, ~150 questions)
    ├── module-a.json              # Personality & Work Style (15 questions)
    ├── module-b.json              # Technical Aptitudes & Skills (20 questions)
    ├── module-c.json              # Values & Motivations (12 questions)
    ├── module-d.json              # Learning Style & Growth (12 questions)
    ├── module-e.json              # Communication & Collaboration (12 questions)
    ├── module-f.json              # Problem-Solving Approaches (12 questions)
    ├── module-g.json              # Career Goals & Vision (12 questions)
    ├── module-h.json              # Work Environment Preferences (11 questions)
    ├── module-i.json              # Project & Task Preferences (11 questions)
    ├── module-j.json              # Risk Tolerance & Decision Making (11 questions)
    ├── module-k.json              # Industry & Domain Interests (11 questions)
    └── module-l.json              # Constraints & Dealbreakers (11 questions)
```

## Question Types

Each question supports the following types:

- **select**: Single choice from options
- **multiselect**: Multiple choices (with optional min/max selections)
- **slider**: 1-10 scale with min/max labels
- **ranking**: Drag-to-reorder preference ranking
- **text**: Free-form text response

## Question Schema

```json
{
  "id": "unique_question_id",
  "type": "select|multiselect|slider|ranking|text",
  "required": true|false,
  "question": "The question text",
  "scoringKey": "a1_category_name",

  // Type-specific fields
  "options": [...],           // for select, multiselect, ranking
  "min": 1, "max": 10,       // for slider
  "minLabel": "...",         // for slider
  "maxLabel": "...",         // for slider
  "minSelections": 3,        // for multiselect
  "maxSelections": 5,        // for multiselect
  "placeholder": "...",      // for text
  "maxLength": 500           // for text
}
```

## Scoring Keys

Questions are mapped to A-factor scoring categories:

- **a1_*** → A1 (Personality & Work Style) - 40% weight
- **a2_*** → A2 (Skills & Talents) - 35% weight
- **a3_*** → A3 (Values & Preferences) - 25% weight
- **session_*** → Session metadata (not scored, used for context)

## Lite vs Deep Differences

| Aspect | Lite | Deep |
|--------|------|------|
| **Duration** | 10-15 minutes | 3-4 hours |
| **Questions** | ~37 questions | ~150 questions |
| **Structure** | 3 categories | 12 modules |
| **Depth** | Surface-level insights | Comprehensive analysis |
| **Results** | Top 1-2 careers (medium confidence) | Top 5 careers (high confidence) |
| **Roadmap** | 6-month basic roadmap | Detailed short/mid/long-term plan |

## Recommended Modules (Deep)

The following modules are marked as `isRecommended: true` for users who choose the Deep interview:

- Module A: Personality & Work Style
- Module B: Technical Aptitudes & Skills
- Module C: Values & Motivations
- Module G: Career Goals & Vision

Users can skip recommended modules or choose additional modules based on their needs.

## Validation

To validate all JSON files:

```bash
cd questions
node -e "
const fs = require('fs');
const files = [...fs.readdirSync('lite'), ...fs.readdirSync('deep')];
files.forEach(f => {
  try {
    require('./lite/' + f.includes('lite') ? f : './deep/' + f);
    console.log('✅', f);
  } catch(e) {
    console.log('❌', f, e.message);
  }
});
"
```

## Adding New Questions

1. Add question to appropriate file
2. Ensure `scoringKey` maps to correct A-factor category
3. Set `required: true` for essential questions
4. Validate JSON syntax
5. Test in the application

## Usage in Application

The backend serves these questions via API endpoints:

```
GET /api/interviews/questions/lite
GET /api/interviews/questions/deep/:moduleId
```

The frontend renders questions based on their `type` field using appropriate UI components.
