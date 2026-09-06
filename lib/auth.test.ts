import assert from "node:assert/strict";
import test from "node:test";
import { credentialsConfigured, loginPassword, mediaType, sessionToken, SESSION_SECONDS, trustedOrigin, verifyBearer, verifySession } from "./auth-core.ts";

test("API bearer authentication requires the configured token", () => {
  const token = "a".repeat(32);
  assert.equal(verifyBearer(`Bearer ${token}`, token), true);
  assert.equal(verifyBearer("Bearer wrong", token), false);
  assert.equal(verifyBearer(`Bearer ${token}`, "a".repeat(31)), false);
  assert.equal(verifyBearer(null, token), false);
});

test("sessions reject tampering, expiry, old formats and credential/environment changes", () => {
  const now = 1_800_000_000_000;
  const password = "test-password-for-audit";
  const secret = "s".repeat(32);
  const expires = now + SESSION_SECONDS * 1000;
  const token = sessionToken(expires, password, secret, "production");
  const verify = (value: string | undefined) => verifySession(value, password, secret, "production", now);
  assert.equal(verify(token), true);
  assert.equal(verify(token + ".extra"), false);
  assert.equal(verify(token.slice(0, -1) + "!"), false);
  assert.equal(verify(undefined), false);
  assert.equal(verify(token.replace("v2.", "")), false);
  assert.equal(verify(sessionToken(now, password, secret, "production")), false);
  assert.equal(verify(sessionToken(expires + 1, password, secret, "production")), false);
  assert.equal(verifySession(token, password + "changed", secret, "production", now), false);
  assert.equal(verifySession(token, password, secret + "changed", "production", now), false);
  assert.equal(verifySession(token, password, secret, "preview", now), false);
  assert.equal(credentialsConfigured("short", secret), false);
  assert.equal(credentialsConfigured("p".repeat(15), secret), true);
  assert.equal(credentialsConfigured("p".repeat(1025), secret), false);
  assert.equal(credentialsConfigured(password, "short"), false);
});

test("origin validation rejects missing, opaque, sibling and lookalike origins", () => {
  const allowed = ["https://japan.example.net/", "https://preview.example.net"];
  assert.equal(trustedOrigin("https://japan.example.net", allowed), true);
  assert.equal(trustedOrigin("https://preview.example.net", allowed), true);
  for (const origin of [null, "null", "", "https://sibling.example.net", "https://japan.example.net.attacker.net", "https://japan.example.net@attacker.net", "http://japan.example.net", "https://japan.example.net:444", "https://japan.example.net/path"]) {
    assert.equal(trustedOrigin(origin, allowed), false, String(origin));
  }
  assert.equal(trustedOrigin("https://japan.example.net", ["*"]), false);
  assert.equal(mediaType("Application/JSON; charset=utf-8"), "application/json");
  assert.equal(mediaType(null), "");
  assert.notEqual(mediaType("text/plain"), "application/json");
});

test("login parsing bounds streamed bodies and rejects ambiguous/oversized passwords", async () => {
  const request = (body: string) => new Request("https://japan.example.net/api/admin/login", { method: "POST", body });
  assert.equal(await loginPassword(request("password=correct+horse+%C5%BE")), "correct horse ž");
  assert.equal(await loginPassword(request("password=first&password=second")), "");
  assert.equal(await loginPassword(request("password=" + "a".repeat(1025))), "");
  await assert.rejects(loginPassword(request("password=" + "a".repeat(16_384))), RangeError);
  const stream = new ReadableStream({ start(controller) {
    controller.enqueue(new Uint8Array(10_000));
    controller.enqueue(new Uint8Array(10_000));
    controller.close();
  } });
  await assert.rejects(loginPassword(new Request("https://japan.example.net", { method: "POST", body: stream, duplex: "half" } as RequestInit)), RangeError);
});
