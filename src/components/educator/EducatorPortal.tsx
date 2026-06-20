import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LearningMaterial, 
  StudentPerformance, 
  CapstoneProject 
} from '../../types';
import { 
  Upload, Table, BookOpen, Sparkles
} from 'lucide-react';

import ContentTab from './ContentTab';
import InsightsTab from './InsightsTab';
import CollaborateTab from './CollaborateTab';

interface EducatorPortalProps {
  onLogout: () => void;
}

export default function EducatorPortal({ onLogout }: EducatorPortalProps) {
  // ---- DATA ENGINE INITIALIZATION ----
  
  // Dynamic material recordings listed
  const [materials, setMaterials] = useState<LearningMaterial[]>([
    { id: 'm1', fileName: 'Q3_Engineering_Principles_Deck.pptx', type: 'Slide', durationOrSize: '4.8 MB', uploadDate: 'Oct 02, 2024', views: 84, downloads: 42 },
    { id: 'm2', fileName: 'Advanced_Thermodynamics_Lec1.mp4', type: 'Video', durationOrSize: '1h 24m', uploadDate: 'Sep 28, 2024', views: 112, downloads: 55 },
    { id: 'm3', fileName: 'Inductor_Design_Formulas.pdf', type: 'Document', durationOrSize: '1.2 MB', uploadDate: 'Sep 15, 2024', views: 254, downloads: 180 }
  ]);

  // Student list tracked
  const [students, setStudents] = useState<StudentPerformance[]>([
    { id: 's1', name: 'Elena Rostova', course: 'ENG-101', attendance: 98, resourcesAccessed: 24, questionsAsked: 12, flagged: false },
    { id: 's2', name: 'Marcus Chen', course: 'ENG-101', attendance: 95, resourcesAccessed: 18, questionsAsked: 8, flagged: false },
    { id: 's3', name: 'Sarah Jenkins', course: 'ENG-102', attendance: 100, resourcesAccessed: 31, questionsAsked: 22, flagged: false },
    { id: 's4', name: 'David Miller', course: 'ENG-101', attendance: 75, resourcesAccessed: 12, questionsAsked: 2, flagged: true }
  ]);

  // Capstones listed
  const [capstones, setCapstones] = useState<CapstoneProject[]>([
    { id: 'cp1', title: 'Sustainable Fastening Solutions', category: 'Engineering', description: 'Innovative screw-threaded design for quick disassembly and metal recycling in secondary consumer electronics casings.', teamCount: 4, sharedWithWE: false },
    { id: 'cp2', title: 'Automated Warehouse Logistics Router', category: 'Logistics', description: 'Autonomous small-footprint drone coordination algorithm utilizing passive RFID tag tracking to minimize routing overhead.', teamCount: 3, sharedWithWE: true }
  ]);

  // View tabs
  const [currentTab, setCurrentTab] = useState<'content' | 'insights' | 'collaborate'>('content');

  // Toast feedback overlay
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div id="educator-portal-root" className="h-screen overflow-hidden bg-slate-50 flex font-sans text-slate-800">
      
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700"
          >
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping" />
            <span className="font-semibold">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- SIDEBAR NAVIGATION --- */}
      <aside className="w-64 bg-slate-950 text-slate-300 flex flex-col border-r border-slate-800 shrink-0">
        
        {/* Brand layout block */}
        <div className="p-6 border-b border-slate-900">
          <div className="flex items-center gap-2 mb-1 cursor-pointer font-display" onClick={() => setCurrentTab('content')}>
            <span className="bg-red-600 text-white px-2 py-0.5 rounded-xs font-black text-sm tracking-tighter">WE</span>
            <span className="font-bold text-lg text-white">Connect</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-semibold block">University Educator</span>
        </div>

        {/* User profile layout */}
        <div className="p-4 mx-4 my-3 bg-slate-900 rounded-xl flex items-center gap-3 border border-slate-800">
          <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 font-bold block flex items-center justify-center text-slate-100 font-display">
            Prof
          </div>
          <div>
            <h4 className="text-white text-xs font-semibold leading-tight">Prof. H. Hartmann</h4>
            <p className="text-[9px] text-red-500 font-mono tracking-wider uppercase mt-0.5">Faculty Sponsor</p>
          </div>
        </div>

        {/* Lateral lists */}
        <div className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          <button 
            id="tab-educator-content"
            onClick={() => setCurrentTab('content')}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-medium flex items-center justify-between transition cursor-pointer ${
              currentTab === 'content' ? 'bg-slate-800 text-white border-l-4 border-red-600' : 'hover:bg-slate-900 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Upload className="w-4 h-4" />
              <span>Academic Materials</span>
            </div>
          </button>

          <button 
            id="tab-educator-insights"
            onClick={() => setCurrentTab('insights')}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-medium flex items-center justify-between transition cursor-pointer ${
              currentTab === 'insights' ? 'bg-slate-800 text-white border-l-4 border-red-600' : 'hover:bg-slate-900 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Table className="w-4 h-4" />
              <span>Student Performance</span>
            </div>
            {students.some(s => s.flagged) && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            )}
          </button>

          <button 
            id="tab-educator-collaborate"
            onClick={() => setCurrentTab('collaborate')}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-medium flex items-center justify-between transition cursor-pointer ${
              currentTab === 'collaborate' ? 'bg-slate-800 text-white border-l-4 border-red-600' : 'hover:bg-slate-900 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <BookOpen className="w-4 h-4" />
              <span>Collaborate Caps</span>
            </div>
          </button>
        </div>

        {/* Swap role back to student sandbox */}
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
        
        {/* Course top bar */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shrink-0">
          <div>
            <h1 className="font-display font-semibold text-lg text-slate-900 tracking-tight">Active Faculty Class Register</h1>
            <p className="text-slate-500 text-xs mt-0.5">Academic sponsorship department &bull; Sector Germany East</p>
          </div>
          <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-semibold rounded-lg border border-blue-200 text-xs flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            Class Active: ENG-101 / 102
          </span>
        </header>

        {/* --- MAIN PAGE TAB VIEW WINDOWS --- */}
        <div className="p-8 flex-1">
          {currentTab === 'content' && (
            <ContentTab 
              materials={materials} 
              setMaterials={setMaterials} 
              showToast={showToast} 
            />
          )}

          {currentTab === 'insights' && (
            <InsightsTab 
              students={students} 
            />
          )}

          {currentTab === 'collaborate' && (
            <CollaborateTab 
              capstones={capstones} 
              setCapstones={setCapstones} 
              showToast={showToast} 
            />
          )}
        </div>
      </main>

    </div>
  );
}
