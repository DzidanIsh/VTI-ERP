import type Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/db";
import { deviasi } from "@/lib/rantai";
import { COG } from "@/lib/mock-data/master";

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Rentang tanggal dari string ISO yyyy-mm-dd. `sampai` bersifat inklusif. */
function rentang(dari?: string, sampai?: string) {
  if (!dari && !sampai) return undefined;
  const w: { gte?: Date; lt?: Date } = {};
  if (dari) w.gte = new Date(`${dari}T00:00:00.000Z`);
  if (sampai) {
    const akhir = new Date(`${sampai}T00:00:00.000Z`);
    akhir.setUTCDate(akhir.getUTCDate() + 1);
    w.lt = akhir;
  }
  return w;
}

const tgl = (d: Date) => d.toISOString().slice(0, 10);

// ---------------------------------------------------------------- tool baca

/**
 * Fungsi baca dipakai bersama oleh chatbot (lewat ALAT_BACA) dan halaman
 * laporan cetak — supaya angka di chat dan di PDF selalu berasal dari
 * perhitungan yang sama.
 */
export const bacaData = {
  async ringkasan_operasi({ dari, sampai }: { dari?: string; sampai?: string }) {
    const tanggal = rentang(dari, sampai);
    const where = tanggal ? { tanggal } : {};

    const [sah, menunggu, ditolak, unitAngkut, gerakan] = await Promise.all([
      prisma.ritase.aggregate({
        where: { ...where, status: "DISETUJUI" },
        _count: true,
        _sum: { tonase: true, nilai: true },
      }),
      prisma.ritase.aggregate({ where: { ...where, status: "MENUNGGU" }, _count: true, _sum: { tonase: true } }),
      prisma.ritase.count({ where: { ...where, status: "DITOLAK" } }),
      prisma.unit.aggregate({ where: { kapasitasM3: { gt: 0 } }, _sum: { targetTonBulan: true } }),
      prisma.stockMovement.groupBy({ by: ["jenis"], _sum: { tonase: true } }),
    ]);

    const masuk = gerakan.find((g) => g.jenis === "MASUK")?._sum.tonase ?? 0;
    const keluar = gerakan.find((g) => g.jenis === "KELUAR")?._sum.tonase ?? 0;
    const target = unitAngkut._sum.targetTonBulan ?? 0;
    const tonaseSah = sah._sum.tonase ?? 0;

    return {
      periode: dari || sampai ? { dari: dari ?? "awal", sampai: sampai ?? "sekarang" } : "seluruh data",
      tervalidasi: {
        jumlahRitase: sah._count,
        tonase: +tonaseSah.toFixed(1),
        nilaiPembayaran: sah._sum.nilai ?? 0,
        catatan: "Hanya angka ini yang sah untuk produksi & pembayaran (BRULE-005).",
      },
      menungguValidasi: { jumlahRitase: menunggu._count, tonase: +(menunggu._sum.tonase ?? 0).toFixed(1) },
      ditolak: { jumlahRitase: ditolak },
      targetTonBulan: target,
      persenCapaian: target ? +((tonaseSah / target) * 100).toFixed(1) : null,
      saldoStockpileTotal: +(masuk - keluar).toFixed(1),
    };
  },

  async cari_ritase({ dari, sampai, unitId, driverId, vendorId, status, batas = 20 }: any) {
    const tanggal = rentang(dari, sampai);
    const rows = await prisma.ritase.findMany({
      where: {
        ...(tanggal ? { tanggal } : {}),
        ...(unitId ? { unitId } : {}),
        ...(driverId ? { driverId } : {}),
        ...(vendorId ? { vendorId } : {}),
        ...(status ? { status } : {}),
      },
      orderBy: { tanggal: "desc" },
      take: Math.min(Number(batas) || 20, 50),
      include: { driver: true, vendor: true, material: true, stockpile: true },
    });
    return rows.map((r) => ({
      id: r.id,
      tanggal: tgl(r.tanggal),
      unit: r.unitId,
      driver: r.driver.nama,
      vendor: r.vendor.nama,
      material: r.material.nama,
      rute: `${r.asal} → ${r.stockpile.kode}`,
      tonase: r.tonase,
      nilai: r.nilai,
      status: r.status,
      tahap: ["driver", "pengawas", "checker", "selesai"][r.tahapIndex],
    }));
  },

  async daftar_master({ jenis }: { jenis: string }) {
    switch (jenis) {
      case "unit": {
        const u = await prisma.unit.findMany({ include: { vendor: true }, orderBy: { id: "asc" } });
        return {
          jumlah: u.length,
          perKategori: u.reduce<Record<string, number>>((a, x) => ({ ...a, [x.kategori]: (a[x.kategori] ?? 0) + 1 }), {}),
          unit: u.map((x) => ({
            id: x.id, nama: x.nama, tipe: x.tipe, kategori: x.kategori,
            bucketM3: x.bucketM3, kapasitasVesselM3: x.kapasitasM3,
            targetTonBulan: x.targetTonBulan, vendor: x.vendor.nama,
          })),
        };
      }
      case "driver": {
        const d = await prisma.driver.findMany({ include: { vendor: true } });
        return { jumlah: d.length, driver: d.map((x) => ({ id: x.id, nama: x.nama, vendor: x.vendor.nama })) };
      }
      case "vendor": {
        const v = await prisma.vendor.findMany();
        return { jumlah: v.length, vendor: v.map((x) => ({ id: x.id, nama: x.nama, peran: x.peran, hargaPerRitase: x.hargaPerRitase })) };
      }
      case "material": {
        const m = await prisma.material.findMany();
        return { jumlah: m.length, cogBerlaku: COG, material: m };
      }
      case "stockpile": {
        const s = await prisma.stockpile.findMany({ orderBy: { kode: "asc" } });
        return { jumlah: s.length, stockpile: s };
      }
      case "tongkang": {
        const t = await prisma.tongkang.findMany();
        return { jumlah: t.length, tongkang: t };
      }
      default:
        return { error: `jenis "${jenis}" tidak dikenal` };
    }
  },

  async saldo_stockpile() {
    const [sp, gerakan] = await Promise.all([
      prisma.stockpile.findMany({ orderBy: { kode: "asc" } }),
      prisma.stockMovement.groupBy({ by: ["stockpileId", "jenis"], _sum: { tonase: true } }),
    ]);
    return {
      cogBerlaku: COG,
      stockpile: sp.map((s) => {
        const masuk = gerakan.find((g) => g.stockpileId === s.id && g.jenis === "MASUK")?._sum.tonase ?? 0;
        const keluar = gerakan.find((g) => g.stockpileId === s.id && g.jenis === "KELUAR")?._sum.tonase ?? 0;
        return { kode: s.kode, kadar: s.kadar, diAtasCOG: s.diAtasCOG, saldoTon: +(masuk - keluar).toFixed(1) };
      }),
    };
  },

  async daftar_shipment({ status }: { status?: string }) {
    const rows = await prisma.shipment.findMany({
      where: status ? { status: status as any } : {},
      orderBy: { tanggal: "desc" },
      include: { tongkang: true, stockpile: true },
    });
    return rows.map((s) => {
      const d = deviasi(s);
      return {
        id: s.id,
        tanggal: tgl(s.tanggal),
        tongkang: s.tongkang.nama,
        stockpile: s.stockpile.kode,
        kadar: s.kadar,
        titikUkur: { estimasiTambang: s.tonaseEstimasi, surveiStockpile: s.tonaseSurvei, independentSurvey: s.tonaseFinal },
        deviasiTon: d.total,
        deviasiPersen: d.pctTotal != null ? +d.pctTotal.toFixed(2) : null,
        // pendapatan BigInt -> number agar aman diserialisasi ke JSON
        pendapatan: s.pendapatan != null ? Number(s.pendapatan) : null,
        status: s.status,
      };
    });
  },

  async produktivitas({ dimensi, dari, sampai }: { dimensi: string; dari?: string; sampai?: string }) {
    const baris = await bacaData.produktivitasBaris({ dimensi, dari, sampai });
    if (!Array.isArray(baris)) return baris;

    // Peringkat dihitung di sini, bukan diserahkan ke model. Membandingkan angka
    // pada daftar yang diurutkan berdasarkan kolom lain rawan salah baca.
    const rows = baris as Record<string, any>[];
    const puncak = (kunci: string, terkecil: boolean) => {
      if (rows.length === 0) return null;
      const b = rows.reduce((a, x) => ((terkecil ? x[kunci] < a[kunci] : x[kunci] > a[kunci]) ? x : a));
      return { nama: b.nama ?? b.unit ?? b.driver ?? b.vendor, nilai: b[kunci] };
    };

    return {
      dimensi,
      baris,
      peringkat: {
        tonaseTertinggi: puncak("tonase", false),
        tonaseTerendah: puncak("tonase", true),
        ritaseTerbanyak: puncak("ritase", false),
        ritaseTersedikit: puncak("ritase", true),
      },
      catatan:
        "Gunakan blok peringkat untuk menjawab pertanyaan 'paling tinggi/rendah/sering' — jangan membandingkan sendiri angka pada baris.",
    };
  },

  async produktivitasBaris({ dimensi, dari, sampai }: { dimensi: string; dari?: string; sampai?: string }) {
    const tanggal = rentang(dari, sampai);
    const where = { ...(tanggal ? { tanggal } : {}), status: "DISETUJUI" as const };

    if (dimensi === "unit") {
      const [grup, unit] = await Promise.all([
        prisma.ritase.groupBy({ by: ["unitId"], where, _count: true, _sum: { tonase: true, nilai: true } }),
        prisma.unit.findMany({ where: { kapasitasM3: { gt: 0 } } }),
      ]);
      return unit.map((u) => {
        const g = grup.find((x) => x.unitId === u.id);
        const aktual = g?._sum.tonase ?? 0;
        const pct = u.targetTonBulan ? (aktual / u.targetTonBulan) * 100 : 0;
        return {
          unit: u.id, nama: u.nama, ritase: g?._count ?? 0,
          tonase: +aktual.toFixed(1), target: u.targetTonBulan, persenCapaian: +pct.toFixed(1),
          kelas: pct >= 95 ? "produktif" : pct >= 80 ? "andal" : "merugikan",
        };
      }).sort((a, b) => b.persenCapaian - a.persenCapaian);
    }

    if (dimensi === "driver") {
      const [grup, driver] = await Promise.all([
        prisma.ritase.groupBy({ by: ["driverId"], where, _count: true, _sum: { tonase: true, nilai: true } }),
        prisma.driver.findMany({ include: { vendor: true } }),
      ]);
      return grup.map((g) => {
        const d = driver.find((x) => x.id === g.driverId);
        return {
          driver: d?.nama ?? g.driverId, vendor: d?.vendor.nama ?? "-",
          ritase: g._count, tonase: +(g._sum.tonase ?? 0).toFixed(1), nilai: g._sum.nilai ?? 0,
        };
      }).sort((a, b) => b.ritase - a.ritase);
    }

    if (dimensi === "vendor") {
      const [grup, vendor] = await Promise.all([
        prisma.ritase.groupBy({ by: ["vendorId"], where, _count: true, _sum: { tonase: true, nilai: true } }),
        prisma.vendor.findMany(),
      ]);
      return grup.map((g) => ({
        vendor: vendor.find((x) => x.id === g.vendorId)?.nama ?? g.vendorId,
        ritase: g._count, tonase: +(g._sum.tonase ?? 0).toFixed(1), nilaiPembayaran: g._sum.nilai ?? 0,
      })).sort((a, b) => b.nilaiPembayaran - a.nilaiPembayaran);
    }

    return { error: 'dimensi harus "unit", "driver", atau "vendor"' };
  },

  async rekap_pit({ dari, sampai }: { dari?: string; sampai?: string }) {
    const tanggal = rentang(dari, sampai);
    const rows = await prisma.ritase.findMany({
      where: { ...(tanggal ? { tanggal } : {}), status: "DISETUJUI" },
      select: { tanggal: true, asal: true, tonase: true, kadar: true },
    });
    const peta = new Map<string, { tanggal: string; pit: string; ritase: number; ore: number; waste: number }>();
    for (const r of rows) {
      const kunci = `${tgl(r.tanggal)}|${r.asal}`;
      const b = peta.get(kunci) ?? { tanggal: tgl(r.tanggal), pit: r.asal, ritase: 0, ore: 0, waste: 0 };
      b.ritase += 1;
      // Ore vs waste ditentukan kadar material terhadap COG (BRULE-003)
      if (r.kadar >= COG) b.ore += r.tonase;
      else b.waste += r.tonase;
      peta.set(kunci, b);
    }
    return [...peta.values()]
      .map((b) => ({ ...b, ore: +b.ore.toFixed(1), waste: +b.waste.toFixed(1) }))
      .sort((a, b) => (a.tanggal === b.tanggal ? a.pit.localeCompare(b.pit) : a.tanggal < b.tanggal ? 1 : -1));
  },
};

