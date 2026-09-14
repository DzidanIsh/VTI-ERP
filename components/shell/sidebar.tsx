"use client";

import Link from "next/link";
import Image from "next/image";
import { Search, Home } from "lucide-react";
import { modulesForRole, moduleHome, type ModuleDef } from "@/lib/nav";
import { useUser } from "@/lib/user-context";
import { cn } from "@/lib/utils";

/**
 * Sidebar terang gaya ERPNext (arahan 2026-08-12): putih bersih, aksen
 * hijau brand, dan bisa diciutkan menjadi rel ikon (prop `ciut`).
 */
export function Sidebar({ module, pathname, ciut }: { module: ModuleDef; pathname: string; ciut: boolean }) {
  const { user } = useUser();
  // Sebelum sesi termuat: jangan tampilkan menu apa pun (hindari flash menu terlarang)
  const visible = user ? modulesForRole(user.role) : [];
  const current = visible.find((m) => m.id === module.id) ?? visible[0] ?? module;
  const diHome = pathname === "/home";
  const CurrentIcon = current.icon;

  return (
    <aside
      className={cn(
        "flex h-screen shrink-0 flex-col border-r border-slate-200 bg-white transition-[width] duration-200",
        ciut ? "w-16" : "w-64"
      )}
    >
      {/* Brand — logo VTI */}
      <Link href="/home" className={cn("flex items-center gap-2.5 px-4 py-4", ciut && "justify-center px-0")}>
        <Image src="/logo-vti.png" alt="VTI" width={36} height={36} className="shrink-0" priority />
        {!ciut && (
          <div className="leading-tight">
            <div className="text-sm font-bold tracking-tight text-slate-800">VENDOURA</div>
            <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-brand-600">ERP System</div>
          </div>
        )}
      </Link>

      {/* Home — satu pintu masuk, menggantikan dropdown Pilih Modul */}
      <div className={cn("px-3", ciut && "px-2")}>
        <Link
          href="/home"
          title="Home"
          className={cn(
            "flex items-center gap-2.5 rounded-lg py-2 transition-colors",
            ciut ? "justify-center" : "px-3",
            diHome ? "bg-brand-50 font-semibold text-brand-700" : "text-slate-600 hover:bg-slate-100"
          )}
        >
          <Home className={cn("h-[18px] w-[18px] shrink-0", diHome ? "text-brand-600" : "text-slate-400")} />
          {!ciut && <span className="text-sm">Home</span>}
        </Link>
      </div>

      {/* Search */}
      {!ciut && (
        <div className="px-3 py-3">
          <div className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              placeholder="Search.."
              className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
            />
          </div>
        </div>
      )}
      {ciut && <div className="py-1.5" />}

      <nav className={cn("flex-1 space-y-4 overflow-y-auto px-3 pb-6", ciut && "space-y-1 px-2")}>
        {diHome ? (
          /* Di Home: daftar modul milik peran ini — gaya workspace ERPNext */
          <div>
            {!ciut && (
              <div className="px-3 pb-1.5 pt-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Modul
              </div>
            )}
            <ul className={cn("space-y-0.5", ciut && "space-y-1")}>
              {visible.map((m) => {
                const Icon = m.icon;
                return (
                  <li key={m.id}>
                    <Link
                      href={moduleHome(m)}
                      title={m.name}
                      className={cn(
                        "group flex items-center gap-3 rounded-lg py-2 text-sm text-slate-600 transition-colors hover:bg-slate-100",
                        ciut ? "justify-center" : "px-3"
                      )}
                    >
                      <Icon className="h-[18px] w-[18px] shrink-0 text-slate-400 group-hover:text-slate-600" />
                      {!ciut && <span className="truncate">{m.name}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <>
            {/* Judul modul aktif — label, bukan tombol */}
            {user && !ciut && (
              <div className="flex items-center gap-2.5 px-3 pt-1">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-600">
                  <CurrentIcon className="h-4 w-4" />
                </span>
                <div className="min-w-0 leading-tight">
                  <div className="truncate text-sm font-semibold text-slate-800">{current.name}</div>
                  <div className="truncate text-[11px] text-slate-400">{current.tagline}</div>
                </div>
              </div>
            )}
            {(user ? current.groups : []).map((group, gi) => (
              <div key={gi}>
                {group.label && !ciut && (
                  <div className="px-3 pb-1.5 pt-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    {group.label}
                  </div>
                )}
                <ul className={cn("space-y-0.5", ciut && "space-y-1")}>
                  {group.items.map((item) => {
                    const active = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          title={item.label}
                          className={cn(
                            "group flex items-center gap-3 rounded-lg py-2 text-sm transition-colors",
                            ciut ? "justify-center" : "px-3",
                            active
                              ? "bg-brand-50 font-medium text-brand-700"
                              : "text-slate-600 hover:bg-slate-100"
                          )}
                        >
                          {Icon && (
                            <Icon
                              className={cn(
                                "h-[18px] w-[18px] shrink-0",
                                active ? "text-brand-600" : "text-slate-400 group-hover:text-slate-600"
                              )}
                            />
                          )}
                          {!ciut && <span className="truncate">{item.label}</span>}
                          {!ciut && active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-500" />}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </>
        )}
      </nav>

      {!ciut && (
        <div className="border-t border-slate-200 px-5 py-3 text-[11px] text-slate-400">
          PT Vendoura Inti Perkasa
        </div>
      )}
    </aside>
  );
}
