import { createClient } from "@supabase/supabase-js"

// Supabase client (reuse from existing setup)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Grade conversion result type
 */
export type GradeConversionResult = {
    originalGrade: string
    originalScale: string
    usGrade: string
    gpaPoints: number
    usCredits: number
    level: "LD" | "UD" | "GR"
    confidence: "high" | "medium" | "low"
    source: "AICE_RULES" | "AI_INFERRED" | "USER_VERIFIED"
}

/**
 * Database rule type
 */
type GradeRule = {
    id: string
    country: string
    education_level: string
    original_scale: string
    original_grade: string
    us_grade: string
    gpa_points: number
    credit_coefficient: number | null
    source: string
    confidence: string
}

/**
 * Lookup grade conversion rule from database
 */
export async function lookupGradeRule(
    country: string,
    grade: string,
    educationLevel: string = "undergraduate"
): Promise<GradeRule | null> {
    const { data, error } = await supabase
        .from("aet_aice_grade_conversion_rules")
        .select("*")
        .eq("country", country)
        .eq("education_level", educationLevel)
        .limit(10)

    if (error || !data || data.length === 0) {
        return null
    }

    // Find matching rule (handle range grades like "85-100")
    const numericGrade = parseFloat(grade)

    for (const rule of data) {
        const rangeMatch = rule.original_grade.match(/^(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)$/)
        if (rangeMatch) {
            const min = parseFloat(rangeMatch[1])
            const max = parseFloat(rangeMatch[2])
            if (!isNaN(numericGrade) && numericGrade >= min && numericGrade <= max) {
                return rule
            }
        } else if (rule.original_grade === grade) {
            return rule
        }
    }

    return null
}

/**
 * Save new grade conversion rule to database
 */
export async function saveGradeRule(rule: {
    country: string
    educationLevel: string
    originalScale: string
    originalGrade: string
    usGrade: string
    gpaPoints: number
    source: string
    confidence: string
}): Promise<void> {
    const { error } = await supabase
        .from("aet_aice_grade_conversion_rules")
        .insert({
            country: rule.country,
            education_level: rule.educationLevel,
            original_scale: rule.originalScale,
            original_grade: rule.originalGrade,
            us_grade: rule.usGrade,
            gpa_points: rule.gpaPoints,
            source: rule.source,
            confidence: rule.confidence,
        })

    if (error) {
        console.error("Failed to save grade rule:", error)
    }
}

/**
 * Calculate course level based on year in program
 */
export function calculateCourseLevel(
    yearInProgram: number,
    totalYears: number,
    educationLevel: string
): "LD" | "UD" | "GR" {
    if (educationLevel === "graduate") {
        return "GR"
    }

    // For 4-year programs: Years 1-2 = LD, Years 3-4 = UD
    // For 3-year programs: Year 1 = LD, Years 2-3 = UD
    if (totalYears >= 4) {
        return yearInProgram <= 2 ? "LD" : "UD"
    } else {
        return yearInProgram <= 1 ? "LD" : "UD"
    }
}

/**
 * Calculate US credits from original credits
 * Golden Rule: 1 Academic Year = 30-32 US Semester Credits
 */
export function calculateUSCredits(
    originalCredits: number,
    totalYearCredits: number = 40, // Default assumption for China
    creditSystem: string = "generic"
): number {
    let coefficient = 1

    switch (creditSystem.toLowerCase()) {
        case "ects":
            // 60 ECTS = 30 US Credits
            coefficient = 0.5
            break
        case "cats":
            // 120 CATS = 30 US Credits
            coefficient = 0.25
            break
        default:
            // Normalize to 30 credits per year
            coefficient = 30 / totalYearCredits
    }

    return Math.round(originalCredits * coefficient * 10) / 10
}

/**
 * Format US grade with AI_INFERRED marker if needed
 */
export function formatUSGrade(usGrade: string, source: string): string {
    if (source === "AI_INFERRED") {
        return `${usGrade} (AI_INFERRED)`
    }
    return usGrade
}
