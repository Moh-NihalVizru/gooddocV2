import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Patient } from "@/types/patient";
import { toast } from "@/hooks/use-toast";
import { useCallback } from "react";

// Optimistic update helper
function applyOptimisticUpdate<T extends { id: string }>(
  oldData: T[] | undefined,
  newItem: T,
  operation: 'insert' | 'update' | 'delete'
): T[] {
  if (!oldData) return operation === 'delete' ? [] : [newItem];
  
  switch (operation) {
    case 'insert':
      return [newItem, ...oldData];
    case 'update':
      return oldData.map(item => item.id === newItem.id ? newItem : item);
    case 'delete':
      return oldData.filter(item => item.id !== newItem.id);
    default:
      return oldData;
  }
}

export function useRealtimePatients() {
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
    staleTime: 0, // Always refetch on mount since realtime handles freshness
    refetchOnWindowFocus: false, // Realtime handles updates
  });
}

export function useRealtimePatient(id: string | undefined) {
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
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
}

export function useOptimisticUpdatePatient() {
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
    onMutate: async (newPatient) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["patients"] });
      await queryClient.cancelQueries({ queryKey: ["patient", newPatient.id] });

      // Snapshot previous values
      const previousPatients = queryClient.getQueryData<Patient[]>(["patients"]);
      const previousPatient = queryClient.getQueryData<Patient>(["patient", newPatient.id]);

      // Optimistically update
      if (previousPatients) {
        queryClient.setQueryData<Patient[]>(
          ["patients"],
          (old) => applyOptimisticUpdate(old, newPatient as Patient, 'update')
        );
      }
      
      if (previousPatient) {
        queryClient.setQueryData<Patient>(
          ["patient", newPatient.id],
          { ...previousPatient, ...newPatient }
        );
      }

      return { previousPatients, previousPatient };
    },
    onError: (error, _newPatient, context) => {
      // Rollback on error
      if (context?.previousPatients) {
        queryClient.setQueryData(["patients"], context.previousPatients);
      }
      if (context?.previousPatient) {
        queryClient.setQueryData(["patient", context.previousPatient.id], context.previousPatient);
      }
      
      toast({
        title: "Error updating patient",
        description: error.message,
        variant: "destructive",
      });
    },
    onSuccess: (data) => {
      // Realtime will handle cache invalidation, but we update immediately for UX
      queryClient.setQueryData<Patient>(["patient", data.gdid], data);
      
      toast({
        title: "Patient updated",
        description: "Changes saved successfully.",
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
}

export function useOptimisticCreatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (patient: CreatePatientInput) => {
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
    onMutate: async (newPatient) => {
      await queryClient.cancelQueries({ queryKey: ["patients"] });
      
      const previousPatients = queryClient.getQueryData<Patient[]>(["patients"]);

      // Create optimistic patient with temp id
      const optimisticPatient: Patient = {
        id: `temp-${Date.now()}`,
        gdid: 'Generating...',
        first_name: newPatient.first_name,
        last_name: newPatient.last_name,
        date_of_birth: newPatient.date_of_birth,
        gender: newPatient.gender,
        phone: newPatient.phone,
        email: newPatient.email || null,
        status: newPatient.status || 'OP',
        registration_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        address_city: newPatient.address_city || null,
        address_line1: newPatient.address_line1 || null,
        address_state: newPatient.address_state || null,
        address_pincode: newPatient.address_pincode || null,
        blood_group: newPatient.blood_group || null,
        allergies: newPatient.allergies || null,
        medical_alerts: newPatient.medical_alerts || null,
        insurance_provider: newPatient.insurance_provider || null,
        insurance_policy_number: newPatient.insurance_policy_number || null,
        emergency_contact_name: newPatient.emergency_contact_name || null,
        emergency_contact_phone: newPatient.emergency_contact_phone || null,
        primary_doctor_id: newPatient.primary_doctor_id || null,
        department: newPatient.department || null,
        last_visit_date: null,
      };

      queryClient.setQueryData<Patient[]>(
        ["patients"],
        (old) => [optimisticPatient, ...(old || [])]
      );

      return { previousPatients };
    },
    onError: (error, _newPatient, context) => {
      if (context?.previousPatients) {
        queryClient.setQueryData(["patients"], context.previousPatients);
      }
      
      toast({
        title: "Error registering patient",
        description: error.message,
        variant: "destructive",
      });
    },
    onSuccess: () => {
      // Realtime will update with the real data including generated GDID
      toast({
        title: "Patient registered",
        description: "New patient has been registered successfully.",
      });
    },
  });
}
