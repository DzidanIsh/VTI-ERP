import {
  LayoutDashboard,
  Workflow,
  ClipboardList,
  Boxes,
  Repeat,
  Layers,
  GitBranch,
  Target,
  Building2,
  ListChecks,
  Ship,
  FileText,
  HardHat,
  CalendarCheck,
  Wrench,
  CalendarClock,
  CalendarRange,
  CalendarDays,
  CalendarOff,
  Users,
  IdCard,
  UserPlus,
  UserMinus,
  ArrowRightLeft,
  ArrowLeftRight,
  Timer,
  Receipt,
  HandCoins,
  Goal,
  ClipboardCheck,
  Banknote,
  Percent,
  BookOpen,
  Package,
  PackageSearch,
  Truck,
  ShoppingCart,
  FileQuestion,
  Landmark,
  Calculator,
  SlidersHorizontal,
  Wallet,
  FlaskConical,
  Mountain,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@/lib/supabase/client";

export type NavItem = { label: string; href: string; icon?: LucideIcon; roles?: Role[] };
export type NavGroup = { label?: string; items: NavItem[]; roles?: Role[] };

export type ModuleDef = {
  id: string;
  name: string;
  tagline: string;
  icon: LucideIcon;
  base: string;
  /** Peran yang melihat modul ini. Item/grup tanpa roles mewarisi dari sini. */
  roles: Role[];
  groups: NavGroup[];
};

const SEMUA: Role[] = ["driver", "pengawas", "checker", "owner"];
const VALIDATOR: Role[] = ["pengawas", "checker", "owner"];

/**
 * Satu modul per tim yang SUDAH mengisi form pengenalan proses kerja —
 * baru tim Produksi (Form D). Modul tim lain (Engineering, Plant, Survey, …)
 * ditambahkan di array ini nanti saat form timnya masuk; mekanisme switcher,
 * filter peran, dan guard middleware sudah siap. Satu basis data bersama —
 * modul hanyalah lensa navigasi, bukan silo.
 */
export const MODULES: ModuleDef[] = [
  {
    id: "produksi",
    name: "Produksi",
    tagline: "Operasional Lapangan",
    icon: HardHat,
    base: "/mining",
    roles: SEMUA,
    groups: [
      {
        items: [
          { label: "Laporan", href: "/mining/laporan", icon: FileText, roles: ["owner"] },
        ],
      },
      {
        label: "Input Lapangan",
        // Presensi pindah ke menu profil di topbar (arahan 2026-08-11) —
        // absen bukan bagian alur produksi, ia milik tiap pegawai.
        items: [{ label: "Ritase Entry", href: "/mining/ritase", icon: Repeat }],
      },
      {
        label: "Validation Workflow",
        roles: VALIDATOR,
        items: [{ label: "Validasi Ritase", href: "/mining/validasi", icon: ListChecks }],
      },
      {
        label: "Rencana & Kendala",
        roles: VALIDATOR,
        items: [
          // "Rencana vs Capaian" dihapus (arahan 2026-08-11): input rencana
          // di sini, capaian & pembandingnya di Dashboard Master.
          { label: "Rencana Produksi", href: "/mining/rencana", icon: CalendarCheck },
          { label: "Dashboard Master", href: "/mining/dashboard-master", icon: LayoutDashboard },
          { label: "Status Unit & Kendala", href: "/mining/status-unit", icon: Wrench },
          // Notulensi topik 3: papan HM & jadwal service, terlihat pengawas/
          // mekanik/divisi lain — peringatannya adalah dashboard ini.
          { label: "Service Unit", href: "/mining/service", icon: Timer },
          // Arahan owner: siklus lahan baru — survey, pemetaan drone,
          // ditambang, sampai reklamasi.
          { label: "Lahan & Reklamasi", href: "/mining/lahan", icon: Mountain },
        ],
      },
      {
        label: "Monitoring",
        roles: VALIDATOR,
        items: [
          { label: "Rekap Tonase", href: "/mining/tonase", icon: Layers },
          { label: "Inventory Stockpile", href: "/mining/stockpile", icon: Boxes },
          { label: "Mining Flow", href: "/mining/flow", icon: Workflow },
          { label: "Barging & Shipment", href: "/mining/barging", icon: Ship },
        ],
      },
      {
        label: "Operation Control Dashboard",
        roles: ["owner"],
        // "Mining Site Dashboard" dilebur ke Dashboard Master (arahan
        // 2026-08-11) — modelnya sama, plus pembanding data.
        items: [{ label: "Daily Production", href: "/mining/daily-production", icon: ClipboardList }],
      },
      {
        label: "Performance Analytics",
        roles: ["owner"],
        items: [
          { label: "Produktivitas", href: "/mining/produktivitas", icon: Target },
          { label: "Rantai Fisik", href: "/mining/rantai", icon: GitBranch },
        ],
      },
      {
        label: "Data Master",
        roles: ["owner"],
        items: [{ label: "Master Data", href: "/mining/master-data", icon: Building2 }],
      },
    ],
  },
  {
    /**
     * Modul HR — dipindahkan dari branch draga. Struktur menu mengikuti
     * Frappe HR; baru "Presensi & Kehadiran" yang berfungsi. Item lain
     * mendarat di halaman "akan dibangun" yang menyatakan statusnya
     * terang-terangan — bukan tabel kosong yang terbaca "belum ada data".
     */
    id: "hr",
    name: "HR",
    tagline: "Human Resources",
    icon: Users,
    base: "/hr",
    roles: ["hr", "owner"],
    groups: [
      {
        items: [{ label: "Dashboard HR", href: "/hr", icon: LayoutDashboard }],
      },
      {
        label: "Siklus Karyawan",
        items: [
          { label: "Data Karyawan", href: "/hr/karyawan", icon: IdCard },
          { label: "Onboarding", href: "/hr/onboarding", icon: UserPlus },
          { label: "Promosi & Mutasi", href: "/hr/mutasi", icon: ArrowRightLeft },
          { label: "Pengunduran Diri", href: "/hr/keluar", icon: UserMinus },
        ],
      },
      {
        label: "Kehadiran & Cuti",
        items: [
          { label: "Presensi & Kehadiran", href: "/presensi", icon: CalendarClock },
          { label: "Permohonan Cuti", href: "/hr/cuti", icon: CalendarOff },
          { label: "Saldo & Jenis Cuti", href: "/hr/saldo-cuti", icon: CalendarRange },
          { label: "Hari Libur", href: "/hr/hari-libur", icon: CalendarDays },
          { label: "Shift Kerja", href: "/hr/shift", icon: Timer },
        ],
      },
      {
        label: "Klaim & Uang Muka",
        items: [
          { label: "Klaim Biaya", href: "/hr/klaim", icon: Receipt },
          { label: "Uang Muka Karyawan", href: "/hr/uang-muka", icon: HandCoins },
        ],
      },
      {
        label: "Manajemen Kinerja",
        items: [
          { label: "Sasaran & KRA", href: "/hr/sasaran", icon: Goal },
          { label: "Siklus Penilaian", href: "/hr/penilaian", icon: ClipboardCheck },
        ],
      },
      {
        label: "Payroll & Pajak",
        items: [
          { label: "Struktur Gaji", href: "/hr/struktur-gaji", icon: Banknote },
          { label: "Komponen Gaji", href: "/hr/komponen-gaji", icon: SlidersHorizontal },
          { label: "Slip Gaji", href: "/hr/slip-gaji", icon: FileText },
          { label: "Periode Payroll", href: "/hr/periode-payroll", icon: CalendarDays },
          { label: "Lapisan PPh 21", href: "/hr/pph", icon: Percent },
        ],
      },
      {
        label: "Laporan",
        items: [
          { label: "Rekap Kehadiran Bulanan", href: "/hr/laporan-kehadiran", icon: ClipboardList },
          { label: "Saldo Cuti Karyawan", href: "/hr/laporan-cuti", icon: ListChecks },
          { label: "Register Gaji", href: "/hr/laporan-gaji", icon: BookOpen },
        ],
      },
    ],
  },
  {
    /**
     * Laboratorium (Notulensi topik 7) — menggantikan pelaporan manual via
     * WhatsApp. Petugas lab yang menulis; pengawas/checker ikut membaca
     * karena hasil kadar dipakai Produksi.
     */
    id: "lab",
    name: "Laboratorium",
    tagline: "Analisis Sampel",
    icon: FlaskConical,
    base: "/lab",
    roles: ["lab", "pengawas", "checker", "owner"],
    groups: [
      {
        items: [{ label: "Sampel Lab", href: "/lab", icon: FlaskConical }],
      },
    ],
  },
  // ------------------------------------------------------------------
  // Modul di bawah ini dipindahkan dari draga dan masih DATA CONTOH
  // (halamannya memasang BannerContoh). Hanya owner yang melihatnya —
  // peran lapangan tidak perlu disuguhi angka karangan.
  // ------------------------------------------------------------------
  {
    id: "inventory",
    name: "Inventory",
    tagline: "Inventory Management",
    icon: Boxes,
    base: "/inventory",
    roles: ["owner"],
    groups: [
      {
        items: [
          { label: "Inventory Dashboard", href: "/inventory", icon: LayoutDashboard },
          { label: "Material Request", href: "/inventory/material-request", icon: ClipboardList },
          { label: "Recheck Stock Availability", href: "/inventory/recheck-stock", icon: PackageSearch },
        ],
      },
      {
        label: "Inventory Controls",
        items: [
          { label: "Stock Count", href: "/inventory/stock-count", icon: ListChecks },
          { label: "Procurement Planning", href: "/inventory/procurement-planning", icon: CalendarClock },
          { label: "Replenishment", href: "/inventory/replenishment", icon: Repeat },
          { label: "Reordering Rules", href: "/inventory/reordering-rules", icon: SlidersHorizontal },
          { label: "Internal Transfer", href: "/inventory/internal-transfer", icon: ArrowLeftRight },
        ],
      },
      {
        label: "Products",
        items: [
          { label: "Products", href: "/inventory/products", icon: Package },
          { label: "Operations", href: "/inventory/operations", icon: Truck },
        ],
      },
    ],
  },
  {
    id: "asset",
    name: "Asset",
    tagline: "Asset Management",
    icon: Truck,
    base: "/asset",
    roles: ["owner"],
    groups: [
      {
        items: [
          { label: "Asset Dashboard", href: "/asset", icon: LayoutDashboard },
          { label: "Asset Database", href: "/asset/database", icon: Package },
          { label: "Asset Movement", href: "/asset/movement", icon: ArrowLeftRight },
        ],
      },
      {
        label: "Maintenance",
        items: [
          { label: "Maintenance Schedule", href: "/asset/maintenance", icon: Wrench },
          { label: "Repair Orders", href: "/asset/repairs", icon: Wrench },
        ],
      },
      {
        label: "Fleet & Costing",
        items: [
          { label: "Fleet Management", href: "/asset/fleet", icon: Truck },
          { label: "Depreciation", href: "/asset/depreciation", icon: CalendarClock },
        ],
      },
    ],
  },
  {
    id: "sales",
    name: "CRM Sales",
    tagline: "CRM Sales Management",
    icon: Users,
    base: "/sales",
    roles: ["owner"],
    groups: [
      {
        items: [
          { label: "Sales Dashboard", href: "/sales", icon: LayoutDashboard },
          { label: "Quotations / SO", href: "/sales/orders", icon: FileText },
          { label: "Customers", href: "/sales/customers", icon: Users },
        ],
      },
      {
        label: "Pipeline",
        items: [
          { label: "Leads / Pipeline", href: "/sales/pipeline", icon: GitBranch },
          { label: "RFM Analysis", href: "/sales/rfm", icon: Target },
          { label: "Sales Forecast", href: "/sales/forecast", icon: Target },
        ],
      },
    ],
  },
  {
    id: "accounting",
    name: "Accounting",
    tagline: "Accounting Management",
    icon: Calculator,
    base: "/accounting",
    roles: ["owner"],
    groups: [
      {
        items: [
          { label: "Accounting Dashboard", href: "/accounting", icon: LayoutDashboard },
          { label: "Customer Invoices (AR)", href: "/accounting/invoices", icon: Receipt },
          { label: "Vendor Bills (AP)", href: "/accounting/bills", icon: Receipt },
        ],
      },
      {
        label: "Banking",
        items: [
          { label: "Bank & Cash", href: "/accounting/bank", icon: Landmark },
          { label: "GIRO", href: "/accounting/giro", icon: Banknote },
          { label: "E-Faktur", href: "/accounting/e-faktur", icon: FileText },
        ],
      },
      {
        label: "Reporting",
        items: [
          { label: "Financial Reports", href: "/accounting/reports", icon: BookOpen },
          { label: "Budget", href: "/accounting/budget", icon: Wallet },
        ],
      },
    ],
  },
  {
    id: "purchase",
    name: "Purchase",
    tagline: "Purchase Management",
    icon: ShoppingCart,
    base: "/purchase",
    roles: ["owner"],
    groups: [
      {
        items: [
          { label: "Purchase Dashboard", href: "/purchase", icon: LayoutDashboard },
          { label: "Request for Quotation", href: "/purchase/rfq", icon: FileQuestion },
          { label: "Purchase Orders", href: "/purchase/orders", icon: ShoppingCart },
        ],
      },
      {
        label: "Procurement",
        items: [
          { label: "Purchase Requests", href: "/purchase/requests", icon: ClipboardList },
          { label: "Vendors", href: "/purchase/vendors", icon: Building2 },
          { label: "Tender", href: "/purchase/tender", icon: ListChecks },
        ],
      },
    ],
  },
];

function itemRoles(m: ModuleDef, g: NavGroup, i: NavItem): Role[] {
  return i.roles ?? g.roles ?? m.roles;
}

/** Modul pemilik pathname — berdasar keanggotaan item (base bisa sama antar modul). */
export function getModuleByPath(pathname: string): ModuleDef {
  for (const m of MODULES)
    for (const g of m.groups) if (g.items.some((i) => i.href === pathname)) return m;
  const seg = "/" + (pathname.split("/")[1] ?? "");
  return MODULES.find((m) => m.base === seg) ?? MODULES[0];
}

/** Cari label nav berdasar pathname (untuk judul halaman & breadcrumb). */
export function findNavLabel(pathname: string): string | undefined {
  for (const m of MODULES) {
    for (const g of m.groups) {
      const item = g.items.find((i) => i.href === pathname);
      if (item) return item.label;
    }
  }
  return undefined;
}

/** Modul + grup + item yang boleh dilihat peran ini; grup kosong dibuang. */
export function modulesForRole(role: Role): ModuleDef[] {
  return MODULES.flatMap((m) => {
    if (!m.roles.includes(role)) return [];
    const groups = m.groups
      .map((g) => ({ ...g, items: g.items.filter((i) => itemRoles(m, g, i).includes(role)) }))
      .filter((g) => g.items.length > 0);
    return groups.length ? [{ ...m, groups }] : [];
  });
}

/** Halaman pertama modul — tujuan module switcher (base bisa ambigu). */
export function moduleHome(m: ModuleDef): string {
  return m.groups[0]?.items[0]?.href ?? m.base;
}

/**
 * Landing semua peran = Home (launchpad ala SAP/ERPNext); juga tujuan
 * redirect saat akses halaman terlarang. /home bebas untuk semua yang login.
 */
export function homeFor(_role: Role): string {
  return "/home";
}

/**
 * Peta href → peran yang boleh akses (dipakai middleware).
 * GABUNGAN, bukan timpa: /presensi ada di modul Produksi (semua peran absen)
 * DAN modul HR — kalau ditimpa, entri terakhir mengunci driver dari absen.
 */
export const PAGE_ROLES: Record<string, Role[]> = (() => {
  const map: Record<string, Role[]> = {};
  for (const m of MODULES)
    for (const g of m.groups)
      for (const i of g.items) {
        const roles = itemRoles(m, g, i);
        map[i.href] = map[i.href] ? [...new Set([...map[i.href], ...roles])] : roles;
      }
  // /presensi hanya tercantum di nav HR (rekap), tetapi SEMUA pegawai absen
  // di sana lewat menu profil topbar — jangan biarkan entri HR menguncinya.
  map["/presensi"] = ["driver", "pengawas", "checker", "owner", "hr", "lab"];
  // Asisten AI diakses lewat tombol topbar, bukan sidebar — untuk SEMUA peran
  // (arahan 2026-08-12). Aksi tulis tetap lewat kartu konfirmasi + guard peran
  // di route yang dipanggilnya.
  map["/mining/asisten"] = ["driver", "pengawas", "checker", "owner", "hr", "lab"];
  return map;
})();
