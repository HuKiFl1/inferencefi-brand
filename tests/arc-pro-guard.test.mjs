import assert from "node:assert/strict";
import { test } from "node:test";
import { checkArcPro } from "../scripts/check-arc-pro.mjs";
import { fixture, read, root } from "./helpers.mjs";

const lock = read("shared/arc-tiers.lock.json");
const tiers = JSON.parse(lock);
const aProItem = tiers.pro.find(name => !tiers.free.includes(name));

test("the repository vendors and imports Arc free items only", () => {
  const { violations, vendored } = checkArcPro(root);
  assert.deepEqual(violations, []);
  assert.ok(vendored.length > 10, "expected vendored Arc components");
  for (const name of vendored) assert.ok(tiers.free.includes(name), `${name} is free`);
});

test("the guard fails when an Arc Pro component directory is vendored", () => {
  const dir = fixture({
    "shared/arc-tiers.lock.json": lock,
    "shared/components/arc/button/button.tsx": "export const Button = () => null;\n",
    [`shared/components/arc/${aProItem}/${aProItem}.tsx`]: "export default function Item() { return null; }\n",
  });
  const { violations } = checkArcPro(dir);
  assert.ok(violations.some(v => v.includes(`Arc Pro item vendored: ${aProItem}`)), violations.join("\n"));
});

test("the guard fails on a Pro registry entry or token reference", () => {
  const proRegistry = ["@uiarc", "-pro"].join("");
  const dir = fixture({
    "shared/arc-tiers.lock.json": lock,
    "shared/components.json": JSON.stringify({ registries: { "@uiarc": "https://uiarc.dev/r/{name}.json", [proRegistry]: { url: ["https://uiarc.dev/r/", "pro/{name}.json"].join("") } } }),
  });
  const { violations } = checkArcPro(dir);
  assert.ok(violations.some(v => v.includes("Unexpected registry")), violations.join("\n"));
  assert.ok(violations.some(v => v.includes("Arc Pro marker")), violations.join("\n"));
});

test("the guard fails when app code imports an Arc item that is not vendored", () => {
  const dir = fixture({
    "shared/arc-tiers.lock.json": lock,
    "site/src/App.tsx": `import Item from "@arc/${aProItem}/${aProItem}";\n`,
  });
  const { violations } = checkArcPro(dir);
  assert.ok(violations.some(v => v.includes(`Arc Pro item imported: ${aProItem}`)), violations.join("\n"));
});
