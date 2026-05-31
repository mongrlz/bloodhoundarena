import React, { useState } from "react";
import { 
  Send, 
  Cpu, 
  Search, 
  Compass, 
  Sliders, 
  Sparkles, 
  Brain, 
  FileText,
  MessageSquare,
  Flame
} from "lucide-react";
import { ChatMessage, Trader } from "../types";

interface IntelligenceCenterProps {
  traders: Trader[];
  onUpdateTraderBias: (traderId: string, updates: { currentComment: string; equity: number }) => void;
  chatHistory: ChatMessage[];
  onSubmitChat: (messageText: string) => Promise<void>;
  isChatLoading: boolean;
}

export default function IntelligenceCenter({
  traders,
  onUpdateTraderBias,
  chatHistory,
  onSubmitChat,
  isChatLoading,
}: IntelligenceCenterProps) {
  const [userInput, setUserInput] = useState("");
  const [selectedBotId, setSelectedBotId] = useState(traders[0]?.id || "kimi");
  const [rightTab, setRightTab] = useState<'tuning' | 'community'>('tuning');
  const [communityInput, setCommunityInput] = useState("");
  const [communityChats, setCommunityChats] = useState<Record<string, Array<{ id: string; author: string; text: string; time: string }>>>({
    kimi: [
      { id: "k1", author: "PumpLord88", text: "KIMI-N1 caffeine overload is absolute genius. 400mg holds macro support.", time: "20:55" },
      { id: "k2", author: "CaffeineDegen", text: "Cardiac HRV is down but Option Volume is skyrocketing!", time: "20:56" },
      { id: "k3", author: "DeSciChaser", text: "Bonding curve is 88%. Listings consensus near.", time: "20:57" }
    ],
    deepseek: [
      { id: "d1", author: "SleepMaxxer", text: "Sleep-wake melatonin trial has perfect options delta.", time: "20:54" },
      { id: "d2", author: "ArbSeeder", text: "3.2 hours deep sleep today. Absolute logical efficiency.", time: "20:55" },
      { id: "d3", author: "MatrixBull", text: "We hitting Raydium list by dawn. Bullish.", time: "20:57" }
    ],
    gpt5: [
      { id: "g1", author: "KetoKing", text: "Ketones protocol keeping brain options running at peak focus level.", time: "20:53" },
      { id: "g2", author: "WestSideBull", text: "Fundamental metrics are sound. Pure alpha.", time: "20:55" },
      { id: "g3", author: "OptVal", text: "Options volatility arb pool locking down WEST liquidity.", time: "20:56" }
    ],
    grok: [
      { id: "gr1", author: "NoSleepDeSci", text: "35 hr sleep deprivation is Grok on peak dopamine adrenaline load!", time: "20:52" },
      { id: "gr2", author: "MemeLord", text: "Shitposting rate maximum. Total degen metrics.", time: "20:54" },
      { id: "gr3", author: "RiskHedge", text: "Dopamine saturation is printing. Squeeze is on!", time: "20:56" }
    ],
    qwen: [
      { id: "qw1", author: "PreciseScalp", text: "Modafinil dosing secured. Grid algo is at 99.8% precision right now.", time: "20:53" },
      { id: "qw2", author: "N1Sovereign", text: "Pupil dilation metrics verified. Absolute alignment.", time: "20:55" },
      { id: "qw3", author: "CurveBuster", text: "Bonding curve is at 29%. Massive room for clinical trial publishing.", time: "20:57" }
    ]
  });

  const handleSendCommunity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!communityInput.trim()) return;
    const userText = communityInput;
    setCommunityInput("");
    
    const now = new Date();
    const timeString = now.toTimeString().split(' ')[0].slice(0, 5);
    
    const newUserMsg = {
      id: "user_" + Date.now(),
      author: "Operator (You)",
      text: userText,
      time: timeString
    };
    
    setCommunityChats(prev => ({
      ...prev,
      [selectedBotId]: [...(prev[selectedBotId] || []), newUserMsg]
    }));
    
    // Trigger simulated comment response
    setTimeout(() => {
      const responses: Record<string, string[]> = {
        kimi: [
          "Let's boost the caffeine dose. KIMI-N1 needs more leverage!",
          "LFG! We are breaking out of the 100K mcap ceiling",
          "Clinical trials consensus is bullish. Buy KIMI-N1 dips!",
          "Caffeine saturation level fully matched."
        ],
        deepseek: [
          "Agreed. DeepSleep state arb is executing perfectly.",
          "Raydium listing is imminent!",
          "Melatonin protocols are locking down the order books.",
          "SEEK-N1 volume is high"
        ],
        gpt5: [
          "Pure exogenous ketones focus is showing on the chart.",
          "Fund west liquidity pools now!",
          "Options delta hedge is complete.",
          "GPT-N1 to the moon."
        ],
        grok: [
          "Sleep deprivation dopamine is high! Grok on fire",
          "We are liquidating the shorts, absolute degen play!",
          "Total dopamine adrenaline overload, buy now!",
          "This is crazy but GROK-N1 is outperforming haha"
        ],
        qwen: [
          "Modafinil 200mg loading confirmed. Qwen scalp precision is printing.",
          "QWEN-N1 is the safest DeSci play here.",
          "Buy the bonding curve support!",
          "Clean grid correlation."
        ]
      };
      
      const botResps = responses[selectedBotId] || ["N=1 protocol verified."];
      const randomizedRespText = botResps[Math.floor(Math.random() * botResps.length)];
      
      const authors = ["DegenDoc", "BioHackerX", "ClinicalApe", "SolDeSci", "ProtocolN1"];
      const randomAuthor = authors[Math.floor(Math.random() * authors.length)];
      
      const newSimMsg = {
        id: "sim_" + Date.now(),
        author: randomAuthor,
        text: randomizedRespText,
        time: new Date().toTimeString().split(' ')[0].slice(0, 5)
      };
      
      setCommunityChats(prev => ({
        ...prev,
        [selectedBotId]: [...(prev[selectedBotId] || []), newSimMsg]
      }));
    }, 850);
  };
  
  // Local mutable bot slider configurations for game state immersion
  const [botConfigs, setBotConfigs] = useState<Record<string, { leverage: number; frequency: string; risk: number }>>({
    kimi: { leverage: 25, frequency: "Hyper-Active", risk: 8.5 },
    deepseek: { leverage: 10, frequency: "Balanced", risk: 4.2 },
    gpt5: { leverage: 15, frequency: "Balanced", risk: 5.0 },
    grok: { leverage: 50, frequency: "Degenerate", risk: 14.5 },
    qwen: { leverage: 5, frequency: "Conservative", risk: 2.0 },
  });

  const activeBot = traders.find(t => t.id === selectedBotId) || traders[0];
  const activeConfig = botConfigs[selectedBotId] || { leverage: 10, frequency: "Balanced", risk: 5.0 };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isChatLoading) return;
    const msg = userInput;
    setUserInput("");
    await onSubmitChat(msg);
  };

  const handlePresetQuery = (query: string) => {
    if (isChatLoading) return;
    onSubmitChat(query);
  };

  const handleUpdateBotLocal = (field: string, value: any) => {
    setBotConfigs(prev => ({
      ...prev,
      [selectedBotId]: {
        ...prev[selectedBotId],
        [field]: value
      }
    }));
  };

  const handleApplyStrategy = () => {
    // Immersion update: alters the trader comment/equity slightly in active standings based on the intelligence configurations!
    const updatedComments: Record<string, string[]> = {
      kimi: [
        `Leverage spiked to ${activeConfig.leverage}x. Bullish on $SOL.`,
        `Analyzing sentiment at ${activeConfig.risk}% risk profile max.`
      ],
      deepseek: [
        `DeepSeek neural grid tuned to ${activeConfig.frequency} frequency.`,
        `Structured structural arbitrage active on low risk bands.`
      ],
      gpt5: [
        `Executing macro options spreads with ${activeConfig.frequency} strategy bias.`,
        `GPT mean-reversion algorithm recalibrated to ${activeConfig.leverage}x leverage.`
      ],
      grok: [
        `Absolute maximum scale degeneracy initiated with ${activeConfig.leverage}x leverage!`,
        `Shitpost engines accelerating. High risk (${activeConfig.risk}%) levels.`
      ],
      qwen: [
        `Risk mitigated to ultra-conservative ${activeConfig.risk}%.`,
        `Qwen portfolio re-weighted. Steady grid execution.`
      ]
    };
    
    const botComments = updatedComments[selectedBotId] || ["Recalibrating quantum risk matrices."];
    const chosenComment = botComments[Math.floor(Math.random() * botComments.length)];
    
    // Inject a tiny balance bump for successful application
    const biasBump = activeConfig.frequency === "Degenerate" ? (Math.random() * 5 - 2.5) : (Math.random() * 2);
    
    onUpdateTraderBias(selectedBotId, {
      currentComment: chosenComment,
      equity: parseFloat((activeBot.equity + biasBump).toFixed(2))
    });
    
    alert(`STRATEGY UPLINK SECURED\n\n${activeBot.name.toUpperCase()} trading core set to ${activeConfig.frequency.toUpperCase()} utilizing ${activeConfig.leverage}X Leverage!`);
  };

  // Pre-defined esports betting/trading queries to try out with search grounding or prompt generator
  const presets = [
    { text: "Analyze Team Asia leverage gaps", icon: Cpu },
    { text: "Simulate $DOGE breakout options", icon: Sparkles },
    { text: "Check internet sentiment for $SOL vs $ETH", icon: Search },
    { text: "Show real-time crypto news updates", icon: Compass }
  ];

  return (
    <div id="intel-center-container" className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      
      {/* 2/3 COLUMN: Chat HUD Bridge with Server-side Gemini */}
      <section className="xl:col-span-2 bg-surface-container-lowest neo-border neo-shadow p-6 flex flex-col h-[560px] relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>

        {/* Header */}
        <div className="border-b-2 border-on-surface pb-3 mb-4 flex justify-between items-center select-none">
          <div className="flex items-center gap-2">
            <Brain className="text-primary" />
            <h3 className="font-display font-black text-base uppercase text-on-surface">
              CENTRAL INTEL COMMAND CENTER
            </h3>
          </div>
          <span className="font-mono text-[9px] bg-primary text-on-primary px-2.5 py-1 neo-border-sm font-bold uppercase">
            Model: GEMINI 3.5 FLASH
          </span>
        </div>

        {/* Message scroll log */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-4 p-2 font-mono text-xs max-h-[350px]">
          {chatHistory.length === 0 ? (
            <div className="h-full flex flex-col justify-center items-center text-center text-on-surface-variant/70 space-y-3 py-10 select-none">
              <Cpu size={36} className="animate-pulse text-primary" />
              <p className="font-bold uppercase tracking-wider">&gt; CENTRAL COGNITIVE COUPLING OFFLINE</p>
              <p className="max-w-md text-[11px] leading-relaxed">
                Connect directly to the Bloodhound tactical mainframe to formulate automated hedging directives, query live macro standings, or inject real market analysis.
              </p>
            </div>
          ) : (
            chatHistory.map((msg) => {
              const isOperator = msg.role === "model";
              const isSystem = msg.role === "system";
              
              if (isSystem) {
                return (
                  <div key={msg.id} className="text-center py-1 border-y border-dashed border-on-surface/10 text-on-surface-variant/60 text-[10px]">
                    {msg.content}
                  </div>
                );
              }

              return (
                <div 
                  id={`chat-msg-${msg.id}`}
                  key={msg.id} 
                  className={`flex gap-3 max-w-[85%] ${
                    isOperator ? "mr-auto" : "ml-auto flex-row-reverse"
                  }`}
                >
                  {/* Small round placeholder role avatar */}
                  <div className={`w-6 h-6 rounded-full neo-border-sm shrink-0 flex items-center justify-center font-bold text-[10px] ${
                    isOperator ? "bg-action-gold text-on-surface" : "bg-primary text-on-primary"
                  }`}>
                    {isOperator ? "Ω" : "U"}
                  </div>

                  <div className={`p-3 neo-border-sm rounded-sm ${
                    isOperator 
                      ? "bg-surface-container text-on-surface leading-normal text-[11px] font-sans font-semibold shadow-[2px_2px_0px_rgba(0,0,0,1)]" 
                      : "bg-primary/10 text-on-surface font-semibold shadow-[2px_2px_0px_rgba(0,41,219,0.1)]"
                  }`}>
                    <p className="whitespace-pre-line">{msg.content}</p>

                    {/* Grounding Source citations mapping */}
                    {msg.searchSources && msg.searchSources.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-on-surface/10">
                        <span className="text-[9px] font-mono font-bold text-primary block mb-1">
                          INTELLIGENCE SOURCES UNCOVERED VIA GOOGLE SEARCH:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {msg.searchSources.map((src, i) => (
                            <a 
                              key={i}
                              href={src.uri} 
                              target="_blank" 
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 bg-surface-container-high px-2 py-0.5 border border-on-surface/20 text-[9px] hover:bg-tertiary-fixed font-mono rounded-sm transition-colors text-primary font-bold shadow-[0.5px_0.5px_rgba(0,0,0,1)]"
                            >
                              <FileText size={8} />
                              {src.title.length > 18 ? src.title.slice(0, 15) + "..." : src.title}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          {isChatLoading && (
            <div className="flex gap-3 mr-auto max-w-[85%]">
              <div className="w-6 h-6 rounded-full neo-border-sm bg-action-gold shrink-0 animate-pulse flex items-center justify-center font-bold text-[10px]">
                Ω
              </div>
              <div className="p-3 bg-surface-container neo-border-sm rounded-sm animate-pulse flex items-center gap-2 font-sans font-bold">
                <span className="h-2 w-2 bg-on-surface rounded-full animate-ping"></span>
                <span>DECRYPTING ARENA FREQUENCIES...</span>
              </div>
            </div>
          )}
        </div>

        {/* Preset Prompt Suggestions */}
        {chatHistory.length === 0 && (
          <div className="mb-4">
            <span className="text-[10px] font-bold text-on-surface-variant block mb-2 font-mono uppercase tracking-wide">
              UPLINK PRESETS:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {presets.map((p, i) => {
                const Icon = p.icon;
                return (
                  <button
                    key={i}
                    onClick={() => handlePresetQuery(p.text)}
                    className="flex items-center gap-2 p-2 bg-surface hover:bg-tertiary-fixed text-left text-[10.5px] neo-border-sm rounded-sm font-semibold cursor-pointer transition-all hover:scale-[1.01]"
                  >
                    <Icon size={12} className="text-primary shrink-0" />
                    <span>{p.text}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Input Text Form */}
        <form onSubmit={handleSend} className="w-[100%] flex gap-2">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Command your AI agents or audit trade metrics..."
            disabled={isChatLoading}
            className="flex-1 px-3 py-3 font-mono text-xs bg-surface text-on-surface neo-border-sm focus:outline-none focus:ring-2 focus:ring-action-gold rounded-sm placeholder:text-on-surface-variant/50"
          />
          <button
            type="submit"
            disabled={!userInput.trim() || isChatLoading}
            className="px-4 bg-primary text-on-primary neo-border-sm hover:bg-primary-container disabled:opacity-50 flex items-center justify-center font-mono font-bold text-xs uppercase cursor-pointer"
          >
            <Send size={14} />
          </button>
        </form>
      </section>

      {/* 1/3 COLUMN: AI Standings Tuning (Immersion control panel) */}
      <section className="bg-surface-container-lowest neo-border neo-shadow p-6 flex flex-col h-[560px] relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>

        {/* Tab Headers */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            onClick={() => setRightTab('tuning')}
            className={`py-2 px-3 text-xs font-mono font-bold uppercase rounded-sm border cursor-pointer transition-all ${
              rightTab === 'tuning'
                ? "bg-secondary text-on-secondary border-on-surface shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] font-extrabold"
                : "bg-surface text-on-surface-variant border-on-surface/10 hover:bg-surface-dim"
            }`}
          >
            🧬 N=1 Tuning
          </button>
          <button
            onClick={() => setRightTab('community')}
            className={`py-2 px-3 text-xs font-mono font-bold uppercase rounded-sm border cursor-pointer transition-all ${
              rightTab === 'community'
                ? "bg-action-gold text-on-surface border-on-surface shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] font-extrabold"
                : "bg-surface text-on-surface-variant border-on-surface/10 hover:bg-surface-dim"
            }`}
          >
            💬 Community
          </button>
        </div>

        {/* Bot selector pills */}
        <div className="mb-3 select-none">
          <div className="flex flex-wrap gap-1">
            {traders.map((bot) => {
              const active = bot.id === selectedBotId;
              const ticker = bot.ticker || `$${bot.name.toUpperCase()}-N1`;
              return (
                <button
                  key={bot.id}
                  onClick={() => setSelectedBotId(bot.id)}
                  className={`px-2 py-0.5 font-mono text-[9px] font-bold rounded-sm border cursor-pointer transition-all ${
                    active
                      ? "bg-primary text-on-primary border-on-surface shadow-[1px_1px_0px_rgba(0,0,0,1)]"
                      : "bg-surface text-on-surface-variant border-on-surface/15 hover:bg-surface-dim"
                  }`}
                >
                  {ticker}
                </button>
              );
            })}
          </div>
        </div>

        {activeBot && rightTab === 'tuning' && (
          <div className="flex-1 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4 font-sans border-t border-on-surface/10 pt-3">
              
              {/* Target Bot Identity Tag */}
              <div className="flex items-center gap-3 bg-surface p-2 neo-border-sm rounded-sm">
                <img 
                  alt={activeBot.name} 
                  src={activeBot.logoUrl} 
                  className="w-10 h-10 rounded-md neo-border-sm object-cover bg-white shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="font-display font-extrabold text-xs text-on-surface uppercase flex items-center gap-1">
                    {activeBot.name} <span className="text-[10px] text-primary">{activeBot.ticker || `$${activeBot.name.toUpperCase()}-N1`}</span>
                  </h4>
                  <p className="font-mono text-[9px] text-on-surface-variant">
                    DIV: {activeBot.team} || VAL: ${activeBot.equity.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Slider 1: Leverage Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono font-bold">
                  <span>BIO-LEVERAGE STRETCH:</span>
                  <span className="text-secondary font-black">{activeConfig.leverage}x</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="100" 
                  value={activeConfig.leverage}
                  onChange={(e) => handleUpdateBotLocal("leverage", parseInt(e.target.value))}
                  className="w-[100%] accent-secondary cursor-pointer"
                />
                <div className="flex justify-between text-[8px] font-mono text-on-surface-variant">
                  <span>1x (BASELINE)</span>
                  <span>50x (STRESS)</span>
                  <span>100x (DEGEN PROTOCOL)</span>
                </div>
              </div>

              {/* Slider 2: Strategy Bias frequency */}
              <div className="space-y-1">
                <span className="text-[11px] font-mono font-bold block">
                  INTERVENTION REGIMEN:
                </span>
                <select
                  value={activeConfig.frequency}
                  onChange={(e) => handleUpdateBotLocal("frequency", e.target.value)}
                  className="w-[100%] p-1.5 font-mono text-[11px] bg-surface text-on-surface neo-border-sm focus:outline-none rounded-sm"
                >
                  <option value="Conservative">CONSERVATIVE (BASELINE DOSING)</option>
                  <option value="Balanced">BALANCED (STANDARD TRIAL PROTOCOL)</option>
                  <option value="Hyper-Active">HYPER-ACTIVE (ACCELERATED SATURATION)</option>
                  <option value="Degenerate">DEGENERATE (MAX DIALECT OVERCLOCK)</option>
                </select>
              </div>

              {/* Slider 3: Max Risk tolerance range */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono font-bold">
                  <span>ACTIVE BIO-INTERVENTION DOSE:</span>
                  <span className="text-primary font-black">{activeConfig.risk * 25}mg equivalents</span>
                </div>
                <input 
                  type="range" 
                  min="25" 
                  max="400" 
                  step="25"
                  value={activeConfig.risk * 25}
                  onChange={(e) => handleUpdateBotLocal("risk", parseFloat((parseInt(e.target.value) / 25).toFixed(1)))}
                  className="w-[100%] accent-primary cursor-pointer"
                />
                <div className="flex justify-between text-[8px] font-mono text-on-surface-variant">
                  <span>50mg (Micro)</span>
                  <span>200mg (Optimal)</span>
                  <span>400mg (Heavy Saturate)</span>
                </div>
              </div>

            </div>

            {/* Action Trigger Uplink */}
            <div className="mt-4 border-t border-on-surface/10 pt-3">
              <button
                onClick={handleApplyStrategy}
                className="w-[100%] py-2.5 bg-action-gold text-on-surface neo-border neo-shadow neo-hover font-mono font-bold text-xs uppercase cursor-pointer"
              >
                APPLY DOSE TO STANDINGS STANDBY
              </button>
            </div>
          </div>
        )}

        {activeBot && rightTab === 'community' && (
          <div className="flex-1 flex flex-col justify-between overflow-hidden">
            {/* Community Chat Header indicator */}
            <div className="bg-surface-container px-3 py-1.5 neo-border-sm rounded-sm flex items-center justify-between text-[10px] font-mono font-bold text-on-surface select-none">
              <span className="flex items-center gap-1">
                <Flame size={11} className="text-error animate-pulse animate-duration-1000" />
                {activeBot.ticker || `$${activeBot.name.toUpperCase()}-N1`} COMMUNITY
              </span>
              <span className="text-primary-container bg-primary px-1 text-[8.5px] rounded">
                BONDING CURVE: {activeBot.bondingCurveProgress || 50}%
              </span>
            </div>

            {/* Holder Chat Feed List */}
            <div className="flex-1 overflow-y-auto space-y-2.5 my-3 p-1 max-h-[300px]">
              {(communityChats[selectedBotId] || []).map((msg) => (
                <div key={msg.id} className="bg-surface p-2 rounded neo-border-sm text-[10.5px] font-mono select-none">
                  <div className="flex justify-between items-center text-[9px] text-on-surface-variant border-b border-on-surface/5 pb-0.5 mb-1 bg-surface-container px-1 font-bold">
                    <span className={msg.author.includes("(You)") ? "text-primary" : "text-secondary"}>
                      @{msg.author}
                    </span>
                    <span>{msg.time}</span>
                  </div>
                  <p className="text-on-surface leading-normal">{msg.text}</p>
                </div>
              ))}
            </div>

            {/* Micro input form for Pump.fun holders list chatter */}
            <form onSubmit={handleSendCommunity} className="flex gap-1.5 border-t border-on-surface/10 pt-2">
              <input
                type="text"
                value={communityInput}
                onChange={(e) => setCommunityInput(e.target.value)}
                placeholder="Type community comment..."
                className="flex-1 px-2.5 py-2 font-mono text-[10.5px] bg-stone-50 select-text text-on-surface neo-border-sm focus:outline-none focus:ring-1 focus:ring-action-gold rounded-sm placeholder:text-on-surface-variant/50"
              />
              <button
                type="submit"
                disabled={!communityInput.trim()}
                className="px-3 bg-primary text-on-primary neo-border-sm hover:bg-primary-container disabled:opacity-50 flex items-center justify-center font-mono font-bold text-[10.5px] uppercase cursor-pointer"
              >
                <Send size={11} />
              </button>
            </form>
          </div>
        )}
      </section>

    </div>
  );
}
