import { redirect, createCookieSessionStorage } from "@remix-run/node";
import { getUserProfile, updateUserProfile, type UpdateUserProfileInput } from "./dal";
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

/**
 * Session configuration
 */
const sessionSecret = process.env.SESSION_SECRET || "default-secret-key-change-in-production";

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
// const DEFAULT_USER_ID = "user-nick-001";

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
 * Get user from session
 */
export async function getUser(request: Request): Promise<User | null> {
  const userId = await getUserIdFromSession(request);

  if (!userId) {
    return null;
  }

  const userProfile = getUserProfile(userId);

  if (!userProfile) {
    return null;
  }

  return {
    id: userId,
    external_id: userProfile.external_id || userId,
    first_name: userProfile.first_name,
    middle_name: userProfile.middle_name || undefined,
    last_name: userProfile.last_name,
    email: userProfile.email,
    phone_number: userProfile.phone_number || undefined,
    date_of_birth: userProfile.date_of_birth || undefined,
    is_active: Boolean(userProfile.is_active),
    created_at: userProfile.created_at,
    updated_at: userProfile.updated_at,
  };
}

/**
 * Requires a user to be authenticated for the current request
 *
 * @param request - The incoming request object
 * @returns Promise<User> - The authenticated user
 * @throws redirect('/login') - If user is not authenticated
 */
export async function requireUser(request: Request): Promise<User> {
  const user = await getUser(request);

  if (!user) {
    throw redirect("/login");
  }

  return user;
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
      .get(credentials.email) as any;

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
 * Get current user ID from request
 *
 * @param request - The incoming request object
 * @returns Promise<string> - The user ID
 */
export async function getUserId(request: Request): Promise<string> {
  const user = await requireUser(request);
  return user.id;
}

/**
 * Check if user is authenticated without throwing
 *
 * @param request - The incoming request object
 * @returns Promise<boolean> - True if authenticated
 */
export async function isAuthenticated(request: Request): Promise<boolean> {
  const user = await getUser(request);
  return user !== null;
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
      .get(userId) as any;

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
