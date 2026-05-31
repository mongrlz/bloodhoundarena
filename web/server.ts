import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config({ path: path.join(process.cwd(), "..", ".env") });
dotenv.config();

const app = express();
app.use(express.json());
const PORT = Number(process.env.PORT) || 3000; // Railway/host injects PORT

// ---- Bloodhound arena data (REAL engine output) ----
const ARENA = path.join(process.cwd(), "..", "data", "arena");
const TICKERS: Record<string, string> = { kimi: "$KIMI-N1", deepseek: "$SEEK-N1", qwen: "$QWEN-N1", gpt5: "$GPT-N1", grok: "$GROK-N1", claude: "$CLDE-N1" };
const uid = (id: string) => (id === "gpt" ? "gpt5" : id);
const teamOf = (side: string) => (side?.includes("Asia") ? "ASIA" : "WEST");

function readJson(file: string): any {
  try { return JSON.parse(fs.readFileSync(path.join(ARENA, file), "utf8")); } catch { return null; }
}

// Map our real arena state.json + leaderboard.json into the UI's expected shape.
function buildState() {
  const lb = readJson("leaderboard.json");
  const st = readJson("state.json");
  if (!lb || !lb.bots?.length) return null;

  const labelTeam: Record<string, { label: string; team: string }> = {};
  const leaderboard = lb.bots.map((b: any, i: number) => {
    const id = uid(b.id);
    labelTeam[b.id] = { label: b.label, team: teamOf(b.side) };
    const lastWhy = (b.recent || []).flatMap((r: any) => r.moves || []).map((m: any) => (typeof m === "string" ? "" : m.why)).filter(Boolean).slice(-1)[0];
    return {
      id, name: b.label, rank: i + 1, team: teamOf(b.side),
      equity: b.equity, change24h: b.pnlPct, positions: b.positions,
      currentComment: lastWhy || "Scanning the board for credible wallet heat…",
      ticker: TICKERS[id] || `$${(b.label || "").toUpperCase()}-N1`,
      logoUrl: "", lastActionTime: Date.now(), marketCap: Math.round((b.equity || 0) * 1000),
      bondingCurveProgress: Math.min(99, Math.round(b.equity || 0)),
    };
  });

  // trade feed from per-bot logs (newest first)
  const events: any[] = [];
  const bots = st?.bots || {};
  for (const botId of Object.keys(bots)) {
    const meta = labelTeam[botId] || { label: botId, team: "ASIA" };
    for (const e of bots[botId].log || []) {
      for (const mv of e.moves || []) {
        const m = typeof mv === "string" ? { m: mv, why: "" } : mv;
        events.push({
          id: `${botId}-${e.round}-${events.length}`,
          traderName: meta.label, team: meta.team, traderLogo: "",
          actionText: m.m, reasoning: m.why || "",
          type: m.m?.startsWith("BUY") ? "buy" : m.m?.startsWith("SELL") ? "sell" : "info",
          timestamp: new Date(e.ts).toTimeString().split(" ")[0], _ts: e.ts,
        });
      }
    }
  }
  events.sort((a, b) => new Date(b._ts).getTime() - new Date(a._ts).getTime());

  // equity-curve history for the chart (map gpt -> gpt5)
  const history = (st?.history || []).map((h: any) => ({
    round: h.round,
    kimi: +(h.equities.kimi ?? 100).toFixed(2), deepseek: +(h.equities.deepseek ?? 100).toFixed(2),
    qwen: +(h.equities.qwen ?? 100).toFixed(2), gpt5: +(h.equities.gpt ?? 100).toFixed(2), grok: +(h.equities.grok ?? 100).toFixed(2),
    claude: +(h.equities.claude ?? 100).toFixed(2),
  }));

  const teamAsiaTotal = +leaderboard.filter((x: any) => x.team === "ASIA").reduce((s: number, x: any) => s + x.equity, 0).toFixed(2);
  const teamWestTotal = +leaderboard.filter((x: any) => x.team === "WEST").reduce((s: number, x: any) => s + x.equity, 0).toFixed(2);
  return { currentRound: lb.round || st?.round || 0, leaderboard, tradeEvents: events.slice(0, 25), history, teamAsiaTotal, teamWestTotal };
}

app.get("/api/health", (_req, res) => res.json({ status: "ok", service: "Bloodhound Arena (live engine)" }));

app.get("/api/arena/state", (_req, res) => {
  const s = buildState();
  if (!s) return res.status(503).json({ error: "arena warming up — no rounds yet" });
  res.json(s);
});

// The "battle" button re-reads the live engine state (real rounds come from arena.mjs on a schedule).
app.post("/api/arena/battle", (_req, res) => {
  const s = buildState();
  if (!s) return res.status(503).json({ error: "arena warming up" });
  res.json(s);
});

app.post("/api/arena/reset", (_req, res) => res.json({ success: true, note: "reset is managed by the engine (delete data/arena/state.json)" }));

// ---- Gemini intelligence endpoint (optional; mock fallback if no key) ----
let aiClient: any = null;
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") return null;
  if (!aiClient) aiClient = new GoogleGenAI({ apiKey, httpOptions: { headers: { "User-Agent": "aistudio-build" } } });
  return aiClient;
}
app.post("/api/gemini/chat", async (req, res) => {
  const { messages } = req.body || {};
  const client = getGeminiClient();
  if (!client) return res.json({ text: "[Bloodhound Operator offline — add GEMINI_API_KEY to enable live intelligence.]", groundingDetails: null });
  try {
    const last = messages?.[messages.length - 1]?.content || "Analyze the current Bloodhound Arena standings.";
    const r = await client.models.generateContent({ model: "gemini-3.5-flash", contents: last });
    res.json({ text: r.text || "Operator timed out.", groundingDetails: null });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => res.sendFile(path.join(distPath, "index.html")));
  }
  app.listen(PORT, "0.0.0.0", () => console.log(`Bloodhound Arena (live) on http://localhost:${PORT}`));
}
startServer();
