import { describe, it, expect } from "vitest";
import {
  formatCurrency,
  formatDate,
  formatPercentage,
  formatPhoneNumber,
  formatCompactNumber,
  formatFileSize,
  pluralize,
} from "~/utils/format";

describe("formatCurrency", () => {
  it("formats positive values", () => {
    expect(formatCurrency(1000)).toBe("$1,000.00");
    expect(formatCurrency(1234567.89)).toBe("$1,234,567.89");
  });

  it("formats zero", () => {
    expect(formatCurrency(0)).toBe("$0.00");
  });

  it("formats negative values", () => {
    expect(formatCurrency(-500)).toBe("-$500.00");
  });

  it("formats with different currency", () => {
    const result = formatCurrency(1000, "EUR");
    // EUR formatting includes the euro sign
    expect(result).toContain("1,000.00");
  });

  it("formats small decimal values", () => {
    expect(formatCurrency(0.99)).toBe("$0.99");
    expect(formatCurrency(0.1)).toBe("$0.10");
  });
});

describe("formatDate", () => {
  it("formats a date string", () => {
    const result = formatDate("2025-01-15");
    // Default en-US format
    expect(result).toContain("2025");
  });

  it("formats a Date object", () => {
    const date = new Date(2025, 0, 15); // Jan 15, 2025
    const result = formatDate(date);
    expect(result).toContain("2025");
  });

  it("accepts custom format options", () => {
    // Use Date constructor to avoid UTC/local timezone offset issues with date strings
    const date = new Date(2025, 5, 15); // June 15, 2025 in local time
    const result = formatDate(date, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    expect(result).toContain("June");
    expect(result).toContain("15");
    expect(result).toContain("2025");
  });
});

describe("formatPercentage", () => {
  it("formats decimal as percentage", () => {
    expect(formatPercentage(0.5)).toBe("50%");
    expect(formatPercentage(1)).toBe("100%");
    expect(formatPercentage(0)).toBe("0%");
  });

  it("formats with decimal places", () => {
    expect(formatPercentage(0.3333, 2)).toBe("33.33%");
    expect(formatPercentage(0.5, 1)).toBe("50.0%");
  });

  it("handles values greater than 1", () => {
    expect(formatPercentage(1.5)).toBe("150%");
  });
});

describe("formatPhoneNumber", () => {
  it("formats 10-digit phone number", () => {
    expect(formatPhoneNumber("5551234567")).toBe("(555) 123-4567");
  });

  it("formats phone with existing formatting", () => {
    expect(formatPhoneNumber("555-123-4567")).toBe("(555) 123-4567");
  });

  it("returns original for non-10-digit numbers", () => {
    expect(formatPhoneNumber("12345")).toBe("12345");
    expect(formatPhoneNumber("+15551234567")).toBe("+15551234567");
  });
});

describe("formatCompactNumber", () => {
  it("formats billions", () => {
    expect(formatCompactNumber(1500000000)).toBe("$1.5B");
    expect(formatCompactNumber(1000000000)).toBe("$1.0B");
  });

  it("formats millions", () => {
    expect(formatCompactNumber(2500000)).toBe("$2.5M");
    expect(formatCompactNumber(1000000)).toBe("$1.0M");
  });

  it("formats thousands", () => {
    expect(formatCompactNumber(5000)).toBe("$5K");
    expect(formatCompactNumber(1500)).toBe("$2K"); // rounds to nearest K
  });

  it("formats small numbers as currency", () => {
    expect(formatCompactNumber(999)).toBe("$999.00");
    expect(formatCompactNumber(0)).toBe("$0.00");
  });
});

describe("formatFileSize", () => {
  it("formats zero bytes", () => {
    expect(formatFileSize(0)).toBe("0 Bytes");
  });

  it("formats bytes", () => {
    expect(formatFileSize(500)).toBe("500 Bytes");
  });

  it("formats kilobytes", () => {
    expect(formatFileSize(1024)).toBe("1 KB");
    expect(formatFileSize(1536)).toBe("1.5 KB");
  });

  it("formats megabytes", () => {
    expect(formatFileSize(1048576)).toBe("1 MB");
  });

  it("formats gigabytes", () => {
    expect(formatFileSize(1073741824)).toBe("1 GB");
  });
});

describe("pluralize", () => {
  it("returns singular for count of 1", () => {
    expect(pluralize(1, "property", "properties")).toBe("1 property");
  });

  it("returns plural for count of 0", () => {
    expect(pluralize(0, "property", "properties")).toBe("0 properties");
  });

  it("returns plural for count > 1", () => {
    expect(pluralize(5, "property", "properties")).toBe("5 properties");
  });
});
