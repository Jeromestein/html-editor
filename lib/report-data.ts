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

const HKUST_COURSES: Course[] = [
  // 2011-2012 Fall
  { id: 1001, name: "Fundamentals of Organic Chemistry", year: "2011", grade: "B-", level: "LD", credits: "3.00", usGrade: "B-", usCredits: "3.00", conversionSource: "MANUAL_ENTRY" },
  { id: 1002, name: "Inorganic Chemistry I", year: "2011", grade: "B+", level: "LD", credits: "4.00", usGrade: "B+", usCredits: "4.00", conversionSource: "MANUAL_ENTRY" },
  { id: 1003, name: "Healthy Life Style", year: "2011", grade: "Incomplete", level: "LD", credits: "0.00", usGrade: "F", usCredits: "0.00", conversionSource: "MANUAL_ENTRY" },
  { id: 1004, name: "English Language II", year: "2011", grade: "B-", level: "LD", credits: "3.00", usGrade: "B-", usCredits: "3.00", conversionSource: "MANUAL_ENTRY" },
  { id: 1005, name: "Cell Biology", year: "2011", grade: "B-", level: "LD", credits: "3.00", usGrade: "B-", usCredits: "3.00", conversionSource: "MANUAL_ENTRY" },
  { id: 1006, name: "Introduction to Biochemistry", year: "2011", grade: "B", level: "LD", credits: "3.00", usGrade: "B", usCredits: "3.00", conversionSource: "MANUAL_ENTRY" },
  { id: 1007, name: "Cell Biology Laboratory", year: "2011", grade: "B+", level: "LD", credits: "3.00", usGrade: "B+", usCredits: "3.00", conversionSource: "MANUAL_ENTRY" },

  // 2011-2012 Spring
  { id: 1008, name: "Healthy Life Style", year: "2011", grade: "PASS", level: "LD", credits: "0.00", usGrade: "P", usCredits: "0.00", conversionSource: "MANUAL_ENTRY" },
  { id: 1009, name: "Biology of Human Health", year: "2011", grade: "A-", level: "LD", credits: "3.00", usGrade: "A-", usCredits: "3.00", conversionSource: "MANUAL_ENTRY" },
  { id: 1010, name: "Intermediary Metabolism", year: "2011", grade: "B-", level: "LD", credits: "3.00", usGrade: "B-", usCredits: "3.00", conversionSource: "MANUAL_ENTRY" },
  { id: 1011, name: "Introductory Biochemical Laboratory", year: "2011", grade: "C", level: "LD", credits: "2.00", usGrade: "C", usCredits: "2.00", conversionSource: "MANUAL_ENTRY" },
  { id: 1012, name: "Biochemical Laboratory Techniques", year: "2011", grade: "A-", level: "LD", credits: "1.00", usGrade: "A-", usCredits: "1.00", conversionSource: "MANUAL_ENTRY" },
  { id: 1013, name: "Research in Modern Biochemistry", year: "2011", grade: "PASS", level: "LD", credits: "2.00", usGrade: "P", usCredits: "2.00", conversionSource: "MANUAL_ENTRY" },
  { id: 1014, name: "Microbiology", year: "2011", grade: "B", level: "LD", credits: "3.00", usGrade: "B", usCredits: "3.00", conversionSource: "MANUAL_ENTRY" },
  { id: 1015, name: "Microbiology Laboratory", year: "2011", grade: "C+", level: "LD", credits: "3.00", usGrade: "C+", usCredits: "3.00", conversionSource: "MANUAL_ENTRY" },

  // 2011-2012 Summer
  { id: 1016, name: "Gastronomy", year: "2011", grade: "A-", level: "LD", credits: "3.00", usGrade: "A-", usCredits: "3.00", conversionSource: "MANUAL_ENTRY" },

  // 2012-2013 Fall
  { id: 1017, name: "Fundamentals of Analytical Chemistry", year: "2012", grade: "B+", level: "LD", credits: "3.00", usGrade: "B+", usCredits: "3.00", conversionSource: "MANUAL_ENTRY" },
  { id: 1018, name: "Molecular and Cellular Biochemistry I", year: "2012", grade: "C+", level: "LD", credits: "3.00", usGrade: "C+", usCredits: "3.00", conversionSource: "MANUAL_ENTRY" },
  { id: 1019, name: "Biotechnological Application of Recombinant DNA and Techniques", year: "2012", grade: "B+", level: "LD", credits: "2.00", usGrade: "B+", usCredits: "2.00", conversionSource: "MANUAL_ENTRY" },
  { id: 1020, name: "General Genetics", year: "2012", grade: "B+", level: "LD", credits: "4.00", usGrade: "B+", usCredits: "4.00", conversionSource: "MANUAL_ENTRY" },
  { id: 1021, name: "Principles of Recombinant DNA Technology", year: "2012", grade: "A", level: "LD", credits: "1.00", usGrade: "A", usCredits: "1.00", conversionSource: "MANUAL_ENTRY" },
  { id: 1022, name: "Calculus and Linear Algebra", year: "2012", grade: "B+", level: "LD", credits: "3.00", usGrade: "B+", usCredits: "3.00", conversionSource: "MANUAL_ENTRY" },
  { id: 1023, name: "Science, Technology and Work", year: "2012", grade: "B", level: "LD", credits: "3.00", usGrade: "B", usCredits: "3.00", conversionSource: "MANUAL_ENTRY" },

  // 2012-2013 Summer
  { id: 1024, name: "Research in Modern Biochemistry B", year: "2012", grade: "PASS", level: "LD", credits: "2.00", usGrade: "P", usCredits: "2.00", conversionSource: "MANUAL_ENTRY" },

  // Transfer Credits
  { id: 1025, name: "Application of Engineering in Life Science", year: "2013", grade: "Credit", level: "LD", credits: "2.00", usGrade: "P", usCredits: "2.00", conversionSource: "MANUAL_ENTRY" },
  { id: 1026, name: "1000-level Course in Language", year: "2013", grade: "Credit", level: "LD", credits: "3.00", usGrade: "P", usCredits: "3.00", conversionSource: "MANUAL_ENTRY" },
  { id: 1027, name: "Bioinformatics", year: "2013", grade: "Credit", level: "LD", credits: "3.00", usGrade: "P", usCredits: "3.00", conversionSource: "MANUAL_ENTRY" },
  { id: 1028, name: "Ecology", year: "2013", grade: "Credit", level: "LD", credits: "3.00", usGrade: "P", usCredits: "3.00", conversionSource: "MANUAL_ENTRY" },
  { id: 1029, name: "Developmental Biology", year: "2013", grade: "Credit", level: "LD", credits: "3.00", usGrade: "P", usCredits: "3.00", conversionSource: "MANUAL_ENTRY" },

  // 2013-2014 Fall
  { id: 1030, name: "Principles of Microeconomics", year: "2013", grade: "C+", level: "UD", credits: "3.00", usGrade: "C+", usCredits: "3.00", conversionSource: "MANUAL_ENTRY" },
  { id: 1031, name: "Advanced Molecular Genetics", year: "2013", grade: "B-", level: "UD", credits: "3.00", usGrade: "B-", usCredits: "3.00", conversionSource: "MANUAL_ENTRY" },
  { id: 1032, name: "Biochemistry of Diseases", year: "2013", grade: "B", level: "UD", credits: "3.00", usGrade: "B", usCredits: "3.00", conversionSource: "MANUAL_ENTRY" },
  { id: 1033, name: "Biomedical Sciences Research Project I", year: "2013", grade: "A-", level: "UD", credits: "3.00", usGrade: "A-", usCredits: "3.00", conversionSource: "MANUAL_ENTRY" },
  { id: 1034, name: "General Physics I with Calculus", year: "2013", grade: "A", level: "UD", credits: "3.00", usGrade: "A", usCredits: "3.00", conversionSource: "MANUAL_ENTRY" },
  { id: 1035, name: "Laboratory for General Physics I", year: "2013", grade: "A-", level: "UD", credits: "1.00", usGrade: "A-", usCredits: "1.00", conversionSource: "MANUAL_ENTRY" },
  { id: 1036, name: "Discovering Mind and Behavior", year: "2013", grade: "B-", level: "UD", credits: "3.00", usGrade: "B-", usCredits: "3.00", conversionSource: "MANUAL_ENTRY" },

  // 2013-2014 Spring
  { id: 1037, name: "Music of the World", year: "2013", grade: "C", level: "UD", credits: "3.00", usGrade: "C", usCredits: "3.00", conversionSource: "MANUAL_ENTRY" },
  { id: 1038, name: "The Making of the Modern World Renaissance to the Present", year: "2013", grade: "B-", level: "UD", credits: "3.00", usGrade: "B-", usCredits: "3.00", conversionSource: "MANUAL_ENTRY" },
  { id: 1039, name: "Chronicle of Internet Commerce", year: "2013", grade: "B+", level: "UD", credits: "3.00", usGrade: "B+", usCredits: "3.00", conversionSource: "MANUAL_ENTRY" },
  { id: 1040, name: "English for Science I", year: "2013", grade: "B", level: "UD", credits: "3.00", usGrade: "B", usCredits: "3.00", conversionSource: "MANUAL_ENTRY" },
  { id: 1041, name: "Structure and Function of Proteins", year: "2013", grade: "B", level: "UD", credits: "3.00", usGrade: "B", usCredits: "3.00", conversionSource: "MANUAL_ENTRY" },
  { id: 1042, name: "Biomedical Sciences Research Project II", year: "2013", grade: "A-", level: "UD", credits: "3.00", usGrade: "A-", usCredits: "3.00", conversionSource: "MANUAL_ENTRY" },
]

