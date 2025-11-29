export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "nick" | "kelsey" | "admin";
  preferences?: {
    theme?: "light" | "dark" | "system";
    notifications?: boolean;
    currency?: string;
    dateFormat?: string;
  };
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserActivity {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  timestamp: string;
  details?: Record<string, unknown>;
}

// Sample user profiles
export const NICK_PROFILE: UserProfile = {
  id: "nick-001",
  name: "Nicholas Lynn Coleman",
  email: "nick@example.com",
  role: "nick",
  preferences: {
    theme: "light",
    notifications: true,
    currency: "USD",
    dateFormat: "MM/DD/YYYY",
  },
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

export const KELSEY_PROFILE: UserProfile = {
  id: "kelsey-001",
  name: "Kelsey Fey Brown",
  email: "kelsey@example.com",
  role: "kelsey",
  preferences: {
    theme: "light",
    notifications: true,
    currency: "USD",
    dateFormat: "MM/DD/YYYY",
  },
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};
