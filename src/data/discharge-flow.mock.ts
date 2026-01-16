import {
  DischargeFlowState,
  PendingBill,
  DoctorClearance,
  DischargeSummaryData,
  PatientSnapshot,
  DischargeConfig,
  ClinicalChecklist,
} from "@/types/discharge-flow";

// Default config
export const DEFAULT_DISCHARGE_CONFIG: DischargeConfig = {
  requireBillingClearanceToFinalize: true,
  enableeSignForDoctor: true,
  enablePDFDownload: true,
  enablePatientPortalShare: true,
};

// Sample patient snapshot
export const SAMPLE_PATIENT_SNAPSHOT: PatientSnapshot = {
  patientId: "P-12345",
  name: "Harish Kalyan",
  mrn: "GDID-001",
  age: 44,
  sex: "M",
  ward: "Cardiac ICU",
  bed: "C-302",
  diagnosis: "Unstable Angina (I20.0)",
  allergies: ["Penicillin", "Sulfa drugs"],
  codeStatus: "Full Code",
  admittingTeam: "Cardiology",
  admissionDate: "2025-12-18T10:30:00",
};

// Sample pending bills
export const SAMPLE_PENDING_BILLS: PendingBill[] = [
  {
    billNumber: "BIL236",
    serviceDateFrom: "2025-12-18",
    serviceDateTo: "2025-12-22",
    payerType: "Self",
    totalAmount: 85000,
    paidAmount: 20000,
    outstandingAmount: 65000,
    lastPaymentAt: "2025-12-18T11:00:00",
    status: "PartiallyPaid",
    serviceName: "Cardiology Consultation",
    doctorName: "Dr. Arun Kumar",
    department: "Cardiology",
    lineItems: [
      { code: "BED-ICU-001", description: "ICU Bed Charges (4 days)", quantity: 4, unitCost: 8000, tax: 1440, discount: 0, net: 33440 },
      { code: "CONS-CARD-001", description: "Cardiology Consultation", quantity: 2, unitCost: 2500, tax: 450, discount: 0, net: 5450, clinician: "Dr. Arun Kumar" },
      { code: "PROC-CATH-001", description: "Cardiac Catheterization", quantity: 1, unitCost: 25000, tax: 4500, discount: 2000, net: 27500, clinician: "Dr. Arun Kumar" },
      { code: "DIAG-ECHO-001", description: "Echocardiography", quantity: 1, unitCost: 3500, tax: 630, discount: 0, net: 4130 },
      { code: "LAB-CBC-001", description: "Complete Blood Count", quantity: 3, unitCost: 450, tax: 81, discount: 0, net: 1431 },
      { code: "LAB-LIPID-001", description: "Lipid Profile", quantity: 1, unitCost: 850, tax: 153, discount: 0, net: 1003 },
      { code: "MED-INJ-001", description: "Injectable Medications", quantity: 1, unitCost: 5200, tax: 936, discount: 0, net: 6136 },
      { code: "MED-ORAL-001", description: "Oral Medications", quantity: 1, unitCost: 1800, tax: 324, discount: 0, net: 2124 },
    ],
    payments: [
      { date: "2025-12-18T11:00:00", method: "upi", reference: "UPI123456", amount: 20000, remarks: "Advance payment" },
    ],
    notes: "Patient requested itemized bill",
  },
  {
    billNumber: "BIL237",
    serviceDateFrom: "2025-12-21",
    serviceDateTo: "2025-12-21",
    payerType: "Self",
    totalAmount: 12500,
    paidAmount: 0,
    outstandingAmount: 12500,
    status: "Pending",
    serviceName: "CT Coronary Angiography",
    doctorName: "Dr. Meera Nair",
    department: "Radiology",
    lineItems: [
      { code: "DIAG-CTA-001", description: "CT Coronary Angiography", quantity: 1, unitCost: 12500, tax: 2250, discount: 2250, net: 12500, clinician: "Dr. Meera Nair" },
    ],
    payments: [],
  },
];

