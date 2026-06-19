import React from 'react';
import { Users, Award, Calendar, Briefcase } from 'lucide-react';

export default function DashboardTab() {
  return (
    <div id="recruiter-view-dashboard" className="space-y-8 max-w-5xl">
      
      {/* Top Row key performance metrics cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest font-semibold block">Students Reached</span>
            <p className="text-2xl font-display font-extrabold text-slate-900 mt-1">2,450</p>
            <span className="text-[10px] text-emerald-600 font-semibold font-mono block mt-1">+12% Year-over-Year</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest font-semibold block font-mono">Avg Pass Score</span>
            <p className="text-2xl font-display font-extrabold text-slate-900 mt-1">78/100</p>
            <span className="text-[10px] text-emerald-600 font-semibold font-mono block mt-1">+3 Points increase</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest font-semibold block font-mono">Completed Labs</span>
            <p className="text-2xl font-display font-extrabold text-slate-900 mt-1">12 YTD</p>
            <span className="text-[10px] text-slate-500 font-semibold font-mono block mt-1">On-schedule</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest block font-mono">Active Matches</span>
            <p className="text-2xl font-display font-extrabold text-slate-900 mt-1">85</p>
            <span className="text-[10px] text-red-600 font-bold font-mono block mt-1">Action Needed</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 shrink-0">
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
              <div className="relative p-2.5 bg-slate-950 text-white rounded-xl text-xs flex justify-between items-center overflow-hidden">
                <span className="font-semibold z-15">1. Guest Lecture Attendee</span>
                <span className="font-mono z-15">500 Students</span>
                <div className="absolute left-0 top-0 bottom-0 bg-red-600 w-px opacity-80" />
              </div>

              <div className="relative p-2.5 bg-slate-900 text-slate-100 rounded-xl text-xs flex justify-between items-center overflow-hidden max-w-[90%] mx-auto">
                <span className="font-semibold z-15">2. Practical Workshop</span>
                <span className="font-mono z-15">300 Students</span>
                <div className="absolute left-0 top-0 bottom-0 bg-red-600 w-px opacity-80" />
              </div>

              <div className="relative p-2.5 bg-slate-800 text-slate-200 rounded-xl text-xs flex justify-between items-center overflow-hidden max-w-[80%] mx-auto">
                <span className="font-semibold z-15">3. Industry Hackathon</span>
                <span className="font-mono z-15">120 Students</span>
                <div className="absolute left-0 top-0 bottom-0 bg-red-600 w-1 rounded-r opacity-50" />
              </div>

              <div className="relative p-2.5 bg-slate-700 text-slate-300 rounded-xl text-xs flex justify-between items-center overflow-hidden max-w-[70%] mx-auto font-bold text-slate-900">
                <span className="font-semibold z-15 text-slate-100">4. Direct Mentorship</span>
                <span className="font-mono z-15 text-slate-50 font-bold">50 Students</span>
                <div className="absolute left-0 top-0 bottom-0 bg-red-600 w-1 rounded-r" />
              </div>

              <div className="relative p-2.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs flex justify-between items-center overflow-hidden max-w-[60%] mx-auto">
                <span className="font-semibold z-15 text-red-600">5. Signed Placements</span>
                <span className="font-mono z-15 font-bold">20 Candidates</span>
                <div className="absolute left-0 top-0 bottom-0 bg-emerald-500 w-1 rounded-r" />
              </div>
            </div>
          </div>

          <p className="text-[10px] text-slate-400 font-sans leading-tight mt-6 text-center">
            Conversion rate: 4.0% entry-to-placement. High operational compliance.
          </p>
        </div>

      </div>

    </div>
  );
}
