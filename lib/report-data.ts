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
}

type CourseSeed = Omit<Course, "id">


const HKUST_COURSES: CourseSeed[] = [
  // 2011-2012 Fall
  { year: "2011-2012", name: "Fundamentals of Organic Chemistry", level: "L", credits: "3.00", grade: "B-" },
  { year: "2011-2012", name: "Inorganic Chemistry I", level: "L", credits: "4.00", grade: "B+" },
  { year: "2011-2012", name: "Healthy Life Style", level: "L", credits: "0.00", grade: "Incomplete" },
  { year: "2011-2012", name: "English Language II", level: "L", credits: "3.00", grade: "B-" },
  { year: "2011-2012", name: "Cell Biology", level: "L", credits: "3.00", grade: "B-" },
  { year: "2011-2012", name: "Introduction to Biochemistry", level: "L", credits: "3.00", grade: "B" },
  { year: "2011-2012", name: "Cell Biology Laboratory", level: "L", credits: "3.00", grade: "B+" },
  // 2011-2012 Spring
  { year: "2011-2012", name: "Healthy Life Style", level: "L", credits: "0.00", grade: "PASS" },
  { year: "2011-2012", name: "Biology of Human Health", level: "L", credits: "3.00", grade: "A-" },
  { year: "2011-2012", name: "Intermediary Metabolism", level: "L", credits: "3.00", grade: "B-" },
  { year: "2011-2012", name: "Introductory Biochemical Laboratory", level: "L", credits: "2.00", grade: "C" },
  { year: "2011-2012", name: "Biochemical Laboratory Techniques", level: "L", credits: "1.00", grade: "A-" },
  { year: "2011-2012", name: "Research in Modern Biochemistry", level: "L", credits: "2.00", grade: "PASS" },
  { year: "2011-2012", name: "Microbiology", level: "L", credits: "3.00", grade: "B" },
  { year: "2011-2012", name: "Microbiology Laboratory", level: "L", credits: "3.00", grade: "C+" },
  // 2011-2012 Summer
  { year: "2011-2012", name: "Gastronomy", level: "L", credits: "3.00", grade: "A-" },
  // 2012-2013 Fall
  { year: "2012-2013", name: "Fundamentals of Analytical Chemistry", level: "U", credits: "3.00", grade: "B+" },
  { year: "2012-2013", name: "Molecular and Cellular Biochemistry I", level: "U", credits: "3.00", grade: "C+" },
  { year: "2012-2013", name: "Biotechnological Application of Recombinant DNA and Techniques", level: "U", credits: "2.00", grade: "B+" },
  { year: "2012-2013", name: "General Genetics", level: "U", credits: "4.00", grade: "B+" },
  { year: "2012-2013", name: "Principles of Recombinant DNA Technology", level: "U", credits: "1.00", grade: "A" },
  { year: "2012-2013", name: "Calculus and Linear Algebra", level: "L", credits: "3.00", grade: "B+" },
  { year: "2012-2013", name: "Science, Technology and Work", level: "L", credits: "3.00", grade: "B" },
  // 2012-2013 Summer
  { year: "2012-2013", name: "Research in Modern Biochemistry B", level: "U", credits: "2.00", grade: "PASS" },
  // Transfer Credits
  { year: "Transfer", name: "Application of Engineering in Life Science", level: "L", credits: "2.00", grade: "Credit" },
  { year: "Transfer", name: "1000-level Course in Language", level: "L", credits: "3.00", grade: "Credit" },
  { year: "Transfer", name: "Bioinformatics", level: "L", credits: "3.00", grade: "Credit" },
  { year: "Transfer", name: "Ecology", level: "L", credits: "3.00", grade: "Credit" },
  { year: "Transfer", name: "Developmental Biology", level: "L", credits: "3.00", grade: "Credit" },
  // 2013-2014 Fall
  { year: "2013-2014", name: "Principles of Microeconomics", level: "L", credits: "3.00", grade: "C+" },
  { year: "2013-2014", name: "Advanced Molecular Genetics", level: "U", credits: "3.00", grade: "B-" },
  { year: "2013-2014", name: "Biochemistry of Diseases", level: "U", credits: "3.00", grade: "B" },
  { year: "2013-2014", name: "Biomedical Sciences Research Project I", level: "U", credits: "3.00", grade: "A-" },
  { year: "2013-2014", name: "General Physics I with Calculus", level: "L", credits: "3.00", grade: "A" },
  { year: "2013-2014", name: "Laboratory for General Physics I", level: "L", credits: "1.00", grade: "A-" },
  { year: "2013-2014", name: "Discovering Mind and Behavior", level: "L", credits: "3.00", grade: "B-" },
  // 2013-2014 Spring
  { year: "2013-2014", name: "Music of the World", level: "L", credits: "3.00", grade: "C" },
  { year: "2013-2014", name: "The Making of the Modern World Renaissance to the Present", level: "L", credits: "3.00", grade: "B-" },
  { year: "2013-2014", name: "Chronicle of Internet Commerce", level: "L", credits: "3.00", grade: "B+" },
  { year: "2013-2014", name: "English for Science I", level: "L", credits: "3.00", grade: "B" },
  { year: "2013-2014", name: "Structure and Function of Proteins", level: "U", credits: "3.00", grade: "B" },
  { year: "2013-2014", name: "Biomedical Sciences Research Project II", level: "U", credits: "3.00", grade: "A+" },
]

