---
description: Generate a quiz from provided content (PDF, webpage, article, etc.)
---

You are an expert quiz generation assistant. Your task is to create a high-quality, educational quiz in JSON format from source content provided by the user.

## Usage

```
/generate-quiz <category> [difficulty] [num_questions] @content
```

**Parameters:**
- `<category>` (required): The category for the quiz (e.g., "temas", "normativa", "protocolos")
- `[difficulty]` (optional): Difficulty level - "easy", "medium", or "hard" (default: "hard")
- `[num_questions]` (optional): Number of questions to generate (default: 200)
- `@content` (required): The source content (file reference or pasted content)

**Examples:**
```
/generate-quiz temas @tema4.pdf
/generate-quiz normativa medium @decreto.pdf
/generate-quiz protocolos easy 50 @protocolo-urgencias.pdf
```

## Step 1: Parse Command and Extract Information

1. **Parse parameters** from the user message:
   - Extract category (first parameter after command, required)
   - Extract difficulty (default: "hard" if not specified)
   - Extract number of questions (default: 200 if not specified)
   - Get source content from file or pasted content

2. **Extract title from content automatically**:
   - Look for the document title in the first few lines/pages
   - Check for headers, PDF metadata, or prominent headings
   - Common patterns: "TEMA X:", "Decreto", "Orden", first H1/title
   - If no clear title found, derive from filename (e.g., "tema4.pdf" → "Tema 4")
   - Clean and format the title appropriately

3. **Show extracted parameters** to user for confirmation:
   ```
   Detected parameters:
   - Category: [category]
   - Title: [extracted title]
   - Difficulty: [difficulty]
   - Questions: [num_questions]

   Proceeding with quiz generation...
   ```

**Note on Large Quizzes (>50 questions):**
Since the default is 200 questions, you will typically need to:
1. Split the generation into multiple batches of maximum 50 questions each
2. Generate separate quiz files for each batch
3. Merge them using jq into a single final quiz file
This approach ensures better quality and avoids context limitations.

## Step 2: Read Schema and Guidelines

Before generating, read these files to understand the format:
- Read `quiz-schema.json` - For structure validation rules
- Read `QUIZ-FORMAT.md` - For examples and best practices

## Step 3: Generate the Quiz

Based on the source content, create questions following these guidelines:

### Question Quality Standards

**Good Questions:**
- Test understanding of key concepts, not trivial memorization
- Have one definitively correct answer
- Are clearly worded without ambiguity
- Cover different aspects of the content
- Match the specified difficulty level

**Creating Options (CRITICAL - READ CAREFULLY):**
- Provide exactly 4 options per question
- 1 correct answer
- 3 plausible distractors that are genuinely challenging

**AVOID OBVIOUS WRONG ANSWERS:**
- ❌ NEVER use words like "solo", "únicamente", "siempre", "nunca", "nada", "todo"
- ❌ NEVER make one option much longer/shorter than others
- ❌ NEVER include obviously absurd or unrelated options
- ❌ NEVER use negatives in only one option ("No se puede...", "Es imposible...")

**CREATE REALISTIC DISTRACTORS:**
- ✅ Use specific data that is close to the correct answer (e.g., 35-50 dB vs 40-60 dB vs 25-45 dB)
- ✅ All options should be similar length and structure
- ✅ Use concepts from the same topic area (e.g., different types of hearing aids, not random unrelated items)
- ✅ Include common misconceptions or partial truths
- ✅ Use related terms that could be confused (e.g., "conductiva" vs "neurosensorial" vs "mixta")
- ✅ Make the user need to know the specific content, not just eliminate obvious wrong answers

**Writing Explanations:**
- Explain WHY the correct answer is right
- Reference the source material when possible
- Clarify why common wrong answers are incorrect
- Add context that enhances learning
- Keep explanations educational and concise (10-1000 characters)

### Difficulty Calibration

**Easy:**
- Direct facts from the content
- Basic definitions and concepts
- Recognition-based questions

**Medium:**
- Application of concepts
- Comparisons and relationships
- Understanding cause and effect

**Hard:**
- Analysis and synthesis
- Edge cases and nuances
- Deep conceptual understanding
- Multi-step reasoning
- Specific data/numbers from the content (ranges, percentages, exact terms)
- Distinguishing between similar concepts
- Require knowing the exact wording/details from the source

### Creating "A Pillar" (Tricky) Questions

For hard/medium quizzes, make questions that require real knowledge:

**Key Principles:**
1. All options should be from the same category/topic
2. Use similar wording and length for all options
3. Include specific data that's close but different
4. Make distractors be real concepts from the content, just incorrect for this question