const JUDUL_LAPORAN: Record<string, string> = {
  harian: "Laporan Produksi Harian",
  periode: "Rekap Produksi Periode",
  vendor: "Laporan Pembayaran Vendor (AP)",
  rantai: "Laporan Rantai Fisik & Penjualan",
};

/** Registry longgar untuk agent — implementasi baca sama dengan bacaData di atas. */
export const ALAT_BACA: Record<string, (input: any) => Promise<unknown>> = {
  ...bacaData,

  /** Tidak mengubah data: hanya menyusun tautan ke halaman laporan bertemplate tetap. */
  async buat_laporan({ jenis, dari, sampai }: { jenis: string; dari?: string; sampai?: string }) {
    const judul = JUDUL_LAPORAN[jenis];
    if (!judul) return { error: `jenis laporan "${jenis}" tidak dikenal` };

    const q = new URLSearchParams({ jenis });
    if (dari) q.set("dari", dari);
    if (sampai) q.set("sampai", sampai);

    return {
      judul,
      url: `/mining/laporan?${q.toString()}`,
      periode: jenis === "harian" ? (dari ?? "semua tanggal") : `${dari ?? "awal"} s/d ${sampai ?? "sekarang"}`,
      petunjuk:
        "Sampaikan tautan ini apa adanya kepada user. Di halaman itu tersedia tombol Cetak / Simpan PDF.",
    };
  },
};

