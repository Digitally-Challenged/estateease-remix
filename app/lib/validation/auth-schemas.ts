import { z } from "zod";

/**
 * Password validation schema with comprehensive requirements
 */
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .max(128, "Password cannot exceed 128 characters")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)",
  );

/**
 * Email validation schema
 */
export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .max(255, "Email cannot exceed 255 characters")
  .email("Please enter a valid email address")
  .toLowerCase();

/**
 * Name validation schema
 */
export const nameSchema = z
  .string()
  .min(1, "Name is required")
  .max(50, "Name cannot exceed 50 characters")
  .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, apostrophes, and hyphens")
  .trim();

/**
 * Phone number validation schema
 */
export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number")
  .optional()
  .or(z.literal(""));

/**
 * User registration schema
 */
export const registerSchema = z
  .object({
    firstName: nameSchema,
    lastName: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "You must accept the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/**
 * User login schema
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional().default(false),
});

/**
 * Password reset request schema
 */
export const passwordResetRequestSchema = z.object({
  email: emailSchema,
});

/**
 * Password reset schema
 */
export const passwordResetSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/**
 * Change password schema
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

/**
 * User profile update schema
 */
export const profileUpdateSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  dateOfBirth: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), "Invalid date format")
    .transform((date) => new Date(date))
    .optional(),
  bio: z.string().max(500, "Bio cannot exceed 500 characters").optional().or(z.literal("")),
});

/**
 * Session validation schema
 */
export const sessionSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  email: emailSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  isActive: z.boolean().default(true),
  lastLoginAt: z.date().optional(),
  expiresAt: z.date(),
});

/**
 * Two-factor authentication setup schema
 */
export const twoFactorSetupSchema = z.object({
  secret: z.string().min(1, "Secret is required"),
  token: z
    .string()
    .length(6, "Token must be exactly 6 digits")
    .regex(/^\d{6}$/, "Token must contain only digits"),
});

/**
 * Two-factor authentication verification schema
 */
export const twoFactorVerifySchema = z.object({
  token: z
    .string()
    .length(6, "Token must be exactly 6 digits")
    .regex(/^\d{6}$/, "Token must contain only digits"),
});

/**
 * Form validation schemas (for HTML forms)
 */
export const registerFormSchema = z
  .object({
    firstName: z.string().min(1, "First name is required").max(50, "First name too long"),
    lastName: z.string().min(1, "Last name is required").max(50, "Last name too long"),
    email: z.string().min(1, "Email is required").email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    acceptTerms: z.string().refine((val) => val === "on", {
      message: "You must accept the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginFormSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z
    .string()
    .optional()
    .transform((val) => val === "on"),
});

export const passwordResetRequestFormSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
});

export const passwordResetFormSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const changePasswordFormSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

export const profileUpdateFormSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50, "First name too long"),
  lastName: z.string().min(1, "Last name is required").max(50, "Last name too long"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  phone: z.string().optional().or(z.literal("")),
  dateOfBirth: z.string().optional().or(z.literal("")),
  bio: z.string().max(500, "Bio too long").optional().or(z.literal("")),
});

/**
 * Type exports
 */
export type ValidatedRegister = z.infer<typeof registerSchema>;
export type ValidatedLogin = z.infer<typeof loginSchema>;
export type ValidatedPasswordResetRequest = z.infer<typeof passwordResetRequestSchema>;
export type ValidatedPasswordReset = z.infer<typeof passwordResetSchema>;
export type ValidatedChangePassword = z.infer<typeof changePasswordSchema>;
export type ValidatedProfileUpdate = z.infer<typeof profileUpdateSchema>;
export type ValidatedSession = z.infer<typeof sessionSchema>;
export type ValidatedTwoFactorSetup = z.infer<typeof twoFactorSetupSchema>;
export type ValidatedTwoFactorVerify = z.infer<typeof twoFactorVerifySchema>;

// Form type exports
export type ValidatedRegisterForm = z.infer<typeof registerFormSchema>;
export type ValidatedLoginForm = z.infer<typeof loginFormSchema>;
export type ValidatedPasswordResetRequestForm = z.infer<typeof passwordResetRequestFormSchema>;
export type ValidatedPasswordResetForm = z.infer<typeof passwordResetFormSchema>;
export type ValidatedChangePasswordForm = z.infer<typeof changePasswordFormSchema>;
export type ValidatedProfileUpdateForm = z.infer<typeof profileUpdateFormSchema>;

/**
 * Validation helper functions
 */
export const validateEmail = (email: string) => {
  const result = emailSchema.safeParse(email);
  if (!result.success) {
    throw new Error(`Invalid email: ${email}`);
  }
  return result.data;
};

export const validatePassword = (password: string) => {
  const result = passwordSchema.safeParse(password);
  if (!result.success) {
    throw new Error(`Invalid password: ${result.error.issues[0].message}`);
  }
  return result.data;
};

/**
 * Authentication validation error formatter
 */
export const formatAuthValidationErrors = (error: z.ZodError) => {
  const formatted: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const path = issue.path.join(".");
    if (!formatted[path]) {
      formatted[path] = [];
    }
    formatted[path].push(issue.message);
  }

  return formatted;
};
