# Quiz JSON Format

This document describes the JSON format for creating quizzes in the Fast Quiz application.

## JSON Schema

A formal JSON Schema is available in [quiz-schema.json](quiz-schema.json) that can be used to validate your quiz files.

## Structure Overview

```json
{
  "title": "string",
  "description": "string",
  "category": "string",
  "difficulty": "easy|medium|hard",
  "questions": [
    {
      "question": "string",
      "options": ["string", "string", ...],
      "correctAnswer": number,
      "explanation": "string (optional)"
    }
  ]
}
```

## Root Object Properties

### `title` (required)
- **Type**: `string`
- **Min Length**: 1
- **Max Length**: 100
- **Description**: The title of the quiz displayed to users
- **Examples**: `"World Geography"`, `"Classical Music Composers"`, `"JavaScript Basics"`

### `description` (required)
- **Type**: `string`
- **Min Length**: 10
- **Max Length**: 500
- **Description**: A brief description of what the quiz covers
- **Examples**:
  - `"Test your knowledge of world capitals, countries, and geographical features."`
  - `"Explore the life and works of famous classical composers from Bach to Beethoven."`
  - `"Master fundamental programming concepts and modern JavaScript syntax."`

### `category` (required)
- **Type**: `string`
- **Min Length**: 1
- **Max Length**: 50
- **Pattern**: Lowercase letters and hyphens only
- **Description**: Category used for icon selection and organization
- **Valid Values**: Any lowercase category with hyphens (e.g., `geography`, `music`, `history`, `science`, `sports`, `literature`, `javascript`, `general`)
- **Examples**: `"geography"`, `"music"`, `"history"`, `"javascript"`

**Default Icons by Category**:
- `general` → 📚
- `geography` → 🌍
- `history` → 📜
- `science` → 🔬
- `music` → 🎵
- `sports` → ⚽
- `literature` → 📖
- `art` → 🎨
- `javascript` → 💻
- `html` → 🌐
- `css` → 🎨
- `security` → 🔒
- `frontend` → 🖥️
- `backend` → ⚙️
- `database` → 🗄️

**Note**: You can use any category name. If no matching icon is defined, it will default to 📝

### `difficulty` (required)
- **Type**: `string`
- **Allowed Values**: `"easy"`, `"medium"`, `"hard"`
- **Description**: The difficulty level affects the badge color display
- **Example**: `"medium"`

**Difficulty Badge Colors**:
- `easy` → Green badge
- `medium` → Yellow badge
- `hard` → Red badge

### `questions` (required)
- **Type**: `array`
- **Min Items**: 1
- **Max Items**: 50 (recommended)
- **Description**: Array of question objects
- **See**: Question Object structure below

## Question Object Properties

### `question` (required)
- **Type**: `string`
- **Min Length**: 5
- **Max Length**: 500
- **Description**: The question text displayed to users
- **Examples**:
  - `"What is the capital of France?"`
  - `"Who composed the 'Moonlight Sonata'?"`
  - `"What is the correct way to declare a variable in JavaScript that cannot be reassigned?"`

**Tips**:
- Keep questions clear and concise
- Avoid ambiguous wording
- Use proper grammar and punctuation

### `options` (required)
- **Type**: `array` of `string`
- **Min Items**: 2
- **Max Items**: 6 (recommended 4)
- **Unique Items**: Yes
- **Description**: Array of possible answers
- **Examples**:
```json
["Paris", "London", "Berlin", "Madrid"]

["Ludwig van Beethoven", "Wolfgang Amadeus Mozart", "Johann Sebastian Bach", "Franz Schubert"]

["const myVariable = 10;", "let myVariable = 10;", "var myVariable = 10;", "variable myVariable = 10;"]
```

**Tips**:
- Each option should be a complete, standalone answer
- Keep options roughly the same length when possible
- Make all options plausible (avoid obviously wrong answers)
- Ensure only one option is clearly correct

### `correctAnswer` (required)
- **Type**: `integer`
- **Min Value**: 0
- **Description**: Zero-based index of the correct answer in the `options` array
- **Examples**: `0` (first option), `2` (third option), `3` (fourth option)

**Important**:
- Index starts at 0 (first option = 0, second option = 1, etc.)
- Must be a valid index within the options array
- Must be an integer, not a string

### `explanation` (optional but recommended)
- **Type**: `string`
- **Min Length**: 10
- **Max Length**: 1000
- **Description**: Explanation shown after the user answers (correct or incorrect)
- **Examples**:
  - `"Paris is the capital and largest city of France, located on the Seine River."`
  - `"Beethoven composed the 'Moonlight Sonata' (Piano Sonata No. 14) in 1801, dedicating it to his pupil Countess Giulietta Guicciardi."`
  - `"The 'const' keyword is used to declare variables that cannot be reassigned. 'let' allows reassignment, and 'var' is the older way of declaring variables."`

