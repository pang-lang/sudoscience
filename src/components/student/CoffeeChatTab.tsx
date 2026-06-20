import React from 'react';
import { CoffeeChatInvite, ConnectionChat } from '../../types';
import { Coffee, ShieldAlert, Lock, Unlock, Check, ChevronRight, X } from 'lucide-react';

interface CoffeeChatTabProps {
  invites: CoffeeChatInvite[];
  setInvites: React.Dispatch<React.SetStateAction<CoffeeChatInvite[]>>;
  connections: ConnectionChat[];
  setConnections: React.Dispatch<React.SetStateAction<ConnectionChat[]>>;
  showToast: (msg: string) => void;
  setCurrentTab: (tab: any) => void;
}

export default function CoffeeChatTab({
  invites,
  setInvites,
  connections,
  setConnections,
  showToast,
  setCurrentTab
}: CoffeeChatTabProps) {
  const pendingInvites = invites.filter(inv => inv.status === 'pending');
  const acceptedInvites = invites.filter(inv => inv.status === 'accepted');

  const handleAcceptInvite = (invite: CoffeeChatInvite) => {
    // 1. Update invite status
    setInvites(prev => prev.map(inv => {
      if (inv.id === invite.id) {
        return { ...inv, status: 'accepted' };
      }
      return inv;
    }));

    // 2. Generate a new connection chat
    const managerChatId = `chat_${invite.id}`;
    const chatExists = connections.some(c => c.id === managerChatId);
    if (!chatExists) {
      const newChat: ConnectionChat = {
        id: managerChatId,
        name: invite.managerName,
        role: invite.managerDept,
        imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
        online: true,
        lastMessage: "Coffee chat match accepted! Let's schedule a time to meet.",
        messages: [
          { sender: 'other', text: `Hi Sarah! Thanks for matching for a coffee chat. I'm very interested in your RFID/PCB design projects. Let's arrange a brief Teams chat.`, timestamp: invite.timestamp }
        ]
      };
      setConnections(prev => [newChat, ...prev]);
    }

    showToast("Coffee chat match accepted! You can now chat in the Industry Network.");
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

  return (
    <div id="view-coffee-chat-desk" className="max-w-5xl space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-red-900 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <span className="text-[10px] text-red-400 font-mono uppercase tracking-widest font-bold block mb-1">Privacy-First Sourcing</span>
          <h2 className="font-display font-black text-2xl md:text-3xl tracking-tight">Manager Coffee Chat Desk</h2>
          <p className="text-slate-300 text-xs mt-2 leading-relaxed">
            Connect directly with engineering leaders. Your name and school are masked initially. Share your full CV only when you choose to.
          </p>
        </div>
        {/* Background Coffee Cup glow */}
        <div className="absolute right-8 bottom-0 translate-y-4 opacity-10 pointer-events-none">
          <Coffee className="w-56 h-56" />
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Pending Invitations list */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-xs font-mono text-slate-400 uppercase tracking-widest font-semibold mb-4 flex items-center gap-1.5">
              <Coffee className="w-4 h-4 text-red-600 animate-bounce" />
              Incoming Invites ({pendingInvites.length})
            </h3>
            
            {pendingInvites.length > 0 ? (
              <div className="space-y-4">
                {pendingInvites.map((invite) => (
                  <div 
                    key={invite.id} 
                    className="p-5 border border-slate-200 bg-slate-50/50 rounded-2xl flex flex-col justify-between gap-4 relative overflow-hidden transition hover:border-slate-350 hover:bg-white"
                  >
                    <div className="absolute top-0 bottom-0 left-0 bg-red-600 w-1" />

                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="px-2 py-0.5 bg-red-50 text-red-600 font-mono text-[8px] uppercase tracking-wider rounded font-bold">
                          Outbound Match Score: {invite.score}%
                        </span>
                        <h4 className="font-display font-semibold text-sm text-slate-900 mt-2">
                          Coffee Chat Request
                        </h4>
                        
                        <div className="mt-3 space-y-2 font-mono text-xs">
                          <div>
                            <span className="text-slate-400 uppercase text-[9px] tracking-wider block">Department</span>
                            <span className="text-slate-800 font-sans font-medium">{invite.managerDept}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 uppercase text-[9px] tracking-wider block">Research Focus</span>
                            <span className="text-slate-800 font-sans font-medium">{invite.managerResearch}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[9px] text-slate-400 font-mono uppercase block">Match Score</span>
                        <span className="text-xs font-black font-mono text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">{invite.score}%</span>
                      </div>
                    </div>

                    <div className="mt-2 pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
                      <span className="text-[10px] text-slate-400 font-mono">Received: {invite.timestamp || 'Today'}</span>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleDeclineInvite(invite.id)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold rounded-lg transition cursor-pointer"
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
            ) : (
              <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                <ShieldAlert className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <h4 className="text-xs font-bold text-slate-800">No Pending Requests</h4>
                <p className="text-[10px] text-slate-400 mt-1 max-w-[200px] mx-auto">
                  Managers with matching criteria will reach out here. Set up match settings in the Recruiter side to test.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Accepted Matches history and CV sharing */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm min-h-[350px]">
          <h3 className="font-display font-bold text-sm text-slate-900 border-b border-slate-100 pb-3 mb-4 tracking-tight flex items-center justify-between">
            <span>Match History ({acceptedInvites.length})</span>
            <span className="text-[9px] font-mono bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded border border-emerald-100 uppercase tracking-widest font-semibold">Active</span>
          </h3>

          {acceptedInvites.length > 0 ? (
            <div className="space-y-4">
              {acceptedInvites.map((inv) => {
                const managerShared = inv.managerSharedProfile;

                return (
                  <div 
                    key={inv.id} 
                    className="p-4 border border-slate-200 rounded-2xl bg-slate-50/50 hover:bg-white transition flex flex-col gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100 font-bold">
                        ☕
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-slate-950 truncate leading-tight">
                          {managerShared ? inv.managerName : `Manager (${inv.managerDept.split(' ')[0]})`}
                        </h4>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">{inv.managerDept}</p>
                        <p className="text-[9px] text-slate-400 font-mono mt-0.5">Match Score: {inv.score}%</p>
                      </div>
                    </div>

                    {!managerShared && (
                      <div className="bg-amber-50 border border-amber-100 text-amber-800 rounded-lg p-2 flex items-center gap-1.5 text-[9px] font-mono">
                        <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Manager profile is masked. Awaiting contact release.</span>
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-200 flex justify-between items-center gap-2">
                      <button 
                        onClick={() => handleToggleStudentShare(inv.id)}
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-bold transition flex items-center gap-1 cursor-pointer ${
                          inv.studentSharedProfile 
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                            : 'bg-slate-200 hover:bg-slate-250 text-slate-700 border border-slate-350'
                        }`}
                      >
                        {inv.studentSharedProfile ? (
                          <>
                            <Unlock className="w-3 h-3" />
                            CV Shared
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3" />
                            Share My CV
                          </>
                        )}
                      </button>

                      <button 
                        onClick={() => {
                          setCurrentTab('network');
                        }}
                        className="text-[10px] text-red-600 font-bold hover:text-red-700 flex items-center gap-0.5 cursor-pointer"
                      >
                        Go to Chats
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              No matches established. Match invites will record here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
