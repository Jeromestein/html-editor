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



export const buildSampleData = (): SampleData => ({
  refNo: "LA-20260116-107",
  name: "N/A",
  dob: "N/A",
  country: "Iran",
  date: "January 16, 2026",
  purpose: "N/A",
  documents: [
    { title: "Official Transcript", issuedBy: "Bahá'í Institute for Higher Education (BIHE) (موسسه آموزش عالی علمی)", dateIssued: "Nov 9, 2011", certificateNo: "N/A" }
  ],
  credentials: [
    {
      id: 1,
      awardingInstitution: "Bahá'í Institute for Higher Education (BIHE) (موسسه آموزش عالی علمی)",
      country: "Iran",
      admissionRequirements: "Completion of upper secondary education and successful performance in a competitive entrance examination. This is the equivalent of graduation from a college preparatory program at an accredited high school in the United States.",
      program: "Applied Chemistry",
      grantsAccessTo: "Bachelor of Science (B.Sc.)",
      standardProgramLength: "Four years",
      yearsAttended: "2004 - 2010",
      yearOfGraduation: "2010",
      equivalenceStatement: "Bachelor of Science degree with a major in Applied Chemistry",
      gpa: "2.84",
      totalCredits: "119.00",
      gradeConversion: [
        { grade: "A (Excellent)", usGrade: "A" },
        { grade: "A- (Excellent)", usGrade: "A-" },
        { grade: "B+ (Very Good)", usGrade: "B+" },
        { grade: "B (Very Good)", usGrade: "B" },
        { grade: "B- (Very Good)", usGrade: "B-" },
        { grade: "C+ (Good)", usGrade: "C+" },
        { grade: "C (Good)", usGrade: "C" },
        { grade: "C- (Good)", usGrade: "C-" },
        { grade: "D+ (Satisfactory/Pass)", usGrade: "D+" },
        { grade: "D (Satisfactory/Pass)", usGrade: "D" },
        { grade: "F (Fail)", usGrade: "F" }
      ],
      courses: [
        { id: 1001, name: "ENGLISH 1", year: "2004", grade: "A-", level: "LD", credits: "2", usGrade: "A-", usCredits: "2.00", conversionSource: "AICE_RULES" },
        { id: 1002, name: "ARABIC 1", year: "2004", grade: "B+", level: "LD", credits: "2", usGrade: "B+", usCredits: "2.00", conversionSource: "AICE_RULES" },
        { id: 1003, name: "GENERAL CHEMISTRY I", year: "2004", grade: "C+", level: "LD", credits: "3", usGrade: "C+", usCredits: "3.00", conversionSource: "AICE_RULES" },
        { id: 1004, name: "PERSIAN WRITING SKILLS", year: "2004", grade: "A", level: "LD", credits: "3", usGrade: "A", usCredits: "3.00", conversionSource: "AICE_RULES" },
        { id: 1005, name: "GENERAL PHYSICS I", year: "2004", grade: "C+", level: "LD", credits: "3", usGrade: "C+", usCredits: "3.00", conversionSource: "AICE_RULES" },
        { id: 1006, name: "GENERAL CHEMISTRY LAB. I", year: "2004", grade: "A-", level: "LD", credits: "1", usGrade: "A-", usCredits: "1.00", conversionSource: "AICE_RULES" },
        { id: 1007, name: "CALCULUS I PART 1", year: "2004", grade: "B-", level: "LD", credits: "2", usGrade: "B-", usCredits: "2.00", conversionSource: "AICE_RULES" },
        { id: 1008, name: "GENERAL CHEMISTRY II", year: "2005", grade: "C-", level: "LD", credits: "3", usGrade: "C-", usCredits: "3.00", conversionSource: "AICE_RULES" },
        { id: 1009, name: "ENGLISH 2", year: "2005", grade: "B+", level: "LD", credits: "2", usGrade: "B+", usCredits: "2.00", conversionSource: "AICE_RULES" },
        { id: 1010, name: "ARABIC 2", year: "2005", grade: "B+", level: "LD", credits: "2", usGrade: "B+", usCredits: "2.00", conversionSource: "AICE_RULES" },
        { id: 1011, name: "GENERAL PHYSICS II", year: "2005", grade: "C+", level: "LD", credits: "3", usGrade: "C+", usCredits: "3.00", conversionSource: "AICE_RULES" },
        { id: 1012, name: "PHYSICS LABORATORY I", year: "2005", grade: "A-", level: "LD", credits: "1", usGrade: "A-", usCredits: "1.00", conversionSource: "AICE_RULES" },
        { id: 1013, name: "GENERAL CHEMISTRY LAB. II", year: "2005", grade: "B+", level: "LD", credits: "1", usGrade: "B+", usCredits: "1.00", conversionSource: "AICE_RULES" },
        { id: 1014, name: "RELIGIOUS TEXT: SACRED WRITINGS OF BAHA'U'LLAH", year: "2005", grade: "B+", level: "LD", credits: "2", usGrade: "B+", usCredits: "2.00", conversionSource: "AICE_RULES" },
        { id: 1015, name: "CALCULUS I PART 2", year: "2005", grade: "B-", level: "LD", credits: "2", usGrade: "B-", usCredits: "2.00", conversionSource: "AICE_RULES" },
        { id: 1016, name: "ENGLISH III", year: "2005", grade: "B-", level: "LD", credits: "3", usGrade: "B-", usCredits: "3.00", conversionSource: "AICE_RULES" },
        { id: 1017, name: "CALCULUS II", year: "2005", grade: "C", level: "LD", credits: "4", usGrade: "C", usCredits: "4.00", conversionSource: "AICE_RULES" },
        { id: 1018, name: "ORGANIC CHEMISTRY I", year: "2005", grade: "D+", level: "LD", credits: "3", usGrade: "D+", usCredits: "3.00", conversionSource: "AICE_RULES" },
        { id: 1019, name: "GENERAL PHYSICS III", year: "2005", grade: "C+", level: "LD", credits: "3", usGrade: "C+", usCredits: "3.00", conversionSource: "AICE_RULES" },
        { id: 1020, name: "PHYSICS LABORATORY II", year: "2005", grade: "A", level: "LD", credits: "1", usGrade: "A", usCredits: "1.00", conversionSource: "AICE_RULES" },
        { id: 1021, name: "COMPUTER WORKSHOP", year: "2005", grade: "A", level: "LD", credits: "1", usGrade: "A", usCredits: "1.00", conversionSource: "AICE_RULES" },
        { id: 1022, name: "INTRODUCTION TO LITERATURE", year: "2005", grade: "A", level: "LD", credits: "2", usGrade: "A", usCredits: "2.00", conversionSource: "AICE_RULES" },
        { id: 1023, name: "ORGANIC CHEMISTRY II", year: "2006", grade: "C-", level: "LD", credits: "3", usGrade: "C-", usCredits: "3.00", conversionSource: "AICE_RULES" },
        { id: 1024, name: "ANALYTICAL CHEMISTRY I", year: "2006", grade: "B+", level: "LD", credits: "1", usGrade: "B+", usCredits: "1.00", conversionSource: "AICE_RULES" },
        { id: 1025, name: "ANALYTICAL CHEMISTRY LAB. I", year: "2006", grade: "B", level: "LD", credits: "1", usGrade: "B", usCredits: "1.00", conversionSource: "AICE_RULES" },
        { id: 1026, name: "GENERAL PHYSICS IV", year: "2006", grade: "B+", level: "LD", credits: "3", usGrade: "B+", usCredits: "3.00", conversionSource: "AICE_RULES" },
        { id: 1027, name: "ENGLISH FOR STUDENTS OF APPLIED CHEMISTRY", year: "2006", grade: "B", level: "LD", credits: "3", usGrade: "B", usCredits: "3.00", conversionSource: "AICE_RULES" },
        { id: 1028, name: "INORGANIC CHEMISTRY I", year: "2006", grade: "B+", level: "LD", credits: "3", usGrade: "B+", usCredits: "3.00", conversionSource: "AICE_RULES" },
        { id: 1029, name: "MESSAGES FROM THE WORLD CENTER OF THE BAHAI FAITH", year: "2006", grade: "D", level: "LD", credits: "2", usGrade: "D", usCredits: "2.00", conversionSource: "AICE_RULES" },
        { id: 1030, name: "BASIC COMPUTER PROGRAMMING", year: "2006", grade: "D", level: "UD", credits: "3", usGrade: "D", usCredits: "3.00", conversionSource: "AICE_RULES" },
        { id: 1031, name: "MECHANISM OF ORGANIC REACTIONS", year: "2006", grade: "B-", level: "UD", credits: "2", usGrade: "B-", usCredits: "2.00", conversionSource: "AICE_RULES" },
        { id: 1032, name: "PHYSICAL CHEMISTRY I", year: "2006", grade: "A-", level: "UD", credits: "3", usGrade: "A-", usCredits: "3.00", conversionSource: "AICE_RULES" },
        { id: 1033, name: "ANALYTICAL CHEMISTRY II", year: "2006", grade: "D", level: "UD", credits: "2", usGrade: "D", usCredits: "2.00", conversionSource: "AICE_RULES" },
        { id: 1034, name: "ANALYTICAL CHEMISTRY LAB. II", year: "2006", grade: "B-", level: "UD", credits: "2", usGrade: "B-", usCredits: "2.00", conversionSource: "AICE_RULES" },
        { id: 1035, name: "ORGANIC CHEMISTRY III (Failed)", year: "2006", grade: "F", level: "UD", credits: "3", usGrade: "F", usCredits: "3.00", conversionSource: "AICE_RULES" },
        { id: 1036, name: "INORGANIC CHEMISTRY II", year: "2006", grade: "B", level: "UD", credits: "3", usGrade: "B", usCredits: "3.00", conversionSource: "AICE_RULES" },
        { id: 1037, name: "PHYSICAL CHEMISTRY LAB. I", year: "2006", grade: "A-", level: "UD", credits: "1", usGrade: "A-", usCredits: "1.00", conversionSource: "AICE_RULES" },
        { id: 1038, name: "ORGANIC CHEMISTRY LAB. I", year: "2006", grade: "A", level: "UD", credits: "1", usGrade: "A", usCredits: "1.00", conversionSource: "AICE_RULES" },
        { id: 1039, name: "BASIC PRINCIPLES & CALCULATIONS IN CHEMICAL ENGINEERING", year: "2007", grade: "A", level: "UD", credits: "3", usGrade: "A", usCredits: "3.00", conversionSource: "AICE_RULES" },
        { id: 1040, name: "PHYSICAL CHEMISTRY II", year: "2007", grade: "C+", level: "UD", credits: "3", usGrade: "C+", usCredits: "3.00", conversionSource: "AICE_RULES" },
        { id: 1041, name: "CHEMISTRY OF MACROMOLECULES", year: "2007", grade: "C-", level: "UD", credits: "2", usGrade: "C-", usCredits: "2.00", conversionSource: "AICE_RULES" },
        { id: 1042, name: "GENERAL METALLURGY", year: "2007", grade: "A", level: "UD", credits: "3", usGrade: "A", usCredits: "3.00", conversionSource: "AICE_RULES" },
        { id: 1043, name: "ADVANCED INORGANIC CHEMISTRY", year: "2007", grade: "A-", level: "UD", credits: "3", usGrade: "A-", usCredits: "3.00", conversionSource: "AICE_RULES" },
        { id: 1044, name: "INORGANIC CHEMISTRY LAB. I", year: "2007", grade: "C", level: "UD", credits: "1", usGrade: "C", usCredits: "1.00", conversionSource: "AICE_RULES" },
        { id: 1045, name: "PHYSICAL CHEMISTRY LAB. II", year: "2007", grade: "B", level: "UD", credits: "1", usGrade: "B", usCredits: "1.00", conversionSource: "AICE_RULES" },
        { id: 1046, name: "PROBABILITY & STATISTICS", year: "2007", grade: "D+", level: "UD", credits: "3", usGrade: "D+", usCredits: "3.00", conversionSource: "AICE_RULES" },
        { id: 1047, name: "PRINCIPLES OF INDUSTRIAL WATER TREATMENT", year: "2007", grade: "B", level: "UD", credits: "3", usGrade: "B", usCredits: "3.00", conversionSource: "AICE_RULES" },
        { id: 1048, name: "FOOD INDUSTRIES", year: "2007", grade: "B+", level: "UD", credits: "3", usGrade: "B+", usCredits: "3.00", conversionSource: "AICE_RULES" },
        { id: 1049, name: "INDUSTRIAL CHEMISTRY I", year: "2007", grade: "A", level: "UD", credits: "3", usGrade: "A", usCredits: "3.00", conversionSource: "AICE_RULES" },
        { id: 1050, name: "ORGANIC CHEMISTRY III (Repeated)", year: "2007", grade: "D", level: "UD", credits: "3", usGrade: "D", usCredits: "3.00", conversionSource: "AICE_RULES" },
        { id: 1051, name: "INSTRUMENTAL ANALYSIS I", year: "2007", grade: "C", level: "UD", credits: "2", usGrade: "C", usCredits: "2.00", conversionSource: "AICE_RULES" },
        { id: 1052, name: "INORGANIC CHEMISTRY LAB. II", year: "2007", grade: "C+", level: "UD", credits: "1", usGrade: "C+", usCredits: "1.00", conversionSource: "AICE_RULES" },
        { id: 1053, name: "ORGANIC CHEMISTRY LAB. II", year: "2007", grade: "A", level: "UD", credits: "1", usGrade: "A", usCredits: "1.00", conversionSource: "AICE_RULES" },
        { id: 1054, name: "INDUSTRIAL INORGANIC CHEMISTRY LABORATORY", year: "2008", grade: "B+", level: "UD", credits: "2", usGrade: "B+", usCredits: "2.00", conversionSource: "AICE_RULES" },
        { id: 1055, name: "INDUSTRIAL CHEMISTRY II", year: "2008", grade: "A", level: "UD", credits: "3", usGrade: "A", usCredits: "3.00", conversionSource: "AICE_RULES" },
        { id: 1056, name: "PETROCHEMICAL INDUSTRIES", year: "2008", grade: "W", level: "UD", credits: "3", usGrade: "W", usCredits: "3.00", conversionSource: "AICE_RULES" },
        { id: 1057, name: "INSTRUMENTAL ANALYSIS II", year: "2008", grade: "C+", level: "UD", credits: "3", usGrade: "C+", usCredits: "3.00", conversionSource: "AICE_RULES" },
        { id: 1058, name: "CELLULOSE CHEMICAL INDUSTRIES", year: "2008", grade: "B-", level: "UD", credits: "3", usGrade: "B-", usCredits: "3.00", conversionSource: "AICE_RULES" },
        { id: 1059, name: "SOCIOLOGY", year: "2008", grade: "C-", level: "UD", credits: "3", usGrade: "C-", usCredits: "3.00", conversionSource: "AICE_RULES" },
        { id: 1060, name: "GENERAL BIOCHEMISTRY", year: "2008", grade: "B-", level: "UD", credits: "2", usGrade: "B-", usCredits: "2.00", conversionSource: "AICE_RULES" },
        { id: 1061, name: "ORGANIC CHEMISTRY LAB. III", year: "2008", grade: "B+", level: "UD", credits: "1", usGrade: "B+", usCredits: "1.00", conversionSource: "AICE_RULES" },
        { id: 1062, name: "FIELD TRAINING", year: "2010", grade: "A", level: "UD", credits: "4", usGrade: "A", usCredits: "4.00", conversionSource: "AICE_RULES" },
        { id: 1063, name: "INTRODUCTION TO RESEARCH", year: "2010", grade: "A", level: "UD", credits: "5", usGrade: "A", usCredits: "5.00", conversionSource: "AICE_RULES" }
      ],
    }
  ],
  evaluationNotes: "Mr./Mrs. [N/A]  was enrolled in an undergraduate program at the Baha’i Institute for Higher Education (BIHE) from Autumn 2004 to Spring 2010. Founded in 1987, BIHE is a non-governmental institution of higher education established to provide university-level education. \n\nMr./Mrs. [N/A] completed the undergraduate program in Applied Chemistry and was awarded the degree of Bachelor of Science in Applied Chemistry in 2010. We reviewed the curriculum of this program to determine its academic level, content, and scope in relation to higher education programs in the United States. This credential is determined to be equivalent to the completion of four years of undergraduate study leading to a Bachelor of Science degree in Applied Chemistry in the United States. \n\nThe Bahá'í Institute for Higher Education (BIHE) was established in 1987 to provide higher education to Bahá'í youth who are barred from university in Iran. Although not officially recognized by the Iranian government, its degrees are widely accepted for graduate admission by universities worldwide. The credit system and 4.0 grading scale are designed to align with North American standards. For this evaluation, the total 147 units completed over the 4-year residency were converted using a factor of 0.816 (120/147) to align with the US standard of 30 semester credits per academic year. Courses marked 'Cntd' represent multi-term projects; credits and grades are awarded only upon completion in the final term (2010).",
  evaluatorName: "Jianjun Zhao",
  evaluatorSignature: "",
  seniorEvaluatorName: "Luguan Yan",
  seniorEvaluatorSignature: "/luguan-yan-signature.png",
  references: `• Bahá'í Institute for Higher Education (BIHE). (2024). Academic Policies and Grading System. Official BIHE Portal.
• International Association of Universities (IAU). (2019). International Handbook of Universities (29th). Palgrave Macmillan.
• Europa Publications. (2021). The Europa World of Learning (72nd). Routledge.
• IAU / UNESCO. (2026). World Higher Education Database (WHED).
• Bahá'í Institute for Higher Education (BIHE). (n.d.). Home. Retrieved from https://www.bihe.org/`
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
