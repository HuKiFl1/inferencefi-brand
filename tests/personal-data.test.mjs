import assert from "node:assert/strict";
import { test } from "node:test";
import { checkPersonalData, hashWord, scanText } from "../scripts/check-personal-data.mjs";
import { root } from "./helpers.mjs";

test("the working tree has no personal data or secrets", () => {
  assert.deepEqual(checkPersonalData(root), []);
});

test("the scan catches emails, local paths, keys, seeds and DIDs", () => {
  const home = ["", "home", "someone", "project"].join("/");
  const text = [
    `contact: ${["person", "mail.test"].join("@")}.org`,
    `cwd ${home}`,
    `key 0x${"ab".repeat(32)}`,
    ["mnemonic", '"abandon ability able"'].join(" = "),
    `id ${["did", "key", "z6Mkexample"].join(":")}`,
    `-----BEGIN ${"PRIVATE"} KEY-----`,
  ].join("\n");
  const ids = new Set(scanText(text).map(h => h.id));
  for (const id of ["email", "unix home path", "hex private key", "seed or secret assignment", "DID", "private key block"]) {
    assert.ok(ids.has(id), `expected ${id}`);
  }
});

test("listed names are matched by hash", () => {
  const deny = new Set([hashWord("zebedee")]);
  assert.equal(scanText("Signed off by Zebedee", deny).length, 1);
  assert.equal(scanText("Signed off by HuKiFl1", deny).length, 0);
});

test("RFC 2606 placeholder emails are allowed", () => {
  assert.equal(scanText(`placeholder ${["you", "example.com"].join("@")}`).length, 0);
});
