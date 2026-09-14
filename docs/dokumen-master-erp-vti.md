# Dokumen Master ERP-VTI
## Perancangan & Analisis Sistem ERP — Operasi Kontraktor Tambang Nikel PT Vendoura Inti Perkasa (VIP)

| | |
|---|---|
| **Proyek** | ERP-VTI — Sistem Terintegrasi Operasi Tambang |
| **Jenis dokumen** | Master (Analisis Kebutuhan / SRS + Perancangan / SDD) |
| **Sumber** | Wawancara requirement gathering (rekaman 29 menit, 2 pembicara) |
| **Gabungan dari** | Analisis Kebutuhan (tim IT) + Perancangan & Implementasi ERP (rekan) |
| **Lampiran infrastruktur** | `Laporan-Arsitektur-Infrastruktur-ERP_2.docx` (cetak biru infra, lihat 11.5) |
| **Versi** | 1.1 — pemutakhiran arsitektur & status (2 Juli 2026) |
| **Status** | Aktif — acuan pengembangan |

> **Disclaimer keandalan data.** Seluruh kebutuhan & aturan bisnis di dokumen ini diturunkan dari **satu sesi wawancara**. Transkrip asli otomatis dan banyak salah istilah, sehingga istilah pertambangan ditafsirkan ulang dari konteks. Angka-angka (target 150.000 ton, density 1,4–1,55, cut-off grade 1,3, kapasitas tongkang 3.000–15.000 ton, batas muat 19–22 ton) **bersifat ilustratif** dan **WAJIB diverifikasi** ke narasumber sebelum dijadikan dasar perhitungan riil. Hal yang belum pasti dikumpulkan di Bagian 16.

---

## Bagian 0 — Pendahuluan

### 0.1 Tujuan & Cara Membaca

Dokumen ini adalah **satu sumber kebenaran** yang menggabungkan dua dokumen sebelumnya menjadi satu rujukan utuh, dibaca dengan dua cara:

- **Bagian I (Analisis — WHAT)** untuk manajemen & analis: apa yang dibutuhkan, mengapa, dan prioritasnya.
- **Bagian II & III (Desain & Eksekusi — HOW)** untuk tim pengembang: arsitektur, model data, integrasi, dan roadmap.
- **Lampiran A** berisi dasar ERP ringkas untuk pembaca yang baru mengenal konsep ERP.

Prinsip yang memayungi seluruh dokumen: **nilai ERP bukan pada modul-modul terpisah, melainkan pada keterhubungannya** — satu input lapangan (ritase) menggerakkan stok, biaya, dan wawasan manajemen secara serentak dan konsisten.

---

# Bagian I — Analisis Kebutuhan (WHAT)

## 1. Konteks Bisnis & Rantai Nilai

### 1.1 Posisi Perusahaan
PT VIP adalah **kontraktor penambangan nikel** yang bekerja di bawah perusahaan **induk (owner)**. VIP **tidak memiliki tambang**; ia menjalankan operasi atas nama owner. **Tanggung jawab VIP berakhir di tongkang** (bukan di pabrik); material baru menghasilkan uang setelah terjual, dan pengangkutan tongkang→pabrik di luar kontrak VIP.

> Implikasi sistem: ERP harus mencatat seluruh rantai dari penggalian sampai serah-terima di tongkang; titik penjualan = batas akhir tanggung jawab pendapatan.

### 1.2 Tiga Tahap Inti Operasi
```
PIT/TAMBANG --(1) MINING--> [muat] --(2) HAULING--> STOCKPILE (ETO/EBO)
   --(QA/QC owner: kadar & blending)--> --(3) BARGING--> TONGKANG --> PENJUALAN
```
- **Mining (penggalian)** — internal; didukung Engineering, Produksi, Operasional (alat berat), Plant/Workshop, Logistik.
- **Hauling (pengangkutan)** — pit → stockpile; oleh subkontraktor; dibayar **per ritase**.
- **Barging (pemuatan)** — stockpile → tongkang di jetty; oleh subkontraktor.

Plus **1 subkontraktor perawatan jalan (MRR)**. **Total 5 subkontraktor, semuanya di bawah tanggung jawab VIP** — fakta yang sangat memengaruhi desain hak akses.

### 1.3 Model Pendapatan & Logika Untung-Rugi
- Pembayaran subkontraktor = **jumlah ritase × harga kontrak per ritase** (rekap bulanan).
- Engineering menetapkan **target produksi bulanan** (mis. 150.000 ton), sudah memperhitungkan cuaca & breakdown.
- **Biaya operasional relatif tetap**, pendapatan variabel → bila target tak tercapai, **otomatis rugi**.
- Pendapatan riil terealisasi setelah terjual; **jumlah dibayar = tonase hasil pengukuran akhir di tongkang (independent survey)**, bukan perkiraan di tambang.

Inti nilai ERP bagi VIP: menghubungkan data **operasional** (ritase, tonase) dengan data **finansial** (biaya, pendapatan) otomatis, sehingga untung-rugi per unit & periode terlihat **real-time**, bukan saat tutup buku.

## 2. Aktor & Stakeholder

