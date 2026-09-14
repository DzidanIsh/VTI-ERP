"use client";

import * as React from "react";
import {
  COG,
  type Unit, type Driver, type Vendor, type Material, type Stockpile, type Tongkang,
} from "@/lib/mock-data/master";

// ---------- Tipe transaksi ----------
export const TAHAPAN = ["driver", "pengawas", "checker"] as const;
export type Tahap = (typeof TAHAPAN)[number];
export const TAHAP_LABEL: Record<Tahap, string> = { driver: "Driver", pengawas: "Pengawas", checker: "Checker" };

export type RitaseStatus = "menunggu" | "disetujui" | "ditolak";

export interface AuditEntry {
  aksi: "buat" | "setuju" | "tolak";
  peran: string;
  oleh: string;
  waktu: string;
}

/** Satu Ritase = satu bolak-balik; tonase melekat & ikut divalidasi (FSD-002). */
export interface Ritase {
  id: string;
  tanggal: string;
  tanggalISO: string; // yyyy-mm-dd — kunci pencocokan plan vs actual
  unitId: string;
  driverId: string;
  vendorId: string;
  materialId: string;
  asal: string;
  stockpileId: string;
  kapasitasM3: number;
  density: number;
  tonase: number;
  kadar: number;
  hargaPerRitase: number;
  nilai: number;
  tahapIndex: number;
  status: RitaseStatus;
  catatanTolak?: string;
  audit: AuditEntry[];
}

export interface StockMovement {
  id: string;
  tanggal: string;
  stockpileId: string;
  jenis: "masuk" | "keluar";
  tonase: number;
  sumber: string;
}

/** Target produksi harian (Form D: plan vs actual). */
export interface RencanaHarian {
  id: string;
  tanggal: string; // tampilan, mis. "15 Jun 2026"
  tanggalISO: string; // kunci pencocokan dengan ritase & urutan
  targetTon: number;
  catatan?: string;
  dibuatOleh: string;
}

export const JENIS_KEJADIAN = ["breakdown", "standby", "hujan", "slippery", "lainnya"] as const;
export type JenisKejadian = (typeof JENIS_KEJADIAN)[number];
export const JENIS_LABEL: Record<JenisKejadian, string> = {
  breakdown: "Breakdown (BD)",
  standby: "Standby",
  hujan: "Hujan",
  slippery: "Jalan licin (slippery)",
  lainnya: "Lainnya",
};

/** Kejadian operasi (Form D: aktivitas unit & penyebab berhenti).
 *  Tanpa unit = kejadian area (hujan/slippery); jamSelesai kosong = masih berlangsung. */
export interface KejadianOperasi {
  id: string;
  tanggal: string;
  tanggalISO: string;
  jenis: JenisKejadian;
  unitId?: string;
  jamMulai: string;
  jamSelesai?: string;
  keterangan?: string;
  dicatatOleh: string;
}

export type ShipmentStatus = "dimuat" | "survei" | "terjual";
export interface Shipment {
  id: string;
  tanggal: string;
  tongkangId: string;
  stockpileId: string;
  kadar: number;
  tonaseEstimasi: number; // perkiraan di tambang
  tonaseSurvei?: number; // survei stockpile
  tonaseFinal?: number; // independent/draft survey tongkang -> dasar bayar
  hargaJual?: number; // Rp / ton
  pendapatan?: number;
  status: ShipmentStatus;
}

// ---------- Klien API + pemetaan bentuk DB -> bentuk UI ----------
// Server = sumber kebenaran; store hanya cache tampilan. Boundary ini satu-satunya
// tempat konversi enum (MASUK->masuk) dan tanggal (ISO -> "16 Jun 2026").

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init ? { ...init, headers: { "content-type": "application/json" } } : undefined);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? `HTTP ${res.status}`);
  return data as T;
}

const fmtTanggal = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

