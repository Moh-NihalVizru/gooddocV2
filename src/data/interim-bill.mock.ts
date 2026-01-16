// Mock data for Generate Interim Bill feature

import { ChargeLine, RoomBedSegment, InterimPreviewResponse, InterimPreviewTotals, InterimMeta } from "@/types/interim-bill";

// Mock charge lines for preview
export const MOCK_CHARGE_LINES: ChargeLine[] = [
  // Posted Services
  {
    id: "CL-001",
    date: "02 Jan 2026, 10:00",
    department: "General Medicine",
    itemCode: "CONS-GM",
    itemName: "Physician Consultation",
    qty: 1,
    unit: "visit",
    unitPrice: 1500,
    tax: 0,
    amount: 1500,
  },
  {
    id: "CL-002",
    date: "03 Jan 2026, 09:00",
    department: "General Medicine",
    itemCode: "CONS-FU",
    itemName: "Follow-up Visit",
    qty: 2,
    unit: "visit",
    unitPrice: 500,
    tax: 0,
    amount: 1000,
  },
  // Diagnostics
  {
    id: "CL-003",
    date: "02 Jan 2026, 11:00",
    department: "Laboratory",
    itemCode: "LAB-CBC",
    itemName: "Complete Blood Count",
    qty: 1,
    unit: "test",
    unitPrice: 400,
    tax: 20,
    amount: 420,
  },
  {
    id: "CL-004",
    date: "02 Jan 2026, 11:15",
    department: "Laboratory",
    itemCode: "LAB-LFT",
    itemName: "Liver Function Test",
    qty: 1,
    unit: "test",
    unitPrice: 850,
    tax: 42.50,
    amount: 892.50,
  },
  {
    id: "CL-005",
    date: "03 Jan 2026, 14:00",
    department: "Radiology",
    itemCode: "RAD-XRAY",
    itemName: "Chest X-Ray (PA View)",
    qty: 1,
    unit: "exam",
    unitPrice: 450,
    tax: 22.50,
    amount: 472.50,
  },
  // Pharmacy
  {
    id: "CL-006",
    date: "02 Jan 2026, 12:00",
    department: "Pharmacy",
    itemCode: "PHARM-001",
    itemName: "Medicines & Drugs",
    qty: 1,
    unit: "lot",
    unitPrice: 1250,
    tax: 62.50,
    amount: 1312.50,
  },
  {
    id: "CL-007",
    date: "03 Jan 2026, 18:00",
    department: "Pharmacy",
    itemCode: "PHARM-002",
    itemName: "IV Fluids & Consumables",
    qty: 1,
    unit: "lot",
    unitPrice: 650,
    tax: 32.50,
    amount: 682.50,
  },
  // Professional Fees
  {
    id: "CL-008",
    date: "03 Jan 2026, 09:30",
    department: "Nursing",
    itemCode: "NURS-001",
    itemName: "Nursing Charges",
    qty: 2,
    unit: "day",
    unitPrice: 400,
    tax: 0,
    amount: 800,
  },
];

// Mock room/bed segments
export const MOCK_ROOM_BED_SEGMENTS: RoomBedSegment[] = [
  {
    id: "RBS-001",
    locationName: "Ward A",
    bedNumber: "Bed 12",
    startAt: "2026-01-02T09:00:00",
    endAt: "2026-01-03T14:30:00",
    durationText: "1d 5h",
    dailyRate: 2500,
    amount: 5000, // 2 days prorated
  },
  {
    id: "RBS-002",
    locationName: "ICU",
    bedNumber: "ICU-3",
    startAt: "2026-01-03T14:30:00",
    endAt: "2026-01-04T10:10:00",
    durationText: "19h",
    dailyRate: 8500,
    amount: 8500, // 1 day minimum
  },
  {
    id: "RBS-003",
    locationName: "Private Room",
    bedNumber: "P-201",
    startAt: "2026-01-04T10:10:00",
    endAt: null, // ongoing
    durationText: "Ongoing",
    dailyRate: 5500,
    amount: 5500, // 1 day so far
  },
];

// Mock previous interims
export const MOCK_PREVIOUS_INTERIMS: InterimMeta[] = [
  {
    billId: "IB-001",
    billNumber: "IB-2026-0001",
    cutoffAt: "2026-01-03T12:00:00",
    netAmount: 8500,
    paidAmount: 8500,
  },
];

