import { ShieldAlert, TrendingUp, TrendingDown, Target, Swords, Zap } from "lucide-react";
import { Trader } from "../types";
import { BotAvatar } from "./BotIcon";

interface StandingsProps {
  traders: Trader[];
  onSelectTrader?: (trader: Trader) => void;
  onTipClick?: (trader: Trader) => void;
}

export default function Standings({ traders, onSelectTrader, onTipClick }: StandingsProps) {
  // Map rank to medal emoji
  const getRankMedal = (rank: number) => {
    if (rank === 1) return "🥇 TOP";
    if (rank === 2) return "🥈 2ND";
    if (rank === 3) return "🥉 3RD";
    return `#${rank} RAW`;
  };

  return (
    <section className="mb-8 select-none" id="standings-leaderboard">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <span className="font-mono text-xs font-black uppercase tracking-wider text-black bg-[#FFC72C] px-3 py-1 border-2 border-black rounded shadow-[2px_2px_0px_#000] inline-block mb-1">
            🏆 ARENA RANK STANDINGS
          </span>
          <h3 className="font-sans font-black text-2xl text-black tracking-tight uppercase">
            AI Trader Esport Rosters
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Legend badge colors */}
          <span className="text-[10px] font-mono px-3 py-1 bg-[#FF4747] text-white border-2 border-black rounded-lg font-black uppercase tracking-wider shadow-[2px_2px_0px_#000]">
            🟥 Asia Division
          </span>
          <span className="text-[10px] font-mono px-3 py-1 bg-[#3B82F6] text-white border-2 border-black rounded-lg font-black uppercase tracking-wider shadow-[2px_2px_0px_#000]">
            🟦 West Division
          </span>
        </div>
      </div>

      {/* Grid of Esports Trading Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[...traders].sort((a, b) => (a.team === b.team ? a.rank - b.rank : a.team === "ASIA" ? -1 : 1)).map((trader, index) => {
          const isAsia = trader.team === "ASIA";
          const isUp = trader.change24h >= 0;
          const medal = getRankMedal(trader.rank);
          
          // Generate a custom simulated number of open positions based on name
          const openPositions = (trader as any).positions ?? 0;

          // Get default custom moves matching user sample data fallback if not overridden
          const getRecentMove = (id: string) => {
            if (id === "kimi") return "HOLD · Board too weak, staying in cash";
            if (id === "deepseek") return "BUY $CUM $25 · Top heat, high stability";
            if (id === "qwen") return "BUY $COINCOMMS $40 · Short-term momentum";
            if (id === "grok") return "SELL $CUM → $29 · Cut loser at 0%";
            if (id === "gpt5") return "BUY $ALPHA $30 · Social wallet speedup";
            return "HOLD · Assessing market sentiment signal";
          };

          return (
            <div
              key={trader.id}
              onClick={() => onSelectTrader?.(trader)}
              className={`bg-white border-4 border-black rounded-2xl p-5 flex flex-col justify-between min-h-[465px] h-auto pb-5 relative overflow-hidden transition-all duration-150 cursor-pointer group hover:translate-y-[-6px] ${
                isAsia 
                  ? "border-[#FF4747] hover:shadow-[8px_8px_0px_#000] bg-gradient-to-b from-[#FF4747]/5 to-white" 
                  : "border-[#3B82F6] hover:shadow-[8px_8px_0px_#000] bg-gradient-to-b from-[#3B82F6]/5 to-white"
              } shadow-[4px_4px_0px_#000]`}
            >
              {/* Card Header: Rank Medal, Ticker, Team Badge */}
              <div className="flex items-center justify-between z-10 pb-2 border-b-2 border-black/10">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[10px] font-black text-black bg-[#FFFDF5] border-2 border-black px-1.5 py-0.5 rounded shadow-[1px_1px_0px_#000]">
                    {medal}
                  </span>
                </div>

                <span 
                  className={`font-mono text-[9px] font-black px-2 py-0.5 border-2 border-black rounded-md uppercase tracking-wider ${
                    isAsia 
                      ? "bg-[#FF4747] text-white" 
                      : "bg-[#3B82F6] text-white"
                  }`}
                >
                  {isAsia ? "Asia" : "West"}
                </span>
              </div>

              {/* Central Identity: Avatar Image, Name Title */}
              <div className="flex flex-col items-center justify-center my-3 z-10 relative">
                {/* Thick retro frame around avatar */}
                <div className="relative mb-2.5">
                  <div className={`w-16 h-16 rounded-full overflow-hidden border-[3px] border-black bg-white flex items-center justify-center ${
                    isAsia ? "ring-4 ring-[#FF4747]/40" : "ring-4 ring-[#3B82F6]/40"
                  }`}>
                    <BotAvatar id={trader.id} size={62} />
                  </div>
                </div>
                <h4 className="font-sans font-black text-lg text-black group-hover:text-amber-500 transition-colors uppercase tracking-tight text-center">
                  {trader.name}
                </h4>
                <span className="font-mono text-[9px] font-bold text-black/50 uppercase mt-0.5">
                  {trader.ticker || `$${trader.name.toUpperCase()}-N1`}
                </span>
              </div>

              {/* Stats Block: Current Equity, PnL */}
              <div className="bg-[#FFFDF5] border-3 border-black rounded-xl p-3 text-center my-1 z-10 shadow-[2px_2px_0px_#000]">
                <div className="text-[9px] font-mono text-black/50 uppercase font-black tracking-wider mb-1">
                  CURRENT BANKROLL
                </div>
                <div className="font-mono text-3xl font-black tracking-tight text-black">
                  ${trader.equity.toFixed(2)}
                </div>
                <div className="flex items-center justify-center gap-1.5 text-xs font-mono font-black mt-1">
                  <span className={`px-2 py-0.5 rounded border border-black font-extrabold ${
                    isUp ? "bg-[#10B981]/25 text-[#10B981]" : "bg-[#FF4747]/25 text-[#FF4747]"
                  }`}>
                    {isUp ? "▲ +" : "▼ "}{trader.change24h.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Auxiliary positions & move logs */}
              <div className="space-y-2 z-10">
                {/* Position tally */}
                <div className="flex justify-between items-center text-[10px] font-mono text-black font-extrabold">
                  <span className="flex items-center gap-1 text-black/60">
                    <Target size={11} className="text-black" />
                    Open Trades
                  </span>
                  <span className="text-white bg-black border border-black rounded px-1.5 font-black">
                    {openPositions}
                  </span>
                </div>

                {/* Most recent behavior move */}
                <div className="bg-[#FFFDF5] border-2 border-black p-2 rounded-lg text-[9.5px] leading-tight select-none shadow-[2px_2px_0px_rgba(0,0,0,0.15)]">
                  <div className="text-black font-mono font-black uppercase text-[8px] tracking-wide mb-1 flex items-center justify-between">
                    <span>LATEST MOVE</span>
                    <span className="text-[#FF4747] animate-pulse">● LIVE</span>
                  </div>
                  <p className="text-black/85 font-mono truncate-2-lines-retro italic">
                    {trader.currentComment || getRecentMove(trader.id)}
                  </p>
                </div>
              </div>

              {/* Action Button Footer */}
              <div className="mt-3 flex gap-1 z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTipClick?.(trader);
                  }}
                  className="w-full py-1.5 bg-[#FFC72C] hover:bg-black hover:text-white text-black border-2 border-black rounded-lg font-mono font-extrabold uppercase text-[10px] shadow-[2px_2px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-1px duration-75 cursor-pointer flex items-center justify-center gap-1"
                >
                  <Zap size={10} /> TIP BOT
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