**Tips**:
- Always provide explanations for better learning
- Explain why the correct answer is right
- Optionally explain why other options are wrong
- Keep it educational and helpful

## Complete Examples

### Example 1: World Geography Quiz

```json
{
  "title": "European Capitals",
  "description": "Test your knowledge of European capital cities and their countries.",
  "category": "geography",
  "difficulty": "easy",
  "questions": [
    {
      "question": "What is the capital of France?",
      "options": [
        "Paris",
        "London",
        "Berlin",
        "Madrid"
      ],
      "correctAnswer": 0,
      "explanation": "Paris is the capital and largest city of France, located on the Seine River."
    },
    {
      "question": "Which city is the capital of Spain?",
      "options": [
        "Barcelona",
        "Valencia",
        "Madrid",
        "Seville"
      ],
      "correctAnswer": 2,
      "explanation": "Madrid is the capital and largest city of Spain, located in the center of the country."
    }
  ]
}
```

### Example 2: Classical Music Quiz

```json
{
  "title": "Classical Composers",
  "description": "Explore the life and works of famous classical composers from Bach to Beethoven.",
  "category": "music",
  "difficulty": "medium",
  "questions": [
    {
      "question": "Who composed the 'Moonlight Sonata'?",
      "options": [
        "Ludwig van Beethoven",
        "Wolfgang Amadeus Mozart",
        "Johann Sebastian Bach",
        "Franz Schubert"
      ],
      "correctAnswer": 0,
      "explanation": "Beethoven composed the 'Moonlight Sonata' (Piano Sonata No. 14) in 1801, dedicating it to his pupil Countess Giulietta Guicciardi."
    }
  ]
}
```

### Example 3: Programming Quiz

```json
{
  "title": "JavaScript Basics",
  "description": "Master fundamental programming concepts and modern JavaScript syntax.",
  "category": "javascript",
  "difficulty": "easy",
  "questions": [
    {
      "question": "What is the correct way to declare a variable in JavaScript that cannot be reassigned?",
      "options": [
        "var myVariable = 10;",
        "let myVariable = 10;",
        "const myVariable = 10;",
        "variable myVariable = 10;"
      ],
      "correctAnswer": 2,
      "explanation": "The 'const' keyword is used to declare variables that cannot be reassigned. 'let' allows reassignment, and 'var' is the older way of declaring variables."
    }
  ]
}
```

## Validation

You can validate your quiz JSON files using:

1. **Online JSON Schema Validators**:
   - [jsonschemavalidator.net](https://www.jsonschemavalidator.net/)
   - Upload your quiz JSON and the `quiz-schema.json` file

2. **Command Line Tools**:
   ```bash
   # Using ajv-cli (Node.js)
   npm install -g ajv-cli
   ajv validate -s quiz-schema.json -d your-quiz.json
   ```

3. **In VS Code**:
   - Add this to the top of your quiz JSON file:
   ```json
   {
     "$schema": "../quiz-schema.json",
     "title": "Your Quiz Title",
     ...
   }
   ```

## Best Practices

### Content
- Write clear, unambiguous questions
- Provide meaningful explanations
- Ensure factual accuracy
- Test your quiz before publishing

### Structure
- Include 5-15 questions per quiz (optimal)
- Balance question difficulty
- Mix question types (definitions, facts, scenarios, examples)
- Keep options concise

### Naming
- Use lowercase filenames with hyphens: `world-geography.json`, `classical-music.json`, `javascript-basics.json`
- Use descriptive, searchable titles
- Choose appropriate categories for your topic

### Quality
- Proofread for spelling and grammar
- Test all questions
- Verify correct answers are marked correctly
- Ensure explanations add value

## Adding Your Quiz to the Application

After creating your quiz JSON file:

1. Save it in the `/quizzes` directory
2. Add the filename to the `quizzes` array in `quizzes/manifest.json`:

```json
{
  "quizzes": [
    "javascript-basics.json",
    "html-css.json",
    "web-security.json",
    "your-new-quiz.json"
  ]
}
```

3. Test your quiz by opening the application in a browser

## Troubleshooting

### Common Errors

**"Invalid quiz structure"**
- Check that all required fields are present
- Verify JSON syntax is valid

**"Missing or invalid correctAnswer"**
- Ensure `correctAnswer` is a number (not a string)
- Verify the index is within the options array bounds

**Quiz doesn't appear in the list**
- Check filename is added to `quizzes` array in `quizzes/manifest.json`
- Verify file is in the `/quizzes` directory
- Check file extension is `.json`

**XSS/Security concerns**
- All user content is automatically escaped
- No HTML is rendered from quiz content
- Special characters are safe to use

## License

Feel free to create and share your own quizzes using this format!
