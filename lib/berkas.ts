/** Validasi gambar dari data URL — dipakai foto profil & lampiran surat izin. */

// Magic bytes per MIME — data URL bisa mengaku apa saja, byte pertamanya tidak.
const MAGIC: Record<string, (b: Buffer) => boolean> = {
  "image/jpeg": (b) => b[0] === 0xff && b[1] === 0xd8,
  "image/png": (b) => b[0] === 0x89 && b[1] === 0x50,
  "image/webp": (b) => b.subarray(0, 4).toString("ascii") === "RIFF",
};

export function bacaGambarDataUrl(
  dataUrl: unknown,
  maksByte: number
): { mime: string; data: Uint8Array<ArrayBuffer> } | { galat: string } {
  const m = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/.exec(String(dataUrl ?? ""));
  if (!m) return { galat: "Berkas harus gambar jpeg/png/webp (base64)" };
  const [, mime, base64] = m;
  const buf = Buffer.from(base64, "base64");
  if (buf.length > maksByte)
    return { galat: `Berkas terlalu besar (maks ${Math.round(maksByte / 1024)}KB setelah resize)` };
  if (!MAGIC[mime]?.(buf)) return { galat: "Isi berkas tidak cocok dengan tipenya" };
  // Uint8Array dengan ArrayBuffer sendiri — tipe Bytes Prisma menuntut ini, bukan Buffer.
  return { mime, data: Uint8Array.from(buf) };
}
