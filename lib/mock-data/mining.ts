import type {
  MiningAsset,
  WeatherDay,
  MaintenanceTimeRow,
  MiningOperationData,
  MiningSite,
} from "@/lib/types";

export const MINING_SITES: MiningSite[] = [
  { id: "morowali", name: "Siumbatu", region: "Bahodopi, Morowali" },
  { id: "bahodopi-2", name: "Bahodopi Blok 2", region: "Morowali" },
];

export const MINING_KPI = {
  thisMonthTon: 245680,
  lastMonthTon: 232400,
  changePct: 5.7,
  commodity: "Bijih Nikel",
  totalVehicle: 24,
  underMaintenance: 3,
  fuelLiters: 184500,
};

export const MINING_ASSETS: MiningAsset[] = [
  // Operative
  { name: "Excavator Komatsu PC2000", code: "EXC-001", type: "Vehicle", status: "operative" },
  { name: "Excavator Hitachi EX1200", code: "EXC-002", type: "Vehicle", status: "operative" },
  { name: "Dump Truck Hino 500", code: "DT-1021", type: "Vehicle", status: "operative" },
  { name: "Dump Truck Scania P460", code: "DT-1044", type: "Vehicle", status: "operative" },
  { name: "Bulldozer CAT D8R", code: "BZR-007", type: "Vehicle", status: "operative" },
  { name: "Wheel Loader CAT 980", code: "WL-003", type: "Vehicle", status: "operative" },
  // Maintenance
  { name: "Dump Truck Mercedes Arocs", code: "DT-1099", type: "Vehicle", status: "maintenance" },
  { name: "Motor Grader CAT 140", code: "GRD-002", type: "Vehicle", status: "maintenance" },
  { name: "Genset Cummins 500kVA", code: "GEN-004", type: "Asset", status: "maintenance" },
  // Breakdown
  { name: "Excavator Volvo EC480", code: "EXC-005", type: "Vehicle", status: "breakdown" },
  { name: "Crane Tadano 50T", code: "CRN-001", type: "Asset", status: "breakdown" },
];

export const MINING_WEATHER: WeatherDay[] = [
  { day: "Hari ini", date: "27 Jun", condition: "Hujan Ringan", high: 29, low: 24, icon: "rain" },
  { day: "Sab", date: "28 Jun", condition: "Berawan", high: 30, low: 24, icon: "partly" },
  { day: "Min", date: "29 Jun", condition: "Hujan", high: 28, low: 23, icon: "rain" },
  { day: "Sen", date: "30 Jun", condition: "Berawan", high: 31, low: 24, icon: "cloud" },
  { day: "Sel", date: "01 Jul", condition: "Cerah Berawan", high: 32, low: 25, icon: "partly" },
  { day: "Rab", date: "02 Jul", condition: "Cerah", high: 33, low: 25, icon: "sun" },
  { day: "Kam", date: "03 Jul", condition: "Hujan Petir", high: 28, low: 23, icon: "storm" },
  { day: "Jum", date: "04 Jul", condition: "Berawan", high: 30, low: 24, icon: "partly" },
];

export const MAINTENANCE_TIME: MaintenanceTimeRow[] = [
  { asset: "Dump Truck Mercedes Arocs [DT-1099]", assetType: "Vehicle", duration: "06:30" },
  { asset: "Motor Grader CAT 140 [GRD-002]", assetType: "Vehicle", duration: "04:15" },
  { asset: "Excavator Volvo EC480 [EXC-005]", assetType: "Vehicle", duration: "12:40" },
  { asset: "Crane Tadano 50T [CRN-001]", assetType: "Asset", duration: "08:00" },
  { asset: "Genset Cummins 500kVA [GEN-004]", assetType: "Asset", duration: "03:20" },
];

