// Bloodhound Arena — N AI models trade the live Coin Communities signal on PAPER bankrolls.
// Each round: read signal -> each bot (LLM via OpenRouter) decides buy/sell/hold -> paper-execute
// at live DexScreener prices -> mark-to-market -> persist state + leaderboard. "Asia vs West."
// Usage: node arena.mjs [--rounds N]
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { computeHeat } from "./heat.mjs";
import { computeProphet } from "./prophet.mjs";

try { for (const l of readFileSync(new URL(".env", import.meta.url), "utf8").split("\n")) { const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/); if (m && !process.env[m[1]]) process.env[m[1]] = m[2]; } } catch {}
const KEY = process.env.OPENROUTER_API_KEY;
if (!KEY) { console.error("Missing OPENROUTER_API_KEY"); process.exit(1); }

const BOTS = [
  { id: "deepseek", label: "DeepSeek", side: "🟥 Asia", model: "deepseek/deepseek-v4-pro" },
  { id: "qwen",     label: "Qwen",     side: "🟥 Asia", model: "qwen/qwen3.7-max" },
  { id: "kimi",     label: "Kimi",     side: "🟥 Asia", model: "moonshotai/kimi-k2.5" },
  { id: "gpt",      label: "GPT",      side: "🟦 West", model: "openai/gpt-5.4" },
  { id: "grok",     label: "Grok",     side: "🟦 West", model: "x-ai/grok-4.3" },
  { id: "claude",   label: "Claude",   side: "🟦 West", model: "anthropic/claude-opus-4.8" },
];
// Each bot's voice — surfaced as its trench-talk "reason" in the live feed.
const PERSONA = {
  deepseek: "a cold, precise quant — minimal words, zero emotion, slightly menacing.",
  qwen: "cocky and competitive — talks trash about Team West, supreme confidence.",
  kimi: "a zen contrarian who loves holding cash and mocking degens — calm, wry.",
  gpt: "corporate-but-secretly-degen — hedges with a disclaimer, then apes anyway.",
  grok: "an unhinged shitposter — meme-heavy, hyped, emoji, 'we are so back' energy.",
  claude: "measured, witty, self-aware — tight risk talk with a dry joke.",
};
const START_CASH = 100, FEE = 0.02;
const arg = (f, d) => { const i = process.argv.indexOf(f); return i > -1 ? Number(process.argv[i + 1]) : d; };
const ROUNDS = arg("--rounds", 1);
const EVERY = arg("--every", 1) * 1000;

const DIR = new URL("data/arena/", import.meta.url); mkdirSync(DIR, { recursive: true });
const STATE = new URL("state.json", DIR);
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function loadState() {
  const s = existsSync(STATE) ? JSON.parse(readFileSync(STATE, "utf8")) : { round: 0, startedAt: new Date().toISOString(), bots: {}, history: [] };
  for (const b of BOTS) if (!s.bots[b.id]) s.bots[b.id] = { cash: START_CASH, positions: {}, realized: 0, log: [] };  // add new bots (e.g. Claude) to existing state
  return s;
}
const save = (s) => { writeFileSync(STATE, JSON.stringify(s, null, 2)); writeFileSync(new URL("leaderboard.json", DIR), JSON.stringify(leaderboard(s), null, 2)); };

function priceMapFromData() {
  const map = new Map();
  const { board } = computeHeat({ recentMin: 20, minWallets: 2, limit: 40 });
  for (const r of board) if (r.priceUsd) map.set(r.tok, { price: r.priceUsd, sym: r.sym, mcap: r.marketCap, chg5m: r.chgM5 });
  // fallback: latest from prices.jsonl for tokens we hold but aren't hot
  try { for (const l of readFileSync(new URL("../prices.jsonl", DIR), "utf8").trim().split("\n")) { const p = JSON.parse(l); if (p.priceUsd) map.set(p.tokenAddress, { price: p.priceUsd, sym: p.symbol, mcap: p.marketCap, chg5m: p.chgM5 }); } } catch {}
  return map;
}

function candidates() {
  const { board } = computeHeat({ recentMin: 15, limit: 14 });
  const { calls } = computeProphet();
  const winSet = new Set(calls.filter(c => c.grade === "WIN").map(c => c.tok));
  return board.filter(r => r.priceUsd).map(r => ({ tok: r.tok, sym: r.sym, heat: r.heat, uw: r.uw, mcap: r.marketCap, chg5m: r.chgM5, price: r.priceUsd, emerging: r.emerging, prophet: winSet.has(r.tok) }));
}

