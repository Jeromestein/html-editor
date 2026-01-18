# Report Editor Component

A modular, printable credential evaluation report editor built with React and Next.js.

## Directory Structure

```
components/report/
├── hooks/                    # Logic layer (state & calculations)
│   ├── use-report-data.ts    # Data state management
│   ├── use-pagination.ts     # Page splitting logic
│   └── use-dynamic-measure.ts # DOM measurement & caching
├── sections/                 # Content sections (pure components)
│   ├── header.tsx            # Company header with logo
│   ├── footer.tsx            # Page number footer
│   ├── applicant-info.tsx    # Applicant details grid
│   ├── equivalence-summary.tsx # U.S. equivalence summary
│   ├── documents-list.tsx    # Document list with CRUD
│   ├── credential-details.tsx # Institution & program info
│   ├── course-table.tsx      # Course-by-course analysis
│   ├── grade-conversion.tsx  # Grade scale conversion
│   ├── references.tsx        # Bibliographic references
│   ├── notes.tsx             # Evaluation notes
│   ├── signatures.tsx        # Evaluator signatures
│   ├── seal.tsx              # Company seal image
│   ├── watermark.tsx         # Background watermark
│   └── about-aet-page.tsx    # About company page
├── ui/                       # Reusable UI components
│   ├── report-page.tsx       # Single page layout (US Letter)
│   ├── report-toolbar.tsx    # Action bar (Save/Load/Print)
│   ├── report-dialogs.tsx    # Save/Load dialogs
│   ├── editable-elements.tsx # EditableInput/Textarea/Image
│   └── shared.tsx            # Typography components
├── index.tsx                 # Main entry point
├── types.ts                  # Type definitions
└── constants.ts              # Layout constants
```

---

## Hooks

### `use-report-data.ts`
**Central data management hook**

Manages all CRUD operations for report data:
- `updateDataField()` - Update top-level fields (name, date, etc.)
- `updateCredentialField()` - Update credential properties
- `updateCourse()` / `deleteCourse()` / `addCourse()` - Course operations
- `updateDocument()` / `deleteDocument()` / `addDocument()` - Document operations
- `rehydrate()` - Reload data from external source

### `use-pagination.ts`
**Page splitting logic**

Calculates how content should be distributed across pages:
- Splits documents into pages based on available space
- Splits courses per credential based on row capacity
- Handles grade conversion table placement
- Determines where to show signatures/about page

### `use-dynamic-measure.ts`
**DOM measurement with caching**

Measures actual DOM element heights to calculate page capacity:
- **Caching Strategy**: Measures once on initial render, caches values
- Calculates `rowsPerFirstPage`, `rowsPerFullPage`, etc.
- Eliminates layout oscillation/flickering via cached measurements

---

## Sections

| Component | Description |
|-----------|-------------|
| `header.tsx` | Company logo, name, contact info |
| `footer.tsx` | Page numbers, reference number |
| `applicant-info.tsx` | Name, DOB, evaluation date, purpose |
| `equivalence-summary.tsx` | U.S. degree equivalency statements |
| `documents-list.tsx` | Evaluated documents with metadata |
| `credential-details.tsx` | Institution, program, graduation info |
| `course-table.tsx` | Course-by-course with GPA calculation |
| `grade-conversion.tsx` | Foreign to U.S. grade mapping |
| `references.tsx` | AICE reference citations |
| `notes.tsx` | Evaluator notes and remarks |
| `signatures.tsx` | Evaluator signatures with images |
| `seal.tsx` | Company authentication seal |
| `watermark.tsx` | Background watermark image |
| `about-aet-page.tsx` | Company information page |

---

## UI Components

### `report-page.tsx`
**Single page layout for printing**

- Page size: **US Letter (8.5" × 11")**
- Includes header, footer, watermark
- Handles page breaks for print media
- Contains all page-related CSS variables

### `report-toolbar.tsx`
**Action toolbar**

- Save to Supabase
- Load from saved reports
- Print report

### `report-dialogs.tsx`
**Modal dialogs**

- `SaveReportDialog` - Save new or overwrite existing
- `LoadReportDialog` - Browse and load saved reports

### `editable-elements.tsx`
**Inline editing components**

- `EditableInput` - Single-line text editing
- `EditableTextarea` - Multi-line text editing
- `EditableImage` - Click-to-upload image editing

### `shared.tsx`
**Typography primitives**

- `SectionTitle` - Section headings (e.g., "2. Documents")
- `ReportTitle` - Main report title
- `InfoRow` / `SummaryRow` / `DetailRow` - Layout helpers

---

## Entry Point

### `index.tsx`
**Main ReportEditor component**

Wires together hooks and components:

```tsx
export default function ReportEditor({ initialData, readOnly }) {
  const { data, ...actions } = useReportData({ initialData, readOnly })
  const { measurements, refs } = useDynamicMeasure({ data })
  const reportPages = usePagination({ data, measurements })

  return (
    <div className="page-stack">
      <ReportToolbar />
      {reportPages.map(page => <ReportPage {...page} />)}
    </div>
  )
}
```

---

## External Dependencies

- `lib/report-data.ts` - Data types & sample data builder
- `lib/gpa.ts` - GPA calculation utilities

---

## Print Support

The report is designed for printing:
- Fixed US Letter page dimensions
- CSS `@media print` rules for proper page breaks
- Watermarks and seals render correctly
- Hidden toolbar and placeholders in print mode
