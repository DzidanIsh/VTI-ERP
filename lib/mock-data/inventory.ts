import type { InvKpi, AgeingPoint, LowStockItem } from "@/lib/types";

export const INVENTORY_KPI: InvKpi = {
  materialRequest: 36,
  inventoryAdjustment: 44,
  deliveryOrders: 433,
  receipts: 10100,
  lowStockAlert: 10,
  internalTransfer: 88,
};

export const INVENTORY_AGEING: AgeingPoint[] = [
  { category: "0–30 hari", current: 1240, previous: 1180 },
  { category: "31–60 hari", current: 980, previous: 1020 },
  { category: "61–90 hari", current: 640, previous: 720 },
  { category: "91–180 hari", current: 410, previous: 380 },
  { category: "> 180 hari", current: 230, previous: 290 },
];

export const INVENTORY_REPORT = [
  { month: "Jan", quantity: 182000 },
  { month: "Feb", quantity: 168000 },
  { month: "Mar", quantity: 201000 },
  { month: "Apr", quantity: 178000 },
  { month: "Mei", quantity: 224000 },
  { month: "Jun", quantity: 209000 },
];

export const LOW_STOCK: LowStockItem[] = [
  { sku: "SPR-0451", name: "Filter Solar Excavator PC2000", warehouse: "Gudang Sparepart", onHand: 4, min: 12, uom: "pcs" },
  { sku: "SPR-0892", name: "Ban Dump Truck 24.00 R35", warehouse: "Gudang Ban", onHand: 2, min: 8, uom: "pcs" },
  { sku: "FUEL-DSL", name: "Solar Industri (Bulk)", warehouse: "Fuel Storage", onHand: 18500, min: 40000, uom: "liter" },
  { sku: "SPR-1203", name: "Oli Hidrolik Shell Tellus 68", warehouse: "Gudang Pelumas", onHand: 36, min: 80, uom: "liter" },
  { sku: "SPR-0337", name: "Bucket Tooth Point Komatsu", warehouse: "Gudang Sparepart", onHand: 6, min: 20, uom: "pcs" },
];

export const RECENT_OPERATIONS = [
  { ref: "WH/IN/01245", type: "Receipt", partner: "PT Trakindo Utama", date: "27 Jun 2026", status: "Done" },
  { ref: "WH/OUT/04330", type: "Delivery", partner: "Smelter IMIP", date: "27 Jun 2026", status: "Ready" },
  { ref: "WH/INT/00881", type: "Internal Transfer", partner: "Gudang Pit A → Workshop", date: "26 Jun 2026", status: "Done" },
  { ref: "MR/00036", type: "Material Request", partner: "Dept. Maintenance", date: "26 Jun 2026", status: "Waiting" },
  { ref: "WH/IN/01244", type: "Receipt", partner: "PT United Tractors", date: "25 Jun 2026", status: "Done" },
];
