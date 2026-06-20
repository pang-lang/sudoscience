import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Candidate, CoffeeChatInvite } from '../../types';
import {
  Coffee, Star, Briefcase, Lock, Unlock, Send, Check, ShieldAlert,
  UserCheck, Search, Sparkles, ChevronDown, ChevronUp, RefreshCw, Database, MessageSquare
} from 'lucide-react';
import { db, UnifiedJob } from '../../utils/db';
import { supabase } from '../../lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

interface EmployeeProfile {
  name: string;
  dept: string;
  skills: string[];
  research: string;
}

interface CoffeeChatTabProps {
  candidates: Candidate[];
  invites: CoffeeChatInvite[];
  setInvites: React.Dispatch<React.SetStateAction<CoffeeChatInvite[]>>;
  setCandidates: React.Dispatch<React.SetStateAction<Candidate[]>>;
  managerProfile: EmployeeProfile;
  matchThreshold: number;
  setMatchThreshold: (val: number) => void;
  showToast: (msg: string) => void;
  onViewCandidate: (cand: Candidate) => void;
}

// ─── Matching algorithm ───────────────────────────────────────────────────────
//
// How the coffee chat score is computed:
//   1. The WE employee's skills[] and research text are tokenised into keywords.
//   2. Those keywords are compared against the student's skills[] list.
//   3. The "coverage" is: (# of matched keywords) / (total employee keywords) × 100.
//   4. That is blended with the student's general engagement score (30% weight),
//      so a highly engaged student gets a small bonus even on partial skill overlap.
//   5. A floor of 20% is applied so no candidate scores 0.
//
// The candidates themselves come from Supabase (loaded in RecruiterPortal).
// Invites are persisted to the `coffee_chat_invites` Supabase table when possible,
// with a localStorage fallback if the table doesn't exist yet.

// ─── Match scorer ─────────────────────────────────────────────────────────────

/**
 * Scores a student candidate against a WE employee's own profile.
 *
 * HOW IT WORKS:
 *   1. Both the employee's skills and the student's skills are split into
 *      individual words (so "Embedded Systems" → ["embedded", "systems"] and
 *      "Embedded C" → ["embedded", "c"]). This avoids phrase-level mismatches.
 *   2. The employee's research description is also tokenised into words.
 *   3. Word-level overlap is counted and expressed as a 0-100 skill score.
 *   4. That is blended 50/50 with the student's general engagement score
 *      so a high-performing student always scores respectably even on partial overlap.
 *   5. A floor of 35 is applied — nobody is truly irrelevant.
 */
function scoreStudentForEmployee(
  candidate: Candidate,
  employee: EmployeeProfile
): { score: number; matchedOn: string[] } {
  // Build word-level set from employee (skills + research)
  const empWords = new Set([
    ...employee.skills.flatMap(s => s.toLowerCase().split(/[\s\-\/]+/)),
    ...employee.research.toLowerCase().split(/[\s,;/&\-]+/).filter(t => t.length > 3)
  ]);

  // Remove very generic stopwords so they don't inflate scores
  const stopWords = new Set(['and', 'the', 'for', 'with', 'from', 'that', 'this', 'are', 'was']);
  empWords.forEach(w => { if (stopWords.has(w) || w.length <= 2) empWords.delete(w); });

  // Build word-level set from student skills
  const studentWords = new Set(
    candidate.skills.flatMap(s => s.toLowerCase().split(/[\s\-\/]+/))
  );

  // Find intersecting words
  const matchedWords = [...empWords].filter(ew => studentWords.has(ew));
  const uniqueMatched = [...new Set(matchedWords)];

  // Coverage: how many of the employee's skill-words appear in the student's skills?
  const coverageScore = (uniqueMatched.length / Math.max(empWords.size, 1)) * 100;

  // Blend 50% skill-coverage + 50% student engagement score
  const finalScore = Math.min(
    Math.round(coverageScore * 0.5 + candidate.score * 0.5),
    100
  );

  // Reconstruct display labels (map matched words back to original skill phrases)
  const displayLabels = employee.skills
    .filter(s => s.toLowerCase().split(/[\s\-\/]+/).some(w => uniqueMatched.includes(w)))
    .slice(0, 3);

  return {
    score: Math.max(finalScore, 35),
    matchedOn: displayLabels.length > 0
      ? displayLabels
      : uniqueMatched.slice(0, 3).map(t => t.charAt(0).toUpperCase() + t.slice(1))
  };
}

