// Bloodhound Arena — tiny static server for the live leaderboard site.
// Serves public/index.html + the arena's leaderboard.json / state.json. Deploy-ready (no deps).
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";

const PORT = process.env.PORT || 8787;
const ROUTES = {
  "/": ["public/index.html", "text/html; charset=utf-8"],
  "/leaderboard.json": ["data/arena/leaderboard.json", "application/json"],
  "/state.json": ["data/arena/state.json", "application/json"],
};

createServer(async (req, res) => {
  const path = req.url.split("?")[0];
  const route = ROUTES[path];
  if (!route) { res.writeHead(404); return res.end("not found"); }
  try {
    const body = await readFile(new URL(route[0], import.meta.url));
    res.writeHead(200, { "Content-Type": route[1], "Access-Control-Allow-Origin": "*", "Cache-Control": "no-store" });
    res.end(body);
  } catch {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ bots: [], note: "no rounds yet" }));
  }
}).listen(PORT, () => console.log(`Arena site on http://localhost:${PORT}`));
