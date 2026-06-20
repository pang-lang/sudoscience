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

const WE_EMPLOYEES: WEEmployee[] = [
  {
    id: 'emp_1',
    name: 'Elias Kaufmann',
    age: 32,
    role: 'Principal IoT Solutions Architect',
    dept: 'Würth Elektronik – RFID & Wireless',
    tags: ['RFID Lead', 'Product Manager', 'Speaker'],
    skills: ['RFID Hardware', 'NFC Design', 'Embedded Systems', 'MQTT Protocol', 'Low-Power Design'],
    expertiseKeywords: ['rfid', 'nfc', 'iot', 'inventory', 'wireless', 'asset tracking', 'embedded', 'mqtt', 'passive tag'],
    description: 'Specialising in passive tagging solutions and low-power sensory tags. I actively look for students experimenting with RFID capstone projects — happy to do a component review or architecture session.',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'emp_2',
    name: 'Sarah Weber',
    age: 28,
    role: 'Senior Mechanical Design Engineer',
    dept: 'Würth Elektronik – Hardware R&D',
    tags: ['Senior Engineer', 'EMC Specialist', 'WE Mentor'],
    skills: ['SolidWorks Pro', 'FEA Modeling', 'Thermal Dissipation', 'CAD Optimization', 'PCB Layout'],
    expertiseKeywords: ['solidworks', 'cad', 'thermal', 'pcb', 'mechanical', 'fea', 'shield', 'emc', 'housing', 'heat'],
    description: 'I specialise in mechanical housing shielding for EMI-critical boards. Super excited to mentor students bridging physical dynamics and signal integrity — especially those using WE components in real designs.',
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'emp_3',
    name: 'Julian Vance',
    age: 34,
    role: 'University Talent Acquisition Lead',
    dept: 'Würth Elektronik – HR & Talent',
    tags: ['Recruiter', 'Careers Lead', 'Industry Coach'],
    skills: ['Talent Sourcing', 'Interview Prep', 'Career Pathing', 'Graduate Programs'],
    expertiseKeywords: ['internship', 'thesis', 'graduate', 'career', 'hiring', 'hiwi', 'project management', 'leadership'],
    description: 'Looking to identify the brightest minds for our European innovation clinics. Chat with me about internships, working student spots, or master thesis topics — I can open doors across the WE network.',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'emp_4',
    name: 'Dr. Petra Schulz',
    age: 41,
    role: 'Head of Quality Inspection Systems',
    dept: 'Würth Elektronik – Manufacturing',
    tags: ['Quality Lead', 'Computer Vision', 'Automation'],
    skills: ['OpenCV', 'TensorFlow', 'C++', 'Machine Learning', 'Optical Inspection'],
    expertiseKeywords: ['quality', 'inspection', 'computer vision', 'opencv', 'pcb', 'defect', 'machine learning', 'automation', 'tensorflow', 'reflow'],
    description: 'My team builds automated optical inspection rigs for high-density PCB assemblies. If you are working on computer vision or ML-based quality projects, I would love to see your approach.',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'emp_5',
    name: 'Marcus Stein',
    age: 29,
    role: 'Embedded Systems Engineer',
    dept: 'Würth Elektronik – Sensor Applications',
    tags: ['WSEN Expert', 'Firmware Dev', 'BLE Specialist'],
    skills: ['WSEN Sensors', 'Embedded C', 'BLE 5.0', 'FreeRTOS', 'ARM Cortex'],
    expertiseKeywords: ['sensor', 'wsen', 'embedded', 'ble', 'bluetooth', 'firmware', 'accelerometer', 'gyroscope', 'freertos', 'arm', 'microcontroller'],
    description: 'Deep expertise in the full WSEN sensor family and BLE sensor nodes. If you are using WE sensors in a project I would love to help optimise your firmware stack and power profile.',
    imageUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'emp_6',
    name: 'Nina Hoffmann',
    age: 31,
    role: 'Power Electronics Application Engineer',
    dept: 'Würth Elektronik – Power Components',
    tags: ['Power FAE', 'Inductor Design', 'EMC Testing'],
    skills: ['Power Electronics', 'Simulink', 'RedExpert', 'Inductor Sizing', 'DC-DC Converters'],
    expertiseKeywords: ['power', 'inductor', 'dc-dc', 'converter', 'simulink', 'emc', 'redexpert', 'efficiency', 'switching', 'magnetics'],
    description: 'I help engineers select and validate the right inductors and power components. If your project involves switching regulators or power conversion, let me run a quick review on your BOM.',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'
  },
  {
    id: 'emp_7',
    name: 'Thomas Becker',
    age: 37,
    role: 'Data Science & Analytics Lead',
    dept: 'Würth Elektronik – Digital Transformation',
    tags: ['Data Lead', 'ML Practitioner', 'Python Expert'],
    skills: ['Python', 'TensorFlow', 'Pandas', 'Data Analysis', 'IoT Telemetry', 'Predictive Maintenance'],
    expertiseKeywords: ['python', 'data', 'analytics', 'machine learning', 'iot', 'sensor data', 'telemetry', 'predictive', 'tensorflow', 'pandas', 'signal'],
    description: 'I bridge hardware sensor data and actionable intelligence. Looking for students who work on IoT data pipelines, predictive maintenance, or ML inference on embedded hardware.',
    imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=300'
  }
];

