import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  UserRole, 
  StudentProfile, 
  Project, 
  MasterclassEvent, 
  LearningMaterial, 
  Opportunity, 
  NetworkProfile,
  ConnectionChat,
  VisaStamp
} from '../types';
import { 
  Award, CheckCircle2, ChevronRight, Code, Download, ExternalLink, Globe, 
  MapPin, Plus, Search, Heart, X, MessageSquare, Ticket, FileText, Video,
  Clock, Check, UserPlus, Inbox, RotateCcw, AlertCircle, Share2, PanelRightOpen,
  Layout, Sparkles
} from 'lucide-react';

interface StudentPortalProps {
  onLogout: () => void;
}

export default function StudentPortal({ onLogout }: StudentPortalProps) {
  // ---- MOCK DATA INITIALIZATION ----
  
  // Profile State
  const [profile, setProfile] = useState<StudentProfile>({
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
  });

  // Stamp List available to add
  const availableStamps: VisaStamp[] = [
    { id: 'v3', name: 'EMC Academy Seminar', date: 'Jun 2025', icon: '📡' },
    { id: 'v4', name: 'Wireless Power Lab', date: 'Aug 2025', icon: '🔋' },
    { id: 'v5', name: 'RFID Hackathon Challenge', date: 'Sep 2025', icon: '🏷️' },
    { id: 'v6', name: 'Eco-Design Capstone', date: 'Dec 2025', icon: '🌱' }
  ];

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

  // Masterclasses
  const [events, setEvents] = useState<MasterclassEvent[]>([
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
      registered: true,
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
  ]);

  // Download Recordings / Docs
  const [materials] = useState<LearningMaterial[]>([
    { id: 'm1', fileName: 'Intro_to_RF_Design_CrashCourse.mp4', type: 'Video', durationOrSize: '1h 45m', uploadDate: 'Oct 10, 2024', views: 320, downloads: 145 },
    { id: 'm2', fileName: 'Q3_Electromagnetic_Interference_Deck.pdf', type: 'Slide', durationOrSize: '4.2 MB', uploadDate: 'Oct 08, 2024', views: 512, downloads: 289 },
    { id: 'm3', fileName: 'Industrial_Sensor_IoT_Boilerplate.zip', type: 'Code', durationOrSize: '12.0 MB', uploadDate: 'Oct 02, 2024', views: 189, downloads: 93 }
  ]);

  // Careers / Opportunities
  const [opportunities, setOpportunities] = useState<Opportunity[]>([
    {
      id: 'o1',
      title: 'Advanced Robotics Engineering Intern',
      company: 'TechNova Industrial Systems',
      location: 'Munich, Germany (Hybrid)',
      type: 'Internship',
      starts: 'Oct 2024',
      deadline: 'Oct 12, 2024',
      countdown: 'Deadline in 3 days',
      description: 'Join the robotics development cell. We design high-speed automated component positioning units utilizing custom RFID telemetry grids. Experience in C++ and basic electromechanical assembly is required.',
      saved: true,
      applied: false,
      logoColor: 'from-orange-500 to-rose-600'
    },
    {
      id: 'o2',
      title: 'Machine Learning Research Assistant',
      company: 'Institute of Autonomous Systems',
      location: 'Campus North, Lab 4B',
      type: 'Hiwi',
      starts: 'ASAP',
      deadline: 'Nov 15, 2024',
      countdown: 'Deadline in 1 month',
      description: 'Assist in real-time sensor array data evaluation. Develop robust Python models to parse multi-channel accelerometer signals and predict joint failures in automated pneumatic arms.',
      saved: false,
      applied: false,
      logoColor: 'from-blue-600 to-indigo-600 font-mono'
    },
    {
      id: 'o3',
      title: 'Sustainable Grid Optimization Thesis',
      company: 'EcoPower Gmbh (Academic Collaboration)',
      location: 'Berlin (Remote Possible)',
      type: 'Thesis',
      starts: 'Nov 2024',
      deadline: 'Rolling Admission',
      countdown: 'Apply Early',
      description: 'Validate efficiency parameters on secondary-side rectifiers and power chokes in medium-voltage microgrids. Thesis will be supervised jointly by Faculty and the lead power engineer at WE.',
      saved: false,
      applied: false,
      logoColor: 'from-emerald-500 to-teal-600'
    },
    {
      id: 'o4',
      title: 'Future Leaders Engineering Trainee',
      company: 'Global Dynamics Corp',
      location: 'Multiple Locations (Global)',
      type: 'Graduate Program',
      starts: 'Jan 2025',
      deadline: 'Dec 01, 2024',
      countdown: 'Deadline Dec 01',
      description: 'Elite 24-month rotation program spanning system engineering, operations, and technical business strategy. Includes a 6-month international rotation and direct mentorship from executive board.',
      saved: false,
      applied: true,
      logoColor: 'from-fuchsia-600 to-purple-800'
    }
  ]);

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

  // Active Chats State
  const [connections, setConnections] = useState<ConnectionChat[]>([
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
  ]);

  // ---- APP WINDOW STATE RENDERING ----
  const [currentTab, setCurrentTab] = useState<'passport' | 'portfolio' | 'learn' | 'opportunities' | 'network' | 'ticket'>('passport');
  
  // Custom Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Modals / Interactive UI state
  const [showAddProject, setShowAddProject] = useState(false);
  const [showAddStamp, setShowAddStamp] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [typedMessage, setTypedMessage] = useState('');
  
  // Form State for new projects
  const [newProjTitle, setNewProjTitle] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newProjTech, setNewProjTech] = useState('');
  const [newProjComp, setNewProjComp] = useState('');

  // Opportunities State Filters
  const [selectedJobFilter, setSelectedJobFilter] = useState<'All' | 'Internship' | 'Hiwi' | 'Thesis' | 'Graduate Program'>('All');
  const [jobSearchQuery, setJobSearchQuery] = useState('');

  // Learning filters
  const [materialsTypeFilter, setMaterialsTypeFilter] = useState<'All' | 'Video' | 'Slide' | 'Code'>('All');

  // Trigger Toast helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Chat message send handler
  const sendChatMessage = () => {
    if (!typedMessage.trim() || !activeChatId) return;
    
    // Add User Message
    setConnections(prev => prev.map(chat => {
      if (chat.id === activeChatId) {
        const updatedMsgs = [
          ...chat.messages,
          { sender: 'user', text: typedMessage, timestamp: 'Just now' }
        ];
        return {
          ...chat,
          lastMessage: typedMessage,
          messages: updatedMsgs
        };
      }
      return chat;
    }));

    const curTyped = typedMessage;
    setTypedMessage('');

    // Trigger instant cute simulated reply after 1 sec
    setTimeout(() => {
      setConnections(prev => prev.map(chat => {
        if (chat.id === activeChatId) {
          const replies = [
            "That sounds brilliant! Send me over your latest schematic layout to review.",
            "Absolutely! Let's arrange a Teams call to discuss the internship requirements.",
            "Yes, Würth Elektronik is hosting a student kit distribution next Tuesday. You should secure a spot!",
            "Fascinating insights. Let me talk to the R&D supervisor in Munich.",
            "Great initiative! That component fits perfectly into active design regulations."
          ];
          const randomReply = replies[Math.floor(Math.random() * replies.length)];
          return {
            ...chat,
            lastMessage: randomReply,
            messages: [
              ...chat.messages,
              { sender: 'other', text: randomReply, timestamp: 'Just now' }
            ]
          };
        }
        return chat;
      }));
    }, 1200);
  };

  return (
    <div id="student-portal-root" className="min-h-screen bg-slate-50 flex font-sans select-none text-slate-800">
      
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
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-2 mb-1 cursor-pointer" onClick={() => setCurrentTab('passport')}>
            <span className="bg-red-600 text-white px-2 py-0.5 rounded-xs font-black text-sm tracking-tighter">WE</span>
            <span className="font-display font-bold text-lg text-white">Connect</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500 tracking-wider font-medium uppercase">Student Passport Stream</span>
        </div>

        {/* User Mini profile summary in sidebar */}
        <div className="p-4 mx-4 my-3 bg-slate-800/50 rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-600/15 border border-red-500/30 flex items-center justify-center font-bold text-red-500">
            SJ
          </div>
          <div className="overflow-hidden">
            <h4 className="text-white text-xs font-semibold truncate">Sarah Jenkins</h4>
            <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
              Ref: <span className="bg-slate-700/50 px-1 py-0.2 rounded text-[9px]">WE-STUDENT-85</span>
            </p>
          </div>
        </div>

        {/* Navigation items */}
        <div className="flex-1 px-3 py-2 space-y-1">
          <button 
            id="tab-passport"
            onClick={() => setCurrentTab('passport')}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-medium flex items-center justify-between transition cursor-pointer ${
              currentTab === 'passport' ? 'bg-red-600 text-white' : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Award className="w-4 h-4" />
              <span>Industry Passport</span>
            </div>
            <span className="text-[10px] font-mono bg-black/25 px-1.5 py-0.5 rounded text-white">{profile.stamps.length} stamps</span>
          </button>

          <button 
            id="tab-portfolio"
            onClick={() => setCurrentTab('portfolio')}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-medium flex items-center justify-between transition cursor-pointer ${
              currentTab === 'portfolio' ? 'bg-red-600 text-white' : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Layout className="w-4 h-4" />
              <span>Engineering Portfolio</span>
            </div>
            <span className="text-[10px] font-mono bg-black/25 px-1.5 py-0.5 rounded text-white">{projects.length} files</span>
          </button>

          <button 
            id="tab-learn"
            onClick={() => setCurrentTab('learn')}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-medium flex items-center justify-between transition cursor-pointer ${
              currentTab === 'learn' ? 'bg-red-600 text-white' : 'hover:bg-slate-800 hover:text-white'
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
            className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-medium flex items-center justify-between transition cursor-pointer ${
              currentTab === 'opportunities' ? 'bg-red-600 text-white' : 'hover:bg-slate-800 hover:text-white'
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
            className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-medium flex items-center justify-between transition cursor-pointer ${
              currentTab === 'network' ? 'bg-red-600 text-white' : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <MessageSquare className="w-4 h-4" />
              <span>Industry Network</span>
            </div>
            <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-md border border-slate-700">Tinder Mode</span>
          </button>

          <button 
            id="tab-ticket"
            onClick={() => setCurrentTab('ticket')}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-medium flex items-center justify-between transition cursor-pointer ${
              currentTab === 'ticket' ? 'bg-red-600 text-white' : 'hover:bg-slate-800 hover:text-white'
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
        <div className="p-4 border-t border-slate-800 space-y-2">
          <button 
            onClick={() => {
              showToast("Switched Sandbox to Recruiter");
              window.location.hash = "#recruiter"; 
              window.location.reload();
            }}
            className="w-full py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 font-medium text-[10px] rounded-lg tracking-wider font-mono flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-red-500" />
            SWAP TO RECRUITER
          </button>
          
          <button 
            onClick={onLogout}
            className="w-full py-1.5 hover:bg-red-950 hover:text-red-400 text-slate-400 font-medium text-[10px] rounded-lg tracking-wider font-mono flex items-center justify-center gap-1 border border-transparent cursor-pointer"
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
                85
              </div>
            </div>

            {/* Quick status badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-sky-50 border border-sky-200 rounded-lg">
              <CheckCircle2 className="w-4 h-4 text-sky-500" />
              <span className="text-xs font-semibold text-sky-700">{profile.status}</span>
            </div>
          </div>
        </header>

        {/* --- PORTLET WINDOW LAYOUTS --- */}
        <div className="p-8 flex-1">
          
          {/* ==================== 1. HOME / PASSPORT VIEW ==================== */}
          {currentTab === 'passport' && (
            <div id="view-passport" className="space-y-8 max-w-5xl">
              
              {/* Top overview row with primary passport mock layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Side Card: Physical Industry Passport Display (Image 1 style) */}
                <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between">
                  {/* Top bar element */}
                  <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center border-b border-slate-800">
                    <span className="text-xs font-mono font-medium tracking-widest text-slate-400">EUROPEAN INDUSTRY PASSPORT</span>
                    <span className="text-xs font-bold text-red-500">WE Connect</span>
                  </div>

                  <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 items-start">
                    {/* User profile image / badge */}
                    <div className="flex flex-col items-center gap-2 self-center md:self-auto">
                      <div className="w-28 h-28 rounded-2xl overflow-hidden bg-slate-100 border-2 border-slate-200 shadow-inner flex items-center justify-center group relative">
                        <img 
                          className="w-full h-full object-cover grayscale opacity-90 group-hover:grayscale-0 transition duration-300"
                          src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300" 
                          alt="Sarah Jenkins Passport Portrait"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-1.5 right-1.5 bg-emerald-500 text-white w-5 h-5 rounded-full flex items-center justify-center border border-white">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-sm uppercase tracking-wide">
                        Verified Identity
                      </span>
                    </div>

                    {/* Passport detail table specs */}
                    <div className="flex-1 space-y-3 font-mono">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block">Surname / First Name</span>
                        <span className="text-sm font-semibold text-slate-950 font-sans tracking-tight">JENKINS, Sarah</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block">Education Entity</span>
                          <span className="text-[11px] font-semibold text-slate-800 font-sans leading-tight block mt-0.5">MUAS Engineering Org</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block">Verification Ref</span>
                          <span className="text-[11px] font-mono text-slate-800 uppercase block mt-0.5">TKT-8492-XJZ</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-1">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block">Engagement Tier</span>
                          <span className="text-[11px] text-slate-800 font-sans font-medium flex items-center gap-1.5 mt-0.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            Level 3 Gold
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block">Industry Status</span>
                          <span className="text-[11px] text-red-600 font-sans font-bold uppercase tracking-wider block mt-0.5">
                            INDUSTRY READY &bull;
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stamp count overlay */}
                  <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest block">Signature</span>
                      <span className="font-serif italic text-sm text-slate-600 pointer-events-none">S. Jenkins</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-slate-400 font-mono uppercase tracking-widest">Würth Certification</span>
                      <p className="text-[10px] font-semibold font-mono text-slate-700">MD-ACC-SECURED-92A</p>
                    </div>
                  </div>
                </div>

                {/* Right Card: Dynamic Visas & Stamps Booklet */}
                <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm relative overflow-hidden">
                  <div>
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">Passport Booklet</span>
                        <h3 className="font-display font-semibold text-base text-slate-900 tracking-tight">Validation Stamps (Page 07)</h3>
                      </div>
                      <span className="text-xs text-slate-400 font-mono tracking-wider font-semibold">Active: {profile.stamps.length}</span>
                    </div>

                    <p className="text-slate-500 text-xs leading-relaxed mb-6">
                      Earn active stamps by registering for sessions, completing technical evaluations, or submitting code reviews.
                    </p>

                    {/* Passport Stamps Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {profile.stamps.map((stamp) => (
                        <div 
                          key={stamp.id} 
                          className="bg-red-50/50 border border-red-100 rounded-2xl p-4 flex flex-col items-center justify-center text-center relative overflow-hidden hover:scale-105 transition duration-200"
                        >
                          <div className="text-3xl mb-2 opacity-90">{stamp.icon}</div>
                          <span className="text-xs font-semibold text-slate-800 leading-tight block">{stamp.name}</span>
                          <span className="text-[9px] text-slate-400 font-mono block mt-1 uppercase tracking-wide">{stamp.date}</span>
                          {/* Radial overlay stamp border design */}
                          <div className="absolute inset-2 border border-dashed border-red-500/15 rounded-xl pointer-events-none" />
                        </div>
                      ))}

                      {/* Add new stamp placeholder option */}
                      <button 
                        onClick={() => setShowAddStamp(true)}
                        className="border border-dashed border-slate-300 hover:border-slate-800 text-slate-400 hover:text-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center transition cursor-pointer bg-slate-50/50 hover:bg-white"
                      >
                        <Plus className="w-5 h-5 mb-1 text-slate-400 group-hover:text-slate-800" />
                        <span className="text-xs font-medium block">Secure stamp</span>
                        <span className="text-[9px] text-slate-400 font-mono block mt-1 uppercase">Request</span>
                      </button>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      showToast("Generating comprehensive report...");
                      setCurrentTab('portfolio');
                    }}
                    className="w-full mt-2 py-2 bg-slate-950 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition tracking-wide flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    View Engineering Activity History
                  </button>
                </div>
              </div>

              {/* Skills section */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm">
                <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
                  <div>
                    <h3 className="font-display font-semibold text-base text-slate-900 tracking-tight">Verified Engineering Skills</h3>
                    <p className="text-slate-500 text-xs">Acoustical systems, thermals, and electromagnetic compliance fields</p>
                  </div>
                  <button 
                    onClick={() => {
                      const newSkill = prompt("Enter a new skill parameter to register (e.g. EMI Shielding, RF Design):");
                      if (newSkill && newSkill.trim()) {
                        setProfile(prev => ({
                          ...prev,
                          skills: [...prev.skills, newSkill.trim()]
                        }));
                        showToast(`Successfully registered "${newSkill.trim()}" skill.`);
                      }
                    }}
                    className="px-3 py-1.5 border border-slate-200 hover:border-slate-800 hover:bg-slate-50 rounded-lg text-xs font-medium transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4.5 h-4.5" />
                    Add Skill
                  </button>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {profile.skills.map((skill, index) => (
                    <span 
                      key={index}
                      className="px-3.5 py-1.5 bg-slate-100 text-slate-800 rounded-full text-xs font-medium border border-slate-200 flex items-center gap-2 group hover:border-slate-400 transition"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      {skill}
                      <button 
                        onClick={() => {
                          setProfile(prev => ({
                            ...prev,
                            skills: prev.skills.filter(s => s !== skill)
                          }));
                          showToast(`Removed filter: ${skill}`);
                        }}
                        className="text-slate-400 hover:text-red-500 cursor-pointer hidden group-hover:inline-block ml-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Certifications List */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm">
                <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
                  <div>
                    <h3 className="font-display font-semibold text-base text-slate-900 tracking-tight">Academic & Professional Certifications</h3>
                    <p className="text-slate-500 text-xs">Credentials validated directly by educational institutions or corporate programs</p>
                  </div>
                  <button 
                    onClick={() => {
                      const certName = prompt("Enter certification name:");
                      const certIssuer = prompt("Enter organization/issuer:");
                      if (certName && certIssuer) {
                        setProfile(prev => ({
                          ...prev,
                          certifications: [...prev.certifications, { name: certName, issuer: certIssuer, date: 'Now' }]
                        }));
                        showToast(`Certified: "${certName}" listed`);
                      }
                    }}
                    className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-semibold transition cursor-pointer"
                  >
                    Upload Certificate
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.certifications.map((cert, index) => (
                    <div key={index} className="flex gap-4 p-4 border border-slate-100 hover:border-slate-200 rounded-2xl bg-slate-50/50 hover:bg-white transition">
                      <div className="w-12 h-12 bg-red-100/50 rounded-xl flex items-center justify-center text-red-600 shrink-0 shadow-inner">
                        <Award className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-slate-950 leading-tight">{cert.name}</h4>
                        <p className="text-[11px] text-slate-500 mt-1">{cert.issuer}</p>
                        <span className="text-[9px] text-slate-400 font-mono uppercase tracking-wide block mt-1.5">Issued: {cert.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}


          {/* ==================== 2. PORTFOLIO VIEW ==================== */}
          {currentTab === 'portfolio' && (
            <div id="view-portfolio" className="space-y-6 max-w-5xl">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-200 pb-5">
                <div>
                  <h2 className="font-display font-bold text-2xl text-slate-900">Engineering Rigor & Design Portfolio</h2>
                  <p className="text-slate-500 text-xs mt-1">Showcasing projects leveraging active Würth Elektronik components</p>
                </div>
                <button 
                  onClick={() => setShowAddProject(true)}
                  className="px-4 py-2 bg-red-600 text-white font-semibold text-xs rounded-lg hover:bg-red-700 transition flex items-center gap-2 shadow-sm shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  New Project Entry
                </button>
              </div>

              {/* Grid of engineering projects */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((proj) => (
                  <div 
                    key={proj.id} 
                    className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
                  >
                    {/* Cover Photo */}
                    <div className="h-44 bg-slate-100 overflow-hidden relative">
                      <img 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        src={proj.imageUrl} 
                        alt={proj.title}
                        referrerPolicy="no-referrer"
                      />
                      {proj.featured && (
                        <span className="absolute top-3 left-3 px-2.5 py-1 bg-red-600 text-white font-semibold text-[9px] uppercase tracking-wider rounded-md shadow-sm">
                          Featured Entry
                        </span>
                      )}
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      {/* Technical Specs */}
                      <div>
                        <h4 className="font-display font-semibold text-sm text-slate-900 tracking-tight">{proj.title}</h4>
                        <p className="text-slate-500 text-xs mt-2 leading-relaxed line-clamp-3">{proj.description}</p>
                        
                        {/* Hardware list */}
                        <div className="mt-4 pt-4 border-t border-slate-100">
                          <span className="text-[10px] text-slate-400 font-mono tracking-wider block">WE HARDWARE USED</span>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {proj.components.map((comp, idx) => (
                              <span key={idx} className="bg-red-50 text-red-600 text-[10px] px-2 py-0.5 rounded font-medium border border-red-100/50">
                                {comp}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Tech stack badges */}
                        <div className="mt-3">
                          <span className="text-[10px] text-slate-400 font-mono tracking-wider block">TECH STACK</span>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {proj.tech.map((t, idx) => (
                              <span key={idx} className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded font-mono">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Lower links */}
                      <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-100">
                        <a 
                          href={proj.codeUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => { e.preventDefault(); showToast(`Simulated redirect: Opening ${proj.title} codebase...`); }}
                          className="flex-1 py-1.5 border border-slate-200 hover:border-slate-800 hover:bg-slate-50 text-slate-700 text-xs font-semibold text-center rounded-lg transition flex items-center justify-center gap-1.5"
                        >
                          <Code className="w-3.5 h-3.5" />
                          Code
                        </a>
                        <a 
                          href={proj.demoUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => { e.preventDefault(); showToast(`Opening simulation interface for ${proj.title}...`); }}
                          className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-850 text-white text-xs font-semibold text-center rounded-lg transition flex items-center justify-center gap-1.5"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Demo
                        </a>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Simulated dynamic empty slot block matching Image 3 layout */}
                <div 
                  onClick={() => setShowAddProject(true)}
                  className="border-2 border-dashed border-slate-300 hover:border-slate-800 text-slate-400 hover:text-slate-800 rounded-3xl p-6 flex flex-col items-center justify-center text-center transition cursor-pointer min-h-[350px] bg-slate-50/50 hover:bg-white"
                >
                  <div className="w-12 h-12 bg-slate-100 hover:bg-slate-200 rounded-2xl flex items-center justify-center mb-3">
                    <Plus className="w-6 h-6 text-slate-500" />
                  </div>
                  <h4 className="font-display font-semibold text-sm text-slate-900 tracking-tight">Add New Project Record</h4>
                  <p className="text-slate-500 text-xs mt-1.5 max-w-[200px] leading-relaxed">
                    Document your latest engineering achievement, capstone structure, or published research paper.
                  </p>
                </div>
              </div>
            </div>
          )}


          {/* ==================== 3. LEARNING CENTER VIEW ==================== */}
          {currentTab === 'learn' && (
            <div id="view-learn" className="space-y-8 max-w-5xl">
              
              {/* Header Title context */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
                <div>
                  <h2 className="font-display font-bold text-2xl text-slate-900">WE Academy Learning Center</h2>
                  <p className="text-slate-500 text-xs mt-1">Master engineering basics with certified industry-first tutorial blocks</p>
                </div>
                {/* Floating Feedback Trigger */}
                <button 
                  onClick={() => showToast("Feedback Desk online. How can we support your training curriculum?")}
                  className="px-4 py-2 bg-red-600 text-white font-semibold text-xs rounded-xl hover:bg-red-700 transition flex items-center gap-2 shadow-md cursor-pointer text-center"
                >
                  <MessageSquare className="w-4 h-4" />
                  Request Hardware Design Kit
                </button>
              </div>

              {/* Masterclass list */}
              <div>
                <h3 className="font-display font-semibold text-lg text-slate-900 mb-4 tracking-tight">Upcoming Premium Masterclasses</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {events.map((evt) => (
                    <div key={evt.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs flex flex-col justify-between">
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-3.5">
                          <span className="px-2.5 py-1 bg-red-50 text-red-600 font-semibold text-[9px] uppercase tracking-wider rounded">
                            {evt.tag}
                          </span>
                          <span className="text-slate-500 text-[11px] font-mono flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {evt.date} &bull; {evt.time}
                          </span>
                        </div>

                        <h4 className="font-display font-semibold text-base text-slate-950 tracking-tight leading-snug">
                          {evt.title}
                        </h4>

                        <div className="mt-4 flex items-center gap-3 bg-slate-50 p-2.5 rounded-2xl">
                          <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 font-mono">
                            {evt.speaker[0]}{evt.speaker.split(' ')[1]?.[0] || ''}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-900">{evt.speaker}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{evt.speakerTitle} &middot; Würth Elektronik</p>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-500 font-mono mt-4 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {evt.location}
                        </p>
                      </div>

                      <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-t border-slate-100">
                        {/* Attendance ticker */}
                        <div className="flex items-center -space-x-1.5 overflow-hidden">
                          <div className="w-6 h-6 rounded-full bg-slate-300 border-2 border-white font-semibold text-[9px] flex items-center justify-center font-mono">P1</div>
                          <div className="w-6 h-6 rounded-full bg-slate-400 border-2 border-white font-semibold text-[9px] flex items-center justify-center font-mono">P2</div>
                          <div className="w-6 h-6 rounded-full bg-slate-500 border-2 border-white font-semibold text-[9px] flex items-center justify-center font-mono">P3</div>
                          <span className="text-[10px] font-mono text-slate-500 pl-2">+{evt.attendeesCount} engineering cohorts</span>
                        </div>

                        {/* Interactive sign up triggers */}
                        {evt.registered ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                              CONFIRMED
                            </span>
                            <button 
                              onClick={() => setCurrentTab('ticket')}
                              className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition flex items-center gap-1 cursor-pointer"
                            >
                              <Ticket className="w-3.5 h-3.5" />
                              Boarding Pass
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => {
                              setEvents(prev => prev.map(e => e.id === evt.id ? { ...e, registered: true } : e));
                              showToast("Successfully registered! Ticket issued on Passport.");
                            }}
                            className="px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition cursor-pointer"
                          >
                            Register Today
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Course Materials & Recordings Table representation */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-6 border-b border-slate-100 mb-6">
                  <div>
                    <h3 className="font-display font-semibold text-base text-slate-900 tracking-tight">Session Materials & Code Snippets</h3>
                    <p className="text-slate-500 text-xs">Direct download files compiled during guest lectures and labs</p>
                  </div>

                  {/* Filter pills */}
                  <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl self-start">
                    {(['All', 'Video', 'Slide', 'Code'] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setMaterialsTypeFilter(filter)}
                        className={`px-3 py-1 text-xs font-semibold rounded-lg cursor-pointer transition ${
                          materialsTypeFilter === filter ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Table representation */}
                <div className="overflow-x-auto">
                  <div className="inline-block min-w-full align-middle">
                    <table className="min-w-full divide-y divide-slate-100 text-left">
                      <thead>
                        <tr className="text-[10px] text-slate-400 uppercase font-mono tracking-widest bg-slate-50">
                          <th className="px-4 py-3 font-semibold rounded-l-lg">Document Parameters</th>
                          <th className="px-4 py-3 font-semibold">Categorization</th>
                          <th className="px-4 py-3 font-semibold">Dimensions</th>
                          <th className="px-4 py-3 font-semibold">Date Registered</th>
                          <th className="px-4 py-3 font-semibold rounded-r-lg text-right">Action Desk</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {materials
                          .filter(m => materialsTypeFilter === 'All' || m.type === materialsTypeFilter)
                          .map((mat) => (
                          <tr key={mat.id} className="hover:bg-slate-50/50 transition">
                            <td className="px-4 py-3.5">
                              <span className="font-semibold text-slate-900 font-sans block">{mat.fileName}</span>
                            </td>
                            <td className="px-4 py-3.5">
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 text-slate-600 font-medium rounded text-[10px]">
                                {mat.type === 'Video' ? <Video className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                                {mat.type}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-slate-500 font-mono">{mat.durationOrSize}</td>
                            <td className="px-4 py-3.5 text-slate-400 font-mono">{mat.uploadDate}</td>
                            <td className="px-4 py-3.5 text-right">
                              <button 
                                onClick={() => showToast(`Triggering background transfer: ${mat.fileName}...`)}
                                className="px-3 py-1.5 border border-slate-200 hover:border-red-600 hover:text-red-600 rounded-lg text-slate-600 transition flex items-center gap-1 ml-auto cursor-pointer font-semibold text-[11px]"
                              >
                                <Download className="w-3.5 h-3.5" />
                                Download Bundle
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

            </div>
          )}


          {/* ==================== 4. OPPORTUNITIES VIEW ==================== */}
          {currentTab === 'opportunities' && (
            <div id="view-opportunities" className="space-y-6 max-w-5xl">
              
              {/* Filter list options */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm">
                <div className="max-w-2xl">
                  <h2 className="font-display font-bold text-2xl text-slate-900">Würth Engineering Placement Program</h2>
                  <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                    Bridge experimental engineering research with direct factory lines. Explore global placement pathways supervised jointly by professional engineering staff.
                  </p>
                </div>

                {/* Filters Row */}
                <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Category Filter Cards */}
                  <div className="flex flex-wrap gap-2">
                    {['All', 'Internship', 'Hiwi', 'Thesis', 'Graduate Program'].map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedJobFilter(category as any)}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition ${
                          selectedJobFilter === category 
                            ? 'bg-red-600 text-white shadow-xs' 
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>

                  {/* Search Engine field */}
                  <div className="relative max-w-xs w-full">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text" 
                      placeholder="Search roles or locations..."
                      value={jobSearchQuery}
                      onChange={(e) => setJobSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-red-600"
                    />
                  </div>
                </div>
              </div>

              {/* Opp Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {opportunities
                  .filter(o => selectedJobFilter === 'All' || o.type === selectedJobFilter)
                  .filter(o => 
                    o.title.toLowerCase().includes(jobSearchQuery.toLowerCase()) || 
                    o.company.toLowerCase().includes(jobSearchQuery.toLowerCase()) ||
                    o.location.toLowerCase().includes(jobSearchQuery.toLowerCase())
                  )
                  .map((opp) => (
                    <div 
                      key={opp.id} 
                      className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition relative group"
                    >
                      {/* Interactive Bookmark */}
                      <button 
                        onClick={() => {
                          setOpportunities(prev => prev.map(o => o.id === opp.id ? { ...o, saved: !o.saved } : o));
                          showToast(opp.saved ? "Removed Bookmark from Dashboard" : "Added Bookmark: Role Saved");
                        }}
                        className="absolute top-5 right-5 w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 transition hover:bg-slate-50 cursor-pointer"
                      >
                        <Heart className={`w-4 h-4 ${opp.saved ? 'fill-red-500 stroke-red-500' : ''}`} />
                      </button>

                      {/* Top profile block */}
                      <div>
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${opp.logoColor} text-white font-mono flex items-center justify-center font-bold text-center shrink-0 shadow-inner`}>
                            {opp.company[0]}
                          </div>
                          <div>
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 font-semibold text-[9px] uppercase tracking-wider rounded">
                              {opp.type}
                            </span>
                            <h4 className="font-display font-semibold text-sm text-slate-950 mt-1 leading-snug">
                              {opp.title}
                            </h4>
                            <p className="text-[11px] text-slate-400 font-mono mt-0.5">{opp.company}</p>
                          </div>
                        </div>

                        {/* Location Details block */}
                        <div className="mt-4 grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-600">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>{opp.location}</span>
                          </div>
                          <div className="flex items-center gap-1 justify-end text-right">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>Starts: {opp.starts}</span>
                          </div>
                        </div>

                        <p className="text-slate-500 text-xs mt-4 leading-relaxed font-sans line-clamp-3">
                          {opp.description}
                        </p>
                      </div>

                      {/* Lower actions apply */}
                      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-red-500 bg-red-50 px-2 py-0.5 rounded font-semibold uppercase tracking-wide">
                          {opp.countdown}
                        </span>

                        {opp.applied ? (
                          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 pr-2">
                            <Check className="w-4 h-4 text-emerald-500" />
                            Applied
                          </span>
                        ) : (
                          <button 
                            onClick={() => {
                              setOpportunities(prev => prev.map(o => o.id === opp.id ? { ...o, applied: true } : o));
                              showToast(`Application submitted dynamically for ${opp.title}!`);
                            }}
                            className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition cursor-pointer"
                          >
                            Apply Now
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}


          {/* ==================== 5. INDUSTRY NETWORK VIEW (TINDER MODE) ==================== */}
          {currentTab === 'network' && (
            <div id="view-network" className="max-w-5xl space-y-6">
              
              <div className="border-b border-slate-200 pb-5">
                <h2 className="font-display font-bold text-2xl text-slate-900">WE Academic Matching Queue</h2>
                <p className="text-slate-500 text-xs mt-1">
                  Interact with real-world Würth engineering staff, HR specialists, and system designers globally.
                </p>
              </div>

              {/* Main Tinder Card deck layout with connection log sidepanel */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Tinder Swipe stack panel */}
                <div className="lg:col-span-7 flex flex-col items-center">
                  
                  {/* The Current Sweeping Card */}
                  <div className="w-full max-w-sm h-[480px] relative">
                    <AnimatePresence mode="popLayout">
                      {networkQueue.length > 0 ? (
                        <motion.div 
                          key={networkQueue[0].id}
                          initial={{ scale: 0.95, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ x: 100, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="absolute inset-0 bg-white border border-slate-250 rounded-3xl shadow-lg hover:shadow-xl overflow-hidden flex flex-col justify-between"
                        >
                          {/* Profile Cover view */}
                          <div className="h-48 bg-slate-100 overflow-hidden relative">
                            <img 
                              className="w-full h-full object-cover"
                              src={networkQueue[0].imageUrl} 
                              alt={networkQueue[0].name}
                              referrerPolicy="no-referrer"
                            />
                            {/* Visual tags overlay */}
                            <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
                              {networkQueue[0].tags.map((t, i) => (
                                <span key={i} className="bg-red-600 text-white font-semibold text-[8px] uppercase tracking-wider px-2 py-0.5 rounded shadow">
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Profile Information details body */}
                          <div className="p-5 flex-1 flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-baseline">
                                <h3 className="font-display font-bold text-lg text-slate-950">
                                  {networkQueue[0].name}, {networkQueue[0].age}
                                </h3>
                                <span className="text-[10px] text-slate-400 font-mono tracking-wider font-semibold uppercase">Würth Elektronik</span>
                              </div>
                              <p className="text-xs font-semibold text-red-600 mt-1">{networkQueue[0].role}</p>
                              
                              <p className="text-slate-500 text-xs mt-3 leading-relaxed font-sans">{networkQueue[0].description}</p>
                              
                              {/* Skills */}
                              <div className="mt-4">
                                <div className="flex flex-wrap gap-1">
                                  {networkQueue[0].skills.map((s, idx) => (
                                    <span key={idx} className="bg-slate-100 text-slate-600 text-[9px] px-2 py-0.5 rounded-sm font-semibold tracking-wide">
                                      {s}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Standard Interaction footer widgets */}
                            <div className="flex justify-center gap-6 mt-4 pt-4 border-t border-slate-100">
                              <button 
                                onClick={() => {
                                  showToast(`Passed on ${networkQueue[0].name}`);
                                  setNetworkQueue(prev => prev.slice(1));
                                }}
                                className="w-12 h-12 rounded-full border border-slate-200 hover:border-slate-800 text-slate-400 hover:text-slate-800 flex items-center justify-center transition hover:bg-slate-50 cursor-pointer"
                              >
                                <X className="w-5 h-5" />
                              </button>
                                                            
                              <button 
                                onClick={() => {
                                  const match = networkQueue[0];
                                  showToast(`IT'S A MATCH! Connected with ${match.name}`);
                                  
                                  // Append to connections
                                  const newChat: ConnectionChat = {
                                    id: `match-${match.id}`,
                                    name: match.name,
                                    role: `${match.role.split(' ')[0]} @ WE`,
                                    imageUrl: match.imageUrl,
                                    online: true,
                                    lastMessage: 'Hey! Glad we matched. What are you building?',
                                    messages: [
                                      { sender: 'other', text: 'Hey ! Glad we matched. What are you working on right now?', timestamp: 'Just now' }
                                    ]
                                  };
                                  setConnections(prev => [...prev, newChat]);
                                  setActiveChatId(newChat.id); // auto-open chat drawer
                                  setNetworkQueue(prev => prev.slice(1));
                                }}
                                className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition shadow shadow-red-500/30 cursor-pointer"
                              >
                                <Heart className="w-5 h-5 fill-white" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ) : (
                        <div className="absolute inset-0 bg-slate-100 border border-slate-200 border-dashed rounded-3xl flex flex-col items-center justify-center text-center p-6">
                          <RotateCcw className="w-8 h-8 text-slate-400 mb-2 animate-spin duration-300" />
                          <h4 className="font-display font-semibold text-slate-800 text-sm">Review queue completed</h4>
                          <p className="text-xs text-slate-400 mt-2 max-w-[200px]">Check back later as more Würth specialists join WE Connect.</p>
                          <button 
                            onClick={() => setNetworkQueue([
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
                              }
                            ])}
                            className="mt-4 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-mono tracking-wider uppercase cursor-pointer"
                          >
                            Reset Queue
                          </button>
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Right Connections Drawer & Chat (Image 5 right side layout) */}
                <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm min-h-[480px] flex flex-col justify-between">
                  <div>
                    <h3 className="font-display font-bold text-sm text-slate-900 border-b border-slate-100 pb-3 mb-4 tracking-tight flex items-center justify-between">
                      <span>Active Mentors & Peers ({connections.length})</span>
                      <span className="text-[10px] font-mono bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded border border-emerald-100 uppercase tracking-widest font-semibold text-right">Online chat</span>
                    </h3>

                    {/* Chat selection stack list */}
                    <div className="space-y-2">
                      {connections.map((chat) => (
                        <div 
                          key={chat.id}
                          onClick={() => setActiveChatId(chat.id)}
                          className={`p-3 rounded-2xl flex items-center gap-3 transition cursor-pointer border ${
                            activeChatId === chat.id 
                              ? 'bg-slate-100/70 border-slate-300' 
                              : 'bg-slate-50 border-transparent hover:bg-slate-100/40'
                          }`}
                        >
                          <div className="relative">
                            <img 
                              className="w-10 h-10 rounded-xl object-cover"
                              src={chat.imageUrl} 
                              alt={chat.name}
                              referrerPolicy="no-referrer"
                            />
                            {chat.online && (
                              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border border-white" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline">
                              <h4 className="text-xs font-bold text-slate-950 truncate">{chat.name}</h4>
                              <span className="text-[9px] font-mono text-slate-400">Online</span>
                            </div>
                            <p className="text-[11px] text-red-600 font-medium truncate mt-0.5">{chat.role}</p>
                            <p className="text-[10px] text-slate-400 truncate mt-1">{chat.lastMessage}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Active Message Box Preview details if selected */}
                  <div className="mt-6 pt-4 border-t border-slate-100 flex-1 flex flex-col justify-end bg-slate-50/50 rounded-2xl p-3 min-h-[180px]">
                    {activeChatId ? (
                      <div className="flex flex-col justify-between h-full">
                        {/* Messages stack */}
                        <div className="flex-1 overflow-y-auto space-y-2 mb-3 max-h-[140px] p-1 pr-2">
                          {connections.find(c => c.id === activeChatId)?.messages.map((m, i) => (
                            <div key={i} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
                              <span className={`px-3 py-1.5 text-xs rounded-xl max-w-[85%] leading-relaxed ${
                                m.sender === 'user' 
                                  ? 'bg-slate-900 text-white rounded-tr-none' 
                                  : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'
                              }`}>
                                {m.text}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Text fields trigger */}
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            placeholder="Type a corporate message..."
                            value={typedMessage}
                            onChange={(e) => setTypedMessage(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') sendChatMessage();
                            }}
                            className="flex-1 bg-white border border-slate-250 px-3 py-1.5 rounded-lg text-xs focus:outline-none focus:border-red-600"
                          />
                          <button 
                            onClick={sendChatMessage}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition shrink-0 cursor-pointer"
                          >
                            Send
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-400 text-xs text-center p-6">Select or match an engineering mentor above to load conversation logs.</p>
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}


          {/* ==================== 6. EVENT BOARDING PASS VIEW ==================== */}
          {currentTab === 'ticket' && (
            <div id="view-ticket" className="max-w-4xl mx-auto space-y-6">
              
              <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                <div>
                  <h2 className="font-display font-bold text-2xl text-slate-900">Event Boarding Passes</h2>
                  <p className="text-slate-500 text-xs mt-1">Present this QR code ticket on your device at the entry gates</p>
                </div>
                {/* PDF generation mockup */}
                <div className="flex gap-2.5">
                  <button 
                    onClick={() => showToast("Exporting receipt: TKT-8492-XJZ.pdf downloaded.")}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold select-none flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download PDF
                  </button>
                  <button 
                    onClick={() => showToast("Added ticket to system Wallet application")}
                    className="px-3.5 py-1.5 bg-slate-950 hover:bg-slate-850 text-white rounded-lg text-xs font-semibold select-none flex items-center gap-1 cursor-pointer"
                  >
                    Add to Wallet
                  </button>
                </div>
              </div>

              {/* Envelope Paper Boarding Pass Container (Image 6 design) */}
              <div className="relative bg-white border border-slate-250 rounded-3xl overflow-hidden shadow-xl max-w-2xl mx-auto my-6">
                
                {/* Top styling strip */}
                <div className="bg-red-600 text-white px-6 py-2.5 flex justify-between items-center font-mono">
                  <span className="text-[10px] uppercase tracking-widest font-bold">WE ACADEMY SPECIAL BOARDING ACCESS</span>
                  <span className="text-[10px] uppercase font-bold">SERIAL: TKT-8492-XJZ</span>
                </div>

                {/* Ticket Layout split */}
                <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 relative">
                  
                  {/* Decorative cutouts inside ticket sides to feel realistic */}
                  <div className="hidden md:block absolute top-[110px] -left-3.5 w-7 h-7 rounded-full bg-slate-50 border border-slate-250" />
                  <div className="hidden md:block absolute top-[110px] -right-3.5 w-7 h-7 rounded-full bg-slate-50 border border-slate-250" />

                  {/* Left Segment details block (7 cols) */}
                  <div className="md:col-span-8 space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 font-semibold text-[9px] uppercase tracking-wider rounded-md border border-emerald-100 flex items-center gap-1">
                        <Check className="w-3 h-3 stroke-[3]" />
                        CONFIRMED REGISTRATION
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest block">EVENT NAME</span>
                      <h3 className="font-display font-bold text-xl md:text-2xl text-slate-900 tracking-tight leading-tight mt-1">
                        Global Tech Summit 2024
                      </h3>
                      <p className="text-slate-600 text-xs mt-1">Featuring systems planning, advanced materials science, and IoT evaluations</p>
                    </div>

                    <div className="border-t border-slate-100 pt-4 grid grid-cols-2 gap-4 font-mono">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest block">ATTENDEE PARTICIPANT</span>
                        <p className="text-xs font-semibold text-slate-900 font-sans tracking-tight block mt-1">SARAH JENKINS</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest block">SEAT / SECTION</span>
                        <p className="text-xs font-semibold text-slate-900 font-sans tracking-tight block mt-1">SEC A, ROW 4 &middot; COHORT 3</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 font-mono pt-1">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest block">LOCATION ENCLAVE</span>
                        <p className="text-xs font-semibold text-slate-900 font-sans tracking-tight block mt-1">INNOVATION HUB, BERLIN</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest block">TICKET TIER</span>
                        <p className="text-xs font-bold text-red-600 font-sans uppercase tracking-wide block mt-1">STUDENT VIP ACCESS</p>
                      </div>
                    </div>
                  </div>

                  {/* Right Flap (4 cols) with scan QR design */}
                  <div className="md:col-span-4 border-t md:border-t-0 md:border-l border-dashed border-slate-200 pt-6 md:pt-0 md:pl-6 flex flex-col items-center justify-between">
                    <div className="text-center w-full">
                      <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest block mb-2.5">SCAN ENTRY GATE</span>
                      
                      {/* Interactive simulated QR code */}
                      <div className="w-32 h-32 bg-slate-50 border border-slate-200.5 rounded-2xl p-2 relative mx-auto hover:bg-slate-100 transition duration-300">
                        <svg className="w-full h-full text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                          <rect x="5" y="5" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="5" />
                          <rect x="10" y="10" width="15" height="15" />
                          
                          <rect x="70" y="5" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="5" />
                          <rect x="75" y="10" width="15" height="15" />
                          
                          <rect x="5" y="70" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="5" />
                          <rect x="10" y="75" width="15" height="15" />

                          {/* Complex random QR elements */}
                          <rect x="40" y="20" width="10" height="20" />
                          <rect x="20" y="40" width="20" height="10" />
                          <rect x="50" y="50" width="15" height="15" />
                          <rect x="70" y="40" width="10" height="10" />
                          <rect x="75" y="60" width="15" height="15" />
                          <rect x="40" y="75" width="20" height="10" />
                        </svg>

                        {/* Interactive scanline */}
                        <div className="absolute left-0 w-full h-0.5 ticket-scanline pointer-events-none" />
                      </div>

                      <span className="text-[10px] text-slate-400 font-mono block mt-2">OCT 15, 2024 &middot; 2:00 PM</span>
                    </div>

                    <div className="text-center w-full mt-4">
                      <span className="text-[9px] text-slate-400 font-mono uppercase tracking-wide">COHORT ENROLLMENT</span>
                      <p className="text-[10px] font-semibold text-slate-700">WE-ACADEMY-2024</p>
                    </div>
                  </div>

                </div>

              </div>
              
              {/* Important advisory row alert */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 max-w-2xl mx-auto">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-800 leading-relaxed font-sans">
                  <strong className="font-semibold block">Entry Gate Protocol</strong>
                  Gates open exactly 30 minutes prior to session presentation. Please present physical ID along with this digital check-in queue scan reference. Student kits (if registered) can be collected at Desk F.
                </div>
              </div>

            </div>
          )}

        </div>
      </main>

      {/* ======================================================== */}
      {/* ==================== 7. PORTFOLIO NEW PROJECT MODAL ==================== */}
      {/* ======================================================== */}
      {showAddProject && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 max-w-lg w-full shadow-2xl relative overflow-hidden"
          >
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
              <div>
                <h3 className="font-display font-bold text-base text-slate-900 tracking-tight">New Engineering Project Registration</h3>
                <p className="text-slate-500 text-[11px] mt-0.5">Submit lab layouts or software designs to passport profile</p>
              </div>
              <button 
                onClick={() => setShowAddProject(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block mb-1.5">Project Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Low-Noise High Dissipation Converter"
                  value={newProjTitle}
                  onChange={(e) => setNewProjTitle(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-200 focus:border-red-600 focus:outline-none rounded-xl"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block mb-1.5 font-mono">Component Description</label>
                <textarea 
                  placeholder="Summarize the core engineering implementation parameters..."
                  value={newProjDesc}
                  onChange={(e) => setNewProjDesc(e.target.value)}
                  rows={3}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-200 focus:border-red-600 focus:outline-none rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block mb-1.5 font-mono">Tech Stack</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Python, MQTT"
                    value={newProjTech}
                    onChange={(e) => setNewProjTech(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 focus:border-red-600 focus:outline-none rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block mb-1.5 font-mono">WE Components Used</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Magi3C, RFID Tags"
                    value={newProjComp}
                    onChange={(e) => setNewProjComp(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 focus:border-red-600 focus:outline-none rounded-xl"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 flex gap-3">
              <button 
                onClick={() => setShowAddProject(false)}
                className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition text-center cursor-pointer"
              >
                Discard Entry
              </button>
              <button 
                onClick={() => {
                  if (!newProjTitle.trim() || !newProjDesc.trim()) {
                    showToast("Please supply a valid title and descriptions.");
                    return;
                  }
                  
                  const newObj: Project = {
                    id: `p-${Date.now()}`,
                    title: newProjTitle.trim(),
                    description: newProjDesc.trim(),
                    tech: newProjTech ? newProjTech.split(',').map(s=>s.trim()) : ['React', 'C++'],
                    components: newProjComp ? newProjComp.split(',').map(s=>s.trim()) : ['Magi3C Module'],
                    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400',
                    featured: false,
                    codeUrl: '#',
                    demoUrl: '#'
                  };

                  setProjects(prev => [newObj, ...prev]);
                  setShowAddProject(false);
                  
                  // Reset fields
                  setNewProjTitle('');
                  setNewProjDesc('');
                  setNewProjTech('');
                  setNewProjComp('');

                  showToast(`Successfully registered "${newObj.title}" to portfolio.`);
                }}
                className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition text-center cursor-pointer"
              >
                Register Project
              </button>
            </div>
          </motion.div>
        </div>
      )}


      {/* ======================================================== */}
      {/* ==================== 8. REQUEST PASSPORT STAMP MODAL ==================== */}
      {/* ======================================================== */}
      {showAddStamp && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 max-w-sm w-full shadow-2xl relative"
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-display font-semibold text-sm text-slate-900 tracking-tight">Request Visa / Stamp Validation</h3>
                <p className="text-slate-400 text-[10px] mt-0.5">Validate seminar or lecture credit stamps</p>
              </div>
              <button 
                onClick={() => setShowAddStamp(false)}
                className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto">
              {availableStamps.map((item) => {
                const alreadyEarned = profile.stamps.some(s => s.id === item.id);
                return (
                  <div 
                    key={item.id}
                    className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <p className="font-semibold text-slate-950">{item.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">Date: {item.date}</p>
                      </div>
                    </div>

                    {alreadyEarned ? (
                      <span className="text-[11px] font-mono text-emerald-600 font-bold">Earned</span>
                    ) : (
                      <button 
                        onClick={() => {
                          setProfile(prev => ({
                            ...prev,
                            stamps: [...prev.stamps, item],
                            engagementScore: Math.min(prev.engagementScore + 5, 100)
                          }));
                          showToast(`Earned Stamp: "${item.name}" validated successfully!`);
                          setShowAddStamp(false);
                        }}
                        className="px-2.5 py-1 bg-red-600 hover:bg-red-750 text-white rounded font-semibold text-[10px] select-none cursor-pointer"
                      >
                        Claim Stamp
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
