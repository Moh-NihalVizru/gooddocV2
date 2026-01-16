// Transfer history records for Room & Bed tab in Add Services

export type TransferStatus = 'completed' | 'ongoing' | 'scheduled';

export interface TransferHistoryRecord {
  id: string;
  patientId: string;
  // From location
  fromLocationId: string | null;
  fromLocationName: string | null;
  fromLocationType: 'ward' | 'icu' | 'private' | null;
  fromBedId: string | null;
  fromBedNumber: string | null;
  // To location  
  toLocationId: string;
  toLocationName: string;
  toLocationType: 'ward' | 'icu' | 'private';
  toBedId: string;
  toBedNumber: string;
  // Time
  startAt: string; // ISO8601
  endAt: string | null; // null = ongoing
  lastBilledAt: string | null; // Last billed date
  // Charge info
  dailyRate: number;
  chargeCode?: string;
  ratePlanId?: string;
  // Status
  status: TransferStatus;
  transferReason?: string;
}

// Helper to calculate duration in hours/days
export function calculateDuration(startAt: string, endAt: string | null): string {
  const start = new Date(startAt);
  const end = endAt ? new Date(endAt) : new Date();
  
  const diffMs = end.getTime() - start.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  const remainingHours = diffHours % 24;
  
  if (diffDays > 0) {
    return remainingHours > 0 
      ? `${diffDays}d ${remainingHours}h` 
      : `${diffDays}d`;
  }
  return `${diffHours}h`;
}

// Helper to calculate charge
export function calculateCharge(startAt: string, endAt: string | null, dailyRate: number): number | null {
  const start = new Date(startAt);
  const end = endAt ? new Date(endAt) : new Date();
  
  const diffMs = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  
  // Minimum 1 day charge
  return Math.max(1, diffDays) * dailyRate;
}

// Mock transfer history for patient MRN0105000
export const MOCK_TRANSFER_HISTORY: TransferHistoryRecord[] = [
  {
    id: 'TH-001',
    patientId: 'MRN0105000',
    // Initial admission - no "from"
    fromLocationId: null,
    fromLocationName: null,
    fromLocationType: null,
    fromBedId: null,
    fromBedNumber: null,
    // To Ward A
    toLocationId: 'unit-ward-a',
    toLocationName: 'Ward A',
    toLocationType: 'ward',
    toBedId: 'bed-wa-12',
    toBedNumber: 'Bed 12',
    // Time
    startAt: '2026-01-02T09:00:00',
    endAt: '2026-01-03T14:30:00',
    lastBilledAt: '2026-01-03T14:30:00',
    // Rate
    dailyRate: 2500,
    chargeCode: 'BED-WARD-A',
    ratePlanId: 'RP-001',
    status: 'completed',
    transferReason: 'Initial admission'
  },
  {
    id: 'TH-002',
    patientId: 'MRN0105000',
    // From Ward A
    fromLocationId: 'unit-ward-a',
    fromLocationName: 'Ward A',
    fromLocationType: 'ward',
    fromBedId: 'bed-wa-12',
    fromBedNumber: 'Bed 12',
    // To ICU
    toLocationId: 'unit-icu',
    toLocationName: 'ICU',
    toLocationType: 'icu',
    toBedId: 'bed-icu-3',
    toBedNumber: 'ICU-3',
    // Time
    startAt: '2026-01-03T14:30:00',
    endAt: '2026-01-04T10:10:00',
    lastBilledAt: '2026-01-04T10:10:00',
    // Rate
    dailyRate: 8500,
    chargeCode: 'BED-ICU',
    ratePlanId: 'RP-002',
    status: 'completed',
    transferReason: 'Clinical deterioration'
  },
  {
    id: 'TH-003',
    patientId: 'MRN0105000',
    // From ICU
    fromLocationId: 'unit-icu',
    fromLocationName: 'ICU',
    fromLocationType: 'icu',
    fromBedId: 'bed-icu-3',
    fromBedNumber: 'ICU-3',
    // To Private Room
    toLocationId: 'unit-private',
    toLocationName: 'Private Room',
    toLocationType: 'private',
    toBedId: 'bed-pr-201',
    toBedNumber: 'P-201',
    // Time - ongoing
    startAt: '2026-01-04T10:10:00',
    endAt: null,
    lastBilledAt: '2026-01-10T00:00:00',
    // Rate
    dailyRate: 5500,
    chargeCode: 'BED-PRIVATE',
    ratePlanId: 'RP-003',
    status: 'ongoing',
    transferReason: 'Step down care'
  }
];

// Get transfer history for a patient
export function getTransferHistoryForPatient(patientId: string): TransferHistoryRecord[] {
  return MOCK_TRANSFER_HISTORY.filter(t => t.patientId === patientId)
    .sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime());
}

// Get transfer by ID
export function getTransferById(transferId: string): TransferHistoryRecord | undefined {
  return MOCK_TRANSFER_HISTORY.find(t => t.id === transferId);
}
