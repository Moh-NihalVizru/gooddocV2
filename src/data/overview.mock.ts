// Mock data for Overview list pages - Hospital Operations Dashboard

import { format, subDays, subHours, subMinutes, addDays } from "date-fns";
import { formatVisitId } from "@/utils/visitId";

// ============== TYPE DEFINITIONS ==============

export interface OPPatientRecord {
  mrn: string;
  patient: string;
  ageSex: string;
  contact: string;
  visitId: string;
  appointmentTime: string;
  department: string;
  provider: string;
  visitReason: string;
  status: "Scheduled" | "Pending" | "Checked-in" | "With Doctor" | "Awaiting Billing" | "Completed" | "No-show" | "Canceled" | "Open";
  checkInTime?: string;
  waitingTime?: string;
  tokenQueueNo?: string;
  insurancePlan?: string;
  billingStatus?: "Paid" | "Pending" | "Partially Paid";
  prescriptions?: number;
  labsOrdered?: number;
  radiologyOrdered?: number;
  completionTime?: string;
  followUpDate?: string;
  triageDone?: boolean;
  paymentStatus?: string;
  reminderStatus?: "Not Sent" | "Sent" | "Confirmed";
  insuranceVerified?: boolean;
  noShowRisk?: "Low" | "Med" | "High";
  // Payment details
  billAmount?: number;
  advancePaid?: number;
  totalPaid?: number;
}

export interface IPPatientRecord {
  mrn: string;
  patient: string;
  ageSex: string;
  visitId: string;
  admitDateTime: string;
  ward: string;
  room: string;
  bed: string;
  bedClass: "ICU" | "HDU" | "Private" | "Ward";
  attendingDoctor: string;
  primaryDiagnosis: string;
  lengthOfStay: number;
  emergencyContact?: string;
  isolation?: string;
  source?: "ER" | "OPD" | "Transfer";
  admittingDiagnosis?: string;
  admittingDoctor?: string;
  dischargeDateTime?: string;
  dischargeType?: "Home" | "Transfer" | "AMA" | "Expired";
  billingStatus?: "Paid" | "Pending" | "Partially Paid";
  dischargeSummary?: "Ready" | "Not Ready";
  followUpAppointment?: string;
  plannedDischargeDateTime?: string;
  blockingTasks?: string[];
  // Payment details
  billAmount?: number;
  advancePaid?: number;
  admissionFee?: number;
  totalPaid?: number;
  // Status
  ipStatus: "admitted" | "discharged";
}

export interface BedRecord {
  bedNo: string;
  ward: string;
  room: string;
  bed: string;
  bedType: "ICU" | "HDU" | "Ward" | "Private" | "Isolation";
  status: "Available" | "Reserved";
  dailyRate: number;
  totalPerDay: number;
  // Transfer details
  transferPatient?: string;
  transferFrom?: string;
  transferTo?: string;
}

export interface ERCaseRecord {
  mrn: string;
  patient: string;
  ageSex: string;
  visitId: string;
  triageLevel: 1 | 2 | 3 | 4 | 5;
  arrivalTime: string;
  modeOfArrival: "Ambulance" | "Walk-in" | "Transfer";
  erZoneArea: string;
  bedChair: string;
  attending: string;
  chiefComplaint: string;
  timeSinceArrival: string;
  disposition: "Pending" | "Admit" | "Discharge" | "Transfer";
}

export interface DoctorOnDutyRecord {
  doctorName: string;
  degrees: string;
  specialty: string;
  role: "Onsite" | "On-call" | "In OPD" | "In OT" | "In Ward Rounds" | "In Procedure" | "Break" | "Remote";
  shiftStart: string;
  shiftEnd: string;
  currentLocation: string;
  contactPager: string;
  // Extended fields for detailed views
  department?: string;
  opdRoom?: string;
  currentStatus?: "Available" | "With Patient" | "In Procedure" | "On Break" | "In Meeting";
  queueLength?: number;
  nextAppointmentAt?: string;
  slotsAvailable?: number;
  avgConsultTime?: number;
  primaryUnits?: string;
  onCallStatus?: boolean;
  ipCensus?: number;
  roundsStartTime?: string;
  nextTask?: string;
  context?: string;
  casesToday?: number;
  notes?: string;
  dutyContext: "OP" | "IP" | "Other";
}

export interface TransferRecord {
  transferId: string;
  mrn: string;
  patient: string;
  ageSex: string;
  visitId: string;
  priority: "Routine" | "Urgent" | "Stat";
  transferType: "Intra-ward" | "Inter-ward" | "To ICU" | "To HDU" | "Room Change" | "Bed Swap" | "Inter-facility";
  fromWard: string;
  fromRoom: string;
  fromBed: string;
  fromBedClass: "ICU" | "HDU" | "Ward" | "Private" | "Isolation";
  toWard: string;
  toRoom: string;
  toBed: string;
  toBedClass: "ICU" | "HDU" | "Ward" | "Private" | "Isolation";
  reason: string;
  requestingClinician: string;
  approver?: string;
  status: "Requested" | "Approved" | "Bed Reserved" | "In Transit" | "Completed" | "Canceled";
  requestedAt: string;
  approvedAt?: string;
  transferStartAt?: string;
  arrivedAt?: string;
  equipmentNeeded?: string;
  isolationRequired: boolean;
  transportTeam?: string;
  notesBlockers?: string;
}

