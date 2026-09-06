import { createHash, randomBytes } from "node:crypto";
import { SESSION_SECONDS, sessionToken, verifySession } from "./auth-core.ts";

async function redis(...command: (string | number)[]): Promise<unknown> {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token || new URL(url).protocol !== "https:") throw new Error("Authentication storage unavailable.");
  const response = await fetch(url, {
    method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(command), cache: "no-store", signal: AbortSignal.timeout(5000), redirect: "error",
  });
  if (!response.ok) throw new Error("Authentication storage unavailable.");
  const body = await response.json();
  if (body.error || !("result" in body)) throw new Error("Authentication storage unavailable.");
  return body.result;
}

function key(kind: string, value: string) {
  return `japan-admin:${process.env.VERCEL_ENV || "local"}:${kind}:${createHash("sha256").update(value).digest("hex")}`;
}

export async function createStoredSession() {
  const token = randomBytes(32).toString("base64url");
  const value = sessionToken(Date.now() + SESSION_SECONDS * 1000, process.env.ADMIN_PASSWORD || "", process.env.ADMIN_SESSION_SECRET || "", process.env.VERCEL_ENV || "local");
  if (await redis("SET", key("session", token), value, "EX", SESSION_SECONDS) !== "OK") throw new Error("Authentication storage unavailable.");
  return token;
}

export async function verifyStoredSession(token?: string) {
  if (!token || !/^[A-Za-z0-9_-]{43}$/.test(token)) return false;
  // No positive cache: deleting the Redis record must revoke the next request.
  try {
    const value = await redis("GET", key("session", token));
    return typeof value === "string" && verifySession(value, process.env.ADMIN_PASSWORD || "", process.env.ADMIN_SESSION_SECRET || "", process.env.VERCEL_ENV || "local");
  } catch {
    return false; // Storage failure must never grant access.
  }
}

export async function revokeStoredSession(token?: string) {
  if (token && /^[A-Za-z0-9_-]{43}$/.test(token)) await redis("DEL", key("session", token));
}

export async function loginRetryAfter(ip: string) {
  // Atomic fixed window shared by all instances; blocked requests do not extend it.
  // ponytail: per-IP protection; use an edge WAF for distributed attacks and quota protection.
  const result = await redis("EVAL", `
    local count = tonumber(redis.call('GET', KEYS[1]) or '0')
    if count >= 5 then return math.max(1, redis.call('TTL', KEYS[1])) end
    redis.call('INCR', KEYS[1])
    if count == 0 then redis.call('EXPIRE', KEYS[1], 900) end
    return 0
  `, 1, key("login", ip));
  if (typeof result !== "number" || result < 0) throw new Error("Authentication storage unavailable.");
  return result;
}