// Calculate totals from lines and segments
function calculateTotals(
  lines: ChargeLine[],
  segments: RoomBedSegment[],
  previousInterims: InterimMeta[]
): InterimPreviewTotals {
  const linesGross = lines.reduce((sum, l) => sum + l.unitPrice * l.qty, 0);
  const linesTax = lines.reduce((sum, l) => sum + l.tax, 0);
  const roomGross = segments.reduce((sum, s) => sum + s.amount, 0);
  
  const gross = linesGross + roomGross;
  const discount = 500; // Mock discount
  const tax = linesTax;
  const net = gross - discount + tax;
  
  const depositsApplied = 3000; // Mock advance
  const previousInterimsPaid = previousInterims.reduce((sum, i) => sum + i.paidAmount, 0);
  const estimatedNetDue = net - depositsApplied;
  
  return {
    gross,
    discount,
    tax,
    net,
    depositsApplied,
    previousInterimsPaid,
    estimatedNetDue,
  };
}

// Mock fetch eligible charges
export async function mockFetchEligibleCharges(
  _patientId: string,
  _admissionId: string,
  _cutoffAt: string,
  include: {
    postedServices: boolean;
    roomBed: boolean;
    pharmacy: boolean;
    diagnostics: boolean;
    professional: boolean;
  },
  _departmentIds: string[],
  _includeOnlyPosted: boolean,
  _mode: 'periodic' | 'cumulative',
  _payerId: string
): Promise<InterimPreviewResponse> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Filter lines based on include flags
  let filteredLines = [...MOCK_CHARGE_LINES];
  
  if (!include.postedServices) {
    filteredLines = filteredLines.filter(l => !['CONS-GM', 'CONS-FU'].includes(l.itemCode));
  }
  if (!include.pharmacy) {
    filteredLines = filteredLines.filter(l => l.department !== 'Pharmacy');
  }
  if (!include.diagnostics) {
    filteredLines = filteredLines.filter(l => !['Laboratory', 'Radiology'].includes(l.department));
  }
  if (!include.professional) {
    filteredLines = filteredLines.filter(l => l.department !== 'Nursing');
  }
  
  const segments = include.roomBed ? MOCK_ROOM_BED_SEGMENTS : [];
  const previousInterims = MOCK_PREVIOUS_INTERIMS;
  
  return {
    lines: filteredLines,
    roomBedSegments: segments,
    totals: calculateTotals(filteredLines, segments, previousInterims),
    payerSplit: {
      patientPortion: 20,
      insurerPortion: 80,
    },
    deposits: {
      applied: 3000,
      remaining: 200,
    },
    previousInterims,
    warnings: filteredLines.length === 0 ? ["No eligible items up to selected cutoff."] : undefined,
  };
}

// Mock generate interim bill
export async function mockGenerateInterimBill(
  _request: {
    patientId: string;
    admissionId: string;
    cutoffAt: string;
    mode: 'periodic' | 'cumulative';
    include: {
      postedServices: boolean;
      roomBed: boolean;
      pharmacy: boolean;
      diagnostics: boolean;
      professional: boolean;
    };
    departmentIds: string[];
    includeOnlyPosted: boolean;
    payerId: string;
    rounding: 'none' | 'nearest' | 'up';
    notes?: string;
  }
): Promise<{ billId: string; billNumber: string; status: 'generated' }> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  const billNumber = `IB-2026-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`;
  
  return {
    billId: `IB-${Date.now()}`,
    billNumber,
    status: 'generated',
  };
}

// Mock departments for filter
export const MOCK_DEPARTMENTS = [
  { id: 'dept-gm', name: 'General Medicine' },
  { id: 'dept-card', name: 'Cardiology' },
  { id: 'dept-lab', name: 'Laboratory' },
  { id: 'dept-rad', name: 'Radiology' },
  { id: 'dept-pharm', name: 'Pharmacy' },
  { id: 'dept-nurs', name: 'Nursing' },
];

// Mock payers
export const MOCK_PAYERS = [
  { id: 'SELF', name: 'Self Pay', isDefault: true },
  { id: 'INS-STAR', name: 'Star Health Insurance', isDefault: false },
  { id: 'INS-ICICI', name: 'ICICI Lombard', isDefault: false },
];