const CAMBRIDGE_COURSES: Course[] = [
  { id: 2001, name: "CBE Computational Biology (ET BOE 2)", year: "2018", grade: "B", level: "GR", credits: "3.00", usGrade: "B", usCredits: "3.00", conversionSource: "MANUAL_ENTRY" },
  { id: 2002, name: "PP: Project Presentation (ET)", year: "2018", grade: "A", level: "GR", credits: "3.00", usGrade: "A", usCredits: "3.00", conversionSource: "MANUAL_ENTRY" },
  { id: 2003, name: "WR: Project (ET)", year: "2018", grade: "A-", level: "GR", credits: "3.00", usGrade: "A-", usCredits: "3.00", conversionSource: "MANUAL_ENTRY" },
  { id: 2004, name: "1: Genome Informatics", year: "2018", grade: "A", level: "GR", credits: "3.00", usGrade: "A", usCredits: "3.00", conversionSource: "MANUAL_ENTRY" },
  { id: 2005, name: "2: Genome Sequence Analysis (Half Module) (ET)", year: "2018", grade: "A", level: "GR", credits: "3.00", usGrade: "A", usCredits: "3.00", conversionSource: "MANUAL_ENTRY" },
  { id: 2006, name: "3: Functional Genomics (ET)", year: "2018", grade: "A", level: "GR", credits: "3.00", usGrade: "A", usCredits: "3.00", conversionSource: "MANUAL_ENTRY" },
  { id: 2007, name: "6: Population Genetic Analysis of Genomic Data (ET)", year: "2018", grade: "A", level: "GR", credits: "3.00", usGrade: "A", usCredits: "3.00", conversionSource: "MANUAL_ENTRY" },
  { id: 2008, name: "7: Systems Biology", year: "2018", grade: "A-", level: "GR", credits: "3.00", usGrade: "A-", usCredits: "3.00", conversionSource: "MANUAL_ENTRY" },
  { id: 2009, name: "11: Scientific Programming", year: "2018", grade: "A", level: "GR", credits: "3.00", usGrade: "A", usCredits: "3.00", conversionSource: "MANUAL_ENTRY" },
  { id: 2010, name: "12: Network Biology (Half Module) (ET)", year: "2018", grade: "A", level: "GR", credits: "3.00", usGrade: "A", usCredits: "3.00", conversionSource: "MANUAL_ENTRY" },
  { id: 2011, name: "14: Computational Neuroscience (Full Module) (Et)", year: "2018", grade: "A", level: "GR", credits: "3.00", usGrade: "A", usCredits: "3.00", conversionSource: "MANUAL_ENTRY" },
  { id: 2012, name: "17: Cancer Evolution", year: "2018", grade: "A", level: "GR", credits: "3.00", usGrade: "A", usCredits: "3.00", conversionSource: "MANUAL_ENTRY" },
]

