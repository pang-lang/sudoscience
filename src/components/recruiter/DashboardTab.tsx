import React, { useState } from 'react';
import { Users, Award, Calendar, Briefcase, X, ArrowUpRight, GraduationCap, CheckCircle, Sparkles } from 'lucide-react';
import { Candidate, CoffeeChatInvite } from '../../types';
import { db } from '../../utils/db';

interface DashboardTabProps {
  candidates: Candidate[];
  invites: CoffeeChatInvite[];
  registrations: any[];
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

export default function DashboardTab({ candidates, invites, registrations, onViewCandidate }: DashboardTabProps) {
  const [activeSectionModal, setActiveSectionModal] = useState<SectionType | null>(null);
  const [hoveredMonthIndex, setHoveredMonthIndex] = useState<number | null>(null);

  const monthlyData = [
    { month: 'Jan', lectures: 15, workshops: 25, hackathons: 10, total: 50 },
    { month: 'Mar', lectures: 20, workshops: 35, hackathons: 15, total: 70 },
    { month: 'May', lectures: 25, workshops: 45, hackathons: 20, total: 90 },
    { month: 'Jul', lectures: 40, workshops: 65, hackathons: 35, total: 140, isPeak: true },
    { month: 'Sep', lectures: 30, workshops: 50, hackathons: 25, total: 105 },
    { month: 'Nov', lectures: 18, workshops: 30, hackathons: 12, total: 60 },
  ];

  // --- STATS COMPUTATION FROM DB ---
  const totalStudentsReached = candidates.length;
  const avgScore = candidates.length > 0 
    ? Math.round(candidates.reduce((sum, c) => sum + c.score, 0) / candidates.length) 
    : 0;
  
  const allRegistrations = registrations;
  const completedLabsCount = allRegistrations.length;
  const activeMatchesCount = invites.filter(inv => inv.status === 'accepted').length;

  // Stage counts for pipeline funnel
  const stageCount = (stage: string) => candidates.filter(c => c.stage === stage).length;
  const talentPool = candidates.length; // all candidates
  const lectureCount = candidates.filter(c => allRegistrations.some(r => r.student_id === c.id && (r.event_id === 'e1' || r.event_id === 'e2'))).length;
  const workshopCount = candidates.filter(c => allRegistrations.some(r => r.student_id === c.id && r.event_id === 'e3')).length;
  const hackathonCount = candidates.filter(c => c.skills.includes('SolidWorks') || c.skills.includes('RFID Systems') || c.score >= 88).length;
  const mentorshipCount = candidates.filter(c => c.stage === 'Recruiter Review' || invites.some(i => i.candidateId === c.id)).length;
  const placementCount = stageCount('Interview Scheduled');

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
        return allRegistrations.map(r => {
          const candidate = candidates.find(c => c.id === r.student_id) || {
            id: r.student_id,
            name: r.student_name,
            university: 'Technische Universität München',
            skills: [],
            score: 85,
            stage: 'Talent Pool' as const,
            avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
          };
          return {
            candidate,
            extraInfo: `Event: ${r.event_title?.split(':')[0] || 'Lab'}`
          };
        });
      case 'active_matches':
        return invites.map(inv => {
          const candidate = candidates.find(c => c.id === inv.candidateId) || {
            id: inv.candidateId,
            name: `Candidate #${inv.candidateId}`,
            university: 'Technische Universität München',
            skills: [],
            score: inv.score,
            stage: 'Talent Pool' as const,
            avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
          };
          return {
            candidate,
            extraInfo: `${inv.status === 'accepted' ? '✓ Accepted' : '⏳ Pending'}: Coffee Chat with ${inv.managerName} (${inv.managerDept})`
          };
        });
      case 'funnel_lecture':
        // e1 or e2 registered
        return candidates.filter(c => allRegistrations.some(r => r.student_id === c.id && (r.event_id === 'e1' || r.event_id === 'e2'))).map(c => ({
          candidate: c,
          extraInfo: 'Guest lecture registered'
        }));
      case 'funnel_workshop':
        // e3 registered
        return candidates.filter(c => allRegistrations.some(r => r.student_id === c.id && r.event_id === 'e3')).map(c => ({
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
              {talentPool} in talent pool <ArrowUpRight className="w-3 h-3" />
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
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest font-semibold block font-mono">Avg Engagement Score</span>
            <p className="text-2xl font-display font-extrabold text-slate-900 mt-1">{avgScore}/100</p>
            <span className="text-[10px] text-emerald-600 font-semibold font-mono block mt-1 flex items-center gap-0.5 group-hover:text-red-600 transition-colors">
              {candidates.filter(c => c.score >= 85).length} high performers <ArrowUpRight className="w-3 h-3" />
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
              {candidates.filter(c => allRegistrations.some(r => r.student_id === c.id)).length} students registered <ArrowUpRight className="w-3 h-3" />
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
              {invites.filter(i => i.status === 'pending').length} pending responses <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 shrink-0 group-hover:bg-red-600 group-hover:text-white transition-colors">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Graphical Trend Desk */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         {/* Event Attendance over time Grouped Bar Chart */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-baseline mb-4 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest font-semibold block">Academic Integrations</span>
                <h3 className="font-display font-semibold text-sm text-slate-900 tracking-tight mt-0.5">Peak Engagement & Activity Distribution</h3>
              </div>
              <span className="text-xs font-mono text-red-600 font-bold bg-red-50 px-2.5 py-0.5 rounded border border-red-200/50">YTD Cohorts</span>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-[10px] font-mono font-semibold text-slate-500 mb-6">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Guest Lectures</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-slate-700" /> Practical Workshops</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-white border border-slate-400" /> Hackathons</span>
            </div>

            {/* Chart Area */}
            <div className="relative h-48 flex items-end justify-between gap-4 px-2 mt-4">
              {/* Grid Lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                <div className="w-full border-t border-slate-100 h-0 text-[8px] text-slate-400 font-mono pt-0.5">70 students</div>
                <div className="w-full border-t border-slate-100 h-0 text-[8px] text-slate-400 font-mono pt-0.5">50</div>
                <div className="w-full border-t border-slate-100 h-0 text-[8px] text-slate-400 font-mono pt-0.5">25</div>
                <div className="w-full border-b border-slate-200 h-0 text-[8px] text-slate-400 font-mono pb-0.5" />
              </div>

              {/* Bars */}
              {monthlyData.map((d, idx) => {
                return (
                  <div 
                    key={d.month} 
                    className="flex-1 flex flex-col items-center justify-end h-full z-10 relative group"
                    onMouseEnter={() => setHoveredMonthIndex(idx)}
                    onMouseLeave={() => setHoveredMonthIndex(null)}
                  >
                    {/* Grouped Bar Container */}
                    <div className="flex items-end justify-center gap-0.5 sm:gap-1 w-full h-full pb-1">
                      {/* Lectures bar (red) */}
                      <div 
                        style={{ height: `${(d.lectures / 70) * 100}%` }}
                        className="w-2 sm:w-3.5 rounded-t-xs bg-gradient-to-t from-red-600 to-red-500 transition-all duration-300 group-hover:scale-y-105 group-hover:brightness-110 shadow-sm"
                      />
                      {/* Workshops bar (black) */}
                      <div 
                        style={{ height: `${(d.workshops / 70) * 100}%` }}
                        className="w-2 sm:w-3.5 rounded-t-xs bg-gradient-to-t from-slate-950 to-slate-800 transition-all duration-300 group-hover:scale-y-105 group-hover:brightness-110 shadow-sm"
                      />
                      {/* Hackathons bar (white) */}
                      <div 
                        style={{ height: `${(d.hackathons / 70) * 100}%` }}
                        className="w-2 sm:w-3.5 rounded-t-xs bg-gradient-to-t from-slate-200 to-white border border-slate-300 transition-all duration-300 group-hover:scale-y-105 group-hover:brightness-110 shadow-xs"
                      />
                    </div>

                    {/* X Axis Label */}
                    <span className="text-[10px] font-bold text-slate-600 font-mono mt-2 flex flex-col items-center">
                      {d.month}
                      {d.isPeak && <span className="text-[7px] text-red-500 font-bold -mt-0.5">PEAK</span>}
                    </span>

                    {/* Custom Tooltip */}
                    {hoveredMonthIndex === idx && (
                      <div className="absolute bottom-full mb-2 bg-slate-950 text-white text-[10px] p-3 rounded-2xl shadow-xl border border-slate-800 z-30 w-44 transition-all duration-200">
                        <p className="font-bold border-b border-slate-800 pb-1 mb-1.5 flex items-center justify-between">
                          <span>{d.month} Engagement</span>
                          {d.isPeak && <span className="text-[8px] text-red-400 font-extrabold uppercase">Peak 🚀</span>}
                        </p>
                        <div className="space-y-1 font-mono">
                          <p className="flex justify-between items-center">
                            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Lectures:</span>
                            <span className="font-bold">{d.lectures}</span>
                          </p>
                          <p className="flex justify-between items-center">
                            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-slate-950 border border-slate-700" /> Workshops:</span>
                            <span className="font-bold">{d.workshops}</span>
                          </p>
                          <p className="flex justify-between items-center">
                            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-white border border-slate-400" /> Hackathons:</span>
                            <span className="font-bold">{d.hackathons}</span>
                          </p>
                          <div className="border-t border-slate-800 my-1 pt-1 flex justify-between items-center font-bold text-slate-300">
                            <span>Total:</span>
                            <span>{d.total}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Insights Section */}
            <div className="mt-6 bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center text-red-600 shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-wider font-mono">Engagement Diagnostics</h4>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    1. <strong>Preferred Activity:</strong> Students show a strong preference for <strong>Practical Workshops</strong> (totaling 250+ entries).<br />
                    2. <strong>Peak Engagement:</strong> Seasonal analysis indicates <strong>July</strong> is the peak participation month (140 registrations).
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-[10px] text-slate-400 font-mono flex items-center justify-between">
            <span>Unified Database: {candidates.length} profiles</span>
            <span className="text-red-500 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" /> Real-time Sync Active
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
                <span className="font-mono z-15 text-slate-400 text-[10px] font-bold">{lectureCount} students</span>
                <div className="absolute left-0 top-0 bottom-0 bg-red-600 w-1 opacity-80" />
              </div>

              <div 
                onClick={() => setActiveSectionModal('funnel_workshop')}
                className="relative p-2.5 bg-slate-900 text-slate-100 rounded-xl text-xs flex justify-between items-center overflow-hidden max-w-[90%] mx-auto hover:bg-slate-850 transition-colors cursor-pointer group"
              >
                <span className="font-semibold z-15 flex items-center gap-1">
                  2. Practical Workshop <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-red-500 transition-colors" />
                </span>
                <span className="font-mono z-15 text-slate-450 text-[10px] font-bold">{workshopCount} students</span>
                <div className="absolute left-0 top-0 bottom-0 bg-red-600 w-1 opacity-80" />
              </div>

              <div 
                onClick={() => setActiveSectionModal('funnel_hackathon')}
                className="relative p-2.5 bg-slate-800 text-slate-200 rounded-xl text-xs flex justify-between items-center overflow-hidden max-w-[80%] mx-auto hover:bg-slate-750 transition-colors cursor-pointer group"
              >
                <span className="font-semibold z-15 flex items-center gap-1">
                  3. Industry Hackathon <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-red-500 transition-colors" />
                </span>
                <span className="font-mono z-15 text-slate-400 text-[10px] font-bold">{hackathonCount} students</span>
                <div className="absolute left-0 top-0 bottom-0 bg-red-600 w-1 opacity-50" />
              </div>

              <div 
                onClick={() => setActiveSectionModal('funnel_mentorship')}
                className="relative p-2.5 bg-slate-700 text-slate-300 rounded-xl text-xs flex justify-between items-center overflow-hidden max-w-[70%] mx-auto font-bold hover:bg-slate-600 transition-colors cursor-pointer group text-slate-100"
              >
                <span className="font-semibold z-15 text-slate-100 flex items-center gap-1">
                  4. Direct Mentorship <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-500 transition-colors" />
                </span>
                <span className="font-mono z-15 text-slate-200 font-bold text-[10px]">{mentorshipCount} students</span>
                <div className="absolute left-0 top-0 bottom-0 bg-red-600 w-1" />
              </div>

              <div 
                onClick={() => setActiveSectionModal('funnel_placement')}
                className="relative p-2.5 bg-slate-100 text-slate-750 border border-slate-200 rounded-xl text-xs flex justify-between items-center overflow-hidden max-w-[60%] mx-auto hover:bg-slate-200 transition-colors cursor-pointer group"
              >
                <span className="font-semibold z-15 text-red-600 flex items-center gap-1">
                  5. Placement Pipeline <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-red-600 transition-colors" />
                </span>
                <span className="font-mono z-15 font-bold text-slate-500 text-[10px]">{placementCount} students</span>
                <div className="absolute left-0 top-0 bottom-0 bg-red-600 w-1" />
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
                          <span className="inline-flex items-center gap-0.5 mt-1 px-1.5 py-0.2 bg-slate-200/60 rounded text-[9px] font-mono text-slate-600">
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
