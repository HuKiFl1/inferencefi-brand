// Captures PNGs of the built site, the app screens and a brand sheet into design/, in light and dark.
// Run `npm run build` first. Pages are served from dist/ by a local static server, never from the network.
import { createServer } from "node:http";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = fileURLToPath(new URL("..", import.meta.url));
const out = join(root, "design");
const THEMES = ["light", "dark"];
const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 };

const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".png": "image/png" };

function serve(dir, port, extra = {}) {
  const server = createServer((req, res) => {
    const path = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (extra[path]) {
      res.writeHead(200, { "content-type": "text/html" });
      return res.end(extra[path]());
    }
    const file = normalize(join(dir, path === "/" ? "index.html" : path));
    if (!file.startsWith(dir) || !existsSync(file)) {
      res.writeHead(404);
      return res.end();
    }
    res.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" });
    res.end(readFileSync(file));
  });
  return new Promise(resolve => server.listen(port, "127.0.0.1", () => resolve(server)));
}

const svg = name => readFileSync(join(root, "brand", name), "utf8").replace(/<\?xml[^>]*>/, "");

function brandSheet() {
  const tokens = JSON.parse(readFileSync(join(root, "brand/tokens.json"), "utf8"));
  const fonts = readdirSync(join(root, "site/dist/assets")).filter(f => f.endsWith(".woff2"));
  const font = (prefix) => fonts.find(f => f.startsWith(prefix) && f.includes("latin-wght") && !f.includes("ext"));
  const faces = [["Geist Variable", font("geist-latin-wght")], ["Inter Variable", font("inter-latin-wght")], ["Geist Mono Variable", font("geist-mono-latin-wght")]]
    .filter(([, f]) => f)
    .map(([family, f]) => `@font-face{font-family:"${family}";src:url(/assets/${f}) format("woff2");font-weight:100 900;}`)
    .join("");
  const roles = ["background", "surface", "surface-muted", "foreground", "text-secondary", "text-muted", "border", "accent", "accent-strong", "brand-ember", "success", "warning", "danger", "info", "series-1", "series-2", "series-3", "series-4"];
  const sizes = Object.entries(tokens.typography.scale).reverse();
  const variants = ["light", "dark", "mono-black", "mono-white"];
  const tile = (theme, body) => `<div class="tile ${theme}">${body}</div>`;
  return `<!doctype html><html><head><meta charset="utf-8">
<style>${faces}${readFileSync(join(root, "brand/tokens.css"), "utf8")}
*{box-sizing:border-box}body{margin:0;background:var(--background);color:var(--foreground);font-family:var(--font-body);letter-spacing:-.01em}
main{max-width:1280px;margin:0 auto;padding:64px 48px;display:grid;gap:48px}
h1{font-family:var(--font-display);font-weight:500;font-size:var(--text-5xl);letter-spacing:-.03em;margin:0}
h2{font-family:var(--font-display);font-weight:500;font-size:var(--text-2xl);margin:0 0 16px}
p{margin:8px 0 0;color:var(--text-secondary);font-size:var(--text-lg)}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
.tile{border:1px solid var(--border);border-radius:16px;padding:24px;display:grid;place-items:center;min-height:140px}
.tile.light{background:${tokens.roles.background.light}}.tile.dark{background:${tokens.roles.background.dark}}.tile.mono-black{background:${tokens.roles.surface.light}}.tile.mono-white{background:${tokens.roles.foreground.light}}
.tile svg{max-width:100%;height:auto}.mark svg{width:72px;height:72px}.lock svg{width:100%;max-height:40px}
.swatches{display:grid;grid-template-columns:repeat(6,1fr);gap:12px}
.sw{border:1px solid var(--border);border-radius:12px;overflow:hidden;background:var(--surface);font-size:var(--text-xs)}
.sw i{display:block;height:56px}.sw div{padding:8px 10px;display:grid;gap:2px}.sw code{font-family:var(--font-mono);color:var(--text-muted)}
.scale{display:grid;gap:10px}.row{display:grid;grid-template-columns:120px 1fr;align-items:baseline;gap:24px;border-top:1px solid var(--border-subtle);padding-top:10px}
.row code{font-family:var(--font-mono);font-size:var(--text-xs);color:var(--text-muted)}.row span{font-family:var(--font-display);font-weight:500;letter-spacing:-.02em;white-space:nowrap;overflow:hidden}
.fam{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.fam div{border:1px solid var(--border);border-radius:12px;padding:20px;background:var(--surface)}
.fam b{font-weight:500;font-size:var(--text-3xl);display:block}.fam small{color:var(--text-muted)}
.illos{display:grid;grid-template-columns:1fr 1fr;gap:16px}.illos div{border:1px solid var(--border);border-radius:16px;padding:24px;background:var(--surface)}.illos svg{width:100%;height:auto;max-height:260px}
</style></head><body><main>
<header><h1>Inference Finance brand kit</h1><p>Working name, naming proposal IF-D1 open. Testnet rehearsal design. Unaudited. Nothing deployed. No token exists.</p></header>
<section><h2>Mark</h2><div class="grid">${variants.map(v => tile(v, `<div class="mark">${svg(`logo/mark-${v}.svg`)}</div>`)).join("")}</div></section>
<section><h2>Lockup</h2><div class="grid" style="grid-template-columns:1fr 1fr">${variants.map(v => tile(v, `<div class="lock">${svg(`logo/lockup-${v}.svg`)}</div>`)).join("")}</div></section>
<section><h2>Role tokens</h2><div class="swatches">${roles.map(r => `<div class="sw"><i style="background:var(--${r})"></i><div><span>--${r}</span><code>${tokens.roles[r].light} / ${tokens.roles[r].dark}</code></div></div>`).join("")}</div></section>
<section><h2>Type</h2><div class="fam"><div style="font-family:var(--font-display)"><b>Geist</b><small>Display, 400 and 500, OFL-1.1</small></div><div style="font-family:var(--font-body)"><b>Inter</b><small>Body, 400 and 500, OFL-1.1</small></div><div style="font-family:var(--font-mono)"><b>Geist Mono</b><small>Code and IDs, OFL-1.1</small></div></div>
<div class="scale" style="margin-top:24px">${sizes.map(([k, v]) => `<div class="row"><code>--${k} ${v}</code><span style="font-size:var(--${k})">1 OMER = 1 IU</span></div>`).join("")}</div></section>
<section><h2>Illustration</h2><div class="illos"><div>${svg("illustrations/omer-unit.svg")}</div><div>${svg("illustrations/reward-streams.svg")}</div></div></section>
</main></body></html>`;
}

