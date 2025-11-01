# Fast Quiz Application

A modern, lightweight quiz application built with vanilla HTML, CSS, and JavaScript. No frameworks, no build tools - just clean, efficient code following best practices.

## Features

- **Category Organization**: Browse quizzes organized by category for easy navigation
- **Global Random Party Mode**: Generate a quiz with 10 random questions from ALL available quizzes
- **Category Random Party Mode**: Generate a quiz with 10 random questions from a specific category
- **Question & Answer Shuffling**: Questions and answer options are automatically shuffled for variety
- **Multiple Quiz Selection**: Browse and select from various quizzes within each category
- **Dynamic Quiz Loading**: Categories and quizzes are loaded dynamically from a manifest file
- **Interactive Quiz Taking**: Answer questions with immediate visual feedback
- **Real-time Scoring**: Track your progress with a live progress bar
- **Detailed Feedback**: Get explanations for correct and incorrect answers
- **Results Summary**: View your final score with personalized messages
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Modular Architecture**: Clean separation of concerns with ES6 modules
- **Accessible**: Built with semantic HTML and ARIA labels

## Project Structure

```
.
├── index.html              # Category selection page
├── category.html           # Quiz selection page (within category)
├── quiz.html               # Quiz taking page
├── quiz-schema.json        # JSON Schema for quiz validation
├── QUIZ-FORMAT.md          # Quiz format documentation
├── README.md               # Main documentation
├── css/
│   └── styles.css          # All styles with CSS custom properties
├── js/
│   ├── QuizManager.js           # Business logic and state management
│   ├── QuizRenderer.js          # DOM manipulation and rendering
│   ├── RandomQuizGenerator.js   # Random quiz generation utility
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

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- A local web server (required for ES6 modules)

### Installation

1. Clone or download this repository
2. Navigate to the project directory
3. Start a local web server

#### Option 1: Using Python

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

#### Option 2: Using Node.js

```bash
# Install http-server globally
npm install -g http-server

# Start server
http-server -p 8000
```

#### Option 3: Using VS Code

Install the "Live Server" extension and click "Go Live"

4. Open your browser and navigate to `http://localhost:8000`

## Creating New Quizzes

Quizzes are organized by category in subfolders within the `quizzes/` directory.

**For detailed documentation on the quiz format, see [QUIZ-FORMAT.md](QUIZ-FORMAT.md)**

Quick steps:

1. Create a new JSON file in the appropriate category subfolder (e.g., `quizzes/lomloe/` or `quizzes/educacion/`)
2. Add the filename to the category's `quizzes` array in [quizzes/manifest.json](quizzes/manifest.json)
3. Follow this structure:

```json
{
  "title": "Your Quiz Title",
  "description": "A brief description of your quiz",
  "category": "lomloe",
  "icon": "📖",
  "difficulty": "easy",
  "questions": [
    {
      "question": "Your question text?",
      "options": [
        "Option 1",
        "Option 2",
        "Option 3",
        "Option 4"
      ],
      "correctAnswer": 0,
      "explanation": "Optional explanation for the answer"
    }
  ]
}
```

### Manifest Structure

The manifest file organizes quizzes by category:

```json
{
  "categories": [
    {
      "id": "lomloe",
      "name": "LOMLOE",
      "description": "Ley Orgánica de Modificación de la LOE",
      "icon": "📖",
      "quizzes": [
        "lomloe.json",
        "your-new-quiz.json"
      ]
    }
  ]
}
```

### Quiz Properties

- **title** (required): The quiz title displayed to users
- **description** (required): A brief description of the quiz
- **category** (required): Category for icon selection (javascript, html, css, security, etc.)
- **difficulty** (required): One of: `easy`, `medium`, or `hard`
- **questions** (required): Array of question objects

### Question Properties

- **question** (required): The question text
- **options** (required): Array of 2-4 answer options
- **correctAnswer** (required): Index (0-based) of the correct option
- **explanation** (optional): Additional context shown after answering

## Architecture & Design Patterns

### Separation of Concerns

The application follows a clean architecture with distinct responsibilities:

- **QuizManager.js**: Handles all business logic and state management
- **QuizRenderer.js**: Manages all DOM manipulation and UI updates
- **Controller files**: Coordinate between manager and renderer

### ES6 Modules

Uses native ES6 modules for:
- Better code organization
- Explicit dependencies
- Tree-shaking potential
- Namespace isolation

### Security

- XSS protection through HTML escaping
- No use of `eval()` or `innerHTML` with user data
- URL parameter validation
- Safe JSON parsing with error handling

### Performance

- Minimal DOM manipulation
- Efficient event delegation where applicable
- CSS animations using transforms for better performance
- Lazy loading of quiz data

### Accessibility

- Semantic HTML5 elements
- ARIA labels on interactive elements
- Keyboard navigation support
- Sufficient color contrast
- Responsive font sizing

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Opera (latest)

**Note**: ES6 modules require a modern browser. For older browser support, consider using a bundler like webpack or Rollup.

## Best Practices Implemented

### HTML
- Semantic HTML5 elements
- Proper meta tags for SEO
- Accessible markup with ARIA labels
- Valid document structure

### CSS
- CSS Custom Properties (variables) for theming
- BEM-like naming convention
- Mobile-first responsive design
- Smooth animations with reduced motion support
- Modular, maintainable styles

### JavaScript
- ES6+ modern syntax
- Class-based architecture
- Async/await for asynchronous operations
- Comprehensive error handling
- Input validation and sanitization
- JSDoc comments for documentation
- Single Responsibility Principle
- DRY (Don't Repeat Yourself)

## Customization

### Changing Colors

Edit CSS custom properties in [css/styles.css:1-31](css/styles.css#L1-L31):

```css
:root {
    --color-primary: #6366f1;
    --color-success: #10b981;
    --color-error: #ef4444;
    /* ... */
}
```

### Modifying Questions per Quiz

Simply add or remove question objects in your quiz JSON files.

### Changing Progress Calculation

Modify the `getProgress()` method in [js/QuizManager.js:139](js/QuizManager.js#L139).

## Navigation Flow

1. **Index Page** (`index.html`): Browse quiz categories
   - Each category shows the number of available quizzes
   - Global Random Party card generates quiz from all categories

2. **Category Page** (`category.html?category=categoryId`): Browse quizzes within a category
   - Shows all quizzes for the selected category
   - Category Random Party card generates quiz from current category only
   - Back button returns to category selection

3. **Quiz Page** (`quiz.html`): Take the selected quiz
   - Real-time progress tracking
   - Immediate feedback on answers
   - Final results with retry option

## Future Enhancements

Potential features to add:

- Timer for timed quizzes
- User statistics and history
- Social sharing
- Print-friendly results
- Multi-language support
- Dark mode toggle
- Quiz search functionality within categories
- Category filtering and sorting

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

If you encounter any issues or have questions, please open an issue in the repository.

---

Built with vanilla JavaScript - no frameworks, no dependencies, just clean code.