/**
 * Scores a WE employee against the student's projects and skills.
 * Returns a score (0-100) and a human-readable match reason.
 */
function calculateEmployeeProjectMatch(
  employee: WEEmployee,
  projects: Project[],
  studentSkills: string[]
): { score: number; matchReason: string; interestedInProject: string } {
  const empKeywords = employee.expertiseKeywords.map(k => k.toLowerCase());
  const empSkills = employee.skills.map(s => s.toLowerCase());

  let bestProjectScore = 0;
  let bestProjectName = '';
  let bestMatchedTerms: string[] = [];

  for (const project of projects) {
    const projectTokens = [
      ...project.tech.map(t => t.toLowerCase()),
      ...project.components.map(c => c.toLowerCase()),
      ...project.title.toLowerCase().split(/\s+/),
      ...project.description.toLowerCase().split(/\s+/)
    ];

    const matched = empKeywords.filter(kw =>
      projectTokens.some(token => token.includes(kw) || kw.includes(token))
    );
    const skillMatched = empSkills.filter(sk =>
      projectTokens.some(token => token.includes(sk) || sk.includes(token))
    );
    const allMatched = [...new Set([...matched, ...skillMatched])];

    const raw = (allMatched.length / Math.max(empKeywords.length, 1)) * 100;
    if (raw > bestProjectScore) {
      bestProjectScore = raw;
      bestProjectName = project.title;
      bestMatchedTerms = allMatched;
    }
  }

  // Also check student skills directly
  const studentSkillTokens = studentSkills.map(s => s.toLowerCase());
  const skillOverlap = empKeywords.filter(kw =>
    studentSkillTokens.some(sk => sk.includes(kw) || kw.includes(sk))
  );
  const skillBonus = (skillOverlap.length / Math.max(empKeywords.length, 1)) * 40;

  const finalScore = Math.min(Math.round(bestProjectScore * 0.7 + skillBonus), 100);

  let matchReason = '';
  if (bestMatchedTerms.length > 0) {
    const topTerms = bestMatchedTerms.slice(0, 2).map(t =>
      t.charAt(0).toUpperCase() + t.slice(1)
    );
    matchReason = `${employee.name.split(' ')[0]}'s expertise in ${topTerms.join(' & ')} aligns with your ${bestProjectName || 'projects'}.`;
  } else {
    matchReason = `${employee.name.split(' ')[0]}'s background complements your skill profile.`;
  }

  return {
    score: Math.max(finalScore, 30), // minimum 30 so everyone is somewhat relevant
    matchReason,
    interestedInProject: bestProjectName || 'your portfolio'
  };
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

const DEFAULT_CANDIDATES: Candidate[] = [
  { id: 'c_sarah_j', name: 'Sarah Jenkins', university: 'Munich University of Applied Sciences', skills: ['SolidWorks', 'AutoCAD', 'Thermodynamics', 'Project Management', 'Data Analysis', 'PCB Design', 'RFID Tech'], score: 85, stage: 'Talent Pool', avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300', projects: [
    { title: 'Smart Inventory Tracker', description: 'IoT inventory system using Würth RFID tags with real-time dashboard.', tech: ['Python', 'MQTT', 'React', 'RFID'] },
    { title: 'Thermal Shield Optimizer', description: 'FEA-based thermal shield design for high-power PCB assemblies.', tech: ['SolidWorks', 'ANSYS', 'CAD'] }
  ] },
  { id: 'c1', name: 'Lukas Bauer', university: 'Technische Universität München', skills: ['Embedded C', 'PCB Design', 'RFID Systems', 'BLE'], score: 94, stage: 'Talent Pool', avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=300', projects: [
    { title: 'BLE Sensor Mesh Network', description: 'Low-power mesh network for environmental monitoring using WE sensors.', tech: ['Embedded C', 'BLE 5.0', 'FreeRTOS', 'WSEN'] },
    { title: 'RFID Access Control System', description: 'Campus access system with passive RFID tags and web dashboard.', tech: ['RFID', 'Node.js', 'React'] }
  ] },
  { id: 'c2', name: 'Sarah Miller', university: 'RWTH Aachen', skills: ['Power Electronics', 'Simulink', 'CAD', 'PCB Design'], score: 88, stage: 'Talent Pool', avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=300', projects: [
    { title: 'DC-DC Converter Design', description: 'High-efficiency buck converter with Würth inductors, validated in Simulink.', tech: ['Simulink', 'RedExpert', 'KiCAD'] }
  ] },
  { id: 'c3', name: 'David Schmidt', university: 'KIT Karlsruhe', skills: ['Python', 'TensorFlow', 'IoT Telemetry', 'Data Analysis'], score: 98, stage: 'Saved', avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=300', saved: true, projects: [
    { title: 'Predictive Maintenance Pipeline', description: 'ML model for predictive maintenance using IoT sensor telemetry.', tech: ['Python', 'TensorFlow', 'Pandas', 'MQTT'] },
    { title: 'Signal Quality Classifier', description: 'Deep learning classifier for PCB signal integrity analysis.', tech: ['PyTorch', 'OpenCV', 'NumPy'] }
  ] },
  { id: 'c4', name: 'Elena Rostova', university: 'Freie Universität Berlin', skills: ['SolidWorks Pro', 'FEA Modeling', 'Thermodynamics', 'Project Management'], score: 91, stage: 'Recruiter Review', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300', projects: [
    { title: 'Vibration Dampening Housing', description: 'Custom enclosure design to reduce vibration impact on sensitive PCBs.', tech: ['SolidWorks', 'FEA', 'ANSYS'] }
  ] },
  { id: 'c5', name: 'Marcus Vance', university: 'Hochschule München', skills: ['React Native', 'BLE', 'WSEN Sensors', 'Embedded C'], score: 85, stage: 'Recruiter Review', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300', projects: [
    { title: 'Sensor Dashboard App', description: 'Cross-platform mobile app for real-time WSEN sensor data visualization.', tech: ['React Native', 'BLE', 'Chart.js'] }
  ] },
  { id: 'c6', name: 'Anna Müller', university: 'Technische Universität Stuttgart', skills: ['Signal Integrity', 'C++', 'Matlab', 'Data Analysis'], score: 72, stage: 'Interview Scheduled', avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300', projects: [
    { title: 'EMC Simulation Suite', description: 'Matlab-based tool for simulating electromagnetic compatibility of PCB layouts.', tech: ['Matlab', 'C++', 'Simulink'] }
  ] }
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

  // --- COFFEE CHAT / NETWORK MATCHING ---

  /**
   * Returns a ranked list of WE employee NetworkProfiles for the swipe queue,
   * sorted by how well each employee matches the student's projects and skills.
   */
  getInterestedEmployees(projects: Project[], studentSkills: string[]): NetworkProfile[] {
    return WE_EMPLOYEES
      .map(emp => {
        const { score, matchReason, interestedInProject } = calculateEmployeeProjectMatch(
          emp, projects, studentSkills
        );
        return {
          id: emp.id,
          name: emp.name,
          age: emp.age,
          role: emp.role,
          university: emp.dept,
          tags: emp.tags,
          skills: emp.skills,
          description: emp.description,
          imageUrl: emp.imageUrl,
          matchReason,
          interestedInProject,
          projectMatchScore: score
        } as NetworkProfile;
      })
      .sort((a, b) => (b.projectMatchScore ?? 0) - (a.projectMatchScore ?? 0));
  }
};

