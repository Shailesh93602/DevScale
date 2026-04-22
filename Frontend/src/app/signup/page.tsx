import { permanentRedirect } from "next/navigation";

// EduScale canonical register path is /auth/register, but /signup and
// /sign-up are extremely common manual-URL guesses. Permanent-redirect
// so those don't 404. Same rationale as /login (handled by the auth
// layout already).
export default function SignupRedirect(): never {
  permanentRedirect("/auth/register");
}
