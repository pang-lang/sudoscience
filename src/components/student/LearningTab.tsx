import React, { useState } from 'react';
import { MasterclassEvent, LearningMaterial } from '../../types';
import { Clock, MessageSquare, MapPin, CheckCircle2, Ticket, Video, FileText, Download } from 'lucide-react';

interface LearningTabProps {
  events: MasterclassEvent[];
  setEvents: React.Dispatch<React.SetStateAction<MasterclassEvent[]>>;
  materials: LearningMaterial[];
  showToast: (msg: string) => void;
  setCurrentTab: (tab: 'passport' | 'portfolio' | 'learn' | 'opportunities' | 'network' | 'ticket') => void;
}

export default function LearningTab({ events, setEvents, materials, showToast, setCurrentTab }: LearningTabProps) {
  const [materialsTypeFilter, setMaterialsTypeFilter] = useState<'All' | 'Video' | 'Slide' | 'Code'>('All');

  return (
    <div id="view-learn" className="space-y-8 max-w-7xl mx-auto w-full">
      {/* Header Title context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="font-display font-bold text-2xl text-slate-900">WE Academy Learning Center</h2>
          <p className="text-slate-500 text-xs mt-1">Master engineering basics with certified industry-first tutorial blocks</p>
        </div>
        {/* Floating Feedback Trigger */}
        <button 
          onClick={() => showToast("Feedback Desk online. How can we support your training curriculum?")}
          className="px-4 py-2 bg-red-600 text-white font-semibold text-xs rounded-xl hover:bg-red-700 transition flex items-center gap-2 shadow-md cursor-pointer text-center"
        >
          <MessageSquare className="w-4 h-4" />
          Request Hardware Design Kit
        </button>
      </div>

      {/* Masterclass list */}
      <div>
        <h3 className="font-display font-semibold text-lg text-slate-900 mb-4 tracking-tight">Upcoming Premium Masterclasses</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((evt) => (
            <div key={evt.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs flex flex-col justify-between">
              <div className="p-6">
                <div className="flex items-center justify-between mb-3.5">
                  <span className="px-2.5 py-1 bg-red-50 text-red-600 font-semibold text-[9px] uppercase tracking-wider rounded">
                    {evt.tag}
                  </span>
                  <span className="text-slate-500 text-[11px] font-mono flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {evt.date} &bull; {evt.time}
                  </span>
                </div>

                <h4 className="font-display font-semibold text-base text-slate-950 tracking-tight leading-snug">
                  {evt.title}
                </h4>

                <div className="mt-4 flex items-center gap-3 bg-slate-50 p-2.5 rounded-2xl">
                  <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 font-mono">
                    {evt.speaker[0]}{evt.speaker.split(' ')[1]?.[0] || ''}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900">{evt.speaker}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{evt.speakerTitle} &middot; Würth Elektronik</p>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 font-mono mt-4 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {evt.location}
                </p>
              </div>

              <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-t border-slate-100">
                {/* Attendance ticker */}
                <div className="flex items-center -space-x-1.5 overflow-hidden">
                  <div className="w-6 h-6 rounded-full bg-slate-300 border-2 border-white font-semibold text-[9px] flex items-center justify-center font-mono">P1</div>
                  <div className="w-6 h-6 rounded-full bg-slate-400 border-2 border-white font-semibold text-[9px] flex items-center justify-center font-mono">P2</div>
                  <div className="w-6 h-6 rounded-full bg-slate-500 border-2 border-white font-semibold text-[9px] flex items-center justify-center font-mono">P3</div>
                  <span className="text-[10px] font-mono text-slate-500 pl-2">+{evt.attendeesCount} engineering cohorts</span>
                </div>

                {/* Interactive sign up triggers */}
                {evt.registered ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      CONFIRMED
                    </span>
                    <button 
                      onClick={() => setCurrentTab('ticket')}
                      className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition flex items-center gap-1 cursor-pointer"
                    >
                      <Ticket className="w-3.5 h-3.5" />
                      Boarding Pass
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => {
                      setEvents(prev => prev.map(e => e.id === evt.id ? { ...e, registered: true } : e));
                      showToast("Successfully registered! Ticket issued on Passport.");
                    }}
                    className="px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition cursor-pointer"
                  >
                    Register Today
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Course Materials & Recordings Table representation */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-6 border-b border-slate-100 mb-6">
          <div>
            <h3 className="font-display font-semibold text-base text-slate-900 tracking-tight">Session Materials & Code Snippets</h3>
            <p className="text-slate-500 text-xs">Direct download files compiled during guest lectures and labs</p>
          </div>

          {/* Filter pills */}
          <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl self-start">
            {(['All', 'Video', 'Slide', 'Code'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setMaterialsTypeFilter(filter)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg cursor-pointer transition ${
                  materialsTypeFilter === filter ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Table representation */}
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-slate-100 text-left">
              <thead>
                <tr className="text-[10px] text-slate-400 uppercase font-mono tracking-widest bg-slate-50">
                  <th className="px-4 py-3 font-semibold rounded-l-lg">Document Parameters</th>
                  <th className="px-4 py-3 font-semibold">Categorization</th>
                  <th className="px-4 py-3 font-semibold">Dimensions</th>
                  <th className="px-4 py-3 font-semibold">Date Registered</th>
                  <th className="px-4 py-3 font-semibold rounded-r-lg text-right">Action Desk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {materials
                  .filter(m => materialsTypeFilter === 'All' || m.type === materialsTypeFilter)
                  .map((mat) => (
                  <tr key={mat.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-slate-900 font-sans block">{mat.fileName}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 text-slate-600 font-medium rounded text-[10px]">
                        {mat.type === 'Video' ? <Video className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                        {mat.type}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 font-mono">{mat.durationOrSize}</td>
                    <td className="px-4 py-3.5 text-slate-400 font-mono">{mat.uploadDate}</td>
                    <td className="px-4 py-3.5 text-right">
                      <button 
                        onClick={() => showToast(`Triggering background transfer: ${mat.fileName}...`)}
                        className="px-3 py-1.5 border border-slate-200 hover:border-red-600 hover:text-red-600 rounded-lg text-slate-600 transition flex items-center gap-1 ml-auto cursor-pointer font-semibold text-[11px]"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download Bundle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
