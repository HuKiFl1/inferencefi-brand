// Static mock data shaped like the read-only SDK outputs (`infer pools | quote | rates | rewards`).
// Every coin is a TEST mock, every rate is a placeholder, and nothing here came from a chain.
// Amounts are decimal strings, as an SDK would serialise bigint values for JSON.

export type PoolKind = "StablePool" | "CryptoPool";
export type PoolStatus = "active" | "rates-stale" | "paused";
export type FeeDirection = "toward" | "away";

export interface CoinInfo {
  symbol: string;
  name: string;
  source: "FLOP" | "Pearl" | "Numeraire";
  tier?: number;
}

/** `infer rates`: OMER per one unit of the coin, with the age of the oracle update. */
export interface RateInfo {
  symbol: string;
  omerPerUnit: string;
  ageSeconds: number;
  maxAgeSeconds: number;
  stale: boolean;
  placeholder: true;
}

/** `infer pools`: one entry per pool. */
export interface PoolInfo {
  id: string;
  kind: PoolKind;
  coins: string[];
  balances: string[];
  balancesOmer: string[];
  totalShares: string;
  /** StablePool amplification. */
  A?: number;
  /** CryptoPool curve parameters. */
  gamma?: string;
  fee: { baseBps: number; slopeBpsPerBps: number; maxBps: number };
  oracleDeviationBps: number;
  status: PoolStatus;
}

export interface QuoteHop {
  pool: string;
  kind: PoolKind;
  from: string;
  to: string;
  amountIn: string;
  amountOut: string;
  fee: { direction: FeeDirection; baseBps: number; slopeBpsPerBps: number; deviationBps: number; effectiveBps: number };
}

/** `infer quote`: a route of up to four hops with a deadline and slippage limit. */
export interface Quote {
  chainId: 998 | 31337;
  from: string;
  to: string;
  amountIn: string;
  amountOut: string;
  minAmountOut: string;
  slippageBps: number;
  deadlineSeconds: number;
  priceImpactBps: number;
  route: QuoteHop[];
  ratesMaxAgeSeconds: number;
  stale: boolean;
  placeholder: true;
}

export interface Position {
  pool: string;
  shares: string;
  shareOfPoolBps: number;
  underlying: string[];
}

/** `infer rewards`: per agent ID, per epoch. Points accrue toward the reward token (TBD); they are not a token. */
export interface AgentRewards {
  agentId: string;
  label: string;
  epoch: number;
  epochBlocks: number;
  blocksLeft: number;
  spendCap: { capOmer: string; spentOmer: string; pendingCapOmer: string; pendingFromEpoch: number };
  spendByCoin: { symbol: string; omer: string }[];
  streams: { spend: string; lp: string; fees: string };
  history: { epoch: number; spendOmer: string }[];
  gauge: { status: "later" };
  veLock: { status: "later" };
}

export const coins: Record<string, CoinInfo> = {
  "tFLOP-T1": { symbol: "tFLOP-T1", name: "FLOP tier 1 credit (TEST)", source: "FLOP", tier: 1 },
  "tPEARL-T1": { symbol: "tPEARL-T1", name: "Pearl tier 1 credit (TEST)", source: "Pearl", tier: 1 },
  "tFLOP-T2": { symbol: "tFLOP-T2", name: "FLOP tier 2 credit (TEST)", source: "FLOP", tier: 2 },
  "tPEARL-T2": { symbol: "tPEARL-T2", name: "Pearl tier 2 credit (TEST)", source: "Pearl", tier: 2 },
  "tFLOP-T3": { symbol: "tFLOP-T3", name: "FLOP tier 3 credit (TEST)", source: "FLOP", tier: 3 },
  "tPEARL-T3": { symbol: "tPEARL-T3", name: "Pearl tier 3 credit (TEST)", source: "Pearl", tier: 3 },
  tUSD: { symbol: "tUSD", name: "Cash-like numeraire (TEST)", source: "Numeraire" },
};

