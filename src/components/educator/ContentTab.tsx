import React, { useState } from 'react';
import { LearningMaterial } from '../../types';
import { Upload, Trash2, MessageSquare } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ContentTabProps {
  materials: LearningMaterial[];
  setMaterials: React.Dispatch<React.SetStateAction<LearningMaterial[]>>;
  showToast: (msg: string) => void;
}

export default function ContentTab({ materials, setMaterials, showToast }: ContentTabProps) {
  const [newFileTitle, setNewFileTitle] = useState('');
  const [newFileType, setNewFileType] = useState<'Video' | 'Slide' | 'Document' | 'Code'>('Slide');
  const [newFileSize, setNewFileSize] = useState('');

  return (
    <div id="educator-view-content" className="space-y-6 max-w-7xl mx-auto w-full">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Upload drag-and-drop simulated console */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 md:p-8 flex flex-col justify-between shadow-sm">
          <div>
            <div className="mb-6 pb-2 border-b border-slate-100">
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest font-semibold block">Academic Repository</span>
              <h3 className="font-display font-semibold text-base text-slate-900 tracking-tight mt-0.5">Upload Lesson Materials</h3>
            </div>

            <p className="text-slate-500 text-xs leading-relaxed mb-6">
              Publish lecture documents, slide arrays, or simulation code files directly into the student-accessible Learning Center.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block mb-1.5 font-mono">Resource Designation</label>
                <input 
                  type="text" 
                  placeholder="e.g. Electromagnetic Shielding Principles"
                  value={newFileTitle}
                  onChange={(e) => setNewFileTitle(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-200 focus:border-slate-800 rounded-xl focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block mb-1.5 font-mono">Material Type</label>
                  <select 
                    value={newFileType}
                    onChange={(e) => setNewFileType(e.target.value as any)}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-250 focus:border-slate-800 rounded-xl focus:outline-none cursor-pointer"
                  >
                    <option value="Slide">Slide Reference</option>
                    <option value="Video">Video Session</option>
                    <option value="Document">PDF Document</option>
                    <option value="Code">ZIP Source Code</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block mb-1.5 font-mono">File Dimensions / Size</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 5.6 MB or 1h 10m"
                    value={newFileSize}
                    onChange={(e) => setNewFileSize(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 focus:border-slate-800 rounded-xl focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic simulated file trigger */}
          <button 
            onClick={async () => {
              if (!newFileTitle.trim()) {
                showToast("Please provide a valid file designation.");
                return;
              }
              const newFile: LearningMaterial = {
                id: `m-${Date.now()}`,
                fileName: newFileTitle.trim(),
                type: newFileType,
                durationOrSize: newFileSize ? newFileSize.trim() : '2.1 MB',
                uploadDate: 'Now',
                views: 0,
                downloads: 0
              };
              
              // Optimistic UI Update
              setMaterials(prev => [newFile, ...prev]);
              
              // Persist to Supabase
              const { error } = await supabase.from('learning_materials').insert({
                id: newFile.id,
                file_name: newFile.fileName,
                type: newFile.type,
                duration_or_size: newFile.durationOrSize,
                upload_date: newFile.uploadDate,
                views: newFile.views,
                downloads: newFile.downloads
              });

              if (error) {
                console.error("Error inserting material:", error);
                showToast("Failed to save to database. Check console.");
                // Revert optimistic update
                setMaterials(prev => prev.filter(m => m.id !== newFile.id));
                return;
              }

              showToast(`Successfully registered and published file: "${newFile.fileName}"`);
              
              // reset fields
              setNewFileTitle('');
              setNewFileSize('');
            }}
            className="w-full mt-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm block cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            Publish Resource entry
          </button>
        </div>

        {/* File list spreadsheet */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm">
          <div className="flex justify-between items-baseline mb-6 border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest block">Active Inventory</span>
              <h3 className="font-display font-semibold text-base text-slate-900 mt-0.5 tracking-tight">Published Lesson Repositories</h3>
            </div>
            <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-bold">
              {materials.length} files
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
              <thead>
                <tr className="text-[10px] text-slate-400 font-mono bg-slate-50 uppercase tracking-widest font-semibold">
                  <th className="px-4 py-3 rounded-l-lg">Document Parameters</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3 text-center">Engagement Counters</th>
                  <th className="px-4 py-3 text-right rounded-r-lg">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {materials.map((mat) => (
                  <tr key={mat.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-slate-900 block font-sans">{mat.fileName}</span>
                      <span className="text-[10px] text-slate-400 font-mono italic block mt-0.5">Dimensions: {mat.durationOrSize} &middot; Added {mat.uploadDate}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 font-mono text-[9px] rounded">
                        {mat.type}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="text-[11px] font-mono font-medium text-slate-600 block">
                        Views: {mat.views} &middot; DLs: {mat.downloads}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button 
                        onClick={async () => {
                          const previousMaterials = [...materials];
                          setMaterials(prev => prev.filter(m => m.id !== mat.id));
                          
                          const { error } = await supabase.from('learning_materials').delete().eq('id', mat.id);
                          if (error) {
                            console.error("Error deleting material:", error);
                            showToast("Failed to delete from database.");
                            setMaterials(previousMaterials); // Revert
                            return;
                          }
                          
                          showToast("Acoustic files archiving simulation successful.");
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-slate-100 transition cursor-pointer"
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

      {/* --- INCOMING STUDENT QUESTIONS --- */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm">
        <h3 className="font-display font-semibold text-lg text-slate-900 flex items-center gap-2 mb-1">
          <MessageSquare className="w-5 h-5 text-red-500" />
          Incoming Student Questions
        </h3>
        <p className="text-slate-500 text-xs mb-6">Direct messages from students regarding your uploaded session materials.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="bg-red-100 text-red-800 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-widest">New Question</span>
                <span className="text-[10px] text-slate-400 font-mono">10:05 AM</span>
              </div>
              <p className="text-xs font-semibold text-slate-900 mb-1">Regarding: EMC_Shielding_Principles.pdf</p>
              <p className="text-xs text-slate-600 italic">"Hi! Could you clarify how the MagI3C power module handles thermal dissipation under full load as shown on slide 12?"</p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-200 flex items-center gap-3">
              <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150" alt="Student" className="w-8 h-8 rounded-full border border-slate-300" />
              <div className="flex-1">
                <p className="text-xs font-bold text-slate-900">Alex Chen</p>
                <p className="text-[10px] text-slate-500">TU Munich &middot; Match Score: 92</p>
              </div>
              <button 
                onClick={() => showToast('Opening chat interface...')}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-semibold transition cursor-pointer"
              >
                Reply
              </button>
            </div>
          </div>

          <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="bg-slate-200 text-slate-600 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-widest">Unread</span>
                <span className="text-[10px] text-slate-400 font-mono">Yesterday, 14:30 PM</span>
              </div>
              <p className="text-xs font-semibold text-slate-900 mb-1">Regarding: Wireless_Power_Transfer_Coils.pdf</p>
              <p className="text-xs text-slate-600 italic">"Hello, I was wondering how the coupling coefficient affects the efficiency of the WE-WPCC coils described on page 4?"</p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-200 flex items-center gap-3">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150" alt="Student" className="w-8 h-8 rounded-full border border-slate-300 object-cover" />
              <div className="flex-1">
                <p className="text-xs font-bold text-slate-900">Sarah Jenkins</p>
                <p className="text-[10px] text-slate-500">TU Munich &middot; Match Score: 88</p>
              </div>
              <button 
                onClick={() => showToast('Opening chat interface...')}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-semibold transition cursor-pointer"
              >
                Reply
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