| Aktor | Peran terhadap sistem |
|---|---|
| Engineering Produksi | Menyusun plan (target produksi & penjualan; adj cuaca & breakdown) |
| Pengawas Produksi | Eksekusi plan; validasi tahap-2 ritase |
| Checker / Penulis | Mencatat & validasi tahap-3 ritase (titik kritis pembayaran) |
| Driver / Operator | Pelaku muat-angkut; validasi tahap-1; objek penilaian produktivitas |
| Operasional / Plant / Workshop / Logistik | Penyedia & perawatan unit; sumber data breakdown |
| HSE | Asesmen keamanan jalan & batas muat aman (19–22 ton) |
| QA/QC (owner) | Penetapan kadar, blending stockpile, survey (sumber data, bukan pengguna) |
| Vendor / Subkontraktor (5) | Input data produksi; data dipegang & divalidasi VIP |
| Manajemen / MCC | Mengonsumsi dashboard untung-rugi & performa |

## 3. Kondisi Saat Ini (As-Is) & Pain Points

Saat ini: pencatatan **manual di kertas**; pelaporan akhir di **Excel**. Sistem harus **menjawab pain point**, bukan sekadar mendigitalkan.

| Pain Point | Kondisi Saat Ini | Dampak |
|---|---|---|
| Pencatatan manual | Operasional di kertas; hanya pelaporan akhir Excel | Lambat, rawan hilang, sulit dianalisis |
| Kesalahan input berantai | Ritase divalidasi manual driver→pengawas→checker | Salah hitung langsung berdampak ke pembayaran vendor & driver |
| SDM terbatas & awam | Manpower engineering/produksi kurang & belum terbiasa IT | Sistem harus sangat mudah dipakai |
| Tidak ada visibilitas per-unit | Sulit tahu unit/driver produktif vs merugikan | Evaluasi lambat, kerugian telat terdeteksi |
| Deviasi tonase tak terlacak | Tonase berubah tiap titik ukur tanpa pencatatan sistematis | Sumber kebocoran tonase tak diketahui |

**Kebutuhan eksplisit narasumber:** dashboard otomatis di mana input ritase langsung menghasilkan analisis (unit & driver mana produktif, mana merugikan, mana andal); konsep **MCC (Monitoring Control Center)** terhubung perangkat tim IT.

## 4. Proses Bisnis (Alur & Titik Keputusan)

1. **Perencanaan (Engineering):** tentukan lokasi & target (produksi & penjualan); plan sudah dikurangi breakdown & cuaca.
   - *Keputusan — Cuaca/Air:* air = kendala utama; hujan/air dapat menghentikan/menggeser penambangan.
2. **Mining (Produksi):** excavator (PC200/PC300) memuat; **tonase = volume bucket × density**; output utama = capaian tonase + penandaan kadar.
3. **Hauling:** pit → stockpile.
   - *Keputusan — HSE:* batas muat aman per kondisi jalan (mayoritas ~22 ton; satu vendor ~19 ton; bisa turun saat jalan buruk).
   - Pengukuran ganda: **by trip/ritase** & **by survey** (RTK / Total Station).
4. **Stockpile & Blending (QA/QC owner):** ukur kadar & blending ke tumpukan (ETO/EBO); tiap tumpukan punya nilai kadar.
   - *Keputusan — COG:* kadar < COG (mis. <1,3) = **waste**; kadar ≥ COG yang dijual.
5. **Barging:** ambil material (acak per kadar) → tongkang (3.000–15.000 ton).
6. **Survey & Pembayaran:** **independent/draft survey** tongkang = **tonase aktual** → dasar pembayaran. **Deviasi** bertingkat (mis. estimasi 10.000 → stockpile 9.000 → tongkang 8.500; **dibayar 8.500**).

## 5. Kebutuhan Fungsional (FR)

Dikelompokkan per modul (lihat arsitektur Bagian 10).

**Modul A — Mine Planning**
- FR-A1 Kelola rencana kerja: lokasi/blok, periode, **target produksi** & **target penjualan**.
- FR-A2 Simpan parameter plan: faktor cuaca, faktor breakdown, COG berlaku — sebagai baseline pembanding.

**Modul B — Production & Tonnage**
- FR-B1 Input produksi per pemuatan; hitung **tonase = volume bucket × density** otomatis per tipe unit.
- FR-B2 Catat kadar material; tandai status terhadap COG (jual/waste).
- FR-B3 Validasi range tonase per tipe unit (cegah salah input).

**Modul C — Hauling & Ritase** (jantung pembayaran)
- FR-C1 Input ritase (trip) per unit/driver/lokasi/waktu.
- FR-C2 **Alur validasi berlapis** driver → pengawas → checker dengan status & **audit trail**.
- FR-C3 Rekap ritase per unit/driver/periode → **× harga kontrak** = nilai & profit.
- FR-C4 Trigger efek berantai saat ritase disetujui (stok+, AP+, capaian+).

**Modul D — Inventory Stockpile**
- FR-D1 Kelola stockpile (ETO/EBO) sebagai gudang multi-tumpukan; tiap tumpukan punya kadar & status COG.
- FR-D2 Catat pergerakan stok (masuk dari hauling, keluar saat barging); rekam blending QA/QC.

**Modul E — Barging & Shipment**
- FR-E1 Catat pemuatan stockpile → tongkang (kapasitas bervariasi).
- FR-E2 Rekam **3 titik ukur** (estimasi, survei stockpile, independent/draft survey) → **lacak deviasi**.
- FR-E3 Tonase final = dasar pembayaran & penjualan.

**Modul F — Sales & Revenue**
- FR-F1 Catat penjualan berbasis tonase final & harga; akui pendapatan; tutup siklus.

