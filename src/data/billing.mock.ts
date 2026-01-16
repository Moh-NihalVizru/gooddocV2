// Shared billing data for Patient Insights tabs
// All amounts are in paise (100 paise = ₹1)

export type InvoiceStatus = "Paid" | "Partial" | "Unpaid";
export type TransactionType = "Bill" | "Advance" | "Refund";
export type PaymentMethod = "Cash" | "Card" | "UPI" | "Insurance" | "NEFT" | "Cheque" | null;

export interface Invoice {
  id: string;
  invoiceNo: string;
  date: string;
  time: string;
  visitId: string;
  service: string;
  serviceCode: string;
  doctor: string;
  department: string;
  originalAmount: number;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  status: InvoiceStatus;
}

export interface Transaction {
  id: string;
  receiptNo: string;
  invoiceNos: string[]; // Support multiple invoices per transaction
  date: string;
  time: string;
  visitId: string;
  type: TransactionType;
  methods: PaymentMethod[]; // Support multiple payment methods (split payment)
  payer: string;
  amount: number;
  status: "Success" | "Pending" | "Failed" | "Refunded";
}

// Invoices - source of truth for billing
export const mockInvoices: Invoice[] = [
  // V25-004 invoices (Active visit - Cardiology follow-up)
  {
    id: "inv-041",
    invoiceNo: "INV236",
    date: "20-Dec-2025",
    time: "09:00",
    visitId: "V25-004",
    service: "Cardiology Consultation",
    serviceCode: "CONS-CARD-001",
    doctor: "Dr. Meera Nair",
    department: "Cardiology",
    originalAmount: 250000,
    totalAmount: 250000,
    paidAmount: 0,
    balance: 250000,
    status: "Unpaid",
  },
  {
    id: "inv-042",
    invoiceNo: "INV237",
    date: "20-Dec-2025",
    time: "10:30",
    visitId: "V25-004",
    service: "ECG Test",
    serviceCode: "DIAG-ECG-001",
    doctor: "Dr. Meera Nair",
    department: "Diagnostics",
    originalAmount: 100000,
    totalAmount: 80000,
    paidAmount: 40000,
    balance: 40000,
    status: "Partial",
  },
  {
    id: "inv-043",
    invoiceNo: "INV238",
    date: "20-Dec-2025",
    time: "11:00",
    visitId: "V25-004",
    service: "Laboratory - Lipid Profile",
    serviceCode: "LAB-BIO-003",
    doctor: "Dr. Meera Nair",
    department: "Laboratory",
    originalAmount: 65000,
    totalAmount: 65000,
    paidAmount: 0,
    balance: 65000,
    status: "Unpaid",
  },
  // V25-002 invoices (General Medicine checkup)
  {
    id: "inv-021",
    invoiceNo: "INV240",
    date: "15-Dec-2025",
    time: "09:00",
    visitId: "V25-002",
    service: "General Consultation",
    serviceCode: "CONS-GEN-001",
    doctor: "Dr. Priya Menon",
    department: "General Medicine",
    originalAmount: 150000,
    totalAmount: 150000,
    paidAmount: 150000,
    balance: 0,
    status: "Paid",
  },
  {
    id: "inv-022",
    invoiceNo: "INV241",
    date: "15-Dec-2025",
    time: "09:30",
    visitId: "V25-002",
    service: "Blood Test - CBC",
    serviceCode: "LAB-HEM-001",
    doctor: "Dr. Priya Menon",
    department: "Laboratory",
    originalAmount: 85000,
    totalAmount: 80000,
    paidAmount: 80000,
    balance: 0,
    status: "Paid",
  },
  {
    id: "inv-023",
    invoiceNo: "INV242",
    date: "15-Dec-2025",
    time: "09:45",
    visitId: "V25-002",
    service: "Lipid Profile",
    serviceCode: "LAB-BIO-003",
    doctor: "Dr. Priya Menon",
    department: "Laboratory",
    originalAmount: 120000,
    totalAmount: 120000,
    paidAmount: 120000,
    balance: 0,
    status: "Paid",
  },
  // V25-001 invoices (Cardiology - Chest pain)
  {
    id: "inv-011",
    invoiceNo: "INV230",
    date: "01-Dec-2025",
    time: "14:00",
    visitId: "V25-001",
    service: "Cardiology Consultation",
    serviceCode: "CONS-CARD-001",
    doctor: "Dr. Meera Nair",
    department: "Cardiology",
    originalAmount: 250000,
    totalAmount: 250000,
    paidAmount: 0,
    balance: 250000,
    status: "Unpaid",
  },
  {
    id: "inv-012",
    invoiceNo: "INV231",
    date: "01-Dec-2025",
    time: "14:30",
    visitId: "V25-001",
    service: "ECG Test",
    serviceCode: "DIAG-ECG-001",
    doctor: "Dr. Meera Nair",
    department: "Cardiology",
    originalAmount: 85000,
    totalAmount: 80000,
    paidAmount: 0,
    balance: 80000,
    status: "Unpaid",
  },
  {
    id: "inv-013",
    invoiceNo: "INV232",
    date: "01-Dec-2025",
    time: "15:00",
    visitId: "V25-001",
    service: "Chest X-Ray",
    serviceCode: "RAD-XRAY-001",
    doctor: "Dr. Vinod Kumar",
    department: "Radiology",
    originalAmount: 150000,
    totalAmount: 150000,
    paidAmount: 0,
    balance: 150000,
    status: "Unpaid",
  },
  // V24-089 invoices (Orthopedics - Back pain)
  {
    id: "inv-891",
    invoiceNo: "INV180",
    date: "15-Nov-2025",
    time: "10:00",
    visitId: "V24-089",
    service: "Orthopedics Consultation",
    serviceCode: "CONS-ORTH-001",
    doctor: "Dr. Arun Kumar",
    department: "Orthopedics",
    originalAmount: 200000,
    totalAmount: 200000,
    paidAmount: 200000,
    balance: 0,
    status: "Paid",
  },
  {
    id: "inv-892",
    invoiceNo: "INV181",
    date: "15-Nov-2025",
    time: "11:00",
    visitId: "V24-089",
    service: "MRI Spine",
    serviceCode: "RAD-MRI-002",
    doctor: "Dr. Vinod Kumar",
    department: "Radiology",
    originalAmount: 900000,
    totalAmount: 850000,
    paidAmount: 850000,
    balance: 0,
    status: "Paid",
  },
  {
    id: "inv-893",
    invoiceNo: "INV182",
    date: "16-Nov-2025",
    time: "09:00",
    visitId: "V24-089",
    service: "Physiotherapy Session",
    serviceCode: "REHAB-PT-001",
    doctor: "Dr. Arun Kumar",
    department: "Physiotherapy",
    originalAmount: 100000,
    totalAmount: 100000,
    paidAmount: 100000,
    balance: 0,
    status: "Paid",
  },
];

