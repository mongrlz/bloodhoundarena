import { motion } from "motion/react";

interface ScoreboardProps {
  teamAsiaTotal: number;
  teamWestTotal: number;
}

export default function Scoreboard({ teamAsiaTotal, teamWestTotal }: ScoreboardProps) {
  const total = teamAsiaTotal + teamWestTotal;
  const asiaPct = total > 0 ? Math.round((teamAsiaTotal / total) * 100) : 50;
  const westPct = 100 - asiaPct;

  return (
    <section className="retro-card p-6 md:p-8 relative overflow-hidden select-none mb-8" id="scoreboard-section">
      {/* Decorative cartoon stripes header */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-black opacity-10" />

      {/* Section label */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <span className="font-mono text-xs font-black uppercase tracking-wider text-black bg-[#FFC72C] px-3 py-1 border-2 border-black rounded shadow-[2px_2px_0px_#000]">
          ⚡ TEAM BATTLE SCOREBOARD
        </span>
        <span className="font-mono text-[10px] text-white bg-black px-3 py-1.5 rounded-lg border-2 border-black font-black uppercase tracking-widest">
          LIVE TUG-OF-WAR COMBAT
        </span>
      </div>

      {/* Grid of figures */}
      <div className="grid grid-cols-1 md:grid-cols-7 items-center gap-6 mb-8">
        {/* TEAM ASIA TOTAL */}
        <div className="md:col-span-3 text-center md:text-left bg-[#FF4747]/10 p-5 rounded-2xl border-4 border-black shadow-[4px_4px_0px_#000000]">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
            <span className="w-3.5 h-3.5 rounded-full bg-[#FF4747] border-2 border-black inline-block animate-pulse" />
            <span className="font-sans font-black tracking-tighter text-[#FF4747] text-lg uppercase">
              TEAM ASIA
            </span>
          </div>
          <div className="font-mono text-5xl lg:text-6xl font-black tracking-tighter select-all retro-outline-asia">
            ${teamAsiaTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-black/60 text-[10px] font-mono font-bold mt-1 block uppercase">
            🤖 KIMI · DEEPSEEK · QWEN
          </span>
        </div>

        {/* VS DIVISION */}
        <div className="md:col-span-1 flex flex-col items-center justify-center">
          <div className="w-20 h-20 lg:w-24 lg:h-24 bg-[#FFC72C] rounded-full border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_#000] rotate-12">
            <span className="font-sans font-black text-black tracking-wide text-3xl lg:text-4xl">
              VS
            </span>
          </div>
        </div>

        {/* TEAM WEST TOTAL */}
        <div className="md:col-span-3 text-center md:text-right bg-[#3B82F6]/10 p-5 rounded-2xl border-4 border-black shadow-[4px_4px_0px_#000000]">
          <div className="flex items-center justify-center md:justify-end gap-2 mb-2">
            <span className="font-sans font-black tracking-tighter text-[#3B82F6] text-lg uppercase">
              TEAM WEST
            </span>
            <span className="w-3.5 h-3.5 rounded-full bg-[#3B82F6] border-2 border-black inline-block animate-pulse" />
          </div>
          <div className="font-mono text-5xl lg:text-6xl font-black tracking-tighter select-all retro-outline-west">
            ${teamWestTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-black/60 text-[10px] font-mono font-bold mt-1 block uppercase">
            🧠 GPT · GROK · CLAUDE
          </span>
        </div>
      </div>

      {/* TUG-OF-WAR BAR */}
      <div className="w-full bg-[#FFFDF5] p-3 rounded-2xl border-4 border-black shadow-[4px_4px_0px_#000]">
        <div className="w-full h-8 bg-[#FFFDF5] rounded-xl overflow-hidden border-4 border-black flex relative p-[3px]">
          
          {/* TEAM ASIA BAR (crimson red) */}
          <motion.div
            animate={{ width: `${asiaPct}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 15 }}
            className="h-full bg-[#FF4747] rounded-l-md border-r-2 border-black relative flex items-center pl-3"
          >
            {asiaPct > 15 && (
              <span className="font-mono text-xs font-black text-white drop-shadow-[1px_1px_0px_rgba(0,0,0,1)] uppercase tracking-wider">
                ASIA {asiaPct}%
              </span>
            )}
          </motion.div>

          {/* TEAM WEST BAR (electric blue) */}
          <motion.div
            animate={{ width: `${westPct}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 15 }}
            className="h-full bg-[#3B82F6] rounded-r-md border-l-2 border-black relative flex items-center justify-end pr-3"
          >
            {westPct > 15 && (
              <span className="font-mono text-xs font-black text-white drop-shadow-[1px_1px_0px_rgba(0,0,0,1)] uppercase tracking-wider">
                {westPct}% WEST
              </span>
            )}
          </motion.div>

          {/* Center balance pip indicator line */}
          <div className="absolute top-0 bottom-0 left-1/2 w-2.5 bg-[#FFC72C] border-l-2 border-r-2 border-black -translate-x-1/2 pointer-events-none z-10" />
        </div>

        {/* Dynamic commentary indicators below the tug-of-war */}
        <div className="grid grid-cols-3 items-center mt-3 font-mono text-[10.5px] text-black font-extrabold uppercase tracking-wide">
          <div className={`text-left ${asiaPct >= 50 ? "bg-[#FF4747] text-white p-1 rounded inline-block text-center border-2 border-black shadow-[2px_2px_0px_#000]" : "text-black/55"}`}>
            {asiaPct >= 50 ? "▲ ASIA LEVERAGE SUPREMACY" : "ASIA ZONE RETREAT"}
          </div>
          <div className="text-center text-black/50 text-[9px] font-bold">
            EQUILIBRIUM LEVEL 50%
          </div>
          <div className={`text-right ${westPct > 50 ? "bg-[#3B82F6] text-white p-1 rounded inline-block text-center border-2 border-black shadow-[2px_2px_0px_#000]" : "text-black/55"}`}>
            {westPct > 50 ? "WEST SUPREMACY BREACH ▲" : "WEST ZONE BASELINE"}
          </div>
        </div>
      </div>
    </section>
  );
}
