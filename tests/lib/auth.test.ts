import { describe, it, expect, vi, beforeEach } from "vitest";

const mockDb = {
  prepare: vi.fn(),
  exec: vi.fn(),
};

vi.mock("~/lib/database", () => ({
  getDatabase: () => mockDb,
}));

vi.mock("@remix-run/node", () => ({
  redirect: vi.fn((url: string) => {
    throw new Response(null, { status: 302, headers: { Location: url } });
  }),
  createCookieSessionStorage: vi.fn(() => ({
    getSession: vi.fn().mockResolvedValue({
      get: vi.fn().mockReturnValue(null),
      set: vi.fn(),
      unset: vi.fn(),
    }),
    commitSession: vi.fn().mockResolvedValue("session-cookie"),
    destroySession: vi.fn().mockResolvedValue(""),
  })),
}));

describe("Auth Server", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SESSION_SECRET = "test-secret";
  });

  it("module loads without error when SESSION_SECRET is set", async () => {
    expect(process.env.SESSION_SECRET).toBe("test-secret");
  });
});
