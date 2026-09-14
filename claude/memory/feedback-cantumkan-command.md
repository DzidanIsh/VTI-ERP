---
name: feedback-cantumkan-command
description: "User ingin setiap proses/diagnosis disertai perintah konkret yang dijalankan, bukan hanya kesimpulan"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 7256fec3-dc6c-4c0b-89b0-414dbcc1499f
  modified: 2026-07-26T14:03:57.843Z
---

Saat menjelaskan proses atau hasil diagnosis, cantumkan perintah/command konkret yang dijalankan — bukan hanya kesimpulannya.

**Why:** User ingin bisa memverifikasi sendiri, mengulang langkahnya tanpa bertanya lagi, dan belajar dari caranya. Diminta pada 7 Jul 2026 setelah beberapa sesi diagnosis (koneksi Supabase, Lighthouse, migrasi Prisma) yang hanya dilaporkan hasilnya.

**How to apply:** Tampilkan command dalam fenced code block ```bash (satu perintah per block, karena app menampilkan tombol Run) berikut output pentingnya secara ringkas. Berlaku untuk semua jenis kerja: diagnosis jaringan/DB, build & typecheck, git, migrasi, verifikasi browser. Untuk langkah yang bukan shell (mis. tool internal seperti edit file atau eval browser), sebutkan apa yang dilakukan pada file/selector mana. Terkait [[project-vendoura-erp]].
