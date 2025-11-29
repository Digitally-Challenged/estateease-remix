import { describe, it, expect } from "vitest";
import { AssetCategory, OwnershipType } from "../app/types/enums";
import { WillStatus } from "../app/types/documents";
import { formatCurrency } from "../app/utils/format";

describe("Basic Type Safety Tests", () => {
  it("should have working enum types", () => {
    expect(AssetCategory.REAL_ESTATE).toBe("REAL_ESTATE");
    expect(OwnershipType.INDIVIDUAL).toBe("INDIVIDUAL");
    expect(WillStatus.DRAFT).toBe("DRAFT");
  });

  it("should format currency correctly", () => {
    expect(formatCurrency(1000)).toBe("$1,000.00");
    expect(formatCurrency(0)).toBe("$0.00");
    expect(formatCurrency(-500)).toBe("-$500.00");
  });

  it("should handle string conversions", () => {
    const testObj = { name: "test", value: 123 };
    expect(String(testObj.name)).toBe("test");
    expect(String(testObj.value)).toBe("123");
  });

  it("should handle array filtering", () => {
    const testArray = [1, null, 2, undefined, 3];
    const filtered = testArray.filter(Boolean);
    expect(filtered).toEqual([1, 2, 3]);
  });

  it("should handle type casting", () => {
    const stringValue = "DRAFT";
    const enumValue = stringValue as WillStatus;
    expect(enumValue).toBe(WillStatus.DRAFT);
  });
});
