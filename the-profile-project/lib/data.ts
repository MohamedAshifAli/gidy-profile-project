import { Profile, SocialLink, Skill, WorkExperience } from './types';

export const DEFAULT_PROFILE: Profile = {
  id: 0,
  name: "Ashif",
  title: "Python / AI Engineer",
  bio: "Dynamic Python Developer with a Bachelor's degree in IT, specialized in machine learning and artificial intelligence. Proficient in Python, as well as HTML, with practical experience developing robust applications in academic settings. Demonstrated expertise in data preprocessing, Machine Learning and Deep Learning model development, and real-time predictive system design. Proven ability to deliver AI solutions that enhance accuracy and efficiency. Committed to continuous learning and ready to tackle new challenges, bringing strong problem-solving skills and a passion for innovation to your organization",
  email: "mohamedashif180@email.com",
  phone: "+91 63829 47757",
  location: "Chennai, India",
  profile_picture: "https://api.dicebear.com/7.x/initials/svg?seed=Ashif&backgroundColor=4f46e5", 
  cover_image: "https://images.unsplash.com/photo-1557683316-973673baf926",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const DEFAULT_SOCIAL_LINKS: SocialLink[] = [
  { id: 1, profile_id: 0, platform: "GitHub", url: "https://github.com", icon: "github" },
  { id: 2, profile_id: 0, platform: "LinkedIn", url: "https://linkedin.com", icon: "linkedin" }
];

export const DEFAULT_SKILLS: Skill[] = [
  { id: 1, profile_id: 0, name: "Python", category: "Backend", proficiency: 90, endorsement_count: 0 },
  { id: 2, profile_id: 0, name: "Next Js.", category: "Frontend", proficiency: 85, endorsement_count: 0 },
  { id: 3, profile_id: 0, name: "Express", category: "Backend", proficiency: 80, endorsement_count: 0 },
  { id: 4, profile_id: 0, name: "Sql Lite", category: "Database", proficiency: 75, endorsement_count: 0 },
  { id: 5, profile_id: 0, name: "Microsoft Dynamics 365", category: "General", proficiency: 85, endorsement_count: 0 },
  { id: 6, profile_id: 0, name: "Deluge (ZOHO)", category: "General", proficiency: 80, endorsement_count: 0 }
];

export const DEFAULT_EXPERIENCE: WorkExperience[] = [
  {
    id: 1,
    profile_id: 0,
    company: "Freelance Developer",
    role: "Dynamics Developer",
    description: "Developed and customized Microsoft Dynamics NAV modules to meet business and accounting requirements using C/AL and AL. Created and optimized NAV reports, pages, and codeunits, ensuring high performance and reliability in daily operations. Integrated Dynamics NAV with external applications and services using web services and APIs for seamless data exchange. Helped troubleshoot functional and basic technical issues in NAV, documenting fixes and guiding users on correct system usage.",
    start_date: "2024-12",
    end_date: "2025-08",
    is_current: false,
    logo: ""
  },
  {
    id: 2,
    profile_id: 0,
    company: "Rpinnacle Research and Solutions",
    role: "AI Engineer",
    description: "Deep Learning & AI: Built and optimized advanced models (CNNs, Keras) for complex classification, medical imaging diagnostics, and real-time DDoS attack detection. Computer Vision: Deployed YOLOv5 and OpenCV for high-precision object detection, video analysis, and image processing workflows. Signal Processing: Analyzed ECG and PPG signals using robust preprocessing and feature extraction to interpret complex physiological patterns. Software Development: Designed intuitive Python-based GUIs to bridge the gap between technical AI outputs and non-technical user interaction. Data Engineering: Implemented scalable preprocessing pipelines and distance-calculation algorithms to improve data quality and location-based accuracy.",
    start_date: "2024-03",
    end_date: "2024-11",
    is_current: false,
    logo: ""
  },
  {
    id: 3,
    profile_id: 0,
    company: "Cloud Lion",
    role: "App developer",
    description: "Developed and customized Zoho applications (Creator, CRM, Books) to automate complex business processes and enhance operational efficiency. Designed and implemented workflow triggers and functions to streamline task automation and reduce manual effort. Integrated Zoho apps seamlessly, ensuring optimized usability across platforms for users. Leveraged API integrations for secure and efficient data transfer between systems, enabling real-time updates. Worked in Zoho applications for diverse industries, including gym management, Shop Managemnt, Hospital, management and insurance operations, emphasizing scalability and reliability.",
    start_date: "2023-04",
    end_date: "2023-09",
    is_current: false,
    logo: ""
  }
];
