---
description: How to use the PDF analysis feature to auto-fill FCE reports from uploaded transcripts
---

# PDF Analysis Workflow

Upload a transcript/diploma PDF and let Gemini AI extract data automatically, with integrated Function Calling for grade conversion, GPA calculation, and reference generation.

## SDK

- **Primary**: `@google/genai` (v1.37+) for main analysis with Function Calling
- **Legacy**: `@google/generative-ai` (v0.24) retained for gradual migration

## Prerequisites

1. **GEMINI_API_KEY** in `.env`
   ```
   GEMINI_API_KEY=your-api-key-here
   ```
   Get your key: https://aistudio.google.com/apikey

2. **Multi-language support**: Documents with mixed languages are supported. If the document contains non-English content, a warning is shown but processing continues as long as meaningful data can be extracted.

## Usage

1. Click **"AI Parse PDF"** in toolbar
2. Upload PDF (drag & drop or click)
3. Watch real-time progress (8-step log-style UI with SSE streaming)
4. Review extracted data (grades, credits, GPA, references, equivalence)
5. Click **"Import Data"**

## Real-time Progress (SSE)

The import process shows 8 steps with live status updates:

| Step | Description |
|------|-------------|
| 1 | Uploading document... |
| 2 | Detecting document type... |
| 3 | Extracting student info... |
| 4 | Extracting courses... |
| 5 | Looking up grade conversion rules... (function call) |
| 6 | Calculating GPA... (function call) |
| 7 | Finding references... (function call) |
| 8 | Generating final report... |

**Status Icons:**
- ✓ Green checkmark = Completed
- ◉ Blue spinner = In progress
- ○ Gray circle = Pending
- ✗ Red X = Error**

## Architecture

```
PDF Upload
  ↓
Stage 1: Gemini AI (gemini-3-flash-preview) + Function Calling
  ├── Function Call: lookup_grade_conversion (Supabase)
  ├── Function Call: calculate_gpa (AICE 4.35-point scale)
  └── Extracts student info, courses, documents
  ↓
Stage 2: Direct Database Lookup (executeReferenceLookup)
  └── Get 3 authoritative references (IAU Handbook, Europa World, WHED)
  ↓
Stage 3: Gemini AI (gemini-3-flash-preview) + Google Search
  └── Search institution websites (APA citations)
  ↓
Merge Results → Structured Output (Zod validated)
  ↓
User Review → Import to Report
```

> **Note:** References are now fetched directly from the database (Stage 2)
> instead of relying on Gemini function calls, ensuring consistent results.
> Stage 3 uses the same model with Google Search for website lookups.

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

**Minimum References**: Automatically fills with global defaults if fewer than 3 references found.

## Stage 2: Database Reference Lookup

After Stage 1 completes, the backend directly calls `executeReferenceLookup` to fetch authoritative references from our JSON database:

- **Source**: `.agent/skills/aice-fce-reference/resources/references.json`
- **Output**: 3 APA-formatted citations (IAU Handbook, Europa World, WHED)
- **Replaces**: Any AI-generated references (ensures consistency)

## Stage 3: Institution Website Search

After Stage 2, a third API call uses `gemini-3-flash-preview` with Google Search to find official websites for each awarding institution.

- **Model**: `gemini-3-flash-preview` with `googleSearch` tool
- **Input**: Unique institution names from extracted credentials
- **Output**: APA-formatted website citations (e.g., `University Name. (n.d.). Home. Retrieved from URL`)
- **Merge**: Citations appended to the `references[]` array

## Key Files

| File | Purpose |
|------|---------|
| `lib/gemini/client.ts` | Gemini API client with progress callback + `searchInstitutionWebsites()` |
| `lib/gemini/schemas.ts` | Zod schemas + `zod-to-json-schema` for Gemini |
| `lib/gemini/tools/` | Function tool implementations (using `@google/genai` Type format) |
| `lib/pdf-parser.ts` | Data conversion to SampleData format |
| `app/api/parse-pdf-stream/route.ts` | **Primary** SSE streaming endpoint |
| `app/api/parse-pdf/route.ts` | Legacy non-streaming endpoint (backup) |
| `components/pdf-upload-dialog.tsx` | UI with log-style progress and AI gradient border |

## Extracted Fields

- `name`, `dob`, `country` (student info)
- `credentials[]` with courses, grades, GPA
- `documents[]` (diploma/certificate info)
- `references[]` (APA citations)
- `equivalenceStatement` (US degree equivalence with major)
- `evaluationNotes` (comprehensive summary → displayed in Notes section)

### Evaluation Notes Content

The `evaluationNotes` field contains:
1. **Credit Conversion Methodology**: How credits were converted to US semester credits
2. **Special considerations**: Institution-specific or program-specific notes
3. **Document notes**: Translation or authenticity considerations
4. **Limitations**: Any caveats about the evaluation

Example:
```
Credit Conversion Methodology
Academic credits earned at Royal Institute of Technology are awarded under the 
higher education system of Sweden. For the purpose of this evaluation, Swedish 
academic credits have been converted to U.S. semester credit hours based on a 
review of total instructional time, academic level, and the presence of laboratory 
or practical components.
```

## Output Format Rules

**Institution Name:**
```
English Name (Original Name in Native Language)
```
Example: `Royal Institute of Technology (Kungliga Tekniska högskolan, KTH)`

**Program Name:**
```
English Name (Original Name in Native Language)
```
Example: `Degree of Master of Science in Engineering (Civilingenjörsexamen) in Electrical Engineering`

**Standard Program Length:**
Use English words instead of numbers.
- ✓ `Four years`, `Four and a half years`, `Five years`
- ✗ `4 years`, `4.5 years`, `5 years`

These formats apply to:
- `awardingInstitution` in credentials
- `issuedBy` in documents
- `program` in credentials
- `standardProgramLength` in credentials

## Error Handling

| Error | Solution |
|-------|----------|
| `FILE_TOO_LARGE` | Keep under 10MB |
| `AI_ERROR` / 429 | Check API key, wait & retry |
| Function call fails | Returns empty, AI infers, warning collected |
| Non-English content | Warning added, but processing continues |

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
