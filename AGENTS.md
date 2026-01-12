# Report Editor Page Settings

- Page size: US Letter (8.5in × 11in)
- Units: inch-based layout for pagination/print
- Page padding: 0.75in (x/y)
- Header height: 0.8in
- Footer height: 0.7in
- Page gap (screen only): 0.4in

# Controlled PDF Notes

- Use `app/api/pdf/route.ts` to generate PDFs via Playwright; do not rely on browser print for final output.
- The print view is `app/report/print/page.tsx` and must stay layout-identical to the editor output.
- Pagination is measurement-driven in `components/report-editor.tsx`; avoid hardcoding row counts.
- Recalculate pagination after layout settles (auto-sized textareas, fonts) and trim first-page rows if content overflows so the footer stays clear.
- Any new variable-height section (e.g., documents list, remarks) must be included in pagination: measure it, and if it doesn't fit the current page, split or move it to the next page so nothing overlaps the footer.
- The `safetyPadding` in pagination calculation (currently 40px) is critical to account for browser rendering differences (margins, borders) and prevent content from overlapping the footer or being cut off.
- The print page signals readiness via `document.documentElement.dataset.reportReady` after fonts + pagination settle.
- If Chromium is missing locally, run `pnpm exec playwright install chromium`.

# Report Layout Requirements

### 1. Global Sections (Start of Report)
*   **1. U.S. EQUIVALENCE SUMMARY:**
    *   Lists **all** credentials managed in the report.
    *   Each credential is explicitly labeled as **Credential #1**, **Credential #2**, etc. (Starting from 1).
    *   Contains the specific *Equivalency*, *U.S. Credits*, and *U.S. GPA* for each credential.
*   **2. DOCUMENTS:**
    *   A single, global list of all documents submitted for the evaluation.

### 2. Per-Credential Sections (Repeated for each Credential)
For each degree/credential (starting from Index 1), the following three sections are generated in order:

*   **3. CREDENTIAL DETAILS:**
    *   Header format: **"Credential Details: Credential #X"** (e.g., Credential #1).
    *   Contains specific details like Institution, Country, Year, Major, etc.
*   **4. COURSE-BY-COURSE ANALYSIS:**
    *   Header format: **"Course-by-Course Analysis: Credential #X"**.
    *   A table listing specific courses, grades, credits, and levels.
    *   The *Year* column width is set to `w-20` to fit "YYYY-YYYY" formats.
*   **TOTALS (Per Credential):**
    *   Located immediately **after** the *Course-by-Course Analysis* table.
    *   Displays the **Total Credits** and **GPA** specific to that single credential.
*   **5. GRADE CONVERSION:**
    *   Header format: **"Grade Conversion: Credential #X"**.
    *   A table showing the grade scale specific to that credential.
    *   **Pagination Logic:**
        *   Do **not** reserve fixed space for this section in the course table. Courses should fill the page as much as possible.
        *   **Dynamic Placement:** If the Grade Conversion section (height = rows + overhead) fits in the remaining space of the last course page without overlapping the footer, place it there.
        *   **Auto-Break:** If the remaining space is insufficient, automatically move the Grade Conversion section to a **new, separate page**.

*(Note: The section numbering increments dynamically based on the number of credentials. E.g., for Credential #2, the sections would be 6, 7, and 8.)*

### 3. Footer & Closing Sections (End of Report)
These sections appear after **all** credentials have been listed:

*   **REFERENCES:**
    *   Renamed from "Scales & References".
    *   Lists standard reference databases (e.g., AACRAO EDGE).
    *   **No Global Grade Scale:** The global grade scale table has been removed.
*   **EVALUATION NOTES:**
    *   A new editable text area for additional evaluator notes.
*   **REMARKS / SIGNATURES:**
    *   Standard disclaimer and signature lines for the Senior Evaluator.
*   **No Global Totals:** The global "Total Credits" line has been removed from the last page's footer to avoid confusion with the specific credential totals.
