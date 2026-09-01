import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

/** Ensures a profile row exists for the signed-in traveler. */
export async function ensureProfile(user: Pick<User, "id" | "email" | "user_metadata">) {
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

/** Current session user, kept in sync with auth state changes. */
export function useSessionUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setUser(session?.user ?? null);
    });
    void supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      setUser(data.user ?? null);
      setLoading(false);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}
