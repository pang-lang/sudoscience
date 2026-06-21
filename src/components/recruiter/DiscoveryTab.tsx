import React, { useState, useEffect } from 'react';
import { Candidate, CoffeeChatInvite } from '../../types';
import {
  Search, Bookmark, Sparkles, AlertTriangle, Lock, Coffee, Check, UserCheck, Briefcase, ShieldAlert
} from 'lucide-react';
import { db } from '../../utils/db';
import { supabase } from '../../lib/supabase';

interface DiscoveryTabProps {
  candidates: Candidate[];
  setCandidates: React.Dispatch<React.SetStateAction<Candidate[]>>;
  showToast: (msg: string) => void;
  onViewCandidate: (cand: Candidate) => void;
  invites: CoffeeChatInvite[];
  setInvites: React.Dispatch<React.SetStateAction<CoffeeChatInvite[]>>;
  onSendInvite: (cand: Candidate) => void;
  managerProfile: { name: string; dept: string; research: string; skills: string[] };
}

// ── Score badge helper for Connections ───────────────────────────────────────────
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

export default function DiscoveryTab({
  candidates,
  setCandidates,
  showToast,
  onViewCandidate,
  invites,
  setInvites,
  onSendInvite,
  managerProfile
}: DiscoveryTabProps) {
  const [discoverySearch, setDiscoverySearch] = useState('');
  const [schoolFilter, setSchoolFilter] = useState('All');
  const [selectedJobId, setSelectedJobId] = useState<string>('All');
  const [subTab, setSubTab] = useState<'pool' | 'connections'>('pool');


  // ── Load invites from Supabase on mount ──────────────────────────────────
  useEffect(() => {
    async function loadInvites() {
      try {
        const { data, error } = await supabase
          .from('coffee_chat_invites')
          .select('*')
          .eq('manager_name', managerProfile.name)
          .order('created_at', { ascending: false });

        if (error) return;

        if (data && data.length > 0) {
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
            messages: row.messages || [],
            timestamp: row.created_at
              ? new Date(row.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : 'Today'
          }));
          setInvites(prev => {
            const existingIds = new Set(prev.map(i => i.id));
            const newOnes = mapped.filter(m => !existingIds.has(m.id));
            return [...newOnes, ...prev];
          });
        }
      } catch (e) {
        console.error("Error loading invites on mount:", e);
      }
    }
    loadInvites();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [managerProfile.name]);



  const sentInvites = invites.filter(inv => inv.status !== 'rejected');
  const acceptedInvites = invites.filter(inv => inv.status === 'accepted');

  // Load jobs from DB for position matching
  const jobs = db.getJobs();
  const selectedJob = jobs.find(j => j.id === selectedJobId);

  // ── Filter & score candidates ─────────────────────────────────────────────
  const processedCandidates = candidates
    .filter(c =>
      schoolFilter === 'All' || c.university === schoolFilter
    )
    .filter(c =>
      c.name.toLowerCase().includes(discoverySearch.toLowerCase()) ||
      c.skills.join(' ').toLowerCase().includes(discoverySearch.toLowerCase())
    )
    .map(c => {
      if (selectedJob) {
        const result = db.calculateMatchScore(c, selectedJob);
        return { ...c, calculatedScore: result.score, matchedSkills: result.matchedSkills, totalRequired: result.totalRequired };
      }
      return { ...c, calculatedScore: c.score, matchedSkills: [] as string[], totalRequired: 0 };
    });

  const isGroupingEnabled = selectedJobId !== 'All' && selectedJob;
  const bestMatches = processedCandidates.filter(c => c.calculatedScore >= 80);
  const goodMatches = processedCandidates.filter(c => c.calculatedScore >= 60 && c.calculatedScore < 80);
  const leastMatches = processedCandidates.filter(c => c.calculatedScore < 60);

  const sortCandidates = (list: typeof processedCandidates) =>
    [...list].sort((a, b) => b.calculatedScore - a.calculatedScore);

  // ── Score badge ───────────────────────────────────────────────────────────
  const scoreBadgeClass = (score: number) => {
    if (score >= 80) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (score >= 60) return 'text-blue-700 bg-blue-50 border-blue-200';
    return 'text-red-700 bg-red-50 border-red-200';
  };

  // ── Helper to mask candidate name ──────────────────────────────────────────
  const getMaskedName = (c: Candidate, score: number) => {
    const initials = c.name.split(' ').map(n => n[0]).join('');
    return `Candidate #${initials}${score}`;
  };

  // ── Candidate card renderer ───────────────────────────────────────────────
  const renderCandidateCard = (cand: typeof processedCandidates[0]) => {
    const isLeast = cand.calculatedScore < 60;
    const isBest = cand.calculatedScore >= 80;

    // Check invite status
    const invite = invites.find(inv => inv.candidateId === cand.id);
    const isShared = !!(invite && invite.studentSharedProfile);

    return (
      <div
        key={cand.id}
        className={`bg-white rounded-3xl border p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between ${
          isBest ? 'border-emerald-200' : isLeast ? 'border-slate-200' : 'border-slate-200'
        }`}
      >
        {/* Top accent stripe for best matches */}
        {isBest && isGroupingEnabled && (
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-t-3xl" />
        )}

        <div>
          {/* Header: avatar + name + score */}
          <div className="flex items-start justify-between mb-4 gap-2">
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <img
                  className={`w-12 h-12 rounded-2xl object-cover border border-slate-200 transition duration-300 ${
                    !isShared ? 'filter blur-md grayscale blur-xs' : 'grayscale-0'
                  }`}
                  src={cand.avatarUrl}
                  alt={isShared ? cand.name : 'Masked Candidate'}
                  referrerPolicy="no-referrer"
                />
                {!isShared && (
                  <div className="absolute inset-0 bg-slate-900/10 rounded-2xl flex items-center justify-center">
                    <Lock className="w-3.5 h-3.5 text-white/95" />
                  </div>
                )}
              </div>
              <div>
                <h4 className="font-display font-semibold text-sm text-slate-950 leading-tight">
                  {isShared ? cand.name : getMaskedName(cand, cand.calculatedScore)}
                </h4>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate max-w-[140px]">
                  {isShared ? cand.university : '[Institution Masked]'}
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[9px] text-slate-400 font-mono uppercase block mb-0.5">
                {isGroupingEnabled ? 'Job Fit' : 'Engagement'}
              </span>
              <span className={`text-xs font-black font-mono px-1.5 py-0.5 rounded border ${scoreBadgeClass(cand.calculatedScore)}`}>
                {cand.calculatedScore}/100
              </span>
              {isGroupingEnabled && cand.totalRequired > 0 && (
                <span className="block text-[8px] font-mono text-slate-400 mt-1">
                  {cand.matchedSkills.length}/{cand.totalRequired} skills
                </span>
              )}
            </div>
          </div>

          {/* Match fit label when a job is selected */}
          {isGroupingEnabled && (
            <div className="mb-3">
              {isBest ? (
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 font-semibold">
                  <Sparkles className="w-3 h-3 text-emerald-500" />
                  Best Fit for Position
                </span>
              ) : isLeast ? (
                <span className="inline-flex items-center gap-1 text-[10px] text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100 font-semibold">
                  <AlertTriangle className="w-3 h-3 text-red-400" />
                  Low Alignment
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 font-semibold">
                  Good Fit
                </span>
              )}
            </div>
          )}

          {/* Skills — matched ones highlighted in emerald */}
          <div className="pt-3 border-t border-slate-100">
            <span className="text-[9px] text-slate-400 font-mono uppercase font-semibold block mb-2">
              Verified Competencies
            </span>
            <div className="flex flex-wrap gap-1">
              {cand.skills.map((s, i) => {
                const matchesJob = selectedJob?.requiredSkills.some(
                  js => js.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(js.toLowerCase())
                );
                return (
                  <span
                    key={i}
                    className={`text-[10px] px-2 py-0.5 rounded-sm transition font-medium ${
                      isGroupingEnabled && matchesJob
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {s}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2">
          <button
            onClick={() => {
              setCandidates(prev => prev.map(c => c.id === cand.id ? { ...c, saved: !c.saved } : c));
              showToast(cand.saved ? 'Removed from saved' : 'Candidate saved');
            }}
            className={`w-8 h-8 rounded-lg border flex items-center justify-center transition shrink-0 cursor-pointer ${
              cand.saved
                ? 'border-red-200 text-red-600 bg-red-50'
                : 'border-slate-200 text-slate-400 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${cand.saved ? 'fill-red-600' : ''}`} />
          </button>

          {isShared ? (
            <button
              onClick={() => onViewCandidate(cand)}
              className="flex-1 py-2 font-semibold text-xs rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition cursor-pointer text-center"
            >
              View CV
            </button>
          ) : (
            <button
              onClick={() => showToast('CV Access Locked. Send a Coffee Chat Invite to request access.')}
              className="flex-1 py-2 font-semibold text-xs rounded-lg bg-slate-100 border border-slate-200 text-slate-400 hover:bg-slate-200 transition cursor-pointer text-center flex items-center justify-center gap-1"
            >
              <Lock className="w-3.5 h-3.5" />
              CV Locked
            </button>
          )}

          {/* Invite button */}
          {!invite ? (
            <button
              onClick={() => onSendInvite(cand)}
              className="flex-1 py-2 font-bold text-xs rounded-lg bg-red-600 hover:bg-red-700 text-white transition cursor-pointer text-center flex items-center justify-center gap-1 shadow-xs"
            >
              <Coffee className="w-3.5 h-3.5" />
              Invite
            </button>
          ) : invite.status === 'pending' ? (
            <button
              disabled
              className="flex-1 py-2 font-semibold text-xs rounded-lg bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed text-center"
            >
              Pending
            </button>
          ) : invite.status === 'accepted' ? (
            <button
              disabled
              className="flex-1 py-2 font-semibold text-xs rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-250 cursor-not-allowed text-center flex items-center justify-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              Connected
            </button>
          ) : (
            <button
              disabled
              className="flex-1 py-2 font-semibold text-xs rounded-lg bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed text-center"
            >
              Declined
            </button>
          )}
        </div>
      </div>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div id="recruiter-view-discovery" className="space-y-6 max-w-7xl mx-auto w-full">

      {/* Header + Controls */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest font-semibold block">
              Academic Match Engine
            </span>
            <h2 className="font-display font-bold text-2xl text-slate-900 mt-1">Talent Discovery</h2>
            <p className="text-slate-500 text-xs mt-1">
              Browse the full candidate pool. Select a job position to see how each candidate matches its required skills.
            </p>
          </div>

          {/* Sub-tab toggle */}
          <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200 shrink-0">
            <button
              onClick={() => setSubTab('pool')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                subTab === 'pool'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-red-600" />
              Discover Pool
            </button>
            <button
              onClick={() => setSubTab('connections')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                subTab === 'connections'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Coffee className="w-3.5 h-3.5 text-red-650" />
              My Connections
              {sentInvites.length > 0 && (
                <span className="bg-red-600 text-white font-mono text-[9px] px-1.5 rounded-full ml-1">
                  {sentInvites.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Filters (only show in Discover Pool subTab) */}
        {subTab === 'pool' && (
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative w-full max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name or skill..."
                value={discoverySearch}
                onChange={(e) => setDiscoverySearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 focus:border-slate-800 rounded-xl text-xs focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap gap-2 w-full md:w-auto justify-start md:justify-end">
              {/* Job position selector */}
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none font-semibold text-slate-700 cursor-pointer"
              >
                <option value="All">All Positions (General Pool)</option>
                {jobs.map(j => (
                  <option key={j.id} value={j.id}>{j.title}</option>
                ))}
              </select>

              {/* University filter */}
              <select
                value={schoolFilter}
                onChange={(e) => setSchoolFilter(e.target.value)}
                className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none font-semibold text-slate-700 cursor-pointer"
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

        {/* Position match context pill */}
        {subTab === 'pool' && isGroupingEnabled && selectedJob && (
          <div className="mt-4 flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs w-fit">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="font-mono font-medium">Matching against:</span>
            <span className="font-bold">{selectedJob.title}</span>
            <span className="text-slate-400 font-mono">·</span>
            <span className="text-slate-300 font-mono text-[10px]">
              Skills: {selectedJob.requiredSkills.join(', ')}
            </span>
          </div>
        )}
      </div>

      {/* ── DISCOVER POOL SUB-TAB ─────────────────────────────────────────────────── */}
      {subTab === 'pool' && (
        <div id="discovery-view-content" className="space-y-8">
          {isGroupingEnabled ? (
            <div className="space-y-10">
              {/* Best Matches */}
              <section>
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <h3 className="font-display font-bold text-sm text-slate-900 uppercase tracking-wider">
                    Best Match ({bestMatches.length})
                  </h3>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
                    Score ≥ 80%
                  </span>
                </div>
                {bestMatches.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 relative">
                    {sortCandidates(bestMatches).map(c => renderCandidateCard(c))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-xs font-mono py-6 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white">
                    No candidates qualify as Best Match for this position.
                  </p>
                )}
              </section>

              {/* Good Matches */}
              <section>
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200">
                  <span className="w-3 h-3 rounded-full bg-blue-400" />
                  <h3 className="font-display font-bold text-sm text-slate-900 uppercase tracking-wider">
                    Good Match ({goodMatches.length})
                  </h3>
                  <span className="text-[10px] font-mono text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full font-semibold">
                    Score 60–79%
                  </span>
                </div>
                {goodMatches.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {sortCandidates(goodMatches).map(c => renderCandidateCard(c))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-xs font-mono py-6 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white">
                    No candidates in the Good Match range.
                  </p>
                )}
              </section>

              {/* Least Matches */}
              <section>
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200">
                  <span className="w-3 h-3 rounded-full bg-red-400" />
                  <h3 className="font-display font-bold text-sm text-slate-900 uppercase tracking-wider">
                    Low Alignment ({leastMatches.length})
                  </h3>
                  <span className="text-[10px] font-mono text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full font-semibold">
                    Score &lt; 60%
                  </span>
                </div>
                {leastMatches.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {sortCandidates(leastMatches).map(c => renderCandidateCard(c))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-xs font-mono py-6 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white">
                    No candidates flagged as Low Alignment.
                  </p>
                )}
              </section>
            </div>
          ) : (
            // Flat pool — sorted by engagement score
            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
                <h3 className="font-display font-bold text-sm text-slate-900 uppercase tracking-wider">
                  General Talent Pool ({processedCandidates.length})
                </h3>
                <span className="text-[10px] font-mono text-slate-400">Sorted by engagement score · select a position to match</span>
              </div>
              {processedCandidates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {sortCandidates(processedCandidates).map(c => renderCandidateCard(c))}
                </div>
              ) : (
                <p className="text-slate-400 text-xs text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-white">
                  No candidates found. Try adjusting your search or filters.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── MY CONNECTIONS SUB-TAB ─────────────────────────────────────────────────── */}
      {subTab === 'connections' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
            <div>
              <h3 className="font-display font-semibold text-base text-slate-900">My Connections</h3>
              <p className="text-slate-500 text-xs mt-0.5">Initiated by {managerProfile.name} · {sentInvites.length} total</p>
            </div>
            <span className="text-xs bg-red-50 text-red-700 border border-red-200 font-mono font-semibold px-3 py-1 rounded-lg">
              {acceptedInvites.length} Connected
            </span>
          </div>

          {sentInvites.length > 0 ? (
            <div className="space-y-4">
              {sentInvites.map(inv => {
                const student = candidates.find(c => c.id === inv.candidateId);
                if (!student) return null;
                const shared = !!inv.studentSharedProfile;

                return (
                  <div key={inv.id} className="border border-slate-200 rounded-2xl bg-slate-50/50 hover:bg-white transition overflow-hidden">
                    <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <img
                            className={`w-12 h-12 rounded-xl object-cover border border-slate-200 transition duration-300 ${!shared ? 'filter blur-md grayscale blur-xs' : ''}`}
                            src={student.avatarUrl}
                            alt={shared ? student.name : 'Masked Candidate'}
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
                              {shared ? student.name : getMaskedName(student, inv.score)}
                            </h4>
                            <ScoreBadge score={inv.score} />
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {shared ? student.university : '[Institution Masked]'}
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
                          {inv.status === 'accepted' ? '✓ Connected' : '⏳ Pending'}
                        </span>

                        {inv.status === 'accepted' && (
                          <>
                            {shared ? (
                              <span className="text-[10px] font-semibold px-2.5 py-1 rounded-lg border text-slate-950 bg-slate-50 border-slate-200">
                                CV Shared
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold px-2.5 py-1 rounded-lg border text-red-700 bg-red-50 border-red-200 font-mono">
                                CV Locked
                              </span>
                            )}

                            {shared ? (
                              <button
                                onClick={() => onViewCandidate(student)}
                                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-semibold border border-transparent cursor-pointer transition"
                              >
                                View CV
                              </button>
                            ) : (
                              <button
                                onClick={() => showToast('CV Access Locked. Request student to share profile details.')}
                                className="px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-400 rounded-lg text-[10px] font-semibold flex items-center justify-center gap-1 cursor-not-allowed"
                              >
                                <Lock className="w-3 h-3" /> CV Locked
                              </button>
                            )}


                            <button
                              onClick={() => showToast(`Internship offer sent to ${shared ? student.name : getMaskedName(student, inv.score)}!`)}
                              className="px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition bg-red-600 hover:bg-red-700 text-white shadow shadow-red-500/20"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              Intern Offer
                            </button>
                          </>
                        )}
                      </div>
                    </div>


                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-3xl">
              <Coffee className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h4 className="font-display font-semibold text-slate-700 text-sm">No connections established yet</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Go to <strong>Discover Pool</strong> and invite a student to connect!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
