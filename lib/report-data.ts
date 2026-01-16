import { calculateStats } from "./gpa"

export type Course = {
  id: number
  year: string
  name: string
  level: string
  credits: string
  grade: string
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
}

type CourseSeed = Omit<Course, "id">

const LUBLIN_COURSES: CourseSeed[] = [
  // I YEAR (2010-2011) - I Semester
  { year: "2010-2011", name: "Training in Work Safety", level: "L", credits: "0.00", grade: "PASS" },
  { year: "2010-2011", name: "Training Library", level: "L", credits: "0.00", grade: "PASS" },
  { year: "2010-2011", name: "Physical education", level: "L", credits: "0.50", grade: "A" },
  { year: "2010-2011", name: "English language", level: "L", credits: "1.00", grade: "B" },
  { year: "2010-2011", name: "Basics of Phisics", level: "L", credits: "1.50", grade: "C" },
  { year: "2010-2011", name: "Mathematics I", level: "L", credits: "3.00", grade: "B" },
  { year: "2010-2011", name: "Linear Algebra", level: "L", credits: "3.00", grade: "C" },
  { year: "2010-2011", name: "Discrete Mathematics", level: "L", credits: "3.00", grade: "C+" },
  { year: "2010-2011", name: "Fundamentals of computer science", level: "L", credits: "3.00", grade: "B+" },
  { year: "2010-2011", name: "Theory of IT basics-laboratory", level: "L", credits: "0.00", grade: "B" },
  // I YEAR (2010-2011) - II Semester
  { year: "2010-2011", name: "Physical education", level: "L", credits: "0.50", grade: "A" },
  { year: "2010-2011", name: "English language", level: "L", credits: "1.50", grade: "B+" },
  { year: "2010-2011", name: "Basics of economics", level: "L", credits: "0.50", grade: "B+" },
  { year: "2010-2011", name: "Basics of Phisics", level: "L", credits: "1.50", grade: "C" },
  { year: "2010-2011", name: "Physics-Laboratory", level: "L", credits: "0.00", grade: "B+" },
  { year: "2010-2011", name: "Mathematical Analysis", level: "L", credits: "4.50", grade: "B" },
  { year: "2010-2011", name: "Programming (Delphi)", level: "L", credits: "3.50", grade: "C" },
  { year: "2010-2011", name: "Laboratory of programming", level: "L", credits: "0.00", grade: "C+" },
  { year: "2010-2011", name: "Low-level programming", level: "L", credits: "3.00", grade: "B+" },
  { year: "2010-2011", name: "Laboratory of low-level programming", level: "L", credits: "0.00", grade: "B+" },
  // II YEAR (2011-2012) - III Semester
  { year: "2011-2012", name: "English language", level: "L", credits: "1.00", grade: "C+" },
  { year: "2011-2012", name: "Techniques of negotiations", level: "L", credits: "0.50", grade: "A" },
  { year: "2011-2012", name: "Intellectual ownership", level: "L", credits: "0.50", grade: "B+" },
  { year: "2011-2012", name: "Probabilistic Methods and Statistics", level: "L", credits: "3.00", grade: "C+" },
  { year: "2011-2012", name: "Algorithms and data structures", level: "L", credits: "2.50", grade: "C" },
  { year: "2011-2012", name: "Laboratory of algorithms and data structures", level: "L", credits: "0.00", grade: "B+" },
  { year: "2011-2012", name: "Programming II (C)", level: "L", credits: "2.00", grade: "A" },
  { year: "2011-2012", name: "Laboratory programming II(C)", level: "L", credits: "0.00", grade: "C+" },
  { year: "2011-2012", name: "Computer architecture", level: "L", credits: "1.50", grade: "C" },
  { year: "2011-2012", name: "Circuits and Signals Theory", level: "L", credits: "2.50", grade: "B+" },
  { year: "2011-2012", name: "Fundamentals of Electronics and Metrology", level: "L", credits: "1.50", grade: "C" },
  { year: "2011-2012", name: "Laboratory fundamentals of electronics and metrology", level: "L", credits: "0.00", grade: "B+" },
  // II YEAR (2011-2012) - IV Semester
  { year: "2011-2012", name: "English language", level: "L", credits: "1.00", grade: "B+" },
  { year: "2011-2012", name: "Object- Oriented Programming (C++)", level: "L", credits: "2.50", grade: "B+" },
  { year: "2011-2012", name: "Laboratory object-oriented programming(C++)", level: "L", credits: "0.00", grade: "A" },
  { year: "2011-2012", name: "Operating systems", level: "L", credits: "2.50", grade: "B" },
  { year: "2011-2012", name: "Laboratory of operating systems", level: "L", credits: "0.00", grade: "B+" },
  { year: "2011-2012", name: "Digital electronics", level: "L", credits: "2.00", grade: "B+" },
  { year: "2011-2012", name: "Fundamentals of systems programming", level: "L", credits: "2.00", grade: "C+" },
  { year: "2011-2012", name: "Fundamentals of Electronics and Metrology", level: "L", credits: "2.50", grade: "A" },
  { year: "2011-2012", name: "Laboratory fundamentals of electronics and metrology", level: "L", credits: "0.00", grade: "A" },
  { year: "2011-2012", name: "Computer Networks", level: "L", credits: "2.50", grade: "B" },
  { year: "2011-2012", name: "Computer networks - laboratory", level: "L", credits: "0.00", grade: "B" },
  // III YEAR (2012-2013) - V Semester
  { year: "2012-2013", name: "Environmental protection", level: "U", credits: "1.00", grade: "A" },
  { year: "2012-2013", name: "Digital electronics", level: "U", credits: "1.50", grade: "B+" },
  { year: "2012-2013", name: "Computer Networks", level: "U", credits: "2.00", grade: "B" },
  { year: "2012-2013", name: "Computer networks- Laboratory", level: "U", credits: "0.00", grade: "B+" },
  { year: "2012-2013", name: "Software engineering", level: "U", credits: "2.00", grade: "C" },
  { year: "2012-2013", name: "Software engineering - Laboratory", level: "U", credits: "0.00", grade: "A" },
  { year: "2012-2013", name: "Services in Wide Area Networks", level: "U", credits: "2.00", grade: "A" },
  { year: "2012-2013", name: "Services in Wide Area Networks - laboratory", level: "U", credits: "0.00", grade: "A" },
  { year: "2012-2013", name: "Mobile Devices Interfaces", level: "U", credits: "2.00", grade: "B" },
  { year: "2012-2013", name: "Mobile Devices Interfaces-laboratory", level: "U", credits: "0.00", grade: "B" },
  { year: "2012-2013", name: "Web-Application Development", level: "U", credits: "2.00", grade: "B+" },
  { year: "2012-2013", name: "Web-Application Development -laboratory", level: "U", credits: "0.00", grade: "A" },
  { year: "2012-2013", name: "Special Electric Machines", level: "U", credits: "2.00", grade: "A" },
  { year: "2012-2013", name: "Special Electric Machines - Laboratory", level: "U", credits: "0.00", grade: "A" },
  { year: "2012-2013", name: "Real-Time Systems", level: "U", credits: "1.50", grade: "B+" },
  // III YEAR (2012-2013) - VI Semester
  { year: "2012-2013", name: "Artificial Intelligence", level: "U", credits: "2.50", grade: "B+" },
  { year: "2012-2013", name: "Articial Intelligence-laboratory", level: "U", credits: "0.00", grade: "B+" },
  { year: "2012-2013", name: "Java programming", level: "U", credits: "2.50", grade: "B+" },
  { year: "2012-2013", name: "Java programming - Laboratory", level: "U", credits: "0.00", grade: "B" },
  { year: "2012-2013", name: "Databases", level: "U", credits: "2.50", grade: "A" },
  { year: "2012-2013", name: "Databases -laboratory", level: "U", credits: "0.00", grade: "A" },
  { year: "2012-2013", name: "Microcontrollers and Embedded Systems", level: "U", credits: "2.50", grade: "C" },
  { year: "2012-2013", name: "Microcontrollers and Embedded Systems -laboratory", level: "U", credits: "0.00", grade: "A" },
  { year: "2012-2013", name: "Fundamentals of computer graphics", level: "U", credits: "1.50", grade: "A" },
  { year: "2012-2013", name: "Digital signal processing", level: "U", credits: "2.50", grade: "C" },
  { year: "2012-2013", name: "Digital signal processing - Laboratory", level: "U", credits: "0.00", grade: "B+" },
  { year: "2012-2013", name: "Mobile Services and Devices", level: "U", credits: "3.00", grade: "A" },
  { year: "2012-2013", name: "Mobile Services and Devices- laboratory", level: "U", credits: "0.00", grade: "A" },
  { year: "2012-2013", name: "Team Project (Designing and Implementing)-project", level: "U", credits: "1.00", grade: "A" },
  { year: "2012-2013", name: "Practical Training", level: "U", credits: "0.00", grade: "A" },
  // IV YEAR (2013-2014) - VII Semester
  { year: "2013-2014", name: "Computer System Security", level: "U", credits: "1.00", grade: "B+" },
  { year: "2013-2014", name: "Fundametals of Multimedia", level: "U", credits: "1.50", grade: "C" },
  { year: "2013-2014", name: "Team Project (Designin and Implementing )-project", level: "U", credits: "1.00", grade: "A" },
  { year: "2013-2014", name: "Diploma Seminar", level: "U", credits: "7.50", grade: "A" },
  { year: "2013-2014", name: "Network Infrastructure of Mobile Systems", level: "U", credits: "1.50", grade: "B+" },
  { year: "2013-2014", name: "Virtual Reality Systems", level: "U", credits: "2.00", grade: "A" },
]

