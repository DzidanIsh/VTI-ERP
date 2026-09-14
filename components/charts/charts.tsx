"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { compactNumber, formatNumber } from "@/lib/utils";

const AXIS = { fontSize: 11, fill: "#94a3b8" };
const GRID = "#eef2f6";

function tipStyle() {
  return {
    contentStyle: {
      borderRadius: 10,
      border: "1px solid #e2e8f0",
      boxShadow: "0 4px 12px -2px rgb(16 24 40 / 0.12)",
      fontSize: 12,
    },
    labelStyle: { color: "#0f172a", fontWeight: 600 },
  };
}

// ---- Mining: Total Production per asset (vertical bars) ----
export function ProductionBarChart({
  data,
}: {
  data: { asset: string; code: string; production: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis dataKey="code" tick={AXIS} tickLine={false} axisLine={{ stroke: GRID }} />
        <YAxis tick={AXIS} tickLine={false} axisLine={false} tickFormatter={(v) => compactNumber(v)} />
        <Tooltip
          {...tipStyle()}
          formatter={(v: any) => [formatNumber(v) + " t", "Produksi"]}
          labelFormatter={(label, p) => p?.[0]?.payload?.asset ?? label}
        />
        <Bar dataKey="production" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={56} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ---- Mining: Stripping ratio (area) ----
export function StrippingAreaChart({ data }: { data: { period: string; ratio: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
        <defs>
          <linearGradient id="grad-strip" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis dataKey="period" tick={AXIS} tickLine={false} axisLine={{ stroke: GRID }} />
        <YAxis tick={AXIS} tickLine={false} axisLine={false} />
        <Tooltip {...tipStyle()} formatter={(v: any) => [Number(v).toFixed(1) + " : 1", "SR"]} />
        <Area type="monotone" dataKey="ratio" stroke="#f59e0b" strokeWidth={2.5} fill="url(#grad-strip)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ---- Mining: Production per pit (stacked ore vs waste) ----
export function PerPitBarChart({ data }: { data: { pit: string; ore: number; waste: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis dataKey="pit" tick={AXIS} tickLine={false} axisLine={{ stroke: GRID }} />
        <YAxis tick={AXIS} tickLine={false} axisLine={false} tickFormatter={(v) => compactNumber(v)} />
        <Tooltip {...tipStyle()} formatter={(v: any, n: any) => [formatNumber(v) + " t", n === "ore" ? "Ore" : "Waste"]} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="ore" name="Ore" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} maxBarSize={48} />
        <Bar dataKey="waste" name="Waste" stackId="a" fill="#cbd5e1" radius={[6, 6, 0, 0]} maxBarSize={48} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ---- Inventory: ageing grouped bars ----
export function AgeingBarChart({
  data,
}: {
  data: { category: string; current: number; previous: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis dataKey="category" tick={{ ...AXIS, fontSize: 10 }} tickLine={false} axisLine={{ stroke: GRID }} />
        <YAxis tick={AXIS} tickLine={false} axisLine={false} tickFormatter={(v) => compactNumber(v)} />
        <Tooltip {...tipStyle()} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="previous" name="Bulan lalu" fill="#cbd5e1" radius={[4, 4, 0, 0]} maxBarSize={26} />
        <Bar dataKey="current" name="Bulan ini" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={26} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ---- Generic single-series trend (line) ----
export function TrendLineChart({
  data,
  dataKey,
  xKey = "month",
  color = "#10b981",
  height = 240,
  unit = "",
}: {
  data: Record<string, number | string>[];
  dataKey: string;
  xKey?: string;
  color?: string;
  height?: number;
  unit?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
        <defs>
          <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis dataKey={xKey} tick={AXIS} tickLine={false} axisLine={{ stroke: GRID }} />
        <YAxis tick={AXIS} tickLine={false} axisLine={false} />
        <Tooltip {...tipStyle()} formatter={(v: any) => [v + unit, dataKey]} />
        <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2.5} fill={`url(#grad-${dataKey})`} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ---- Dashboard Master: pembanding dua metrik, dua sumbu Y ----
// Sumbu terpisah karena skalanya bisa jauh berbeda (liter BBM vs jumlah rit).
export function BandingLineChart({
  data,
  namaA,
  namaB,
}: {
  data: { tanggal: string; a: number; b: number }[];
  namaA: string;
  namaB: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis
          dataKey="tanggal"
          tick={AXIS}
          tickLine={false}
          axisLine={{ stroke: GRID }}
          tickFormatter={(v: string) => v.slice(5)}
        />
        <YAxis yAxisId="kiri" tick={AXIS} tickLine={false} axisLine={false} />
        <YAxis yAxisId="kanan" orientation="right" tick={AXIS} tickLine={false} axisLine={false} />
        <Tooltip {...tipStyle()} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
        <Line yAxisId="kiri" type="monotone" dataKey="a" name={namaA} stroke="#0a723b" strokeWidth={2.5} dot={false} />
        <Line yAxisId="kanan" type="monotone" dataKey="b" name={namaB} stroke="#f59e0b" strokeWidth={2.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ---- Accounting: dual line cashflow ----
export function DualLineChart({
  data,
}: {
  data: { month: string; inflow: number; outflow: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
        <XAxis dataKey="month" tick={AXIS} tickLine={false} axisLine={{ stroke: GRID }} />
        <YAxis tick={AXIS} tickLine={false} axisLine={false} tickFormatter={(v) => "Rp" + v + "M"} />
        <Tooltip {...tipStyle()} formatter={(v: any, n: any) => ["Rp" + v + " M", n === "inflow" ? "Masuk" : "Keluar"]} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
        <Line type="monotone" dataKey="inflow" name="Kas Masuk" stroke="#10b981" strokeWidth={2.5} dot={false} />
        <Line type="monotone" dataKey="outflow" name="Kas Keluar" stroke="#f43f5e" strokeWidth={2.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ---- Generic donut ----
export function CategoryDonut({
  data,
  height = 240,
}: {
  data: { segment?: string; category?: string; value: number; color?: string }[];
  height?: number;
}) {
  const palette = ["#059669", "#10b981", "#34d399", "#6ee7bf", "#a7f3da", "#f59e0b"];
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey={data[0]?.segment ? "segment" : "category"}
          innerRadius={58}
          outerRadius={88}
          paddingAngle={2}
        >
          {data.map((d, i) => (
            <Cell key={i} fill={d.color ?? palette[i % palette.length]} />
          ))}
        </Pie>
        <Tooltip {...tipStyle()} formatter={(v: any) => formatNumber(v)} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

// ---- Generic horizontal bars (spend by category) ----
export function HorizontalBarChart({
  data,
  height = 240,
}: {
  data: { category: string; value: number }[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart layout="vertical" data={data} margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={GRID} horizontal={false} />
        <XAxis type="number" tick={AXIS} tickLine={false} axisLine={false} tickFormatter={(v) => compactNumber(v)} />
        <YAxis type="category" dataKey="category" tick={{ ...AXIS, fontSize: 11 }} tickLine={false} axisLine={false} width={110} />
        <Tooltip {...tipStyle()} formatter={(v: any) => "Rp" + compactNumber(v)} />
        <Bar dataKey="value" fill="#10b981" radius={[0, 6, 6, 0]} maxBarSize={22} />
      </BarChart>
    </ResponsiveContainer>
  );
}
