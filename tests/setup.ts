import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock SQLite database
vi.mock("better-sqlite3", () => ({
  default: vi.fn(() => ({
    prepare: vi.fn(() => ({
      run: vi.fn().mockReturnValue({ lastInsertRowid: 1 }),
      get: vi.fn().mockReturnValue(null),
      all: vi.fn().mockReturnValue([]),
    })),
    close: vi.fn(),
    pragma: vi.fn(),
    exec: vi.fn(),
  })),
}));

// Mock Remix router hooks
vi.mock("@remix-run/react", () => ({
  useNavigation: vi.fn(() => ({ state: "idle" })),
  useSubmit: vi.fn(() => vi.fn()),
  useFetcher: vi.fn(() => ({
    submit: vi.fn(),
    data: null,
    state: "idle",
  })),
  Form: vi.fn(({ children, ...props }: any) => {
    const React = require("react");
    return React.createElement("form", props, children);
  }),
  Link: vi.fn(({ children, to, ...props }: any) => {
    const React = require("react");
    return React.createElement("a", { ...props, href: to }, children);
  }),
}));

// Mock auth server
vi.mock("~/lib/auth.server", () => ({
  requireUser: vi.fn().mockResolvedValue({ id: "test-user", email: "test@example.com" }),
}));

// Mock database functions
vi.mock("~/lib/database", () => ({
  getDatabase: vi.fn(() => ({
    prepare: vi.fn(() => ({
      run: vi.fn().mockReturnValue({ lastInsertRowid: 1 }),
      get: vi.fn().mockReturnValue(null),
      all: vi.fn().mockReturnValue([]),
    })),
    close: vi.fn(),
  })),
}));

// Mock environment variables
process.env.NODE_ENV = "test";
process.env.SESSION_SECRET = "test-secret";
process.env.DATABASE_URL = ":memory:";

// Global test utilities
declare global {
  var vi: (typeof import("vitest"))["vi"];
  var beforeEach: (typeof import("vitest"))["beforeEach"];
  var describe: (typeof import("vitest"))["describe"];
  var it: (typeof import("vitest"))["it"];
  var expect: (typeof import("vitest"))["expect"];
}

globalThis.vi = vi;