const HKU_COURSES: Course[] = [
  { id: 3001, name: "GRSC6008 Transferable Skills", year: "2014", grade: "P", level: "GR", credits: "N/A", usGrade: "P", usCredits: "1.00", conversionSource: "AI_INFERRED" },
  { id: 3002, name: "GRSC6021 Thesis Writing", year: "2014", grade: "P", level: "GR", credits: "N/A", usGrade: "P", usCredits: "1.00", conversionSource: "AI_INFERRED" },
  { id: 3003, name: "GRSC6031 Research Ethics", year: "2014", grade: "P", level: "GR", credits: "N/A", usGrade: "P", usCredits: "1.00", conversionSource: "AI_INFERRED" },
  { id: 3004, name: "GRSC6035 Quantitative Research Methods", year: "2014", grade: "P", level: "GR", credits: "N/A", usGrade: "P", usCredits: "1.00", conversionSource: "AI_INFERRED" },
  { id: 3005, name: "MMPH6008 Genes and Gene Functions", year: "2014", grade: "P", level: "GR", credits: "1", usGrade: "P", usCredits: "1.00", conversionSource: "AI_INFERRED" },
  { id: 3006, name: "MMPH6139 Molecular Pathology", year: "2014", grade: "P", level: "GR", credits: "1", usGrade: "P", usCredits: "1.00", conversionSource: "AI_INFERRED" },
  { id: 3007, name: "MMPH6196 Cell Metabolism", year: "2014", grade: "P", level: "GR", credits: "1", usGrade: "P", usCredits: "1.00", conversionSource: "AI_INFERRED" },
  { id: 3008, name: "MMPH6117 Advanced Statistical Methods I", year: "2016", grade: "P", level: "GR", credits: "1", usGrade: "P", usCredits: "1.00", conversionSource: "AI_INFERRED" },
]

