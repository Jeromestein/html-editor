# Report Editor Refactoring Plan

## 1. Current Issues Analysis
The current `report-editor.tsx` is a monolithic component (~2000 lines) that suffers from:
- **Mixed Concerns**: Handles data persistence, complex pagination math, DOM measurement, and UI rendering all in one place.
- **Prop Drilling**: Passes 30+ props down to `ReportPage` and sub-components.
- **Complex State**: Data mutation logic (CRUD for courses, docs) is cluttered within the view layer.
- **Performance**: Heavy use of `useLayoutEffect` and `requestAnimationFrame` mixed with rendering logic makes updates expensive.

## 2. Proposed Architecture

We will move from a "Monolithic" approach to a "Composer" approach using **Custom Hooks** and **Functional Components**.

### Directory Structure
```text
components/
└── report/
    ├── hooks/
    │   ├── use-report-data.ts         # Encapsulates all data mutation logic
    │   ├── use-pagination.ts          # Encapsulates page splitting & definition logic
    │   └── use-dynamic-measure.ts    # Encapsulates the measuring/resize logic
    ├── sections/                      # UI Sections (Pure Components)
    │   ├── header.tsx
    │   ├── footer.tsx
    │   ├── applicant-info.tsx
    │   ├── documents-list.tsx
    │   ├── credential-details.tsx
    │   ├── course-table.tsx
    │   ├── grade-conversion.tsx
    │   ├── references.tsx
    │   ├── notes.tsx
    │   └── signatures.tsx
    ├── ui/                           # Generic Report UI elements
    │   ├── report-page.tsx           # Layout for a single printable page
    │   ├── report-toolbar.tsx        # Action bar (Save, Load, Print)
    │   └── editable-elements.tsx     # EditableInput, EditableTextarea
    ├── index.tsx                     # Main ReportEditor entry point
    └── types.ts                      # Centralized type definitions for shared use
```

## 3. Key Components Breakdown

### A. Logic Layer (Hooks)

**1. `useReportData(initialData)`**
- **Responsibilities**:
    - Manage `SampleData` state.
    - Export strongly typed actions: `updateCredential`, `addCourse`, `removeDocument`, `rehydrate`.
- **Benefit**: Removes ~300 lines of event handlers from the main component.

**2. `usePagination(data, measurements)`**
- **Responsibilities**:
    - Takes raw data and current UI measurements (rows per page).
    - Returns an array of `PageConfig` objects.
    - Handles the logic for "First Page" vs "Full Page" vs "Last Page".
- **Benefit**: Isolates the complex `paginateCourses` and `reportPages` algorithms.

**3. `useDynamicMeasure(refs)`**
- **Responsibilities**:
    - Observes DOM elements.
    - internalizes the `requestAnimationFrame` loop.
    - Returns strictly the `counts` (e.g., `{ rowsFirstPage: 14, rowsFullPage: 30 }`).

### B. View Layer (Components)

**1. `ReportEditor` (Main Entry)**
- **Role**: Wiring only.
- **Code**:
  ```tsx
  export default function ReportEditor() {
    const { data, actions } = useReportData();
    const { measurements, refs } = useDynamicMeasure();
    const pages = usePagination(data, measurements);

    return (
      <ReportContext.Provider value={{ data, actions, readOnly }}>
         <ReportToolbar />
         <div className="page-stack">
            {pages.map((page, idx) => (
                <ReportPage key={idx} config={page} />
            ))}
         </div>
      </ReportContext.Provider>
    );
  }
  ```

**2. `ReportPage`**
- **Role**: Layout shell.
- **Props**: `PageConfig` (what to show).
- **Behavior**: Uses the Context to get data/actions. No more prop drilling.

## 4. Detailed Migration Mapping

This table details exactly which parts of the current `report-editor.tsx`, `report-manager.tsx`, and `report-data.ts` will move to the new files.

