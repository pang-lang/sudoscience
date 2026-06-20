import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Candidate, CoffeeChatInvite } from '../../types';
import { 
  Search, Bookmark, X, Sliders, Lock, Unlock, 
  ShieldAlert, Check, Calendar, Mail, FileText, Send, Sparkles, UserCheck, Eye, RefreshCw, AlertTriangle
} from 'lucide-react';
import { db } from '../../utils/db';

interface DiscoveryTabProps {
  candidates: Candidate[];
  setCandidates: React.Dispatch<React.SetStateAction<Candidate[]>>;
  showToast: (msg: string) => void;
  invites: CoffeeChatInvite[];
  setInvites: React.Dispatch<React.SetStateAction<CoffeeChatInvite[]>>;
  managerProfile: { name: string; dept: string; research: string };
  setManagerProfile: React.Dispatch<React.SetStateAction<{ name: string; dept: string; research: string }>>;
  onViewCandidate: (cand: Candidate) => void;
  matchThreshold: number;
  setMatchThreshold: (val: number) => void;
}

export default function DiscoveryTab({ 
  candidates, 
  setCandidates, 
  showToast,
  invites,
  setInvites,
  managerProfile,
  setManagerProfile,
  onViewCandidate,
  matchThreshold,
  setMatchThreshold
}: DiscoveryTabProps) {
  const [discoverySearch, setDiscoverySearch] = useState('');
  const [schoolFilter, setSchoolFilter] = useState('All');
  const [selectedJobId, setSelectedJobId] = useState<string>('All');
  
  // Tab control states
  const [subTab, setSubTab] = useState<'discover' | 'history'>('discover');
  const [showManagerConfigModal, setShowManagerConfigModal] = useState(false);
  const [editName, setEditName] = useState(managerProfile.name);
  const [editDept, setEditDept] = useState(managerProfile.dept);
  const [editResearch, setEditResearch] = useState(managerProfile.research);

  // Load jobs from DB for position matching
  const jobs = db.getJobs();
  const selectedJob = jobs.find(j => j.id === selectedJobId);

  const handleToggleManagerShare = (inviteId: string) => {
    setInvites(prev => prev.map(inv => {
      if (inv.id === inviteId) {
        const nextState = !inv.managerSharedProfile;
        showToast(nextState ? "Shared full contact details with candidate" : "Revoked contact details sharing");
        return { ...inv, managerSharedProfile: nextState };
      }
      return inv;
    }));
  };

  const handleSendOffer = (candName: string) => {
    showToast(`Internship Placement Offer dispatched to ${candName}!`);
  };

  // Helper to generate anonymous tags
  const getMaskedName = (cand: Candidate, score: number) => {
    const initials = cand.name.split(' ').map(n => n[0]).join('');
    return `Candidate #${initials}${score}`;
  };

  // Filter candidates who have accepted matches
  const matchedInvites = invites.filter(inv => inv.status === 'accepted');

  // --- FILTER AND CALCULATE MATCH SCORES ---
  const processedCandidates = candidates
    .filter(c => schoolFilter === 'All' || c.university === schoolFilter)
    .filter(c => c.name.toLowerCase().includes(discoverySearch.toLowerCase()) || c.skills.join(' ').toLowerCase().includes(discoverySearch.toLowerCase()))
    .map(c => {
      // Calculate match score if a job is selected, otherwise use default candidate score
      const score = selectedJob ? db.calculateMatchScore(c, selectedJob) : c.score;
      return {
        ...c,
        calculatedScore: score
      };
    });

  // Group candidates if a position is selected
  const isGroupingEnabled = selectedJobId !== 'All' && selectedJob;
  const bestMatches = processedCandidates.filter(c => c.calculatedScore >= 80);
  const goodMatches = processedCandidates.filter(c => c.calculatedScore >= 60 && c.calculatedScore < 80);
  const leastMatches = processedCandidates.filter(c => c.calculatedScore < 60);

  // Sorting helper
  const sortCandidates = (list: typeof processedCandidates) => {
    return [...list].sort((a, b) => b.calculatedScore - a.calculatedScore);
  };

  // Render a candidate card helper
  const renderCandidateCard = (cand: typeof processedCandidates[0]) => {
    const eligible = cand.calculatedScore >= matchThreshold;
    const invite = invites.find(inv => inv.candidateId === cand.id);
    const isLeast = cand.calculatedScore < 60;
    
    return (
      <div 
        key={cand.id}
        className={`bg-white rounded-3xl border p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between relative overflow-hidden ${
          isLeast 
            ? 'border-red-200 bg-red-50/10' 
            : eligible 
              ? 'border-slate-200' 
              : 'border-slate-205/60 bg-slate-50/40'
        }`}
      >
        <div>
          {/* Upper row */}
          <div className="flex items-start justify-between mb-4 gap-2">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img 
                  className={`w-12 h-12 rounded-2xl object-cover border border-slate-200 transition duration-300 ${
                    !eligible ? 'filter blur-xs grayscale' : ''
                  }`}
                  src={cand.avatarUrl} 
                  alt={cand.name}
                  referrerPolicy="no-referrer"
                />
                {!eligible && (
                  <div className="absolute inset-0 bg-slate-900/10 flex items-center justify-center rounded-2xl">
                    <Lock className="w-4.5 h-4.5 text-white/90 drop-shadow" />
                  </div>
                )}
              </div>
              <div>
                <h4 className="font-display font-semibold text-sm text-slate-950 leading-tight">
                  {eligible ? cand.name : getMaskedName(cand, cand.calculatedScore)}
                </h4>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  {eligible ? cand.university : '[Masked University]'}
                </p>
              </div>
            </div>

            {/* Matching score */}
            <div className="text-right">
              <span className="text-[9px] text-slate-400 font-mono uppercase block">Score</span>
              <span className={`text-xs font-black font-mono px-1.5 py-0.5 rounded border ${
                isLeast 
                  ? 'text-red-700 bg-red-50 border-red-200' 
                  : cand.calculatedScore >= 80 
                    ? 'text-emerald-700 bg-emerald-50 border-emerald-250' 
                    : 'text-slate-700 bg-slate-50 border-slate-200'
              }`}>
                {cand.calculatedScore}/100
              </span>
            </div>
          </div>

          {/* Eligibility Indicator */}
          <div className="mb-4 flex flex-wrap gap-1.5">
            {eligible ? (
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 font-semibold">
                <Unlock className="w-3 h-3 text-emerald-500" />
                Match Score Eligible
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-205 font-semibold">
                <Lock className="w-3 h-3 text-slate-400" />
                Requires Score &gt;= {matchThreshold}
              </span>
            )}

            {isGroupingEnabled && (
              isLeast ? (
                <span className="inline-flex items-center gap-1 text-[10px] text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-150 font-semibold font-mono uppercase">
                  <AlertTriangle className="w-3 h-3 text-red-500" />
                  Not Suitable
                </span>
              ) : cand.calculatedScore >= 80 ? (
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 font-semibold font-mono uppercase">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  Best Fit
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-150 font-semibold font-mono uppercase">
                  Good Fit
                </span>
              )
            )}
          </div>

          {/* Candidate Skills list */}
          <div className="pt-3 border-t border-slate-100">
            <span className="text-[9px] text-slate-400 font-mono uppercase font-semibold">Verified Competence</span>
            <div className="flex flex-wrap gap-1 mt-2">
              {cand.skills.map((s, i) => {
                // Highlight matching skills in red/emerald if grouping is active
                const matchesJobSkill = selectedJob?.requiredSkills.some(js => js.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(js.toLowerCase()));
                return (
                  <span 
                    key={i} 
                    className={`text-[10px] px-2 py-0.5 rounded-sm transition ${
                      isGroupingEnabled && matchesJobSkill 
                        ? 'bg-emerald-600 text-white font-semibold' 
                        : 'bg-slate-100 text-slate-650'
                    }`}
                  >
                    {s}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Actions footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <button 
            onClick={() => {
              setCandidates(prev => prev.map(c => c.id === cand.id ? { ...c, saved: !c.saved } : c));
              showToast(cand.saved ? `Removed bookmark` : `Saved candidate`);
            }}
            className={`w-8 h-8 rounded-lg border flex items-center justify-center transition shrink-0 cursor-pointer ${
              cand.saved 
                ? 'border-red-200 text-red-600 bg-red-50' 
                : 'border-slate-200 text-slate-450 hover:text-slate-950 hover:bg-slate-50'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${cand.saved ? 'fill-red-600' : ''}`} />
          </button>

          <button 
            onClick={() => onViewCandidate(cand)}
            className={`flex-1 py-2 font-semibold text-xs rounded-lg transition text-center cursor-pointer ${
              isLeast 
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200' 
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
          >
            View CV Profile
          </button>
        </div>
      </div>
    );
  };

  return (
    <div id="recruiter-view-discovery" className="space-y-6 max-w-7xl mx-auto w-full">
      
      {/* Dynamic Sourcing Header and Controls */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest font-semibold block">Academic Match Engine</span>
            <h2 className="font-display font-bold text-2xl text-slate-900 mt-1">Discover Technical Talent</h2>
            <p className="text-slate-500 text-xs mt-1">Configure criteria, match relative to active roles, and invite candidates securely</p>
          </div>

          {/* Subtab selection toggles */}
          <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-205 shrink-0">
            <button 
              onClick={() => setSubTab('discover')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                subTab === 'discover' 
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-205' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              Sourcing Queue
            </button>
            <button 
              onClick={() => setSubTab('history')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                subTab === 'history' 
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-205' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 animate-pulse text-red-500" />
              Coffee Chat History
              {matchedInvites.length > 0 && (
                <span className="bg-red-600 text-white font-mono text-[9px] px-1.5 py-0.2 rounded-full ml-1">
                  {matchedInvites.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Dashboard parameters section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8 pt-6 border-t border-slate-100 items-center">
          
          {/* Match threshold slider */}
          <div className="lg:col-span-6 bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest font-semibold flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-red-500" />
                Coffee Chat Score Threshold
              </span>
              <span className="text-sm font-black font-mono text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">
                {matchThreshold}/100
              </span>
            </div>
            <input 
              type="range" 
              min="50" 
              max="98" 
              value={matchThreshold} 
              onChange={(e) => setMatchThreshold(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-slate-250 rounded-lg appearance-none cursor-pointer accent-red-600 focus:outline-none"
            />
            <p className="text-[10px] text-slate-400 mt-2 font-mono">
              Only candidates with match scores &gt;= {matchThreshold} permit CV checks and invites.
            </p>
          </div>

          {/* Active Manager profile card */}
          <div className="lg:col-span-6 flex justify-between items-center bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 shadow-md">
            <div className="overflow-hidden">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">Outbound Profile</span>
              </div>
              <h4 className="text-xs font-bold text-slate-100 truncate mt-1">{managerProfile.name}</h4>
              <p className="text-[10px] text-red-400 font-mono truncate">{managerProfile.dept}</p>
            </div>
            <button 
              onClick={() => setShowManagerConfigModal(true)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-[10px] font-semibold transition border border-slate-700 cursor-pointer"
            >
              Configure
            </button>
          </div>
        </div>

        {subTab === 'discover' && (
          /* Filters row for discover tab */
          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center">
            {/* Search candidate field */}
            <div className="relative w-full max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search candidates by name or skill parameters..."
                value={discoverySearch}
                onChange={(e) => setDiscoverySearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-205 focus:border-slate-800 rounded-xl text-xs focus:outline-none"
              />
            </div>

            {/* University & Position selectors */}
            <div className="flex flex-wrap gap-2 w-full md:w-auto justify-start md:justify-end">
              <select 
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="px-3.5 py-1.5 bg-white border border-slate-250 rounded-xl text-xs focus:outline-none font-semibold text-slate-700 cursor-pointer flex-1 md:flex-initial"
              >
                <option value="All">All Positions (Default Pool)</option>
                {jobs.map(j => (
                  <option key={j.id} value={j.id}>{j.title}</option>
                ))}
              </select>

              <select 
                value={schoolFilter}
                onChange={(e) => setSchoolFilter(e.target.value)}
                className="px-3.5 py-1.5 bg-white border border-slate-250 rounded-xl text-xs focus:outline-none font-semibold text-slate-700 cursor-pointer flex-1 md:flex-initial"
              >
                <option value="All">All Universities</option>
                <option value="Technische Universität München">TU Munich</option>
                <option value="RWTH Aachen">RWTH Aachen</option>
                <option value="KIT Karlsruhe">KIT Karlsruhe</option>
                <option value="Munich University of Applied Sciences">Munich Applied Sciences</option>
                <option value="Freie Universität Berlin">FU Berlin</option>
                <option value="Technische Universität Stuttgart">TU Stuttgart</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* RENDER DISCOVER QUEUE TAB */}
      {subTab === 'discover' && (
        <div id="discovery-view-content" className="space-y-8">
          {isGroupingEnabled ? (
            /* Grouped View based on Matching Algorithm */
            <div className="space-y-8">
              {/* Category 1: Best Matches */}
              <div>
                <div className="flex items-center gap-2 mb-4 border-b border-slate-200 pb-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <h3 className="font-display font-bold text-sm text-slate-900 uppercase tracking-wider">
                    Best Match Candidates ({bestMatches.length})
                  </h3>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full font-semibold">
                    Highly Suitable (Score &gt;= 80%)
                  </span>
                </div>
                {bestMatches.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortCandidates(bestMatches).map(c => renderCandidateCard(c))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-xs font-mono py-4 text-center border-2 border-dashed border-slate-200/50 rounded-2xl bg-white">
                    No candidates qualify as a Best Match for this position.
                  </p>
                )}
              </div>

              {/* Category 2: Good Matches */}
              <div>
                <div className="flex items-center gap-2 mb-4 border-b border-slate-200 pb-2">
                  <span className="w-3 h-3 rounded-full bg-blue-400" />
                  <h3 className="font-display font-bold text-sm text-slate-900 uppercase tracking-wider">
                    Good Match Candidates ({goodMatches.length})
                  </h3>
                  <span className="text-[10px] font-mono text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full font-semibold">
                    Partially Suitable (Score 60% - 79%)
                  </span>
                </div>
                {goodMatches.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortCandidates(goodMatches).map(c => renderCandidateCard(c))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-xs font-mono py-4 text-center border-2 border-dashed border-slate-200/50 rounded-2xl bg-white">
                    No candidates qualify as a Good Match for this position.
                  </p>
                )}
              </div>

              {/* Category 3: Least Matches / Not Suitable */}
              <div>
                <div className="flex items-center gap-2 mb-4 border-b border-slate-200 pb-2">
                  <span className="w-3 h-3 rounded-full bg-red-400" />
                  <h3 className="font-display font-bold text-sm text-slate-900 uppercase tracking-wider">
                    Least Match / Not Suitable Candidates ({leastMatches.length})
                  </h3>
                  <span className="text-[10px] font-mono text-red-700 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full font-semibold">
                    Low Alignment (Score &lt; 60%)
                  </span>
                </div>
                {leastMatches.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortCandidates(leastMatches).map(c => renderCandidateCard(c))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-xs font-mono py-4 text-center border-2 border-dashed border-slate-200/50 rounded-2xl bg-white">
                    No candidates are flagged as Least Match.
                  </p>
                )}
              </div>
            </div>
          ) : (
            /* Default Flat Pool view sorted by raw engagement score */
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-2">
                <h3 className="font-display font-bold text-sm text-slate-900 uppercase tracking-wider">
                  General Talent Pool ({processedCandidates.length})
                </h3>
                <span className="text-[10px] font-mono text-slate-400">Sorted by engagement score</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {processedCandidates.map(c => renderCandidateCard(c))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* RENDER COFFEE CHAT HISTORY TAB */}
      {subTab === 'history' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
            <div>
              <h3 className="font-display font-semibold text-base text-slate-900">Active Mentorships & Coffee Chats</h3>
              <p className="text-slate-500 text-xs">Access student details with consent authorization and dispatch internship invitations</p>
            </div>
            <span className="text-xs bg-slate-100 text-slate-600 font-mono px-3 py-1 rounded-lg border border-slate-205">
              Matches: {matchedInvites.length}
            </span>
          </div>

          {matchedInvites.length > 0 ? (
            <div className="space-y-4">
              {matchedInvites.map((inv) => {
                const student = candidates.find(c => c.id === inv.candidateId);
                if (!student) return null;

                const shared = inv.studentSharedProfile;

                return (
                  <div 
                    key={inv.id}
                    className="p-5 border border-slate-200 rounded-2xl bg-slate-50/50 hover:bg-white transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <img 
                          className={`w-12 h-12 rounded-xl object-cover border border-slate-200 ${
                            !shared ? 'filter blur-xs grayscale' : ''
                          }`}
                          src={student.avatarUrl} 
                          alt="Student Avatar"
                          referrerPolicy="no-referrer"
                        />
                        {!shared && (
                          <div className="absolute inset-0 bg-slate-900/10 flex items-center justify-center rounded-xl">
                            <Lock className="w-3.5 h-3.5 text-white/90" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-950 leading-tight">
                            {shared ? student.name : getMaskedName(student, student.score)}
                          </h4>
                          <span className="font-mono text-[9px] bg-red-50 text-red-600 px-1.5 py-0.2 rounded border border-red-100">
                            Score {student.score}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          {shared ? student.university : 'Institution: [Obscured pending consent]'}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">Matched on: {inv.timestamp || 'Today'}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Consent indicators */}
                      <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border ${
                        shared 
                          ? 'text-emerald-700 bg-emerald-50 border-emerald-250' 
                          : 'text-amber-700 bg-amber-50 border-amber-255'
                      }`}>
                        {shared ? 'Student CV: Shared' : 'Student CV: Masked'}
                      </span>

                      {/* Toggle recruiter sharing */}
                      <button
                        onClick={() => handleToggleManagerShare(inv.id)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold transition border cursor-pointer ${
                          inv.managerSharedProfile 
                            ? 'bg-slate-900 text-white border-transparent' 
                            : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-205'
                        }`}
                      >
                        {inv.managerSharedProfile ? 'Shared Contact Details' : 'Share Contact Details'}
                      </button>

                      {/* View Modal */}
                      <button 
                        onClick={() => onViewCandidate(student)}
                        className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[10px] font-semibold transition border border-slate-200 cursor-pointer"
                      >
                        Inspect CV
                      </button>

                      {/* Placement Offer button */}
                      <button 
                        onClick={() => handleSendOffer(shared ? student.name : getMaskedName(student, student.score))}
                        className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${
                          shared 
                            ? 'bg-red-600 hover:bg-red-700 text-white shadow shadow-red-500/20' 
                            : 'bg-slate-200 text-slate-450 cursor-not-allowed'
                        }`}
                        disabled={!shared}
                        title={shared ? "Dispatch Internship Offer" : "Waiting for candidate to share their CV"}
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        Intern Offer
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-3xl">
              <ShieldAlert className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <h4 className="font-display font-semibold text-slate-800 text-sm">No Active Matches Yet</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Once a student accepts your coffee chat invite from their portal, sessions and CV details will record here.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Config Manager Profile Modal */}
      <AnimatePresence>
        {showManagerConfigModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 max-w-md w-full shadow-2xl relative"
            >
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-6">
                <div>
                  <h3 className="font-display font-bold text-base text-slate-900">Configure Manager Profile</h3>
                  <p className="text-slate-500 text-[10px] mt-0.5">Define metadata shared with candidates upon match</p>
                </div>
                <button 
                  onClick={() => setShowManagerConfigModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block mb-1 font-mono">Manager Name</label>
                  <input 
                    type="text" 
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 focus:border-red-600 focus:outline-none rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block mb-1 font-mono">Manager Department</label>
                  <input 
                    type="text" 
                    value={editDept}
                    onChange={(e) => setEditDept(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 focus:border-red-600 focus:outline-none rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block mb-1 font-mono">Research Focus Direction</label>
                  <textarea 
                    rows={3}
                    value={editResearch}
                    onChange={(e) => setEditResearch(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 focus:border-red-600 focus:outline-none rounded-xl resize-none"
                  />
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100 flex gap-3">
                <button 
                  onClick={() => setShowManagerConfigModal(false)}
                  className="flex-1 py-2.5 border border-slate-250 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition text-center cursor-pointer"
                >
                  Cancel
                </button>
                
                <button 
                  onClick={() => {
                    setManagerProfile({
                      name: editName,
                      dept: editDept,
                      research: editResearch
                    });
                    showToast("Outbound profile metadata updated successfully!");
                    setShowManagerConfigModal(false);
                  }}
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-850 text-white text-xs font-semibold rounded-lg transition text-center cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