// Default clinical checklist
export const DEFAULT_CLINICAL_CHECKLIST: ClinicalChecklist = {
  stableVitals: false,
  afebrile: false,
  painControlled: false,
  oxygenBaseline: false,
  toleratingDiet: false,
  mobilitySafe: false,
  anticoagPlan: false,
  ivRemovedOrPlan: false,
  drainsSafe: false,
  criticalLabsReviewed: false,
  imagingReviewed: false,
  returnPrecautionsGiven: false,
};

// Sample doctor clearance
export const SAMPLE_DOCTOR_CLEARANCE: DoctorClearance = {
  patientId: "P-12345",
  encounterId: "E-98765",
  clinicalStatus: {
    checklist: {
      stableVitals: true,
      afebrile: true,
      painControlled: true,
      oxygenBaseline: true,
      toleratingDiet: true,
      mobilitySafe: true,
      anticoagPlan: true,
      ivRemovedOrPlan: true,
      drainsSafe: true,
      criticalLabsReviewed: true,
      imagingReviewed: true,
      returnPrecautionsGiven: true,
    },
    dischargeReason: "improved",
    conditionAtDischarge: "Stable",
    destination: "Home",
    vitalsSnapshot: {
      timestamp: "2025-12-22T08:00:00",
      bp: "126/78",
      pulse: 72,
      temp: 98.4,
      spo2: 98,
      respRate: 16,
    },
    labsSummary: [
      { name: "Troponin I", value: "0.02 ng/mL", date: "2025-12-22", critical: false },
      { name: "BNP", value: "120 pg/mL", date: "2025-12-22" },
      { name: "Creatinine", value: "1.0 mg/dL", date: "2025-12-22" },
      { name: "HbA1c", value: "7.2%", date: "2025-12-20" },
    ],
    imagingSummary: [
      { type: "Echo", date: "2025-12-19", impression: "LVEF 55%, mild MR, no regional wall motion abnormality" },
      { type: "CT Angio", date: "2025-12-21", impression: "50% stenosis LAD, no significant CAD" },
    ],
  },
  medicationReconciliation: {
    items: [
      { 
        medId: "med-001", 
        name: "Aspirin", 
        genericName: "Acetylsalicylic Acid",
        brandName: "Ecosprin",
        drugCode: "B01AC06",
        action: "Continue", 
        strength: "75mg",
        form: "Tablet",
        dose: "1 tablet", 
        route: "PO", 
        frequency: "Morning (After Breakfast)", 
        duration: "Lifelong",
        instructions: "Take after breakfast with water"
      },
      { 
        medId: "med-002", 
        name: "Atorvastatin", 
        genericName: "Atorvastatin Calcium",
        brandName: "Lipitor",
        drugCode: "C10AA05",
        action: "Continue", 
        strength: "40mg",
        form: "Tablet",
        dose: "1 tablet", 
        route: "PO", 
        frequency: "Night (At Bedtime)", 
        duration: "Lifelong",
        instructions: "Take at bedtime"
      },
      { 
        medId: "med-003", 
        name: "Metoprolol Succinate ER", 
        genericName: "Metoprolol Succinate",
        brandName: "Seloken XL",
        drugCode: "C07AB02",
        action: "Continue", 
        strength: "50mg",
        form: "Extended Release Tablet",
        dose: "1 tablet", 
        route: "PO", 
        frequency: "Morning & Night", 
        duration: "3 months",
        instructions: "Do not crush or chew. Do not stop suddenly"
      },
      { 
        medId: "med-004", 
        name: "Clopidogrel", 
        genericName: "Clopidogrel Bisulfate",
        brandName: "Plavix",
        drugCode: "B01AC04",
        action: "Start", 
        strength: "75mg",
        form: "Tablet",
        dose: "1 tablet", 
        route: "PO", 
        frequency: "Morning (With Food)", 
        duration: "1 year",
        instructions: "Take with food. Anti-platelet therapy post-catheterization"
      },
      { 
        medId: "med-005", 
        name: "Ramipril", 
        genericName: "Ramipril",
        brandName: "Cardace",
        drugCode: "C09AA05",
        action: "Start", 
        strength: "5mg",
        form: "Capsule",
        dose: "1 capsule", 
        route: "PO", 
        frequency: "Morning", 
        duration: "Lifelong",
        instructions: "Monitor blood pressure regularly. Report dry cough"
      },
      { 
        medId: "med-006", 
        name: "Pantoprazole", 
        genericName: "Pantoprazole Sodium",
        brandName: "Pan-D",
        drugCode: "A02BC02",
        action: "Start", 
        strength: "40mg",
        form: "Enteric Coated Tablet",
        dose: "1 tablet", 
        route: "PO", 
        frequency: "Before Breakfast (30 min)", 
        duration: "1 month",
        instructions: "Take 30 minutes before breakfast on empty stomach"
      },
      { 
        medId: "med-007", 
        name: "Metformin SR", 
        genericName: "Metformin Hydrochloride",
        brandName: "Glycomet SR",
        drugCode: "A10BA02",
        action: "Continue", 
        strength: "500mg",
        form: "Sustained Release Tablet",
        dose: "1 tablet", 
        route: "PO", 
        frequency: "Morning & Night (With Meals)", 
        duration: "Lifelong",
        instructions: "Take with meals to reduce GI upset"
      },
      { 
        medId: "med-008", 
        name: "Rosuvastatin", 
        genericName: "Rosuvastatin Calcium",
        brandName: "Crestor",
        drugCode: "C10AA07",
        action: "Continue", 
        strength: "10mg",
        form: "Tablet",
        dose: "1 tablet", 
        route: "PO", 
        frequency: "Night (At Bedtime)", 
        duration: "Lifelong",
        instructions: "Take at bedtime for optimal effect"
      },
    ],
    completed: true,
  },
  ordersInstructions: {
    homeCare: {
      nursing: false,
      physiotherapy: true,
      woundCare: false,
      notes: "Cardiac rehabilitation exercises 3x/week",
    },
    activity: {
      level: "LightActivity",
      restrictions: "No heavy lifting (>5kg), no driving for 1 week",
    },
    diet: {
      type: "Diabetic",
      fluidRestriction: "2L/day",
      customNotes: "Low salt, low fat cardiac diet",
    },
    investigationsAfterDischarge: [
      { type: "Lab", name: "Lipid Profile", dueDate: "2026-01-05" },
      { type: "Lab", name: "HbA1c", dueDate: "2026-03-20" },
      { type: "Imaging", name: "Follow-up Echo", dueDate: "2026-03-22" },
    ],
    returnPrecautions: [
      "Chest pain or discomfort",
      "Shortness of breath at rest",
      "Palpitations or irregular heartbeat",
      "Fever > 101°F",
      "Swelling in legs",
      "Uncontrolled bleeding from catheter site",
    ],
    language: "en",
  },
  followUps: {
    followUpDate: "2025-12-29",
    appointments: [],
    externalReferrals: [],
    certificates: {},
  },
  notesAttachments: {
    doctorNote: "Patient is a 44-year-old male with Type 2 DM and HTN who presented with unstable angina. Cardiac catheterization showed 50% LAD stenosis managed medically. Patient stable throughout admission with good response to medical management. Discharge planned with dual antiplatelet therapy and cardiac rehab referral.",
    attachments: [],
  },
  signoff: {
    confirmFitForDischarge: false,
  },
  status: "in_progress",
  lastUpdated: "2025-12-22T12:00:00",
};

