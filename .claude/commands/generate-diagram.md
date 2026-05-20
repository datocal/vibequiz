---
description: Generate a Mermaid study diagram from a content file (PDF, doc, markdown, etc.) and export it as PNG and SVG
---

Generate a visual study diagram from a source file using Mermaid. The diagram is exported as both `.mmd` (source), `.png`, and `.svg` into `./diagrams/<category>/`.

## Usage

```
/generate-diagram <category> [type] @content
```

**Parameters:**
- `<category>` (required): subfolder under `diagrams/`, e.g. "temas", "normativa"
- `[type]` (optional): diagram type — `flowchart` (default) or `mindmap`
- `@content`: file reference (PDF, .doc, .docx, .md, or plain text)

**Examples:**
```
/generate-diagram temas @"Tema 12 2025.md"
/generate-diagram normativa flowchart @decreto-155.pdf
/generate-diagram temas mindmap @"Tema 5.pdf"
```

---

## Step 0: Preflight

Check `mmdc` is available:
```
mmdc --version
```
If it fails, stop and say: "`mmdc` is not installed. Run: `npm install -g @mermaid-js/mermaid-cli`"

If source is PDF/doc/docx, also verify `markitdown`:
```
markitdown --version
```
If it fails, stop and say: "`markitdown` is not installed. Run: `pip install 'markitdown[all]'`"

## Step 1: Convert and read source

If the source is a PDF, `.doc`, or `.docx`, convert it:
```
markitdown input.pdf -o input.md
```
Read the `.md` output as source content. Note the temp path — delete it at the end.

If already `.md` or plain text, read it directly.

## Step 2: Parse parameters and confirm

1. Extract `category` and `type` (default: `flowchart`) from the arguments
2. Derive `slug` from the source filename: `Tema 12 2025.md` → `tema-12` (lowercase, spaces and years stripped to a clean kebab-case name)
3. Confirm with the user:
   ```
   File:      [filename]
   Category:  [category]
   Slug:      [slug]
   Type:      [flowchart | mindmap]
   Output:    diagrams/[category]/[slug].{mmd,png,svg}
   ```

## Step 3: Analyse the content

Read the source and identify:
- Top-level sections (H1/H2 headings or numbered sections)
- Key concepts, definitions, and relationships within each section
- Legal references or article numbers (if present)
- Hierarchical dependencies between concepts

## Step 4: Generate the Mermaid diagram

### If type = `flowchart` (default)

Create a `flowchart TD` diagram structured for study:

```
flowchart TD
    subgraph SECTION1["Section name"]
        ...nodes...
    end
    subgraph SECTION2["Section name"]
        ...nodes...
    end
    SECTION1 --> SECTION2
```

**Rules for flowcharts:**
- Use `subgraph` blocks for each major section
- Use arrows (`-->`) to show logical flow or dependency
- Label arrows with key relationships: `-->|"Art. 6 D155"| NODE`
- Node text: short phrase + key detail (max 2 lines, use `\n`)
- Use `&` to fan-out: `A & B --> C` for convergence
- Group legal references close to the node they apply to

### If type = `mindmap`

Create a `mindmap` diagram:

```
mindmap
  root((Title))
    Section1
      Concept A
      Concept B
    Section2
      ...
```

**Rules for mindmaps:**
- Root node uses double parentheses: `root((Short Title))`
- Max 4 levels deep
- Leaf nodes: short phrases only (no multi-line)
- Group sibling concepts logically, not just in document order

### General diagram rules

- Nodes must contain content relevant for studying: definitions, article numbers, key distinctions
- Prefer specificity over completeness — capture the 20% that answers 80% of exam questions
- Highlight relationships that are easy to confuse
- Keep node labels concise (aim for ≤ 8 words per node)
- Do NOT include bibliography or conclusion sections in the diagram

## Step 5: Save the `.mmd` source file

Create the output directory if it doesn't exist:
```powershell
New-Item -ItemType Directory -Force -Path "diagrams/[category]"
```

Write the Mermaid source to:
```
diagrams/[category]/[slug].mmd
```

## Step 6: Render PNG and SVG

Run both renders using the shared style config and CSS:
```
mmdc -i "diagrams/[category]/[slug].mmd" -o "diagrams/[category]/[slug].png" -w 2400 --backgroundColor white --configFile "diagrams/mmdc-config-app.json" --cssFile "diagrams/mmdc-style.css"
mmdc -i "diagrams/[category]/[slug].mmd" -o "diagrams/[category]/[slug].svg" --backgroundColor white --configFile "diagrams/mmdc-config-app.json" --cssFile "diagrams/mmdc-style.css"
```

The style files live at:
- `diagrams/mmdc-config-app.json` — color theme (purple/blue, high contrast on all node types)
- `diagrams/mmdc-style.css` — rounded corners + dark edge label text

Verify both output files exist. If a render fails, show the error and stop.

## Step 7: Clean up

If a temporary `.md` was created from a PDF/doc conversion, delete it:
```powershell
Remove-Item [converted-temp-file].md
```

## Step 8: Present results

Report:
```
Diagram generated:
  Source:  diagrams/[category]/[slug].mmd
  PNG:     diagrams/[category]/[slug].png  (open in any image viewer)
  SVG:     diagrams/[category]/[slug].svg  (open in browser for zoom)

Sections covered: [list top-level sections]
```

Show the Mermaid source in a fenced code block so the user can review and request adjustments.

---

## Error Handling

- If `mmdc` fails with a syntax error, fix the Mermaid source (check for unescaped quotes, invalid node IDs, or unsupported characters) and retry
- Node IDs must be alphanumeric + underscores — replace spaces and accented characters: `Educación` → `Educacion`
- If the document is very long (>5000 words), focus on headings and first paragraph of each section; do not try to capture every detail
- If `--backgroundColor` flag causes issues on older mmdc versions, omit it
