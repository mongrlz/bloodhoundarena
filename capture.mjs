// Bloodhound capture v1 — global firehose ingestion.
// Drinks /communities/messages/server (server key) with an incremental `since` cursor,
// appends every new wallet-tagged message to data/messages.jsonl, and snapshots
// /communities/top each tick for the social-ranking time series.
// Usage: node capture.mjs [--passes N] [--interval SEC] [--top N]
import { readFileSync, writeFileSync, mkdirSync, appendFileSync, existsSync, createReadStream } from "node:fs";
import { createInterface } from "node:readline";

// --- tiny .env loader ---
try {
  for (const line of readFileSync(new URL(".env", import.meta.url), "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch {}

const { CC_API_KEY: KEY, CC_SERVER_KEY: SKEY, CC_SERVER_SECRET: SSEC } = process.env;
if (!KEY || !SKEY || !SSEC) { console.error("Missing CC_API_KEY / CC_SERVER_KEY / CC_SERVER_SECRET"); process.exit(1); }
const BASE = "https://api.coin-communities.xyz/api/v1";

const arg = (f, d) => { const i = process.argv.indexOf(f); return i > -1 ? Number(process.argv[i + 1]) : d; };
const PASSES   = arg("--passes", Infinity);
const INTERVAL = arg("--interval", 15) * 1000;
const TOP_N    = arg("--top", 30);

const DATA = new URL("data/", import.meta.url);
mkdirSync(DATA, { recursive: true });
const MSG_FILE = new URL("messages.jsonl", DATA);
const TOP_FILE = new URL("top-snapshots.jsonl", DATA);
const CUR_FILE = new URL("cursor.json", DATA);

const sleep = (ms) => new Promise(res => setTimeout(res, ms));

async function req(path, headers) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const r = await fetch(BASE + path, { headers });
    if (r.status === 429) { await sleep(1500 * (attempt + 1)); continue; }
    if (!r.ok) throw new Error(`${r.status} on ${path}`);
    return r.json();
  }
  throw new Error(`rate-limited repeatedly on ${path}`);
}
const firehose = (since) =>
  req(`/communities/messages/server?limit=500&includeReplies=true${since ? `&since=${since}` : ""}`,
      { "x-server-key": SKEY, "x-server-secret": SSEC });
const topCommunities = () =>
  req(`/communities/top?limit=${TOP_N}`, { "x-api-key": KEY });

// resume state
let cursor = existsSync(CUR_FILE) ? JSON.parse(readFileSync(CUR_FILE, "utf8")).sinceMs : 0;
const seen = new Set();
async function loadSeen() {
  if (!existsSync(MSG_FILE)) return;
  const rl = createInterface({ input: createReadStream(MSG_FILE), crlfDelay: Infinity });
  for await (const line of rl) { try { seen.add(JSON.parse(line).id); } catch {} }
  console.log(`resumed: ${seen.size} seen, cursor=${cursor || "(none)"}`);
}

const norm = (m, obsTs) => ({
  id: m.id, tokenAddress: m.tokenAddress, communityId: m.communityId,
  userId: m.userId ?? null, username: m.username, walletAddress: m.walletAddress ?? null,
  followerCount: m.followerCount ?? null, likeCount: m.likeCount, replyCount: m.replyCount,
  isSpam: m.isSpam ?? null, isHarmful: m.isHarmful ?? null, parentMessageId: m.parentMessageId ?? null,
  content: m.content ?? null, createdAt: m.createdAt, capturedAt: obsTs,
});

async function tick() {
  const obsTs = new Date().toISOString();

  // 1) top-ranking snapshot (read key)
  try {
    const { communities = [] } = await topCommunities();
    appendFileSync(TOP_FILE, JSON.stringify({ capturedAt: obsTs, communities }) + "\n");
  } catch (e) { console.warn(`  top snapshot failed: ${e.message}`); }

  // 2) drain the firehose from the cursor forward
  let newMsgs = 0, withWallet = 0, comms = new Set(), maxTs = cursor;
  for (let page = 0; page < 50; page++) {
    const { messages = [] } = await firehose(cursor || undefined);
    let fresh = 0;
    for (const m of messages) {
      const ms = Date.parse(m.createdAt);
      if (ms > maxTs) maxTs = ms;
      if (seen.has(m.id)) continue;
      seen.add(m.id); fresh++;
      appendFileSync(MSG_FILE, JSON.stringify(norm(m, obsTs)) + "\n");
      newMsgs++; comms.add(m.tokenAddress); if (m.walletAddress) withWallet++;
    }
    cursor = maxTs + 1;                       // advance past newest seen
    writeFileSync(CUR_FILE, JSON.stringify({ sinceMs: cursor }));
    if (messages.length < 500 || fresh === 0) break;  // caught up
    await sleep(150);
  }
  console.log(`[${obsTs}] +${newMsgs} msgs across ${comms.size} communities (${withWallet} w/ wallet)  total=${seen.size}`);
}

await loadSeen();
for (let i = 0; i < PASSES; i++) {
  await tick();
  if (i + 1 < PASSES) await sleep(INTERVAL);
}
