-- Create patients table for hospital patient registry
CREATE TABLE public.patients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gdid TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
  phone TEXT NOT NULL,
  email TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  address_line1 TEXT,
  address_city TEXT,
  address_state TEXT,
  address_pincode TEXT,
  blood_group TEXT CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', NULL)),
  allergies TEXT[],
  medical_alerts TEXT[],
  insurance_provider TEXT,
  insurance_policy_number TEXT,
  primary_doctor_id UUID REFERENCES public.doctors(id),
  department TEXT,
  status TEXT NOT NULL DEFAULT 'OP' CHECK (status IN ('OP', 'IP', 'Discharged', 'Emergency')),
  last_visit_date TIMESTAMP WITH TIME ZONE,
  registration_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Create policies for patient access
CREATE POLICY "Patients are viewable by everyone" 
ON public.patients 
FOR SELECT 
USING (true);

CREATE POLICY "Patients can be managed by authenticated users" 
ON public.patients 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create function to generate GDID
CREATE OR REPLACE FUNCTION public.generate_gdid()
RETURNS TRIGGER AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(gdid FROM 6) AS INTEGER)), 0) + 1
  INTO next_num
  FROM public.patients;
  
  NEW.gdid := 'GDID-' || LPAD(next_num::TEXT, 3, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for auto-generating GDID
CREATE TRIGGER set_patient_gdid
BEFORE INSERT ON public.patients
FOR EACH ROW
WHEN (NEW.gdid IS NULL OR NEW.gdid = '')
EXECUTE FUNCTION public.generate_gdid();

-- Create trigger for updating timestamps
CREATE TRIGGER update_patients_updated_at
BEFORE UPDATE ON public.patients
FOR EACH ROW
EXECUTE FUNCTION public.update_scheduling_updated_at();

-- Insert sample patient data
INSERT INTO public.patients (gdid, first_name, last_name, date_of_birth, gender, phone, email, address_city, blood_group, status, last_visit_date, registration_date, department, allergies, medical_alerts) VALUES
('GDID-001', 'Harish', 'Kalyan', '1989-05-15', 'Male', '+91 98765 43210', 'harish.kalyan@email.com', 'Chennai', 'O+', 'IP', now() - interval '1 day', now() - interval '7 days', 'Cardiology', ARRAY['Penicillin'], ARRAY['Diabetic']),
('GDID-002', 'Rahul', 'Verma', '1979-08-22', 'Male', '+91 97654 32109', 'rahul.verma@email.com', 'Delhi', 'B+', 'OP', now() - interval '2 days', now() - interval '9 days', 'Orthopedics', NULL, NULL),
('GDID-003', 'Sana', 'Ali', '1995-03-10', 'Female', '+91 96543 21098', 'sana.ali@email.com', 'Bengaluru', 'A+', 'OP', now() - interval '3 days', now() - interval '11 days', 'Dermatology', ARRAY['Sulfa drugs'], NULL),
('GDID-004', 'Arjun', 'Patel', '1972-11-28', 'Male', '+91 99876 54321', 'arjun.patel@email.com', 'Ahmedabad', 'AB+', 'IP', now(), now() - interval '12 days', 'Neurology', NULL, ARRAY['Hypertension', 'Cardiac history']),
('GDID-005', 'Meera', 'Nair', '1983-07-04', 'Female', '+91 95432 16789', 'meera.nair@email.com', 'Kochi', 'O-', 'OP', now() - interval '5 days', now() - interval '13 days', 'Gynecology', NULL, NULL),
('GDID-006', 'Vikram', 'Singh', '1988-01-19', 'Male', '+91 94321 09876', 'vikram.singh@email.com', 'Jaipur', 'B-', 'OP', now() - interval '6 days', now() - interval '14 days', 'ENT', ARRAY['Aspirin'], NULL),
('GDID-007', 'Priya', 'Iyer', '1997-09-25', 'Female', '+91 93210 98765', 'priya.iyer@email.com', 'Chennai', 'A-', 'IP', now() - interval '1 day', now() - interval '15 days', 'General Medicine', NULL, ARRAY['Asthma']),
('GDID-008', 'Mohit', 'Agarwal', '1964-12-03', 'Male', '+91 92109 87654', 'mohit.agarwal@email.com', 'Kolkata', 'O+', 'OP', now() - interval '8 days', now() - interval '16 days', 'Urology', NULL, ARRAY['Kidney disease']),
('GDID-009', 'Neha', 'Kulkarni', '1991-06-17', 'Female', '+91 91098 76543', 'neha.kulkarni@email.com', 'Pune', 'B+', 'IP', now(), now() - interval '17 days', 'Oncology', ARRAY['Iodine'], ARRAY['Cancer treatment']),
('GDID-010', 'Ramesh', 'Rao', '1976-02-08', 'Male', '+91 90987 65432', 'ramesh.rao@email.com', 'Hyderabad', 'A+', 'OP', now() - interval '10 days', now() - interval '18 days', 'Gastroenterology', NULL, NULL),
('GDID-011', 'Kavitha', 'Krishnan', '1985-04-30', 'Female', '+91 89876 54321', 'kavitha.k@email.com', 'Coimbatore', 'AB-', 'OP', now() - interval '4 days', now() - interval '20 days', 'Ophthalmology', NULL, NULL),
('GDID-012', 'Suresh', 'Menon', '1968-10-12', 'Male', '+91 88765 43210', 'suresh.menon@email.com', 'Thiruvananthapuram', 'O+', 'Discharged', now() - interval '2 days', now() - interval '25 days', 'Cardiology', ARRAY['Latex'], ARRAY['Post-surgery care']);
