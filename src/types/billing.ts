export type PaymentMethod = 'cash' | 'card' | 'upi' | 'insurance' | 'other';
export type TransactionType = 'payment' | 'advance' | 'refund' | 'insurance';
export type InvoiceStatus = 'Pending' | 'Partially Paid' | 'Paid';
export type TransactionStatus = 'Success' | 'Pending' | 'Failed';

export interface Invoice {
  id: string;
  date: string;
  service: string;
  totalAmount: number; // paise
  partiallyPaid: number; // paise
  balance: number; // paise
  status: InvoiceStatus;
}

export interface PaymentLineRefs {
  cardLast4?: string;
  posRef?: string;
  upiId?: string;
  collectRef?: string;
  insuranceClaim?: string;
  insuranceApprovalId?: string;
  note?: string;
}

export interface PaymentLine {
  id: number;
  method: PaymentMethod;
  amount: number; // paise
  refs?: PaymentLineRefs;
}

export interface AdvanceWallet {
  patientId: string;
  available: number; // paise
  lastUpdated: string;
}

export interface TransactionRow {
  id: string;
  date: string;
  type: TransactionType;
  category: string;
  serviceOrReason: string;
  method: PaymentMethod;
  party: string;
  amount: number; // positive for credit, negative for debit
  status: TransactionStatus;
}

export interface CollectionPayload {
  visitId: string;
  payerName: string;
  invoices: { invoiceId: string; amount: number }[];
  appliedAdvance: number;
  paymentLines: PaymentLine[];
  allowPartial: boolean;
}

export interface AdvancePayload {
  payerName: string;
  reason: string;
  paymentLines: PaymentLine[];
}
