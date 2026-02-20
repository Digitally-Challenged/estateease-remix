import { describe, it, expect } from "vitest";
import {
  assetFormSchema,
  loginFormSchema,
  registerFormSchema,
} from "~/lib/validation";

describe("assetFormSchema", () => {
  it("validates a complete asset form", () => {
    const result = assetFormSchema.safeParse({
      name: "Test Asset",
      category: "REAL_ESTATE",
      value: "500000",
      type: "RESIDENTIAL",
      ownershipType: "INDIVIDUAL",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing required fields", () => {
    const result = assetFormSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects empty name", () => {
    const result = assetFormSchema.safeParse({
      name: "",
      category: "REAL_ESTATE",
      value: "500000",
      type: "RESIDENTIAL",
      ownershipType: "INDIVIDUAL",
    });
    expect(result.success).toBe(false);
  });
});

describe("loginFormSchema", () => {
  it("validates correct login data", () => {
    const result = loginFormSchema.safeParse({
      email: "test@example.com",
      password: "SecurePass123!",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = loginFormSchema.safeParse({
      email: "not-an-email",
      password: "SecurePass123!",
    });
    expect(result.success).toBe(false);
  });
});

describe("registerFormSchema", () => {
  it("validates correct registration data", () => {
    const result = registerFormSchema.safeParse({
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      password: "SecurePass123!",
      confirmPassword: "SecurePass123!",
      acceptTerms: "on",
    });
    expect(result.success).toBe(true);
  });

  it("rejects mismatched passwords", () => {
    const result = registerFormSchema.safeParse({
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      password: "SecurePass123!",
      confirmPassword: "DifferentPass456!",
      acceptTerms: "on",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing acceptTerms", () => {
    const result = registerFormSchema.safeParse({
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      password: "SecurePass123!",
      confirmPassword: "SecurePass123!",
    });
    expect(result.success).toBe(false);
  });
});
