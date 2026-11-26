// Generates brand/tokens.css from brand/tokens.json. Run `npm run tokens`; `--check` exits 1 if the file is stale.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const tokens = JSON.parse(readFileSync(`${root}brand/tokens.json`, "utf8"));

export function renderTokensCss(t = tokens) {
  const lines = [];
  const block = (selector, theme) => {
    lines.push(`${selector} {`);
    if (theme === "light") {
      for (const [name, value] of Object.entries(t.typography.families)) lines.push(`  --${name}: ${value};`);
      for (const [name, value] of Object.entries(t.typography.scale)) lines.push(`  --${name}: ${value};`);
    }
    for (const [name, value] of Object.entries(t.roles)) lines.push(`  --${name}: ${value[theme]};`);
    for (const [name, value] of Object.entries(t.gradients)) lines.push(`  --${name}: ${typeof value === "string" ? value : value[theme]};`);
    lines.push("}");
  };
  lines.push("/* Generated from brand/tokens.json by scripts/build-tokens.mjs. Do not edit by hand. */");
  lines.push("/* Inference Finance (working name) brand tokens on Arc UI roles. Load after Arc's foundation.css. CC-BY-4.0. */");
  block(":root", "light");
  lines.push("");
  block(":root[data-theme=\"dark\"]", "dark");
  lines.push("");
  return lines.join("\n");
}

const out = `${root}brand/tokens.css`;
const css = renderTokensCss();
if (process.argv.includes("--check")) {
  const current = readFileSync(out, "utf8");
  if (current !== css) {
    console.error("brand/tokens.css is out of date. Run npm run tokens.");
    process.exit(1);
  }
  console.log("brand/tokens.css matches brand/tokens.json.");
} else if (process.argv[1] === fileURLToPath(import.meta.url)) {
  writeFileSync(out, css);
  console.log("Wrote brand/tokens.css");
}
