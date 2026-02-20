import { describe, it, expect } from "vitest";
import { z } from "zod";
import { formatValidationErrors } from "~/lib/validation";

describe("formatValidationErrors", () => {
  it("formats a single field error", () => {
    const schema = z.object({ name: z.string().min(1, "Name is required") });
    const result = schema.safeParse({ name: "" });
    if (!result.success) {
      const formatted = formatValidationErrors(result.error);
      expect(formatted).toEqual({ name: ["Name is required"] });
    }
  });

  it("formats multiple errors on same field", () => {
    const schema = z.object({
      password: z.string().min(8, "Too short").regex(/[A-Z]/, "Need uppercase"),
    });
    const result = schema.safeParse({ password: "ab" });
    if (!result.success) {
      const formatted = formatValidationErrors(result.error);
      expect(formatted.password).toContain("Too short");
      expect(formatted.password).toContain("Need uppercase");
    }
  });

  it("formats nested path errors", () => {
    const schema = z.object({
      address: z.object({ city: z.string().min(1, "City required") }),
    });
    const result = schema.safeParse({ address: { city: "" } });
    if (!result.success) {
      const formatted = formatValidationErrors(result.error);
      expect(formatted["address.city"]).toEqual(["City required"]);
    }
  });

  it("returns empty object for no issues", () => {
    const error = new z.ZodError([]);
    const formatted = formatValidationErrors(error);
    expect(formatted).toEqual({});
  });
});
