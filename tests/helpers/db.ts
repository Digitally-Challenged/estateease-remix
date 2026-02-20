import { vi } from "vitest";

export function createMockStatement(data: unknown = undefined) {
  return {
    run: vi.fn().mockReturnValue({ changes: 1, lastInsertRowid: 1 }),
    get: vi.fn().mockReturnValue(data),
    all: vi.fn().mockReturnValue(Array.isArray(data) ? data : data ? [data] : []),
    iterate: vi.fn().mockReturnValue([]),
    pluck: vi.fn().mockReturnThis(),
    bind: vi.fn().mockReturnThis(),
    columns: vi.fn().mockReturnValue([]),
    safeIntegers: vi.fn().mockReturnThis(),
  };
}

export function createMockDatabase() {
  const statements = new Map<string, ReturnType<typeof createMockStatement>>();
  return {
    prepare: vi.fn((sql: string) => {
      if (!statements.has(sql)) {
        statements.set(sql, createMockStatement());
      }
      return statements.get(sql)!;
    }),
    exec: vi.fn(),
    transaction: vi.fn((fn: Function) => fn),
    pragma: vi.fn(),
    close: vi.fn(),
    _statements: statements,
    _mockStatementReturn(sqlPattern: string, data: unknown) {
      const stmt = createMockStatement(data);
      statements.set(sqlPattern, stmt);
      return stmt;
    },
  };
}