**Lintas-modul / pendukung**
- FR-G1 Master data: unit (PC200/PC300/DT), driver, vendor + harga/ritase, material + density, stockpile, COG, akun GL.
- FR-G2 **Dashboard & analitik (MCC):** produktivitas per unit & operator (produktif/merugikan/andal), **plan vs actual**, untung-rugi per unit & periode.
- FR-G3 Klasifikasi penyebab tak tercapainya target: **manusia / mesin-elektrik / lingkungan**.
- FR-G4 **Akses subkontraktor** (input data sendiri; data dipegang & divalidasi VIP).
- FR-G5 Rekap & posting finansial otomatis (AP vendor, biaya, GL).

## 6. Kebutuhan Non-Fungsional (NFR)

| Kode | Kebutuhan | Alasan |
|---|---|---|
| NFR-1 | Akurasi data (validasi range, dropdown, konfirmasi) | Data = dasar pembayaran |
| NFR-2 | Mudah untuk SDM awam (UI sederhana, tombol besar, alur minim, mobile) | Manpower awam IT |
| NFR-3 | **Offline-first** + sinkronisasi otomatis & resolusi konflik | Konektivitas tambang tak stabil |
| NFR-4 | RBAC berbasis peran (staf VIP, pengawas, checker, subkontraktor) | Wewenang berbeda; data multi-pihak |
| NFR-5 | Audit trail & ketertelusuran | Validasi berlapis & sengketa pembayaran |
| NFR-6 | Konektivitas site (mis. Starlink) | Lokasi terpencil (rujuk Laporan Arsitektur) |
| NFR-7 | Keamanan & konsistensi transaksi (ACID) | Data finansial sensitif |
| NFR-8 | Bahasa Indonesia | Pengguna lapangan |

## 7. Aturan Bisnis (BR)

- BR-1 Pembayaran vendor/driver = jumlah ritase × harga kontrak per ritase (rekap bulanan).
- BR-2 Tonase = Volume bucket × Density; density ditetapkan owner per material/site.
- BR-3 Material kadar < COG tidak ditambang/di-hauling/dijual (= waste).
- BR-4 Nilai pembayaran tonase = **tonase aktual** hasil independent/draft survey tongkang.
- BR-5 Ritase wajib **tervalidasi berlapis** (driver→pengawas→checker) sebelum diakui untuk pembayaran.
- BR-6 Biaya operasional relatif tetap; capaian di bawah target produksi dianggap rugi.
- BR-7 Target plan sudah dikurangi estimasi breakdown & pengaruh cuaca.
- BR-8 Batas muat mengikuti asesmen HSE & kondisi jalan (mayoritas ~22 ton; satu vendor ~19 ton).

## 8. Prioritas Kebutuhan (MoSCoW)

| Prioritas | Cakupan |
|---|---|
| **Must** | FR-C1..C4 (ritase + validasi), FR-B1..B3 (tonase), FR-G1 (master data), FR-G2 (dashboard produktivitas & plan-vs-actual) |
| **Should** | FR-D1..D2 (stockpile), FR-E1..E3 (barging & deviasi), FR-G3 (klasifikasi penyebab), FR-G5 (posting finansial), NFR-2/3 (mobile & offline) |
| **Could** | FR-G4 (akses subkontraktor penuh), MCC realtime + integrasi IoT/GPS/weighbridge |
| **Won't (sekarang)** | Penetapan kadar & blending (domain QA/QC owner), akuntansi keuangan penuh, proses di luar kontrak VIP (sampai pabrik) |

## 9. Glosarium

| Istilah | Definisi |
|---|---|
| Mining / Hauling / Barging | Penggalian / pengangkutan pit→stockpile / pemuatan stockpile→tongkang |
| Ritase (Trip) | Satu kali muat-angkut A→B; dasar pembayaran subkontraktor |
| Tonase | Volume bucket × Density |
| Density | Massa jenis material; ditetapkan owner, beda per site (1,4 / 1,5 / 1,55) |
| Bucket | Kapasitas keruk excavator (≈1,3–1,5 ton; PC200 ~20–22 kali) |
| Kadar | Kandungan nikel pada material |
| COG (Cut-Off Grade) | Batas minimum kadar yang menguntungkan (mis. 1,3); di bawahnya = waste |
| Stockpile (ETO/EBO) | Penyimpanan sementara material |
| Blending | Pencampuran material per kadar (oleh QA/QC owner) |
| By trip / by survey | Hitung produksi via jumlah trip vs ukur volume (RTK/Total Station) |
| Independent / Draft survey | Survey tongkang → tonase aktual untuk pembayaran |
| Deviasi | Selisih tonase antar tahap (estimasi → stockpile → tongkang) |
| Target produksi / penjualan | Dari survei stockpile / dari draft tongkang |
| Unit | Alat mekanis produksi (excavator, dump truck) |
| MCC | Monitoring Control Center — pusat pemantauan operasi |
| MRR | Subkontraktor perawatan jalan tambang |

---

# Bagian II — Perancangan Sistem (HOW)

## 10. Arsitektur Modul

Modul dibagi **inti operasi tambang** (menjawab pain point) dan **pendukung** (standar ERP). Aliran utama mengikuti rantai fisik: rencana → produksi → hauling → stockpile → barging → penjualan, dengan **Keuangan sebagai muara** semua dampak finansial.

### 10.1 Modul Inti Operasi

