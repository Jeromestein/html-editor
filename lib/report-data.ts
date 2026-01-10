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
  awardingInstitutionNative: string
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
  { year: "2013-2014", name: "Biomedical Sciences Research Project II", level: "U", credits: "3.00", grade: "B" },
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

export const buildSampleData = (): SampleData => ({
  refNo: "2168235256",
  name: "Guanlong Li",
  dob: "January 14, 1992",
  country: "Hong Kong, The People’s Republic of China",
  date: "January 6, 2026",
  purpose: "Education",
  evaluationNotes: "Credit Conversion Methodology\nAcademic credits earned at the Hong Kong University of Science and Technology are awarded under the higher education system of the Hong Kong Special Administrative Region (HKSAR), China. For the purpose of this evaluation, Hong Kong academic credits have been converted to U.S. semester credit hours based on a review of total instructional time, academic level, and the presence of laboratory or practical components. In general, one Hong Kong academic credit is considered comparable to one U.S. semester credit hour, in accordance with internationally accepted credential evaluation practices and AACRAO guidelines.",
  documents: [
    {
      title: "Academic Transcript",
      issuedBy: "Hong Kong University of Science and Technology",
      dateIssued: "November 6, 2014",
      certificateNo: "N/A",
    },
    {
      title: "Degree Certificate",
      issuedBy: "Hong Kong University of Science and Technology",
      dateIssued: "November 6, 2014",
      certificateNo: "N/A",
    },
  ],
  credentials: [
    {
      id: 1,
      awardingInstitution: "Hong Kong University of Science and Technology",
      awardingInstitutionNative: "N/A",
      country: "Hong Kong, The People’s Republic of China",
      admissionRequirements: "Completion of secondary education (HKALE or equivalent)",
      program: "Bachelor of Science in Molecular Biomedical Sciences",
      grantsAccessTo: "Graduate Programs",
      standardProgramLength: "Four years",
      yearsAttended: "2011 - 2014",
      yearOfGraduation: "2014",
      equivalenceStatement: "Bachelor of Science in Biomedical Sciences",
      gpa: "3.00",
      totalCredits: "100.00",
      gradeConversion: HKUST_GRADE_CONVERSION,
      courses: HKUST_COURSES.map((course, index) => ({
        id: 1000 + index + 1,
        ...course,
      })),
    },
  ],
})

