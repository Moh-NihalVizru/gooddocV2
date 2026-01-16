import { ServiceItem } from "@/types/booking/ipAdmission";
import { MOCK_SERVICES } from "./services.mock";

export interface PendingService {
  id: string;
  serviceId: string;
  service: ServiceItem;
  performedAt: string;
  performedBy: string;
  quantity: number;
  notes?: string;
  status: 'pending' | 'billed';
}

// Mock pending services performed by nurses for the patient
export const MOCK_PENDING_SERVICES: PendingService[] = [
  {
    id: 'PS001',
    serviceId: 'SRV003',
    service: MOCK_SERVICES.find(s => s.id === 'SRV003')!,
    performedAt: '2025-12-22T09:30:00',
    performedBy: 'Nurse Priya Sharma',
    quantity: 1,
    notes: 'Morning nursing care completed',
    status: 'pending'
  },
  {
    id: 'PS002',
    serviceId: 'SRV014',
    service: MOCK_SERVICES.find(s => s.id === 'SRV014')!,
    performedAt: '2025-12-22T08:15:00',
    performedBy: 'Nurse Priya Sharma',
    quantity: 1,
    notes: 'IV line inserted in left hand',
    status: 'pending'
  },
  {
    id: 'PS003',
    serviceId: 'SRV055',
    service: MOCK_SERVICES.find(s => s.id === 'SRV055')!,
    performedAt: '2025-12-22T10:00:00',
    performedBy: 'Nurse Anil Kumar',
    quantity: 2,
    notes: 'Morning medications administered',
    status: 'pending'
  },
  {
    id: 'PS004',
    serviceId: 'SRV007',
    service: MOCK_SERVICES.find(s => s.id === 'SRV007')!,
    performedAt: '2025-12-22T11:30:00',
    performedBy: 'Nurse Priya Sharma',
    quantity: 1,
    notes: 'Post-surgery wound dressing',
    status: 'pending'
  },
  {
    id: 'PS005',
    serviceId: 'SRV051',
    service: MOCK_SERVICES.find(s => s.id === 'SRV051')!,
    performedAt: '2025-12-22T07:00:00',
    performedBy: 'Nurse Anil Kumar',
    quantity: 4,
    notes: 'Oxygen therapy 4 hours',
    status: 'pending'
  },
];

export function getPendingServicesForPatient(patientId: string): PendingService[] {
  // In real app, filter by patientId
  return MOCK_PENDING_SERVICES.filter(s => s.status === 'pending');
}
