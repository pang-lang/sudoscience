import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LearningMaterial, 
  StudentPerformance, 
  CapstoneProject 
} from '../types';
import { 
  BookOpen, Upload, Download, Eye, Table, Plus, ChevronRight, CheckCircle2, 
  Trash2, X, AlertTriangle, Check, UserPlus, Inbox, Mail, Calendar, 
  Sparkles, Globe
} from 'lucide-react';

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

  // Lecturers modals
  const [showLecturerModal, setShowLecturerModal] = useState(false);
  const [lecturerName, setLecturerName] = useState('');
  const [lecturerTopic, setLecturerTopic] = useState('Electromagnetic Compatibility (EMC)');
  const [lecturerDate, setLecturerDate] = useState('');

  // Dropdown / Form material
  const [newFileTitle, setNewFileTitle] = useState('');
  const [newFileType, setNewFileType] = useState<'Video' | 'Slide' | 'Document' | 'Code'>('Slide');
  const [newFileSize, setNewFileSize] = useState('');

  // Toast feedback overlay
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div id="educator-portal-root" className="min-h-screen bg-slate-50 flex font-sans text-slate-800">
      
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
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 shrink-0">
        
        {/* Brand layout block */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-2 mb-1 cursor-pointer font-display" onClick={() => setCurrentTab('content')}>
            <span className="bg-red-600 text-white px-2 py-0.5 rounded-xs font-black text-sm tracking-tighter">WE</span>
            <span className="font-bold text-lg text-white">Connect</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-semibold block">University Educator</span>
        </div>

        {/* User profile layout */}
        <div className="p-4 mx-4 my-3 bg-slate-800/50 rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 border border-blue-200 font-extrabold text-blue-600 font-display flex items-center justify-center">
            Prof
          </div>
          <div>
            <h4 className="text-white text-xs font-semibold leading-tight">Prof. H. Hartmann</h4>
            <p className="text-[9px] text-blue-400 font-mono tracking-wider uppercase mt-0.5">Faculty Sponsor</p>
          </div>
        </div>

        {/* Lateral lists */}
        <div className="flex-1 px-3 py-2 space-y-1">
          <button 
            id="tab-educator-content"
            onClick={() => setCurrentTab('content')}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-medium flex items-center justify-between transition cursor-pointer ${
              currentTab === 'content' ? 'bg-blue-650 text-white' : 'hover:bg-slate-800 hover:text-white'
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
              currentTab === 'insights' ? 'bg-blue-650 text-white' : 'hover:bg-slate-800 hover:text-white'
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
              currentTab === 'collaborate' ? 'bg-blue-650 text-white' : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <BookOpen className="w-4 h-4" />
              <span>Collaborate Caps</span>
            </div>
          </button>
        </div>

        {/* Swap role back to student sandbox */}
        <div className="p-4 border-t border-slate-800 space-y-2">
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
          
          {/* ==================== 1. CONTENT MANAGER (Image 14) ==================== */}
          {currentTab === 'content' && (
            <div id="educator-view-content" className="space-y-6 max-w-5xl">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Upload drag-and-drop simulated console (5 cols) (Image 14 style) */}
                <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 md:p-8 flex flex-col justify-between shadow-sm">
                  <div>
                    <div className="mb-6 pb-2 border-b border-slate-100">
                      <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest font-semibold block">Academic Repository</span>
                      <h3 className="font-display font-semibold text-base text-slate-900 tracking-tight mt-0.5">Upload Lesson Materials</h3>
                    </div>

                    <p className="text-slate-500 text-xs leading-relaxed mb-6">
                      Publish lecture documents, slide arrays, or simulation code files directly into the student-accessible Learning Center.
                    </p>

                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block mb-1.5 font-mono">Resource Designation</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Electromagnetic Shielding Principles"
                          value={newFileTitle}
                          onChange={(e) => setNewFileTitle(e.target.value)}
                          className="w-full text-xs px-3.5 py-2.5 border border-slate-200 focus:border-slate-800 rounded-xl focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block mb-1.5 font-mono">Material Type</label>
                          <select 
                            value={newFileType}
                            onChange={(e) => setNewFileType(e.target.value as any)}
                            className="w-full text-xs px-3.5 py-2.5 border border-slate-250 focus:border-slate-800 rounded-xl focus:outline-none cursor-pointer"
                          >
                            <option value="Slide">Slide Reference</option>
                            <option value="Video">Video Session</option>
                            <option value="Document">PDF Document</option>
                            <option value="Code">ZIP Source Code</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block mb-1.5 font-mono">File Dimensions / Size</label>
                          <input 
                            type="text" 
                            placeholder="e.g. 5.6 MB or 1h 10m"
                            value={newFileSize}
                            onChange={(e) => setNewFileSize(e.target.value)}
                            className="w-full text-xs px-3.5 py-2.5 border border-slate-200 focus:border-slate-800 rounded-xl focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic simulated file trigger */}
                  <button 
                    onClick={() => {
                      if (!newFileTitle.trim()) {
                        showToast("Please provide a valid file designation.");
                        return;
                      }
                      const newFile: LearningMaterial = {
                        id: `m-${Date.now()}`,
                        fileName: newFileTitle.trim(),
                        type: newFileType,
                        durationOrSize: newFileSize ? newFileSize.trim() : '2.1 MB',
                        uploadDate: 'Now',
                        views: 0,
                        downloads: 0
                      };
                      setMaterials(prev => [newFile, ...prev]);
                      showToast(`Successfully registered and published file: "${newFile.fileName}"`);
                      
                      // reset fields
                      setNewFileTitle('');
                      setNewFileSize('');
                    }}
                    className="w-full mt-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm block cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    Publish Resource entry
                  </button>
                </div>

                {/* File list spreadsheet (7 cols) (Image 14 table style) */}
                <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm">
                  <div className="flex justify-between items-baseline mb-6 border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest block">Active Inventory</span>
                      <h3 className="font-display font-semibold text-base text-slate-900 mt-0.5 tracking-tight">Published Lesson Repositories</h3>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-bold">
                      {materials.length} files
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
                      <thead>
                        <tr className="text-[10px] text-slate-400 font-mono bg-slate-50 uppercase tracking-widest font-semibold">
                          <th className="px-4 py-3 rounded-l-lg">Document Parameters</th>
                          <th className="px-4 py-3">Type</th>
                          <th className="px-4 py-3 text-center">Engagement Counters</th>
                          <th className="px-4 py-3 text-right rounded-r-lg">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {materials.map((mat) => (
                          <tr key={mat.id} className="hover:bg-slate-50/50 transition">
                            <td className="px-4 py-3.5">
                              <span className="font-semibold text-slate-900 block font-sans">{mat.fileName}</span>
                              <span className="text-[10px] text-slate-400 font-mono italic block mt-0.5">Dimensions: {mat.durationOrSize} &middot; Added {mat.uploadDate}</span>
                            </td>
                            <td className="px-4 py-3.5">
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 font-mono text-[9px] rounded">
                                {mat.type}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-center">
                              <span className="text-[11px] font-mono font-medium text-slate-600 block">
                                Views: {mat.views} &middot; DLs: {mat.downloads}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-right">
                              <button 
                                onClick={() => {
                                  setMaterials(prev => prev.filter(m => m.id !== mat.id));
                                  showToast("Acoustic files archiving simulation successful.");
                                }}
                                className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-slate-100 transition cursor-pointer"
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


          {/* ==================== 2. PERFORMANCE INSIGHTS SPREADSHEET (Image 13) ==================== */}
          {currentTab === 'insights' && (
            <div id="educator-view-insights" className="space-y-6 max-w-5xl">
              
              <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest font-semibold block">Engagement Logs</span>
                  <h2 className="font-display font-bold text-2xl text-slate-900 mt-1">Student Performance Insights</h2>
                  <p className="text-slate-500 text-xs mt-1">Real-time attendance indicators and material consumption logs across course registries</p>
                </div>

                <div className="overflow-x-auto mt-8">
                  <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
                    <thead>
                      <tr className="text-[10px] text-slate-400 font-mono bg-slate-50 uppercase tracking-widest font-semibold">
                        <th className="px-4 py-3 rounded-l-lg">Student Entity Name</th>
                        <th className="px-4 py-3 text-center">Assigned Course</th>
                        <th className="px-4 py-3 text-center">Class Attendance</th>
                        <th className="px-4 py-3 text-center">Files Consumed</th>
                        <th className="px-4 py-3 text-center">Questions Lodged</th>
                        <th className="px-4 py-3 text-right rounded-r-lg">Risk Assessment Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {students.map((stud) => (
                        <tr key={stud.id} className="hover:bg-slate-50/50 transition">
                          <td className="px-4 py-3.5 font-semibold text-slate-900 font-sans">{stud.name}</td>
                          <td className="px-4 py-3.5 text-center font-mono text-slate-500">{stud.course}</td>
                          <td className="px-4 py-3.5 text-center font-mono font-semibold text-slate-800">{stud.attendance}%</td>
                          <td className="px-4 py-3.5 text-center font-mono text-slate-600">{stud.resourcesAccessed} views</td>
                          <td className="px-4 py-3.5 text-center font-mono text-slate-600">{stud.questionsAsked} asked</td>
                          
                          <td className="px-4 py-3.5 text-right">
                            {stud.flagged ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 font-semibold rounded-lg border border-amber-200 text-[11px] ml-auto">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                                LOW ENGAGEMENT
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 font-semibold rounded-lg border border-emerald-150 text-[11px] ml-auto">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                OPERATIVE SATISFACTORY
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}


          {/* ==================== 3. COLLABORATE & CAPSTONES (Image 11) ==================== */}
          {currentTab === 'collaborate' && (
            <div id="educator-view-collaborate" className="space-y-6 max-w-5xl">
              
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-200 pb-5">
                <div>
                  <h2 className="font-display font-bold text-2xl text-slate-900">Academic & Corporate Collaboration</h2>
                  <p className="text-slate-500 text-xs mt-1">Submit student achievements or schedule masterclass guest lecturers with Würth staff</p>
                </div>
                
                <button 
                  onClick={() => setShowLecturerModal(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition flex items-center gap-2 shadow-sm shrink-0 cursor-pointer text-center"
                >
                  <UserPlus className="w-4 h-4" />
                  Invite Guest Lecturer
                </button>
              </div>

              {/* Capstones Grid representation */}
              <div>
                <h3 className="font-display font-semibold text-base text-slate-900 mb-4 tracking-tight">Active Team Capstone Initiatives</h3>
                
                <div id="capstones-grid" className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {capstones.map((cap) => (
                    <div 
                      key={cap.id} 
                      className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition"
                    >
                      <div>
                        {/* Upper row header */}
                        <div className="flex items-center justify-between mb-4">
                          <span className="px-2.5 py-0.5 bg-blue-50 text-blue-600 font-mono text-[9px] uppercase tracking-wider rounded font-bold">
                            {cap.category}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono tracking-wider">Team count: {cap.teamCount} members</span>
                        </div>

                        <h4 className="font-display font-semibold text-base text-slate-950 tracking-tight leading-snug">
                          {cap.title}
                        </h4>
                        <p className="text-slate-500 text-xs mt-3 leading-relaxed font-sans">{cap.description}</p>
                      </div>

                      {/* Lower share triggers */}
                      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-slate-400">Class Ref: WE-CAP-{cap.id}</span>
                        
                        {cap.sharedWithWE ? (
                          <span className="text-emerald-700 bg-emerald-50 border border-emerald-150 px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            Shared with Recruiter
                          </span>
                        ) : (
                          <button 
                            onClick={() => {
                              setCapstones(prev => prev.map(c => c.id === cap.id ? { ...c, sharedWithWE: true } : c));
                              showToast(`Success: project portfolio dispatched to Würth Elektronik!`);
                            }}
                            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition cursor-pointer"
                          >
                            Share with Recruiter
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>
      </main>

      {/* ======================================================== */}
      {/* ==================== INVITATION MODAL GUEST LECTURER ==================== */}
      {/* ======================================================== */}
      {showLecturerModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 max-w-md w-full shadow-2xl relative"
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-6">
              <div>
                <h3 className="font-display font-bold text-base text-slate-900 tracking-tight">Initiate Guest Lecturer Invitation</h3>
                <p className="text-slate-500 text-[11px] mt-0.5">Invite a Würth FAE to present directly to active classes</p>
              </div>
              <button 
                onClick={() => setShowLecturerModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block mb-1.5 font-mono">Lecturer Target / Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Marcus Schmidt (Technical Lead EMEA)"
                  value={lecturerName}
                  onChange={(e) => setLecturerName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-200 focus:border-blue-600 focus:outline-none rounded-xl"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block mb-1.5 font-mono">Technical Theme</label>
                <select 
                  value={lecturerTopic}
                  onChange={(e) => setLecturerTopic(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-250 focus:border-blue-600 focus:outline-none rounded-xl cursor-pointer"
                >
                  <option value="EMI Shielding & Filter Design">EMI Shielding & Filter Design</option>
                  <option value="Wireless Power Transmission Systems">Wireless Power Transmission Systems</option>
                  <option value="Autonomous IoT & RFID Systems Integration">Autonomous IoT & RFID Systems Integration</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block mb-1.5 font-mono">Preferred Webinar Date</label>
                <input 
                  type="text" 
                  placeholder="e.g. Nov 14, 2024 at 14:00 CEST"
                  value={lecturerDate}
                  onChange={(e) => setLecturerDate(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-200 focus:border-blue-600 focus:outline-none rounded-xl"
                />
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 flex gap-3">
              <button 
                onClick={() => setShowLecturerModal(false)}
                className="flex-1 py-2.5 border border-slate-250 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition text-center cursor-pointer font-sans"
              >
                Cancel Invite
              </button>
              
              <button 
                onClick={() => {
                  if (!lecturerName.trim()) {
                    showToast("Please provide a target lecturer name.");
                    return;
                  }
                  showToast(`Dispatching Lecturer invite for: "${lecturerName.trim()}" successfully!`);
                  setShowLecturerModal(false);
                  setLecturerName('');
                  setLecturerDate('');
                }}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition text-center cursor-pointer"
              >
                Send Request Dispatch
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
