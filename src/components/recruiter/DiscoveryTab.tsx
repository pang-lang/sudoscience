import React, { useState } from 'react';
import { Candidate } from '../../types';
import {
  Search, Bookmark, Sparkles, AlertTriangle, ChevronDown
} from 'lucide-react';
import { db } from '../../utils/db';

interface DiscoveryTabProps {
  candidates: Candidate[];
  setCandidates: React.Dispatch<React.SetStateAction<Candidate[]>>;
  showToast: (msg: string) => void;
  onViewCandidate: (cand: Candidate) => void;
}

export default function DiscoveryTab({
  candidates,
  setCandidates,
  showToast,
  onViewCandidate
}: DiscoveryTabProps) {
  const [discoverySearch, setDiscoverySearch] = useState('');
  const [schoolFilter, setSchoolFilter] = useState('All');
  const [selectedJobId, setSelectedJobId] = useState<string>('All');

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

  // ── Candidate card renderer ───────────────────────────────────────────────
  const renderCandidateCard = (cand: typeof processedCandidates[0]) => {
    const isLeast = cand.calculatedScore < 60;
    const isBest = cand.calculatedScore >= 80;

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
              <img
                className="w-12 h-12 rounded-2xl object-cover border border-slate-200"
                src={cand.avatarUrl}
                alt={cand.name}
                referrerPolicy="no-referrer"
              />
              <div>
                <h4 className="font-display font-semibold text-sm text-slate-950 leading-tight">
                  {cand.name}
                </h4>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5 truncate max-w-[140px]">
                  {cand.university}
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

          <button
            onClick={() => onViewCandidate(cand)}
            className="flex-1 py-2 font-semibold text-xs rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition cursor-pointer text-center"
          >
            View CV Profile
          </button>
        </div>
      </div>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div id="recruiter-view-discovery" className="space-y-6 max-w-7xl mx-auto w-full">

      {/* Header + Controls */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm">
        <div>
          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest font-semibold block">
            Academic Match Engine
          </span>
          <h2 className="font-display font-bold text-2xl text-slate-900 mt-1">Talent Discovery</h2>
          <p className="text-slate-500 text-xs mt-1">
            Browse the full candidate pool. Select a job position to see how each candidate matches its required skills.
          </p>
        </div>

        {/* Filters */}
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

        {/* Position match context pill */}
        {isGroupingEnabled && selectedJob && (
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

      {/* Candidates grid */}
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
    </div>
  );
}
