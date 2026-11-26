// Fails if any Arc Pro item is vendored, imported or configured. Arc free items only (MIT, uiarc.dev).
// Offline by default, against shared/arc-tiers.lock.json. `--refresh` rewrites the lock from the live catalog.
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));

// Built from parts so this file does not match its own scan.
const PRO_MARKERS = [
  ["@uiarc", "-pro"].join(""),
  ["uiarc.dev/r/", "pro/"].join(""),
  ["ARC_PRO", "_TOKEN"].join(""),
  ["arc_pro", "_"].join(""),
  ["uiarc.dev/api/", "skills"].join(""),
];

const SKIP_DIRS = new Set(["node_modules", "dist", ".git", "design", "test-results"]);
const TEXT_EXT = /\.(tsx?|jsx?|mjs|cjs|css|json|md|html|svg|ya?ml|txt|sh)$/i;
const ARC_SUPPORT = new Set(["lib", "blocks", "foundation.css", "motion-tokens.ts"]);

function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (TEXT_EXT.test(entry.name)) out.push(full);
  }
  return out;
}

export function checkArcPro(root = repoRoot, { lockPath = join(root, "shared/arc-tiers.lock.json") } = {}) {
  const violations = [];
  if (!existsSync(lockPath)) return { violations: [`Missing tier lock at ${relative(root, lockPath)}`], vendored: [] };
  const lock = JSON.parse(readFileSync(lockPath, "utf8"));
  const free = new Set(lock.free);
  const pro = new Set(lock.pro);
  const arcDir = join(root, "shared/components/arc");
  const vendored = [];

  // 1. Every vendored component and block is on the free list.
  if (existsSync(arcDir)) {
    for (const name of readdirSync(arcDir)) {
      if (ARC_SUPPORT.has(name)) continue;
      if (statSync(join(arcDir, name)).isDirectory()) vendored.push(name);
    }
    const blocks = join(arcDir, "blocks");
    if (existsSync(blocks)) for (const name of readdirSync(blocks)) vendored.push(name);
  }
  for (const name of vendored) {
    if (pro.has(name)) violations.push(`Arc Pro item vendored: ${name}`);
    else if (!free.has(name)) violations.push(`Vendored Arc item is not on the free list: ${name}`);
  }

  // 2. No Pro registry, token or source marker anywhere in the tree.
  for (const file of walk(root)) {
    const text = readFileSync(file, "utf8");
    for (const marker of PRO_MARKERS) {
      if (text.includes(marker)) violations.push(`Arc Pro marker "${marker}" in ${relative(root, file)}`);
    }
  }

  // 3. components.json registers only the public registry.
  const componentsJson = join(root, "shared/components.json");
  if (existsSync(componentsJson)) {
    const registries = JSON.parse(readFileSync(componentsJson, "utf8")).registries ?? {};
    for (const [name, value] of Object.entries(registries)) {
      const url = typeof value === "string" ? value : value.url;
      if (url !== "https://uiarc.dev/r/{name}.json") violations.push(`Unexpected registry in components.json: ${name} -> ${url}`);
    }
  }

  // 4. Every @arc/ import resolves to a vendored free item.
  for (const file of walk(root).filter(f => /\.(tsx?|jsx?)$/.test(f) && !f.includes(`${sep}components${sep}arc${sep}`))) {
    const text = readFileSync(file, "utf8");
    for (const match of text.matchAll(/from\s+"@arc\/([^"]+)"/g)) {
      const parts = match[1].split("/");
      const item = parts[0] === "blocks" ? parts[1] : parts[0];
      if (ARC_SUPPORT.has(item)) continue;
      if (pro.has(item)) violations.push(`Arc Pro item imported: ${item} in ${relative(root, file)}`);
      else if (!vendored.includes(item)) violations.push(`Import of an Arc item that is not vendored: ${item} in ${relative(root, file)}`);
    }
  }

  return { violations, vendored: vendored.sort() };
}

async function refresh() {
  const [catalog, registry] = await Promise.all([
    fetch("https://uiarc.dev/r/catalog.json").then(r => r.json()),
    fetch("https://uiarc.dev/r/registry.json").then(r => r.json()),
  ]);
  const lockPath = join(repoRoot, "shared/arc-tiers.lock.json");
  const lock = JSON.parse(readFileSync(lockPath, "utf8"));
  lock.catalogGeneratedAt = catalog.generatedAt;
  lock.free = catalog.items.filter(i => i.tier === "free").map(i => i.name).sort();
  lock.pro = catalog.items.filter(i => i.tier !== "free").map(i => i.name).sort();
  lock.publicRegistry = registry.items.map(i => i.name).sort();
  writeFileSync(lockPath, `${JSON.stringify(lock, null, 1)}\n`);
  console.log(`Refreshed tier lock: ${lock.free.length} free, ${lock.pro.length} Pro.`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (process.argv.includes("--refresh")) await refresh();
  const { violations, vendored } = checkArcPro();
  console.log(`Vendored Arc free items (${vendored.length}): ${vendored.join(", ")}`);
  if (violations.length) {
    for (const v of violations) console.error(`FAIL  ${v}`);
    process.exit(1);
  }
  console.log("No Arc Pro items vendored, imported or configured.");
}
