# Panduan Pengembangan ERP-VTI

Dokumen wajib baca **sebelum menulis kode** — untuk siapa pun yang baru melakukan
clone/pull repo ini atau membuka branch baru. Tujuannya satu: **branch boleh
bertambah, tetapi database tetap satu dan tampilan tetap seragam.**

---

## 1. Menjalankan setelah clone/pull

```bash
npm install
```

Salin `.env.example` menjadi `.env`, lalu isi (minta nilai aslinya ke pemegang
project — JANGAN commit `.env`):

| Variabel | Untuk apa |
|---|---|
| `DATABASE_URL` | Koneksi aplikasi ke Supabase (transaction pooler, port **6543**, `?pgbouncer=true`) |
| `DIRECT_URL` | Dipakai `prisma migrate` (session pooler, port **5432**) |
| `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Auth (login) |
| `SUPABASE_SECRET_KEY` | Hanya untuk `scripts/create-users.mjs` |
| `AI_PROVIDER` + variabel `OLLAMA_*` / `OPENAI_*` / `ANTHROPIC_*` | Asisten AI (lihat §7) |

Lalu:

```bash
npx prisma generate
npx prisma migrate deploy
npm run dev
```

Login di `http://localhost:3000` dengan akun uji (lihat §3). Bila akun belum ada
di project Supabase: `node scripts/create-users.mjs`.

### Membuat project Supabase dari nol (hanya bila belum ada / project hilang)

1. https://supabase.com/dashboard → **New project** → nama `erp-vti`, region
   **Southeast Asia (Singapore)**, simpan database password.
2. Tombol **Connect** → tab **ORMs** → **Prisma** → salin `DATABASE_URL`
   (pooler 6543) dan `DIRECT_URL` (5432) ke `.env`, ganti `[YOUR-PASSWORD]`.
3. `npx prisma migrate deploy` → `npm run db:seed` → buat akun:
   `node scripts/create-users.mjs` → uji `http://localhost:3000/api/health`.
4. Deploy Vercel: tambahkan semua variabel `.env` di Settings → Environment
   Variables; Build Command `prisma generate && next build`.

Catatan penting:

- **Kedaulatan data (G4):** Supabase Singapore hanya untuk pilot/data
  ilustratif. Sebelum data nyata karyawan/keuangan dimuat → migrasi ke hosting
  region Indonesia (`pg_dump` → restore; sama-sama PostgreSQL).
- Alternatif tanpa internet (Docker):
  `docker run -d --name erp-pg -e POSTGRES_PASSWORD=devpass -p 5432:5432 postgres:16`
  lalu arahkan kedua URL ke `postgresql://postgres:devpass@localhost:5432/postgres`.

### Jebakan yang sudah terbukti memakan waktu (Windows)

- **`prisma migrate dev` akan gagal** di lingkungan non-interaktif. Alur yang benar:
  tulis migrasi manual (lihat §2), lalu `npx prisma migrate deploy`.
- **`prisma generate` gagal `EPERM`** bila dev server sedang hidup — matikan dulu.
- **`npm run build` bentrok dengan `npm run dev`** (rebutan `.next`) — jangan bersamaan.
- Supabase tidak terjangkau? Cek dulu `curl -m 8 https://<ref>.supabase.co/auth/v1/health`
  — `401` berarti hidup normal; `000`/`540` berarti project paused, bukan salah kodemu.

---

## 2. Database — SATU untuk semua branch

**Supabase PostgreSQL** (region ap-southeast-1). Semua branch, semua fitur, dan
kelak aplikasi mobile menunjuk **database yang sama**. Jangan membuat project
Supabase baru per branch — modul hanyalah lensa navigasi di atas satu basis data,
bukan silo.

### Prinsip terpenting: aturan bisnis ditegakkan DATABASE

Prisma dipakai untuk kueri, tetapi **keputusan boleh/tidaknya ada di Postgres**:
`CHECK` constraint, trigger, dan fungsi PL/pgSQL. Siapa pun yang memegang
`DATABASE_URL` (script, Prisma Studio, psql, aplikasi lain) tetap terkena aturan
yang sama. Contoh yang sudah berlaku:

