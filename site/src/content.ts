// All visible site copy. Kept in one place so tests/copy.test.mjs can check it for forbidden claims.

export const OMER_UNIT = "1 OMER = 1 IU = 750k input + 250k output tokens of a tier's reference model";
export const CHAIN_MESSAGE = "Testnet rehearsal on HyperEVM testnet (chain 998) with labelled TEST mocks. Unaudited. Nothing deployed. No token exists.";

export const links = {
  stableswap: "https://github.com/HuKiFl1/inferencefi-stableswap",
  flop: "https://github.com/HuKiFl1/Flop",
  whitepaper: "https://flop.network/whitepaper/",
};

export const nav = [
  { value: "how", label: "How it works", href: "#how" },
  { value: "gaps", label: "Honest gaps", href: "#gaps" },
  { value: "agents", label: "Agents", href: "#agents" },
  { value: "fair-launch", label: "Fair launch", href: "#fair-launch" },
  { value: "code", label: "Code", href: "#code" },
];

export const hero = {
  announcement: "Design preview. Read what does not exist yet",
  title: "Swap inference credits by the work they buy",
  description:
    "Inference Finance (working name) is a stableswap AMM design for FLOP and Pearl inference credits. It measures every credit in one unit of work, so an agent can swap one unit of compute for another instead of guessing a dollar price.",
  primary: "Read the pool math",
  secondary: "See how OMER works",
  meta: ["Unaudited", "Nothing deployed", "No token exists"],
};

export const omerPanel = {
  head: "1 OMER = 1 IU",
  tail: "= 750k input + 250k output tokens of a tier's reference model",
  input: "750k input tokens",
  output: "250k output tokens",
  cell: "Each cell is 25k tokens.",
};

export const steps = [
  {
    glyph: "glyph-credit",
    title: "Credits",
    body: "Providers sell inference as credits for a model tier. The design treats FLOP and Pearl inference credits for a tier as separate coins that can sit in the same pool.",
  },
  {
    glyph: "glyph-omer",
    title: "OMER",
    body: "An oracle rate turns each credit into OMER, one unit of work: 750k input plus 250k output tokens of the tier's reference model. Credits from different providers become comparable.",
  },
  {
    glyph: "glyph-pool",
    title: "Pools",
    body: "A StablePool holds credits that should trade near 1:1 in OMER, using Curve-style stableswap math. A CryptoPool holds pairs that drift, such as a credit against a cash-like numeraire. LPs hold shares, not an LP token.",
  },
  {
    glyph: "glyph-route",
    title: "Router",
    body: "The router quotes routes of up to four hops, with a deadline and a slippage limit. Every quote shows its dynamic fee and how old the rates behind it are.",
  },
] as const;

export const feeRule = {
  title: "Dynamic fee",
  description: "The fee depends on which way a trade moves the pool against the oracle price.",
  toward: { label: "Toward the oracle price", formula: "fee = base" },
  away: { label: "Away from the oracle price", formula: "fee = base + slope × deviation" },
  note: "Parameters in the screens are placeholders for review, not proposed values.",
};

export const gaps = {
  title: "What does not exist yet",
  description: "The design is ahead of the infrastructure. These gaps are real and the screens do not hide them.",
  items: [
    { title: "No credit tokens", body: "There is no on-chain FLOP or Pearl inference-credit token yet. The rehearsal uses TEST mocks whose names end in (TEST) and whose symbols start with t." },
    { title: "Placeholder rates", body: "Testnet rates are placeholders, not market prices. No tier has a published reference-model rate yet." },
    { title: "Nothing deployed", body: "The deploy script refuses every chain except HyperEVM testnet (998) and a local test chain. Nothing has been broadcast." },
    { title: "Unaudited", body: "No audit has been done and the threat model is still being written. Treat every number on this site as illustrative." },
  ],
};

