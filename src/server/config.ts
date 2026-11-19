/**
 * The assignment assumes a single logged-in user and no auth.
 * Every request acts as this seeded profile. Swapping in real auth means
 * replacing getCurrentUserId() with a session lookup; nothing else changes.
 */
export const CURRENT_USER_ID = "me";

export function getCurrentUserId(): string {
  return CURRENT_USER_ID;
}
