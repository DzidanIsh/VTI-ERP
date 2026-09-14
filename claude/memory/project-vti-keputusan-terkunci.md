---
name: project-vti-keputusan-terkunci
description: Keputusan desain ERP-VTI yang sudah disepakati user — jangan ditawarkan ulang
metadata: 
  node_type: memory
  type: project
  originSessionId: 7256fec3-dc6c-4c0b-89b0-414dbcc1499f
  modified: 2026-08-11T08:49:24.807Z
---

Keputusan berikut sudah diambil user (Juli 2026) dan **tidak perlu ditanyakan ulang**:

- **1 ritase = 1 bolak-balik.** 10 rit/hari = 10 entri, bukan satu entri berisi "10 trip".
- **Tonase = kapasitas vessel dump truck (m³) × density material.** Driver tidak menghitung bucket. Konsekuensinya: produksi per excavator tidak terlacak — kalau dibutuhkan, tambah satu dropdown "excavator pemuat", rumusnya tidak berubah.
- **Tonase melekat pada ritase**, bukan tabel terpisah, dan ikut divalidasi berjenjang. Tabel `Tonase` lama sudah dihapus. Halaman "Rekap Tonase" hanya monitoring read-only.
- **Tahap driver selesai saat input.** Ritase baru langsung masuk antrian Pengawas (`tahapIndex: 1`); driver tidak menyetujui entrinya sendiri.
- **AI boleh bertindak, TAPI wajib konfirmasi user**, dan jejak audit mencatat manusia pelakunya (`AuditLog.oleh` = nama user login, `sumber` = web/asisten/telegram). Agent hanya mengusulkan lewat tool `usul_*`; eksekusi meneruskan cookie sesi ke route yang ada agar guard peran tetap berlaku.
- **Dua penyedia AI, dipilih lewat env `AI_PROVIDER`** (`openai` default, `anthropic` alternatif). User memakai **OpenAI gpt-4o**.
- **Laporan PDF = halaman siap cetak → Save as PDF**, template tetap, bukan generator PDF di server.
- **Urutan kanal**: web dulu → Telegram → WhatsApp (WA butuh Meta Business API berbayar).
- **Mode offline ditunda** sampai setelah pilot. **Deploy Vercel** setelah semua fitur MVP selesai.
- **Modul ERP = per tim, dibuat HANYA setelah tim ybs. mengisi form pengenalan proses kerja** (Agustus 2026). Jangan membuat modul placeholder/ComingSoon di muka — pernah dibuat (Engineering/Plant/Survey/Manajemen) dan user minta dihapus. **DIREVISI 2026-08-11:** user eksplisit minta modul-modul draga dipindahkan ke branch web — Inventory/Asset/Sales/Accounting/Purchase (data contoh, owner saja) + HR/presensi kini ADA di branch (commit 6aceade); jangan hapus, dan jangan pakai aturan lama untuk menolaknya. Aturan "tunggu form tim" tetap berlaku untuk modul BARU di luar yang dari draga. Modul tetap lensa navigasi di atas satu basis data, bukan silo.

**Why:** semua ini pernah didiskusikan panjang; menawarkan ulang membuang waktu user dan berisiko membalik keputusan yang sudah matang.

**How to apply:** kalau menemukan kode yang bertentangan dengan poin di atas, itu bug — perbaiki, jangan tanya ulang. Lihat [[project-vti-status-branch-mvp]].
