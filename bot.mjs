// Bloodhound Telegram bot — inline-keyboard UX (tap buttons, edits in place) + command menu.
import { readFileSync } from "node:fs";
import { computeHeat } from "./heat.mjs";
import { computeProphet } from "./prophet.mjs";

try {
  for (const line of readFileSync(new URL(".env", import.meta.url), "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch {}

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!TOKEN) { console.error("Missing TELEGRAM_BOT_TOKEN"); process.exit(1); }
const API = `https://api.telegram.org/bot${TOKEN}`;

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const usd = (n) => n == null ? "  ?  " : n >= 1e6 ? `$${(n/1e6).toFixed(1)}M` : n >= 1e3 ? `$${Math.round(n/1e3)}k` : `$${Math.round(n)}`;
const pct = (n) => n == null ? "   " : `${n >= 0 ? "+" : ""}${n.toFixed(0)}%`;

async function tg(method, body) {
  const r = await fetch(`${API}/${method}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  return r.json();
}

// inline keyboard shown under every view
const KB = { inline_keyboard: [
  [{ text: "🔥 Heat", callback_data: "heat" }, { text: "🆕 Emerging", callback_data: "emerging" }],
  [{ text: "🎯 Calls", callback_data: "calls" }, { text: "🐕 Prophet", callback_data: "prophet" }],
  [{ text: "👛 Wallets", callback_data: "wallets" }, { text: "❓ Help", callback_data: "help" }],
] };

// ---------- views ----------
function heatMsg() {
  const { totals, board } = computeHeat({ recentMin: 15, limit: 12 });
  if (!board.length) return "No data yet — capture is warming up. Try again in a minute.";
  let t = `🩸 <b>Bloodhound — Heat Board</b>\n<i>${totals.communities} communities · ${totals.wallets} wallets</i>\n\n<pre>#   SYM         HEAT  MCAP   5m   UW\n`;
  board.forEach((r, i) => { t += `${String(i+1).padStart(2)} ${r.emerging?"🆕":"  "}${esc((r.sym||"?").slice(0,8)).padEnd(8)} ${String(r.heat).padStart(5)} ${usd(r.marketCap).padStart(6)} ${pct(r.chgM5).padStart(4)} ${String(r.uw).padStart(3)}\n`; });
  return t + "</pre>🆕 = heating <i>before</i> /top · tap a button below";
}
function emergingMsg() {
  const { board } = computeHeat({ recentMin: 15, limit: 30 });
  const em = board.filter(r => r.emerging).slice(0, 12);
  if (!em.length) return "No emerging communities clearing the bar right now.";
  let t = `🆕 <b>Emerging — heating before /top</b>\n\n<pre>SYM         HEAT  MCAP   UW\n`;
  for (const r of em) t += `${esc((r.sym||"?").slice(0,8)).padEnd(8)} ${String(r.heat).padStart(7)} ${usd(r.marketCap).padStart(6)} ${String(r.uw).padStart(3)}\n`;
  return t + "</pre>";
}
function callsMsg() {
  const { summary: s, calls } = computeProphet();
  let t = `🎯 <b>Graded Calls</b>\n<i>track record: ${s.wins}/${s.graded}` + (s.winRate != null ? ` (${(100*s.winRate).toFixed(0)}%)` : "") + (s.median != null ? ` · median ${s.median>0?"+":""}${s.median}%` : "") + `</i>\n<i>${s.derived} derived · ${s.priced} priced · sharpening hourly</i>\n\n<pre>SYM         CALL   ret%   age   grade\n`;
  for (const c of calls.slice(0, 12)) t += `${esc((c.sym||"?").slice(0,9)).padEnd(9)} ${new Date(c.callTime).toISOString().slice(11,16)}  ${(c.ret==null?"-":String(c.ret)).padStart(5)}  ${(c.ageMin==null?"-":c.ageMin+"m").padStart(4)}  ${c.grade}\n`;
  return t + "</pre>A call fires when 5 credible wallets crowd a community; graded forward on-chain.";
}
function prophetMsg() {
  const { prophets } = computeProphet();
  if (!prophets.length) return "No graded calls yet — Prophet scores need wins/losses to accrue.";
  let t = `🐕 <b>Prophet Wallets</b> <i>(hit-rate on calls they were early to)</i>\n\n<pre>HIT%  N   WALLET         USER\n`;
  for (const p of prophets.slice(0, 12)) t += `${(100*p.hitRate).toFixed(0).padStart(3)}% ${String(p.n).padStart(2)}   ${p.w.slice(0,12)}  ${esc((p.name||"?").slice(0,12))}\n`;
  return t + "</pre><i>thin sample — sharpens as the track record grows</i>";
}
function walletsMsg() {
  const { wallets } = computeHeat({ limit: 12 });
  if (!wallets.length) return "No wallet data yet.";
  let t = `👛 <b>Connector wallets</b> <i>(active across communities)</i>\n\n<pre>COMMS MSGS  FOLLOWERS  USER\n`;
  for (const w of wallets) t += `${String(w.comms).padStart(5)} ${String(w.n).padStart(4)} ${String(w.foll).padStart(9)}  ${esc((w.name||"?").slice(0,12))}\n`;
  return t + "</pre>";
}
const HELP = "🩸 <b>Bloodhound</b> — live intelligence on Pump.fun Coin Communities.\n\nTap the buttons below to navigate:\n🔥 <b>Heat</b> — hottest communities now\n🆕 <b>Emerging</b> — heating before /top\n🎯 <b>Calls</b> — graded calls + track record\n🐕 <b>Prophet</b> — top wallets by hit-rate\n👛 <b>Wallets</b> — most active connectors";

function viewFor(key) {
  switch (key) {
    case "heat": return heatMsg();
    case "emerging": return emergingMsg();
    case "calls": return callsMsg();
    case "prophet": return prophetMsg();
    case "wallets": return walletsMsg();
    default: return HELP;
  }
}

const send = (chat_id, text) => tg("sendMessage", { chat_id, text, parse_mode: "HTML", disable_web_page_preview: true, reply_markup: KB });

async function onMessage(msg) {
  const key = (msg.text || "").trim().toLowerCase().replace(/^\//, "").split("@")[0].split(" ")[0];
  await send(msg.chat.id, viewFor(["heat","emerging","calls","prophet","wallets"].includes(key) ? key : "help"));
}
async function onCallback(cq) {
  const text = viewFor(cq.data);
  await tg("editMessageText", { chat_id: cq.message.chat.id, message_id: cq.message.message_id, text, parse_mode: "HTML", disable_web_page_preview: true, reply_markup: KB }).catch(() => {});
  await tg("answerCallbackQuery", { callback_query_id: cq.id });
}

// register the native command menu (the "/" / Menu button)
await tg("setMyCommands", { commands: [
  { command: "heat", description: "🔥 Hottest communities now" },
  { command: "emerging", description: "🆕 Heating before /top" },
  { command: "calls", description: "🎯 Graded calls + track record" },
  { command: "prophet", description: "🐕 Top prophet wallets" },
  { command: "wallets", description: "👛 Active connector wallets" },
  { command: "help", description: "❓ How it works" },
] });

console.log("Bloodhound bot polling (inline UX)…");
let offset = 0;
for (;;) {
  try {
    const { result = [] } = await tg("getUpdates", { offset, timeout: 30 });
    for (const u of result) {
      offset = u.update_id + 1;
      if (u.message?.text) onMessage(u.message).catch(e => console.warn(e.message));
      else if (u.callback_query) onCallback(u.callback_query).catch(e => console.warn(e.message));
    }
  } catch (e) { console.warn("poll error:", e.message); await new Promise(r => setTimeout(r, 2000)); }
}