const WARSAW_COURSES: CourseSeed[] = [
  // Year 1 - Semester 1
  { year: "2012-2013", name: "Algorithms & Data Structures", level: "G", credits: "3.00", grade: "C" },
  { year: "2012-2013", name: "Computer Architecture", level: "G", credits: "3.00", grade: "C" },
  { year: "2012-2013", name: "Computer Networks", level: "G", credits: "3.00", grade: "B" },
  { year: "2012-2013", name: "Data Bases", level: "G", credits: "3.00", grade: "A" },
  { year: "2012-2013", name: "Discrete Random Processes", level: "G", credits: "3.00", grade: "C+" },
  { year: "2012-2013", name: "Operating Systems", level: "G", credits: "3.00", grade: "B" },
  // Year 1 - Semester 2
  { year: "2012-2013", name: "Cryptography and Data Security", level: "G", credits: "3.00", grade: "A" },
  { year: "2012-2013", name: "Data Mining", level: "G", credits: "3.00", grade: "B" },
  { year: "2012-2013", name: "Evolutionary Algorithms", level: "G", credits: "3.00", grade: "B" },
  { year: "2012-2013", name: "Intelligent Information Systems", level: "G", credits: "3.00", grade: "C" },
  { year: "2012-2013", name: "Master of Science Project 1", level: "G", credits: "1.50", grade: "A" },
  // Year 2 - Semester 3
  { year: "2013-2014", name: "Computer Graphics", level: "G", credits: "3.00", grade: "B" },
  { year: "2013-2014", name: "Digital Signal Processor Architecture and Programming", level: "G", credits: "3.00", grade: "A" },
  { year: "2013-2014", name: "Image and Speech Recognition", level: "G", credits: "3.00", grade: "C+" },
  { year: "2013-2014", name: "Master of Science Project 2", level: "G", credits: "3.00", grade: "A" },
  { year: "2013-2014", name: "Pattern Recognition", level: "G", credits: "3.00", grade: "C" },
  // Year 2 - Semester 4
  { year: "2013-2014", name: "Institutions of Democracy", level: "G", credits: "1.50", grade: "B" },
  { year: "2013-2014", name: "Master Diploma Edition", level: "G", credits: "0.00", grade: "PASS" },
  { year: "2013-2014", name: "Master Diploma Seminar", level: "G", credits: "1.50", grade: "C+" },
  { year: "2013-2014", name: "Master of Science Project 3", level: "G", credits: "9.00", grade: "PASS" },
  { year: "2013-2014", name: "Small Business", level: "G", credits: "1.50", grade: "A" },
]