const fmtWaktu = (iso: string) => {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
const mapRitase = (r: any): Ritase => ({
  ...r,
  tanggal: fmtTanggal(r.tanggal),
  tanggalISO: String(r.tanggal).slice(0, 10),
  status: String(r.status).toLowerCase() as RitaseStatus,
  catatanTolak: r.catatanTolak ?? undefined,
  audit: (r.audit ?? []).map((a: any) => ({ ...a, waktu: fmtWaktu(a.waktu) })),
});

const mapMovement = (m: any): StockMovement => ({
  ...m,
  tanggal: fmtTanggal(m.tanggal),
  jenis: String(m.jenis).toLowerCase() as "masuk" | "keluar",
});

const mapRencana = (r: any): RencanaHarian => ({
  ...r,
  tanggal: fmtTanggal(r.tanggal),
  tanggalISO: String(r.tanggal).slice(0, 10),
  catatan: r.catatan ?? undefined,
});

const mapKejadian = (k: any): KejadianOperasi => ({
  ...k,
  tanggal: fmtTanggal(k.tanggal),
  tanggalISO: String(k.tanggal).slice(0, 10),
  jenis: String(k.jenis).toLowerCase() as JenisKejadian,
  unitId: k.unitId ?? undefined,
  jamSelesai: k.jamSelesai ?? undefined,
  keterangan: k.keterangan ?? undefined,
});

const mapShipment = (s: any): Shipment => ({
  ...s,
  tanggal: fmtTanggal(s.tanggal),
  status: String(s.status).toLowerCase() as ShipmentStatus,
  tonaseSurvei: s.tonaseSurvei ?? undefined,
  tonaseFinal: s.tonaseFinal ?? undefined,
  hargaJual: s.hargaJual ?? undefined,
  pendapatan: s.pendapatan ?? undefined,
});
/* eslint-enable @typescript-eslint/no-explicit-any */

// ---------- Context ----------
export interface RitaseInput { tanggal: string; unitId: string; driverId: string; materialId: string; asal: string; stockpileId: string; }
export interface RencanaInput { tanggal: string; targetTon: number; catatan?: string; }
export interface KejadianInput { tanggal: string; jenis: JenisKejadian; unitId?: string; jamMulai: string; jamSelesai?: string; keterangan?: string; }
export interface MovementInput { tanggal: string; stockpileId: string; jenis: "masuk" | "keluar"; tonase: number; sumber: string; }
export interface ShipmentInput { tanggal: string; tongkangId: string; stockpileId: string; tonaseEstimasi: number; }

interface Store {
  // master
  units: Unit[]; drivers: Driver[]; vendors: Vendor[]; materials: Material[]; stockpiles: Stockpile[]; tongkang: Tongkang[];
  // transaksi
  ritaseList: Ritase[]; movements: StockMovement[]; shipments: Shipment[];
  rencanaList: RencanaHarian[]; kejadianList: KejadianOperasi[];
  loading: boolean;
  // aksi transaksi — resolve true jika server berhasil menyimpan
  addRitase: (i: RitaseInput) => Promise<boolean>;
  setujuiRitase: (id: string, oleh: string) => Promise<boolean>;
  tolakRitase: (id: string, oleh: string, alasan: string) => Promise<boolean>;
  addMovement: (i: MovementInput) => Promise<boolean>;
  // aksi rencana & kejadian (Form D Produksi)
  simpanRencana: (i: RencanaInput) => Promise<boolean>;
  addKejadian: (i: KejadianInput) => Promise<boolean>;
  tutupKejadian: (id: string, jamSelesai: string) => Promise<boolean>;
  // aksi barging (Fase 2)
  addShipment: (i: ShipmentInput) => Promise<boolean>;
  setSurvey: (id: string, tonaseSurvei: number, tonaseFinal: number) => Promise<boolean>;
  sellShipment: (id: string, hargaJual: number) => Promise<boolean>;
  // aksi master
  addUnit: (u: Unit) => Promise<boolean>;
  addDriver: (d: Omit<Driver, "id">) => Promise<boolean>;
  addVendor: (v: Omit<Vendor, "id">) => Promise<boolean>;
  // util
  saldoStockpile: (id: string) => number;
}

const OperasiContext = React.createContext<Store | null>(null);

interface MasterData { vendors: Vendor[]; units: Unit[]; drivers: Driver[]; materials: Material[]; stockpiles: Stockpile[]; tongkang: Tongkang[]; }
const MASTER_KOSONG: MasterData = { vendors: [], units: [], drivers: [], materials: [], stockpiles: [], tongkang: [] };

export function OperasiProvider({ children }: { children: React.ReactNode }) {
  const [master, setMaster] = React.useState<MasterData>(MASTER_KOSONG);
  const [ritaseList, setRitaseList] = React.useState<Ritase[]>([]);
  const [movements, setMovements] = React.useState<StockMovement[]>([]);
  const [shipments, setShipments] = React.useState<Shipment[]>([]);
  const [rencanaList, setRencanaList] = React.useState<RencanaHarian[]>([]);
  const [kejadianList, setKejadianList] = React.useState<KejadianOperasi[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [gagalMuat, setGagalMuat] = React.useState("");

  React.useEffect(() => {
    (async () => {
      try {
        const [m, r, mv, sh, rc, kj] = await Promise.all([
          api<MasterData>("/api/master"),
          api<unknown[]>("/api/ritase"),
          api<unknown[]>("/api/movements"),
          api<unknown[]>("/api/shipments"),
          api<unknown[]>("/api/rencana"),
          api<unknown[]>("/api/kejadian"),
        ]);
        setMaster(m);
        setRitaseList(r.map(mapRitase));
        setMovements(mv.map(mapMovement));
        setShipments(sh.map(mapShipment));
        setRencanaList(rc.map(mapRencana));
        setKejadianList(kj.map(mapKejadian));
      } catch (e) {
        // banner non-blocking — alert() membekukan seluruh halaman
        setGagalMuat(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Semua aksi: kirim ke API, update state dari respons server.
  // Gagal -> alert + resolve false, agar halaman tidak menampilkan sukses palsu.
  const jalankan = (aksi: () => Promise<void>): Promise<boolean> =>
    aksi().then(() => true).catch((e) => {
      alert(e instanceof Error ? e.message : String(e)); // ponytail: alert cukup untuk pilot
      return false;
    });

  // ---- aksi transaksi ----
  const addRitase = (i: RitaseInput) => jalankan(async () => {
    // identitas pembuat (oleh) ditentukan server dari sesi login
    const r = await api("/api/ritase", { method: "POST", body: JSON.stringify(i) });
    setRitaseList((prev) => [mapRitase(r), ...prev]);
  });

  const patchRitase = (id: string, body: object) => jalankan(async () => {
    const r = await api<{ movement: unknown | null }>(`/api/ritase/${id}`, { method: "PATCH", body: JSON.stringify(body) });
    setRitaseList((prev) => prev.map((x) => (x.id === id ? mapRitase(r) : x)));
    // Lolos tahap checker -> server otomatis menambah saldo stockpile; ikut masukkan ke state.
    if (r.movement) setMovements((prev) => [mapMovement(r.movement), ...prev]);
  });
  const setujuiRitase = (id: string, oleh: string) => patchRitase(id, { aksi: "setuju", oleh });
  const tolakRitase = (id: string, oleh: string, alasan: string) => patchRitase(id, { aksi: "tolak", oleh, alasan });

  const addMovement = (i: MovementInput) => jalankan(async () => {
    const m = await api("/api/movements", { method: "POST", body: JSON.stringify({ ...i, jenis: i.jenis.toUpperCase() }) });
    setMovements((prev) => [mapMovement(m), ...prev]);
  });

  // ---- aksi rencana & kejadian (Form D Produksi) ----
  const simpanRencana = (i: RencanaInput) => jalankan(async () => {
    // Server meng-upsert per tanggal; ganti baris lama bila tanggalnya sama.
    const r = await api<{ id: string }>("/api/rencana", { method: "POST", body: JSON.stringify(i) });
    const baris = mapRencana(r);
    setRencanaList((prev) => {
      const tanpa = prev.filter((x) => x.tanggalISO !== baris.tanggalISO);
      return [...tanpa, baris].sort((a, b) => b.tanggalISO.localeCompare(a.tanggalISO));
    });
  });

  const addKejadian = (i: KejadianInput) => jalankan(async () => {
    const k = await api("/api/kejadian", {
      method: "POST",
      body: JSON.stringify({ ...i, jenis: i.jenis.toUpperCase() }),
    });
    setKejadianList((prev) => [mapKejadian(k), ...prev]);
  });

  const tutupKejadian = (id: string, jamSelesai: string) => jalankan(async () => {
    const k = await api(`/api/kejadian/${id}`, { method: "PATCH", body: JSON.stringify({ jamSelesai }) });
    setKejadianList((prev) => prev.map((x) => (x.id === id ? mapKejadian(k) : x)));
  });

  // ---- aksi barging (Fase 2) ----
  const addShipment = (i: ShipmentInput) => jalankan(async () => {
    // Server membuat shipment + movement KELUAR atomik; respons membawa keduanya.
    const s = await api<{ movements: unknown[] }>("/api/shipments", { method: "POST", body: JSON.stringify(i) });
    setShipments((prev) => [mapShipment(s), ...prev]);
    setMovements((prev) => [...s.movements.map(mapMovement), ...prev]);
  });

  const patchShipment = (id: string, body: object) => jalankan(async () => {
    const s = await api(`/api/shipments/${id}`, { method: "PATCH", body: JSON.stringify(body) });
    setShipments((prev) => prev.map((x) => (x.id === id ? mapShipment(s) : x)));
  });
  const setSurvey = (id: string, tonaseSurvei: number, tonaseFinal: number) =>
    patchShipment(id, { aksi: "survey", tonaseSurvei, tonaseFinal });
  const sellShipment = (id: string, hargaJual: number) => patchShipment(id, { aksi: "sell", hargaJual });

  // ---- aksi master ----
  const addUnit = (u: Unit) => jalankan(async () => {
    const row = await api<Unit>("/api/master/units", { method: "POST", body: JSON.stringify(u) });
    setMaster((prev) => ({ ...prev, units: [...prev.units, row] }));
  });
  const addDriver = (d: Omit<Driver, "id">) => jalankan(async () => {
    const row = await api<Driver>("/api/master/drivers", { method: "POST", body: JSON.stringify(d) });
    setMaster((prev) => ({ ...prev, drivers: [...prev.drivers, row] }));
  });
  const addVendor = (v: Omit<Vendor, "id">) => jalankan(async () => {
    const row = await api<Vendor>("/api/master/vendors", { method: "POST", body: JSON.stringify(v) });
    setMaster((prev) => ({ ...prev, vendors: [...prev.vendors, row] }));
  });

  const saldoStockpile = (id: string) =>
    movements.filter((m) => m.stockpileId === id).reduce((s, m) => s + (m.jenis === "masuk" ? m.tonase : -m.tonase), 0);

  const value: Store = {
    units: master.units, drivers: master.drivers, vendors: master.vendors,
    materials: master.materials, stockpiles: master.stockpiles, tongkang: master.tongkang,
    ritaseList, movements, shipments, rencanaList, kejadianList, loading,
    addRitase, setujuiRitase, tolakRitase, addMovement,
    simpanRencana, addKejadian, tutupKejadian,
    addShipment, setSurvey, sellShipment,
    addUnit, addDriver, addVendor, saldoStockpile,
  };
  return (
    <OperasiContext.Provider value={value}>
      {gagalMuat && (
        <div className="bg-rose-600 px-4 py-2 text-sm text-white">
          Gagal memuat data dari server: {gagalMuat} — periksa koneksi database, lalu muat ulang halaman.
        </div>
      )}
      {children}
    </OperasiContext.Provider>
  );
}

export function useOperasi() {
  const ctx = React.useContext(OperasiContext);
  if (!ctx) throw new Error("useOperasi harus dipakai di dalam OperasiProvider");
  return ctx;
}

export { COG };
