export interface BillFacility {
  name: string;
  logoUrl?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  taxId?: string;
  registrationId?: string;
}

export interface BillInvoice {
  number: string;
  issueDate: string;
  dueDate?: string;
  currency: string;
  locale?: string;
  poNumber?: string;
  notes?: string;
}

export interface BillPatient {
  id?: string;
  mrn?: string;
  name: string;
  dob?: string;
  sex?: string;
  contact?: {
    phone?: string;
    email?: string;
  };
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
}

export interface BillEncounter {
  admissionId?: string;
  admissionType?: string;
  admissionDateTime?: string;
  dischargeDateTime?: string;
  ward?: string;
  room?: string;
  bed?: string;
  lengthOfStayDays?: number;
}

export interface BillInsurance {
  payerName?: string;
  planName?: string;
  memberId?: string;
  policyNumber?: string;
  groupNumber?: string;
  tpaName?: string;
  preauthNumber?: string;
  coveragePercent?: number;
}

export interface BillProvider {
  name: string;
  role?: string;
  id?: string;
  npi?: string;
}

export interface BillBedCharge {
  date: string;
  roomType?: string;
  bedType?: string;
  ward?: string;
  roomNumber?: string;
  chargePerDay: number;
  days?: number;
  subtotal?: number;
}

export interface BillLineItem {
  dateStart?: string;
  dateEnd?: string;
  serviceCode?: string;
  description: string;
  uom?: string;
  quantity: number;
  unitPrice: number;
  discountPercent?: number;
  discountAmount?: number;
  taxPercent?: number;
  taxAmount?: number;
  clinician?: string;
  notes?: string;
  bundleId?: string;
}

export interface BillDepartment {
  name: string;
  code?: string;
  startDateTime?: string;
  endDateTime?: string;
  location?: string;
  lineItems: BillLineItem[];
}

export interface BillTaxBreakdown {
  label: string;
  percent?: number;
  base?: number;
  amount: number;
}

export interface BillAdjustment {
  date?: string;
  type?: string;
  reason?: string;
  amount: number;
}

export interface BillPayment {
  date: string;
  method: string;
  reference?: string;
  amount: number;
  remarks?: string;
}

export interface BillSummary {
  gross?: number;
  discounts?: number;
  taxes?: number;
  adjustments?: number;
  insuranceCoverage?: number;
  coPay?: number;
  amountPaid?: number;
  roundOff?: number;
  amountDue?: number;
}

export interface BillSignatures {
  cashierName?: string;
  authorizedBy?: string;
  generatedBy?: string;
}

export interface DischargeBill {
  facility: BillFacility;
  invoice: BillInvoice;
  patient: BillPatient;
  encounter: BillEncounter;
  insurance?: BillInsurance;
  providers?: BillProvider[];
  bedCharges?: BillBedCharge[];
  departments: BillDepartment[];
  taxBreakdown?: BillTaxBreakdown[];
  adjustments?: BillAdjustment[];
  payments?: BillPayment[];
  summary?: BillSummary;
  signatures?: BillSignatures;
  qrCodeUrl?: string;
}
