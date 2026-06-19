import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Candidate, 
  PostedOpportunity, 
  UserRole 
} from '../types';
import { 
  Briefcase, Search, Filter, TrendingUp, BarChart3, Users, Calendar, 
  ArrowRight, ShieldAlert, CheckCircle2, Bookmark, UserCheck, Plus, 
  ChevronRight, Trash2, X, Award, Check, ExternalLink, Sparkles
} from 'lucide-react';

interface RecruiterPortalProps {
  onLogout: () => void;
}

export default function RecruiterPortal({ onLogout }: RecruiterPortalProps) {
  
  // ---- DATA ENGINE INITIALIZATION ----
  
  // Candidates State (matching Pipeline & Talent Discovery)
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

  // Form Fields for dynamic job post
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState('Internship');
  const [formDeadline, setFormDeadline] = useState('');

  // Search filter Discovery
  const [discoverySearch, setDiscoverySearch] = useState('');
  const [schoolFilter, setSchoolFilter] = useState('All');
  const [selectedCandidateForModal, setSelectedCandidateForModal] = useState<Candidate | null>(null);

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
          
          {/* ==================== 1. ANALYTICS DASHBOARD VIEW ==================== */}
          {currentTab === 'dashboard' && (
            <div id="recruiter-view-dashboard" className="space-y-8 max-w-5xl">
              
              {/* Top Row key performance metrics cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest font-semibold block">Students Reached</span>
                    <p className="text-2xl font-display font-extrabold text-slate-900 mt-1">2,450</p>
                    <span className="text-[10px] text-emerald-600 font-semibold font-mono block mt-1">+12% Year-over-Year</span>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest font-semibold block font-mono">Avg Pass Score</span>
                    <p className="text-2xl font-display font-extrabold text-slate-900 mt-1">78/100</p>
                    <span className="text-[10px] text-emerald-600 font-semibold font-mono block mt-1">+3 Points increase</span>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest font-semibold block font-mono">Completed Labs</span>
                    <p className="text-2xl font-display font-extrabold text-slate-900 mt-1">12 YTD</p>
                    <span className="text-[10px] text-slate-500 font-semibold font-mono block mt-1">On-schedule</span>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest font-semibold block font-mono">Active Matches</span>
                    <p className="text-2xl font-display font-extrabold text-slate-900 mt-1">85</p>
                    <span className="text-[10px] text-red-600 font-bold font-mono block mt-1">Action Needed</span>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 shrink-0">
                    <Briefcase className="w-5 h-5" />
                  </div>
                </div>

              </div>

              {/* Graphical Trend Desk representing Image 9 */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Event Attendance over time SVG Column (7 cols) */}
                <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-baseline mb-6 border-b border-slate-100 pb-3">
                      <div>
                        <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">Cohort Trends</span>
                        <h3 className="font-display font-semibold text-sm text-slate-900 tracking-tight mt-0.5">Event Attendance Over Time</h3>
                      </div>
                      <span className="text-xs font-mono text-slate-500 font-semibold bg-slate-100 px-2.5 py-0.5 rounded">YTD Aggregate</span>
                    </div>

                    {/* Highly responsive custom vector bar chart inside frame */}
                    <div className="h-56 relative flex items-end justify-between px-4 pb-2 pt-6 border-b border-l border-slate-100">
                      
                      {/* Gridlines */}
                      <div className="absolute top-10 left-0 right-0 h-px bg-slate-100/50" />
                      <div className="absolute top-28 left-0 right-0 h-px bg-slate-100/50" />
                      <div className="absolute top-44 left-0 right-0 h-px bg-slate-100/50" />

                      {/* Bar 1 */}
                      <div className="flex flex-col items-center gap-2 w-12 group">
                        <span className="text-[9px] font-mono text-slate-500 opacity-0 group-hover:opacity-100 transition">120</span>
                        <div className="w-6 bg-slate-300 group-hover:bg-red-600 rounded-t h-28 transition-all duration-300" />
                        <span className="text-[10px] font-mono text-slate-400">Jan</span>
                      </div>

                      {/* Bar 2 */}
                      <div className="flex flex-col items-center gap-2 w-12 group">
                        <span className="text-[9px] font-mono text-slate-500 opacity-0 group-hover:opacity-100 transition">190</span>
                        <div className="w-6 bg-slate-300 group-hover:bg-red-600 rounded-t h-40 transition-all duration-300" />
                        <span className="text-[10px] font-mono text-slate-400">Mar</span>
                      </div>

                      {/* Bar 3 */}
                      <div className="flex flex-col items-center gap-2 w-12 group">
                        <span className="text-[9px] font-mono text-slate-500 opacity-0 group-hover:opacity-100 transition">140</span>
                        <div className="w-6 bg-slate-300 group-hover:bg-red-600 rounded-t h-32 transition-all duration-300" />
                        <span className="text-[10px] font-mono text-slate-400">May</span>
                      </div>

                      {/* Bar 4 */}
                      <div className="flex flex-col items-center gap-2 w-12 group">
                        <span className="text-[9px] font-mono text-slate-500 opacity-0 group-hover:opacity-100 transition">280</span>
                        <div className="w-6 bg-red-600 rounded-t h-48 transition-all duration-300 shadow shadow-red-500/20" />
                        <span className="text-[10px] font-mono text-slate-900 font-bold">Jul</span>
                      </div>

                      {/* Bar 5 */}
                      <div className="flex flex-col items-center gap-2 w-12 group">
                        <span className="text-[9px] font-mono text-slate-500 opacity-0 group-hover:opacity-100 transition">210</span>
                        <div className="w-6 bg-slate-300 group-hover:bg-red-600 rounded-t h-42 transition-all duration-300" />
                        <span className="text-[10px] font-mono text-slate-400">Sep</span>
                      </div>

                      {/* Bar 6 */}
                      <div className="flex flex-col items-center gap-2 w-12 group">
                        <span className="text-[9px] font-mono text-slate-500 opacity-0 group-hover:opacity-100 transition">250</span>
                        <div className="w-6 bg-slate-900 group-hover:bg-red-600 rounded-t h-46 transition-all duration-300" />
                        <span className="text-[10px] font-mono text-slate-400">Nov</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 text-[10px] text-slate-400 font-mono flex items-center justify-end gap-4">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 bg-slate-300 rounded-xs" /> Standard Cohort
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 bg-red-600 rounded-xs animate-pulse" /> Peak Engagement (Hackathon)
                    </span>
                  </div>
                </div>

                {/* Vertical Funnel visual representation (5 cols) */}
                <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest block">Pipeline Operations</span>
                    <h3 className="font-display font-semibold text-sm text-slate-900 border-b border-slate-100 pb-3 mb-5 mt-0.5 tracking-tight">Talent Pipeline Funnel</h3>

                    {/* Funnel Rows */}
                    <div className="space-y-3.5">
                      {/* Step 1 */}
                      <div className="relative p-2.5 bg-slate-950 text-white rounded-xl text-xs flex justify-between items-center overflow-hidden">
                        <span className="font-semibold z-15">1. Guest Lecture Attendee</span>
                        <span className="font-mono z-15">500 Students</span>
                        <div className="absolute left-0 top-0 bottom-0 bg-red-600 w-px opacity-80" />
                      </div>

                      {/* Step 2 */}
                      <div className="relative p-2.5 bg-slate-900 text-slate-100 rounded-xl text-xs flex justify-between items-center overflow-hidden max-w-[90%] mx-auto">
                        <span className="font-semibold z-15">2. Practical Workshop</span>
                        <span className="font-mono z-15">300 Students</span>
                        <div className="absolute left-0 top-0 bottom-0 bg-red-600 w-px opacity-80" />
                      </div>

                      {/* Step 3 */}
                      <div className="relative p-2.5 bg-slate-800 text-slate-200 rounded-xl text-xs flex justify-between items-center overflow-hidden max-w-[80%] mx-auto">
                        <span className="font-semibold z-15">3. Industry Hackathon</span>
                        <span className="font-mono z-15">120 Students</span>
                        <div className="absolute left-0 top-0 bottom-0 bg-red-600 w-1 rounded-r opacity-50" />
                      </div>

                      {/* Step 4 */}
                      <div className="relative p-2.5 bg-slate-700 text-slate-300 rounded-xl text-xs flex justify-between items-center overflow-hidden max-w-[70%] mx-auto font-bold text-slate-900">
                        <span className="font-semibold z-15 text-slate-100">4. direct Mentorship</span>
                        <span className="font-mono z-15 text-slate-50 font-bold">50 Students</span>
                        <div className="absolute left-0 top-0 bottom-0 bg-red-600 w-1 rounded-r" />
                      </div>

                      {/* Step 5 */}
                      <div className="relative p-2.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs flex justify-between items-center overflow-hidden max-w-[60%] mx-auto">
                        <span className="font-semibold z-15 text-red-600">5. Signed Placements</span>
                        <span className="font-mono z-15 font-bold">20 Candidates</span>
                        <div className="absolute left-0 top-0 bottom-0 bg-emerald-500 w-1 rounded-r" />
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 font-sans leading-tight mt-6 text-center">
                    Conversion rate: 4.0% entry-to-placement. High operational compliance.
                  </p>
                </div>

              </div>

            </div>
          )}


          {/* ==================== 2. TALENT DISCOVERY LIST ==================== */}
          {currentTab === 'discovery' && (
            <div id="recruiter-view-discovery" className="space-y-6 max-w-5xl">
              
              {/* Header metrics card */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest font-semibold block">Academic Database</span>
                  <h2 className="font-display font-bold text-2xl text-slate-900 mt-1">Discover Technical Talent</h2>
                  <p className="text-slate-500 text-xs mt-1">Showing candidates with verified academic performance profiles and stamps</p>
                </div>

                {/* Filters */}
                <div className="mt-8 flex flex-col md:flex-row gap-4 justify-between items-center pt-6 border-t border-slate-100">
                  {/* Search candidate field */}
                  <div className="relative w-full max-w-sm">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text" 
                      placeholder="Search candidates by name or skill parameters..."
                      value={discoverySearch}
                      onChange={(e) => setDiscoverySearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 focus:border-slate-800 rounded-xl text-xs focus:outline-none"
                    />
                  </div>

                  {/* University selection dropdown */}
                  <div className="flex gap-2 self-start md:self-auto">
                    <select 
                      value={schoolFilter}
                      onChange={(e) => setSchoolFilter(e.target.value)}
                      className="px-3.5 py-1.5 bg-white border border-slate-250 rounded-xl text-xs focus:outline-none font-semibold text-slate-700 cursor-pointer"
                    >
                      <option value="All">All Universities</option>
                      <option value="TU Munich">TU Munich</option>
                      <option value="RWTH Aachen">RWTH Aachen</option>
                      <option value="KIT Karlsruhe">KIT Karlsruhe</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Grid of student candidates */}
              <div id="discovery-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {candidates
                  .filter(c => schoolFilter === 'All' || c.university === schoolFilter)
                  .filter(c => c.name.toLowerCase().includes(discoverySearch.toLowerCase()) || c.skills.join(' ').toLowerCase().includes(discoverySearch.toLowerCase()))
                  .map((cand) => (
                    <div 
                      key={cand.id}
                      className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                    >
                      <div>
                        {/* Upper row */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <img 
                              className="w-12 h-12 rounded-2xl object-cover border border-slate-200"
                              src={cand.avatarUrl} 
                              alt={cand.name}
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <h4 className="font-display font-semibold text-sm text-slate-90<ctrl61>5">{cand.name}</h4>
                              <p className="text-[11px] text-slate-400 font-mono mt-0.5">{cand.university}</p>
                            </div>
                          </div>

                          {/* Engagement score badge */}
                          <div className="text-right">
                            <span className="text-[9px] text-slate-400 font-mono uppercase block">Score</span>
                            <span className="text-xs font-bold text-red-600 font-mono">{cand.score}/100</span>
                          </div>
                        </div>

                        {/* Candidate Skills list */}
                        <div className="pt-3 border-t border-slate-100">
                          <span className="text-[9px] text-slate-400 font-mono uppercase font-semibold">Verified Competence</span>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {cand.skills.map((s, i) => (
                              <span key={i} className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-sm">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Lower actions apply */}
                      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                        <button 
                          onClick={() => {
                            setCandidates(prev => prev.map(c => c.id === cand.id ? { ...c, saved: !c.saved } : c));
                            showToast(cand.saved ? `Removed ${cand.name} bookmark` : `Saved candidate: ${cand.name}`);
                          }}
                          className={`w-8 h-8 rounded-lg border flex items-center justify-center transition cursor-pointer ${
                            cand.saved 
                              ? 'border-red-200 text-red-600 bg-red-50' 
                              : 'border-slate-200 text-slate-400 hover:text-slate-900 hover:bg-slate-50'
                          }`}
                        >
                          <Bookmark className={`w-4 h-4 ${cand.saved ? 'fill-red-600' : ''}`} />
                        </button>

                        <button 
                          onClick={() => setSelectedCandidateForModal(cand)}
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition cursor-pointer"
                        >
                          View Passport Record
                        </button>
                      </div>
                    </div>
                  ))}
              </div>

            </div>
          )}


          {/* ==================== 3. KANBAN PLACEMENT PIPELINE ==================== */}
          {currentTab === 'pipeline' && (
            <div id="recruiter-view-pipeline" className="space-y-6 max-w-5xl">
              
              <div className="border-b border-slate-200 pb-5">
                <h2 className="font-display font-bold text-2xl text-slate-900">Technical Candidate Placements</h2>
                <p className="text-slate-500 text-xs mt-1">Manage active engineering applicants and student mentors across evaluation boards</p>
              </div>

              {/* Kanban Grid Rows (Image 7 style) */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
                
                {/* Swimlane 1: Talent Pool */}
                <div className="bg-slate-100 rounded-3xl p-4 min-h-[500px] border border-slate-200/60">
                  <div className="flex items-center justify-between mb-4 px-2">
                    <span className="font-display font-semibold text-xs uppercase tracking-wider text-slate-600">Talent Pool</span>
                    <span className="text-xs bg-slate-200 font-mono text-slate-500 px-2 py-0.5 rounded">
                      {candidates.filter(c => c.stage === 'Talent Pool').length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {candidates.filter(c => c.stage === 'Talent Pool').map((cand) => (
                      <div key={cand.id} className="bg-white border border-slate-205 rounded-2xl p-4 shadow-xs hover:shadow transition">
                        <div className="flex items-center gap-2.5 mb-3">
                          <img className="w-8 h-8 rounded-full object-cover" src={cand.avatarUrl} alt={cand.name} referrerPolicy="no-referrer" />
                          <div>
                            <h4 className="text-xs font-bold text-slate-950 leading-tight">{cand.name}</h4>
                            <span className="text-[10px] text-slate-400 font-mono">{cand.university}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-[10px] border-t border-slate-100 pt-2.5">
                          <span className="text-red-600 font-bold font-mono">Score: {cand.score}/100</span>
                          <button 
                            onClick={() => transitionCandidateStage(cand.id, 'next')}
                            className="bg-slate-100 hover:bg-slate-200 text-xs font-medium px-2 py-1 rounded flex items-center gap-1 font-semibold text-[11px] cursor-pointer"
                          >
                            Advance
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Swimlane 2: Saved / Bookmarked */}
                <div className="bg-slate-100 rounded-3xl p-4 min-h-[500px] border border-slate-200/60">
                  <div className="flex items-center justify-between mb-4 px-2">
                    <span className="font-display font-semibold text-xs uppercase tracking-wider text-slate-600">Saved</span>
                    <span className="text-xs bg-slate-200 font-mono text-slate-500 px-2 py-0.5 rounded">
                      {candidates.filter(c => c.stage === 'Saved').length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {candidates.filter(c => c.stage === 'Saved').map((cand) => (
                      <div key={cand.id} className="bg-white border border-slate-205 rounded-2xl p-4 shadow-xs hover:shadow transition">
                        <div className="flex items-center gap-2.5 mb-3">
                          <img className="w-8 h-8 rounded-full object-cover" src={cand.avatarUrl} alt={cand.name} referrerPolicy="no-referrer" />
                          <div>
                            <h4 className="text-xs font-bold text-slate-950 leading-tight">{cand.name}</h4>
                            <span className="text-[10px] text-slate-400 font-mono">{cand.university}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-[10px] border-t border-slate-100 pt-2.5">
                          <button onClick={() => transitionCandidateStage(cand.id, 'prev')} className="text-slate-400 hover:text-slate-900 cursor-pointer font-semibold text-[11px]">Back</button>
                          <button 
                            onClick={() => transitionCandidateStage(cand.id, 'next')}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium px-2 py-1 rounded flex items-center gap-1 font-semibold text-[11px] cursor-pointer"
                          >
                            Advance
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Swimlane 3: Recruiter Review */}
                <div className="bg-slate-100 rounded-3xl p-4 min-h-[500px] border border-slate-200/60 bg-red-50/25 border-l-2 border-red-500/20">
                  <div className="flex items-center justify-between mb-4 px-2">
                    <span className="font-display font-semibold text-xs uppercase tracking-wider text-red-600">Review Due</span>
                    <span className="text-xs bg-red-100 font-mono text-red-600 px-2 py-0.5 rounded font-bold">
                      {candidates.filter(c => c.stage === 'Recruiter Review').length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {candidates.filter(c => c.stage === 'Recruiter Review').map((cand) => (
                      <div key={cand.id} className="bg-white border-2 border-red-500/20 rounded-2xl p-4 shadow-md hover:shadow transition">
                        <div className="flex items-center gap-2.5 mb-3">
                          <img className="w-8 h-8 rounded-full object-cover" src={cand.avatarUrl} alt={cand.name} referrerPolicy="no-referrer" />
                          <div>
                            <h4 className="text-xs font-bold text-slate-950 leading-tight">{cand.name}</h4>
                            <span className="text-[10px] text-slate-400 font-mono">{cand.university}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-[10px] border-t border-slate-100 pt-2.5">
                          <button onClick={() => transitionCandidateStage(cand.id, 'prev')} className="text-slate-400 hover:text-slate-900 cursor-pointer font-semibold text-[11px]">Back</button>
                          <button 
                            onClick={() => transitionCandidateStage(cand.id, 'next')}
                            className="bg-slate-900 text-white text-xs font-semibold px-2 py-1 rounded flex items-center gap-1 font-semibold text-[11px] cursor-pointer"
                          >
                            Interview
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Swimlane 4: Scheduled Interviews */}
                <div className="bg-slate-100 rounded-3xl p-4 min-h-[500px] border border-slate-200/60">
                  <div className="flex items-center justify-between mb-4 px-2">
                    <span className="font-display font-semibold text-xs uppercase tracking-wider text-slate-600">Scheduled</span>
                    <span className="text-xs bg-slate-200 font-mono text-slate-500 px-2 py-0.5 rounded">
                      {candidates.filter(c => c.stage === 'Interview Scheduled').length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {candidates.filter(c => c.stage === 'Interview Scheduled').map((cand) => (
                      <div key={cand.id} className="bg-white border border-slate-205 rounded-2xl p-4 shadow-xs hover:shadow transition">
                        <div className="flex items-center gap-2.5 mb-3">
                          <img className="w-8 h-8 rounded-full object-cover" src={cand.avatarUrl} alt={cand.name} referrerPolicy="no-referrer" />
                          <div>
                            <h4 className="text-xs font-bold text-slate-950 leading-tight">{cand.name}</h4>
                            <span className="text-[10px] text-slate-400 font-mono">{cand.university}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-[10px] border-t border-slate-100 pt-2.5">
                          <button onClick={() => transitionCandidateStage(cand.id, 'prev')} className="text-slate-400 hover:text-slate-900 cursor-pointer font-semibold text-[11px]">Back</button>
                          <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[10px] flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            Booked
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}


          {/* ==================== 4. OPPORTUNITIES MANAGEMENT ==================== */}
          {currentTab === 'opportunities' && (
            <div id="recruiter-view-opportunities" className="space-y-6 max-w-5xl">
              
              {/* Layout split: Form Left, Table Right */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Form Left Side (5 cols) (Image 8 style) */}
                <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm">
                  <div className="mb-6 pb-2 border-b border-slate-100">
                    <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest font-semibold block">Placement Editor</span>
                    <h3 className="font-display font-semibold text-lg text-slate-900 tracking-tight mt-0.5">Post New Opportunity</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block mb-1.5 font-mono">Opportunity Title</label>
                      <input 
                        type="text" 
                        placeholder="e.g. PCB Antenna Shielding Analyst"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 border border-slate-200 focus:border-slate-800 rounded-xl focus:outline-none focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block mb-1.5 font-mono">Engagement Classification</label>
                      <select 
                        value={formType}
                        onChange={(e) => setFormType(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 border border-slate-250 focus:border-slate-800 rounded-xl focus:outline-none cursor-pointer"
                      >
                        <option value="Internship">Internship Placement</option>
                        <option value="Hiwi">Hiwi (Research Assistant)</option>
                        <option value="Thesis">B.Sc. / M.Sc. Thesis Project</option>
                        <option value="Graduate Program">Corporate Graduate Program</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block mb-1.5 font-mono">Closing Application Deadline</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Dec 15, 2024 or Rolling"
                        value={formDeadline}
                        onChange={(e) => setFormDeadline(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 border border-slate-200 focus:border-slate-800 rounded-xl focus:outline-none focus:bg-white"
                      />
                    </div>

                    <button 
                      onClick={() => {
                        if (!formTitle.trim()) {
                          showToast("Please provide a valid placement title.");
                          return;
                        }
                        const newPost: PostedOpportunity = {
                          id: `p-${Date.now()}`,
                          title: formTitle.trim(),
                          type: formType,
                          deadline: formDeadline ? formDeadline.trim() : 'Rolling Admission',
                          applicantsCount: 0,
                          status: 'Active'
                        };
                        setPostings(prev => [newPost, ...prev]);
                        showToast(`Successfully published: "${newPost.title}"`);
                        
                        // reset
                        setFormTitle('');
                        setFormDeadline('');
                      }}
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-850 text-white font-semibold text-xs rounded-xl transition shadow flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Publish Position Listing
                    </button>
                  </div>
                </div>

                {/* Table Right Side (7 cols) representing Image 8 */}
                <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm">
                  <div className="flex justify-between items-baseline mb-6 border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest block">Active Listing</span>
                      <h3 className="font-display font-semibold text-base text-slate-900 tracking-tight mt-0.5">Active Posted Opportunities</h3>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-bold">
                      {postings.filter(p=>p.status === 'Active').length} Active
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
                      <thead>
                        <tr className="text-[10px] text-slate-400 font-mono bg-slate-50 uppercase tracking-widest font-semibold">
                          <th className="px-4 py-3 rounded-l-lg">Placement Title</th>
                          <th className="px-4 py-3">Classification</th>
                          <th className="px-4 py-3 text-center">Applicants</th>
                          <th className="px-4 py-3 text-right rounded-r-lg">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {postings.map((post) => (
                          <tr key={post.id} className="hover:bg-slate-50/50 transition">
                            <td className="px-4 py-3.5">
                              <span className="font-semibold text-slate-900 block font-sans">{post.title}</span>
                              <span className="text-[10px] text-slate-400 font-mono italic block mt-0.5">Deadline: {post.deadline}</span>
                            </td>
                            <td className="px-4 py-3.5">
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 font-mono text-[9px] rounded">
                                {post.type}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-center">
                              <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-red-50 text-red-600 font-mono rounded font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                                {post.applicantsCount}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-right">
                              <button 
                                onClick={() => {
                                  setPostings(prev => prev.filter(p => p.id !== post.id));
                                  showToast("Opportunity archiving simulation successful.");
                                }}
                                className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 transition cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
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

        </div>
      </main>

      {/* ======================================================== */}
      {/* ==================== 5. CANDIDATE PASSPORT MODAL (Discovery Detail popover) ==================== */}
      {/* ======================================================== */}
      {selectedCandidateForModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
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

            <div className="p-6 md:p-8 flex gap-6 items-start">
              {/* Photo */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-100 border-2 border-slate-200 flex items-center justify-center">
                  <img 
                    className="w-full h-full object-cover grayscale"
                    src={selectedCandidateForModal.avatarUrl} 
                    alt={selectedCandidateForModal.name}
                    referrerPolicy="no-referrer"
                  />
                </div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-semibold block bg-slate-100 px-1.5 py-0.5 rounded">
                  PASSPORT OK
                </span>
              </div>

              {/* Data Table */}
              <div className="flex-1 space-y-3 font-mono text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest block">Surname / First Name</span>
                  <span className="text-sm font-semibold text-slate-950 font-sans tracking-tight block mt-0.5">
                    {selectedCandidateForModal.name.split(' ')[1]?.toUpperCase() || 'CANDIDATE'}, {selectedCandidateForModal.name.split(' ')[0]}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest block">Educational entity</span>
                  <span className="text-slate-800 font-sans font-medium block mt-0.5">{selectedCandidateForModal.university}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest block">ENG SCORE</span>
                    <span className="text-red-600 font-sans font-bold text-sm block mt-0.5">{selectedCandidateForModal.score}/100</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest block">Placement Stage</span>
                    <span className="text-slate-800 font-sans font-bold uppercase block mt-0.5 text-xs text-slate-900">{selectedCandidateForModal.stage}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Competency tags list in popup */}
            <div className="p-6 bg-slate-100/50 border-t border-slate-100">
              <span className="text-[9px] text-slate-400 font-mono uppercase tracking-widest block font-semibold">Verified Capstones & Stamps</span>
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {selectedCandidateForModal.skills.map((s, idx) => (
                  <span key={idx} className="bg-white border border-slate-205 text-slate-700 text-xs px-2.5 py-1 rounded-md font-semibold">
                    {s}
                  </span>
                ))}
              </div>
              
              <div className="mt-6 flex gap-3">
                <button 
                  onClick={() => {
                    alert(`Direct Teams/Outlook contact initiated with ${selectedCandidateForModal.name}.`);
                    setSelectedCandidateForModal(null);
                  }}
                  className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition text-center cursor-pointer"
                >
                  Initiate Video Interview
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
