import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { APPS, checkRuntime } from "../scripts/check-runtime.mjs";
import { root } from "./helpers.mjs";

// `npm test` runs `npm run build` first, so a failed build never reaches these tests.
test("the site and the app screens build", () => {
  for (const app of APPS) {
    assert.ok(existsSync(join(root, app, "dist/index.html")), `${app}/dist/index.html`);
  }
});

test("built pages make no network calls, load nothing external and include no trackers", () => {
  assert.deepEqual(checkRuntime(root), []);
});
