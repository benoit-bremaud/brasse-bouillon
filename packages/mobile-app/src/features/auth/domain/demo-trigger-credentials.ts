/**
 * Demo trigger credentials (#822) — soutenance safety net.
 *
 * If the live backend is unreachable on stage, the speaker types
 * this exact email + password pair on the sign-in screen and the
 * app flips into demo mode for the rest of the session, reading
 * mock data from `packages/mobile-app/src/mocks/demo-data.ts`
 * instead of hitting the API.
 *
 * Not a privilege escalation: the demo mocks are public seed data
 * any reader of the open-source repo can already inspect. The
 * email lives under the reserved `.local` TLD (RFC 6762) so it
 * can never collide with a real user account.
 *
 * Documented credentials — printed on the speaker's backup card,
 * NOT typed by accident:
 *   email    : demo@brasse-bouillon.local
 *   password : brasse-bouillon-demo-2026
 */

export const DEMO_TRIGGER_EMAIL = "demo@brasse-bouillon.local";
export const DEMO_TRIGGER_PASSWORD = "brasse-bouillon-demo-2026";

/**
 * Returns true when the given credentials match the demo trigger
 * pair exactly. Email comparison is case-insensitive and trimmed
 * (most keyboards on Android lowercase email inputs anyway), but
 * the password must match verbatim — leading/trailing whitespace
 * counts, and case matters. This avoids false positives from a
 * user with capslock on while keeping the speaker's tap-typing
 * forgiving on the email field.
 */
export function isDemoTriggerCredentials(
  email: string,
  password: string,
): boolean {
  return (
    email.trim().toLowerCase() === DEMO_TRIGGER_EMAIL &&
    password === DEMO_TRIGGER_PASSWORD
  );
}
