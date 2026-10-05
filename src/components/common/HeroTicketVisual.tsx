export function HeroTicketVisual() {
  return (
    <div className="hero-cyber-ticket relative w-full max-w-[540px] aspect-[16/11] select-none pointer-events-none flex items-center justify-center">
      {/* 1. Deep Radial Ambient Glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/35 via-cyan-500/25 to-purple-600/25 blur-3xl rounded-full transform -rotate-6 scale-100" />
      <div className="absolute -top-6 -right-6 w-52 h-52 bg-cyan-400/20 rounded-full blur-2xl pointer-events-none" />

      {/* 2. Light Trail Effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-cyan-400/30 to-blue-600/40 rounded-3xl blur-md opacity-70 transform -rotate-2" />

      {/* 3. 3D Angled Neon Ticket Container matching design_reference.png */}
      <div className="relative w-[92%] h-[84%] rounded-3xl p-[1.5px] bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 shadow-[0_25px_65px_-15px_rgba(37,99,235,0.5)] transform rotate-[-2deg]">
        
        {/* Inner Ticket Glass Body */}
        <div className="w-full h-full rounded-[22px] bg-[#0A0F1D]/95 backdrop-blur-2xl border border-blue-400/30 p-6 flex flex-col justify-between overflow-hidden relative">
          
          {/* Subtle Grid Pattern & Particles Accent */}
          <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:18px_18px] opacity-25" />
          <div className="absolute top-1/4 right-8 w-1 h-1 bg-cyan-300 rounded-full shadow-[0_0_8px_#38bdf8] animate-ping" />
          <div className="absolute bottom-1/3 left-10 w-1 h-1 bg-blue-400 rounded-full shadow-[0_0_6px_#60a5fa]" />

          {/* Top Row: Neon TICKET Badge & LIVE SYNC indicator */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-blue-500/20 border border-blue-400/60 text-[11px] font-extrabold text-cyan-300 tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.45)]">
                TICKET
              </span>
              <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
                PREMIUM TIMING
              </span>
            </div>

            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-[10px] font-bold text-emerald-400 font-mono shadow-[0_0_10px_rgba(16,185,129,0.3)]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>LIVE SYNC</span>
            </div>
          </div>

          {/* Center Graphic: Digital Horizon & Precision Millisecond Display */}
          <div className="relative z-10 my-auto text-center py-2">
            <span className="text-[11px] font-mono tracking-widest text-slate-400 block mb-1 uppercase">
              HIGH PRECISION SERVER SYNC
            </span>
            <div className="text-4xl sm:text-5xl font-black tracking-tight text-white tabular-nums drop-shadow-[0_0_30px_rgba(59,130,246,0.6)]">
              19:59:59<span className="text-cyan-400 text-3xl sm:text-4xl">.980</span>
            </div>
          </div>

          {/* Bottom Row: Barcode & SERVERTIME Branding */}
          <div className="relative z-10 flex items-end justify-between border-t border-slate-800/80 pt-3">
            <div>
              <div className="text-sm font-extrabold tracking-wider text-white">SERVERTIME</div>
              <div className="text-[9px] font-medium tracking-widest text-blue-400 font-mono">THE EXACT MOMENT</div>
            </div>

            {/* Digital Barcode */}
            <div className="flex items-end gap-[2px] h-6 opacity-85">
              <span className="w-[1.5px] h-full bg-cyan-400" />
              <span className="w-[3px] h-4 bg-cyan-400" />
              <span className="w-[1px] h-full bg-blue-400" />
              <span className="w-[2px] h-5 bg-cyan-400" />
              <span className="w-[1px] h-full bg-cyan-400" />
              <span className="w-[3px] h-3 bg-blue-400" />
              <span className="w-[1.5px] h-full bg-cyan-400" />
              <span className="w-[2px] h-5 bg-cyan-400" />
              <span className="w-[1px] h-full bg-blue-400" />
            </div>
          </div>

        </div>
      </div>

      {/* 4. Bottom Reflection Subtle Shadow */}
      <div className="absolute -bottom-4 w-[75%] h-5 bg-gradient-to-t from-transparent to-blue-500/20 blur-lg rounded-full" />
    </div>
  );
}
