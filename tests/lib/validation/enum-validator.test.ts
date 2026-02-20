import { describe, it, expect } from "vitest";
import { z } from "zod";
import { createEnumValidator } from "~/lib/validation";

describe("createEnumValidator", () => {
  const colorSchema = z.enum(["RED", "GREEN", "BLUE"]);
  const validateColor = createEnumValidator(colorSchema, "color");

  it("returns parsed value for valid input", () => {
    expect(validateColor("RED")).toBe("RED");
    expect(validateColor("GREEN")).toBe("GREEN");
  });

  it("throws descriptive error for invalid input", () => {
    expect(() => validateColor("PURPLE")).toThrow("Invalid color: PURPLE");
  });

  it("throws for empty string", () => {
    expect(() => validateColor("")).toThrow("Invalid color: ");
  });
});