| Modul | Fungsi | Peran dalam integrasi |
|---|---|---|
| **A. Mine Planning** | Rencana kerja: lokasi, target produksi & penjualan (adj cuaca & breakdown), COG | Menyediakan baseline pembanding "tercapai/rugi" |
| **B. Production & Tonnage** | Catat penggalian; tonase = volume × density; tandai kadar | Sumber capaian aktual vs target; feed kadar ke stockpile |
| **C. Hauling & Ritase** | Catat tiap trip; validasi driver→pengawas→checker | Ritase tervalidasi memicu stok+, AP+, capaian+ |
| **D. Inventory Stockpile** | Stockpile multi-tumpukan (ETO/EBO) per kadar; pergerakan stok | Jembatan hauling↔barging; status COG = kelayakan jual |
| **E. Barging & Shipment** | Pemuatan ke tongkang; ukur 3 titik + independent survey | Hasilkan tonase final (dasar bayar & jual); lacak deviasi |
| **F. Sales & Revenue** | Penjualan berbasis tonase final & harga; akui pendapatan | Memasok pendapatan ke Keuangan; tutup siklus |

### 10.2 Modul Pendukung

| Modul | Fungsi Utama | Kontribusi |
|---|---|---|
| Keuangan & Akuntansi | GL, AP, AR, costing | Muara dampak finansial; untung-rugi per unit & periode |
| Procurement | Pembelian BBM, suku cadang, jasa | Biaya pembelian → costing |
| Aset & Maintenance | Data alat, jadwal/riwayat servis, downtime | Biaya perawatan + data breakdown untuk analisis unit |
| HR & Payroll | Karyawan, kehadiran, gaji | Biaya tenaga kerja; identitas operator untuk evaluasi |
| Vendor & Kontrak | Data 5 subkontraktor, harga/ritase | Dasar perhitungan & koneksi data subkontraktor |
| HSE & Compliance | Asesmen keselamatan jalan, kepatuhan | Kelayakan muat unit (19–22 ton) |
| BI & Dashboard (MCC) | Visualisasi, analitik | Wujudkan dashboard otomatis yang diminta |

## 11. Arsitektur Teknis

### 11.1 Gaya Arsitektur
Mulai dengan **modular monolith** — satu backend, modul terpisah jelas secara kode, berbagi satu basis data. Lebih sederhana di-deploy daripada microservices, tetap rapi karena batas antar-modul dijaga. Saat matang, modul khusus (integrasi IoT lapangan, analitik berat) dapat dipisah jadi service. Prinsip: **jangan memulai dengan kompleksitas yang belum dibutuhkan**.

### 11.2 Lapisan Sistem

| Lapisan | Tanggung Jawab | Teknologi |
|---|---|---|
| Presentasi | UI web & mobile | React / Next.js (web), React Native / Flutter (mobile) |
| API / Gateway | Pintu masuk, autentikasi, routing | REST / GraphQL |
| Logika Bisnis | Aturan, workflow, validasi per modul | Node.js (NestJS) / Java (Spring Boot) / Python |
| Akses Data | Baca/tulis basis data | ORM (Prisma, dll) |
| Basis Data | Data transaksional & master | PostgreSQL (utama), Redis (cache) |
| Integrasi | Perangkat lapangan & sistem luar | MQTT/REST, message queue |

### 11.3 Pertimbangan Khusus Tambang
- **Offline-first:** input ritase disimpan di perangkat, sinkron otomatis saat sinyal ada — driver/checker tak menunggu jaringan.
- **UI awam:** tombol besar, alur minim, pilihan > ketik bebas, validasi langsung di layar.
- **Sinkronisasi & resolusi konflik:** data dari banyak perangkat/subkontraktor (timestamp, antrian server).
- **Integrasi perangkat (MCC):** jalur untuk timbangan, GPS unit, alat survei via protokol ringan (MQTT).

> Prinsip utama: **"data lapangan masuk semudah & seandal mungkin"**. Banyak proyek ERP tambang gagal bukan karena logika keuangan salah, tapi karena input lapangan terlalu sulit sehingga pengguna kembali ke kertas.

### 11.4 Keputusan Teknis Final (diputuskan 2 Juli 2026)
Dua pandangan di dokumen sumber — (a) custom modular monolith, (b) Odoo + frontend custom — telah direkonsiliasi dan **diputuskan**:

1. **Modul inti tambang (A–F) dibangun custom.** Kebutuhan inti (ritase, tonase via density, COG, deviasi 3-titik, MCC) tidak tersedia di ERP generik.
2. **Arsitektur pilot: Next.js fullstack** — API routes + **Prisma ORM** di dalam satu proyek Next.js (bukan service NestJS terpisah dulu). Satu codebase, satu deploy (Vercel); batas antar-modul dijaga rapi di dalam kode. **Status: sudah terbangun** — skema database `prisma/schema.prisma` (11 model) + 11 endpoint API (`app/api/*`) dengan aturan bisnis dihitung di server (BR-1..BR-5, transaksi atomik).
3. **Database: PostgreSQL** — pilot memakai **Supabase** (managed PostgreSQL, region Singapore; akun perusahaan sudah tersedia). Skema identik dengan PostgreSQL self-hosted, sehingga migrasi ke hosting Indonesia = pindah data (`pg_dump` → restore), bukan bangun ulang. Lihat **gerbang kedaulatan data** di 11.5.
4. **Evolusi ke service terpisah (NestJS)** dilakukan **saat dibutuhkan** — yakni Fase 5 (mobile offline-first, portal vendor, MQTT/IoT MCC, background job berat) — konsisten dengan prinsip "modular monolith menuju service" (11.1). Skema DB & logika bisnis tinggal diangkat, tidak dibuang.
5. **Open-source (Odoo/ERPNext)** tetap opsi untuk **modul pendukung** keuangan/HR/procurement pada Fase 3–4; diputuskan per modul lewat analisis build-vs-buy (Bagian 15).

