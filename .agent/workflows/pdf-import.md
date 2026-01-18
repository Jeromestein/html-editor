---
description: How to use the PDF analysis feature to auto-fill FCE reports from uploaded transcripts
---

# PDF Analysis Workflow

Upload a transcript/diploma PDF and let Gemini AI extract data automatically, with integrated Function Calling for grade conversion, GPA calculation, and reference generation.

## Prerequisites

1. **GEMINI_API_KEY** in `.env`
   ```
   GEMINI_API_KEY=your-api-key-here
   ```
   Get your key: https://aistudio.google.com/apikey

2. **English documents only**

## Usage

1. Click **"Import PDF"** in toolbar
2. Upload PDF (drag & drop or click)
3. Wait for AI analysis (~30-60s) (Uses `gemini-3-flash-preview` with Function Calling)
4. Review extracted data (grades, credits, GPA, references, equivalence)
5. Click **"Import Data"**

## Architecture

```
PDF Upload
  ↓
Gemini AI (gemini-3-flash-preview)
  ├── Function Call: lookup_grade_conversion (Supabase)
  ├── Function Call: calculate_gpa (AICE 4.35-point scale)
  └── Function Call: lookup_references (JSON database)
  ↓
Structured Output (Zod validated)
  ↓
User Review → Import to Report
```

## Function Calling Tools

### 1. `lookup_grade_conversion`
Queries Supabase for grade conversion rules by country and grade.

| Parameter | Description |
|-----------|-------------|
| `country` | Country of education (e.g., "China", "Armenia") |
| `grade` | Original grade (e.g., "5", "A", "85") |
| `educationLevel` | "undergraduate" or "graduate" |

**Fallback**: If not found, returns empty and Gemini infers with `AI_INFERRED` marker.

### 2. `calculate_gpa`
Calculates GPA using AICE 4.35-point scale.

| Parameter | Description |
|-----------|-------------|
| `courses` | Array of `{usGrade, usCredits}` |

Returns: `{totalCredits, gpa}`

### 3. `lookup_references`
Looks up APA-format bibliographic references.

| Parameter | Description |
|-----------|-------------|
| `country` | Country of education |
| `degreeLevel` | "undergraduate", "graduate", "secondary" |
| `year` | Year for edition matching |

**Mapping**:
- China → Chinese Universities, China Databases, IAU Handbook
- USA → Best 387 Colleges, Peterson's, AACRAO Guide
- Other → IAU Handbook, Europa World, WHED (global defaults)

## Key Files

| File | Purpose |
|------|---------|
| `lib/gemini/client.ts` | Gemini API client with function calling loop |
| `lib/gemini/schemas.ts` | Zod schemas and ResponseSchema |
| `lib/gemini/tools/` | Function tool implementations |
| `lib/pdf-parser.ts` | Data conversion to SampleData format |
| `app/api/parse-pdf/route.ts` | API endpoint |

## Extracted Fields

- `name`, `dob`, `country` (student info)
- `credentials[]` with courses, grades, GPA
- `documents[]` (diploma/certificate info)
- `references[]` (APA citations)
- `equivalenceStatement` (US degree equivalence with major)

## Error Handling

| Error | Solution |
|-------|----------|
| `NON_ENGLISH_CONTENT` | Use English document |
| `FILE_TOO_LARGE` | Keep under 10MB |
| `AI_ERROR` / 429 | Check API key, wait & retry |
| Function call fails | Returns empty, AI infers, warning collected |

## Warnings

Warnings from function call failures (e.g., "No grade rule found for Armenia") are:
- Logged to backend console (`=== PDF IMPORT WARNINGS ===`)
- Returned to frontend for display
- Merged with local warnings (missing credentials, empty courses)

## Extending

- **Schema**: Edit `lib/gemini/schemas.ts`
- **Tools**: Add new tools in `lib/gemini/tools/`
- **References**: Edit `.agent/skills/aice-fce-reference/resources/references.json`
- **Grade Rules**: Add to Supabase `aet_aice_grade_conversion_rules` table
