import { BedChargePending } from "@/types/bed-charge";
import { differenceInDays } from "date-fns";

// Mock pending bed charges for patients who have been transferred
export const MOCK_PENDING_BED_CHARGES: BedChargePending[] = [
  {
    id: 'BED-CHG-001',
    patientId: 'MRN0105000',
    // From location
    fromBedId: 'bed-wa-3',
    fromBedName: 'WA-102-1',
    fromRoomName: 'Room 102',
    fromUnitName: 'Ward A',
    fromTariff: 3500,
    // To location
    toBedId: 'bed-wa-1',
    toBedName: 'WA-101-1',
    toRoomName: 'Room 101',
    toUnitName: 'Ward A',
    toTariff: 3000,
    // Stay details
    admissionDate: '2025-12-18T10:00:00',
    transferDate: '2025-12-22T14:30:00',
    daysStayed: 4,
    // Billing
    totalAmount: 14000, // 4 days * 3500
    taxPct: 12,
    // Status
    status: 'pending',
    createdAt: '2025-12-22T14:30:00',
    transferId: 'TR-001',
  },
];

// In-memory store for new bed charges (simulating database)
let pendingBedCharges: BedChargePending[] = [...MOCK_PENDING_BED_CHARGES];

export function getPendingBedChargesForPatient(patientId: string): BedChargePending[] {
  return pendingBedCharges.filter(
    (bc) => bc.patientId === patientId && bc.status === 'pending'
  );
}

export function addPendingBedCharge(charge: BedChargePending): void {
  pendingBedCharges.push(charge);
}

export function markBedChargeAsBilled(chargeId: string): void {
  const charge = pendingBedCharges.find((bc) => bc.id === chargeId);
  if (charge) {
    charge.status = 'billed';
  }
}

export function calculateBedCharge(
  fromTariff: number,
  admissionDate: string,
  transferDate: string
): { daysStayed: number; totalAmount: number } {
  const admission = new Date(admissionDate);
  const transfer = new Date(transferDate);
  
  // Calculate days - minimum 1 day
  let daysStayed = differenceInDays(transfer, admission);
  if (daysStayed < 1) daysStayed = 1;
  
  const totalAmount = daysStayed * fromTariff;
  
  return { daysStayed, totalAmount };
}

export function createBedChargeFromTransfer(
  patientId: string,
  fromBedId: string,
  fromBedName: string,
  fromRoomName: string,
  fromUnitName: string,
  fromTariff: number,
  toBedId: string,
  toBedName: string,
  toRoomName: string,
  toUnitName: string,
  toTariff: number,
  admissionDate: string,
  transferId?: string
): BedChargePending {
  const transferDate = new Date().toISOString();
  const { daysStayed, totalAmount } = calculateBedCharge(fromTariff, admissionDate, transferDate);
  
  const charge: BedChargePending = {
    id: `BED-CHG-${Date.now().toString().slice(-6)}`,
    patientId,
    fromBedId,
    fromBedName,
    fromRoomName,
    fromUnitName,
    fromTariff,
    toBedId,
    toBedName,
    toRoomName,
    toUnitName,
    toTariff,
    admissionDate,
    transferDate,
    daysStayed,
    totalAmount,
    taxPct: 12,
    status: 'pending',
    createdAt: transferDate,
    transferId,
  };
  
  addPendingBedCharge(charge);
  
  return charge;
}
