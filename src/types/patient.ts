export interface Patient {
  id: string;
  gdid: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  email: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  address_line1: string | null;
  address_city: string | null;
  address_state: string | null;
  address_pincode: string | null;
  blood_group: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | null;
  allergies: string[] | null;
  medical_alerts: string[] | null;
  insurance_provider: string | null;
  insurance_policy_number: string | null;
  primary_doctor_id: string | null;
  department: string | null;
  status: 'OP' | 'IP' | 'Discharged' | 'Emergency';
  last_visit_date: string | null;
  registration_date: string;
  created_at: string;
  updated_at: string;
}

export interface PatientFormData {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  email: string;
  address_city: string;
  address_state: string;
  address_pincode: string;
  blood_group: string;
  department: string;
  status: 'OP' | 'IP' | 'Discharged' | 'Emergency';
}
