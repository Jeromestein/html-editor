# Report Pagination Rules

## Overview

The report pagination system dynamically calculates how many items fit on each page based on actual DOM measurements, then distributes content accordingly.

## Key Files

- `components/report/hooks/use-dynamic-measure.ts` - Measures DOM elements and caches values
- `components/report/hooks/use-pagination.ts` - Distributes content across pages

## Pagination Principles

### 1. Row Units (Multiline Course Support)

Each course takes a number of "row units" based on newlines in its name:
- Normal course = 1 row unit
- Course with 1 newline = 2 row units
- Course with 2 newlines = 3 row units

```typescript
function getCourseRowUnits(course: Course): number {
    return 1 + (course.name.match(/\n/g) || []).length
}
```

### 2. Fill Pages by Row Units

Pages are filled based on total row units, not course count:

```typescript
while (remainingCourses.length > 0) {
    let pageCourses: Course[] = []
    let pageUnits = 0
    while (remainingCourses.length > 0) {
        const nextUnits = getCourseRowUnits(remainingCourses[0])
        if (pageUnits + nextUnits > fullCapacity) break
        pageCourses.push(remainingCourses.shift()!)
        pageUnits += nextUnits
    }
    pages.push({ courses: pageCourses })
}
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

## Layout Stability & Flickering Prevention

- **Gap Awareness**: Pagination calculations MUST account for CSS gaps (e.g., `space-y-2` = 8px)
- **Conservative Prediction**: Use pessimistic values in `useLayoutEffect`:
  - **Safety Padding**: 12px+ buffer for browser rendering variations
  - **Element Estimates**: Overestimate dynamic element heights (e.g., 48px for 32px button)
- **Reactive Overflow Check**: After predictive calculation, check `scrollHeight > clientHeight`. If true, reduce item count to break flicker cycle.
- **Dynamic Button Placement**:
  - "Add Documents" → pinned to last document page
  - "Add Course" → in Course Table footer
