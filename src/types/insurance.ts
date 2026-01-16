export type ClaimStatus = 
  | "Draft" 
  | "Submitted" 
  | "In Review" 
  | "Paid" 
  | "Denied" 
  | "Partially Paid" 
  | "Rejected" 
  | "Needs Info";

export type ServiceType = 
  | "Consultation" 
  | "Laboratory" 
  | "Imaging" 
  | "Procedure" 
  | "Pharmacy" 
  | "Other";

export type ClaimType = "Cashless" | "Reimbursement";
export type CareSetting = "OPD" | "IPD" | "Day Care";
export type Network = "In-Network" | "Out-of-Network";
export type PaymentType = "Insurance" | "Patient" | "Adjustment";
export type PaymentMode = "NEFT" | "RTGS" | "IMPS" | "Cheque" | "Cash" | "UPI";
export type DocumentTag = 
  | "Bill/Invoice" 
  | "Prescription" 
  | "Lab Report" 
  | "Imaging Report" 
  | "Discharge Summary" 
  | "E-card" 
  | "KYC" 
  | "Preauth letter" 
  | "Others";

export interface Patient {
  id: string;
  name: string;
  phone: string;
}

export interface Payer {
  id: string;
  name: string;
}

export interface Policy {
  policyNo: string;
  subscriberName: string;
  relationship: "Self" | "Spouse" | "Child" | "Parent";
  tpa?: string;
  validFrom: string;
  validTo: string;
  network: Network;
}

export interface Encounter {
  careSetting: CareSetting;
  dateOfService?: string;
  admissionDate?: string;
  dischargeDate?: string;
  facility: string;
  doctor: string;
  preauthNo?: string;
  diagnosis: string;
  notes?: string;
}

export interface ServiceLine {
  id: string;
  type: ServiceType;
  description: string;
  code?: string;
  units: number;
  unitCost: number; // in paise
  tax: number; // in paise
  discount: number; // in paise
  total: number; // in paise
}

export interface ClaimDocument {
  id: string;
  name: string;
  tag: DocumentTag;
  url: string;
  uploadedAt: string;
}

export interface Payment {
  id: string;
  type: PaymentType;
  amount: number; // in paise
  date: string;
  mode: PaymentMode;
  reference: string;
}

export interface BankDetails {
  accountHolder: string;
  bank: string;
  accountNo: string;
  ifsc: string;
  upi?: string;
}

export interface Note {
  id: string;
  author: string;
  visibility: "internal" | "external";
  text: string;
  createdAt: string;
}

export interface HistoryEntry {
  at: string;
  by: string;
  action: string;
}

export interface ClaimAmounts {
  billed: number; // in paise
  insurancePaid: number; // in paise
  adjustments: number; // in paise
  balance: number; // in paise
}

export interface Claim {
  id: string;
  claimNo: string;
  status: ClaimStatus;
  patient?: Patient;
  payer?: Payer;
  policy?: Policy;
  claimType?: ClaimType;
  encounter?: Encounter;
  services: ServiceLine[];
  amounts: ClaimAmounts;
  documents: ClaimDocument[];
  payments: Payment[];
  notes: Note[];
  bankDetails?: BankDetails;
  createdAt: string;
  updatedAt: string;
  history: HistoryEntry[];
}

// Extended types for Policies
export interface PolicyCoverage {
  sumInsured: number; // in paise
  deductible: number; // in paise
  copayPct: number;
  roomRentCap: number; // in paise
  sublimits: Array<{ name: string; amount: number }>;
}

export interface PolicyDetails {
  id: string;
  policyNo: string;
  patient: Patient;
  payer: Payer;
  plan: string;
  tpa?: string;
  validFrom: string;
  validTo: string;
  network: Network;
  coverage: PolicyCoverage;
  ecardNo?: string;
  kycStatus: "Verified" | "Pending";
  status: "Active" | "Expired" | "Inactive";
  documents: ClaimDocument[];
  createdAt: string;
  updatedAt: string;
}

// Extended types for Payers
export interface PayerCodes {
  payerCode: string;
  ediCode?: string;
}

export interface PayerSubmission {
  method: "Portal" | "Email" | "EDI";
  portalURL?: string;
  emails: string[];
}

export interface PayerPaymentRules {
  payoutMode: PaymentMode;
  remittanceFormat: string;
}

export interface PayerRequiredDocs {
  Cashless: DocumentTag[];
  Reimbursement: DocumentTag[];
}

export interface PayerDefaults {
  copayPct: number;
  deductible: number; // in paise
}

export interface PayerContacts {
  claimEmail: string;
  preauthEmail?: string;
  phone?: string;
}

export interface PayerSLAs {
  preauthTATDays: number;
  claimTATDays: number;
}

export interface PayerPlan {
  id: string;
  name: string;
  network: Network;
  copayPct: number;
  deductible: number; // in paise
}

export interface PayerDetails {
  id: string;
  name: string;
  type: "Insurer" | "TPA";
  status: "Active" | "Inactive";
  codes: PayerCodes;
  submission: PayerSubmission;
  paymentRules: PayerPaymentRules;
  requiredDocs: PayerRequiredDocs;
  defaults: PayerDefaults;
  contacts: PayerContacts;
  slas: PayerSLAs;
  plans: PayerPlan[];
}

// Report types
export interface ReportSummary {
  totalBilled: number; // in paise
  insurancePaid: number; // in paise
  adjustments: number; // in paise
  balance: number; // in paise
  totalClaims: number;
  submitted: number;
  inReview: number;
  paid: number;
  denied: number;
  partiallyPaid: number;
  denialRate: number;
  avgTAT: number; // days
}

export interface TrendData {
  period: string;
  billed: number;
  paid: number;
}

export interface PayerPerformance {
  payerId: string;
  payerName: string;
  paidPct: number;
  avgTAT: number;
  denialRate: number;
}

export interface DenialRecord {
  claimNo: string;
  payer: string;
  reason: string;
  amount: number; // in paise
  daysSinceDenial: number;
  attempts: number;
}

export interface ARAgingBucket {
  range: string;
  count: number;
  amount: number; // in paise
}
