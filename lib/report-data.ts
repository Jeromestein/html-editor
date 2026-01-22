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

const ALBANIA_COURSES: Course[] = [
  { id: 1001, name: "Mathematics I", year: "", grade: "5(five)", level: "LD", credits: "N/A", usGrade: "C", usCredits: "3.00", conversionSource: "AICE_RULES" },
  { id: 1002, name: "Physics I", year: "", grade: "5(five)", level: "LD", credits: "N/A", usGrade: "C", usCredits: "3.00", conversionSource: "AICE_RULES" },
  { id: 1003, name: "Chemistry", year: "", grade: "7(seven)", level: "LD", credits: "N/A", usGrade: "B", usCredits: "3.00", conversionSource: "AICE_RULES" },
  { id: 1004, name: "Physical education", year: "", grade: "10(ten)", level: "LD", credits: "N/A", usGrade: "A", usCredits: "1.50", conversionSource: "AICE_RULES" },
  { id: 1005, name: "Foreign language ( Russian)", year: "", grade: "8(eight)", level: "LD", credits: "N/A", usGrade: "B", usCredits: "3.00", conversionSource: "AICE_RULES" },
  { id: 1006, name: "Mathematics II", year: "", grade: "5(five)", level: "LD", credits: "N/A", usGrade: "C", usCredits: "3.00", conversionSource: "AICE_RULES" },
  { id: 1007, name: "Physics II", year: "", grade: "5(five)", level: "LD", credits: "N/A", usGrade: "C", usCredits: "3.00", conversionSource: "AICE_RULES" },
  { id: 1008, name: "Descriptive geometry", year: "", grade: "5(five)", level: "LD", credits: "N/A", usGrade: "C", usCredits: "3.00", conversionSource: "AICE_RULES" },
  { id: 1009, name: "Technical design", year: "", grade: "7(seven)", level: "LD", credits: "N/A", usGrade: "B", usCredits: "3.00", conversionSource: "AICE_RULES" },
  { id: 1010, name: "Theoretical mechanics", year: "", grade: "5(five)", level: "LD", credits: "N/A", usGrade: "C", usCredits: "3.00", conversionSource: "AICE_RULES" },
  { id: 1011, name: "Productive labor, professional practice", year: "", grade: "8(eight)", level: "LD", credits: "N/A", usGrade: "B", usCredits: "3.00", conversionSource: "AICE_RULES" },
  { id: 1012, name: "Mathematics III", year: "", grade: "5(five)", level: "LD", credits: "N/A", usGrade: "C", usCredits: "3.00", conversionSource: "AICE_RULES" },
  { id: 1013, name: "Physics III", year: "", grade: "5(five)", level: "LD", credits: "N/A", usGrade: "C", usCredits: "3.00", conversionSource: "AICE_RULES" },
  { id: 1014, name: "Material resistance I", year: "", grade: "6(six)", level: "LD", credits: "N/A", usGrade: "C", usCredits: "3.00", conversionSource: "AICE_RULES" },
  { id: 1015, name: "Physical education", year: "", grade: "9(nine)", level: "LD", credits: "N/A", usGrade: "A", usCredits: "1.50", conversionSource: "AICE_RULES" },
  { id: 1016, name: "Foreign language", year: "", grade: "5(five)", level: "LD", credits: "N/A", usGrade: "C", usCredits: "3.00", conversionSource: "AICE_RULES" },
  { id: 1017, name: "mathematics IV", year: "", grade: "6(six)", level: "LD", credits: "N/A", usGrade: "C", usCredits: "3.00", conversionSource: "AICE_RULES" },
  { id: 1018, name: "Technical design", year: "", grade: "8(eight)", level: "LD", credits: "N/A", usGrade: "B", usCredits: "3.00", conversionSource: "AICE_RULES" },
  { id: 1019, name: "Informatics", year: "", grade: "7(seven)", level: "LD", credits: "N/A", usGrade: "B", usCredits: "3.00", conversionSource: "AICE_RULES" },
  { id: 1020, name: "Theoretical mechanics", year: "", grade: "5(five)", level: "LD", credits: "N/A", usGrade: "C", usCredits: "3.00", conversionSource: "AICE_RULES" },
  { id: 1021, name: "Material resistance II", year: "", grade: "6(six)", level: "UD", credits: "N/A", usGrade: "C", usCredits: "3.00", conversionSource: "AICE_RULES" },
  { id: 1022, name: "Building material", year: "", grade: "6(six)", level: "UD", credits: "N/A", usGrade: "C", usCredits: "3.00", conversionSource: "AICE_RULES" },
  { id: 1023, name: "Elasticity and plasticity theory", year: "", grade: "7(seven)", level: "UD", credits: "N/A", usGrade: "B", usCredits: "3.00", conversionSource: "AICE_RULES" },
  { id: 1024, name: "Theory of structures I", year: "", grade: "6(six)", level: "UD", credits: "N/A", usGrade: "C", usCredits: "3.00", conversionSource: "AICE_RULES" },
  { id: 1025, name: "Engineering geodesy course task", year: "", grade: "6(six)", level: "UD", credits: "N/A", usGrade: "C", usCredits: "1.50", conversionSource: "AICE_RULES" },
  { id: 1026, name: "Engineering geodesy", year: "", grade: "5(five)", level: "UD", credits: "N/A", usGrade: "C", usCredits: "3.00", conversionSource: "AICE_RULES" },
  { id: 1027, name: "Engineering geology", year: "", grade: "5(five)", level: "UD", credits: "N/A", usGrade: "C", usCredits: "3.00", conversionSource: "AICE_RULES" },
  { id: 1028, name: "Hydraulics", year: "", grade: "5(five)", level: "UD", credits: "N/A", usGrade: "C", usCredits: "3.00", conversionSource: "AICE_RULES" },
  { id: 1029, name: "Electrotechnique", year: "", grade: "6(six)", level: "UD", credits: "N/A", usGrade: "C", usCredits: "3.00", conversionSource: "AICE_RULES" },
  { id: 1030, name: "Architecture I course task", year: "", grade: "8(eight)", level: "UD", credits: "N/A", usGrade: "B", usCredits: "1.50", conversionSource: "AICE_RULES" },
  { id: 1031, name: "Architecture I", year: "", grade: "7(seven)", level: "UD", credits: "N/A", usGrade: "B", usCredits: "3.00", conversionSource: "AICE_RULES" },
  { id: 1032, name: "Building machinery and mechanisms", year: "", grade: "10(ten)", level: "UD", credits: "N/A", usGrade: "A", usCredits: "3.00", conversionSource: "AICE_RULES" },
  { id: 1033, name: "Theoretical mechanics II ( dynamics)", year: "", grade: "5(five)", level: "UD", credits: "N/A", usGrade: "C", usCredits: "3.00", conversionSource: "AICE_RULES" },
  { id: 1034, name: "Theory of structures II", year: "", grade: "5(five)", level: "UD", credits: "N/A", usGrade: "C", usCredits: "3.00", conversionSource: "AICE_RULES" },
  { id: 1035, name: "Water and sewerage supply course task", year: "", grade: "7(seven)", level: "UD", credits: "N/A", usGrade: "B", usCredits: "1.50", conversionSource: "AICE_RULES" },
  { id: 1036, name: "Water and sewerage supply", year: "", grade: "6(six)", level: "UD", credits: "N/A", usGrade: "C", usCredits: "3.00", conversionSource: "AICE_RULES" },
  { id: 1037, name: "Mechanics of grounds and rocks", year: "", grade: "7(seven)", level: "UD", credits: "N/A", usGrade: "B", usCredits: "3.00", conversionSource: "AICE_RULES" },
  { id: 1038, name: "Theory of structures II", year: "", grade: "5(five)", level: "UD", credits: "N/A", usGrade: "C", usCredits: "3.00", conversionSource: "AICE_RULES" },
  { id: 1039, name: "Concrete/and ferro concrete constructions course task", year: "", grade: "6(six)", level: "UD", credits: "N/A", usGrade: "C", usCredits: "1.50", conversionSource: "AICE_RULES" },
  { id: 1040, name: "Concrete/and ferro concrete constructions", year: "", grade: "5(five)", level: "UD", credits: "N/A", usGrade: "C", usCredits: "3.00", conversionSource: "AICE_RULES" },
  { id: 1041, name: "Heating ventilation term-technique", year: "", grade: "6(six)", level: "UD", credits: "N/A", usGrade: "C", usCredits: "3.00", conversionSource: "AICE_RULES" },
  { id: 1042, name: "Architecture II course task", year: "", grade: "8(eight)", level: "UD", credits: "N/A", usGrade: "B", usCredits: "1.50", conversionSource: "AICE_RULES" },
  { id: 1043, name: "Architecture II", year: "", grade: "10(ten)", level: "UD", credits: "N/A", usGrade: "A", usCredits: "3.00", conversionSource: "AICE_RULES" },
  { id: 1044, name: "Modeling experimentation", year: "", grade: "10(ten)", level: "UD", credits: "N/A", usGrade: "A", usCredits: "3.00", conversionSource: "AICE_RULES" },
  { id: 1045, name: "Building economics", year: "", grade: "10(ten)", level: "UD", credits: "N/A", usGrade: "A", usCredits: "3.00", conversionSource: "AICE_RULES" },
  { id: 1046, name: "Foundations technique", year: "", grade: "7(seven)", level: "UD", credits: "N/A", usGrade: "B", usCredits: "3.00", conversionSource: "AICE_RULES" },
  { id: 1047, name: "Special concrete/ferro concrete constructions course task", year: "", grade: "6(six)", level: "UD", credits: "N/A", usGrade: "C", usCredits: "1.50", conversionSource: "AICE_RULES" },
  { id: 1048, name: "Special concrete/ferro concrete constructions", year: "", grade: "6(six)", level: "UD", credits: "N/A", usGrade: "C", usCredits: "3.00", conversionSource: "AICE_RULES" },
  { id: 1049, name: "Technology organization course task", year: "", grade: "8(eight)", level: "UD", credits: "N/A", usGrade: "B", usCredits: "1.50", conversionSource: "AICE_RULES" },
  { id: 1050, name: "Technology organization", year: "", grade: "9(nine)", level: "UD", credits: "N/A", usGrade: "A", usCredits: "3.00", conversionSource: "AICE_RULES" },
  { id: 1051, name: "Metal wood constructions course task", year: "", grade: "7(seven)", level: "UD", credits: "N/A", usGrade: "B", usCredits: "1.50", conversionSource: "AICE_RULES" },
  { id: 1052, name: "Metal wood constructions", year: "", grade: "6(six)", level: "UD", credits: "N/A", usGrade: "C", usCredits: "3.00", conversionSource: "AICE_RULES" },
  { id: 1053, name: "Professional practice", year: "", grade: "8(eight)", level: "UD", credits: "N/A", usGrade: "B", usCredits: "3.00", conversionSource: "AICE_RULES" },
  { id: 1054, name: "Diploma mark", year: "", grade: "8(eight)", level: "UD", credits: "N/A", usGrade: "B", usCredits: "6.00", conversionSource: "AICE_RULES" },
]

