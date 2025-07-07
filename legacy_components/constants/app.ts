// Application Constants
// Import comprehensive profiles
import { NICK_PROFILE, KELSEY_PROFILE } from '../types/user-profiles';

export const APP_NAME = 'Coleman Estate Hub';

// MVP Users - Nick & Kelsey (backward compatibility)
export const NICK_USER = {
  id: NICK_PROFILE.id,
  name: NICK_PROFILE.name,
  email: NICK_PROFILE.email,
  role: NICK_PROFILE.role,
};

export const KELSEY_USER = {
  id: KELSEY_PROFILE.id,
  name: KELSEY_PROFILE.name,
  email: KELSEY_PROFILE.email,
  role: KELSEY_PROFILE.role,
};

// Default to Kelsey for MVP (she has 'client' role)
export const MOCK_USER_CLIENT = KELSEY_USER;

// Export full profiles for components that need detailed info
export { NICK_PROFILE, KELSEY_PROFILE } from '../types/user-profiles';
