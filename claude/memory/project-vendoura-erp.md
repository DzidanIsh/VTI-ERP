---
name: project-vendoura-erp
description: Tujuan & arah proyek ERP custom PT Vendoura Inti Perkasa (meniru HashMicro)
metadata: 
  node_type: memory
  type: project
  originSessionId: cf4127ec-7607-4ae3-a244-d46a00b3c5da
  modified: 2026-07-27T08:44:00.615Z
---

User sedang membangun **ERP custom untuk PT Vendoura Inti Perkasa** (tambang nikel, Siumbatu/Bahodopi, Morowali) untuk menghindari langganan HashMicro "Hash Core" (Rp40 jt/bulan + Rp250 jt implementasi, kontrak 3 tahun). Meniru 6 modul Hash Core: Mining, Asset, CRM Sales, Inventory, Accounting, Purchase — tampilan boleh lebih baik, tidak harus identik.

Per 2026-06-27: dibangun **prototipe frontend** (Next.js 14 + TS + Tailwind 3 + Recharts, data dummy) di `D:\claude\ERP VIP`. Fase 0 selesai: shell + Mining Site Dashboard penuh + Mining Flow + Daily Production + dashboard 5 modul lain (sub-halaman lain = placeholder catch-all `[...slug]`). Jalankan: `npm run dev` → localhost:3000.

Per 2026-06-28: wawancara requirement gathering pertama dianalisis → temuan kunci: kebutuhan riil VIP adalah **sistem monitoring operasi produksi (Mining→Hauling→Barging)**, bukan ERP generik. Pain #1 = akurasi input **ritase & tonase** (dasar bayar vendor/driver). Dokumen analisis kebutuhan ada di `docs/analisis-kebutuhan.md` (+ Word `docs/Analisis-Kebutuhan-ERP-VTI.docx`, regen: `npm run doc:build`). Rekomendasi: re-prioritas roadmap → bangun **"Production Monitoring MVP"** (modul Mining) lebih dulu. Repo GitHub: **Vendoura-Apps/ERP-VTI** (privat), deploy via Vercel.

**Why:** evaluasi build-vs-buy; frontend dulu sebelum putuskan backend.
Per 2026-06-29: dokumen rekan user (Perancangan & Implementasi ERP) digabung dengan analisis-kebutuhan menjadi **dokumen master** (acuan tunggal SRS+SDD): `docs/dokumen-master-erp-vti.md` + `.docx`. Generator `scripts/md-to-docx.js` terima argumen `<in.md> <out.docx>`.

Per 2026-07-02 (dokumen master **v1.1**): UI Fase 1 (ritase, validasi berlapis, tonase, stockpile, master data, produktivitas) & Fase 2 (barging 3-titik ukur, deviasi, penjualan, rantai fisik) **selesai** — masih localStorage. **Keputusan arsitektur pilot final**: **Next.js fullstack + Prisma + Supabase PostgreSQL (Singapore; user sudah punya akun)** — NestJS ditunda ke Fase 5; fondasi backend terbangun (`prisma/schema.prisma` 11 model + `directUrl`, 11 endpoint `app/api/*`, seed, `docs/setup-backend.md`) tapi **belum tersambung ke UI** (menunggu connection string Supabase diisi ke `.env`). Cetak biru infrastruktur = `docs/Laporan-Arsitektur-Infrastruktur-ERP_2.docx` dengan tahapan **Infra-0..3** + **gerbang kedaulatan data** (wajib migrasi ke hosting Indonesia sebelum data nyata). Lembar verifikasi angka: `docs/verifikasi-parameter.md`.

Per 2026-07-27: arah berubah dari "6 modul ERP" ke **fokus 4 modul MVP blueprint** di branch `VTI-Mining-Operation-Intelligence`; Supabase sudah aktif dan UI sudah tersambung. **Status terkini ada di [[project-vti-status-branch-mvp]] — baca itu, bukan paragraf-paragraf di atas** (isi di atas adalah riwayat Juni–awal Juli dan sebagian sudah usang, mis. "belum tersambung ke UI" sudah tidak berlaku).

**How to apply:** untuk pekerjaan hari ini pakai [[project-vti-status-branch-mvp]] + [[project-vti-keputusan-terkunci]] + [[reference-vti-dokumen-acuan]]. Dokumen master v1.1 tetap acuan SRS/SDD. Angka seed masih ilustratif — jangan pakai untuk pembayaran sebelum lembar verifikasi terisi. Lihat [[user-vendoura-context]].