export interface AppointmentRequestRecord {
  requestId: string;
  patient: string;
  ageSex: string;
  contact: string;
  email: string;
  preferredDate: string;
  preferredTime: string;
  department: string;
  preferredProvider?: string;
  reason: string;
  visitType: "OP" | "IP" | "Emergency" | "Follow-up";
  urgency: "Low" | "Med" | "High";
  source: "Call" | "Portal" | "Walk-in" | "Referral";
  insuranceVerified: boolean;
  status: "New" | "Pending" | "Scheduled" | "Rejected";
  createdAt: string;
}

export interface LabOrderRecord {
  orderId: string;
  patient: string;
  ageSex: string;
  visitId: string;
  location: string;
  tests: string;
  priority: "Routine" | "Stat";
  status: "Ordered" | "Collected" | "In-Process" | "Completed" | "Verified";
  specimenType: string;
  collectedAt?: string;
  resultETA?: string;
  criticalResult: boolean;
  orderTime: string;
}

export interface SurgeryRecord {
  caseId: string;
  patient: string;
  ageSex: string;
  visitId: string;
  procedure: string;
  surgeon: string;
  orRoom: string;
  startTime: string;
  estimatedDuration: string;
  status: "Scheduled" | "In-Progress" | "Completed" | "Canceled";
  anesthesiaType: string;
  asaClass: string;
  postOpBedReserved: boolean;
}

export interface MedicineOrderRecord {
  orderId: string;
  patient: string;
  ageSex: string;
  visitId: string;
  location: string;
  prescriber: string;
  route: "PO" | "IV" | "IM" | "SC" | "Topical";
  priority: "Routine" | "Stat";
  dispensedAt?: string;
  orderTime: string;
  // Payment details
  paymentStatus: "Paid" | "Pending" | "Partially Paid" | "Waived";
  orderAmount: number;
  paidAmount: number;
}

export interface RadiologyOrderRecord {
  orderId: string;
  patient: string;
  ageSex: string;
  visitId: string;
  location: string;
  modality: "X-ray" | "CT" | "MRI" | "US" | "Fluoro" | "Mammo";
  exam: string;
  priority: "Routine" | "Stat";
  status: "Ordered" | "Scheduled" | "In-Progress" | "Completed" | "Finalized";
  scheduledTime: string;
  imagingLocation: string;
  contrast: boolean;
  pregnancySafetyFlags?: string;
  orderTime: string;
}

export interface LowStockRecord {
  itemName: string;
  category: "Drug" | "Consumable" | "Device";
  onHand: number;
  reorderPoint: number;
  parLevel: number;
  avgDailyUse: number;
  daysOfStockLeft: number;
  onOrder: number;
  supplier: string;
  leadTimeDays: number;
  suggestedReorderQty: number;
  severity: "Normal" | "Low" | "Critical";
}

// ============== HELPER FUNCTIONS ==============

const firstNames = ["Amit", "Priya", "Rahul", "Sneha", "Vikram", "Anjali", "Karthik", "Divya", "Suresh", "Lakshmi", "Rajan", "Meena", "Arjun", "Kavitha", "Sanjay"];
const lastNames = ["Sharma", "Patel", "Reddy", "Kumar", "Singh", "Nair", "Menon", "Rao", "Gupta", "Joshi", "Iyer", "Bhat", "Verma", "Mishra", "Das"];
const departments = ["Cardiology", "Orthopedics", "Neurology", "General Medicine", "Pediatrics", "Oncology", "ENT", "Dermatology", "Gastroenterology", "Pulmonology"];
const doctors = ["Dr. Meera Nair", "Dr. Rajesh Kumar", "Dr. Anita Singh", "Dr. Sunil Reddy", "Dr. Prakash Shah", "Dr. Priya Menon", "Dr. Arun Bhat", "Dr. Sunita Rao"];
const insurancePlans = ["Aetna PPO", "BlueCross", "United Healthcare", "Cigna", "Medicare", "Self-Pay", "Star Health", "HDFC Ergo"];
const visitReasons = ["Annual checkup", "Follow-up", "Chest pain", "Headache", "Joint pain", "Fever", "Cough", "Skin rash", "Diabetes review", "BP monitoring"];
const diagnoses = ["Hypertension", "Type 2 Diabetes", "COPD", "Coronary Artery Disease", "Osteoarthritis", "Pneumonia", "Appendicitis", "Cholecystitis", "Fracture", "Anemia"];
const chiefComplaints = ["Chest pain", "Shortness of breath", "Abdominal pain", "Trauma", "Altered consciousness", "Severe headache", "High fever", "Allergic reaction"];
const specimenTypes = ["Blood", "Urine", "Stool", "Swab", "CSF", "Sputum"];
const testPanels = ["CBC", "BMP", "CMP", "Lipid Panel", "LFT", "TFT", "Coagulation", "Cardiac Markers", "Urinalysis"];
const procedures = ["Appendectomy", "Knee Replacement", "Cardiac Bypass", "Cholecystectomy", "Hip Replacement", "Hernia Repair", "Cataract Surgery", "Spinal Fusion", "CABG", "Laparoscopy"];
const medicationNames = ["Metformin 500mg", "Amlodipine 5mg", "Lisinopril 10mg", "Omeprazole 20mg", "Atorvastatin 20mg", "Aspirin 81mg"];
const radiologyExams = ["Chest X-ray", "CT Abdomen", "MRI Brain", "US Abdomen", "CT Chest", "MRI Spine", "X-ray Knee", "CT Head"];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateName(index: number): string {
  return `${firstNames[index % firstNames.length]} ${lastNames[Math.floor(index / firstNames.length) % lastNames.length]}`;
}

