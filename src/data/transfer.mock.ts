import { Bed, Unit, ChecklistItem, BedFeature } from '@/types/transfer';

export const mockUnits: Unit[] = [
  { id: 'unit-icu', name: 'ICU', building: 'Main', floor: 3, type: 'icu', totalBeds: 12, availableBeds: 3 },
  { id: 'unit-ward-a', name: 'Ward A', building: 'Main', floor: 2, type: 'ward', totalBeds: 24, availableBeds: 8 },
  { id: 'unit-ward-b', name: 'Ward B', building: 'Main', floor: 2, type: 'ward', totalBeds: 24, availableBeds: 5 },
  { id: 'unit-stepdown', name: 'Step-Down Unit', building: 'Main', floor: 3, type: 'stepdown', totalBeds: 8, availableBeds: 2 },
  { id: 'unit-private', name: 'Private Wing', building: 'Main', floor: 4, type: 'private', totalBeds: 16, availableBeds: 4 },
  { id: 'unit-er', name: 'Emergency', building: 'Main', floor: 1, type: 'er', totalBeds: 10, availableBeds: 3 },
];

export const mockBeds: Bed[] = [
  // ICU Beds
  { id: 'bed-icu-1', unitId: 'unit-icu', unitName: 'ICU', roomId: 'room-icu-1', roomName: 'ICU Bay 1', bedName: 'IC-01', features: ['icu_capable', 'ventilator', 'cardiac_monitor', 'oxygen'], status: 'available', tariff: 15000, genderRestriction: 'any', ageGroup: 'adult' },
  { id: 'bed-icu-2', unitId: 'unit-icu', unitName: 'ICU', roomId: 'room-icu-1', roomName: 'ICU Bay 1', bedName: 'IC-02', features: ['icu_capable', 'ventilator', 'cardiac_monitor', 'oxygen'], status: 'occupied', tariff: 15000, genderRestriction: 'any', ageGroup: 'adult' },
  { id: 'bed-icu-3', unitId: 'unit-icu', unitName: 'ICU', roomId: 'room-icu-2', roomName: 'ICU Bay 2', bedName: 'IC-03', features: ['icu_capable', 'ventilator', 'cardiac_monitor', 'oxygen', 'isolation'], status: 'available', tariff: 18000, genderRestriction: 'any', ageGroup: 'adult' },
  { id: 'bed-icu-4', unitId: 'unit-icu', unitName: 'ICU', roomId: 'room-icu-2', roomName: 'ICU Bay 2', bedName: 'IC-04', features: ['icu_capable', 'ventilator', 'cardiac_monitor', 'oxygen', 'negative_pressure'], status: 'cleaning', tariff: 20000, genderRestriction: 'any', ageGroup: 'adult', lastCleanedAt: new Date() },
  { id: 'bed-icu-5', unitId: 'unit-icu', unitName: 'ICU', roomId: 'room-icu-3', roomName: 'ICU Bay 3', bedName: 'IC-05', features: ['icu_capable', 'ventilator', 'cardiac_monitor', 'oxygen'], status: 'available', tariff: 15000, genderRestriction: 'any', ageGroup: 'adult' },

  // Ward A Beds
  { id: 'bed-wa-1', unitId: 'unit-ward-a', unitName: 'Ward A', roomId: 'room-wa-101', roomName: 'Room 101', bedName: 'WA-101-1', features: ['oxygen'], status: 'available', tariff: 3000, genderRestriction: 'male', ageGroup: 'adult' },
  { id: 'bed-wa-2', unitId: 'unit-ward-a', unitName: 'Ward A', roomId: 'room-wa-101', roomName: 'Room 101', bedName: 'WA-101-2', features: ['oxygen'], status: 'available', tariff: 3000, genderRestriction: 'male', ageGroup: 'adult' },
  { id: 'bed-wa-3', unitId: 'unit-ward-a', unitName: 'Ward A', roomId: 'room-wa-102', roomName: 'Room 102', bedName: 'WA-102-1', features: ['oxygen', 'telemetry'], status: 'occupied', tariff: 3500, genderRestriction: 'female', ageGroup: 'adult' },
  { id: 'bed-wa-4', unitId: 'unit-ward-a', unitName: 'Ward A', roomId: 'room-wa-103', roomName: 'Room 103', bedName: 'WA-103-1', features: ['oxygen', 'isolation'], status: 'available', tariff: 4000, genderRestriction: 'any', ageGroup: 'adult' },
  { id: 'bed-wa-5', unitId: 'unit-ward-a', unitName: 'Ward A', roomId: 'room-wa-104', roomName: 'Room 104', bedName: 'WA-104-1', features: ['oxygen'], status: 'available', tariff: 3000, genderRestriction: 'male', ageGroup: 'adult' },
  { id: 'bed-wa-6', unitId: 'unit-ward-a', unitName: 'Ward A', roomId: 'room-wa-104', roomName: 'Room 104', bedName: 'WA-104-2', features: ['oxygen'], status: 'hold', tariff: 3000, genderRestriction: 'male', ageGroup: 'adult', holdExpiresAt: new Date(Date.now() + 10 * 60 * 1000) },
  { id: 'bed-wa-7', unitId: 'unit-ward-a', unitName: 'Ward A', roomId: 'room-wa-105', roomName: 'Room 105', bedName: 'WA-105-1', features: ['oxygen'], status: 'available', tariff: 3000, genderRestriction: 'female', ageGroup: 'adult' },
  { id: 'bed-wa-8', unitId: 'unit-ward-a', unitName: 'Ward A', roomId: 'room-wa-105', roomName: 'Room 105', bedName: 'WA-105-2', features: ['oxygen'], status: 'available', tariff: 3000, genderRestriction: 'female', ageGroup: 'adult' },

  // Ward B Beds
  { id: 'bed-wb-1', unitId: 'unit-ward-b', unitName: 'Ward B', roomId: 'room-wb-201', roomName: 'Room 201', bedName: 'WB-201-1', features: ['oxygen'], status: 'available', tariff: 3000, genderRestriction: 'male', ageGroup: 'adult' },
  { id: 'bed-wb-2', unitId: 'unit-ward-b', unitName: 'Ward B', roomId: 'room-wb-201', roomName: 'Room 201', bedName: 'WB-201-2', features: ['oxygen'], status: 'occupied', tariff: 3000, genderRestriction: 'male', ageGroup: 'adult' },
  { id: 'bed-wb-3', unitId: 'unit-ward-b', unitName: 'Ward B', roomId: 'room-wb-202', roomName: 'Room 202', bedName: 'WB-202-1', features: ['oxygen', 'telemetry'], status: 'available', tariff: 3500, genderRestriction: 'female', ageGroup: 'adult' },
  { id: 'bed-wb-4', unitId: 'unit-ward-b', unitName: 'Ward B', roomId: 'room-wb-203', roomName: 'Room 203', bedName: 'WB-203-1', features: ['oxygen'], status: 'available', tariff: 3000, genderRestriction: 'any', ageGroup: 'pediatric' },
  { id: 'bed-wb-5', unitId: 'unit-ward-b', unitName: 'Ward B', roomId: 'room-wb-203', roomName: 'Room 203', bedName: 'WB-203-2', features: ['oxygen'], status: 'available', tariff: 3000, genderRestriction: 'any', ageGroup: 'pediatric' },

  // Step-Down Beds
  { id: 'bed-sd-1', unitId: 'unit-stepdown', unitName: 'Step-Down Unit', roomId: 'room-sd-1', roomName: 'SD Bay 1', bedName: 'SD-01', features: ['cardiac_monitor', 'telemetry', 'oxygen'], status: 'available', tariff: 8000, genderRestriction: 'any', ageGroup: 'adult' },
  { id: 'bed-sd-2', unitId: 'unit-stepdown', unitName: 'Step-Down Unit', roomId: 'room-sd-1', roomName: 'SD Bay 1', bedName: 'SD-02', features: ['cardiac_monitor', 'telemetry', 'oxygen'], status: 'occupied', tariff: 8000, genderRestriction: 'any', ageGroup: 'adult' },
  { id: 'bed-sd-3', unitId: 'unit-stepdown', unitName: 'Step-Down Unit', roomId: 'room-sd-2', roomName: 'SD Bay 2', bedName: 'SD-03', features: ['cardiac_monitor', 'telemetry', 'oxygen'], status: 'available', tariff: 8000, genderRestriction: 'any', ageGroup: 'adult' },

  // Private Wing Beds
  { id: 'bed-pr-1', unitId: 'unit-private', unitName: 'Private Wing', roomId: 'room-pr-401', roomName: 'Suite 401', bedName: 'PW-401', features: ['oxygen', 'telemetry'], status: 'available', tariff: 12000, genderRestriction: 'any', ageGroup: 'adult' },
  { id: 'bed-pr-2', unitId: 'unit-private', unitName: 'Private Wing', roomId: 'room-pr-402', roomName: 'Suite 402', bedName: 'PW-402', features: ['oxygen', 'telemetry'], status: 'occupied', tariff: 12000, genderRestriction: 'any', ageGroup: 'adult' },
  { id: 'bed-pr-3', unitId: 'unit-private', unitName: 'Private Wing', roomId: 'room-pr-403', roomName: 'Suite 403', bedName: 'PW-403', features: ['oxygen', 'telemetry', 'isolation'], status: 'available', tariff: 15000, genderRestriction: 'any', ageGroup: 'adult' },
  { id: 'bed-pr-4', unitId: 'unit-private', unitName: 'Private Wing', roomId: 'room-pr-404', roomName: 'Suite 404', bedName: 'PW-404', features: ['oxygen', 'telemetry'], status: 'available', tariff: 12000, genderRestriction: 'any', ageGroup: 'adult' },
];

