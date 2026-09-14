import { DEFINISI_ALAT, isAlatTulis } from "./tools";
import { PROMPT_DASAR, promptKonteks } from "./prompt";
import { jalankanTool, MAKS_PUTARAN, type HasilAgent, type PermintaanAgent } from "./aksi";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Adapter Ollama — model lokal DeepSeek-R1-Distill-Qwen-14B.
 *
 * Model distill R1 TIDAK bisa tool-calling native (diuji: tool_calls selalu
 * null — lihat docs/ollama: "Jangan bangun alur kerja berbasis fungsi di
 * atas model ini"). Sebagai gantinya:
 *   - keluaran DIPAKSA berbentuk JSON lewat parameter `format` (JSON Schema),
 *   - loop di berkas ini yang membaca niat model ({tipe:"alat"}) dan
 *     menjalankan alatnya — model hanya memilih, server yang mengeksekusi,
 *   - `think: true` memisahkan penalaran R1 ke field terpisah sehingga
 *     content bersih berisi JSON saja.
 */

const BASE = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const MODEL = process.env.OLLAMA_MODEL || "hf.co/bartowski/DeepSeek-R1-Distill-Qwen-14B-GGUF:Q8_0";
// 4096 (bawaan) terlalu sempit untuk prompt + katalog alat + hasil data;
// 8192 cukup dan hemat VRAM dibanding konteks penuh 131k.
const NUM_CTX = Number(process.env.OLLAMA_NUM_CTX || 8192);

const SKEMA_KELUARAN = {
  type: "object",
  properties: {
    tipe: { type: "string", enum: ["jawab", "alat"] },
    jawaban: { type: "string" },
    alat: { type: "string" },
    argumen: { type: "object" },
  },
  required: ["tipe"],
};

function katalogAlat(): string {
  return DEFINISI_ALAT.map((t) => {
    const props = (t as any).input_schema?.properties ?? {};
    const ringkas = Object.entries(props)
      .map(([k, v]) => `${k} (${(v as any).description ?? (v as any).type ?? ""})`)
      .join(", ");
    return `- ${t.name}: ${t.description}${ringkas ? `\n  argumen: ${ringkas}` : ""}`;
  }).join("\n");
}

const PROMPT_ALAT = `

## Format jawaban (WAJIB — kamu tidak bisa memanggil fungsi secara native)
Balas SELALU dengan SATU objek JSON, tanpa teks lain:
- Menjawab user:            {"tipe":"jawab","jawaban":"<jawaban lengkap untuk user>"}
- Meminta data lewat alat:  {"tipe":"alat","alat":"<nama_alat>","argumen":{...}}
Setelah kamu meminta alat, hasilnya dikirim balik sebagai pesan "Hasil alat …".
Baca hasil itu, lalu minta alat lain bila perlu, atau langsung jawab.
Untuk alat usul_* sertakan juga "jawaban" berisi ringkasan usulan untuk user.

## Daftar alat
${katalogAlat()}`;

interface PesanOllama {
  role: string;
  content: string;
  /** Usulan aksi tulis yang menunggu konfirmasi user — metadata loop ini, diabaikan Ollama. */
  usulan?: { toolUseId: string; nama: string; input: Record<string, any> };
}

async function panggilOllama(pesan: { role: string; content: string }[], pakaiThink: boolean): Promise<string> {
  const res = await fetch(`${BASE}/api/chat`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      messages: pesan,
      stream: false,
      think: pakaiThink,
      format: SKEMA_KELUARAN,
      // num_predict lega: tahap penalaran R1 ikut memakan kuota token
      options: { num_ctx: NUM_CTX, num_predict: 3000 },
      keep_alive: "30m",
    }),
    // ≈10 token/detik — beri waktu; pemuatan awal +7 detik
    signal: AbortSignal.timeout(240_000),
  });
  if (!res.ok) throw new Error(`Ollama ${res.status}: ${(await res.text().catch(() => "")).slice(0, 200)}`);
  const j = await res.json();
  return String(j?.message?.content ?? "");
}

