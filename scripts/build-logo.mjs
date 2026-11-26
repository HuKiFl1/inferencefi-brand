// Writes every logo SVG in brand/logo/ and shared/brand/logo-data.ts from the hand-drawn geometry below.
// Geometry: baseline y=100, x-height y=28, cap height y=0, monoline stroke 12, round caps and joins.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const tokens = JSON.parse(readFileSync(`${root}brand/tokens.json`, "utf8"));
const role = (name, theme) => tokens.roles[name][theme];

const STROKE = 12;
const GAP = 26;
const SPACE = 66;

/** Each glyph: stroke paths, advance width, optical sidebearing tweaks, and an optional accent dot. */
const GLYPHS = {
  I: { w: 0, d: ["M0 0V100"] },
  F: { w: 44, d: ["M44 0H0V100", "M0 48H36"] },
  n: { w: 58, d: ["M0 28V100", "M0 58A29 30 0 0 1 58 58V100"] },
  e: { w: 64, l: -4, r: -4, d: ["M0 64H64A32 36 0 1 0 54.63 89.46"] },
  c: { w: 55, l: -4, r: -2, d: ["M54.63 38.54A32 36 0 1 0 54.63 89.46"] },
  r: { w: 32, r: -2, d: ["M0 28V100", "M0 60C0 40 12 28 32 28"] },
  f: { w: 38, r: -4, d: ["M10 100V22C10 8 18 0 32 0H38", "M0 28H34"] },
  i: { w: 0, d: ["M0 28V100"], dot: { cx: 0, cy: 5, r: 7.5 } },
  a: { w: 60, l: -4, d: ["M60 28V100", "M60 64A30 36 0 1 0 0 64A30 36 0 1 0 60 64"] },
};

function layout(text) {
  const parts = [];
  let x = STROKE / 2;
  let prev = null;
  for (const ch of text) {
    if (ch === " ") { x += SPACE; prev = null; continue; }
    const g = GLYPHS[ch];
    if (!g) throw new Error(`No glyph for ${ch}`);
    if (prev) x += GAP + (prev.r ?? 0) + (g.l ?? 0);
    parts.push({ ch, x, d: g.d, dot: g.dot ? { cx: x + g.dot.cx, cy: g.dot.cy, r: g.dot.r } : null });
    x += g.w;
    prev = g;
  }
  return { parts, width: Math.ceil(x + STROKE / 2) };
}

const MARK = {
  viewBox: "0 0 100 100",
  tile: { x: 0, y: 0, width: 100, height: 100, rx: 24 },
  // The stableswap invariant: steep near one axis, nearly flat (slope -1) through the balanced middle, then
  // hugging the other axis. Symmetric about x + y = 100.
  curve: "M32 16C32 32 35 39 43 47L53 57C61 65 68 68 84 68",
  curveWidth: 7.5,
  // Reserve axes: the curve is plotted, not a free gesture.
  axes: "M20 14V80H86",
  axesWidth: 5,
  // The quote: the pool's current point on the curve.
  dot: { cx: 48, cy: 52, r: 9, ring: 4 },
};

const WORD_TOP = -8;
const WORD_HEIGHT = 116;
const round = n => Math.round(n * 100) / 100;