export const agents = {
  title: "Built for agents and the people who run them",
  description: "The SDK, CLI and MCP tools are read-only. They list pools, quote routes, and read rates and rewards. They never sign or send.",
  points: [
    { title: "Spend caps in OMER", body: "Each agent ID has a per-epoch spend cap. Raising a cap takes effect one epoch later." },
    { title: "Attribution", body: "Swaps carry the agent ID, so fees and verified spend can be credited to the agent that paid them." },
    { title: "Humans read, nobody signs", body: "People who run agents can see quotes, pool state and earnings without connecting a wallet." },
  ],
  cli: "infer quote --from tFLOP-T2 --to tPEARL-T2 --amount 10 --slippage-bps 50 --chain 31337",
  mcp: `{
  "tool": "inference_finance_quote",
  "arguments": {
    "from": "tFLOP-T2",
    "to": "tPEARL-T2",
    "amountIn": "10",
    "slippageBps": 50,
    "deadlineSeconds": 600
  }
}`,
  output: `{
  "chainId": 31337,
  "amountIn": "10.000000",
  "amountOut": "9.958112",
  "minAmountOut": "9.908321",
  "route": [
    { "pool": "stable-t2", "kind": "StablePool", "from": "tFLOP-T2", "to": "tPEARL-T2" }
  ],
  "fee": { "direction": "toward", "baseBps": 4, "effectiveBps": 4 },
  "rates": { "tFLOP-T2": "0.9700", "tPEARL-T2": "0.9740", "ageSeconds": 48 },
  "deadline": 600,
  "placeholder": true
}`,
  outputNote: "Example output against a local rehearsal with TEST mocks. Rates are placeholders.",
};

export const fairLaunch = {
  title: "Fair launch, by design",
  description: "If a reward token ever launches, it goes to the agents and LPs who used the protocol. Nobody gets it for free.",
  alertTitle: "Testnet and unaudited",
  alertBody: "This describes a design, not an offer. The reward token (TBD) has no name, ticker or supply. It does not exist and is not for sale, and launching it would need a separate decision.",
  rules: [
    { title: "No premine", body: "Nothing is minted before the protocol is used." },
    { title: "No team allocation", body: "The people who build it earn the same way as everyone else, or not at all." },
  ],
  streams: [
    { key: "spend", title: "Verified spend", body: "Inference an agent actually consumed, attested by a settler." },
    { key: "lp", title: "Liquidity", body: "Time-weighted shares held in a pool." },
    { key: "fees", title: "Fees paid", body: "Swap fees the agent paid, not volume it generated." },
  ],
  later: "Gauge voting and an optional ve-lock are a later state, not part of the first design.",
};

export const faq = [
  { id: "token", question: "Is there a token?", answer: "No. The reward token (TBD) is a placeholder in the design. It has no name, ticker or supply, it is not for sale, and nothing here is an offer." },
  { id: "live", question: "Can I use it today?", answer: "No. Nothing is deployed. The plan is a testnet rehearsal on HyperEVM testnet (chain 998) with labelled TEST mocks, and that has not been broadcast." },
  { id: "flop", question: "Does FLOP run the AMM?", answer: "No. FLOP and Pearl are where the inference credits come from. The AMM is a separate protocol, rehearsed on HyperEVM testnet." },
  { id: "omer", question: "Why price credits in OMER?", answer: "Inference credits are claims on work. Measuring them in tokens of a tier's reference model keeps a swap about compute, and avoids guessing a dollar price for each provider." },
  { id: "stale", question: "What happens when rates go stale?", answer: "Swaps that depend on a stale rate are disabled. Proportional exits never need a rate, so LPs can always withdraw their share, even when a pool is paused." },
  { id: "audit", question: "Has it been audited?", answer: "No. Do not treat any of it as safe for real funds." },
];

export const repos = [
  { title: "inferencefi-stableswap", description: "Deterministic StableSwap pool math in TypeScript: quotes, liquidity paths and rounding that always favours the pool.", href: links.stableswap, label: "Open repository" },
  { title: "Flop", description: "A TypeScript library for the escrow reclaim rule on stale paid-compute channels, used for backed credits.", href: links.flop, label: "Open repository" },
  { title: "FLOP whitepaper", description: "Background on the FLOP Network, one of the two sources of inference credits in the design.", href: links.whitepaper, label: "Read whitepaper" },
];

export const footer = {
  tagline: "A design preview by HuKiFl1. Not live, not audited, not an offer.",
  status: "Testnet rehearsal only",
};
