import type { SalesOrderRow, InvoiceRow, PurchaseOrderRow, AssetRow } from "@/lib/types";

// ============ Asset Management ============
export const ASSET_KPI = {
  totalAssets: 142,
  operative: 118,
  maintenance: 17,
  breakdown: 7,
  totalBookValue: 184_500_000_000,
  dueMaintenance: 9,
};

export const ASSET_ROWS: AssetRow[] = [
  { code: "EXC-001", name: "Excavator Komatsu PC2000", category: "Alat Berat", status: "operative", bookValue: 18_200_000_000 },
  { code: "DT-1021", name: "Dump Truck Hino 500", category: "Kendaraan", status: "operative", bookValue: 2_400_000_000 },
  { code: "EXC-005", name: "Excavator Volvo EC480", category: "Alat Berat", status: "breakdown", bookValue: 9_800_000_000 },
  { code: "GRD-002", name: "Motor Grader CAT 140", category: "Alat Berat", status: "maintenance", bookValue: 6_300_000_000 },
  { code: "CRN-001", name: "Crane Tadano 50T", category: "Alat Berat", status: "breakdown", bookValue: 7_100_000_000 },
];

export const ASSET_CATEGORY = [
  { category: "Alat Berat", value: 132_000_000_000 },
  { category: "Kendaraan", value: 28_400_000_000 },
  { category: "Genset & Plant", value: 18_900_000_000 },
  { category: "Bangunan & Sarana", value: 5_200_000_000 },
];

// ============ CRM Sales ============
export const SALES_KPI = {
  revenueThisMonth: 48_600_000_000,
  openQuotations: 14,
  salesOrders: 27,
  conversionRate: 62,
};

export const SALES_TREND = [
  { month: "Jan", revenue: 38.2 },
  { month: "Feb", revenue: 41.5 },
  { month: "Mar", revenue: 44.0 },
  { month: "Apr", revenue: 39.8 },
  { month: "Mei", revenue: 46.3 },
  { month: "Jun", revenue: 48.6 },
];

export const SALES_ORDERS: SalesOrderRow[] = [
  { no: "SO/2606/001", customer: "PT IMIP (Smelter)", date: "26 Jun 2026", total: 12_400_000_000, status: "Sales Order" },
  { no: "SO/2606/002", customer: "PT Vale Indonesia", date: "25 Jun 2026", total: 8_900_000_000, status: "Invoiced" },
  { no: "QO/2606/014", customer: "PT Gunbuster Nickel", date: "24 Jun 2026", total: 5_600_000_000, status: "Quotation" },
  { no: "SO/2606/003", customer: "PT Tsingshan", date: "23 Jun 2026", total: 15_200_000_000, status: "Done" },
  { no: "QO/2606/013", customer: "PT Indonesia Morowali", date: "22 Jun 2026", total: 3_100_000_000, status: "Quotation" },
];

export const RFM_SEGMENTS = [
  { segment: "Champion", value: 6, color: "#059669" },
  { segment: "Loyal", value: 9, color: "#10b981" },
  { segment: "Potential", value: 7, color: "#34d399" },
  { segment: "Needs Attention", value: 5, color: "#f59e0b" },
  { segment: "Sleeping", value: 4, color: "#f43f5e" },
];

// ============ Accounting ============
export const ACCOUNTING_KPI = {
  cashBalance: 62_400_000_000,
  receivable: 38_900_000_000,
  payable: 24_100_000_000,
  netProfitMonth: 14_700_000_000,
};

export const CASHFLOW_TREND = [
  { month: "Jan", inflow: 42, outflow: 31 },
  { month: "Feb", inflow: 45, outflow: 34 },
  { month: "Mar", inflow: 48, outflow: 33 },
  { month: "Apr", inflow: 41, outflow: 36 },
  { month: "Mei", inflow: 50, outflow: 35 },
  { month: "Jun", inflow: 53, outflow: 38 },
];

export const INVOICES: InvoiceRow[] = [
  { no: "INV/2606/101", partner: "PT IMIP (Smelter)", due: "10 Jul 2026", amount: 12_400_000_000, status: "Posted" },
  { no: "INV/2606/098", partner: "PT Vale Indonesia", due: "05 Jul 2026", amount: 8_900_000_000, status: "Paid" },
  { no: "BILL/2606/044", partner: "PT Trakindo Utama", due: "30 Jun 2026", amount: 3_200_000_000, status: "Overdue" },
  { no: "INV/2606/095", partner: "PT Tsingshan", due: "12 Jul 2026", amount: 15_200_000_000, status: "Posted" },
  { no: "BILL/2606/041", partner: "Pertamina Patra Niaga", due: "28 Jun 2026", amount: 4_600_000_000, status: "Draft" },
];

// ============ Purchase ============
export const PURCHASE_KPI = {
  openRfq: 11,
  purchaseOrders: 29,
  spendThisMonth: 21_300_000_000,
  pendingApproval: 6,
};

export const PURCHASE_SPEND = [
  { category: "BBM & Pelumas", value: 9_200_000_000 },
  { category: "Sparepart", value: 5_400_000_000 },
  { category: "Jasa Kontraktor", value: 3_800_000_000 },
  { category: "Logistik", value: 1_700_000_000 },
  { category: "Lainnya", value: 1_200_000_000 },
];

export const PURCHASE_ORDERS: PurchaseOrderRow[] = [
  { no: "PO/2606/210", vendor: "Pertamina Patra Niaga", date: "26 Jun 2026", total: 6_800_000_000, status: "PO" },
  { no: "PO/2606/208", vendor: "PT Trakindo Utama", date: "25 Jun 2026", total: 2_400_000_000, status: "Received" },
  { no: "RFQ/2606/061", vendor: "PT United Tractors", date: "24 Jun 2026", total: 1_900_000_000, status: "RFQ" },
  { no: "PO/2606/205", vendor: "PT Shell Indonesia", date: "23 Jun 2026", total: 1_350_000_000, status: "Billed" },
  { no: "RFQ/2606/060", vendor: "PT Hexindo Adiperkasa", date: "22 Jun 2026", total: 3_200_000_000, status: "RFQ" },
];
