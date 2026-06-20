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
  Award, Clock, Globe, MessageSquare, Ticket, Layout, Sparkles, Coffee
} from 'lucide-react';
import { db } from '../../utils/db';

import PassportTab from './PassportTab';
import PortfolioTab from './PortfolioTab';
import LearningTab from './LearningTab';
import CareersTab from './CareersTab';
import NetworkTab from './NetworkTab';
import TicketTab from './TicketTab';
import CoffeeChatTab from './CoffeeChatTab';

interface StudentPortalProps {
  onLogout: () => void;
}

export default function StudentPortal({ onLogout }: StudentPortalProps) {
  // ---- MOCK DATA INITIALIZATION ----
  
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
      name: 'Sarah Jenkins',
      institution: 'Munich University of Applied Sciences',
      degree: 'M.Sc. Mechanical Engineering',
      engagementScore: 85,
      status: 'Industry Ready',
      skills: ['SolidWorks', 'AutoCAD', 'Thermodynamics', 'Project Management', 'Data Analysis', 'PCB Design', 'RFID Tech'],
      certifications: [
        { name: 'Certified SolidWorks Associate', issuer: 'Dassault Systèmes', date: 'Jan 2023' },
        { name: 'Lean Six Sigma Yellow Belt', issuer: 'WE Academy', date: 'Nov 2022' }
      ],
      stamps: [
        { id: 'v1', name: "Tech Summit '23", date: 'Oct 2023', icon: '🚀' },
        { id: 'v2', name: 'Career Fair', date: 'Apr 24', icon: '💼' }
      ]
    };
  });

  useEffect(() => {
    localStorage.setItem('we_connect_student_profile', JSON.stringify(profile));
  }, [profile]);

  // Projects State
  const [projects, setProjects] = useState<Project[]>([
    {
      id: 'p1',
      title: 'Smart Inventory Tracker',
      description: 'An automated IoT inventory solution utilizing Würth RFID technology for sub-millimeter position precision and material optimization.',
      tech: ['Python', 'MQTT', 'React'],
      components: ['RFID Tags - W-102', 'WSEN-TIDS Sensor'],
      imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400',
      featured: true,
      codeUrl: 'https://github.com/example/smart-rfid',
      demoUrl: 'https://example.com/demo-rfid'
    },
    {
      id: 'p2',
      title: 'Automated Quality Control',
      description: 'Computer vision hardware inspection platform designed to inspect high-density PCB assemblies for physical defects prior to reflow.',
      tech: ['OpenCV', 'C++', 'TensorFlow'],
      components: ['Magi3C Power Module', 'WSEN-EVAL Board'],
      imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=400',
      featured: false,
      codeUrl: 'https://github.com/example/cv-qc',
      demoUrl: 'https://example.com/demo-qc'
    }
  ]);

  // Masterclasses synced with DB registrations
  const [events, setEvents] = useState<MasterclassEvent[]>(() => {
    const defaultEvents: MasterclassEvent[] = [
      {
        id: 'e1',
        title: 'Advanced Systems Architecture: Scaling for the Future',
        speaker: 'Dr. Lukas Miller',
        speakerTitle: 'WE Chief Architect',
        location: 'Innovation Hub, Berlin',
        date: 'Oct 15, 2024',
        time: '2:00 PM CEST',
        tag: 'Engineering',
        attendeesCount: 42,
        registered: false,
        waitlisted: false
      },
      {
        id: 'e2',
        title: 'Navigating Corporate Dynamics as a Junior Engineer',
        speaker: 'Evelyn Vance',
        speakerTitle: 'Vice President HR',
        location: 'Virtual Webinar',
        date: 'Oct 18, 2024',
        time: '4:00 PM CEST',
        tag: 'Leadership',
        attendeesCount: 156,
        registered: false,
        waitlisted: false
      },
      {
        id: 'e3',
        title: 'Design-First Power Optimizations with RedExpert Tools',
        speaker: 'Marcus Schmidt',
        speakerTitle: 'Principal FAE EMEA',
        location: 'Campus West, Lab 3',
        date: 'Nov 02, 2024',
        time: '10:00 AM CET',
        tag: 'Hardware',
        attendeesCount: 28,
        registered: false,
        waitlisted: false
      }
    ];

    const regs = db.getRegistrations();
    return defaultEvents.map(e => ({
      ...e,
      registered: regs.some(r => r.studentId === 'c_sarah_j' && r.eventId === e.id)
    }));
  });

  // Download Recordings / Docs
  const [materials] = useState<LearningMaterial[]>([
    { id: 'm1', fileName: 'Intro_to_RF_Design_CrashCourse.mp4', type: 'Video', durationOrSize: '1h 45m', uploadDate: 'Oct 10, 2024', views: 320, downloads: 145 },
    { id: 'm2', fileName: 'Q3_Electromagnetic_Interference_Deck.pdf', type: 'Slide', durationOrSize: '4.2 MB', uploadDate: 'Oct 08, 2024', views: 512, downloads: 289 },
    { id: 'm3', fileName: 'Industrial_Sensor_IoT_Boilerplate.zip', type: 'Code', durationOrSize: '12.0 MB', uploadDate: 'Oct 02, 2024', views: 189, downloads: 93 }
  ]);

  // Careers / Opportunities loaded from unified DB
  const [opportunities, setOpportunities] = useState<Opportunity[]>(() => {
    return db.getStudentOpportunities();
  });

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
          }
        }
      });
      // Return fresh database mapping to ensure fully synchronized counts & flags
      return db.getStudentOpportunities();
    });
  };

  // Interceptor for setEvents to write registration back to DB
  const handleSetEvents: React.Dispatch<React.SetStateAction<MasterclassEvent[]>> = (value) => {
    setEvents(prev => {
      const next = typeof value === 'function' ? value(prev) : value;
      next.forEach(evt => {
        const old = prev.find(e => e.id === evt.id);
        if (old && !old.registered && evt.registered) {
          db.registerForEvent('c_sarah_j', profile.name, evt.id, evt.title);
          
          // Re-load updated profile from localstorage since db.registerForEvent updates stamps
          const updatedProfile = localStorage.getItem('we_connect_student_profile');
          if (updatedProfile) {
            try {
              setProfile(JSON.parse(updatedProfile));
            } catch (e) {
              console.error(e);
            }
          }
        }
      });
      
      // Return registrations updated state
      const regs = db.getRegistrations();
      return prev.map(e => ({
        ...e,
        registered: regs.some(r => r.studentId === 'c_sarah_j' && r.eventId === e.id)
      }));
    });
  };

  // Network Stack / Tinder Swipe Cards
  const [networkQueue, setNetworkQueue] = useState<NetworkProfile[]>([
    {
      id: 'n1',
      name: 'Sarah Weber',
      age: 28,
      role: 'Senior Mechanical Design Engineer',
      university: 'Würth Elektronik GmbH',
      tags: ['Senior Engineer', 'EMC Specialist', 'WE Mentor'],
      skills: ['SolidWorks Pro', 'FEA Modeling', 'Thermal Dissipation', 'CAD Optimization'],
      description: 'Hi Sarah! I specialize in mechanical housing shielding for EMI-critical boards. Super excited to mentor students bridging physical dynamics and signal integrity.',
      imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300'
    },
    {
      id: 'n2',
      name: 'Elias K.',
      age: 32,
      role: 'Principal IoT Solutions Architect',
      university: 'Würth Elektronik Expert',
      tags: ['RFID Lead', 'Product Manager', 'Speaker'],
      skills: ['RFID Hardware', 'NFC Design', 'Embedded Systems', 'MQTT Protocol'],
      description: 'Specializing in passive tagging solutions and low-power sensory tags. Let me know if you need design assistance or components reviews for your RFID capstone projects!',
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300'
    },
    {
      id: 'n3',
      name: 'Julian Vance',
      age: 34,
      role: 'University Talents Acquisition Lead',
      university: 'Würth Elektronik HR',
      tags: ['Recruiter Specialist', 'Careers Lead', 'Industry Coach'],
      skills: ['Talent Sourcing', 'Interview Prep', 'Career Pathing'],
      description: 'Looking to identify the brightest minds for our European innovation clinics. Chat with me regarding internships, working students spots, or master thesis topics!',
      imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300'
    }
  ]);

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
    const saved = localStorage.getItem('we_connect_chat_invites');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('we_connect_connections', JSON.stringify(connections));
  }, [connections]);

  useEffect(() => {
    localStorage.setItem('we_connect_chat_invites', JSON.stringify(invites));
  }, [invites]);

  // ---- APP WINDOW STATE RENDERING ----
  const [currentTab, setCurrentTab] = useState<'passport' | 'portfolio' | 'learn' | 'opportunities' | 'network' | 'ticket' | 'coffee-chat'>('passport');
  
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
          <div className="flex items-center gap-2 mb-1 cursor-pointer" onClick={() => setCurrentTab('passport')}>
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
            {events.filter(e => e.registered).length > 0 && (
              <span className="w-2 h-2 rounded-full bg-red-400" />
            )}
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
            id="tab-coffee-chat"
            onClick={() => setCurrentTab('coffee-chat')}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-medium flex items-center justify-between transition cursor-pointer ${
              currentTab === 'coffee-chat' ? 'bg-red-600 text-white' : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Coffee className="w-4 h-4" />
              <span>Coffee Chat Desk</span>
            </div>
            {invites.filter(inv => inv.status === 'pending').length > 0 && (
              <span className="text-[10px] font-mono bg-black/25 px-1.5 py-0.5 rounded text-white">
                {invites.filter(inv => inv.status === 'pending').length}
              </span>
            )}
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
              setEvents={handleSetEvents}
              materials={materials}
              showToast={showToast}
              setCurrentTab={setCurrentTab}
            />
          )}

          {currentTab === 'opportunities' && (
            <CareersTab
              opportunities={opportunities}
              setOpportunities={handleSetOpportunities}
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

          {currentTab === 'coffee-chat' && (
            <CoffeeChatTab 
              invites={invites}
              setInvites={setInvites}
              connections={connections}
              setConnections={setConnections}
              showToast={showToast}
              setCurrentTab={setCurrentTab}
            />
          )}

          {currentTab === 'ticket' && (
            <TicketTab
              showToast={showToast}
            />
          )}
        </div>
      </main>

    </div>
  );
}
