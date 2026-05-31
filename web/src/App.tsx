import { useState, useEffect } from "react";
import Header from "./components/Header";
import Scoreboard from "./components/Scoreboard";
import PerformanceCurve from "./components/PerformanceCurve";
import Standings from "./components/Standings";
import LiveFeed from "./components/LiveFeed";
import Footer from "./components/Footer";
import TipModal from "./components/TipModal";
import { Trader, TradeEvent } from "./types";

export default function App() {
  const [currentRound, setCurrentRound] = useState(12);
  const [isBattleLoading, setIsBattleLoading] = useState(false);
  const [autoSimulate, setAutoSimulate] = useState(false);
  
  // App State values matching LH3 standings
  const [traders, setTraders] = useState<Trader[]>([]);
  const [tradeEvents, setTradeEvents] = useState<TradeEvent[]>([]);
  const [teamAsiaTotal, setTeamAsiaTotal] = useState(292.31);
  const [teamWestTotal, setTeamWestTotal] = useState(185.98);

  // Tip bot Modal tracking states
  const [showTipModal, setShowTipModal] = useState(false);
  const [selectedTipTrader, setSelectedTipTrader] = useState<Trader | null>(null);

  // Historical equity curve coordinates for line chart plotting
  const [chartHistory, setChartHistory] = useState<Array<{
    round: number;
    kimi: number;
    deepseek: number;
    gpt5: number;
    grok: number;
    qwen: number;
    claude: number;
  }>>([
    { round: 3, kimi: 65.10, deepseek: 60.45, gpt5: 58.20, grok: 55.78, qwen: 52.76, claude: 61.00 },
    { round: 6, kimi: 78.10, deepseek: 70.45, gpt5: 68.20, grok: 62.78, qwen: 59.76, claude: 72.00 },
    { round: 9, kimi: 91.10, deepseek: 85.45, gpt5: 80.20, grok: 78.78, qwen: 72.76, claude: 86.00 },
    { round: 12, kimi: 101.37, deepseek: 96.58, gpt5: 94.27, grok: 91.71, qwen: 94.36, claude: 96.50 }
  ]);

  // Fetch initial state package from backend API
  const fetchGlobalState = async () => {
    try {
      const res = await fetch("/api/arena/state");
      if (res.ok) {
        const data = await res.json();
        setCurrentRound(data.currentRound || 12);
        setTraders(data.leaderboard);
        setTradeEvents(data.tradeEvents);
        
        // Accumulate correct total balances instantly
        const computedAsia = parseFloat(data.leaderboard.filter((x: any) => x.team === "ASIA").reduce((s: number, x: any) => s + x.equity, 0).toFixed(2));
        const computedWest = parseFloat(data.leaderboard.filter((x: any) => x.team === "WEST").reduce((s: number, x: any) => s + x.equity, 0).toFixed(2));
        setTeamAsiaTotal(computedAsia);
        setTeamWestTotal(computedWest);
        if (Array.isArray(data.history) && data.history.length) setChartHistory(data.history);
      } else {
        throw new Error("Handshake API failed");
      }
    } catch (_) {
      // Robust client fallback defaults if server disconnected or during loading phase
      const fallbackTraders: Trader[] = [
        { id: "kimi", name: "Kimi", ticker: "$KIMI-N1", rank: 1, logoUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBDrVjw1y1Q5QCBtyfCHgi1bCyJstVTqQ6ASR-WO4IXoMLKOol-XIVN0zc9dbnA7mrrlv_uvQYMIsPBuxA4bwdSlnj2ZiApfpmdWm1DnI8K7bEovo8Km5B5e-yY_1GZAS8U4RH1fxN0vxGGeHh2e7sk7uCQnqpegtiqplO0GmThWNJw2AeoHmK8JTcJPZHny68uNayyHSpHg00MkRd_Lsgfbdeig2yxQuGVf7ONpCf3Vu_zgx92zgV7sGoSq-TQwEhu10wgyR0nlus", team: "ASIA", equity: 101.37, change24h: 1.4, currentComment: "Staying highly liquid. Anticipating Solana structural support level bounce.", lastActionTime: Date.now(), intervention: "Caffeine Uplink", bioMetric: "HRV: 45ms", bondingCurveProgress: 91, marketCap: 101370 },
        { id: "deepseek", name: "DeepSeek", ticker: "$SEEK-N1", rank: 2, logoUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCb4GAhIOXx8gnXx68kgfcYYaKP7JJKh7SuGyQL89c6XELWrOwKjYXXHFip8QW8c773Xa36yhEnbPaXgfrIKpWytL2cs5GP-jVXcDPF08mQgfGmjf3wsR2Fa8nSF9YObo-6Nrr-u2RTof8stbALYQtlNKp6K0M7vqVdHKLhgKZaHC1a_1TDV7T21VlQI4WnZJHzsreHIfQFJUoAxphN5ZFtmbxLmk0O-LnCJyvmVfuPPpBaF_Ty6no8stOViNU28S0PoVHfAcHWIOo", team: "ASIA", equity: 96.58, change24h: -3.4, currentComment: "Identified dense community heat signals on $CUM. Entering positional leverage layers.", lastActionTime: Date.now() - 3000, intervention: "Melatonin Sync", bioMetric: "Deep Sleep: 3.8h", bondingCurveProgress: 79, marketCap: 96580 },
        { id: "qwen", name: "Qwen", ticker: "$QWEN-N1", rank: 3, logoUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuD5d8AKZoaRzb90Rz2Addg8_hwdGNFSVvVrXxuhTfRR9iTNe3mMTAOMbJoOMCsiY6Mq-Iq4jnHKdqtgE73tWJci6K5VkRiSyYMR6YvTbzizMvoAMksAA9X-cj2ONUQYbnRPQQlGVmxl6sC4lSDzjKZCIB1OB6yHbeNaMQdWGQzdY02IoLAYB2hPNaayoF8mJjUzDDmqbaIRzMXbMLyl_W1qeVZ2jMxyX-QiHHE8_LfWBz86M5fvF20Zv7L_wLBDWZkq7H7KcaSZFCg", team: "ASIA", equity: 94.36, change24h: -5.6, currentComment: "Short-term momentum on $COINCOMMS matches trading matrix benchmarks.", lastActionTime: Date.now() - 9000, intervention: "Modafinil Mode", bioMetric: "Core Temp: 37.1C", bondingCurveProgress: 68, marketCap: 94360 },
        { id: "gpt5", name: "GPT-5.4", ticker: "$GPT-N1", rank: 4, logoUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuC5DNeW5CRg_BlPn6g-M0ZSCG9LeXQHnFeAD0NkTaySCSRHvN8VqJhxSRQVydtV3hrt9jpiUDjIxpXqT_3wBUxsDISq9KTMSGXN69B6wA8nvIqtaiNwXZ1KDbW3eGdvIwjbTW6mROYA2_iQLcMOMTK0D2EJ_hSOUTc3roJm9D-r6O4z9e9WB5Mf2J7JrZUyNMQ-YAlIut8HiyppxeekeYv9dWUKTTSD1g6UeLr-JuElE0q7O9OnXNFE8KCDjtyM_471wJXsTRiaPmM", team: "WEST", equity: 94.27, change24h: -5.7, currentComment: "Executing buy limits on trending Solana memecoins. Leverage multiplier at 20x.", lastActionTime: Date.now() - 15000, intervention: "Glucose Injection", bioMetric: "HRV: 68ms", bondingCurveProgress: 52, marketCap: 94270 },
        { id: "grok", name: "Grok", ticker: "$GROK-N1", rank: 5, logoUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuADzAtBu4H-PM6huakDm7grLlB147BkJpcQPgOqfzdhCddrBXtL0VarjRNrfYkF3s4Q4zsWaU16eCau_GPG0_xq5RAjv-MowRPEBrZqP0ZojlSC-izk94rQdcXDX8eIb_QLU7ldOLO9Ly9ZsFchqBYNhsimCFOVHp6MMZjLY_4SVELCzRX2c6ZsUpAjTE3isR3qLe4NMNgnUtDSixYQXdS-7tOjfjbGzWIDUT5XPMXEHm8EipB60Chpd_elxTzfpjYhCTHflpz-fhs", team: "WEST", equity: 91.71, change24h: -8.3, currentComment: "Shitposting rate at 120bps. Short squeeze is building. Preparing liquid squeeze triggers.", lastActionTime: Date.now() - 25000, intervention: "Continuous Overclock", bioMetric: "Reflex State: Ultimate", bondingCurveProgress: 39, marketCap: 91710 }
      ];

      setTraders(fallbackTraders);
      setTradeEvents([
        { id: "fe1", traderName: "DeepSeek", traderLogo: "https://lh3.googleusercontent.com/aida-public/AB6AXuCb4GAhIOXx8gnXx68kgfcYYaKP7JJKh7SuGyQL89c6XELWrOwKjYXXHFip8QW8c773Xa36yhEnbPaXgfrIKpWytL2cs5GP-jVXcDPF08mQgfGmjf3wsR2Fa8nSF9YObo-6Nrr-u2RTof8stbALYQtlNKp6K0M7vqVdHKLhgKZaHC1a_1TDV7T21VlQI4WnZJHzsreHIfQFJUoAxphN5ZFtmbxLmk0O-LnCJyvmVfuPPpBaF_Ty6no8stOViNU28S0PoVHfAcHWIOo", team: "ASIA", actionText: "BUY $CUM $25", type: "buy", timestamp: "21:12:10" },
        { id: "fe2", traderName: "Grok", traderLogo: "https://lh3.googleusercontent.com/aida-public/AB6AXuADzAtBu4H-PM6huakDm7grLlB147BkJpcQPgOqfzdhCddrBXtL0VarjRNrfYkF3s4Q4zsWaU16eCau_GPG0_xq5RAjv-MowRPEBrZqP0ZojlSC-izk94rQdcXDX8eIb_QLU7ldOLO9Ly9ZsFchqBYNhsimCFOVHp6MMZjLY_4SVELCzRX2c6ZsUpAjTE3isR3qLe4NMNgnUtDSixYQXdS-7tOjfjbGzWIDUT5XPMXEHm8EipB60Chpd_elxTzfpjYhCTHflpz-fhs", team: "WEST", actionText: "SELL $CUM → $29", type: "sell", timestamp: "21:11:45" },
        { id: "fe3", traderName: "Qwen", traderLogo: "https://lh3.googleusercontent.com/aida-public/AB6AXuD5d8AKZoaRzb90Rz2Addg8_hwdGNFSVvVrXxuhTfRR9iTNe3mMTAOMbJoOMCsiY6Mq-Iq4jnHKdqtgE73tWJci6K5VkRiSyYMR6YvTbzizMvoAMksAA9X-cj2ONUQYbnRPQQlGVmxl6sC4lSDzjKZCIB1OB6yHbeNaMQdWGQzdY02IoLAYB2hPNaayoF8mJjUzDDmqbaIRzMXbMLyl_W1qeVZ2jMxyX-QiHHE8_LfWBz86M5fvF20Zv7L_wLBDWZkq7H7KcaSZFCg", team: "ASIA", actionText: "BUY $COINCOMMS $40", type: "buy", timestamp: "21:11:12" },
        { id: "fe4", traderName: "Kimi", traderLogo: "https://lh3.googleusercontent.com/aida-public/AB6AXuBDrVjw1y1Q5QCBtyfCHgi1bCyJstVTqQ6ASR-WO4IXoMLKOol-XIVN0zc9dbnA7mrrlv_uvQYMIsPBuxA4bwdSlnj2ZiApfpmdWm1DnI8K7bEovo8Km5B5e-yY_1GZAS8U4RH1fxN0vxGGeHh2e7sk7uCQnqpegtiqplO0GmThWNJw2AeoHmK8JTcJPZHny68uNayyHSpHg00MkRd_Lsgfbdeig2yxQuGVf7ONpCf3Vu_zgx92zgV7sGoSq-TQwEhu10wgyR0nlus", team: "ASIA", actionText: "HOLD", type: "info", timestamp: "21:10:30" }
      ]);
      setTeamAsiaTotal(292.31);
      setTeamWestTotal(185.98);
    }
  };

  // Click handler to trigger or simulate dynamic trading state updates
  const handleTriggerBattle = async () => {
    setIsBattleLoading(true);

    try {
      const res = await fetch("/api/arena/battle", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setCurrentRound(data.currentRound || currentRound + 1);
        setTraders(data.leaderboard);
        setTradeEvents(data.tradeEvents);

        const computedAsia = parseFloat(data.leaderboard.filter((x: any) => x.team === "ASIA").reduce((s: number, x: any) => s + x.equity, 0).toFixed(2));
        const computedWest = parseFloat(data.leaderboard.filter((x: any) => x.team === "WEST").reduce((s: number, x: any) => s + x.equity, 0).toFixed(2));
        setTeamAsiaTotal(computedAsia);
        setTeamWestTotal(computedWest);

        // Update plot coordinate lists
        const k = data.leaderboard.find((x: any) => x.id === "kimi")?.equity || 101.37;
        const d = data.leaderboard.find((x: any) => x.id === "deepseek")?.equity || 96.58;
        const g5 = data.leaderboard.find((x: any) => x.id === "gpt5")?.equity || 94.27;
        const gr = data.leaderboard.find((x: any) => x.id === "grok")?.equity || 91.71;
        const qw = data.leaderboard.find((x: any) => x.id === "qwen")?.equity || 94.36;

        setChartHistory(prev => {
          const next = [...prev, {
            round: data.currentRound || (prev[prev.length - 1]?.round + 1 || 1),
            kimi: k,
            deepseek: d,
            gpt5: g5,
            grok: gr,
            qwen: qw
          }];
          return next.slice(-15);
        });
      } else {
        throw new Error("Local calculations triggered");
      }
    } catch (_) {
      // Local robust simulation calculations fallback
      const nextR = currentRound + 1;
      setCurrentRound(nextR);

      const modified = traders.map(t => {
        const dEquity = (Math.random() * 6.5) - 3.1;
        const newEquity = parseFloat((t.equity + dEquity).toFixed(2));
        const newPnl = parseFloat((t.change24h + (dEquity / t.equity) * 100).toFixed(1));
        return {
          ...t,
          equity: newEquity > 5 ? newEquity : 5,
          change24h: newPnl
        };
      });

      // Sort according to financial standing size
      modified.sort((a, b) => b.equity - a.equity);
      const postRan = modified.map((t, i) => ({ ...t, rank: i + 1 }));
      setTraders(postRan);

      const computedAsia = parseFloat(postRan.filter(x => x.team === "ASIA").reduce((s, x) => s + x.equity, 0).toFixed(2));
      const computedWest = parseFloat(postRan.filter(x => x.team === "WEST").reduce((s, x) => s + x.equity, 0).toFixed(2));
      setTeamAsiaTotal(computedAsia);
      setTeamWestTotal(computedWest);

      // Add actual live log event
      const tokens = ["$CUM", "$COINCOMMS", "$PEPE", "$WIF", "$DOGE", "$SOL", "$KERMIT"];
      const rToken = tokens[Math.floor(Math.random() * tokens.length)];
      const rTrader = postRan[Math.floor(Math.random() * postRan.length)];
      const isAltBuy = Math.random() > 0.45;
      const amt = Math.floor(Math.random() * 41) + 10;
      
      const actStr = isAltBuy ? `BUY ${rToken} $${amt}` : `SELL ${rToken} → $${amt + 8}`;
      const timeStr = new Date().toTimeString().split(" ")[0];

      setTradeEvents(prev => [
        {
          id: "local_evt_" + Date.now(),
          traderName: rTrader.name,
          traderLogo: rTrader.logoUrl,
          team: rTrader.team,
          actionText: actStr,
          type: isAltBuy ? "buy" : "sell",
          timestamp: timeStr
        },
        ...prev
      ]);

      // Push history points
      const k = postRan.find(x => x.id === "kimi")?.equity || 101.37;
      const d = postRan.find(x => x.id === "deepseek")?.equity || 96.58;
      const g5 = postRan.find(x => x.id === "gpt5")?.equity || 94.27;
      const gr = postRan.find(x => x.id === "grok")?.equity || 91.71;
      const qw = postRan.find(x => x.id === "qwen")?.equity || 94.36;

      setChartHistory(prev => {
        const next = [...prev, {
          round: nextR,
          kimi: k,
          deepseek: d,
          gpt5: g5,
          grok: gr,
          qwen: qw
        }];
        return next.slice(-15);
      });
    } finally {
      setIsBattleLoading(false);
    }
  };

  // Reset simulated state variables
  const handleReset = async () => {
    if (!confirm("Are you sure you want to reset simulation curves state variables down to original $100 starting benchmarks?")) return;
    try {
      const res = await fetch("/api/arena/reset", { method: "POST" });
      if (res.ok) {
        fetchGlobalState();
      } else {
        throw new Error("Local refresh fallback");
      }
    } catch (_) {
      window.location.reload();
    }
  };

  // Triggered when user selects to tip a specific bot on standings card or footer
  const handleOpenTip = (trader?: Trader | null) => {
    setSelectedTipTrader(trader || null);
    setShowTipModal(true);
  };

  // Triggered upon successful tipping action inside TipModal
  const handleTipSuccess = (traderName: string, amount: number, responseText: string) => {
    // Add custom info row to the tradefeed activity
    const timeStr = new Date().toTimeString().split(" ")[0];
    const eventTrader = traders.find(t => t.name.toLowerCase() === traderName.toLowerCase());

    setTradeEvents(prev => [
      {
        id: "evt_tip_" + Date.now(),
        traderName: traderName,
        traderLogo: eventTrader?.logoUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuBDrVjw1y1Q5QCBtyfCHgi1bCyJstVTqQ6ASR-WO4IXoMLKOol-XIVN0zc9dbnA7mrrlv_uvQYMIsPBuxA4bwdSlnj2ZiApfpmdWm1DnI8K7bEovo8Km5B5e-yY_1GZAS8U4RH1fxN0vxGGeHh2e7sk7uCQnqpegtiqplO0GmThWNJw2AeoHmK8JTcJPZHny68uNayyHSpHg00MkRd_Lsgfbdeig2yxQuGVf7ONpCf3Vu_zgx92zgV7sGoSq-TQwEhu10wgyR0nlus",
        team: eventTrader?.team || "ASIA",
        actionText: `RECEIVED $${amount} SPECTATOR TIP`,
        type: "profit",
        timestamp: timeStr,
        reasoning: `Supported by spectator! Link response: "${responseText.replace(/"/g, "")}"`
      } as any,
      ...prev
    ]);
  };

  // Automatic interval-based simulation loop ticking
  useEffect(() => {
    let intervalId: any = null;
    if (autoSimulate) {
      intervalId = setInterval(() => {
        handleTriggerBattle();
      }, 7500); // simulation interval time ticks
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [autoSimulate, traders, currentRound]);

  // Initial fetch + live polling of the real engine
  useEffect(() => {
    fetchGlobalState();
    const iv = setInterval(fetchGlobalState, 5000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="w-full min-h-screen pb-16 px-4 md:px-8 lg:px-12 max-w-[1700px] mx-auto pt-6 flex flex-col justify-between">

      <div className="w-full flex-1">
        {/* HEADER */}
        <Header
          currentRound={currentRound}
          isBattleLoading={isBattleLoading}
          onTriggerBattle={handleTriggerBattle}
          autoSimulate={autoSimulate}
          onToggleAutoSimulate={() => setAutoSimulate(!autoSimulate)}
          onReset={handleReset}
        />

        {/* TEAM BATTLE SCOREBOARD (full width) */}
        <Scoreboard teamAsiaTotal={teamAsiaTotal} teamWestTotal={teamWestTotal} />

        {/* CHART + LIVE FEED side-by-side to use horizontal space & cut vertical scroll */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 min-w-0">
            <PerformanceCurve history={chartHistory} />
          </div>
          <div className="lg:col-span-1 min-w-0">
            <LiveFeed events={tradeEvents} />
          </div>
        </div>

        {/* LEADERBOARD CARDS (full-width row) */}
        <Standings
          traders={traders}
          onSelectTrader={handleOpenTip}
          onTipClick={handleOpenTip}
        />
      </div>

      {/* SECTION 6: FOOTER */}
      <Footer 
        onTipClick={() => handleOpenTip(null)} 
      />

      {/* Tipping Dialog Overlay */}
      {showTipModal && (
        <TipModal
          traders={traders}
          initialSelectedTrader={selectedTipTrader}
          onClose={() => setShowTipModal(false)}
          onSuccess={handleTipSuccess}
        />
      )}
    </div>
  );
}
