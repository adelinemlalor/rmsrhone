/**
 * Turns raw Supabase Auth errors into friendly, human sentences, and checks
 * the sign-in / sign-up form before it is sent.
 */

export type AuthMode = "signin" | "signup";

export function friendlyAuthError(message: string | null | undefined, mode: AuthMode): string {
  const m = (message ?? "").toLowerCase();
  if (m.includes("invalid login credentials"))
    return "That email and password don't match an account. Check for typos, or create an account below.";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "An account with that email already exists. Try signing in instead.";
  if (m.includes("email not confirmed"))
    return "Please confirm your email first — check your inbox for the link we sent.";
  if (m.includes("password") && (m.includes("at least") || m.includes("short") || m.includes("weak")))
    return "Please choose a stronger password — at least 6 characters.";
  if (m.includes("rate limit") || m.includes("too many"))
    return "Too many attempts in a row. Wait a minute and try again.";
  if (m.includes("invalid") && m.includes("email"))
    return "That doesn't look like a valid email address.";
  if (m.includes("failed to fetch") || m.includes("network"))
    return "We couldn't reach the server. Check your connection and try again.";
  return mode === "signin"
    ? "We couldn't sign you in. Please try again."
    : "We couldn't create your account. Please try again.";
}

export type AuthFieldErrors = { email?: string | undefined; password?: string | undefined };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateAuthForm(email: string, password: string, mode: AuthMode): AuthFieldErrors {
  const errors: AuthFieldErrors = {};
  if (!email.trim()) errors.email = "Enter your email address.";
  else if (!EMAIL_RE.test(email.trim())) errors.email = "That doesn't look like a valid email address.";
  if (!password) errors.password = "Enter your password.";
  else if (mode === "signup" && password.length < 6)
    errors.password = "Passwords need at least 6 characters.";
  return errors;
}
