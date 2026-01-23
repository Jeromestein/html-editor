import { calculateStats } from "./gpa"

export type Course = {
  id: number
  year: string
  name: string
  level: string
  credits: string
  grade: string
  usGrade?: string
  usCredits?: string
  conversionSource?: string
}

export type CredentialDocument = {
  title: string
  issuedBy: string
  dateIssued: string
  certificateNo: string
}

export type GradeConversionRow = {
  grade: string
  usGrade: string
}

export type Credential = {
  id: number
  awardingInstitution: string
  country: string
  admissionRequirements: string
  program: string
  grantsAccessTo: string
  standardProgramLength: string
  yearsAttended: string
  yearOfGraduation: string
  equivalenceStatement: string
  gpa: string
  totalCredits: string
  gradeConversion: GradeConversionRow[]
  courses: Course[]
  courseTableNotes?: string
}

export type SampleData = {
  refNo: string
  name: string
  dob: string
  country: string
  date: string
  purpose: string
  documents: CredentialDocument[]
  credentials: Credential[]
  evaluationNotes: string
  evaluatorName: string
  evaluatorSignature: string
  seniorEvaluatorName: string
  seniorEvaluatorSignature: string
  references: string
}

export const buildSampleData = (): SampleData => ({
  refNo: "LA-20260116-110",
  name: "N/A",
  dob: "N/A",
  country: "Nigeria",
  date: "January 16, 2026",
  purpose: "N/A",
  documents: [
    {
      title: "ACADEMIC TRANSCRIPT",
      issuedBy: "AUCHI POLYTECHNIC, AUCHI",
      dateIssued: "Jun 19, 2019",
      certificateNo: "N/A",
    },
  ],
  references: `• National Board for Technical Education (NBTE). (n.d.). Grading System for Polytechnics in Nigeria.
• Scholaro. (2024). Grading Scale - Nigeria - Polytechnic.
• International Education Research Foundation (IERF). (2024). Country Profile: Nigeria.
• International Association of Universities (IAU). (2019). International Handbook of Universities (29th). Palgrave Macmillan.
• Europa Publications. (2021). The Europa World of Learning (72nd). Routledge.
• IAU / UNESCO. (2026). World Higher Education Database (WHED).`,
  credentials: [
    {
      id: 1,
      gpa: "",
      country: "Nigeria",
      courses: [
        { id: 1001, name: "Principles of Accounting", year: "2002", grade: "B", level: "LD", credits: "3", usGrade: "B", usCredits: "2.00", conversionSource: "AI_INFERRED" },
        { id: 1002, name: "Business Mathematics", year: "2002", grade: "C", level: "LD", credits: "3", usGrade: "C", usCredits: "2.00", conversionSource: "AI_INFERRED" },
        { id: 1003, name: "Introduction to Business", year: "2002", grade: "BC", level: "LD", credits: "2", usGrade: "C+", usCredits: "1.50", conversionSource: "AI_INFERRED" },
        { id: 1004, name: "General Physics", year: "2002", grade: "B", level: "LD", credits: "2", usGrade: "B", usCredits: "1.50", conversionSource: "AI_INFERRED" },
        { id: 1005, name: "Use of English", year: "2002", grade: "BC", level: "LD", credits: "2", usGrade: "C+", usCredits: "1.50", conversionSource: "AI_INFERRED" },
        { id: 1006, name: "Principles of Economics", year: "2002", grade: "B", level: "LD", credits: "2", usGrade: "B", usCredits: "1.50", conversionSource: "AI_INFERRED" },
        { id: 1007, name: "Principles of Accounting", year: "2002", grade: "B", level: "LD", credits: "3", usGrade: "B", usCredits: "2.00", conversionSource: "AI_INFERRED" },
        { id: 1008, name: "Business Mathematics", year: "2002", grade: "A", level: "LD", credits: "3", usGrade: "A", usCredits: "2.00", conversionSource: "AI_INFERRED" },
        { id: 1009, name: "Principles of Economics of Cooperative", year: "2002", grade: "B", level: "LD", credits: "2", usGrade: "B", usCredits: "1.50", conversionSource: "AI_INFERRED" },
        { id: 1010, name: "Principles of Economics", year: "2002", grade: "BC", level: "LD", credits: "2", usGrade: "C+", usCredits: "1.50", conversionSource: "AI_INFERRED" },
        { id: 1011, name: "Introduction to Computer", year: "2002", grade: "BC", level: "LD", credits: "2", usGrade: "C+", usCredits: "1.50", conversionSource: "AI_INFERRED" },
        { id: 1012, name: "Communication in English", year: "2002", grade: "BC", level: "LD", credits: "2", usGrade: "C+", usCredits: "1.50", conversionSource: "AI_INFERRED" },
        { id: 1013, name: "Use of Library", year: "2002", grade: "B", level: "LD", credits: "1", usGrade: "B", usCredits: "0.50", conversionSource: "AI_INFERRED" },
        { id: 1014, name: "Business Statistics", year: "2003", grade: "BC", level: "LD", credits: "3", usGrade: "C+", usCredits: "2.00", conversionSource: "AI_INFERRED" },
        { id: 1015, name: "Use of English", year: "2003", grade: "B", level: "LD", credits: "2", usGrade: "B", usCredits: "1.50", conversionSource: "AI_INFERRED" },
        { id: 1016, name: "Business Law", year: "2003", grade: "B", level: "LD", credits: "2", usGrade: "B", usCredits: "1.50", conversionSource: "AI_INFERRED" },
        { id: 1017, name: "Principles of Selling", year: "2003", grade: "B", level: "LD", credits: "2", usGrade: "B", usCredits: "1.50", conversionSource: "AI_INFERRED" },
        { id: 1018, name: "Data Processing", year: "2003", grade: "B", level: "LD", credits: "2", usGrade: "B", usCredits: "1.50", conversionSource: "AI_INFERRED" },
        { id: 1019, name: "Citizenship Education", year: "2003", grade: "B", level: "LD", credits: "2", usGrade: "B", usCredits: "1.50", conversionSource: "AI_INFERRED" },
        { id: 1020, name: "Business Statistics", year: "2003", grade: "B", level: "LD", credits: "3", usGrade: "B", usCredits: "2.00", conversionSource: "AI_INFERRED" },
        { id: 1021, name: "Communication in English", year: "2003", grade: "BC", level: "LD", credits: "2", usGrade: "C+", usCredits: "1.50", conversionSource: "AI_INFERRED" },
        { id: 1022, name: "Principles of Purchasing", year: "2003", grade: "B", level: "LD", credits: "2", usGrade: "B", usCredits: "1.50", conversionSource: "AI_INFERRED" },
        { id: 1023, name: "Development Administration", year: "2003", grade: "BC", level: "LD", credits: "2", usGrade: "C+", usCredits: "1.50", conversionSource: "AI_INFERRED" },
        { id: 1024, name: "Psychology", year: "2003", grade: "A", level: "LD", credits: "2", usGrade: "A", usCredits: "1.50", conversionSource: "AI_INFERRED" },
        { id: 1025, name: "Business Law", year: "2003", grade: "BC", level: "LD", credits: "2", usGrade: "C+", usCredits: "1.50", conversionSource: "AI_INFERRED" },
        { id: 1026, name: "Citizenship Education", year: "2003", grade: "BC", level: "LD", credits: "2", usGrade: "C+", usCredits: "1.50", conversionSource: "AI_INFERRED" },
        { id: 1027, name: "Cost Accounting", year: "2004", grade: "BC", level: "LD", credits: "3", usGrade: "C+", usCredits: "2.00", conversionSource: "AI_INFERRED" },
        { id: 1028, name: "Public Finance", year: "2004", grade: "B", level: "LD", credits: "2", usGrade: "B", usCredits: "1.50", conversionSource: "AI_INFERRED" },
        { id: 1029, name: "Principles of Management", year: "2004", grade: "B", level: "LD", credits: "2", usGrade: "B", usCredits: "1.50", conversionSource: "AI_INFERRED" },
        { id: 1030, name: "Co-operative Field Administration", year: "2004", grade: "C", level: "LD", credits: "2", usGrade: "C", usCredits: "1.50", conversionSource: "AI_INFERRED" },
        { id: 1031, name: "Principles of Marketing", year: "2004", grade: "B", level: "LD", credits: "2", usGrade: "B", usCredits: "1.50", conversionSource: "AI_INFERRED" },
        { id: 1032, name: "Practice of Purchasing", year: "2004", grade: "B", level: "LD", credits: "2", usGrade: "B", usCredits: "1.50", conversionSource: "AI_INFERRED" },
        { id: 1033, name: "Domestic Banking", year: "2004", grade: "BC", level: "LD", credits: "2", usGrade: "C+", usCredits: "1.50", conversionSource: "AI_INFERRED" },
        { id: 1034, name: "Cost Accounting", year: "2004", grade: "BC", level: "LD", credits: "3", usGrade: "C+", usCredits: "2.00", conversionSource: "AI_INFERRED" },
        { id: 1035, name: "Practice of Marketing", year: "2004", grade: "BC", level: "LD", credits: "2", usGrade: "C+", usCredits: "1.50", conversionSource: "AI_INFERRED" },
        { id: 1036, name: "Small Business Enterprise", year: "2004", grade: "B", level: "LD", credits: "2", usGrade: "B", usCredits: "1.50", conversionSource: "AI_INFERRED" },
        { id: 1037, name: "Office Administration", year: "2004", grade: "C", level: "LD", credits: "2", usGrade: "C", usCredits: "1.50", conversionSource: "AI_INFERRED" },
        { id: 1038, name: "Principles of Management", year: "2004", grade: "B", level: "LD", credits: "2", usGrade: "B", usCredits: "1.50", conversionSource: "AI_INFERRED" },
        { id: 1039, name: "Public Administration", year: "2004", grade: "BC", level: "LD", credits: "2", usGrade: "C+", usCredits: "1.50", conversionSource: "AI_INFERRED" },
        { id: 1040, name: "Project", year: "2004", grade: "BC", level: "LD", credits: "2", usGrade: "C+", usCredits: "1.50", conversionSource: "AI_INFERRED" },
      ],
      program: "Business Administration & Management",
      totalCredits: "",
      yearsAttended: "2002 - 2005",
      grantsAccessTo: "Higher National Diploma",
      gradeConversion: [
        { grade: "A (70-100)", usGrade: "A" },
        { grade: "B (60-69)", usGrade: "B" },
        { grade: "BC (50-59)", usGrade: "C+" },
        { grade: "C (40-49)", usGrade: "C" },
        { grade: "CD (30-39)", usGrade: "D+" },
        { grade: "D (20-29)", usGrade: "D" },
        { grade: "E (10-19)", usGrade: "D-" },
        { grade: "F (0-9)", usGrade: "F" },
      ],
      yearOfGraduation: "2005",
      awardingInstitution: "Auchi Polytechnic, Auchi",
      equivalenceStatement: "Two years of undergraduate study with a major in Business Administration & Management",
      admissionRequirements: "N/A",
      standardProgramLength: "Two years",
    },
    {
      id: 2,
      gpa: "",
      country: "Nigeria",
      courses: [
        { id: 2001, name: "Quantitative Techniques", year: "2007", grade: "C", level: "UD", credits: "3", usGrade: "C", usCredits: "2.00", conversionSource: "AI_INFERRED" },
        { id: 2002, name: "Production Management", year: "2007", grade: "C", level: "UD", credits: "3", usGrade: "C", usCredits: "2.00", conversionSource: "AI_INFERRED" },
        { id: 2003, name: "Financial Management", year: "2007", grade: "BC", level: "UD", credits: "3", usGrade: "C+", usCredits: "2.00", conversionSource: "AI_INFERRED" },
        { id: 2004, name: "Practice of Management", year: "2007", grade: "BC", level: "UD", credits: "2", usGrade: "C+", usCredits: "1.50", conversionSource: "AI_INFERRED" },
        { id: 2005, name: "Organizational Behavior", year: "2007", grade: "B", level: "UD", credits: "2", usGrade: "B", usCredits: "1.50", conversionSource: "AI_INFERRED" },
        { id: 2006, name: "Personnel Management", year: "2007", grade: "C", level: "UD", credits: "2", usGrade: "C", usCredits: "1.50", conversionSource: "AI_INFERRED" },
        { id: 2007, name: "Use of English", year: "2007", grade: "C", level: "UD", credits: "2", usGrade: "C", usCredits: "1.50", conversionSource: "AI_INFERRED" },
        { id: 2008, name: "International Relations", year: "2007", grade: "BC", level: "UD", credits: "2", usGrade: "C+", usCredits: "1.50", conversionSource: "AI_INFERRED" },
        { id: 2009, name: "Local Government Administration", year: "2007", grade: "C", level: "UD", credits: "2", usGrade: "C", usCredits: "1.50", conversionSource: "AI_INFERRED" },
        { id: 2010, name: "Moral Philosophy", year: "2007", grade: "B", level: "UD", credits: "2", usGrade: "B", usCredits: "1.50", conversionSource: "AI_INFERRED" },
        { id: 2011, name: "Research Methods", year: "2007", grade: "C", level: "UD", credits: "2", usGrade: "C", usCredits: "1.50", conversionSource: "AI_INFERRED" },
        { id: 2012, name: "Organizational Behavior", year: "2007", grade: "A", level: "UD", credits: "2", usGrade: "A", usCredits: "1.50", conversionSource: "AI_INFERRED" },
        { id: 2013, name: "Advanced Cost Accounting", year: "2007", grade: "A", level: "UD", credits: "3", usGrade: "A", usCredits: "2.00", conversionSource: "AI_INFERRED" },
        { id: 2014, name: "Production Management II", year: "2007", grade: "C", level: "UD", credits: "3", usGrade: "C", usCredits: "2.00", conversionSource: "AI_INFERRED" },
        { id: 2015, name: "Element of Entrepreneurship", year: "2007", grade: "B", level: "UD", credits: "2", usGrade: "B", usCredits: "1.50", conversionSource: "AI_INFERRED" },
        { id: 2016, name: "Financial Management", year: "2007", grade: "B", level: "UD", credits: "3", usGrade: "B", usCredits: "2.00", conversionSource: "AI_INFERRED" },
        { id: 2017, name: "Communication in English", year: "2007", grade: "BC", level: "UD", credits: "2", usGrade: "C+", usCredits: "1.50", conversionSource: "AI_INFERRED" },
        { id: 2018, name: "Social Philosophy", year: "2007", grade: "B", level: "UD", credits: "2", usGrade: "B", usCredits: "1.50", conversionSource: "AI_INFERRED" },
        { id: 2019, name: "Small Business Management", year: "2007", grade: "B", level: "UD", credits: "2", usGrade: "B", usCredits: "1.50", conversionSource: "AI_INFERRED" },
        { id: 2020, name: "Personnel Management II", year: "2007", grade: "BC", level: "UD", credits: "2", usGrade: "C+", usCredits: "1.50", conversionSource: "AI_INFERRED" },
        { id: 2021, name: "Computer Packages", year: "2007", grade: "B", level: "UD", credits: "2", usGrade: "B", usCredits: "1.50", conversionSource: "AI_INFERRED" },
        { id: 2022, name: "Business Policy", year: "2008", grade: "C", level: "UD", credits: "3", usGrade: "C", usCredits: "2.00", conversionSource: "AI_INFERRED" },
        { id: 2023, name: "Managerial Economics", year: "2008", grade: "C", level: "UD", credits: "3", usGrade: "C", usCredits: "2.00", conversionSource: "AI_INFERRED" },
        { id: 2024, name: "Industrial Relations", year: "2008", grade: "B", level: "UD", credits: "2", usGrade: "B", usCredits: "1.50", conversionSource: "AI_INFERRED" },
        { id: 2025, name: "Public Sector Accounting", year: "2008", grade: "B", level: "UD", credits: "3", usGrade: "B", usCredits: "2.00", conversionSource: "AI_INFERRED" },
        { id: 2026, name: "Marketing Management", year: "2008", grade: "C", level: "UD", credits: "2", usGrade: "C", usCredits: "1.50", conversionSource: "AI_INFERRED" },
        { id: 2027, name: "Purchasing & Material Management", year: "2008", grade: "C", level: "UD", credits: "2", usGrade: "C", usCredits: "1.50", conversionSource: "AI_INFERRED" },
        { id: 2028, name: "Communication in English", year: "2008", grade: "C", level: "UD", credits: "2", usGrade: "C", usCredits: "1.50", conversionSource: "AI_INFERRED" },
        { id: 2029, name: "Entrepreneurship Development", year: "2008", grade: "B", level: "UD", credits: "2", usGrade: "B", usCredits: "1.50", conversionSource: "AI_INFERRED" },
        { id: 2030, name: "Business Policy", year: "2008", grade: "BC", level: "UD", credits: "3", usGrade: "C+", usCredits: "2.00", conversionSource: "AI_INFERRED" },
        { id: 2031, name: "Managerial Economics", year: "2008", grade: "BC", level: "UD", credits: "3", usGrade: "C+", usCredits: "2.00", conversionSource: "AI_INFERRED" },
        { id: 2032, name: "International Business", year: "2008", grade: "BC", level: "UD", credits: "2", usGrade: "C+", usCredits: "1.50", conversionSource: "AI_INFERRED" },
        { id: 2033, name: "Company Law", year: "2008", grade: "BC", level: "UD", credits: "2", usGrade: "C+", usCredits: "1.50", conversionSource: "AI_INFERRED" },
        { id: 2034, name: "Project", year: "2008", grade: "B", level: "UD", credits: "3", usGrade: "B", usCredits: "2.00", conversionSource: "AI_INFERRED" },
        { id: 2035, name: "Industrial labour Law", year: "2008", grade: "B", level: "UD", credits: "2", usGrade: "B", usCredits: "1.50", conversionSource: "AI_INFERRED" },
        { id: 2036, name: "Management Accounting", year: "2008", grade: "B", level: "UD", credits: "3", usGrade: "B", usCredits: "2.00", conversionSource: "AI_INFERRED" },
        { id: 2037, name: "Literary Appreciation", year: "2008", grade: "C", level: "UD", credits: "2", usGrade: "C", usCredits: "1.50", conversionSource: "AI_INFERRED" },
        { id: 2038, name: "Marketing Management II", year: "2008", grade: "BC", level: "UD", credits: "2", usGrade: "C+", usCredits: "1.50", conversionSource: "AI_INFERRED" },
        { id: 2039, name: "Public Enterprise Management", year: "2008", grade: "BC", level: "UD", credits: "2", usGrade: "C+", usCredits: "1.50", conversionSource: "AI_INFERRED" },
      ],
      program: "Business Administration & Management",
      totalCredits: "",
      yearsAttended: "2007 - 2009",
      grantsAccessTo: "Bachelor's Degree / Employment",
      gradeConversion: [
        { grade: "A (70-100)", usGrade: "A" },
        { grade: "B (60-69)", usGrade: "B" },
        { grade: "BC (50-59)", usGrade: "C+" },
        { grade: "C (40-49)", usGrade: "C" },
        { grade: "CD (30-39)", usGrade: "D+" },
        { grade: "D (20-29)", usGrade: "D" },
        { grade: "E (10-19)", usGrade: "D-" },
        { grade: "F (0-9)", usGrade: "F" },
      ],
      yearOfGraduation: "2009",
      awardingInstitution: "Auchi Polytechnic, Auchi",
      equivalenceStatement: "Two years of undergraduate study with a major in Business Administration & Management",
      admissionRequirements: "National Diploma",
      standardProgramLength: "Two years",
    },
  ],
  evaluatorName: "Hongjian Chen",
  evaluationNotes: "The evaluation considers the National Diploma (ND) and Higher National Diploma (HND) awarded by Auchi Polytechnic, a recognized institution under the National Board for Technical Education (NBTE) in Nigeria. Credit conversion is based on the standard academic workload where 30 US semester credits equate to one full academic year. The ND and HND are each two-year programs. In the US, the combination of a two-year National Diploma followed by a two-year Higher National Diploma in a related field is considered equivalent to a Bachelor's degree. Grades were converted according to the provided scale where B grades map to US B, BC to US C+, and C to US C.",
  evaluatorSignature: "",
  seniorEvaluatorName: "Luguan Yan",
  seniorEvaluatorSignature: "/luguan-yan-signature.png",
})


export const rehydrateData = (data: SampleData): SampleData => {
  return {
    ...data,
    credentials: data.credentials.map((cred) => ({
      ...cred,
      get gpa() {
        return calculateStats(this.courses).gpa
      },
      get totalCredits() {
        return calculateStats(this.courses).totalCredits
      },
    })),
  }
}
