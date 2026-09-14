// ============ Shared ============
export type AssetStatus = "maintenance" | "operative" | "breakdown";

// ============ Modul dummy (data contoh — dari draga/main) ============
export interface AssetRow {
  code: string;
  name: string;
  category: string;
  status: AssetStatus;
  bookValue: number;
}
export interface SalesOrderRow {
  no: string;
  customer: string;
  date: string;
  total: number;
  status: "Quotation" | "Sales Order" | "Invoiced" | "Done";
}
export interface InvoiceRow {
  no: string;
  partner: string;
  due: string;
  amount: number;
  status: "Draft" | "Posted" | "Paid" | "Overdue";
}
export interface PurchaseOrderRow {
  no: string;
  vendor: string;
  date: string;
  total: number;
  status: "RFQ" | "PO" | "Received" | "Billed";
}
export interface InvKpi {
  materialRequest: number;
  inventoryAdjustment: number;
  deliveryOrders: number;
  receipts: number;
  lowStockAlert: number;
  internalTransfer: number;
}
export interface AgeingPoint {
  category: string;
  current: number;
  previous: number;
}
export interface LowStockItem {
  sku: string;
  name: string;
  warehouse: string;
  onHand: number;
  min: number;
  uom: string;
}

// ============ Mining ============
export interface MiningAsset {
  name: string;
  code: string;
  type: "Vehicle" | "Asset";
  status: AssetStatus;
}

export interface WeatherDay {
  day: string;
  date: string;
  condition: string;
  high: number;
  low: number;
  icon: "sun" | "cloud" | "partly" | "rain" | "storm";
}

export interface ProductionByAsset {
  asset: string;
  code: string;
  production: number; // ton
}

export interface MaintenanceTimeRow {
  asset: string;
  assetType: "Vehicle" | "Asset";
  duration: string; // HH:MM
}

export interface PitProduction {
  pit: string;
  ore: number;
  waste: number;
}

export interface StrippingPoint {
  period: string;
  ratio: number;
}

export interface MiningOperationData {
  totalProduction: number;
  byAsset: ProductionByAsset[];
  stripping: StrippingPoint[];
  perPit: PitProduction[];
}

export interface MiningSite {
  id: string;
  name: string;
  region: string;
}

