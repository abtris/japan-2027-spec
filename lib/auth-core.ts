import { createHash, timingSafeEqual } from "node:crypto";

export function equal(left: string, right: string) {
  return timingSafeEqual(createHash("sha256").update(left).digest(), createHash("sha256").update(right).digest());
}

export function verifyBearer(authorization: string | null, apiToken: string) {
  const bearer = authorization?.match(/^Bearer ([^\s]+)$/i)?.[1];
  return Boolean(bearer && apiToken.length >= 32 && equal(bearer, apiToken));
}