function generateMRN(index: number): string {
  return `MRN${String(100000 + index).padStart(7, "0")}`;
}

function generateAgeSex(index: number): string {
  const age = 18 + Math.floor(Math.random() * 65);
  const sex = index % 2 === 0 ? "M" : "F";
  return `${age}/${sex}`;
}

function generatePhone(): string {
  return `+91 ${9}${Math.floor(Math.random() * 1000000000).toString().padStart(9, "0")}`;
}

function formatDateTime(date: Date): string {
  return format(date, "dd-MMM-yyyy HH:mm");
}

function formatTime(date: Date): string {
  return format(date, "HH:mm");
}

// ============== OP PATIENTS ==============

const now = new Date();
const today = format(now, "yyyy-MM-dd");

function generateOPPatient(index: number, statusOverride?: OPPatientRecord["status"]): OPPatientRecord {
  const statuses: OPPatientRecord["status"][] = ["Scheduled", "Pending", "Checked-in", "With Doctor", "Awaiting Billing", "Completed", "No-show", "Canceled"];
  const status = statusOverride || statuses[index % statuses.length];
  const appointmentHour = 8 + Math.floor(index / 50);
  const appointmentDate = new Date(now);
  appointmentDate.setHours(appointmentHour, (index * 7) % 60, 0, 0);

  const checkInDate = status !== "Scheduled" && status !== "Pending" && status !== "No-show" && status !== "Canceled"
    ? subMinutes(appointmentDate, Math.floor(Math.random() * 15))
    : undefined;

  const waitingMins = status === "Checked-in" || status === "With Doctor"
    ? Math.floor(Math.random() * 45) + 5
    : undefined;

  // Token only assigned after check-in (not for Scheduled, Pending, No-show, Canceled)
  const hasToken = status !== "Scheduled" && status !== "Pending" && status !== "No-show" && status !== "Canceled";

  return {
    mrn: generateMRN(index),
    patient: generateName(index),
    ageSex: generateAgeSex(index),
    contact: generatePhone(),
    visitId: formatVisitId(25, index + 1),
    appointmentTime: formatDateTime(appointmentDate),
    department: departments[index % departments.length],
    provider: doctors[index % doctors.length],
    visitReason: visitReasons[index % visitReasons.length],
    status,
    checkInTime: checkInDate ? formatDateTime(checkInDate) : undefined,
    waitingTime: waitingMins ? `${waitingMins} min` : undefined,
    tokenQueueNo: hasToken ? `T${String(index + 1).padStart(3, "0")}` : undefined,
    insurancePlan: insurancePlans[index % insurancePlans.length],
    billingStatus: status === "Completed" ? (["Paid", "Pending", "Partially Paid"] as const)[index % 3] : undefined,
    prescriptions: status === "Completed" ? Math.floor(Math.random() * 5) : undefined,
    labsOrdered: status === "Completed" ? Math.floor(Math.random() * 3) : undefined,
    radiologyOrdered: status === "Completed" ? Math.floor(Math.random() * 2) : undefined,
    completionTime: status === "Completed" ? formatDateTime(subMinutes(now, Math.floor(Math.random() * 120))) : undefined,
    followUpDate: status === "Completed" && Math.random() > 0.5 ? format(addDays(now, 7 + Math.floor(Math.random() * 21)), "dd-MMM-yyyy") : undefined,
    triageDone: status !== "Scheduled" && status !== "No-show" && status !== "Canceled" ? Math.random() > 0.2 : undefined,
    paymentStatus: status === "Checked-in" ? (Math.random() > 0.3 ? "Collected" : "Pending") : undefined,
    reminderStatus: status === "Scheduled" ? (["Not Sent", "Sent", "Confirmed"] as const)[index % 3] : undefined,
    insuranceVerified: Math.random() > 0.2,
    noShowRisk: status === "Scheduled" ? (["Low", "Med", "High"] as const)[index % 3] : undefined,
  };
}

// 847 OP Patients with various statuses
export const opPatients: OPPatientRecord[] = Array.from({ length: 847 }, (_, i) => generateOPPatient(i));

// Filtered sublists
export const opCompleted = opPatients.filter(p => p.status === "Completed");
export const opCheckedIn = opPatients.filter(p => ["Checked-in", "With Doctor", "Awaiting Billing"].includes(p.status));
export const opPendingCheckIn = opPatients.filter(p => p.status === "Pending" || p.status === "Checked-in");

// ============== IP PATIENTS ==============

