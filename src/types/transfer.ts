export type TransferType = 'intra_ward' | 'ward_to_icu' | 'icu_to_stepdown' | 'ward_to_ward' | 'room_change' | 'bed_swap';

export type TransferPriority = 'stat' | 'urgent' | 'routine';

export type TransferReason = 
  | 'clinical_deterioration'
  | 'procedure'
  | 'step_up_care'
  | 'step_down_care'
  | 'isolation_need'
  | 'special_equipment'
  | 'patient_preference'
  | 'other';

export type TransferStatus = 
  | 'draft'
  | 'requested'
  | 'held'
  | 'scheduled'
  | 'en_route'
  | 'completed'
  | 'cancelled';

export type BedStatus = 'available' | 'occupied' | 'cleaning' | 'hold' | 'out_of_service';

export type BedFeature = 
  | 'icu_capable'
  | 'isolation'
  | 'oxygen'
  | 'ventilator'
  | 'negative_pressure'
  | 'cardiac_monitor'
  | 'telemetry';

export interface BedLocation {
  unitId: string;
  unitName: string;
  roomId: string;
  roomName: string;
  bedId: string;
  bedName: string;
}

export interface Bed {
  id: string;
  unitId: string;
  unitName: string;
  roomId: string;
  roomName: string;
  bedName: string;
  features: BedFeature[];
  status: BedStatus;
  tariff: number;
  genderRestriction: 'male' | 'female' | 'any';
  ageGroup: 'pediatric' | 'adult' | 'any';
  lastCleanedAt?: Date;
  heldBy?: string;
  holdExpiresAt?: Date;
}

export interface ChecklistItem {
  id: string;
  category: 'clinical' | 'operational' | 'documentation';
  label: string;
  required: boolean;
  checked: boolean;
  notes?: string;
}

export interface TransferTimelineEvent {
  id: string;
  type: 'request' | 'hold' | 'checklist' | 'moved' | 'completed' | 'cancelled';
  timestamp: Date;
  actor?: string;
  description: string;
}

export interface TransferRequest {
  id?: string;
  patientId: string;
  patientName: string;
  fromLocation: BedLocation;
  toLocation?: BedLocation;
  transferType: TransferType;
  priority: TransferPriority;
  reason: TransferReason;
  reasonNotes?: string;
  scheduleType: 'now' | 'later';
  scheduledAt?: Date;
  notes?: string;
  orderingClinician: string;
  insurancePreAuthRequired: boolean;
  insurancePreAuthStatus?: 'pending' | 'approved' | 'denied';
  checklist: ChecklistItem[];
  attachments: string[];
  status: TransferStatus;
  timeline: TransferTimelineEvent[];
  costDelta?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Unit {
  id: string;
  name: string;
  building: string;
  floor: number;
  type: 'icu' | 'ward' | 'stepdown' | 'er' | 'or' | 'private';
  totalBeds: number;
  availableBeds: number;
}

export interface BedHold {
  id: string;
  bedId: string;
  heldByUserId: string;
  startAt: Date;
  expiresAt: Date;
  transferRequestId?: string;
}
