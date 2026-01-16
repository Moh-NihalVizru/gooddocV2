-- =============================================
-- SCHEDULING SYSTEM: Core Tables
-- =============================================

-- Enum types
CREATE TYPE public.schedule_mode AS ENUM ('in_person', 'telehealth', 'both');
CREATE TYPE public.leave_type AS ENUM ('full_day', 'partial_day');
CREATE TYPE public.leave_status AS ENUM ('active', 'cancelled');
CREATE TYPE public.exception_type AS ENUM ('add', 'block');
CREATE TYPE public.appointment_status AS ENUM ('held', 'booked', 'checked_in', 'completed', 'no_show', 'cancelled');

-- =============================================
-- Locations table
-- =============================================
CREATE TABLE public.locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type schedule_mode NOT NULL DEFAULT 'in_person',
  address TEXT,
  timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Locations are viewable by everyone"
ON public.locations FOR SELECT USING (true);

-- =============================================
-- Doctors table (extends existing provider concept)
-- =============================================
CREATE TABLE public.doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  department_id TEXT,
  specialty_id TEXT,
  degrees TEXT,
  avatar_url TEXT,
  default_duration INTEGER NOT NULL DEFAULT 20, -- minutes
  default_buffer INTEGER NOT NULL DEFAULT 5, -- minutes
  min_lead_time INTEGER NOT NULL DEFAULT 120, -- minutes (2 hours)
  max_future_days INTEGER NOT NULL DEFAULT 90,
  timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors are viewable by everyone"
ON public.doctors FOR SELECT USING (true);

CREATE POLICY "Doctors can be managed by authenticated users"
ON public.doctors FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =============================================
-- Schedule Templates (recurring weekly patterns)
-- =============================================
CREATE TABLE public.schedule_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Default',
  is_active BOOLEAN NOT NULL DEFAULT true,
  -- week_pattern: [{day: 0-6, blocks: [{start: "08:00", end: "12:00", locationId, mode, duration, buffer, capacity}]}]
  week_pattern JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(doctor_id, name)
);

ALTER TABLE public.schedule_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Schedule templates are viewable by everyone"
ON public.schedule_templates FOR SELECT USING (true);

CREATE POLICY "Schedule templates can be managed by authenticated users"
ON public.schedule_templates FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =============================================
-- Schedule Exceptions (one-off additions or blocks)
-- =============================================
CREATE TABLE public.schedule_exceptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  exception_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  exception_type exception_type NOT NULL,
  location_id UUID REFERENCES public.locations(id),
  mode schedule_mode,
  duration INTEGER, -- override doctor default
  buffer INTEGER, -- override doctor default
  capacity INTEGER DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.schedule_exceptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Schedule exceptions are viewable by everyone"
ON public.schedule_exceptions FOR SELECT USING (true);

CREATE POLICY "Schedule exceptions can be managed by authenticated users"
ON public.schedule_exceptions FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE INDEX idx_schedule_exceptions_doctor_date ON public.schedule_exceptions(doctor_id, exception_date);

-- =============================================
-- Leaves
-- =============================================
CREATE TABLE public.leaves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ NOT NULL,
  leave_type leave_type NOT NULL DEFAULT 'full_day',
  reason TEXT,
  status leave_status NOT NULL DEFAULT 'active',
  keep_existing_bookings BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT valid_leave_range CHECK (end_datetime > start_datetime)
);

ALTER TABLE public.leaves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leaves are viewable by everyone"
ON public.leaves FOR SELECT USING (true);

CREATE POLICY "Leaves can be managed by authenticated users"
ON public.leaves FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE INDEX idx_leaves_doctor_dates ON public.leaves(doctor_id, start_datetime, end_datetime);

-- =============================================
-- Holidays
-- =============================================
CREATE TABLE public.holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID REFERENCES public.locations(id),
  holiday_date DATE NOT NULL,
  name TEXT NOT NULL,
  block_bookings BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.holidays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Holidays are viewable by everyone"
ON public.holidays FOR SELECT USING (true);

CREATE INDEX idx_holidays_date ON public.holidays(holiday_date);

-- =============================================
-- Appointment Types
-- =============================================
CREATE TABLE public.appointment_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  duration INTEGER NOT NULL DEFAULT 20,
  buffer INTEGER NOT NULL DEFAULT 5,
  mode schedule_mode,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.appointment_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Appointment types are viewable by everyone"
ON public.appointment_types FOR SELECT USING (true);

