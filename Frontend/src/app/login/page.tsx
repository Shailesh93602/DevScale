import { permanentRedirect } from "next/navigation";

// Canonical sign-in path is /auth/login. Manual-URL /login guesses
// should not 404.
export default function LoginRedirect(): never {
  permanentRedirect("/auth/login");
}