### 11.5 Cetak Biru Infrastruktur & Jalur Hosting
Rujukan resmi infrastruktur: **`docs/Laporan-Arsitektur-Infrastruktur-ERP_2.docx`** (13 bab: compute, DB HA, Redis, IoT/TimescaleDB+MQTT, storage/backup, konektivitas Starlink/SD-WAN, kedaulatan data, keamanan, DR, monitoring). Berlaku dengan dua penyesuaian: lapisan aplikasi = **Node.js/Next.js** (bukan Python), message queue = **BullMQ/RabbitMQ** (bukan Celery).

Agar tidak rancu dengan fase fungsional (Fase 0–5), tahapan infrastruktur diberi kode **Infra-0..3**:

| Tahap | Infrastruktur | Kapan berlaku |
|---|---|---|
| **Infra-0 — Pilot (sekarang)** | Vercel (aplikasi) + Supabase PostgreSQL (Singapore); tanpa server sendiri | Selama data masih ilustratif / pilot terbatas |
| **Infra-1 — Go-live (±20 user)** | Docker Compose di **hosting region Indonesia**: app + PostgreSQL + PgBouncer + Redis + Nginx; backup harian + PITR; Starlink + 1 link failover; monitoring dasar | Saat data pembayaran/karyawan nyata masuk |
| **Infra-2 — Pertumbuhan (±50 user)** | Read replica, Redis Sentinel, pemisahan worker, WAF, segmentasi jaringan, TimescaleDB telemetri, warm standby DR | Saat beban & jumlah user naik |
| **Infra-3 — Skala penuh (100+/multi-site)** | Kubernetes + CloudNativePG, HAProxy multi-node, queue terdedikasi, hot standby multi-site, private LTE/5G di pit, zero-trust penuh | Multi-site / skala penuh |

> **Gerbang kedaulatan data (WAJIB):** Supabase berada di Singapore (tidak ada region Indonesia). Sesuai cetak biru (UU PDP, aturan sektoral), **sebelum data nyata karyawan/keuangan/pembayaran dimuat**, database wajib dimigrasikan ke hosting region Indonesia (Infra-1).

## 12. Model Data

> **Status implementasi (Juli 2026):** model di bawah telah diwujudkan sebagai skema database PostgreSQL di `prisma/schema.prisma` — 11 model termasuk `AuditLog` (FR-6) — lengkap dengan seed data awal (`prisma/seed.mjs`) dan lapisan API (`app/api/*`). Angka seed masih ilustratif; lihat `docs/verifikasi-parameter.md`.

### 12.1 Entitas Master

| Entitas | Atribut Inti | Dirujuk Oleh |
|---|---|---|
| Unit / Alat | id_unit, tipe (PC200/PC300/DT), kapasitas, mampu_muat, id_vendor | Ritase, Produksi, Maintenance |
| Operator / Driver | id_operator, nama, id_unit, id_vendor | Ritase, Payroll, evaluasi |
| Vendor / Subkontraktor | id_vendor, nama, jenis_kontrak, harga_per_ritase | Ritase, AP, Kontrak |
| Material | id_material, jenis, density, kadar_default | Produksi, Tonase |
| Stockpile / Tumpukan | id_tumpukan, lokasi (ETO/EBO), kadar, status_COG | Inventory, Barging |
| Karyawan | id_karyawan, nama, jabatan, departemen | Payroll, approval workflow |
| Akun GL (CoA) | kode_akun, nama, tipe | Semua transaksi finansial |

### 12.2 Entitas Transaksi

| Entitas | Atribut Inti | Keterangan |
|---|---|---|
| Rencana Produksi | id_rencana, periode, id_blok, target_produksi, target_jual | Baseline engineering |
| Ritase (Trip) | id_ritase, id_unit, id_operator, asal, tujuan, waktu, status_validasi | Dasar bayar vendor |
| Catatan Tonase | id_tonase, id_unit, volume_bucket, density, tonase, kadar, waktu | Hasil produksi per pemuatan |
| Pergerakan Stok | id_gerak, id_tumpukan, jenis (masuk/keluar), tonase, waktu | Masuk hauling, keluar barging |
| Pemuatan Tongkang | id_muat, id_tongkang, tonase_estimasi, tonase_survei, tonase_final | 3 titik ukur (lacak deviasi) |
| Penjualan | id_jual, id_muat, tonase_terjual, harga, pendapatan, periode | Realisasi pendapatan |
| Jurnal GL | id_jurnal, tanggal, debit, kredit, kode_akun, referensi | Pencatatan akuntansi otomatis |

