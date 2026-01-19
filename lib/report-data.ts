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

const GREECE_COURSES: Course[] = [
  { id: 1001, name: "Fathers – Scripture – Tradition (Seminar)", year: "2019-2020", grade: "10 (Ten)", level: "UD", credits: "4.0", usGrade: "A", usCredits: "2.00", conversionSource: "AI_INFERRED" },
  { id: 1002, name: "History of Dogmas", year: "2019-2020", grade: "10 (Ten)", level: "UD", credits: "4.0", usGrade: "A", usCredits: "2.00", conversionSource: "AI_INFERRED" },
  { id: 1003, name: "Modern Christian Heresies", year: "2019-2020", grade: "10 (Ten)", level: "UD", credits: "4.0", usGrade: "A", usCredits: "2.00", conversionSource: "AI_INFERRED" },
  { id: 1004, name: "Canon Law II – Special Part", year: "2019-2020", grade: "10 (Ten)", level: "UD", credits: "4.0", usGrade: "A", usCredits: "2.00", conversionSource: "AI_INFERRED" },
  { id: 1005, name: "Symbolism – Ecumenical Movement Inter-Christian Relations", year: "2019-2020", grade: "10 (Ten)", level: "UD", credits: "4.0", usGrade: "A", usCredits: "2.00", conversionSource: "AI_INFERRED" },
  { id: 1006, name: "Liturgy III – Byzantine Liturgical Tradition", year: "2019-2020", grade: "10 (Ten)", level: "UD", credits: "4.0", usGrade: "A", usCredits: "2.00", conversionSource: "AI_INFERRED" },
  { id: 1007, name: "Christian Ethics and Bioethics", year: "2020-2021", grade: "9 (Nine)", level: "UD", credits: "4.0", usGrade: "A", usCredits: "2.00", conversionSource: "AI_INFERRED" },
  { id: 1008, name: "Theology, Natural Sciences and the Environment (Seminar)", year: "2019-2020", grade: "10 (Ten)", level: "UD", credits: "5.0", usGrade: "A", usCredits: "2.50", conversionSource: "AI_INFERRED" },
  { id: 1009, name: "Theology of the New Testament", year: "2019-2020", grade: "7 (Seven)", level: "UD", credits: "4.0", usGrade: "B", usCredits: "2.00", conversionSource: "AI_INFERRED" },
  { id: 1010, name: "Interpretation of Biblical Texts", year: "2020-2021", grade: "10 (Ten)", level: "UD", credits: "3.0", usGrade: "A", usCredits: "1.50", conversionSource: "AI_INFERRED" },
  { id: 1011, name: "Theology of the Old Testament", year: "2020-2021", grade: "10 (Ten)", level: "UD", credits: "4.0", usGrade: "A", usCredits: "2.00", conversionSource: "AI_INFERRED" },
  { id: 1012, name: "History of Religions and Interfaith Dialogue", year: "2020-2021", grade: "10 (Ten)", level: "UD", credits: "4.0", usGrade: "A", usCredits: "2.00", conversionSource: "AI_INFERRED" },
  { id: 1013, name: "Hagiology – Heortology", year: "2020-2021", grade: "10 (Ten)", level: "UD", credits: "4.0", usGrade: "A", usCredits: "2.00", conversionSource: "AI_INFERRED" },
  { id: 1014, name: "Pastoral and Christian Counselling - Practical Training", year: "2020-2021", grade: "8 (Eight)", level: "UD", credits: "5.0", usGrade: "B", usCredits: "2.50", conversionSource: "AI_INFERRED" },
  { id: 1015, name: "Microteaching and Student Practice", year: "2020-2021", grade: "10 (Ten)", level: "UD", credits: "8.0", usGrade: "A", usCredits: "4.00", conversionSource: "AI_INFERRED" },
  { id: 1016, name: "Dogmatics of the Orthodox Church II", year: "2019-2020", grade: "7 (Seven)", level: "UD", credits: "4.0", usGrade: "B", usCredits: "2.00", conversionSource: "AI_INFERRED" },
  { id: 1017, name: "Ecclesiastical Law", year: "2020-2021", grade: "8 (Eight)", level: "UD", credits: "4.0", usGrade: "B", usCredits: "2.00", conversionSource: "AI_INFERRED" },
  { id: 1018, name: "General Pedagogy", year: "2019-2020", grade: "10 (Ten)", level: "UD", credits: "6.0", usGrade: "A", usCredits: "3.00", conversionSource: "AI_INFERRED" },
  { id: 1019, name: "Teaching Methodology of Religious Education", year: "2020-2021", grade: "10 (Ten)", level: "UD", credits: "6.0", usGrade: "A", usCredits: "3.00", conversionSource: "AI_INFERRED" },
  { id: 1020, name: "Dogmatics of the Orthodox Church I", year: "2020-2021", grade: "9 (Nine)", level: "UD", credits: "4.0", usGrade: "A", usCredits: "2.00", conversionSource: "AI_INFERRED" },
  { id: 1021, name: "Interpretation of Dogmatic and Symbolic Texts of the Orthodox Church", year: "2020-2021", grade: "10 (Ten)", level: "UD", credits: "4.0", usGrade: "A", usCredits: "2.00", conversionSource: "AI_INFERRED" },
  { id: 1022, name: "Homiletics of the Orthodox Church", year: "2019-2020", grade: "9 (Nine)", level: "UD", credits: "4.0", usGrade: "A", usCredits: "2.00", conversionSource: "AI_INFERRED" },
  { id: 1023, name: "Introduction and Textual Criticism of the New Testament", year: "2018-2019", grade: "7 (Seven)", level: "LD", credits: "5.0", usGrade: "B", usCredits: "2.50", conversionSource: "AI_INFERRED" },
  { id: 1024, name: "Patrology I: Introduction -- Literature and Theology of the Fathers of the First Four Centuries", year: "2017-2018", grade: "10 (Ten)", level: "LD", credits: "5.0", usGrade: "A", usCredits: "2.50", conversionSource: "AI_INFERRED" },
  { id: 1025, name: "Sources of Church History", year: "2017-2018", grade: "10 (Ten)", level: "LD", credits: "4.0", usGrade: "A", usCredits: "2.00", conversionSource: "AI_INFERRED" },
  { id: 1026, name: "Greek Language of the Biblical and Ecclesiastical Texts", year: "2018-2019", grade: "9 (Nine)", level: "LD", credits: "4.0", usGrade: "A", usCredits: "2.00", conversionSource: "AI_INFERRED" },
  { id: 1027, name: "History of Byzantine Civilization and Modern Hellenism", year: "2018-2019", grade: "10 (Ten)", level: "LD", credits: "4.0", usGrade: "A", usCredits: "2.00", conversionSource: "AI_INFERRED" },
  { id: 1028, name: "Ecclesiastical Music", year: "2017-2018", grade: "8 (Eight)", level: "LD", credits: "5.0", usGrade: "B", usCredits: "2.50", conversionSource: "AI_INFERRED" },
  { id: 1029, name: "Introduction to the Old Testament", year: "2019-2020", grade: "9 (Nine)", level: "LD", credits: "4.0", usGrade: "A", usCredits: "2.00", conversionSource: "AI_INFERRED" },
  { id: 1030, name: "Patrology II: Literature and Theology of the Fathers from the 5th to the 8th Century", year: "2019-2020", grade: "7 (Seven)", level: "LD", credits: "4.0", usGrade: "B", usCredits: "2.00", conversionSource: "AI_INFERRED" },
  { id: 1031, name: "General Church History", year: "2018-2019", grade: "10 (Ten)", level: "LD", credits: "4.0", usGrade: "A", usCredits: "2.00", conversionSource: "AI_INFERRED" },
  { id: 1032, name: "History of the Ecumenical Patriarchate, the Other Ancient Patriarchates, and the Church of Greece", year: "2017-2018", grade: "9 (Nine)", level: "LD", credits: "4.0", usGrade: "A", usCredits: "2.00", conversionSource: "AI_INFERRED" },
  { id: 1033, name: "Christian and Byzantine Archaeology and Art", year: "2018-2019", grade: "10 (Ten)", level: "LD", credits: "4.0", usGrade: "A", usCredits: "2.00", conversionSource: "AI_INFERRED" },
  { id: 1034, name: "Liturgics I: Introduction and Aesthetics of Worship", year: "2017-2018", grade: "10 (Ten)", level: "LD", credits: "4.0", usGrade: "A", usCredits: "2.00", conversionSource: "AI_INFERRED" },
  { id: 1035, name: "Theology, Educational Technology and Scientific Research", year: "2018-2019", grade: "9 (Nine)", level: "LD", credits: "6.0", usGrade: "A", usCredits: "3.00", conversionSource: "AI_INFERRED" },
  { id: 1036, name: "Methodology - Interpretation of the New Testament", year: "2020-2021", grade: "8 (Eight)", level: "LD", credits: "5.0", usGrade: "B", usCredits: "2.50", conversionSource: "AI_INFERRED" },
  { id: 1037, name: "Patrology III: Literature and Theology of the Fathers from the 9th to the 15th Century", year: "2018-2019", grade: "10 (Ten)", level: "LD", credits: "5.0", usGrade: "A", usCredits: "2.50", conversionSource: "AI_INFERRED" },
  { id: 1038, name: "Introduction to the Study of Religions", year: "2018-2019", grade: "10 (Ten)", level: "LD", credits: "4.0", usGrade: "A", usCredits: "2.00", conversionSource: "AI_INFERRED" },
  { id: 1039, name: "Sociology of Christianity", year: "2018-2019", grade: "10 (Ten)", level: "LD", credits: "4.0", usGrade: "A", usCredits: "2.00", conversionSource: "AI_INFERRED" },
  { id: 1040, name: "Hymnology", year: "2017-2018", grade: "8 (Eight)", level: "LD", credits: "4.0", usGrade: "B", usCredits: "2.00", conversionSource: "AI_INFERRED" },
  { id: 1041, name: "History of Ancient and Byzantine Philosophy", year: "2020-2021", grade: "8 (Eight)", level: "LD", credits: "4.0", usGrade: "B", usCredits: "2.00", conversionSource: "AI_INFERRED" },
  { id: 1042, name: "Interpretation of the Old Testament", year: "2019-2020", grade: "9 (Nine)", level: "LD", credits: "5.0", usGrade: "A", usCredits: "2.50", conversionSource: "AI_INFERRED" },
  { id: 1043, name: "Christian Literature and Theology of the Times after the Fall", year: "2019-2020", grade: "9 (Nine)", level: "LD", credits: "4.0", usGrade: "A", usCredits: "2.00", conversionSource: "AI_INFERRED" },
  { id: 1044, name: "History of the Slavic and Other Orthodox Churches", year: "2018-2019", grade: "10 (Ten)", level: "LD", credits: "4.0", usGrade: "A", usCredits: "2.00", conversionSource: "AI_INFERRED" },
  { id: 1045, name: "Canon Law I: Sources and General Part", year: "2020-2021", grade: "9 (Nine)", level: "LD", credits: "4.0", usGrade: "A", usCredits: "2.00", conversionSource: "AI_INFERRED" },
  { id: 1046, name: "Educational Psychology", year: "2018-2019", grade: "10 (Ten)", level: "LD", credits: "5.0", usGrade: "A", usCredits: "2.50", conversionSource: "AI_INFERRED" },
  { id: 1047, name: "Church and the Contemporary World (Seminar)", year: "2019-2020", grade: "10 (Ten)", level: "LD", credits: "5.0", usGrade: "A", usCredits: "2.50", conversionSource: "AI_INFERRED" },
  { id: 1048, name: "Liturgics II: History and Theology of Divine Worship", year: "2018-2019", grade: "10 (Ten)", level: "LD", credits: "4.0", usGrade: "A", usCredits: "2.00", conversionSource: "AI_INFERRED" },
  { id: 1049, name: "Foreign Language and English-Language Theological Terminology", year: "2017-2018", grade: "10 (Ten)", level: "LD", credits: "3.0", usGrade: "A", usCredits: "1.50", conversionSource: "AI_INFERRED" },
  { id: 1050, name: "The Social Integration of Students and Religious Education", year: "2019-2020", grade: "10 (Ten)", level: "UD", credits: "4.0", usGrade: "A", usCredits: "2.00", conversionSource: "AI_INFERRED" },
  { id: 1051, name: "Inter-Orthodox and Inter-Christian Ministry of the Ecumenical Patriarchate", year: "2018-2019", grade: "10 (Ten)", level: "UD", credits: "4.0", usGrade: "A", usCredits: "2.00", conversionSource: "AI_INFERRED" },
  { id: 1052, name: "The Saints of Thessaloniki", year: "2020-2021", grade: "10 (Ten)", level: "UD", credits: "4.0", usGrade: "A", usCredits: "2.00", conversionSource: "AI_INFERRED" },
  { id: 1053, name: "The Ecumenical Patriarchate: History, Administration, Institutional Functioning after the Fall", year: "2019-2020", grade: "10 (Ten)", level: "UD", credits: "4.0", usGrade: "A", usCredits: "2.00", conversionSource: "AI_INFERRED" },
  { id: 1054, name: "Religions and the Environment", year: "2020-2021", grade: "10 (Ten)", level: "UD", credits: "4.0", usGrade: "A", usCredits: "2.00", conversionSource: "AI_INFERRED" },
  { id: 1055, name: "The Holy and Great Council of the Orthodox Church, Crete 2016", year: "2018-2019", grade: "10 (Ten)", level: "UD", credits: "4.0", usGrade: "A", usCredits: "2.00", conversionSource: "AI_INFERRED" },
  { id: 1056, name: "Byzantine Hesychasm and the Philocaly Tradition", year: "2019-2020", grade: "10 (Ten)", level: "UD", credits: "4.0", usGrade: "A", usCredits: "2.00", conversionSource: "AI_INFERRED" },
  { id: 1057, name: "Cults in Thessaloniki during the Hellenistic and Roman Periods", year: "2019-2020", grade: "10 (Ten)", level: "UD", credits: "4.0", usGrade: "A", usCredits: "2.00", conversionSource: "AI_INFERRED" }
]

