import OpenAI from "openai";
import type { ChatCompletionMessageParam, ChatCompletionMessageFunctionToolCall } from "openai/resources/chat/completions";
import { DEFINISI_ALAT_OPENAI, isAlatTulis } from "./tools";
import { PROMPT_DASAR, promptKonteks } from "./prompt";
import { jalankanTool, MAKS_PUTARAN, type HasilAgent, type Keputusan, type PermintaanAgent } from "./aksi";

const MODEL = process.env.OPENAI_MODEL || "gpt-4o";

/** Argumen tool datang sebagai string JSON pada OpenAI — parse dengan aman. */
function parseArg(s: string): Record<string, unknown> {
  try {
    return JSON.parse(s || "{}");
  } catch {
    return {};
  }
}

async function toolResult(panggilan: ChatCompletionMessageFunctionToolCall[], keputusan: Keputusan | undefined, req: Request) {
  return Promise.all(
    panggilan.map(async (c): Promise<ChatCompletionMessageParam> => {
      const { isi } = await jalankanTool(c.id, c.function.name, parseArg(c.function.arguments), keputusan, req);
      // OpenAI tidak punya flag is_error; error disampaikan sebagai isi hasil.
      return { role: "tool", tool_call_id: c.id, content: JSON.stringify(isi) };
    })
  );
}

export async function jalankan({ messages, keputusan, user, hariIni, req }: PermintaanAgent): Promise<HasilAgent> {
  const openai = new OpenAI();
  // Buang peran "system" dari client — system prompt hanya boleh ditentukan server.
  const riwayat: ChatCompletionMessageParam[] = messages.filter((m) => m?.role !== "system");

  if (keputusan) {
    const akhir = riwayat[riwayat.length - 1];
    const panggilan =
      akhir?.role === "assistant" && akhir.tool_calls?.length
        ? akhir.tool_calls.filter((c): c is ChatCompletionMessageFunctionToolCall => c.type === "function")
        : [];
    if (panggilan.length === 0) throw new Error("Tidak ada usulan aksi yang menunggu konfirmasi");
    riwayat.push(...(await toolResult(panggilan, keputusan, req)));
  }

  for (let putaran = 0; putaran < MAKS_PUTARAN; putaran++) {
    const res = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: PROMPT_DASAR },
        { role: "system", content: promptKonteks(user, hariIni) },
        ...riwayat,
      ],
      tools: DEFINISI_ALAT_OPENAI,
    });

    const pesan = res.choices[0].message;
    riwayat.push(pesan);
    const teks = (pesan.content ?? "").trim();

    // Hanya tool tipe "function" yang kita definisikan; abaikan tipe lain.
    const panggilan = (pesan.tool_calls ?? []).filter(
      (c): c is ChatCompletionMessageFunctionToolCall => c.type === "function"
    );
    if (panggilan.length === 0) return { messages: riwayat, balasan: teks };

    const aksi = panggilan.filter((c) => isAlatTulis(c.function.name));
    if (aksi.length > 0) {
      const c = aksi[0];
      return {
        messages: riwayat,
        balasan: teks,
        usulan: { toolUseId: c.id, nama: c.function.name, input: parseArg(c.function.arguments) },
      };
    }

    riwayat.push(...(await toolResult(panggilan, undefined, req)));
  }

  return { messages: riwayat, balasan: "Maaf, pencarian data terlalu panjang. Coba pertanyaan yang lebih spesifik." };
}
