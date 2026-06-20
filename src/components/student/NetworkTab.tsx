import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NetworkProfile, ConnectionChat, CoffeeChatInvite } from '../../types';
import { 
  X, Heart, MessageSquare, RotateCcw, Coffee, ShieldAlert, Check, Lock, Unlock, Eye, Sparkles, UserCheck, ChevronRight 
} from 'lucide-react';

interface NetworkTabProps {
  networkQueue: NetworkProfile[];
  setNetworkQueue: React.Dispatch<React.SetStateAction<NetworkProfile[]>>;
  connections: ConnectionChat[];
  setConnections: React.Dispatch<React.SetStateAction<ConnectionChat[]>>;
  showToast: (msg: string) => void;
  invites: CoffeeChatInvite[];
  setInvites: React.Dispatch<React.SetStateAction<CoffeeChatInvite[]>>;
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
  
  // New sub-tab state
  const [subTab, setSubTab] = useState<'tinder' | 'coffee'>('tinder');

  const sendChatMessage = () => {
    if (!typedMessage.trim() || !activeChatId) return;
    
    // Add User Message
    setConnections(prev => prev.map(chat => {
      if (chat.id === activeChatId) {
        const updatedMsgs = [
          ...chat.messages,
          { sender: 'user', text: typedMessage, timestamp: 'Just now' }
        ] as any;
        return {
          ...chat,
          lastMessage: typedMessage,
          messages: updatedMsgs
        };
      }
      return chat;
    }));

    setTypedMessage('');

    // Trigger simulated reply
    setTimeout(() => {
      setConnections(prev => prev.map(chat => {
        if (chat.id === activeChatId) {
          const replies = [
            "That sounds brilliant! Send me over your latest schematic layout to review.",
            "Absolutely! Let's arrange a Teams call to discuss the internship requirements.",
            "Yes, Würth Elektronik is hosting a student kit distribution next Tuesday. You should secure a spot!",
            "Fascinating insights. Let me talk to the R&D supervisor in Munich.",
            "Great initiative! That component fits perfectly into active design regulations."
          ];
          const randomReply = replies[Math.floor(Math.random() * replies.length)];
          return {
            ...chat,
            lastMessage: randomReply,
            messages: [
              ...chat.messages,
              { sender: 'other', text: randomReply, timestamp: 'Just now' }
            ] as any
          };
        }
        return chat;
      }));
    }, 1200);
  };

  const handleAcceptInvite = (invite: CoffeeChatInvite) => {
    // 1. Update invite status to accepted
    setInvites(prev => prev.map(inv => {
      if (inv.id === invite.id) {
        return { ...inv, status: 'accepted' };
      }
      return inv;
    }));

    // 2. Generate a new connection chat
    const managerChatId = `chat_${invite.id}`;
    
    // Check if chat already exists
    const chatExists = connections.some(c => c.id === managerChatId);
    if (!chatExists) {
      const newChat: ConnectionChat = {
        id: managerChatId,
        name: invite.managerName, // Will display conditionally based on consent in sidebar/chat view
        role: invite.managerDept,
        imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
        online: true,
        lastMessage: "Coffee chat match accepted! Let's schedule a time to meet.",
        messages: [
          { sender: 'other', text: `Hi Sarah! Thanks for matching for a coffee chat. I'm very interested in your RFID/PCB design projects. Let's arrange a brief Teams chat.`, timestamp: invite.timestamp }
        ]
      };
      setConnections(prev => [newChat, ...prev]);
      setActiveChatId(managerChatId);
    }

    showToast("Coffee chat match accepted successfully!");
  };

  const handleDeclineInvite = (inviteId: string) => {
    setInvites(prev => prev.map(inv => {
      if (inv.id === inviteId) {
        return { ...inv, status: 'rejected' };
      }
      return inv;
    }));
    showToast("Coffee chat invitation declined.");
  };

  const handleToggleStudentShare = (inviteId: string) => {
    setInvites(prev => prev.map(inv => {
      if (inv.id === inviteId) {
        const nextState = !inv.studentSharedProfile;
        showToast(nextState ? "Authorized Manager CV profile access" : "Revoked Manager CV profile access");
        return { ...inv, studentSharedProfile: nextState };
      }
      return inv;
    }));
  };

  // Get pending invitations
  const pendingInvites = invites.filter(inv => inv.status === 'pending');
  // Get accepted invitations
  const acceptedInvites = invites.filter(inv => inv.status === 'accepted');