### 12.3 Relasi Inti & ERD (tekstual)
Notasi: `1—N` = satu-ke-banyak; `FK` = foreign key.
```
Vendor (1) ────< (N) Unit            [Unit.id_vendor FK -> Vendor]
Vendor (1) ────< (N) Operator        [Operator.id_vendor FK -> Vendor]
Unit (1) ──────< (N) Ritase          [Ritase.id_unit FK -> Unit]
Operator (1) ──< (N) Ritase          [Ritase.id_operator FK -> Operator]
Unit (1) ──────< (N) CatatanTonase   [CatatanTonase.id_unit FK -> Unit]
Material (1) ──< (N) CatatanTonase   [CatatanTonase.density <- Material]
Ritase (N) ────> (1) Tumpukan        [via PergerakanStok.id_tumpukan]
Tumpukan (1) ──< (N) PergerakanStok  [PergerakanStok.id_tumpukan FK]
Tumpukan (1) ──< (N) PemuatanTongkang
PemuatanTongkang (1) — (1) Penjualan [Penjualan.id_muat FK -> PemuatanTongkang]
RencanaProduksi (1) < (N) CatatanTonase  [pembanding plan vs actual per periode/blok]
SemuaTransaksiFinansial (N) > (1) AkunGL [JurnalGL.kode_akun FK -> AkunGL]
```
> Langkah lanjut: buat **ERD visual** dari model di atas untuk memperjelas kardinalitas & FK bagi tim basis data.

### 12.4 Contoh Atomic — Satu Ritase, Banyak Dampak
Saat satu ritase divalidasi & diterima, dalam **satu transaksi basis data (atomic)** terjadi:
1. Baris **Ritase** ditulis dengan `status_validasi = disetujui`.
2. Baris **Pergerakan Stok (masuk)** menambah tonase di tumpukan tujuan.
3. **Akumulator capaian produksi** periode berjalan diperbarui (untuk plan vs actual).
4. **Utang vendor (AP)** bertambah: jumlah ritase × harga kontrak.
5. **Jurnal GL** otomatis (debit biaya hauling, kredit utang vendor).

Semua berhasil, atau semua dibatalkan bila ada kesalahan — inilah jaminan konsistensi yang mustahil dijaga jika tiap fungsi memakai file terpisah.

## 13. Keterhubungan Antar-Modul

### 13.1 Mekanisme
- **Master data bersama** — modul merujuk (bukan menyalin) data acuan; mis. Ritase membaca `harga_per_ritase` dari Vendor.
- **Event / kejadian** — saat ritase disetujui, modul penerbit memancarkan event; Inventory & Keuangan bereaksi (loosely coupled).
- **Posting ke GL** — semua dampak finansial bermuara ke Keuangan lewat jurnal GL otomatis.

### 13.2 Alur Transaksi End-to-End

| Langkah | Modul Aktif | Yang Terjadi |
|---|---|---|
| 1. Perencanaan | Mine Planning | Target produksi & jual ditetapkan sebagai baseline |
| 2. Penggalian | Production & Tonnage | Tonase = volume × density; kadar dicatat; capaian terisi vs target |
| 3. Pengangkutan | Hauling & Ritase | Tiap trip divalidasi; memicu stok+, AP+, capaian+ |
| 4. Penyimpanan | Inventory Stockpile | Material masuk tumpukan per kadar; status COG ditetapkan |
| 5. Pemuatan | Barging & Shipment | Material layak jual dimuat; tonase 3 titik; deviasi terekam |
| 6. Penjualan | Sales & Revenue | Tonase final (independent survey) → pendapatan diakui |
| 7. Penutupan | Keuangan | Semua biaya vs pendapatan → untung-rugi per unit & periode |

### 13.3 Wawasan yang Hanya Mungkin dari Integrasi
- **"Unit mana merugikan?"** = capaian (Produksi) + biaya BBM (Procurement) + downtime (Aset) + target (Planning).
- **"Berapa untung bulan ini?"** = pendapatan (Sales) − [vendor (Ritase) + gaji (Payroll) + pembelian (Procurement) + perawatan (Aset)].
- **"Di mana tonase bocor?"** = bandingkan estimasi → survei stockpile → independent survey (Barging) per area/material.
- **"Penyebabnya manusia, mesin, atau cuaca?"** = kinerja operator (Ritase+HR) + status alat (Aset) + cuaca (Planning) — evaluasi tiga-akar yang diminta narasumber.

### 13.4 Integrasi Subkontraktor
Kelima subkontraktor harus terkoneksi karena VIP memegang tanggung jawab datanya. Opsi yang bisa dikombinasikan:
- **Portal/aplikasi vendor** — subkontraktor input ritase via aplikasi sama, hak akses terbatas datanya sendiri.
- **API integrasi** — bila vendor punya sistem sendiri, tukar data via API (hindari input ganda).
- **RBAC berjenjang** — vendor hanya lihat/isi data miliknya; validasi akhir di tangan VIP.

> Bagian paling menantang sekaligus paling bernilai. Tantangannya teknis **dan** organisasi (kontrak, kepatuhan vendor). Sebaiknya bertahap setelah inti internal stabil.

---

# Bagian III — Eksekusi

## 14. Roadmap Implementasi & Status Terkini

### 14.1 Ringkasan Fase Fungsional & Status (per 2 Juli 2026)

