import { createHmac, timingSafeEqual } from "node:crypto";

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) throw new Error("Set a random SESSION_SECRET with at least 32 characters; run npm run setup for the local demo.");
  return value;
}

export function createSession(subject: string, lifetimeSeconds: number) {
  const payload = Buffer.from(JSON.stringify({ subject, expires: Date.now() + lifetimeSeconds * 1000 })).toString("base64url");
  const signature = createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function verifySession(token: string | undefined, subject: string): boolean {
  if (!token) return false;
  try {
    const [payload, signature, extra] = token.split(".");
    if (!payload || !signature || extra) return false;
    const expected = createHmac("sha256", secret()).update(payload).digest();
    const actual = Buffer.from(signature, "base64url");
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return false;
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return data.subject === subject && typeof data.expires === "number" && data.expires > Date.now();
  } catch {
    return false;
  }
}
