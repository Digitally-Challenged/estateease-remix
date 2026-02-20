import { redirect, createCookieSessionStorage } from "@remix-run/node";
import { updateUserProfile, type UpdateUserProfileInput } from "./dal";
import bcrypt from "bcryptjs";
import { getDatabase } from "./database";
import { type ValidatedRegister, type ValidatedLogin } from "./validation";

/**
 * Authentication server utilities for Remix routes
 */

export interface User {
  id: string;
  external_id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  email: string;
  phone_number?: string;
  date_of_birth?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface LoginUserRow {
  id: string;
  external_id: string;
  email: string;
  password_hash: string;
  is_active: number;
}

interface PasswordUserRow {
  id: string;
  password_hash: string;
}

/**
 * Default local-only user (no login required)
 */
const DEFAULT_USER: User = {
  id: "user-nick-001",
  external_id: "user-nick-001",
  first_name: "Nick",
  last_name: "Coleman",
  email: "nick@colemanlaw.com",
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

/**
 * Session configuration
 */
const sessionSecret = process.env.SESSION_SECRET || "local-dev-secret";

const { getSession, commitSession, destroySession } = createCookieSessionStorage({
  cookie: {
    name: "estateease_session",
    secure: process.env.NODE_ENV === "production",
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    httpOnly: true,
  },
});

/**
 * Default user ID for demo/development purposes
 * In a real application, this would come from session/authentication
 */

/**
 * Hash password using bcrypt
 */
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/**
 * Verify password using bcrypt
 */
async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Get user session from request
 */
export async function getUserSession(request: Request) {
  return getSession(request.headers.get("Cookie"));
}

/**
 * Get user ID from session
 */
export async function getUserIdFromSession(request: Request): Promise<string | null> {
  const session = await getUserSession(request);
  return session.get("userId") || null;
}

/**
 * Get user — always returns default user (local-only mode, no login required)
 */
export async function getUser(_request: Request): Promise<User | null> {
  return DEFAULT_USER;
}

/**
 * Requires a user — always returns default user (local-only mode)
 */
export async function requireUser(_request: Request): Promise<User> {
  return DEFAULT_USER;
}

/**
 * Create user session
 */
export async function createUserSession(userId: string, redirectTo: string = "/") {
  const session = await getSession();
  session.set("userId", userId);

  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

/**
 * Destroy user session (logout)
 */
export async function logout(request: Request) {
  const session = await getUserSession(request);

  return redirect("/login", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
}

/**
 * Register new user
 */
export async function register(
  userData: ValidatedRegister,
): Promise<{ success: boolean; error?: string; userId?: string }> {
  const db = getDatabase();

  try {
    // Check if user already exists
    const existingUser = db
      .prepare("SELECT id FROM users WHERE email = ? AND is_active = 1")
      .get(userData.email);

    if (existingUser) {
      return { success: false, error: "User with this email already exists" };
    }

    // Hash password
    const hashedPassword = await hashPassword(userData.password);

    // Create user
    const userId = `user-${Date.now()}`;
    const externalId = `user-${Date.now()}`;

    db.prepare(
      `
      INSERT INTO users (
        id, external_id, first_name, last_name, email, password_hash, 
        is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, 1, datetime('now'), datetime('now'))
    `,
    ).run(
      userId,
      externalId,
      userData.firstName,
      userData.lastName,
      userData.email,
      hashedPassword,
    );

    return { success: true, userId };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, error: "Registration failed" };
  }
}

/**
 * Login user
 */
export async function login(
  credentials: ValidatedLogin,
): Promise<{ success: boolean; error?: string; userId?: string }> {
  const db = getDatabase();

  try {
    // Find user by email
    const user = db
      .prepare(
        `
      SELECT id, external_id, email, password_hash, is_active 
      FROM users 
      WHERE email = ? AND is_active = 1
    `,
      )
      .get(credentials.email) as LoginUserRow | undefined;

    if (!user) {
      return { success: false, error: "Invalid email or password" };
    }

    // Verify password
    const isValidPassword = await verifyPassword(credentials.password, user.password_hash);

    if (!isValidPassword) {
      return { success: false, error: "Invalid email or password" };
    }

    // Update last login
    db.prepare(
      `
      UPDATE users 
      SET last_login_at = datetime('now'), updated_at = datetime('now')
      WHERE id = ?
    `,
    ).run(user.id);

    return { success: true, userId: user.external_id };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: "Login failed" };
  }
}

/**
 * Get current user ID — always returns default user ID (local-only mode)
 */
export async function getUserId(_request: Request): Promise<string> {
  return DEFAULT_USER.id;
}

/**
 * Check if user is authenticated — always true (local-only mode)
 */
export async function isAuthenticated(_request: Request): Promise<boolean> {
  return true;
}

/**
 * Change user password
 */
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<{ success: boolean; error?: string }> {
  const db = getDatabase();

  try {
    // Get current user with password hash
    const user = db
      .prepare(
        `
      SELECT id, password_hash 
      FROM users 
      WHERE external_id = ? AND is_active = 1
    `,
      )
      .get(userId) as PasswordUserRow | undefined;

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Verify current password
    const isValidPassword = await verifyPassword(currentPassword, user.password_hash);

    if (!isValidPassword) {
      return { success: false, error: "Current password is incorrect" };
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Update password
    db.prepare(
      `
      UPDATE users 
      SET password_hash = ?, updated_at = datetime('now')
      WHERE external_id = ?
    `,
    ).run(hashedNewPassword, userId);

    return { success: true };
  } catch (error) {
    console.error("Change password error:", error);
    return { success: false, error: "Failed to change password" };
  }
}

/**
 * Update user profile
 */
export async function updateProfile(
  userId: string,
  data: UpdateUserProfileInput,
): Promise<{ success: boolean; error?: string }> {
  try {
    updateUserProfile(userId, data);
    return { success: true };
  } catch (error) {
    console.error("Update profile error:", error);
    return { success: false, error: "Failed to update profile" };
  }
}