/**
 * Model kerap mengisi argumen opsional dengan string kosong ("dari": "") —
 * terverifikasi pada uji langsung. Buang supaya alat memperlakukannya
 * sebagai "tidak diisi", bukan tanggal tidak valid.
 */
function bersihkanArgumen(a: Record<string, any> | undefined): Record<string, any> {
  const hasil: Record<string, any> = {};
  for (const [k, v] of Object.entries(a ?? {})) {
    if (v !== "" && v !== null && v !== undefined) hasil[k] = v;
  }
  return hasil;
}

/** Konten model → objek keputusan. Blok <think> dibuang bila masih menyatu. */
function parseKeluaran(s: string): { tipe?: string; jawaban?: string; alat?: string; argumen?: Record<string, any> } {
  const bersih = s.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
  const m = bersih.match(/\{[\s\S]*\}/);
  if (m) {
    try {
      return JSON.parse(m[0]);
    } catch {
      /* jatuh ke bawah */
    }
  }
  return { tipe: "jawab", jawaban: bersih };
}

export async function jalankan({ messages, keputusan, user, hariIni, req }: PermintaanAgent): Promise<HasilAgent> {
  // Buang peran "system" dari client — system prompt hanya boleh ditentukan server.
  const riwayat: PesanOllama[] = (messages as PesanOllama[]).filter((m) => m?.role !== "system");

  if (keputusan) {
    const tertunda = [...riwayat].reverse().find((m) => m.usulan?.toolUseId === keputusan.toolUseId) ?? [...riwayat].reverse().find((m) => m.usulan);
    if (!tertunda?.usulan) throw new Error("Tidak ada usulan aksi yang menunggu konfirmasi");
    const { isi } = await jalankanTool(tertunda.usulan.toolUseId, tertunda.usulan.nama, tertunda.usulan.input, keputusan, req);
    delete tertunda.usulan; // sudah diproses — jangan dieksekusi dua kali
    riwayat.push({
      role: "user",
      content: `Hasil aksi: ${JSON.stringify(isi)}. Sampaikan hasilnya ke user secara ringkas dalam bahasa Indonesia.`,
    });
  }

  const sistem = `${PROMPT_DASAR}${PROMPT_ALAT}\n\n${promptKonteks(user, hariIni)}`;

  for (let putaran = 0; putaran < MAKS_PUTARAN; putaran++) {
    const kirim = [{ role: "system", content: sistem }, ...riwayat.map(({ role, content }) => ({ role, content }))];
    let konten: string;
    try {
      konten = await panggilOllama(kirim, true);
    } catch {
      // sebagian versi menolak kombinasi think+format — coba sekali tanpa think
      konten = await panggilOllama(kirim, false);
    }
    const k = parseKeluaran(konten);

    if (k.tipe === "alat" && k.alat) {
      const argumen = bersihkanArgumen(k.argumen);
      if (isAlatTulis(k.alat)) {
        // Aksi tulis tidak pernah langsung dieksekusi — kembalikan sebagai
        // usulan; kartu konfirmasi di UI yang memutuskan (keputusan terkunci).
        const id = `ollama-${Date.now().toString(36)}-${putaran}`;
        const usulan = { toolUseId: id, nama: k.alat, input: argumen };
        riwayat.push({ role: "assistant", content: konten, usulan });
        return { messages: riwayat, balasan: k.jawaban ?? "", usulan };
      }
      riwayat.push({ role: "assistant", content: konten });
      const { isi } = await jalankanTool(`baca-${putaran}`, k.alat, argumen, undefined, req);
      riwayat.push({ role: "user", content: `Hasil alat ${k.alat}: ${JSON.stringify(isi)}` });
      continue;
    }

    const jawaban = (k.jawaban ?? "").trim() || konten.trim();
    riwayat.push({ role: "assistant", content: jawaban });
    return { messages: riwayat, balasan: jawaban };
  }

  return { messages: riwayat, balasan: "Maaf, pencarian data terlalu panjang. Coba pertanyaan yang lebih spesifik." };
}