- `setujui_ritase()` / `tolak_ritase()` — validasi berjenjang + guard peran (BRULE-006)
- Ritase final, sampel lab selesai, surat izin diproses, presensi tertutup → **terkunci trigger**
- Jejak audit append-only; HM unit tidak boleh turun; format periode rencana di-CHECK

Pelanggaran aturan DB diterjemahkan ke HTTP oleh `dbError()` di `lib/api.ts`
(SQLSTATE → status + pesan Bahasa Indonesia). **Jangan tangkap error DB lalu
menelan pesannya sendiri** — lewatkan ke `dbError(e) ?? serverError(e)`.

### Menambah migrasi (pola wajib)

1. Ubah `prisma/schema.prisma` (model + komentar kenapa).
2. Tulis SQL-nya **manual** di `prisma/migrations/<timestamp>_<nama>/migration.sql`
   — ikuti gaya migrasi yang sudah ada: header komentar menjelaskan masalah yang
   diselesaikan, constraint diberi nama (`snake_case`), trigger untuk immutability.
3. `npx prisma migrate deploy` → `npx prisma generate`.
4. Kalau menambah constraint bernama, daftarkan pesan ramahnya di
   `PESAN_CONSTRAINT` (`lib/api.ts`).
5. Uji aturannya dengan skrip SQL `BEGIN; DO $$ ... $$; ROLLBACK;` via
   `npx prisma db execute` — lihat pola di riwayat commit.

**Jangan pernah** mengubah migrasi yang sudah ter-deploy; buat migrasi baru.

---

## 3. Autentikasi & peran

**Supabase Auth**; peran disimpan di `user_metadata.role`. Enam peran:
`driver`, `pengawas`, `checker`, `owner`, `hr`, `lab` (union `Role` di
`lib/supabase/client.ts` — tambah peran baru di sana + `scripts/create-users.mjs`).

Akun uji pilot (password `VTI2026!` — ganti saat go-live): `driver@vti.id`,
`pengawas@vti.id`, `checker@vti.id`, `owner@vti.id`, `hr@vti.id`, `lab@vti.id`.

Guard berlapis, jangan lewati satu pun:

1. **Middleware** (`middleware.ts`) — semua halaman butuh login; halaman terdaftar
   di `PAGE_ROLES` (dibangun otomatis dari `lib/nav.ts`) dibatasi per peran.
2. **API route** — selalu mulai dengan `getSessionUser()`; guard peran eksplisit
   untuk mutasi.
3. **Database** — lapisan terakhir yang tidak bisa dilewati (lihat §2).

---

## 4. Template UI — jangan bikin gaya baru

**Next.js 14 (App Router) + Tailwind CSS 3 + Recharts + lucide-react.**
Identitas visual: **terang, bersih, aksen hijau brand** (`brand-*` di
`tailwind.config.ts`) — sidebar putih gaya ERPNext yang bisa diciutkan,
logo VTI (`public/logo-vti.png`).

### Komponen yang WAJIB dipakai ulang (jangan menulis ulang)

| Kebutuhan | Pakai |
|---|---|
| Kartu/panel | `components/ui/card.tsx` — `Card`, `CardHeader`, `CardTitle`, `CardContent` |
| Tombol | `components/ui/button.tsx` — variant `primary/outline/ghost/subtle` |
| Label status | `components/ui/badge.tsx` — variant `operative/amber/rose/sky/violet/slate/...` |
| Tabel | `components/ui/table.tsx` — `Table, THead, TBody, TR, TH, TD` |
| Form | `components/ui/field.tsx` — `Field` (label+hint+error), `Input`, `Select` |
| Judul halaman | `components/shared/page-header.tsx` |
| Kartu KPI | `components/shared/stat-card.tsx` |
| Grafik | `components/charts/charts.tsx` (wrapper Recharts yang sudah seragam) |
| Halaman berisi data contoh | **wajib** `components/shared/banner-contoh.tsx` |
| Submodul belum dibangun | isi konten contohnya di `lib/mock-data/submodul.ts` (dirender `HalamanContoh`) |

### Pola halaman baku