| Fase | Cakupan | Status |
|---|---|---|
| **0 — Persiapan** | Wawancara, analisis kebutuhan, dokumen master, prototipe dasar 6 modul, repo GitHub + deploy Vercel, keputusan arsitektur (11.4) | ✅ Selesai |
| **1 — Inti Operasi** | Ritase + validasi berlapis + tonase + stockpile + master data + dashboard produktivitas | 🔄 UI selesai (store lokal); fondasi backend (skema+API) selesai; **penyambungan DB belum** |
| **2 — Produksi & Barging** | Barging tongkang, survei 3 titik, deviasi, penjualan, rantai fisik | 🔄 UI selesai; endpoint API selesai; **penyambungan DB belum** |
| **3 — Keuangan** | GL/CoA, AP otomatis dari ritase, AR, costing, untung-rugi per unit | ⬜ Belum |
| **4 — Pendukung** | Procurement, Aset/Maintenance, HR/Payroll, Vendor & Kontrak, HSE | ⬜ Belum |
| **5 — Integrasi Lanjut** | Mobile offline-first, portal subkontraktor, MCC/IoT (MQTT), BI lanjut; evaluasi pisah service NestJS | ⬜ Belum |

Pendekatan tetap: **iteratif & inkremental**, **pilot terbatas** (satu area/vendor dulu), **pelatihan menyatu** tiap fase (SDM awam). Tahapan **infrastruktur** berjalan paralel dengan kode **Infra-0..3** (lihat 11.5).

### 14.2 Yang Sudah Terbangun di Prototipe

| Layar/fitur | Modul | Status |
|---|---|---|
| Ritase Entry + hitung nilai otomatis (trip × harga kontrak) | C | ✅ UI |
| Validasi berlapis driver→pengawas→checker + jejak audit | C | ✅ UI |
| Tonase Entry (volume×density + cek COG + validasi range) | B | ✅ UI |
| Inventory Stockpile (saldo per tumpukan + pergerakan masuk/keluar) | D | ✅ UI |
| Master Data (unit/driver/vendor bisa tambah; material/stockpile read-only) | G1 | ✅ UI |
| Dashboard Produktivitas unit & operator (plan vs actual, klasifikasi) | BI/MCC | ✅ UI |
| Barging & Shipment (3 titik ukur, deviasi, catat penjualan) | E, F | ✅ UI |
| Rantai Fisik (pipeline, dua target, deviasi per pengapalan) | BI | ✅ UI |
| **Backend**: skema DB 11 model + 11 endpoint API + seed + panduan setup | — | ✅ (belum tersambung ke UI) |
| Dashboard 6 modul, Mining Flow, Daily Production (peninggalan Fase 0) | — | ✅ UI (dummy) |

Catatan penting: seluruh UI di atas masih membaca **store lokal (localStorage)** — data belum multi-user. Backend sudah siap dan menunggu database aktif (langkah 2 di 14.3).

### 14.3 Urutan Pengerjaan Terperinci (langkah berikutnya, berurutan)

1. **Verifikasi parameter** — isi `docs/verifikasi-parameter.md` (tersedia juga versi Word) bersama narasumber: density per material, **harga per ritase per vendor**, COG, kapasitas bucket, batas muat HSE, target produksi/penjualan, ambang klasifikasi unit, + contoh raw data & laporan Excel. *Prasyarat mutlak sebelum angka dipakai untuk pembayaran (gerbang G2).*
2. **Aktivasi database (Infra-0)** — buat project Supabase (panduan `docs/panduan-pengembangan.md` §1), isi `.env` (`DATABASE_URL` pooled + `DIRECT_URL`), jalankan `npx prisma migrate deploy` lalu `npm run db:seed`, uji `/api/health`; tambahkan kedua variabel di Vercel agar deploy ikut tersambung.
3. **Sambungkan UI → API** (menggantikan localStorage), berurutan per layar: master data → ritase → validasi → tonase → stockpile → barging/rantai → produktivitas. Termasuk: loading/error state, input tanggal ISO (`type=date`), verifikasi end-to-end dari 2 perangkat (bukti multi-user).
4. **Autentikasi & RBAC** — login; 4 grup akses (Super Admin/Manager/Executive/Normal Staff) + peran lapangan (driver/pengawas/checker); kolom `oleh` pada audit log diisi user login; aksi validasi dibatasi sesuai peran (menegakkan BR-5 secara sistem).
5. **Muat data master nyata** hasil langkah 1 (mengganti seed ilustratif); latih 2–3 pengguna kunci (checker & pengawas).
6. **Pilot terbatas** — 1 area / 1 vendor selama 2–4 minggu; ukuran keberhasilan: kesalahan input turun, waktu rekap pembayaran turun; perbaiki dari umpan balik lapangan.
7. **Gerbang kedaulatan data → Infra-1** — migrasi database ke hosting region Indonesia **sebelum** go-live dengan data nyata penuh (lihat 11.5); `pg_dump` → restore.
8. **Fase 3 — Keuangan**: Chart of Accounts; **posting GL otomatis** dari ritase DISETUJUI (debit biaya hauling, kredit utang vendor — pola 12.4); rekap & pembayaran AP per vendor; untung-rugi per unit & periode; keputusan build-vs-buy akuntansi (Odoo/ERPNext vs custom ringan) — gerbang G1.
9. **Fase 4 — Pendukung**: procurement BBM/sparepart; aset & maintenance (downtime → analisis produktivitas unit); HR/payroll (rekap ritase → gaji, jika dikonfirmasi E9); kontrak vendor; HSE.
10. **Fase 5 — Integrasi lanjut**: aplikasi mobile lapangan **offline-first**; portal input subkontraktor (RBAC per vendor); MQTT/IoT untuk MCC (timbangan, GPS unit, alat survei); BI lanjut & evaluasi tiga-akar (manusia/mesin/lingkungan); evaluasi pemisahan service (NestJS) + naik ke Infra-2/3 sesuai beban.

