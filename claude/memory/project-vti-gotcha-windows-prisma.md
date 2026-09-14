---
name: project-vti-gotcha-windows-prisma
description: "Jebakan operasional ERP-VTI di Windows — Prisma migrate, build, dan Supabase yang suka mati"
metadata: 
  node_type: memory
  type: project
  originSessionId: 7256fec3-dc6c-4c0b-89b0-414dbcc1499f
  modified: 2026-08-09T06:22:33.850Z
---

Empat hal yang berulang kali memakan waktu di proyek ini:

1. **`prisma migrate dev` GAGAL** — lingkungannya non-interaktif. Alurnya: `npx prisma migrate diff --from-schema-datasource prisma/schema.prisma --to-schema-datamodel prisma/schema.prisma --script`, simpan hasilnya ke `prisma/migrations/<timestamp>_<nama>/migration.sql`, lalu `npx prisma migrate deploy`.
2. **`prisma generate` gagal `EPERM`** kalau dev server sedang jalan (file `query_engine-windows.dll.node` terkunci). Hentikan preview server dulu.
3. **`npm run build` gagal `PageNotFoundError`** kalau dev server jalan bersamaan (rebutan folder `.next`). Hentikan preview, hapus `.next`, baru build.
4. **Project Supabase sering tidak terjangkau.** Gejala: Prisma bilang "Can't reach database server". Cara diagnosis cepat — bandingkan `curl -s -m 8 -o /dev/null -w "%{http_code}" https://<ref>.supabase.co/auth/v1/health`: `000` atau `540` = project paused/nonaktif dari sisi Supabase (bukan jaringan user), `401` = hidup normal. Pernah juga jaringan user memblokir port DB 6543/5432 sementara HTTPS 443 lolos — solusinya user pindah ke hotspot HP. **Tingkat terparah (terjadi 2026-08-09): domain project NXDOMAIN di resolver lokal DAN 1.1.1.1 (`nslookup <ref>.supabase.co 1.1.1.1`) = project terhapus, bukan paused** — pemulihan butuh project baru: update `.env`, `prisma migrate deploy`, seed, buat ulang 4 akun auth dengan `user_metadata.role`.
5. **Menemukan host pooler project Supabase baru tanpa akses dashboard** (dipakai 2026-08-09): region bisa ditemukan dari `nslookup -type=AAAA db.<ref>.supabase.co 1.1.1.1` lalu cocokkan prefix IPv6 ke `https://ip-ranges.amazonaws.com/ip-ranges.json` (python `ipaddress`). Lalu uji `echo "SELECT 1;" | npx prisma db execute --stdin --url "postgresql://postgres.<ref>:<pwd>@aws-{0,1}-<region>.pooler.supabase.com:5432/postgres?sslmode=require"` — error "tenant/user not found" = salah region/klaster, "password authentication failed" = host benar tinggal password. Jaringan user tidak punya IPv6, jadi host langsung `db.<ref>` tidak bisa dipakai; wajib pooler.

**Why:** empat jebakan ini pernah menghabiskan puluhan menit masing-masing; gejalanya menyesatkan (tampak seperti bug kode atau salah kredensial padahal bukan).

**How to apply:** sebelum menyimpulkan ada bug koneksi atau kredensial, jalankan cek HTTP status Supabase di atas. Sebelum build atau `prisma generate`, pastikan preview server berhenti. Lihat [[project-vti-status-branch-mvp]].
