---
description: How to use the PDF analysis feature to auto-fill FCE reports from uploaded transcripts
---

# PDF Analysis Workflow

Upload a transcript/diploma PDF and let Gemini AI extract data automatically, with integrated grade conversion, GPA calculation, and reference generation.

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
3. Wait for AI analysis (~5-10s) (Uses `gemini-3-flash-preview`)
4. Review extracted data (grades, credits, GPA)
5. Click **"Import Data"**

## Pipeline Architecture

```
PDF Upload
  ↓
Gemini AI (extract raw data)
  ↓
Grade Conversion (skill: aice-fce-grade-conversion)
  ↓
GPA Calculation (skill: aice-gpa-calculation)
  ↓
Reference Lookup (skill: aice-fce-reference)
  ↓
User Review → Import to Report
```

## Integrated Skills

### 1. Grade Conversion (`aice-fce-grade-conversion`)

Converts international grades to US equivalents.

| Step | Action |
|------|--------|
| 1 | Query `aet_aice_grade_conversion_rules` by country + grade |
| 2 | If found → use stored rule |
| 3 | If not found → AI inference with `(AI_INFERRED)` marker |
| 4 | On save → store AI-inferred rules for future use |

**Credit Conversion:**
- ECTS (Europe): 60 ECTS = 30 US Credits
- CATS (UK): 120 CATS = 30 US Credits
- China: Normalize to 30/year

### 2. GPA Calculation (`aice-gpa-calculation`)

Calculates GPA using AICE 4.35-point scale.

```
GPA = totalPoints / gpaCredits
```

- **GPA Credits**: A through F grades (including WF)
- **Total Credits**: All valid grades including P/CR/T
- **Excluded**: Invalid or unrecognized grades

### 3. Reference Lookup (`aice-fce-reference`)

Generates APA-format references based on credential context.

```bash
python scripts/lookup_refs.py --context "<Country> <Level> <Document Type>" --year <Year>
```

Optional: Search institution website and generate citation:
```bash
python scripts/lookup_refs.py --make-citation "<Institution>" "<URL>"
```

## Key Files

| File | Purpose |
|------|---------|
| `lib/gemini.ts` | Gemini API client, sends PDF directly to AI |
| `lib/pdf-parser.ts` | Data conversion and grade mapping |
| `lib/gpa.ts` | GPA and credit calculation logic |
| `app/api/parse-pdf/route.ts` | API endpoint |
| `components/pdf-upload-dialog.tsx` | Upload UI |

## Error Handling

| Error | Solution |
|-------|----------|
| `NON_ENGLISH_CONTENT` | Use English document |
| `FILE_TOO_LARGE` | Keep under 10MB |
| `AI_ERROR` / 429 | Check API key, wait & retry |
| Unknown grade system | AI will infer with `(AI_INFERRED)` marker |

## Extending

- **Gemini Prompt**: Edit `TRANSCRIPT_ANALYSIS_PROMPT` in `lib/gemini.ts`
- **Grade Mapping**: Edit `convertToSampleData()` in `lib/pdf-parser.ts`
- **Grade Rules**: See `aice-fce-grade-conversion/references/grade-rules.md`
- **GPA Rules**: See `aice-gpa-calculation/references/gpa-rules.md`
- **References**: Run `scripts/lookup_refs.py` for bibliography lookup