const CAMBRIDGE_COURSES: CourseSeed[] = [
  { year: "2017-2018", name: "CBE Computational Biology (ET BOE 2)", level: "G", credits: "3.00", grade: "B" },
  { year: "2017-2018", name: "PP: Project Presentation (ET)", level: "G", credits: "3.00", grade: "A" },
  { year: "2017-2018", name: "WR: Project (ET)", level: "G", credits: "3.00", grade: "A-" },
  { year: "2017-2018", name: "1: Genome Informatics", level: "G", credits: "3.00", grade: "A" },
  { year: "2017-2018", name: "2: Genome Sequence Analysis (Half Module) (ET)", level: "G", credits: "3.00", grade: "A" },
  { year: "2017-2018", name: "3: Functional Genomics (ET)", level: "G", credits: "3.00", grade: "A" },
  { year: "2017-2018", name: "6: Population Genetic Analysis of Genomic Data (ET)", level: "G", credits: "3.00", grade: "A" },
  { year: "2017-2018", name: "7: Systems Biology", level: "G", credits: "3.00", grade: "A-" },
  { year: "2017-2018", name: "11: Scientific Programming", level: "G", credits: "3.00", grade: "A" },
  { year: "2017-2018", name: "12: Network Biology (Half Module) (ET)", level: "G", credits: "3.00", grade: "A" },
  { year: "2017-2018", name: "14: Computational Neuroscience (Full Module) (Et)", level: "G", credits: "3.00", grade: "A" },
  { year: "2017-2018", name: "17: Cancer Evolution", level: "G", credits: "3.00", grade: "A" },
]

const HKUST_GRADE_CONVERSION: GradeConversionRow[] = [
  { grade: "A+", usGrade: "A+" },
  { grade: "A", usGrade: "A" },
  { grade: "A-", usGrade: "A-" },
  { grade: "B+", usGrade: "B+" },
  { grade: "B", usGrade: "B" },
  { grade: "C+", usGrade: "C+" },
  { grade: "C", usGrade: "C" },
  { grade: "C-", usGrade: "C-" },
  { grade: "D+", usGrade: "D+" },
  { grade: "D", usGrade: "D" },
  { grade: "F", usGrade: "F" },
]

const CAMBRIDGE_GRADE_CONVERSION: GradeConversionRow[] = [
  { grade: "70.00-100.00", usGrade: "A" },
  { grade: "65.00-69.99", usGrade: "A-" },
  { grade: "60.00-64.99", usGrade: "B+" },
  { grade: "50.00-59.99", usGrade: "B" },
  { grade: "0.00-49.99", usGrade: "F" },
]

const HKU_COURSES: CourseSeed[] = [
  { year: "2016-2017", name: "Advanced Statistical Methods I", level: "G", credits: "0.00", grade: "PASS" },
]

const HKU_GRADE_CONVERSION: GradeConversionRow[] = [
  { grade: "PASS", usGrade: "P (Pass)" },
]

