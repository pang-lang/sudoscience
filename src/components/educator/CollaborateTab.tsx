import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CapstoneProject } from '../../types';
import { UserPlus, CheckCircle2, X } from 'lucide-react';

interface CollaborateTabProps {
  capstones: CapstoneProject[];
  setCapstones: React.Dispatch<React.SetStateAction<CapstoneProject[]>>;
  showToast: (msg: string) => void;
}

export default function CollaborateTab({ capstones, setCapstones, showToast }: CollaborateTabProps) {
  const [showLecturerModal, setShowLecturerModal] = useState(false);
  const [lecturerName, setLecturerName] = useState('');
  const [lecturerTopic, setLecturerTopic] = useState('Electromagnetic Compatibility (EMC)');
  const [lecturerDate, setLecturerDate] = useState('');

  return (
    <div id="educator-view-collaborate" className="space-y-6 max-w-7xl mx-auto w-full">
      
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="font-display font-bold text-2xl text-slate-900">Academic & Corporate Collaboration</h2>
          <p className="text-slate-500 text-xs mt-1">Submit student achievements or schedule masterclass guest lecturers with Würth staff</p>
        </div>
        
        <button 
          onClick={() => setShowLecturerModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition flex items-center gap-2 shadow-sm shrink-0 cursor-pointer text-center"
        >
          <UserPlus className="w-4 h-4" />
          Invite Guest Lecturer
        </button>
      </div>

      {/* Capstones Grid */}
      <div>
        <h3 className="font-display font-semibold text-base text-slate-900 mb-4 tracking-tight">Active Team Capstone Initiatives</h3>
        
        <div id="capstones-grid" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {capstones.map((cap) => (
            <div 
              key={cap.id} 
              className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition"
            >
              <div>
                {/* Upper row header */}
                <div className="flex items-center justify-between mb-4">
                  <span className="px-2.5 py-0.5 bg-blue-50 text-blue-600 font-mono text-[9px] uppercase tracking-wider rounded font-bold">
                    {cap.category}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono tracking-wider">Team count: {cap.teamCount} members</span>
                </div>

                <h4 className="font-display font-semibold text-base text-slate-955 tracking-tight leading-snug">
                  {cap.title}
                </h4>
                <p className="text-slate-500 text-xs mt-3 leading-relaxed font-sans">{cap.description}</p>
              </div>

              {/* Lower share triggers */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400">Class Ref: WE-CAP-{cap.id}</span>
                
                {cap.sharedWithWE ? (
                  <span className="text-emerald-700 bg-emerald-50 border border-emerald-150 px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Shared with Recruiter
                  </span>
                ) : (
                  <button 
                    onClick={() => {
                      setCapstones(prev => prev.map(c => c.id === cap.id ? { ...c, sharedWithWE: true } : c));
                      showToast(`Success: project portfolio dispatched to Würth Elektronik!`);
                    }}
                    className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition cursor-pointer"
                  >
                    Share with Recruiter
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Guest Lecturer Invitation Modal */}
      <AnimatePresence>
        {showLecturerModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 max-w-md w-full shadow-2xl relative"
            >
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-6">
                <div>
                  <h3 className="font-display font-bold text-base text-slate-900 tracking-tight">Initiate Guest Lecturer Invitation</h3>
                  <p className="text-slate-500 text-[11px] mt-0.5">Invite a Würth FAE to present directly to active classes</p>
                </div>
                <button 
                  onClick={() => setShowLecturerModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block mb-1.5 font-mono">Lecturer Target / Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Marcus Schmidt (Technical Lead EMEA)"
                    value={lecturerName}
                    onChange={(e) => setLecturerName(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 focus:border-blue-600 focus:outline-none rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block mb-1.5 font-mono">Technical Theme</label>
                  <select 
                    value={lecturerTopic}
                    onChange={(e) => setLecturerTopic(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-250 focus:border-blue-600 focus:outline-none rounded-xl cursor-pointer"
                  >
                    <option value="EMI Shielding & Filter Design">EMI Shielding & Filter Design</option>
                    <option value="Wireless Power Transmission Systems">Wireless Power Transmission Systems</option>
                    <option value="Autonomous IoT & RFID Systems Integration">Autonomous IoT & RFID Systems Integration</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block mb-1.5 font-mono">Preferred Webinar Date</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Nov 14, 2024 at 14:00 CEST"
                    value={lecturerDate}
                    onChange={(e) => setLecturerDate(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 focus:border-blue-600 focus:outline-none rounded-xl"
                  />
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100 flex gap-3">
                <button 
                  onClick={() => setShowLecturerModal(false)}
                  className="flex-1 py-2.5 border border-slate-250 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition text-center cursor-pointer font-sans"
                >
                  Cancel Invite
                </button>
                
                <button 
                  onClick={() => {
                    if (!lecturerName.trim()) {
                      showToast("Please provide a target lecturer name.");
                      return;
                    }
                    showToast(`Dispatching Lecturer invite for: "${lecturerName.trim()}" successfully!`);
                    setShowLecturerModal(false);
                    setLecturerName('');
                    setLecturerDate('');
                  }}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition text-center cursor-pointer"
                >
                  Send Request Dispatch
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
