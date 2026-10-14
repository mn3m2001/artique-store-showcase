import { describe, it, expect, vi } from "vitest";
import { createSession, verifySession } from "@/lib/session";

describe("Signed access sessions", () => {
  it("rejects forged cookies and tokens issued for a different order", () => {
    expect(verifySession("auth_123_artique", "admin")).toBe(false);
    const token = createSession("order:first", 60);
    expect(verifySession(token, "order:first")).toBe(true);
    expect(verifySession(token, "admin")).toBe(false);
    expect(verifySession(token, "order:second")).toBe(false);
    expect(verifySession(`${token}changed`, "order:first")).toBe(false);
  });
  it("expires access at the deadline", () => {
    vi.useFakeTimers();
    try {
      const token = createSession("admin", 60);
      expect(verifySession(token, "admin")).toBe(true);
      vi.advanceTimersByTime(61_000);
      expect(verifySession(token, "admin")).toBe(false);
    } finally { vi.useRealTimers(); }
  });
});
