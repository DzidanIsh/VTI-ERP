/**
 * Konten DATA CONTOH per submodul (arahan 2026-08-11: semua submodul diisi
 * dulu sesuai pemahaman + inovasi, bukan ComingSoon). Semua angka ILUSTRATIF
 * dan halamannya memasang BannerContoh. Saat submodul dibangun sungguhan,
 * hapus entrinya di sini dan buat halaman aslinya.
 */
export interface KontenContoh {
  judul: string;
  deskripsi: string;
  catatan?: string;
  kpi?: { label: string; value: string; sub?: string }[];
  tabelJudul?: string;
  kolom?: string[];
  baris?: (string | number)[][];
}

export const SUBMODUL: Record<string, KontenContoh> = {
  // ===================== INVENTORY =====================
  "/inventory/material-request": {
    judul: "Material Request",
    deskripsi: "Permintaan material dari divisi ke gudang",
    kpi: [
      { label: "Menunggu", value: "7" },
      { label: "Disetujui", value: "12" },
      { label: "Dipenuhi bulan ini", value: "31" },
      { label: "Ditolak", value: "2" },
    ],
    kolom: ["No. MR", "Peminta", "Barang", "Qty", "Status"],
    baris: [
      ["MR-2608-014", "Workshop", "Filter oli PC300", "12 pcs", "Menunggu"],
      ["MR-2608-013", "Operasional", "Solar industri", "8.000 L", "Disetujui"],
      ["MR-2608-012", "Workshop", "Ban DT 11.00-20", "6 pcs", "Dipenuhi"],
      ["MR-2608-011", "Kantor site", "APD helm + rompi", "20 set", "Dipenuhi"],
    ],
  },
  "/inventory/recheck-stock": {
    judul: "Recheck Stock Availability",
    deskripsi: "Pemeriksaan ketersediaan stok sebelum MR disetujui",
    kolom: ["Barang", "Gudang", "Tercatat", "Fisik", "Selisih"],
    baris: [
      ["Filter oli PC300", "Gudang Workshop", 18, 17, -1],
      ["Solar industri (L)", "Tangki Site", "42.500", "41.900", "-600"],
      ["Grease EP2 (kg)", "Gudang Workshop", 120, 120, 0],
    ],
  },
  "/inventory/stock-count": {
    judul: "Stock Count",
    deskripsi: "Penghitungan fisik berkala (stock opname)",
    kpi: [
      { label: "Opname terakhir", value: "31 Jul 2026" },
      { label: "Item dihitung", value: "412" },
      { label: "Selisih ditemukan", value: "9", sub: "2,2% dari item" },
      { label: "Nilai selisih", value: "Rp41 jt" },
    ],
    kolom: ["Periode", "Gudang", "Item", "Selisih", "Status"],
    baris: [
      ["Jul 2026", "Gudang Workshop", 412, 9, "Selesai — disesuaikan"],
      ["Jun 2026", "Gudang Workshop", 405, 14, "Selesai — disesuaikan"],
      ["Mei 2026", "Tangki Site", 6, 1, "Selesai"],
    ],
  },
  "/inventory/procurement-planning": {
    judul: "Procurement Planning",
    deskripsi: "Rencana pengadaan berdasarkan pemakaian & jadwal service",
    catatan: "Kelak terhubung papan Service Unit: jadwal service mendekat = kebutuhan spare part muncul di sini.",
    kolom: ["Kebutuhan", "Sumber sinyal", "Perkiraan waktu", "Status"],
    baris: [
      ["Filter + oli service PC300", "Service EXC-002 mendekat", "Minggu ini", "Draft PR"],
      ["Solar 40.000 L", "Konsumsi rata-rata 8.000 L/hari", "5 hari lagi", "PO terbit"],
      ["Ban DT cadangan", "3 unit mendekati batas aus", "2 minggu", "Direncanakan"],
    ],
  },
  "/inventory/replenishment": {
    judul: "Replenishment",
    deskripsi: "Pengisian ulang otomatis saat stok menyentuh titik pesan",
    kolom: ["Barang", "Stok", "Titik pesan", "Qty pesan", "Status"],
    baris: [
      ["Grease EP2 (kg)", 120, 100, 200, "Aman"],
      ["Filter udara DT", 4, 6, 24, "PESAN SEKARANG"],
      ["Solar industri (L)", "41.900", "30.000", "40.000", "Aman"],
    ],
  },
  "/inventory/reordering-rules": {
    judul: "Reordering Rules",
    deskripsi: "Aturan titik pesan & kuantitas pesan per barang",
    kolom: ["Barang", "Min", "Maks", "Qty pesan", "Vendor utama"],
    baris: [
      ["Solar industri (L)", "30.000", "60.000", "40.000", "Pertamina Patra Niaga"],
      ["Filter oli PC300", 6, 30, 24, "PT Trakindo Utama"],
      ["Ban DT 11.00-20", 4, 12, 8, "PT United Tractors"],
    ],
  },
  "/inventory/internal-transfer": {
    judul: "Internal Transfer",
    deskripsi: "Perpindahan barang antar gudang/lokasi di dalam site",
    kolom: ["No. Transfer", "Dari", "Ke", "Barang", "Status"],
    baris: [
      ["IT-2608-005", "Gudang Workshop", "Pos Pit A", "Grease EP2 20 kg", "Diterima"],
      ["IT-2608-004", "Tangki Site", "Fuel truck FT-01", "Solar 8.000 L", "Dalam perjalanan"],
    ],
  },
  "/inventory/products": {
    judul: "Products",
    deskripsi: "Master barang: spare part, BBM, consumable, APD",
    kpi: [
      { label: "Total SKU", value: "412" },
      { label: "Aktif", value: "398" },
      { label: "Kategori", value: "12" },
      { label: "Bernilai stok", value: "Rp2,1 M" },
    ],
    kolom: ["SKU", "Nama", "Kategori", "Satuan", "Stok"],
    baris: [
      ["SP-0031", "Filter oli PC300", "Spare part", "pcs", 17],
      ["FU-0001", "Solar industri", "BBM", "liter", "41.900"],
      ["CN-0102", "Grease EP2", "Consumable", "kg", 120],
      ["AP-0007", "Helm proyek", "APD", "pcs", 45],
    ],
  },
  "/inventory/operations": {
    judul: "Operations",
    deskripsi: "Riwayat operasi gudang: penerimaan, pengeluaran, penyesuaian",
    kolom: ["Referensi", "Tipe", "Partner/Lokasi", "Status"],
    baris: [
      ["RCV-2608-021", "Penerimaan", "PT Trakindo Utama", "Selesai"],
      ["ISS-2608-104", "Pengeluaran", "Workshop", "Selesai"],
      ["ADJ-2607-003", "Penyesuaian", "Opname Jul", "Selesai"],
    ],
  },

  // ===================== ASSET =====================
  "/asset/database": {
    judul: "Asset Database",
    deskripsi: "Register seluruh aset: alat berat, kendaraan, bangunan",
    kpi: [
      { label: "Total aset", value: "142" },
      { label: "Alat berat", value: "38" },
      { label: "Kendaraan", value: "51" },
      { label: "Nilai buku", value: "Rp184,5 M" },
    ],
    kolom: ["Kode", "Nama", "Kategori", "Perolehan", "Nilai buku"],
    baris: [
      ["EXC-001", "Excavator Komatsu PC200", "Alat berat", "2023", "Rp1,4 M"],
      ["DT-1021", "Dump Truck Hino 500", "Kendaraan", "2024", "Rp2,4 M"],
      ["GEN-003", "Genset 250 kVA", "Plant", "2024", "Rp380 jt"],
    ],
  },
  "/asset/movement": {
    judul: "Asset Movement",
    deskripsi: "Perpindahan aset antar lokasi/pit dan serah terima penanggung jawab",
    kolom: ["Aset", "Dari", "Ke", "Tanggal", "PIC baru"],
    baris: [
      ["EXC-002", "Pit A", "Pit C", "08 Agu 2026", "Pengawas C"],
      ["DT-1044", "Pool", "Pit A", "05 Agu 2026", "Vendor Hauling"],
    ],
  },
  "/asset/maintenance": {
    judul: "Maintenance Schedule",
    deskripsi: "Jadwal perawatan berkala — sumber datanya papan Service Unit",
    catatan: "Versi berfungsi ada di Produksi → Service Unit (HM & interval nyata). Halaman ini kelak merangkumnya per rencana kerja workshop.",
    kolom: ["Unit", "Jenis service", "Jadwal", "Status"],
    baris: [
      ["EXC-002", "Service 250 jam", "Minggu ini", "Menunggu spare part"],
      ["DT-1021", "Service 250 jam", "2 minggu lagi", "Terjadwal"],
      ["GEN-003", "Servis bulanan", "20 Agu 2026", "Terjadwal"],
    ],
  },
  "/asset/repairs": {
    judul: "Repair Orders",
    deskripsi: "Perintah kerja perbaikan dari kejadian breakdown",
    catatan: "Kelak terhubung Status Unit & Kendala: kejadian BREAKDOWN otomatis membuka draft repair order.",
    kolom: ["No. RO", "Unit", "Keluhan", "Mekanik", "Status"],
    baris: [
      ["RO-2608-009", "EXC-005", "Hose hidrolik bocor", "Tim A", "Dikerjakan"],
      ["RO-2608-008", "DT-1099", "Rem belakang lemah", "Tim B", "Menunggu part"],
      ["RO-2608-007", "WL-2002", "AC kabin mati", "Tim A", "Selesai"],
    ],
  },
  "/asset/fleet": {
    judul: "Fleet Management",
    deskripsi: "Armada kendaraan: STNK, KIR, asuransi, penugasan",
    kolom: ["Unit", "Plat", "STNK s.d.", "KIR s.d.", "Penugasan"],
    baris: [
      ["DT-1021", "DD 8812 XY", "Mar 2027", "Des 2026", "Hauling Pit A"],
      ["LV-004", "DD 1290 AB", "Jan 2027", "—", "Operasional site"],
      ["FT-01", "DD 9921 CD", "Jun 2027", "Sep 2026", "Fuel truck"],
    ],
  },
  "/asset/depreciation": {
    judul: "Depreciation",
    deskripsi: "Penyusutan aset per periode (garis lurus)",
    kolom: ["Aset", "Umur (thn)", "Penyusutan/bln", "Akumulasi", "Nilai buku"],
    baris: [
      ["EXC-001", 8, "Rp19 jt", "Rp610 jt", "Rp1,4 M"],
      ["DT-1021", 8, "Rp26 jt", "Rp520 jt", "Rp2,4 M"],
      ["GEN-003", 10, "Rp3,5 jt", "Rp84 jt", "Rp380 jt"],
    ],
  },

  // ===================== CRM SALES =====================
  "/sales/orders": {
    judul: "Quotations / SO",
    deskripsi: "Penawaran & sales order penjualan bijih",
    kolom: ["No.", "Pembeli", "Tanggal", "Nilai", "Status"],
    baris: [
      ["SO/2608/004", "PT IMIP (Smelter)", "08 Agu 2026", "Rp12,4 M", "Sales Order"],
      ["QO/2608/016", "PT Gunbuster Nickel", "05 Agu 2026", "Rp5,6 M", "Quotation"],
      ["SO/2607/003", "PT Tsingshan", "28 Jul 2026", "Rp15,2 M", "Selesai"],
    ],
  },
  "/sales/customers": {
    judul: "Customers",
    deskripsi: "Pembeli bijih: smelter & trader di kawasan Morowali",
    kolom: ["Pembeli", "Jenis", "Kontrak s.d.", "Volume 2026", "Piutang"],
    baris: [
      ["PT IMIP (Smelter)", "Smelter", "Des 2026", "182.000 t", "Rp12,4 M"],
      ["PT Tsingshan", "Smelter", "Des 2026", "95.000 t", "—"],
      ["PT Gunbuster Nickel", "Smelter", "Nego", "—", "—"],
    ],
  },
  "/sales/pipeline": {
    judul: "Leads / Pipeline",
    deskripsi: "Prospek pembeli baru & tahapan negosiasinya",
    kolom: ["Prospek", "Tahap", "Perkiraan volume", "PIC"],
    baris: [
      ["PT Gunbuster Nickel", "Penawaran harga", "20.000 t/bln", "Marketing"],
      ["Trader Surabaya", "Kontak awal", "5.000 t spot", "Direksi"],
    ],
  },
  "/sales/rfm": {
    judul: "RFM Analysis",
    deskripsi: "Segmentasi pembeli: recency, frequency, monetary",
    kolom: ["Pembeli", "Terakhir beli", "Frekuensi/6bln", "Nilai/6bln", "Segmen"],
    baris: [
      ["PT IMIP (Smelter)", "Agu 2026", 14, "Rp96 M", "Champion"],
      ["PT Tsingshan", "Jul 2026", 8, "Rp58 M", "Loyal"],
      ["PT Vale Indonesia", "Mei 2026", 2, "Rp17 M", "Perlu perhatian"],
    ],
  },
  "/sales/forecast": {
    judul: "Sales Forecast",
    deskripsi: "Proyeksi penjualan dari kontrak berjalan + pipeline",
    kolom: ["Bulan", "Kontrak (t)", "Pipeline (t)", "Proyeksi nilai"],
    baris: [
      ["Sep 2026", "38.000", "8.000", "Rp51 M"],
      ["Okt 2026", "38.000", "12.000", "Rp55 M"],
      ["Nov 2026", "40.000", "12.000", "Rp58 M"],
    ],
  },

  // ===================== ACCOUNTING =====================
  "/accounting/invoices": {
    judul: "Customer Invoices (AR)",
    deskripsi: "Tagihan ke pembeli bijih & status pembayarannya",
    catatan: "Versi sungguhan akan lahir dari Shipment TERJUAL (tonase final × harga) — dasar datanya sudah ada di modul Produksi.",
    kolom: ["No.", "Pembeli", "Jatuh tempo", "Nilai", "Status"],
    baris: [
      ["INV/2608/101", "PT IMIP (Smelter)", "10 Sep 2026", "Rp12,4 M", "Terkirim"],
      ["INV/2607/098", "PT Vale Indonesia", "05 Agu 2026", "Rp8,9 M", "Dibayar"],
      ["INV/2607/095", "PT Tsingshan", "12 Agu 2026", "Rp15,2 M", "Terkirim"],
    ],
  },
  "/accounting/bills": {
    judul: "Vendor Bills (AP)",
    deskripsi: "Tagihan dari vendor & jadwal pembayarannya",
    catatan: "Versi sungguhan akan lahir dari ritase DISETUJUI per periode per vendor — dasar datanya sudah tervalidasi berlapis.",
    kolom: ["No.", "Vendor", "Jatuh tempo", "Nilai", "Status"],
    baris: [
      ["BILL/2608/044", "Vendor Hauling A", "30 Agu 2026", "Rp3,2 M", "Diverifikasi"],
      ["BILL/2608/041", "Pertamina Patra Niaga", "28 Agu 2026", "Rp4,6 M", "Draft"],
      ["BILL/2607/039", "PT Trakindo Utama", "31 Jul 2026", "Rp1,1 M", "Dibayar"],
    ],
  },
  "/accounting/bank": {
    judul: "Bank & Cash",
    deskripsi: "Posisi kas & bank harian",
    kpi: [
      { label: "BCA operasional", value: "Rp38,2 M" },
      { label: "CIMB payroll", value: "Rp6,1 M" },
      { label: "Petty cash site", value: "Rp180 jt" },
      { label: "Total", value: "Rp44,5 M" },
    ],
    kolom: ["Tanggal", "Rekening", "Uraian", "Masuk", "Keluar"],
    baris: [
      ["08 Agu", "BCA", "Pembayaran INV/2607/098", "Rp8,9 M", "—"],
      ["07 Agu", "BCA", "Bayar BILL/2607/039", "—", "Rp1,1 M"],
      ["05 Agu", "CIMB", "Payroll Jul 2026", "—", "Rp2,8 M"],
    ],
  },
  "/accounting/giro": {
    judul: "GIRO",
    deskripsi: "Giro keluar/masuk & tanggal jatuh temponya",
    kolom: ["No. Giro", "Penerima", "Jatuh tempo", "Nilai", "Status"],
    baris: [
      ["GR-2608-07", "PT Trakindo Utama", "25 Agu 2026", "Rp850 jt", "Beredar"],
      ["GR-2607-05", "Vendor MRR", "31 Jul 2026", "Rp420 jt", "Cair"],
    ],
  },
  "/accounting/e-faktur": {
    judul: "E-Faktur",
    deskripsi: "Faktur pajak keluaran/masukan & status upload DJP",
    kolom: ["No. Faktur", "Lawan transaksi", "Masa", "PPN", "Status"],
    baris: [
      ["010.001-26.00000112", "PT IMIP (Smelter)", "Agu 2026", "Rp1,36 M", "Approved"],
      ["010.001-26.00000111", "PT Tsingshan", "Jul 2026", "Rp1,67 M", "Approved"],
    ],
  },
  "/accounting/reports": {
    judul: "Financial Reports",
    deskripsi: "Neraca, laba rugi, arus kas per periode",
    kpi: [
      { label: "Pendapatan YTD", value: "Rp312 M" },
      { label: "Laba kotor YTD", value: "Rp94 M", sub: "margin 30%" },
      { label: "Beban ops YTD", value: "Rp41 M" },
      { label: "Laba bersih YTD", value: "Rp39 M" },
    ],
    kolom: ["Laporan", "Periode", "Status"],
    baris: [
      ["Laba Rugi", "Jul 2026", "Final"],
      ["Neraca", "Jul 2026", "Final"],
      ["Arus Kas", "Jul 2026", "Draft"],
    ],
  },
  "/accounting/budget": {
    judul: "Budget",
    deskripsi: "Anggaran vs realisasi per pos biaya",
    kolom: ["Pos", "Anggaran/bln", "Realisasi Jul", "Selisih"],
    baris: [
      ["BBM & pelumas", "Rp9,5 M", "Rp9,2 M", "+3%"],
      ["Jasa hauling vendor", "Rp6,0 M", "Rp6,4 M", "-7%"],
      ["Spare part & maintenance", "Rp4,0 M", "Rp5,4 M", "-35%"],
      ["Gaji & tunjangan", "Rp2,8 M", "Rp2,8 M", "0%"],
    ],
  },

  // ===================== PURCHASE =====================
  "/purchase/rfq": {
    judul: "Request for Quotation",
    deskripsi: "Permintaan penawaran harga ke beberapa vendor",
    kolom: ["No. RFQ", "Kebutuhan", "Vendor diundang", "Batas jawab", "Status"],
    baris: [
      ["RFQ-2608-061", "Ban DT 11.00-20 (8)", 3, "12 Agu 2026", "Menunggu"],
      ["RFQ-2608-060", "Oli hidrolik 209 L (4)", 2, "10 Agu 2026", "Penawaran masuk"],
    ],
  },
  "/purchase/orders": {
    judul: "Purchase Orders",
    deskripsi: "PO berjalan & status penerimaannya",
    kolom: ["No. PO", "Vendor", "Nilai", "Kirim", "Status"],
    baris: [
      ["PO/2608/210", "Pertamina Patra Niaga", "Rp6,8 M", "10 Agu", "PO terbit"],
      ["PO/2608/208", "PT Trakindo Utama", "Rp2,4 M", "07 Agu", "Diterima"],
      ["PO/2607/205", "PT Shell Indonesia", "Rp1,35 M", "28 Jul", "Ditagih"],
    ],
  },
  "/purchase/requests": {
    judul: "Purchase Requests",
    deskripsi: "Permintaan pembelian dari divisi sebelum jadi RFQ/PO",
    kolom: ["No. PR", "Peminta", "Kebutuhan", "Status"],
    baris: [
      ["PR-2608-033", "Workshop", "Filter + oli service PC300", "Disetujui → RFQ"],
      ["PR-2608-032", "HSE", "APAR 6 kg (10)", "Menunggu persetujuan"],
    ],
  },
  "/purchase/vendors": {
    judul: "Vendors",
    deskripsi: "Master vendor pengadaan & evaluasinya",
    kolom: ["Vendor", "Kategori", "PO 2026", "Ketepatan kirim", "Rating"],
    baris: [
      ["Pertamina Patra Niaga", "BBM", 22, "98%", "A"],
      ["PT Trakindo Utama", "Spare part", 15, "91%", "A"],
      ["PT United Tractors", "Spare part", 8, "85%", "B"],
    ],
  },
  "/purchase/tender": {
    judul: "Tender",
    deskripsi: "Tender pengadaan bernilai besar",
    kolom: ["Paket", "Nilai perkiraan", "Peserta", "Tahap"],
    baris: [
      ["Kontrak BBM 2027", "Rp110 M/thn", 3, "Evaluasi penawaran"],
      ["Sewa 10 DT tambahan", "Rp14 M/thn", 4, "Aanwijzing"],
    ],
  },

  // ===================== HR =====================
  "/hr/karyawan": {
    judul: "Data Karyawan",
    deskripsi: "Master karyawan: identitas, jabatan, penempatan",
    kpi: [
      { label: "Total karyawan", value: "87" },
      { label: "Operasional site", value: "64" },
      { label: "Kantor", value: "23" },
      { label: "Kontrak habis ≤60 hari", value: "5" },
    ],
    kolom: ["NIK", "Nama", "Jabatan", "Divisi", "Status"],
    baris: [
      ["VTI-0012", "Andi Saputra", "Driver DT", "Operasional", "Tetap"],
      ["VTI-0034", "Rudi Pengawas", "Pengawas lapangan", "Operasional", "Tetap"],
      ["VTI-0051", "Sari Checker", "Checker", "Operasional", "Kontrak"],
      ["VTI-0066", "Lia Lab", "Analis lab", "Laboratorium", "Kontrak"],
    ],
  },
  "/hr/onboarding": {
    judul: "Onboarding",
    deskripsi: "Proses masuk karyawan baru: dokumen, induksi K3, akun sistem",
    kolom: ["Nama", "Mulai", "Induksi K3", "APD", "Akun ERP"],
    baris: [
      ["Calon mekanik (2)", "15 Agu 2026", "Terjadwal", "Disiapkan", "Belum"],
      ["Admin logistik", "01 Agu 2026", "Selesai", "Selesai", "Aktif"],
    ],
  },
  "/hr/mutasi": {
    judul: "Promosi & Mutasi",
    deskripsi: "Perpindahan jabatan/penempatan karyawan",
    kolom: ["Nama", "Dari", "Ke", "Efektif", "Status"],
    baris: [
      ["Budi Hartono", "Driver DT", "Operator WL", "01 Sep 2026", "Disetujui"],
      ["Chandra Wijaya", "Pit A", "Pit C", "15 Agu 2026", "Diajukan"],
    ],
  },
  "/hr/keluar": {
    judul: "Pengunduran Diri",
    deskripsi: "Proses keluar: exit clearance, serah terima, hak akhir",
    kolom: ["Nama", "Tanggal akhir", "Clearance", "Hak akhir", "Status"],
    baris: [
      ["Eks-admin gudang", "31 Jul 2026", "Selesai", "Dibayar", "Tutup"],
    ],
  },
  // "/hr/cuti" sudah jadi halaman sungguhan (app/hr/cuti/page.tsx) — muara
  // pengajuan surat izin dari halaman Presensi.
  "/hr/saldo-cuti": {
    judul: "Saldo & Jenis Cuti",
    deskripsi: "Saldo cuti per karyawan per jenis",
    kolom: ["Nama", "Tahunan", "Terpakai", "Sisa"],
    baris: [
      ["Andi Saputra", 12, 4, 8],
      ["Rudi Pengawas", 12, 7, 5],
      ["Sari Checker", 12, 2, 10],
    ],
  },
  "/hr/hari-libur": {
    judul: "Hari Libur",
    deskripsi: "Kalender libur nasional & libur site",
    kolom: ["Tanggal", "Keterangan", "Jenis"],
    baris: [
      ["17 Agu 2026", "HUT RI", "Nasional"],
      ["08 Sep 2026", "Maulid Nabi", "Nasional"],
    ],
  },
  "/hr/shift": {
    judul: "Shift Kerja",
    deskripsi: "Pola shift operasional site",
    kolom: ["Shift", "Jam", "Berlaku untuk"],
    baris: [
      ["Shift 1", "07:00–19:00 WITA", "Operasional lapangan"],
      ["Shift 2", "19:00–07:00 WITA", "Operasional lapangan (saat 2 shift)"],
      ["Non-shift", "08:00–17:00 WITA", "Kantor site"],
    ],
  },
  "/hr/klaim": {
    judul: "Klaim Biaya",
    deskripsi: "Penggantian biaya dinas/operasional karyawan",
    kolom: ["Nama", "Uraian", "Nilai", "Status"],
    baris: [
      ["Rudi Pengawas", "Perjalanan dinas Kendari", "Rp1,8 jt", "Menunggu verifikasi"],
      ["Admin site", "ATK bulanan", "Rp420 rb", "Dibayar"],
    ],
  },
  "/hr/uang-muka": {
    judul: "Uang Muka Karyawan",
    deskripsi: "Kasbon & pelunasannya via potong gaji",
    kolom: ["Nama", "Nilai", "Sisa", "Potong/bln", "Status"],
    baris: [
      ["Gunawan", "Rp3 jt", "Rp1 jt", "Rp500 rb", "Berjalan"],
      ["Faisal Rahman", "Rp2 jt", "—", "—", "Lunas"],
    ],
  },
  "/hr/sasaran": {
    judul: "Sasaran & KRA",
    deskripsi: "Sasaran kinerja per jabatan",
    kolom: ["Jabatan", "Sasaran", "Bobot", "Ukuran"],
    baris: [
      ["Pengawas lapangan", "Validasi ritase ≤ 1×24 jam", "30%", "% tepat waktu"],
      ["Driver DT", "Nol pelanggaran K3", "25%", "Insiden"],
      ["Analis lab", "Hasil sampel ≤ 8 jam", "30%", "Rata-rata jam"],
    ],
  },
  "/hr/penilaian": {
    judul: "Siklus Penilaian",
    deskripsi: "Periode penilaian kinerja & statusnya",
    kolom: ["Periode", "Cakupan", "Status"],
    baris: [
      ["Semester 1 2026", "Seluruh karyawan", "Selesai"],
      ["Semester 2 2026", "Seluruh karyawan", "Berjalan — sasaran diisi"],
    ],
  },
  "/hr/struktur-gaji": {
    judul: "Struktur Gaji",
    deskripsi: "Komposisi gaji per golongan jabatan",
    catatan: "Kelak menyambung ke presensi (durasi kerja & lembur) yang sudah tercatat sistem.",
    kolom: ["Golongan", "Gaji pokok", "Tunj. site", "Tunj. jabatan"],
    baris: [
      ["Operator/Driver", "Rp4,2 jt", "Rp1,5 jt", "—"],
      ["Pengawas", "Rp6,5 jt", "Rp2 jt", "Rp1 jt"],
      ["Kepala divisi", "Rp12 jt", "Rp2,5 jt", "Rp3 jt"],
    ],
  },
  "/hr/komponen-gaji": {
    judul: "Komponen Gaji",
    deskripsi: "Komponen penambah & pemotong payroll",
    kolom: ["Komponen", "Jenis", "Dasar hitung"],
    baris: [
      ["Lembur", "Penambah", "1,5× upah/jam (jam pertama)"],
      ["BPJS TK", "Pemotong", "2% gaji pokok"],
      ["Kasbon", "Pemotong", "Sesuai jadwal uang muka"],
    ],
  },
  "/hr/slip-gaji": {
    judul: "Slip Gaji",
    deskripsi: "Slip gaji terbit per periode payroll",
    kolom: ["Periode", "Karyawan", "Terbit", "Status"],
    baris: [
      ["Jul 2026", 87, "01 Agu 2026", "Terkirim"],
      ["Jun 2026", 85, "01 Jul 2026", "Terkirim"],
    ],
  },
  "/hr/periode-payroll": {
    judul: "Periode Payroll",
    deskripsi: "Jadwal cut-off & pembayaran gaji",
    kolom: ["Periode", "Cut-off presensi", "Bayar", "Status"],
    baris: [
      ["Agu 2026", "25 Agu", "01 Sep", "Berjalan"],
      ["Jul 2026", "25 Jul", "01 Agu", "Selesai"],
    ],
  },
  "/hr/pph": {
    judul: "Lapisan PPh 21",
    deskripsi: "Lapisan tarif PPh 21 yang dipakai payroll",
    kolom: ["Lapisan", "Penghasilan kena pajak/thn", "Tarif"],
    baris: [
      ["I", "≤ Rp60 jt", "5%"],
      ["II", "Rp60–250 jt", "15%"],
      ["III", "Rp250–500 jt", "25%"],
      ["IV", "> Rp500 jt", "30%"],
    ],
  },
  "/hr/laporan-kehadiran": {
    judul: "Rekap Kehadiran Bulanan",
    deskripsi: "Rekap hadir/absen/cuti per karyawan per bulan",
    catatan: "Data mentahnya sudah nyata di halaman Presensi; rekap bulanan ini menyusul dari sana.",
    kolom: ["Nama", "Hadir", "Cuti", "Tanpa keterangan", "Rata-rata jam"],
    baris: [
      ["Andi Saputra", 24, 1, 0, "9j 10m"],
      ["Rudi Pengawas", 25, 0, 0, "9j 45m"],
      ["Sari Checker", 23, 2, 0, "8j 55m"],
    ],
  },
  "/hr/laporan-cuti": {
    judul: "Saldo Cuti Karyawan",
    deskripsi: "Laporan saldo cuti seluruh karyawan",
    kolom: ["Divisi", "Karyawan", "Rata-rata sisa cuti"],
    baris: [
      ["Operasional", 64, "7,2 hari"],
      ["Kantor", 23, "8,9 hari"],
    ],
  },
  "/hr/laporan-gaji": {
    judul: "Register Gaji",
    deskripsi: "Ringkasan payroll per periode",
    kolom: ["Periode", "Bruto", "Potongan", "Neto"],
    baris: [
      ["Jul 2026", "Rp3,1 M", "Rp310 jt", "Rp2,79 M"],
      ["Jun 2026", "Rp3,0 M", "Rp296 jt", "Rp2,71 M"],
    ],
  },
};