export const buildSampleData = (): SampleData => ({
  refNo: "LA-20260116-106",
  name: "N/A",
  dob: "N/A",
  country: "Albania",
  date: "January 16, 2026",
  purpose: "N/A",
  documents: [
    { title: "DIPLOMA", issuedBy: "Polytechnic University of Tirana (Universiteti Politeknik i Tiranës)", dateIssued: "Jul 7, 1994", certificateNo: "N/A" },
    { title: "TRANSCRIPT", issuedBy: "Polytechnic University of Tirana (Universiteti Politeknik i Tiranës)", dateIssued: "Oct 21, 2011", certificateNo: "N/A" },
  ],
  credentials: [
    {
      id: 1,
      awardingInstitution: "Polytechnic University of Tirana (Universiteti Politeknik i Tiranës)",
      country: "Albania",
      admissionRequirements: "N/A",
      program: "Construction (Ndërtim)",
      grantsAccessTo: "Engineer For Public & Industrial Buildings",
      standardProgramLength: "Five years",
      yearsAttended: "1989 - 1994",
      yearOfGraduation: "1994",
      equivalenceStatement: "Bachelor's and Master's degree in Civil Engineering",
      gpa: "2.55",
      totalCredits: "150.00",
      gradeConversion: [
        { grade: "10 (Excellent/Shkëlqyeshëm)", usGrade: "A" },
        { grade: "9.00-9.99 (Very Good/Shumë mirë)", usGrade: "A-" },
        { grade: "8.00-8.99 (Good/Mirë)", usGrade: "B+" },
        { grade: "7.00-7.99 (Satisfactory/Kënaqshëm)", usGrade: "B" },
        { grade: "6.00-6.99 (Sufficient/Mjaftueshëm)", usGrade: "C+" },
        { grade: "5.00-5.99 (Passable/Kalueshëm)", usGrade: "C" },
        { grade: "1.00-4.99 (Fail/Mbetës)", usGrade: "F" },
      ],
      courses: ALBANIA_COURSES,
    },
  ],
  evaluationNotes: "The credit conversion is based on the standard US workload where one academic year of full-time study is equivalent to 30 semester credits. Since the original document does not provide specific credit values per course, credits have been assigned based on a standard 150-credit distribution for a five-year integrated program (30 credits per year). Courses designated as 'course tasks' or 'practice' were assigned lower weight (1.5 credits), while standard academic courses were assigned 3.0 credits. The final Diploma project was assigned 6.0 credits to reflect its comprehensive nature.",
  evaluatorName: "Jianjun Zhao",
  evaluatorSignature: "",
  seniorEvaluatorName: "Luguan Yan",
  seniorEvaluatorSignature: "/luguan-yan-signature.png",
  references: `• International Association of Universities (IAU). (2019). International Handbook of Universities (29th). Palgrave Macmillan.
• Europa Publications. (2021). The Europa World of Learning (72nd). Routledge.
• IAU / UNESCO. (2026). World Higher Education Database (WHED).
• Polytechnic University of Tirana. (n.d.). Home. Retrieved from https://www.upt.edu.al`,
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