function generateIPPatient(index: number, isNewAdmission = false, isERCase = false): IPPatientRecord {
  const admitDaysAgo = isNewAdmission ? 0 : Math.floor(Math.random() * 14) + 1;
  const admitDate = subDays(now, admitDaysAgo);
  admitDate.setHours(8 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60), 0, 0);

  const bedClasses: IPPatientRecord["bedClass"][] = ["ICU", "HDU", "Private", "Ward"];
  const bedClass = bedClasses[index % bedClasses.length];
  const wardMap = { ICU: "ICU", HDU: "HDU", Private: "Private Wing", Ward: `Ward-${["A", "B", "C", "D"][index % 4]}` };

  // Generate payment details
  const admissionFee = [5000, 8000, 10000, 15000, 20000][index % 5];
  const hasPaidAdvance = Math.random() > 0.3;
  const advancePaid = hasPaidAdvance ? [10000, 15000, 20000, 25000, 50000][index % 5] : 0;
  const totalPaid = advancePaid + (Math.random() > 0.5 ? admissionFee : 0);

  // Determine status - some patients are discharged (for demo variety)
  const isAdmitted = index % 5 !== 0; // 80% admitted, 20% discharged
  const dischargeDate = !isAdmitted ? subDays(now, Math.floor(Math.random() * 3)) : undefined;
  if (dischargeDate) {
    dischargeDate.setHours(10 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60), 0, 0);
  }

  return {
    mrn: generateMRN(5000 + index),
    patient: generateName(index + 100),
    ageSex: generateAgeSex(index),
    visitId: formatVisitId(25, 500 + index),
    admitDateTime: formatDateTime(admitDate),
    ward: wardMap[bedClass],
    room: `${String(100 + Math.floor(index / 4)).padStart(3, "0")}`,
    bed: `${(index % 4) + 1}`,
    bedClass,
    attendingDoctor: doctors[index % doctors.length],
    primaryDiagnosis: diagnoses[index % diagnoses.length],
    lengthOfStay: admitDaysAgo,
    emergencyContact: generatePhone(),
    isolation: index % 10 === 0 ? "Contact" : undefined,
    source: isERCase ? "ER" : isNewAdmission ? (["ER", "OPD", "Transfer"] as const)[index % 3] : undefined,
    admittingDiagnosis: diagnoses[(index + 3) % diagnoses.length],
    admittingDoctor: doctors[(index + 2) % doctors.length],
    admissionFee,
    advancePaid,
    totalPaid,
    ipStatus: isAdmitted ? "admitted" : "discharged",
    dischargeDateTime: dischargeDate ? formatDateTime(dischargeDate) : undefined,
  };
}

// 234 IP Patients
export const ipPatients: IPPatientRecord[] = Array.from({ length: 234 }, (_, i) => generateIPPatient(i));

// Sub-filtered: New Admissions (admitted today)
export const newAdmissions: IPPatientRecord[] = Array.from({ length: 19 }, (_, i) => generateIPPatient(i, true));

// Sub-filtered: ER Cases today
export const erCasesToday: IPPatientRecord[] = Array.from({ length: 8 }, (_, i) => generateIPPatient(i, true, true));

// Sub-filtered: Transfer patients
export const transferPatients: IPPatientRecord[] = Array.from({ length: 10 }, (_, i) => ({
  ...generateIPPatient(i + 100, false, false),
  source: "Transfer" as const,
}));

// ============== BEDS AVAILABILITY ==============

function generateBed(index: number, typeOverride?: BedRecord["bedType"]): BedRecord {
  const bedTypes: BedRecord["bedType"][] = ["ICU", "HDU", "Ward", "Private", "Isolation"];
  const bedType = typeOverride || bedTypes[index % bedTypes.length];
  const statuses: BedRecord["status"][] = ["Available", "Available", "Available", "Available", "Reserved"];
  const status = statuses[index % statuses.length];
  const wardMap = { ICU: "ICU", HDU: "HDU", Ward: `Ward-${["A", "B", "C"][index % 3]}`, Private: "Private Wing", Isolation: "Isolation" };

  const rateMap = { ICU: 15000, HDU: 10000, Ward: 2000, Private: 8000, Isolation: 6000 };
  const totalMap = { ICU: 20000, HDU: 13500, Ward: 2800, Private: 10500, Isolation: 8500 };

  const bedNo = `${1000 + index + 1}`;
  const hasTransfer = status === "Reserved" && index % 3 === 0;
  const fromWard = `Ward-${["A", "B", "C"][(index + 1) % 3]}`;
  const fromBed = `Bed ${(index % 8) + 1}`;
  const toWard = wardMap[bedType];
  const toBed = `Bed ${(index % 4) + 1}`;

  return {
    bedNo,
    ward: wardMap[bedType],
    room: `${String(100 + Math.floor(index / 4)).padStart(3, "0")}`,
    bed: `${(index % 4) + 1}`,
    bedType,
    status,
    dailyRate: rateMap[bedType],
    totalPerDay: totalMap[bedType],
    transferPatient: hasTransfer ? generateName(index + 500) : undefined,
    transferFrom: hasTransfer ? `${fromWard} / ${fromBed}` : undefined,
    transferTo: hasTransfer ? `${toWard} / ${toBed}` : undefined,
  };
}

// 67 Available beds across types
export const bedsAvailability: BedRecord[] = Array.from({ length: 67 }, (_, i) => generateBed(i));

// Sub-filtered by bed type
export const icuBeds = bedsAvailability.filter(b => b.bedType === "ICU");
export const wardBeds = bedsAvailability.filter(b => ["Ward", "HDU"].includes(b.bedType));
export const roomBeds = bedsAvailability.filter(b => ["Private", "Isolation"].includes(b.bedType));

// ============== DISCHARGED PATIENTS ==============

