import React from 'react';
import { Download, Ticket, AlertCircle, Check } from 'lucide-react';

interface TicketTabProps {
  showToast: (msg: string) => void;
}

export default function TicketTab({ showToast }: TicketTabProps) {
  return (
    <div id="view-ticket" className="max-w-4xl mx-auto space-y-6">
      
      <div className="flex justify-between items-center pb-4 border-b border-slate-200">
        <div>
          <h2 className="font-display font-bold text-2xl text-slate-900">Event Boarding Passes</h2>
          <p className="text-slate-500 text-xs mt-1">Present this QR code ticket on your device at the entry gates</p>
        </div>
        {/* PDF generation mockup */}
        <div className="flex gap-2.5">
          <button 
            onClick={() => showToast("Exporting receipt: TKT-8492-XJZ.pdf downloaded.")}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold select-none flex items-center gap-1 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Download PDF
          </button>
          <button 
            onClick={() => showToast("Added ticket to system Wallet application")}
            className="px-3.5 py-1.5 bg-slate-950 hover:bg-slate-850 text-white rounded-lg text-xs font-semibold select-none flex items-center gap-1 cursor-pointer"
          >
            Add to Wallet
          </button>
        </div>
      </div>

      {/* Envelope Paper Boarding Pass Container */}
      <div className="relative bg-white border border-slate-250 rounded-3xl overflow-hidden shadow-xl max-w-2xl mx-auto my-6">
        
        {/* Top styling strip */}
        <div className="bg-red-600 text-white px-6 py-2.5 flex justify-between items-center font-mono">
          <span className="text-[10px] uppercase tracking-widest font-bold">WE ACADEMY SPECIAL BOARDING ACCESS</span>
          <span className="text-[10px] uppercase font-bold">SERIAL: TKT-8492-XJZ</span>
        </div>

        {/* Ticket Layout split */}
        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 relative">
          
          {/* Decorative cutouts inside ticket sides */}
          <div className="hidden md:block absolute top-[110px] -left-3.5 w-7 h-7 rounded-full bg-slate-50 border border-slate-250" />
          <div className="hidden md:block absolute top-[110px] -right-3.5 w-7 h-7 rounded-full bg-slate-50 border border-slate-250" />

          {/* Left Segment details block */}
          <div className="md:col-span-8 space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 font-semibold text-[9px] uppercase tracking-wider rounded-md border border-emerald-100 flex items-center gap-1">
                <Check className="w-3 h-3 stroke-[3]" />
                CONFIRMED REGISTRATION
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest block">EVENT NAME</span>
              <h3 className="font-display font-bold text-xl md:text-2xl text-slate-900 tracking-tight leading-tight mt-1">
                Global Tech Summit 2024
              </h3>
              <p className="text-slate-600 text-xs mt-1">Featuring systems planning, advanced materials science, and IoT evaluations</p>
            </div>

            <div className="border-t border-slate-100 pt-4 grid grid-cols-2 gap-4 font-mono">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest block">ATTENDEE PARTICIPANT</span>
                <p className="text-xs font-semibold text-slate-900 font-sans tracking-tight block mt-1">SARAH JENKINS</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest block">SEAT / SECTION</span>
                <p className="text-xs font-semibold text-slate-900 font-sans tracking-tight block mt-1">SEC A, ROW 4 &middot; COHORT 3</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 font-mono pt-1">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest block">LOCATION ENCLAVE</span>
                <p className="text-xs font-semibold text-slate-900 font-sans tracking-tight block mt-1">INNOVATION HUB, BERLIN</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest block">TICKET TIER</span>
                <p className="text-xs font-bold text-red-600 font-sans uppercase tracking-wide block mt-1">STUDENT VIP ACCESS</p>
              </div>
            </div>
          </div>

          {/* Right Flap with scan QR design */}
          <div className="md:col-span-4 border-t md:border-t-0 md:border-l border-dashed border-slate-200 pt-6 md:pt-0 md:pl-6 flex flex-col items-center justify-between">
            <div className="text-center w-full">
              <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest block mb-2.5">SCAN ENTRY GATE</span>
              
              {/* Interactive simulated QR code */}
              <div className="w-32 h-32 bg-slate-50 border border-slate-200.5 rounded-2xl p-2 relative mx-auto hover:bg-slate-100 transition duration-300">
                <svg className="w-full h-full text-slate-900" viewBox="0 0 100 100" fill="currentColor">
                  <rect x="5" y="5" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="5" />
                  <rect x="10" y="10" width="15" height="15" />
                  
                  <rect x="70" y="5" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="5" />
                  <rect x="75" y="10" width="15" height="15" />
                  
                  <rect x="5" y="70" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="5" />
                  <rect x="10" y="75" width="15" height="15" />

                  {/* Complex random QR elements */}
                  <rect x="40" y="20" width="10" height="20" />
                  <rect x="20" y="40" width="20" height="10" />
                  <rect x="50" y="50" width="15" height="15" />
                  <rect x="70" y="40" width="10" height="10" />
                  <rect x="75" y="60" width="15" height="15" />
                  <rect x="40" y="75" width="20" height="10" />
                </svg>

                {/* Interactive scanline */}
                <div className="absolute left-0 w-full h-0.5 ticket-scanline pointer-events-none" />
              </div>

              <span className="text-[10px] text-slate-400 font-mono block mt-2">OCT 15, 2024 &middot; 2:00 PM</span>
            </div>

            <div className="text-center w-full mt-4">
              <span className="text-[9px] text-slate-400 font-mono uppercase tracking-wide">COHORT ENROLLMENT</span>
              <p className="text-[10px] font-semibold text-slate-700">WE-ACADEMY-2024</p>
            </div>
          </div>

        </div>

      </div>
      
      {/* Important advisory row alert */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 max-w-2xl mx-auto">
        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-800 leading-relaxed font-sans">
          <strong className="font-semibold block">Entry Gate Protocol</strong>
          Gates open exactly 30 minutes prior to session presentation. Please present physical ID along with this digital check-in queue scan reference. Student kits (if registered) can be collected at Desk F.
        </div>
      </div>

    </div>
  );
}