export const buildSampleData = (): SampleData => ({
  refNo: "LA-20260116-109",
  name: "N/A",
  dob: "N/A",
  country: "Hong Kong",
  date: "January 16, 2026",
  purpose: "N/A",
  documents: [
    { title: "Bachelor of Science in Molecular Biomedical Sciences Diploma", issuedBy: "The Hong Kong University of Science and Technology", dateIssued: "Nov 6, 2014", certificateNo: "N/A" },
    { title: "Transcript of Academic Record", issuedBy: "The Hong Kong University of Science and Technology", dateIssued: "Nov 6, 2014", certificateNo: "N/A" },
    { title: "Master of Philosophy Diploma", issuedBy: "University of Cambridge", dateIssued: "Oct 20, 2018", certificateNo: "N/A" },
    { title: "Official Transcript", issuedBy: "University of Cambridge", dateIssued: "Oct 26, 2018", certificateNo: "N/A" },
    { title: "Doctor of Philosophy Diploma", issuedBy: "The University of Hong Kong", dateIssued: "Dec 3, 2020", certificateNo: "N/A" },
    { title: "Transcript of Academic Record", issuedBy: "The University of Hong Kong", dateIssued: "Jul 22, 2024", certificateNo: "N/A" },
  ],
  credentials: [
    {
      id: 1,
      awardingInstitution: "The Hong Kong University of Science and Technology (香港科技大學)",
      country: "Hong Kong",
      admissionRequirements: "N/A",
      program: "Bachelor of Science in Molecular Biomedical Sciences (理學士 (分子生物醫學科學))",
      grantsAccessTo: "Graduate Study",
      standardProgramLength: "Three years",
      yearsAttended: "2011 - 2014",
      yearOfGraduation: "2014",
      equivalenceStatement: "Bachelor's degree with a major in Molecular Biomedical Sciences",
      gradeConversion: [
        { grade: "A+ (Excellent)", usGrade: "A" },
        { grade: "A (Excellent)", usGrade: "A" },
        { grade: "A- (Very Good)", usGrade: "A-" },
        { grade: "B+ (Good)", usGrade: "B+" },
        { grade: "B (Good)", usGrade: "B" },
        { grade: "B- (Good)", usGrade: "B-" },
        { grade: "C+ (Satisfactory)", usGrade: "C+" },
        { grade: "C (Satisfactory)", usGrade: "C" },
        { grade: "D (Pass)", usGrade: "D" },
        { grade: "F (Fail)", usGrade: "F" },
        { grade: "PP (Permit to Proceed)", usGrade: "P" },
        { grade: "P (Pass)", usGrade: "P" },
        { grade: "T (Transfer)", usGrade: "P" },
      ],
      courses: HKUST_COURSES,
      get gpa() {
        return calculateStats(this.courses).gpa
      },
      get totalCredits() {
        return calculateStats(this.courses).totalCredits
      },
    },
    {
      id: 2,
      awardingInstitution: "University of Cambridge",
      country: "United Kingdom",
      admissionRequirements: "N/A",
      program: "Master of Philosophy (Computational Biology)",
      grantsAccessTo: "Doctoral Study",
      standardProgramLength: "One Year",
      yearsAttended: "2017 - 2018",
      yearOfGraduation: "2018",
      equivalenceStatement: "Master's degree with a major in Computational Biology",
      gradeConversion: [
        { grade: "70.000 - 100.000 (First Class Honours)", usGrade: "A" },
        { grade: "65.000 - 69.990 (Second Class Honours - Upper Division)", usGrade: "A-" },
        { grade: "60.000 - 64.990 (Second Class Honours - Upper Division)", usGrade: "B+" },
        { grade: "50.000 - 59.990 (Second Class Honours - Lower Division)", usGrade: "B" },
        { grade: "45.000 - 49.990 (Third class)", usGrade: "C+" },
        { grade: "40.000 - 44.990 (Pass)", usGrade: "C" },
        { grade: "P (Pass)", usGrade: "S" },
        { grade: "0.000 - 39.990 (Fail)", usGrade: "F" },
        { grade: "CP (Condoned Pass)", usGrade: "C" },
      ],
      courses: CAMBRIDGE_COURSES,
      get gpa() {
        return calculateStats(this.courses).gpa
      },
      get totalCredits() {
        return calculateStats(this.courses).totalCredits
      },
    },
    {
      id: 3,
      awardingInstitution: "The University of Hong Kong (香港大學)",
      country: "Hong Kong",
      admissionRequirements: "N/A",
      program: "Doctor of Philosophy (哲學博士)",
      grantsAccessTo: "Research/Academic Career",
      standardProgramLength: "Four years",
      yearsAttended: "2014 - 2020",
      yearOfGraduation: "2020",
      equivalenceStatement: "Doctor of Philosophy degree with a major in Medicine",
      gradeConversion: [
        { grade: "A+ (Excellent)", usGrade: "A+" },
        { grade: "A", usGrade: "A" },
        { grade: "A-", usGrade: "A-" },
        { grade: "B+", usGrade: "B+" },
        { grade: "B (Good)", usGrade: "B" },
        { grade: "B-", usGrade: "B-" },
        { grade: "C+", usGrade: "C+" },
        { grade: "C (Adequate)", usGrade: "C" },
        { grade: "C-", usGrade: "C-" },
        { grade: "D+", usGrade: "D+" },
        { grade: "D (Marginal pass)", usGrade: "D" },
        { grade: "F (Fail)", usGrade: "F" },
      ],
      courses: HKU_COURSES,
      get gpa() {
        return calculateStats(this.courses).gpa
      },
      get totalCredits() {
        return calculateStats(this.courses).totalCredits
      },
    }
  ],
  evaluationNotes: "Credits were converted based on the standard of 30 US Semester Credits per academic year. For the Bachelor of Science from HKUST, the 105 total original credits were prorated to 90 US Semester Credits over the three-year duration. For the University of Cambridge MPhil, the one-year program was allocated 30 US Semester Credits distributed across the curriculum. Grades for the University of Cambridge were converted using the standard UK postgraduate honors classification where 70% is a Distinction/A and 50-69% represents a Pass (B/C). HKUST and HKU utilize a 4.3 grading scale comparable to the US A-F system with adjustments for A+ and B-/C- ranges.",
  evaluatorName: "Hongjian Chen",
  evaluatorSignature: "",
  seniorEvaluatorName: "Luguan Yan",
  seniorEvaluatorSignature: "/luguan-yan-signature.png",
  references: `• Scholaro. (n.d.). Education Database: Hong Kong. Retrieved from https://www.scholaro.com/pro/Countries/Hong-Kong
• Scholaro. (n.d.). Education Database: United Kingdom. Retrieved from https://www.scholaro.com/pro/Countries/United-Kingdom
• The Hong Kong University of Science and Technology. (2014). Grading System and Transcript Guide.
• University of Cambridge. (2018). MPhil Marking Schemes and Classification.
• International Association of Universities (IAU). (2019). International Handbook of Universities (29th). Palgrave Macmillan.
• Europa Publications. (2021). The Europa World of Learning (72nd). Routledge.
• IAU / UNESCO. (2026). World Higher Education Database (WHED).
• The Hong Kong University of Science and Technology. (n.d.). Home. Retrieved from https://www.hkust.edu.hk
• University of Cambridge. (n.d.). Home. Retrieved from https://www.cam.ac.uk
• The University of Hong Kong. (n.d.). Home. Retrieved from https://www.hku.hk`,
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
