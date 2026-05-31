import { TradeEvent } from "../types";
import { BotAvatar } from "./BotIcon";

// Extend trade event locally for reasoning lines support
interface ExtendedTradeEvent extends TradeEvent {
  reasoning?: string;
}

interface LiveFeedProps {
  events: ExtendedTradeEvent[];
}

export default function LiveFeed({ events }: LiveFeedProps) {
  // Dynamic sample reasoning fallbacks for robust display
  const getSimulatedReasoning = (traderName: string, actionText: string) => {
    const cleanAction = actionText.toUpperCase();
    if (cleanAction.includes("CUM")) {
      if (cleanAction.includes("BUY")) {
        return "highest community heat + unique wallets";
      }
      return "cut loser at 0%";
    }
    if (cleanAction.includes("COINCOMMS")) {
      return "strongest short-term price momentum";
    }
    if (cleanAction.includes("HOLD")) {
      return "board too weak, staying in cash";
    }
    if (cleanAction.includes("KERMIT")) {
      return "taking profit, bonding curve at 98%";
    }
    if (cleanAction.includes("SOL") || cleanAction.includes("BTC")) {
      return "liquidity pool density shifting, capturing micro leverage grids";
    }

    // Default fallbacks based on name
    if (traderName === "Kimi") return "board too weak, staying in cash";
    if (traderName === "DeepSeek") return "top heat, 7.9% 5m, high cap stability";
    if (traderName === "Qwen") return "strongest short-term price momentum";
    if (traderName === "Grok") return "shitposting sentiment spike detected";
    return "proprietary social intelligence momentum signal matched";
  };

  return (
    <section className="retro-card p-6 md:p-8 relative overflow-hidden select-none mb-8" id="live-feed-activity">
      {/* Visual top accent indicator */}
      <div className="absolute top-0 right-14 w-24 h-4 bg-[#FFC72C] border-b-2 border-l-2 border-black" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b-4 border-black">
        <div>
          <span className="font-mono text-xs font-black uppercase tracking-wider text-black bg-[#FFC72C] px-3 py-1 border-2 border-black rounded shadow-[2px_2px_0px_#000] inline-block mb-1">
            💬 STOCKED SIGNAL LOGS
          </span>
          <h3 className="font-sans font-black text-2xl text-black tracking-tight flex items-center gap-2 uppercase">
            Live Feed Activity Ticker
            <span className="w-3 h-3 rounded-full bg-[#FF4747] border border-black pulse-live" />
          </h3>
        </div>
        <span className="font-mono text-[10px] text-white bg-black px-3 py-1 rounded-lg font-black uppercase tracking-widest text-center">
          Active Stream Feed
        </span>
      </div>

      {/* Trade Feed streaming items list */}
      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
        {events && events.length > 0 ? (
          events.map((event) => {
            const isAsia = event.team === "ASIA";
            const reasoning = event.reasoning || getSimulatedReasoning(event.traderName, event.actionText);
            
            return (
              <div
                key={event.id}
                className={`flex items-start gap-4 p-4 rounded-xl bg-white border-3 border-black shadow-[3px_3px_0px_#000] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_#000] duration-100 ${
                  isAsia ? "border-l-8 border-l-[#FF4747]" : "border-l-8 border-l-[#3B82F6]"
                }`}
              >
                {/* Micro AI Avatar */}
                <div className={`relative shrink-0 mt-0.5 w-11 h-11 rounded-full overflow-hidden bg-white flex items-center justify-center ring-[3px] ${
                  isAsia ? "ring-[#FF4747]" : "ring-[#3B82F6]"
                }`}>
                  <BotAvatar name={event.traderName} size={44} />
                </div>

                {/* Content body */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-sans font-black text-sm tracking-tight text-black uppercase">
                        {event.traderName}
                      </span>
                      <span className={`font-mono text-[9px] font-black px-2 py-0.5 border border-black rounded uppercase tracking-wider ${
                        isAsia ? "bg-[#FF4747] text-white" : "bg-[#3B82F6] text-white"
                      }`}>
                        {event.team}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-black/50 font-black">
                      ⏱️ {event.timestamp}
                    </span>
                  </div>

                  {/* Actions summary bold sentence */}
                  <div className="mb-1">
                    <span className="font-mono text-sm text-black font-extrabold uppercase bg-[#FFFDF5] border border-black px-2 py-0.5 rounded shadow-[1.5px_1.5px_0px_#000] inline-block">
                      🏷️ {event.actionText}
                    </span>
                  </div>

                  {/* Reasoning phrase */}
                  <p className="font-mono text-xs italic text-black/60 leading-relaxed font-bold max-w-2xl select-all">
                    &ldquo;{reasoning}&rdquo;
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-16 bg-[#FFFDF5] border-4 border-dashed border-black rounded-2xl">
            <span className="text-4xl block mb-3 select-none">⏳</span>
            <div className="font-mono text-sm text-black font-black uppercase tracking-widest">
              Awaiting pump.fun micro signals...
            </div>
            <p className="font-mono text-[11px] text-black/50 mt-1.5 font-bold uppercase select-none">
              Trigger "BATTLE FORCE" above to generate immediate live trading bursts!
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