// ─── Score badge helper ───────────────────────────────────────────────────────

function ScoreBadge({ score }: { score: number }) {
  const cls =
    score >= 75
      ? 'bg-red-50 text-red-700 border-red-200'
      : score >= 50
      ? 'bg-slate-950 text-slate-100 border-slate-900'
      : 'bg-slate-100 text-slate-500 border-slate-200';
  return (
    <span className={`text-[10px] font-black font-mono px-2 py-0.5 rounded-lg border ${cls}`}>
      {score}%
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CoffeeChatTab({
  candidates,
  invites,
  setInvites,
  setCandidates,
  managerProfile,
  matchThreshold,
  setMatchThreshold,
  showToast,
  onViewCandidate
}: CoffeeChatTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [subTab, setSubTab] = useState<'matches' | 'sent'>('matches');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [dbStatus, setDbStatus] = useState<'ok' | 'local' | 'checking'>('checking');
  const [openChatInviteId, setOpenChatInviteId] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState('');

  const handleSendChatMessage = (inviteId: string) => {
    if (!chatMessage.trim()) return;
    setInvites(prev => prev.map(inv => {
      if (inv.id === inviteId) {
        const newMsg = {
          sender: 'employee' as const,
          text: chatMessage.trim(),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        const updatedInvite = { ...inv, messages: [...(inv.messages || []), newMsg] };

        // Synchronize message update to Supabase coffee_chat_invites
        supabase.from('coffee_chat_invites').update({
          messages: updatedInvite.messages
        }).eq('id', inviteId).then(() => {});

        return updatedInvite;
      }
      return inv;
    }));
    setChatMessage('');
    showToast('Message sent');
  };

  // ── Load invites from Supabase on mount ──────────────────────────────────
  useEffect(() => {
    async function loadInvites() {
      try {
        const { data, error } = await supabase
          .from('coffee_chat_invites')
          .select('*')
          .eq('manager_name', managerProfile.name)
          .order('created_at', { ascending: false });

        if (error) {
          // Table likely doesn't exist yet — use localStorage fallback
          setDbStatus('local');
          return;
        }

        if (data && data.length > 0) {
          // Map Supabase rows to CoffeeChatInvite shape
          const mapped: CoffeeChatInvite[] = data.map((row: any) => ({
            id: row.id,
            candidateId: row.candidate_id,
            managerName: row.manager_name,
            managerDept: row.manager_dept,
            managerResearch: row.manager_research,
            score: row.score,
            status: row.status,
            studentSharedProfile: row.student_shared_profile ?? false,
            managerSharedProfile: row.manager_shared_profile ?? false,
            timestamp: row.created_at
              ? new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : 'Today'
          }));
          // Merge with existing local invites (avoid duplicates)
          setInvites(prev => {
            const existingIds = new Set(prev.map(i => i.id));
            const newOnes = mapped.filter(m => !existingIds.has(m.id));
            return [...newOnes, ...prev];
          });
        }
        setDbStatus('ok');
      } catch {
        setDbStatus('local');
      }
    }
    loadInvites();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [managerProfile.name]);

  // ── Compute ranked candidate list ─────────────────────────────────────────

  const rankedCandidates = candidates
    .map(c => {
      const { score, matchedOn } = scoreStudentForEmployee(c, managerProfile);
      return { ...c, coffeeScore: score, matchedOn };
    })
    .filter(c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.skills.join(' ').toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => b.coffeeScore - a.coffeeScore);

  const eligible = rankedCandidates.filter(c => c.coffeeScore >= matchThreshold);
  const belowThreshold = rankedCandidates.filter(c => c.coffeeScore < matchThreshold);

  // ── Invite helpers ────────────────────────────────────────────────────────

  const handleSendInvite = async (cand: typeof rankedCandidates[0]) => {
    const existing = invites.find(inv => inv.candidateId === cand.id);
    if (existing) {
      showToast(`An invite is already ${existing.status} for this candidate.`);
      return;
    }

    const inviteId = `coffee_${Date.now()}_${cand.id}`;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newInvite: CoffeeChatInvite = {
      id: inviteId,
      candidateId: cand.id,
      managerName: managerProfile.name,
      managerDept: managerProfile.dept,
      managerResearch: managerProfile.research,
      score: cand.coffeeScore,
      status: 'pending',
      studentSharedProfile: true,
      managerSharedProfile: false,
      timestamp: now
    };

    // 1. Update local state immediately (optimistic)
    setInvites(prev => [...prev, newInvite]);
    showToast(`☕ Coffee chat invite sent to ${cand.name.split(' ')[0]}!`);

    // 2. Persist to Supabase (best-effort — silent fail)
    try {
      await supabase.from('coffee_chat_invites').insert({
        id: inviteId,
        candidate_id: cand.id,
        manager_name: managerProfile.name,
        manager_dept: managerProfile.dept,
        manager_research: managerProfile.research,
        score: cand.coffeeScore,
        status: 'pending',
        student_shared_profile: true,
        manager_shared_profile: false
      });
    } catch {
      // Table may not exist yet — localStorage sync in RecruiterPortal handles persistence
    }

    // 3. Simulate acceptance for non-demo students after 5s
    if (cand.id !== 'c_sarah_j') {
      setTimeout(async () => {
        setInvites(prev => prev.map(inv => {
          if (inv.id === inviteId) {
            showToast(`✅ ${cand.name.split(' ')[0]} accepted your coffee chat!`);
            setCandidates(cs => {
              const next = cs.map(c => c.id === cand.id ? { ...c, stage: 'Interview Scheduled' as const } : c);
              db.saveCandidates(next);
              return next;
            });
            return { ...inv, status: 'accepted' as const, studentSharedProfile: true };
          }
          return inv;
        }));

        // Update status in Supabase too
        try {
          await supabase
            .from('coffee_chat_invites')
            .update({ status: 'accepted', student_shared_profile: true })
            .eq('id', inviteId);
        } catch { /* silent */ }
      }, 5000);
    }
  };

  const sentInvites = invites.filter(inv => inv.status !== 'rejected');
  const acceptedInvites = invites.filter(inv => inv.status === 'accepted');


  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div id="recruiter-coffee-chat-tab" className="space-y-6 max-w-7xl mx-auto w-full">

      {/* Header card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-[10px] text-red-600 font-mono uppercase tracking-widest font-semibold block">
              Employee-Profile Match Engine
            </span>
            <div className="flex items-center gap-2 mt-1">
              <h2 className="font-display font-bold text-2xl text-slate-900">Coffee Chat Matching</h2>
            </div>
            <p className="text-slate-500 text-xs mt-1">
              Students ranked by how well their skills &amp; projects align with <strong>{managerProfile.name}</strong>'s expertise in{' '}
              <em>{managerProfile.research}</em>.
            </p>
          </div>

          {/* Sub-tab toggle */}
          <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200 shrink-0">
            <button
              onClick={() => setSubTab('matches')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                subTab === 'matches'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Star className="w-3.5 h-3.5 text-red-600" />
              Candidate Matches
            </button>
            <button
              onClick={() => setSubTab('sent')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                subTab === 'sent'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Coffee className="w-3.5 h-3.5 text-red-650" />
              My Connections
              {sentInvites.length > 0 && (
                <span className="bg-red-600 text-white font-mono text-[9px] px-1.5 rounded-full">
                  {sentInvites.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Employee profile pill + threshold */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6 pt-5 border-t border-slate-100">

          {/* Employee profile summary */}
          <div className="bg-slate-900 rounded-2xl p-4 flex items-start gap-3 border border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-400/30 flex items-center justify-center shrink-0">
              <Briefcase className="w-5 h-5 text-red-500" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block">Matching as</span>
              <h4 className="text-xs font-bold text-white truncate mt-0.5">{managerProfile.name}</h4>
              <p className="text-[10px] text-red-400 font-mono truncate">{managerProfile.dept}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {managerProfile.skills.slice(0, 4).map((s, i) => (
                  <span key={i} className="text-[8px] bg-slate-800 text-slate-300 border border-slate-700 px-1.5 py-0.5 rounded font-mono">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Match threshold */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest font-semibold">
                Mentor Match Threshold
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                  Recommended: 30
                </span>
                <span className="text-sm font-black font-mono text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                  {matchThreshold}/100
                </span>
              </div>
            </div>
            <input
              type="range"
              min="20"
              max="70"
              value={matchThreshold}
              onChange={(e) => setMatchThreshold(parseInt(e.target.value, 10))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-600"
            />
            <p className="text-[10px] text-slate-400 mt-2 font-mono">
              Coffee chat is about broad fit — lower thresholds show more potential mentoring matches.
            </p>
          </div>
        </div>

        {/* Search bar */}
        {subTab === 'matches' && (
          <div className="mt-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search candidates by name or skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-red-400"
            />
          </div>
        )}
      </div>

      {/* ── MATCHES TAB ─────────────────────────────────────────────────────── */}
      {subTab === 'matches' && (
        <div className="space-y-8">

          {/* Eligible candidates */}
          <div>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200">
              <span className="w-3 h-3 rounded-full bg-red-600 animate-pulse" />
              <h3 className="font-display font-bold text-sm text-slate-900 uppercase tracking-wider">
                Eligible for Coffee Chat ({eligible.length})
              </h3>
              <span className="text-[10px] font-mono text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full font-semibold">
                Score ≥ {matchThreshold}%
              </span>
            </div>

            {eligible.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {eligible.map(cand => {
                  const invite = invites.find(inv => inv.candidateId === cand.id);
                  const isExpanded = expandedId === cand.id;

                  return (
                    <div
                      key={cand.id}
                      className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col overflow-hidden"
                    >
                      {/* Red top accent */}
                      <div className="h-1 bg-gradient-to-r from-red-600 to-slate-900" />

                      <div className="p-5 flex-1 flex flex-col gap-3">
                        {/* Header row */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <img
                              className="w-11 h-11 rounded-2xl object-cover border border-slate-200"
                              src={cand.avatarUrl}
                              alt={cand.name}
                              referrerPolicy="no-referrer"
                            />
                            <div className="min-w-0">
                              <h4 className="font-display font-semibold text-sm text-slate-950 leading-tight truncate">
                                {cand.name}
                              </h4>
                              <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5">{cand.university}</p>
                            </div>
                          </div>
                          <ScoreBadge score={cand.coffeeScore} />
                        </div>

                        {/* Match reason */}
                        {cand.matchedOn.length > 0 && (
                          <div className="bg-red-50 border border-red-100 rounded-xl p-2.5 flex items-start gap-2">
                            <Sparkles className="w-3 h-3 text-red-500 mt-0.5 shrink-0" />
                            <div>
                              <span className="text-[9px] font-mono text-red-600 uppercase tracking-wider font-bold block mb-0.5">
                                Why they match you
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {cand.matchedOn.map((term, i) => (
                                  <span key={i} className="text-[9px] bg-white border border-red-200 text-red-800 font-bold px-1.5 py-0.5 rounded-full">
                                    {term}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Skills (expandable) */}
                        <div>
                          <div className="flex flex-wrap gap-1">
                            {(isExpanded ? cand.skills : cand.skills.slice(0, 3)).map((s, i) => (
                              <span key={i} className="bg-slate-100 text-slate-600 text-[9px] px-2 py-0.5 rounded-sm font-semibold">
                                {s}
                              </span>
                            ))}
                            {cand.skills.length > 3 && (
                              <button
                                onClick={() => setExpandedId(isExpanded ? null : cand.id)}
                                className="text-[9px] text-slate-400 hover:text-slate-600 flex items-center gap-0.5 cursor-pointer"
                              >
                                {isExpanded ? <><ChevronUp className="w-3 h-3" /> less</> : <><ChevronDown className="w-3 h-3" /> +{cand.skills.length - 3}</>}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Current Project */}
                        {cand.projects && cand.projects.length > 0 && (
                          <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 mt-1">
                            <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest font-semibold block mb-1">Current Project</span>
                            <p className="text-[10px] font-bold text-slate-800 leading-tight">{cand.projects[0].title}</p>
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {cand.projects[0].tech.slice(0, 4).map((t, ti) => (
                                <span key={ti} className="text-[8px] bg-white text-slate-500 px-1.5 py-0.5 rounded font-mono border border-slate-200">
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center gap-2">
                          <button
                            onClick={() => onViewCandidate(cand)}
                            className="flex-1 py-2 text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer border border-slate-200"
                          >
                            View Profile
                          </button>

                          {!invite ? (
                            <button
                              onClick={() => handleSendInvite(cand)}
                              className="flex-1 py-2 text-[10px] font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl transition cursor-pointer flex items-center justify-center gap-1 shadow shadow-red-500/30"
                            >
                              <Send className="w-3 h-3" />
                              Invite
                            </button>
                          ) : invite.status === 'pending' ? (
                            <span className="flex-1 py-2 text-center text-[10px] font-semibold bg-slate-100 text-slate-500 rounded-xl border border-slate-200 cursor-not-allowed">
                              Pending...
                            </span>
                          ) : invite.status === 'accepted' ? (
                            <span className="flex-1 py-2 text-center text-[10px] font-bold bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 flex items-center justify-center gap-1">
                              <Check className="w-3 h-3" /> Accepted
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-white">
                <Coffee className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <h4 className="font-display font-semibold text-slate-800 text-sm">No eligible candidates</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Try lowering the score threshold or updating your profile's skills to match more students.
                </p>
              </div>
            )}
          </div>

          {/* Below threshold section (collapsed) */}
          {belowThreshold.length > 0 && (
            <div className="opacity-60">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200">
                <span className="w-3 h-3 rounded-full bg-slate-300" />
                <h3 className="font-display font-bold text-sm text-slate-700 uppercase tracking-wider">
                  Below Threshold ({belowThreshold.length})
                </h3>
                <span className="text-[10px] font-mono text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full font-semibold">
                  Score &lt; {matchThreshold}%
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {belowThreshold.map(cand => (
                  <div key={cand.id} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3 opacity-70">
                    <img className="w-10 h-10 rounded-xl object-cover border border-slate-200 grayscale" src={cand.avatarUrl} alt={cand.name} referrerPolicy="no-referrer" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-slate-700 truncate">{cand.name}</h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">{cand.university}</p>
                    </div>
                    <ScoreBadge score={cand.coffeeScore} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── MY CONNECTIONS TAB ─────────────────────────────────────────────────── */}
      {subTab === 'sent' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
            <div>
              <h3 className="font-display font-semibold text-base text-slate-900">My Connections</h3>
              <p className="text-slate-500 text-xs mt-0.5">Initiated by {managerProfile.name} · {sentInvites.length} total</p>
            </div>
            <span className="text-xs bg-red-50 text-red-700 border border-red-200 font-mono font-semibold px-3 py-1 rounded-lg">
              {acceptedInvites.length} Accepted
            </span>
          </div>

          {sentInvites.length > 0 ? (
            <div className="space-y-4">
              {sentInvites.map(inv => {
                const student = candidates.find(c => c.id === inv.candidateId);
                if (!student) return null;
                const shared = true; // Always unmasked per requirements

                return (
                  <div key={inv.id} className="border border-slate-200 rounded-2xl bg-slate-50/50 hover:bg-white transition overflow-hidden">
                    <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <img
                            className={`w-12 h-12 rounded-xl object-cover border border-slate-200 ${!shared ? 'filter blur-xs grayscale' : ''}`}
                            src={student.avatarUrl}
                            alt="Student"
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
                              {shared ? student.name : `Student #${student.score}`}
                            </h4>
                            <ScoreBadge score={inv.score} />
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {shared ? student.university : 'Institution masked'}
                          </p>
                          <p className="text-[9px] text-slate-400 font-mono mt-0.5">Sent: {inv.timestamp}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border ${
                          inv.status === 'accepted'
                            ? 'text-red-700 bg-red-50 border-red-200'
                            : 'text-slate-700 bg-slate-50 border-slate-200'
                        }`}>
                          {inv.status === 'accepted' ? '✓ Accepted' : '⏳ Pending'}
                        </span>

                        {inv.status === 'accepted' && (
                          <>
                            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-lg border text-slate-950 bg-slate-50 border-slate-200">
                              CV Shared
                            </span>

                            <button
                              onClick={() => onViewCandidate(student)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-semibold border border-slate-200 cursor-pointer transition"
                            >
                              View CV
                            </button>

                            <button
                              onClick={() => setOpenChatInviteId(openChatInviteId === inv.id ? null : inv.id)}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold border transition cursor-pointer flex items-center gap-1.5 ${
                                openChatInviteId === inv.id
                                  ? 'bg-slate-900 text-white border-transparent'
                                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              <MessageSquare className="w-3 h-3" />
                              {openChatInviteId === inv.id ? 'Close Chat' : 'Chat'}
                            </button>

                            <button
                              onClick={() => showToast(`Internship offer sent to ${student.name}!`)}
                              className="px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition bg-red-600 hover:bg-red-700 text-white shadow shadow-red-500/20"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              Intern Offer
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Chat Panel */}
                    {inv.status === 'accepted' && openChatInviteId === inv.id && (
                      <div className="border-t border-slate-200 bg-white p-4 space-y-3">
                        <div className="bg-slate-900 -mx-4 -mt-4 px-4 py-2 flex items-center gap-2 mb-2">
                          <MessageSquare className="w-3.5 h-3.5 text-red-500" />
                          <span className="text-[10px] text-white font-mono font-semibold uppercase tracking-wider">
                            Chat with {student.name}
                          </span>
                        </div>
                        <div className="max-h-48 overflow-y-auto space-y-2 p-1">
                          {(inv.messages && inv.messages.length > 0) ? (
                            inv.messages.map((msg, mi) => (
                              <div key={mi} className={`flex ${msg.sender === 'employee' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[75%] px-3 py-1.5 rounded-lg text-xs ${
                                  msg.sender === 'employee'
                                    ? 'bg-slate-900 text-white rounded-tr-none shadow shadow-slate-900/10'
                                    : 'bg-slate-100 text-slate-700 border border-slate-200 rounded-tl-none'
                                }`}>
                                  <p>{msg.text}</p>
                                  <span className={`text-[8px] block mt-1 text-right ${
                                    msg.sender === 'employee' ? 'text-slate-400' : 'text-slate-450'
                                  }`}>{msg.timestamp}</span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-slate-400 text-center py-4 font-mono">No messages yet. Start the conversation!</p>
                          )}
                        </div>
                        <div className="flex gap-2 pt-2 border-t border-slate-100">
                          <input
                            type="text"
                            value={chatMessage}
                            onChange={(e) => setChatMessage(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleSendChatMessage(inv.id); }}
                            placeholder="Type a message..."
                            className="flex-1 text-xs px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-800 transition"
                          />
                          <button
                            onClick={() => handleSendChatMessage(inv.id)}
                            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
                          >
                            Send
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-3xl">
              <Coffee className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="font-display font-semibold text-slate-700 text-sm">No connections established yet</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Go to <strong>Candidate Matches</strong> and invite a student to connect!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
