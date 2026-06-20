import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Project } from '../../types';
import { Code, ExternalLink, Plus, X } from 'lucide-react';

interface PortfolioTabProps {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  showToast: (msg: string) => void;
}

export default function PortfolioTab({ projects, setProjects, showToast }: PortfolioTabProps) {
  const [showAddProject, setShowAddProject] = useState(false);
  const [newProjTitle, setNewProjTitle] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newProjTech, setNewProjTech] = useState('');
  const [newProjComp, setNewProjComp] = useState('');

  return (
    <div id="view-portfolio" className="space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="font-display font-bold text-2xl text-slate-900">Engineering Rigor & Design Portfolio</h2>
          <p className="text-slate-500 text-xs mt-1">Showcasing projects leveraging active Würth Elektronik components</p>
        </div>
        <button 
          onClick={() => setShowAddProject(true)}
          className="px-4 py-2 bg-red-600 text-white font-semibold text-xs rounded-lg hover:bg-red-700 transition flex items-center gap-2 shadow-sm shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          New Project Entry
        </button>
      </div>

      {/* Grid of engineering projects */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((proj) => (
          <div 
            key={proj.id} 
            className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
          >
            {/* Cover Photo */}
            <div className="h-44 bg-slate-100 overflow-hidden relative">
              <img 
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                src={proj.imageUrl} 
                alt={proj.title}
                referrerPolicy="no-referrer"
              />
              {proj.featured && (
                <span className="absolute top-3 left-3 px-2.5 py-1 bg-red-600 text-white font-semibold text-[9px] uppercase tracking-wider rounded-md shadow-sm">
                  Featured Entry
                </span>
              )}
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between">
              {/* Technical Specs */}
              <div>
                <h4 className="font-display font-semibold text-sm text-slate-900 tracking-tight">{proj.title}</h4>
                <p className="text-slate-500 text-xs mt-2 leading-relaxed line-clamp-3">{proj.description}</p>
                
                {/* Hardware list */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 font-mono tracking-wider block">WE HARDWARE USED</span>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {proj.components.map((comp, idx) => (
                      <span key={idx} className="bg-red-50 text-red-600 text-[10px] px-2 py-0.5 rounded font-medium border border-red-100/50">
                        {comp}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Tech stack badges */}
                <div className="mt-3">
                  <span className="text-[10px] text-slate-400 font-mono tracking-wider block">TECH STACK</span>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {proj.tech.map((t, idx) => (
                      <span key={idx} className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded font-mono">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Lower links */}
              <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-100">
                <a 
                  href={proj.codeUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => { e.preventDefault(); showToast(`Simulated redirect: Opening ${proj.title} codebase...`); }}
                  className="flex-1 py-1.5 border border-slate-200 hover:border-slate-800 hover:bg-slate-50 text-slate-700 text-xs font-semibold text-center rounded-lg transition flex items-center justify-center gap-1.5"
                >
                  <Code className="w-3.5 h-3.5" />
                  Code
                </a>
                <a 
                  href={proj.demoUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => { e.preventDefault(); showToast(`Opening simulation interface for ${proj.title}...`); }}
                  className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-850 text-white text-xs font-semibold text-center rounded-lg transition flex items-center justify-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Demo
                </a>
              </div>
            </div>
          </div>
        ))}

        {/* Simulated empty slot block */}
        <div 
          onClick={() => setShowAddProject(true)}
          className="border-2 border-dashed border-slate-300 hover:border-slate-800 text-slate-400 hover:text-slate-800 rounded-3xl p-6 flex flex-col items-center justify-center text-center transition cursor-pointer min-h-[350px] bg-slate-50/50 hover:bg-white"
        >
          <div className="w-12 h-12 bg-slate-100 hover:bg-slate-200 rounded-2xl flex items-center justify-center mb-3">
            <Plus className="w-6 h-6 text-slate-500" />
          </div>
          <h4 className="font-display font-semibold text-sm text-slate-900 tracking-tight">Add New Project Record</h4>
          <p className="text-slate-500 text-xs mt-1.5 max-w-[200px] leading-relaxed">
            Document your latest engineering achievement, capstone structure, or published research paper.
          </p>
        </div>
      </div>

      {/* New Project Registration Modal */}
      <AnimatePresence>
        {showAddProject && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 max-w-lg w-full shadow-2xl relative overflow-hidden"
            >
              <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
                <div>
                  <h3 className="font-display font-bold text-base text-slate-900 tracking-tight">New Engineering Project Registration</h3>
                  <p className="text-slate-500 text-[11px] mt-0.5">Submit lab layouts or software designs to passport profile</p>
                </div>
                <button 
                  onClick={() => setShowAddProject(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block mb-1.5">Project Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Low-Noise High Dissipation Converter"
                    value={newProjTitle}
                    onChange={(e) => setNewProjTitle(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 focus:border-red-600 focus:outline-none rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block mb-1.5 font-mono">Component Description</label>
                  <textarea 
                    placeholder="Summarize the core engineering implementation parameters..."
                    value={newProjDesc}
                    onChange={(e) => setNewProjDesc(e.target.value)}
                    rows={3}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 focus:border-red-600 focus:outline-none rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block mb-1.5 font-mono">Tech Stack</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Python, MQTT"
                      value={newProjTech}
                      onChange={(e) => setNewProjTech(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 border border-slate-200 focus:border-red-600 focus:outline-none rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block mb-1.5 font-mono">WE Components Used</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Magi3C, RFID Tags"
                      value={newProjComp}
                      onChange={(e) => setNewProjComp(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 border border-slate-200 focus:border-red-600 focus:outline-none rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100 flex gap-3">
                <button 
                  onClick={() => setShowAddProject(false)}
                  className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition text-center cursor-pointer"
                >
                  Discard Entry
                </button>
                <button 
                  onClick={() => {
                    if (!newProjTitle.trim() || !newProjDesc.trim()) {
                      showToast("Please supply a valid title and descriptions.");
                      return;
                    }
                    
                    const newObj: Project = {
                      id: `p-${Date.now()}`,
                      title: newProjTitle.trim(),
                      description: newProjDesc.trim(),
                      tech: newProjTech ? newProjTech.split(',').map(s=>s.trim()) : ['React', 'C++'],
                      components: newProjComp ? newProjComp.split(',').map(s=>s.trim()) : ['Magi3C Module'],
                      imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400',
                      featured: false,
                      codeUrl: '#',
                      demoUrl: '#'
                    };

                    setProjects(prev => [newObj, ...prev]);
                    setShowAddProject(false);
                    
                    // Reset fields
                    setNewProjTitle('');
                    setNewProjDesc('');
                    setNewProjTech('');
                    setNewProjComp('');

                    showToast(`Successfully registered "${newObj.title}" to portfolio.`);
                  }}
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-850 text-white text-xs font-semibold rounded-lg transition text-center cursor-pointer"
                >
                  Register Project
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
