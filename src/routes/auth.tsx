import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in — RMS Rhone trip planner" },
      {
        name: "description",
        content: "Sign in or create an RMS Rhone account with your email to plan trips day by day.",
      },
      { property: "og:title", content: "Sign in — RMS Rhone trip planner" },
      {
        property: "og:description",
        content: "Sign in or create an RMS Rhone account with your email to plan trips day by day.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

const field =
  "w-full rounded-2xl border border-border bg-card px-4 py-3 text-[14px] outline-none focus:border-brand";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => {
      if (data.user) void navigate({ to: "/trips", replace: true });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: window.location.origin + "/trips",
            data: { full_name: fullName.trim() || null },
          },
        });
        if (error) throw error;
        setSent(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        await navigate({ to: "/trips", replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-cream px-4 py-12 text-ink">
      <div className="w-full max-w-[420px]">
        <Link to="/" className="mb-8 flex items-center justify-center gap-3">
          <span className="font-display grid size-11 place-items-center rounded-2xl bg-brand text-lg font-semibold text-cream">
            W
          </span>
          <span className="font-display text-[17px] font-extrabold tracking-tight">Wayfarer</span>
        </Link>

        <div className="rounded-[26px] border border-border bg-card p-7 shadow-sm">
          {sent ? (
            <div className="text-center">
              <h1 className="font-display text-[24px] font-extrabold tracking-tight">
                Check your inbox
              </h1>
              <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
                We sent a confirmation link to <strong>{email}</strong>. Click it to activate your
                account, then come back and sign in.
              </p>
              <button
                onClick={() => {
                  setSent(false);
                  setMode("signin");
                }}
                className="mt-6 text-[13px] font-bold text-brand"
              >
                Back to sign in
              </button>
            </div>
          ) : (
            <>
              <h1 className="font-display text-[26px] leading-none font-extrabold tracking-tight">
                {mode === "signin" ? "Welcome back" : "Create your account"}
              </h1>
              <p className="mt-2 text-[13px] text-muted-foreground">
                {mode === "signin"
                  ? "Sign in with your email to open your trips."
                  : "Sign up with your email — we'll send a confirmation link."}
              </p>

              <form onSubmit={submit} className="mt-6 space-y-3">
                {mode === "signup" && (
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Full name"
                    autoComplete="name"
                    className={field}
                  />
                )}
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  autoComplete="email"
                  className={field}
                />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  className={field}
                />

                {error && (
                  <p className="rounded-2xl bg-destructive/10 px-4 py-3 text-[13px] text-destructive">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full rounded-full bg-brand px-5 py-3 text-[14px] font-bold text-cream transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {busy ? "One moment…" : mode === "signin" ? "Sign in" : "Create account"}
                </button>
              </form>

              <p className="mt-5 text-center text-[13px] text-muted-foreground">
                {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
                <button
                  onClick={() => {
                    setMode(mode === "signin" ? "signup" : "signin");
                    setError(null);
                  }}
                  className="font-bold text-brand"
                >
                  {mode === "signin" ? "Create an account" : "Sign in"}
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
