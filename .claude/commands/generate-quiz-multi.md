---
description: Generate quizzes from multiple files in parallel using background agents
---

You are the main orchestrator for parallel quiz generation. Sub-agents write part files only — all merging, cleanup, and manifest updates happen here in the main agent.

## Usage

```
/generate-quiz-multi <category> [difficulty] [num_questions] @file1 @file2 ...
```

Or with a folder pattern:
```
/generate-quiz-multi temas hard (all PDFs in ./contenidos)
```

**Parameters:**
- `<category>` (required): e.g., "temas", "normativa", "protocolos"
- `[difficulty]` (optional): "easy", "medium", or "hard" (default: "hard")
- `[num_questions]` (optional): questions per file (default: 200)

For a **single file**, use `/generate-quiz` instead.

---

## Phase 1 — Preflight

Verify `markitdown` is installed:
```
markitdown --version
```
If it fails, stop: "markitdown is not installed. Run: `pip install 'markitdown[all]'`"

---

## Phase 2 — Discover and convert source files

**If folder pattern** (e.g., "all PDFs in ./contenidos"):
- Use Glob to find all matching files
- Confirm the list with the user before proceeding

**Derive a slug** for each file from its filename:
- `tema-4-trastornos.pdf` → slug: `tema-4-trastornos`
- `decreto-229-2011.docx` → slug: `decreto-229-2011`

**For each PDF, `.doc`, or `.docx`:**
- Run `markitdown [file] -o [file-without-ext].md`
- Record the mapping: original path → `.md` path

---

## Phase 3 — Spawn one background agent per file

For each file, spawn a **background agent** with the self-contained prompt below. Fill in ALL bracketed values before spawning. Do NOT tell the agent to read this command file.

---

**Sub-agent prompt template** (copy verbatim, substituting values):

```
You are generating part files for a quiz in the vibequiz project.
Your ONLY job is to write the part JSON files. Do NOT merge, do NOT run shell commands, do NOT update the manifest.

## Parameters
- Source file: [path to .md file]
- Category: [category]
- Difficulty: [difficulty]
- Questions: [num_questions]
- Slug: [slug]

## Step 1 — Read source and schema
1. Read the source .md file.
2. Read quiz-schema.json and QUIZ-FORMAT.md.
3. Extract the quiz title (first H1 or prominent heading; fall back to slug).

## Step 2 — Generate questions in batches and write part files
Split [num_questions] into batches of up to 50. For each batch:
1. Generate up to 50 questions following the quality rules below.
2. Write the batch to quizzes/temp/[slug]-part1.json, [slug]-part2.json, etc.
   Each part file must be a complete valid quiz JSON with the same title/description/category/difficulty.
   Use only the Write tool — no shell commands.

## Step 3 — Finish
- Do NOT merge the parts.
- Do NOT run any shell or Python commands.
- Do NOT write to quizzes/manifest.json.
- End your response with exactly this line:
  PARTS: [slug] [N] parts [total] questions

## Question quality rules

Creating options (CRITICAL):
- Provide exactly 4 options: 1 correct + 3 plausible distractors
- NEVER use "solo", "únicamente", "siempre", "nunca", "nada", "todo"
- NEVER make one option much longer/shorter than others
- NEVER include obviously absurd or unrelated options
- NEVER use negatives in only one option
- USE specific data close to the correct answer (e.g., 35-50 dB vs 40-60 dB vs 25-45 dB)
- ALL options similar length and structure
- Distractors from the same topic area as the correct answer
- Include common misconceptions or partial truths

Difficulty:
- easy: direct facts, basic definitions, recognition
- medium: application, comparisons, cause and effect
- hard: analysis, edge cases, specific numbers/ranges, distinguishing similar concepts

Explanations: explain WHY the correct answer is right; clarify why wrong answers are wrong; 10-1000 characters.

## JSON format (every part file)
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
CRITICAL: correctAnswer must be a NUMBER (0-3), never a string.
```

---

## Phase 4 — Wait for all agents

Background agents complete asynchronously — you will receive a notification when each finishes. Track: you spawned N agents. After all N notifications arrive:

1. Parse each result for the `PARTS: [slug] [N] parts [total] questions` line.
2. If any agent failed, re-run it before proceeding — do not merge partial results.

---

## Phase 5 — Merge each slug (main agent only)

For each slug, write and run a merge script. Repeat for every slug before moving on.

Write to `quizzes/temp/[slug]-merge.py` (substitute `[slug]` and `[category]`):

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

Verify the printed count matches [num_questions]. Delete the script: `Remove-Item quizzes/temp/[slug]-merge.py`

---

## Phase 6 — Clean up

```powershell
# Delete all temp part files
Remove-Item quizzes/temp/*-part*.json
# Delete temporary .md conversion files (one per converted source)
Remove-Item [file-without-ext].md
```

---

## Phase 7 — Update manifest

Do a **single** read-modify-write of `quizzes/manifest.json`:
- Read the current manifest
- Add all new `[slug].json` filenames to their respective category `quizzes` arrays
- Write the manifest once

---

## Phase 8 — Summary

Report for each quiz: output path, question count, category, any failures.
