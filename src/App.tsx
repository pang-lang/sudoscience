import React, { useState, useEffect } from 'react';
import { UserRole } from './types';
import RoleSelector from './components/shared/RoleSelector';
import StudentPortal from './components/student/StudentPortal';
import RecruiterPortal from './components/recruiter/RecruiterPortal';
import EducatorPortal from './components/educator/EducatorPortal';
import { supabase } from './lib/supabase';
import PublicPortal from './components/public/PublicPortal';

interface AuthUser {
  name: string;
  email: string;
  avatarUrl: string;
}

export default function App() {
  const [role, setRole] = useState<UserRole>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

  // Listen for Supabase auth state changes (Google OAuth redirect)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const meta = session.user.user_metadata;
        setAuthUser({
          name: meta?.full_name || meta?.name || session.user.email || 'User',
          email: session.user.email || '',
          avatarUrl: meta?.avatar_url || meta?.picture || ''
        });
      } else {
        setAuthUser(null);
      }
    });

    // Check existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const meta = session.user.user_metadata;
        setAuthUser({
          name: meta?.full_name || meta?.name || session.user.email || 'User',
          email: session.user.email || '',
          avatarUrl: meta?.avatar_url || meta?.picture || ''
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Parse URL hash routing on boot
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#student') {
        setRole('student');
      } else if (hash === '#recruiter') {
        setRole('recruiter');
      } else if (hash === '#educator') {
        setRole('educator');
      } else {
        setRole(null);
      }
    };

    // run once on mount
    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSelectRole = (selected: UserRole) => {
    setRole(selected);
    if (selected === 'student') {
      window.location.hash = '#student';
    } else if (selected === 'recruiter') {
      window.location.hash = '#recruiter';
    } else if (selected === 'educator') {
      window.location.hash = '#educator';
    } else {
      window.location.hash = '';
    }
  };

  const handleLogout = async () => {
    setRole(null);
    window.location.hash = '';
    // Sign out from Supabase (clears Google session too)
    await supabase.auth.signOut();
    setAuthUser(null);
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 antialiased font-sans">
      {role === null && (
        <RoleSelector onSelectRole={handleSelectRole} authUser={authUser} />
      )}
      {role === 'student' && (
        <StudentPortal onLogout={handleLogout} />
      )}
      {role === 'recruiter' && (
        <RecruiterPortal onLogout={handleLogout} />
      )}
      {role === 'educator' && (
        <EducatorPortal onLogout={handleLogout} />
      )}
    </div>
  );
}
