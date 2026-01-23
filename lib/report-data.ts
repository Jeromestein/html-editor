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
  "dob": "N/A",
  "date": "January 16, 2026",
  "name": "N/A",
  "refNo": "LA-20260116-119",
  "country": "Jamaica",
  "purpose": "N/A",
  "documents": [
    {
      "title": "Diploma in Teaching",
      "issuedBy": "Joint Board of Teacher Education / The University of the West Indies",
      "dateIssued": "Jun 1, 1997",
      "certificateNo": "N/A"
    },
    {
      "title": "Bachelor of Education Degree",
      "issuedBy": "The University of the West Indies",
      "dateIssued": "Jul 1, 2001",
      "certificateNo": "N/A"
    },
    {
      "title": "Master of Education Degree",
      "issuedBy": "The University of the West Indies",
      "dateIssued": "Oct 20, 2010",
      "certificateNo": "N/A"
    }
  ],
  "references": "• International Association of Universities (IAU). (2019). International Handbook of Universities (29th). Palgrave Macmillan.\n• IAU / UNESCO. (2026). World Higher Education Database (WHED).\n• AACRAO. (2015). AACRAO Academic Record and Transcript Guide (1st (2016)).\n• AACRAO. (2016). AACRAO International Guide (1st).\n• Shortwood Teachers' College. (n.d.). Home. Retrieved from https://shortwood.edu.jm\n• The University of the West Indies. (n.d.). Home. Retrieved from https://www.uwi.edu",
  "credentials": [
    {
      "id": 1,
      "gpa": "2.62",
      "country": "Jamaica",
      "courses": [
        {
          "id": 1001,
          "name": "Use of English I",
          "year": "1994",
          "grade": "C",
          "level": "LD",
          "credits": "1.50",
          "usGrade": "C",
          "usCredits": "1.50",
          "conversionSource": "AICE_RULES"
        },
        {
          "id": 1002,
          "name": "Fundamentals of Teaching Reading",
          "year": "1994",
          "grade": "C+",
          "level": "LD",
          "credits": "1.50",
          "usGrade": "C+",
          "usCredits": "1.50",
          "conversionSource": "AICE_RULES"
        },
        {
          "id": 1003,
          "name": "Strategies in Early Childhood Education",
          "year": "1994",
          "grade": "B+",
          "level": "LD",
          "credits": "4.00",
          "usGrade": "B+",
          "usCredits": "4.00",
          "conversionSource": "AICE_RULES"
        },
        {
          "id": 1004,
          "name": "Teaching in Early Childhood Education",
          "year": "1994",
          "grade": "C",
          "level": "LD",
          "credits": "2.00",
          "usGrade": "C",
          "usCredits": "2.00",
          "conversionSource": "AICE_RULES"
        },
        {
          "id": 1005,
          "name": "Child Development",
          "year": "1994",
          "grade": "B",
          "level": "LD",
          "credits": "1.50",
          "usGrade": "B",
          "usCredits": "1.50",
          "conversionSource": "AICE_RULES"
        },
        {
          "id": 1006,
          "name": "Psychology of Learning",
          "year": "1994",
          "grade": "C+",
          "level": "LD",
          "credits": "1.50",
          "usGrade": "C+",
          "usCredits": "1.50",
          "conversionSource": "AICE_RULES"
        },
        {
          "id": 1007,
          "name": "Content and Methods",
          "year": "1994",
          "grade": "C+",
          "level": "LD",
          "credits": "3.00",
          "usGrade": "C+",
          "usCredits": "3.00",
          "conversionSource": "AICE_RULES"
        },
        {
          "id": 1008,
          "name": "Foundation Course",
          "year": "1994",
          "grade": "C",
          "level": "LD",
          "credits": "2.50",
          "usGrade": "C",
          "usCredits": "2.50",
          "conversionSource": "AICE_RULES"
        },
        {
          "id": 1009,
          "name": "Science for Living",
          "year": "1994",
          "grade": "C-",
          "level": "LD",
          "credits": "3.00",
          "usGrade": "C-",
          "usCredits": "3.00",
          "conversionSource": "AICE_RULES"
        },
        {
          "id": 1010,
          "name": "Phenomena of Religion",
          "year": "1994",
          "grade": "B",
          "level": "LD",
          "credits": "1.50",
          "usGrade": "B",
          "usCredits": "1.50",
          "conversionSource": "AICE_RULES"
        },
        {
          "id": 1011,
          "name": "Music for Early Childhood Education",
          "year": "1994",
          "grade": "C",
          "level": "LD",
          "credits": "1.50",
          "usGrade": "C",
          "usCredits": "1.50",
          "conversionSource": "AICE_RULES"
        },
        {
          "id": 1012,
          "name": "Use of English II",
          "year": "1995",
          "grade": "B",
          "level": "LD",
          "credits": "3.00",
          "usGrade": "B",
          "usCredits": "3.00",
          "conversionSource": "AICE_RULES"
        },
        {
          "id": 1013,
          "name": "Language Arts in Pre-Primary Education",
          "year": "1995",
          "grade": "C+",
          "level": "LD",
          "credits": "1.50",
          "usGrade": "C+",
          "usCredits": "1.50",
          "conversionSource": "AICE_RULES"
        },
        {
          "id": 1014,
          "name": "Strategies in Early Childhood Education",
          "year": "1995",
          "grade": "B+",
          "level": "LD",
          "credits": "4.00",
          "usGrade": "B+",
          "usCredits": "4.00",
          "conversionSource": "AICE_RULES"
        },
        {
          "id": 1015,
          "name": "Teaching in Early Childhood Education",
          "year": "1995",
          "grade": "C",
          "level": "LD",
          "credits": "2.00",
          "usGrade": "C",
          "usCredits": "2.00",
          "conversionSource": "AICE_RULES"
        },
        {
          "id": 1016,
          "name": "Introduction to Curriculum Development",
          "year": "1995",
          "grade": "B",
          "level": "LD",
          "credits": "1.50",
          "usGrade": "B",
          "usCredits": "1.50",
          "conversionSource": "AICE_RULES"
        },
        {
          "id": 1017,
          "name": "Classroom and Behavior Management",
          "year": "1995",
          "grade": "B",
          "level": "LD",
          "credits": "1.50",
          "usGrade": "B",
          "usCredits": "1.50",
          "conversionSource": "AICE_RULES"
        },
        {
          "id": 1018,
          "name": "Classroom Testing and Measurement",
          "year": "1995",
          "grade": "B+",
          "level": "LD",
          "credits": "1.50",
          "usGrade": "B+",
          "usCredits": "1.50",
          "conversionSource": "AICE_RULES"
        },
        {
          "id": 1019,
          "name": "Methods",
          "year": "1995",
          "grade": "B-",
          "level": "LD",
          "credits": "3.00",
          "usGrade": "B-",
          "usCredits": "3.00",
          "conversionSource": "AICE_RULES"
        },
        {
          "id": 1020,
          "name": "Content",
          "year": "1995",
          "grade": "B",
          "level": "LD",
          "credits": "2.50",
          "usGrade": "B",
          "usCredits": "2.50",
          "conversionSource": "AICE_RULES"
        },
        {
          "id": 1021,
          "name": "Teaching Religious Education in Early Childhood Education",
          "year": "1995",
          "grade": "B",
          "level": "LD",
          "credits": "1.50",
          "usGrade": "B",
          "usCredits": "1.50",
          "conversionSource": "AICE_RULES"
        },
        {
          "id": 1022,
          "name": "Family Life Education",
          "year": "1995",
          "grade": "B-",
          "level": "LD",
          "credits": "3.00",
          "usGrade": "B-",
          "usCredits": "3.00",
          "conversionSource": "AICE_RULES"
        },
        {
          "id": 1023,
          "name": "2 & 3D Art Appreciation and Methods",
          "year": "1995",
          "grade": "C-",
          "level": "LD",
          "credits": "3.00",
          "usGrade": "C-",
          "usCredits": "3.00",
          "conversionSource": "AICE_RULES"
        },
        {
          "id": 1024,
          "name": "Visual Arts",
          "year": "1995",
          "grade": "C",
          "level": "LD",
          "credits": "1.50",
          "usGrade": "C",
          "usCredits": "1.50",
          "conversionSource": "AICE_RULES"
        },
        {
          "id": 1025,
          "name": "Track and Field",
          "year": "1995",
          "grade": "C+",
          "level": "LD",
          "credits": "1.50",
          "usGrade": "C+",
          "usCredits": "1.50",
          "conversionSource": "AICE_RULES"
        },
        {
          "id": 1026,
          "name": "Education and Society",
          "year": "1996",
          "grade": "B",
          "level": "UD",
          "credits": "1.50",
          "usGrade": "B",
          "usCredits": "1.50",
          "conversionSource": "AICE_RULES"
        },
        {
          "id": 1027,
          "name": "Technology in Education",
          "year": "1996",
          "grade": "B+",
          "level": "UD",
          "credits": "1.50",
          "usGrade": "B+",
          "usCredits": "1.50",
          "conversionSource": "AICE_RULES"
        },
        {
          "id": 1028,
          "name": "Parent and Community Involvement",
          "year": "1996",
          "grade": "B+",
          "level": "UD",
          "credits": "1.00",
          "usGrade": "B+",
          "usCredits": "1.00",
          "conversionSource": "AICE_RULES"
        },
        {
          "id": 1029,
          "name": "Professionalism",
          "year": "1996",
          "grade": "B-",
          "level": "UD",
          "credits": "1.00",
          "usGrade": "B-",
          "usCredits": "1.00",
          "conversionSource": "AICE_RULES"
        },
        {
          "id": 1030,
          "name": "Principles of Physical Education and Netball",
          "year": "1996",
          "grade": "B",
          "level": "UD",
          "credits": "3.00",
          "usGrade": "B",
          "usCredits": "3.00",
          "conversionSource": "AICE_RULES"
        },
        {
          "id": 1031,
          "name": "Research (Unspecified)",
          "year": "1996",
          "grade": "B+",
          "level": "UD",
          "credits": "2.00",
          "usGrade": "B+",
          "usCredits": "2.00",
          "conversionSource": "AICE_RULES"
        },
        {
          "id": 1032,
          "name": "Practice Teaching (8 Weeks)",
          "year": "1996",
          "grade": "B",
          "level": "UD",
          "credits": "0.00",
          "usGrade": "B",
          "usCredits": "0.00",
          "conversionSource": "AI_INFERRED"
        }
      ],
      "program": "Early Childhood (Diploma in Early Childhood Teaching)",
      "totalCredits": "103.50",
      "yearsAttended": "1994 - 1997",
      "grantsAccessTo": "Teaching and Undergraduate Education",
      "gradeConversion": [
        {
          "grade": "A+ (90.000 - 100.000)",
          "usGrade": "A+"
        },
        {
          "grade": "A (85.000 - 89.990)",
          "usGrade": "A"
        },
        {
          "grade": "A- (80.000 - 84.990)",
          "usGrade": "A-"
        },
        {
          "grade": "B+ (75.000 - 79.990)",
          "usGrade": "B+"
        },
        {
          "grade": "B (70.000 - 74.990)",
          "usGrade": "B"
        },
        {
          "grade": "B- (65.000 - 69.990)",
          "usGrade": "B-"
        },
        {
          "grade": "C+ (60.000 - 64.990)",
          "usGrade": "C+"
        },
        {
          "grade": "C (55.000 - 59.990)",
          "usGrade": "C"
        },
        {
          "grade": "C- (50.000 - 54.990)",
          "usGrade": "C-"
        },
        {
          "grade": "D (45.000 - 49.990)",
          "usGrade": "D"
        },
        {
          "grade": "P (Pass)",
          "usGrade": "PASS"
        },
        {
          "grade": "E (0.000 - 44.990)",
          "usGrade": "F"
        }
      ],
      "yearOfGraduation": "1997",
      "awardingInstitution": "Shortwood Teachers' College",
      "equivalenceStatement": "Associate in Teaching Early Childhood Education",
      "admissionRequirements": "Pass at least five subjects at the CSEC (Caribbean Secondary Education Certificate). This is the equivalent of graduation from a college preparatory program at an accredited high school in the United States.",
      "standardProgramLength": "Three years"
    },
    {
      "id": 2,
      "gpa": "",
      "country": "Jamaica",
      "courses": [
        {
          "id": 2001,
          "name": "ED20B Child Grow and Development",
          "year": "1999",
          "grade": "B",
          "level": "UD",
          "credits": "3.00",
          "usGrade": "B",
          "usCredits": "2.50",
          "conversionSource": "AICE_RULES"
        },
        {
          "id": 2002,
          "name": "ED20C Motivation and the Teacher",
          "year": "1999",
          "grade": "B+",
          "level": "UD",
          "credits": "3.00",
          "usGrade": "B+",
          "usCredits": "2.50",
          "conversionSource": "AICE_RULES"
        },
        {
          "id": 2003,
          "name": "ED20M Introduction to Curriculum Studies",
          "year": "1999",
          "grade": "B+",
          "level": "UD",
          "credits": "3.00",
          "usGrade": "B+",
          "usCredits": "2.50",
          "conversionSource": "AICE_RULES"
        },
        {
          "id": 2004,
          "name": "ED20W History and Philosophy of Early Childhood Education",
          "year": "1999",
          "grade": "D+",
          "level": "UD",
          "credits": "3.00",
          "usGrade": "D",
          "usCredits": "2.50",
          "conversionSource": "AI_INFERRED"
        },
        {
          "id": 2005,
          "name": "SY24C Caribbean Social Issues",
          "year": "1999",
          "grade": "B",
          "level": "UD",
          "credits": "3.00",
          "usGrade": "B",
          "usCredits": "2.50",
          "conversionSource": "AICE_RULES"
        },
        {
          "id": 2006,
          "name": "SY14G Sociology for the Caribbean",
          "year": "1999",
          "grade": "B+",
          "level": "UD",
          "credits": "3.00",
          "usGrade": "B+",
          "usCredits": "2.50",
          "conversionSource": "AICE_RULES"
        },
        {
          "id": 2007,
          "name": "UC001 English Proficiency Exam",
          "year": "1999",
          "grade": "Pass",
          "level": "UD",
          "credits": "0.00",
          "usGrade": "P",
          "usCredits": "0.00",
          "conversionSource": "AICE_RULES"
        },
        {
          "id": 2008,
          "name": "ED20Y Introduction to Computer Technology in Education",
          "year": "1999",
          "grade": "A",
          "level": "UD",
          "credits": "3.00",
          "usGrade": "A",
          "usCredits": "2.50",
          "conversionSource": "AICE_RULES"
        },
        {
          "id": 2009,
          "name": "ED22K Understanding Mathematics and Science in Early Childhood Education",
          "year": "1999",
          "grade": "D+",
          "level": "UD",
          "credits": "3.00",
          "usGrade": "D",
          "usCredits": "2.50",
          "conversionSource": "AICE_RULES"
        },
        {
          "id": 2010,
          "name": "ED25N Development of Language and Literacy in Early Childhood Education",
          "year": "1999",
          "grade": "B+",
          "level": "UD",
          "credits": "3.00",
          "usGrade": "B+",
          "usCredits": "2.50",
          "conversionSource": "AICE_RULES"
        },
        {
          "id": 2011,
          "name": "ED30C Classroom Concerns",
          "year": "1999",
          "grade": "B+",
          "level": "UD",
          "credits": "3.00",
          "usGrade": "B+",
          "usCredits": "2.50",
          "conversionSource": "AICE_RULES"
        },
        {
          "id": 2012,
          "name": "FD10A English for Academic Purposes",
          "year": "1999",
          "grade": "Pass",
          "level": "UD",
          "credits": "3.00",
          "usGrade": "P",
          "usCredits": "2.50",
          "conversionSource": "AICE_RULES"
        },
        {
          "id": 2013,
          "name": "SY21M Introduction to Population",
          "year": "1999",
          "grade": "B+",
          "level": "UD",
          "credits": "3.00",
          "usGrade": "B+",
          "usCredits": "2.50",
          "conversionSource": "AICE_RULES"
        },
        {
          "id": 2014,
          "name": "SY10C Caribbean Culture",
          "year": "1999",
          "grade": "B",
          "level": "UD",
          "credits": "3.00",
          "usGrade": "B",
          "usCredits": "2.50",
          "conversionSource": "AICE_RULES"
        },
        {
          "id": 2015,
          "name": "ED20G Research in Education",
          "year": "2000",
          "grade": "B",
          "level": "UD",
          "credits": "3.00",
          "usGrade": "B",
          "usCredits": "2.50",
          "conversionSource": "AICE_RULES"
        },
        {
          "id": 2016,
          "name": "ED30K Moral and Political Issues in Education Policy",
          "year": "2000",
          "grade": "B",
          "level": "UD",
          "credits": "3.00",
          "usGrade": "B",
          "usCredits": "2.50",
          "conversionSource": "AICE_RULES"
        },
        {
          "id": 2017,
          "name": "ED30T Pre-Practicum",
          "year": "2000",
          "grade": "C",
          "level": "UD",
          "credits": "3.00",
          "usGrade": "C",
          "usCredits": "2.50",
          "conversionSource": "AICE_RULES"
        },
        {
          "id": 2018,
          "name": "ED30U Field Study",
          "year": "2000",
          "grade": "B+",
          "level": "UD",
          "credits": "3.00",
          "usGrade": "B+",
          "usCredits": "2.50",
          "conversionSource": "AICE_RULES"
        },
        {
          "id": 2019,
          "name": "ED30V Creative Expressions in Early Childhood Education",
          "year": "2000",
          "grade": "B+",
          "level": "UD",
          "credits": "3.00",
          "usGrade": "B+",
          "usCredits": "2.50",
          "conversionSource": "AICE_RULES"
        },
        {
          "id": 2020,
          "name": "FD11A Caribbean Civilization",
          "year": "2000",
          "grade": "Pass",
          "level": "UD",
          "credits": "3.00",
          "usGrade": "P",
          "usCredits": "2.50",
          "conversionSource": "AICE_RULES"
        },
        {
          "id": 2021,
          "name": "ED30S Report",
          "year": "2000",
          "grade": "B+",
          "level": "UD",
          "credits": "3.00",
          "usGrade": "B+",
          "usCredits": "2.50",
          "conversionSource": "AICE_RULES"
        },
        {
          "id": 2022,
          "name": "ED30W Curriculum Development: Theory and Planning in Early Childhood Education",
          "year": "2000",
          "grade": "B+",
          "level": "UD",
          "credits": "3.00",
          "usGrade": "B+",
          "usCredits": "2.50",
          "conversionSource": "AICE_RULES"
        },
        {
          "id": 2023,
          "name": "ED33K Supervision and Administration of Early Childhood Education",
          "year": "2000",
          "grade": "B",
          "level": "UD",
          "credits": "3.00",
          "usGrade": "B",
          "usCredits": "2.50",
          "conversionSource": "AICE_RULES"
        },
        {
          "id": 2024,
          "name": "SY31P Reproductive Health and Family Life Education",
          "year": "2000",
          "grade": "B+",
          "level": "UD",
          "credits": "3.00",
          "usGrade": "B+",
          "usCredits": "2.50",
          "conversionSource": "AICE_RULES"
        },
        {
          "id": 2025,
          "name": "SY36C Social Planning and Project Implementation",
          "year": "2000",
          "grade": "B+",
          "level": "UD",
          "credits": "3.00",
          "usGrade": "B+",
          "usCredits": "2.50",
          "conversionSource": "AICE_RULES"
        }
      ],
      "program": "Bachelor of Education (Early Childhood Education)",
      "totalCredits": "",
      "yearsAttended": "1999 - 2001",
      "grantsAccessTo": "Graduate Studies",
      "gradeConversion": [
        {
          "grade": "A (80.000 - 100.000)",
          "usGrade": "A"
        },
        {
          "grade": "B+ (75.000 - 79.000)",
          "usGrade": "B+"
        },
        {
          "grade": "B (70.000 - 74.000)",
          "usGrade": "B"
        },
        {
          "grade": "B- (65.000 - 69.000)",
          "usGrade": "B-"
        },
        {
          "grade": "C+ (60.000 - 64.000)",
          "usGrade": "C+"
        },
        {
          "grade": "C (55.000 - 59.000)",
          "usGrade": "C"
        },
        {
          "grade": "C- (45.000 - 49.000)",
          "usGrade": "C-"
        },
        {
          "grade": "D (40.000 - 45.000)",
          "usGrade": "F"
        },
        {
          "grade": "E (0.000 - 39.000)",
          "usGrade": "F"
        }
      ],
      "yearOfGraduation": "2001",
      "awardingInstitution": "The University of the West Indies",
      "equivalenceStatement": "Bachelor of Education",
      "admissionRequirements": "Pass at least five subjects at the CSEC (Caribbean Secondary Education Certificate). This is the equivalent of graduation from a college preparatory program at an accredited high school in the United States.",
      "standardProgramLength": "Two years"
    },
    {
      "id": 3,
      "gpa": "",
      "country": "Jamaica",
      "courses": [
        {
          "id": 3001,
          "name": "EDCU 6003 M (ED67A) Learning Disabilities",
          "year": "2008",
          "grade": "A",
          "level": "GR",
          "credits": "3.00",
          "usGrade": "A",
          "usCredits": "6.00",
          "conversionSource": "AICE_RULES"
        },
        {
          "id": 3002,
          "name": "EDEC 6005 M (ED60E) Programme Management",
          "year": "2008",
          "grade": "B+",
          "level": "GR",
          "credits": "3.00",
          "usGrade": "B+",
          "usCredits": "6.00",
          "conversionSource": "AICE_RULES"
        },
        {
          "id": 3003,
          "name": "EDEC 6804 M (ED68D) Early Childhood Development in Caribbean Context",
          "year": "2008",
          "grade": "B",
          "level": "GR",
          "credits": "3.00",
          "usGrade": "B",
          "usCredits": "6.00",
          "conversionSource": "AICE_RULES"
        },
        {
          "id": 3004,
          "name": "EDEC 6805 M (ED68E) Team Leadership, Interpersonal Skill & Communication",
          "year": "2008",
          "grade": "A",
          "level": "GR",
          "credits": "3.00",
          "usGrade": "A",
          "usCredits": "6.00",
          "conversionSource": "AICE_RULES"
        },
        {
          "id": 3005,
          "name": "EDAE 6001 M (ED60P) Adult Learning Methods and Teaching Strategies",
          "year": "2008",
          "grade": "B+",
          "level": "GR",
          "credits": "3.00",
          "usGrade": "B+",
          "usCredits": "6.00",
          "conversionSource": "AICE_RULES"
        },
        {
          "id": 3006,
          "name": "EDEC 6002 M (ED60B) Issues & Trends in Early Childhood Development in the Caribbean",
          "year": "2008",
          "grade": "A",
          "level": "GR",
          "credits": "3.00",
          "usGrade": "A",
          "usCredits": "6.00",
          "conversionSource": "AICE_RULES"
        },
        {
          "id": 3007,
          "name": "EDRS 6002 M (ED60N) Research Methods",
          "year": "2008",
          "grade": "A",
          "level": "GR",
          "credits": "3.00",
          "usGrade": "A",
          "usCredits": "6.00",
          "conversionSource": "AICE_RULES"
        },
        {
          "id": 3008,
          "name": "EDEC 6807 M (ED68G) Strategic Management",
          "year": "2009",
          "grade": "B+",
          "level": "GR",
          "credits": "3.00",
          "usGrade": "B+",
          "usCredits": "6.00",
          "conversionSource": "AICE_RULES"
        },
        {
          "id": 3009,
          "name": "EDRS 6801 M Project",
          "year": "2009",
          "grade": "RIP",
          "level": "GR",
          "credits": "6.00",
          "usGrade": "N/A",
          "usCredits": "0.00",
          "conversionSource": "AI_INFERRED"
        },
        {
          "id": 3010,
          "name": "EDRS 6801 M Project",
          "year": "2009",
          "grade": "B",
          "level": "GR",
          "credits": "6.00",
          "usGrade": "B",
          "usCredits": "12.00",
          "conversionSource": "AICE_RULES"
        }
      ],
      "program": "Master of Education (Leadership in Early Childhood Development)",
      "totalCredits": "",
      "yearsAttended": "2008 - 2010",
      "grantsAccessTo": "Doctoral Studies",
      "gradeConversion": [
        {
          "grade": "A (80.000 - 100.000)",
          "usGrade": "A"
        },
        {
          "grade": "B+ (75.000 - 79.000)",
          "usGrade": "B+"
        },
        {
          "grade": "B (70.000 - 74.000)",
          "usGrade": "B"
        },
        {
          "grade": "B- (65.000 - 69.000)",
          "usGrade": "B-"
        },
        {
          "grade": "C+ (60.000 - 64.000)",
          "usGrade": "C+"
        },
        {
          "grade": "C (55.000 - 59.000)",
          "usGrade": "C"
        },
        {
          "grade": "C- (45.000 - 49.000)",
          "usGrade": "C-"
        },
        {
          "grade": "D (40.000 - 45.000)",
          "usGrade": "F"
        },
        {
          "grade": "E (0.000 - 39.000)",
          "usGrade": "F"
        }
      ],
      "yearOfGraduation": "2010",
      "awardingInstitution": "The University of the West Indies",
      "equivalenceStatement": "Master of Education in Leadership in Early Childhood Education",
      "admissionRequirements": "Bachelor's Degree",
      "standardProgramLength": "Two years"
    }
  ],
  "evaluatorName": "Beatriz Y. Pineda Gayon",
  "evaluationNotes": "Mr./Mrs. [N/A] was enrolled at Shortwood Teachers’ College from 1994 to 1997.  Founded in 1940,  Shortwood Teachers’ College offers programs accredited by the Jamaica Tertiary Education Commission (TCJ) and the degrees are granted by The University of the West Indies. Mr./Mrs. [N/A] majored in Early Childhood Education and completed the three-year program in Teacher Education approved by the Joint Board of Teacher Education of Jamaica. She was awarded the Diploma in Teaching by the Joint Board of Teacher Education and the University of West Indies (UWI) in June, 1997. We have reviewed the curriculum of this program to ensure that it is substantially equivalent to an associate’s degree in the United States. This is the equivalent of the U.S. degree of Associate in Teaching Early Childhood Education earned at a regionally accredited college in the United States. \n\nMr./Mrs. [N/A] continued her study at the University of West Indies from 1999 to 2000. Founded in 1963, the University of the West Indies (UWI) is a public and recognized institution of higher education serving multiple English-speaking countries and territories in the Caribbean. She was awarded the degree of Bachelor of Education, Second Class Honours Upper Division, by the University of West Indies (UWI) in July, 2001. We have reviewed the curriculum of this program to ensure that it is substantially equivalent to a bachelor’s degree in the United States. This is the equivalent of the U.S. degree of Bachelor of Education earned at a regionally accredited college in the United States.\n\nMr./Mrs. [N/A] pursued graduate study at the University of West Indies from 2008 to 2010. She majored in Leadership in Childhood Development and was awarded the degree of Master of Education by the University of West Indies (UWI) on October 20, 2010. We have reviewed the curriculum of this program to ensure that it is substantially equivalent to a Master’s degree in the United States. This is the equivalent of the U.S. degree of Master of Education in Leadership in Early Childhood Education earned at a regionally accredited college in the United States. \n\nCredits for the Diploma in Teaching from Shortwood Teachers' College are expressed in contact hours; these were converted to US semester credits using a factor of 15 contact hours per 1 US credit, normalized to 30 credits per year. Credits for the University of the West Indies (UWI) were converted to US semester credits based on a normalization of 30 credits per academic year (60 per degree for the B.Ed and M.Ed components). Practice Teaching for the Diploma was assigned 8.0 semester credits based on an 8-week duration. Grading conversions for UWI were based on the specific undergraduate and graduate scales provided in the academic records, where 50% is the minimum passing mark.",
  "evaluatorSignature": "/beatriz-signature.png",
  "seniorEvaluatorName": "Luguan Yan",
  "seniorEvaluatorSignature": "/luguan-yan-signature.png"
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
