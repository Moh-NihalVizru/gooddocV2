// ═══════════════════════════════════════════════════════════════════════════
// DISCHARGE FLOW - TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════

// Config flags
export interface DischargeConfig {
  requireBillingClearanceToFinalize: boolean;
  enableeSignForDoctor: boolean;
  enablePDFDownload: boolean;
  enablePatientPortalShare: boolean;
}

// Permission levels
export type UserRole = 'billing' | 'doctor' | 'nurse' | 'medical_records' | 'admin';

export interface StepPermission {
  canView: boolean;
  canEdit: boolean;
  canFinalize?: boolean;
}

// Step statuses
export type StepStatus = 'pending' | 'in_progress' | 'cleared' | 'finalized';

// ═══════════════════════════════════════════════════════════════════════════
// STEP 1 - PENDING BILL TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type BillStatus = 'Pending' | 'PartiallyPaid' | 'Cleared' | 'OnHold';
export type PayerType = 'Self' | 'Insurance' | 'TPA';
export type PaymentMethod = 'cash' | 'card' | 'upi' | 'neft' | 'cheque' | 'insurance';

export interface PendingBill {
  billNumber: string;
  serviceDateFrom: string;
  serviceDateTo: string;
  payerType: PayerType;
  payerName?: string;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  lastPaymentAt?: string;
  status: BillStatus;
  serviceName?: string;
  doctorName?: string;
  department?: string;
  lineItems: BillLineItem[];
  insurance?: BillInsurance;
  payments: BillPayment[];
  notes?: string;
}

export interface BillLineItem {
  code: string;
  description: string;
  quantity: number;
  unitCost: number;
  tax: number;
  discount: number;
  net: number;
  dateTime?: string;
  clinician?: string;
}

export interface BillInsurance {
  policyNumber?: string;
  coveragePercent?: number;
  preauthNumber?: string;
  approvedAmount?: number;
  tpaRemarks?: string;
}

export interface BillPayment {
  date: string;
  method: PaymentMethod;
  reference?: string;
  amount: number;
  remarks?: string;
}