| Source File | Source Logic | Destination File | Notes |
| :--- | :--- | :--- | :--- |
| **State Management** | | | |
| `report-editor.tsx` | `useState<SampleData>`, `buildSampleData` | `hooks/use-report-data.ts` | Core state container |
| `report-editor.tsx` | `updateEquivalenceField` | `hooks/use-report-data.ts` | |
| `report-editor.tsx` | `updateDataField` | `hooks/use-report-data.ts` | |
| `report-editor.tsx` | `updateCredentialField` | `hooks/use-report-data.ts` | |
| `report-editor.tsx` | `updateCourse`, `deleteCourse`, `addCourse` | `hooks/use-report-data.ts` | |
| `report-editor.tsx` | `updateDocument`, `addDocument`, `deleteDocument` | `hooks/use-report-data.ts` | |
| `report-editor.tsx` | `updateGradeConversion` | `hooks/use-report-data.ts` | |
| **Logic & Data Types** | | | |
| `lib/report-data.ts` | `SampleData`, `Course`, `Credential` types | `components/report/types.ts` | Centralize types |
| `lib/report-data.ts` | `buildSampleData`, `rehydrateData` | `lib/report-utils.ts` | Keep as pure utilities |
| `lib/report-data.ts` | `HKUST_COURSES` and other constants | `lib/report-constants.ts` | Separate data from logic |
| **Calculation & Logic** | | | |
| `report-editor.tsx` | `paginateCourses` function | `hooks/use-pagination.ts` | Pure logic for splitting arrays |
| `report-editor.tsx` | `reportPages` (`useMemo` logic) | `hooks/use-pagination.ts` | Main pagination orchestration |
| `report-editor.tsx` | `coursePagesByCredential` (`useMemo`) | `hooks/use-pagination.ts` | |
| `report-editor.tsx` | `documentPages` (`useMemo`) | `hooks/use-pagination.ts` | |
| **DOM & Measurement** | | | |
| `report-editor.tsx` | `useLayoutEffect` (RAF loop) | `hooks/use-dynamic-measure.ts` | The complex resize logic |
| `report-editor.tsx` | `courseContentRef`, `introContentRef`, etc. | `hooks/use-dynamic-measure.ts` | Limit refs exposure |
| `report-editor.tsx` | `fontsReady` state | `hooks/use-dynamic-measure.ts` | |
| **UI Components** | | | |
| `report-editor.tsx` | `Header` component | `sections/header.tsx` | |
| `report-editor.tsx` | `Footer` component | `sections/footer.tsx` | |
| `report-editor.tsx` | `ApplicantInfo` component | `sections/applicant-info.tsx` | |
| `report-editor.tsx` | `Document list rendering` (inline) | `sections/documents-list.tsx` | Extract inline JSX to component |
| `report-editor.tsx` | `CredentialDetails` component | `sections/credential-details.tsx` | |
| `report-editor.tsx` | `CourseTable` component | `sections/course-table.tsx` | |
| `report-editor.tsx` | `GradeConversion` component | `sections/grade-conversion.tsx` | |
| `report-editor.tsx` | `SummaryRow`, `DetailRow` helpers | `sections/ui/tables.tsx` | Or keep local to sections |
| `report-editor.tsx` | `Signatures`, `Remarks`, `References` | `sections/signatures.tsx`, etc. | Group if small |
| **Generic UI & Managers** | | | |
| `report-editor.tsx` | `ReportPage` component | `ui/report-page.tsx` | The A4 wrapper & layout |
| `report-editor.tsx` | `EditableInput`, `EditableTextarea` | `ui/editable-elements.tsx` | |
| `report-editor.tsx` | `EditableImage` | `ui/editable-elements.tsx` | |
| `report-manager.tsx` | `SaveReportDialog` | `ui/report-toolbar.tsx` | Integrate directly into toolbar |
| `report-manager.tsx` | `LoadReportDialog` | `ui/report-toolbar.tsx` | Integrate directly into toolbar |
| **Main Entry** | | | |
| `report-editor.tsx` | `ReportEditor` (The root export) | `index.tsx` | Wires Hooks -> Context -> UI |

## 5. Migration Strategy

1.  **Extract Types**: Move shared types to `components/report/types.ts`.
2.  **Extract `useReportData`**: Move all `setData` logic here.
3.  **Extract Sub-components**: Move `CourseTable`, `Header`, etc., to separate files.
4.  **Isolate Pagination**: Move the `paginateCourses` and `useMemo` logic to a hook.
5.  **Reassemble**: Create the new `index.tsx` using the pieces above.

## 5. Benefits

- **Maintainability**: Pagination logic is isolated from rendering.
- **Readability**: Small, focused files instead of one giant file.
- **Performance**: Measuring logic is decoupled from render tree updates where possible.
- **Testability**: Logic hooks can be unit tested without mounting the entire UI.
