import { FlaskConical } from "lucide-react";

/**
 * Penanda halaman yang isinya DATA CONTOH, bukan data operasi.
 *
 * KENAPA INI ADA:
 *
 * Delapan halaman merender konstanta dari lib/mock-data/ dan tidak memanggil
 * API sama sekali. Lima di antaranya milik modul yang memang belum dibangun —
 * itu wajar. Dua tidak: `mining` dan `mining/daily-production` duduk di dalam
 * modul yang SUDAH hidup, bersebelahan di navigasi dengan halaman validasi
 * yang menentukan pembayaran vendor.
 *
 * Dan keduanya tidak sekadar diam soal itu, mereka menyatakan sebaliknya.
 * Dasbor menuliskan "real-time" di bawah judulnya. Daily Production melabeli
 * kolomnya "Ore Hari Ini" atas tanggal yang dipatok mati di kode. Orang yang
 * membukanya tidak punya satu pun alasan untuk curiga.
 *
 * Halaman yang jujur kosong tidak menipu siapa pun; halaman yang menampilkan
 * angka rapi dan meyakinkan bisa dipakai mengambil keputusan. Selama angkanya
 * masih karangan, itu harus tertulis di layar — bukan hanya di README.
 *
 * Ini penanda, bukan perbaikan. Yang memperbaikinya adalah menghubungkan
 * halaman ini ke API atau menghapusnya.
 */
export function BannerContoh({ catatan }: { catatan?: string }) {
  return (
    <div
      role="note"
      className="mb-5 flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3"
    >
      <FlaskConical className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden />
      <p className="text-sm text-amber-900">
        {/*
          "Data contoh" ditulis tegas di depan, bukan diselipkan di akhir
          kalimat. Peringatan yang harus dicari dulu bukan peringatan.
        */}
        <span className="font-semibold">Data contoh — bukan data operasi.</span>{" "}
        Angka di halaman ini belum terhubung ke basis data dan tidak boleh dipakai untuk
        pelaporan atau pengambilan keputusan.
        {catatan ? ` ${catatan}` : ""}
      </p>
    </div>
  );
}
