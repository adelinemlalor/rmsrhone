import { supabase } from "@/integrations/supabase/client";
import { GUEST_USER, type GuestUser } from "@/lib/guest";

/** Ensures a profile row exists for the local planner identity. */
export async function ensureProfile(user: GuestUser = GUEST_USER) {
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
