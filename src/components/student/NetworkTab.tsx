import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NetworkProfile, ConnectionChat, CoffeeChatInvite } from '../../types';
import {
  X, Heart, MessageSquare, RotateCcw, Coffee, ShieldAlert, Check, Lock, Unlock,
  Sparkles, ChevronRight, Briefcase, Target, Star, RefreshCw
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
interface NetworkTabProps {
  networkQueue: NetworkProfile[];
  setNetworkQueue: React.Dispatch<React.SetStateAction<NetworkProfile[]>>;
  connections: ConnectionChat[];
  setConnections: React.Dispatch<React.SetStateAction<ConnectionChat[]>>;
  showToast: (msg: string) => void;
  invites: CoffeeChatInvite[];
  setInvites: React.Dispatch<React.SetStateAction<CoffeeChatInvite[]>>;
}

// Score badge color
function scoreBadgeClass(score: number) {
  if (score >= 75) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (score >= 50) return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-slate-100 text-slate-600 border-slate-200';
}

export default function NetworkTab({
  networkQueue,
  setNetworkQueue,
  connections,
  setConnections,
  showToast,
  invites,
  setInvites
}: NetworkTabProps) {
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [typedMessage, setTypedMessage] = useState('');
  const [swipeDir, setSwipeDir] = useState<'left' | 'right' | null>(null);

  const [subTab, setSubTab] = useState<'matches' | 'coffee'>('matches');

  // Synchronize invite messages to connections state when invites change
  React.useEffect(() => {
    setConnections(prev => {
      let changed = false;
      const next = prev.map(chat => {
        const matchingInvite = invites.find(inv =>
          `chat_${inv.id}` === chat.id ||
          `coffee_${inv.id}` === chat.id ||
          `coffee_${inv.candidateId}_${inv.id}` === chat.id
        );
        if (matchingInvite && matchingInvite.messages && matchingInvite.messages.length > 0) {
          const mappedMsgs = matchingInvite.messages.map(m => ({
            sender: m.sender === 'student' ? ('user' as const) : ('other' as const),
            text: m.text,
            timestamp: m.timestamp
          }));
          const lastMsg = matchingInvite.messages[matchingInvite.messages.length - 1].text;

          if (JSON.stringify(chat.messages) !== JSON.stringify(mappedMsgs)) {
            changed = true;
            return {
              ...chat,
              lastMessage: lastMsg,
              messages: mappedMsgs
            };
          }
        }
        return chat;
      });
      return changed ? next : prev;
    });
  }, [invites, setConnections]);

  const sendChatMessage = () => {
    if (!typedMessage.trim() || !activeChatId) return;

    // 1. Update connections
    setConnections(prev => prev.map(chat => {
      if (chat.id === activeChatId) {
        return {
          ...chat,
          lastMessage: typedMessage,
          messages: [
            ...chat.messages,
            { sender: 'user' as const, text: typedMessage, timestamp: 'Just now' }
          ]
        };
      }
      return chat;
    }));

    // 2. Sync to invites if it's a coffee chat
    const matchingInvite = invites.find(inv =>
      `chat_${inv.id}` === activeChatId ||
      `coffee_${inv.id}` === activeChatId ||
      inv.managerName === connections.find(c => c.id === activeChatId)?.name
    );

    if (matchingInvite) {
      setInvites(prev => prev.map(inv => {
        if (inv.id === matchingInvite.id) {
          const newMsg = {
            sender: 'student' as const,
            text: typedMessage.trim(),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          const updatedInvite = { ...inv, messages: [...(inv.messages || []), newMsg] };

          // Sync to Supabase
          supabase.from('coffee_chat_invites').update({
            messages: updatedInvite.messages
          }).eq('id', matchingInvite.id).then(() => {});

          return updatedInvite;
        }
        return inv;
      }));
    }

    setTypedMessage('');

    // Fallback: if not matching any invite, simulate mock reply
    if (!matchingInvite) {
      setTimeout(() => {
        setConnections(prev => prev.map(chat => {
          if (chat.id === activeChatId) {
            const replies = [
              "That sounds brilliant! Send me over your latest schematic layout to review.",
              "Absolutely! Let's arrange a Teams call to discuss the details.",
              "Yes, Würth Elektronik is hosting a student kit distribution next Tuesday. You should secure a spot!",
              "Fascinating approach. Let me talk to the R&D supervisor in Munich.",
              "Great initiative! That component fits perfectly into active design regulations."
            ];
            const randomReply = replies[Math.floor(Math.random() * replies.length)];
            return {
              ...chat,
              lastMessage: randomReply,
              messages: [
                ...chat.messages,
                { sender: 'other' as const, text: randomReply, timestamp: 'Just now' }
              ]
            };
          }
          return chat;
        }));
      }, 1200);
    }
  };
  // ── Swipe handlers ────────────────────────────────────────────────────────

  const handlePass = () => {
    if (networkQueue.length === 0) return;
    setSwipeDir('left');
    setTimeout(() => {
      showToast(`Passed on ${networkQueue[0].name}`);
      setNetworkQueue(prev => prev.slice(1));
      setSwipeDir(null);
    }, 200);
  };

  const handleUnlock = () => {
    if (networkQueue.length === 0) return;
    const match = networkQueue[0];
    setSwipeDir('right');

    setTimeout(() => {
      showToast(`☕ Coffee Chat unlocked with ${match.name}!`);

      // Create a ConnectionChat
      const chatId = `coffee_${match.id}`;
      const chatExists = connections.some(c => c.id === chatId);
      if (!chatExists) {
        const openingMsg = match.matchReason
          ? `Hi! I noticed your work on "${match.interestedInProject}" — ${match.matchReason} Would love to have a quick coffee chat!`
          : `Hi! I came across your profile and would love to have a quick coffee chat to discuss your projects.`;

        const newChat: ConnectionChat = {
          id: chatId,
          name: match.name,
          role: `${match.role.split(' ')[0]} @ WE`,
          imageUrl: match.imageUrl,
          online: true,
          lastMessage: openingMsg,
          messages: [
            { sender: 'other' as const, text: openingMsg, timestamp: 'Just now' }
          ]
        };
        setConnections(prev => [newChat, ...prev]);

        // Also create an accepted invite so it shows in Coffee Chat Desk history
        const newInvite: CoffeeChatInvite = {
          id: `inv_${match.id}_${Date.now()}`,
          candidateId: 'c_sarah_j',
          managerName: match.name,
          managerDept: match.university || match.role,
          managerResearch: match.matchReason || match.description.slice(0, 80),
          score: match.projectMatchScore ?? 70,
          status: 'accepted',
          studentSharedProfile: false,
          managerSharedProfile: true,
          timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
        };
        setInvites(prev => [newInvite, ...prev]);

        setActiveChatId(chatId);
        setSubTab('coffee');
      }

      setNetworkQueue(prev => prev.slice(1));
      setSwipeDir(null);
    }, 250);
  };

  // ── Invite handlers ───────────────────────────────────────────────────────

  const handleAcceptInvite = (invite: CoffeeChatInvite) => {
    setInvites(prev => prev.map(inv =>
      inv.id === invite.id ? { ...inv, status: 'accepted' } : inv
    ));

    const chatId = `chat_${invite.id}`;
    const chatExists = connections.some(c => c.id === chatId);
    if (!chatExists) {
      const newChat: ConnectionChat = {
        id: chatId,
        name: invite.managerName,
        role: invite.managerDept,
        imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
        online: true,
        lastMessage: "Coffee chat match accepted! Let's schedule a time to meet.",
        messages: [
          { sender: 'other' as const, text: `Hi! Thanks for accepting the coffee chat invite. I'm very interested in your work. Let's arrange a quick call.`, timestamp: invite.timestamp }
        ]
      };
      setConnections(prev => [newChat, ...prev]);
      setActiveChatId(chatId);
    }
    showToast("Coffee chat match accepted!");
  };

  const handleDeclineInvite = (inviteId: string) => {
    setInvites(prev => prev.map(inv =>
      inv.id === inviteId ? { ...inv, status: 'rejected' } : inv
    ));
    showToast("Coffee chat invitation declined.");
  };

  const handleToggleStudentShare = (inviteId: string) => {
    setInvites(prev => prev.map(inv => {
      if (inv.id === inviteId) {
        const next = !inv.studentSharedProfile;
        showToast(next ? "Authorized CV profile access" : "Revoked CV profile access");
        return { ...inv, studentSharedProfile: next };
      }
      return inv;
    }));
  };

  // ── Derived state ─────────────────────────────────────────────────────────

  const pendingInvites = invites.filter(inv => inv.status === 'pending');
  const acceptedInvites = invites.filter(inv => inv.status === 'accepted');
  const totalCoffeeChats = acceptedInvites.length;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div id="view-network" className="max-w-7xl mx-auto w-full space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="font-display font-bold text-2xl text-slate-900">WE Academic Network</h2>
          <p className="text-slate-500 text-xs mt-1">
            Discover Würth Elektronik experts matched to your projects — swipe right to unlock a coffee chat.
          </p>
        </div>

        {/* Sub-tab toggle */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
          <button
            onClick={() => setSubTab('matches')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${subTab === 'matches'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-500 hover:text-slate-950'
              }`}
          >
            <Target className="w-3.5 h-3.5 text-red-500" />
            Employee Matches
            {networkQueue.length > 0 && (
              <span className="bg-red-600 text-white font-mono text-[9px] px-1.5 rounded-full">
                {networkQueue.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setSubTab('coffee')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${subTab === 'coffee'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-500 hover:text-slate-950'
              }`}
          >
            <Coffee className="w-3.5 h-3.5 text-amber-600" />
            My Coffee Chats
            {(pendingInvites.length + totalCoffeeChats) > 0 && (
              <span className="bg-amber-500 text-white font-mono text-[9px] px-1.5 rounded-full">
                {pendingInvites.length + totalCoffeeChats}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── EMPLOYEE MATCHES SWIPE TAB ── */}
      {subTab === 'matches' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Swipe Card Stack */}
          <div className="lg:col-span-7 flex flex-col items-center">
            <div className="w-full max-w-sm h-[510px] relative">
              <AnimatePresence mode="popLayout">
                {networkQueue.length > 0 ? (
                  <motion.div
                    key={networkQueue[0].id}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{
                      scale: 1,
                      opacity: 1,
                      x: swipeDir === 'left' ? -120 : swipeDir === 'right' ? 120 : 0,
                      rotate: swipeDir === 'left' ? -8 : swipeDir === 'right' ? 8 : 0
                    }}
                    exit={{ x: swipeDir === 'right' ? 160 : -160, opacity: 0, rotate: swipeDir === 'right' ? 12 : -12 }}
                    transition={{ duration: 0.22 }}
                    className="absolute inset-0 bg-white border border-slate-200 rounded-3xl shadow-lg hover:shadow-xl overflow-hidden flex flex-col"
                  >
                    {/* Cover image */}
                    <div className="h-44 bg-slate-100 overflow-hidden relative shrink-0">
                      <img
                        className="w-full h-full object-cover"
                        src={networkQueue[0].imageUrl}
                        alt={networkQueue[0].name}
                        referrerPolicy="no-referrer"
                      />
                      {/* Tags overlay */}
                      <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
                        {networkQueue[0].tags.map((t, i) => (
                          <span key={i} className="bg-red-600 text-white font-semibold text-[8px] uppercase tracking-wider px-2 py-0.5 rounded shadow">
                            {t}
                          </span>
                        ))}
                      </div>
                      {/* Match score pill */}
                      {networkQueue[0].projectMatchScore !== undefined && (
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg px-2.5 py-1 flex items-center gap-1 shadow border border-white/60">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                          <span className="text-[10px] font-black font-mono text-slate-800">
                            {networkQueue[0].projectMatchScore}% match
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Profile body */}
                    <div className="p-5 flex-1 flex flex-col justify-between overflow-hidden">
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between items-baseline">
                            <h3 className="font-display font-bold text-lg text-slate-950 leading-tight">
                              {networkQueue[0].name}
                            </h3>
                            <span className="text-[9px] text-slate-400 font-mono tracking-wider font-semibold uppercase shrink-0 ml-2">WE Expert</span>
                          </div>
                          <p className="text-xs font-semibold text-red-600 mt-0.5">{networkQueue[0].role}</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">{networkQueue[0].university}</p>
                        </div>

                        {/* ✨ Project match context banner */}
                        {networkQueue[0].matchReason && (
                          <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-100 rounded-xl p-3 flex items-start gap-2">
                            <Briefcase className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" />
                            <div className="min-w-0">
                              <span className="text-[9px] font-mono text-red-500 uppercase tracking-wider font-bold block mb-0.5">
                                Interested in your project
                              </span>
                              <p className="text-[11px] text-slate-700 leading-snug font-medium">
                                {networkQueue[0].matchReason}
                              </p>
                              {networkQueue[0].interestedInProject && (
                                <span className="inline-block mt-1.5 bg-white border border-red-200 text-red-700 text-[9px] font-bold px-2 py-0.5 rounded-full">
                                  📂 {networkQueue[0].interestedInProject}
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Skills */}
                        <div className="flex flex-wrap gap-1">
                          {networkQueue[0].skills.slice(0, 5).map((s, idx) => (
                            <span key={idx} className="bg-slate-100 text-slate-600 text-[9px] px-2 py-0.5 rounded-sm font-semibold tracking-wide">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex justify-center gap-6 mt-4 pt-4 border-t border-slate-100">
                        <button
                          onClick={handlePass}
                          title="Pass"
                          className="w-13 h-13 w-12 h-12 rounded-full border-2 border-slate-200 hover:border-slate-400 text-slate-400 hover:text-slate-700 flex items-center justify-center transition hover:bg-slate-50 cursor-pointer group"
                        >
                          <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        </button>

                        <button
                          onClick={handleUnlock}
                          title="Unlock Coffee Chat"
                          className="w-14 h-14 rounded-full bg-gradient-to-br from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white flex items-center justify-center transition shadow-lg shadow-red-500/30 cursor-pointer group"
                        >
                          <Coffee className="w-6 h-6 group-hover:scale-110 transition-transform" />
                        </button>
                      </div>

                      <p className="text-center text-[9px] text-slate-400 mt-2 font-mono">
                        ✗ Pass &nbsp;·&nbsp; ☕ Unlock Coffee Chat
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <div className="absolute inset-0 bg-slate-50 border border-slate-200 border-dashed rounded-3xl flex flex-col items-center justify-center text-center p-6">
                    <Check className="w-8 h-8 text-emerald-400 mb-2" />
                    <h4 className="font-display font-semibold text-slate-800 text-sm">All caught up!</h4>
                    <p className="text-xs text-slate-400 mt-2 max-w-[200px]">
                      You've reviewed all WE expert profiles. Check back as new experts join the network.
                    </p>
                    <button
                      onClick={() => setSubTab('coffee')}
                      className="mt-4 px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-1.5 cursor-pointer transition"
                    >
                      <Coffee className="w-3.5 h-3.5" />
                      View My Coffee Chats
                    </button>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right: Active Connections & Chat */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm min-h-[510px] flex flex-col">
            <div>
              <h3 className="font-display font-bold text-sm text-slate-900 border-b border-slate-100 pb-3 mb-4 tracking-tight flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                  Active Chats ({connections.length})
                </span>
                <span className="text-[10px] font-mono bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded border border-emerald-100 uppercase tracking-widest font-semibold">Online</span>
              </h3>

              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {connections.length > 0 ? connections.map((chat) => {
                  const inviteObj = invites.find(inv => `chat_${inv.id}` === chat.id || `coffee_${inv.candidateId}_${inv.id}` === chat.id);
                  const displayName = (inviteObj && !inviteObj.managerSharedProfile)
                    ? `Manager (${inviteObj.managerDept.split(' ')[0]})`
                    : chat.name;

                  return (
                    <div
                      key={chat.id}
                      onClick={() => setActiveChatId(chat.id)}
                      className={`p-3 rounded-2xl flex items-center gap-3 transition cursor-pointer border ${activeChatId === chat.id
                          ? 'bg-slate-100/70 border-slate-300'
                          : 'bg-slate-50 border-transparent hover:bg-slate-100/40'
                        }`}
                    >
                      <div className="relative shrink-0">
                        <img className="w-10 h-10 rounded-xl object-cover" src={chat.imageUrl} alt={chat.name} referrerPolicy="no-referrer" />
                        {chat.online && <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border border-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <h4 className="text-xs font-bold text-slate-950 truncate">{displayName}</h4>
                          <span className="text-[9px] font-mono text-slate-400 shrink-0">Online</span>
                        </div>
                        <p className="text-[11px] text-red-600 font-medium truncate mt-0.5">{chat.role}</p>
                        <p className="text-[10px] text-slate-400 truncate mt-1">{chat.lastMessage}</p>
                      </div>
                    </div>
                  );
                }) : (
                  <p className="text-xs text-slate-400 text-center py-6">Unlock a coffee chat to start messaging.</p>
                )}
              </div>
            </div>

            {/* Chat input */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex-1 flex flex-col justify-end bg-slate-50/50 rounded-2xl p-3 min-h-[180px]">
              {activeChatId ? (
                <div className="flex flex-col justify-between h-full">
                  <div className="flex-1 overflow-y-auto space-y-2 mb-3 max-h-[140px] p-1 pr-2">
                    {connections.find(c => c.id === activeChatId)?.messages.map((m, i) => (
                      <div key={i} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
                        <span className={`px-3 py-1.5 text-xs rounded-xl max-w-[85%] leading-relaxed ${m.sender === 'user'
                            ? 'bg-slate-900 text-white rounded-tr-none'
                            : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'
                          }`}>
                          {m.text}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      value={typedMessage}
                      onChange={(e) => setTypedMessage(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') sendChatMessage(); }}
                      className="flex-1 bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs focus:outline-none focus:border-red-500"
                    />
                    <button
                      onClick={sendChatMessage}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition shrink-0 cursor-pointer"
                    >
                      Send
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-slate-400 text-xs text-center p-6">Select a conversation above to view messages.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── COFFEE CHAT DESK TAB ── */}
      {subTab === 'coffee' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Unlocked / Pending invites */}
          <div className="lg:col-span-7 space-y-4">

            {/* Pending invites from recruiters */}
            {pendingInvites.length > 0 && (
              <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs">
                <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest font-semibold mb-4 flex items-center gap-1.5">
                  <Coffee className="w-4 h-4 text-red-600" />
                  Incoming Coffee Chat Requests ({pendingInvites.length})
                </h3>
                <div className="space-y-4">
                  {pendingInvites.map((invite) => (
                    <div
                      key={invite.id}
                      className="p-5 border border-slate-200 bg-slate-50/50 rounded-2xl flex flex-col justify-between gap-4 relative overflow-hidden"
                    >
                      <div className="absolute top-0 bottom-0 left-0 bg-red-600 w-1" />

                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <span className="px-2 py-0.5 bg-red-50 text-red-600 font-mono text-[8px] uppercase tracking-wider rounded font-bold">
                            Recruiter Sourcing
                          </span>
                          <h4 className="font-display font-semibold text-sm text-slate-900 mt-2">
                            Coffee Chat from {invite.managerName}
                          </h4>
                          <div className="mt-3 space-y-1.5 text-[11px] text-slate-600">
                            <div>
                              <span className="text-slate-400 uppercase text-[9px] tracking-wider block">Department</span>
                              <span className="text-slate-800 font-medium">{invite.managerDept}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 uppercase text-[9px] tracking-wider block">Research Focus</span>
                              <span className="text-slate-800 font-medium">{invite.managerResearch}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[9px] text-slate-400 font-mono uppercase block">Match Score</span>
                          <span className={`text-xs font-black font-mono px-2 py-0.5 rounded border ${scoreBadgeClass(invite.score)}`}>
                            {invite.score}%
                          </span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between gap-3">
                        <span className="text-[10px] text-slate-400 font-mono">Received: {invite.timestamp || 'Today'}</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDeclineInvite(invite.id)}
                            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold rounded-lg transition cursor-pointer"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => handleAcceptInvite(invite)}
                            className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold rounded-lg transition shadow-xs cursor-pointer"
                          >
                            Accept
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Accepted / Self-initiated coffee chats */}
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs">
              <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest font-semibold mb-4 flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-500" />
                Active Coffee Chats ({acceptedInvites.length})
              </h3>

              {acceptedInvites.length > 0 ? (
                <div className="space-y-3">
                  {acceptedInvites.map((inv) => (
                    <div
                      key={inv.id}
                      className="p-4 border border-slate-200 rounded-2xl bg-slate-50 flex flex-col gap-3 relative overflow-hidden"
                    >
                      <div className="absolute top-0 bottom-0 left-0 bg-emerald-500 w-1 rounded-l-2xl" />

                      {/* Match context banner */}
                      {inv.managerResearch && (
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-xl p-2.5 flex items-start gap-2">
                          <Briefcase className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" />
                          <p className="text-[10px] text-amber-800 leading-snug font-medium">
                            {inv.managerResearch}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                          <Coffee className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-slate-950 truncate leading-tight">
                            {inv.managerSharedProfile ? inv.managerName : `${inv.managerDept.split(' ')[0]} Expert`}
                          </h4>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">{inv.managerDept}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${scoreBadgeClass(inv.score)}`}>
                              {inv.score}% match
                            </span>
                            <span className="text-[9px] text-slate-400 font-mono">{inv.timestamp}</span>
                          </div>
                        </div>
                      </div>

                      {!inv.managerSharedProfile && (
                        <div className="bg-amber-50 border border-amber-100 text-amber-800 rounded-lg p-2 flex items-center gap-1.5 text-[9px] font-mono">
                          <Lock className="w-3 h-3 text-amber-600 shrink-0" />
                          <span>Contact details masked until both profiles are shared.</span>
                        </div>
                      )}

                      <div className="pt-2 border-t border-slate-200 flex flex-wrap gap-2 justify-between items-center">
                        <button
                          onClick={() => handleToggleStudentShare(inv.id)}
                          className={`px-3 py-1.5 rounded-lg text-[9px] font-bold transition flex items-center gap-1 cursor-pointer ${inv.studentSharedProfile
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              : 'bg-slate-200 hover:bg-slate-300 text-slate-700 border border-slate-300'
                            }`}
                        >
                          {inv.studentSharedProfile
                            ? <><Unlock className="w-3 h-3" /> CV Shared</>
                            : <><Lock className="w-3 h-3" /> Share My CV</>}
                        </button>

                        <button
                          onClick={() => {
                            const chatId = connections.find(c =>
                              c.name === inv.managerName || c.id.includes(inv.id)
                            )?.id;
                            if (chatId) {
                              setActiveChatId(chatId);
                              setSubTab('matches');
                            }
                          }}
                          className="text-[10px] text-red-600 font-bold hover:text-red-700 flex items-center gap-0.5 cursor-pointer"
                        >
                          Open Chat <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center border border-dashed border-slate-200 rounded-2xl">
                  <Coffee className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <h4 className="text-xs font-bold text-slate-800">No coffee chats yet</h4>
                  <p className="text-[10px] text-slate-400 mt-1 max-w-[220px] mx-auto">
                    Go to <strong>Employee Matches</strong> and swipe right on someone you'd like to chat with!
                  </p>
                  <button
                    onClick={() => setSubTab('matches')}
                    className="mt-4 px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1.5 cursor-pointer transition mx-auto"
                  >
                    <Target className="w-3.5 h-3.5" />
                    Browse Matches
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right: Matches history + consent */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-5 shadow-xs min-h-[350px] flex flex-col">
            <div className="flex-1">
              <h3 className="font-display font-bold text-sm text-slate-900 border-b border-slate-100 pb-3 mb-4 tracking-tight flex items-center justify-between">
                <span>Chat History ({acceptedInvites.length})</span>
                <span className="text-[9px] font-mono bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200 uppercase tracking-widest font-semibold">Privacy Desk</span>
              </h3>

              {acceptedInvites.length > 0 ? (
                <div className="space-y-3">
                  {acceptedInvites.map(inv => (
                    <div key={inv.id} className="p-3 border border-slate-100 rounded-xl bg-slate-50/50 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                        <Coffee className="w-4 h-4 text-red-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-bold text-slate-900 truncate">
                          {inv.managerSharedProfile ? inv.managerName : `${inv.managerDept.split(' ')[0]} Expert`}
                        </p>
                        <p className="text-[9px] text-slate-400 font-mono mt-0.5">{inv.timestamp} · {inv.score}% match</p>
                      </div>
                      <span className="text-[9px] font-mono font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded shrink-0">
                        Active
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center text-slate-400 text-xs">
                  No history yet.
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100">
              <p className="text-[10px] text-slate-400 leading-tight font-sans">
                🔒 Your profile is shared only when you explicitly grant access. You can revoke at any time.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
