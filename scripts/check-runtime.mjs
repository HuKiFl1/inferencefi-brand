// Checks the built site and screens: no external loads, no network APIs, no trackers, and a CSP that blocks connections.
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
export const APPS = ["site", "app-screens"];

// Absolute URLs allowed to appear in a bundle: outbound links a person clicks, and XML namespace and error-doc
// strings inside React and the SVGs. None of them is loaded at runtime.
const ALLOWED_URL = [
  /^https:\/\/github\.com\/HuKiFl1\/(Flop|inferencefi-stableswap)$/,
  /^https:\/\/flop\.network\/whitepaper\/$/,
  /^https:\/\/react\.dev\/errors\/$/,
  /^http:\/\/www\.w3\.org\/(2000\/svg|1999\/xlink|1998\/Math\/MathML|XML\/1998\/namespace)$/,
];

const NETWORK_API = /\bfetch\(|XMLHttpRequest|sendBeacon|new WebSocket|new EventSource|importScripts\(/g;
const TRACKERS = /google-analytics|googletagmanager|gtag\(|plausible|segment\.(io|com)|posthog|sentry|hotjar|mixpanel|amplitude|clarity\.ms|facebook\.net|doubleclick\.net|matomo|umami\.is/gi;

function files(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files(full, out);
    else out.push(full);
  }
  return out;
}

export function checkRuntime(root = repoRoot) {
  const problems = [];
  for (const app of APPS) {
    const dist = join(root, app, "dist");
    if (!existsSync(join(dist, "index.html"))) {
      problems.push(`${app}: no dist/index.html. Run npm run build first.`);
      continue;
    }
    const html = readFileSync(join(dist, "index.html"), "utf8");
    if (!/http-equiv="Content-Security-Policy"[^>]*connect-src 'none'/.test(html)) problems.push(`${app}: index.html has no CSP with connect-src 'none'`);
    if (/<(script|link|img|iframe)[^>]+(src|href)="(https?:)?\/\//i.test(html)) problems.push(`${app}: index.html loads an external resource`);
    for (const file of files(dist).filter(f => /\.(js|css|html|svg)$/.test(f))) {
      const text = readFileSync(file, "utf8");
      const rel = relative(root, file);
      for (const m of text.matchAll(/https?:\/\/[A-Za-z0-9.\-_~:/?#@!$&'*+,;=%]+/g)) {
        const url = m[0].replace(/[`'",;)]+$/, "");
        if (!ALLOWED_URL.some(re => re.test(url))) problems.push(`${rel}: unexpected absolute URL ${url}`);
      }
      if (/\.css$/.test(file) && /url\(\s*["']?(https?:)?\/\//.test(text)) problems.push(`${rel}: CSS loads an external url()`);
      for (const m of text.matchAll(NETWORK_API)) problems.push(`${rel}: network API ${m[0]}`);
      for (const m of text.matchAll(TRACKERS)) problems.push(`${rel}: tracker reference ${m[0]}`);
    }
  }
  return problems;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const problems = checkRuntime();
  if (problems.length) {
    for (const p of problems) console.error(`FAIL  ${p}`);
    process.exit(1);
  }
  console.log("Built pages make no network calls, load nothing external and include no trackers.");
}
