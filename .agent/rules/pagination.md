# Report Pagination Rules

## Overview

The report pagination system dynamically calculates how many items fit on each page based on actual DOM measurements, then distributes content accordingly.

## Key Files

- `components/report/hooks/use-dynamic-measure.ts` - Measures DOM elements and caches values
- `components/report/hooks/use-pagination.ts` - Distributes content across pages

## Pagination Principles

### 1. Fill Pages Fully

Each page should be filled to capacity before moving to the next page. Do NOT pre-reserve space on intermediate pages.

```typescript
// GOOD: Fill each page fully
while (remainingCourses.length > 0) {
    const take = Math.min(fullCount, remainingCourses.length)
    pages.push({ courses: remainingCourses.splice(0, take) })
}

// BAD: Pre-reserve space causing blank areas
while (remainingCourses.length > lastCount) {
    const take = Math.min(fullCount, remainingCourses.length - lastCount)
    // This leaves blank space on intermediate pages
}
```

### 2. Grade Conversion Handling

Grade Conversion tables should be placed on the same page as the last courses if space allows. If not, create an extra page for Grade Conversion only.

```typescript
if (isLastOfCredential) {
    if (capacity - rowsUsed - 1 >= gradeConversionOverhead) {
        showGradeConversion = true  // Same page
    } else {
        needsExtraPage = true  // New page for Grade Conversion
    }
}
```

### 3. Row Height Measurement

Use a fixed single-line row height (26px) as the baseline for pagination calculations. This prevents multiline rows (from textarea wrapping) from affecting the entire pagination.

```typescript
const singleLineRowHeight = 26
rowHeight = Math.min(rowRect.height, singleLineRowHeight)
```

### 4. Cache Invalidation

Only invalidate the measurement cache when the number of newlines in course names changes, NOT on every content edit. This prevents unnecessary recalculations.

```typescript
const totalNewlines = data.credentials.reduce((acc, c) => 
    acc + c.courses.reduce((acc2, course) => 
        acc2 + (course.name.match(/\n/g) || []).length, 0), 0)

useEffect(() => {
    cachedMeasurementsRef.current = null
}, [totalNewlines])
```

## Course Name Line Wrapping

Course names use `<input>` by default (single line). Users can press **Shift+Enter** to insert a newline, which switches to `<textarea>` for multiline display.

```tsx
{course.name.includes('\n') ? (
    <EditableTextarea ... />
) : (
    <EditableInput ... />
)}
```
