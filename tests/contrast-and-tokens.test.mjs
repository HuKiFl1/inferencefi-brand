import assert from "node:assert/strict";
import { test } from "node:test";
import { checkContrast } from "../scripts/check-contrast.mjs";
import { renderTokensCss } from "../scripts/build-tokens.mjs";
import { read, walk } from "./helpers.mjs";

const tokens = JSON.parse(read("brand/tokens.json"));

test("every listed colour pair meets WCAG AA in light and dark", () => {
  const failures = checkContrast(tokens).filter(r => !r.pass);
  assert.deepEqual(failures, []);
});

test("the contrast check catches a failing pair", () => {
  const broken = structuredClone(tokens);
  broken.roles["text-muted"].light = "#B0B8BC";
  const failures = checkContrast(broken).filter(r => !r.pass);
  assert.ok(failures.some(f => f.fg === "text-muted" && f.theme === "light"));
});

test("brand/tokens.css is generated from brand/tokens.json", () => {
  assert.equal(read("brand/tokens.css"), renderTokensCss(tokens));
});

test("every Arc semantic role has a light and a dark value", () => {
  const required = ["background", "surface", "surface-raised", "surface-muted", "foreground", "text-secondary", "text-muted", "border", "border-subtle", "border-strong", "accent", "accent-strong", "accent-subtle", "accent-foreground", "success", "warning", "danger", "info", "control-on", "control-glyph", "control-track", "control-thumb", "control-thumb-on", "series-1", "series-2", "series-3", "series-4"];
  for (const role of required) {
    assert.ok(tokens.roles[role]?.light && tokens.roles[role]?.dark, `${role} needs light and dark`);
  }
});

test("components use tokens only: no raw hex, rgb() or hsl() in first-party UI code", () => {
  const files = [
    ...walk("site/src", f => /\.(tsx?|css)$/.test(f)),
    ...walk("app-screens/src", f => /\.(tsx?|css)$/.test(f)),
    ...walk("shared/brand", f => /\.(tsx?|css)$/.test(f)),
  ];
  assert.ok(files.length > 10);
  const offenders = [];
  for (const file of files) {
    const text = read(file);
    for (const m of text.matchAll(/#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(|\boklch\(/g)) offenders.push(`${file}: ${m[0]}`);
  }
  assert.deepEqual(offenders, []);
});

test("UI type uses weights 400 and 500 only", () => {
  const css = [...walk("site/src", f => f.endsWith(".css")), ...walk("app-screens/src", f => f.endsWith(".css")), ...walk("shared/brand", f => f.endsWith(".css"))];
  for (const file of css) assert.doesNotMatch(read(file), /font-weight:\s*(600|700|800|900|bold)/, file);
});
