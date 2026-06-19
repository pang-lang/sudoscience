import React, { useState, useEffect } from 'react';
import { UserRole } from './types';
import RoleSelector from './components/shared/RoleSelector';
import StudentPortal from './components/student/StudentPortal';
import RecruiterPortal from './components/recruiter/RecruiterPortal';
import EducatorPortal from './components/educator/EducatorPortal';

export default function App() {
  const [role, setRole] = useState<UserRole>(null);

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

  const handleLogout = () => {
    setRole(null);
    window.location.hash = '';
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 antialiased font-sans">
      {role === null && (
        <RoleSelector onSelectRole={handleSelectRole} />
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