**Example patterns:**
- Numbers/ranges: "25-30" vs "30-35" vs "35-40" vs "40-45"
- Similar terms: "Type A", "Type B", "Type C", "Type D" (all real types from content)
- Sequential items: "First step", "Second step", "Third step" (asking which comes when)
- Close definitions: All describe similar concepts, but only one is correct for the specific question

## Step 4: Create the JSON File(s)

### For Regular Quizzes (≤50 questions)

Generate valid JSON matching this structure:

```json
{
  "title": "Engaging, descriptive title",
  "description": "Clear description of what the quiz tests (10-500 chars)",
  "category": "lowercase-with-hyphens",
  "difficulty": "easy|medium|hard",
  "questions": [
    {
      "question": "Clear, specific question?",
      "options": [
        "Option 1",
        "Option 2",
        "Option 3",
        "Option 4"
      ],
      "correctAnswer": 0,
      "explanation": "Educational explanation referencing source material"
    }
  ]
}
```

**CRITICAL VALIDATION:**
- ✅ `correctAnswer` MUST be a NUMBER (0-3), NOT a string
- ✅ `options` must have 2-6 items (recommend 4)
- ✅ `category` must be lowercase with hyphens only
- ✅ `difficulty` must be exactly: "easy", "medium", or "hard"
- ✅ All strings must meet min/max length requirements
- ✅ `explanation` is optional but STRONGLY recommended

### For Large Quizzes (>50 questions)

When the user requests more than 50 questions, follow this process:

**Step 4a: Split Generation**
1. Calculate number of batches needed (e.g., 120 questions = 3 batches of 40 questions)
2. Divide the source content into logical sections if possible
3. Generate separate quiz files for each batch:
   - `quizzes/temp/[quiz-name]-part1.json` (questions 1-50)
   - `quizzes/temp/[quiz-name]-part2.json` (questions 51-100)
   - `quizzes/temp/[quiz-name]-part3.json` (questions 101-...)

**Step 4b: Generate Each Batch**
For each batch:
1. Create a complete valid quiz JSON with the same metadata (title, description, category, difficulty)
2. Generate up to 50 questions from the corresponding section of content
3. Save to the temporary part file
4. Inform the user of progress

**Step 4c: Merge with jq**
Once all parts are generated, merge them using jq:

```bash
# Merge all parts into a single quiz file
jq -s '
  {
    title: .[0].title,
    description: .[0].description,
    category: .[0].category,
    difficulty: .[0].difficulty,
    questions: (map(.questions) | add)
  }
' quizzes/temp/[quiz-name]-part*.json > quizzes/[category]/[quiz-name].json

# Clean up temporary files
rm quizzes/temp/[quiz-name]-part*.json
```

**Step 4d: Verify Merged Result**
1. Check the merged file has the correct total number of questions
2. Validate the JSON structure
3. Ensure no duplicate questions
4. Confirm all questions are properly formatted

## Step 5: Save and Register

1. **Generate filename**: Convert title to lowercase-with-hyphens format
   - Example: "World Geography" → `world-geography.json`

2. **Save the quiz**:
   - For regular quizzes: Write to `quizzes/[category]/[filename].json`
   - For large quizzes: Use the merged file from Step 4c

3. **Update manifest**:
   - Read `quizzes/manifest.json`
   - Find the appropriate category in the `categories` array
   - Add the new filename to that category's `quizzes` array
   - Write back the updated manifest

4. **Validate**: Ensure the JSON is valid and follows the schema
   - For large quizzes, verify the total question count matches expectations

## Step 6: Present Results

Show the user:

1. **Success message** with the filename
2. **Generation method**:
   - For regular quizzes: "Generated in single batch"
   - For large quizzes: "Generated in X batches and merged successfully"
3. **Sample questions** (show 2-3 questions as preview from different parts if merged)
4. **Stats**:
   - Total number of questions generated
   - Difficulty level
   - Category used
   - Number of batches (if applicable)
5. **Testing instructions**:
   ```
   To test your quiz:
   1. Start local server: python -m http.server 8000
   2. Open browser: http://localhost:8000
   3. Find your quiz in the list or try Random Party mode
   ```

## Quality Checklist

Before finalizing, verify:

- [ ] All questions are answerable from the source content
- [ ] Distractors are plausible but clearly incorrect
- [ ] **NO options use words like "solo", "únicamente", "siempre", "nunca"**
- [ ] **All 4 options have similar length and structure**
- [ ] **Cannot answer by elimination - need to know the content**
- [ ] **Distractors use specific data/terms from the same topic area**
- [ ] Explanations add educational value
- [ ] No ambiguous or trick questions
- [ ] Proper grammar and spelling throughout
- [ ] JSON is valid and schema-compliant
- [ ] correctAnswer is a NUMBER for all questions
- [ ] Category matches the content topic
- [ ] Difficulty matches target audience

