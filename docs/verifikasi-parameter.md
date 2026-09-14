# Lembar Verifikasi Parameter — ERP-VTI

| | |
|---|---|
| **Tujuan** | Memverifikasi semua angka & aturan yang saat ini masih *ilustratif* (dari 1 wawancara) sebelum dikodekan sebagai dasar perhitungan riil |
| **Cara pakai** | Isi kolom **Nilai Benar** bersama narasumber/PIC; coret yang tidak relevan; tambah baris bila ada yang kurang |
| **Rujukan** | Dokumen Master ERP-VTI Bagian 16 (Pertanyaan Terbuka) |

> ⚠️ Semua nilai pada kolom "Nilai di Sistem" adalah **placeholder** dan **belum boleh dipakai untuk pembayaran** sebelum diverifikasi.

## A. Parameter Perhitungan Inti

| # | Parameter | Nilai di Sistem (ilustratif) | Nilai Benar | Sumber/PIC | Catatan |
|---|---|---|---|---|---|
| A1 | Cut-off grade (COG) | 1,3 | | Engineering / owner | Berlaku sama untuk semua pit? |
| A2 | Density Saprolite | 1,55 t/m³ | | Owner | |
| A3 | Density Limonite | 1,45 t/m³ | | Owner | |
| A4 | Density Low grade | 1,40 t/m³ | | Owner | |
| A5 | Rumus tonase | volume bucket × density × jumlah bucket | | Engineering | Ada faktor koreksi (fill factor/kelembapan)? |
| A6 | Kapasitas bucket PC200 | 0,93 m³ | | Plant/Workshop | |
| A7 | Kapasitas bucket PC300 | 1,4 m³ | | Plant/Workshop | |
| A8 | Bucket per muatan DT (PC200) | ±20–22 kali | | Produksi | |

## B. Harga & Kontrak (paling kritis — dasar pembayaran)

| # | Parameter | Nilai di Sistem (ilustratif) | Nilai Benar | Sumber/PIC | Catatan |
|---|---|---|---|---|---|
| B1 | Harga per ritase — Vendor 1 | Rp185.000 | | Kontrak | Nama vendor sebenarnya? |
| B2 | Harga per ritase — Vendor 2 | Rp180.000 | | Kontrak | |
| B3 | Harga per ritase — Vendor 3 | Rp192.000 | | Kontrak | |
| B4 | Harga per ritase — Vendor 4 | Rp178.000 | | Kontrak | |
| B5 | Harga sama untuk semua rute? | (diasumsikan ya) | | Kontrak | Atau beda per jarak pit→stockpile? |
| B6 | Skema kontrak MRR (perawatan jalan) | (belum dimodelkan) | | Kontrak | Lump sum / bulanan? |
| B7 | Harga jual nikel per ton | Rp210.000 (contoh) | | Marketing/owner | Mengikuti HPM? Faktor kadar/MC? |

## C. Kapasitas & Batas Muat

| # | Parameter | Nilai di Sistem | Nilai Benar | Sumber/PIC | Catatan |
|---|---|---|---|---|---|
| C1 | Batas muat aman DT (umum) | 22 ton | | HSE | |
| C2 | Batas muat vendor tertentu | 19 ton | | HSE | Vendor yang mana? |
| C3 | Batas trip per hari per unit (validasi input) | maks 50 | | Produksi | Angka wajar? |
| C4 | Kapasitas tongkang yang dipakai | 3.500 / 7.500 / 10.000 / 12.000 t | | Barging | Daftar tongkang riil |

## D. Target & Rencana

| # | Parameter | Nilai di Sistem | Nilai Benar | Sumber/PIC | Catatan |
|---|---|---|---|---|---|
| D1 | Target produksi bulanan (total) | 150.000 t (dari wawancara) | | Engineering | |
| D2 | Target penjualan bulanan | 180.000 t (placeholder) | | Engineering | |
| D3 | Target per unit excavator | 42.000–58.000 t/bln (placeholder) | | Engineering | Bagaimana cara menetapkannya? |
| D4 | Ambang klasifikasi unit | Produktif ≥95%, Andal 80–95%, Merugikan <80% | | Manajemen | Definisi yang diinginkan manajemen? |
| D5 | Faktor pengurang target (cuaca, breakdown) | (belum dimodelkan eksplisit) | | Engineering | Berapa % / bagaimana dihitung? |

## E. Proses & Data

| # | Pertanyaan | Jawaban | PIC |
|---|---|---|---|
| E1 | Contoh **raw data** pencatatan kertas (foto/scan form ritase & produksi) | | Produksi |
| E2 | Contoh **laporan Excel** yang dipakai sekarang (struktur kolom) | | Produksi |
| E3 | Alur validasi persisnya: kapan driver/pengawas/checker menandatangani, pakai apa | | Produksi |
| E4 | Daftar lengkap unit + kode + kapasitas + pemilik (VIP/vendor) | | Plant |
| E5 | Daftar driver/operator per vendor | | Vendor |
| E6 | Nama & jumlah stockpile (ETO/EBO) aktif + kadarnya | | QA/QC owner |
| E7 | Apakah vendor punya sistem sendiri, atau semua input via VIP? | | Vendor |
| E8 | Seberapa sering site putus koneksi? Titik input mana yang wajib offline? | | IT/Site |
| E9 | Rekap ritase perlu tersambung payroll resmi? | | HR/Finance |
| E10 | Perangkat MCC yang tersedia/direncanakan (GPS, timbangan, alat survei) | | IT |

## F. Persetujuan

| Peran | Nama | Tanda tangan | Tanggal |
|---|---|---|---|
| Narasumber operasional | | | |
| Engineering | | | |
| Manajemen | | | |

---

*Setelah lembar ini terisi, nilai-nilai akan dimasukkan sebagai data master resmi di database (menggantikan seluruh placeholder), dan rumus perhitungan dikunci sesuai konfirmasi.*