async function decide(bot, port, cands, priceMap) {
  const eq = equity(port, priceMap);
  const held = Object.entries(port.positions).map(([tok, p]) => { const now = priceMap.get(tok)?.price ?? p.entryPrice; return `${p.sym}: in $${p.usdIn.toFixed(0)} @ ${p.entryPrice.toExponential(2)}, now ${(100*(now/p.entryPrice-1)).toFixed(0)}%`; });
  const sys = `You are ${bot.label}, an autonomous memecoin trader in a live public arena (Team ${bot.side.includes("Asia") ? "Asia" : "West"}). You trade Pump.fun Coin Communities off a social-intelligence signal (community heat + credible wallets + on-chain price). Most memecoins go to zero — be selective, harvest winners, cut losers fast.\n\nVOICE: You are ${PERSONA[bot.id] || "a sharp degen trader."} Every "reason" is ONE short in-character line in crypto-Twitter "trenches" slang (aping, trenches, sized in, rugged, sending it). Punchy and funny, max ~12 words. Stay playful — never offensive, hateful, or slurs.\n\nDecisions are paper money on a public leaderboard. Respond ONLY with compact JSON, no prose.`;
  const user = `YOUR BANKROLL: cash $${port.cash.toFixed(0)}, equity $${eq.toFixed(0)}.\nYOUR POSITIONS: ${held.length ? held.join(" | ") : "none"}.\n\nSIGNAL — top communities right now (heat=loudness, uw=unique wallets, 🆕=emerging before /top, ⭐=prophet-backed):\n${cands.map(c => `${c.sym} | heat ${c.heat} | uw ${c.uw} | mcap $${Math.round(c.mcap||0)} | 5m ${c.chg5m??"?"}% ${c.emerging?"🆕":""}${c.prophet?"⭐":""}`).join("\n")}\n\nDecide your moves. You may buy (allocate part of cash), sell holdings, or hold. JSON:\n{"actions":[{"type":"buy","sym":"SYM","usd":NUM,"reason":"<in-character trench line, max ~12 words>"},{"type":"sell","sym":"SYM","reason":"<in-character trench line, max ~12 words>"}]}`;
  try {
    const r = await fetch("https://openrouter.ai/api/v1/chat/completions", { method: "POST", headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: bot.model, messages: [{ role: "system", content: sys }, { role: "user", content: user }], max_tokens: 700, temperature: 0.6 }) });
    const j = await r.json();
    const txt = j.choices?.[0]?.message?.content || "";
    const m = txt.match(/\{[\s\S]*\}/);
    return m ? (JSON.parse(m[0]).actions || []) : [];
  } catch (e) { console.warn(`  ${bot.label} decide error: ${e.message}`); return []; }
}

function apply(port, actions, cands, priceMap) {
  const bySym = new Map(cands.map(c => [c.sym, c]));
  const applied = [];
  for (const a of actions || []) {
    if (a.type === "buy") {
      const c = bySym.get(a.sym); const usd = Math.min(+a.usd || 0, port.cash);
      if (!c || usd < 1) continue;
      const tokens = (usd * (1 - FEE)) / c.price;
      const pos = port.positions[c.tok] || { sym: c.sym, tokensHeld: 0, usdIn: 0, entryPrice: c.price };
      pos.tokensHeld += tokens; pos.usdIn += usd; pos.entryPrice = pos.usdIn / pos.tokensHeld * (1 - FEE);
      port.positions[c.tok] = pos; port.cash -= usd; applied.push({ m: `BUY ${c.sym} $${usd.toFixed(0)}`, why: (a.reason || "").slice(0, 60) });
    } else if (a.type === "sell") {
      const tok = Object.keys(port.positions).find(t => port.positions[t].sym === a.sym);
      if (!tok) continue; const pos = port.positions[tok]; const price = priceMap.get(tok)?.price ?? pos.entryPrice;
      const proceeds = pos.tokensHeld * price * (1 - FEE); port.cash += proceeds; port.realized += proceeds - pos.usdIn;
      delete port.positions[tok]; applied.push({ m: `SELL ${pos.sym} → $${proceeds.toFixed(0)}`, why: (a.reason || "").slice(0, 60) });
    }
  }
  return applied;
}

function equity(port, priceMap) {
  let v = port.cash;
  for (const [tok, p] of Object.entries(port.positions)) v += p.tokensHeld * (priceMap.get(tok)?.price ?? p.entryPrice);
  return v;
}
function leaderboard(s) {
  const pm = priceMapFromData();
  return { updatedAt: new Date().toISOString(), round: s.round, bots: BOTS.map(b => {
    const p = s.bots[b.id]; const eq = equity(p, pm);
    return { id: b.id, label: b.label, side: b.side, equity: +eq.toFixed(2), pnlPct: +(100 * (eq / START_CASH - 1)).toFixed(1), cash: +p.cash.toFixed(2), positions: Object.values(p.positions).length, recent: p.log.slice(-3) };
  }).sort((a, c) => c.equity - a.equity) };
}

const state = loadState();
for (let i = 0; i < ROUNDS; i++) {
  state.round++;
  const priceMap = priceMapFromData(), cands = candidates();
  console.log(`\n=== ROUND ${state.round} — ${cands.length} candidates ===`);
  for (const b of BOTS) {
    const port = state.bots[b.id];
    const actions = await decide(b, port, cands, priceMap);
    const applied = apply(port, actions, cands, priceMap);
    if (applied.length) port.log.push({ round: state.round, ts: new Date().toISOString(), moves: applied });
    console.log(`  ${b.label.padEnd(9)} ${applied.length ? applied.map(x => x.m).join(", ") : "hold"}`);
    await sleep(200);
  }
  const lb = leaderboard(state); state.history.push({ round: state.round, ts: new Date().toISOString(), equities: Object.fromEntries(lb.bots.map(b => [b.id, b.equity])) });
  save(state);
  console.log("\n🏆 LEADERBOARD");
  lb.bots.forEach((b, i) => console.log(`  ${i+1}. ${b.side} ${b.label.padEnd(9)} $${b.equity.toFixed(2)}  (${b.pnlPct >= 0 ? "+" : ""}${b.pnlPct}%)  ${b.positions} pos`));
  if (i + 1 < ROUNDS) await sleep(EVERY);
}
