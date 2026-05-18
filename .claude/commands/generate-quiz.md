---
description: Generate a quiz from a single file (PDF, doc, markdown, etc.)
---

You are an expert quiz generation assistant. Generate a high-quality educational quiz from a single source file. For multiple files in parallel, use `/generate-quiz-multi`.

## Usage

```
/generate-quiz <category> [difficulty] [num_questions] @content
```

**Parameters:**
- `<category>` (required): e.g., "temas", "normativa", "protocolos"
- `[difficulty]` (optional): "easy", "medium", or "hard" (default: "hard")
- `[num_questions]` (optional): number of questions (default: 200)
- `@content`: file reference

**Examples:**
```
/generate-quiz temas @tema4.pdf
/generate-quiz normativa medium @decreto.pdf
/generate-quiz protocolos easy 50 @protocolo-urgencias.pdf
```

---

## Step 0: Preflight

Verify `markitdown` is installed:
```
markitdown --version
```
If it fails, stop: "markitdown is not installed. Run: `pip install 'markitdown[all]'`"

## Step 1: Convert and read source

If the source is a PDF, `.doc`, or `.docx`, convert it first:
```
markitdown input.pdf -o input.md
```
Read the `.md` file as source content. Note the temp path — you will delete it at the end.

If already `.md` or plain text, read it directly.

## Step 2: Parse and confirm

1. Extract category, difficulty (default: "hard"), num_questions (default: 200)
2. Derive the slug from the filename: `tema-4-trastornos.pdf` → `tema-4-trastornos`
3. Extract quiz title from the document (first H1 or prominent heading; fall back to slug)
4. Read `quiz-schema.json` and `QUIZ-FORMAT.md`
5. Confirm parameters with the user:
   ```
   File:       [filename]
   Category:   [category]
   Title:      [title]
   Difficulty: [difficulty]
   Questions:  [num_questions]
   Batches:    [ceil(num_questions / 50)]
   ```

## Step 3: Generate questions in batches

Split [num_questions] into batches of up to 50. For each batch:
1. Generate up to 50 questions following the quality rules below.
2. Write the batch to `quizzes/temp/[slug]-part1.json`, `[slug]-part2.json`, etc.
   Each part file must be a complete valid quiz JSON with the same title/description/category/difficulty.

## Step 4: Merge with a Python script

Write the following script to `quizzes/temp/[slug]-merge.py` (replace `[slug]` and `[category]` with actual values):

```python
import json, glob, os
parts = sorted(glob.glob("quizzes/temp/[slug]-part*.json"))
questions = []
meta = None
for p in parts:
    with open(p, encoding="utf-8") as f:
        d = json.load(f)
    if meta is None:
        meta = {k: v for k, v in d.items() if k != "questions"}
    questions.extend(d["questions"])
meta["questions"] = questions
os.makedirs("quizzes/[category]", exist_ok=True)
with open("quizzes/[category]/[slug].json", "w", encoding="utf-8") as f:
    json.dump(meta, f, ensure_ascii=False, indent=2)
print(f"Merged {len(questions)} questions into quizzes/[category]/[slug].json")
```

Run: `python quizzes/temp/[slug]-merge.py`

Verify the printed count matches [num_questions].

## Step 5: Clean up

```powershell
Remove-Item quizzes/temp/[slug]-part*.json
Remove-Item quizzes/temp/[slug]-merge.py
# If you converted a PDF/doc:
Remove-Item [file-without-ext].md
```

## Step 6: Update manifest

- Read `quizzes/manifest.json`
- Add `[slug].json` to the category's `quizzes` array
- Write the manifest back

## Step 7: Present results

1. Success message with full output path
2. Stats: question count, difficulty, category, number of batches
3. 2–3 sample questions from different sections

---

## Question Quality Rules

**Creating options (CRITICAL):**
- Provide exactly 4 options: 1 correct + 3 plausible distractors
- ❌ NEVER use "solo", "únicamente", "siempre", "nunca", "nada", "todo"
- ❌ NEVER make one option much longer/shorter than others
- ❌ NEVER include obviously absurd or unrelated options
- ❌ NEVER use negatives in only one option ("No se puede…", "Es imposible…")
- ✅ Use specific data close to the correct answer (e.g., 35-50 dB vs 40-60 dB vs 25-45 dB)
- ✅ All options similar length and structure
- ✅ Distractors from the same topic area as the correct answer
- ✅ Include common misconceptions or partial truths
- ✅ Use related terms that could be confused

**Difficulty calibration:**
- easy: direct facts, basic definitions, recognition
- medium: application, comparisons, cause and effect
- hard: analysis, edge cases, specific numbers/ranges, distinguishing similar concepts, multi-step reasoning

**Tricky questions (hard/medium):**
1. All options from same category/topic
2. Similar wording and length
3. Specific data that's close but different (e.g., "25-30" vs "30-35" vs "35-40" vs "40-45")
4. Distractors are real concepts from the content, just not the answer to this question

**Explanations:** explain WHY the correct answer is right; clarify why wrong answers are wrong; 10-1000 characters.

---

## JSON Format

```json
{
  "title": "string",
  "description": "string (10-500 chars)",
  "category": "lowercase-with-hyphens",
  "difficulty": "easy|medium|hard",
  "questions": [
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correctAnswer": 0,
      "explanation": "string"
    }
  ]
}
```

CRITICAL: `correctAnswer` must be a NUMBER (0-3), never a string.

---

## Quality Checklist

Before finishing, verify:
- [ ] All questions answerable from source content
- [ ] Distractors plausible but clearly incorrect
- [ ] No options use "solo", "únicamente", "siempre", "nunca"
- [ ] All 4 options have similar length and structure
- [ ] Cannot answer by elimination — need to know the content
- [ ] Distractors use specific data/terms from the same topic area
- [ ] Explanations add educational value
- [ ] JSON is valid and schema-compliant
- [ ] `correctAnswer` is a NUMBER for all questions

---

## Error Handling

- If a batch fails, regenerate just that batch
- If merge produces wrong count, re-read parts and recount
- Ensure `correctAnswer` uses numbers, not strings
- Validate against quiz-schema.json before updating the manifest
