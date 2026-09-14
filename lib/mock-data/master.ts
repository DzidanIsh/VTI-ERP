// Master data untuk modul Operasi Produksi (Fase 1).
// Angka ilustratif dari wawancara — WAJIB diverifikasi (lihat dokumen master Bagian 16).

export type UnitTipe = "PC200" | "PC300" | "DT" | "WL" | "BZR";

export interface Vendor {
  id: string;
  nama: string;
  peran: "Hauling & Barging" | "Perawatan Jalan (MRR)" | "Internal";
  hargaPerRitase: number; // Rp
}

export interface Unit {
  id: string;
  nama: string;
  tipe: UnitTipe;
  kategori: "Excavator" | "Dump Truck" | "Wheel Loader" | "Bulldozer";
  bucketM3: number; // volume sendok excavator (m3); 0 untuk non-excavator
  kapasitasM3: number; // volume vessel dump truck (m3) — dasar hitung tonase per ritase (*)
  vendorId: string;
  targetTonBulan: number; // target produksi/bln (dari plan engineering)
}

export interface Driver {
  id: string;
  nama: string;
  vendorId: string;
}

export interface Material {
  id: string;
  nama: string;
  density: number; // ton/m3 — ditetapkan owner
  kadarDefault: number;
}

export interface Stockpile {
  id: string;
  kode: string; // ETO-1, EBO-2, ...
  kadar: number;
  diAtasCOG: boolean;
}

export const COG = 1.3; // cut-off grade ilustratif

export const VENDORS: Vendor[] = [
  { id: "v-int", nama: "VIP (Internal)", peran: "Internal", hargaPerRitase: 0 },
  { id: "v1", nama: "CV Karya Hauling", peran: "Hauling & Barging", hargaPerRitase: 185000 },
  { id: "v2", nama: "PT Sinar Trans", peran: "Hauling & Barging", hargaPerRitase: 180000 },
  { id: "v3", nama: "CV Morowali Logistik", peran: "Hauling & Barging", hargaPerRitase: 192000 },
  { id: "v4", nama: "PT Bahodopi Angkutan", peran: "Hauling & Barging", hargaPerRitase: 178000 },
  { id: "v5", nama: "CV Jalan Lestari (MRR)", peran: "Perawatan Jalan (MRR)", hargaPerRitase: 0 },
];

export const UNITS: Unit[] = [
  { id: "EXC-001", nama: "Excavator Komatsu PC200", tipe: "PC200", kategori: "Excavator", bucketM3: 0.93, kapasitasM3: 0, vendorId: "v-int", targetTonBulan: 42000 },
  { id: "EXC-002", nama: "Excavator Komatsu PC300", tipe: "PC300", kategori: "Excavator", bucketM3: 1.4, kapasitasM3: 0, vendorId: "v-int", targetTonBulan: 58000 },
  { id: "EXC-005", nama: "Excavator Hitachi PC300", tipe: "PC300", kategori: "Excavator", bucketM3: 1.4, kapasitasM3: 0, vendorId: "v-int", targetTonBulan: 55000 },
  { id: "DT-1021", nama: "Dump Truck Hino 500", tipe: "DT", kategori: "Dump Truck", bucketM3: 0, kapasitasM3: 12, vendorId: "v1", targetTonBulan: 30000 },
  { id: "DT-1044", nama: "Dump Truck Scania P460", tipe: "DT", kategori: "Dump Truck", bucketM3: 0, kapasitasM3: 18, vendorId: "v2", targetTonBulan: 30000 },
  { id: "DT-1099", nama: "Dump Truck Mercedes Arocs", tipe: "DT", kategori: "Dump Truck", bucketM3: 0, kapasitasM3: 16, vendorId: "v3", targetTonBulan: 28000 },
  { id: "WL-003", nama: "Wheel Loader CAT 980", tipe: "WL", kategori: "Wheel Loader", bucketM3: 3.5, kapasitasM3: 0, vendorId: "v-int", targetTonBulan: 36000 },
];

export const DRIVERS: Driver[] = [
  { id: "drv-01", nama: "Andi Saputra", vendorId: "v1" },
  { id: "drv-02", nama: "Budi Hartono", vendorId: "v2" },
  { id: "drv-03", nama: "Chandra Wijaya", vendorId: "v3" },
  { id: "drv-04", nama: "Dedi Kurniawan", vendorId: "v4" },
  { id: "drv-05", nama: "Eko Prasetyo", vendorId: "v1" },
  { id: "drv-06", nama: "Faisal Rahman", vendorId: "v-int" },
  { id: "drv-07", nama: "Gunawan", vendorId: "v-int" },
];

export const MATERIALS: Material[] = [
  { id: "mat-sap", nama: "Saprolite (kadar tinggi)", density: 1.55, kadarDefault: 1.8 },
  { id: "mat-lim", nama: "Limonite", density: 1.45, kadarDefault: 1.4 },
  { id: "mat-low", nama: "Low grade", density: 1.4, kadarDefault: 1.2 },
];

export const STOCKPILES: Stockpile[] = [
  { id: "sp-eto1", kode: "ETO-1", kadar: 1.8, diAtasCOG: true },
  { id: "sp-eto2", kode: "ETO-2", kadar: 1.5, diAtasCOG: true },
  { id: "sp-ebo1", kode: "EBO-1", kadar: 1.35, diAtasCOG: true },
  { id: "sp-ebo2", kode: "EBO-2", kadar: 1.2, diAtasCOG: false },
];

export const LOKASI = ["Pit A", "Pit B", "Pit C", "Pit D", "Stockpile ETO", "Stockpile EBO", "Jetty"];

export interface Tongkang {
  id: string;
  nama: string;
  kapasitas: number; // ton
}

export const TONGKANG: Tongkang[] = [
  { id: "bg-01", nama: "Tongkang BG-01", kapasitas: 7500 },
  { id: "bg-02", nama: "Tongkang BG-02", kapasitas: 10000 },
  { id: "bg-03", nama: "Tongkang BG-03", kapasitas: 12000 },
  { id: "bg-04", nama: "Tongkang BG-04", kapasitas: 3500 },
];

export const TARGET_PENJUALAN = 180000; // ton/periode (ilustratif — verifikasi ke narasumber)

// helpers
export const vendorById = (id: string) => VENDORS.find((v) => v.id === id);
export const unitById = (id: string) => UNITS.find((u) => u.id === id);
export const driverById = (id: string) => DRIVERS.find((d) => d.id === id);
export const materialById = (id: string) => MATERIALS.find((m) => m.id === id);
