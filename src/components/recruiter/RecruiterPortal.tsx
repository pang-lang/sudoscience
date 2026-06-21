import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Candidate,
  PostedOpportunity,
  MentorChat
} from '../../types';
import {
  Briefcase, Search, BarChart3, Users, Sparkles, X, Lock, Unlock, ShieldAlert, Check, Send, UserCheck, Coffee, MessageSquare, FolderOpen
} from 'lucide-react';
import { db, UnifiedJob } from '../../utils/db';
import { supabase } from '../../lib/supabase';
import { createMentorChatInvite } from '../../utils/mentorChatHelpers';

import DashboardTab from './DashboardTab';
import DiscoveryTab from './DiscoveryTab';
import PipelineTab from './PipelineTab';
import OpportunitiesTab from './OpportunitiesTab';
import MentorChatTab from './MentorChatTab';

interface RecruiterPortalProps {
  onLogout: () => void;
}

export default function RecruiterPortal({ onLogout }: RecruiterPortalProps) {
  // ---- DATA ENGINE INITIALIZATION FROM UNIFIED DB ----

  // Candidates State
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  // Event Registrations State
  const [registrations, setRegistrations] = useState<any[]>([]);

  // Mentor Chat state with LocalStorage sync
  const [invites, setInvites] = useState<MentorChat[]>(() => {
    const saved = localStorage.getItem('we_connect_chat_invites');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [
      {
        id: 'chat_sarah_1',
        candidateId: 'c_sarah_j',
        managerName: 'Recruiter User',
        managerDept: 'Talent Acquisition',
        managerResearch: 'University Relations',
        status: 'accepted',
        matchScore: 92,
        messages: [
          { sender: 'employee', text: 'Hi Sarah! I noticed your excellent engagement in the EMC Academy Seminar.', timestamp: 'Yesterday, 14:20 PM' },
          { sender: 'user', text: 'Thanks! I really enjoyed learning about the MagI3C power module.', timestamp: 'Yesterday, 15:05 PM' }
        ]
      },
      {
        id: 'chat_omar_2',
        candidateId: 'c_omar_h',
        managerName: 'Recruiter User',
        managerDept: 'Hardware Engineering',
        managerResearch: 'Wireless Power',
        status: 'pending',
        matchScore: 88,
        messages: []
      }
    ];
  });

  // Manager Profile settings (now includes skills for coffee chat matching)
  const [managerProfile, setManagerProfile] = useState<{ name: string, dept: string, research: string, skills: string[] }>(() => {
    const saved = localStorage.getItem('we_connect_manager_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Backfill skills if missing from older localStorage
        if (!parsed.skills) parsed.skills = ['RFID', 'NFC', 'Embedded Systems', 'Low-Power Design'];
        return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return {
      name: 'Dr. Thomas Wey',
      dept: 'R&D Systems & EMC',
      research: 'Low-Power RFID Tag Sensors & Passive Wireless Power',
      skills: ['RFID', 'NFC', 'Embedded Systems', 'Low-Power Design', 'PCB Design']
    };
  });



  useEffect(() => {
    localStorage.setItem('we_connect_chat_invites', JSON.stringify(invites));
  }, [invites]);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'we_connect_chat_invites' && e.newValue) {
        try {
          setInvites(JSON.parse(e.newValue));
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    localStorage.setItem('we_connect_manager_profile', JSON.stringify(managerProfile));
  }, [managerProfile]);

  // Posted Job Postings
  const [postings, setPostings] = useState<PostedOpportunity[]>([]);

  // Global CV Modal State
  const [selectedCandidateForModal, setSelectedCandidateForModal] = useState<Candidate | null>(null);

  // Talent Discovery match threshold (for job-position fit, HR use)
  const [matchThreshold, setMatchThreshold] = useState<number>(() => {
    const saved = localStorage.getItem('we_connect_match_threshold');
    return saved ? parseInt(saved, 10) : 80;
  });

  const saveThreshold = (val: number) => {
    setMatchThreshold(val);
    localStorage.setItem('we_connect_match_threshold', val.toString());
  };

  useEffect(() => {
    async function loadData() {
      // 1. Fetch Candidates from Supabase
      try {
        const { data: candidatesData, error } = await supabase.from('candidates').select('*');
        if (error) throw error;
        if (candidatesData) {
          const mappedCandidates: Candidate[] = candidatesData.map((c: any) => ({
            id: c.id,
            name: c.name,
            university: c.university,
            skills: c.skills || [],
            score: c.score || c.engagementScore || 85,
            stage: c.stage || 'Talent Pool',
            avatarUrl: c.avatar_url || c.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
            saved: c.saved || false,
            projects: c.projects || [
              {
                title: 'Academic Capstone / Coursework',
                description: `Applied learning project focusing on ${c.skills && c.skills.length > 0 ? c.skills[0] : 'Engineering'}.`,
                tech: c.skills || [],
                components: c.skills?.some((s: string) => s.toLowerCase().includes('rf') || s.toLowerCase().includes('power') || s.toLowerCase().includes('hardware'))
                  ? ['MagI3C Power Module', 'REDCUBE Terminals']
                  : ['WE-KI Ceramic Inductors']
              }
            ]
          }));
          if (!mappedCandidates.some(c => c.id === 'c_sarah_j')) {
            mappedCandidates.push({
              id: 'c_sarah_j',
              name: 'Sarah Jenkins',
              university: 'TU Munich',
              skills: ['Embedded Systems', 'IoT Sensors', 'Wireless Power'],
              score: 92,
              stage: 'Recruiter Review',
              avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
              saved: true,
              projects: [{
                title: 'Smart Inventory Tracker',
                description: 'IoT sensor network for real-time inventory tracking.',
                tech: ['Embedded C', 'LoRaWAN'],
                components: ['WSEN Thermals', 'MagI3C Power Module']
              }]
            });
          }
          if (!mappedCandidates.some(c => c.id === 'c_omar_h')) {
            mappedCandidates.push({
              id: 'c_omar_h',
              name: 'Omar Hassan',
              university: 'RWTH Aachen',
              skills: ['RFID Systems', 'Antenna Design', 'RF Engineering'],
              score: 88,
              stage: 'Talent Pool',
              avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150',
              saved: false,
              projects: [{
                title: 'RFID Access System',
                description: 'Secure access control using RFID tags and custom antennas.',
                tech: ['Altium', 'C++'],
                components: ['WE-KI Ceramic Inductors', 'WE-RFI Ferrite Beads']
              }]
            });
          }
          setCandidates(mappedCandidates);
        }
      } catch (e) {
        console.error('Could not fetch candidates from Supabase:', e);
      }

      // 2. Fetch Postings, Applications, and Registrations from Supabase
      try {
        const { data: regsData, error: regsError } = await supabase.from('event_registrations').select('*');
        if (!regsError && regsData) {
          const augmentedRegs = [...regsData];
          if (!augmentedRegs.some(r => r.student_id === 'c_sarah_j' && r.event_id === 'e1')) {
            augmentedRegs.push({ student_id: 'c_sarah_j', event_id: 'e1' });
            augmentedRegs.push({ student_id: 'c_omar_h', event_id: 'e1' });
            augmentedRegs.push({ student_id: 'c_sarah_j', event_id: 'e2' });
            augmentedRegs.push({ student_id: 'c_omar_h', event_id: 'e3' });
          }
          setRegistrations(augmentedRegs);
        }

        const { data: jobsData, error: jobsErr } = await supabase.from('opportunities').select('*');
        const { data: appsData } = await supabase.from('opportunity_applications').select('*');
        const { data: candsData } = await supabase.from('candidates').select('*');
        
        if (jobsErr) throw jobsErr;
        if (jobsData) {
          const mappedJobs = jobsData.map((o: any) => {
            const existing = db.getJobs().find(old => old.id === o.id);
            let parsedSkills: string[] = [];
            if (o.skills) {
              parsedSkills = o.skills.split(',').map((s: string) => s.trim()).filter(Boolean);
            } else if (o.required_skills && o.required_skills.length > 0) {
              parsedSkills = o.required_skills;
            } else if (existing) {
              parsedSkills = existing.requiredSkills;
            } else {
              parsedSkills = ['Project Management'];
            }

            // Join applicant details
            const jobApps = appsData ? appsData.filter((a: any) => a.opportunity_id === o.id) : [];
            const applicantNames = jobApps.map((a: any) => {
              const cand = candsData ? candsData.find((c: any) => c.id === a.student_id) : null;
              if (cand) return cand.name;
              if (a.student_id === 'c_sarah_j' || a.student_id === '11111111-1111-1111-1111-111111111111') {
                return 'Sarah Jenkins';
              }
              return `Candidate #${a.student_id.slice(0, 4)}`;
            });

            return {
              id: o.id,
              title: o.title,
              company: o.company || 'Würth Elektronik',
              location: o.location || 'Munich, Germany',
              type: o.type,
              starts: o.starts || 'ASAP',
              deadline: o.deadline || 'Rolling',
              countdown: o.countdown || 'Apply Early',
              description: o.description || '',
              logoColor: o.logo_color || o.logoColor || 'from-red-600 to-slate-900',
              requiredSkills: parsedSkills,
              status: o.status || 'Active',
              applicantsCount: applicantNames.length,
              applicantNames
            };
          });
          db.saveJobs(mappedJobs);
        }
      } catch (e) {
        console.warn('Could not fetch opportunities from Supabase, using local db cache:', e);
      }
      setPostings(db.getRecruiterPostings());
    }
    loadData();
  }, []);

  // Window navigation
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'discovery' | 'mentorchat' | 'pipeline' | 'opportunities'>('dashboard');

  // Custom alert feedback
  const [toast, setToast] = useState<string | null>(null);

  // Trigger Toast helper
  const showToast = (txt: string) => {
    setToast(txt);
    setTimeout(() => setToast(null), 3000);
  };

  // Interceptor for setPostings to sync additions/deletions with DB
  const handleSetPostings: React.Dispatch<React.SetStateAction<PostedOpportunity[]>> = (value) => {
    setPostings(prev => {
      const next = typeof value === 'function' ? value(prev) : value;
      // Find additions
      next.forEach(p => {
        const exists = prev.some(old => old.id === p.id);
        if (!exists) {
          let skills = p.requiredSkills && p.requiredSkills.length > 0
            ? p.requiredSkills
            : ['Project Management'];
            
          if (!p.requiredSkills || p.requiredSkills.length === 0) {
            const lowerTitle = p.title.toLowerCase();
            if (lowerTitle.includes('power') || lowerTitle.includes('energy') || lowerTitle.includes('voltage') || lowerTitle.includes('choke') || lowerTitle.includes('inductor')) {
              skills = ['Power Electronics', 'Simulink', 'CAD', 'PCB Design'];
            } else if (lowerTitle.includes('rf') || lowerTitle.includes('shielding') || lowerTitle.includes('electromagnetic') || lowerTitle.includes('sensor') || lowerTitle.includes('iot') || lowerTitle.includes('radio')) {
              skills = ['Embedded C', 'PCB Design', 'RFID Systems', 'BLE', 'SolidWorks'];
            } else if (lowerTitle.includes('robot') || lowerTitle.includes('automation') || lowerTitle.includes('mechanical') || lowerTitle.includes('hardware')) {
              skills = ['SolidWorks Pro', 'FEA Modeling', 'CAD', 'C++'];
            } else if (lowerTitle.includes('data') || lowerTitle.includes('analyst') || lowerTitle.includes('learning') || lowerTitle.includes('python') || lowerTitle.includes('ml') || lowerTitle.includes('ai')) {
              skills = ['Python', 'TensorFlow', 'Data Analysis', 'Matlab'];
            } else if (lowerTitle.includes('software') || lowerTitle.includes('web') || lowerTitle.includes('app') || lowerTitle.includes('fullstack') || lowerTitle.includes('developer')) {
              skills = ['C++', 'Python', 'React Native', 'Embedded C', 'Data Analysis'];
            }
          }

          db.addOpportunity(p.title, p.type, p.deadline, skills, `Join us as a ${p.title}. Lead hardware layouts and systems integration research.`);
          
          // Sync to Supabase
          supabase.from('opportunities').insert({
            id: p.id,
            title: p.title,
            company: 'Würth Elektronik',
            location: 'Munich, Germany',
            type: p.type,
            deadline: p.deadline,
            skills: skills.join(', '),
            required_skills: skills,
            status: 'Active'
          }).then(() => {});
        }
      });

      // Find deletions
      prev.forEach(p => {
        const exists = next.some(n => n.id === p.id);
        if (!exists) {
          db.deleteOpportunity(p.id);
        }
      });

      return db.getRecruiterPostings();
    });
  };

  // Interceptor for setCandidates to sync edits with DB
  const handleSetCandidates: React.Dispatch<React.SetStateAction<Candidate[]>> = (value) => {
    setCandidates(prev => {
      const next = typeof value === 'function' ? value(prev) : value;
      return next;
    });
  };

  // Stage transition callback with Supabase update
  const transitionCandidateStage = async (id: string, dir: 'next' | 'prev') => {
    const stages: Array<Candidate['stage']> = ['Talent Pool', 'Saved', 'Recruiter Review', 'Interview Scheduled'];

    const candidate = candidates.find(c => c.id === id);
    if (!candidate) return;

    const curIdx = stages.indexOf(candidate.stage);
    let nextIdx = curIdx + (dir === 'next' ? 1 : -1);

    if (nextIdx >= 0 && nextIdx < stages.length) {
      const nextStage = stages[nextIdx];

      // Optimistic update
      setCandidates(prev => {
        const next = prev.map(c => c.id === id ? { ...c, stage: nextStage } : c);
        return next;
      });
      showToast(`Advanced ${candidate.name} to "${nextStage}"`);

      // Supabase persist with try-catch fallback
      try {
        const { error } = await supabase
          .from('candidates')
          .update({ stage: nextStage })
          .eq('id', id);

        if (error) {
          console.error('Error updating stage in Supabase:', error);
          showToast(`Failed to save stage for ${candidate.name}`);
          // Revert on error
          setCandidates(prev => {
            const next = prev.map(c => c.id === id ? { ...c, stage: candidate.stage } : c);
            return next;
          });
        }
      } catch (e) {
        console.warn('Exception while updating candidate stage in Supabase:', e);
        // We do NOT revert local state on connection exceptions so developer can test sandbox flows offline.
      }
    }
  };

  // --- MOCK CHAT INJECTION ---
  useEffect(() => {
    if (candidates.length > 0) {
      setInvites(prev => {
        // If there's already an active chat with messages, do nothing
        if (prev.some(inv => inv.messages && inv.messages.length > 0)) {
          return prev;
        }

        const mockCandidate = candidates.find(c => c.name.includes('Daniel Kim')) || candidates[0];
        if (!mockCandidate) return prev;

        const mockChat: MentorChat = {
          id: 'mc_mock_interaction_1',
          candidateId: mockCandidate.id,
          managerName: 'Würth Talent Desk',
          managerDept: 'HR',
          managerResearch: '',
          score: mockCandidate.score,
          status: 'accepted',
          studentSharedProfile: true,
          managerSharedProfile: true,
          timestamp: 'Today, 10:00 AM',
          messages: [
            { sender: 'employee', text: `Hi ${mockCandidate.name.split(' ')[0]}, I was really impressed by your background in PCB Design. Would you be open to a quick chat about our Graduate Program?`, timestamp: '10:00 AM' },
            { sender: 'student', text: 'Hi! Thank you for reaching out. Yes, I would definitely be interested. Your recent work on Low-Power Design is exactly what I want to specialize in.', timestamp: '10:15 AM' },
            { sender: 'employee', text: 'That is great to hear! Let me send you a link to schedule a 15-minute call for next week.', timestamp: '10:18 AM' }
          ]
        };

        // Don't duplicate if already added
        if (prev.some(p => p.id === mockChat.id)) return prev;
        return [mockChat, ...prev];
      });
    }
  }, [candidates]);

  // --- CANDIDATE MODAL HELPERS ---
  const handleSendInvite = (cand: Candidate) => {
    const existing = invites.find(inv => inv.candidateId === cand.id);
    if (existing) {
      showToast(`An invite is already ${existing.status === 'pending' ? 'pending' : existing.status} for this candidate.`);
      return;
    }

    const newInvite = createMentorChatInvite(cand.id, managerProfile, cand.score);
    setInvites(prev => [...prev, newInvite]);
    showToast(`Mentor Chat invite sent to ${cand.name.split(' ')[0]}!`);

    // Simulate acceptance for non-demo students after 5s
    if (cand.id !== 'c_sarah_j') {
      setTimeout(() => {
        setInvites(prev => prev.map(inv => {
          if (inv.id === newInvite.id) {
            showToast(`✅ ${cand.name.split(' ')[0]} accepted your mentor chat!`);
            setCandidates(cands =>
              cands.map(c => c.id === cand.id ? { ...c, stage: 'Interview Scheduled' as const } : c)
            );
            return { ...inv, status: 'accepted' as const, studentSharedProfile: true };
          }
          return inv;
        }));
      }, 5000);
    }
  };

  const activeInvite = selectedCandidateForModal
    ? invites.find(inv => inv.candidateId === selectedCandidateForModal.id)
    : null;

  const isAnonymized = false;
  const getMaskedName = (cand: Candidate) => {
    const initials = cand.name.split(' ').map(n => n[0]).join('');
    return `Candidate #${initials}${cand.score}`;
  };

  return (
    <div id="recruiter-portal-root" className="h-screen overflow-hidden bg-slate-50 flex font-sans text-slate-800">

      {/* Toast Overlay */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700"
          >
            <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-ping" />
            <span className="font-semibold">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- SIDEBAR NAVIGATION --- */}
      <aside className="w-64 bg-slate-950 text-slate-300 flex flex-col border-r border-slate-800 shrink-0">

        {/* Brand layout block */}
        <div className="p-6 border-b border-slate-900">
          <div className="flex items-center gap-2 mb-1 cursor-pointer font-display" onClick={onLogout}>
            <span className="bg-red-600 text-white px-2 py-0.5 rounded-xs font-black text-sm tracking-tighter">WE</span>
            <span className="font-bold text-lg text-white">Connect</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-semibold block">Recruitment Suite</span>
        </div>

        {/* User Profile display representation */}
        <div className="p-4 mx-4 my-3 bg-slate-900 rounded-xl flex items-center gap-3 border border-slate-800">
          <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 font-bold block flex items-center justify-center text-slate-100 font-display">
            HR
          </div>
          <div>
            <h4 className="text-white text-xs font-semibold leading-tight">Würth Talent Desk</h4>
            <p className="text-[9px] text-red-500 font-mono tracking-wider uppercase mt-0.5">Primary Recruiter</p>
          </div>
        </div>

        {/* Navigation Sidebar list */}
        <div className="flex-1 px-3 py-2 space-y-1">
          <button
            id="tab-recruiter-dashboard"
            onClick={() => setCurrentTab('dashboard')}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-medium flex items-center justify-between transition cursor-pointer ${currentTab === 'dashboard' ? 'bg-slate-800 text-white border-l-4 border-red-600' : 'hover:bg-slate-900 hover:text-white'
              }`}
          >
            <div className="flex items-center gap-3">
              <BarChart3 className="w-4 h-4" />
              <span>Dashboard Analytics</span>
            </div>
          </button>

          <button
            id="tab-recruiter-discovery"
            onClick={() => setCurrentTab('discovery')}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-medium flex items-center justify-between transition cursor-pointer ${currentTab === 'discovery' ? 'bg-slate-800 text-white border-l-4 border-red-600' : 'hover:bg-slate-900 hover:text-white'
              }`}
          >
            <div className="flex items-center gap-3">
              <Search className="w-4 h-4" />
              <span>Talent Discovery</span>
            </div>
          </button>

          <button
            id="tab-recruiter-pipeline"
            onClick={() => setCurrentTab('pipeline')}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-medium flex items-center justify-between transition cursor-pointer ${currentTab === 'pipeline' ? 'bg-slate-800 text-white border-l-4 border-red-600' : 'hover:bg-slate-900 hover:text-white'
              }`}
          >
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4" />
              <span>Engineering Pipeline</span>
            </div>
          </button>

          <button
            id="tab-recruiter-mentorchat"
            onClick={() => setCurrentTab('mentorchat')}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-medium flex items-center justify-between transition cursor-pointer ${currentTab === 'mentorchat' ? 'bg-slate-800 text-white border-l-4 border-red-600' : 'hover:bg-slate-900 hover:text-white'
              }`}
          >
            <div className="flex items-center gap-3">
              <Coffee className="w-4 h-4" />
              <span>Mentor Chats</span>
            </div>
          </button>

          <button
            id="tab-recruiter-opportunities"
            onClick={() => setCurrentTab('opportunities')}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-medium flex items-center justify-between transition cursor-pointer ${currentTab === 'opportunities' ? 'bg-slate-800 text-white border-l-4 border-red-600' : 'hover:bg-slate-900 hover:text-white'
              }`}
          >
            <div className="flex items-center gap-3">
              <Briefcase className="w-4 h-4" />
              <span>Opportunities</span>
            </div>
          </button>
        </div>

        {/* Swap role back to Student sandbox */}
        <div className="p-4 border-t border-slate-900 space-y-2">
          <button
            onClick={() => {
              showToast("Switched Sandbox to Student Portal");
              window.location.hash = "#student";
              window.location.reload();
            }}
            className="w-full py-1.5 bg-red-600 hover:bg-red-700 text-white font-medium text-[10px] rounded-lg tracking-wider font-mono flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 fill-white" />
            SWAP TO STUDENT
          </button>

          <button
            onClick={onLogout}
            className="w-full py-1.5 hover:bg-red-950 hover:text-red-400 text-slate-500 font-medium text-[10px] rounded-lg tracking-wider font-mono flex items-center justify-center gap-1 border border-transparent cursor-pointer"
          >
            LOG OUT SYSTEM
          </button>
        </div>
      </aside>

      {/* --- MAIN PAGE VIEW --- */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">

        {/* Recruitment top header and portal information desk */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shrink-0">
          <div>
            <h1 className="font-display font-semibold text-lg text-slate-900 tracking-tight">University Relations Office</h1>
            <p className="text-slate-500 text-xs mt-0.5">Monitoring global academic cohorts &bull; Field applications desk</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-semibold rounded-lg border border-emerald-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Recruiter Hub Online
            </span>
          </div>
        </header>

        {/* --- MAIN CONTENT REGIONS --- */}
        <div className="p-8 flex-1">
          {currentTab === 'dashboard' && (
            <DashboardTab
              candidates={candidates}
              invites={invites}
              registrations={registrations}
              onViewCandidate={(cand) => setSelectedCandidateForModal(cand)}
            />
          )}

          {currentTab === 'discovery' && (
            <DiscoveryTab
              candidates={candidates}
              setCandidates={handleSetCandidates}
              showToast={showToast}
              onViewCandidate={(cand) => setSelectedCandidateForModal(cand)}
            />
          )}

          {currentTab === 'pipeline' && (
            <PipelineTab
              candidates={candidates}
              transitionCandidateStage={transitionCandidateStage}
            />
          )}

          {currentTab === 'mentorchat' && (
            <MentorChatTab
              candidates={candidates}
              invites={invites}
              setInvites={setInvites}
              setCandidates={handleSetCandidates}
              managerProfile={managerProfile}
              showToast={showToast}
              onViewCandidate={(cand) => setSelectedCandidateForModal(cand)}
            />
          )}

          {currentTab === 'opportunities' && (
            <OpportunitiesTab
              postings={postings}
              setPostings={handleSetPostings}
              showToast={showToast}
            />
          )}
        </div>
      </main>

      {/* --- GLOBAL CANDIDATE PASSPORT MODAL --- */}
      <AnimatePresence>
        {selectedCandidateForModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden max-w-lg w-full shadow-2xl relative"
            >
              {/* Top Passport Style cover */}
              <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center border-b border-slate-800 font-mono">
                <span className="text-[10px] tracking-widest font-bold text-slate-400">EUROPEAN INDUSTRY PASSPORT</span>
                <button
                  onClick={() => setSelectedCandidateForModal(null)}
                  className="w-6 h-6 rounded-full bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Data protection banner */}
              {isAnonymized ? (
                <div className="bg-red-50 border-b border-red-100 text-red-800 px-6 py-2.5 flex items-center gap-2 text-[10px] font-semibold font-mono">
                  <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                  <span>Security Shield: Personal identifiers masked under GDPR. Match score must be &gt;= threshold to invite.</span>
                </div>
              ) : (
                <div className="bg-emerald-50 border-b border-emerald-100 text-emerald-800 px-6 py-2.5 flex items-center gap-2 text-[10px] font-semibold font-mono">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Profile Shared: Full candidate parameters authorized by student consent. Ready for internship sourcing.</span>
                </div>
              )}

              <div className="p-6 md:p-8 flex gap-6 items-start">
                {/* Photo */}
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-100 border-2 border-slate-200 flex items-center justify-center relative">
                    <img
                      className={`w-full h-full object-cover transition duration-300 ${isAnonymized ? 'filter blur-md grayscale blur-xs' : 'grayscale-0'
                        }`}
                      src={selectedCandidateForModal.avatarUrl}
                      alt="Candidate Portrait"
                      referrerPolicy="no-referrer"
                    />
                    {isAnonymized && (
                      <div className="absolute inset-0 bg-slate-900/10 flex items-center justify-center">
                        <Lock className="w-5 h-5 text-white/90" />
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-semibold block bg-slate-100 px-1.5 py-0.5 rounded">
                    {isAnonymized ? 'SECURE ID' : 'VERIFIED'}
                  </span>
                </div>

                {/* Data Table */}
                <div className="flex-1 space-y-3 font-mono text-xs overflow-hidden">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest block">Surname / First Name</span>
                    <span className="text-sm font-semibold text-slate-950 font-sans tracking-tight block mt-0.5 truncate">
                      {isAnonymized
                        ? getMaskedName(selectedCandidateForModal)
                        : `${selectedCandidateForModal.name.split(' ')[1]?.toUpperCase() || 'CANDIDATE'}, ${selectedCandidateForModal.name.split(' ')[0]}`
                      }
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest block">Educational entity</span>
                    <span className="text-slate-800 font-sans font-medium block mt-0.5 truncate">
                      {isAnonymized ? '[Top European Institution]' : selectedCandidateForModal.university}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest block">
                        {(selectedCandidateForModal as any).calculatedScore !== undefined && (selectedCandidateForModal as any).calculatedScore !== selectedCandidateForModal.score
                          ? 'JOB FIT SCORE'
                          : 'ENG SCORE'}
                      </span>
                      <span className="text-red-600 font-sans font-bold text-sm block mt-0.5">
                        {(selectedCandidateForModal as any).calculatedScore !== undefined 
                          ? (selectedCandidateForModal as any).calculatedScore 
                          : selectedCandidateForModal.score}/100
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest block">Status</span>
                      <span className="text-slate-800 font-sans font-bold uppercase block mt-0.5 text-xs truncate">
                        {selectedCandidateForModal.stage}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Competency tags list in popup */}
              <div className="p-6 bg-slate-100/50 border-t border-slate-100 max-h-[60vh] overflow-y-auto">
                <span className="text-[9px] text-slate-400 font-mono uppercase tracking-widest block font-semibold">Verified Capstones & Stamps</span>
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {selectedCandidateForModal.skills.map((s, idx) => {
                    const isMatched = (selectedCandidateForModal as any).matchedSkills?.some(
                      (ms: string) => ms.toLowerCase() === s.toLowerCase()
                    );
                    return (
                        <span 
                          key={idx} 
                          className={`inline-flex items-center whitespace-nowrap text-[10px] px-2 py-1 rounded-md font-semibold border ${
                            isMatched 
                              ? 'bg-emerald-600 border-emerald-600 text-white shadow shadow-emerald-500/10' 
                              : 'bg-white border-slate-200 text-slate-700'
                          }`}
                        >
                        {s}
                      </span>
                    );
                  })}
                </div>

                {/* Mentor Chat Invite */}
                <div className="mt-6 flex flex-col gap-3">
                  {!activeInvite ? (
                    <button
                      onClick={() => {
                        handleSendInvite(selectedCandidateForModal);
                        setSelectedCandidateForModal(null);
                      }}
                      className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-xl transition text-center cursor-pointer flex items-center justify-center gap-1.5 shadow shadow-red-500/20"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Invite to Mentor Chat
                    </button>
                  ) : activeInvite.status === 'pending' ? (
                    <button
                      disabled
                      className="w-full py-2.5 bg-slate-200 text-slate-500 font-semibold text-xs rounded-xl text-center cursor-not-allowed"
                    >
                      Invite Sent (Pending Student Response)
                    </button>
                  ) : activeInvite.status === 'accepted' ? (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-[11px] text-emerald-800 font-mono flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span>Connected — Open chat in Mentor Chats tab</span>
                    </div>
                  ) : (
                    <div className="bg-slate-100 p-3 rounded-xl text-center text-xs font-semibold text-slate-500">
                      Invite Declined by Student
                    </div>
                  )}
                </div>

                {/* Projects Section */}
                {selectedCandidateForModal.projects && selectedCandidateForModal.projects.length > 0 && (
                  <div className="mt-5 pt-4 border-t border-slate-200">
                    <span className="text-[9px] text-slate-400 font-mono uppercase tracking-widest block font-semibold flex items-center gap-1.5">
                      <FolderOpen className="w-3 h-3" />
                      Engineering Projects
                    </span>
                    <div className="space-y-3 mt-3">
                      {selectedCandidateForModal.projects.map((proj, idx) => (
                        <div key={idx} className="bg-white border border-slate-200 rounded-xl p-3">
                          <h5 className="text-xs font-bold text-slate-900 font-display">{proj.title}</h5>
                          <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{proj.description}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {proj.tech.map((t, ti) => (
                              <span key={ti} className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono font-medium">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* CV Actions Section */}
                <div className="mt-6 flex flex-col gap-3">
                  <button 
                    onClick={() => {
                      showToast(`Downloaded ${selectedCandidateForModal.name.replace(/\s+/g, '_')}_Resume.pdf`);
                    }}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition text-center cursor-pointer flex items-center justify-center gap-1.5 shadow"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    Download CV (PDF)
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
