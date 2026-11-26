// WCAG 2.x contrast check for every pair listed in brand/tokens.json, in light and dark.
// "role@base" means the role (which may be translucent) composited over the base role.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { composite, contrast, parseHex } from "./lib/color.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));

export function checkContrast(tokens = JSON.parse(readFileSync(`${root}brand/tokens.json`, "utf8"))) {
  const results = [];
  for (const theme of ["light", "dark"]) {
    const role = name => {
      const entry = tokens.roles[name];
      if (!entry) throw new Error(`Unknown role in contrast list: ${name}`);
      return parseHex(entry[theme]);
    };
    const resolve = spec => {
      const [top, base] = spec.split("@");
      const colour = role(top);
      if (base) return composite(colour, role(base));
      if (colour.a < 1) throw new Error(`${spec} is translucent; give it a base with role@base`);
      return colour;
    };
    for (const pair of tokens.contrast) {
      for (const bg of pair.bg) {
        const ratio = contrast(role(pair.fg), resolve(bg));
        results.push({ theme, fg: pair.fg, bg, ratio, min: pair.min, use: pair.use, pass: ratio >= pair.min });
      }
    }
  }
  return results;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const results = checkContrast();
  const failures = results.filter(r => !r.pass);
  for (const r of results) {
    const mark = r.pass ? "pass" : "FAIL";
    console.log(`${mark}  ${r.theme.padEnd(5)}  ${r.ratio.toFixed(2).padStart(5)} >= ${r.min}  ${r.fg} on ${r.bg}  (${r.use})`);
  }
  console.log(`\n${results.length - failures.length} of ${results.length} pairs meet WCAG AA.`);
  if (failures.length) process.exit(1);
}
