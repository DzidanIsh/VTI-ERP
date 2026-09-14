# Project Specs — ERP-VTI

Spesifikasi sistem ERP PT Vendoura Inti Perkasa (VTI), kontraktor penambangan
nikel di Bahodopi, Morowali. Dokumen ini memotret **apa** yang dibangun dan
aturan yang mengikatnya.

Peta dokumen repo: **project-specs.md** (apa sistemnya, potret terkini) ·
`panduan-pengembangan.md` (cara kerja & setup) · `dokumen-master-erp-vti.md`
(desain kanonik: analisis kebutuhan + perancangan, sumber FR/NFR/BR) ·
`verifikasi-parameter.md` (lembar verifikasi angka ilustratif, dibawa ke
pertemuan divisi) · `CLAUDE.md` di akar repo (instruksi sesi Claude Code).
Ekspor `.docx` tidak di-commit — buat dengan `node scripts/md-to-docx.js <md> <docx>`.

Status dokumen: sesuai kode per 2026-08-12 (branch
`VTI-Mining-Operation-Intelligence`, identik dengan `main`).

---

## 1. Tujuan sistem

Satu sistem untuk seluruh pekerjaan antar-divisi VTI (hasil rapat pengenalan
ERP): informasi diperoleh lewat sistem sesuai kewenangan, bukan lewat mencari
personel atau rekap manual. Inti bisnisnya: **catatan ritase yang tervalidasi
berlapis menjadi dasar produksi dan pembayaran** — karena itu kebenaran data
ritase dijaga sampai lapisan database.

## 2. Arsitektur & tech stack

| Lapisan | Teknologi | Catatan |
|---|---|---|
| Web + API | Next.js 14 App Router, TypeScript | Satu proses: halaman & REST API |
| Database | Supabase PostgreSQL (Singapore) | **Satu project untuk semua branch**; akses via Prisma |
| ORM | Prisma 6 | Kueri saja — aturan bisnis di DB (CHECK/trigger/PL/pgSQL) |
| Auth | Supabase Auth | Peran di `user_metadata.role` |
| UI | Tailwind CSS 3, komponen sendiri (`components/ui/*`), Recharts, lucide-react | Tema terang aksen hijau `brand-*`, sidebar putih gaya ERPNext |
| Asisten AI | Ollama (DeepSeek-R1 14B, lokal via Tailscale) / OpenAI / Anthropic | Dipilih env `AI_PROVIDER` |
| Mobile | Flutter — **branch `draga` terpisah** | Skema data kelak mengikuti web |

Koneksi DB: `DATABASE_URL` = pooler 6543 (`?pgbouncer=true`) untuk aplikasi;
`DIRECT_URL` = 5432 untuk migrasi. Jaringan kantor tanpa IPv6 — wajib pooler.

## 3. Peran & hak akses

Enam peran (`lib/supabase/client.ts`): `driver`, `pengawas`, `checker`,
`owner`, `hr`, `lab`. Guard tiga lapis:

1. **Middleware** — `PAGE_ROLES` (dibangun dari `lib/nav.ts`) membatasi halaman;
   berkas ber-ekstensi dikecualikan dari matcher.
2. **API route** — `getSessionUser()`; identitas & peran TIDAK PERNAH dari body.
3. **Database** — fungsi validasi memeriksa peran; trigger menolak mutasi terlarang.

| Peran | Lingkup utama |
|---|---|
| driver | Input ritase miliknya, presensi, surat izin, asisten AI |
| pengawas | Validasi tahap 1, rencana produksi, catat HM/BBM, tandai service, lahan, kejadian |
| checker | Validasi tahap 2 (final), monitoring |
| owner | Semua modul + modul data contoh |
| hr | Dashboard HR, rekap presensi semua pegawai, proses surat izin |
| lab | Pencatatan & hasil sampel lab |

Semua peran: `/home` (launchpad), `/profil` (ganti sandi & foto), `/presensi`,
Asisten AI (keputusan 2026-08-12). Akun uji: `<peran>@vti.id` / `VTI2026!`.

## 4. Modul & status fitur

Modul = lensa navigasi di atas SATU basis data (`lib/nav.ts`), bukan silo.
Modul baru dibuat per tim **setelah** form pengenalan proses kerja tim masuk.

