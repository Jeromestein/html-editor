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

export type SampleData = {
  refNo: string
  name: string
  dob: string
  country: string
  date: string
  purpose: string
  credential: {
    awardingInstitution: string
    awardingInstitutionNative: string
    country: string
    admissionRequirements: string
    program: string
    grantsAccessTo: string
    standardProgramLength: string
    yearsAttended: string
    yearOfGraduation: string
    documents: CredentialDocument[]
  }
  equivalence: {
    summary: string
    gpa: string
    totalCredits: string
  }
  courses: Course[]
}

type CourseSeed = Omit<Course, "id">

const SAMPLE_COURSES: CourseSeed[] = [
  { year: "2021-2022", name: "Art Historical Studies I", level: "L", credits: "3.00", grade: "A-" },
  { year: "2021-2022", name: "Intro to Molecular & Cell Biology", level: "L", credits: "3.00", grade: "A-" },
  { year: "2021-2022", name: "General Chemistry I", level: "L", credits: "3.00", grade: "A" },
  { year: "2021-2022", name: "Elements of Calculus I", level: "L", credits: "3.00", grade: "A" },
  { year: "2021-2022", name: "Fundamentals of Physics", level: "L", credits: "3.00", grade: "C" },
  { year: "2021-2022", name: "Discovering Biodiversity", level: "L", credits: "3.00", grade: "A-" },
  { year: "2021-2022", name: "Biological Concepts of Health", level: "L", credits: "3.00", grade: "A-" },
  { year: "2021-2022", name: "General Chemistry II", level: "L", credits: "3.00", grade: "A-" },
  { year: "2021-2022", name: "Physics for Life Sciences", level: "L", credits: "3.00", grade: "A-" },
  { year: "2021-2022", name: "ST: Horror Night in Canada", level: "L", credits: "3.00", grade: "A-" },
  { year: "2022-2023", name: "Introduction to Biochemistry", level: "L", credits: "3.00", grade: "A-" },
  { year: "2022-2023", name: "Intro Nutritional & Food Sci", level: "L", credits: "3.00", grade: "B-" },
  {
    year: "2022-2023",
    name: "Foundations of Molecular Biology & Genetics",
    level: "L",
    credits: "3.00",
    grade: "A-",
  },
  { year: "2022-2023", name: "Introduction to Psychology", level: "L", credits: "3.00", grade: "A-" },
  { year: "2022-2023", name: "Statistics I", level: "L", credits: "3.00", grade: "B-" },
  { year: "2022-2023", name: "Biomedical Physiology", level: "L", credits: "6.00", grade: "A-" },
  { year: "2023-2024", name: "Molecular Biology of the Cell", level: "U", credits: "3.00", grade: "A+" },
  { year: "2023-2024", name: "Fundamentals of Nutrition", level: "U", credits: "3.00", grade: "A-" },
  { year: "2023-2024", name: "Epidemiology", level: "U", credits: "3.00", grade: "A+" },
  { year: "2023-2024", name: "Structure & Function in Biochemistry", level: "U", credits: "3.00", grade: "A-" },
  { year: "2023-2024", name: "Introduction to Computing", level: "U", credits: "3.00", grade: "A+" },
  { year: "2023-2024", name: "Foundations in Critical Reading", level: "U", credits: "3.00", grade: "A-" },
  { year: "2023-2024", name: "Human Anatomy: Dissection", level: "U", credits: "4.50", grade: "A-" },
  { year: "2023-2024", name: "Social Psychology", level: "U", credits: "3.00", grade: "A+" },
  { year: "2023-2024", name: "Principles of Pharmacology", level: "U", credits: "3.00", grade: "A-" },
  { year: "2024-2025", name: "Cardiology", level: "U", credits: "3.00", grade: "A-" },
  { year: "2024-2025", name: "Human Anatomy: Dissection II", level: "U", credits: "4.50", grade: "A-" },
  { year: "2024-2025", name: "Principles of Learning", level: "U", credits: "3.00", grade: "A-" },
  { year: "2024-2025", name: "Immunology", level: "U", credits: "3.00", grade: "C-" },
  { year: "2024-2025", name: "Principles of Disease", level: "U", credits: "3.00", grade: "A-" },
  { year: "2024-2025", name: "Epidemiology of Food-Borne Diseases", level: "U", credits: "3.00", grade: "B+" },
  { year: "2024-2025", name: "Medical Toxicology", level: "U", credits: "3.00", grade: "A" },
  { year: "2024-2025", name: "Nutrition of Fish & Crustacea", level: "U", credits: "3.00", grade: "A-" },
  { year: "2024-2025", name: "Endocrine Physiology", level: "U", credits: "3.00", grade: "A+" },
  { year: "2024-2025", name: "Biomedical Aspects of Aging", level: "U", credits: "3.00", grade: "A" },
  { year: "2024-2025", name: "Business & Professional Ethics", level: "U", credits: "3.00", grade: "A-" },
  { year: "2024-2025", name: "Homicide", level: "U", credits: "3.00", grade: "A-" },
  { year: "2024-2025", name: "Dynamics of Sport Fans", level: "U", credits: "3.00", grade: "A+" },
]

export const buildSampleData = (): SampleData => ({
  refNo: "AET-2024-0926",
  name: "Maha Qadri",
  dob: "September 5, 2003",
  country: "Canada",
  date: "September 5, 2024",
  purpose: "Employment",
  credential: {
    awardingInstitution: "Tongji University",
    awardingInstitutionNative: "N/A",
    country: "China",
    admissionRequirements: "Completion of secondary education",
    program: "Bachelor of Engineering program in Computer Science and Technology",
    grantsAccessTo: "Graduate Programs",
    standardProgramLength: "Four years",
    yearsAttended: "2017 - 2021",
    yearOfGraduation: "2021",
    documents: [
      {
        title: "Graduation Certificate",
        issuedBy: "Tongji University, Shanghai, China",
        dateIssued: "Month DD, YYYY",
        certificateNo: "00000000000000000000",
      },
      {
        title: "Degree Certificate",
        issuedBy: "Tongji University, Shanghai, China",
        dateIssued: "Month DD, YYYY",
        certificateNo: "00000000000000000000",
      },
      {
        title: "Academic Record",
        issuedBy: "Tongji University, Shanghai, China",
        dateIssued: "Month DD, YYYY",
        certificateNo: "00000000000000000000",
      },
    ],
  },
  equivalence: {
    summary: "Bachelor of Science degree in Computer Science and Technology",
    gpa: "2.978",
    totalCredits: "124.75",
  },
  courses: SAMPLE_COURSES.map((course, index) => ({
    id: index + 1,
    ...course,
  })),
})
