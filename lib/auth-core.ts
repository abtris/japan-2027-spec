import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_SECONDS = 60 * 60 * 12;

export function credentialsConfigured(password: string, secret: string) {
  return password.length >= 15 && password.length <= 1024 && secret.length >= 32;
}

export function sessionToken(expires: number, password: string, secret: string, scope: string) {
  // Bind sessions to current credentials and environment; rotation invalidates old cookies.
  const signature = createHmac("sha256", secret).update(JSON.stringify(["japan-admin-v2", expires, password, scope])).digest("base64url");
  return `v2.${expires}.${signature}`;
}

export function verifySession(token: string | undefined, password: string, secret: string, scope: string, now = Date.now()) {
  if (!credentialsConfigured(password, secret) || !token || token.length > 100) return false;
  const parts = token.match(/^v2\.(\d{13})\.([A-Za-z0-9_-]{43})$/);
  if (!parts) return false;
  const expires = Number(parts[1]);
  return expires > now && expires <= now + SESSION_SECONDS * 1000 && equal(token, sessionToken(expires, password, secret, scope));
}

export function trustedOrigin(origin: string | null, allowed: string[]) {
  if (!origin || origin === "null") return false;
  try {
    const parsed = new URL(origin);
    if (parsed.origin !== origin || !["https:", "http:"].includes(parsed.protocol)) return false;
    return allowed.some((value) => { try { return new URL(value).origin === origin; } catch { return false; } });
  } catch {
    return false;
  }
}

export function mediaType(contentType: string | null) {
  return contentType?.split(";", 1)[0].trim().toLowerCase() || "";
}

export async function loginPassword(request: Request) {
  // Bound the stream itself: Content-Length is optional and cannot enforce the limit.
  const reader = request.body?.getReader();
  if (!reader) return "";
  const decoder = new TextDecoder();
  let size = 0;
  let body = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 16_384) {
        await reader.cancel();
        throw new RangeError("Login form is too large.");
      }
      body += decoder.decode(value, { stream: true });
    }
    const form = new URLSearchParams(body + decoder.decode());
    const values = form.getAll("password");
    return values.length === 1 && values[0].length <= 1024 ? values[0] : "";
  } finally {
    reader.releaseLock();
  }
}

export function equal(left: string, right: string) {
  return timingSafeEqual(createHash("sha256").update(left).digest(), createHash("sha256").update(right).digest());
}

export function verifyBearer(authorization: string | null, apiToken: string) {
  const bearer = authorization?.match(/^Bearer ([^\s]+)$/i)?.[1];
  return Boolean(bearer && apiToken.length >= 32 && equal(bearer, apiToken));
}
