import { z } from "zod";

/**
 * Creates a typed enum validator from a Zod schema.
 * Replaces the repeated pattern of safeParse + throw per-enum.
 */
export function createEnumValidator<T>(
  schema: z.ZodType<T>,
  fieldName: string,
): (value: string) => T {
  return (value: string): T => {
    const result = schema.safeParse(value);
    if (!result.success) {
      throw new Error(`Invalid ${fieldName}: ${value}`);
    }
    return result.data;
  };
}

/**
 * Shared validation error formatter.
 * Formats Zod validation errors into a { fieldPath: [messages] } map.
 */
export function formatValidationErrors(
  error: z.ZodError | { issues: Array<{ path: (string | number)[]; message: string }> },
): Record<string, string[]> {
  const formatted: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const path = issue.path.join(".");
    if (!formatted[path]) {
      formatted[path] = [];
    }
    formatted[path].push(issue.message);
  }

  return formatted;
}
