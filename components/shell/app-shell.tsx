"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { getModuleByPath } from "@/lib/nav";
import { OperasiProvider } from "@/lib/store/operasi-store";
import { UserProvider } from "@/lib/user-context";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const module = getModuleByPath(pathname);
  // Sidebar bisa diciutkan (gaya ERPNext). Default terbuka; pilihan diingat.
  const [ciut, setCiut] = React.useState(false);
  React.useEffect(() => {
    setCiut(localStorage.getItem("sidebar-ciut") === "1");
  }, []);
  const toggleCiut = () =>
    setCiut((c) => {
      localStorage.setItem("sidebar-ciut", c ? "0" : "1");
      return !c;
    });

  if (pathname === "/login") return <>{children}</>;

  return (
    <UserProvider>
    <OperasiProvider>
      {/* kelas cetak-* dipakai @media print di globals.css: sidebar & topbar
          disembunyikan, tinggi/overflow dilepas agar laporan mengalir antar halaman */}
      <div className="cetak-lepas flex h-screen overflow-hidden bg-slate-100">
        <div className="cetak-sembunyi contents">
          <Sidebar module={module} pathname={pathname} ciut={ciut} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="cetak-sembunyi">
            <Topbar module={module} onCiut={toggleCiut} />
          </div>
          <main className="flex-1 overflow-y-auto scrollbar-thin">{children}</main>
        </div>
      </div>
    </OperasiProvider>
    </UserProvider>
  );
}
