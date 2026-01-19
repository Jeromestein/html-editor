# Report Pagination Rules

## Overview

The report pagination system uses a hybrid approach:
- **Course rows**: Dynamic measurement based on actual DOM heights
- **Documents**: Fixed defaults based on page layout estimates

## Key Files

- `components/report/hooks/use-dynamic-measure.ts` - Measures DOM elements and caches values
- `components/report/hooks/use-pagination.ts` - Distributes content across pages
- `components/report/constants.ts` - Default pagination values

## Constants

```typescript
// Course rows per page
export const DEFAULT_ROWS_PER_FIRST_PAGE = 14
export const DEFAULT_ROWS_PER_FULL_PAGE = 30

// Documents per page - fixed values based on US Letter layout
export const DEFAULT_DOCS_PER_FIRST_PAGE = 4
export const DEFAULT_DOCS_PER_FULL_PAGE = 8
```

## Document Pagination

Documents use **fixed defaults** instead of dynamic measurement:

| Constant | Value | Rationale |
|----------|-------|-----------|
| `DEFAULT_DOCS_PER_FIRST_PAGE` | 4 | First page has header, applicant info, equivalence summary |
| `DEFAULT_DOCS_PER_FULL_PAGE` | 8 | Subsequent pages have more space |

**Why fixed values?**
- Dynamic measurement was causing flickering due to feedback loops
- Document items have variable heights that are hard to measure accurately
- Fixed estimates based on US Letter layout work reliably

## Grade Conversion Section

The Grade Conversion section contains two side-by-side tables:
- **Left**: Original Grade → U.S. Grade (variable rows based on credential)
- **Right**: GPA Points reference table (fixed 14 rows)

Height calculation uses the taller of the two:

```typescript
const gpaPointsTableRows = 14  // Fixed: A+ to F/WF, P/CR
const gradeConversionOverhead = Math.max(
    credential.gradeConversion.length, 
    gpaPointsTableRows
) + 6  // +6 for headers/margins
```


## Course Row Pagination

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

### 3. Cache Invalidation

Only invalidate the measurement cache when the number of newlines in course names changes, NOT on every content edit:

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

1. **Fixed Defaults for Documents**: Use `DEFAULT_DOCS_PER_FIRST_PAGE` and `DEFAULT_DOCS_PER_FULL_PAGE` instead of dynamic measurement
2. **Measurement Caching**: Course row measurements are cached to prevent re-measurement loops
3. **Gap Awareness**: Pagination calculations account for CSS gaps (e.g., `space-y-2` = 8px)
4. **Safety Padding**: 36px buffer for course content, 24px for documents
5. **Dynamic Button Placement**:
   - "Add Documents" → pinned to last document page
   - "Add Course" → in Course Table footer
