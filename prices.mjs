// Bloodhound price joiner v0 — the on-chain ground-truth layer.
// For every community we've seen chatter in recently, snapshot DexScreener
// (free, no key): price, mcap, liquidity, 5m volume, 5m buys/sells, price change.
// Appends to data/prices.jsonl so we can join social->price for lead-time + outcome labels.
// Usage: node prices.mjs [--passes N] [--interval SEC] [--lookback H]
import { readFileSync, existsSync, mkdirSync, appendFileSync } from "node:fs";

const arg = (f, d) => { const i = process.argv.indexOf(f); return i > -1 ? Number(process.argv[i + 1]) : d; };
const PASSES   = arg("--passes", Infinity);
const INTERVAL = arg("--interval", 60) * 1000;
const LOOKBACK = arg("--lookback", 3) * 3600000;

const DATA = new URL("data/", import.meta.url);
mkdirSync(DATA, { recursive: true });
const MSG_FILE = new URL("messages.jsonl", DATA);
const TOP_FILE = new URL("top-snapshots.jsonl", DATA);
const PRICE_FILE = new URL("prices.jsonl", DATA);

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const chunk = (a, n) => Array.from({ length: Math.ceil(a.length / n) }, (_, i) => a.slice(i * n, i * n + n));

// which tokens to track: distinct communities with recent chatter + current /top
function trackedTokens() {
  const set = new Set();
  if (existsSync(MSG_FILE)) {
    const lines = readFileSync(MSG_FILE, "utf8").trim().split("\n").filter(Boolean);
    const nowMs = Math.max(...lines.map(l => { try { return Date.parse(JSON.parse(l).createdAt); } catch { return 0; } }));
    for (const l of lines) { try { const m = JSON.parse(l); if (Date.parse(m.createdAt) >= nowMs - LOOKBACK) set.add(m.tokenAddress); } catch {} }
  }
  if (existsSync(TOP_FILE)) {
    const snaps = readFileSync(TOP_FILE, "utf8").trim().split("\n").filter(Boolean);
    if (snaps.length) for (const c of JSON.parse(snaps.at(-1)).communities) set.add(c.tokenAddress);
  }
  return [...set];
}

async function dexBatch(addrs) {
  const r = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${addrs.join(",")}`);
  if (!r.ok) throw new Error(`dexscreener ${r.status}`);
  const { pairs = [] } = await r.json();
  // a token can have multiple pairs — keep the most-liquid one per token
  const best = new Map();
  for (const p of pairs) {
    const a = p.baseToken?.address; if (!a) continue;
    const liq = p.liquidity?.usd || 0;
    if (!best.has(a) || liq > best.get(a).liquidity?.usd) best.set(a, p);
  }
  return best;
}

async function tick() {
  const obsTs = new Date().toISOString();
  const tokens = trackedTokens();
  if (!tokens.length) { console.log("no tokens yet"); return; }
  let wrote = 0;
  for (const grp of chunk(tokens, 30)) {
    try {
      const best = await dexBatch(grp);
      for (const [addr, p] of best) {
        appendFileSync(PRICE_FILE, JSON.stringify({
          tokenAddress: addr, symbol: p.baseToken?.symbol ?? null,
          priceUsd: p.priceUsd ? +p.priceUsd : null,
          marketCap: p.marketCap ?? p.fdv ?? null,
          liquidityUsd: p.liquidity?.usd ?? null,
          vol5m: p.volume?.m5 ?? null, vol1h: p.volume?.h1 ?? null,
          chgM5: p.priceChange?.m5 ?? null, chgH1: p.priceChange?.h1 ?? null,
          buys5m: p.txns?.m5?.buys ?? null, sells5m: p.txns?.m5?.sells ?? null,
          pairCreatedAt: p.pairCreatedAt ?? null, capturedAt: obsTs,
        }) + "\n");
        wrote++;
      }
    } catch (e) { console.warn(`  batch failed: ${e.message}`); }
    await sleep(250);
  }
  console.log(`[${obsTs}] tracked ${tokens.length} tokens, priced ${wrote}`);
}

for (let i = 0; i < PASSES; i++) {
  await tick();
  if (i + 1 < PASSES) await sleep(INTERVAL);
}