// --------------------------------------------------------------- tool tulis

/**
 * Tool tulis TIDAK punya implementasi di sini. Model hanya boleh mengusulkan;
 * eksekusi terjadi di /api/chat setelah user menekan tombol konfirmasi, dan
 * dijalankan atas nama user yang login (bukan atas nama AI).
 */
export const NAMA_ALAT_TULIS = ["usul_input_ritase", "usul_validasi_ritase"] as const;
export type NamaAlatTulis = (typeof NAMA_ALAT_TULIS)[number];

export const isAlatTulis = (nama: string): nama is NamaAlatTulis =>
  (NAMA_ALAT_TULIS as readonly string[]).includes(nama);

// ------------------------------------------------------------- definisi API

/** Definisi tool bentuk Anthropic — jadi sumber tunggal; bentuk OpenAI diturunkan di bawah. */
export const DEFINISI_ALAT: Anthropic.Tool[] = [
  {
    name: "ringkasan_operasi",
    description:
      "Ringkasan angka operasi: tonase & jumlah ritase yang sudah tervalidasi, yang masih menunggu validasi, yang ditolak, capaian terhadap target, dan saldo stockpile total. Pakai ini untuk pertanyaan umum seperti 'berapa tonase hari ini', 'produksi minggu ini', 'berapa ritase bulan ini'. Tanpa parameter tanggal, mengembalikan seluruh data.",
    input_schema: {
      type: "object",
      properties: {
        dari: { type: "string", description: "Tanggal awal ISO yyyy-mm-dd (opsional)" },
        sampai: { type: "string", description: "Tanggal akhir ISO yyyy-mm-dd, inklusif (opsional)" },
      },
    },
  },
  {
    name: "cari_ritase",
    description:
      "Daftar rinci ritase (satu baris = satu bolak-balik). Pakai untuk pertanyaan spesifik: ritase milik driver/unit/vendor tertentu, ritase yang menunggu validasi, atau saat perlu ID ritase sebelum mengusulkan validasi.",
    input_schema: {
      type: "object",
      properties: {
        dari: { type: "string", description: "Tanggal awal ISO yyyy-mm-dd" },
        sampai: { type: "string", description: "Tanggal akhir ISO yyyy-mm-dd, inklusif" },
        unitId: { type: "string", description: "Kode unit, mis. DT-1021" },
        driverId: { type: "string", description: "ID driver" },
        vendorId: { type: "string", description: "ID vendor" },
        status: { type: "string", enum: ["MENUNGGU", "DISETUJUI", "DITOLAK"] },
        batas: { type: "integer", description: "Maksimum baris (default 20, maksimal 50)" },
      },
    },
  },
  {
    name: "daftar_master",
    description:
      "Data master beserta jumlahnya. Pakai untuk 'ada berapa unit/aset', 'siapa saja drivernya', 'vendor apa saja', 'berapa harga per ritase', 'material dan density-nya', 'stockpile apa saja', 'tongkang apa saja'.",
    input_schema: {
      type: "object",
      properties: {
        jenis: { type: "string", enum: ["unit", "driver", "vendor", "material", "stockpile", "tongkang"] },
      },
      required: ["jenis"],
    },
  },
  {
    name: "saldo_stockpile",
    description: "Saldo ton tiap tumpukan stockpile beserta kadar dan status di atas/bawah COG.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "daftar_shipment",
    description:
      "Pengapalan (barging) dengan tiga titik ukur tonase — estimasi tambang, survei stockpile, independent survey — beserta deviasinya. Pakai untuk pertanyaan soal penjualan, tongkang, susut, atau deviasi tonase.",
    input_schema: {
      type: "object",
      properties: { status: { type: "string", enum: ["DIMUAT", "SURVEI", "TERJUAL"] } },
    },
  },
  {
    name: "produktivitas",
    description:
      "Peringkat produktivitas dari ritase tervalidasi, per unit angkut / per driver / per vendor. Untuk unit disertai capaian terhadap target dan klasifikasi produktif/andal/merugikan.",
    input_schema: {
      type: "object",
      properties: {
        dimensi: { type: "string", enum: ["unit", "driver", "vendor"] },
        dari: { type: "string", description: "Tanggal awal ISO yyyy-mm-dd" },
        sampai: { type: "string", description: "Tanggal akhir ISO yyyy-mm-dd, inklusif" },
      },
      required: ["dimensi"],
    },
  },
  {
    name: "rekap_pit",
    description:
      "Rekap produksi tervalidasi per tanggal per pit, dipisah ore (kadar ≥ COG) dan waste. Pakai untuk pertanyaan 'produksi per pit', 'pit mana yang paling produktif', atau 'berapa ore vs waste'.",
    input_schema: {
      type: "object",
      properties: {
        dari: { type: "string", description: "Tanggal awal ISO yyyy-mm-dd" },
        sampai: { type: "string", description: "Tanggal akhir ISO yyyy-mm-dd, inklusif" },
      },
    },
  },
  {
    name: "buat_laporan",
    description:
      "Siapkan dokumen laporan resmi siap cetak/simpan PDF. Gunakan bila user minta 'laporan', 'report', 'PDF', atau 'cetak'. Tool ini mengembalikan tautan halaman laporan — sampaikan tautan itu apa adanya kepada user beserta ringkasan isinya. Template dokumennya sudah baku (kop, catatan, tanda tangan); kamu hanya memilih jenis dan periode.",
    input_schema: {
      type: "object",
      properties: {
        jenis: {
          type: "string",
          enum: ["harian", "periode", "vendor", "rantai"],
          description:
            "harian = Laporan Produksi Harian (butuh tanggal); periode = Rekap Produksi Periode; vendor = Laporan Pembayaran Vendor (AP); rantai = Laporan Rantai Fisik & Penjualan",
        },
        dari: { type: "string", description: "Tanggal awal ISO yyyy-mm-dd. Untuk jenis 'harian', isi tanggalnya di sini." },
        sampai: { type: "string", description: "Tanggal akhir ISO yyyy-mm-dd, inklusif. Kosongkan untuk laporan harian." },
      },
      required: ["jenis"],
    },
  },
  {
    name: "usul_input_ritase",
    description:
      "USULAN mencatat satu ritase baru. Tool ini TIDAK langsung menyimpan — usulan ditampilkan ke user untuk dikonfirmasi. Pastikan unitId, driverId, materialId, dan stockpileId valid (cek lewat daftar_master) sebelum mengusulkan.",
    input_schema: {
      type: "object",
      properties: {
        tanggal: { type: "string", description: "ISO yyyy-mm-dd" },
        unitId: { type: "string", description: "Kode dump truck, mis. DT-1021" },
        driverId: { type: "string", description: "ID driver" },
        materialId: { type: "string", description: "ID material, mis. mat-sap" },
        asal: { type: "string", description: "Pit asal, mis. Pit A" },
        stockpileId: { type: "string", description: "ID stockpile tujuan, mis. sp-eto1" },
      },
      required: ["tanggal", "unitId", "driverId", "materialId", "asal", "stockpileId"],
    },
  },
  {
    name: "usul_validasi_ritase",
    description:
      "USULAN menyetujui atau menolak satu ritase. Tool ini TIDAK langsung mengeksekusi — usulan ditampilkan ke user untuk dikonfirmasi, lalu dijalankan atas nama user yang login. Hanya peran yang sesuai tahap yang akan diterima server (BRULE-006).",
    input_schema: {
      type: "object",
      properties: {
        ritaseId: { type: "string", description: "ID ritase (dapatkan dari cari_ritase)" },
        aksi: { type: "string", enum: ["setuju", "tolak"] },
        alasan: { type: "string", description: "Wajib diisi bila aksi = tolak" },
      },
      required: ["ritaseId", "aksi"],
    },
  },
];

/** Bentuk OpenAI, diturunkan dari definisi di atas — satu sumber, tanpa duplikasi. */
export const DEFINISI_ALAT_OPENAI = DEFINISI_ALAT.map((t) => ({
  type: "function" as const,
  function: { name: t.name, description: t.description, parameters: t.input_schema as Record<string, unknown> },
}));
