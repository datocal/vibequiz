# Fast Quiz Application - Claude Context

## Project Overview

Static HTML/CSS/JS quiz application with no frameworks or build tools. Uses ES6 modules, follows best practices with clean code architecture.

## Core Architecture

### File Structure
```
.
├── index.html              # Category selection page
├── category.html           # Quiz selection page (within category)
├── quiz.html               # Quiz taking page
├── quiz-schema.json        # JSON Schema for validation
├── QUIZ-FORMAT.md          # Quiz format documentation
├── README.md               # Main documentation
├── css/
│   └── styles.css          # All styles with CSS custom properties
├── js/
│   ├── QuizManager.js           # Business logic and state management
│   ├── QuizRenderer.js          # DOM manipulation and rendering
│   ├── RandomQuizGenerator.js   # Random quiz generation and shuffling
│   ├── index.js                 # Entry point for index page (categories)
│   ├── category.js              # Entry point for category page (quizzes)
│   └── quiz.js                  # Entry point for quiz page
└── quizzes/                     # Quiz data organized by category
    ├── manifest.json            # Category and quiz definitions
    ├── lomloe/                  # LOMLOE category
    │   └── lomloe.json
    └── educacion/               # Normativa Educativa category
        ├── decreto-374-1996.json
        ├── orden-22-julio-1997.json
        └── ...
```

### Key Modules

**QuizManager.js**
- Loads categories and quizzes from manifest.json dynamically
- `loadCategories()` - Loads all categories
- `loadCategoryQuizzes(categoryId)` - Loads quizzes for specific category
- `loadAllQuizzes(categoryId)` - Loads all quizzes (optionally filtered by category)
- Manages quiz state (current question, score, answers)
- Validates quiz structure
- Applies shuffling on load

**QuizRenderer.js**
- All DOM manipulation and UI updates
- `renderCategoryList()` - Renders category cards on index page
- `renderQuizList()` - Renders quiz cards with Random Party card first
- Shows feedback, progress, and results
- HTML escaping for XSS protection

**RandomQuizGenerator.js**
- Static utility class for randomization
- `shuffle()` - Fisher-Yates algorithm
- `shuffleQuestionOptions()` - Shuffles options, updates correctAnswer index
- `shuffleQuiz()` - Shuffles questions and all options
- `createRandomQuiz()` - Generates random quiz from multiple sources

## Data Flow

### Navigation Flow
1. **Index page** → Display categories from manifest.json
2. **Category page** → Display quizzes for selected category
3. **Quiz page** → Take quiz with shuffle and feedback

### Category Loading (Index Page)
1. Load manifest.json to get categories
2. Render category cards with metadata
3. Include Random Party card (global - all quizzes)

### Quiz Loading (Category Page)
1. Get category ID from URL parameter
2. Load manifest.json and find category
3. Fetch quiz JSON files for category in parallel
4. Render quiz cards with metadata
5. Include Random Party card (category-specific)

### Quiz Taking
1. Load specific quiz from category subfolder
2. Validate structure
3. Shuffle questions and options (always)
4. Initialize QuizManager state

### Random Party Mode
1. URL param: `?mode=random` (global) or `?mode=random&category=categoryId` (category-specific)
2. Load ALL quizzes (or quizzes from specific category)
3. Extract all questions with metadata
4. Select 10 random questions
5. Create new quiz object with mixed difficulty/category
6. Shuffle and initialize

## Quiz JSON Format

```json
{
  "title": "string",
  "description": "string",
  "category": "string (lowercase-with-hyphens)",
  "difficulty": "easy|medium|hard",
  "questions": [
    {
      "question": "string",
      "options": ["string", "string", ...],
      "correctAnswer": number (0-based index),
      "explanation": "string (optional)"
    }
  ]
}
```

**Required fields**: title, description, category, difficulty, questions
**Validation**: See quiz-schema.json for constraints

## Manifest JSON Format

```json
{
  "categories": [
    {
      "id": "category-id",
      "name": "Category Name",
      "description": "Category description",
      "icon": "📖",
      "quizzes": ["quiz1.json", "quiz2.json"]
    }
  ]
}
```

**Category fields**: id, name, description, icon (optional), quizzes (array)

## Adding New Quizzes

1. Create JSON file in `quizzes/{category-id}/` subfolder
2. Add filename to the category's `quizzes` array in `quizzes/manifest.json`
3. Validate against quiz-schema.json

## Adding New Categories

1. Create subfolder in `quizzes/` with category ID
2. Add category object to `categories` array in `quizzes/manifest.json`
3. Add quiz files to category subfolder

## Key Features

- **Category Organization**: Quizzes organized by category for better navigation
- **Shuffling**: Questions and options shuffled automatically on every load
- **Global Random Party**: 10 questions from all quizzes across all categories
- **Category Random Party**: 10 questions from specific category only
- **Dynamic Loading**: Categories and quizzes loaded from manifest.json
- **Progress Tracking**: Live progress bar and question counter
- **Immediate Feedback**: Shows correct answer with explanation
- **Responsive**: Mobile-first design with CSS Grid
- **Back Navigation**: Easy navigation from category page to index

## Design Patterns

- **Separation of Concerns**: Manager (logic) vs Renderer (UI)
- **Single Responsibility**: Each class/method has one job
- **Immutability**: Shuffle creates new objects, doesn't mutate
- **Module Pattern**: ES6 modules with explicit imports
- **DRY**: Reusable utilities in RandomQuizGenerator

## CSS Architecture

- CSS Custom Properties for theming (`:root`)
- BEM-like naming convention
- Modular sections with clear comments
- Special styling for `.quiz-card--random`
- Animations with `prefers-reduced-motion` support

## Security

- HTML escaping via `escapeHtml()` in QuizRenderer
- No use of `eval()` or `innerHTML` with user data
- URL parameter validation
- JSON parsing with error handling

## URL Parameters

- `index.html` - Show all categories
- `category.html?category=categoryId` - Show quizzes for specific category
- `quiz.html?quiz=categoryId/filename.json` - Load specific quiz from category
- `quiz.html?mode=random` - Global Random Party (all quizzes)
- `quiz.html?mode=random&category=categoryId` - Category Random Party

## Important Implementation Details

1. **Category Structure**: Quizzes must be in category subfolders (e.g., `quizzes/lomloe/`)
2. **Shuffling**: Always enabled, no configuration needed
3. **correctAnswer**: Must be updated when options shuffle (handled automatically)
4. **Manifest**: Single source of truth for categories and available quizzes
5. **Retry**: Regular quizzes reset, Random Party generates NEW random quiz
6. **ES6 Modules**: Requires local web server (not file://)
7. **Random Party Context**: Can be global (all categories) or category-specific

## External Documentation

- Full quiz format: See QUIZ-FORMAT.md
- JSON Schema: See quiz-schema.json
- Setup instructions: See README.md

## Development Notes

- Use modern browser with ES6 module support
- Local server required (Python, Node http-server, or VS Code Live Server)
- No build step or transpilation
- All code is vanilla JS, no dependencies
