// Shared heat engine — reads captured data and returns ranked communities + connector wallets,
// enriched with on-chain price. Used by analyze.mjs (CLI) and bot.mjs (Telegram).
import { readFileSync, existsSync } from "node:fs";

const DATA = new URL("data/", import.meta.url);
const readJsonl = (name) => {
  const f = new URL(name, DATA);
  if (!existsSync(f)) return [];
  return readFileSync(f, "utf8").trim().split("\n").filter(Boolean).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
};

export function computeHeat({ recentMin = 15, minWallets = 3, limit = 12 } = {}) {
  const msgs = readJsonl("messages.jsonl");
  if (!msgs.length) return { totals: { msgs: 0, communities: 0, wallets: 0 }, board: [], wallets: [] };
  const nowMs = Math.max(...msgs.map(m => Date.parse(m.createdAt)));

  // enrichment maps from prices + top snapshot
  const prices = readJsonl("prices.jsonl");
  const priceMap = new Map();                       // tokenAddress -> latest price row
  for (const p of prices) priceMap.set(p.tokenAddress, p);
  const symMap = new Map();
  for (const p of prices) if (p.symbol) symMap.set(p.tokenAddress, p.symbol);
  const topSnaps = readJsonl("top-snapshots.jsonl");
  const topSet = new Set();
  if (topSnaps.length) for (const c of topSnaps.at(-1).communities) { topSet.add(c.tokenAddress); if (c.tokenSymbol) symMap.set(c.tokenAddress, c.tokenSymbol); }

  const byComm = new Map(), byWallet = new Map();
  for (const m of msgs) {
    const ms = Date.parse(m.createdAt);
    let c = byComm.get(m.tokenAddress);
    if (!c) byComm.set(m.tokenAddress, c = { n: 0, recent: 0, spam: 0, eng: 0, wallets: new Map(), minTs: ms, maxTs: ms });
    c.n++; c.eng += (m.likeCount || 0) + (m.replyCount || 0);
    if (m.isSpam || m.isHarmful) c.spam++;
    if (ms >= nowMs - recentMin * 60000) c.recent++;
    c.minTs = Math.min(c.minTs, ms); c.maxTs = Math.max(c.maxTs, ms);
    if (m.walletAddress) c.wallets.set(m.walletAddress, Math.max(c.wallets.get(m.walletAddress) || 0, m.followerCount || 0));
    if (m.walletAddress) {
      let w = byWallet.get(m.walletAddress);
      if (!w) byWallet.set(m.walletAddress, w = { n: 0, comms: new Set(), foll: 0, name: m.username });
      w.n++; w.comms.add(m.tokenAddress); w.foll = Math.max(w.foll, m.followerCount || 0); w.name = m.username;
    }
  }

  const board = [...byComm.entries()].map(([tok, c]) => {
    const uw = c.wallets.size;
    const vel = c.recent / recentMin;
    const cred = [...c.wallets.values()].reduce((s, f) => s + Math.log10(1 + f), 0) / Math.max(1, uw);
    const spamRate = c.spam / c.n;
    const pr = priceMap.get(tok) || {};
    return {
      tok, sym: symMap.get(tok) || "?", heat: +(uw * (1 + vel) * (1 + cred) * (1 - spamRate)).toFixed(1),
      uw, vel, cred, spamRate, n: c.n,
      emerging: !topSet.has(tok),
      priceUsd: pr.priceUsd ?? null, marketCap: pr.marketCap ?? null, chgM5: pr.chgM5 ?? null, chgH1: pr.chgH1 ?? null,
    };
  }).filter(r => r.uw >= minWallets).sort((a, b) => b.heat - a.heat).slice(0, limit);

  const wallets = [...byWallet.entries()].map(([addr, w]) => ({ addr, name: w.name, comms: w.comms.size, n: w.n, foll: w.foll }))
    .sort((a, b) => b.comms - a.comms || b.n - a.n).slice(0, limit);

  return { totals: { msgs: msgs.length, communities: byComm.size, wallets: byWallet.size }, board, wallets };
}
