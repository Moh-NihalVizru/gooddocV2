import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Patient } from "@/types/patient";
import { toast } from "@/hooks/use-toast";

export function usePatients() {
  return useQuery({
    queryKey: ["patients"],
    queryFn: async (): Promise<Patient[]> => {
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .order("registration_date", { ascending: false });

      if (error) {
        console.error("Error fetching patients:", error);
        throw error;
      }

      return data as Patient[];
    },
  });
}

export function usePatient(id: string | undefined) {
  return useQuery({
    queryKey: ["patient", id],
    queryFn: async (): Promise<Patient | null> => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from("patients")
        .select("*")
        .eq("gdid", id)
        .single();

      if (error) {
        console.error("Error fetching patient:", error);
        throw error;
      }

      return data as Patient;
    },
    enabled: !!id,
  });
}

export function useUpdatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (patient: Partial<Patient> & { id: string }) => {
      const { id, ...updates } = patient;
      
      const { data, error } = await supabase
        .from("patients")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating patient:", error);
        throw error;
      }

      return data as Patient;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      toast({
        title: "Patient updated",
        description: "Patient information has been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating patient",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

interface CreatePatientInput {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  email?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  address_line1?: string | null;
  address_city?: string | null;
  address_state?: string | null;
  address_pincode?: string | null;
  blood_group?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | null;
  allergies?: string[] | null;
  medical_alerts?: string[] | null;
  insurance_provider?: string | null;
  insurance_policy_number?: string | null;
  primary_doctor_id?: string | null;
  department?: string | null;
  status?: 'OP' | 'IP' | 'Discharged' | 'Emergency';
  last_visit_date?: string | null;
  registration_date?: string;
}

export function useCreatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (patient: CreatePatientInput) => {
      // Generate a temporary gdid - the trigger will create the real one
      const insertData = {
        ...patient,
        gdid: '', // Will be set by trigger
      };
      
      const { data, error } = await supabase
        .from("patients")
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error("Error creating patient:", error);
        throw error;
      }

      return data as Patient;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      toast({
        title: "Patient registered",
        description: "New patient has been registered successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error registering patient",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
