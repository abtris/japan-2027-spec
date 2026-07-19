import assert from "node:assert/strict";
import test from "node:test";
import { verifyBearer } from "./auth-core.ts";

test("API bearer authentication requires the configured token", () => {
  const token = "a".repeat(32);
  assert.equal(verifyBearer(`Bearer ${token}`, token), true);
  assert.equal(verifyBearer("Bearer wrong", token), false);
  assert.equal(verifyBearer(`Bearer ${token}`, "a".repeat(31)), false);
  assert.equal(verifyBearer(null, token), false);
});
