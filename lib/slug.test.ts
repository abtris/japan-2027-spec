import assert from "node:assert/strict";
import test from "node:test";
import { entrySlug } from "./slug.ts";

test("entry slugs support Czech titles and satisfy the API limits", () => {
  assert.equal(entrySlug("  Kjóto: chrám & večerní déšť! "), "kjoto-chram-vecerni-dest");
  assert.equal(entrySlug("🌸"), "");
  const long = entrySlug("Sakury ".repeat(30));
  assert.ok(long.length <= 80);
  assert.match(long, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
});
