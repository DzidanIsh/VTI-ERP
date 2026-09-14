import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { PAGE_ROLES, homeFor } from "@/lib/nav";
import type { Role } from "@/lib/supabase/client";

/**
 * Semua halaman & API butuh sesi login (NFR-003).
 * Pengecualian: /login dan /api/health (monitoring).
 * Halaman terdaftar di PAGE_ROLES juga dibatasi per peran (BRULE-006);
 * /api dibiarkan — guard mutasinya sudah ada di route masing-masing.
 */
export async function middleware(req: NextRequest) {
  const res = NextResponse.next({ request: req });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
        },
      },
    }
  );

  const { data } = await supabase.auth.getUser();
  const path = req.nextUrl.pathname;

  if (!data.user) {
    if (path.startsWith("/api")) {
      return NextResponse.json({ error: "Belum login" }, { status: 401 });
    }
    if (path !== "/login") {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  } else {
    const role = (data.user.user_metadata?.role ?? "driver") as Role;
    const allowed = PAGE_ROLES[path];
    if (path === "/login" || (allowed && !allowed.includes(role))) {
      const url = req.nextUrl.clone();
      url.pathname = homeFor(role);
      return NextResponse.redirect(url);
    }
  }

  return res;
}

export const config = {
  // Semua rute kecuali aset statis & health check. Pola `.*\\..*` mengecualikan
  // berkas ber-ekstensi (logo-vti.png, icon.png, dll.) — tanpa ini middleware
  // me-redirect gambar publik ke halaman login dan logo tampil rusak.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/health|.*\\..*).*)"],
};