function generateDischargedPatient(index: number, isPending = false): IPPatientRecord {
  const dischargeDate = isPending ? addDays(now, 0) : now;
  dischargeDate.setHours(8 + Math.floor(index / 5), (index * 12) % 60, 0, 0);
  const admitDate = subDays(dischargeDate, 2 + Math.floor(Math.random() * 10));

  const bedClasses: IPPatientRecord["bedClass"][] = ["ICU", "HDU", "Private", "Ward"];
  const bedClass = bedClasses[index % bedClasses.length];
  const wardMap = { ICU: "ICU", HDU: "HDU", Private: "Private Wing", Ward: `Ward-${["A", "B", "C", "D"][index % 4]}` };

  const blockingTasksOptions = ["Billing", "Meds", "Transport", "Paperwork", "Clearance"];

  return {
    mrn: generateMRN(8000 + index),
    patient: generateName(index + 200),
    ageSex: generateAgeSex(index),
    visitId: formatVisitId(25, 800 + index),
    admitDateTime: formatDateTime(admitDate),
    ward: wardMap[bedClass],
    room: `${String(100 + Math.floor(index / 4)).padStart(3, "0")}`,
    bed: `${(index % 4) + 1}`,
    bedClass,
    attendingDoctor: doctors[index % doctors.length],
    primaryDiagnosis: diagnoses[index % diagnoses.length],
    lengthOfStay: Math.floor((dischargeDate.getTime() - admitDate.getTime()) / (1000 * 60 * 60 * 24)),
    dischargeDateTime: isPending ? undefined : formatDateTime(dischargeDate),
    dischargeType: isPending ? undefined : (["Home", "Transfer", "AMA", "Expired"] as const)[index % 4],
    billingStatus: (["Paid", "Pending", "Partially Paid"] as const)[index % 3],
    dischargeSummary: isPending ? "Not Ready" : (["Ready", "Not Ready"] as const)[index % 2],
    followUpAppointment: !isPending && Math.random() > 0.4 ? formatDateTime(addDays(now, 7 + Math.floor(Math.random() * 14))) : undefined,
    plannedDischargeDateTime: isPending ? formatDateTime(dischargeDate) : undefined,
    blockingTasks: isPending ? blockingTasksOptions.slice(0, 1 + Math.floor(Math.random() * 3)) : undefined,
    ipStatus: isPending ? "admitted" : "discharged",
  };
}

// 45 Discharged today
export const dischargedPatients: IPPatientRecord[] = Array.from({ length: 45 }, (_, i) => generateDischargedPatient(i));

// 11 Pending discharge
export const dischargePending: IPPatientRecord[] = Array.from({ length: 11 }, (_, i) => generateDischargedPatient(i, true));

// ============== ER CASES ==============

function generateERCase(index: number): ERCaseRecord {
  const arrivalDate = subHours(now, Math.floor(Math.random() * 12));
  const triageLevels: ERCaseRecord["triageLevel"][] = [1, 2, 2, 3, 3, 3, 4, 4, 5];
  const triageLevel = triageLevels[index % triageLevels.length];
  const minsAgo = Math.floor((now.getTime() - arrivalDate.getTime()) / (1000 * 60));

  return {
    mrn: generateMRN(9000 + index),
    patient: generateName(index + 300),
    ageSex: generateAgeSex(index),
    visitId: formatVisitId(25, 900 + index),
    triageLevel,
    arrivalTime: formatDateTime(arrivalDate),
    modeOfArrival: (["Ambulance", "Walk-in", "Transfer"] as const)[index % 3],
    erZoneArea: (["Trauma", "Acute", "Minor", "Resus", "Obs"] as const)[index % 5],
    bedChair: `ER-${index + 1}`,
    attending: doctors[index % doctors.length],
    chiefComplaint: chiefComplaints[index % chiefComplaints.length],
    timeSinceArrival: `${Math.floor(minsAgo / 60)}h ${minsAgo % 60}m`,
    disposition: (["Pending", "Admit", "Discharge", "Transfer"] as const)[index % 4],
  };
}

// 15 Emergency Cases (active)
export const emergencyCases: ERCaseRecord[] = Array.from({ length: 15 }, (_, i) => generateERCase(i));

// ============== DOCTORS ON DUTY ==============

