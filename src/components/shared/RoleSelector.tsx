import React from 'react';
import { motion } from 'motion/react';
import { UserRole } from '../../types';
import { GraduationCap, Briefcase, BookOpen, ChevronRight, CornerDownRight, LogIn, Globe } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface RoleSelectorProps {
  onSelectRole: (role: UserRole) => void;
  authUser?: { name: string; email: string; avatarUrl: string } | null;
}

export default function RoleSelector({ onSelectRole, authUser }: RoleSelectorProps) {
  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + window.location.pathname
      }
    });
    if (error) {
      console.error('Google sign-in error:', error.message);
      alert('Google sign-in failed. Use "Quick Sandbox Login" for demo access.');
    }
  };

  return (
    <div id="role-selector" className="min-h-screen bg-slate-50 flex flex-col font-sans select-none relative overflow-hidden">
      {/* Decorative patterns */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      {/* Corporate Top Navigation Header */}
      <nav id="role-nav" className="w-full bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10 shadow-xs">
        <div className="flex items-center gap-3">
          {/* Custom Würth Elektronik Logo styling */}
          <div className="flex items-center gap-1.5 font-display font-bold text-xl tracking-tight text-slate-900">
            <span className="bg-red-600 text-white px-2 py-0.5 rounded-xs font-black text-lg">WE</span>
            <span>Connect</span>
          </div>
          <span className="hidden md:inline-block h-4 w-px bg-slate-300 mx-1" />
          <span className="hidden md:inline-block font-mono text-[10px] text-slate-500 uppercase tracking-widest font-semibold bg-slate-100 px-1.5 py-0.5 rounded-sm">
            Academic Excellence Hub
          </span>
        </div>
        <div className="flex items-center gap-4">
          {authUser ? (
            <div className="flex items-center gap-3">
              {authUser.avatarUrl && (
                <img src={authUser.avatarUrl} alt="" className="w-7 h-7 rounded-full border border-slate-200" referrerPolicy="no-referrer" />
              )}
              <span className="text-xs font-semibold text-slate-700">{authUser.name}</span>
              <span className="text-[9px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-mono font-semibold border border-emerald-200">
                Authenticated
              </span>
            </div>
          ) : (
            <>
              <button 
                onClick={() => onSelectRole('student')}
                className="text-xs font-medium text-slate-600 hover:text-slate-900 hover:underline cursor-pointer"
              >
                Quick Sandbox Login
              </button>
              <button 
                onClick={handleGoogleSignIn}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-md hover:bg-slate-800 transition shadow-sm hover:shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In with Google
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Main Container */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 md:py-16 z-10 max-w-6xl mx-auto w-full">
        {/* Pitch Headline Block */}
        <div className="text-center max-w-2xl mb-12 md:mb-16">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-medium mb-4"
          >
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Empowering the Next Generation of Engineers
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display font-bold text-4xl md:text-5xl tracking-tight text-slate-900 mb-4"
          >
            Welcome to <span className="text-red-600 font-extrabold relative inline-block">WE Connect</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-slate-600 text-sm md:text-base leading-relaxed"
          >
            Select your specialized profile to access curated training materials, collaborate directly with Würth Elektronik experts, request hardware design kits, and unlock industry career opportunities.
          </motion.p>
        </div>

        {/* 3 Grid Streams Choice */}
        <div id="roles-grid" className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full">
          
          {/* Card 1: Student Profile */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="bg-white border border-slate-200 hover:border-red-500 rounded-2xl p-6 md:p-8 flex flex-col justify-between shadow-xs hover:shadow-lg transition-all-custom cursor-pointer"
            onClick={() => onSelectRole('student')}
          >
            <div className="flex flex-col gap-5">
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600 shadow-inner">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-xl text-slate-900 flex items-center gap-1.5">
                  I'm a Student <CornerDownRight className="w-3.5 h-3.5 text-slate-400" />
                </h3>
                <p className="text-slate-500 text-xs md:text-sm mt-3 leading-relaxed">
                  Access design guides, stream hardware masterclasses, compile your skills passport, and secure internships or thesis collaborations with industrial mentors.
                </p>
              </div>
            </div>
            <div className="mt-8 flex flex-col gap-2.5">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectRole('student');
                }}
                className="w-full py-2.5 bg-red-600 text-white font-semibold text-xs rounded-lg hover:bg-red-700 transition tracking-wide shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                STUDENT LOGIN
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-mono text-slate-400 text-center block">Access: Sarah Jenkins - Master Demo Account</span>
            </div>
          </motion.div>

          {/* Card 2: Recruiter / WE Employee */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="bg-white border border-slate-200 hover:border-slate-900 rounded-2xl p-6 md:p-8 flex flex-col justify-between shadow-xs hover:shadow-lg transition-all-custom cursor-pointer"
            onClick={() => onSelectRole('recruiter')}
          >
            <div className="flex flex-col gap-5">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-900 shadow-inner">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-xl text-slate-900 flex items-center gap-1.5">
                  I'm from Würth Elektronik <CornerDownRight className="w-3.5 h-3.5 text-slate-400" />
                </h3>
                <p className="text-slate-500 text-xs md:text-sm mt-3 leading-relaxed">
                  Screen verified academic candidates, monitor student engagement metrics, schedule mock assessments, and administer technical placement pipelines.
                </p>
              </div>
            </div>
            <div className="mt-8 flex flex-col gap-2.5">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectRole('recruiter');
                }}
                className="w-full py-2.5 bg-slate-900 text-white font-semibold text-xs rounded-lg hover:bg-slate-800 transition tracking-wide shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                EMPLOYEE LOGIN
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-mono text-slate-400 text-center block">Access: Talent Acquisition & University Relations</span>
            </div>
          </motion.div>

          {/* Card 3: Educator Profile */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="bg-white border border-slate-200 hover:border-blue-600 rounded-2xl p-6 md:p-8 flex flex-col justify-between shadow-xs hover:shadow-lg transition-all-custom cursor-pointer"
            onClick={() => onSelectRole('educator')}
          >
            <div className="flex flex-col gap-5">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-xl text-slate-900 flex items-center gap-1.5">
                  I'm an Educator <CornerDownRight className="w-3.5 h-3.5 text-slate-400" />
                </h3>
                <p className="text-slate-500 text-xs md:text-sm mt-3 leading-relaxed">
                  Order physical hardware lab-kits, invite masterclass guest lecturers, publish academic lecture recordings, and evaluate student material downloads.
                </p>
              </div>
            </div>
            <div className="mt-8 flex flex-col gap-2.5">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectRole('educator');
                }}
                className="w-full py-2.5 bg-blue-600 text-white font-semibold text-xs rounded-lg hover:bg-blue-700 transition tracking-wide shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                JOIN AS EDUCATOR
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-mono text-slate-400 text-center block">Access: WE Academy & University Educators</span>
            </div>
          </motion.div>

        </div>

        {/* Footer Brand Credit */}
        <div className="mt-20 border-t border-slate-200 pt-6 w-full text-center">
          <p className="text-slate-400 text-xs font-mono">
            &copy; {new Date().getFullYear()} Würth Elektronik. Designed for Academic Success and Technological Innovation.
          </p>
        </div>
      </div>
    </div>
  );
}
