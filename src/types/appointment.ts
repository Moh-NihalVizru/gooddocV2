// Unified appointment type system for OP/IP/Diagnostics
export type AppointmentType = 'OP' | 'IP' | 'Diagnostics';

export type AppointmentSubtype = 
  | 'Consultation' 
  | 'Follow-up' 
  | 'Surgery' 
  | 'Admission' 
  | 'Post-Op Care' 
  | 'Laboratory' 
  | 'Radiology';

export type AppointmentStatus = 
  | 'Ordered' 
  | 'Scheduled' 
  | 'In-Process' 
  | 'Result Ready' 
  | 'Verified' 
  | 'Cancelled' 
  | 'Pending' 
  | 'Completed'
  | 'Checked-In';

export type AppointmentPriority = 'Routine' | 'Urgent' | 'STAT';

export interface ProviderRef {
  id: string;
  name: string;
  external?: boolean; // For external referring doctors
}

export interface DepartmentRef {
  id: string;
  name: string;
}

export interface ServiceItem {
  code?: string;
  name: string;
  category?: string;
}

export interface PatientInfo {
  id: string;
  name: string;
  gdid: string;
  age?: number;
  sex?: 'M' | 'F' | 'O';
}

export interface ContactInfo {
  phone?: string;
  email?: string;
}

export interface AppointmentSlot {
  date: string;
  time: string;
  token?: string;
}

export interface UnifiedAppointment {
  id: string;
  type: AppointmentType;
  subtype: AppointmentSubtype;
  patient: PatientInfo;
  contact: ContactInfo;
  
  // Provider roles - context-dependent
  consultingDoctor?: ProviderRef | null; // For OP/IP
  referringDoctor?: ProviderRef | null;  // For Diagnostics
  reportingClinician?: ProviderRef | null; // For Diagnostics (pathologist/radiologist)
  
  // Department context
  department?: DepartmentRef | null; // For OP/IP
  performingDepartment?: DepartmentRef | null; // For Diagnostics
  
  // Service details
  serviceType: string; // Primary service label
  serviceItems?: ServiceItem[]; // Full list of tests/procedures
  
  // Scheduling
  slot?: AppointmentSlot;
  status: AppointmentStatus;
  priority?: AppointmentPriority;
  
  // Additional context
  summary?: string; // Chief complaint / reason
  notes?: string;
  location?: string;
}

// Helper functions for display logic
export function getDoctorLabel(type: AppointmentType): string {
  return type === 'Diagnostics' ? 'Referring Doctor' : 'Consulting Doctor';
}

export function getDepartmentLabel(type: AppointmentType): string {
  return type === 'Diagnostics' ? 'Performing Dept' : 'Department';
}

export function getDoctorValue(appointment: UnifiedAppointment): string {
  if (appointment.type === 'Diagnostics') {
    if (appointment.referringDoctor) {
      return appointment.referringDoctor.external 
        ? `External: ${appointment.referringDoctor.name}`
        : appointment.referringDoctor.name;
    }
    return 'Self';
  }
  return appointment.consultingDoctor?.name || '—';
}

export function getDepartmentValue(appointment: UnifiedAppointment): string {
  if (appointment.type === 'Diagnostics') {
    if (appointment.performingDepartment?.name) {
      return appointment.performingDepartment.name;
    }
    // Fallback based on subtype
    return appointment.subtype === 'Laboratory' ? 'Laboratory Team' : 'Radiology Team';
  }
  return appointment.department?.name || '—';
}

// Map legacy category to new type
export function categoryToType(category: string): AppointmentType {
  switch (category) {
    case 'outpatient-care':
      return 'OP';
    case 'inpatient-care':
      return 'IP';
    case 'diagnostics':
      return 'Diagnostics';
    case 'emergency':
      return 'IP'; // Emergency maps to IP
    default:
      return 'OP';
  }
}

// Check if appointment is diagnostics type
export function isDiagnosticsAppointment(appointment: UnifiedAppointment | { category?: string; type?: AppointmentType }): boolean {
  if ('type' in appointment && appointment.type) {
    return appointment.type === 'Diagnostics';
  }
  if ('category' in appointment && appointment.category) {
    return appointment.category === 'diagnostics';
  }
  return false;
}
