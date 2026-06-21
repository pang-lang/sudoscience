import React, { useState } from 'react';
import { Candidate, MentorChat } from '../../types';
import {
  Coffee, Send, Check, Search, Sparkles, MessageSquare, Clock, User
} from 'lucide-react';
import {
  scoreStudentForEmployee,
  createMentorChatInvite,
  mentorChatStatusLabel,
  EmployeeProfile
} from '../../utils/mentorChatHelpers';
import { supabase } from '../../lib/supabase';

// ─── Props ──────────────────────────────────────────────────────────────────

interface MentorChatTabProps {
  candidates: Candidate[];
  invites: MentorChat[];
  setInvites: React.Dispatch<React.SetStateAction<MentorChat[]>>;
  setCandidates: React.Dispatch<React.SetStateAction<Candidate[]>>;
  managerProfile: EmployeeProfile;
  showToast: (msg: string) => void;
  onViewCandidate: (cand: Candidate) => void;
}

// ─── Score badge ────────────────────────────────────────────────────────────

function ScoreBadge({ score }: { score: number }) {
  const cls =
    score >= 75
      ? 'bg-red-50 text-red-700 border-red-200'
      : score >= 50
      ? 'bg-slate-950 text-slate-100 border-slate-900'
      : 'bg-slate-100 text-slate-500 border-slate-200';
  return (
    <span className={`text-[10px] font-black font-mono px-2 py-0.5 rounded-lg border ${cls}`}>
      {score}%
    </span>
  );
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function MentorChatTab({
  candidates,
  invites,
  setInvites,
  setCandidates,
  managerProfile,
  showToast,
  onViewCandidate,
}: MentorChatTabProps) {
  const [subTab, setSubTab] = useState<'suggested' | 'pending' | 'active'>('suggested');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState('');

  // ── Derived data ──────────────────────────────────────────────────────────

  const pendingInvites = invites.filter(inv => inv.status === 'pending');
  const activeChats = invites.filter(inv => inv.status === 'accepted');
  const invitedCandidateIds = new Set(invites.map(inv => inv.candidateId));

  // Score & rank candidates, excluding already-invited ones
  const suggestedStudents = candidates
    .filter(c => !invitedCandidateIds.has(c.id))
    .map(c => {
      const { score, matchedOn } = scoreStudentForEmployee(c, managerProfile);
      return { ...c, mentorScore: score, matchedOn };
    })
    .filter(c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.skills.join(' ').toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => b.mentorScore - a.mentorScore);

  // ── Invite handler ────────────────────────────────────────────────────────

  const handleInvite = async (cand: typeof suggestedStudents[0]) => {
    const newInvite = createMentorChatInvite(cand.id, managerProfile, cand.mentorScore);
    setInvites(prev => [...prev, newInvite]);
    showToast(`☕ Mentor chat invite sent to ${cand.name.split(' ')[0]}!`);

    // Persist to Supabase (best-effort)
    try {
      await supabase.from('coffee_chat_invites').insert({
        id: newInvite.id,
        candidate_id: cand.id,
        manager_name: managerProfile.name,
        manager_dept: managerProfile.dept,
        manager_research: managerProfile.research,
        score: cand.mentorScore,
        status: 'pending',
        student_shared_profile: false,
        manager_shared_profile: false,
      });
    } catch {
      // localStorage fallback handles persistence
    }

    // Simulate acceptance for non-demo students after 5s
    if (cand.id !== 'c_sarah_j') {
      setTimeout(async () => {
        setInvites(prev =>
          prev.map(inv => {
            if (inv.id === newInvite.id) {
              showToast(`✅ ${cand.name.split(' ')[0]} accepted your mentor chat!`);
              setCandidates(cs =>
                cs.map(c =>
                  c.id === cand.id ? { ...c, stage: 'Interview Scheduled' as const } : c
                )
              );
              return { ...inv, status: 'accepted' as const, studentSharedProfile: true };
            }
            return inv;
          })
        );

        try {
          await supabase
            .from('coffee_chat_invites')
            .update({ status: 'accepted', student_shared_profile: true })
            .eq('id', newInvite.id);
        } catch { /* silent */ }
      }, 5000);
    }
  };

  // ── Chat message handler ──────────────────────────────────────────────────

  const handleSendMessage = () => {
    if (!chatMessage.trim() || !activeChatId) return;

    setInvites(prev =>
      prev.map(inv => {
        if (inv.id === activeChatId) {
          const newMsg = {
            sender: 'employee' as const,
            text: chatMessage.trim(),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          const updated = { ...inv, messages: [...(inv.messages || []), newMsg] };

          // Sync to Supabase
          supabase
            .from('coffee_chat_invites')
            .update({ messages: updated.messages })
            .eq('id', activeChatId)
            .then(() => {});

          return updated;
        }
        return inv;
      })
    );
    setChatMessage('');
    showToast('Message sent');
  };

  // ── Active chat helper ────────────────────────────────────────────────────

  const activeChat = activeChatId ? invites.find(inv => inv.id === activeChatId) : null;
  const activeChatStudent = activeChat
    ? candidates.find(c => c.id === activeChat.candidateId)
    : null;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div id="recruiter-mentor-chat-tab" className="space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-[10px] text-red-600 font-mono uppercase tracking-widest font-semibold block">
              Relationship Management
            </span>
            <h2 className="font-display font-bold text-2xl text-slate-900 mt-1">Mentor Chats</h2>
            <p className="text-slate-500 text-xs mt-1">
              Connect with students matched to <strong>{managerProfile.name}</strong>'s expertise.
            </p>
          </div>

          {/* Sub-tab toggle */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
            <button
              onClick={() => setSubTab('suggested')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                subTab === 'suggested'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-red-600" />
              Suggested
            </button>
            <button
              onClick={() => setSubTab('pending')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                subTab === 'pending'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Pending
              {pendingInvites.length > 0 && (
                <span className="bg-slate-900 text-white font-mono text-[9px] px-1.5 rounded-full">
                  {pendingInvites.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setSubTab('active')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                subTab === 'active'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Active Chats
              {activeChats.length > 0 && (
                <span className="bg-red-600 text-white font-mono text-[9px] px-1.5 rounded-full">
                  {activeChats.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Employee profile pill */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="bg-slate-900 rounded-2xl p-3.5 flex items-center gap-3 border border-slate-800 w-fit">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-400/30 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-red-500" />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block">Matching as</span>
              <span className="text-xs font-bold text-white">{managerProfile.name}</span>
              <span className="text-[10px] text-red-400 font-mono ml-2">{managerProfile.dept}</span>
            </div>
            <div className="flex flex-wrap gap-1 ml-3">
              {managerProfile.skills.slice(0, 3).map((s, i) => (
                <span key={i} className="text-[8px] bg-slate-800 text-slate-300 border border-slate-700 px-1.5 py-0.5 rounded font-mono">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Search (suggested tab only) */}
        {subTab === 'suggested' && (
          <div className="mt-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search candidates by name or skill..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-red-400"
            />
          </div>
        )}
      </div>

      {/* ── SUGGESTED STUDENTS ──────────────────────────────────────────────── */}
      {subTab === 'suggested' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-display font-semibold text-sm text-slate-900">
              Suggested Students ({suggestedStudents.length})
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Sorted by match score</span>
          </div>

          {suggestedStudents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {suggestedStudents.map(cand => {
                const primaryProject = cand.projects?.[0];
                
                return (
                  <div
                    key={cand.id}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col"
                  >
                    {/* Portfolio Card Header: Avatar & Info */}
                    <div className="p-5 pb-4 flex items-start gap-4">
                      <img
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                        src={cand.avatarUrl}
                        alt={cand.name}
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-slate-950 truncate">{cand.name}</h4>
                          <ScoreBadge score={cand.mentorScore} />
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono truncate mt-0.5">
                          {cand.university}
                        </p>
                      </div>
                    </div>

                    {/* Primary Project Details */}
                    {primaryProject ? (
                      <div className="px-5 py-4 border-t border-slate-100 flex-1 bg-slate-50/50">
                        <h5 className="text-xs font-semibold text-slate-900 tracking-tight">{primaryProject.title}</h5>
                        <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed line-clamp-2">
                          {primaryProject.description}
                        </p>
                        
                        {/* WE Hardware Used */}
                        {primaryProject.components && primaryProject.components.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-slate-200">
                            <span className="text-[9px] text-slate-400 font-mono tracking-wider block mb-1.5">WE HARDWARE USED</span>
                            <div className="flex flex-wrap gap-1.5">
                              {primaryProject.components.map((comp, idx) => (
                                <span key={idx} className="bg-red-50 text-red-600 text-[9px] px-1.5 py-0.5 rounded font-medium border border-red-100/50">
                                  {comp}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Tech Stack */}
                        <div className="mt-3">
                          <div className="flex flex-wrap gap-1">
                            {primaryProject.tech.slice(0, 3).map((t, idx) => (
                              <span key={idx} className="bg-slate-100 text-slate-600 text-[9px] px-1.5 py-0.5 rounded font-mono">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="px-5 py-4 border-t border-slate-100 flex-1 bg-slate-50/50 flex flex-col items-center justify-center text-center">
                        <p className="text-[10px] text-slate-400 font-mono">No portfolio projects listed</p>
                      </div>
                    )}

                    {/* Actions Footer */}
                    <div className="p-4 border-t border-slate-100 flex gap-3 bg-white">
                      <button
                        onClick={() => onViewCandidate(cand)}
                        className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                      >
                        Profile
                      </button>
                      <button
                        onClick={() => handleInvite(cand)}
                        className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Invite
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-16 text-center text-slate-400">
              <Coffee className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-xs font-medium text-slate-600">No suggested students</p>
              <p className="text-[10px] mt-1">All candidates have been invited or none match your search.</p>
            </div>
          )}
        </div>
      )}

      {/* ── PENDING INVITES ─────────────────────────────────────────────────── */}
      {subTab === 'pending' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-display font-semibold text-sm text-slate-900">
              Pending Invites ({pendingInvites.length})
            </h3>
            <p className="text-slate-400 text-[10px] mt-0.5">Students who have been invited but haven't responded yet.</p>
          </div>

          {pendingInvites.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {pendingInvites.map(inv => {
                const student = candidates.find(c => c.id === inv.candidateId);
                if (!student) return null;

                return (
                  <div
                    key={inv.id}
                    className="px-6 py-3.5 flex items-center gap-4 hover:bg-slate-50/50 transition"
                  >
                    <img
                      className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0"
                      src={student.avatarUrl}
                      alt={student.name}
                      referrerPolicy="no-referrer"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-950 truncate">{student.name}</h4>
                        <ScoreBadge score={inv.score} />
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{student.university}</p>
                    </div>

                    {/* Skills */}
                    <div className="hidden md:flex flex-wrap gap-1 w-[200px] shrink-0">
                      {student.skills.slice(0, 3).map((s, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center whitespace-nowrap bg-slate-100 text-slate-600 text-[9px] px-1.5 py-0.5 rounded font-semibold"
                        >
                          {s}
                        </span>
                      ))}
                    </div>

                    <span className="text-[9px] font-mono text-slate-400">
                      Sent: {inv.timestamp}
                    </span>

                    <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-[10px] font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {mentorChatStatusLabel(inv.status)}
                    </span>

                    <button
                      onClick={() => onViewCandidate(student)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-semibold border border-slate-200 cursor-pointer transition shrink-0"
                    >
                      Profile
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-16 text-center text-slate-400">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-xs font-medium text-slate-600">No pending invites</p>
              <p className="text-[10px] mt-1">Invite a student from the Suggested tab to start a conversation.</p>
            </div>
          )}
        </div>
      )}

      {/* ── ACTIVE CHATS (Two-pane) ─────────────────────────────────────────── */}
      {subTab === 'active' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Chat list */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 shadow-sm h-[520px] flex flex-col">
            <div className="px-5 py-4 border-b border-slate-100 shrink-0">
              <h3 className="font-display font-semibold text-sm text-slate-900 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                  Active Chats ({activeChats.length})
                </span>
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {activeChats.length > 0 ? (
                activeChats.map(inv => {
                  const student = candidates.find(c => c.id === inv.candidateId);
                  if (!student) return null;
                  const lastMsg =
                    inv.messages && inv.messages.length > 0
                      ? inv.messages[inv.messages.length - 1].text
                      : 'No messages yet';
                  const lastTime =
                    inv.messages && inv.messages.length > 0
                      ? inv.messages[inv.messages.length - 1].timestamp
                      : inv.timestamp;

                  return (
                    <div
                      key={inv.id}
                      onClick={() => setActiveChatId(inv.id)}
                      className={`px-4 py-3 flex items-center gap-3 transition cursor-pointer ${
                        activeChatId === inv.id
                          ? 'bg-slate-100/70'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="relative shrink-0">
                        <img
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                          src={student.avatarUrl}
                          alt={student.name}
                          referrerPolicy="no-referrer"
                        />
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <h4 className="text-xs font-bold text-slate-950 truncate">{student.name}</h4>
                          <span className="text-[9px] font-mono text-slate-400 shrink-0">{lastTime}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">{lastMsg}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center text-center h-full text-slate-400 p-6">
                  <Coffee className="w-8 h-8 opacity-40 mb-2" />
                  <p className="text-xs font-medium text-slate-600">No active chats</p>
                  <p className="text-[10px] mt-1">Once a student accepts your invite, their chat will appear here.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Chat interface */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-sm h-[520px] flex flex-col">
            {activeChat && activeChatStudent ? (
              <>
                {/* Chat header */}
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <img
                      className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                      src={activeChatStudent.avatarUrl}
                      alt={activeChatStudent.name}
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="font-display font-bold text-sm text-slate-900">
                        {activeChatStudent.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-mono">{activeChatStudent.university}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {activeChat.studentSharedProfile && (
                      <span className="text-[9px] font-mono bg-emerald-50 text-emerald-600 px-2 py-1 rounded border border-emerald-100 flex items-center gap-1">
                        <Check className="w-3 h-3" /> CV Shared
                      </span>
                    )}
                    <button
                      onClick={() => onViewCandidate(activeChatStudent)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-semibold border border-slate-200 cursor-pointer transition"
                    >
                      Profile
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-5 space-y-3">
                  {activeChat.messages && activeChat.messages.length > 0 ? (
                    activeChat.messages.map((m, i) => (
                      <div
                        key={i}
                        className={`flex flex-col ${m.sender === 'employee' ? 'items-end' : 'items-start'}`}
                      >
                        <span
                          className={`px-4 py-2 text-sm rounded-2xl max-w-[80%] leading-relaxed ${
                            m.sender === 'employee'
                              ? 'bg-slate-900 text-white rounded-tr-none'
                              : 'bg-slate-100 border border-slate-200 text-slate-800 rounded-tl-none'
                          }`}
                        >
                          {m.text}
                        </span>
                        <span className="text-[9px] text-slate-400 mt-1 px-1">{m.timestamp}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-8 font-mono">
                      No messages yet. Start the conversation!
                    </p>
                  )}
                </div>

                {/* Input */}
                <div className="px-5 py-4 border-t border-slate-100 flex gap-3 shrink-0">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={chatMessage}
                    onChange={e => setChatMessage(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleSendMessage();
                    }}
                    className="flex-1 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-red-500 focus:bg-white transition"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-2"
                  >
                    Send
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-center h-full text-slate-400 space-y-3">
                <MessageSquare className="w-12 h-12 opacity-30" />
                <p className="text-sm font-medium text-slate-600">No Conversation Selected</p>
                <p className="text-xs">Select a chat on the left to start messaging.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
