import React, { useState } from 'react';
import { PostedOpportunity } from '../../types';
import { Plus, Trash2 } from 'lucide-react';

interface OpportunitiesTabProps {
  postings: PostedOpportunity[];
  setPostings: React.Dispatch<React.SetStateAction<PostedOpportunity[]>>;
  showToast: (msg: string) => void;
}

export default function OpportunitiesTab({ postings, setPostings, showToast }: OpportunitiesTabProps) {
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState('Internship');
  const [formDeadline, setFormDeadline] = useState('');
  const [formSkills, setFormSkills] = useState('');

  return (
    <div id="recruiter-view-opportunities" className="space-y-6 max-w-7xl mx-auto w-full">
      
      {/* Layout split: Form Left, Table Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Left Side */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm">
          <div className="mb-6 pb-2 border-b border-slate-100">
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest font-semibold block">Placement Editor</span>
            <h3 className="font-display font-semibold text-lg text-slate-900 tracking-tight mt-0.5">Post New Opportunity</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block mb-1.5 font-mono">Opportunity Title</label>
              <input 
                type="text" 
                placeholder="e.g. PCB Antenna Shielding Analyst"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 border border-slate-200 focus:border-slate-800 rounded-xl focus:outline-none focus:bg-white"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block mb-1.5 font-mono">Engagement Classification</label>
              <select 
                value={formType}
                onChange={(e) => setFormType(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 border border-slate-250 focus:border-slate-800 rounded-xl focus:outline-none cursor-pointer"
              >
                <option value="Internship">Internship Placement</option>
                <option value="Hiwi">Hiwi (Research Assistant)</option>
                <option value="Thesis">B.Sc. / M.Sc. Thesis Project</option>
                <option value="Graduate Program">Corporate Graduate Program</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block mb-1.5 font-mono">Required Skills (comma-separated)</label>
              <input 
                type="text" 
                placeholder="e.g. PCB Design, SolidWorks, Python"
                value={formSkills}
                onChange={(e) => setFormSkills(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 border border-slate-200 focus:border-slate-800 rounded-xl focus:outline-none focus:bg-white"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block mb-1.5 font-mono">Closing Application Deadline</label>
              <input 
                type="date"
                value={formDeadline}
                onChange={(e) => setFormDeadline(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 border border-slate-200 focus:border-slate-800 rounded-xl focus:outline-none focus:bg-white cursor-pointer"
              />
              <p className="text-[9px] text-slate-400 font-mono mt-1">Leave blank for rolling admission</p>
            </div>

            <button 
              onClick={() => {
                if (!formTitle.trim()) {
                  showToast("Please provide a valid placement title.");
                  return;
                }
                const formattedDeadline = formDeadline
                  ? new Date(formDeadline + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
                  : 'Rolling Admission';
                
                const skillsArr = formSkills
                  ? formSkills.split(',').map(s => s.trim()).filter(Boolean)
                  : [];
                
                const newPost: PostedOpportunity = {
                  id: `p-${Date.now()}`,
                  title: formTitle.trim(),
                  type: formType,
                  deadline: formattedDeadline,
                  applicantsCount: 0,
                  status: 'Active',
                  requiredSkills: skillsArr
                };
                setPostings(prev => [newPost, ...prev]);
                showToast(`Successfully published: "${newPost.title}"`);
                
                // reset
                setFormTitle('');
                setFormDeadline('');
                setFormSkills('');
              }}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-850 text-white font-semibold text-xs rounded-xl transition shadow flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Publish Position Listing
            </button>
          </div>
        </div>

        {/* Table Right Side */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm">
          <div className="flex justify-between items-baseline mb-6 border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest block">Active Listing</span>
              <h3 className="font-display font-semibold text-base text-slate-900 tracking-tight mt-0.5">Active Posted Opportunities</h3>
            </div>
            <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded font-bold">
              {postings.filter(p=>p.status === 'Active').length} Active
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
              <thead>
                <tr className="text-[10px] text-slate-400 font-mono bg-slate-50 uppercase tracking-widest font-semibold">
                  <th className="px-4 py-3 rounded-l-lg">Placement Title</th>
                  <th className="px-4 py-3">Required Skills</th>
                  <th className="px-4 py-3">Classification</th>
                  <th className="px-4 py-3 text-center">Applicants</th>
                  <th className="px-4 py-3 text-right rounded-r-lg">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {postings.map((post) => (
                  <tr key={post.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-slate-900 block font-sans">{post.title}</span>
                      <span className="text-[10px] text-slate-400 font-mono italic block mt-0.5">Deadline: {post.deadline}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {(post.requiredSkills && post.requiredSkills.length > 0 ? post.requiredSkills : ['Project Management']).map((s, idx) => (
                          <span key={idx} className="bg-slate-100 text-slate-650 px-1.5 py-0.5 rounded text-[9px] font-semibold font-mono tracking-wide">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 font-mono text-[9px] rounded">
                        {post.type}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center relative group/tooltip">
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-red-50 text-red-600 font-mono rounded font-bold cursor-help">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                        {post.applicantsCount}
                      </span>
                      {post.applicantNames && post.applicantNames.length > 0 && (
                        <div className="absolute z-20 invisible group-hover/tooltip:visible bg-slate-900 text-white text-[10px] p-2.5 rounded-xl shadow-xl w-40 bottom-full left-1/2 -translate-x-1/2 mb-1.5 border border-slate-700 font-sans text-left transition-all duration-200">
                          <p className="font-bold border-b border-slate-800 pb-1 mb-1 font-mono uppercase tracking-wider text-[8px] text-slate-400">Applicant List</p>
                          <ul className="space-y-1 font-medium">
                            {post.applicantNames.map((name, nIdx) => (
                              <li key={nIdx} className="truncate">• {name}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button 
                        onClick={() => {
                          setPostings(prev => prev.filter(p => p.id !== post.id));
                          showToast("Opportunity archiving simulation successful.");
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
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