### Produksi (nyata, inti sistem)
| Fitur | Halaman | Status |
|---|---|---|
| Input ritase (driver) | `/mining/ritase` | Nyata |
| Validasi berjenjang | `/mining/validasi` | Nyata — fungsi DB |
| Rekap tonase, stockpile, barging/shipment | `/mining/tonase` dll. | Nyata |
| Rencana produksi harian/bulanan/tahunan | `/mining/rencana` | Nyata |
| Dashboard Master (KPI + banding 2 metrik) | `/mining/dashboard-master` | Nyata + bagian ilustratif berlabel |
| Service Unit (HM + jadwal service + BBM) | `/mining/service` | Nyata — interval 250 jam ILUSTRATIF |
| Status unit & kendala (Form D) | `/mining/status-unit` | Nyata |
| Lahan & reklamasi (survey→…→reklamasi) | `/mining/lahan` | Nyata |
| Laporan siap cetak (Save as PDF) | `/mining/laporan` | Nyata |
| Daily production, produktivitas, rantai, flow | — | Sebagian ilustratif, berlabel |

### HR
| Fitur | Status |
|---|---|
| Presensi masuk/pulang (jam server, koordinat opsional) | Nyata |
| Surat izin/sakit/cuti + lampiran foto → diproses HR | Nyata |
| Dashboard HR (kehadiran hari ini) | Nyata |
| Submodul lain (payroll, penilaian, dll.) | Data contoh, menunggu form HR |

### Laboratorium
Alur sampel DITERIMA → PREPARASI → ANALISIS → SELESAI; hasil SELESAI wajib
berkadar, terkunci, dan **memperbarui kadar stockpile terkait** (menggantikan
kadar default master). Nyata.

### Inventory, Asset, CRM Sales, Accounting, Purchase
Seluruhnya **data contoh** (BannerContoh terpasang), hanya terlihat owner.
Menunggu form tim terkait. Accounting adalah kandidat modul nyata pertama
(TagihanVendor — lihat Roadmap).

## 5. Model data inti (Prisma)

- **Master**: `Vendor`, `Unit` (+ `serviceIntervalJam`, `hmService`), `Driver`,
  `Material` (density, kadarDefault), `Stockpile` (kadar ← lab), `Tongkang`.
- **Transaksi**: `Ritase` (snapshot kapasitas/density/harga; tonase = kapasitas
  × density; `tahapIndex` 0–3; status MENUNGGU/DISETUJUI/DITOLAK),
  `StockMovement` (MASUK otomatis saat ritase final), `Shipment` (3 titik ukur
  tonase; pendapatan), `RencanaHarian`, `RencanaPeriode` (BULANAN/TAHUNAN),
  `KejadianOperasi` (BD/standby/hujan), `CatatanHM`, `CatatanBBM`.
- **Orang**: `Presensi` (1 baris/orang/hari, jam dari DB), `SuratIzin`
  (lampiran bytes, keputusan HR terkunci), `ProfilFoto`.
- **Lab**: `SampelLab`. **Lahan**: `Lahan` + `TahapanLahan` (riwayat tahap).
- **Audit**: `AuditLog` (append-only; `oleh` = user sesi, `sumber` =
  web/asisten/telegram).

## 6. Aturan bisnis

| Kode | Aturan | Ditegakkan di |
|---|---|---|
| BRULE-002 | Tonase = kapasitas vessel × density, dihitung server | Server + CHECK `ritase_tonase_konsisten` |
| BRULE-003 | Kadar < COG = waste, tidak layak jual | Server (COG masih konstanta ilustratif) |
| BRULE-005 | Hanya ritase DISETUJUI sah untuk produksi/pembayaran | Fungsi DB + laporan |
| BRULE-006 | Validasi hanya oleh peran sesuai tahap | Fungsi `setujui_ritase`/`tolak_ritase` (42501) |
| — | 1 ritase = 1 bolak-balik; tahap driver selesai saat input (`tahapIndex: 1`) | Desain + server |
| — | Ritase final, sampel SELESAI, izin diproses, presensi tertutup = terkunci | Trigger DB (23000) |
| — | AuditLog append-only; ritase DISETUJUI tak bisa dihapus | Trigger DB |
| — | HM tidak boleh turun antar tanggal | Trigger `cek_hm_monoton` |
| — | Format periode rencana ("2026-08" / "2026") | CHECK regex |
| — | Satu presensi/orang/hari; jam pulang ≥ jam masuk; jam dari server | UNIQUE + CHECK + desain |
| — | Lampiran/foto: mime allowlist + magic bytes + batas ukuran | Server + CHECK |

