import React, { useState } from 'react';
import { LearningMaterial } from '../../types';
import { Upload, Trash2 } from 'lucide-react';

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
            onClick={() => {
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
              setMaterials(prev => [newFile, ...prev]);
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
                        onClick={() => {
                          setMaterials(prev => prev.filter(m => m.id !== mat.id));
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

    </div>
  );
}
