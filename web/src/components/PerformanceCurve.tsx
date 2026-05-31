import { useState } from "react";
import { Eye, EyeOff, Trophy, Flame, Sparkles, TrendingUp, HelpCircle, Activity, Zap } from "lucide-react";
import { BotAvatar } from "./BotIcon";

interface HistoryPoint {
  round: number;
  kimi: number;
  deepseek: number;
  gpt5: number;
  grok: number;
  qwen: number;
  claude: number;
}

interface PerformanceCurveProps {
  history: HistoryPoint[];
}

export default function PerformanceCurve({ history = [] }: PerformanceCurveProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  // High-performance filter states matching cartoon dApp interaction
  const [divisionFilter, setDivisionFilter] = useState<"ALL" | "ASIA" | "WEST">("ALL");
  const [visibleModels, setVisibleModels] = useState<Record<string, boolean>>({
    kimi: true,
    deepseek: true,
    gpt5: true,
    grok: true,
    qwen: true,
    claude: true,
  });
  
  const [hoveredLine, setHoveredLine] = useState<string | null>(null);

  // Fallback defaults to construct an elegant starting trend line
  const safeHistory = history && history.length > 0 ? history : [
    { round: 1, kimi: 100.00, deepseek: 100.00, gpt5: 100.00, grok: 100.00, qwen: 100.00, claude: 100.00 },
    { round: 3, kimi: 100.50, deepseek: 98.20, gpt5: 99.10, grok: 97.40, qwen: 98.10, claude: 99.50 },
    { round: 6, kimi: 101.90, deepseek: 96.80, gpt5: 97.40, grok: 94.60, qwen: 95.80, claude: 98.20 },
    { round: 9, kimi: 101.10, deepseek: 97.20, gpt5: 96.00, grok: 92.50, qwen: 94.20, claude: 97.10 },
    { round: 12, kimi: 101.37, deepseek: 96.58, gpt5: 94.27, grok: 91.71, qwen: 94.36, claude: 96.50 },
  ];

  // Retrieve bounds for dynamic axis scaling
  const allValues = safeHistory.flatMap(p => [p.kimi, p.deepseek, p.gpt5, p.grok, p.qwen, p.claude]);
  const maxVal = Math.max(...allValues, 105);
  const minVal = Math.min(...allValues, 88);
  const range = maxVal - minVal || 10;

  // Viewport definitions
  const width = 1000;
  const height = 340;
  const paddingX = 70;
  const paddingY = 45;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  // Get SVG coordinate projection points
  const getCoordinates = (field: keyof Omit<HistoryPoint, "round">) => {
    return safeHistory.map((point, index) => {
      const x = paddingX + (index / (safeHistory.length - 1)) * chartWidth;
      const equity = point[field] as number;
      const y = height - paddingY - ((equity - minVal) / range) * chartHeight;
      return { x, y, val: equity };
    });
  };

  const modelMetadata = {
    kimi: { color: "#EC4899", label: "Kimi ($KIMI)", team: "ASIA", glow: "rgba(236, 72, 153, 0.35)" },
    deepseek: { color: "#4D6BFE", label: "DeepSeek ($SEEK)", team: "ASIA", glow: "rgba(77, 107, 254, 0.35)" },
    qwen: { color: "#615CED", label: "Qwen ($QWEN)", team: "ASIA", glow: "rgba(97, 92, 237, 0.35)" },
    gpt5: { color: "#19C37D", label: "GPT ($GPT)", team: "WEST", glow: "rgba(25, 195, 125, 0.35)" },
    grok: { color: "#0B0B0B", label: "Grok ($GROK)", team: "WEST", glow: "rgba(11, 11, 11, 0.35)" },
    claude: { color: "#D97757", label: "Claude ($CLDE)", team: "WEST", glow: "rgba(217, 119, 87, 0.35)" },
  };

  // Convert points to SVG smooth path string
  const getSmoothPath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return "";
    // Straight segments between points = truthful (bezier smoothing could overshoot beyond actual equity values).
    return points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`).join(" ");
  };

  // Generate Area Fill (Closed Path) from coords for comic hatching
  const getAreaPath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return "";
    const last = points[points.length - 1];
    const baseY = height - paddingY;
    let d = `M ${points[0].x},${baseY} L ${points[0].x},${points[0].y}`;
    for (let i = 1; i < points.length; i++) d += ` L ${points[i].x},${points[i].y}`;
    d += ` L ${last.x},${baseY} Z`;
    return d;
  };

  // Formulate horizontal y grid ticks
  const yTicks = 5;
  const tickGridValues = Array.from({ length: yTicks + 1 }, (_, i) => {
    const value = minVal + (i / yTicks) * range;
    const y = height - paddingY - (i / yTicks) * chartHeight;
    return { value, y };
  });

  // Toggle model visibility state
  const toggleModel = (id: string) => {
    setVisibleModels(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Determine current standings based on last data point to place cartoon crowned headers/emoji anchors
  const lastPoint = safeHistory[safeHistory.length - 1];
  const roundSortedModels = Object.entries(modelMetadata)
    .map(([id, meta]) => ({
      id,
      val: lastPoint ? (lastPoint[id as keyof HistoryPoint] as number) : 100,
      meta
    }))
    .sort((a, b) => b.val - a.val);

  const currentLeaderId = roundSortedModels[0]?.id;
  const currentUnderdogId = roundSortedModels[roundSortedModels.length - 1]?.id;

  // Filter models based on side button selector tabs
  const shouldRenderLine = (id: string) => {
    // Check filter toggles first
    if (!visibleModels[id]) return false;
    
    const team = modelMetadata[id as keyof typeof modelMetadata].team;
    if (divisionFilter === "ASIA" && team !== "ASIA") return false;
    if (divisionFilter === "WEST" && team !== "WEST") return false;
    
    return true;
  };

  return (
    <section className="retro-card p-6 md:p-8 relative overflow-hidden select-none mb-8" id="diagnostics-section">
      {/* Dynamic diagonal stripe hazard header block inside the card */}
      <div className="absolute top-0 left-0 right-0 h-3 bg-repeat bg-[linear-gradient(-45deg,#000_25%,#FFC72C_25%,#FFC72C_50%,#000_50%,#000_75%,#FFC72C_75%)] bg-[length:14px_14px] border-b-3 border-black" />

      {/* Decorative cartoon top anchor tag */}
      <div className="absolute right-6 top-3 bg-[#FF4747] text-white border-2 border-black px-2.5 py-0.5 rounded text-[8.5px] font-black tracking-widest uppercase rotate-3 shadow-[2px_2px_0px_#000]">
        99.4% REALTIME COMPILATION
      </div>

      {/* Left decorative punch holes for notebook aesthetic */}
      <div className="absolute left-3 top-10 bottom-10 flex flex-col justify-between w-3 pointer-events-none opacity-40">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="w-2.5 h-2.5 rounded-full bg-black border border-black/30" />
        ))}
      </div>

      {/* Title block with Interactive Controls */}
      <div className="pl-4 sm:pl-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8 mt-5 pb-5 border-b-4 border-black">
        <div>
          <span className="font-mono text-xs font-black uppercase tracking-wider text-black bg-[#FFC72C] px-3 py-1 border-2 border-black rounded shadow-[2px_2px_0px_#000] inline-block mb-1.5 transform -rotate-1">
            ⚡ GRAPH PERFORMANCE ANALYZER
          </span>
          <h3 className="font-sans font-black text-3xl text-black tracking-tight uppercase flex items-center gap-2">
            AI TACTICAL PORTFOLIO PLOT
            <span className="bg-black text-white px-2 py-0.5 text-xs rounded-lg font-mono">LIVE</span>
          </h3>
          <p className="text-black/60 text-xs font-medium max-w-xl mt-1 leading-snug">
            Interactive charting dashboard. Click any AI competitor tag below to <span className="underline font-bold text-black">toggle</span> or filter division streams to isolate local support bands.
          </p>
        </div>

        {/* Division Filter Neo-Tabs */}
        <div className="flex bg-[#FFFDF5] p-1.5 border-4 border-black rounded-xl shadow-[3px_3px_0px_#000] shrink-0 self-stretch sm:self-auto justify-center">
          {(["ALL", "ASIA", "WEST"] as const).map((filter) => {
            const active = divisionFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => setDivisionFilter(filter)}
                className={`px-3 sm:px-4 py-1.5 rounded-lg font-mono text-xs font-black uppercase transition-all cursor-pointer ${
                  active 
                    ? "bg-[#FFC72C] text-black border-2 border-black shadow-[2px_2px_0px_#000]" 
                    : "text-black/50 hover:text-black hover:bg-black/5"
                }`}
              >
                {filter === "ALL" ? "🪐 SHOW ALL" : filter === "ASIA" ? "🟥 ASIA ONLY" : "🟦 WEST ONLY"}
              </button>
            );
          })}
        </div>
      </div>

      {/* SVG Container with Custom Retro Shading Defs */}
      <div className="relative w-full overflow-x-auto pl-4 sm:pl-6">
        <div className="min-w-[700px] w-full h-[360px] bg-white rounded-2xl border-4 border-black shadow-[6px_6px_0px_#000] p-4 relative overflow-hidden">
          
          {/* Halftone background texture block (decorates the graph background) */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.015)_1.5px,transparent_1.5px)] bg-[size:10px_10px] pointer-events-none" />

          <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${width} ${height}`}>
            {/* Custom SVG Hatch shading patterns definition */}
            <defs>
              <pattern id="hatch-kimi" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2="0" y2="10" stroke="#FF4747" strokeWidth="2" opacity="0.12" />
              </pattern>
              <pattern id="hatch-deepseek" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2="0" y2="10" stroke="#FF8F3D" strokeWidth="2" opacity="0.12" />
              </pattern>
              <pattern id="hatch-gpt5" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2="0" y2="10" stroke="#3B82F6" strokeWidth="2" opacity="0.12" />
              </pattern>
              <pattern id="hatch-grok" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2="0" y2="10" stroke="#10B981" strokeWidth="2" opacity="0.12" />
              </pattern>
              <pattern id="hatch-qwen" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2="0" y2="10" stroke="#FF3399" strokeWidth="2" opacity="0.12" />
              </pattern>
              
              {/* Halftone Dot pattern */}
              <pattern id="halftone-soft" width="12" height="12" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="#000000" opacity="0.04" />
              </pattern>
            </defs>

            {/* Retro graph paper background grid lines */}
            <rect x={paddingX} y={paddingY} width={chartWidth} height={chartHeight} fill="url(#halftone-soft)" stroke="#000000" strokeWidth="2" />
            
            <g>
              {tickGridValues.map((tick, i) => {
                // Skimp rendering bounds directly over outer frame
                if (i === 0 || i === yTicks) return null;
                return (
                  <line 
                    key={i} 
                    x1={paddingX} 
                    y1={tick.y} 
                    x2={width - paddingX} 
                    y2={tick.y} 
                    stroke="#000000" 
                    strokeWidth="1.5" 
                    strokeDasharray="5,5"
                    className="opacity-25"
                  />
                );
              })}
              {safeHistory.map((_, index) => {
                if (index === 0 || index === safeHistory.length - 1) return null;
                const x = paddingX + (index / (safeHistory.length - 1)) * chartWidth;
                return (
                  <line 
                    key={index} 
                    x1={x} 
                    y1={paddingY} 
                    x2={x} 
                    y2={height - paddingY} 
                    stroke="#000000" 
                    strokeWidth="1.5" 
                    strokeDasharray="5,5"
                    className="opacity-25"
                  />
                );
              })}
            </g>

            {/* Vertical Y-Axis Balance Labels */}
            <g className="font-mono text-[11px] font-black fill-black/60">
              {tickGridValues.map((tick, i) => (
                <text 
                  key={i} 
                  x={paddingX - 12} 
                  y={tick.y + 4} 
                  textAnchor="end"
                >
                  ${tick.value.toFixed(1)}
                </text>
              ))}
            </g>

            {/* 1. Translucent Area Hatch Shading Under Active Curve Plots (Behind Lines) */}
            {Object.keys(modelMetadata).map((id) => {
              if (!shouldRenderLine(id)) return null;
              const points = getCoordinates(id as keyof Omit<HistoryPoint, "round">);
              const isHovered = hoveredLine === id;
              
              return (
                <path
                  key={`area-${id}`}
                  d={getAreaPath(points)}
                  fill={`url(#hatch-${id})`}
                  className="transition-all duration-300"
                  style={{ opacity: isHovered ? 1 : hoveredLine ? 0.2 : 0.6 }}
                />
              );
            })}

            {/* 2. Drawing Bold Thick Comic Trend Curves */}
            {Object.keys(modelMetadata).map((id) => {
              if (!shouldRenderLine(id)) return null;
              
              const field = id as keyof Omit<HistoryPoint, "round">;
              const points = getCoordinates(field);
              const meta = modelMetadata[field];
              
              const isHovered = hoveredLine === id;
              const anyLineHovered = hoveredLine !== null;
              
              let strokeWidth = "4";
              let opacity = "1";
              
              if (isHovered) {
                strokeWidth = "8";
                opacity = "1";
              } else if (anyLineHovered) {
                strokeWidth = "1.5";
                opacity = "0.2";
              } else {
                // Leaders default to pop more
                strokeWidth = id === "kimi" || id === "gpt5" ? "5.5" : "3.5";
                opacity = "0.9";
              }

              return (
                <g key={`group-line-${id}`}>
                  {/* Backdrop thick line block to make it look pop illustration */}
                  <path 
                    d={getSmoothPath(points)} 
                    fill="none" 
                    stroke="#000000" 
                    strokeWidth={Number(strokeWidth) + 3.5}
                    strokeLinecap="round"
                    style={{ opacity }}
                    className="transition-all duration-300"
                  />
                  {/* Foreground bold color line */}
                  <path 
                    d={getSmoothPath(points)} 
                    fill="none" 
                    stroke={meta.color} 
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    style={{ opacity }}
                    className="transition-all duration-300"
                  />
                </g>
              );
            })}

            {/* Custom Mini Comic Stickers at peak value points */}
            {Object.keys(modelMetadata).map((id) => {
              if (!shouldRenderLine(id)) return null;
              const coords = getCoordinates(id as keyof Omit<HistoryPoint, "round">);
              
              // Find coordinate at index of leader round ending
              const lastCoord = coords[coords.length - 1];
              
              if (!lastCoord) return null;

              if (id === currentLeaderId) {
                return (
                  <g key={`sticker-${id}`}>
                    {/* King crown speech anchor */}
                    <rect 
                      x={lastCoord.x - 45} 
                      y={lastCoord.y - 34} 
                      width="90" 
                      height="18" 
                      rx="4" 
                      fill="#FFC72C" 
                      stroke="#000" 
                      strokeWidth="2" 
                      className="shadow-md"
                    />
                    <text 
                      x={lastCoord.x} 
                      y={lastCoord.y - 22} 
                      textAnchor="middle" 
                      className="font-mono text-[9px] font-black fill-black"
                    >
                      👑 LEADER: {lastCoord.val.toFixed(1)}
                    </text>
                  </g>
                );
              }

              // (removed ☠️ DRAWDOWN underdog sticker — it overlapped the round-axis labels)

              return null;
            })}

            {/* Vertical guidelines on hover mouse point */}
            {hoveredIndex !== null && safeHistory[hoveredIndex] && (
              <g>
                {/* Vertical slider divider shadow */}
                <line
                  x1={paddingX + (hoveredIndex / (safeHistory.length - 1)) * chartWidth}
                  y1={paddingY}
                  x2={paddingX + (hoveredIndex / (safeHistory.length - 1)) * chartWidth}
                  y2={height - paddingY}
                  stroke="#000000"
                  strokeWidth="3.5"
                />
                
                {/* Anchor Circle pips for matching active models */}
                {Object.keys(modelMetadata).map((id) => {
                  if (!shouldRenderLine(id)) return null;
                  const coords = getCoordinates(id as keyof Omit<HistoryPoint, "round">);
                  const pt = coords[hoveredIndex];
                  if (!pt) return null;
                  
                  return (
                    <g key={`pip-${id}`}>
                      {/* Black casing circle */}
                      <circle 
                        cx={pt.x} 
                        cy={pt.y} 
                        r="8.5" 
                        fill="#000000" 
                      />
                      {/* Nested bright pip circle */}
                      <circle 
                        cx={pt.x} 
                        cy={pt.y} 
                        r="5.5" 
                        fill={modelMetadata[id as keyof typeof modelMetadata].color} 
                        stroke="#FFFFFF" 
                        strokeWidth="1.5" 
                      />
                    </g>
                  );
                })}
              </g>
            )}

            {/* X-Axis Round Label Tags */}
            <g className="font-mono text-[10.5px] font-black fill-black">
              {safeHistory.map((point, index) => {
                const x = paddingX + (index / (safeHistory.length - 1)) * chartWidth;
                return (
                  <g key={`axis-x-${index}`}>
                    {/* Circle axis anchor block */}
                    <circle cx={x} cy={height - paddingY} r="3" fill="#000000" />
                    <text 
                      x={x} 
                      y={height - paddingY + 22} 
                      textAnchor="middle"
                    >
                      ROUND {point.round}
                    </text>
                  </g>
                );
              })}
            </g>

            {/* Interactivity trigger rectangles */}
            {safeHistory.map((point, index) => {
              const x = paddingX + (index / (safeHistory.length - 1)) * chartWidth;
              const colWidth = chartWidth / (safeHistory.length - 1 || 1);
              return (
                <rect
                  key={index}
                  x={x - colWidth / 2}
                  y={paddingY}
                  width={colWidth}
                  height={chartHeight}
                  fill="transparent"
                  className="cursor-crosshair"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              );
            })}
          </svg>

          {/* (removed floating LIQUIDITY OVERLAY sticker — it overlapped the chart/axis) */}

          {/* Absolute floating esports panel tooltip details on chart focus */}
          {hoveredIndex !== null && safeHistory[hoveredIndex] && (
            <div className="absolute top-[12px] left-[15px] bg-[#FFFDF5] p-3.5 rounded-2xl border-4 border-black shadow-[8px_8px_0px_#000000] font-mono text-[10px] leading-snug text-black space-y-2 backdrop-blur-md z-30 select-none max-w-sm">
              <div className="text-black font-black border-b-2 border-black pb-1.5 uppercase flex items-center justify-between gap-12 text-[11px]">
                <span className="flex items-center gap-1">
                  🎯 ROUND {safeHistory[hoveredIndex].round} STATS
                </span>
                <span className="bg-black text-[#FFC72C] px-2 py-0.5 rounded text-[8px] font-black">ACTIVE</span>
              </div>

              {/* Loop models ranked specifically for this hovered index point */}
              <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                {Object.entries(modelMetadata)
                  .map(([id, meta]) => {
                    const val = safeHistory[hoveredIndex]?.[id as keyof HistoryPoint] as number;
                    return { id, val, meta };
                  })
                  .filter(item => visibleModels[item.id]) // Only show visible
                  .sort((a,b) => b.val - a.val)
                  .map((item, index) => {
                    const isKimi = item.id === "kimi";
                    const isGpt = item.id === "gpt5";
                    
                    return (
                      <div 
                        key={item.id} 
                        className={`flex items-center justify-between gap-6 px-2 py-1 rounded border-2 transition-all ${
                          index === 0 
                            ? "bg-[#FFC72C]/35 border-[#FFC72C] font-black scale-102" 
                            : "bg-white/40 border-black/5"
                        }`}
                      >
                        <span className="text-black font-black flex items-center gap-1.5">
                          {index === 0 ? "👑" : index === 4 || index === 3 ? "💀" : "▫️"}
                          <span 
                            className="w-1.5 h-1.5 rounded-full inline-block" 
                            style={{ backgroundColor: item.meta.color }}
                          />
                          {item.meta.label.split(" ")[0]} 
                          <span className="text-[7.5px] opacity-50 font-bold">({item.meta.team})</span>
                        </span>
                        
                        <span className="font-extrabold text-right bg-white px-1.5 py-0.5 border border-black rounded shadow-[1px_1px_0px_rgba(0,0,0,1)]">
                          ${item.val.toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
              </div>

              <div className="font-sans text-[8.5px] font-black text-black/50 uppercase border-t border-black/10 pt-1.5 flex justify-between">
                <span>* PAPERS RECORDING APPLIED</span>
                <span className="text-[#FF4747]">DIVISION TACTICAL</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Interactive Legend filter blocks */}
      <div className="mt-8 pt-6 border-t-4 border-black">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <span className="font-mono text-xs font-black uppercase text-black tracking-wider flex items-center gap-1.5">
            <Zap size={14} className="text-[#FFC72C]" />
            TUNING HUD: CLICK TO TOGGLE EMISSION LINES
          </span>
          <span className="font-mono text-[9.5px] text-black/50 font-bold uppercase">
            Double-click line zones on chart to isolate focus
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 select-none font-mono text-[11px] tracking-wide font-black">
          {Object.entries(modelMetadata).map(([id, meta]) => {
            const isVisible = visibleModels[id];
            const isHovered = hoveredLine === id;
            
            return (
              <div
                key={id}
                onClick={() => toggleModel(id)}
                onMouseEnter={() => setHoveredLine(id)}
                onMouseLeave={() => setHoveredLine(null)}
                className={`p-3 rounded-2xl border-4 cursor-pointer select-none transition-all flex items-center justify-between gap-2.5 shadow-[3px_3px_0px_#000] hover:translate-y-[-2px] ${
                  isVisible 
                    ? isHovered 
                      ? "bg-black text-white border-black" 
                      : `bg-white text-black border-black`
                    : "bg-white/30 text-black/35 border-dashed border-black/25 shadow-none"
                }`}
                style={{ 
                  borderLeftColor: isVisible ? meta.color : undefined,
                  borderLeftWidth: isVisible ? "8px" : undefined
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full overflow-hidden bg-white shrink-0 flex items-center justify-center ring-2 ring-black">
                    <BotAvatar id={id} size={24} />
                  </span>
                  <div className="flex flex-col">
                    <span className="font-extrabold uppercase text-[11.5px] leading-tight">
                      {meta.label.split(" (")[0]}
                    </span>
                    <span className="text-[8.5px] opacity-60 tracking-wider font-extrabold">
                      TEAM {meta.team}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 transition-opacity">
                  {isVisible ? (
                    <Eye size={14} className="text-black group-hover:text-amber-400" />
                  ) : (
                    <EyeOff size={14} className="text-black/30" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
