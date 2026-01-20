import { ReportTitle } from "../ui/shared"

// Evaluator profile data - corresponds to signatures in signatures.tsx
type EvaluatorProfile = {
    name: string
    title: string
    bio: string[]
    isSenior: boolean
}

const EVALUATOR_PROFILES: EvaluatorProfile[] = [
    {
        name: "Luguan Yan",
        title: "Director of Evaluation",
        isSenior: true,
        bio: [
            "Mr. Yan obtained his degree of Bachelor of Arts in Philosophy from Nanjing University, the People's Republic of China in 1991 and the degree of Master of Arts in Philosophy from the University of Miami in 1998.",
            "He worked over 10 years in a prominent evaluation institution as a senior associate director and team leader for Asian-pacific countries. He has completed over 5000 foreign credential evaluation of documents from numerous foreign countries for various universities, licensing boards, U.S. government, and immigration services.",
            "He is a leading expert in the evaluation of credentials from the People's Republic of China and was invited several times to be a keynote speaker to hundreds of admission counselors of U.S. universities for evaluating complex credentials from the People's Republic of China."
        ]
    },
    {
        name: "Hongjian Chen",
        title: "Credential Evaluator",
        isSenior: false,
        bio: [
            "Mr. Chen holds a Bachelor's degree in English from Beijing Foreign Studies University and a Master's degree in Education from the University of Southern California.",
            "With over 5 years of experience in international credential evaluation, Mr. Chen specializes in evaluating educational documents from East Asian countries including China, Japan, South Korea, and Taiwan.",
            "He is proficient in both English and Mandarin Chinese, enabling him to accurately interpret and evaluate complex academic documents from Chinese-language institutions."
        ]
    }
]

// Office locations data - West and East Coast HQs
const OFFICE_LOCATIONS = [
    { name: "Los Angeles (CA HQ)", address: "19800 Macarthur Blvd Ste 570, Irvine, CA 92612", phone: "+1 949-954-7996", email: "ca2@aet21.com" },
    { name: "Miami (HQ)", address: "15321 S Dixie Hwy, #302, Palmetto Bay, FL 33157", phone: "+1 786-250-3999", email: "info@aet21.com" },
]

// Evaluator Profiles component - displays all evaluator introductions
const EvaluatorProfiles = () => (
    <div className="mt-6">
        <ReportTitle>
            Evaluator Profiles
        </ReportTitle>
        <div className="flex flex-col gap-6 mt-4">
            {EVALUATOR_PROFILES.map((profile, index) => (
                <div key={index}>
                    <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-lg text-blue-900">
                            {profile.name}, {profile.title}
                        </h3>
                        {profile.isSenior && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                Senior
                            </span>
                        )}
                    </div>
                    {profile.bio.map((paragraph, pIndex) => (
                        <p key={pIndex} className="text-justify mb-2 text-xs">
                            {paragraph}
                        </p>
                    ))}
                </div>
            ))}
        </div>
    </div>
)

export const AboutAetPage = () => (
    <div className="mt-8 text-xs leading-relaxed font-sans">
        <ReportTitle>
            About AET
        </ReportTitle>

        {/* Company Profile - Full Width */}
        <div className="mb-4">
            {/* <h3 className="font-bold text-blue-900 mb-2 underline decoration-blue-900/30">Company Profile</h3> */}
            <p className="mb-2 text-justify">
                Founded in 2009 in Miami, FL, American Education & Translation Services (AET) has established itself as a premier provider of translation and credential evaluation services. AET is a Corporate Member of the American Translators Association (ATA) and a member of the Association of International Educators (NAFSA). Our evaluation services are approved by the Illinois State Board of Education, New Mexico Public Education Department, and Ohio State Board of Education.
            </p>
            <p className="text-justify">
                We provide certified translation services in over 100 languages and have served thousands of clients including universities, licensing boards, and government agencies. We offer convenient online services and have multiple office locations to serve our clients.
            </p>
        </div>

        {/* Contact Information - Horizontal Grid Layout */}
        <div className="mb-4">
            {/* <h3 className="font-bold text-blue-900 mb-2 underline decoration-blue-900/30">Contact Information</h3> */}
            <div className="grid grid-cols-2 gap-6">
                {OFFICE_LOCATIONS.map((office, index) => (
                    <div key={index} className="text-xs">
                        <div className="font-bold text-gray-800">{office.name}</div>
                        <div className="text-gray-600 leading-tight">{office.address}</div>
                        <div className="text-gray-600 leading-tight">{office.phone}</div>
                        <div className="text-gray-600 leading-tight">{office.email}</div>
                    </div>
                ))}
            </div>
        </div>

        <EvaluatorProfiles />
    </div>
)