function generateDoctorOnDuty(index: number): DoctorOnDutyRecord {
  const shiftStart = new Date(now);
  shiftStart.setHours(index % 2 === 0 ? 8 : 20, 0, 0, 0);
  const shiftEnd = new Date(shiftStart);
  shiftEnd.setHours(shiftStart.getHours() + 12);

  const roles: DoctorOnDutyRecord["role"][] = ["Onsite", "On-call", "In OPD", "In OT", "In Ward Rounds", "In Procedure", "Break", "Remote"];
  const role = roles[index % roles.length];
  const locations = ["OPD", "ER", "Ward", "OR", "ICU", "HDU", "Radiology", "Lab"];
  const currentLocation = locations[index % locations.length];

  // Determine duty context based on role and location
  let dutyContext: "OP" | "IP" | "Other" = "Other";
  if (role === "In OPD" || currentLocation === "OPD") {
    dutyContext = "OP";
  } else if (role === "In Ward Rounds" || ["Ward", "ICU", "HDU"].includes(currentLocation)) {
    dutyContext = "IP";
  }

  const opdRooms = ["OPD-101", "OPD-102", "OPD-103", "OPD-201", "OPD-202"];
  const primaryUnits = ["ICU", "HDU", "Ward-A", "Ward-B", "Ward-C"];
  const contexts = ["Radiology Reading", "Pathology/Lab", "Telemedicine", "Admin", "Education/Academic", "Research"];
  const degreesList = [
    "MBBS, MD",
    "MBBS, MS",
    "MBBS, MD, DM",
    "MBBS, MS, MCh",
    "MBBS, DNB",
    "MBBS, MD, FRCP",
    "MBBS, MS, FRCS",
    "MBBS, MD, PhD"
  ];

  return {
    doctorName: doctors[index % doctors.length],
    degrees: degreesList[index % degreesList.length],
    specialty: departments[index % departments.length],
    role,
    shiftStart: formatTime(shiftStart),
    shiftEnd: formatTime(shiftEnd),
    currentLocation,
    contactPager: `Ext. ${1000 + index}`,
    department: departments[index % departments.length],
    opdRoom: dutyContext === "OP" ? opdRooms[index % opdRooms.length] : undefined,
    currentStatus: (["Available", "With Patient", "In Procedure", "On Break", "In Meeting"] as const)[index % 5],
    queueLength: dutyContext === "OP" ? Math.floor(Math.random() * 12) : undefined,
    nextAppointmentAt: dutyContext === "OP" ? formatTime(subMinutes(now, -Math.floor(Math.random() * 60))) : undefined,
    slotsAvailable: dutyContext === "OP" ? Math.floor(Math.random() * 8) : undefined,
    avgConsultTime: dutyContext === "OP" ? 15 + Math.floor(Math.random() * 15) : undefined,
    primaryUnits: dutyContext === "IP" ? primaryUnits.slice(0, 1 + (index % 3)).join(", ") : undefined,
    onCallStatus: index % 4 === 0,
    ipCensus: dutyContext === "IP" ? 5 + Math.floor(Math.random() * 15) : undefined,
    roundsStartTime: dutyContext === "IP" ? "08:00" : undefined,
    nextTask: dutyContext === "IP" ? (["Procedure", "Consult", "Discharge", "Rounds"] as const)[index % 4] : undefined,
    context: dutyContext === "Other" ? contexts[index % contexts.length] : undefined,
    casesToday: dutyContext === "Other" ? Math.floor(Math.random() * 20) : undefined,
    notes: index % 5 === 0 ? "Available for consults" : undefined,
    dutyContext,
  };
}

// 89 Doctors on Duty
export const doctorsOnDuty: DoctorOnDutyRecord[] = Array.from({ length: 89 }, (_, i) => generateDoctorOnDuty(i));

// Sub-filtered by doctor type
export const opDoctors = doctorsOnDuty.filter(d => d.dutyContext === "OP");
export const ipDoctors = doctorsOnDuty.filter(d => d.dutyContext === "IP");
export const otherDoctors = doctorsOnDuty.filter(d => d.dutyContext === "Other");

// ============== TRANSFERS ==============

function generateTransfer(index: number): TransferRecord {
  const requestedDate = subHours(now, Math.floor(Math.random() * 12));
  const statuses: TransferRecord["status"][] = ["Requested", "Approved", "Bed Reserved", "In Transit", "Completed", "Canceled"];
  const status = statuses[index % statuses.length];
  const priorities: TransferRecord["priority"][] = ["Routine", "Routine", "Urgent", "Stat"];
  const transferTypes: TransferRecord["transferType"][] = ["Intra-ward", "Inter-ward", "To ICU", "To HDU", "Room Change", "Bed Swap", "Inter-facility"];
  const bedClasses: TransferRecord["fromBedClass"][] = ["Ward", "Private", "HDU", "ICU", "Isolation"];
  const reasons = ["Stepdown care", "Condition deterioration", "ICU bed needed", "Isolation required", "Patient request", "Bed optimization", "Post-op recovery"];
  const equipment = ["Ventilator", "Monitor", "O₂ Tank", "IV Pump", "Wheelchair", "Stretcher"];

  const fromBedClass = bedClasses[index % bedClasses.length];
  const toBedClass = bedClasses[(index + 2) % bedClasses.length];
  const fromWard = fromBedClass === "ICU" ? "ICU" : fromBedClass === "HDU" ? "HDU" : `Ward-${["A", "B", "C"][index % 3]}`;
  const toWard = toBedClass === "ICU" ? "ICU" : toBedClass === "HDU" ? "HDU" : `Ward-${["A", "B", "C"][(index + 1) % 3]}`;

  return {
    transferId: `TRF${today.replace(/-/g, "")}${String(index).padStart(3, "0")}`,
    mrn: generateMRN(7000 + index),
    patient: generateName(index + 700),
    ageSex: generateAgeSex(index),
    visitId: formatVisitId(25, 700 + index),
    priority: priorities[index % priorities.length],
    transferType: transferTypes[index % transferTypes.length],
    fromWard,
    fromRoom: `${100 + Math.floor(index / 4)}`,
    fromBed: `${(index % 4) + 1}`,
    fromBedClass,
    toWard,
    toRoom: `${200 + Math.floor(index / 4)}`,
    toBed: `${((index + 1) % 4) + 1}`,
    toBedClass,
    reason: reasons[index % reasons.length],
    requestingClinician: doctors[index % doctors.length],
    approver: ["Approved", "Bed Reserved", "In Transit", "Completed"].includes(status) ? doctors[(index + 1) % doctors.length] : undefined,
    status,
    requestedAt: formatDateTime(requestedDate),
    approvedAt: ["Approved", "Bed Reserved", "In Transit", "Completed"].includes(status) ? formatDateTime(subMinutes(requestedDate, -15)) : undefined,
    transferStartAt: ["In Transit", "Completed"].includes(status) ? formatDateTime(subMinutes(requestedDate, -30)) : undefined,
    arrivedAt: status === "Completed" ? formatDateTime(subMinutes(requestedDate, -45)) : undefined,
    equipmentNeeded: index % 3 === 0 ? equipment.slice(0, 1 + (index % 3)).join(", ") : undefined,
    isolationRequired: index % 7 === 0,
    transportTeam: ["In Transit", "Completed"].includes(status) ? `Porter ${1000 + index}` : undefined,
    notesBlockers: index % 5 === 0 ? "Awaiting escort clearance" : undefined,
  };
}

