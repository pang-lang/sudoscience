import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Candidate, 
  PostedOpportunity
} from '../../types';
import { 
  Briefcase, Search, BarChart3, Users, Sparkles
} from 'lucide-react';

import DashboardTab from './DashboardTab';
import DiscoveryTab from './DiscoveryTab';
import PipelineTab from './PipelineTab';
import OpportunitiesTab from './OpportunitiesTab';

interface RecruiterPortalProps {
  onLogout: () => void;
}

export default function RecruiterPortal({ onLogout }: RecruiterPortalProps) {
  // ---- DATA ENGINE INITIALIZATION ----
  
  // Candidates State
  const [candidates, setCandidates] = useState<Candidate[]>([
    { id: 'c1', name: 'Lukas Bauer', university: 'TU Munich', skills: ['Embedded C', 'PCB Design', 'RFID Systems'], score: 94, stage: 'Talent Pool', avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=300' },
    { id: 'c2', name: 'Sarah Miller', university: 'RWTH Aachen', skills: ['Power Electronics', 'Simulink', 'CAD'], score: 88, stage: 'Talent Pool', avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=300' },
    { id: 'c3', name: 'David Schmidt', university: 'KIT Karlsruhe', skills: ['Python', 'TensorFlow', 'IoT Telemetry'], score: 98, stage: 'Saved', avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=300', saved: true },
    { id: 'c4', name: 'Elena Rostova', university: 'Technical Institute of Berlin', skills: ['SolidWorks Pro', 'FEA', 'Thermodynamics'], score: 91, stage: 'Recruiter Review', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300' },
    { id: 'c5', name: 'Marcus Vance', university: 'Munich Applied Sciences', skills: ['React Native', 'BLE', 'WSEN Sensors'], score: 85, stage: 'Recruiter Review', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300' },
    { id: 'c6', name: 'Anna Müller', university: 'TU Stuttgart', skills: ['Signal Integrity', 'C++', 'Matlab'], score: 72, stage: 'Interview Scheduled', avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300' }
  ]);

  // Posted Job Postings
  const [postings, setPostings] = useState<PostedOpportunity[]>([
    { id: 'p1', title: 'Power Management Field Graduate', type: 'Graduate Program', deadline: 'Dec 01, 2024', applicantsCount: 24, status: 'Active' },
    { id: 'p2', title: 'IoT Electromagnetic Shielding Intern', type: 'Internship', deadline: 'Oct 15, 2024', applicantsCount: 14, status: 'Active' },
    { id: 'p3', title: 'Passive Sensors Lab Assistant', type: 'Hiwi', deadline: 'Nov 12, 2024', applicantsCount: 8, status: 'Active' },
    { id: 'p4', title: 'High-Frequency Inductor Performance Thesis', type: 'Thesis', deadline: 'Rolling Admission', applicantsCount: 3, status: 'Draft' }
  ]);

  // Window navigation
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'discovery' | 'pipeline' | 'opportunities'>('dashboard');

  // Custom alert feedback
  const [toast, setToast] = useState<string | null>(null);

  // Trigger Toast helper
  const showToast = (txt: string) => {
    setToast(txt);
    setTimeout(() => setToast(null), 3000);
  };

  // Drag simulation / instant stage update helper
  const transitionCandidateStage = (id: string, dir: 'next' | 'prev') => {
    const stages: Array<Candidate['stage']> = ['Talent Pool', 'Saved', 'Recruiter Review', 'Interview Scheduled'];
    setCandidates(prev => prev.map(c => {
      if (c.id === id) {
        const curIdx = stages.indexOf(c.stage);
        let nextIdx = curIdx + (dir === 'next' ? 1 : -1);
        if (nextIdx >= 0 && nextIdx < stages.length) {
          showToast(`Advanced ${c.name} to "${stages[nextIdx]}"`);
          return { ...c, stage: stages[nextIdx] };
        }
      }
      return c;
    }));
  };

  return (
    <div id="recruiter-portal-root" className="min-h-screen bg-slate-50 flex font-sans text-slate-800">
      
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
          <div className="flex items-center gap-2 mb-1 cursor-pointer font-display" onClick={() => setCurrentTab('dashboard')}>
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
            className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-medium flex items-center justify-between transition cursor-pointer ${
              currentTab === 'dashboard' ? 'bg-slate-800 text-white border-l-4 border-red-600' : 'hover:bg-slate-900 hover:text-white'
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
            className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-medium flex items-center justify-between transition cursor-pointer ${
              currentTab === 'discovery' ? 'bg-slate-800 text-white border-l-4 border-red-600' : 'hover:bg-slate-900 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Search className="w-4 h-4" />
              <span>Talent Discovery</span>
            </div>
            <span className="text-[10px] bg-red-600/15 text-red-400 px-1.5 py-0.5 rounded-sm font-mono">+240</span>
          </button>

          <button 
            id="tab-recruiter-pipeline"
            onClick={() => setCurrentTab('pipeline')}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-medium flex items-center justify-between transition cursor-pointer ${
              currentTab === 'pipeline' ? 'bg-slate-800 text-white border-l-4 border-red-600' : 'hover:bg-slate-900 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4" />
              <span>Engineering Pipeline</span>
            </div>
            <span className="text-[10px] bg-slate-800 font-mono text-slate-400 px-1 rounded-sm">{candidates.length}</span>
          </button>

          <button 
            id="tab-recruiter-opportunities"
            onClick={() => setCurrentTab('opportunities')}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-medium flex items-center justify-between transition cursor-pointer ${
              currentTab === 'opportunities' ? 'bg-slate-800 text-white border-l-4 border-red-600' : 'hover:bg-slate-900 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Briefcase className="w-4 h-4" />
              <span>Opportunities</span>
            </div>
            <span className="text-[10px] bg-slate-800 font-mono text-slate-400 px-1 rounded-sm">{postings.length}</span>
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
            <DashboardTab />
          )}

          {currentTab === 'discovery' && (
            <DiscoveryTab 
              candidates={candidates} 
              setCandidates={setCandidates} 
              showToast={showToast} 
            />
          )}

          {currentTab === 'pipeline' && (
            <PipelineTab 
              candidates={candidates} 
              transitionCandidateStage={transitionCandidateStage} 
            />
          )}

          {currentTab === 'opportunities' && (
            <OpportunitiesTab 
              postings={postings} 
              setPostings={setPostings} 
              showToast={showToast} 
            />
          )}
        </div>
      </main>

    </div>
  );
}