const LUBLIN_GRADE_CONVERSION: GradeConversionRow[] = [
  { grade: "5.0", usGrade: "A" },
  { grade: "4.5", usGrade: "A-" },
  { grade: "4.0", usGrade: "B+" },
  { grade: "3.5", usGrade: "B" },
  { grade: "3.0", usGrade: "C" },
  { grade: "2.0", usGrade: "F" },
]

const WARSAW_GRADE_CONVERSION: GradeConversionRow[] = [
  { grade: "5.0", usGrade: "A" },
  { grade: "4.5", usGrade: "A-" },
  { grade: "4.0", usGrade: "B+" },
  { grade: "3.5", usGrade: "B" },
  { grade: "3.0", usGrade: "C" },
  { grade: "2.0", usGrade: "F" },
]

export const buildSampleData = (): SampleData => ({
  refNo: "LA-20260116-111",
  name: "[first name] [last name]",
  dob: "N/A",
  country: "Poland",
  date: "January 16, 2026",
  purpose: "N/A",
  evaluatorName: "Hongjian Chen",
  evaluatorSignature: "",
  seniorEvaluatorName: "Luguan Yan",
  seniorEvaluatorSignature: "/luguan-yan-signature.png",
  evaluationNotes: "Credit Conversion Methodology\nAcademic credits earned at Lublin University of Technology and Warsaw University of Technology are awarded under the higher education system of Poland. For the purpose of this evaluation, Polish academic credits have been converted to U.S. semester credit hours based on a review of total instructional time, academic level, and the presence of laboratory or practical components. In general, one Polish academic credit (ECTS) is considered comparable to 0.5 to 0.75 U.S. semester credit hours, in accordance with internationally accepted credential evaluation practices and AACRAO guidelines.",
  documents: [
    {
      title: "Engineer (Inżynier) Diploma - English & Polish Parts",
      issuedBy: "Lublin University of Technology (Politechnika Lubelska)",
      dateIssued: "February 27, 2013",
      certificateNo: "41428",
    },
    {
      title: "Diploma Supplement (Bachelor) - English & Polish Parts",
      issuedBy: "Lublin University of Technology",
      dateIssued: "February 27, 2013",
      certificateNo: "N/A",
    },
    {
      title: "Master of Science in Engineering Diploma",
      issuedBy: "Warsaw University of Technology (Politechnika Warszawska)",
      dateIssued: "October 31, 2014",
      certificateNo: "65366",
    },
    {
      title: "Diploma Supplement (Master)",
      issuedBy: "Warsaw University of Technology",
      dateIssued: "February 9, 2015",
      certificateNo: "N/A",
    },
  ],
  credentials: [
    {
      id: 1,
      awardingInstitution: "Lublin University of Technology",

      country: "Poland",
      admissionRequirements: "Completion of twelve years of formal elementary in Poland and have a secondary school leaving certificate.",
      program: "Undergraduate Program (Major in Computer Science)",
      grantsAccessTo: "Graduate Programs",
      standardProgramLength: "Three and a half years",
      yearsAttended: "2010 - 2013",
      yearOfGraduation: "2013",
      equivalenceStatement: "Three and a half years of undergraduate study with a major in Computer Science",
      courses: LUBLIN_COURSES.map((course, index) => ({
        id: 1000 + index + 1,
        ...course,
      })),
      gradeConversion: LUBLIN_GRADE_CONVERSION,
      get gpa() {
        return calculateStats(this.courses).gpa
      },
      get totalCredits() {
        return calculateStats(this.courses).totalCredits
      },
    },
    {
      id: 2,
      awardingInstitution: "Warsaw University of Technology",

      country: "Poland",
      admissionRequirements: "Completed undergraduate studies and have a recognized Bachelor’s degree.",
      program: "Graduate Program (Major in Computer Science)",
      grantsAccessTo: "Doctoral Programs",
      standardProgramLength: "Two years",
      yearsAttended: "2012 - 2014",
      yearOfGraduation: "2014",
      equivalenceStatement: "U.S. Master’s degree with a major in Computer Science",
      courses: WARSAW_COURSES.map((course, index) => ({
        id: 2000 + index + 1,
        ...course,
      })),
      gradeConversion: WARSAW_GRADE_CONVERSION,
      get gpa() {
        return calculateStats(this.courses).gpa
      },
      get totalCredits() {
        return calculateStats(this.courses).totalCredits
      },
    }
  ],
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
