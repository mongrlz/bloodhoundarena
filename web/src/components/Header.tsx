import { Swords, Play, Pause, RefreshCw } from "lucide-react";

interface HeaderProps {
  currentRound: number;
  isBattleLoading: boolean;
  onTriggerBattle: () => void;
  autoSimulate: boolean;
  onToggleAutoSimulate: () => void;
  onReset: () => void;
}

export default function Header({
  currentRound,
  isBattleLoading,
  onTriggerBattle,
  autoSimulate,
  onToggleAutoSimulate,
  onReset,
}: HeaderProps) {
  return (
    <header className="retro-card mb-8 overflow-hidden relative" id="main-header">
      {/* Dynamic diagonal stripe hazard warning bar */}
      <div className="h-6 bg-repeat bg-[linear-gradient(-45deg,#000_25%,#FFC72C_25%,#FFC72C_50%,#000_50%,#000_75%,#FFC72C_75%)] bg-[length:20px_20px] border-b-4 border-black" />
      
      <div className="p-6 md:p-8 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 bg-white">
        <div>
          {/* Header Brand */}
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <span className="text-4xl md:text-5xl select-none">🩸</span>
            <div className="flex flex-col">
              <h1 className="font-sans font-extrabold text-3xl md:text-4xl lg:text-5xl tracking-tighter text-black uppercase flex items-center gap-3">
                BLOODHOUND ARENA
              </h1>
              <span className="font-mono text-xs font-black text-black/50 tracking-wider">
                ⚡ AI TRADERS BATTLE THE PUMP.FUN COIN COMMUNITIES SIGNAL
              </span>
            </div>
          </div>

          {/* Tagline sticker labels */}
          <div className="flex flex-wrap items-center gap-2.5 my-4">
            <span className="retro-badge-gold px-3 py-1 text-xs text-black font-black uppercase rounded-lg">
              COIN COMMUNITIES · SIM v1.0
            </span>

            {/* Pulsing LIVE sticker badge */}
            <div className="retro-badge-asia px-3 py-1 text-xs text-white font-black uppercase rounded-lg flex items-center gap-1.5 pulse-live">
              <span className="w-2.5 h-2.5 rounded-full bg-white inline-block"></span>
              <span>LIVE BROADCASTING</span>
            </div>
            
            {/* Round Counter */}
            <div className="bg-[#FFFDF5] border-2 border-black px-3 py-1 rounded-lg font-mono text-xs text-black font-black uppercase shadow-[2px_2px_0px_#000000]">
              ROUND <span className="bg-black text-white px-1.5 py-0.5 rounded text-xs ml-1">{currentRound}</span>
            </div>
          </div>

          <p className="text-black/70 text-sm md:text-base font-medium max-w-2xl leading-relaxed mt-1">
            Six AI models trade the live <span className="font-bold text-black">Pump.fun Coin Communities</span> social signal — <span className="bg-[#FF4747]/20 border-b-2 border-[#FF4747] px-1 font-bold text-[#FF4747]">Team Asia</span> vs <span className="bg-[#3B82F6]/20 border-b-2 border-[#3B82F6] px-1 font-bold text-[#3B82F6]">Team West</span>. Whoever reads the trenches best, wins.
          </p>
        </div>

        {/* Action HUD Panel Buttons block */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-[#FFFDF5] p-4 rounded-2xl border-4 border-black shadow-[4px_4px_0px_#000000]">
          {/* Quick Clear Local Reset */}
          <button
            onClick={onReset}
            className="retro-btn-secondary p-3 text-black font-bold flex items-center justify-center gap-2 cursor-pointer"
            title="Reset simulation parameters"
            id="btn-reset"
          >
            <RefreshCw size={18} />
            <span className="sm:hidden font-mono text-xs">RESET SIM</span>
          </button>

          {/* Autoplay Simulator Loop toggle */}
          <button
            id="btn-auto-simulate"
            onClick={onToggleAutoSimulate}
            className={`px-4 py-3 rounded-xl font-mono text-xs font-black uppercase flex items-center justify-center gap-2 transition-all cursor-pointer ${
              autoSimulate 
                ? "bg-[#FFC72C] text-black border-3 border-black shadow-[3px_3px_0px_#000] translate-x-0.5 translate-y-0.5 shadow-none" 
                : "bg-white text-black border-3 border-black shadow-[3px_3px_0px_-0.5px_#000] hover:translate-x-0.5 hover:translate-y-0.5"
            }`}
          >
            {autoSimulate ? (
              <>
                <Pause size={14} className="animate-spin" />
                AUTO LIVE: ON
              </>
            ) : (
              <>
                <Play size={14} />
                AUTO LIVE: OFF
              </>
            )}
          </button>

          {/* High-stakes battle action button */}
          <button
            id="btn-battle-force"
            disabled={isBattleLoading}
            onClick={onTriggerBattle}
            className={`retro-btn px-6 py-3 text-black text-xs uppercase cursor-pointer flex items-center justify-center gap-2 select-none active:scale-95 transition-all ${
              isBattleLoading ? "opacity-50 cursor-not-allowed transform-none" : ""
            }`}
          >
            {isBattleLoading ? (
              <span className="animate-spin inline-block border-3 border-black border-t-transparent rounded-full h-4 w-4" />
            ) : (
              <Swords size={15} />
            )}
            <span className="font-extrabold tracking-wider">
              {isBattleLoading ? "COMPUTING..." : "BATTLE FORCE"}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
