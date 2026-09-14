"use client";

import { createBrowserClient } from "@supabase/ssr";

export function supabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/** Role aplikasi — dipetakan ke tahap validasi (BRULE-006). "hr" modul HR, "lab" Laboratorium. */
export type Role = "driver" | "pengawas" | "checker" | "owner" | "hr" | "lab";

export interface SessionUser {
  /** Supabase Auth user id — identitas stabil untuk data per-pengguna (presensi). */
  id: string;
  nama: string;
  role: Role;
  email: string;
}
