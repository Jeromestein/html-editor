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
  country: "Ireland",
  date: "January 16, 2026",
  purpose: "N/A",
  documents: [
    {
      title: "Bachelor Degree Diploma (Latin)",
      issuedBy: "Universitas Hiberniae Nationalis",
      dateIssued: "Sep 2, 2013",
      certificateNo: "N/A",
    },
    {
      title: "Bachelor Degree Diploma (Translation)",
      issuedBy: "ImmiTranslate, LLC",
      dateIssued: "N/A",
      certificateNo: "N/A",
    },
    {
      title: "Academic Transcript (Bachelor)",
      issuedBy: "University College Dublin",
      dateIssued: "Oct 28, 2023",
      certificateNo: "N/A",
    },
    {
      title: "Master Degree Diploma (Latin)",
      issuedBy: "Universitas Hiberniae Nationalis",
      dateIssued: "Sep 1, 2014",
      certificateNo: "N/A",
    },
    {
      title: "Master Degree Diploma (Translation)",
      issuedBy: "ImmiTranslate, LLC",
      dateIssued: "N/A",
      certificateNo: "N/A",
    },
    {
      title: "Academic Transcript (Master)",
      issuedBy: "University College Dublin",
      dateIssued: "Oct 28, 2023",
      certificateNo: "N/A",
    },
  ],
  credentials: [
    {
      id: 1,
      awardingInstitution: "University College Dublin (National University of Ireland, Dublin)",
      country: "Ireland",
      admissionRequirements: "N/A",
      program: "Bachelor of Science (Baccalaureatus Scientiae)",
      grantsAccessTo: "Masters Degree Awards / Graduate Diplomas",
      standardProgramLength: "Three years",
      yearsAttended: "2009 - 2012",
      yearOfGraduation: "2013",
      equivalenceStatement: "Three years of undergraduate study in Mechanical Engineering",
      gpa: "1.91",
      totalCredits: "90.00",
      gradeConversion: [
        { grade: "A+, A, A-", usGrade: "A" },
        { grade: "B+, B, B-, C+, C, C-", usGrade: "B" },
        { grade: "D+, D, D-", usGrade: "C" },
        { grade: "E, F+, F, F-", usGrade: "F" },
        { grade: "PC (Pass on Compensation), P (Pass)", usGrade: "S" },
      ],
      courses: [
        { id: 1031, name: "Chemistry for Engineers", year: "2009", grade: "D", level: "LD", credits: "5.00", usGrade: "C", usCredits: "2.50", conversionSource: "AICE_RULES" },
        { id: 1032, name: "Electronic and Electrical Engineering I", year: "2009", grade: "C-", level: "LD", credits: "5.00", usGrade: "B", usCredits: "2.50", conversionSource: "AICE_RULES" },
        { id: 1033, name: "Mathematics for Engineers I", year: "2009", grade: "C+", level: "LD", credits: "5.00", usGrade: "B", usCredits: "2.50", conversionSource: "AICE_RULES" },
        { id: 1034, name: "Mathematics for Engineers II", year: "2009", grade: "PC", level: "LD", credits: "5.00", usGrade: "S", usCredits: "2.50", conversionSource: "AICE_RULES" },
        { id: 1035, name: "Mechanics for Engineers", year: "2009", grade: "D+", level: "LD", credits: "5.00", usGrade: "C", usCredits: "2.50", conversionSource: "AICE_RULES" },
        { id: 1036, name: "Physics for Engineers I", year: "2009", grade: "D+", level: "LD", credits: "5.00", usGrade: "C", usCredits: "2.50", conversionSource: "AICE_RULES" },
        { id: 1025, name: "Computer Science for Engineers I", year: "2009", grade: "B", level: "LD", credits: "5.00", usGrade: "B", usCredits: "2.50", conversionSource: "AICE_RULES" },
        { id: 1026, name: "Robotics Design Project", year: "2009", grade: "C", level: "LD", credits: "5.00", usGrade: "B", usCredits: "2.50", conversionSource: "AICE_RULES" },
        { id: 1027, name: "Energy Challenges", year: "2009", grade: "C-", level: "LD", credits: "5.00", usGrade: "B", usCredits: "2.50", conversionSource: "AICE_RULES" },
        { id: 1028, name: "Mathematics for Engineers III", year: "2009", grade: "C", level: "LD", credits: "5.00", usGrade: "B", usCredits: "2.50", conversionSource: "AICE_RULES" },
        { id: 1029, name: "Engineering Thermodynamics and Fluid Mechanics", year: "2009", grade: "D-", level: "LD", credits: "5.00", usGrade: "C", usCredits: "2.50", conversionSource: "AICE_RULES" },
        { id: 1030, name: "Physics for Engineers II", year: "2009", grade: "C+", level: "LD", credits: "5.00", usGrade: "B", usCredits: "2.50", conversionSource: "AICE_RULES" },
        { id: 1019, name: "Principles of Microeconomics", year: "2010", grade: "A+", level: "LD", credits: "5.00", usGrade: "A", usCredits: "2.50", conversionSource: "AICE_RULES" },
        { id: 1020, name: "Electrical and Electronic Circuits", year: "2010", grade: "D-", level: "LD", credits: "5.00", usGrade: "C", usCredits: "2.50", conversionSource: "AICE_RULES" },
        { id: 1021, name: "Mathematics for Engineers : Calculus of Several Variables", year: "2010", grade: "B-", level: "LD", credits: "5.00", usGrade: "B", usCredits: "2.50", conversionSource: "AICE_RULES" },
        { id: 1022, name: "Mechanics of Fluids I", year: "2010", grade: "C+", level: "LD", credits: "5.00", usGrade: "B", usCredits: "2.50", conversionSource: "AICE_RULES" },
        { id: 1023, name: "Manufacturing Engineering I", year: "2010", grade: "D", level: "LD", credits: "5.00", usGrade: "C", usCredits: "2.50", conversionSource: "AICE_RULES" },
        { id: 1024, name: "Heat Transfer", year: "2010", grade: "D-", level: "LD", credits: "5.00", usGrade: "C", usCredits: "2.50", conversionSource: "AICE_RULES" },
        { id: 1013, name: "Principles of Macroeconomics", year: "2010", grade: "C-", level: "LD", credits: "5.00", usGrade: "B", usCredits: "2.50", conversionSource: "AICE_RULES" },
        { id: 1014, name: "Materials Science and Engineering I", year: "2010", grade: "B-", level: "LD", credits: "5.00", usGrade: "B", usCredits: "2.50", conversionSource: "AICE_RULES" },
        { id: 1015, name: "Applied Dynamics I", year: "2010", grade: "D+", level: "LD", credits: "5.00", usGrade: "C", usCredits: "2.50", conversionSource: "AICE_RULES" },
        { id: 1016, name: "Mechanics of Solids I", year: "2010", grade: "C", level: "LD", credits: "5.00", usGrade: "B", usCredits: "2.50", conversionSource: "AICE_RULES" },
        { id: 1017, name: "Mechanical Engineering Design I", year: "2010", grade: "B", level: "LD", credits: "5.00", usGrade: "B", usCredits: "2.50", conversionSource: "AICE_RULES" },
        { id: 1018, name: "Mathematics for Engineers V", year: "2010", grade: "D", level: "LD", credits: "5.00", usGrade: "C", usCredits: "2.50", conversionSource: "AICE_RULES" },
        { id: 1007, name: "Mathematics for Engineers VI", year: "2011", grade: "A+", level: "UD", credits: "5.00", usGrade: "A", usCredits: "2.50", conversionSource: "AICE_RULES" },
        { id: 1008, name: "Biosystems Engineering Design Challenge", year: "2011", grade: "A+", level: "UD", credits: "5.00", usGrade: "A", usCredits: "2.50", conversionSource: "AICE_RULES" },
        { id: 1009, name: "Mechanical Engineering Design II", year: "2011", grade: "B", level: "UD", credits: "5.00", usGrade: "B", usCredits: "2.50", conversionSource: "AICE_RULES" },
        { id: 1010, name: "Materials Science and Engineering II", year: "2011", grade: "D+", level: "UD", credits: "5.00", usGrade: "C", usCredits: "2.50", conversionSource: "AICE_RULES" },
        { id: 1011, name: "Engineering Thermodynamics II", year: "2011", grade: "D+", level: "UD", credits: "5.00", usGrade: "C", usCredits: "2.50", conversionSource: "AICE_RULES" },
        { id: 1012, name: "Professional Engineering (Finance)", year: "2011", grade: "B+", level: "UD", credits: "5.00", usGrade: "B", usCredits: "2.50", conversionSource: "AICE_RULES" },
        { id: 1001, name: "Numerical Methods for Engineers", year: "2011", grade: "D-", level: "UD", credits: "5.00", usGrade: "C", usCredits: "2.50", conversionSource: "AICE_RULES" },
        { id: 1002, name: "Game Theory", year: "2011", grade: "C+", level: "UD", credits: "5.00", usGrade: "B", usCredits: "2.50", conversionSource: "AICE_RULES" },
        { id: 1003, name: "Electrical Energy Systems II", year: "2011", grade: "D-", level: "UD", credits: "5.00", usGrade: "C", usCredits: "2.50", conversionSource: "AICE_RULES" },
        { id: 1004, name: "Applied Dynamics II", year: "2011", grade: "D-", level: "UD", credits: "5.00", usGrade: "C", usCredits: "2.50", conversionSource: "AICE_RULES" },
        { id: 1005, name: "Mechanics of Solids II", year: "2011", grade: "C+", level: "UD", credits: "5.00", usGrade: "B", usCredits: "2.50", conversionSource: "AICE_RULES" },
        { id: 1006, name: "Measurement & Instrumentation", year: "2011", grade: "D+", level: "UD", credits: "5.00", usGrade: "C", usCredits: "2.50", conversionSource: "AICE_RULES" },
      ],
    },
    {
      id: 2,
      awardingInstitution: "University College Dublin (National University of Ireland, Dublin)",
      country: "Ireland",
      admissionRequirements: "N/A",
      program: "Master of Engineering (Magisterii in Arte Ingeniaria)",
      grantsAccessTo: "Doctoral Degree Awards",
      standardProgramLength: "Two years",
      yearsAttended: "2012 - 2014",
      yearOfGraduation: "2014",
      equivalenceStatement: "Master's degree with a major in Engineering with Business",
      gpa: "",
      totalCredits: "",
      gradeConversion: [
        { grade: "A+, A, A-", usGrade: "A" },
        { grade: "B+, B, B-, C+, C, C-", usGrade: "B" },
        { grade: "D+, D, D-", usGrade: "C" },
        { grade: "E, F+, F, F-", usGrade: "F" },
        { grade: "PC (Pass on Compensation), P (Pass)", usGrade: "S" },
      ],
      courses: [
        { id: 2012, name: "Management & Org Behav (BB/ME)", year: "2012", grade: "B", level: "GR", credits: "7.50", usGrade: "B", usCredits: "3.75", conversionSource: "AICE_RULES" },
        { id: 2013, name: "Engineering Thermodynamics III", year: "2012", grade: "D-", level: "GR", credits: "5.00", usGrade: "C", usCredits: "2.50", conversionSource: "AICE_RULES" },
        { id: 2014, name: "Mechanics of Fluids II", year: "2012", grade: "PC", level: "GR", credits: "5.00", usGrade: "S", usCredits: "2.50", conversionSource: "AICE_RULES" },
        { id: 2015, name: "Manufacturing Engineering II", year: "2012", grade: "D+", level: "GR", credits: "5.00", usGrade: "C", usCredits: "2.50", conversionSource: "AICE_RULES" },
        { id: 2016, name: "Computational Continuum Mechanics I", year: "2012", grade: "C-", level: "GR", credits: "5.00", usGrade: "B", usCredits: "2.50", conversionSource: "AICE_RULES" },
        { id: 2017, name: "Energy Systems and Climate Change", year: "2012", grade: "C", level: "GR", credits: "5.00", usGrade: "B", usCredits: "2.50", conversionSource: "AICE_RULES" },
        { id: 2006, name: "Entrepreneurial Management", year: "2012", grade: "C+", level: "GR", credits: "5.00", usGrade: "B", usCredits: "2.50", conversionSource: "AICE_RULES" },
        { id: 2007, name: "Materials Science and Engineering III", year: "2012", grade: "D", level: "GR", credits: "5.00", usGrade: "C", usCredits: "2.50", conversionSource: "AICE_RULES" },
        { id: 2008, name: "Advanced Composites and Polymer Engineering", year: "2012", grade: "C+", level: "GR", credits: "5.00", usGrade: "B", usCredits: "2.50", conversionSource: "AICE_RULES" },
        { id: 2009, name: "Decision Analysis", year: "2012", grade: "B-", level: "GR", credits: "5.00", usGrade: "B", usCredits: "2.50", conversionSource: "AICE_RULES" },
        { id: 2010, name: "Professional Engineering (Management)", year: "2012", grade: "B-", level: "GR", credits: "5.00", usGrade: "B", usCredits: "2.50", conversionSource: "AICE_RULES" },
        { id: 2011, name: "Operations Management", year: "2012", grade: "C+", level: "GR", credits: "5.00", usGrade: "B", usCredits: "2.50", conversionSource: "AICE_RULES" },
        { id: 2001, name: "ME Eng. with Business Thesis", year: "2013", grade: "A-", level: "GR", credits: "15.00", usGrade: "A", usCredits: "7.50", conversionSource: "AICE_RULES" },
        { id: 2002, name: "Professional Work Placement", year: "2013", grade: "P", level: "GR", credits: "22.50", usGrade: "S", usCredits: "11.25", conversionSource: "AICE_RULES" },
        { id: 2003, name: "Research Methods (Engineering with Business)", year: "2013", grade: "C-", level: "GR", credits: "5.00", usGrade: "B", usCredits: "2.50", conversionSource: "AICE_RULES" },
        { id: 2004, name: "Business Information Systems Management ME/MEngSc", year: "2013", grade: "B+", level: "GR", credits: "7.50", usGrade: "B", usCredits: "3.75", conversionSource: "AICE_RULES" },
        { id: 2005, name: "Marketing Management ME MScB&B", year: "2013", grade: "B+", level: "GR", credits: "7.50", usGrade: "B", usCredits: "3.75", conversionSource: "AICE_RULES" },
      ],
    },
  ],
  evaluationNotes: `Mr./Mrs. [N/A] was enrolled in a three-year undergraduate program at College University Dublin, the National University of Ireland from 2009 to 2012. Founded in 1908, the National University of Ireland is a recognized (accredited) public institution of higher education in the Republic of Ireland. In order to be admitted into the undergraduate program of College University Dublin, the National University of Ireland, applicants must have passed Irish Leaving Certificate Examination with English, Irish and four other subjects or its equivalent. This is the equivalent of graduation from a college preparatory program at an accredited high school in the United States.

According to the diploma, Mr./Mrs. [N/A] completed the undergraduate program with a major in Engineering Science and was awarded the degree of Bachelor of Science on September 2, 2013. At College University Dublin, you can pursue a Bachelor of Engineering Science, BSc (3 years), a Bachelor of Engineering, BE (4 years), or a Master of Engineering, ME (5 years). We reviewed the curriculum of this program to ensure that it is equivalent of completion of three years of undergraduate study in Mechanical Engineering earned at regionally accredited institution of higher education in the United States. 

Mr./Mrs. [N/A] was then enrolled in a two-year Master program at College University Dublin, the National University of Ireland from 2012 to 2014. Mr. XXXXX completed the graduate program with a major in Engineering with Business and was awarded the degree of Master of Engineering on June 25, 2014. We reviewed the curriculum of this program to ensure that this is the equivalent of the U.S. degree of Bachelor of Science in Mechanical Engineering and one year of graduate study in Mechanical Engineering earned at regionally accredited institution of higher education in the United States. 

The credit conversion is based on the European Credit Transfer and Accumulation System (ECTS), where 60 ECTS represent one full academic year, equivalent to 30 US semester credits. Therefore, a conversion factor of 0.5 was applied to all credits. Converted credits were rounded to the nearest 0.5. University College Dublin uses a modular letter grade system; passing grades range from A+ down to D-, with 'PC' (Pass on Compensation) and 'P' (Pass) also considered passing marks. These have been mapped to their respective U.S. equivalents based on institutional grading descriptions.`,
  evaluatorName: "Hongjian Chen",
  evaluatorSignature: "",
  seniorEvaluatorName: "Luguan Yan",
  seniorEvaluatorSignature: "/luguan-yan-signature.png",
  references: `• International Association of Universities (IAU). (2019). International Handbook of Universities (29th). Palgrave Macmillan.
• Europa Publications. (2021). The Europa World of Learning (72nd). Routledge.
• IAU / UNESCO. (2026). World Higher Education Database (WHED).
• University College Dublin. (2024). Modular Grades and Grade Points. Retrieved from https://www.ucd.ie/registry/prospectivestudents/assessment/grading/`,
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
