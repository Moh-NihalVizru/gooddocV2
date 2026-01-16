// Types for Generate Interim Bill feature

export type BillMode = 'periodic' | 'cumulative';

export type RoundingOption = 'none' | 'nearest' | 'up';

export interface IncludeCharges {
  postedServices: boolean;
  roomBed: boolean;
  pharmacy: boolean;
  diagnostics: boolean;
  professional: boolean;
}

export interface ChargeLine {
  id: string;
  date: string;
  department: string;
  itemCode: string;
  itemName: string;
  qty: number;
  unit: string;
  unitPrice: number;
  tax: number;
  amount: number;
  payerSplit?: {
    patientPortion: number;
    insurerPortion: number;
  };
}

export interface RoomBedSegment {
  id: string;
  locationName: string;
  bedNumber: string;
  startAt: string;
  endAt: string | null; // null = ongoing
  durationText: string;
  dailyRate: number;
  amount: number;
}

export interface InterimPreviewTotals {
  gross: number;
  discount: number;
  tax: number;
  net: number;
  depositsApplied: number;
  previousInterimsPaid: number;
  estimatedNetDue: number;
}

export interface PayerSplitInfo {
  patientPortion: number;
  insurerPortion: number;
}

export interface InterimMeta {
  billId: string;
  billNumber: string;
  cutoffAt: string;
  netAmount: number;
  paidAmount: number;
}

export interface InterimPreviewResponse {
  lines: ChargeLine[];
  roomBedSegments: RoomBedSegment[];
  totals: InterimPreviewTotals;
  payerSplit?: PayerSplitInfo;
  deposits?: { applied: number; remaining: number };
  previousInterims?: InterimMeta[];
  warnings?: string[];
}

export interface GenerateInterimRequest {
  patientId: string;
  admissionId: string;
  cutoffAt: string;
  mode: BillMode;
  include: IncludeCharges;
  departmentIds: string[];
  includeOnlyPosted: boolean;
  payerId: string;
  rounding: RoundingOption;
  notes?: string;
}

export interface GenerateInterimResponse {
  billId: string;
  billNumber: string;
  status: 'generated';
}