const UK_COURSES: Course[] = [
  { id: 2001, name: "PCP1002 Perception & Cognition I", year: "2001-2002", grade: "58", level: "LD", credits: "10", usGrade: "B", usCredits: "2.50", conversionSource: "AI_INFERRED" },
  { id: 2002, name: "PCP1003 Brain and Behaviour I", year: "2001-2002", grade: "73", level: "LD", credits: "10", usGrade: "A", usCredits: "2.50", conversionSource: "AI_INFERRED" },
  { id: 2003, name: "PCP1004 Brain & Behaviour II", year: "2001-2002", grade: "74", level: "LD", credits: "10", usGrade: "A", usCredits: "2.50", conversionSource: "AI_INFERRED" },
  { id: 2004, name: "PDP1003 Child Psychology I", year: "2001-2002", grade: "52", level: "LD", credits: "10", usGrade: "B", usCredits: "2.50", conversionSource: "AI_INFERRED" },
  { id: 2005, name: "PHP1003 Psychology of Health", year: "2001-2002", grade: "56", level: "LD", credits: "10", usGrade: "B", usCredits: "2.50", conversionSource: "AI_INFERRED" },
  { id: 2006, name: "PHP1004 Psychology & Mental Heath", year: "2001-2002", grade: "62", level: "LD", credits: "10", usGrade: "B+", usCredits: "2.50", conversionSource: "AI_INFERRED" },
  { id: 2007, name: "PLP1001 Learning & Psychology of Language", year: "2001-2002", grade: "67", level: "LD", credits: "10", usGrade: "B+", usCredits: "2.50", conversionSource: "AI_INFERRED" },
  { id: 2008, name: "PRP1001 Research Design and Analysis I", year: "2001-2002", grade: "54", level: "LD", credits: "10", usGrade: "B", usCredits: "2.50", conversionSource: "AI_INFERRED" },
  { id: 2009, name: "PRP1002 Research Design & Analysis II", year: "2001-2002", grade: "74", level: "LD", credits: "10", usGrade: "A", usCredits: "2.50", conversionSource: "AI_INFERRED" },
  { id: 2010, name: "PRP1003 Practical Foundations I", year: "2001-2002", grade: "35", level: "LD", credits: "10", usGrade: "F", usCredits: "2.50", conversionSource: "AI_INFERRED" },
  { id: 2011, name: "PRP1004 Practical Foundations II", year: "2001-2002", grade: "58", level: "LD", credits: "10", usGrade: "B", usCredits: "2.50", conversionSource: "AI_INFERRED" },
  { id: 2012, name: "PSP1001 Personality, Int. & Soc. Psychology", year: "2001-2002", grade: "58", level: "LD", credits: "10", usGrade: "B", usCredits: "2.50", conversionSource: "AI_INFERRED" },
  { id: 2013, name: "PCP2001 Perception and Cognition II", year: "2002-2003", grade: "32", level: "LD", credits: "10", usGrade: "F", usCredits: "2.50", conversionSource: "AI_INFERRED" },
  { id: 2014, name: "PHP2003 Psychology of Illness & Disability", year: "2002-2003", grade: "37", level: "LD", credits: "10", usGrade: "F", usCredits: "2.50", conversionSource: "AI_INFERRED" },
  { id: 2015, name: "PHP2004 Abnormal Psychology", year: "2002-2003", grade: "52", level: "LD", credits: "10", usGrade: "B", usCredits: "2.50", conversionSource: "AI_INFERRED" },
  { id: 2016, name: "PLP2001 Learning and Language", year: "2002-2003", grade: "45", level: "LD", credits: "10", usGrade: "C", usCredits: "2.50", conversionSource: "AI_INFERRED" },
  { id: 2017, name: "PLP2002 Psychology of Language", year: "2002-2003", grade: "52", level: "LD", credits: "10", usGrade: "B", usCredits: "2.50", conversionSource: "AI_INFERRED" },
  { id: 2018, name: "PNP2001 Neuropsychology", year: "2002-2003", grade: "33", level: "LD", credits: "10", usGrade: "F", usCredits: "2.50", conversionSource: "AI_INFERRED" },
  { id: 2019, name: "PPP2001 Project Proposal I", year: "2002-2003", grade: "59", level: "LD", credits: "10", usGrade: "B", usCredits: "2.50", conversionSource: "AI_INFERRED" },
  { id: 2020, name: "PPP2002 Project Proposal II", year: "2002-2003", grade: "58", level: "LD", credits: "10", usGrade: "B", usCredits: "2.50", conversionSource: "AI_INFERRED" },
  { id: 2021, name: "PRP2001 Research Design & Analysis III", year: "2002-2003", grade: "54", level: "LD", credits: "10", usGrade: "B", usCredits: "2.50", conversionSource: "AI_INFERRED" },
  { id: 2022, name: "PRP2002 Research Design & Analysis IV", year: "2002-2003", grade: "34", level: "LD", credits: "10", usGrade: "F", usCredits: "2.50", conversionSource: "AI_INFERRED" },
  { id: 2023, name: "PRP2003 Practical Foundations III", year: "2002-2003", grade: "66", level: "LD", credits: "10", usGrade: "B+", usCredits: "2.50", conversionSource: "AI_INFERRED" },
  { id: 2024, name: "PSP2001 Social & Developmental Psychology", year: "2002-2003", grade: "55", level: "LD", credits: "10", usGrade: "B", usCredits: "2.50", conversionSource: "AI_INFERRED" },
  { id: 2025, name: "PCP3001 Biological Psychiatry", year: "2003-2004", grade: "40", level: "UD", credits: "20", usGrade: "C", usCredits: "5.00", conversionSource: "AI_INFERRED" },
  { id: 2026, name: "PHP3003 Psychology of Prevention & Health", year: "2003-2004", grade: "0", level: "UD", credits: "0", usGrade: "F", usCredits: "0.00", conversionSource: "AI_INFERRED" },
  { id: 2027, name: "PHP3004 Clinical Psychology", year: "2003-2004", grade: "60", level: "UD", credits: "20", usGrade: "B+", usCredits: "5.00", conversionSource: "AI_INFERRED" },
  { id: 2028, name: "PPP3001 Project (Single Honours)", year: "2003-2004", grade: "0", level: "UD", credits: "0", usGrade: "F", usCredits: "0.00", conversionSource: "AI_INFERRED" },
  { id: 2029, name: "PSP3001 Forensic Psychology", year: "2003-2004", grade: "51", level: "UD", credits: "20", usGrade: "B", usCredits: "5.00", conversionSource: "AI_INFERRED" }
]

