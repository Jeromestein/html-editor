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
- The print page signals readiness via `document.documentElement.dataset.reportReady` after fonts + pagination settle.
- If Chromium is missing locally, run `pnpm exec playwright install chromium`.
