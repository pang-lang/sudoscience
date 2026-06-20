// src/types.ts

export type UserRole = null | 'student' | 'recruiter' | 'educator';

export interface SkillBadge {
  name: string;
  level?: string;
}

export interface Certification {
  name: string;
  issuer: string;
  date: string;
}

export interface VisaStamp {
  id: string;
  name: string;
  date: string;
  icon: string;
}

export interface StudentProfile {
  name: string;
  institution: string;
  degree: string;
  engagementScore: number;
  status: 'Industry Ready' | 'In Training' | 'Super Star';
  skills: string[];
  certifications: Certification[];
  stamps: VisaStamp[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  tech: string[];
  components: string[];
  imageUrl: string;
  featured: boolean;
  codeUrl: string;
  demoUrl: string;
}

export interface MasterclassEvent {
  id: string;
  title: string;
  speaker: string;
  speakerTitle: string;
  location: string;
  date: string;
  time: string;
  tag: string;
  attendeesCount: number;
  registered: boolean;
  waitlisted: boolean;
}

export interface LearningMaterial {
  id: string;
  fileName: string;
  type: 'Video' | 'Slide' | 'Document' | 'Code';
  durationOrSize: string;
  uploadDate: string;
  views: number;
  downloads: number;
}

export interface Opportunity {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'Internship' | 'Hiwi' | 'Thesis' | 'Graduate Program';
  starts: string;
  deadline: string;
  countdown: string;
  description: string;
  saved: boolean;
  applied: boolean;
  logoColor: string;
}

export interface NetworkProfile {
  id: string;
  name: string;
  age: number;
  role: string;
  university?: string;
  tags: string[];
  skills: string[];
  description: string;
  imageUrl: string;
  /** Why this employee was matched to the student */
  matchReason?: string;
  /** The project name this employee's expertise aligns with */
  interestedInProject?: string;
  /** Computed match score (0–100) based on project alignment */
  projectMatchScore?: number;
}

export interface ConnectionChat {
  id: string;
  name: string;
  role: string;
  imageUrl: string;
  online: boolean;
  lastMessage: string;
  messages: Array<{
    sender: 'user' | 'other';
    text: string;
    timestamp: string;
  }>;
}

// Recruiter definitions
export interface Candidate {
  id: string;
  name: string;
  university: string;
  skills: string[];
  score: number;
  stage: 'Talent Pool' | 'Saved' | 'Recruiter Review' | 'Interview Scheduled';
  avatarUrl: string;
  saved?: boolean;
}

export interface PostedOpportunity {
  id: string;
  title: string;
  type: string;
  deadline: string;
  applicantsCount: number;
  status: 'Active' | 'Draft' | 'Closed';
}

// Educator definitions
export interface StudentPerformance {
  id: string;
  name: string;
  course: string;
  attendance: number;
  resourcesAccessed: number;
  questionsAsked: number;
  flagged: boolean;
}

export interface CapstoneProject {
  id: string;
  title: string;
  category: string;
  description: string;
  teamCount: number;
  sharedWithWE: boolean;
}

export interface CoffeeChatInvite {
  id: string;
  candidateId: string;
  managerName: string;
  managerDept: string;
  managerResearch: string;
  score: number;
  status: 'pending' | 'accepted' | 'rejected';
  studentSharedProfile: boolean;
  managerSharedProfile: boolean;
  timestamp: string;
}