export const buildSampleData = (): SampleData => ({
  refNo: "LA-20260116-010",
  name: "[first name] [last name]",
  dob: "N/A",
  country: "Hong Kong, The People’s Republic of China",
  date: "January 16, 2026",
  purpose: "N/A",
  evaluationNotes: "Credit Conversion Methodology\nAcademic credits earned at the Hong Kong University of Science and Technology are awarded under the higher education system of the Hong Kong Special Administrative Region (HKSAR), China. For the purpose of this evaluation, Hong Kong academic credits have been converted to U.S. semester credit hours based on a review of total instructional time, academic level, and the presence of laboratory or practical components. In general, one Hong Kong academic credit is considered comparable to one U.S. semester credit hour, in accordance with internationally accepted credential evaluation practices and AACRAO guidelines.\n\nUniversity of Hong Kong Credit Conversion\nAcademic credits earned at the University of Hong Kong are awarded under the higher education system of the Hong Kong Special Administrative Region (HKSAR), China. For the purpose of this evaluation, Hong Kong academic credits have been converted to U.S. semester credit hours based on a review of total instructional time, academic level, and the presence of laboratory or practical components. In general, accordingly, no U.S. semester credit hours are assigned to the PhD degree, which is recognized at the degree level only as equivalent to a Doctor of Philosophy degree awarded by a regionally accredited institution of higher education in the United States.",
  documents: [
    {
      title: "Bachelor of Science Degree Certificate",
      issuedBy: "The Hong Kong University of Science and Technology",
      dateIssued: "November 6, 2014",
      certificateNo: "N/A",
    },
    {
      title: "Transcript of Academic Record (Bachelor)",
      issuedBy: "The Hong Kong University of Science and Technology",
      dateIssued: "November 6, 2014",
      certificateNo: "N/A",
    },
    {
      title: "Master of Philosophy Degree Certificate",
      issuedBy: "University of Cambridge",
      dateIssued: "October 20, 2018",
      certificateNo: "N/A",
    },
    {
      title: "Official Transcript (Master)",
      issuedBy: "University of Cambridge",
      dateIssued: "October 25, 2018",
      certificateNo: "N/A",
    },
    {
      title: "Doctor of Philosophy Degree Certificate",
      issuedBy: "The University of Hong Kong",
      dateIssued: "December 3, 2020",
      certificateNo: "N/A",
    },
    {
      title: "Transcript of Academic Record (PhD)",
      issuedBy: "The University of Hong Kong",
      dateIssued: "July 22, 2024",
      certificateNo: "N/A",
    },
  ],
  credentials: [
    {
      id: 1,
      awardingInstitution: "Hong Kong University of Science and Technology",

      country: "Hong Kong, The People’s Republic of China",
      admissionRequirements: "Completion of secondary education (HKALE or equivalent)",
      program: "Bachelor of Science in Molecular Biomedical Sciences",
      grantsAccessTo: "Graduate Programs",
      standardProgramLength: "Four years",
      yearsAttended: "2011 - 2014",
      yearOfGraduation: "2014",
      equivalenceStatement: "Bachelor of Science in Biomedical Sciences",
      gpa: "3.03",
      totalCredits: "111.00",
      gradeConversion: HKUST_GRADE_CONVERSION,
      courses: HKUST_COURSES.map((course, index) => ({
        id: 1000 + index + 1,
        ...course,
      })),
    },
    {
      id: 2,
      awardingInstitution: "University of Cambridge",

      country: "United Kingdom",
      admissionRequirements: "Lower second (2:2) bachelor's degree earned at a recognized (accredited) institution of higher education in the United Kingdom or its foreign equivalent.",
      program: "Master of Philosophy (Major in Computational Biology)",
      grantsAccessTo: "Doctoral Programs",
      standardProgramLength: "One year",
      yearsAttended: "2017 - 2018",
      yearOfGraduation: "2018",
      equivalenceStatement: "Master of Science in Computational Biology",
      gpa: "3.83",
      totalCredits: "36.00",
      gradeConversion: CAMBRIDGE_GRADE_CONVERSION,
      courses: CAMBRIDGE_COURSES.map((course, index) => ({
        id: 2000 + index + 1,
        ...course,
      })),
    },
    {
      id: 3,
      awardingInstitution: "University of Hong Kong",

      country: "Hong Kong, The People’s Republic of China",
      admissionRequirements: "Bachelor's degree with a proven record of outstanding performance from a recognized institution",
      program: "Doctor of Philosophy (Major in Pathology)",
      grantsAccessTo: "Postdoctoral Research / Academic Appointments",
      standardProgramLength: "4 years",
      yearsAttended: "2016 - 2020",
      yearOfGraduation: "2020",
      equivalenceStatement: "Doctor of Philosophy in Pathology",
      gpa: "N/A",
      totalCredits: "0.00",
      gradeConversion: HKU_GRADE_CONVERSION,
      courses: HKU_COURSES.map((course, index) => ({
        id: 3000 + index + 1,
        ...course,
      })),
    }
  ],
})
