import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { StudentProfile, VisaStamp } from '../../types';
import { Award, CheckCircle2, Plus, X, Check } from 'lucide-react';

interface PassportTabProps {
  profile: StudentProfile;
  setProfile: React.Dispatch<React.SetStateAction<StudentProfile>>;
  showToast: (msg: string) => void;
  setCurrentTab: (tab: 'passport' | 'portfolio' | 'learn' | 'opportunities' | 'network' | 'ticket') => void;
}

const availableStamps: VisaStamp[] = [
  { id: 'v3', name: 'EMC Academy Seminar', date: 'Jun 2025', icon: '📡' },
  { id: 'v4', name: 'Wireless Power Lab', date: 'Aug 2025', icon: '🔋' },
  { id: 'v5', name: 'RFID Hackathon Challenge', date: 'Sep 2025', icon: '🏷️' },
  { id: 'v6', name: 'Eco-Design Capstone', date: 'Dec 2025', icon: '🌱' }
];

export default function PassportTab({ profile, setProfile, showToast, setCurrentTab }: PassportTabProps) {
  const [showAddStamp, setShowAddStamp] = useState(false);

  return (
    <div id="view-passport" className="space-y-8 max-w-7xl mx-auto w-full">
      {/* Top overview row with primary passport mock layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Side Card: Physical Industry Passport Display */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between">
          {/* Top bar element */}
          <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center border-b border-slate-800">
            <span className="text-xs font-mono font-medium tracking-widest text-slate-400">EUROPEAN INDUSTRY PASSPORT</span>
            <span className="text-xs font-bold text-red-500">WE Connect</span>
          </div>

          <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 items-start">
            {/* User profile image / badge */}
            <div className="flex flex-col items-center gap-2 self-center md:self-auto">
              <div className="w-28 h-28 rounded-2xl overflow-hidden bg-slate-100 border-2 border-slate-200 shadow-inner flex items-center justify-center group relative">
                <img 
                  className="w-full h-full object-cover grayscale opacity-90 group-hover:grayscale-0 transition duration-300"
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300" 
                  alt="Sarah Jenkins Passport Portrait"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-1.5 right-1.5 bg-emerald-500 text-white w-5 h-5 rounded-full flex items-center justify-center border border-white">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              </div>
              <span className="text-[10px] font-mono font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-sm uppercase tracking-wide">
                Verified Identity
              </span>
            </div>

            {/* Passport detail table specs */}
            <div className="flex-1 space-y-3 font-mono">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block">Surname / First Name</span>
                <span className="text-sm font-semibold text-slate-950 font-sans tracking-tight">JENKINS, Sarah</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block">Education Entity</span>
                  <span className="text-[11px] font-semibold text-slate-800 font-sans leading-tight block mt-0.5">MUAS Engineering Org</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block">Verification Ref</span>
                  <span className="text-[11px] font-mono text-slate-800 uppercase block mt-0.5">TKT-8492-XJZ</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-1">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block">Engagement Tier</span>
                  <span className="text-[11px] text-slate-800 font-sans font-medium flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Level 3 Gold
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block">Industry Status</span>
                  <span className="text-[11px] text-red-600 font-sans font-bold uppercase tracking-wider block mt-0.5">
                    INDUSTRY READY &bull;
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Signature / footer */}
          <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest block">Signature</span>
              <span className="font-serif italic text-sm text-slate-600 pointer-events-none">S. Jenkins</span>
            </div>
            <div className="text-right">
              <span className="text-[9px] text-slate-400 font-mono uppercase tracking-widest">Würth Certification</span>
              <p className="text-[10px] font-semibold font-mono text-slate-700">MD-ACC-SECURED-92A</p>
            </div>
          </div>
        </div>

        {/* Right Card: Dynamic Visas & Stamps Booklet */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">Passport Booklet</span>
                <h3 className="font-display font-semibold text-base text-slate-900 tracking-tight">Validation Stamps (Page 07)</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono tracking-wider font-semibold">Active: {profile.stamps.length}</span>
            </div>

            <p className="text-slate-500 text-xs leading-relaxed mb-6">
              Earn active stamps by registering for sessions, completing technical evaluations, or submitting code reviews.
            </p>

            {/* Passport Stamps Grid */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              {profile.stamps.map((stamp) => (
                <div 
                  key={stamp.id} 
                  className="bg-red-50/50 border border-red-100 rounded-2xl p-4 flex flex-col items-center justify-center text-center relative overflow-hidden hover:scale-105 transition duration-200"
                >
                  <div className="text-3xl mb-2 opacity-90">{stamp.icon}</div>
                  <span className="text-xs font-semibold text-slate-800 leading-tight block">{stamp.name}</span>
                  <span className="text-[9px] text-slate-400 font-mono block mt-1 uppercase tracking-wide">{stamp.date}</span>
                  <div className="absolute inset-2 border border-dashed border-red-500/15 rounded-xl pointer-events-none" />
                </div>
              ))}

              {/* Add new stamp placeholder option */}
              <button 
                onClick={() => setShowAddStamp(true)}
                className="border border-dashed border-slate-300 hover:border-slate-800 text-slate-400 hover:text-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center transition cursor-pointer bg-slate-50/50 hover:bg-white"
              >
                <Plus className="w-5 h-5 mb-1 text-slate-400" />
                <span className="text-xs font-medium block">Secure stamp</span>
                <span className="text-[9px] text-slate-400 font-mono block mt-1 uppercase">Request</span>
              </button>
            </div>
          </div>

          <button 
            onClick={() => {
              showToast("Generating comprehensive report...");
              setCurrentTab('portfolio');
            }}
            className="w-full mt-2 py-2 bg-slate-950 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition tracking-wide flex items-center justify-center gap-1.5 cursor-pointer"
          >
            View Engineering Activity History
          </button>
        </div>
      </div>

      {/* Skills section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
          <div>
            <h3 className="font-display font-semibold text-base text-slate-900 tracking-tight">Verified Engineering Skills</h3>
            <p className="text-slate-500 text-xs">Acoustical systems, thermals, and electromagnetic compliance fields</p>
          </div>
          <button 
            onClick={() => {
              const newSkill = prompt("Enter a new skill parameter to register (e.g. EMI Shielding, RF Design):");
              if (newSkill && newSkill.trim()) {
                setProfile(prev => ({
                  ...prev,
                  skills: [...prev.skills, newSkill.trim()]
                }));
                showToast(`Successfully registered "${newSkill.trim()}" skill.`);
              }
            }}
            className="px-3 py-1.5 border border-slate-200 hover:border-slate-800 hover:bg-slate-50 rounded-lg text-xs font-medium transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4.5 h-4.5" />
            Add Skill
          </button>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {profile.skills.map((skill, index) => (
            <span 
              key={index}
              className="px-3.5 py-1.5 bg-slate-100 text-slate-800 rounded-full text-xs font-medium border border-slate-200 flex items-center gap-2 group hover:border-slate-400 transition"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-red-500 shrink-0" />
              {skill}
              <button 
                onClick={() => {
                  setProfile(prev => ({
                    ...prev,
                    skills: prev.skills.filter(s => s !== skill)
                  }));
                  showToast(`Removed filter: ${skill}`);
                }}
                className="text-slate-400 hover:text-red-500 cursor-pointer hidden group-hover:inline-block ml-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Certifications List */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-sm">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
          <div>
            <h3 className="font-display font-semibold text-base text-slate-900 tracking-tight">Academic & Professional Certifications</h3>
            <p className="text-slate-500 text-xs">Credentials validated directly by educational institutions or corporate programs</p>
          </div>
          <button 
            onClick={() => {
              const certName = prompt("Enter certification name:");
              const certIssuer = prompt("Enter organization/issuer:");
              if (certName && certIssuer) {
                setProfile(prev => ({
                  ...prev,
                  certifications: [...prev.certifications, { name: certName, issuer: certIssuer, date: 'Now' }]
                }));
                showToast(`Certified: "${certName}" listed`);
              }
            }}
            className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-semibold transition cursor-pointer"
          >
            Upload Certificate
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profile.certifications.map((cert, index) => (
            <div key={index} className="flex gap-4 p-4 border border-slate-100 hover:border-slate-200 rounded-2xl bg-slate-50/50 hover:bg-white transition">
              <div className="w-12 h-12 bg-red-100/50 rounded-xl flex items-center justify-center text-red-600 shrink-0 shadow-inner">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-950 leading-tight">{cert.name}</h4>
                <p className="text-[11px] text-slate-500 mt-1">{cert.issuer}</p>
                <span className="text-[9px] text-slate-400 font-mono uppercase tracking-wide block mt-1.5">Issued: {cert.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Claim Stamp Modal */}
      <AnimatePresence>
        {showAddStamp && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 max-w-sm w-full shadow-2xl relative"
            >
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
                <div>
                  <h3 className="font-display font-semibold text-sm text-slate-900 tracking-tight">Request Visa / Stamp Validation</h3>
                  <p className="text-slate-400 text-[10px] mt-0.5">Validate seminar or lecture credit stamps</p>
                </div>
                <button 
                  onClick={() => setShowAddStamp(false)}
                  className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2 max-h-[220px] overflow-y-auto">
                {availableStamps.map((item) => {
                  const alreadyEarned = profile.stamps.some(s => s.id === item.id);
                  return (
                    <div 
                      key={item.id}
                      className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs transition"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{item.icon}</span>
                        <div>
                          <p className="font-semibold text-slate-950">{item.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">Date: {item.date}</p>
                        </div>
                      </div>

                      {alreadyEarned ? (
                        <span className="text-[11px] font-mono text-emerald-600 font-bold">Earned</span>
                      ) : (
                        <button 
                          onClick={() => {
                            setProfile(prev => ({
                              ...prev,
                              stamps: [...prev.stamps, item],
                              engagementScore: Math.min(prev.engagementScore + 5, 100)
                            }));
                            showToast(`Earned Stamp: "${item.name}" validated successfully!`);
                            setShowAddStamp(false);
                          }}
                          className="px-2.5 py-1 bg-red-600 hover:bg-red-750 text-white rounded font-semibold text-[10px] select-none cursor-pointer"
                        >
                          Claim Stamp
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