// Transactions - payment records linked to invoices
export const mockTransactions: Transaction[] = [
  // V25-004 transactions - current active visit
  {
    id: "txn-040",
    receiptNo: "RCP540",
    invoiceNos: [],
    date: "20-Dec-2025",
    time: "09:15",
    visitId: "V25-004",
    type: "Advance",
    methods: ["Cash"],
    payer: "Harish Kalyan",
    amount: 500000,
    status: "Success",
  },
  {
    id: "txn-041",
    receiptNo: "RCP545",
    invoiceNos: ["INV237"],
    date: "20-Dec-2025",
    time: "10:45",
    visitId: "V25-004",
    type: "Bill",
    methods: ["Card"],
    payer: "Harish Kalyan",
    amount: 40000,
    status: "Success",
  },
  {
    id: "txn-042",
    receiptNo: "RCP548",
    invoiceNos: ["INV236", "INV238"],
    date: "20-Dec-2025",
    time: "11:30",
    visitId: "V25-004",
    type: "Bill",
    methods: ["UPI", "Cash"],
    payer: "Harish Kalyan",
    amount: 315000,
    status: "Success",
  },
  // V25-002 transactions - example with multiple invoices and split payment
  {
    id: "txn-020",
    receiptNo: "RCP710",
    invoiceNos: [],
    date: "15-Dec-2025",
    time: "08:45",
    visitId: "V25-002",
    type: "Advance",
    methods: ["UPI"],
    payer: "Harish Kalyan",
    amount: 200000,
    status: "Success",
  },
  {
    id: "txn-021",
    receiptNo: "RCP712",
    invoiceNos: ["INV240", "INV241"],
    date: "15-Dec-2025",
    time: "09:15",
    visitId: "V25-002",
    type: "Bill",
    methods: ["UPI", "Cash"],
    payer: "Harish Kalyan",
    amount: 230000,
    status: "Success",
  },
  {
    id: "txn-023",
    receiptNo: "RCP714",
    invoiceNos: ["INV242"],
    date: "15-Dec-2025",
    time: "10:00",
    visitId: "V25-002",
    type: "Bill",
    methods: ["Card"],
    payer: "Harish Kalyan",
    amount: 120000,
    status: "Success",
  },
  // V24-089 transactions - example with multiple invoices via insurance
  {
    id: "txn-890",
    receiptNo: "RCP800",
    invoiceNos: [],
    date: "15-Nov-2025",
    time: "09:00",
    visitId: "V24-089",
    type: "Advance",
    methods: ["NEFT"],
    payer: "Harish Kalyan",
    amount: 100000,
    status: "Success",
  },
  {
    id: "txn-891",
    receiptNo: "RCP801",
    invoiceNos: ["INV180", "INV181"],
    date: "15-Nov-2025",
    time: "10:30",
    visitId: "V24-089",
    type: "Bill",
    methods: ["Insurance"],
    payer: "ICICI Lombard",
    amount: 1050000,
    status: "Success",
  },
  {
    id: "txn-893",
    receiptNo: "RCP803",
    invoiceNos: ["INV182"],
    date: "16-Nov-2025",
    time: "09:15",
    visitId: "V24-089",
    type: "Bill",
    methods: ["Cash"],
    payer: "Harish Kalyan",
    amount: 100000,
    status: "Success",
  },
];

// Helper to get transactions for an invoice
export const getTransactionsForInvoice = (invoiceNo: string): Transaction[] => {
  return mockTransactions.filter((txn) => txn.invoiceNos.includes(invoiceNo));
};

// Helper to get invoices for a visit
export const getInvoicesForVisit = (visitId: string): Invoice[] => {
  return mockInvoices.filter((inv) => inv.visitId === visitId);
};

// Helper to get transactions for a visit
export const getTransactionsForVisit = (visitId: string): Transaction[] => {
  return mockTransactions.filter((txn) => txn.visitId === visitId);
};

// Helper to get pending invoices for a visit
export const getPendingInvoicesForVisit = (visitId: string): Invoice[] => {
  return mockInvoices.filter((inv) => inv.visitId === visitId && inv.status !== "Paid");
};
