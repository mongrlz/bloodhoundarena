// Minimal multi-model "council" over OpenRouter.
// Usage: node council.mjs <prompt-file> [--save]
// Fans one prompt out to a fixed roster in parallel, prints each reply, reports spend.
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";

// tiny .env loader (no deps)
try {
  for (const line of readFileSync(new URL(".env", import.meta.url), "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch {}

const KEY = process.env.OPENROUTER_API_KEY;
if (!KEY) { console.error("Missing OPENROUTER_API_KEY"); process.exit(1); }

const ROSTER = [
  { label: "GPT-5.4",         model: "openai/gpt-5.4" },
  { label: "Gemini 3.1 Pro",  model: "google/gemini-3.1-pro-preview" },
  { label: "DeepSeek V4 Pro",  model: "deepseek/deepseek-v4-pro" },
  { label: "Qwen3.7 Max",     model: "qwen/qwen3.7-max" },
  { label: "Kimi K2.5",       model: "moonshotai/kimi-k2.5" },
  { label: "Grok 4.3",        model: "x-ai/grok-4.3" },
];

const promptFile = process.argv[2];
const save = process.argv.includes("--save");
if (!promptFile) { console.error("Usage: node council.mjs <prompt-file> [--save]"); process.exit(1); }
const userPrompt = readFileSync(promptFile, "utf8");

const SYSTEM = "You are one expert voice on a multi-model advisory council for a solo crypto-trading founder. " +
  "Be concrete, specific, and opinionated. No hedging, no filler, no restating the question. Obey the word limit.";

async function ask({ label, model }) {
  const t0 = Date.now();
  try {
    const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: [{ role: "system", content: SYSTEM }, { role: "user", content: userPrompt }],
        max_tokens: 4000,
        temperature: 0.7,
        usage: { include: true },
      }),
    });
    const j = await r.json();
    if (j.error) return { label, model, error: j.error.message || JSON.stringify(j.error) };
    const text = j.choices?.[0]?.message?.content ?? "(empty)";
    const cost = j.usage?.cost ?? null;
    return { label, model, text, cost, ms: Date.now() - t0 };
  } catch (e) {
    return { label, model, error: String(e) };
  }
}

const results = await Promise.all(ROSTER.map(ask));
let total = 0;
for (const x of results) {
  console.log("\n" + "=".repeat(70) + `\n### ${x.label}  (${x.model})` +
    (x.cost != null ? `  — $${x.cost.toFixed(4)}, ${x.ms}ms` : "") + "\n" + "=".repeat(70));
  console.log(x.error ? "ERROR: " + x.error : x.text);
  if (x.cost) total += x.cost;
}
console.log("\n" + "-".repeat(70) + `\nTOTAL SPEND THIS ROUND: ~$${total.toFixed(4)}`);

if (save) {
  mkdirSync(new URL("council-output/", import.meta.url), { recursive: true });
  const f = new URL(`council-output/round-${Date.now()}.json`, import.meta.url);
  writeFileSync(f, JSON.stringify({ promptFile, userPrompt, results }, null, 2));
  console.log("Saved:", f.pathname);
}
