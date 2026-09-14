import { PageHeader } from "@/components/shared/page-header";
import { BannerContoh } from "@/components/shared/banner-contoh";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { SUBMODUL, type KontenContoh } from "@/lib/mock-data/submodul";
import { findNavLabel } from "@/lib/nav";

/**
 * Halaman submodul berisi DATA CONTOH (arahan 2026-08-11: semua submodul
 * diisi dulu sesuai pemahaman, bukan ComingSoon kosong). Setiap halaman
 * memasang BannerContoh — angka karangan wajib menyatakan dirinya.
 * Konten per-href ada di lib/mock-data/submodul.ts; href tanpa entri
 * mendapat kartu deskripsi fungsi, bukan tabel kosong.
 */
export function HalamanContoh({ href }: { href: string }) {
  const k: KontenContoh | undefined = SUBMODUL[href];
  const judul = k?.judul ?? findNavLabel(href) ?? "Halaman";

  return (
    <div className="p-6">
      <PageHeader title={judul} description={k?.deskripsi ?? "Gambaran fungsi submodul ini"} />
      <BannerContoh catatan={k?.catatan} />

      {k?.kpi && (
        <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {k.kpi.map((x) => (
            <Card key={x.label}>
              <CardContent className="pt-5">
                <div className="text-xs font-medium uppercase tracking-wider text-slate-400">{x.label}</div>
                <div className="mt-1 text-2xl font-semibold text-slate-800">{x.value}</div>
                {x.sub && <div className="mt-0.5 text-xs text-slate-400">{x.sub}</div>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {k?.kolom && k?.baris ? (
        <Card>
          <CardHeader>
            <CardTitle>{k.tabelJudul ?? judul}</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-2">
            <Table>
              <THead>
                <TR className="hover:bg-transparent">
                  {k.kolom.map((c) => (
                    <TH key={c}>{c}</TH>
                  ))}
                </TR>
              </THead>
              <TBody>
                {k.baris.map((b, i) => (
                  <TR key={i}>
                    {b.map((sel, j) => (
                      <TD key={j} className={j === 0 ? "font-medium text-slate-700" : "text-slate-500"}>
                        {sel}
                      </TD>
                    ))}
                  </TR>
                ))}
              </TBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        !k && (
          <Card>
            <CardContent className="py-10 text-center text-sm text-slate-400">
              Submodul ini sudah direncanakan tetapi belum diberi konten contoh.
            </CardContent>
          </Card>
        )
      )}
    </div>
  );
}
