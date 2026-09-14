# ERP-VTI — Vendoura ERP

Sistem ERP **PT Vendoura Inti Perkasa** (kontraktor penambangan nikel, Bahodopi,
Morowali). Next.js 14 menjalankan antarmuka web dan REST API dalam satu proses,
di atas **satu database Supabase PostgreSQL** dengan aturan bisnis yang
ditegakkan database sendiri (CHECK, trigger, fungsi PL/pgSQL).

> **Baru pull repo ini / mau buka branch baru?**
> Baca dulu **[docs/panduan-pengembangan.md](docs/panduan-pengembangan.md)** —
> database yang dipakai, template UI, pola API, aturan migrasi, dan checklist
> sebelum push. Tujuannya: branch boleh bertambah, database tetap satu dan
> tampilan tetap seragam.

## Menjalankan

```bash
npm install
# salin .env.example -> .env, isi kredensial Supabase (lihat panduan §1)
npx prisma generate
npx prisma migrate deploy
npm run dev          # http://localhost:3000
```

## Tech stack

- **Next.js 14** (App Router) + **TypeScript** — halaman & API satu proses
- **Supabase** — PostgreSQL (satu database untuk semua branch) + Auth (6 peran)
- **Prisma** — kueri; aturan bisnis tetap di database
- **Tailwind CSS 3** — tema terang aksen hijau brand, sidebar gaya ERPNext
- **Recharts** · **lucide-react**
- **Asisten AI** — `AI_PROVIDER`: ollama (model lokal DeepSeek-R1 via Tailscale) / openai / anthropic

## Peta singkat

| Path | Isi |
|---|---|
| `app/` | Halaman: `home` (launchpad), `mining`, `hr`, `lab`, `presensi`, `profil`, + modul contoh |
| `app/api/` | REST API — ritase (+validasi berjenjang), presensi, izin, hm/bbm/service, lab, lahan, rencana, dashboard, chat |
| `prisma/` | `schema.prisma` + migrasi SQL bernomor (aturan DB hidup di sini) |
| `lib/nav.ts` | Sumber kebenaran modul/menu/peran (sidebar, Home, middleware) |
| `lib/ai/` | Asisten AI: adapter openai/claude/ollama + alat baca/tulis |
| `components/` | `ui/` primitif · `shared/` PageHeader, StatCard, BannerContoh · `shell/` sidebar+topbar · `charts/` |
| `scripts/` | `create-users.mjs` (akun uji per peran) |
| `docs/` | **panduan-pengembangan.md** (cara kerja), **project-specs.md** (apa sistemnya), dokumen master (desain kanonik), lembar verifikasi parameter |

## Status

Modul berjalan dengan data sungguhan: **Produksi** (ritase 3 tahap validasi,
tonase, stockpile, barging, rencana, service unit + HM/BBM, lahan, dashboard
master), **HR** (presensi + surat izin), **Laboratorium** (alur sampel → kadar
stockpile), **Asisten AI**. Modul Inventory/Asset/Sales/Accounting/Purchase
masih data contoh (ditandai banner di layar) menunggu form tim terkait.

Branch `draga` = pengembangan aplikasi **mobile** (Flutter). Branch ini = web.
