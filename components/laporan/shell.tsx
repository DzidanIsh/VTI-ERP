import { formatNumber } from "@/lib/utils";

/**
 * Kerangka dokumen laporan — TETAP dan tidak dibuat ulang oleh AI.
 * Kop, struktur, catatan kaki, dan blok tanda tangan selalu sama;
 * yang berubah hanya judul, periode, dan isi tabel.
 */
export function LaporanShell({
  judul,
  periode,
  dicetakOleh,
  ringkas,
  children,
}: {
  judul: string;
  periode: string;
  dicetakOleh: string;
  /** Baris angka utama di bawah kop (label → nilai siap tampil). */
  ringkas?: { label: string; nilai: string }[];
  children: React.ReactNode;
}) {
  const waktu = new Date().toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" });

  return (
    <div className="cetak-halaman mx-auto max-w-[820px] bg-white p-10 text-slate-800 shadow-card print:shadow-none">
      {/* ---------- Kop surat ---------- */}
      <header className="flex items-start justify-between border-b-2 border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-600 text-lg font-bold text-white">
            V
          </span>
          <div className="leading-tight">
            <div className="text-lg font-bold tracking-tight">PT VENDOURA INTI PERKASA</div>
            <div className="text-xs text-slate-500">Kontraktor Penambangan Nikel · Bahodopi, Morowali, Sulawesi Tengah</div>
          </div>
        </div>
        <div className="text-right text-[11px] leading-relaxed text-slate-500">
          <div className="font-semibold uppercase tracking-wider text-slate-700">Dokumen Internal</div>
          <div>Mining Operation Intelligence</div>
        </div>
      </header>

      {/* ---------- Judul & periode ---------- */}
      <div className="mt-6 text-center">
        <h1 className="text-xl font-bold uppercase tracking-wide">{judul}</h1>
        <p className="mt-1 text-sm text-slate-500">Periode: {periode}</p>
      </div>

      {ringkas && ringkas.length > 0 && (
        <div className="hindari-patah mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-slate-300 bg-slate-300 sm:grid-cols-4">
          {ringkas.map((r) => (
            <div key={r.label} className="bg-white px-3 py-2.5">
              <div className="text-[10px] font-medium uppercase tracking-wide text-slate-500">{r.label}</div>
              <div className="mt-0.5 text-base font-bold text-slate-800">{r.nilai}</div>
            </div>
          ))}
        </div>
      )}

      <main className="mt-6 space-y-6">{children}</main>

      {/* ---------- Catatan & tanda tangan ---------- */}
      <section className="hindari-patah mt-8 border-t border-slate-300 pt-4">
        <p className="text-[11px] leading-relaxed text-slate-500">
          <b>Catatan:</b> Seluruh angka dalam laporan ini hanya menghitung ritase yang telah lolos validasi
          berjenjang Driver → Pengawas → Checker (BRULE-005). Ritase yang masih menunggu validasi atau ditolak
          tidak diikutsertakan. Tonase dihitung otomatis dari kapasitas vessel unit × density material (BRULE-002).
        </p>

        <div className="mt-8 flex justify-between gap-8">
          {["Dibuat oleh", "Diperiksa oleh", "Disetujui oleh"].map((peran, i) => (
            <div key={peran} className="flex-1 text-center text-xs">
              <div className="text-slate-500">{peran}</div>
              <div className="mt-14 border-t border-slate-400 pt-1 font-medium text-slate-700">
                {i === 0 ? dicetakOleh : "(..............................)"}
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="mt-6 flex justify-between border-t border-slate-200 pt-2 text-[10px] text-slate-400">
        <span>Dicetak {waktu} oleh {dicetakOleh}</span>
        <span>Vendoura ERP — Mining Operation Intelligence Platform</span>
      </footer>
    </div>
  );
}

/** Tabel laporan dengan gaya cetak yang konsisten. */
export function TabelLaporan({
  kolom,
  baris,
  kosong = "Tidak ada data pada periode ini.",
}: {
  kolom: { label: string; kanan?: boolean }[];
  baris: (string | number)[][];
  kosong?: string;
}) {
  if (baris.length === 0)
    return <p className="rounded border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-400">{kosong}</p>;

  return (
    <table className="w-full border-collapse text-[12px]">
      <thead>
        <tr className="border-y border-slate-400 bg-slate-50">
          {kolom.map((k) => (
            <th key={k.label} className={`px-2 py-1.5 font-semibold ${k.kanan ? "text-right" : "text-left"}`}>
              {k.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {baris.map((r, i) => (
          <tr key={i} className="border-b border-slate-200">
            {r.map((sel, j) => (
              <td key={j} className={`px-2 py-1.5 ${kolom[j]?.kanan ? "text-right tabular-nums" : ""}`}>
                {typeof sel === "number" ? formatNumber(sel, Number.isInteger(sel) ? 0 : 1) : sel}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function JudulBagian({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-2 border-l-4 border-brand-600 pl-2 text-sm font-bold uppercase tracking-wide text-slate-700">
      {children}
    </h2>
  );
}
