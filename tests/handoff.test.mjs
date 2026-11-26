import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { checkArcPro } from "../scripts/check-arc-pro.mjs";
import { read, root } from "./helpers.mjs";

const handoff = read("docs/HANDOFF.md");
const brief = read("docs/IF-D1-D2-BRIEF.md");
const tokens = JSON.parse(read("brand/tokens.json"));
const { vendored, violations } = checkArcPro();

function tableAfter(markdown, heading) {
  const start = markdown.indexOf(heading);
  assert.ok(start >= 0, `missing heading: ${heading}`);
  const rest = markdown.slice(start);
  const end = rest.indexOf("\n## ", heading.length);
  return rest.slice(0, end === -1 ? undefined : end);
}

function column(markdown, heading, index = 0) {
  const rows = [];
  for (const line of tableAfter(markdown, heading).split("\n")) {
    if (!line.startsWith("| `")) continue;
    const cells = line.split("|").map(c => c.trim()).filter(Boolean);
    const m = cells[index].match(/^`([^`]+)`$/);
    assert.ok(m, `expected a backticked first cell in: ${line}`);
    rows.push(m[1]);
  }
  assert.ok(rows.length > 0, `no table rows after ${heading}`);
  return rows;
}

test("handoff inventory lists every vendored Arc item, and only free items", () => {
  assert.deepEqual(violations, []);
  const listed = column(handoff, "## Arc UI free component inventory");
  assert.deepEqual([...listed].sort(), [...vendored].sort());
  const lock = JSON.parse(read("shared/arc-tiers.lock.json"));
  const free = new Set(lock.free);
  const missing = listed.filter(name => !free.has(name));
  assert.deepEqual(missing, [], "a component named in HANDOFF.md is not on the Arc free list");
});

test("handoff token tables cover every role in tokens.json, light and dark", () => {
  const roles = column(handoff, "## Arc role tokens, light and dark").map(name => name.replace(/^--/, ""));
  assert.deepEqual([...roles].sort(), [...Object.keys(tokens.roles)].sort());
  const section = tableAfter(handoff, "## Arc role tokens, light and dark");
  for (const [name, value] of Object.entries(tokens.roles)) {
    const line = section.split("\n").find(l => l.includes(`\`--${name}\``));
    assert.ok(line, `missing token row for --${name}`);
    assert.ok(line.includes(`\`${value.light}\``), `${name} light`);
    assert.ok(line.includes(`\`${value.dark}\``), `${name} dark`);
  }
});

test("handoff screen URLs match the coded preview states", () => {
  const section = tableAfter(handoff, "## Screen-state map");
  for (const url of [
    "?screen=swap",
    "?screen=swap&state=stale",
    "?screen=pools",
    "?screen=pools&state=loading",
    "?screen=pools&state=empty",
    "?screen=pools&state=error",
    "?screen=lp",
    "?screen=lp&mode=imbalanced",
    "?screen=lp&mode=one-coin",
    "?screen=lp&tab=remove&pool=stable-t3",
    "?screen=lp&tab=remove&pool=crypto-t3-usd",
    "?screen=dashboard",
  ]) {
    assert.ok(section.includes(`\`${url}\``), `missing URL ${url}`);
  }
  const app = read("app-screens/src/App.tsx");
  const main = read("app-screens/src/main.tsx");
  assert.match(main, /params\.get\("screen"\)/);
  assert.match(app, /params\.get\("state"\) === "stale"/);
  assert.match(app, /\["loading", "empty", "error"\]/);
  assert.match(app, /params\.get\("tab"\) === "remove"/);
  assert.match(app, /params\.get\("pool"\)/);
  assert.match(app, /params\.get\("mode"\)/);
  const setup = read("shared/brand/setup.ts");
  assert.match(setup, /theme/);
});

test("handoff and brief relative links resolve in this repo", () => {
  const files = { "docs/HANDOFF.md": handoff, "docs/IF-D1-D2-BRIEF.md": brief };
  const missing = [];
  for (const [from, text] of Object.entries(files)) {
    for (const m of text.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
      const href = m[1];
      if (/^https?:\/\//.test(href) || href.startsWith("#") || href.startsWith("mailto:")) continue;
      const path = href.replace(/^\.\.\//, "").replace(/\/$/, "");
      // Links in docs/ to siblings stay in docs/; links to ../ stay at repo root.
      const resolved = href.startsWith("../")
        ? join(root, href.slice(3))
        : href.startsWith("/")
          ? href
          : join(root, "docs", href);
      if (!existsSync(resolved)) missing.push(`${from} -> ${href}`);
    }
  }
  assert.deepEqual(missing, []);
});

test("decision brief is a proposal and recommends Inference Finance, not Omerswap", () => {
  assert.match(brief, /Status: a proposal/);
  assert.match(brief, /not a decision/i);
  assert.match(brief, /Inference Finance/);
  assert.match(brief, /Creditcurve/);
  assert.match(brief, /Workrate/);
  assert.match(brief, /recommends against it/);
  assert.match(brief, /religious observance/);
  assert.doesNotMatch(brief, /official name is Omerswap/);
  assert.match(brief, /No domain purchase/);
  assert.match(brief, /not legal advice/);
  assert.match(brief, /not a purchase/);
});

test("docs use HuKiFl1 only and stay in sentence-case punctuation rules", () => {
  for (const text of [handoff, brief]) {
    assert.match(text, /HuKiFl1/);
    assert.doesNotMatch(text, /[\u2013\u2014]/);
  }
});
