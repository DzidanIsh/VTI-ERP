// Seed data awal — sama dengan mock UI (angka ilustratif, lihat docs/verifikasi-parameter.md).
// Jalankan: npm run db:seed
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Bersihkan (urutan aman terhadap FK)
  await prisma.auditLog.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.ritase.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.kejadianOperasi.deleteMany();
  await prisma.rencanaHarian.deleteMany();
  await prisma.unit.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.tongkang.deleteMany();
  await prisma.stockpile.deleteMany();
  await prisma.material.deleteMany();
  await prisma.vendor.deleteMany();

  // ===== Master =====
  const vendors = await Promise.all([
    prisma.vendor.create({ data: { id: "v-int", nama: "VIP (Internal)", peran: "Internal", hargaPerRitase: 0 } }),
    prisma.vendor.create({ data: { id: "v1", nama: "CV Karya Hauling", peran: "Hauling & Barging", hargaPerRitase: 185000 } }),
    prisma.vendor.create({ data: { id: "v2", nama: "PT Sinar Trans", peran: "Hauling & Barging", hargaPerRitase: 180000 } }),
    prisma.vendor.create({ data: { id: "v3", nama: "CV Morowali Logistik", peran: "Hauling & Barging", hargaPerRitase: 192000 } }),
    prisma.vendor.create({ data: { id: "v4", nama: "PT Bahodopi Angkutan", peran: "Hauling & Barging", hargaPerRitase: 178000 } }),
    prisma.vendor.create({ data: { id: "v5", nama: "CV Jalan Lestari (MRR)", peran: "Perawatan Jalan (MRR)", hargaPerRitase: 0 } }),
  ]);

  await prisma.unit.createMany({
    data: [
      { id: "EXC-001", nama: "Excavator Komatsu PC200", tipe: "PC200", kategori: "Excavator", bucketM3: 0.93, kapasitasM3: 0, vendorId: "v-int", targetTonBulan: 42000 },
      { id: "EXC-002", nama: "Excavator Komatsu PC300", tipe: "PC300", kategori: "Excavator", bucketM3: 1.4, kapasitasM3: 0, vendorId: "v-int", targetTonBulan: 58000 },
      { id: "EXC-005", nama: "Excavator Hitachi PC300", tipe: "PC300", kategori: "Excavator", bucketM3: 1.4, kapasitasM3: 0, vendorId: "v-int", targetTonBulan: 55000 },
      { id: "DT-1021", nama: "Dump Truck Hino 500", tipe: "DT", kategori: "Dump Truck", bucketM3: 0, kapasitasM3: 12, vendorId: "v1", targetTonBulan: 30000 },
      { id: "DT-1044", nama: "Dump Truck Scania P460", tipe: "DT", kategori: "Dump Truck", bucketM3: 0, kapasitasM3: 18, vendorId: "v2", targetTonBulan: 30000 },
      { id: "DT-1099", nama: "Dump Truck Mercedes Arocs", tipe: "DT", kategori: "Dump Truck", bucketM3: 0, kapasitasM3: 16, vendorId: "v3", targetTonBulan: 28000 },
      { id: "WL-003", nama: "Wheel Loader CAT 980", tipe: "WL", kategori: "Wheel Loader", bucketM3: 3.5, kapasitasM3: 0, vendorId: "v-int", targetTonBulan: 36000 },
    ],
  });

  const driverData = [
    { nama: "Andi Saputra", vendorId: "v1" },
    { nama: "Budi Hartono", vendorId: "v2" },
    { nama: "Chandra Wijaya", vendorId: "v3" },
    { nama: "Dedi Kurniawan", vendorId: "v4" },
    { nama: "Eko Prasetyo", vendorId: "v1" },
    { nama: "Faisal Rahman", vendorId: "v-int" },
    { nama: "Gunawan", vendorId: "v-int" },
  ];
  const drivers = [];
  for (const d of driverData) drivers.push(await prisma.driver.create({ data: d }));

  await prisma.material.createMany({
    data: [
      { id: "mat-sap", nama: "Saprolite (kadar tinggi)", density: 1.55, kadarDefault: 1.8 },
      { id: "mat-lim", nama: "Limonite", density: 1.45, kadarDefault: 1.4 },
      { id: "mat-low", nama: "Low grade", density: 1.4, kadarDefault: 1.2 },
    ],
  });

  await prisma.stockpile.createMany({
    data: [
      { id: "sp-eto1", kode: "ETO-1", kadar: 1.8, diAtasCOG: true },
      { id: "sp-eto2", kode: "ETO-2", kadar: 1.5, diAtasCOG: true },
      { id: "sp-ebo1", kode: "EBO-1", kadar: 1.35, diAtasCOG: true },
      { id: "sp-ebo2", kode: "EBO-2", kadar: 1.2, diAtasCOG: false },
    ],
  });

  await prisma.tongkang.createMany({
    data: [
      { id: "bg-01", nama: "Tongkang BG-01", kapasitas: 7500 },
      { id: "bg-02", nama: "Tongkang BG-02", kapasitas: 10000 },
      { id: "bg-03", nama: "Tongkang BG-03", kapasitas: 12000 },
      { id: "bg-04", nama: "Tongkang BG-04", kapasitas: 3500 },
    ],
  });

  // ===== Transaksi contoh =====
  const d = (day) => new Date(Date.UTC(2026, 5, day)); // Juni 2026

  // ===== Ritase: 1 baris = 1 bolak-balik, tonase melekat (FSD-002) =====
  const byName = (n) => drivers.find((x) => x.nama.startsWith(n)).id;
  const hargaOf = (vid) => vendors.find((v) => v.id === vid).hargaPerRitase;
  const kapasitas = { "DT-1021": 12, "DT-1044": 18, "DT-1099": 16 };
  const matDensity = { "mat-sap": 1.55, "mat-lim": 1.45, "mat-low": 1.4 };
  const matKadar = { "mat-sap": 1.8, "mat-lim": 1.4, "mat-low": 1.2 };
  const peran = ["Driver", "Pengawas", "Checker"];

  const mk = async (day, unitId, vendorId, driverName, materialId, asal, stockpileId, tahapIndex, status) => {
    const harga = hargaOf(vendorId);
    const kap = kapasitas[unitId];
    const density = matDensity[materialId];
    const tonase = +(kap * density).toFixed(1);
    const audit = [{ aksi: "buat", peran: "Driver", oleh: "seed", waktu: d(day) }];
    for (let i = 0; i < tahapIndex; i++) audit.push({ aksi: "setuju", peran: peran[i], oleh: "seed", waktu: d(day) });
    const r = await prisma.ritase.create({
      data: {
        tanggal: d(day), unitId, driverId: byName(driverName), vendorId, materialId,
        asal, stockpileId, kapasitasM3: kap, density, tonase, kadar: matKadar[materialId],
        hargaPerRitase: harga, nilai: harga, tahapIndex, status, audit: { create: audit },
      },
    });
    // Ritase tervalidasi penuh -> saldo stockpile bertambah (cerminan aturan di API)
    if (status === "DISETUJUI") {
      await prisma.stockMovement.create({
        data: { tanggal: d(day), stockpileId, jenis: "MASUK", tonase, sumber: `Hauling ${asal}`, ritaseId: r.id },
      });
    }
  };

  // Beberapa hari x beberapa rit per hari, campur status validasi
  const rencana = [
    ["DT-1021", "v1", "Andi", "mat-sap", "Pit A", "sp-eto1"],
    ["DT-1044", "v2", "Budi", "mat-sap", "Pit B", "sp-eto1"],
    ["DT-1099", "v3", "Chandra", "mat-lim", "Pit C", "sp-eto2"],
    ["DT-1021", "v1", "Eko", "mat-sap", "Pit A", "sp-eto1"],
    ["DT-1044", "v2", "Budi", "mat-lim", "Pit B", "sp-eto2"],
    ["DT-1099", "v3", "Dedi", "mat-low", "Pit D", "sp-ebo1"],
  ];
  for (let day = 10; day <= 15; day++) {
    for (let i = 0; i < rencana.length; i++) {
      const [unitId, vendorId, driverName, materialId, asal, stockpileId] = rencana[i];
      // hari-hari awal sudah tervalidasi penuh; hari terakhir masih di antrian validasi.
      // Tahap driver selesai saat input, jadi antrian hanya di pengawas (1) & checker (2).
      let tahapIndex = 3, status = "DISETUJUI";
      if (day === 15) {
        tahapIndex = 1 + (i % 2);
        status = "MENUNGGU";
      }
      await mk(day, unitId, vendorId, driverName, materialId, asal, stockpileId, tahapIndex, status);
    }
  }

  // Stok awal stockpile sebelum sistem dipakai (opening balance)
  await prisma.stockMovement.createMany({
    data: [
      { tanggal: d(1), stockpileId: "sp-eto1", jenis: "MASUK", tonase: 12000, sumber: "Saldo awal" },
      { tanggal: d(1), stockpileId: "sp-eto2", jenis: "MASUK", tonase: 9000, sumber: "Saldo awal" },
      { tanggal: d(1), stockpileId: "sp-ebo1", jenis: "MASUK", tonase: 5000, sumber: "Saldo awal" },
      { tanggal: d(1), stockpileId: "sp-ebo2", jenis: "MASUK", tonase: 2100, sumber: "Saldo awal" },
    ],
  });

  // Shipment contoh (3 titik ukur + deviasi)
  const sh1 = await prisma.shipment.create({
    data: {
      tanggal: d(14), tongkangId: "bg-02", stockpileId: "sp-eto1", kadar: 1.8,
      tonaseEstimasi: 10000, tonaseSurvei: 9200, tonaseFinal: 8600,
      hargaJual: 210000, pendapatan: BigInt(8600 * 210000), status: "TERJUAL",
    },
  });
  await prisma.stockMovement.create({
    data: { tanggal: d(14), stockpileId: "sp-eto1", jenis: "KELUAR", tonase: 10000, sumber: "Barging Tongkang BG-02", shipmentId: sh1.id },
  });
  const sh2 = await prisma.shipment.create({
    data: {
      tanggal: d(15), tongkangId: "bg-01", stockpileId: "sp-eto2", kadar: 1.5,
      tonaseEstimasi: 7000, tonaseSurvei: 6500, tonaseFinal: 6300, status: "SURVEI",
    },
  });
  await prisma.stockMovement.create({
    data: { tanggal: d(15), stockpileId: "sp-eto2", jenis: "KELUAR", tonase: 7000, sumber: "Barging Tongkang BG-01", shipmentId: sh2.id },
  });

  // ===== Rencana harian & kejadian operasi (Form D Produksi) =====
  // 6 rit/hari tervalidasi ≈ 132,8 t — target dibuat bervariasi agar
  // contoh "tercapai" dan "kurang" sama-sama terlihat di halaman rencana.
  await prisma.rencanaHarian.createMany({
    data: [10, 11, 12, 13, 14, 15].map((day) => ({
      tanggal: d(day),
      targetTon: day % 2 === 0 ? 130 : 150,
      catatan: day === 13 ? "Waspada hujan sore" : null,
      dibuatOleh: "seed",
    })),
  });

  await prisma.kejadianOperasi.createMany({
    data: [
      { tanggal: d(12), jenis: "BREAKDOWN", unitId: "DT-1021", jamMulai: "09:15", jamSelesai: "13:40", keterangan: "Ganti selang hidrolik", dicatatOleh: "seed" },
      { tanggal: d(13), jenis: "HUJAN", jamMulai: "14:00", jamSelesai: "16:30", keterangan: "Front Pit A & B berhenti", dicatatOleh: "seed" },
      { tanggal: d(13), jenis: "SLIPPERY", jamMulai: "16:30", jamSelesai: "17:45", keterangan: "Jalan hauling licin pasca hujan", dicatatOleh: "seed" },
      { tanggal: d(15), jenis: "STANDBY", unitId: "DT-1044", jamMulai: "07:30", keterangan: "Menunggu front loading siap", dicatatOleh: "seed" },
    ],
  });

  const counts = {
    vendor: await prisma.vendor.count(),
    unit: await prisma.unit.count(),
    driver: await prisma.driver.count(),
    ritase: await prisma.ritase.count(),
    movement: await prisma.stockMovement.count(),
    shipment: await prisma.shipment.count(),
    rencana: await prisma.rencanaHarian.count(),
    kejadian: await prisma.kejadianOperasi.count(),
  };
  console.log("Seed selesai:", counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
