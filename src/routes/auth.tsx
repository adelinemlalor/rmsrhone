import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Wayfarer trip planner" },
      {
        name: "description",
        content: "Sign in or create a Wayfarer account to plan visual, hour-by-hour trips.",
      },
      { property: "og:title", content: "Sign in — Wayfarer trip planner" },
      {
        property: "og:description",
        content: "Sign in or create a Wayfarer account to plan visual, hour-by-hour trips.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) void navigate({ to: "/trips" });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: name },
          },
        });
        if (error) throw error;
        toast.success("Account created — welcome aboard.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      void navigate({ to: "/trips" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Google sign-in failed");
      return;
    }
    if (result.redirected) return;
    void navigate({ to: "/trips" });
  }

  return (
    <main className="grid min-h-screen place-items-center bg-cream px-5 py-12 text-ink">
      <div className="w-full max-w-[420px]">
        <div className="mb-8 flex items-center gap-3">
          <span className="font-display grid size-10 place-items-center rounded-2xl bg-brand text-lg font-semibold text-cream">
            W
          </span>
          <span className="font-display text-[15px] font-extrabold tracking-tight">Wayfarer</span>
        </div>

        <h1 className="font-display text-[32px] leading-tight font-extrabold tracking-tight">
          {mode === "signin" ? "Welcome back." : "Let's plan something."}
        </h1>
        <p className="mt-2 text-[13px] text-ink/55">
          {mode === "signin"
            ? "Your trips, reservations and ideas are right where you left them."
            : "Create an account and we'll drop a sample trip in for you to explore."}
        </p>

        <button
          type="button"
          onClick={google}
          className="mt-7 w-full rounded-full border border-border bg-white px-5 py-3 text-[14px] font-bold transition-colors hover:bg-cream-2"
        >
          Continue with Google
        </button>

        <div className="my-5 flex items-center gap-3 text-[11px] font-semibold tracking-[0.14em] text-ink/35 uppercase">
          <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === "signup" ? (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-[14px] outline-none focus:border-brand"
            />
          ) : null}
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-[14px] outline-none focus:border-brand"
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-[14px] outline-none focus:border-brand"
          />
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-brand px-5 py-3 text-[14px] font-bold text-cream disabled:opacity-60"
          >
            {busy ? "One moment…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-5 w-full text-center text-[13px] font-semibold text-ink/55 hover:text-brand"
        >
          {mode === "signin"
            ? "New here? Create an account"
            : "Already have an account? Sign in"}
        </button>
      </div>
    </main>
  );
}
