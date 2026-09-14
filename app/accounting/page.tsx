import { Wallet, ArrowDownCircle, ArrowUpCircle, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { BannerContoh } from "@/components/shared/banner-contoh";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { DualLineChart } from "@/components/charts/charts";
import { ACCOUNTING_KPI, CASHFLOW_TREND, INVOICES } from "@/lib/mock-data/modules";
import { compactNumber } from "@/lib/utils";
import type { InvoiceRow } from "@/lib/types";

const invBadge: Record<InvoiceRow["status"], "slate" | "sky" | "operative" | "rose"> = {
  Draft: "slate",
  Posted: "sky",
  Paid: "operative",
  Overdue: "rose",
};

export default function AccountingDashboardPage() {
  return (
    <div className="p-6">
      <PageHeader title="Accounting Dashboard" description="Posisi keuangan & arus kas" />

      <BannerContoh />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Saldo Kas & Bank" value={`Rp${compactNumber(ACCOUNTING_KPI.cashBalance)}`} sub="BCA · CIMB · Petty cash" icon={Wallet} accent="brand" />
        <StatCard label="Piutang (AR)" value={`Rp${compactNumber(ACCOUNTING_KPI.receivable)}`} sub="Belum tertagih" icon={ArrowDownCircle} accent="sky" />
        <StatCard label="Hutang (AP)" value={`Rp${compactNumber(ACCOUNTING_KPI.payable)}`} sub="Belum dibayar" icon={ArrowUpCircle} accent="amber" />
        <StatCard label="Laba Bersih Bulan Ini" value={`Rp${compactNumber(ACCOUNTING_KPI.netProfitMonth)}`} sub="Net profit" icon={TrendingUp} accent="violet" trend={{ value: "8,2% MoM", up: true }} />
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Arus Kas</CardTitle>
          <span className="text-xs text-slate-400">Kas masuk vs keluar (Rp Miliar)</span>
        </CardHeader>
        <CardContent>
          <DualLineChart data={CASHFLOW_TREND} />
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Invoice & Tagihan Terbaru</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-2">
          <Table>
            <THead>
              <TR className="hover:bg-transparent">
                <TH>No.</TH>
                <TH>Partner</TH>
                <TH>Jatuh Tempo</TH>
                <TH className="text-right">Nominal</TH>
                <TH>Status</TH>
              </TR>
            </THead>
            <TBody>
              {INVOICES.map((inv) => (
                <TR key={inv.no}>
                  <TD className="font-mono text-[12px] text-slate-600">{inv.no}</TD>
                  <TD className="font-medium text-slate-700">{inv.partner}</TD>
                  <TD className="text-slate-500">{inv.due}</TD>
                  <TD className="text-right font-semibold text-slate-700">Rp{compactNumber(inv.amount)}</TD>
                  <TD>
                    <Badge variant={invBadge[inv.status]}>{inv.status}</Badge>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