// Sample discharge summary
export const SAMPLE_DISCHARGE_SUMMARY: DischargeSummaryData = {
  header: {
    patientId: "P-12345",
    encounterId: "E-98765",
    admissionAt: "2025-12-18T10:30:00",
    dischargeAt: "2025-12-22T14:45:00",
    attending: "Dr. Arun Kumar",
    service: "Cardiology",
  },
  diagnoses: {
    primary: { code: "I20.0", text: "Unstable Angina" },
    secondary: [
      { code: "I10", text: "Essential Hypertension" },
      { code: "E11.9", text: "Type 2 Diabetes Mellitus" },
    ],
  },
  hospitalCourse: "Patient presented with chest pain of 2-day duration. Initial troponin mildly elevated. ECG showed ST depression in lateral leads. Started on antiplatelet therapy and heparin. Cardiac catheterization on Day 1 showed 50% LAD stenosis - managed medically. Echocardiography showed preserved LVEF of 55% with mild MR. CT Coronary Angiography confirmed findings. Patient remained hemodynamically stable throughout. Pain resolved with medical management. Blood sugars optimized with adjustment of diabetic medications.",
  procedures: [
    {
      name: "Cardiac Catheterization",
      date: "2025-12-18T14:00:00",
      operator: "Dr. Arun Kumar",
      anesthesia: "Local with conscious sedation",
      findings: "50% stenosis in mid LAD, no other significant lesions",
      complications: "None",
    },
  ],
  investigations: [
    { type: "Lab", name: "Troponin I", date: "2025-12-18", resultSummary: "0.15 ng/mL (mildly elevated)", critical: true },
    { type: "Lab", name: "Troponin I (Follow-up)", date: "2025-12-22", resultSummary: "0.02 ng/mL (normal)" },
    { type: "Lab", name: "BNP", date: "2025-12-22", resultSummary: "120 pg/mL (normal)" },
    { type: "Imaging", name: "Echocardiography", date: "2025-12-19", resultSummary: "LVEF 55%, mild MR, no RWMA" },
    { type: "Imaging", name: "CT Coronary Angiography", date: "2025-12-21", resultSummary: "50% LAD stenosis, no significant CAD" },
  ],
  conditionAtDischarge: "Stable",
  devicesAndLines: [
    { type: "Peripheral IV", status: "Removed" },
    { type: "Urinary Catheter", status: "Removed" },
  ],
  dischargeMeds: SAMPLE_DOCTOR_CLEARANCE.medicationReconciliation.items.filter(m => m.action !== "Stop"),
  allergies: [
    { substance: "Penicillin", reaction: "Rash", severity: "Moderate" },
    { substance: "Sulfa drugs", reaction: "Hives", severity: "Mild" },
  ],
  instructions: {
    diet: "Diabetic, low salt, low fat cardiac diet. 2L fluid restriction per day.",
    activity: "Light activity. No heavy lifting (>5kg). No driving for 1 week.",
    woundCare: "Keep catheter insertion site clean and dry. Remove bandage after 24 hours.",
    returnPrecautions: [
      "Chest pain or discomfort",
      "Shortness of breath at rest",
      "Palpitations or irregular heartbeat",
      "Fever > 101°F",
    ],
  },
  followUps: SAMPLE_DOCTOR_CLEARANCE.followUps,
  pendingResults: [
    { name: "Lipid Panel", expectedDate: "2026-01-05", responsible: "Dr. Arun Kumar" },
  ],
  certificates: {
    sickLeaveDays: 14,
    startDate: "2025-12-22",
  },
  billingSummary: {
    total: 112500,
    paid: 35000,
    outstanding: 77500,
    status: "PartiallyPaid",
  },
  signatures: [
    { name: "Dr. Priya Sharma", role: "Resident Doctor" },
    { name: "Dr. Arun Kumar", role: "Consultant Cardiologist" },
  ],
  status: "pending",
  lastUpdated: "2025-12-22T14:00:00",
};

// Initial discharge flow state
export const INITIAL_DISCHARGE_FLOW_STATE: DischargeFlowState = {
  patientId: "P-12345",
  encounterId: "E-98765",
  currentStep: 1,
  config: DEFAULT_DISCHARGE_CONFIG,
  userRole: "admin",
  pendingBills: SAMPLE_PENDING_BILLS,
  doctorClearance: undefined,
  dischargeSummary: undefined,
  stepStatuses: {
    step1: "pending",
    step2: "pending",
    step3: "pending",
  },
  isDirty: false,
};
