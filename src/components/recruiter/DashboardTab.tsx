import React, { useState } from 'react';
import { Users, Award, Calendar, Briefcase, X, ArrowUpRight, GraduationCap, CheckCircle } from 'lucide-react';
import { Candidate, CoffeeChatInvite } from '../../types';
import { db } from '../../utils/db';

interface DashboardTabProps {
  candidates: Candidate[];
  invites: CoffeeChatInvite[];
  onViewCandidate: (cand: Candidate) => void;
}

type SectionType = 
  | 'students_reached' 
  | 'avg_score' 
  | 'completed_labs' 
  | 'active_matches'
  | 'funnel_lecture'
  | 'funnel_workshop'
  | 'funnel_hackathon'
  | 'funnel_mentorship'
  | 'funnel_placement';

export default function DashboardTab({ candidates, invites, onViewCandidate }: DashboardTabProps) {
  const [activeSectionModal, setActiveSectionModal] = useState<SectionType | null>(null);

  // --- STATS COMPUTATION FROM DB ---
  const totalStudentsReached = candidates.length;
  const avgScore = candidates.length > 0 
    ? Math.round(candidates.reduce((sum, c) => sum + c.score, 0) / candidates.length) 
    : 0;
  
  const allRegistrations = db.getRegistrations();
  const completedLabsCount = allRegistrations.length;
  const activeMatchesCount = invites.filter(inv => inv.status === 'accepted').length;

  // --- FILTER CANDIDATES BY CLICKED SECTION ---
  const getSectionTitleAndDesc = (sec: SectionType) => {
    switch (sec) {
      case 'students_reached':
        return {
          title: 'Total Students Reached',
          desc: 'Comprehensive list of all registered student profiles currently stored in the talent database.'
        };
      case 'avg_score':
        return {
          title: 'High-Performing Candidates (Score >= 85)',
          desc: 'Talent scoring in the upper echelon of automated hardware/software evaluations.'
        };
      case 'completed_labs':
        return {
          title: 'Event Registrations & Labs',
          desc: 'Live record of students who have signed up for masterclasses and completed technical modules.'
        };
      case 'active_matches':
        return {
          title: 'Active Recruiter Matches',
          desc: 'Mentorship connections and coffee chats accepted by candidates.'
        };
      case 'funnel_lecture':
        return {
          title: 'Guest Lecture Attendees',
          desc: 'Students who registered for systems architecture or leadership masterclasses.'
        };
      case 'funnel_workshop':
        return {
          title: 'Practical Workshop Participants',
          desc: 'Students participating in hands-on design optimization labs.'
        };
      case 'funnel_hackathon':
        return {
          title: 'Industry Hackathon Cohort',
          desc: 'Students possessing hackathon credentials and advanced project submissions.'
        };
      case 'funnel_mentorship':
        return {
          title: 'Direct Mentorship Pipeline',
          desc: 'Students who are under active review or have open chat communication channels.'
        };
      case 'funnel_placement':
        return {
          title: 'Placement Pipeline (Interview / Hired)',
          desc: 'Elite candidates scheduled for direct interviews and final placement review.'
        };
    }
  };

  const getSectionCandidates = (sec: SectionType): { candidate: Candidate; extraInfo?: string }[] => {
    switch (sec) {
      case 'students_reached':
        return candidates.map(c => ({ candidate: c }));
      case 'avg_score':
        return candidates.filter(c => c.score >= 85).map(c => ({ candidate: c, extraInfo: `Top score: ${c.score}/100` }));
      case 'completed_labs':
        // Return candidates and list the events they registered for
        return candidates.filter(c => allRegistrations.some(r => r.studentId === c.id)).map(c => {
          const studentRegs = allRegistrations.filter(r => r.studentId === c.id).map(r => r.eventTitle.split(':')[0]).join(', ');
          return {
            candidate: c,
            extraInfo: `Registered: ${studentRegs}`
          };
        });
      case 'active_matches':
        return candidates.filter(c => invites.some(inv => inv.candidateId === c.id && inv.status === 'accepted')).map(c => ({
          candidate: c,
          extraInfo: 'Coffee chat booked'
        }));
      case 'funnel_lecture':
        // e1 or e2 registered
        return candidates.filter(c => allRegistrations.some(r => r.studentId === c.id && (r.eventId === 'e1' || r.eventId === 'e2'))).map(c => ({
          candidate: c,
          extraInfo: 'Guest lecture registered'
        }));
      case 'funnel_workshop':
        // e3 registered
        return candidates.filter(c => allRegistrations.some(r => r.studentId === c.id && r.eventId === 'e3')).map(c => ({
          candidate: c,
          extraInfo: 'RedExpert Workshop'
        }));
      case 'funnel_hackathon':
        // has skills like SolidWorks, RFID, or score >= 88
        return candidates.filter(c => c.skills.includes('SolidWorks') || c.skills.includes('RFID Systems') || c.score >= 88).map(c => ({
          candidate: c,
          extraInfo: 'Hackathon finalist'
        }));
      case 'funnel_mentorship':
        return candidates.filter(c => c.stage === 'Recruiter Review' || invites.some(i => i.candidateId === c.id)).map(c => ({
          candidate: c,
          extraInfo: 'Mentorship queue active'
        }));
      case 'funnel_placement':
        return candidates.filter(c => c.stage === 'Interview Scheduled').map(c => ({
          candidate: c,
          extraInfo: 'Interview scheduled'
        }));
    }
  };

  const currentModalInfo = activeSectionModal ? getSectionTitleAndDesc(activeSectionModal) : null;
  const filteredCandidates = activeSectionModal ? getSectionCandidates(activeSectionModal) : [];

  return (
    <div id="recruiter-view-dashboard" className="space-y-8 max-w-7xl mx-auto w-full">
      
      {/* Top Row key performance metrics cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1 */}
        <div 
          onClick={() => setActiveSectionModal('students_reached')}
          className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex items-center justify-between cursor-pointer hover:border-red-500 hover:shadow-md transition-all duration-300 group"
        >
          <div>
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest font-semibold block">Students Reached</span>
            <p className="text-2xl font-display font-extrabold text-slate-900 mt-1">{totalStudentsReached}</p>
            <span className="text-[10px] text-emerald-600 font-semibold font-mono block mt-1 flex items-center gap-0.5 group-hover:text-red-600 transition-colors">
              Inspect Cohort <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0 group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2 */}
        <div 
          onClick={() => setActiveSectionModal('avg_score')}
          className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex items-center justify-between cursor-pointer hover:border-red-500 hover:shadow-md transition-all duration-300 group"
        >
          <div>
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest font-semibold block font-mono">Avg Pass Score</span>
            <p className="text-2xl font-display font-extrabold text-slate-900 mt-1">{avgScore}/100</p>
            <span className="text-[10px] text-emerald-600 font-semibold font-mono block mt-1 flex items-center gap-0.5 group-hover:text-red-600 transition-colors">
              Inspect Top Performers <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0 group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
            <Award className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3 */}
        <div 
          onClick={() => setActiveSectionModal('completed_labs')}
          className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex items-center justify-between cursor-pointer hover:border-red-500 hover:shadow-md transition-all duration-300 group"
        >
          <div>
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest font-semibold block font-mono">Registered Lab Events</span>
            <p className="text-2xl font-display font-extrabold text-slate-900 mt-1">{completedLabsCount}</p>
            <span className="text-[10px] text-emerald-600 font-semibold font-mono block mt-1 flex items-center gap-0.5 group-hover:text-red-600 transition-colors">
              Inspect Registrations <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0 group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4 */}
        <div 
          onClick={() => setActiveSectionModal('active_matches')}
          className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex items-center justify-between cursor-pointer hover:border-red-500 hover:shadow-md transition-all duration-300 group"
        >
          <div>
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest block font-mono">Active Matches</span>
            <p className="text-2xl font-display font-extrabold text-slate-900 mt-1">{activeMatchesCount}</p>
            <span className="text-[10px] text-red-600 font-bold font-mono block mt-1 flex items-center gap-0.5 group-hover:text-red-700 transition-colors">
              Inspect Connections <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 shrink-0 group-hover:bg-red-600 group-hover:text-white transition-colors">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Graphical Trend Desk */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Event Attendance over time SVG Column */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-baseline mb-6 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">Cohort Trends</span>
                <h3 className="font-display font-semibold text-sm text-slate-900 tracking-tight mt-0.5">Event Attendance Over Time</h3>
              </div>
              <span className="text-xs font-mono text-slate-500 font-semibold bg-slate-100 px-2.5 py-0.5 rounded">YTD Aggregate</span>
            </div>

            {/* Chart inside frame */}
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

        {/* Vertical Funnel visual representation */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest block">Pipeline Operations</span>
            <h3 className="font-display font-semibold text-sm text-slate-900 border-b border-slate-100 pb-3 mb-5 mt-0.5 tracking-tight">Talent Pipeline Funnel</h3>

            {/* Funnel Rows */}
            <div className="space-y-3.5">
              <div 
                onClick={() => setActiveSectionModal('funnel_lecture')}
                className="relative p-2.5 bg-slate-950 text-white rounded-xl text-xs flex justify-between items-center overflow-hidden hover:bg-slate-900 transition-colors cursor-pointer group"
              >
                <span className="font-semibold z-15 flex items-center gap-1">
                  1. Guest Lecture Attendee <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-red-500 transition-colors" />
                </span>
                <span className="font-mono z-15 text-slate-400 text-[10px]">Inspect Stage</span>
                <div className="absolute left-0 top-0 bottom-0 bg-red-600 w-1 opacity-80" />
              </div>

              <div 
                onClick={() => setActiveSectionModal('funnel_workshop')}
                className="relative p-2.5 bg-slate-900 text-slate-100 rounded-xl text-xs flex justify-between items-center overflow-hidden max-w-[90%] mx-auto hover:bg-slate-850 transition-colors cursor-pointer group"
              >
                <span className="font-semibold z-15 flex items-center gap-1">
                  2. Practical Workshop <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-red-500 transition-colors" />
                </span>
                <span className="font-mono z-15 text-slate-450 text-[10px]">Inspect Stage</span>
                <div className="absolute left-0 top-0 bottom-0 bg-red-600 w-1 opacity-80" />
              </div>

              <div 
                onClick={() => setActiveSectionModal('funnel_hackathon')}
                className="relative p-2.5 bg-slate-800 text-slate-200 rounded-xl text-xs flex justify-between items-center overflow-hidden max-w-[80%] mx-auto hover:bg-slate-750 transition-colors cursor-pointer group"
              >
                <span className="font-semibold z-15 flex items-center gap-1">
                  3. Industry Hackathon <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-red-500 transition-colors" />
                </span>
                <span className="font-mono z-15 text-slate-400 text-[10px]">Inspect Stage</span>
                <div className="absolute left-0 top-0 bottom-0 bg-red-600 w-1 opacity-50" />
              </div>

              <div 
                onClick={() => setActiveSectionModal('funnel_mentorship')}
                className="relative p-2.5 bg-slate-700 text-slate-350 rounded-xl text-xs flex justify-between items-center overflow-hidden max-w-[70%] mx-auto font-bold hover:bg-slate-650 transition-colors cursor-pointer group text-slate-100"
              >
                <span className="font-semibold z-15 text-slate-100 flex items-center gap-1">
                  4. Direct Mentorship <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-500 transition-colors" />
                </span>
                <span className="font-mono z-15 text-slate-200 font-normal text-[10px]">Inspect Stage</span>
                <div className="absolute left-0 top-0 bottom-0 bg-red-600 w-1" />
              </div>

              <div 
                onClick={() => setActiveSectionModal('funnel_placement')}
                className="relative p-2.5 bg-slate-100 text-slate-750 border border-slate-200 rounded-xl text-xs flex justify-between items-center overflow-hidden max-w-[60%] mx-auto hover:bg-slate-200 transition-colors cursor-pointer group"
              >
                <span className="font-semibold z-15 text-red-600 flex items-center gap-1">
                  5. Placement Pipeline <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-red-600 transition-colors" />
                </span>
                <span className="font-mono z-15 font-bold text-slate-500 text-[10px]">Inspect Stage</span>
                <div className="absolute left-0 top-0 bottom-0 bg-emerald-500 w-1" />
              </div>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 font-sans leading-tight mt-6 text-center">
            Click funnel items to inspect current pipeline cohorts.
          </p>
        </div>

      </div>

      {/* --- DASHBOARD DETAIL SECTION MODAL --- */}
      {activeSectionModal && currentModalInfo && (
        <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="bg-slate-950 text-white px-6 py-4 flex justify-between items-center border-b border-slate-900 shrink-0">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-red-500" />
                <h3 className="font-display font-bold text-sm tracking-tight">{currentModalInfo.title}</h3>
              </div>
              <button 
                onClick={() => setActiveSectionModal(null)}
                className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Description bar */}
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-3 shrink-0">
              <p className="text-[11px] text-slate-500 leading-relaxed font-sans">{currentModalInfo.desc}</p>
            </div>

            {/* Candidates list body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {filteredCandidates.length > 0 ? (
                filteredCandidates.map(({ candidate, extraInfo }) => (
                  <div 
                    key={candidate.id}
                    className="p-4 border border-slate-200 rounded-2xl bg-slate-50 hover:bg-white hover:border-slate-300 transition flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <img 
                        className="w-10 h-10 rounded-xl object-cover border border-slate-200 bg-white" 
                        src={candidate.avatarUrl} 
                        alt={candidate.name}
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-950">{candidate.name}</h4>
                          <span className="text-[9px] font-mono font-bold text-red-600 bg-red-50 px-1 rounded border border-red-100/50">
                            Score {candidate.score}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[280px]">{candidate.university}</p>
                        {extraInfo && (
                          <span className="inline-flex items-center gap-0.5 mt-1 px-1.5 py-0.2 bg-slate-200/60 rounded text-[9px] font-mono text-slate-650">
                            <CheckCircle className="w-2.5 h-2.5 text-emerald-600" />
                            {extraInfo}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setActiveSectionModal(null);
                        onViewCandidate(candidate);
                      }}
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-bold transition cursor-pointer"
                    >
                      View CV
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-500">
                  <GraduationCap className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-medium">No candidates currently qualify for this stage.</p>
                  <p className="text-[10px] text-slate-400 mt-1 font-mono">Database query returned 0 matches.</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 border-t border-slate-100 px-6 py-3.5 text-right shrink-0">
              <span className="text-[9px] font-mono text-slate-400 uppercase">WE Connect Talent Query Engine v1.0</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
