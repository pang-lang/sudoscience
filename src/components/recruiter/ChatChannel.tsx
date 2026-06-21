// src/components/recruiter/ChatChannel.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Lock, MessageSquare, Send, Coffee } from 'lucide-react';
import { Candidate, MentorChat } from '../../types';
import { supabase } from '../../lib/supabase';

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

interface ChatChannelProps {
  candidates: Candidate[];
  invites: MentorChat[];
  managerProfile: { name: string; dept: string; research: string; skills: string[] };
  sentInvites: MentorChat[];
  acceptedInvites: MentorChat[];
  getMaskedName: (cand: Candidate, score?: number) => string;
  showToast: (msg: string) => void;
  setInvites: React.Dispatch<React.SetStateAction<MentorChat[]>>;
}

export default function ChatChannel({
  candidates,
  invites,
  managerProfile,
  sentInvites,
  acceptedInvites,
  getMaskedName,
  showToast,
  setInvites,
}: ChatChannelProps) {
  const [selectedInviteId, setSelectedInviteId] = useState<string | null>(
    sentInvites.find(i => i.status === 'accepted')?.id ?? sentInvites[0]?.id ?? null
  );
  const [chatMessage, setChatMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedInvite = invites.find(i => i.id === selectedInviteId) ?? null;
  const selectedStudent = selectedInvite
    ? candidates.find(c => c.id === selectedInvite.candidateId) ?? null
    : null;
  const isShared = !!selectedInvite?.studentSharedProfile;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedInvite?.messages]);

  const handleSend = () => {
    if (!chatMessage.trim() || !selectedInviteId) return;
    const newMsg = {
      sender: 'employee' as const,
      text: chatMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setInvites(prev =>
      prev.map(inv => {
        if (inv.id === selectedInviteId) {
          const updated = { ...inv, messages: [...(inv.messages || []), newMsg] };
          supabase
            .from('coffee_chat_invites')
            .update({ messages: updated.messages })
            .eq('id', selectedInviteId)
            .then(() => {});
          return updated;
        }
        return inv;
      })
    );
    setChatMessage('');
    showToast('Message sent');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest font-semibold block">
          Messaging Centre
        </span>
        <h2 className="font-display font-bold text-2xl text-slate-900 mt-1">Chat</h2>
        <p className="text-slate-500 text-xs mt-1">
          Direct messages with your connected candidates.
        </p>
      </div>

      {sentInvites.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 py-20 text-center">
          <Coffee className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h4 className="font-display font-semibold text-slate-700 text-sm">No connections yet</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            Go to <strong>Talent Discovery</strong> and send a coffee chat invite to start messaging.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex h-[600px]">

          {/* Left: conversation list */}
          <div className="w-72 border-r border-slate-100 flex flex-col shrink-0">
            <div className="p-4 border-b border-slate-100">
              <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-semibold">
                Conversations · {sentInvites.length}
              </p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {sentInvites.map(inv => {
                const student = candidates.find(c => c.id === inv.candidateId);
                if (!student) return null;
                const shared = !!inv.studentSharedProfile;
                const isActive = selectedInviteId === inv.id;
                const lastMsg = inv.messages && inv.messages.length > 0
                  ? inv.messages[inv.messages.length - 1]
                  : null;

                return (
                  <button
                    key={inv.id}
                    onClick={() => setSelectedInviteId(inv.id)}
                    className={`w-full text-left px-4 py-3.5 flex items-center gap-3 border-b border-slate-50 transition cursor-pointer ${
                      isActive
                        ? 'bg-slate-950 text-white'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        className={`w-10 h-10 rounded-xl object-cover border ${
                          isActive ? 'border-slate-700' : 'border-slate-200'
                        } transition duration-300 ${!shared ? 'filter blur-sm grayscale' : ''}`}
                        src={student.avatarUrl}
                        alt={shared ? student.name : 'Masked'}
                        referrerPolicy="no-referrer"
                      />
                      {!shared && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-slate-900/20">
                          <Lock className="w-3 h-3 text-white/80" />
                        </div>
                      )}
                      {/* Online dot for accepted */}
                      {inv.status === 'accepted' && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-xs font-semibold truncate ${isActive ? 'text-white' : 'text-slate-900'}`}>
                          {shared ? student.name : getMaskedName(student, inv.score)}
                        </span>
                        <ScoreBadge score={inv.score} />
                      </div>
                      <p className={`text-[10px] mt-0.5 truncate ${isActive ? 'text-slate-400' : 'text-slate-400'}`}>
                        {lastMsg
                          ? (lastMsg.sender === 'employee' ? 'You: ' : '') + lastMsg.text
                          : inv.status === 'accepted' ? 'Say hello!' : '⏳ Pending acceptance'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: message pane */}
          <div className="flex-1 flex flex-col min-w-0">
            {selectedInvite && selectedStudent ? (
              <>
                {/* Chat header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-white shrink-0">
                  <div className="relative">
                    <img
                      className={`w-10 h-10 rounded-xl object-cover border border-slate-200 ${!isShared ? 'filter blur-sm grayscale' : ''}`}
                      src={selectedStudent.avatarUrl}
                      alt={isShared ? selectedStudent.name : 'Masked'}
                      referrerPolicy="no-referrer"
                    />
                    {!isShared && (
                      <div className="absolute inset-0 bg-slate-900/15 flex items-center justify-center rounded-xl">
                        <Lock className="w-3 h-3 text-white/80" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {isShared ? selectedStudent.name : getMaskedName(selectedStudent, selectedInvite.score)}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {isShared ? selectedStudent.university : '[Institution Masked]'} ·{' '}
                      {selectedInvite.status === 'accepted' ? (
                        <span className="text-emerald-600 font-semibold">✓ Connected</span>
                      ) : (
                        <span className="text-amber-500 font-semibold">⏳ Pending</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-slate-50/50">
                  {selectedInvite.status !== 'accepted' ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <MessageSquare className="w-10 h-10 text-slate-300 mb-3" />
                      <p className="text-sm text-slate-500 font-semibold">Waiting for acceptance</p>
                      <p className="text-xs text-slate-400 mt-1">
                        You can chat once the candidate accepts your invite.
                      </p>
                    </div>
                  ) : (selectedInvite.messages && selectedInvite.messages.length > 0) ? (
                    selectedInvite.messages.map((msg, mi) => (
                      <div
                        key={mi}
                        className={`flex ${msg.sender === 'employee' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-xs shadow-xs ${
                            msg.sender === 'employee'
                              ? 'bg-slate-900 text-white rounded-tr-sm'
                              : 'bg-white text-slate-800 border border-slate-200 rounded-tl-sm'
                          }`}
                        >
                          <p className="leading-relaxed">{msg.text}</p>
                          <span
                            className={`text-[8px] block mt-1 text-right ${
                              msg.sender === 'employee' ? 'text-slate-400' : 'text-slate-400'
                            }`}
                          >
                            {msg.timestamp}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <MessageSquare className="w-10 h-10 text-slate-300 mb-3" />
                      <p className="text-sm text-slate-500 font-semibold">No messages yet</p>
                      <p className="text-xs text-slate-400 mt-1">Start the conversation!</p>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                {selectedInvite.status === 'accepted' && (
                  <div className="px-6 py-4 border-t border-slate-100 bg-white shrink-0 flex gap-3">
                    <input
                      type="text"
                      value={chatMessage}
                      onChange={e => setChatMessage(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                      placeholder="Type a message..."
                      className="flex-1 text-xs px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-800 transition"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!chatMessage.trim()}
                      className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Send
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <MessageSquare className="w-12 h-12 text-slate-200 mb-3" />
                <p className="text-sm text-slate-400">Select a conversation to start chatting</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