```tsx
"use client";
export default function HalamanX() {
  return (
    <div className="p-6">
      <PageHeader title="Judul" description="satu kalimat fungsi halaman" />
      {/* StatCard grid → Card form/aksi → Card tabel */}
    </div>
  );
}
```

Konvensi lain yang dijaga:

- **Bahasa Indonesia** untuk seluruh teks UI, pesan error, komentar kode, dan commit.
- Angka agregat **dihitung server**, bukan menjumlah baris di klien.
- Pesan sukses hijau (`text-brand-700` + ikon), pesan galat merah (`text-rose-600`) — jangan tertukar.
- Halaman yang menampilkan angka karangan wajib mengatakannya di layar
  (`BannerContoh` / badge "Ilustratif") — jangan biarkan angka palsu tampak asli.
- Warna baru, font baru, atau library UI baru = tidak, kecuali diputuskan bersama.

---

## 5. Navigasi & modul (`lib/nav.ts`)

`MODULES` adalah **satu-satunya sumber kebenaran** sidebar, switcher Home, dan
`PAGE_ROLES` middleware. Menambah halaman = menambah item di sini (label, href,
icon, roles), bukan mengedit sidebar.

- Modul = per tim. Modul baru dibuat **setelah** tim ybs. menyerahkan form
  pengenalan proses kerja — jangan menambah modul placeholder di muka.
- `roles` di item/grup/modul menyembunyikan menu; penegakan sebenarnya di
  middleware + API + DB.
- Halaman pribadi (`/profil`, `/presensi`, `/home`) bukan milik modul — diakses
  dari topbar (dropdown avatar / tombol Home).
- `PAGE_ROLES` menggabungkan (union) bila satu href muncul di dua modul — jangan
  diubah jadi timpa.

## 6. Pola API route

```ts
export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return json({ error: "Belum login" }, { status: 401 });
    if (!BOLEH.includes(user.role)) return json({ error: "..." }, { status: 403 });
    // validasi input ringan → operasi Prisma / fungsi DB
    return json(hasil, { status: 201 });
  } catch (e) {
    return dbError(e) ?? serverError(e);
  }
}
```

- Identitas & peran **selalu dari sesi**, tidak pernah dari body.
- Idempoten untuk input harian: `upsert` per kunci unik (pola HM/BBM/presensi).
- Aksi AI dieksekusi dengan meneruskan cookie sesi user ke route yang ada —
  guard peran tetap berlaku, audit atas nama manusia.

## 7. Asisten AI

Penyedia dipilih lewat env `AI_PROVIDER`: `openai` | `anthropic` | `ollama`.
Produksi/pilot saat ini memakai **ollama** — model lokal DeepSeek-R1 14B di
server `spark-2209`, diakses via **Tailscale** (`http://100.89.200.100:11434`;
mesin dev harus tergabung/di-share ke tailnet). Model ini **tidak bisa
tool-calling native** — adapter `lib/ai/ollama.ts` memaksa keluaran JSON Schema
dan mengeksekusi alat di server; jangan ganti model tanpa membaca komentar di
berkas itu. Alat baca/tulis asisten ada di `lib/ai/tools.ts`.

## 8. Aturan branch

- **Jangan bekerja langsung di `main`.** Buat branch fitur; setelah stabil,
  fast-forward merge ke `main` (`git merge --ff-only <branch>`).
- Branch **`draga` = khusus aplikasi mobile (Flutter)** — jangan campur pekerjaan
  web ke sana. Skema datanya kelak harus mengikuti skema branch web ini.
- Commit message Bahasa Indonesia: baris pertama = apa yang berubah, badan =
  kenapa.

## 9. Checklist sebelum push

```bash
npx tsc --noEmit     # wajib bersih
```

- [ ] Halaman baru memakai komponen §4, terdaftar di `lib/nav.ts` dengan roles yang benar
- [ ] API baru mengikuti pola §6 (sesi → peran → validasi → `dbError`)
- [ ] Aturan yang menyentuh uang/audit ditegakkan di database, bukan hanya di TS
- [ ] Migrasi baru sudah `migrate deploy` ke Supabase & diuji rollback-script
- [ ] Data uji yang kamu buat di database sudah dibersihkan
- [ ] Teks UI & pesan error Bahasa Indonesia; data contoh ditandai
