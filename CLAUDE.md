# CLAUDE.md — ERP-VTI

Sistem ERP PT Vendoura Inti Perkasa (kontraktor tambang nikel, Bahodopi,
Morowali). Next.js 14 App Router = web + REST API satu proses, di atas SATU
database Supabase PostgreSQL. Detail lengkap: `docs/panduan-pengembangan.md`.

## Bahasa & gaya

- **Balas user, teks UI, pesan error, komentar kode, dan commit message dalam
  Bahasa Indonesia.**
- Setelah perubahan besar: commit & push ke branch kerja tanpa bertanya.
- Sertakan perintah konkret yang bisa dijalankan user di setiap penjelasan proses.

## Branch

- Branch kerja web saat ini: `VTI-Mining-Operation-Intelligence`. **Jangan kerja
  langsung di `main`** — rilis = `git merge --ff-only` dari branch kerja.
- Branch `draga` = **khusus aplikasi mobile (Flutter)**. Jangan campur pekerjaan
  web ke sana; skema datanya kelak mengikuti branch web.

## Database (paling penting)

- **Satu Supabase untuk semua branch.** Jangan buat project baru per branch.
- **Aturan bisnis ditegakkan database** (CHECK, trigger, fungsi PL/pgSQL), bukan
  hanya kode TS: validasi ritase (`setujui_ritase`/`tolak_ritase`), immutability
  (ritase final, sampel SELESAI, izin diproses, presensi tertutup, audit
  append-only), HM monoton, format periode rencana. Data yang menyentuh
  uang/audit WAJIB dijaga di lapisan DB.
- SQLSTATE → HTTP lewat `dbError()` di `lib/api.ts`; constraint bernama diberi
  pesan ramah di `PESAN_CONSTRAINT`. Selalu `return dbError(e) ?? serverError(e)`.
- Migrasi: ubah `schema.prisma` + tulis SQL **manual** di
  `prisma/migrations/<timestamp>_<nama>/migration.sql` (header komentar kenapa,
  constraint bernama) → `npx prisma migrate deploy` → `npx prisma generate`.
  **`prisma migrate dev` GAGAL di lingkungan non-interaktif — jangan dipakai.**
  Migrasi lama tidak boleh diubah.
- Uji aturan DB dengan skrip `BEGIN; DO $$ ... $$; ROLLBACK;` via
  `npx prisma db execute --stdin/--file` — tanpa meninggalkan data.
- Data uji yang dibuat saat verifikasi harus dibersihkan sesudahnya.

## Jebakan Windows (sudah berkali-kali makan waktu)

- `prisma generate` gagal `EPERM` bila dev server hidup — matikan preview dulu.
- `npm run build` bentrok dengan `npm run dev` (rebutan `.next`) — jangan bersamaan.
- Supabase "tidak terjangkau"? Cek `curl -m 8 https://<ref>.supabase.co/auth/v1/health`
  dulu: `401` = hidup; `000`/`540` = project paused — bukan bug kode.
- `DATABASE_URL` = pooler port 6543 (`?pgbouncer=true`); `DIRECT_URL` = port 5432
  (untuk migrate). Jaringan user tidak punya IPv6 — wajib lewat pooler.

## Auth & peran

- Supabase Auth; peran di `user_metadata.role`. Enam peran: `driver`, `pengawas`,
  `checker`, `owner`, `hr`, `lab` (union di `lib/supabase/client.ts`).
- Akun uji (password `VTI2026!`): `driver@vti.id`, `pengawas@vti.id`,
  `checker@vti.id`, `owner@vti.id`, `hr@vti.id`, `lab@vti.id` —
  buat via `node scripts/create-users.mjs`.
- Guard tiga lapis: middleware (`PAGE_ROLES` dari `lib/nav.ts`) → API route
  (`getSessionUser()` + cek peran, identitas TIDAK PERNAH dari body) → database.
- Claude tidak bisa login sendiri (dilarang mengetik password) — verifikasi
  browser berhenti di halaman login; minta user login atau uji lewat SQL/route.

## UI

- Pakai ulang komponen yang ada — `components/ui/*` (Card, Button, Badge, Table,
  Field/Input/Select), `shared/*` (PageHeader, StatCard, BannerContoh,
  HalamanContoh), `charts/charts.tsx`. **Jangan bikin gaya/warna/library baru.**
- Pola halaman: `"use client"` → `<div className="p-6">` → `PageHeader` →
  StatCard grid → Card form → Card tabel.
- Tema terang aksen hijau `brand-*`; sidebar putih gaya ERPNext bisa diciutkan;
  logo `public/logo-vti.png`.
- Sukses hijau (`text-brand-700`), galat merah (`text-rose-600`) — jangan tertukar.
- Angka agregat dihitung server, bukan menjumlah baris halaman di klien.
- Data karangan wajib ditandai di layar (`BannerContoh` / badge "Ilustratif").
- `lib/nav.ts` = sumber kebenaran menu/modul/roles; `PAGE_ROLES` di-union bila
  href muncul di 2 modul (jangan diubah jadi timpa). Halaman pribadi
  (`/home`, `/profil`, `/presensi`) bukan milik modul.
- Matcher `middleware.ts` mengecualikan berkas ber-ekstensi (`.*\\..*`) —
  jangan dikembalikan, nanti gambar publik di-redirect ke login.

## Keputusan terkunci (jangan tawarkan ulang / langgar)

- **1 ritase = 1 bolak-balik** (bukan rekap trip); tonase = kapasitas vessel ×
  density, dihitung server; **tonase melekat di ritase**, bukan tabel terpisah.
- **Tahap driver selesai saat input** — ritase baru langsung `tahapIndex: 1`.
- Hanya ritase DISETUJUI yang sah untuk produksi/pembayaran (BRULE-005).
- **AI boleh bertindak TAPI wajib konfirmasi user** (kartu usulan); eksekusi
  meneruskan cookie sesi ke route yang ada; audit atas nama user login.
- **Modul baru per tim, HANYA setelah form pengenalan proses kerja tim itu
  masuk** — jangan buat placeholder modul baru di muka. (Modul contoh yang ada
  sekarang adalah warisan yang diminta user — jangan dihapus.)
- Asisten AI terbuka untuk SEMUA peran termasuk driver (keputusan 2026-08-12).
- Laporan PDF = halaman siap cetak → Save as PDF, bukan generator server.

## Asisten AI

- `AI_PROVIDER`: `ollama` (dipakai sekarang) | `openai` | `anthropic`.
- Ollama = DeepSeek-R1 14B di server `spark-2209`, via Tailscale
  `http://100.89.200.100:11434`. Model **tidak bisa tool-calling native** —
  `lib/ai/ollama.ts` memaksa keluaran JSON Schema (`{tipe: jawab|alat}`) dan
  server yang mengeksekusi alat. Jangan sederhanakan adapter ini tanpa membaca
  komentarnya. ±10 tok/detik — jawaban lambat itu normal.
- Alat asisten di `lib/ai/tools.ts`; aksi tulis = `usul_*` (perlu konfirmasi).

## Checklist sebelum push

`npx tsc --noEmit` bersih · halaman lewat `lib/nav.ts` + komponen baku · API
ikut pola guard · aturan uang/audit di DB · migrasi ter-deploy & teruji
rollback-script · data uji dibersihkan · teks Bahasa Indonesia.
