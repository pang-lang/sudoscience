import React from 'react';
import { StudentPerformance } from '../../types';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

interface InsightsTabProps {
  students: StudentPerformance[];
}

export default function InsightsTab({ students }: InsightsTabProps) {
  return (
    <div id="educator-view-insights" className="space-y-6 max-w-7xl mx-auto w-full">
      
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm">
        <div>
          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest font-semibold block">Engagement Logs</span>
          <h2 className="font-display font-bold text-2xl text-slate-900 mt-1">Student Performance Insights</h2>
          <p className="text-slate-500 text-xs mt-1">Real-time attendance indicators and material consumption logs across course registries</p>
        </div>

        <div className="overflow-x-auto mt-8">
          <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
            <thead>
              <tr className="text-[10px] text-slate-400 font-mono bg-slate-50 uppercase tracking-widest font-semibold">
                <th className="px-4 py-3 rounded-l-lg">Student Entity Name</th>
                <th className="px-4 py-3 text-center">Assigned Course</th>
                <th className="px-4 py-3 text-center">Class Attendance</th>
                <th className="px-4 py-3 text-center">Files Consumed</th>
                <th className="px-4 py-3 text-center">Questions Lodged</th>
                <th className="px-4 py-3 text-right rounded-r-lg">Risk Assessment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((stud) => (
                <tr key={stud.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-4 py-3.5 font-semibold text-slate-900 font-sans">{stud.name}</td>
                  <td className="px-4 py-3.5 text-center font-mono text-slate-500">{stud.course}</td>
                  <td className="px-4 py-3.5 text-center font-mono font-semibold text-slate-800">{stud.attendance}%</td>
                  <td className="px-4 py-3.5 text-center font-mono text-slate-600">{stud.resourcesAccessed} views</td>
                  <td className="px-4 py-3.5 text-center font-mono text-slate-600">{stud.questionsAsked} asked</td>
                  
                  <td className="px-4 py-3.5 text-right">
                    {stud.flagged ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 font-semibold rounded-lg border border-amber-200 text-[11px] ml-auto">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                        LOW ENGAGEMENT
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 font-semibold rounded-lg border border-emerald-150 text-[11px] ml-auto">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        OPERATIVE SATISFACTORY
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