// 10 Transfers (matching Overview card count)
export const transfers: TransferRecord[] = Array.from({ length: 10 }, (_, i) => generateTransfer(i));

// ============== APPOINTMENT REQUESTS ==============

function generateAppointmentRequest(index: number): AppointmentRequestRecord {
  const createdDate = subHours(now, Math.floor(Math.random() * 8));
  const preferredDate = addDays(now, 1 + Math.floor(Math.random() * 7));
  preferredDate.setHours(9 + Math.floor(Math.random() * 8), 0, 0, 0);

  const patientName = generateName(index + 400);
  const emailName = patientName.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z.]/g, '');
  const ageSex = generateAgeSex(index + 400);
  const visitTypes = ["OP", "IP", "Emergency", "Follow-up"] as const;
  return {
    requestId: `REQ${today.replace(/-/g, "")}${String(index).padStart(4, "0")}`,
    patient: patientName,
    ageSex,
    contact: generatePhone(),
    email: `${emailName}@email.com`,
    preferredDate: format(preferredDate, "dd MMM yyyy"),
    preferredTime: format(preferredDate, "hh:mm a"),
    department: departments[index % departments.length],
    preferredProvider: Math.random() > 0.3 ? doctors[index % doctors.length] : undefined,
    reason: visitReasons[index % visitReasons.length],
    visitType: visitTypes[index % visitTypes.length],
    urgency: (["Low", "Med", "High"] as const)[index % 3],
    source: (["Call", "Portal", "Walk-in", "Referral"] as const)[index % 4],
    insuranceVerified: Math.random() > 0.3,
    status: (["New", "Pending", "Scheduled", "Rejected"] as const)[index % 4],
    createdAt: formatDateTime(createdDate),
  };
}

// 342 Appointment Requests
export const appointmentRequests: AppointmentRequestRecord[] = Array.from({ length: 342 }, (_, i) => generateAppointmentRequest(i));

// ============== LAB ORDERS ==============

function generateLabOrder(index: number): LabOrderRecord {
  const orderDate = subHours(now, Math.floor(Math.random() * 8));
  const isIP = index % 3 === 0;

  return {
    orderId: `LAB${today.replace(/-/g, "")}${String(index).padStart(4, "0")}`,
    patient: generateName(index + 500),
    ageSex: generateAgeSex(index),
    visitId: formatVisitId(25, 100 + index),
    location: isIP ? `Ward-${["A", "B", "C"][index % 3]}/Bed ${index % 10 + 1}` : "OP",
    tests: testPanels[index % testPanels.length],
    priority: index % 5 === 0 ? "Stat" : "Routine",
    status: (["Ordered", "Collected", "In-Process", "Completed", "Verified"] as const)[index % 5],
    specimenType: specimenTypes[index % specimenTypes.length],
    collectedAt: index % 5 !== 0 ? formatDateTime(subMinutes(now, 30 + Math.floor(Math.random() * 60))) : undefined,
    resultETA: index % 5 < 3 ? formatTime(subMinutes(now, -60)) : undefined,
    criticalResult: index % 20 === 0,
    orderTime: formatDateTime(orderDate),
  };
}

// 156 Lab Orders
export const labOrders: LabOrderRecord[] = Array.from({ length: 156 }, (_, i) => generateLabOrder(i));

// ============== SURGERIES ==============

function generateSurgery(index: number): SurgeryRecord {
  const startDate = new Date(now);
  startDate.setHours(7 + Math.floor(index / 3), (index * 20) % 60, 0, 0);

  return {
    caseId: `SURG${today.replace(/-/g, "")}${String(index).padStart(3, "0")}`,
    patient: generateName(index + 600),
    ageSex: generateAgeSex(index),
    visitId: formatVisitId(25, 200 + index),
    procedure: procedures[index % procedures.length],
    surgeon: doctors[index % doctors.length],
    orRoom: `OR-${(index % 5) + 1}`,
    startTime: formatDateTime(startDate),
    estimatedDuration: `${1 + Math.floor(Math.random() * 4)}h ${Math.floor(Math.random() * 4) * 15}m`,
    status: (["Scheduled", "In-Progress", "Completed", "Canceled"] as const)[index % 4],
    anesthesiaType: (["General", "Spinal", "Local", "Epidural"] as const)[index % 4],
    asaClass: `ASA ${(index % 4) + 1}`,
    postOpBedReserved: Math.random() > 0.2,
  };
}

// 24 Surgeries
export const surgeries: SurgeryRecord[] = Array.from({ length: 24 }, (_, i) => generateSurgery(i));

// ============== MEDICINE ORDERS ==============

