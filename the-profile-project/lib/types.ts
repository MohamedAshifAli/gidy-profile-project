// ============================
// Type Definitions
// ============================

export interface Profile {
  id: number;
  name: string;
  title: string;
  bio: string;
  email: string;
  phone: string;
  location: string;
  profile_picture: string;
  cover_image: string;
  created_at: string;
  updated_at: string;
}

export interface SocialLink {
  id: number;
  profile_id: number;
  platform: string;
  url: string;
  icon: string;
}

export interface Skill {
  id: number;
  profile_id: number;
  name: string;
  category: string;
  proficiency: number; // 1-100
  endorsement_count: number;
}

export interface Endorsement {
  id: number;
  skill_id: number;
  endorser_name: string;
  endorser_avatar: string;
  created_at: string;
}

export interface WorkExperience {
  id: number;
  profile_id: number;
  company: string;
  role: string;
  description: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  logo: string;
}

export interface ProfileData {
  profile: Profile;
  socialLinks: SocialLink[];
  skills: Skill[];
  workExperience: WorkExperience[];
}

// API Request/Response types
export interface UpdateProfileRequest {
  name?: string;
  title?: string;
  bio?: string;
  email?: string;
  phone?: string;
  location?: string;
  profile_picture?: string;
  cover_image?: string;
}

export interface AddSkillRequest {
  name: string;
  category: string;
  proficiency: number;
}

export interface AddSocialLinkRequest {
  platform: string;
  url: string;
  icon: string;
}

export interface EndorseSkillRequest {
  skill_id: number;
  endorser_name: string;
  endorser_avatar?: string;
}

export interface AddWorkExperienceRequest {
  company: string;
  role: string;
  description: string;
  start_date: string;
  end_date?: string | null;
  is_current: boolean;
  logo?: string;
}
