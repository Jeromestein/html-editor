import { Course } from "./report-data"

const GRADE_POINTS: Record<string, number> = {
    "A+": 4.00, "A": 4.00, "A-": 3.67,
    "B+": 3.33, "B": 3.00, "B-": 2.67,
    "C+": 2.33, "C": 2.00, "C-": 1.67,
    "D+": 1.33, "D": 1.00, "D-": 0.67,
    "F": 0.00
}

export function calculateStats(courses: Course[]) {
    let totalCredits = 0
    let totalPoints = 0
    let gpaCredits = 0

    for (const course of courses) {
        const credits = parseFloat(course.credits || "0")
        if (isNaN(credits)) continue

        // Add to total credits
        totalCredits += credits

        const grade = (course.grade || "").trim().toUpperCase()

        // Check if grade maps to points
        if (GRADE_POINTS.hasOwnProperty(grade)) {
            const points = GRADE_POINTS[grade]
            totalPoints += credits * points
            gpaCredits += credits
        }
    }

    const gpa = gpaCredits > 0 ? (totalPoints / gpaCredits).toFixed(2) : "N/A"

    return {
        totalCredits: totalCredits.toFixed(2),
        gpa
    }
}
