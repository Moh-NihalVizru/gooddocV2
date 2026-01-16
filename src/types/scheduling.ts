// =============================================
// Scheduling System Types
// =============================================

export type ScheduleMode = 'in_person' | 'telehealth' | 'both';
export type LeaveType = 'full_day' | 'partial_day';
export type LeaveStatus = 'active' | 'cancelled';
export type ExceptionType = 'add' | 'block';
export type AppointmentStatus = 'held' | 'booked' | 'checked_in' | 'completed' | 'no_show' | 'cancelled';

export interface Location {
  id: string;
  name: string;
  type: ScheduleMode;
  address?: string;
  timezone: string;
  is_active: boolean;
}

export interface Doctor {
  id: string;
  name: string;
  department_id?: string;
  specialty_id?: string;
  degrees?: string;
  avatar_url?: string;
  default_duration: number;
  default_buffer: number;
  min_lead_time: number;
  max_future_days: number;
  timezone: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ScheduleBlock {
  start: string; // "HH:mm"
  end: string;
  locationId?: string;
  mode?: ScheduleMode;
  duration?: number;
  buffer?: number;
  capacity?: number;
}

export interface DaySchedule {
  day: number; // 0-6 (Sunday-Saturday)
  blocks: ScheduleBlock[];
}

export interface ScheduleTemplate {
  id: string;
  doctor_id: string;
  name: string;
  is_active: boolean;
  week_pattern: DaySchedule[];
  created_at: string;
  updated_at: string;
}

export interface ScheduleException {
  id: string;
  doctor_id: string;
  exception_date: string;
  start_time: string;
  end_time: string;
  exception_type: ExceptionType;
  location_id?: string;
  mode?: ScheduleMode;
  duration?: number;
  buffer?: number;
  capacity?: number;
  notes?: string;
}

export interface Leave {
  id: string;
  doctor_id: string;
  start_datetime: string;
  end_datetime: string;
  leave_type: LeaveType;
  reason?: string | null;
  status: LeaveStatus;
  keep_existing_bookings: boolean;
}

export interface Holiday {
  id: string;
  location_id?: string;
  holiday_date: string;
  name: string;
  block_bookings: boolean;
}

export interface AppointmentType {
  id: string;
  name: string;
  duration: number;
  buffer: number;
  mode?: ScheduleMode;
  is_active: boolean;
}

export interface Appointment {
  id: string;
  doctor_id: string;
  patient_id: string;
  patient_name?: string;
  appointment_type_id?: string;
  start_time: string;
  end_time: string;
  location_id?: string;
  mode: ScheduleMode;
  status: AppointmentStatus;
  hold_expires_at?: string;
  notes?: string;
  source?: string;
  created_by?: string;
  version: number;
}

// =============================================
// Availability Response Types
// =============================================

export interface TimeSlot {
  id: string;
  start: string; // ISO datetime
  end: string;
  mode: ScheduleMode;
  locationId?: string;
  locationName?: string;
  capacityRemaining: number;
  status: 'available' | 'held' | 'booked' | 'blocked';
}

export interface DayAvailability {
  date: string; // YYYY-MM-DD
  status: 'available' | 'partial' | 'unavailable' | 'leave' | 'holiday';
  slots: TimeSlot[];
  nextAvailable?: string;
  leaveInfo?: {
    reason?: string;
    endDate: string;
  };
}

export interface AvailabilityResponse {
  doctorId: string;
  doctorName: string;
  timezone: string;
  days: DayAvailability[];
  nextAvailable?: string;
}

export interface DoctorAvailabilitySummary {
  doctorId: string;
  doctorName: string;
  department?: string;
  specialty?: string;
  degrees?: string;
  avatarUrl?: string;
  status: string;
  nextAvailable?: string;
  availabilityStatus: 'today' | 'tomorrow' | 'this_week' | 'on_leave' | 'no_schedule';
  leaveUntil?: string;
}

// =============================================
// Request Types
// =============================================

export interface GetAvailabilityParams {
  doctorId?: string;
  from: string; // ISO date
  to: string;
  mode?: ScheduleMode;
  locationId?: string;
  appointmentTypeId?: string;
}

export interface BookAppointmentRequest {
  doctorId: string;
  patientId: string;
  patientName?: string;
  startTime: string;
  endTime: string;
  appointmentTypeId?: string;
  locationId?: string;
  mode: ScheduleMode;
  notes?: string;
}

export interface HoldSlotRequest {
  doctorId: string;
  startTime: string;
  endTime: string;
  patientId: string;
  holdDurationSeconds?: number; // default 90
}
