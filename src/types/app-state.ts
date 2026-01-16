// Core data models for global app state

export interface Patient {
  id: string;
  name: string;
  dob: string;
  contact: string;
  email?: string;
  mrn?: string;
  gender?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Provider {
  id: string;
  name: string;
  specialty: string;
  department?: string;
  qualification?: string;
  availability?: string;
  locations?: string[];
  duration?: number;
  fee?: number;
  status: 'active' | 'inactive';
}

export interface Service {
  id: string;
  code: string;
  name: string;
  category: string;
  price: number;
  taxPct: number;
  isDiscountable: boolean;
}

export interface PriceBreakdown {
  subtotal: number;
  discountAmount: number;
  discountPct: number;
  taxAmount: number;
  total: number;
}

export interface Appointment {
  id: string;
  patientId: string;
  providerId: string;
  services: string[]; // Array of service IDs
  scheduledAt: string;
  notes?: string;
  type: string; // e.g., "Consultation", "Lab", etc.
  mode?: string; // e.g., "In-person", "Virtual", "Home collection"
  location?: string;
  priceBreakdown: PriceBreakdown;
  status: 'pending' | 'scheduled' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  appointmentId: string;
  amountDue: number;
  amountPaid: number;
  discount: number;
  method: string; // e.g., "Cash", "Card", "UPI"
  status: 'pending' | 'partial' | 'completed' | 'refunded';
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  appointmentId: string;
  paymentId: string;
  totals: PriceBreakdown;
  pdfUrl?: string;
  createdAt: string;
}

export interface AppState {
  patients: Record<string, Patient>;
  providers: Record<string, Provider>;
  services: Record<string, Service>;
  appointments: Record<string, Appointment>;
  payments: Record<string, Payment>;
  invoices: Record<string, Invoice>;
}

export const initialAppState: AppState = {
  patients: {},
  providers: {},
  services: {},
  appointments: {},
  payments: {},
  invoices: {},
};
