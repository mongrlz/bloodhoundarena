// Bloodhound heat engine v0 — reads the captured firehose and ranks communities
// by spoof-resistant heat (unique wallets x velocity x credibility, spam-discounted),
// flags EMERGING ones not yet on /top, and surfaces the most active "connector" wallets
// (the precursor to the Prophet score — needs price+time to become predictive).
import { readFileSync, existsSync } from "node:fs";

const DATA = new URL("data/", import.meta.url);
const lines = readFileSync(new URL("messages.jsonl", DATA), "utf8").trim().split("\n").filter(Boolean);
const msgs = lines.map(l => JSON.parse(l));
const nowMs = Math.max(...msgs.map(m => Date.parse(m.createdAt)));
const RECENT_MIN = 15;

// latest /top snapshot -> which tokens the crowd-visible board already shows
let topSet = new Set();
if (existsSync(new URL("top-snapshots.jsonl", DATA))) {
  const snaps = readFileSync(new URL("top-snapshots.jsonl", DATA), "utf8").trim().split("\n").filter(Boolean);
  if (snaps.length) for (const c of JSON.parse(snaps.at(-1)).communities) topSet.add(c.tokenAddress);
}

const byComm = new Map();
const byWallet = new Map();
for (const m of msgs) {
  const ms = Date.parse(m.createdAt);
  let c = byComm.get(m.tokenAddress);
  if (!c) byComm.set(m.tokenAddress, c = { sym: m.tokenSymbol, n: 0, recent: 0, spam: 0, eng: 0, wallets: new Map(), minTs: ms, maxTs: ms });
  c.n++; c.eng += (m.likeCount || 0) + (m.replyCount || 0);
  if (m.isSpam || m.isHarmful) c.spam++;
  if (ms >= nowMs - RECENT_MIN * 60000) c.recent++;
  c.minTs = Math.min(c.minTs, ms); c.maxTs = Math.max(c.maxTs, ms);
  if (m.walletAddress) c.wallets.set(m.walletAddress, Math.max(c.wallets.get(m.walletAddress) || 0, m.followerCount || 0));

  if (m.walletAddress) {
    let w = byWallet.get(m.walletAddress);
    if (!w) byWallet.set(m.walletAddress, w = { n: 0, comms: new Set(), foll: 0, name: m.username });
    w.n++; w.comms.add(m.tokenAddress); w.foll = Math.max(w.foll, m.followerCount || 0); w.name = m.username;
  }
}

const score = (c) => {
  const uw = c.wallets.size;
  const spanMin = Math.max(1, (c.maxTs - c.minTs) / 60000);
  const vel = c.recent / RECENT_MIN;                                   // recent msgs/min
  const cred = [...c.wallets.values()].reduce((s, f) => s + Math.log10(1 + f), 0) / Math.max(1, uw); // avg log-followers
  const spamRate = c.spam / c.n;
  return { uw, vel, cred, spamRate, spanMin, heat: +(uw * (1 + vel) * (1 + cred) * (1 - spamRate)).toFixed(1) };
};

const ranked = [...byComm.entries()].map(([tok, c]) => ({ tok, ...c, ...score(c) }))
  .filter(r => r.uw >= 3).sort((a, b) => b.heat - a.heat);

console.log(`\n🩸 BLOODHOUND HEAT BOARD  —  ${msgs.length} msgs · ${byComm.size} communities · ${byWallet.size} wallets · recent=${RECENT_MIN}m\n`);
console.log("HEAT   SYM            UW  vel/m  cred  spam%  msgs  status");
console.log("-".repeat(72));
for (const r of ranked.slice(0, 15)) {
  const status = topSet.has(r.tok) ? "on /top" : "🆕 EMERGING";
  console.log(
    `${String(r.heat).padStart(5)}  ${(r.sym || "?").slice(0,12).padEnd(12)}  ${String(r.uw).padStart(3)}  ${r.vel.toFixed(2).padStart(5)}  ${r.cred.toFixed(2).padStart(4)}  ${(r.spamRate*100).toFixed(0).padStart(4)}  ${String(r.n).padStart(4)}  ${status}`
  );
}

console.log(`\n🐕 MOST ACTIVE "CONNECTOR" WALLETS (Prophet precursor — not yet outcome-scored)\n`);
console.log("COMMS  MSGS  FOLLOWERS  USERNAME");
console.log("-".repeat(50));
const wl = [...byWallet.values()].sort((a, b) => b.comms.size - a.comms.size || b.n - a.n);
for (const w of wl.slice(0, 12)) {
  console.log(`${String(w.comms.size).padStart(5)}  ${String(w.n).padStart(4)}  ${String(w.foll).padStart(9)}  ${w.name}`);
}
console.log();
