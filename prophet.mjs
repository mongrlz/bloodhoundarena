// Bloodhound Prophet engine — the IP layer. Exports computeProphet() for the bot; prints a report when run directly.
// 1) Derives a CALL per community = the moment N distinct (non-spam) wallets had shown up.
// 2) Grades each call forward using the on-chain price series (DexScreener snapshots).
// 3) Scores wallets by hit-rate on the calls they were early to (the Prophet score).
// Deterministic from raw data, so re-running re-grades as more price history accrues.
import { readFileSync, existsSync, writeFileSync } from "node:fs";

const DATA = new URL("data/", import.meta.url);
const readJsonl = (n) => { const f = new URL(n, DATA); return existsSync(f) ? readFileSync(f, "utf8").trim().split("\n").filter(Boolean).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean) : []; };

export function computeProphet({ nTrigger = 5, win = 0.20, loss = -0.20 } = {}) {
  const msgs = readJsonl("messages.jsonl");
  const prices = readJsonl("prices.jsonl");

  const pSeries = new Map(), symMap = new Map();
  for (const p of prices.sort((a, b) => Date.parse(a.capturedAt) - Date.parse(b.capturedAt))) {
    if (p.priceUsd == null) continue;
    if (!pSeries.has(p.tokenAddress)) pSeries.set(p.tokenAddress, []);
    pSeries.get(p.tokenAddress).push({ ts: Date.parse(p.capturedAt), price: p.priceUsd });
    if (p.symbol) symMap.set(p.tokenAddress, p.symbol);
  }
  const byTok = new Map();
  for (const m of msgs) { if (!byTok.has(m.tokenAddress)) byTok.set(m.tokenAddress, []); byTok.get(m.tokenAddress).push(m); }

  const calls = [];
  for (const [tok, list] of byTok) {
    list.sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
    const seen = new Set(); let callTime = null;
    for (const m of list) {
      if (m.isSpam || m.isHarmful || !m.walletAddress) continue;
      seen.add(m.walletAddress);
      if (seen.size >= nTrigger) { callTime = Date.parse(m.createdAt); break; }
    }
    if (callTime == null) continue;
    const earlyWallets = [...seen];
    const series = pSeries.get(tok);
    let entry = null, latest = null, entryLagMin = null;
    if (series?.length) {
      entry = series.find(s => s.ts >= callTime) || null;
      if (entry) { entryLagMin = (entry.ts - callTime) / 60000; latest = series.filter(s => s.ts > entry.ts).at(-1) || null; }
    }
    let ret = null, ageMin = null, grade = "UNPRICED";
    if (entry && latest) { ret = latest.price / entry.price - 1; ageMin = (latest.ts - entry.ts) / 60000; grade = ret >= win ? "WIN" : ret <= loss ? "LOSS" : "OPEN"; }
    else if (entry) grade = "OPEN";
    calls.push({ tok, sym: symMap.get(tok) || "?", callTime, nEarly: earlyWallets.length, earlyWallets,
      entryPrice: entry?.price ?? null, entryLagMin: entryLagMin == null ? null : +entryLagMin.toFixed(1),
      ret: ret == null ? null : +(ret * 100).toFixed(1), ageMin: ageMin == null ? null : +ageMin.toFixed(0), grade });
  }
  calls.sort((a, b) => b.callTime - a.callTime);

  const wstat = new Map();
  for (const c of calls) {
    if (c.grade !== "WIN" && c.grade !== "LOSS") continue;
    for (const w of c.earlyWallets) { if (!wstat.has(w)) wstat.set(w, { hits: 0, miss: 0 }); c.grade === "WIN" ? wstat.get(w).hits++ : wstat.get(w).miss++; }
  }
  const nameOf = new Map(msgs.filter(m => m.walletAddress).map(m => [m.walletAddress, m.username]));
  const prophets = [...wstat.entries()].map(([w, s]) => ({ w, name: nameOf.get(w) || "?", n: s.hits + s.miss, hitRate: s.hits / (s.hits + s.miss) }))
    .filter(p => p.n >= 1).sort((a, b) => b.hitRate - a.hitRate || b.n - a.n);

  const graded = calls.filter(c => c.grade === "WIN" || c.grade === "LOSS");
  const wins = graded.filter(c => c.grade === "WIN").length;
  const rets = graded.map(c => c.ret).sort((a, b) => a - b);
  const summary = { derived: calls.length, priced: calls.filter(c => c.entryPrice != null).length, graded: graded.length,
    wins, winRate: graded.length ? wins / graded.length : null, median: rets.length ? rets[Math.floor(rets.length / 2)] : null };

  try { writeFileSync(new URL("calls.json", DATA), JSON.stringify({ generatedAt: new Date().toISOString(), summary, calls, prophets }, null, 2)); } catch {}
  return { summary, calls, prophets };
}

// ---- CLI report ----
if (process.argv[1]?.endsWith("prophet.mjs")) {
  const { summary: s, calls, prophets } = computeProphet();
  console.log(`\n🩸 PROPHET ENGINE — ${s.derived} calls | ${s.priced} priced | ${s.graded} graded`);
  console.log(`Track record: ${s.wins}/${s.graded}` + (s.winRate != null ? ` (${(100*s.winRate).toFixed(0)}%)` : "") + (s.median != null ? ` · median ${s.median>0?"+":""}${s.median}%` : "") + "\n");
  console.log("SYM         CALL    ret%   age   entryLag  early grade");
  console.log("-".repeat(60));
  for (const c of calls.slice(0, 15)) console.log(`${(c.sym||"?").slice(0,10).padEnd(10)}  ${new Date(c.callTime).toISOString().slice(11,16)}  ${(c.ret==null?"-":String(c.ret)).padStart(6)}  ${(c.ageMin==null?"-":c.ageMin+"m").padStart(5)}  ${(c.entryLagMin==null?"-":c.entryLagMin+"m").padStart(7)}  ${String(c.nEarly).padStart(4)}  ${c.grade}`);
  console.log(`\n🐕 TOP PROPHET WALLETS`);
  for (const p of prophets.slice(0, 12)) console.log(`${(100*p.hitRate).toFixed(0).padStart(3)}%  n=${p.n}  ${p.w.slice(0,12)}  ${(p.name||"?").slice(0,14)}`);
  console.log(`\n(thin until price series accrues — re-run grades the same calls with more forward data)\n`);
}
