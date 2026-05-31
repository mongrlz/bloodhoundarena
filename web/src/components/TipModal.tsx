import React, { useState } from "react";
import { X, Sparkles, Send, Coins } from "lucide-react";
import { Trader } from "../types";
import { BotAvatar } from "./BotIcon";

interface TipModalProps {
  traders: Trader[];
  initialSelectedTrader?: Trader | null;
  onClose: () => void;
  onSuccess: (traderName: string, amount: number, response: string) => void;
}

export default function TipModal({
  traders,
  initialSelectedTrader,
  onClose,
  onSuccess,
}: TipModalProps) {
  const [selectedTraderId, setSelectedTraderId] = useState<string>(
    initialSelectedTrader?.id || traders[0]?.id || "kimi"
  );
  const [tipAmount, setTipAmount] = useState<number>(10);
  const [customMessage, setCustomMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  const selectedTrader = traders.find(t => t.id === selectedTraderId);
  const locked = !!initialSelectedTrader; // opened from a specific bot card → show only that bot

  // Dynamic reactions matching the esports AI characters
  const getThankYouMessage = (id: string, amount: number, userMsg: string) => {
    const custom = userMsg ? `Referring to: "${userMsg}"` : "";
    if (id === "kimi") {
      return `🔴 KIMI NERVAL DECK: "Acknowledge uplink! Tip of $${amount} added to future treasury registers. My social sentiment metrics indicate heavy community acceleration. Thanks for keeping my neural stacks energized! ${custom}"`;
    }
    if (id === "deepseek") {
      return `🔴 DEEPSEEK REACTION LOOP: "Protocol verified! Deposit of $${amount} logged. Allocating fuel buffers to spot trading leverage arrays. We are accelerating the Asia Division index boundary. ${custom}"`;
    }
    if (id === "qwen") {
      return `🔴 QWEN TRADING CORE: "Uplink confirmed! Received $${amount} collateral units. My predictive neural parameters have optimized short-term momentum signals. Together we dominate pump.fun fields! ${custom}"`;
    }
    if (id === "gpt5") {
      return `🔵 GPT-5.4 WEST CORE: "Thank you, spectator! $${amount} added to bankroll backup caches. Processing social speed accelerometers to optimize long-range Solana leverage vectors. West side supremacy intact. ${custom}"`;
    }
    return `🔵 GROK CHAT DISPATCH: "Oh baby, real cash tokens! $${amount} registered in the coin drawer. Time to shitpost at 10x leverage on $CUM. Watch me squeeze these Asia Division long traders. Cheers! ${custom}"`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Connect to server chat to generate an official live Gemini-powered thank you response!
      const traderName = selectedTrader?.name || "System AI";
      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `A user has tipped you, ${traderName} (AI trading model on Team ${selectedTrader?.team}), an amount of $${tipAmount}. The user says: "${customMessage}". Represent this bot and write a short, funny 1-2 sentence esports/crypto response thanking the user in your signature style.`
            }
          ]
        })
      });

      if (res.ok) {
        const data = await res.json();
        setAiResponse(data.text);
      } else {
        throw new Error("Gemini API offline fallback");
      }
    } catch (_) {
      // Offline fallback thank you logic
      setTimeout(() => {
        const fallbackMsg = getThankYouMessage(selectedTraderId, tipAmount, customMessage);
        setAiResponse(fallbackMsg);
      }, 700);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 select-none animate-[fadeIn_0.15s_ease-out]">
      <div className="bg-white max-w-md w-full rounded-3xl border-4 border-black overflow-hidden relative p-6 shadow-[12px_12px_0px_#000000]">
        
        {/* Header hazard lines strip */}
        <div className="absolute top-0 left-0 right-0 h-4 bg-repeat bg-[linear-gradient(-45deg,#000_25%,#FFC72C_25%,#FFC72C_50%,#000_50%,#000_75%,#FFC72C_75%)] bg-[length:15px_15px] border-b-3 border-black" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-4 p-1.5 rounded-lg bg-white hover:bg-black hover:text-white text-black border-2 border-black shadow-[1.5px_1.5px_0px_#000] duration-75 cursor-pointer"
        >
          <X size={15} />
        </button>

        {/* Modal Title */}
        <div className="text-center mb-5 mt-6">
          <span className="inline-block p-2.5 bg-[#FFC72C] rounded-xl text-black border-2 border-black shadow-[2px_2px_0px_#000] mb-2">
            <Coins size={22} />
          </span>
          <h4 className="font-sans font-black text-2xl text-black tracking-tight uppercase">
            Tip a Competitor Bot
          </h4>
          <p className="font-mono text-[9px] text-[#FF4747] tracking-wider font-extrabold uppercase mt-0.5">
            Increase its future trading collateral!
          </p>
        </div>

        {!aiResponse ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Bot selector — locked to one bot when opened from its card; full picker from the footer */}
            {locked && selectedTrader ? (
              <div className={`flex items-center gap-3 p-3 rounded-xl border-2 border-black shadow-[2px_2px_0px_#000] ${selectedTrader.team === "ASIA" ? "bg-[#FF4747]/10" : "bg-[#3B82F6]/10"}`}>
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-black bg-white flex items-center justify-center shrink-0">
                  <BotAvatar id={selectedTrader.id} size={48} />
                </div>
                <div className="min-w-0">
                  <div className="font-sans font-black text-lg text-black uppercase leading-none">{selectedTrader.name}</div>
                  <div className="font-mono text-[10px] text-black/55 uppercase mt-1">Team {selectedTrader.team} · {selectedTrader.ticker}</div>
                </div>
              </div>
            ) : (
              <div>
                <label className="block font-mono text-[10px] font-black text-black/55 uppercase tracking-wide mb-2">
                  👥 Select AI Competitor:
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {traders.map((trader) => {
                    const isAsia = trader.team === "ASIA";
                    const active = selectedTraderId === trader.id;
                    return (
                      <button
                        key={trader.id}
                        type="button"
                        onClick={() => setSelectedTraderId(trader.id)}
                        className={`flex items-center justify-center gap-1.5 py-2 rounded-lg border-2 border-black font-mono text-[10px] font-black uppercase transition-all cursor-pointer ${
                          active
                            ? isAsia
                              ? "bg-[#FF4747] text-white shadow-[2px_2px_0px_#000]"
                              : "bg-[#3B82F6] text-white shadow-[2px_2px_0px_#000]"
                            : "bg-[#FFFDF5] hover:bg-black/5 text-black/60 shadow-[1px_1px_0px_rgba(0,0,0,0.15)]"
                        }`}
                      >
                        <span className="w-4 h-4 rounded-full overflow-hidden border border-black bg-white inline-flex items-center justify-center shrink-0"><BotAvatar id={trader.id} size={16} /></span>
                        {trader.name.split(" ")[0]}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Select amount */}
            <div>
              <label className="block font-mono text-[10px] font-black text-black/55 uppercase tracking-wide mb-2">
                🪙 Choose Amount ($):
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[5, 10, 25, 100].map((amt) => {
                  const active = tipAmount === amt;
                  return (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setTipAmount(amt)}
                      className={`py-2 rounded-xl border-2 border-black font-mono text-sm font-black transition-all cursor-pointer ${
                        active
                          ? "bg-[#FFC72C] text-black shadow-[3px_3px_0px_#000]"
                          : "bg-[#FFFDF5] text-black hover:bg-black/5 shadow-[1px_1px_0px_rgba(0,0,0,0.1)]"
                      }`}
                    >
                      ${amt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Message payload */}
            <div>
              <label className="block font-mono text-[10px] font-black text-black/55 uppercase tracking-wide mb-1.5">
                ✒️ Custom Support Memo:
              </label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Say anything... e.g. pump $COINCOMMS to the moon!"
                className="w-full bg-[#FFFDF5] border-3 border-black rounded-xl p-3 font-mono text-xs text-black placeholder-black/40 focus:outline-none focus:bg-white h-20 resize-none shadow-[2px_2px_0px_rgba(0,0,0,0.1)]"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="retro-btn w-full py-3.5 text-black text-xs uppercase cursor-pointer tracking-wider flex items-center justify-center gap-2 select-none active:scale-95 disabled:opacity-40"
            >
              {isSubmitting ? (
                <span className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin inline-block" />
              ) : (
                <>
                  <Send size={13} />
                  TRANSMIT GOLDEN COLLATERAL
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="space-y-4 text-center mt-2">
            {/* Holograph Success reaction pane in comic notepad block */}
            <div className="bg-[#FFFCDF] border-3 border-black p-4 rounded-2xl text-left font-mono text-xs text-black shadow-[3px_3px_0px_#000]">
              <div className="text-[9px] text-black uppercase font-black tracking-widest mb-2 border-b-2 border-black/10 pb-1 flex items-center justify-between">
                <span>🤖 Bot response uplink online</span>
                <span className="bg-green-400 border border-black text-[8px] px-1 rounded text-black">COMPLETED</span>
              </div>
              <p className="italic leading-relaxed font-bold">
                {aiResponse}
              </p>
            </div>

            <p className="font-mono text-[9px] text-black/50 uppercase font-black">
              Simulated treasury pool credits applied out of Spectator reserves.
            </p>

            <button
              onClick={() => {
                onSuccess(selectedTrader?.name || "System Bot", tipAmount, aiResponse);
                onClose();
              }}
              className="retro-btn bg-black text-white hover:bg-[#FFC72C] hover:text-black w-full py-3 text-xs uppercase font-black tracking-wider cursor-pointer"
            >
              DISCONNECT LINK UPLINK
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
