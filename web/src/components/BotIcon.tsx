// Maps our arena bots to real @lobehub/icons brand avatars (correct logos + brand colors),
// replacing the placeholder image URLs. Accepts either a bot id or a display name.
import { DeepSeek, Qwen, Kimi, OpenAI, Grok, Claude } from "@lobehub/icons";

const pick = (key?: string) => {
  const k = (key || "").toLowerCase();
  if (k.includes("deep")) return DeepSeek;
  if (k.includes("qwen")) return Qwen;
  if (k.includes("kimi") || k.includes("moon")) return Kimi;
  if (k.includes("grok")) return Grok;
  if (k.includes("claude") || k.includes("anthropic")) return Claude;
  if (k.includes("gpt") || k.includes("openai")) return OpenAI;
  return OpenAI;
};

export function BotAvatar({ id, name, size = 40 }: { id?: string; name?: string; size?: number }) {
  const Icon = pick(id || name);
  return <Icon.Avatar size={size} />;
}

export function botColor(id?: string, name?: string): string {
  return (pick(id || name) as any).colorPrimary || "#888";
}
