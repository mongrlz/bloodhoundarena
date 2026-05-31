Answer in ~400 words max. Be concrete and specific — use the exact data fields named below.

PROJECT: An autonomous agent that watches Pump.fun "Coin Communities" (a social chat layer where every token has its own community) and trades the token when its community is heating up — aiming to enter BEFORE price moves and exit fast.

DATA WE HAVE (free, via the Coin Communities API):
- A GLOBAL FIREHOSE of every message across all communities (cursor-poll or websocket). Each message carries: tokenAddress, userId, username, walletAddress (when the user linked one), followerCount, likeCount, replyCount, isSpam, isHarmful, createdAt.
- /top: a ranking of communities by SOCIAL activity only — postCount, memberCount, totalLikes, latestPostAt. NOT price.
- Identity graph: look up a user by wallet address; get any user's followers/following.
- On-chain price/volume per token from a SEPARATE source (e.g. Bitquery/Solana RPC).
- We can run ANY LLM (Claude, GPT, Gemini, DeepSeek, Qwen, Kimi) as the decision brain via OpenRouter.

HARD REALITIES:
- Memecoins, thin liquidity. ~1% fee each side + priority fees + slippage. Tiny capital ($20-$100 to start).
- Social volume is SPOOFABLE: the same API lets bots post, so manufacturing fake hype is cheap.
- Brutal base rate: the large majority of these coins rug or go to zero.
- "Rented land": the API is free now but could be rate-limited or killed at any time.
- Risk preference: harvest principal at ~2x, let a small runner ride.

ANSWER THESE THREE, concretely:
1. POLICY — Design the agent's trade-decision policy using the EXACT fields above. What features do you compute from the firehose (and over what time windows), what is the specific ENTRY logic (with spoof-resistance built in using walletAddress / followerCount / isSpam / on-chain confirmation), and what is the EXIT logic?
2. FAILURE MODES — The top 3 ways this agent loses money, ranked, each with a one-line mitigation.
3. FIRST TEST — The single cheapest thing to paper-trade or measure FIRST to learn whether the edge is real, before risking any capital.
