// Fails on personal data and secrets in the working tree: emails, local paths, keys, seeds, DIDs and listed names.
// Listed names are stored as truncated SHA-256 hashes so this file does not contain them.
import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const SKIP_DIRS = new Set(["node_modules", "dist", ".git", "test-results"]);
const BINARY = /\.(png|jpe?g|gif|webp|woff2?|ttf|otf|ico|gz|tgz|zip)$/i;

const PATTERNS = [
  { id: "email", re: /[A-Z0-9._%+-]+@[A-Z0-9-]+(?:\.[A-Z0-9-]+)*\.[A-Z]{2,}/gi },
  { id: "unix home path", re: /\/(?:home|Users)\/[A-Za-z0-9._-]+/g },
  { id: "windows user path", re: /[A-Z]:\\Users\\/gi },
  { id: "root or agent path", re: /\/(?:root|agent\/repos|tmp\/cursor)\//g },
  { id: "private key block", re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/g },
  { id: "hex private key", re: /\b(?:0x)?[0-9a-fA-F]{64}\b/g },
  { id: "AWS access key", re: /\bAKIA[0-9A-Z]{16}\b/g },
  { id: "GitHub token", re: /\bgh[pousr]_[A-Za-z0-9]{30,}\b/g },
  { id: "API secret key", re: /\bsk-[A-Za-z0-9_-]{20,}\b/g },
  { id: "Slack token", re: /\bxox[abprs]-[A-Za-z0-9-]{10,}/g },
  { id: "Google API key", re: /\bAIza[0-9A-Za-z_-]{35}\b/g },
  { id: "seed or secret assignment", re: /\b(?:mnemonic|seed[ _-]?phrase|private[ _-]?key|secret[ _-]?key|api[ _-]?key)\b\s*[:=]\s*["'`]?[A-Za-z0-9]/gi },
  { id: "DID", re: /\bdid:[a-z0-9]+:[A-Za-z0-9._%-]+/g },
];

// RFC 2606 documentation domains, used only by vendored placeholder copy.
const RESERVED_EMAIL = /@example\.(?:com|org|net)$/i;

// sha256(lowercase word), first 16 hex digits. Personal names and third-party collection names that must not appear.
const DENY_HASHES = new Set(["ec3620470529f114", "a026e97c6d25363c", "ca79dce1799164b5", "c1bed081e3fe78cc"]);

export function hashWord(word) {
  return createHash("sha256").update(word.toLowerCase()).digest("hex").slice(0, 16);
}

function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (!BINARY.test(entry.name)) out.push(full);
  }
  return out;
}

export function scanText(text, denyHashes = DENY_HASHES) {
  const hits = [];
  const lines = text.split("\n");
  lines.forEach((line, index) => {
    for (const { id, re } of PATTERNS) {
      re.lastIndex = 0;
      for (const m of line.matchAll(re)) {
        if (id === "email" && RESERVED_EMAIL.test(m[0])) continue;
        hits.push({ id, line: index + 1, match: m[0] });
      }
    }
    for (const word of line.match(/[A-Za-z]{3,}/g) ?? []) {
      if (denyHashes.has(hashWord(word))) hits.push({ id: "listed name", line: index + 1, match: `${word[0]}…` });
    }
  });
  return hits;
}

export function checkPersonalData(root = repoRoot, denyHashes = DENY_HASHES) {
  const results = [];
  for (const file of walk(root)) {
    const hits = scanText(readFileSync(file, "utf8"), denyHashes);
    for (const hit of hits) results.push({ file: relative(root, file), ...hit });
  }
  return results;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (process.argv[2] === "--hash") {
    console.log(hashWord(process.argv[3] ?? ""));
    process.exit(0);
  }
  const results = checkPersonalData();
  if (results.length) {
    for (const r of results) console.error(`FAIL  ${r.file}:${r.line}  ${r.id}: ${r.match}`);
    process.exit(1);
  }
  console.log("No personal data or secrets found.");
}
