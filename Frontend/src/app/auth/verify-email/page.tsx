/**
 * Post-signup "check your inbox" page. It used to install any
 * access_token/refresh_token found in the query string as the browser session.
 * Supabase never sends them there (implicit flow uses the hash, PKCE uses
 * ?code), so the only input that branch ever accepted was a link someone else
 * built — signing the visitor into the link author's account.
 */
export default function VerifyEmailPage() {
  return (
    <div className="p-8 text-center">
      <h1 className="mb-4 text-2xl font-bold">Check Your Email</h1>
      <p className="text-muted-foreground">
        If this email can be used for a new account, we&apos;ve sent a
        verification link to it. Check your inbox to continue.
      </p>
    </div>
  );
}
