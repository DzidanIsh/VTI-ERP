import Anthropic from "@anthropic-ai/sdk";
import { DEFINISI_ALAT, isAlatTulis } from "./tools";
import { PROMPT_DASAR, promptKonteks } from "./prompt";
import { jalankanTool, MAKS_PUTARAN, type HasilAgent, type Keputusan, type PermintaanAgent } from "./aksi";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-5";

type Pesan = Anthropic.MessageParam;
type BlokTool = Anthropic.ToolUseBlock;

async function toolResult(blok: BlokTool[], keputusan: Keputusan | undefined, req: Request) {
  return Promise.all(
    blok.map(async (b): Promise<Anthropic.ToolResultBlockParam> => {
      const { isi, error } = await jalankanTool(b.id, b.name, b.input as Record<string, unknown>, keputusan, req);
      return {
        type: "tool_result",
        tool_use_id: b.id,
        content: JSON.stringify(isi),
        ...(error ? { is_error: true } : {}),
      };
    })
  );
}

export async function jalankan({ messages, keputusan, user, hariIni, req }: PermintaanAgent): Promise<HasilAgent> {
  const anthropic = new Anthropic();
  // Buang peran "system" dari client — system prompt hanya boleh ditentukan server.
  const riwayat: Pesan[] = messages.filter((m) => m?.role === "user" || m?.role === "assistant");

  if (keputusan) {
    const akhir = riwayat[riwayat.length - 1];
    const blok =
      akhir?.role === "assistant" && Array.isArray(akhir.content)
        ? (akhir.content.filter((b) => (b as BlokTool).type === "tool_use") as BlokTool[])
        : [];
    if (blok.length === 0) throw new Error("Tidak ada usulan aksi yang menunggu konfirmasi");
    riwayat.push({ role: "user", content: await toolResult(blok, keputusan, req) });
  }

  for (let putaran = 0; putaran < MAKS_PUTARAN; putaran++) {
    const res = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 2048,
      output_config: { effort: "low" },
      system: [
        // blok stabil -> di-cache; konteks (tanggal & user) sengaja di luar cache
        { type: "text", text: PROMPT_DASAR, cache_control: { type: "ephemeral" } },
        { type: "text", text: promptKonteks(user, hariIni) },
      ],
      tools: DEFINISI_ALAT,
      messages: riwayat,
    });

    riwayat.push({ role: "assistant", content: res.content });
    const teks = res.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    if (res.stop_reason === "refusal")
      return { messages: riwayat, balasan: "Maaf, permintaan itu tidak bisa saya proses." };
    if (res.stop_reason !== "tool_use") return { messages: riwayat, balasan: teks };

    const blok = res.content.filter((b): b is BlokTool => b.type === "tool_use");
    const aksi = blok.filter((b) => isAlatTulis(b.name));
    if (aksi.length > 0) {
      const b = aksi[0];
      return {
        messages: riwayat,
        balasan: teks,
        usulan: { toolUseId: b.id, nama: b.name, input: b.input as Record<string, unknown> },
      };
    }

    riwayat.push({ role: "user", content: await toolResult(blok, undefined, req) });
  }

  return { messages: riwayat, balasan: "Maaf, pencarian data terlalu panjang. Coba pertanyaan yang lebih spesifik." };
}