export interface BillAdjustment {
  type: 'package' | 'concession' | 'write_off';
  reason: string;
  amount: number;
  approvedBy?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// STEP 2 - DOCTOR CLEARANCE TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type ConditionAtDischarge = 'Stable' | 'Improved' | 'Unchanged' | 'Guarded' | 'Critical';
export type DischargeDestination = 'Home' | 'Rehab' | 'SNF' | 'Other';
export type MedicationAction = 'Continue' | 'Start' | 'Change' | 'Stop';
export type ActivityLevel = 'BedRest' | 'LightActivity' | 'AsTolerated';
export type DietType = 'Regular' | 'Diabetic' | 'Renal' | 'Custom';

// Comprehensive discharge reasons covering all hospital scenarios
export type DischargeReason = 
  | 'treatment_completed'      // Treatment completed successfully
  | 'improved'                 // Condition improved, stable for home care
  | 'referred_higher_center'   // Referred to higher center for advanced care
  | 'transferred_other_hospital' // Transferred to another hospital
  | 'lama'                     // Left Against Medical Advice
  | 'absconded'               // Patient absconded/left without notice
  | 'death'                   // Death during admission
  | 'brought_dead'            // Brought dead to hospital
  | 'dama'                    // Discharge Against Medical Advice (requested by family)
  | 'not_improved'            // Condition not improved
  | 'palliative_home'         // Palliative/terminal care at home
  | 'other';                  // Other reason

export const DISCHARGE_REASON_CONFIG: Record<DischargeReason, {
  label: string;
  description: string;
  requiresMedications: boolean;
  requiresFollowUp: boolean;
  requiresChecklist: boolean;
  requiresDestination: boolean;
  confirmationText: string;
}> = {
  treatment_completed: {
    label: 'Treatment Completed',
    description: 'Patient has completed full course of treatment',
    requiresMedications: true,
    requiresFollowUp: true,
    requiresChecklist: true,
    requiresDestination: true,
    confirmationText: 'I confirm this patient has completed treatment and is fit for discharge'
  },
  improved: {
    label: 'Condition Improved',
    description: 'Patient condition improved, stable for home care',
    requiresMedications: true,
    requiresFollowUp: true,
    requiresChecklist: true,
    requiresDestination: true,
    confirmationText: 'I confirm this patient is fit for discharge and all clinical requirements have been met'
  },
  referred_higher_center: {
    label: 'Referred to Higher Center',
    description: 'Patient requires advanced care at specialized facility',
    requiresMedications: true,
    requiresFollowUp: false,
    requiresChecklist: false,
    requiresDestination: true,
    confirmationText: 'I confirm the referral details and transfer arrangements are complete'
  },
  transferred_other_hospital: {
    label: 'Transferred to Other Hospital',
    description: 'Patient transferred to another healthcare facility',
    requiresMedications: true,
    requiresFollowUp: false,
    requiresChecklist: false,
    requiresDestination: true,
    confirmationText: 'I confirm the transfer details and receiving facility coordination is complete'
  },
  lama: {
    label: 'Left Against Medical Advice (LAMA)',
    description: 'Patient leaving against medical advice',
    requiresMedications: false,
    requiresFollowUp: false,
    requiresChecklist: false,
    requiresDestination: false,
    confirmationText: 'I confirm the patient has been counseled about risks and LAMA consent obtained'
  },
  absconded: {
    label: 'Absconded',
    description: 'Patient left without informing staff',
    requiresMedications: false,
    requiresFollowUp: false,
    requiresChecklist: false,
    requiresDestination: false,
    confirmationText: 'I confirm the patient absconded and appropriate authorities have been notified'
  },
  death: {
    label: 'Death',
    description: 'Patient expired during admission',
    requiresMedications: false,
    requiresFollowUp: false,
    requiresChecklist: false,
    requiresDestination: false,
    confirmationText: 'I confirm the death and all required documentation (death certificate, summary) is complete'
  },
  brought_dead: {
    label: 'Brought Dead',
    description: 'Patient was brought dead to hospital',
    requiresMedications: false,
    requiresFollowUp: false,
    requiresChecklist: false,
    requiresDestination: false,
    confirmationText: 'I confirm brought dead status and required documentation is complete'
  },
  dama: {
    label: 'Discharge Against Medical Advice (DAMA)',
    description: 'Family requested discharge against medical advice',
    requiresMedications: false,
    requiresFollowUp: false,
    requiresChecklist: false,
    requiresDestination: false,
    confirmationText: 'I confirm the family has been counseled about risks and DAMA consent obtained'
  },
  not_improved: {
    label: 'Not Improved',
    description: 'Patient condition unchanged despite treatment',
    requiresMedications: true,
    requiresFollowUp: true,
    requiresChecklist: true,
    requiresDestination: true,
    confirmationText: 'I confirm discharge with continued care plan and follow-up arranged'
  },
  palliative_home: {
    label: 'Palliative/Terminal Care at Home',
    description: 'Patient discharged for end-of-life care at home',
    requiresMedications: true,
    requiresFollowUp: false,
    requiresChecklist: false,
    requiresDestination: true,
    confirmationText: 'I confirm palliative care arrangements and family counseling is complete'
  },
  other: {
    label: 'Other',
    description: 'Other discharge reason',
    requiresMedications: true,
    requiresFollowUp: true,
    requiresChecklist: true,
    requiresDestination: true,
    confirmationText: 'I confirm all discharge requirements have been met'
  }
};

export interface ClinicalChecklist {
  stableVitals: boolean;
  stableVitalsComment?: string;
  afebrile: boolean;
  afebrileComment?: string;
  painControlled: boolean;
  painControlledComment?: string;
  oxygenBaseline: boolean;
  oxygenBaselineComment?: string;
  toleratingDiet: boolean;
  toleratingDietComment?: string;
  mobilitySafe: boolean;
  mobilitySafeComment?: string;
  anticoagPlan: boolean;
  anticoagPlanComment?: string;
  ivRemovedOrPlan: boolean;
  ivRemovedOrPlanComment?: string;
  drainsSafe: boolean;
  drainsSafeComment?: string;
  criticalLabsReviewed: boolean;
  criticalLabsReviewedComment?: string;
  imagingReviewed: boolean;
  imagingReviewedComment?: string;
  returnPrecautionsGiven: boolean;
  returnPrecautionsGivenComment?: string;
}

export interface ClinicalStatus {
  checklist: ClinicalChecklist;
  dischargeReason: DischargeReason;
  dischargeReasonNotes?: string;
  conditionAtDischarge: ConditionAtDischarge;
  destination: DischargeDestination;
  justification?: string;
  vitalsSnapshot?: VitalsSnapshot;
  labsSummary?: LabSummary[];
  imagingSummary?: ImagingSummary[];
}

export interface VitalsSnapshot {
  timestamp: string;
  bp: string;
  pulse: number;
  temp: number;
  spo2: number;
  respRate?: number;
}

export interface LabSummary {
  name: string;
  value: string;
  date: string;
  critical?: boolean;
}

export interface ImagingSummary {
  type: string;
  date: string;
  impression: string;
}

export interface MedicationReconciliationItem {
  medId: string;
  name: string;
  genericName?: string;
  brandName?: string;
  drugCode?: string;
  action: MedicationAction;
  strength?: string;
  form?: string;
  dose: string;
  route: string;
  frequency: string;
  duration: string;
  instructions?: string;
  reason?: string;
  interactionsOverridden?: boolean;
  overrideReason?: string;
  hasInteraction?: boolean;
  hasAllergyConflict?: boolean;
}

export interface HomeCareOrders {
  nursing: boolean;
  physiotherapy: boolean;
  woundCare: boolean;
  catheterCare?: boolean;
  drainCare?: boolean;
  notes?: string;
}

export interface ActivityOrders {
  level: ActivityLevel;
  restrictions?: string;
}

export interface DietOrders {
  type: DietType;
  fluidRestriction?: string;
  customNotes?: string;
}

export interface InvestigationAfterDischarge {
  type: 'Lab' | 'Imaging';
  name: string;
  dueDate: string;
}

export interface OrdersInstructions {
  homeCare: HomeCareOrders;
  activity: ActivityOrders;
  diet: DietOrders;
  investigationsAfterDischarge: InvestigationAfterDischarge[];
  returnPrecautions: string[];
  returnPrecautionsNotes?: string;
  language: string;
}

export interface Appointment {
  service: string;
  provider?: string;
  location: string;
  datetime?: string;
  telehealth?: boolean;
  toBeScheduled?: boolean;
}

export interface ExternalReferral {
  providerName: string;
  contact?: string;
  address?: string;
  notes?: string;
}

export interface Certificates {
  sickLeaveDays?: number;
  startDate?: string;
  fitToTravel?: boolean;
}

export interface FollowUps {
  followUpDate?: string;
  followUpReason?: string;
  appointments: Appointment[];
  externalReferrals: ExternalReferral[];
  certificates: Certificates;
}

export interface DischargeAttachment {
  fileId: string;
  name: string;
  type: string;
  url?: string;
}

export interface NotesAttachments {
  doctorNote: string;
  attachments: DischargeAttachment[];
}

export interface ESign {
  byUserId: string;
  signedAt: string;
}

export interface Signoff {
  confirmFitForDischarge: boolean;
  eSign?: ESign;
}

export interface DoctorClearance {
  patientId: string;
  encounterId: string;
  clinicalStatus: ClinicalStatus;
  medicationReconciliation: {
    items: MedicationReconciliationItem[];
    completed: boolean;
    noMedsConfirmed?: boolean;
  };
  ordersInstructions: OrdersInstructions;
  followUps: FollowUps;
  notesAttachments: NotesAttachments;
  signoff: Signoff;
  status: StepStatus;
  lastUpdated?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// STEP 3 - DISCHARGE SUMMARY TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface DiagnosisCode {
  code: string;
  text: string;
}

export interface Procedure {
  name: string;
  date: string;
  operator: string;
  anesthesia?: string;
  findings?: string;
  implants?: string;
  complications?: string;
}

export interface InvestigationResult {
  type: 'Lab' | 'Imaging';
  name: string;
  date: string;
  resultSummary: string;
  critical?: boolean;
}

export interface DeviceLine {
  type: string;
  status: 'Removed' | 'Continued';
  carePlan?: string;
}

export interface Allergy {
  substance: string;
  reaction: string;
  severity: 'Mild' | 'Moderate' | 'Severe';
}

export interface Instructions {
  diet: string;
  activity: string;
  woundCare?: string;
  deviceCare?: string;
  returnPrecautions: string[];
}

export interface PendingResult {
  name: string;
  expectedDate: string;
  responsible?: string;
}

export interface BillingSummary {
  total: number;
  paid: number;
  outstanding: number;
  status: BillStatus;
}

export interface Signature {
  name: string;
  role: string;
  signedAt?: string;
  method?: 'PIN' | 'OTP' | 'Digital';
}

export interface DischargeSummaryData {
  header: {
    patientId: string;
    encounterId: string;
    admissionAt: string;
    dischargeAt?: string;
    attending: string;
    service: string;
  };
  diagnoses: {
    primary: DiagnosisCode;
    secondary: DiagnosisCode[];
  };
  hospitalCourse: string;
  procedures: Procedure[];
  investigations: InvestigationResult[];
  conditionAtDischarge: ConditionAtDischarge;
  devicesAndLines: DeviceLine[];
  dischargeMeds: MedicationReconciliationItem[];
  allergies: Allergy[];
  instructions: Instructions;
  followUps: FollowUps;
  pendingResults: PendingResult[];
  certificates: Certificates;
  billingSummary: BillingSummary;
  signatures: Signature[];
  status: StepStatus;
  lastUpdated?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMBINED DISCHARGE FLOW STATE
// ═══════════════════════════════════════════════════════════════════════════

export interface DischargeFlowState {
  patientId: string;
  encounterId: string;
  currentStep: 1 | 2 | 3;
  config: DischargeConfig;
  userRole: UserRole;
  pendingBills: PendingBill[];
  doctorClearance?: DoctorClearance;
  dischargeSummary?: DischargeSummaryData;
  stepStatuses: {
    step1: StepStatus;
    step2: StepStatus;
    step3: StepStatus;
  };
  isDirty: boolean;
  lastAutoSave?: string;
}

export interface PatientSnapshot {
  patientId: string;
  name: string;
  mrn: string;
  age: number;
  sex: 'M' | 'F';
  ward: string;
  bed: string;
  diagnosis: string;
  allergies: string[];
  codeStatus?: string;
  admittingTeam: string;
  admissionDate: string;
}