export const getDefaultChecklist = (transferType: string, priority: string): ChecklistItem[] => {
  const clinicalItems: ChecklistItem[] = [
    { id: 'cl-1', category: 'clinical', label: 'Vitals stable and documented', required: true, checked: false },
    { id: 'cl-2', category: 'clinical', label: 'Lines and tubes secured', required: true, checked: false },
    { id: 'cl-3', category: 'clinical', label: 'Medications prepared for transport', required: true, checked: false },
    { id: 'cl-4', category: 'clinical', label: 'Oxygen/ventilator availability confirmed', required: transferType === 'ward_to_icu', checked: false },
    { id: 'cl-5', category: 'clinical', label: 'Isolation/infection control requirements met', required: false, checked: false },
  ];

  const operationalItems: ChecklistItem[] = [
    { id: 'op-1', category: 'operational', label: 'Porter/transport arranged', required: true, checked: false },
    { id: 'op-2', category: 'operational', label: 'Receiving unit notified', required: true, checked: false },
    { id: 'op-3', category: 'operational', label: 'Destination bed prepped and ready', required: true, checked: false },
    { id: 'op-4', category: 'operational', label: 'Patient/family informed', required: false, checked: false },
  ];

  const documentationItems: ChecklistItem[] = [
    { id: 'doc-1', category: 'documentation', label: 'Transfer note completed', required: true, checked: false },
    { id: 'doc-2', category: 'documentation', label: 'Handoff summary prepared', required: true, checked: false },
    { id: 'doc-3', category: 'documentation', label: 'Orders copied to new unit', required: true, checked: false },
    { id: 'doc-4', category: 'documentation', label: 'Insurance pre-auth attached (if required)', required: false, checked: false },
    { id: 'doc-5', category: 'documentation', label: 'Consent captured (if required)', required: false, checked: false },
  ];

  // STAT priority may bypass some checks but must document
  if (priority === 'stat') {
    return [...clinicalItems, ...operationalItems.slice(0, 2), ...documentationItems.slice(0, 2)];
  }

  return [...clinicalItems, ...operationalItems, ...documentationItems];
};

export const featureLabels: Record<BedFeature, string> = {
  icu_capable: 'ICU Capable',
  isolation: 'Isolation',
  oxygen: 'Oxygen',
  ventilator: 'Ventilator',
  negative_pressure: 'Negative Pressure',
  cardiac_monitor: 'Cardiac Monitor',
  telemetry: 'Telemetry',
};

export const transferTypeLabels: Record<string, string> = {
  intra_ward: 'Intra-ward Transfer',
  ward_to_icu: 'Ward → ICU',
  icu_to_stepdown: 'ICU → Step-down',
  ward_to_ward: 'Ward ↔ Ward',
  room_change: 'Room Change',
  bed_swap: 'Bed Swap',
};

export const priorityLabels: Record<string, string> = {
  stat: 'STAT',
  urgent: 'Urgent',
  routine: 'Routine',
};

export const reasonLabels: Record<string, string> = {
  clinical_deterioration: 'Clinical Deterioration',
  procedure: 'Procedure Required',
  step_up_care: 'Step-up Care',
  step_down_care: 'Step-down Care',
  isolation_need: 'Isolation Need',
  special_equipment: 'Special Equipment Required',
  patient_preference: 'Patient Preference',
  other: 'Other',
};