export const rates: RateInfo[] = [
  { symbol: "tFLOP-T1", omerPerUnit: "0.4120", ageSeconds: 42, maxAgeSeconds: 900, stale: false, placeholder: true },
  { symbol: "tPEARL-T1", omerPerUnit: "0.4085", ageSeconds: 42, maxAgeSeconds: 900, stale: false, placeholder: true },
  { symbol: "tFLOP-T2", omerPerUnit: "0.9700", ageSeconds: 48, maxAgeSeconds: 900, stale: false, placeholder: true },
  { symbol: "tPEARL-T2", omerPerUnit: "0.9740", ageSeconds: 48, maxAgeSeconds: 900, stale: false, placeholder: true },
  { symbol: "tFLOP-T3", omerPerUnit: "2.3100", ageSeconds: 1840, maxAgeSeconds: 900, stale: true, placeholder: true },
  { symbol: "tPEARL-T3", omerPerUnit: "2.2950", ageSeconds: 1840, maxAgeSeconds: 900, stale: true, placeholder: true },
  { symbol: "tUSD", omerPerUnit: "0.8000", ageSeconds: 60, maxAgeSeconds: 900, stale: false, placeholder: true },
];

export const pools: PoolInfo[] = [
  {
    id: "stable-t1", kind: "StablePool", coins: ["tFLOP-T1", "tPEARL-T1"],
    balances: ["410250.00", "402870.00"], balancesOmer: ["169023.00", "164572.40"], totalShares: "333310.12",
    A: 200, fee: { baseBps: 4, slopeBpsPerBps: 0.5, maxBps: 50 }, oracleDeviationBps: 6, status: "active",
  },
  {
    id: "stable-t2", kind: "StablePool", coins: ["tFLOP-T2", "tPEARL-T2"],
    balances: ["120400.00", "118950.00"], balancesOmer: ["116788.00", "115857.30"], totalShares: "232401.77",
    A: 200, fee: { baseBps: 4, slopeBpsPerBps: 0.5, maxBps: 50 }, oracleDeviationBps: 9, status: "active",
  },
  {
    id: "crypto-t1-usd", kind: "CryptoPool", coins: ["tPEARL-T1", "tUSD"],
    balances: ["96400.00", "49120.00"], balancesOmer: ["39379.40", "39296.00"], totalShares: "78590.40",
    gamma: "0.000145", fee: { baseBps: 25, slopeBpsPerBps: 1, maxBps: 120 }, oracleDeviationBps: 14, status: "active",
  },
  {
    id: "crypto-t2-usd", kind: "CryptoPool", coins: ["tUSD", "tPEARL-T2"],
    balances: ["61800.00", "50720.00"], balancesOmer: ["49440.00", "49401.28"], totalShares: "98760.02",
    gamma: "0.000145", fee: { baseBps: 25, slopeBpsPerBps: 1, maxBps: 120 }, oracleDeviationBps: 21, status: "active",
  },
  {
    id: "stable-t3", kind: "StablePool", coins: ["tFLOP-T3", "tPEARL-T3"],
    balances: ["18210.00", "18890.00"], balancesOmer: ["42065.10", "43352.55"], totalShares: "85310.55",
    A: 150, fee: { baseBps: 4, slopeBpsPerBps: 0.5, maxBps: 50 }, oracleDeviationBps: 0, status: "rates-stale",
  },
  {
    id: "crypto-t3-usd", kind: "CryptoPool", coins: ["tPEARL-T3", "tUSD"],
    balances: ["7420.00", "21300.00"], balancesOmer: ["17028.90", "17040.00"], totalShares: "34060.11",
    gamma: "0.000145", fee: { baseBps: 25, slopeBpsPerBps: 1, maxBps: 120 }, oracleDeviationBps: 0, status: "paused",
  },
];

