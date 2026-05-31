import { History, Medal, Trophy } from "lucide-react";
import { TradeEvent } from "../types";

interface HistoryLogsProps {
  battleHistory: TradeEvent[];
  teamAsiaTotal: number;
  teamWestTotal: number;
}

export default function HistoryLogs({ battleHistory, teamAsiaTotal, teamWestTotal }: HistoryLogsProps) {
  // Mock rounds history
  const roundSummaries = [
    { round: 11, winner: "Kimi (Team Asia)", change: "+$22.50", desc: "Asia dominance driven by a sudden massive options cascade on Dogecoin leverage.", keyAsset: "$DOGE" },
    { round: 10, winner: "GPT-5.4 (Team West)", change: "+$18.40", desc: "Arbitrage Systematic execution buy triggers on options index hedges stabilized West balances.", keyAsset: "$ETH" },
    { round: 9, winner: "DeepSeek (Team Asia)", change: "+$34.12", desc: "Long leverage on Bitcoin front-run Asian social breakouts causing huge squeeze.", keyAsset: "$BTC" },
    { round: 8, winner: "Grok (Team West)", change: "+$11.10", desc: "Shitposting sentiment spike short positions executed flawlessly before momentum expired.", keyAsset: "$PEPE" },
  ];

  return (
    <div id="history-logs-tab" className="space-y-6 transition-all duration-300">
      
      {/* Header Banner */}
      <div className="w-[100%] bg-surface-container-lowest neo-border neo-shadow p-5 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <History className="text-primary shrink-0" />
          <div>
            <h3 className="font-display font-black text-lg uppercase text-on-surface">
              HISTORICAL BATTLEGROUND ARCHIVES
            </h3>
            <p className="font-sans text-xs text-on-surface-variant leading-tight mt-0.5">
              Secure audited transcripts from prior Global Equity Tug-of-War skirmishes.
            </p>
          </div>
        </div>

        {/* Dynamic global status summaries */}
        <div className="flex gap-4 font-mono text-xs font-bold text-center">
          <div className="px-3 py-1.5 bg-team-asia/10 text-team-asia neo-border-sm">
            ASIA WINS: 2
          </div>
          <div className="px-3 py-1.5 bg-team-west/10 text-team-west neo-border-sm">
            WEST WINS: 2
          </div>
        </div>
      </div>

      {/* Grid: battle round ledger alongside trade histories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Side: Historical round summaries */}
        <div className="space-y-4">
          <h4 className="font-display font-black text-sm uppercase flex items-center gap-2 mb-2 text-on-surface">
            <Trophy size={16} className="text-secondary" />
            BATTLE ROUND HISTORIES
          </h4>

          <div className="space-y-4">
            {roundSummaries.map((r, i) => (
              <div 
                key={i} 
                className="bg-surface-container-lowest neo-border neo-shadow p-4 relative overflow-hidden group hover:scale-[1.01] transition-transform"
              >
                {/* Visual marker ribbon */}
                <div className="absolute top-0 right-0 p-3 bg-tertiary-fixed text-on-tertiary-fixed font-mono font-black text-[10px] neo-border-sm border-t-0 border-r-0 shadow-[1px_1px_rgba(0,0,0,1)]">
                  ROUND {r.round}
                </div>

                <div className="flex items-start gap-3 mt-1.5">
                  <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary shrink-0 neo-border-sm">
                    <Medal size={16} />
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-mono font-bold text-on-surface-variant">
                      MATCH WINNER: <span className="text-on-surface font-black">{r.winner}</span>
                    </div>
                    <div className="text-xs font-bold text-[#008a00]">
                      GAIN: {r.change} ({r.keyAsset})
                    </div>
                    <p className="font-sans text-xs text-on-surface-variant leading-relaxed pt-1 select-none">
                      {r.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Historical trades ledger */}
        <div className="space-y-4">
          <h4 className="font-display font-black text-sm uppercase flex items-center gap-2 mb-2 text-on-surface">
            <History size={16} className="text-primary" />
            AUDITED AUDIT TRAIL LOG
          </h4>

          <div className="bg-surface-container-lowest neo-border neo-shadow p-4 space-y-3 font-mono text-xs max-h-[460px] overflow-y-auto">
            {battleHistory.length === 0 ? (
              <p className="text-center text-on-surface-variant/50 py-12">&gt; NO RECENT TRANSACTIONS FILED...</p>
            ) : (
              battleHistory.map((h, idx) => {
                const isAsia = h.team === "ASIA";
                return (
                  <div key={idx} className="pb-3 border-b border-on-surface/10 last:border-b-0 space-y-1">
                    <div className="flex justify-between items-center text-[10px] text-on-surface-variant">
                      <span className={`font-black uppercase tracking-wide ${
                        isAsia ? "text-team-asia" : "text-team-west"
                      }`}>
                        {h.traderName} ({h.team})
                      </span>
                      <span>{h.timestamp}</span>
                    </div>
                    <p className="font-semibold text-on-surface">{h.actionText}</p>
                    {h.pnl !== undefined && (
                      <span className={`font-bold text-[9px] px-1 py-0.5 neo-border-sm inline-block ${
                        h.pnl > 0 ? "bg-[#008a00]/10 text-[#006400]" : "bg-error/10 text-error"
                      }`}>
                        PNL: {h.pnl > 0 ? "+" : ""}${h.pnl.toLocaleString()}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
