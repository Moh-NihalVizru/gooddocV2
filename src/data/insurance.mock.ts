import { Claim } from "@/types/insurance";

export const mockClaims: Claim[] = [
  {
    id: "1",
    claimNo: "CLM-2025-789",
    status: "Paid",
    patient: {
      id: "p1",
      name: "Harish Kalyan",
      phone: "+91 98765 43210"
    },
    payer: {
      id: "payer1",
      name: "Star Life Insurance"
    },
    policy: {
      policyNo: "IND1000012345",
      subscriberName: "Harish Kalyan",
      relationship: "Self",
      tpa: "Medi Assist",
      validFrom: "2025-01-01",
      validTo: "2025-12-31",
      network: "In-Network"
    },
    claimType: "Cashless",
    encounter: {
      careSetting: "OPD",
      dateOfService: "2025-06-15",
      facility: "GoodDoc Hospital",
      doctor: "Dr. Sarah Johnson",
      preauthNo: "PA-2025-1234",
      diagnosis: "Acute Bronchitis"
    },
    services: [
      {
        id: "s1",
        type: "Consultation",
        description: "General Physician Consultation",
        code: "99213",
        units: 1,
        unitCost: 300000, // ₹3,000 in paise
        tax: 0,
        discount: 0,
        total: 300000
      }
    ],
    amounts: {
      billed: 300000,
      insurancePaid: 150000,
      adjustments: 0,
      balance: 150000
    },
    documents: [
      {
        id: "doc1",
        name: "consultation_bill.pdf",
        tag: "Bill/Invoice",
        url: "/documents/consultation_bill.pdf",
        uploadedAt: "2025-06-15T10:30:00Z"
      },
      {
        id: "doc2",
        name: "prescription.pdf",
        tag: "Prescription",
        url: "/documents/prescription.pdf",
        uploadedAt: "2025-06-15T10:32:00Z"
      }
    ],
    payments: [
      {
        id: "pay1",
        type: "Insurance",
        amount: 150000,
        date: "2025-06-20",
        mode: "NEFT",
        reference: "NEFT202506201234"
      }
    ],
    notes: [
      {
        id: "note1",
        author: "Billing Team",
        visibility: "internal",
        text: "Claim processed and approved within 5 days",
        createdAt: "2025-06-20T14:00:00Z"
      }
    ],
    createdAt: "2025-06-15T10:00:00Z",
    updatedAt: "2025-06-20T14:30:00Z",
    history: [
      {
        at: "2025-06-15T10:00:00Z",
        by: "Receptionist",
        action: "Created"
      },
      {
        at: "2025-06-15T11:00:00Z",
        by: "Billing Team",
        action: "Submitted"
      },
      {
        at: "2025-06-16T09:00:00Z",
        by: "System",
        action: "StatusChanged:In Review"
      },
      {
        at: "2025-06-20T14:00:00Z",
        by: "System",
        action: "StatusChanged:Paid"
      }
    ]
  },
  {
    id: "2",
    claimNo: "CLM-2025-790",
    status: "Paid",
    patient: {
      id: "p2",
      name: "Robb Stark",
      phone: "+91 98765 43211"
    },
    payer: {
      id: "payer2",
      name: "Health First Insurance"
    },
    policy: {
      policyNo: "HF9876543210",
      subscriberName: "Robb Stark",
      relationship: "Self",
      validFrom: "2025-01-01",
      validTo: "2025-12-31",
      network: "In-Network"
    },
    claimType: "Reimbursement",
    encounter: {
      careSetting: "OPD",
      dateOfService: "2025-05-20",
      facility: "GoodDoc Hospital",
      doctor: "Dr. Michael Chen",
      diagnosis: "Complete Blood Count for Annual Checkup"
    },
    services: [
      {
        id: "s2",
        type: "Laboratory",
        description: "Complete Blood Count (CBC)",
        code: "85025",
        units: 1,
        unitCost: 200000, // ₹2,000 in paise
        tax: 0,
        discount: 0,
        total: 200000
      }
    ],
    amounts: {
      billed: 200000,
      insurancePaid: 65000,
      adjustments: 0,
      balance: 135000
    },
    documents: [
      {
        id: "doc3",
        name: "lab_bill.pdf",
        tag: "Bill/Invoice",
        url: "/documents/lab_bill.pdf",
        uploadedAt: "2025-05-20T11:00:00Z"
      },
      {
        id: "doc4",
        name: "lab_report.pdf",
        tag: "Lab Report",
        url: "/documents/lab_report.pdf",
        uploadedAt: "2025-05-20T15:00:00Z"
      }
    ],
    payments: [
      {
        id: "pay2",
        type: "Insurance",
        amount: 65000,
        date: "2025-05-28",
        mode: "NEFT",
        reference: "NEFT202505281567"
      }
    ],
    notes: [],
    bankDetails: {
      accountHolder: "Robb Stark",
      bank: "ICICI Bank",
      accountNo: "123456789012",
      ifsc: "ICIC0001234",
      upi: "robbstark@icicbank"
    },
    createdAt: "2025-05-20T10:00:00Z",
    updatedAt: "2025-05-28T16:00:00Z",
    history: [
      {
        at: "2025-05-20T10:00:00Z",
        by: "Receptionist",
        action: "Created"
      },
      {
        at: "2025-05-20T12:00:00Z",
        by: "Billing Team",
        action: "Submitted"
      },
      {
        at: "2025-05-28T16:00:00Z",
        by: "System",
        action: "StatusChanged:Paid"
      }
    ]
  },
  {
    id: "3",
    claimNo: "CLM-2025-791",
    status: "In Review",
    patient: {
      id: "p3",
      name: "Fredrick John",
      phone: "+91 98765 43212"
    },
    payer: {
      id: "payer3",
      name: "National Insurance"
    },
    policy: {
      policyNo: "NI5555666677",
      subscriberName: "Fredrick John",
      relationship: "Self",
      tpa: "Paramount TPA",
      validFrom: "2025-01-01",
      validTo: "2025-12-31",
      network: "Out-of-Network"
    },
    claimType: "Cashless",
    encounter: {
      careSetting: "OPD",
      dateOfService: "2025-04-10",
      facility: "GoodDoc Hospital",
      doctor: "Dr. Emily Rodriguez",
      preauthNo: "PA-2025-5678",
      diagnosis: "Fracture of right wrist - X-ray imaging"
    },
    services: [
      {
        id: "s3",
        type: "Imaging",
        description: "X-Ray Wrist (2 views)",
        code: "73100",
        units: 1,
        unitCost: 220000, // ₹2,200 in paise
        tax: 0,
        discount: 0,
        total: 220000
      }
    ],
    amounts: {
      billed: 220000,
      insurancePaid: 120000,
      adjustments: 0,
      balance: 100000
    },
    documents: [
      {
        id: "doc5",
        name: "xray_bill.pdf",
        tag: "Bill/Invoice",
        url: "/documents/xray_bill.pdf",
        uploadedAt: "2025-04-10T14:00:00Z"
      },
      {
        id: "doc6",
        name: "xray_report.pdf",
        tag: "Imaging Report",
        url: "/documents/xray_report.pdf",
        uploadedAt: "2025-04-10T16:00:00Z"
      },
      {
        id: "doc7",
        name: "preauth_letter.pdf",
        tag: "Preauth letter",
        url: "/documents/preauth_letter.pdf",
        uploadedAt: "2025-04-10T13:30:00Z"
      }
    ],
    payments: [
      {
        id: "pay3",
        type: "Insurance",
        amount: 120000,
        date: "2025-04-15",
        mode: "NEFT",
        reference: "NEFT202504152345"
      }
    ],
    notes: [
      {
        id: "note2",
        author: "Insurance Team",
        visibility: "external",
        text: "Awaiting final approval from medical underwriter",
        createdAt: "2025-04-12T10:00:00Z"
      }
    ],
    createdAt: "2025-04-10T13:00:00Z",
    updatedAt: "2025-04-15T12:00:00Z",
    history: [
      {
        at: "2025-04-10T13:00:00Z",
        by: "Receptionist",
        action: "Created"
      },
      {
        at: "2025-04-10T17:00:00Z",
        by: "Billing Team",
        action: "Submitted"
      },
      {
        at: "2025-04-11T09:00:00Z",
        by: "System",
        action: "StatusChanged:In Review"
      }
    ]
  }
];
