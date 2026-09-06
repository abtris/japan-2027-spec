import assert from "node:assert/strict";
import { test } from "node:test";
import { createStoredSession, loginRetryAfter, revokeStoredSession, verifyStoredSession } from "./auth-store.ts";

test("Redis sessions are revocable, credential/environment bound, expiring, and fail closed", async (t) => {
  const env = { ...process.env };
  t.after(() => { process.env = env; });
  Object.assign(process.env, {
    UPSTASH_REDIS_REST_URL: "https://redis.example.test", UPSTASH_REDIS_REST_TOKEN: "test-only",
    ADMIN_PASSWORD: "test-only-password", ADMIN_SESSION_SECRET: "s".repeat(32), VERCEL_ENV: "preview",
  });
  const records = new Map<string, string>();
  let fail = false;
  let retry: unknown = 900;
  const calls: (string | number)[][] = [];
  t.mock.method(globalThis, "fetch", async (_url: unknown, init: RequestInit) => {
    assert.equal(init.cache, "no-store");
    assert.equal(init.redirect, "error");
    if (fail) throw new Error("Simulated outage");
    const command = JSON.parse(init.body as string);
    calls.push(command);
    const [op, key, value] = command;
    let result: unknown;
    if (op === "SET") {
      assert.deepEqual(command.slice(3), ["EX", 43200]);
      records.set(key, value); result = "OK";
    } else if (op === "GET") result = records.get(key) ?? null;
    else if (op === "DEL") result = Number(records.delete(key));
    else if (op === "EVAL") {
      assert.equal(command[2], 1);
      assert.match(command[1], /EXPIRE/);
      result = retry;
    } else assert.fail("Unexpected command");
    return Response.json({ result });
  });
  assert.equal(await verifyStoredSession("v2.old-cookie"), false);
  assert.equal(calls.length, 0);
  const token = await createStoredSession();
  assert.notEqual(token, await createStoredSession());
  assert.equal(await verifyStoredSession(token), true);
  assert.ok([...records.keys()].every((key) => !key.includes(token)));
  process.env.ADMIN_PASSWORD = "changed-test-password";
  assert.equal(await verifyStoredSession(token), false);
  process.env.ADMIN_PASSWORD = "test-only-password";
  process.env.VERCEL_ENV = "production";
  assert.equal(await verifyStoredSession(token), false);
  process.env.VERCEL_ENV = "preview";
  await revokeStoredSession(token);
  assert.equal(await verifyStoredSession(token), false);
  assert.equal(await loginRetryAfter("test-ip"), 900);
  retry = 0;
  assert.equal(await loginRetryAfter("test-ip"), 0);
  retry = "invalid";
  await assert.rejects(loginRetryAfter("test-ip"));
  fail = true;
  assert.equal(await verifyStoredSession(token), false);
  await assert.rejects(createStoredSession());
  await assert.rejects(revokeStoredSession(token));
  await assert.rejects(loginRetryAfter("test-ip"));
});
