export type ID = string;

export interface Appointment {
  id: ID;
  date: string;
  time: string;
  token?: string;
  patientId: ID;
  patientName: string;
  gdid: string;
  age: number;
  sex: 'M' | 'F' | 'O';
  phone?: string;
  email?: string;
  chiefComplaint?: string;
  mode: 'In-Clinic' | 'Virtual';
  type: 'New' | 'Follow-up';
  doctorName?: string;
  department?: string;
  vitalsPreview?: { bp?: string; hr?: number; temp?: number; rr?: number; spo2?: number; bg?: number };
  status: 'Scheduled' | 'Visited' | 'NoShow' | 'Cancelled' | 'InProgress';
}

export interface Patient {
  id: ID;
  gdid: string;
  name: string;
  dob: string;
  sex: 'M' | 'F' | 'O';
  phone?: string;
  email?: string;
  whatsapp?: string;
  bloodGroup?: string;
  insurance?: { provider: string; policyNumber: string; validTo?: string };
  address?: { street?: string; city?: string; state?: string; pincode?: string; country?: string };
  alerts?: { allergies?: string[]; critical?: string[] };
  tags?: string[];
  photoUrl?: string;
}

export interface Vitals {
  patientId: ID;
  recordedAt: string;
  bpSystolic?: number;
  bpDiastolic?: number;
  spo2?: number;
  heartRate?: number;
  respiratoryRate?: number;
  temperatureC?: number;
  weightKg?: number;
  heightCm?: number;
}

export interface ClinicalNote {
  id: ID;
  patientId: ID;
  appointmentId?: ID;
  createdBy: ID;
  createdAt: string;
  chiefComplaint?: string;
  hpi?: string;
  ros?: Record<string, boolean>;
  physicalExam?: Record<string, string>;
  assessmentPlan?: string;
  version?: number;
  status: 'Draft' | 'Final';
}

export interface PrescriptionItem {
  id: ID;
  name: string;
  form?: string;
  strength?: string;
  dosage?: string;
  route?: string;
  frequency?: string;
  timing?: string;
  durationDays?: number;
  notes?: string;
}

export interface Prescription {
  id: ID;
  patientId: ID;
  appointmentId?: ID;
  items: PrescriptionItem[];
  createdAt: string;
  createdBy: ID;
  status: 'Draft' | 'Signed' | 'Sent';
}

export interface LabTest {
  code: string;
  name: string;
  price: number;
  type: 'Lab' | 'Radiology';
}

export interface LabPackage {
  code: string;
  name: string;
  price: number;
  includes: string[];
}

export interface LabOrder {
  id: ID;
  patientId: ID;
  appointmentId?: ID;
  mode: 'In-Clinic' | 'Home Collection';
  type: 'Laboratory' | 'Radiology';
  tests: { code: string; name: string; price: number }[];
  packages?: { code: string; name: string; price: number }[];
  scheduledAt: string;
  status: 'Pending' | 'Collected' | 'In-progress' | 'Completed';
  totals: { subtotal: number; cgst: number; sgst: number; net: number; currency: 'INR' };
}

export interface Document {
  id: ID;
  name: string;
  sizeKB: number;
  uploadedBy: string;
  uploadedAt: string;
  url: string;
  type: 'PDF' | 'Image' | 'Other';
}

export interface VisitSummary {
  appointmentId: ID;
  date: string;
  location: string;
  doctorName?: string;
  reason?: string;
  vitals?: Partial<Vitals>;
  diagnoses?: string[];
  plan?: string;
  clinicalNoteId?: ID;
  prescriptions?: PrescriptionItem[];
  labOrders?: LabOrder[];
  documents?: Document[];
  aiSummary?: string;
}
