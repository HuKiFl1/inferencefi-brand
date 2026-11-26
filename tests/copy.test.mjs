import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { read, root, walk } from "./helpers.mjs";

const OMER_UNIT = "1 OMER = 1 IU = 750k input + 250k output tokens of a tier's reference model";
const CHAIN_MESSAGE = "Testnet rehearsal on HyperEVM testnet (chain 998) with labelled TEST mocks. Unaudited. Nothing deployed. No token exists.";

const copyFiles = () => [
  ...walk("site/src", f => /\.(tsx?)$/.test(f)),
  ...walk("app-screens/src", f => /\.(tsx?)$/.test(f)),
  "content/LAUNCH_DRAFTS.md",
];
const docFiles = () => [...copyFiles(), "brand/BRAND.md", "brand/TYPE_SCALE.md", "README.md"];

// Affirmative claims the product must never make. A match is allowed only when a negation sits just before it.
const FORBIDDEN = [
  /\b(?:is|are|fully|independently|now) audited\b/gi, /\baudited by\b/gi, /\bhas been audited\b/gi,
  /\b(?:is|now|goes|went) live\b/gi, /\blive on (?:mainnet|testnet)\b/gi, /\bmainnet\b/gi,
  /\bproduction[- ]ready\b/gi, /\bfor sale\b/gi, /\btoken sale\b/gi, /\bpresale\b/gi, /\bairdrop\b/gi,
  /\bbuy (?:the |our )?token\b/gi, /\bAPY\b/g, /\bAPR\b/g, /\bguarantee(?:d|s)?\b/gi, /\brisk[- ]free\b/gi,
  /\bprice target\b/gi, /\b(?:total|max(?:imum)?|circulating) supply\b/gi, /\bpassive income\b/gi, /\bearn(?:s|ing)? yield\b/gi,
];
const NEGATION = /\b(?:not|no|never|nothing|nor|without|isn't|aren't|won't|cannot)\b[^.]{0,40}$/i;

function claimHits(text) {
  const hits = [];
  for (const re of FORBIDDEN) {
    re.lastIndex = 0;
    for (const m of text.matchAll(re)) {
      const before = text.slice(Math.max(0, m.index - 60), m.index);
      if (!NEGATION.test(before)) hits.push(m[0]);
    }
  }
  return hits;
}

test("the OMER unit and the chain message appear verbatim", () => {
  assert.ok(read("site/src/content.ts").includes(OMER_UNIT));
  assert.ok(read("site/src/content.ts").includes(CHAIN_MESSAGE));
  assert.ok(read("app-screens/src/copy.ts").includes(CHAIN_MESSAGE));
  assert.ok(read("content/LAUNCH_DRAFTS.md").includes(OMER_UNIT));
  assert.ok(read("content/LAUNCH_DRAFTS.md").includes(CHAIN_MESSAGE));
});

test("no live, audited, sale, price or return claims", () => {
  const offenders = [];
  for (const file of docFiles()) for (const hit of claimHits(read(file))) offenders.push(`${file}: ${hit}`);
  assert.deepEqual(offenders, []);
});

test("the claim check flags an affirmative claim and accepts a negated one", () => {
  assert.deepEqual(claimHits("The protocol is audited and live on mainnet."), ["is audited", "live on mainnet", "mainnet"]);
  assert.deepEqual(claimHits("The reward token (TBD) is not for sale."), []);
});

test("the reward token has no ticker and no supply number", () => {
  for (const file of docFiles()) {
    const text = read(file);
    assert.doesNotMatch(text, /\$[A-Z]{2,8}\b/, `${file} has a ticker-like $SYMBOL`);
    assert.doesNotMatch(text, /reward token \((?!TBD\))/i, `${file} names the reward token`);
  }
});

test("no FLOP-native hosting copy in the site, screens or launch drafts", () => {
  for (const file of copyFiles()) {
    assert.doesNotMatch(read(file), /substrate|no evm|pallet|governance-adopted|native module|flop hosts|hosted on flop|built on flop/i, file);
  }
});

test("copy follows Arc rules: no em dashes and no uppercase transforms", () => {
  const emDash = String.fromCharCode(0x2014);
  for (const file of docFiles()) assert.ok(!read(file).includes(emDash), `${file} has an em dash`);
  for (const file of [...walk("site/src", f => f.endsWith(".css")), ...walk("app-screens/src", f => f.endsWith(".css"))]) {
    assert.doesNotMatch(read(file), /text-transform:\s*uppercase/, file);
  }
});

test("launch drafts are marked DRAFT, for review and not to be posted", () => {
  const drafts = read("content/LAUNCH_DRAFTS.md");
  assert.match(drafts, /^# DRAFT/m);
  assert.match(drafts, /not to be posted/i);
  const sections = drafts.split(/^## /m).slice(1);
  assert.ok(sections.length >= 4, "expected site copy, X posts, thread and announcement sections");
  for (const section of sections) assert.match(section, /DRAFT/, `section "${section.split("\n")[0]}" lacks a DRAFT label`);
  const posts = drafts.match(/^### DRAFT X post \d/gm) ?? [];
  assert.equal(posts.length, 5, "five draft X posts");
});

test("required brand files exist", () => {
  for (const file of ["brand/BRAND.md", "brand/TYPE_SCALE.md", "brand/tokens.css", "brand/tokens.json", "brand/fonts/FONTS.md", "LICENSE", "LICENSE-ASSETS.md", "README.md"]) {
    assert.ok(existsSync(join(root, file)), file);
  }
  for (const variant of ["light", "dark", "mono-black", "mono-white"]) {
    for (const kind of ["mark", "wordmark", "lockup"]) assert.ok(existsSync(join(root, `brand/logo/${kind}-${variant}.svg`)), `${kind}-${variant}.svg`);
  }
});