/** A four-hop route: tier 1 FLOP credit to tier 2 FLOP credit via Pearl and the numeraire. */
export const quote: Quote = {
  chainId: 31337,
  from: "tFLOP-T1",
  to: "tFLOP-T2",
  amountIn: "250.000000",
  amountOut: "105.461208",
  minAmountOut: "104.933902",
  slippageBps: 50,
  deadlineSeconds: 600,
  priceImpactBps: 11,
  ratesMaxAgeSeconds: 60,
  stale: false,
  placeholder: true,
  route: [
    { pool: "stable-t1", kind: "StablePool", from: "tFLOP-T1", to: "tPEARL-T1", amountIn: "250.000000", amountOut: "252.040512", fee: { direction: "toward", baseBps: 4, slopeBpsPerBps: 0.5, deviationBps: 6, effectiveBps: 4 } },
    { pool: "crypto-t1-usd", kind: "CryptoPool", from: "tPEARL-T1", to: "tUSD", amountIn: "252.040512", amountOut: "128.317440", fee: { direction: "away", baseBps: 25, slopeBpsPerBps: 1, deviationBps: 14, effectiveBps: 39 } },
    { pool: "crypto-t2-usd", kind: "CryptoPool", from: "tUSD", to: "tPEARL-T2", amountIn: "128.317440", amountOut: "105.227011", fee: { direction: "toward", baseBps: 25, slopeBpsPerBps: 1, deviationBps: 21, effectiveBps: 25 } },
    { pool: "stable-t2", kind: "StablePool", from: "tPEARL-T2", to: "tFLOP-T2", amountIn: "105.227011", amountOut: "105.461208", fee: { direction: "away", baseBps: 4, slopeBpsPerBps: 0.5, deviationBps: 9, effectiveBps: 8.5 } },
  ],
};

export const position: Position = {
  pool: "stable-t2",
  shares: "4880.44",
  shareOfPoolBps: 210,
  underlying: ["2528.40", "2497.95"],
};

export const rewards: AgentRewards = {
  agentId: "erc8004:31337:42",
  label: "Research agent 42 (TEST)",
  epoch: 1283,
  epochBlocks: 43200,
  blocksLeft: 11840,
  spendCap: { capOmer: "500", spentOmer: "342.6", pendingCapOmer: "750", pendingFromEpoch: 1284 },
  spendByCoin: [
    { symbol: "tFLOP-T2", omer: "188.4" },
    { symbol: "tPEARL-T2", omer: "121.7" },
    { symbol: "tFLOP-T1", omer: "32.5" },
  ],
  streams: { spend: "342.6", lp: "118.2", fees: "41.9" },
  history: [
    { epoch: 1277, spendOmer: "212.0" },
    { epoch: 1278, spendOmer: "268.4" },
    { epoch: 1279, spendOmer: "301.9" },
    { epoch: 1280, spendOmer: "244.1" },
    { epoch: 1281, spendOmer: "410.3" },
    { epoch: 1282, spendOmer: "455.0" },
    { epoch: 1283, spendOmer: "342.6" },
  ],
  gauge: { status: "later" },
  veLock: { status: "later" },
};

/** Fixed clock for the timeline so the first render is deterministic. */
export const MOCK_NOW = Date.UTC(2026, 10, 25, 18, 0, 0);

export const activity = [
  { id: "a1", at: Date.UTC(2026, 10, 25, 17, 42), title: "Swapped 250 tFLOP-T1 for 105.46 tFLOP-T2", meta: "4 hops, fee 76.5 bps total", tone: "neutral" as const },
  { id: "a2", at: Date.UTC(2026, 10, 25, 16, 5), title: "Verified spend attested: 48.2 OMER", meta: "Settler TEST role", tone: "success" as const },
  { id: "a3", at: Date.UTC(2026, 10, 25, 9, 30), title: "Requested spend cap of 750 OMER", meta: "Applies from epoch 1,284", tone: "neutral" as const },
  { id: "a4", at: Date.UTC(2026, 10, 24, 21, 10), title: "Added liquidity to stable-t2", meta: "Proportional, 4,880.44 shares", tone: "neutral" as const },
  { id: "a5", at: Date.UTC(2026, 10, 24, 13, 55), title: "Swap refused: rates stale on stable-t3", meta: "RATE_STALE, nothing sent", tone: "danger" as const },
];

export function rateFor(symbol: string) {
  const rate = rates.find(r => r.symbol === symbol);
  if (!rate) throw new Error(`No mock rate for ${symbol}`);
  return rate;
}

export function poolById(id: string) {
  const pool = pools.find(p => p.id === id);
  if (!pool) throw new Error(`No mock pool ${id}`);
  return pool;
}
