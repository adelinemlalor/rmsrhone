import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data: { session: current } }) => {
      setSession(current);
      setLoading(false);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  return { session, user: session?.user ?? null as User | null, loading };
}

/** Ensures a profile row exists (this also seeds the sample trip on first login). */
export async function ensureProfile(user: User) {
  const { data } = await supabase.from("profiles").select("id").eq("id", user.id).maybeSingle();
  if (data) return;
  const fullName = (user.user_metadata?.["full_name"] as string | undefined) ?? null;
  await supabase.from("profiles").insert({
    id: user.id,
    email: user.email ?? null,
    full_name: fullName,
    preferred_name: fullName?.split(" ")[0] ?? null,
  });
}
