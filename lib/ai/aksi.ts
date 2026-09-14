import type { SessionUser } from "@/lib/supabase/client";
import { ALAT_BACA, isAlatTulis } from "./tools";

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Keputusan user atas satu usulan aksi (kartu konfirmasi di UI). */
export interface Keputusan {
  toolUseId: string;
  setuju: boolean;
}

export interface PermintaanAgent {
  /** Riwayat percakapan dalam format asli penyedia — disimpan di client. */
  messages: any[];
  keputusan?: Keputusan;
  user: SessionUser;
  hariIni: string;
  req: Request;
}

export interface HasilAgent {
  messages: any[];
  balasan: string;
  usulan?: { toolUseId: string; nama: string; input: Record<string, any> };
}

export const MAKS_PUTARAN = 6; // pagar agar loop tool tidak berjalan tanpa henti

/**
 * Jalankan aksi tulis dengan meneruskan cookie sesi user ke route yang sudah ada.
 * Dengan begitu seluruh validasi, guard peran (BRULE-006), dan jejak audit tetap
 * berlaku — dan tercatat atas nama user yang login, bukan atas nama AI.
 */
async function eksekusiAksi(nama: string, input: Record<string, any>, req: Request) {
  const cookie = req.headers.get("cookie") ?? "";
  const kirim = (path: string, method: string, body: unknown) =>
    fetch(new URL(path, req.url), {
      method,
      headers: { "content-type": "application/json", cookie },
      body: JSON.stringify(body),
    });

  const res =
    nama === "usul_input_ritase"
      ? await kirim("/api/ritase", "POST", { ...input, sumber: "asisten" })
      : await kirim(`/api/ritase/${input.ritaseId}`, "PATCH", {
          aksi: input.aksi,
          alasan: input.alasan,
          sumber: "asisten",
        });

  const data = await res.json().catch(() => ({}));
  return res.ok
    ? { berhasil: true, hasil: data }
    : { berhasil: false, status: res.status, pesan: (data as { error?: string }).error ?? `HTTP ${res.status}` };
}

/**
 * Jalankan satu tool dan kembalikan isinya apa adanya (belum dibungkus format
 * penyedia). Tool baca idempoten sehingga aman diulang saat percakapan
 * dilanjutkan setelah konfirmasi; tool tulis mengikuti keputusan user.
 */
export async function jalankanTool(
  id: string,
  nama: string,
  input: Record<string, any>,
  keputusan: Keputusan | undefined,
  req: Request
): Promise<{ isi: unknown; error: boolean }> {
  if (isAlatTulis(nama)) {
    if (!keputusan || keputusan.toolUseId !== id)
      return { isi: { dibatalkan: true, alasan: "User tidak menyetujui aksi ini." }, error: false };
    if (!keputusan.setuju)
      return { isi: { dibatalkan: true, alasan: "User menolak usulan aksi ini." }, error: false };
    const r = await eksekusiAksi(nama, input, req);
    return { isi: r, error: !r.berhasil };
  }

  const alat = ALAT_BACA[nama];
  if (!alat) return { isi: { error: `Tool "${nama}" tidak dikenal` }, error: true };
  try {
    return { isi: await alat(input), error: false };
  } catch (e) {
    return { isi: { error: e instanceof Error ? e.message : String(e) }, error: true };
  }
}
