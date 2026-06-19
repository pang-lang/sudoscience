import React from 'react';
import { Candidate } from '../../types';
import { ArrowRight, Check } from 'lucide-react';

interface PipelineTabProps {
  candidates: Candidate[];
  transitionCandidateStage: (id: string, dir: 'next' | 'prev') => void;
}

export default function PipelineTab({ candidates, transitionCandidateStage }: PipelineTabProps) {
  return (
    <div id="recruiter-view-pipeline" className="space-y-6 max-w-5xl">
      
      <div className="border-b border-slate-200 pb-5">
        <h2 className="font-display font-bold text-2xl text-slate-900">Technical Candidate Placements</h2>
        <p className="text-slate-500 text-xs mt-1">Manage active engineering applicants and student mentors across evaluation boards</p>
      </div>

      {/* Kanban Grid Rows */}
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
              <div key={cand.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:shadow transition">
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
              <div key={cand.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:shadow transition">
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
              <div key={cand.id} className="bg-white border border-red-500/20 rounded-2xl p-4 shadow-md hover:shadow transition">
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
  );
}