Pemetaan galat DB → HTTP: `dbError()` (`P0002`→404, `42501`→403, `23000`→409,
`23505`→409, `23514`/`23503`/`23502`→400) dengan pesan Bahasa Indonesia.

## 7. Alur kerja utama

1. **Ritase**: driver input (tonase otomatis, audit "buat") → antrian pengawas
   → antrian checker → DISETUJUI → StockMovement MASUK ke stockpile. Tolak di
   tahap mana pun wajib beralasan. Seluruh transisi = fungsi PL/pgSQL.
2. **Presensi**: absen masuk/pulang (jam `now()` DB, koordinat opsional, absen
   ganda = bukan galat); rekap semua pegawai hanya hr/owner (disaring di kueri).
3. **Surat izin**: diajukan dari halaman Presensi (+ foto surat) → menu HR
   "Permohonan Cuti" → setuju/tolak + catatan → terkunci.
4. **Lab**: sampel dicatat → status maju satu tahap → SELESAI (wajib kadar)
   → kadar stockpile diperbarui atomik.
5. **Service unit**: pengawas catat HM (& BBM) harian → papan menghitung sisa
   jam ke service (LEWAT/MENDEKATI di atas) → "Sudah Service" me-reset acuan.
6. **Lahan**: didaftarkan saat survey → pemetaan drone → ditambang → reklamasi
   → selesai; tiap tahap berjejak (siapa, kapan, catatan, tautan dokumen).
7. **Dashboard Master**: KPI tervalidasi + pembanding bebas 2 metrik
   (tonase/ritase/target/BBM/downtime/kehadiran) — semua seri dihitung SQL.

## 8. Permukaan API (ringkas)

Semua butuh sesi login; mutasi dicek peran per route. Keluarga endpoint:
`/api/ritase` (+`/[id]` PATCH setuju/tolak), `/api/rencana` (+`/periode`),
`/api/kejadian`, `/api/hm`, `/api/bbm`, `/api/service`, `/api/lahan` (+`/[id]`),
`/api/lab` (+`/[id]`), `/api/presensi` (+`/masuk|/pulang|/hari-ini`),
`/api/izin` (+`/[id]`, `/[id]/lampiran`), `/api/profil/foto`,
`/api/dashboard/serial`, `/api/master`, `/api/shipments`, `/api/movements`,
`/api/chat` (asisten), `/api/health` (tanpa auth, untuk monitoring).

## 9. Asisten AI

- Terbuka untuk semua peran. Alat baca menjawab dari DB; **aksi tulis selalu
  berupa usulan** (`usul_*`) yang menunggu kartu konfirmasi user — eksekusinya
  meneruskan cookie sesi ke route biasa sehingga guard peran & audit berlaku
  atas nama user, bukan AI.
- Penyedia aktif: **Ollama** — DeepSeek-R1-Distill-14B di server `spark-2209`
  (Tailscale `http://100.89.200.100:11434`). Model tidak mendukung tool-calling
  native; adapter `lib/ai/ollama.ts` memaksa keluaran JSON Schema
  (`{tipe: jawab|alat}`) dan mengeksekusi alat di server. ±10 token/detik.
- Alternatif: `AI_PROVIDER=openai|anthropic` (perlu API key).

## 10. Batasan & asumsi yang masih ilustratif

- Interval service 250 jam, COG 1.3, density/kadar master, harga vendor —
  **menunggu verifikasi divisi**; angka tampil dengan penanda.
- Modul data contoh (lihat §4) tidak boleh dipakai mengambil keputusan.
- Notifikasi (service due, izin diproses) belum ada — menumpang kanal Telegram
  di roadmap.
- Verifikasi lapangan: mobile offline (draga) belum konvergen skema dengan web.

## 11. Roadmap (urut prioritas)

1. **TagihanVendor (AP)** — menutup rantai ritase→pembayaran; skema menunggu
   jawaban Finance (dasar bayar, termin, potongan). CRITICAL.
2. Tagihan penjualan di Shipment (AR-lite) + perluasan AuditLog ke uang lain.
3. Tabel Parameter (COG, ambang) menggantikan konstanta.
4. Hasil pertemuan per divisi → modul nyata: Maintenance/Engineering (dari HM),
   Logistik/spare part, HR lanjutan (lembur, lost time, geofence), Lab lanjutan.
5. Kanal Telegram (chatbot + notifikasi) → WhatsApp.
6. Konvergensi skema mobile `draga` ke skema web, lalu pilot lapangan.