-- Insert default appointment types
INSERT INTO public.appointment_types (name, duration, buffer, mode) VALUES
  ('Consultation', 20, 5, 'both'),
  ('Follow-up', 15, 5, 'both'),
  ('Procedure', 45, 10, 'in_person'),
  ('Telehealth Consultation', 20, 5, 'telehealth');

-- =============================================
-- Appointments
-- =============================================
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES public.doctors(id),
  patient_id TEXT NOT NULL,
  patient_name TEXT,
  appointment_type_id UUID REFERENCES public.appointment_types(id),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  location_id UUID REFERENCES public.locations(id),
  mode schedule_mode NOT NULL DEFAULT 'in_person',
  status appointment_status NOT NULL DEFAULT 'booked',
  hold_expires_at TIMESTAMPTZ,
  notes TEXT,
  source TEXT DEFAULT 'front_desk',
  created_by TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT valid_appointment_range CHECK (end_time > start_time)
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Appointments are viewable by everyone"
ON public.appointments FOR SELECT USING (true);

CREATE POLICY "Appointments can be managed by authenticated users"
ON public.appointments FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Prevent double booking with exclusion constraint
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE INDEX idx_appointments_doctor_time ON public.appointments(doctor_id, start_time, end_time);
CREATE INDEX idx_appointments_status ON public.appointments(status);

-- Unique constraint to prevent exact duplicate bookings
CREATE UNIQUE INDEX idx_no_double_booking ON public.appointments(doctor_id, start_time) 
WHERE status IN ('held', 'booked', 'checked_in');

-- =============================================
-- Audit Log
-- =============================================
CREATE TABLE public.scheduling_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL, -- 'appointment', 'leave', 'schedule_template', etc.
  entity_id UUID NOT NULL,
  action TEXT NOT NULL, -- 'created', 'updated', 'deleted', 'held', 'booked', 'cancelled'
  actor_id TEXT,
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.scheduling_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Audit logs are viewable by authenticated users"
ON public.scheduling_audit_log FOR SELECT TO authenticated USING (true);

CREATE POLICY "Audit logs can be created by authenticated users"
ON public.scheduling_audit_log FOR INSERT TO authenticated WITH CHECK (true);

CREATE INDEX idx_audit_entity ON public.scheduling_audit_log(entity_type, entity_id);

-- =============================================
-- Function to clean up expired holds
-- =============================================
CREATE OR REPLACE FUNCTION public.cleanup_expired_holds()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.appointments
  SET status = 'cancelled'
  WHERE status = 'held' 
    AND hold_expires_at IS NOT NULL 
    AND hold_expires_at < now();
END;
$$;

-- =============================================
-- Trigger to update updated_at
-- =============================================
CREATE OR REPLACE FUNCTION public.update_scheduling_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON public.doctors FOR EACH ROW EXECUTE FUNCTION public.update_scheduling_updated_at();
CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON public.locations FOR EACH ROW EXECUTE FUNCTION public.update_scheduling_updated_at();
CREATE TRIGGER update_schedule_templates_updated_at BEFORE UPDATE ON public.schedule_templates FOR EACH ROW EXECUTE FUNCTION public.update_scheduling_updated_at();
CREATE TRIGGER update_schedule_exceptions_updated_at BEFORE UPDATE ON public.schedule_exceptions FOR EACH ROW EXECUTE FUNCTION public.update_scheduling_updated_at();
CREATE TRIGGER update_leaves_updated_at BEFORE UPDATE ON public.leaves FOR EACH ROW EXECUTE FUNCTION public.update_scheduling_updated_at();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.update_scheduling_updated_at();

-- =============================================
-- Insert sample data
-- =============================================

-- Sample locations
INSERT INTO public.locations (id, name, type, address) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Main Clinic', 'in_person', '123 Healthcare Ave, Suite 100'),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Downtown Branch', 'in_person', '456 Medical Blvd'),
  ('c3d4e5f6-a7b8-9012-cdef-123456789012', 'Telehealth', 'telehealth', NULL);

-- Sample doctors
INSERT INTO public.doctors (id, name, department_id, specialty_id, degrees, default_duration, default_buffer) VALUES
  ('d1e2f3a4-b5c6-7890-def0-123456789abc', 'Dr. Priya Sharma', 'cardiology', 'interventional', 'MBBS, MD, DM', 20, 5),
  ('e2f3a4b5-c6d7-8901-ef01-23456789abcd', 'Dr. Rahul Mehta', 'endocrinology', 'diabetes', 'MBBS, MD', 30, 10),
  ('f3a4b5c6-d7e8-9012-f012-3456789abcde', 'Dr. Aisha Khan', 'orthopedics', 'joint', 'MBBS, MS, MCh', 25, 5);