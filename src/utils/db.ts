// src/utils/db.ts
import { Candidate, Opportunity, PostedOpportunity, StudentProfile, VisaStamp, NetworkProfile } from '../types';
import { Project } from '../types';

// ─── WE Employee Profiles ────────────────────────────────────────────────────

export interface WEEmployee {
  id: string;
  name: string;
  age: number;
  role: string;
  dept: string;
  tags: string[];
  /** Skills and technology keywords this employee specialises in */
  skills: string[];
  /** Broader expertise topics (for matching against project descriptions) */
  expertiseKeywords: string[];
  description: string;
  imageUrl: string;
}


export interface UnifiedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string; // 'Internship' | 'Hiwi' | 'Thesis' | 'Graduate Program'
  starts: string;
  deadline: string;
  countdown: string;
  description: string;
  logoColor: string;
  requiredSkills: string[];
  status: 'Active' | 'Draft' | 'Closed';
  applicantsCount: number;
  applicantNames?: string[];
}

export interface EventRegistration {
  studentId: string;
  studentName: string;
  eventId: string;
  eventTitle: string;
  registeredAt: string;
}

const DEFAULT_JOBS: UnifiedJob[] = [
  {
    id: 'job-1',
    title: 'Power Management Field Graduate',
    company: 'Würth Elektronik',
    location: 'Künzelsau, Germany (Hybrid)',
    type: 'Graduate Program',
    starts: 'Jan 2025',
    deadline: 'Dec 01, 2024',
    countdown: 'Deadline Dec 01',
    description: 'Elite corporate graduate rotation program spanning system engineering, converter topology design, and EMC validation testing. Receive direct mentorship from R&D directors.',
    logoColor: 'from-fuchsia-600 to-purple-800',
    requiredSkills: ['Power Electronics', 'Simulink', 'CAD', 'PCB Design', 'Project Management'],
    status: 'Active',
    applicantsCount: 24
  },
  {
    id: 'job-2',
    title: 'IoT Electromagnetic Shielding Intern',
    company: 'Würth Elektronik',
    location: 'Munich, Germany (Hybrid)',
    type: 'Internship',
    starts: 'Oct 2024',
    deadline: 'Oct 15, 2024',
    countdown: 'Deadline in 3 days',
    description: 'Join the wireless testing cell. Develop experimental set-ups validating shielding effectiveness on RFID telemetry grids and high-frequency active power chokes.',
    logoColor: 'from-orange-500 to-rose-600',
    requiredSkills: ['Embedded C', 'PCB Design', 'RFID Systems', 'BLE', 'SolidWorks'],
    status: 'Active',
    applicantsCount: 14
  },
  {
    id: 'job-3',
    title: 'Passive Sensors Lab Assistant',
    company: 'Institute of Autonomous Systems',
    location: 'Campus North, Lab 4B',
    type: 'Hiwi',
    starts: 'ASAP',
    deadline: 'Nov 12, 2024',
    countdown: 'Deadline in 1 month',
    description: 'Assist in real-time sensor array data evaluation. Develop robust Python models to parse multi-channel accelerometer signals and predict joints failure modes.',
    logoColor: 'from-blue-600 to-indigo-600 font-mono',
    requiredSkills: ['Python', 'TensorFlow', 'Data Analysis', 'IoT Telemetry', 'Matlab'],
    status: 'Active',
    applicantsCount: 8
  },
  {
    id: 'job-4',
    title: 'High-Frequency Inductor Performance Thesis',
    company: 'Würth Elektronik (Academic Collaboration)',
    location: 'Munich, Germany',
    type: 'Thesis',
    starts: 'Nov 2024',
    deadline: 'Rolling Admission',
    countdown: 'Apply Early',
    description: 'Validate thermal dissipation limits and efficiency parameters on secondary-side rectifiers. Jointly supervised by Faculty and Lead Electromagnetic Engineers at WE.',
    logoColor: 'from-emerald-500 to-teal-600',
    requiredSkills: ['SolidWorks Pro', 'FEA Modeling', 'Thermodynamics', 'Matlab', 'Data Analysis'],
    status: 'Active',
    applicantsCount: 3
  }
];



// Helper to get from localstorage with fallback
function getFromStorage<T>(key: string, fallback: T): T {
  const data = localStorage.getItem(key);
  if (!data) return fallback;
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error(`Error parsing key ${key} from storage:`, e);
    return fallback;
  }
}