### 14.4 Gerbang Keputusan (Gates)

| Gerbang | Isi | Posisi di urutan |
|---|---|---|
| **G1 — Build-vs-buy modul pendukung** | Diputuskan per modul di awal Fase 3–4 setelah pemetaan proses keuangan | Sebelum langkah 8 |
| **G2 — Angka terverifikasi** | Rumus & harga tidak boleh dipakai untuk pembayaran sebelum lembar verifikasi terisi & disetujui | Sebelum langkah 5 |
| **G3 — Master data bersih** | Migrasi data acuan final sebelum go-live tiap modul | Sebelum langkah 6 |
| **G4 — Kedaulatan data** | DB pindah ke hosting Indonesia sebelum data nyata penuh | Langkah 7 |

## 15. Build vs Buy & Manajemen Risiko

### 15.1 Build vs Buy

| Opsi | Kelebihan | Kekurangan |
|---|---|---|
| Bangun sendiri | Pas 100% proses VIP; fleksibel; tanpa lisensi | Paling lama & berisiko; butuh tim kuat; pemeliharaan sendiri |
| Kustomisasi open-source (ERPNext/Odoo) | Lebih cepat; banyak modul siap; lisensi rendah | Perlu kustomisasi berat untuk fitur tambang (kadar, density, deviasi) |
| ERP komersial bermodul tambang | Tercepat; teruji; dukungan vendor | Paling mahal; kurang fleksibel; bisa terlalu kompleks |

**Untuk VIP:** fitur tambang spesifik (tonase via density, kadar/COG, deviasi 3-titik, pembayaran ritase) tak ada di ERP generik → **custom untuk modul inti**, **open-source untuk pendukung** (lihat 11.4). Putuskan final setelah Fase 0.

### 15.2 Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| Pengguna awam kembali ke kertas | UI sangat sederhana, pelatihan intens, libatkan pengguna sejak desain, kemenangan kecil dulu |
| Data lapangan hilang karena sinyal | Arsitektur offline-first + sinkronisasi otomatis |
| Subkontraktor tak patuh standar data | Sepakati di kontrak; portal mudah; integrasi bertahap |
| Scope creep | Roadmap bertahap dengan batas cakupan tiap fase |
| Master data kotor | Investasi serius di Fase 0 untuk bersihkan & validasi |
| Angka wawancara keliru | Verifikasi semua parameter (density, COG, target, harga) sebelum dikodekan |

## 16. Pertanyaan Terbuka & Langkah Berikutnya

**Perlu diverifikasi ke narasumber** (sebagian sudah dijanjikan untuk dibagikan):
1. Contoh raw data & format laporan Excel saat ini.
2. Detail perangkat MCC & cara koneksi ke alat tim IT (timbangan/GPS/alat survei).
3. Mekanisme teknis & kesepakatan kontrak koneksi data 5 subkontraktor.
4. Daftar lengkap tipe unit, kapasitas, mampu-muat resmi per vendor.
5. Sumber & tata cara penetapan target produksi & penjualan dari engineering.
6. Verifikasi parameter: density per material/site, COG, harga kontrak per ritase.
7. Kebutuhan offline (seberapa sering site putus sinyal; titik input wajib offline).
8. Integrasi payroll (apakah rekap ritase terhubung ke penggajian resmi).

**Langkah berikutnya:** ikuti **urutan terperinci Bagian 14.3** (verifikasi parameter → aktivasi database → sambungkan UI ke API → RBAC → data nyata → pilot → migrasi hosting Indonesia → Fase 3–5). Alat bantu yang sudah tersedia: lembar verifikasi `docs/verifikasi-parameter.md` dan panduan database `docs/panduan-pengembangan.md`. Tugas manajemen yang tersisa: tetapkan PIC pengisian lembar verifikasi, tim, anggaran, dan jadwal per fase.

---

## Lampiran A — Dasar ERP (Ringkas)

- **Apa itu ERP:** sistem terpadu yang mengintegrasikan proses bisnis inti (keuangan, persediaan, produksi, pembelian, HR) dalam **satu basis data tunggal**.
- **Single source of truth:** tanpa ERP, tiap departemen punya file sendiri → salin manual → duplikasi & salah. ERP: sekali input, semua modul terkait otomatis ter-update.
- **Analogi sistem saraf:** satu rangsangan (ritase divalidasi) langsung mengalir ke seluruh tubuh (stok naik, utang vendor tercatat, capaian ter-update, dashboard berubah).
- **Mengapa bukan sekadar "aplikasi pencatatan ritase":** untuk tahu untung-rugi, data ritase harus bertemu harga kontrak, BBM, gaji, biaya perawatan, harga jual — itulah integrasi antar-fungsi (definisi ERP).
- **Tiga mekanisme integrasi:** master data bersama; transaksi pemicu efek berantai; posting ke buku besar (GL).

---

*Dokumen master v1.1 (2 Juli 2026) — pemutakhiran: keputusan arsitektur pilot final (Next.js fullstack + Prisma + Supabase PostgreSQL; NestJS ditunda ke Fase 5), fondasi backend terbangun (skema 11 model + 11 endpoint API), status UI Fase 1–2 selesai, adopsi cetak biru infrastruktur (`Laporan-Arsitektur-Infrastruktur-ERP_2`) dengan tahapan Infra-0..3 dan gerbang kedaulatan data. Basis kebutuhan tetap satu wawancara — angka menunggu verifikasi (Bagian 16).*
