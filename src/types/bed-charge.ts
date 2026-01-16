// Bed charge types for billing

export interface BedChargePending {
  id: string;
  patientId: string;
  // From location (previous bed)
  fromBedId: string;
  fromBedName: string;
  fromRoomName: string;
  fromUnitName: string;
  fromTariff: number;
  // To location (new bed after transfer)
  toBedId: string;
  toBedName: string;
  toRoomName: string;
  toUnitName: string;
  toTariff: number;
  // Stay details
  admissionDate: string;
  transferDate: string;
  daysStayed: number;
  // Billing
  totalAmount: number; // daysStayed * fromTariff
  taxPct: number;
  // Status
  status: 'pending' | 'billed';
  createdAt: string;
  transferId?: string;
}

export interface PendingBedChargeService {
  id: string;
  type: 'bed_charge';
  bedCharge: BedChargePending;
  status: 'pending' | 'billed';
}
