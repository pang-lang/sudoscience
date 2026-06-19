import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Candidate } from '../../types';
import { Search, Bookmark, X } from 'lucide-react';

interface DiscoveryTabProps {
  candidates: Candidate[];
  setCandidates: React.Dispatch<React.SetStateAction<Candidate[]>>;
  showToast: (msg: string) => void;
}

export default function DiscoveryTab({ candidates, setCandidates, showToast }: DiscoveryTabProps) {
  const [discoverySearch, setDiscoverySearch] = useState('');
  const [schoolFilter, setSchoolFilter] = useState('All');
  const [selectedCandidateForModal, setSelectedCandidateForModal] = useState<Candidate | null>(null);

  return (
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
                      <h4 className="font-display font-semibold text-sm text-slate-905">{cand.name}</h4>
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

      {/* Candidate Passport Modal Popover */}
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
                    className="flex-1 py-2 bg-slate-900 hover:bg-slate-850 text-white font-semibold text-xs rounded-xl transition text-center cursor-pointer"
                  >
                    Initiate Video Interview
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
