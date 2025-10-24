# Fast Quiz Application - Claude Context

## Project Overview

Static HTML/CSS/JS quiz application with no frameworks or build tools. Uses ES6 modules, follows best practices with clean code architecture.

## Core Architecture

### File Structure
```
.
├── index.html              # Quiz selection page
├── quiz.html              # Quiz taking page
├── quiz-schema.json       # JSON Schema for validation
├── QUIZ-FORMAT.md         # Quiz format documentation
├── README.md              # Main documentation
├── css/
│   └── styles.css         # All styles with CSS custom properties
├── js/
│   ├── QuizManager.js          # Business logic and state management
│   ├── QuizRenderer.js         # DOM manipulation and rendering
│   ├── RandomQuizGenerator.js  # Random quiz generation and shuffling
│   ├── index.js                # Entry point for index page
│   └── quiz.js                 # Entry point for quiz page
└── quizzes/                    # Quiz data in JSON format
    ├── manifest.json           # List of available quizzes
    ├── javascript-basics.json
    ├── html-css.json
    └── web-security.json
```

### Key Modules

**QuizManager.js**
- Loads quizzes from manifest.json dynamically
- Manages quiz state (current question, score, answers)
- Validates quiz structure
- Applies shuffling on load

**QuizRenderer.js**
- All DOM manipulation and UI updates
- Renders quiz list with Random Party card first
- Shows feedback, progress, and results
- HTML escaping for XSS protection

**RandomQuizGenerator.js**
- Static utility class for randomization
- `shuffle()` - Fisher-Yates algorithm
- `shuffleQuestionOptions()` - Shuffles options, updates correctAnswer index
- `shuffleQuiz()` - Shuffles questions and all options
- `createRandomQuiz()` - Generates random quiz from multiple sources

## Data Flow

### Quiz Loading
1. Load manifest.json to get quiz list
2. Fetch quiz JSON files in parallel
3. Validate structure
4. Shuffle questions and options (always)
5. Initialize QuizManager state

### Random Party Mode
1. URL param: `?mode=random`
2. Load ALL quizzes from manifest
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

## Adding New Quizzes

1. Create JSON file in `quizzes/`
2. Add filename to `quizzes/manifest.json` array
3. Validate against quiz-schema.json

## Key Features

- **Shuffling**: Questions and options shuffled automatically on every load
- **Random Party**: 10 questions from all quizzes, generates NEW quiz on retry
- **Dynamic Loading**: All quizzes loaded from manifest.json
- **Progress Tracking**: Live progress bar and question counter
- **Immediate Feedback**: Shows correct answer with explanation
- **Responsive**: Mobile-first design with CSS Grid

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

- `quiz.html?quiz=filename.json` - Load specific quiz
- `quiz.html?mode=random` - Load Random Party mode

## Important Implementation Details

1. **Shuffling**: Always enabled, no configuration needed
2. **correctAnswer**: Must be updated when options shuffle (handled automatically)
3. **Manifest**: Single source of truth for available quizzes
4. **Retry**: Regular quizzes reset, Random Party generates NEW random quiz
5. **ES6 Modules**: Requires local web server (not file://)

## External Documentation

- Full quiz format: See QUIZ-FORMAT.md
- JSON Schema: See quiz-schema.json
- Setup instructions: See README.md

## Development Notes

- Use modern browser with ES6 module support
- Local server required (Python, Node http-server, or VS Code Live Server)
- No build step or transpilation
- All code is vanilla JS, no dependencies