function generateMedicineOrder(index: number): MedicineOrderRecord {
  const orderDate = subHours(now, Math.floor(Math.random() * 6));
  const isIP = index % 2 === 0;

  const orderAmount = [500, 800, 1200, 1500, 2000, 2500][index % 6];
  const paymentStatuses = ["Paid", "Pending", "Partially Paid", "Waived"] as const;
  const paymentStatus = paymentStatuses[index % 4];
  const paidAmount = paymentStatus === "Paid" ? orderAmount :
    paymentStatus === "Partially Paid" ? Math.floor(orderAmount * 0.5) :
      paymentStatus === "Waived" ? 0 : 0;

  return {
    orderId: `RX${String(100000 + index).slice(-6)}`,
    patient: generateName(index + 700),
    ageSex: generateAgeSex(index + 700),
    visitId: formatVisitId(25, 300 + index),
    location: isIP ? `Ward-${["A", "B", "C"][index % 3]}/Bed ${index % 10 + 1}` : "OP",
    prescriber: doctors[index % doctors.length],
    route: (["PO", "IV", "IM", "SC", "Topical"] as const)[index % 5],
    priority: index % 8 === 0 ? "Stat" : "Routine",
    dispensedAt: index % 3 === 0 ? formatDateTime(subMinutes(now, Math.floor(Math.random() * 60))) : undefined,
    orderTime: formatDateTime(orderDate),
    paymentStatus,
    orderAmount,
    paidAmount,
  };
}

// 89 Medicine Orders
export const medicineOrders: MedicineOrderRecord[] = Array.from({ length: 89 }, (_, i) => generateMedicineOrder(i));

// ============== RADIOLOGY ORDERS ==============

function generateRadiologyOrder(index: number): RadiologyOrderRecord {
  const scheduledDate = new Date(now);
  scheduledDate.setHours(8 + Math.floor(index / 4), (index * 15) % 60, 0, 0);
  const orderDate = subHours(scheduledDate, 1 + Math.floor(Math.random() * 4));
  const isIP = index % 3 === 0;

  return {
    orderId: `RAD${today.replace(/-/g, "")}${String(index).padStart(4, "0")}`,
    patient: generateName(index + 800),
    ageSex: generateAgeSex(index + 800),
    visitId: formatVisitId(25, 400 + index),
    location: isIP ? `Ward-${["A", "B", "C"][index % 3]}/Bed ${index % 10 + 1}` : "OP",
    modality: (["X-ray", "CT", "MRI", "US", "Fluoro", "Mammo"] as const)[index % 6],
    exam: radiologyExams[index % radiologyExams.length],
    priority: index % 6 === 0 ? "Stat" : "Routine",
    status: (["Ordered", "Scheduled", "In-Progress", "Completed", "Finalized"] as const)[index % 5],
    scheduledTime: formatDateTime(scheduledDate),
    imagingLocation: `RAD-${(index % 4) + 1}`,
    contrast: index % 4 === 0,
    pregnancySafetyFlags: index % 10 === 0 ? "Verify pregnancy status" : undefined,
    orderTime: formatDateTime(orderDate),
  };
}

// 34 Radiology Orders
export const radiologyOrders: RadiologyOrderRecord[] = Array.from({ length: 34 }, (_, i) => generateRadiologyOrder(i));

// ============== LOW STOCK ==============

const inventoryItems = [
  "Paracetamol 500mg", "Amoxicillin 250mg", "Surgical Gloves (L)", "Syringes 5ml",
  "N95 Masks", "IV Cannula 20G", "Gauze Pads 4x4", "Alcohol Swabs",
  "Bandages 3in", "Normal Saline 500ml", "Dextrose 5%", "Suture Kit",
  "Blood Collection Tubes", "Catheter 16F", "Oxygen Masks", "Hand Sanitizer 500ml",
  "Insulin Syringes", "ECG Electrodes", "Pulse Oximeter Probes", "BP Cuffs",
  "Nebulizer Masks", "Sterile Drapes", "Surgical Blades", "Tourniquet",
  "Urinary Bags", "NG Tubes", "Tracheostomy Tubes", "Endotracheal Tubes",
  "Central Line Kits", "Arterial Line Kits", "PICC Line Kits", "Chest Tubes",
  "Wound Vac Canisters", "Ostomy Bags"
];

const suppliers = ["MedSupply Co.", "PharmaCare Ltd.", "HealthStock Inc.", "MedEquip Solutions", "Hospital Supplies Ltd."];

function generateLowStockItem(index: number): LowStockRecord {
  const reorderPoint = 50 + Math.floor(Math.random() * 100);
  const parLevel = reorderPoint * 2;
  const avgDailyUse = 5 + Math.floor(Math.random() * 20);
  const onHand = Math.floor(reorderPoint * (0.1 + Math.random() * 0.9));
  const daysOfStockLeft = Math.round((onHand / avgDailyUse) * 10) / 10;

  return {
    itemName: inventoryItems[index % inventoryItems.length],
    category: (["Drug", "Consumable", "Device"] as const)[index % 3],
    onHand,
    reorderPoint,
    parLevel,
    avgDailyUse,
    daysOfStockLeft,
    onOrder: Math.random() > 0.6 ? Math.floor(Math.random() * parLevel) : 0,
    supplier: suppliers[index % suppliers.length],
    leadTimeDays: 2 + Math.floor(Math.random() * 7),
    suggestedReorderQty: parLevel - onHand,
    severity: daysOfStockLeft <= 2 || onHand === 0 ? "Critical" : daysOfStockLeft <= 5 ? "Low" : "Normal",
  };
}

// 34 Low Stock Items
export const lowStockItems: LowStockRecord[] = Array.from({ length: 34 }, (_, i) => generateLowStockItem(i))
  .sort((a, b) => a.daysOfStockLeft - b.daysOfStockLeft);