## Example Interaction

**Example 1: Simple usage with defaults**

**User**: `/generate-quiz temas @tema4.pdf`

**Assistant**:
```
Detected parameters:
- Category: temas
- Title: Tema 4: Trastornos del Lenguaje (extracted from PDF)
- Difficulty: hard (default)
- Questions: 200 (default)

Proceeding with quiz generation...
```

[Reads schema files]
[Generates 4 batches of 50 questions each]
[Generates part 1 - saves to quizzes/temp/tema-4-trastornos-del-lenguaje-part1.json]
[Generates part 2 - saves to quizzes/temp/tema-4-trastornos-del-lenguaje-part2.json]
[Generates part 3 - saves to quizzes/temp/tema-4-trastornos-del-lenguaje-part3.json]
[Generates part 4 - saves to quizzes/temp/tema-4-trastornos-del-lenguaje-part4.json]
[Merges all parts using jq]
[Saves merged file to quizzes/temas/tema-4-trastornos-del-lenguaje.json]
[Cleans up temporary files]
[Updates manifest]

Great! I've created your quiz: `quizzes/temas/tema-4-trastornos-del-lenguaje.json`

**Sample Questions:**
1. ¿Cuál es la característica principal de la afasia de Broca?
2. ¿Qué estructura cerebral se ve afectada en la disfasia?

**Quiz Stats:**
- Questions: 200
- Difficulty: hard
- Category: temas
- Generation: 4 batches merged

**Test your quiz:**
```bash
python -m http.server 8000
# Visit http://localhost:8000
```

**Example 2: Custom difficulty and questions**

**User**: `/generate-quiz normativa medium 100 @decreto-229-2011.pdf`

**Assistant**:
```
Detected parameters:
- Category: normativa
- Title: Decreto 229/2011 (extracted from PDF)
- Difficulty: medium
- Questions: 100

Proceeding with quiz generation...
```

[Generates 2 batches of 50 questions each]
[Merges and saves to quizzes/normativa/decreto-229-2011.json]
[Updates manifest]

Great! I've created your quiz: `quizzes/normativa/decreto-229-2011.json`

**Quiz Stats:**
- Questions: 100
- Difficulty: medium
- Category: normativa
- Generation: 2 batches merged

## Advanced Options

**Overriding Defaults:**
- Specify difficulty: `/generate-quiz temas easy @content`
- Specify question count: `/generate-quiz temas 50 @content`
- Specify both: `/generate-quiz temas medium 150 @content`

**Additional Customization:**
If the user wants further customization, they can also request:

- **Focus on specific sections**: "Generate questions only about chapters 3-5"
- **Question type emphasis**: "More application questions, fewer definitions"
- **Multiple quizzes**: "Create beginner and advanced versions"
- **Refinement**: User can ask to regenerate with different difficulty or focus
- **Large quiz batching**: For very large content, split into logical sections (chapters, topics) when generating batches
- **Custom batch size**: User can request different batch sizes (e.g., 30 questions per batch instead of 50)
- **Manual title**: If title extraction fails or is incorrect, user can specify: "Use title 'Custom Title' instead"

## Error Handling

If generation fails or produces invalid JSON:
1. Check the source content is clear and focused
2. Verify all required fields are present
3. Ensure correctAnswer uses numbers, not strings
4. Validate against schema requirements
5. Offer to regenerate with corrections

For large quizzes specifically:
1. If a batch fails, regenerate just that batch (don't restart all batches)
2. If merge fails, check that all part files exist and have valid JSON
3. Ensure the temp directory exists before generating parts
4. Verify jq is available on the system
5. Check that all parts have consistent metadata (title, category, difficulty)

## Important Reminders

- **Always read the schema files first** - Don't rely on memory
- **Validate correctAnswer is a NUMBER** - Most common error
- **Create realistic distractors** - Not obviously wrong options
- **Write educational explanations** - They add significant value
- **Update the manifest** - Quiz won't appear without this
- **Test the output** - Verify JSON is valid before finishing
- **For large quizzes (>50 questions)**: Always use the batch + merge approach
- **Create temp directory if needed**: `mkdir -p quizzes/temp` before generating batches
- **Clean up after merging**: Remove all part files to avoid clutter
- **Verify question count**: After merging, confirm total matches expected number
