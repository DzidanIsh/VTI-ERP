/** Metrik Dashboard Master — dipakai route serial (server) dan halaman (klien). */
export const METRIK = {
  tonase: "Tonase tervalidasi (ton)",
  ritase: "Ritase tervalidasi (rit)",
  target: "Target harian (ton)",
  bbm: "BBM (liter)",
  downtime: "Downtime kejadian (jam)",
  hadir: "Kehadiran (orang)",
} as const;

export type KunciMetrik = keyof typeof METRIK;
