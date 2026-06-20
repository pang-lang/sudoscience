import React, { useState } from 'react';
import { PostedOpportunity } from '../../types';
import { Plus, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface OpportunitiesTabProps {
  postings: PostedOpportunity[];
  setPostings: React.Dispatch<React.SetStateAction<PostedOpportunity[]>>;
  showToast: (msg: string) => void;
}

export default function OpportunitiesTab({ postings, setPostings, showToast }: OpportunitiesTabProps) {
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState('Internship');
  const [formDeadline, setFormDeadline] = useState('');

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
              <label className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block mb-1.5 font-mono">Closing Application Deadline</label>
              <input 
                type="text" 
                placeholder="e.g. Dec 15, 2024 or Rolling"
                value={formDeadline}
                onChange={(e) => setFormDeadline(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 border border-slate-200 focus:border-slate-800 rounded-xl focus:outline-none focus:bg-white"
              />
            </div>

            <button 
              onClick={async () => {
                if (!formTitle.trim()) {
                  showToast("Please provide a valid placement title.");
                  return;
                }
                const newPost: PostedOpportunity = {
                  id: `p-${Date.now()}`,
                  title: formTitle.trim(),
                  type: formType,
                  deadline: formDeadline ? formDeadline.trim() : 'Rolling Admission',
                  applicantsCount: 0,
                  status: 'Active'
                };
                
                // Optimistic UI Update
                setPostings(prev => [newPost, ...prev]);
                
                // Persist to Supabase
                const { error } = await supabase.from('opportunities').insert({
                  id: newPost.id,
                  title: newPost.title,
                  company: 'Würth Elektronik', // Default fallback
                  location: 'Remote / Hybrid', // Default fallback
                  type: newPost.type,
                  starts: 'ASAP',
                  deadline: newPost.deadline,
                  countdown: 'Actively Hiring',
                  description: 'Opportunity listed by recruiter portal.',
                  logo_color: 'bg-red-600'
                });

                if (error) {
                  console.error("Error inserting opportunity:", error);
                  showToast("Failed to save to database. Check console.");
                  // Revert optimistic update
                  setPostings(prev => prev.filter(p => p.id !== newPost.id));
                  return;
                }

                showToast(`Successfully published: "${newPost.title}"`);
                
                // reset
                setFormTitle('');
                setFormDeadline('');
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
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 font-mono text-[9px] rounded">
                        {post.type}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-red-50 text-red-600 font-mono rounded font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                        {post.applicantsCount}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button 
                        onClick={async () => {
                          const previousPostings = [...postings];
                          setPostings(prev => prev.filter(p => p.id !== post.id));
                          
                          const { error } = await supabase.from('opportunities').delete().eq('id', post.id);
                          if (error) {
                            console.error("Error deleting opportunity:", error);
                            showToast("Failed to delete from database.");
                            setPostings(previousPostings); // Revert
                            return;
                          }
                          
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
