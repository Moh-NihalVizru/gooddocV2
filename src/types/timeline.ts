export type EventType = 
  | "Admission" 
  | "Laboratory" 
  | "Medication" 
  | "Radiology" 
  | "Consultation"
  | "Procedure" 
  | "Observation"
  | "Discharge";

export type EventStatus = 
  | "Completed" 
  | "Resulted" 
  | "Administered" 
  | "Scheduled" 
  | "Planned";

export interface TimelineEvent {
  id: string;
  date: string;
  time: string;
  type: EventType;
  title: string;
  dept: string;
  status: EventStatus;
}

export interface PatientJourney {
  visitId: string;
  status: "active" | "completed";
  admissionDate: string;
  dischargeDate: string | null;
  patient: {
    name: string;
    mrn: string;
    age: number;
    sex: string;
  };
  events: TimelineEvent[];
}
