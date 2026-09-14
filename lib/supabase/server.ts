import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Role, SessionUser } from "./client";

/**
 * Ambil user login dari cookie sesi (untuk Route Handler).
 * Return null bila tidak ada sesi — pemanggil yang memutuskan 401.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const store = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => store.getAll(),
        setAll: () => {}, // route handler tidak perlu menulis cookie
      },
    }
  );
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const m = data.user.user_metadata ?? {};
  return {
    id: data.user.id,
    nama: String(m.nama ?? data.user.email),
    role: (m.role ?? "driver") as Role,
    email: data.user.email ?? "",
  };
}
