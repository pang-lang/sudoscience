// src/utils/mentorChatHelpers.ts
//
// Shared logic for mentor chat invite creation and student-employee scoring.
// Both RecruiterPortal (candidate modal) and MentorChatTab import from here.

import { Candidate, MentorChat } from '../types';

// ─── Employee profile shape (used for scoring) ─────────────────────────────

export interface EmployeeProfile {
  name: string;
  dept: string;
  skills: string[];
  research: string;
}

// ─── Consistent ID generator ────────────────────────────────────────────────

export function makeMentorChatId(candidateId: string): string {
  return `mc_${Date.now()}_${candidateId}`;
}

// ─── Create a new mentor chat invite ────────────────────────────────────────

export function createMentorChatInvite(
  candidateId: string,
  manager: EmployeeProfile,
  score: number
): MentorChat {
  return {
    id: makeMentorChatId(candidateId),
    candidateId,
    managerName: manager.name,
    managerDept: manager.dept,
    managerResearch: manager.research,
    score,
    status: 'pending',
    studentSharedProfile: false,
    managerSharedProfile: false,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    messages: [],
  };
}

// ─── Score a student candidate against a WE employee ────────────────────────
//
// How it works:
//   1. Both the employee's skills and the student's skills are split into
//      individual words ("Embedded Systems" → ["embedded", "systems"]).
//   2. The employee's research description is also tokenised.
//   3. Word-level overlap is counted → 0-100 skill score.
//   4. Blended 50/50 with the student's general engagement score.
//   5. A floor of 35 is applied — nobody is truly irrelevant.

export function scoreStudentForEmployee(
  candidate: Candidate,
  employee: EmployeeProfile
): { score: number; matchedOn: string[] } {
  // Build word-level set from employee (skills + research)
  const empWords = new Set([
    ...employee.skills.flatMap(s => s.toLowerCase().split(/[\s\-\/]+/)),
    ...employee.research.toLowerCase().split(/[\s,;/&\-]+/).filter(t => t.length > 3),
  ]);

  // Remove very generic stopwords
  const stopWords = new Set(['and', 'the', 'for', 'with', 'from', 'that', 'this', 'are', 'was']);
  empWords.forEach(w => {
    if (stopWords.has(w) || w.length <= 2) empWords.delete(w);
  });

  // Build word-level set from student skills
  const studentWords = new Set(
    candidate.skills.flatMap(s => s.toLowerCase().split(/[\s\-\/]+/))
  );

  // Find intersecting words
  const matchedWords = [...empWords].filter(ew => studentWords.has(ew));
  const uniqueMatched = [...new Set(matchedWords)];

  // Coverage score
  const coverageScore = (uniqueMatched.length / Math.max(empWords.size, 1)) * 100;

  // Blend 50% skill-coverage + 50% student engagement score
  const finalScore = Math.min(
    Math.round(coverageScore * 0.5 + candidate.score * 0.5),
    100
  );

  // Reconstruct display labels
  const displayLabels = employee.skills
    .filter(s =>
      s.toLowerCase().split(/[\s\-\/]+/).some(w => uniqueMatched.includes(w))
    )
    .slice(0, 3);

  return {
    score: Math.max(finalScore, 35),
    matchedOn:
      displayLabels.length > 0
        ? displayLabels
        : uniqueMatched.slice(0, 3).map(t => t.charAt(0).toUpperCase() + t.slice(1)),
  };
}

// ─── Status display helpers ─────────────────────────────────────────────────

export function mentorChatStatusLabel(status: MentorChat['status']): string {
  switch (status) {
    case 'pending':
      return 'Invited';
    case 'accepted':
      return 'Active';
    case 'rejected':
      return 'Declined';
    default:
      return status;
  }
}
