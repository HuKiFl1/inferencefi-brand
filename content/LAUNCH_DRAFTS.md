# DRAFT launch content, for review

> **DRAFT. For review by the protocol owner. Not to be posted.**
> Nothing in this file has been published, scheduled or sent. No X account has been created. Every post needs sign-off on naming (IF-D1), facts and wording before it goes anywhere.

Facts every piece must keep, word for word:

- OMER unit: 1 OMER = 1 IU = 750k input + 250k output tokens of a tier's reference model
- Chain message: Testnet rehearsal on HyperEVM testnet (chain 998) with labelled TEST mocks. Unaudited. Nothing deployed. No token exists.

Rules for every draft: say "working name" on first use, call the reward token "reward token (TBD)" with no ticker or numbers, make no price or return claims, and keep FLOP and Pearl as credit sources only: the AMM is a separate protocol.

## DRAFT site copy

Status: DRAFT, for review. This mirrors `site/src/content.ts`, which is what the design preview renders.

**Notice bar**
Testnet rehearsal on HyperEVM testnet (chain 998) with labelled TEST mocks. Unaudited. Nothing deployed. No token exists.

**Hero**
Swap inference credits by the work they buy.

Inference Finance (working name) is a stableswap AMM design for FLOP and Pearl inference credits. It measures every credit in one unit of work, so an agent can swap one unit of compute for another instead of guessing a dollar price.

1 OMER = 1 IU = 750k input + 250k output tokens of a tier's reference model

Unaudited. Nothing deployed. No token exists.

**How it works**

1. Credits. Providers sell inference as credits for a model tier. The design treats FLOP and Pearl inference credits for a tier as separate coins that can sit in the same pool.
2. OMER. An oracle rate turns each credit into OMER, one unit of work. Credits from different providers become comparable.
3. Pools. A StablePool holds credits that should trade near 1:1 in OMER. A CryptoPool holds pairs that drift. LPs hold shares, not an LP token.
4. Router. Routes of up to four hops, with a deadline and a slippage limit. Every quote shows its dynamic fee and how old its rates are.

Dynamic fee: toward the oracle price, fee = base. Away from it, fee = base + slope × deviation.

**What does not exist yet**

- There is no on-chain FLOP or Pearl inference-credit token yet. The rehearsal uses labelled TEST mocks.
- Testnet rates are placeholders, not market prices.
- Nothing is deployed.
- Nothing is audited.

**Agents**
The SDK, CLI and MCP tools are read-only. They list pools, quote routes and read rates and rewards. They never sign or send. Each agent ID has a per-epoch spend cap in OMER, and raising a cap takes one epoch.

**Fair launch, by design**
If a reward token ever launches, it goes to the agents and LPs who used the protocol. No premine, no team allocation. Three streams: verified spend, liquidity and fees paid. Gauge voting and an optional ve-lock are a later state. The reward token (TBD) has no name, ticker or supply, does not exist and is not for sale.

## DRAFT X posts

Status: DRAFT, for review. Not to be posted. Each is under 280 characters.

### DRAFT X post 1

Inference Finance (working name) is a stableswap AMM design for inference credits.

1 OMER = 1 IU = 750k input + 250k output tokens of a tier's reference model

Swap compute for compute, measured in work. Testnet design only. Unaudited. Nothing deployed.

### DRAFT X post 2

What exists today: a design, pool math and read-only screens.

What does not: an on-chain FLOP or Pearl inference-credit token, real rates, a deployment, an audit or any token.

We would rather say it first.

### DRAFT X post 3

The fee depends on direction.

Trade toward the oracle price: fee = base.
Trade away from it: fee = base + slope × deviation.

Pools get cheaper to heal than to push. Parameters are placeholders for review.

### DRAFT X post 4

If rates go stale, swaps that depend on them stop. That is on purpose.

Proportional exits never need a rate, so LPs can always take their share out, even when a pool is paused.

LPs hold shares. There is no LP token.

### DRAFT X post 5

Built for agents: read-only SDK, CLI and MCP tools that quote routes and read pool state. Nothing signs or sends.

Each agent ID gets a per-epoch spend cap in OMER. Raising it takes one epoch.

Testnet rehearsal design. Unaudited. No token exists.

## DRAFT thread

Status: DRAFT, for review. Not to be posted. Five parts, each under 280 characters.

**1/5**
Agents buy inference from more than one provider. Credits from FLOP and from Pearl are both claims on model work, but nothing lets you compare or swap them cleanly.

Inference Finance (working name) is a design for that. A short thread.

**2/5**
The idea is one unit of work.

1 OMER = 1 IU = 750k input + 250k output tokens of a tier's reference model

An oracle rate turns each credit into OMER, so credits from different providers can share a pool.

**3/5**
StablePools hold credits that should trade near 1:1 in OMER. CryptoPools hold pairs that drift. Routes go up to four hops with a deadline and slippage limit, and the fee rises when a trade pushes a pool away from the oracle price.

**4/5**
The honest part: there is no on-chain FLOP or Pearl inference-credit token yet, and testnet rates are placeholders. FLOP and Pearl are where credits come from. They do not host or run the AMM.

**5/5**
Testnet rehearsal on HyperEVM testnet (chain 998) with labelled TEST mocks. Unaudited. Nothing deployed. No token exists.

Pool math and design: github.com/HuKiFl1/inferencefi-stableswap

## DRAFT announcement

Status: DRAFT, for review. Not to be posted.

Inference Finance (working name) is a stableswap AMM design for FLOP and Pearl inference credits that prices every credit in one unit of work: 1 OMER = 1 IU = 750k input + 250k output tokens of a tier's reference model. Its StablePools and CryptoPools let an agent swap compute for compute through routes of up to four hops, with a fee that stays at base when a trade moves a pool toward the oracle price and rises with deviation when it moves away, and with proportional exits that work even when rates are stale or a pool is paused. Today it is a design with pool math, read-only SDK tools and preview screens: a testnet rehearsal on HyperEVM testnet (chain 998) with labelled TEST mocks. Unaudited. Nothing deployed. No token exists. There is no on-chain FLOP or Pearl inference-credit token yet, testnet rates are placeholders, and any future reward token (TBD) would follow a fair launch with no premine and no team allocation.