// Data produksi per tab operasi
export const MINING_OPERATIONS: Record<string, MiningOperationData> = {
  extraction: {
    totalProduction: 245680,
    byAsset: [
      { asset: "Excavator Komatsu PC2000", code: "EXC-001", production: 58200 },
      { asset: "Excavator Hitachi EX1200", code: "EXC-002", production: 51400 },
      { asset: "Excavator Volvo EC480", code: "EXC-005", production: 33800 },
      { asset: "Wheel Loader CAT 980", code: "WL-003", production: 42600 },
      { asset: "Bulldozer CAT D8R", code: "BZR-007", production: 27300 },
    ],
    stripping: [
      { period: "Jan", ratio: 4.2 },
      { period: "Feb", ratio: 4.6 },
      { period: "Mar", ratio: 3.9 },
      { period: "Apr", ratio: 4.8 },
      { period: "Mei", ratio: 5.1 },
      { period: "Jun", ratio: 4.5 },
    ],
    perPit: [
      { pit: "Pit A", ore: 82000, waste: 360000 },
      { pit: "Pit B", ore: 68500, waste: 295000 },
      { pit: "Pit C", ore: 54200, waste: 248000 },
      { pit: "Pit D", ore: 40980, waste: 190000 },
    ],
  },
  hauling: {
    totalProduction: 238900,
    byAsset: [
      { asset: "Dump Truck Hino 500", code: "DT-1021", production: 62400 },
      { asset: "Dump Truck Scania P460", code: "DT-1044", production: 58900 },
      { asset: "Dump Truck Mercedes Arocs", code: "DT-1099", production: 41200 },
      { asset: "Dump Truck Hino 500 #2", code: "DT-1022", production: 45100 },
      { asset: "Dump Truck Scania P460 #2", code: "DT-1045", production: 31300 },
    ],
    stripping: [
      { period: "Jan", ratio: 4.0 },
      { period: "Feb", ratio: 4.3 },
      { period: "Mar", ratio: 4.1 },
      { period: "Apr", ratio: 4.6 },
      { period: "Mei", ratio: 4.9 },
      { period: "Jun", ratio: 4.4 },
    ],
    perPit: [
      { pit: "Pit A", ore: 79000, waste: 340000 },
      { pit: "Pit B", ore: 66000, waste: 280000 },
      { pit: "Pit C", ore: 52000, waste: 235000 },
      { pit: "Pit D", ore: 41900, waste: 182000 },
    ],
  },
  waste: {
    totalProduction: 1183000,
    byAsset: [
      { asset: "Excavator Komatsu PC2000", code: "EXC-001", production: 312000 },
      { asset: "Excavator Hitachi EX1200", code: "EXC-002", production: 286000 },
      { asset: "Bulldozer CAT D8R", code: "BZR-007", production: 245000 },
      { asset: "Wheel Loader CAT 980", code: "WL-003", production: 198000 },
      { asset: "Excavator Volvo EC480", code: "EXC-005", production: 142000 },
    ],
    stripping: [
      { period: "Jan", ratio: 4.2 },
      { period: "Feb", ratio: 4.6 },
      { period: "Mar", ratio: 3.9 },
      { period: "Apr", ratio: 4.8 },
      { period: "Mei", ratio: 5.1 },
      { period: "Jun", ratio: 4.5 },
    ],
    perPit: [
      { pit: "Pit A", ore: 0, waste: 360000 },
      { pit: "Pit B", ore: 0, waste: 295000 },
      { pit: "Pit C", ore: 0, waste: 248000 },
      { pit: "Pit D", ore: 0, waste: 190000 },
    ],
  },
  processing: {
    totalProduction: 241200,
    byAsset: [
      { asset: "Crusher Plant 1", code: "CRP-001", production: 92000 },
      { asset: "Crusher Plant 2", code: "CRP-002", production: 86500 },
      { asset: "Screening Unit A", code: "SCR-001", production: 38700 },
      { asset: "Screening Unit B", code: "SCR-002", production: 24000 },
    ],
    stripping: [
      { period: "Jan", ratio: 0 },
      { period: "Feb", ratio: 0 },
      { period: "Mar", ratio: 0 },
      { period: "Apr", ratio: 0 },
      { period: "Mei", ratio: 0 },
      { period: "Jun", ratio: 0 },
    ],
    perPit: [
      { pit: "Pit A", ore: 80500, waste: 0 },
      { pit: "Pit B", ore: 67000, waste: 0 },
      { pit: "Pit C", ore: 53700, waste: 0 },
      { pit: "Pit D", ore: 40000, waste: 0 },
    ],
  },
  smelter: {
    totalProduction: 228400,
    byAsset: [
      { asset: "Hauling Fleet A → Smelter IMIP", code: "HF-A", production: 124000 },
      { asset: "Hauling Fleet B → Smelter IMIP", code: "HF-B", production: 104400 },
    ],
    stripping: [
      { period: "Jan", ratio: 0 },
      { period: "Feb", ratio: 0 },
      { period: "Mar", ratio: 0 },
      { period: "Apr", ratio: 0 },
      { period: "Mei", ratio: 0 },
      { period: "Jun", ratio: 0 },
    ],
    perPit: [
      { pit: "Jetty 1", ore: 128000, waste: 0 },
      { pit: "Jetty 2", ore: 100400, waste: 0 },
    ],
  },
};

export const MINING_TABS = [
  { id: "extraction", label: "Extraction" },
  { id: "hauling", label: "Hauling" },
  { id: "waste", label: "Waste Removal" },
  { id: "processing", label: "Processing" },
  { id: "smelter", label: "Site to Smelter" },
];

// Daily production (untuk halaman Daily Production)
export const DAILY_PRODUCTION = [
  { date: "27 Jun 2026", pit: "Pit A", shift: "Day", ore: 2840, waste: 12200, fuel: 4200, operator: "Tim A1" },
  { date: "27 Jun 2026", pit: "Pit B", shift: "Day", ore: 2310, waste: 9800, fuel: 3650, operator: "Tim B1" },
  { date: "27 Jun 2026", pit: "Pit A", shift: "Night", ore: 2650, waste: 11400, fuel: 3980, operator: "Tim A2" },
  { date: "26 Jun 2026", pit: "Pit C", shift: "Day", ore: 1980, waste: 8600, fuel: 3120, operator: "Tim C1" },
  { date: "26 Jun 2026", pit: "Pit D", shift: "Day", ore: 1540, waste: 6900, fuel: 2740, operator: "Tim D1" },
  { date: "26 Jun 2026", pit: "Pit B", shift: "Night", ore: 2120, waste: 9100, fuel: 3380, operator: "Tim B2" },
];
