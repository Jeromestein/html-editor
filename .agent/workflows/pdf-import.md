---
description: How to use the PDF analysis feature to auto-fill FCE reports from uploaded transcripts
---

# PDF Analysis Workflow

Upload a transcript/diploma PDF and let Gemini AI extract data automatically using a **multi-stage architecture** for improved accuracy and data completeness.

## Multi-Stage Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         PDF Upload                                   │
└───────────────────────────────┬─────────────────────────────────────┘
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STAGE 1: Pure PDF Parsing (gemini-3-flash-preview)                 │
│  ├── NO tools - focus on data completeness                         │
│  ├── Extract ALL courses (40-60+ courses per credential)           │
│  ├── Extract student info, documents, credentials                   │
│  └── Output: RawCourseSchema (credits, grade, level only)           │
└───────────────────────────────┬─────────────────────────────────────┘
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STAGE 2: Data Processing (gemini-3-flash-preview + Function Calls) │
│  ├── Tool: lookup_grade_conversion_batch (Supabase)                 │
│  ├── Tool: lookup_references                                        │
│  ├── Convert to US grades/credits via Gemini + tool results         │
│  ├── Generate gradeConversion table, evaluationNotes                │
│  └── Output: TranscriptResponseSchema (usGrade, usCredits)          │
└───────────────────────────────┬─────────────────────────────────────┘
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STAGE 2.5: Direct Database Lookup (executeReferenceLookup)         │
│  └── Merge authoritative references (IAU Handbook, Europa World)    │
└───────────────────────────────┬─────────────────────────────────────┘
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STAGE 3: Website Search (gemini-3-flash-preview + Google Search)   │
│  └── Search institution websites, append APA citations              │
└───────────────────────────────┬─────────────────────────────────────┘
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│  GPA Calculation (lib/gpa.ts - LOCAL, not Gemini)                   │
│  └── Calculate using AICE 4.35-point scale                          │
└───────────────────────────────┬─────────────────────────────────────┘
                                ▼
                      User Review → Import to Report
```

## SDK

- **Primary**: `@google/genai` (v1.37+)

## Prerequisites

1. **GEMINI_API_KEY** in `.env`
2. **Multi-language support**: Documents with mixed languages are supported

## Usage

1. Click **"AI Parse PDF"** in toolbar
2. Upload PDF (drag & drop or click)
3. Watch real-time progress (8-step log-style UI with SSE streaming)
4. Review extracted data
5. Click **"Import Data"**

## Real-time Progress (SSE)

| Step | Phase | Description |
|------|-------|-------------|
| 1 | `uploading` | Uploading document... |
| 2 | `parsing_pdf` | Analyzing document structure... (Stage 1) |
| 3 | `extracting_courses` | Extracting courses... (Stage 1) |
| 4 | `converting_grades` | Looking up grade conversion rules... (Stage 2) |
| 5 | `finding_refs` | Finding references... (Stage 2) |
| 6 | `calculating_gpa` | Calculating GPA... (Local) |
| 7 | `searching_websites` | Searching institution websites... (Stage 3) |
| 8 | `complete` | Analysis complete! |

## Function Calling Tools

### 1. `lookup_grade_conversion_batch`
**Batch lookup** - queries Supabase for multiple grades at once.

| Parameter | Description |
|-----------|-------------|
| `country` | Country of education |
| `grades` | Array of unique original grades (e.g., `["85", "92", "Pass"]`) |
| `educationLevel` | "undergraduate" or "graduate" |

### 2. `lookup_references`
Looks up APA-format bibliographic references.

| Parameter | Description |
|-----------|-------------|
| `country` | Country of education |

> **Note**: GPA calculation is now done locally via `lib/gpa.ts`, not as a Gemini tool.

## Key Files

| File | Purpose |
|------|---------|
| `lib/gemini/client.ts` | Multi-stage Gemini client |
| `lib/gemini/schemas.ts` | Stage 1 & Stage 2 Zod schemas |
| `lib/gemini/tools/` | Function tool implementations |
| `lib/gpa.ts` | Local GPA calculation |
| `lib/pdf-parser.ts` | Data conversion to SampleData format |
| `app/api/parse-pdf-stream/route.ts` | SSE streaming endpoint |
| `components/pdf-upload-dialog.tsx` | UI with progress display |

## Schemas

### Stage 1: `ParsedPdfResponseSchema`
Raw extraction - no grade conversion:
- `RawCourseSchema`: `year`, `name`, `credits`, `grade`, `level`
- No `usGrade`, `usCredits`, `conversionSource`
- No `references[]`, `gradeConversion[]`

### Stage 2: `TranscriptResponseSchema`
Final output with conversions:
- `CourseSchema`: includes `usGrade`, `usCredits`, `conversionSource`
- `gradeConversion[]`, `references[]`, `evaluationNotes`

## Error Handling

| Error | Solution |
|-------|----------|
| `FILE_TOO_LARGE` | Keep under 10MB |
| `AI_ERROR` / 429 | Check API key, wait & retry |
| Function call fails | AI infers, warning collected |
| Non-English content | Processing continues with warning |

## Extending

- **Schema**: Edit `lib/gemini/schemas.ts`
- **Tools**: Add new tools in `lib/gemini/tools/`
- **References**: Edit `.agent/skills/aice-fce-reference/resources/references.json`
- **Grade Rules**: Add to Supabase `aet_aice_grade_conversion_rules` table