  return (
    <div id="view-network" className="max-w-7xl mx-auto w-full space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="font-display font-bold text-2xl text-slate-900">WE Academic Matching Queue</h2>
          <p className="text-slate-500 text-xs mt-1">
            Interact with real-world Würth engineering staff, HR specialists, and system designers globally.
          </p>
        </div>

        {/* Sub-tab navigations */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
          <button 
            onClick={() => setSubTab('tinder')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer ${
              subTab === 'tinder' 
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200' 
                : 'text-slate-500 hover:text-slate-950'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-red-500" />
            Tinder Mode
          </button>
          <button 
            onClick={() => setSubTab('coffee')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer ${
              subTab === 'coffee' 
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200' 
                : 'text-slate-500 hover:text-slate-950'
            }`}
          >
            <Coffee className="w-3.5 h-3.5 animate-bounce text-red-600" />
            Coffee Chat Desk
            {pendingInvites.length > 0 && (
              <span className="bg-red-600 text-white font-mono text-[9px] px-1.5 py-0.2 rounded-full">
                {pendingInvites.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* RENDER TINDER SWIPE MODE */}
      {subTab === 'tinder' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Tinder Swipe stack panel */}
          <div className="lg:col-span-7 flex flex-col items-center">
            
            {/* The Current Sweeping Card */}
            <div className="w-full max-w-sm h-[480px] relative">
              <AnimatePresence mode="popLayout">
                {networkQueue.length > 0 ? (
                  <motion.div 
                    key={networkQueue[0].id}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ x: 100, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 bg-white border border-slate-250 rounded-3xl shadow-lg hover:shadow-xl overflow-hidden flex flex-col justify-between"
                  >
                    {/* Profile Cover view */}
                    <div className="h-48 bg-slate-100 overflow-hidden relative">
                      <img 
                        className="w-full h-full object-cover"
                        src={networkQueue[0].imageUrl} 
                        alt={networkQueue[0].name}
                        referrerPolicy="no-referrer"
                      />
                      {/* Visual tags overlay */}
                      <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
                        {networkQueue[0].tags.map((t, i) => (
                          <span key={i} className="bg-red-600 text-white font-semibold text-[8px] uppercase tracking-wider px-2 py-0.5 rounded shadow">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Profile Information details body */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-baseline">
                          <h3 className="font-display font-bold text-lg text-slate-950">
                            {networkQueue[0].name}, {networkQueue[0].age}
                          </h3>
                          <span className="text-[10px] text-slate-400 font-mono tracking-wider font-semibold uppercase">Würth Elektronik</span>
                        </div>
                        <p className="text-xs font-semibold text-red-600 mt-1">{networkQueue[0].role}</p>
                        
                        <p className="text-slate-500 text-xs mt-3 leading-relaxed font-sans">{networkQueue[0].description}</p>
                        
                        {/* Skills */}
                        <div className="mt-4">
                          <div className="flex flex-wrap gap-1">
                            {networkQueue[0].skills.map((s, idx) => (
                              <span key={idx} className="bg-slate-100 text-slate-600 text-[9px] px-2 py-0.5 rounded-sm font-semibold tracking-wide">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Standard Interaction footer widgets */}
                      <div className="flex justify-center gap-6 mt-4 pt-4 border-t border-slate-100">
                        <button 
                          onClick={() => {
                            showToast(`Passed on ${networkQueue[0].name}`);
                            setNetworkQueue(prev => prev.slice(1));
                          }}
                          className="w-12 h-12 rounded-full border border-slate-200 hover:border-slate-800 text-slate-400 hover:text-slate-800 flex items-center justify-center transition hover:bg-slate-50 cursor-pointer"
                        >
                          <X className="w-5 h-5" />
                        </button>
                                                      
                        <button 
                          onClick={() => {
                            const match = networkQueue[0];
                            showToast(`IT'S A MATCH! Connected with ${match.name}`);
                            
                            // Append to connections
                            const newChat: ConnectionChat = {
                              id: `match-${match.id}`,
                              name: match.name,
                              role: `${match.role.split(' ')[0]} @ WE`,
                              imageUrl: match.imageUrl,
                              online: true,
                              lastMessage: 'Hey! Glad we matched. What are you building?',
                              messages: [
                                { sender: 'other', text: 'Hey! Glad we matched. What are you working on right now?', timestamp: 'Just now' }
                              ]
                            };
                            setConnections(prev => [newChat, ...prev]);
                            setActiveChatId(newChat.id); // auto-open chat drawer
                            setNetworkQueue(prev => prev.slice(1));
                          }}
                          className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition shadow shadow-red-500/30 cursor-pointer"
                        >
                          <Heart className="w-5 h-5 fill-white" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="absolute inset-0 bg-slate-100 border border-slate-200 border-dashed rounded-3xl flex flex-col items-center justify-center text-center p-6">
                    <RotateCcw className="w-8 h-8 text-slate-400 mb-2 animate-spin duration-300" />
                    <h4 className="font-display font-semibold text-slate-800 text-sm">Review queue completed</h4>
                    <p className="text-xs text-slate-400 mt-2 max-w-[200px]">Check back later as more Würth specialists join WE Connect.</p>
                    <button 
                      onClick={() => setNetworkQueue([
                        {
                          id: 'n1',
                          name: 'Sarah Weber',
                          age: 28,
                          role: 'Senior Mechanical Design Engineer',
                          university: 'Würth Elektronik GmbH',
                          tags: ['Senior Engineer', 'EMC Specialist', 'WE Mentor'],
                          skills: ['SolidWorks Pro', 'FEA Modeling', 'Thermal Dissipation', 'CAD Optimization'],
                          description: 'Hi Sarah! I specialize in mechanical housing shielding for EMI-critical boards. Super excited to mentor students bridging physical dynamics and signal integrity.',
                          imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300'
                        }
                      ])}
                      className="mt-4 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-mono tracking-wider uppercase cursor-pointer"
                    >
                      Reset Queue
                    </button>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Connections Drawer & Chat */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm min-h-[480px] flex flex-col justify-between">
            <div>
              <h3 className="font-display font-bold text-sm text-slate-900 border-b border-slate-100 pb-3 mb-4 tracking-tight flex items-center justify-between">
                <span>Active Mentors & Peers ({connections.length})</span>
                <span className="text-[10px] font-mono bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded border border-emerald-100 uppercase tracking-widest font-semibold text-right">Online chat</span>
              </h3>

              {/* Chat selection stack list */}
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {connections.map((chat) => {
                  // Find if this is a coffee chat invite to check manager shared status
                  const isManagerChat = chat.id.startsWith('chat_invite_');
                  const inviteObj = isManagerChat 
                    ? invites.find(inv => `chat_${inv.id}` === chat.id)
                    : null;
                  const displayManagerName = inviteObj && !inviteObj.managerSharedProfile
                    ? `Manager (${inviteObj.managerDept.split(' ')[0]})`
                    : chat.name;

                  return (
                    <div 
                      key={chat.id}
                      onClick={() => setActiveChatId(chat.id)}
                      className={`p-3 rounded-2xl flex items-center gap-3 transition cursor-pointer border ${
                        activeChatId === chat.id 
                          ? 'bg-slate-100/70 border-slate-300' 
                          : 'bg-slate-50 border-transparent hover:bg-slate-100/40'
                      }`}
                    >
                      <div className="relative shrink-0">
                        <img 
                          className="w-10 h-10 rounded-xl object-cover"
                          src={chat.imageUrl} 
                          alt={chat.name}
                          referrerPolicy="no-referrer"
                        />
                        {chat.online && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border border-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <h4 className="text-xs font-bold text-slate-950 truncate">{displayManagerName}</h4>
                          <span className="text-[9px] font-mono text-slate-400">Online</span>
                        </div>
                        <p className="text-[11px] text-red-600 font-medium truncate mt-0.5">{chat.role}</p>
                        <p className="text-[10px] text-slate-400 truncate mt-1">{chat.lastMessage}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Active Message Box Preview */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex-1 flex flex-col justify-end bg-slate-50/50 rounded-2xl p-3 min-h-[180px]">
              {activeChatId ? (
                <div className="flex flex-col justify-between h-full">
                  {/* Messages stack */}
                  <div className="flex-1 overflow-y-auto space-y-2 mb-3 max-h-[140px] p-1 pr-2">
                    {connections.find(c => c.id === activeChatId)?.messages.map((m, i) => (
                      <div key={i} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
                        <span className={`px-3 py-1.5 text-xs rounded-xl max-w-[85%] leading-relaxed ${
                          m.sender === 'user' 
                            ? 'bg-slate-900 text-white rounded-tr-none' 
                            : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'
                        }`}>
                          {m.text}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Text fields trigger */}
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Type a message..."
                      value={typedMessage}
                      onChange={(e) => setTypedMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') sendChatMessage();
                      }}
                      className="flex-1 bg-white border border-slate-250 px-3 py-1.5 rounded-lg text-xs focus:outline-none focus:border-red-600"
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
                <p className="text-slate-400 text-xs text-center p-6">Select or match an engineering mentor above to load conversation logs.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* RENDER COFFEE CHAT MATCH DESK */}
      {subTab === 'coffee' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Incoming invitations lists */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs">
              <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest font-semibold mb-4 flex items-center gap-1.5">
                <Coffee className="w-4 h-4 text-red-600" />
                Pending Coffee Chat Invites ({pendingInvites.length})
              </h3>
              
              {pendingInvites.length > 0 ? (
                <div className="space-y-4">
                  {pendingInvites.map((invite) => (
                    <div 
                      key={invite.id} 
                      className="p-5 border border-slate-200 bg-slate-50/50 rounded-2xl flex flex-col justify-between gap-4 relative overflow-hidden"
                    >
                      {/* Decorative border strip */}
                      <div className="absolute top-0 bottom-0 left-0 bg-red-600 w-1" />

                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <span className="px-2 py-0.5 bg-red-50 text-red-600 font-mono text-[8px] uppercase tracking-wider rounded font-bold">
                            Recruitment Sourcing
                          </span>
                          <h4 className="font-display font-semibold text-sm text-slate-905 mt-2 leading-tight">
                            Coffee Chat Invite from Manager
                          </h4>
                          
                          <div className="mt-3 space-y-1.5 font-mono text-[11px] text-slate-600">
                            <div>
                              <span className="text-slate-400 uppercase text-[9px] tracking-wider block">Department</span>
                              <span className="text-slate-800 font-sans font-medium">{invite.managerDept}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 uppercase text-[9px] tracking-wider block">Research Focus Area</span>
                              <span className="text-slate-800 font-sans font-medium">{invite.managerResearch}</span>
                            </div>
                          </div>
                        </div>

                        {/* Match score display */}
                        <div className="text-right">
                          <span className="text-[9px] text-slate-400 font-mono uppercase block">Match Score</span>
                          <span className="text-xs font-black font-mono text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">{invite.score}%</span>
                        </div>
                      </div>

                      <div className="mt-2 pt-3 border-t border-slate-200/80 flex items-center justify-between gap-3">
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
                            Accept Coffee Chat
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center border border-dashed border-slate-250 rounded-2xl">
                  <ShieldAlert className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
                  <h4 className="text-xs font-bold text-slate-800">No Pending Requests</h4>
                  <p className="text-[10px] text-slate-400 mt-1 max-w-[200px] mx-auto">
                    You have no pending manager invitations. Make sure your match score settings are updated.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Matches log history and privacy sharing */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-5 shadow-xs min-h-[350px] flex flex-col justify-between">
            <div>
              <h3 className="font-display font-bold text-sm text-slate-900 border-b border-slate-100 pb-3 mb-4 tracking-tight flex items-center justify-between">
                <span>Coffee Chat Matches & History ({acceptedInvites.length})</span>
                <span className="text-[9px] font-mono bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200 uppercase tracking-widest font-semibold">Consent Desk</span>
              </h3>

              {acceptedInvites.length > 0 ? (
                <div className="space-y-3">
                  {acceptedInvites.map((inv) => {
                    const managerShared = inv.managerSharedProfile;

                    return (
                      <div 
                        key={inv.id} 
                        className="p-3 border border-slate-200 rounded-xl bg-slate-50 flex flex-col gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
                            <Coffee className="w-5 h-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-bold text-slate-950 truncate leading-tight">
                              {managerShared ? inv.managerName : `Manager (${inv.managerDept.split(' ')[0]})`}
                            </h4>
                            <p className="text-[11px] text-slate-500 truncate mt-0.5">{inv.managerDept}</p>
                            <p className="text-[9px] text-slate-400 font-mono mt-0.5">Match score: {inv.score}%</p>
                          </div>
                        </div>

                        {/* Status notification banner */}
                        {!managerShared && (
                          <div className="bg-amber-50 border border-amber-100 text-amber-800 rounded-lg p-2 flex items-center gap-1.5 text-[9px] font-mono">
                            <Lock className="w-3 h-3 text-amber-600 shrink-0" />
                            <span>Manager profile name & contact details masked.</span>
                          </div>
                        )}

                        {/* Interactive toggle settings */}
                        <div className="pt-2 border-t border-slate-200 flex flex-wrap gap-2 justify-between items-center">
                          <button 
                            onClick={() => handleToggleStudentShare(inv.id)}
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-bold transition flex items-center gap-1 cursor-pointer ${
                              inv.studentSharedProfile 
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                                : 'bg-slate-200 hover:bg-slate-250 text-slate-700 border border-slate-300'
                            }`}
                          >
                            {inv.studentSharedProfile ? (
                              <>
                                <Unlock className="w-3 h-3" />
                                CV Access: Shared
                              </>
                            ) : (
                              <>
                                <Lock className="w-3 h-3" />
                                Share Full CV
                              </>
                            )}
                          </button>

                          <button 
                            onClick={() => {
                              setActiveChatId(`chat_${inv.id}`);
                              setSubTab('tinder');
                            }}
                            className="text-[10px] text-red-600 font-bold hover:text-red-700 flex items-center gap-0.5 cursor-pointer"
                          >
                            Open Chat
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No matches conducted yet. Set up matches by accepting invitations in the queue on the left.
                </div>
              )}
            </div>

            <p className="text-[10px] text-slate-400 leading-tight font-sans mt-4 pt-3 border-t border-slate-100">
              Only share your profile when you feel comfortable during or after a Coffee Chat session.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
