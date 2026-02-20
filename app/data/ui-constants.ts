/**
 * UI Constants for EstateEase Application
 *
 * This file contains all UI-related constants including pagination,
 * timeouts, animations, breakpoints, and component sizing.
 */

// ===========================
// PAGINATION CONSTANTS
// ===========================

/**
 * Pagination settings for tables and lists
 */
export const PAGINATION = {
  /** Default number of items per page */
  DEFAULT_PAGE_SIZE: 20,
  /** Available page size options for user selection */
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100] as const,
  /** Maximum items allowed per page */
  MAX_PAGE_SIZE: 100,
  /** Default starting page (1-indexed) */
  DEFAULT_PAGE: 1,
} as const;

// ===========================
// FILE UPLOAD CONSTANTS
// ===========================

/**
 * File upload limitations and settings
 */
export const FILE_UPLOAD = {
  /** Maximum file size in bytes (10MB) */
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  /** Maximum file size for images in bytes (5MB) */
  MAX_IMAGE_SIZE: 5 * 1024 * 1024,
  /** Maximum number of files per upload */
  MAX_FILES: 10,
  /** Allowed file types for documents */
  ALLOWED_DOCUMENT_TYPES: [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".txt", ".rtf"] as const,
  /** Allowed file types for images */
  ALLOWED_IMAGE_TYPES: [".jpg", ".jpeg", ".png", ".gif", ".webp"] as const,
  /** Allowed MIME types for documents */
  ALLOWED_DOCUMENT_MIMES: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
    "text/rtf",
  ] as const,
  /** Allowed MIME types for images */
  ALLOWED_IMAGE_MIMES: ["image/jpeg", "image/png", "image/gif", "image/webp"] as const,
} as const;

// ===========================
// TIMEOUT CONSTANTS
// ===========================

/**
 * Timeout durations in milliseconds
 */
export const TIMEOUTS = {
  /** Toast notification display duration */
  TOAST_DURATION: 4000,
  /** Success toast duration (shorter) */
  TOAST_SUCCESS: 3000,
  /** Error toast duration (longer) */
  TOAST_ERROR: 6000,
  /** Default API call timeout */
  API_TIMEOUT: 30000,
  /** Long-running API operations (file uploads, etc.) */
  API_LONG_TIMEOUT: 120000,
  /** Session timeout (30 minutes) */
  SESSION_TIMEOUT: 30 * 60 * 1000,
  /** Idle timeout before warning (25 minutes) */
  IDLE_WARNING_TIMEOUT: 25 * 60 * 1000,
  /** Auto-save interval */
  AUTO_SAVE_INTERVAL: 60000,
  /** Debounce delay for search */
  SEARCH_DEBOUNCE: 300,
  /** Debounce delay for form validation */
  VALIDATION_DEBOUNCE: 500,
} as const;

// ===========================
// ANIMATION CONSTANTS
// ===========================

/**
 * Animation durations in milliseconds
 */
export const ANIMATIONS = {
  /** Fast animations (tooltips, dropdowns) */
  FAST: 150,
  /** Normal animations (modals, sidebars) */
  NORMAL: 300,
  /** Slow animations (page transitions) */
  SLOW: 500,
  /** Loading spinner minimum display time */
  SPINNER_MIN_DURATION: 200,
  /** Skeleton loader pulse duration */
  SKELETON_PULSE: 1500,
  /** Progress bar animation */
  PROGRESS_DURATION: 400,
} as const;

// ===========================
// RESPONSIVE BREAKPOINTS
// ===========================

/**
 * Responsive design breakpoints in pixels
 * Aligned with Tailwind CSS default breakpoints
 */
export const BREAKPOINTS = {
  /** Small devices (phones) */
  SM: 640,
  /** Medium devices (tablets) */
  MD: 768,
  /** Large devices (desktops) */
  LG: 1024,
  /** Extra large devices (large desktops) */
  XL: 1280,
  /** 2X large devices (larger desktops) */
  "2XL": 1536,
} as const;

// ===========================
// TABLE CONSTANTS
// ===========================

/**
 * Table column width configurations
 */
export const TABLE_COLUMNS = {
  /** Checkbox column width */
  CHECKBOX: 40,
  /** Action buttons column width */
  ACTIONS: 120,
  /** ID column width */
  ID: 80,
  /** Status/badge column width */
  STATUS: 100,
  /** Date column width */
  DATE: 120,
  /** Currency/amount column width */
  AMOUNT: 150,
  /** Percentage column width */
  PERCENTAGE: 100,
  /** Name/title minimum width */
  NAME_MIN: 200,
  /** Description minimum width */
  DESCRIPTION_MIN: 300,
  /** Default column min width */
  DEFAULT_MIN: 100,
} as const;