const shots = [
  { name: "site-desktop", port: 47331, path: "/", viewport: DESKTOP },
  { name: "site-mobile", port: 47331, path: "/", viewport: MOBILE },
  { name: "brand-sheet", port: 47331, path: "/brand-sheet", viewport: DESKTOP, sheet: true },
  { name: "screen-swap", port: 47332, path: "/?screen=swap", viewport: DESKTOP },
  { name: "screen-swap-rates-stale", port: 47332, path: "/?screen=swap&state=stale", viewport: DESKTOP },
  { name: "screen-pools", port: 47332, path: "/?screen=pools", viewport: DESKTOP },
  { name: "screen-lp-add", port: 47332, path: "/?screen=lp&pool=stable-t2&mode=imbalanced", viewport: DESKTOP },
  { name: "screen-lp-remove-stale", port: 47332, path: "/?screen=lp&tab=remove&pool=stable-t3&mode=proportional", viewport: DESKTOP },
  { name: "screen-dashboard", port: 47332, path: "/?screen=dashboard", viewport: DESKTOP },
  { name: "screen-swap-mobile", port: 47332, path: "/?screen=swap", viewport: MOBILE },
];

for (const app of ["site", "app-screens"]) {
  if (!existsSync(join(root, app, "dist/index.html"))) {
    console.error(`${app}/dist is missing. Run npm run build first.`);
    process.exit(1);
  }
}

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

const servers = [
  await serve(join(root, "site/dist"), 47331, { "/brand-sheet": brandSheet }),
  await serve(join(root, "app-screens/dist"), 47332),
];
const browser = await chromium.launch();
const errors = [];
try {
  for (const shot of shots) {
    for (const theme of THEMES) {
      const context = await browser.newContext({ viewport: shot.viewport, deviceScaleFactor: 1, reducedMotion: "reduce", colorScheme: theme });
      const page = await context.newPage();
      page.on("pageerror", e => errors.push(`${shot.name}-${theme}: ${e.message}`));
      page.on("request", r => { if (!r.url().startsWith("http://127.0.0.1:") && !r.url().startsWith("data:")) errors.push(`${shot.name}-${theme}: external request ${r.url()}`); });
      const sep = shot.path.includes("?") ? "&" : "?";
      await page.goto(`http://127.0.0.1:${shot.port}${shot.path}${shot.sheet ? "" : `${sep}theme=${theme}`}`, { waitUntil: "networkidle" });
      if (shot.sheet && theme === "dark") await page.evaluate(() => document.documentElement.setAttribute("data-theme", "dark"));
      await page.evaluate(async () => {
        await document.fonts.ready;
        for (let y = 0; y < document.documentElement.scrollHeight; y += 400) {
          window.scrollTo(0, y);
          await new Promise(r => setTimeout(r, 60));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(800);
      const file = join(out, `${shot.name}-${theme}.png`);
      await page.screenshot({ path: file, fullPage: true });
      console.log(`Wrote design/${shot.name}-${theme}.png`);
      await context.close();
    }
  }
} finally {
  await browser.close();
  for (const s of servers) s.close();
}
if (errors.length) {
  for (const e of errors) console.error(`FAIL  ${e}`);
  process.exit(1);
}
