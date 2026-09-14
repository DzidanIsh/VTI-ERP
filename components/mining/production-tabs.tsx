"use client";

import { Tabs } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductionBarChart, StrippingAreaChart, PerPitBarChart } from "@/components/charts/charts";
import { MINING_OPERATIONS, MINING_TABS } from "@/lib/mock-data/mining";
import { formatNumber } from "@/lib/utils";

export function ProductionTabs() {
  return (
    <Tabs tabs={MINING_TABS}>
      {(active) => {
        const op = MINING_OPERATIONS[active];
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Total Production</CardTitle>
                <span className="text-sm font-semibold text-brand-700">
                  {formatNumber(op.totalProduction)} ton
                </span>
              </CardHeader>
              <CardContent>
                <ProductionBarChart data={op.byAsset} />
              </CardContent>
            </Card>

            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Stripping Ratio</CardTitle>
                  <span className="text-xs text-slate-400">Waste : Ore (6 bulan)</span>
                </CardHeader>
                <CardContent>
                  <StrippingAreaChart data={op.stripping} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Production Per Pit</CardTitle>
                  <span className="text-xs text-slate-400">Ore vs Waste</span>
                </CardHeader>
                <CardContent>
                  <PerPitBarChart data={op.perPit} />
                </CardContent>
              </Card>
            </div>
          </div>
        );
      }}
    </Tabs>
  );
}
