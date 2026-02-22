import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Returns Tailwind text+bg classes for document status badges.
 * Covers will statuses (EXECUTED, SIGNED, DRAFT, REVOKED)
 * and POA statuses (ACTIVE, DRAFT, REVOKED, EXPIRED).
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case "EXECUTED":
    case "ACTIVE":
      return "text-green-600 bg-green-50";
    case "SIGNED":
      return "text-blue-600 bg-blue-50";
    case "DRAFT":
      return "text-yellow-600 bg-yellow-50";
    case "REVOKED":
      return "text-red-600 bg-red-50";
    case "EXPIRED":
    default:
      return "text-gray-600 bg-gray-50";
  }
}

// Re-export from utils/format for backward compatibility
export { formatDate, formatCurrency } from "~/utils/format";
