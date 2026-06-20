import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  StudentProfile,
  Project,
  MasterclassEvent,
  LearningMaterial,
  Opportunity,
  NetworkProfile,
  ConnectionChat,
  VisaStamp,
  CoffeeChatInvite
} from '../../types';
import {
  Award, Clock, Globe, MessageSquare, Ticket, Layout, Sparkles, Coffee,
  GraduationCap
} from 'lucide-react';
import { db } from '../../utils/db';

import PassportTab from './PassportTab';
import PortfolioTab from './PortfolioTab';
import LearningTab from './LearningTab';
import CareersTab from './CareersTab';
import NetworkTab from './NetworkTab';
import TicketTab from './TicketTab';
import { supabase } from '../../lib/supabase';
import CoffeeChatTab from './CoffeeChatTab';
import PublicPortal from '../public/PublicPortal';

interface StudentPortalProps {
  onLogout: () => void;
}

export default function StudentPortal({ onLogout }: StudentPortalProps) {
  // ---- DATA STATE INITIALIZATION ----

  // Profile State with LocalStorage sync
  const [profile, setProfile] = useState<StudentProfile>(() => {
    const saved = localStorage.getItem('we_connect_student_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return {
      name: '',
      institution: '',
      degree: '',
      engagementScore: 0,
      status: 'In Training',
      skills: [],
      certifications: [],
      stamps: []
    };
  });

  useEffect(() => {
    localStorage.setItem('we_connect_student_profile', JSON.stringify(profile));
  }, [profile]);

  // Projects State
  const [projects, setProjects] = useState<Project[]>([]);

  // Masterclasses synced with DB registrations
  const [events, setEvents] = useState<MasterclassEvent[]>([]);

  // Download Recordings / Docs
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);

  // Careers / Opportunities
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);

  // Supabase Data Fetcher & Local DB Sync
  useEffect(() => {
    async function loadData() {
      // 1. Load Student Profile
      const { data: profileData } = await supabase.from('student_profiles').select('*').limit(1);
      if (profileData && profileData.length > 0) {
        const p = profileData[0];
        setProfile(prev => ({
          ...prev,
          name: p.name || prev.name,
          institution: p.institution || prev.institution,
          degree: p.degree || prev.degree,
          engagementScore: p.engagement_score ?? prev.engagementScore,
          status: p.status || prev.status,
          skills: p.skills || prev.skills,
        }));
      }

      // 2. Load Projects
      const { data: projData } = await supabase.from('projects').select('*');
      if (projData) {
        setProjects(projData.map((p: any) => ({
          ...p,
          imageUrl: p.image_url,
          codeUrl: p.code_url,
          demoUrl: p.demo_url
        })));
      }

      // 3. Load Events
      const { data: evtData } = await supabase.from('masterclass_events').select('*');
      if (evtData) {
        const { data: regsData } = await supabase.from('event_registrations').select('*').eq('student_id', 'c_sarah_j');
        const regs = regsData || [];
        setEvents(evtData.map((e: any) => ({
          ...e,
          registered: regs.some((r: any) => r.event_id === e.id)
        })));
      }

      // 3. Load Opportunities
      try {
        const { data: oppData, error } = await supabase.from('opportunities').select('*');
        if (error) throw error;
        if (oppData) {
          const mappedJobs = oppData.map((o: any) => {
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
              applicantsCount: o.applicants_count || o.applicantsCount || 0
            };
          });
          db.saveJobs(mappedJobs);
          setOpportunities(db.getStudentOpportunities());
        }
      } catch (e) {
        console.warn('Could not fetch opportunities from Supabase, using local db cache:', e);
      }

      // 4. Load Learning Materials
      const { data: matData } = await supabase.from('learning_materials').select('*');
      if (matData) {
        setMaterials(matData.map((m: any) => ({
          ...m,
          fileName: m.file_name,
          durationOrSize: m.duration_or_size,
          uploadDate: m.upload_date
        })));
      }

      // 5. Load Network Profiles
      const { data: netData } = await supabase.from('network_profiles').select('*');
      if (netData) {
        setNetworkQueue(netData.map((n: any) => ({
          ...n,
          imageUrl: n.image_url
        })));
      }
    }
    loadData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Interceptor for setOpportunities to sync with DB
  const handleSetOpportunities: React.Dispatch<React.SetStateAction<Opportunity[]>> = (value) => {
    setOpportunities(prev => {
      const next = typeof value === 'function' ? value(prev) : value;
      next.forEach(opp => {
        const old = prev.find(o => o.id === opp.id);
        if (old) {
          if (old.saved !== opp.saved) {
            db.toggleSaveOpportunity(opp.id);
          }
          if (old.applied !== opp.applied && opp.applied) {
            db.applyToOpportunity(opp.id);
            supabase.auth.getSession().then(({ data: { session } }) => {
              const studentId = session?.user?.id || '11111111-1111-1111-1111-111111111111';
              supabase.from('opportunity_applications').insert({
                student_id: studentId,
                opportunity_id: opp.id,
                status: 'applied'
              }).then(({ error }) => {
                if (error) {
                  console.error('Error inserting application to Supabase:', error.message);
                } else {
                  console.log('Synced application successfully to Supabase');
                }
              });
            });
          }
        }
      });
      // Return fresh database mapping to ensure fully synchronized counts & flags
      return db.getStudentOpportunities();
    });
  };

  // Network Stack / Tinder Swipe Cards
  const [networkQueue, setNetworkQueue] = useState<NetworkProfile[]>([]);

  // Active Chats State with LocalStorage sync
  const [connections, setConnections] = useState<ConnectionChat[]>(() => {
    const saved = localStorage.getItem('we_connect_connections');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [
      {
        id: 'c1',
        name: 'Sarah Weber',
        role: 'Senior Mechanical @ WE',
        imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
        online: true,
        lastMessage: 'Let\'s schedule a technical review session on Thursday!',
        messages: [
          { sender: 'other', text: 'Hey Sarah! Loved your Smart Inventory Tracker layout.', timestamp: '10:30 AM' },
          { sender: 'user', text: 'Thank you Sarah! I used the WSEN thermals and it worked beautifully.', timestamp: '10:32 AM' },
          { sender: 'other', text: 'Let\'s schedule a technical review session on Thursday!', timestamp: '10:33 AM' }
        ]
      },
      {
        id: 'c2',
        name: 'Marcus Chen',
        role: 'Hardware Intern @ WE',
        imageUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200',
        online: false,
        lastMessage: 'Good luck on your systems exam!',
        messages: [
          { sender: 'other', text: 'Are you attending the Scalability masterclass tomorrow?', timestamp: 'Yesterday' },
          { sender: 'user', text: 'Yes, looking forward to it. Got my boarding pass ready.', timestamp: 'Yesterday' },
          { sender: 'other', text: 'Good luck on your systems exam!', timestamp: 'Yesterday' }
        ]
      }
    ];
  });

  // Coffee Chat Invites State with LocalStorage sync
  const [invites, setInvites] = useState<CoffeeChatInvite[]>(() => {
    const defaultInvites: CoffeeChatInvite[] = [
      {
        id: 'mock_invite_1',
        candidateId: 'c_sarah_j',
        managerName: 'Dr. Emily Chen',
        managerDept: 'R&D Advanced Materials',
        managerResearch: 'Investigating thermal dissipation in high-density PCBs.',
        score: 92,
        status: 'pending',
        studentSharedProfile: false,
        managerSharedProfile: true,
        timestamp: 'Today, 09:41 AM'
      }
    ];
    const saved = localStorage.getItem('we_connect_chat_invites');
    if (saved) {
      try {
        let parsed = JSON.parse(saved);
        if (!parsed.some((i: any) => i.id === 'mock_invite_1')) {
          parsed = [...defaultInvites, ...parsed];
        }
        return parsed;
      } catch (e) {
        console.error(e);
      }
    }
    return defaultInvites;
  });

  useEffect(() => {
    localStorage.setItem('we_connect_connections', JSON.stringify(connections));
  }, [connections]);

  useEffect(() => {
    localStorage.setItem('we_connect_chat_invites', JSON.stringify(invites));
  }, [invites]);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'we_connect_chat_invites' && e.newValue) {
        try {
          setInvites(JSON.parse(e.newValue));
        } catch { }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // ---- APP WINDOW STATE RENDERING ----
  const [currentTab, setCurrentTab] = useState<'passport' | 'portfolio' | 'learn' | 'opportunities' | 'network' | 'ticket' | 'open-hub'>('passport');

  // Custom Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Trigger Toast helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div id="student-portal-root" className="h-screen overflow-hidden bg-slate-50 flex font-sans select-none text-slate-800">

      {/* Toast Notification HUD */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs px-5 py-3 rounded-xl shadow-xl flex items-center gap-2.5 border border-slate-700"
          >
            <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span className="font-medium">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- SIDEBAR NAVIGATION --- */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 shrink-0">
        {/* WE Brand branding */}
        <div className="p-6 border-b border-slate-900">
          <div className="flex items-center gap-2 mb-1 cursor-pointer" onClick={onLogout}>
            <span className="bg-red-600 text-white px-2 py-0.5 rounded-xs font-black text-sm tracking-tighter">WE</span>
            <span className="font-display font-bold text-lg text-white">Connect</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500 tracking-wider font-medium uppercase">Student Passport Stream</span>
        </div>

        {/* User Mini profile summary in sidebar */}
        <div className="p-4 mx-4 my-3 bg-slate-900 rounded-xl flex items-center gap-3 border border-slate-800">
          <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 font-bold block flex items-center justify-center text-slate-100 font-display">
            SJ
          </div>
          <div className="overflow-hidden">
            <h4 className="text-white text-xs font-semibold truncate">Sarah Jenkins</h4>
            <p className="text-[10px] text-red-500 font-mono tracking-wider uppercase mt-0.5">WE-STUDENT-85</p>
          </div>
        </div>

        {/* Navigation items */}
        <div className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          <button
            id="tab-passport"
            onClick={() => setCurrentTab('passport')}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-medium flex items-center justify-between transition cursor-pointer ${currentTab === 'passport' ? 'bg-slate-800 text-white border-l-4 border-red-600' : 'hover:bg-slate-900 hover:text-white'
              }`}
          >
            <div className="flex items-center gap-3">
              <Award className="w-4 h-4" />
              <span>Industry Passport</span>
            </div>
          </button>

          <button
            id="tab-portfolio"
            onClick={() => setCurrentTab('portfolio')}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-medium flex items-center justify-between transition cursor-pointer ${currentTab === 'portfolio' ? 'bg-slate-800 text-white border-l-4 border-red-600' : 'hover:bg-slate-900 hover:text-white'
              }`}
          >
            <div className="flex items-center gap-3">
              <Layout className="w-4 h-4" />
              <span>Engineering Portfolio</span>
            </div>
          </button>

          <button
            id="tab-learn"
            onClick={() => setCurrentTab('learn')}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-medium flex items-center justify-between transition cursor-pointer ${currentTab === 'learn' ? 'bg-slate-800 text-white border-l-4 border-red-600' : 'hover:bg-slate-900 hover:text-white'
              }`}
          >
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4" />
              <span>Learning Center</span>
            </div>
          </button>

          <button
            id="tab-opportunities"
            onClick={() => setCurrentTab('opportunities')}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-medium flex items-center justify-between transition cursor-pointer ${currentTab === 'opportunities' ? 'bg-slate-800 text-white border-l-4 border-red-600' : 'hover:bg-slate-900 hover:text-white'
              }`}
          >
            <div className="flex items-center gap-3">
              <Globe className="w-4 h-4" />
              <span>Explore Careers</span>
            </div>
          </button>


          <button
            id="tab-network"
            onClick={() => setCurrentTab('network')}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-medium flex items-center justify-between transition cursor-pointer ${currentTab === 'network' ? 'bg-slate-800 text-white border-l-4 border-red-600' : 'hover:bg-slate-900 hover:text-white'
              }`}
          >
            <div className="flex items-center gap-3">
              <MessageSquare className="w-4 h-4" />
              <span>Industry Network</span>
            </div>
          </button>

          <button
            id="tab-ticket"
            onClick={() => setCurrentTab('ticket')}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-medium flex items-center justify-between transition cursor-pointer ${currentTab === 'ticket' ? 'bg-slate-800 text-white border-l-4 border-red-600' : 'hover:bg-slate-900 hover:text-white'
              }`}
          >
            <div className="flex items-center gap-3">
              <Ticket className="w-4 h-4" />
              <span>Boarding Pass</span>
            </div>
            <span className="text-[9px] font-mono bg-slate-800 text-red-400 px-1.5 py-0.5 rounded uppercase tracking-wider">Valid</span>
          </button>

          <button
            id="tab-open-hub"
            onClick={() => setCurrentTab('open-hub')}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-medium flex items-center justify-between transition cursor-pointer ${currentTab === 'open-hub' ? 'bg-slate-800 text-white border-l-4 border-indigo-500' : 'hover:bg-slate-900 hover:text-white'
              }`}
          >
            <div className="flex items-center gap-3">
              <GraduationCap className="w-4 h-4 text-indigo-400" />
              <span>Academic Reference</span>
            </div>
            <span className="text-[9px] font-mono bg-indigo-900 text-indigo-300 px-1.5 py-0.5 rounded uppercase tracking-wider font-semibold">Ref</span>
          </button>
        </div>

        {/* Global actions at bottom */}
        <div className="p-4 border-t border-slate-900 space-y-2">
          <button
            onClick={() => {
              showToast("Switched Sandbox to Recruiter");
              window.location.hash = "#recruiter";
              window.location.reload();
            }}
            className="w-full py-1.5 bg-red-600 hover:bg-red-700 text-white font-medium text-[10px] rounded-lg tracking-wider font-mono flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 fill-white" />
            SWAP TO RECRUITER
          </button>

          <button
            onClick={onLogout}
            className="w-full py-1.5 hover:bg-red-950 hover:text-red-400 text-slate-500 font-medium text-[10px] rounded-lg tracking-wider font-mono flex items-center justify-center gap-1 border border-transparent cursor-pointer"
          >
            LOG OUT SYSTEM
          </button>
        </div>
      </aside>

      {/* --- MAIN PAGE CONTENT --- */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">

        {/* Corporate Top-Status Hub */}
        <header id="student-header" className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shrink-0">
          <div>
            <h1 className="font-display font-semibold text-lg text-slate-900 tracking-tight">Sarah's Learning Portal</h1>
            <p className="text-slate-500 text-xs mt-0.5">Academic engagement monitoring desk &middot; Sector EMEA</p>
          </div>
          <div className="flex items-center gap-6">
            {/* Engagement tracker badge */}
            <div className="flex items-center gap-3 bg-red-50 px-4 py-2 rounded-xl border border-red-100">
              <div className="text-right">
                <span className="text-[9px] text-slate-500 font-mono uppercase tracking-wider font-semibold">Engagement Score</span>
                <p className="text-base font-display font-bold text-red-600 mt-0.2">{profile.engagementScore}/100</p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-red-600 text-white font-mono flex items-center justify-center font-bold text-sm">
                {profile.engagementScore}
              </div>
            </div>

            {/* Quick status badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-sky-50 border border-sky-200 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
              <span className="text-xs font-semibold text-sky-700">{profile.status}</span>
            </div>
          </div>
        </header>

        {/* --- PORTLET WINDOW LAYOUTS --- */}
        <div className="p-8 flex-1">
          {currentTab === 'passport' && (
            <PassportTab
              profile={profile}
              setProfile={setProfile}
              showToast={showToast}
              setCurrentTab={setCurrentTab}
            />
          )}

          {currentTab === 'portfolio' && (
            <PortfolioTab
              projects={projects}
              setProjects={setProjects}
              showToast={showToast}
            />
          )}

          {currentTab === 'learn' && (
            <LearningTab
              events={events}
              setEvents={setEvents}
              materials={materials}
              showToast={showToast}
              setCurrentTab={setCurrentTab}
            />
          )}

          {currentTab === 'opportunities' && (
            <CareersTab
              opportunities={opportunities}
              setOpportunities={setOpportunities}
              showToast={showToast}
            />
          )}

          {currentTab === 'network' && (
            <NetworkTab
              networkQueue={networkQueue}
              setNetworkQueue={setNetworkQueue}
              connections={connections}
              setConnections={setConnections}
              showToast={showToast}
              invites={invites}
              setInvites={setInvites}
            />
          )}


          {currentTab === 'ticket' && (
            <TicketTab
              showToast={showToast}
            />
          )}

          {currentTab === 'open-hub' && (
            <PublicPortal embedded={true} isEducator={false} />
          )}
        </div>
      </main>

    </div>
  );
}