function wordmarkSvg(text, { ink, dot, title }) {
  const { parts, width } = layout(text);
  const body = parts.map(p => `    <g transform="translate(${round(p.x)} 0)">${p.d.map(d => `<path d="${d}"/>`).join("")}</g>`).join("\n");
  const dots = parts.filter(p => p.dot).map(p => `  <circle cx="${round(p.dot.cx)}" cy="${p.dot.cy}" r="${p.dot.r}" fill="${dot}"/>`).join("\n");
  return { width, svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 ${WORD_TOP} ${width} ${WORD_HEIGHT}" width="${width}" height="${WORD_HEIGHT}" role="img" aria-labelledby="t">
  <title id="t">${title}</title>
  <g fill="none" stroke="${ink}" stroke-width="${STROKE}" stroke-linecap="round" stroke-linejoin="round">
${body}
  </g>
${dots}
</svg>
` };
}

function markInner({ tile, curve, dot, ring, axes = 0.55 }) {
  const t = MARK.tile;
  return `  <rect x="${t.x}" y="${t.y}" width="${t.width}" height="${t.height}" rx="${t.rx}" fill="${tile}"/>
  <path d="${MARK.axes}" fill="none" stroke="${curve}" stroke-width="${MARK.axesWidth}" stroke-linecap="round" stroke-linejoin="round" opacity="${axes}"/>
  <path d="${MARK.curve}" fill="none" stroke="${curve}" stroke-width="${MARK.curveWidth}" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="${MARK.dot.cx}" cy="${MARK.dot.cy}" r="${MARK.dot.r}" fill="${dot}" stroke="${ring}" stroke-width="${MARK.dot.ring}"/>`;
}

function markSvg(colours, title) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${MARK.viewBox}" width="100" height="100" role="img" aria-labelledby="t">
  <title id="t">${title}</title>
${markInner(colours)}
</svg>
`;
}

function lockupSvg(text, mark, word, title) {
  const { parts, width } = layout(text);
  const markSize = WORD_HEIGHT;
  const gap = 40;
  const total = markSize + gap + width;
  const scale = markSize / 100;
  const body = parts.map(p => `      <g transform="translate(${round(p.x)} 0)">${p.d.map(d => `<path d="${d}"/>`).join("")}</g>`).join("\n");
  const dots = parts.filter(p => p.dot).map(p => `    <circle cx="${round(p.dot.cx)}" cy="${p.dot.cy}" r="${p.dot.r}" fill="${word.dot}"/>`).join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 ${WORD_TOP} ${total} ${WORD_HEIGHT}" width="${total}" height="${WORD_HEIGHT}" role="img" aria-labelledby="t">
  <title id="t">${title}</title>
  <g transform="translate(0 ${WORD_TOP}) scale(${round(scale)})">
${markInner(mark).replace(/^/gm, "  ")}
  </g>
  <g transform="translate(${markSize + gap} 0)">
    <g fill="none" stroke="${word.ink}" stroke-width="${STROKE}" stroke-linecap="round" stroke-linejoin="round">
${body}
    </g>
${dots}
  </g>
</svg>
`;
}

const BLACK = "#0B1418";
const WHITE = "#FFFFFF";
const NAME = "Inference Finance";
const SHORT = "InferenceFi";

const markColours = {
  light: { tile: role("brand-mark-tile", "light"), curve: role("brand-mark-curve", "light"), dot: role("brand-ember", "light"), ring: role("brand-mark-curve", "light") },
  dark: { tile: role("brand-mark-tile", "dark"), curve: role("brand-mark-curve", "dark"), dot: role("brand-ember", "dark"), ring: role("brand-mark-curve", "dark") },
  "mono-black": { tile: BLACK, curve: WHITE, dot: WHITE, ring: BLACK, axes: 1 },
  "mono-white": { tile: WHITE, curve: BLACK, dot: BLACK, ring: WHITE, axes: 1 },
};
const wordColours = {
  light: { ink: role("foreground", "light"), dot: role("brand-ember", "light") },
  dark: { ink: role("foreground", "dark"), dot: role("brand-ember", "dark") },
  "mono-black": { ink: BLACK, dot: BLACK },
  "mono-white": { ink: WHITE, dot: WHITE },
};

export function buildLogo() {
  const files = {};
  for (const variant of Object.keys(markColours)) {
    const label = variant.startsWith("mono") ? `${variant.replace("-", ", ")}` : `for ${variant} backgrounds`;
    files[`mark-${variant}.svg`] = markSvg(markColours[variant], `${NAME} mark, ${label}`);
    files[`wordmark-${variant}.svg`] = wordmarkSvg(NAME, { ...wordColours[variant], title: `${NAME} wordmark, ${label}` }).svg;
    files[`wordmark-short-${variant}.svg`] = wordmarkSvg(SHORT, { ...wordColours[variant], title: `${SHORT} short wordmark, ${label}` }).svg;
    files[`lockup-${variant}.svg`] = lockupSvg(NAME, markColours[variant], wordColours[variant], `${NAME} logo lockup, ${label}`);
  }
  files["favicon.svg"] = markSvg(markColours.light, `${NAME} favicon`);
  return files;
}

function logoDataTs() {
  const describe = text => {
    const { parts, width } = layout(text);
    return { width, parts: parts.map(p => ({ x: round(p.x), d: p.d, dot: p.dot ? { cx: round(p.dot.cx), cy: p.dot.cy, r: p.dot.r } : null })) };
  };
  const data = { stroke: STROKE, top: WORD_TOP, height: WORD_HEIGHT, mark: MARK, full: describe(NAME), short: describe(SHORT) };
  return `// Generated by scripts/build-logo.mjs. Do not edit by hand.
export const logoData = ${JSON.stringify(data, null, 2)} as const;
`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  mkdirSync(`${root}brand/logo`, { recursive: true });
  const files = buildLogo();
  for (const [name, svg] of Object.entries(files)) writeFileSync(`${root}brand/logo/${name}`, svg);
  mkdirSync(`${root}shared/brand`, { recursive: true });
  writeFileSync(`${root}shared/brand/logo-data.ts`, logoDataTs());
  console.log(`Wrote ${Object.keys(files).length} SVGs to brand/logo and shared/brand/logo-data.ts`);
}
