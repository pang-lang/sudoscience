import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Candidate,
  PostedOpportunity,
  CoffeeChatInvite
} from '../../types';
import {
  Briefcase, Search, BarChart3, Users, Sparkles, X, Lock, Unlock, ShieldAlert, Check, Send, UserCheck
} from 'lucide-react';
import { db } from '../../utils/db';

import DashboardTab from './DashboardTab';
import DiscoveryTab from './DiscoveryTab';
import PipelineTab from './PipelineTab';
import OpportunitiesTab from './OpportunitiesTab';

interface RecruiterPortalProps {
  onLogout: () => void;
}

export default function RecruiterPortal({ onLogout }: RecruiterPortalProps) {
  // ---- DATA ENGINE INITIALIZATION FROM UNIFIED DB ----

  // Candidates State loaded from unified DB
  const [candidates, setCandidates] = useState<Candidate[]>(() => {
    return db.getCandidates();
  });

  // Coffee Chat Invites state with LocalStorage sync
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

  // Manager Profile settings
  const [managerProfile, setManagerProfile] = useState<{ name: string, dept: string, research: string }>(() => {
    const saved = localStorage.getItem('we_connect_manager_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return {
      name: 'Dr. Thomas Wey',
      dept: 'R&D Systems & EMC',
      research: 'Low-Power RFID Tag Sensors & Passive Wireless Power'
    };
  });

  // Sync state modifications to localStorage
  useEffect(() => {
    db.saveCandidates(candidates);
  }, [candidates]);

  useEffect(() => {
    localStorage.setItem('we_connect_chat_invites', JSON.stringify(invites));
  }, [invites]);

  useEffect(() => {
    localStorage.setItem('we_connect_manager_profile', JSON.stringify(managerProfile));
  }, [managerProfile]);

  // Posted Job Postings loaded from DB
  const [postings, setPostings] = useState<PostedOpportunity[]>(() => {
    return db.getRecruiterPostings();
  });

  // Global CV Modal State
  const [selectedCandidateForModal, setSelectedCandidateForModal] = useState<Candidate | null>(null);

  // Match threshold state lifted
  const [matchThreshold, setMatchThreshold] = useState<number>(() => {
    const saved = localStorage.getItem('we_connect_match_threshold');
    return saved ? parseInt(saved, 10) : 80;
  });

  const saveThreshold = (val: number) => {
    setMatchThreshold(val);
    localStorage.setItem('we_connect_match_threshold', val.toString());
  };

  // Window navigation
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'discovery' | 'pipeline' | 'opportunities'>('dashboard');

  // Custom alert feedback
  const [toast, setToast] = useState<string | null>(null);

  // Trigger Toast helper
  const showToast = (txt: string) => {
    setToast(txt);
    setTimeout(() => setToast(null), 3000);
  };

  // Interceptor for setPostings to sync additions/deletions with DB
  const handleSetPostings: React.Dispatch<React.SetStateAction<PostedOpportunity[]>> = (value) => {
    setPostings(prev => {
      const next = typeof value === 'function' ? value(prev) : value;
      // Find additions
      next.forEach(p => {
        const exists = prev.some(old => old.id === p.id);
        if (!exists) {
          // Map to unified job creation
          let skills = ['Project Management'];
          const lowerTitle = p.title.toLowerCase();
          if (lowerTitle.includes('power') || lowerTitle.includes('energy') || lowerTitle.includes('voltage') || lowerTitle.includes('choke') || lowerTitle.includes('inductor')) {
            skills = ['Power Electronics', 'Simulink', 'CAD', 'PCB Design'];
          } else if (lowerTitle.includes('rf') || lowerTitle.includes('shielding') || lowerTitle.includes('electromagnetic') || lowerTitle.includes('sensor') || lowerTitle.includes('iot') || lowerTitle.includes('radio')) {
            skills = ['Embedded C', 'PCB Design', 'RFID Systems', 'BLE', 'SolidWorks'];
          } else if (lowerTitle.includes('robot') || lowerTitle.includes('automation') || lowerTitle.includes('mechanical') || lowerTitle.includes('hardware')) {
            skills = ['SolidWorks Pro', 'FEA Modeling', 'CAD', 'C++'];
          } else if (lowerTitle.includes('data') || lowerTitle.includes('analyst') || lowerTitle.includes('learning') || lowerTitle.includes('python') || lowerTitle.includes('ml') || lowerTitle.includes('ai')) {
            skills = ['Python', 'TensorFlow', 'Data Analysis', 'Matlab'];
          } else if (lowerTitle.includes('software') || lowerTitle.includes('web') || lowerTitle.includes('app') || lowerTitle.includes('fullstack') || lowerTitle.includes('developer')) {
            skills = ['C++', 'Python', 'React Native', 'Embedded C', 'Data Analysis'];
          }

          db.addOpportunity(p.title, p.type, p.deadline, skills, `Join us as a ${p.title}. Lead hardware layouts and systems integration research.`);
        }
      });

      // Find deletions
      prev.forEach(p => {
        const exists = next.some(n => n.id === p.id);
        if (!exists) {
          db.deleteOpportunity(p.id);
        }
      });

      return db.getRecruiterPostings();
    });
  };

  // Interceptor for setCandidates to sync edits with DB
  const handleSetCandidates: React.Dispatch<React.SetStateAction<Candidate[]>> = (value) => {
    setCandidates(prev => {
      const next = typeof value === 'function' ? value(prev) : value;
      db.saveCandidates(next);
      return next;
    });
  };

  // Stage transition callback
  const transitionCandidateStage = (id: string, dir: 'next' | 'prev') => {
    const stages: Array<Candidate['stage']> = ['Talent Pool', 'Saved', 'Recruiter Review', 'Interview Scheduled'];
    setCandidates(prev => {
      const next = prev.map(c => {
        if (c.id === id) {
          const curIdx = stages.indexOf(c.stage);
          let nextIdx = curIdx + (dir === 'next' ? 1 : -1);
          if (nextIdx >= 0 && nextIdx < stages.length) {
            showToast(`Advanced ${c.name} to "${stages[nextIdx]}"`);
            return { ...c, stage: stages[nextIdx] };
          }
        }
        return c;
      });
      db.saveCandidates(next);
      return next;
    });
  };

  // --- CANDIDATE MODAL HELPERS ---
  const handleSendInvite = (cand: Candidate) => {
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

    if (cand.id !== 'c_sarah_j') {
      setTimeout(() => {
        setInvites(prev => prev.map(inv => {
          if (inv.id === inviteId) {
            showToast(`Match Alert: ${cand.name.split(' ')[0]} accepted your coffee chat!`);
            setCandidates(cands => {
              const next = cands.map(c => c.id === cand.id ? { ...c, stage: 'Interview Scheduled' as const } : c);
              db.saveCandidates(next);
              return next;
            });
            return {
              ...inv,
              status: 'accepted' as const,
              studentSharedProfile: Math.random() > 0.4
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
        showToast(nextState ? "Shared contact details with candidate" : "Revoked contact details sharing");
        return { ...inv, managerSharedProfile: nextState };
      }
      return inv;
    }));
  };

  const handleSendOffer = (candName: string) => {
    showToast(`Internship Placement Offer dispatched to ${candName}!`);
  };

  const getMaskedName = (cand: Candidate) => {
    const initials = cand.name.split(' ').map(n => n[0]).join('');
    return `Candidate #${initials}${cand.score}`;
  };

  const activeInvite = selectedCandidateForModal 
    ? invites.find(inv => inv.candidateId === selectedCandidateForModal.id)
    : null;

  const isProfileShared = activeInvite?.status === 'accepted' && activeInvite.studentSharedProfile;
  const isAnonymized = !isProfileShared;

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
            className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-medium flex items-center justify-between transition cursor-pointer ${currentTab === 'dashboard' ? 'bg-slate-800 text-white border-l-4 border-red-600' : 'hover:bg-slate-900 hover:text-white'
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
            className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-medium flex items-center justify-between transition cursor-pointer ${currentTab === 'discovery' ? 'bg-slate-800 text-white border-l-4 border-red-600' : 'hover:bg-slate-900 hover:text-white'
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
            className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-medium flex items-center justify-between transition cursor-pointer ${currentTab === 'pipeline' ? 'bg-slate-800 text-white border-l-4 border-red-600' : 'hover:bg-slate-900 hover:text-white'
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
            className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-medium flex items-center justify-between transition cursor-pointer ${currentTab === 'opportunities' ? 'bg-slate-800 text-white border-l-4 border-red-600' : 'hover:bg-slate-900 hover:text-white'
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
            <DashboardTab 
              candidates={candidates}
              invites={invites}
              onViewCandidate={(cand) => setSelectedCandidateForModal(cand)}
            />
          )}

          {currentTab === 'discovery' && (
            <DiscoveryTab
              candidates={candidates}
              setCandidates={handleSetCandidates}
              showToast={showToast}
              invites={invites}
              setInvites={setInvites}
              managerProfile={managerProfile}
              setManagerProfile={setManagerProfile}
              onViewCandidate={(cand) => setSelectedCandidateForModal(cand)}
              matchThreshold={matchThreshold}
              setMatchThreshold={saveThreshold}
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
              setPostings={handleSetPostings}
              showToast={showToast}
            />
          )}
        </div>
      </main>

      {/* --- GLOBAL CANDIDATE PASSPORT MODAL --- */}
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
                        isAnonymized ? 'filter blur-md grayscale blur-xs' : 'grayscale-0'
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

    </div>
  );
}