// ===========================
// MODAL SIZES
// ===========================

/**
 * Modal dialog size configurations
 */
export const MODAL_SIZES = {
  /** Small modal (confirmations, simple forms) */
  SM: {
    width: 400,
    maxWidth: "90vw",
  },
  /** Medium modal (standard forms) */
  MD: {
    width: 600,
    maxWidth: "90vw",
  },
  /** Large modal (complex forms, previews) */
  LG: {
    width: 800,
    maxWidth: "90vw",
  },
  /** Extra large modal (tables, detailed views) */
  XL: {
    width: 1200,
    maxWidth: "95vw",
  },
  /** Full screen modal */
  FULL: {
    width: "100vw",
    height: "100vh",
  },
} as const;

// ===========================
// Z-INDEX LAYERS
// ===========================

/**
 * Z-index layer system for proper stacking
 */
export const Z_INDEX = {
  /** Behind everything */
  BEHIND: -1,
  /** Base level */
  BASE: 0,
  /** Dropdown menus */
  DROPDOWN: 10,
  /** Sticky elements (headers, etc.) */
  STICKY: 20,
  /** Fixed elements */
  FIXED: 30,
  /** Modal backdrop */
  MODAL_BACKDROP: 40,
  /** Modal content */
  MODAL: 50,
  /** Popover content */
  POPOVER: 60,
  /** Tooltip content */
  TOOLTIP: 70,
  /** Toast notifications */
  TOAST: 80,
  /** Critical alerts */
  ALERT: 90,
  /** Maximum z-index */
  MAX: 99,
} as const;

// ===========================
// FORM CONSTANTS
// ===========================

/**
 * Form-related UI constants
 */
export const FORM_UI = {
  /** Maximum number of items in a multi-select before showing search */
  MULTISELECT_SEARCH_THRESHOLD: 10,
  /** Maximum visible items in dropdown before scroll */
  DROPDOWN_MAX_HEIGHT: 300,
  /** Default textarea rows */
  TEXTAREA_DEFAULT_ROWS: 3,
  /** Maximum textarea rows for auto-resize */
  TEXTAREA_MAX_ROWS: 10,
  /** Field focus ring width */
  FOCUS_RING_WIDTH: 2,
  /** Field border radius */
  BORDER_RADIUS: 6,
} as const;

// ===========================
// CHART CONSTANTS
// ===========================

/**
 * Chart and visualization constants
 */
export const CHARTS = {
  /** Default chart height in pixels */
  DEFAULT_HEIGHT: 400,
  /** Small chart height */
  SMALL_HEIGHT: 250,
  /** Large chart height */
  LARGE_HEIGHT: 600,
  /** Default color palette */
  COLORS: [
    "#3B82F6", // blue-500
    "#10B981", // emerald-500
    "#F59E0B", // amber-500
    "#EF4444", // red-500
    "#8B5CF6", // violet-500
    "#EC4899", // pink-500
    "#14B8A6", // teal-500
    "#F97316", // orange-500
  ] as const,
  /** Chart animation duration */
  ANIMATION_DURATION: 750,
} as const;

// ===========================
// LOADING STATES
// ===========================

/**
 * Loading state configurations
 */
export const LOADING = {
  /** Minimum time to show loading state (prevents flashing) */
  MIN_DISPLAY_TIME: 200,
  /** Skeleton loader animation */
  SKELETON: {
    baseColor: "#f3f4f6",
    highlightColor: "#e5e7eb",
  },
  /** Progress bar steps */
  PROGRESS_STEPS: 100,
} as const;

// ===========================
// NOTIFICATION CONSTANTS
// ===========================

/**
 * Notification positioning and styling
 */
export const NOTIFICATIONS = {
  /** Toast position on screen */
  POSITION: "bottom-right" as const,
  /** Maximum number of toasts visible */
  MAX_VISIBLE: 3,
  /** Offset from screen edge */
  OFFSET: {
    x: 20,
    y: 20,
  },
  /** Gap between toasts */
  GAP: 10,
} as const;

// ===========================
// US STATES CONSTANTS
// ===========================

/**
 * Re-exported from ~/types/enums for backwards compatibility.
 * Canonical source: app/types/enums.ts
 */
export { US_STATES } from "~/types/enums";