function setToStorage<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// Unified state manager
export const db = {
  // --- OPPORTUNITIES / JOBS ---
  getJobs(): UnifiedJob[] {
    return getFromStorage<UnifiedJob[]>('we_connect_db_jobs', DEFAULT_JOBS);
  },

  saveJobs(jobs: UnifiedJob[]): void {
    setToStorage('we_connect_db_jobs', jobs);
  },

  getStudentOpportunities(): Opportunity[] {
    const jobs = this.getJobs().filter(j => j.status === 'Active');
    const appliedIds = getFromStorage<string[]>('we_connect_student_applied_ids', ['job-1']); // default mock application
    const savedIds = getFromStorage<string[]>('we_connect_student_saved_ids', ['job-2']); // default mock save
    
    return jobs.map(j => ({
      id: j.id,
      title: j.title,
      company: j.company,
      location: j.location,
      type: j.type as any,
      starts: j.starts,
      deadline: j.deadline,
      countdown: j.countdown,
      description: j.description,
      saved: savedIds.includes(j.id),
      applied: appliedIds.includes(j.id),
      logoColor: j.logoColor
    }));
  },

  toggleSaveOpportunity(jobId: string): boolean {
    const savedIds = getFromStorage<string[]>('we_connect_student_saved_ids', ['job-2']);
    let isSaved = false;
    let nextSaved: string[];
    if (savedIds.includes(jobId)) {
      nextSaved = savedIds.filter(id => id !== jobId);
      isSaved = false;
    } else {
      nextSaved = [...savedIds, jobId];
      isSaved = true;
    }
    setToStorage('we_connect_student_saved_ids', nextSaved);
    return isSaved;
  },

  applyToOpportunity(jobId: string): void {
    const appliedIds = getFromStorage<string[]>('we_connect_student_applied_ids', ['job-1']);
    if (!appliedIds.includes(jobId)) {
      setToStorage('we_connect_student_applied_ids', [...appliedIds, jobId]);
      
      // Update applicant count on jobs
      const jobs = this.getJobs();
      const updated = jobs.map(j => {
        if (j.id === jobId) {
          return { ...j, applicantsCount: j.applicantsCount + 1 };
        }
        return j;
      });
      this.saveJobs(updated);
    }
  },

  getRecruiterPostings(): PostedOpportunity[] {
    const jobs = this.getJobs();
    return jobs.map(j => ({
      id: j.id,
      title: j.title,
      type: j.type,
      deadline: j.deadline,
      applicantsCount: j.applicantsCount,
      status: j.status,
      requiredSkills: j.requiredSkills,
      applicantNames: j.applicantNames || []
    }));
  },

  addOpportunity(title: string, type: string, deadline: string, requiredSkills: string[], description: string): UnifiedJob {
    const jobs = this.getJobs();
    const newJob: UnifiedJob = {
      id: `job_${Date.now()}`,
      title,
      company: 'Würth Elektronik',
      location: 'Künzelsau, Germany (Hybrid)',
      type,
      starts: 'ASAP',
      deadline: deadline || 'Rolling Admission',
      countdown: 'Apply Early',
      description: description || `Join us as a ${title}. Work with hardware teams on scaling technologies.`,
      logoColor: 'from-red-600 to-slate-900',
      requiredSkills,
      status: 'Active',
      applicantsCount: 0
    };
    this.saveJobs([newJob, ...jobs]);
    return newJob;
  },

  deleteOpportunity(id: string): void {
    const jobs = this.getJobs();
    const updated = jobs.filter(j => j.id !== id);
    this.saveJobs(updated);
  },

  // --- CANDIDATES / STUDENTS ---

  // --- EVENT REGISTRATIONS ---
  // --- MATCHING ALGORITHM ---
  calculateMatchScore(student: Candidate, job: UnifiedJob): { score: number; matchedSkills: string[]; totalRequired: number } {
    const studentSkills = student.skills.map(s => s.toLowerCase().trim());
    const jobSkills = (job.requiredSkills || []).map(s => s.toLowerCase().trim());
    
    if (jobSkills.length === 0) {
      return { score: student.score, matchedSkills: [], totalRequired: 0 };
    }

    // Match exact or contains
    const matchingSkills = jobSkills.filter(js => 
      studentSkills.some(s => js.includes(s) || s.includes(js))
    );

    const skillMatchFraction = jobSkills.length > 0 ? (matchingSkills.length / jobSkills.length) : 0;
    
    // Matching Score = 0.6 * (Skill Match * 100) + 0.4 * Engagement Score
    const weightedScore = (skillMatchFraction * 100 * 0.6) + (student.score * 0.4);
    
    return {
      score: Math.min(Math.round(weightedScore), 100),
      matchedSkills: matchingSkills.map(s => s.charAt(0).toUpperCase() + s.slice(1)),
      totalRequired: jobSkills.length
    };
  },

};

