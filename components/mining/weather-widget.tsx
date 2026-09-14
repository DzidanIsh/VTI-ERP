import { Sun, Cloud, CloudSun, CloudRain, CloudLightning, Wind, Droplets, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { MINING_WEATHER } from "@/lib/mock-data/mining";
import type { WeatherDay } from "@/lib/types";

const ICONS: Record<WeatherDay["icon"], { Icon: LucideIcon; color: string }> = {
  sun: { Icon: Sun, color: "text-amber-500" },
  cloud: { Icon: Cloud, color: "text-slate-400" },
  partly: { Icon: CloudSun, color: "text-amber-400" },
  rain: { Icon: CloudRain, color: "text-sky-500" },
  storm: { Icon: CloudLightning, color: "text-violet-500" },
};

export function WeatherWidget() {
  const today = MINING_WEATHER[0];
  const { Icon } = ICONS[today.icon];

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between bg-gradient-to-r from-amber-400 to-amber-300 px-5 py-3">
        <div>
          <p className="text-sm font-semibold text-amber-950">Cuaca — Bahodopi, Morowali</p>
          <p className="text-xs text-amber-900/80">Integrasi OpenWeather (real-time)</p>
        </div>
        <span className="rounded-full bg-white/70 px-2.5 py-1 text-[11px] font-semibold text-amber-900">
          OpenWeather
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-6 px-5 py-4">
        <div className="flex items-center gap-3">
          <Icon className={`h-14 w-14 ${ICONS[today.icon].color}`} />
          <div>
            <div className="text-4xl font-bold tracking-tight text-slate-800">{today.high}°C</div>
            <div className="text-sm text-slate-500">{today.condition}</div>
          </div>
        </div>
        <div className="flex flex-col gap-1.5 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <Wind className="h-3.5 w-3.5" /> Angin 4.0 m/s — sepoi
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Droplets className="h-3.5 w-3.5" /> Kelembapan 82% — risiko hujan
          </span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-px border-t border-slate-100 bg-slate-100 sm:grid-cols-8">
        {MINING_WEATHER.map((d) => {
          const { Icon: DIcon, color } = ICONS[d.icon];
          return (
            <div key={d.date} className="flex flex-col items-center gap-1 bg-white px-1 py-3">
              <span className="text-[11px] font-medium text-slate-500">{d.day}</span>
              <span className="text-[10px] text-slate-400">{d.date}</span>
              <DIcon className={`my-0.5 h-6 w-6 ${color}`} />
              <span className="text-xs font-semibold text-slate-700">{d.high}°</span>
              <span className="text-[10px] text-slate-400">{d.low}°</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
