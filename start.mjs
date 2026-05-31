// Bloodhound Arena — single entrypoint for deploy (Railway/Render/VPS).
// Runs the whole live system in one container: firehose capture + on-chain prices +
// the AI arena scheduler + the web server. Each child auto-restarts if it crashes.
// Keys come from the host's env vars (CC_API_KEY, CC_SERVER_KEY, CC_SERVER_SECRET, OPENROUTER_API_KEY).
import { spawn } from "node:child_process";

const SERVICES = [
  { name: "capture", cmd: "node", args: ["capture.mjs", "--interval", "30"] },
  { name: "prices",  cmd: "node", args: ["prices.mjs", "--interval", "90"] },
  { name: "arena",   cmd: "node", args: ["arena.mjs", "--rounds", "1000000", "--every", "180"] },
  { name: "web",     cmd: "node", args: ["dist/server.cjs"], opts: { cwd: "web", env: { ...process.env, NODE_ENV: "production" } } },
];

function start(s) {
  const p = spawn(s.cmd, s.args, { stdio: "inherit", ...(s.opts || {}) });
  p.on("exit", (code) => {
    console.log(`[${s.name}] exited (code ${code}) — restarting in 5s`);
    setTimeout(() => start(s), 5000);
  });
  p.on("error", (e) => console.error(`[${s.name}] failed to spawn:`, e.message));
}

console.log("🩸 Bloodhound Arena — launching capture + prices + arena + web…");
SERVICES.forEach(start);
