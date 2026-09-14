"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell, MessageSquare, Cloud, Maximize2, ChevronRight, LogOut,
  UserCircle2, CalendarClock, Sparkles, Home as HomeIcon, PanelLeft,
} from "lucide-react";
import { type ModuleDef, findNavLabel } from "@/lib/nav";
import { useUser } from "@/lib/user-context";

const ROLE_LABEL: Record<string, string> = {
  driver: "Driver",
  pengawas: "Pengawas",
  checker: "Checker",
  owner: "Owner",
  hr: "HR",
  lab: "Lab",
};

export function Topbar({ module, onCiut }: { module: ModuleDef; onCiut?: () => void }) {
  const pathname = usePathname();
  const page = findNavLabel(pathname);
  // Halaman pribadi bukan milik modul mana pun — breadcrumb-nya "Profil",
  // bukan "Human Resources" / "Operasional Lapangan".
  const pribadi = pathname === "/profil" || pathname === "/presensi";
  const diHome = pathname === "/home";
  const { user, signOut } = useUser();
  const [buka, setBuka] = React.useState(false);
  const [fotoGagal, setFotoGagal] = React.useState(false);
  const wadah = React.useRef<HTMLDivElement>(null);

  const inisial = (user?.nama ?? "?")
    .split(" ")
    .map((k) => k[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  // Tutup dropdown saat klik di luar
  React.useEffect(() => {
    if (!buka) return;
    const tutup = (e: MouseEvent) => {
      if (!wadah.current?.contains(e.target as Node)) setBuka(false);
    };
    document.addEventListener("mousedown", tutup);
    return () => document.removeEventListener("mousedown", tutup);
  }, [buka]);

  return (
    <header className="z-10 flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div className="flex items-center gap-2 text-sm">
        {/* Ciutkan/lebarkan sidebar — gaya ERPNext */}
        <button
          onClick={onCiut}
          title="Ciutkan/lebarkan menu"
          className="mr-1 rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
        >
          <PanelLeft className="h-[18px] w-[18px]" />
        </button>
        {diHome ? (
          <>
            <HomeIcon className="h-5 w-5 text-brand-600" />
            <span className="font-semibold text-slate-800">Home</span>
          </>
        ) : pribadi ? (
          <>
            <UserCircle2 className="h-5 w-5 text-brand-600" />
            <span className="font-semibold text-slate-800">Profil</span>
            {pathname === "/presensi" && (
              <>
                <ChevronRight className="h-4 w-4 text-slate-300" />
                <span className="text-slate-500">Presensi</span>
              </>
            )}
          </>
        ) : (
          <>
            <module.icon className="h-5 w-5 text-brand-600" />
            <span className="font-semibold text-slate-800">{module.tagline}</span>
            {page && page !== module.tagline && (
              <>
                <ChevronRight className="h-4 w-4 text-slate-300" />
                <span className="text-slate-500">{page}</span>
              </>
            )}
          </>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600">
          <Cloud className="h-[18px] w-[18px]" />
        </button>
        <button className="relative rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600">
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-rose-500" />
        </button>
        <button className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600">
          <MessageSquare className="h-[18px] w-[18px]" />
        </button>
        <button className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600">
          <Maximize2 className="h-[18px] w-[18px]" />
        </button>

        {/* Asisten AI — pintu masuknya di sini, untuk semua peran (arahan 2026-08-12). */}
        {user && (
          <Link
            href="/mining/asisten"
            title="Asisten AI"
            className="ml-1 inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-700"
          >
            <Sparkles className="h-3.5 w-3.5" /> Asisten AI
          </Link>
        )}

        {/* Blok profil — klik membuka menu Profil / Presensi / Keluar */}
        <div ref={wadah} className="relative ml-2 border-l border-slate-200 pl-3">
          <button
            onClick={() => setBuka((b) => !b)}
            title={user ? `${user.nama} (${ROLE_LABEL[user.role] ?? user.role})` : ""}
            className="flex items-center rounded-lg p-1 transition-colors hover:bg-slate-100"
          >
            <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
              {!fotoGagal ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src="/api/profil/foto"
                  alt=""
                  className="h-full w-full object-cover"
                  onError={() => setFotoGagal(true)}
                />
              ) : (
                inisial
              )}
            </span>
          </button>

          {buka && (
            <div className="absolute right-0 top-full z-20 mt-1.5 w-48 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
              <div className="border-b border-slate-100 px-3 py-2 leading-tight">
                <div className="text-sm font-medium text-slate-700">{user?.nama}</div>
                <div className="text-[11px] text-slate-400">{user ? ROLE_LABEL[user.role] ?? user.role : ""}</div>
              </div>
              <Link
                href="/profil"
                onClick={() => setBuka(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <UserCircle2 className="h-4 w-4 text-slate-400" /> Profil
              </Link>
              <Link
                href="/presensi"
                onClick={() => setBuka(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <CalendarClock className="h-4 w-4 text-slate-400" /> Presensi
              </Link>
              <div className="my-1 border-t border-slate-100" />
              <button
                onClick={signOut}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-rose-600"
              >
                <LogOut className="h-4 w-4 text-slate-400" /> Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
