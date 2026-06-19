import React, { useState } from 'react';
import { Opportunity } from '../../types';
import { Search, Heart, MapPin, Clock, Check } from 'lucide-react';

interface CareersTabProps {
  opportunities: Opportunity[];
  setOpportunities: React.Dispatch<React.SetStateAction<Opportunity[]>>;
  showToast: (msg: string) => void;
}

export default function CareersTab({ opportunities, setOpportunities, showToast }: CareersTabProps) {
  const [selectedJobFilter, setSelectedJobFilter] = useState<'All' | 'Internship' | 'Hiwi' | 'Thesis' | 'Graduate Program'>('All');
  const [jobSearchQuery, setJobSearchQuery] = useState('');

  return (
    <div id="view-opportunities" className="space-y-6 max-w-5xl">
      {/* Filter list options */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm">
        <div className="max-w-2xl">
          <h2 className="font-display font-bold text-2xl text-slate-900">Würth Engineering Placement Program</h2>
          <p className="text-slate-500 text-xs mt-1 leading-relaxed">
            Bridge experimental engineering research with direct factory lines. Explore global placement pathways supervised jointly by professional engineering staff.
          </p>
        </div>

        {/* Filters Row */}
        <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Category Filter Cards */}
          <div className="flex flex-wrap gap-2">
            {(['All', 'Internship', 'Hiwi', 'Thesis', 'Graduate Program'] as const).map((category) => (
              <button
                key={category}
                onClick={() => setSelectedJobFilter(category)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition ${
                  selectedJobFilter === category 
                    ? 'bg-red-600 text-white shadow-xs' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Search Engine field */}
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search roles or locations..."
              value={jobSearchQuery}
              onChange={(e) => setJobSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-red-600"
            />
          </div>
        </div>
      </div>

      {/* Opp Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {opportunities
          .filter(o => selectedJobFilter === 'All' || o.type === selectedJobFilter)
          .filter(o => 
            o.title.toLowerCase().includes(jobSearchQuery.toLowerCase()) || 
            o.company.toLowerCase().includes(jobSearchQuery.toLowerCase()) ||
            o.location.toLowerCase().includes(jobSearchQuery.toLowerCase())
          )
          .map((opp) => (
            <div 
              key={opp.id} 
              className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition relative group"
            >
              {/* Interactive Bookmark */}
              <button 
                onClick={() => {
                  setOpportunities(prev => prev.map(o => o.id === opp.id ? { ...o, saved: !o.saved } : o));
                  showToast(opp.saved ? "Removed Bookmark from Dashboard" : "Added Bookmark: Role Saved");
                }}
                className="absolute top-5 right-5 w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 transition hover:bg-slate-50 cursor-pointer"
              >
                <Heart className={`w-4 h-4 ${opp.saved ? 'fill-red-500 stroke-red-500' : ''}`} />
              </button>

              {/* Top profile block */}
              <div>
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${opp.logoColor} text-white font-mono flex items-center justify-center font-bold text-center shrink-0 shadow-inner`}>
                    {opp.company[0]}
                  </div>
                  <div>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 font-semibold text-[9px] uppercase tracking-wider rounded">
                      {opp.type}
                    </span>
                    <h4 className="font-display font-semibold text-sm text-slate-950 mt-1 leading-snug">
                      {opp.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">{opp.company}</p>
                  </div>
                </div>

                {/* Location Details block */}
                <div className="mt-4 grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-600">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{opp.location}</span>
                  </div>
                  <div className="flex items-center gap-1 justify-end text-right">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Starts: {opp.starts}</span>
                  </div>
                </div>

                <p className="text-slate-500 text-xs mt-4 leading-relaxed font-sans line-clamp-3">
                  {opp.description}
                </p>
              </div>

              {/* Lower actions apply */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-mono text-red-500 bg-red-50 px-2 py-0.5 rounded font-semibold uppercase tracking-wide">
                  {opp.countdown}
                </span>

                {opp.applied ? (
                  <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 pr-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    Applied
                  </span>
                ) : (
                  <button 
                    onClick={() => {
                      setOpportunities(prev => prev.map(o => o.id === opp.id ? { ...o, applied: true } : o));
                      showToast(`Application submitted dynamically for ${opp.title}!`);
                    }}
                    className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition cursor-pointer"
                  >
                    Apply Now
                  </button>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
