import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Candidate, CoffeeChatInvite } from '../../types';
import { 
  Search, Bookmark, X, Sliders, Settings, Lock, Unlock, 
  ShieldAlert, Check, Calendar, Mail, FileText, Send, Sparkles, UserCheck, Eye, RefreshCw
} from 'lucide-react';

interface DiscoveryTabProps {
  candidates: Candidate[];
  setCandidates: React.Dispatch<React.SetStateAction<Candidate[]>>;
  showToast: (msg: string) => void;
  invites: CoffeeChatInvite[];
  setInvites: React.Dispatch<React.SetStateAction<CoffeeChatInvite[]>>;
  managerProfile: { name: string; dept: string; research: string };
  setManagerProfile: React.Dispatch<React.SetStateAction<{ name: string; dept: string; research: string }>>;
}

export default function DiscoveryTab({ 
  candidates, 
  setCandidates, 
  showToast,
  invites,
  setInvites,
  managerProfile,
  setManagerProfile
}: DiscoveryTabProps) {
  const [discoverySearch, setDiscoverySearch] = useState('');
  const [schoolFilter, setSchoolFilter] = useState('All');
  const [selectedCandidateForModal, setSelectedCandidateForModal] = useState<Candidate | null>(null);
  
  // New States
  const [subTab, setSubTab] = useState<'discover' | 'history'>('discover');
  const [matchThreshold, setMatchThreshold] = useState<number>(() => {
    const saved = localStorage.getItem('we_connect_match_threshold');
    return saved ? parseInt(saved, 10) : 80;
  });
  const [showManagerConfigModal, setShowManagerConfigModal] = useState(false);
  const [editName, setEditName] = useState(managerProfile.name);
  const [editDept, setEditDept] = useState(managerProfile.dept);
  const [editResearch, setEditResearch] = useState(managerProfile.research);

  const saveThreshold = (val: number) => {
    setMatchThreshold(val);
    localStorage.setItem('we_connect_match_threshold', val.toString());
  };

  const handleSendInvite = (cand: Candidate) => {
    // Check if invite already exists
    const existing = invites.find(inv => inv.candidateId === cand.id);
    if (existing) {
      showToast(`An invite is already ${existing.status} for this candidate.`);
      return;
    }

    const inviteId = `invite_${Date.now()}_${cand.id}`;
    const newInvite: CoffeeChatInvite = {
      id: inviteId,
      candidateId: cand.id,
      managerName: managerProfile.name,
      managerDept: managerProfile.dept,
      managerResearch: managerProfile.research,
      score: cand.score,
      status: 'pending',
      studentSharedProfile: false,
      managerSharedProfile: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setInvites(prev => [...prev, newInvite]);
    showToast(`Coffee Chat Invite dispatched to ${cand.name.split(' ')[0]} (Masked)`);

    // Simulate response for other mock candidates (except Sarah Jenkins, who is controlled by the user)
    if (cand.id !== 'c_sarah_j') {
      setTimeout(() => {
        setInvites(prev => prev.map(inv => {
          if (inv.id === inviteId) {
            showToast(`Match Alert: ${cand.name.split(' ')[0]} accepted your coffee chat!`);
            // Automatically advance candidate stage to 'Interview Scheduled'
            setCandidates(cands => cands.map(c => c.id === cand.id ? { ...c, stage: 'Interview Scheduled' } : c));
            return {
              ...inv,
              status: 'accepted',
              studentSharedProfile: Math.random() > 0.4 // 60% chance to share profile for mock candidates
            };
          }
          return inv;
        }));
      }, 5000);
    }
  };

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
  const getMaskedName = (cand: Candidate) => {
    const initials = cand.name.split(' ').map(n => n[0]).join('');
    return `Candidate #${initials}${cand.score}`;
  };

  const activeInvite = selectedCandidateForModal 
    ? invites.find(inv => inv.candidateId === selectedCandidateForModal.id)
    : null;

  const isProfileShared = activeInvite?.status === 'accepted' && activeInvite.studentSharedProfile;
  const isAnonymized = !isProfileShared;

  // Filter candidates who have accepted matches
  const matchedInvites = invites.filter(inv => inv.status === 'accepted');

  return (
    <div id="recruiter-view-discovery" className="space-y-6 max-w-7xl mx-auto w-full">
      
      {/* Dynamic Sourcing Header and Controls */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest font-semibold block">Academic Match Engine</span>
            <h2 className="font-display font-bold text-2xl text-slate-900 mt-1">Discover Technical Talent</h2>
            <p className="text-slate-500 text-xs mt-1">Configure criteria, mask identities, and initiate coffee chats securely</p>
          </div>

          {/* Subtab selection toggles */}
          <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200 shrink-0">
            <button 
              onClick={() => setSubTab('discover')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                subTab === 'discover' 
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200' 
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
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 animate-pulse text-red-500" />
              Coffee Chat History
              {matchedInvites.length > 0 && (
                <span className="bg-red-600 text-white font-mono text-[9px] px-1.5 py-0.2 rounded-full">
                  {matchedInvites.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Dashboard parameters section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-8 pt-6 border-t border-slate-100 items-center">
          
          {/* Match threshold slider */}
          <div className="md:col-span-6 bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
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
              onChange={(e) => saveThreshold(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-slate-250 rounded-lg appearance-none cursor-pointer accent-red-600 focus:outline-none"
            />
            <p className="text-[10px] text-slate-400 mt-2 font-mono">
              Only candidates with match scores &gt;= {matchThreshold} permit CV checks and invites.
            </p>
          </div>

          {/* Active Manager profile card */}
          <div className="md:col-span-6 flex justify-between items-center bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 shadow-md">
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
                <option value="Munich University of Applied Sciences">Munich Applied Sciences</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* RENDER DISCOVER QUEUE TAB */}
      {subTab === 'discover' && (
        <div id="discovery-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates
            .filter(c => schoolFilter === 'All' || c.university === schoolFilter)
            .filter(c => c.name.toLowerCase().includes(discoverySearch.toLowerCase()) || c.skills.join(' ').toLowerCase().includes(discoverySearch.toLowerCase()))
            .map((cand) => {
              const eligible = cand.score >= matchThreshold;
              const invite = invites.find(inv => inv.candidateId === cand.id);
              
              return (
                <div 
                  key={cand.id}
                  className={`bg-white rounded-3xl border p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between relative overflow-hidden ${
                    eligible ? 'border-slate-200' : 'border-slate-200/50 bg-slate-50/40'
                  }`}
                >
                  <div>
                    {/* Upper row */}
                    <div className="flex items-start justify-between mb-4 gap-2">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img 
                            className={`w-12 h-12 rounded-2xl object-cover border border-slate-200 transition duration-300 ${
                              !eligible ? 'filter blur-sm grayscale' : ''
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
                            {eligible ? cand.name : getMaskedName(cand)}
                          </h4>
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                            {eligible ? cand.university : '[Masked University]'}
                          </p>
                        </div>
                      </div>

                      {/* Matching score */}
                      <div className="text-right">
                        <span className="text-[9px] text-slate-400 font-mono uppercase block">Score</span>
                        <span className="text-xs font-black text-red-600 font-mono bg-red-50/50 px-1.5 py-0.5 rounded border border-red-100/50">{cand.score}/100</span>
                      </div>
                    </div>

                    {/* Eligibility Indicator */}
                    <div className="mb-4">
                      {eligible ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 font-semibold">
                          <Unlock className="w-3 h-3 text-emerald-500" />
                          Match Score Eligible
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-semibold">
                          <Lock className="w-3 h-3 text-slate-400" />
                          Requires Match Score &gt;= {matchThreshold}
                        </span>
                      )}
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
                          : 'border-slate-200 text-slate-400 hover:text-slate-950 hover:bg-slate-50'
                      }`}
                    >
                      <Bookmark className={`w-4 h-4 ${cand.saved ? 'fill-red-600' : ''}`} />
                    </button>

                    <button 
                      onClick={() => setSelectedCandidateForModal(cand)}
                      className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition text-center cursor-pointer"
                    >
                      View CV Profile
                    </button>
                  </div>
                </div>
              );
            })}
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
            <span className="text-xs bg-slate-100 text-slate-600 font-mono px-3 py-1 rounded-lg border border-slate-200">
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
                            {shared ? student.name : getMaskedName(student)}
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
                          : 'text-amber-700 bg-amber-50 border-amber-250'
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
                        onClick={() => setSelectedCandidateForModal(student)}
                        className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[10px] font-semibold transition border border-slate-200 cursor-pointer"
                      >
                        Inspect CV
                      </button>

                      {/* Placement Offer button */}
                      <button 
                        onClick={() => handleSendOffer(shared ? student.name : getMaskedName(student))}
                        className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${
                          shared 
                            ? 'bg-red-600 hover:bg-red-700 text-white shadow shadow-red-500/20' 
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
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

              {/* Data protection banner */}
              {isAnonymized ? (
                <div className="bg-amber-50 border-b border-amber-100 text-amber-800 px-6 py-2.5 flex items-center gap-2 text-[10px] font-semibold font-mono">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
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
                      className={`w-full h-full object-cover transition duration-300 ${
                        isAnonymized ? 'filter blur-md grayscale' : 'grayscale-0'
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
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest block">ENG SCORE</span>
                      <span className="text-red-600 font-sans font-bold text-sm block mt-0.5">{selectedCandidateForModal.score}/100</span>
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
              <div className="p-6 bg-slate-100/50 border-t border-slate-100">
                <span className="text-[9px] text-slate-400 font-mono uppercase tracking-widest block font-semibold">Verified Capstones & Stamps</span>
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {selectedCandidateForModal.skills.map((s, idx) => (
                    <span key={idx} className="bg-white border border-slate-205 text-slate-700 text-xs px-2.5 py-1 rounded-md font-semibold">
                      {s}
                    </span>
                  ))}
                </div>
                
                {/* Invitation / Offer Dispatch button */}
                <div className="mt-6 flex flex-col gap-3">
                  {selectedCandidateForModal.score >= matchThreshold ? (
                    <div>
                      {!activeInvite ? (
                        <button 
                          onClick={() => {
                            handleSendInvite(selectedCandidateForModal);
                            setSelectedCandidateForModal(null);
                          }}
                          className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-xl transition text-center cursor-pointer flex items-center justify-center gap-1.5 shadow shadow-red-500/20"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Invite to Coffee Chat
                        </button>
                      ) : activeInvite.status === 'pending' ? (
                        <button 
                          disabled
                          className="w-full py-2.5 bg-slate-200 text-slate-500 font-semibold text-xs rounded-xl text-center cursor-not-allowed"
                        >
                          Invite Sent (Pending Student Response)
                        </button>
                      ) : activeInvite.status === 'accepted' ? (
                        <div className="space-y-2">
                          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-[11px] text-emerald-800 font-mono flex items-center gap-2">
                            <Check className="w-4 h-4 text-emerald-500" />
                            <span>Connected & Match Active</span>
                          </div>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleToggleManagerShare(activeInvite.id)}
                              className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                                activeInvite.managerSharedProfile 
                                  ? 'bg-slate-900 text-white border-transparent' 
                                  : 'bg-white text-slate-700 border-slate-250 hover:bg-slate-50'
                              }`}
                            >
                              {activeInvite.managerSharedProfile ? 'Revoke Profile Share' : 'Share Contact Details'}
                            </button>

                            <button 
                              onClick={() => {
                                handleSendOffer(isProfileShared ? selectedCandidateForModal.name : getMaskedName(selectedCandidateForModal));
                                setSelectedCandidateForModal(null);
                              }}
                              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                                isProfileShared 
                                  ? 'bg-red-600 hover:bg-red-700 text-white shadow shadow-red-500/20' 
                                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                              }`}
                              disabled={!isProfileShared}
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              Send Intern Offer
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-slate-100 p-3 rounded-xl text-center text-xs font-semibold text-slate-500">
                          Invite Declined by Student
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-slate-100 p-3.5 rounded-2xl flex items-center gap-2 border border-slate-200 text-slate-500">
                      <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="text-[11px] font-mono leading-tight">
                        Locked: Candidate match score ({selectedCandidateForModal.score}) must exceed the threshold ({matchThreshold}) to enable coffee chat invitations.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
