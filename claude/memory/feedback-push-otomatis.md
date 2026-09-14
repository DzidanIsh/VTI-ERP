---
name: feedback-push-otomatis
description: "User memberi izin tetap: setelah beberapa perubahan besar, commit dan push ke GitHub langsung tanpa minta konfirmasi"
metadata:
  node_type: memory
  type: feedback
---

Setelah beberapa perubahan besar selesai, **langsung commit dan push ke GitHub** tanpa menunggu persetujuan lagi. Diminta user 29 Jul 2026.

**Why:** User tidak mau ditanya berulang tiap kali push; repo `Vendoura-Apps/ERP-VTI` privat sehingga risiko kebocoran (termasuk kredensial akun uji di memory) sudah diterima user secara sadar.

**How to apply:** Push ke branch kerja yang sedang aktif (saat ini `VTI-Mining-Operation-Intelligence`), bukan `main` — `git push origin <branch>`. Kriteria "perubahan besar": satu fitur/modul selesai dan sudah lewat build/typecheck, migrasi skema Prisma, atau perbaikan bug yang menyentuh banyak file. Bukan tiap edit kecil. Yang masih WAJIB tanya lebih dulu: push ke `main`, `push --force`, merge/rebase yang menulis ulang riwayat, dan pembuatan PR. Lihat [[project-vti-status-branch-mvp]], [[feedback-cantumkan-command]].
