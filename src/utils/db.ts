// src/utils/db.ts
import { Candidate, Opportunity, PostedOpportunity, StudentProfile, VisaStamp } from '../types';

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

const DEFAULT_CANDIDATES: Candidate[] = [
  { id: 'c_sarah_j', name: 'Sarah Jenkins', university: 'Munich University of Applied Sciences', skills: ['SolidWorks', 'AutoCAD', 'Thermodynamics', 'Project Management', 'Data Analysis', 'PCB Design', 'RFID Tech'], score: 85, stage: 'Talent Pool', avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300' },
  { id: 'c1', name: 'Lukas Bauer', university: 'Technische Universität München', skills: ['Embedded C', 'PCB Design', 'RFID Systems', 'BLE'], score: 94, stage: 'Talent Pool', avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=300' },
  { id: 'c2', name: 'Sarah Miller', university: 'RWTH Aachen', skills: ['Power Electronics', 'Simulink', 'CAD', 'PCB Design'], score: 88, stage: 'Talent Pool', avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=300' },
  { id: 'c3', name: 'David Schmidt', university: 'KIT Karlsruhe', skills: ['Python', 'TensorFlow', 'IoT Telemetry', 'Data Analysis'], score: 98, stage: 'Saved', avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=300', saved: true },
  { id: 'c4', name: 'Elena Rostova', university: 'Freie Universität Berlin', skills: ['SolidWorks Pro', 'FEA Modeling', 'Thermodynamics', 'Project Management'], score: 91, stage: 'Recruiter Review', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300' },
  { id: 'c5', name: 'Marcus Vance', university: 'Hochschule München', skills: ['React Native', 'BLE', 'WSEN Sensors', 'Embedded C'], score: 85, stage: 'Recruiter Review', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300' },
  { id: 'c6', name: 'Anna Müller', university: 'Technische Universität Stuttgart', skills: ['Signal Integrity', 'C++', 'Matlab', 'Data Analysis'], score: 72, stage: 'Interview Scheduled', avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300' }
];

const DEFAULT_REGISTRATIONS: EventRegistration[] = [
  { studentId: 'c1', studentName: 'Lukas Bauer', eventId: 'e1', eventTitle: 'Advanced Systems Architecture: Scaling for the Future', registeredAt: 'Oct 12, 2024' },
  { studentId: 'c2', studentName: 'Sarah Miller', eventId: 'e3', eventTitle: 'Design-First Power Optimizations with RedExpert Tools', registeredAt: 'Oct 14, 2024' },
  { studentId: 'c3', studentName: 'David Schmidt', eventId: 'e1', eventTitle: 'Advanced Systems Architecture: Scaling for the Future', registeredAt: 'Oct 11, 2024' },
  { studentId: 'c3', studentName: 'David Schmidt', eventId: 'e3', eventTitle: 'Design-First Power Optimizations with RedExpert Tools', registeredAt: 'Oct 13, 2024' },
  { studentId: 'c4', studentName: 'Elena Rostova', eventId: 'e2', eventTitle: 'Navigating Corporate Dynamics as a Junior Engineer', registeredAt: 'Oct 14, 2024' },
  { studentId: 'c5', studentName: 'Marcus Vance', eventId: 'e2', eventTitle: 'Navigating Corporate Dynamics as a Junior Engineer', registeredAt: 'Oct 14, 2024' }
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
      status: j.status
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
  getCandidates(): Candidate[] {
    // We synchronize the Sarah Jenkins profile with the active recruiter candidates state
    const candidates = getFromStorage<Candidate[]>('we_connect_candidates', DEFAULT_CANDIDATES);
    const studentProfile = localStorage.getItem('we_connect_student_profile');
    
    if (studentProfile) {
      try {
        const profile: StudentProfile = JSON.parse(studentProfile);
        return candidates.map(c => {
          if (c.id === 'c_sarah_j') {
            return {
              ...c,
              name: profile.name,
              university: profile.institution,
              skills: profile.skills,
              score: profile.engagementScore
            };
          }
          return c;
        });
      } catch (e) {
        console.error(e);
      }
    }
    return candidates;
  },

  saveCandidates(candidates: Candidate[]): void {
    setToStorage('we_connect_candidates', candidates);
  },

  // --- EVENT REGISTRATIONS ---
  getRegistrations(): EventRegistration[] {
    return getFromStorage<EventRegistration[]>('we_connect_db_registrations', DEFAULT_REGISTRATIONS);
  },

  registerForEvent(studentId: string, studentName: string, eventId: string, eventTitle: string): void {
    const registrations = this.getRegistrations();
    
    // Check if already registered
    const alreadyRegistered = registrations.some(r => r.studentId === studentId && r.eventId === eventId);
    if (alreadyRegistered) return;

    const newReg: EventRegistration = {
      studentId,
      studentName,
      eventId,
      eventTitle,
      registeredAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    };

    setToStorage('we_connect_db_registrations', [...registrations, newReg]);

    // If it is Sarah Jenkins, sync to the student profile stamps
    if (studentId === 'c_sarah_j') {
      const studentProfile = localStorage.getItem('we_connect_student_profile');
      if (studentProfile) {
        try {
          const profile: StudentProfile = JSON.parse(studentProfile);
          
          // Check if stamp exists
          const stampExists = profile.stamps.some(s => s.id === eventId);
          if (!stampExists) {
            const newStamp: VisaStamp = {
              id: eventId,
              name: eventTitle.split(':')[0], // short name
              date: new Date().toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
              icon: '🎓'
            };
            const updatedProfile: StudentProfile = {
              ...profile,
              stamps: [...profile.stamps, newStamp],
              // Increase engagement score for registering!
              engagementScore: Math.min(profile.engagementScore + 5, 100)
            };
            localStorage.setItem('we_connect_student_profile', JSON.stringify(updatedProfile));
          }
        } catch (e) {
          console.error(e);
        }
      }
    } else {
      // For mock students, we can also add stamps and increase scores
      const candidates = this.getCandidates();
      const updated = candidates.map(c => {
        if (c.id === studentId) {
          return {
            ...c,
            score: Math.min(c.score + 5, 100)
          };
        }
        return c;
      });
      this.saveCandidates(updated);
    }
  },

  // --- MATCHING ALGORITHM ---
  calculateMatchScore(student: Candidate, job: UnifiedJob): number {
    const studentSkills = student.skills.map(s => s.toLowerCase().trim());
    const jobSkills = (job.requiredSkills || []).map(s => s.toLowerCase().trim());
    
    if (jobSkills.length === 0) {
      return student.score; // Fallback to candidate's general score
    }

    // Match exact or contains
    const matchingSkills = studentSkills.filter(s => 
      jobSkills.some(js => js.includes(s) || s.includes(js))
    );

    const skillMatchPercentage = (matchingSkills.length / jobSkills.length) * 100;
    
    // Weighted match: 60% skills, 40% candidate general engagement score
    const weightedScore = (skillMatchPercentage * 0.6) + (student.score * 0.4);
    
    return Math.min(Math.round(weightedScore), 100);
  }
};