export const buildSampleData = (): SampleData => ({
  refNo: "LA-20260116-102",
  name: "Grigoriadis Ioannis",
  dob: "1981",
  country: "Greece",
  date: "January 16, 2026",
  purpose: "N/A",
  evaluatorName: "Hongjian Chen",
  evaluatorSignature: "",
  seniorEvaluatorName: "Luguan Yan",
  seniorEvaluatorSignature: "/luguan-yan-signature.png",
  evaluationNotes: "The credit conversion is based on the standard academic workload where one full-time academic year is equivalent to 30 US semester credits. For the Aristotle University of Thessaloniki, the program total of 244 original credits over 4 years yields an average of 61 credits per year (ratio 30/61). For the University of Wales, Bangor, the standard CATS system of 120 credits per year is equated to 30 US credits (ratio 0.25). Grades from Greece were converted using the standard 10-point scale where 8.5-10 is Excellent (A). UK grades were converted based on the British undergraduate honors classification where 70+ is First Class (A), 60-69 is Upper Second (B+), 50-59 is Lower Second (B), and 40-49 is Third Class (C).",
  documents: [
    {
      title: "Copy of Bachelor Degree",
      issuedBy: "Aristotle University of Thessaloniki",
      dateIssued: "25/08/2021",
      certificateNo: "0987/25-08-2021"
    },
    {
      title: "Certificate of Academic Transcript",
      issuedBy: "Aristotle University of Thessaloniki",
      dateIssued: "25/08/2021",
      certificateNo: "0989/25-08-2021"
    },
    {
      title: "Bachelor of Science Diploma",
      issuedBy: "University of Wales, Bangor",
      dateIssued: "18 July 2005",
      certificateNo: "0000012697799"
    },
    {
      title: "Official University Transcript",
      issuedBy: "University of Wales, Bangor",
      dateIssued: "27th November 2015",
      certificateNo: "N/A"
    }
  ],

  credentials: [
    {
      id: 2,
      awardingInstitution: "University of Wales, Bangor (Prifysgol Cymru, Bangor)",
      country: "United Kingdom",
      admissionRequirements: "N/A",
      program: "Psychology with Clinical and Health Psychology (Seicoleg Gyda Seicoleg Glinigol Ac Iechyd)",
      grantsAccessTo: "Graduate programs",
      standardProgramLength: "Three years",
      yearsAttended: "2001-2004",
      yearOfGraduation: "2005",
      equivalenceStatement: "Bachelor's degree with a major in Psychology",
      courses: UK_COURSES,
      gradeConversion: [
        { grade: "70-100 (First Class Honours)", usGrade: "A" },
        { grade: "60-69 (Upper Second Class Honours)", usGrade: "B+" },
        { grade: "50-59 (Lower Second Class Honours)", usGrade: "B" },
        { grade: "40-49 (Third Class Honours)", usGrade: "C" },
        { grade: "0-39 (Fail)", usGrade: "F" }
      ],
      get gpa() {
        return calculateStats(this.courses).gpa
      },
      get totalCredits() {
        return calculateStats(this.courses).totalCredits
      },
    },
    {
      id: 1,
      awardingInstitution: "Aristotle University of Thessaloniki (ΑΡΙΣΤΟΤΕΛΕΙΟ ΠΑΝΕΠΙΣΤΗΜΙΟ ΘΕΣΣΑΛΟΝΙΚΗΣ)",
      country: "Greece",
      admissionRequirements: "Having fulfilled all the prevailing requirements of university law",
      program: "Social Theology and Christian Culture (ΚΟΙΝΩΝΙΚΗΣ ΘΕΟΛΟΓΙΑΣ ΚΑΙ ΧΡΙΣΤΙΑΝΙΚΟΥ ΠΟΛΙΤΙΣΜΟΥ)",
      grantsAccessTo: "Graduate programs",
      standardProgramLength: "Four years",
      yearsAttended: "2017-2021",
      yearOfGraduation: "2021",
      equivalenceStatement: "Bachelor's degree with a major in Social Theology and Christian Culture",
      courses: GREECE_COURSES,
      gradeConversion: [
        { grade: "8.50-10.00 (Excellent / Άριστα)", usGrade: "A" },
        { grade: "6.50-8.49 (Very Good / Λίαν Καλώς)", usGrade: "B" },
        { grade: "5.00-6.49 (Good / Καλώς)", usGrade: "C" }
      ],
      get gpa() {
        return calculateStats(this.courses).gpa
      },
      get totalCredits() {
        return calculateStats(this.courses).totalCredits
      },
    },
  ],
  references: `• AACRAO Edge. (n.d.). Greece: Grading System. Retrieved from https://www.aacrao.org/edge
• AACRAO Edge. (n.d.). United Kingdom: Grading System. Retrieved from https://www.aacrao.org/edge
• National Academic Recognition Information Centre (NARIC). (2021). International Comparisons: Greece and UK.
• International Association of Universities (IAU). (2019). International Handbook of Universities (29th). Palgrave Macmillan.
• Europa Publications. (2021). The Europa World of Learning (72nd). Routledge.
• IAU / UNESCO. (2026). World Higher Education Database (WHED).
• Aristotle University of Thessaloniki. (n.d.). Home. Retrieved from https://www.auth.gr
• University of Wales, Bangor. (n.d.). Home. Retrieved from https://www.bangor.ac.uk`,
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
