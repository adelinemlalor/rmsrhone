/**
 * The app runs without sign-in: every visitor shares one local planner identity.
 */
export const GUEST_USER = {
  id: "00000000-0000-4000-8000-000000000001",
  email: "traveler@wayfarer.local",
  user_metadata: { full_name: "Traveler" } as Record<string, unknown>,
};

export type GuestUser = typeof GUEST_USER;
