---
description: How to use the PDF analysis feature to auto-fill FCE reports from uploaded transcripts
---

# PDF Analysis Workflow

Upload a transcript/diploma PDF and let Gemini AI extract data automatically.

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
3. Wait for AI analysis (~5-10s)
4. Review extracted data
5. Click **"Import Data"**

## Architecture

```
PDF Upload → API Route → Gemini AI (direct PDF) → Data Mapping → Report
```

**Key Files:**
- `lib/gemini.ts` - Gemini API client, sends PDF directly to AI
- `lib/pdf-parser.ts` - Data conversion only (no text extraction)
- `app/api/parse-pdf/route.ts` - API endpoint
- `components/pdf-upload-dialog.tsx` - Upload UI

## Error Handling

| Error | Solution |
|-------|----------|
| `NON_ENGLISH_CONTENT` | Use English document |
| `FILE_TOO_LARGE` | Keep under 10MB |
| `AI_ERROR` / 429 | Check API key, wait & retry |

## Extending

- **Prompt**: Edit `TRANSCRIPT_ANALYSIS_PROMPT` in `lib/gemini.ts`
- **Data mapping**: Edit `convertToSampleData()` in `lib/pdf-parser.ts`
